import { z } from 'zod'
import { allDays, exerciseIds, exercises, plans, slotsForLog, type Day } from './training'

const dayIds = allDays.map(day => day.id)
const isoDay = z.iso.date()
const timestamp = z.iso.datetime()
const id = z.string().min(1).max(100)
export const profileSchema = z.object({
  name: z.string().trim().max(60),
  age: z.number().int().min(18).max(90),
  height: z.number().min(130).max(230),
  weight: z.number().min(35).max(250),
  sex: z.enum(['male', 'female']),
  activity: z.number().min(1.15).max(1.75),
  deficit: z.number().int().min(0).max(400),
  notes: z.string().max(3000),
  supplement: z.string().max(200),
  pastLifts: z.partialRecord(z.enum(exerciseIds), z.string().max(220)).optional(),
  fitbit: z.object({
    period: z.string().max(100),
    steps: z.number().int().min(0).max(100000),
    phoneSteps: z.number().int().min(0).max(100000),
    sleepMinutes: z.number().int().min(0).max(1000),
    shortNights: z.number().int().min(0).max(40),
    notes: z.string().max(1500),
  }).optional(),
})
export const setSchema = z.object({
  id, workoutId: id, ex: z.enum(exerciseIds), day: z.enum(dayIds), date: isoDay, updatedAt: timestamp,
  reps: z.number().int().min(1).max(500).optional(),
  weight: z.number().min(0).max(1000).optional(),
  seconds: z.number().int().min(1).max(7200).optional(),
}).refine(set => {
  const ex = exercises[set.ex]
  return !Object.values(slotsForLog(dayById(set.day))).flat().some(slot => slot.exercise === set.ex)
    ? false
    : ex.kind === 'time' ? set.seconds !== undefined && set.reps === undefined && set.weight === undefined
      : set.reps !== undefined && set.seconds === undefined && (ex.kind === 'weight' ? set.weight !== undefined : set.weight === undefined)
})
export const measureSchema = z.object({
  id, date: isoDay, updatedAt: timestamp,
  weight: z.number().min(35).max(250).optional(),
  waist: z.number().min(35).max(220).optional(),
}).refine(m => m.weight !== undefined || m.waist !== undefined)
const workoutSchema = z.object({ id, day: z.enum(dayIds), date: isoDay, updatedAt: timestamp })
const draftSchema = workoutSchema.extend({ exercise: z.enum(exerciseIds) })
const settingsSchema = z.object({
  plan: z.union([z.literal(3), z.literal(4)]),
  theme: z.enum(['system', 'light', 'dark']),
  shopping: z.array(z.string()).max(100),
})
const storageSchema = z.object({
  version: z.literal(1),
  profile: profileSchema.nullable(),
  settings: settingsSchema,
  sets: z.array(setSchema).max(50000),
  measures: z.array(measureSchema).max(15000),
  workouts: z.array(workoutSchema).max(15000),
  draft: draftSchema.nullable(),
  timerEnds: z.number().finite().nonnegative(),
})
export const setupSchema = z.object({ kind: z.literal('podhod-setup'), version: z.literal(1), profile: profileSchema })
const backupSchema = z.object({ kind: z.literal('podhod-backup'), data: storageSchema })
export type Profile = z.infer<typeof profileSchema>
export type SetRecord = z.infer<typeof setSchema>
export type Measure = z.infer<typeof measureSchema>
export type Data = z.infer<typeof storageSchema>
export type Settings = Data['settings']
export type Backup = z.infer<typeof backupSchema>
export type Setup = z.infer<typeof setupSchema>
export type Import = Backup | Setup

