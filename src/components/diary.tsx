import { useEffect, useState, type FormEvent } from 'react'
import { Check, ChevronRight, ClipboardList, Clock3, Dumbbell, Minus, Pencil, Plus, TimerReset } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Disclosure, Empty, Field, PageHeader } from './common'
import { ExerciseDetail } from './training-view'
import { allDays, dose, exercises, slotsForLog, type ExerciseId, type Day, type Slot } from '@/lib/training'
import { dayById, formatDay, localDay, newId, newest, numberInput, ramping, setSchema, valueText, type Data, type SetRecord } from '@/lib/data'

type Values = Pick<SetRecord, 'reps' | 'weight' | 'seconds'>
type Update = (fn: (data: Data) => Data, success?: string) => boolean

function StepInput({ label, value, change, step, minimum = 0, decimal = false }: {
  label: string; value: string; change(v: string): void; step: number; minimum?: number; decimal?: boolean
}) {
  function adjust(direction: number) {
    const current = numberInput(value)
    const next = Math.max(minimum, (current !== undefined && Number.isFinite(current) ? current : minimum) + direction * step)
    change(String(Math.round(next * 100) / 100))
  }
  return <div className="step-input">
    <label>
      <span>{label}</span>
      <Input inputMode={decimal ? 'decimal' : 'numeric'} enterKeyHint="done" value={value} placeholder="—" onChange={e => change(e.target.value)} />
    </label>
    <div className="step-actions">
      <Button type="button" size="icon" variant="outline" aria-label={`Убавить: ${label}`} onClick={() => adjust(-1)}><Minus aria-hidden="true" /></Button>
      <Button type="button" size="icon" variant="outline" aria-label={`Прибавить: ${label}`} onClick={() => adjust(1)}><Plus aria-hidden="true" /></Button>
    </div>
  </div>
}

function SetForm({ ex, initial, defaults, action, onSave, sticky = false }: {
  ex: ExerciseId; initial?: SetRecord; defaults?: SetRecord; action: string;
  onSave(v: Values, date?: string): boolean; sticky?: boolean
}) {
  const exercise = exercises[ex]
  const previous = initial ?? defaults
  const [reps, setReps] = useState(String(previous?.reps ?? ''))
  const [weight, setWeight] = useState(String(previous?.weight ?? ''))
  const [seconds, setSeconds] = useState(String(previous?.seconds ?? ''))
  const [date, setDate] = useState(initial?.date ?? localDay())
  const [error, setError] = useState('')
  function save(event: FormEvent) {
    event.preventDefault()
    const values: Values = exercise.kind === 'time' ? { seconds: numberInput(seconds) }
      : { reps: numberInput(reps), ...(exercise.kind === 'weight' ? { weight: numberInput(weight) } : {}) }
    const r = values.reps
    const s = values.seconds
    const w = values.weight
    if (exercise.kind === 'time' ? s === undefined || !Number.isInteger(s) || s < 1 || s > 7200
      : r === undefined || !Number.isInteger(r) || r < 1 || r > 500 || (exercise.kind === 'weight' && (w === undefined || !Number.isFinite(w) || w < 0 || w > 1000))) {
      setError(exercise.kind === 'time' ? 'Введи время целым числом от 1 до 7 200 секунд.' : 'Введи 1–500 целых повторений и укажи вес, если упражнение с отягощением.')
      return
    }
    setError('')
    if (!onSave(values, initial ? date : undefined)) setError('Подход не сохранился. Введённые значения остались в форме.')
  }
  return <form onSubmit={save} className="set-form">
    {initial && <Field label="Дата подхода"><Input type="date" value={date} required max={localDay()} onChange={e => setDate(e.target.value)} /></Field>}
    <div className="set-fields">
      {exercise.kind === 'weight' && <StepInput label={`Вес · ${exercise.unit}`} value={weight} change={setWeight} step={exercise.unit === 'кг на гантель' ? 1 : 2.5} decimal />}
      {exercise.kind === 'time'
        ? <StepInput label={`Время, с${exercise.perSide ? ' на сторону' : ''}`} value={seconds} change={setSeconds} step={exercise.min >= 60 ? 60 : 5} minimum={1} />
        : <StepInput label={`Повторения${exercise.perSide ? ' на сторону' : ''}`} value={reps} change={setReps} step={1} minimum={1} />}
    </div>
    {error && <p className="error" role="alert">{error}</p>}
    <div className={sticky ? 'set-submit sticky-submit' : 'set-submit'}>
      <Button type="submit"><Check aria-hidden="true" /> {action}</Button>
    </div>
  </form>
}

function RestTimer({ end, clear, restart }: { end: number; clear(): void; restart(): void }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!end) return
    const sync = () => setNow(Date.now())
    sync()
    const timer = window.setInterval(sync, 350)
    document.addEventListener('visibilitychange', sync)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', sync) }
  }, [end])
  if (!end) return null
  const seconds = Math.max(0, Math.ceil((end - now) / 1000))
  return <div className="rest-row">
    <div className="timer-icon"><Clock3 aria-hidden="true" /></div>
    <div className="rest-text"><span>{seconds ? 'Отдых между подходами' : 'Отдых завершён'}</span>
      {seconds > 0 && <strong role="timer">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, '0')}</strong>}</div>
    <Button size="icon" type="button" variant="ghost" aria-label="Перезапустить таймер" onClick={restart}><TimerReset aria-hidden="true" /></Button>
    <Button size="icon" type="button" variant="ghost" aria-label="Закрыть таймер" onClick={clear}><Check aria-hidden="true" /></Button>
  </div>
}