export const empty: Data = {
  version: 1, profile: null, settings: { plan: 3, theme: 'system', shopping: [] },
  sets: [], measures: [], workouts: [], draft: null, timerEnds: 0,
}
const KEY = 'podhod-fitness-v1'
export function readData() {
  try {
    const raw = localStorage.getItem(KEY)
    return { data: raw ? storageSchema.parse(JSON.parse(raw)) : empty, error: '' }
  } catch {
    return { data: empty, error: 'Не удалось прочитать локальные данные. Если есть резервная копия, её можно открыть в профиле.' }
  }
}
export function persist(update: (data: Data) => Data, recover = false) {
  const current = readData()
  if (current.error && !recover) throw new Error(current.error)
  const next = storageSchema.parse(update(current.data))
  localStorage.setItem(KEY, JSON.stringify(next))
  return next
}
export function listenStorage(handler: () => void) {
  const handle = (event: StorageEvent) => { if (event.key === KEY || event.key === null) handler() }
  addEventListener('storage', handle)
  return () => removeEventListener('storage', handle)
}
export function parseImport(text: string): Import {
  return z.union([backupSchema, setupSchema]).parse(JSON.parse(text))
}
function join<T extends { id: string; updatedAt: string }>(present: T[], incoming: T[]) {
  const records = new Map(present.map(r => [r.id, r]))
  for (const row of incoming) {
    const existing = records.get(row.id)
    if (!existing || row.updatedAt > existing.updatedAt) records.set(row.id, row)
  }
  return [...records.values()]
}
export function mergeImport(current: Data, file: Import) {
  if (file.kind === 'podhod-setup') return { ...current, profile: file.profile }
  const incoming = file.data
  return {
    ...current,
    profile: incoming.profile ?? current.profile,
    settings: incoming.settings,
    sets: join(current.sets, incoming.sets),
    measures: join(current.measures, incoming.measures),
    workouts: join(current.workouts, incoming.workouts),
    draft: current.draft ?? (incoming.draft && !current.workouts.some(w => w.id === incoming.draft?.id) ? incoming.draft : null),
    timerEnds: current.timerEnds > Date.now() ? current.timerEnds : incoming.timerEnds,
  }
}
export function downloadBackup(data: Data) {
  const file: Backup = { kind: 'podhod-backup', data }
  const url = URL.createObjectURL(new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `podhod-backup-${localDay()}.json`
  link.click()
  setTimeout(() => URL.revokeObjectURL(url), 15000)
}
export function localDay(date = new Date()) {
  return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map(value => String(value).padStart(2, '0')).join('-')
}
export function dateObject(day: string) { return new Date(day + 'T12:00:00') }
const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' })
export function formatDay(day: string) { return dateFormatter.format(dateObject(day)) }
export function newId() { return crypto.randomUUID() }
export function dateShift(date: Date, amount: number) {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + amount)
  return copy
}
export function monday(date = new Date()) { return localDay(dateShift(date, -((date.getDay() + 6) % 7))) }
export function newest<T extends { date: string; updatedAt: string }>(records: T[]) {
  return [...records].sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt))
}
export function nextDay(data: Data, now = new Date()) {
  const plan = plans[data.settings.plan]
  const last = newest(data.workouts.filter(w => plan.some(d => d.id === w.day)))[0]
  const day = plan[(last ? plan.findIndex(d => d.id === last.day) + 1 : 0) % plan.length]
  if (!last || last.date > localDay(now)) return { day, date: localDay(now) }
  const previousDay = dayById(last.day)
  const gap = (day.weekday - previousDay.weekday + 7) % 7 || 1
  const scheduled = localDay(dateShift(dateObject(last.date), gap))
  return { day, date: scheduled < localDay(now) ? localDay(now) : scheduled }
}
export function ramping(data: Data, today = new Date()) {
  const strengthDays = data.workouts.filter(w => w.day !== 'cardio' && w.day !== 'mobility').map(w => w.date).filter(day => day <= localDay(today)).sort()
  const last = strengthDays.at(-1)
  if (!last || last < localDay(dateShift(today, -13))) return true
  let runStart = last
  for (let i = strengthDays.length - 2; i >= 0; i--) {
    if (strengthDays[i] < localDay(dateShift(dateObject(runStart), -13))) break
    runStart = strengthDays[i]
  }
  return runStart > localDay(dateShift(today, -14))
}
export function dayById(id: string): Day { return allDays.find(d => d.id === id) ?? plans[3][0] }
export function valueText(record: SetRecord) {
  const exercise = exercises[record.ex]
  const side = exercise.perSide ? ' / сторона' : ''
  if (record.seconds !== undefined) return `${record.seconds >= 60 ? Math.floor(record.seconds / 60) + ' мин ' + (record.seconds % 60 ? record.seconds % 60 + ' с' : '') : record.seconds + ' с'}${side}`.trim()
  if (record.weight !== undefined) return `${record.weight.toLocaleString('ru-RU')} ${exercise.unit} × ${record.reps}${side}`
  return `${record.reps} повт.${side}`
}
export function numberInput(raw: string) { return raw.trim() === '' ? undefined : Number(raw.trim().replace(',', '.')) }