function LoggedSet({ record, edit, showName, number }: { record: SetRecord; edit(r: SetRecord): void; showName?: boolean; number?: number }) {
  return <div className="record-row">
    <div><strong>{showName ? exercises[record.ex].name : `Подход ${number}`}</strong><span>{valueText(record)}{showName ? ` · ${formatDay(record.date)}` : ''}</span></div>
    <Button size="icon" variant="ghost" type="button" aria-label={`Редактировать подход — ${exercises[record.ex].name}`} onClick={() => edit(record)}><Pencil aria-hidden="true" /></Button>
  </div>
}

export function Diary({ data, update, start }: { data: Data; update: Update; start(day: Day): void }) {
  const [edit, setEdit] = useState<SetRecord | null>(null)
  const [history, setHistory] = useState(false)
  const [finish, setFinish] = useState(false)
  const draft = data.draft
  const currentDay = draft ? dayById(draft.day) : undefined
  const slots = currentDay ? slotsForLog(currentDay) : undefined
  const slot: Slot | undefined = slots ? [...slots.primary, ...slots.alternatives].find(s => s.exercise === draft?.exercise) ?? slots.primary[0] : undefined
  const ex = slot ? exercises[slot.exercise] : undefined
  const ramp = ramping(data)
  const activeSets = draft ? data.sets.filter(s => s.workoutId === draft.id) : []
  const setsHere = activeSets.filter(s => s.ex === slot?.exercise)
  const previous = newest(data.sets.filter(s => s.ex === slot?.exercise && s.workoutId !== draft?.id))[0]
  const workouts = newest(data.workouts)
  const open = (day: Day) => { setHistory(false); start(day) }

  function add(values: Values) {
    if (!draft || !slot || !ex) return false
    const next = setSchema.parse({ id: newId(), workoutId: draft.id, day: draft.day, ex: slot.exercise, date: draft.date, updatedAt: new Date().toISOString(), ...values })
    return update(data => {
      if (data.draft?.id !== draft.id) throw new Error('Открыта другая тренировка. Проверь дневник.')
      return { ...data, sets: [...data.sets, next], timerEnds: ex.rest ? Date.now() + ex.rest * 1000 : 0 }
    }, 'Подход сохранён')
  }

  function finishWorkout() {
    if (!draft) return
    const ok = update(data => {
      if (data.draft?.id !== draft.id) throw new Error('Эта тренировка уже закрыта.')
      const hasSets = data.sets.some(set => set.workoutId === draft.id)
      const workouts = hasSets
        ? [...data.workouts, { id: draft.id, day: draft.day, date: draft.date, updatedAt: new Date().toISOString() }]
        : data.workouts
      return { ...data, draft: null, timerEnds: 0, workouts }
    }, activeSets.length ? 'Тренировка завершена' : 'Тренировка закрыта')
    if (ok) { setFinish(false); setHistory(true) }
  }

  return <>
    <PageHeader title="Дневник" text={draft ? 'Записывай рабочие подходы по ходу тренировки.' : 'Здесь сохраняются выполненные подходы.'} />
    <div className="segmented" aria-label="Режим дневника">
      <button type="button" aria-pressed={!history} onClick={() => setHistory(false)}>Тренировка</button>
      <button type="button" aria-pressed={history} onClick={() => setHistory(true)}>История</button>
    </div>
    {!history && draft && currentDay && slots && slot && ex && <div className="diary-layout">
      <section className="panel diary-entry">
        <div className="between"><div><p className="eyebrow">{formatDay(draft.date)}</p><h2>{currentDay.title}</h2></div><span className="surface-icon"><Dumbbell aria-hidden="true" /></span></div>
        <Field label="Упражнение">
          <select id="diary-exercise" value={slot.exercise} onChange={e => {
            const exercise = e.target.value as ExerciseId
            update(current => ({ ...current, draft: current.draft?.id === draft.id ? { ...current.draft, exercise } : current.draft }))
          }}>
            <optgroup label="План">{slots.primary.map(s => <option key={s.exercise} value={s.exercise}>{exercises[s.exercise].name}</option>)}</optgroup>
            {slots.alternatives.length > 0 && <optgroup label="Возможные замены">{slots.alternatives.map(s => <option key={s.exercise} value={s.exercise}>{exercises[s.exercise].name}</option>)}</optgroup>}
          </select>
        </Field>
        <div className="set-target">
          <span>{ramp ? slot.startSets : slot.sets} × {dose(ex)}</span>
          <small>{ex.kind === 'time' ? 'Устойчивый темп' : `Запас ${ramp ? '3–4' : '2–3'} повт.`}</small>
        </div>
        {previous && <p className="past-result">Прошлый раз <strong>{valueText(previous)}</strong></p>}
        <RestTimer end={data.timerEnds} clear={() => update(d => ({ ...d, timerEnds: 0 }))}
          restart={() => update(d => ({ ...d, timerEnds: ex.rest ? Date.now() + ex.rest * 1000 : 0 }))} />
        <SetForm key={draft.id + slot.exercise} ex={slot.exercise} defaults={setsHere.at(-1) ?? previous} action="Сохранить подход" onSave={add} sticky />
        <Disclosure title="Техника и прогрессия"><ExerciseDetail slot={slot} ramp={ramp} past={data.profile?.pastLifts?.[slot.exercise]} /></Disclosure>
      </section>
      <div className="diary-side">
        <section className="panel">
          <h2>Подходы в упражнении</h2>
          {setsHere.length === 0 ? <p className="muted">Первый подход появится здесь после записи.</p> : setsHere.map((r, i) => <LoggedSet key={r.id} number={i + 1} record={r} edit={setEdit} />)}
        </section>
        <section className="panel remaining">
          <div className="between"><h2>Упражнения</h2><span className="subtle-pill">{activeSets.length} подх.</span></div>
          {slots.primary.map(s => {
            const count = activeSets.filter(r => r.ex === s.exercise).length
            const planned = ramp ? s.startSets : s.sets
            return <button type="button" className="remaining-row" key={s.exercise} onClick={() => {
              const saved = update(current => ({ ...current, draft: current.draft?.id === draft.id ? { ...current.draft, exercise: s.exercise } : current.draft }))
              if (saved) document.getElementById('diary-exercise')?.scrollIntoView({ block: 'center' })
            }} aria-pressed={s.exercise === slot.exercise}>
              <span>{exercises[s.exercise].name}</span><small>{count} / {planned}</small><ChevronRight aria-hidden="true" size={17} />
            </button>
          })}
          <Button variant="outline" className="finish-button" onClick={() => setFinish(true)}>{activeSets.length ? 'Завершить тренировку' : 'Закрыть тренировку'}</Button>
        </section>
      </div>
    </div>}
    {!history && !draft && <section className="panel">
      <Empty icon={<ClipboardList aria-hidden="true" />} title="Нет активной тренировки" text="Выбери занятие в плане, чтобы записать первый подход."
        action={<Button asChild><a href="#training">Выбрать тренировку <ChevronRight aria-hidden="true" /></a></Button>} />
      <Disclosure title="Быстрый выбор занятия">
        <div className="list-stack">{allDays.filter(day => day.id.startsWith(String(data.settings.plan)) || day.weekday === -1).map(day => <Button key={day.id} variant="outline" onClick={() => open(day)}>{day.title}</Button>)}</div>
      </Disclosure>
    </section>}
    {history && <section className="panel history-panel">
      <h2>Прошлые тренировки</h2>
      {workouts.length === 0 ? <Empty icon={<ClipboardList aria-hidden="true" />} title="История пока пуста" text="После завершения тренировки здесь появятся её подходы." /> : workouts.map(w => {
        const records = data.sets.filter(s => s.workoutId === w.id)
        return <Disclosure key={w.id} title={<span><strong>{dayById(w.day).title}</strong><small className="block muted">{formatDay(w.date)} · {records.length} подх.</small></span>}>
          {records.map(r => <LoggedSet key={r.id} record={r} edit={setEdit} showName />)}
        </Disclosure>
      })}
    </section>}
    <Dialog open={Boolean(edit)} onOpenChange={open => { if (!open) setEdit(null) }}>
      {edit && <DialogContent className="dialog-content">
        <DialogHeader><DialogTitle>Редактировать подход</DialogTitle><DialogDescription>{exercises[edit.ex].name}</DialogDescription></DialogHeader>
        <SetForm key={edit.id} ex={edit.ex} initial={edit} action="Сохранить изменения" onSave={(values, date) => {
          const result = setSchema.safeParse({ ...edit, ...values, date, updatedAt: new Date().toISOString() })
          if (!result.success) return false
          const ok = update(d => ({ ...d, sets: d.sets.map(s => s.id === edit.id ? result.data : s) }), 'Подход обновлён')
          if (ok) setEdit(null)
          return ok
        }} />
      </DialogContent>}
    </Dialog>
    <Dialog open={finish} onOpenChange={setFinish}>
      <DialogContent className="dialog-content">
        <DialogHeader><DialogTitle>{activeSets.length ? 'Завершить тренировку?' : 'Закрыть тренировку?'}</DialogTitle>
          <DialogDescription>{activeSets.length ? `Сохранено подходов: ${activeSets.length}. Их можно править в истории.` : 'Подходов ещё нет. Можно вернуться к плану.'}</DialogDescription></DialogHeader>
        <div className="button-group"><Button variant="outline" onClick={() => setFinish(false)}>Продолжить</Button><Button onClick={finishWorkout}>{activeSets.length ? 'Завершить' : 'Закрыть'}</Button></div>
      </DialogContent>
    </Dialog>
  </>
}
