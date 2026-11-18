import { useId, useState, type FormEvent } from 'react'
import { Activity, Dumbbell, Pencil, Plus, Ruler, TrendingUp, Weight } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Disclosure, Empty, Field, PageHeader } from './common'
import { dateObject, dateShift, dayById, formatDay, localDay, measureSchema, newId, newest, numberInput, valueText, type Data, type Measure, type SetRecord } from '@/lib/data'
import { exercises, type ExerciseId } from '@/lib/training'

type Point = { date: string; value: number; detail?: string }
type Metric = 'weight' | 'waist'
const shortDate = new Intl.DateTimeFormat('ru-RU', { month: 'short', day: 'numeric' })
const fmt = (v: number) => v.toLocaleString('ru-RU', { maximumFractionDigits: 1 })

function Chart({ points, unit, label }: { points: Point[]; unit: string; label: string }) {
  const fillId = useId()
  const all = [...points].sort((a, b) => a.date.localeCompare(b.date))
  const data = all.slice(-60)
  if (data.length < 2) return <div className="chart-placeholder">
    <Activity size={32} aria-hidden="true" />
    <p>{data.length ? 'Для графика нужна ещё одна дата.' : 'Пока нет точек для графика.'}</p>
  </div>
  const values = data.map(p => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const spread = max - min
  const margin = Math.max(spread * .15, .5)
  const low = min - margin, high = max + margin
  const stamps = data.map(p => dateObject(p.date).valueOf())
  const x0 = stamps[0], x1 = stamps.at(-1) ?? x0
  const xy = data.map((p, i) => [
    21 + (x0 === x1 ? i / (data.length - 1) : (stamps[i] - x0) / (x1 - x0)) * 478,
    19 + (high - p.value) / (high - low) * 116,
  ])
  const line = xy.map(([x, y]) => `${x},${y}`).join(' ')
  return <>
    <div className="chart-figure">
      <div className="chart-scale" aria-hidden="true"><span>{fmt(high)}</span><span>{fmt((high + low) / 2)}</span><span>{fmt(low)}</span></div>
      <svg viewBox="0 0 520 154" role="img" aria-label={`${label}, ${data.length} точек, от ${fmt(data[0].value)} до ${fmt(data.at(-1)!.value)} ${unit}`}>
        <defs><linearGradient id={fillId} x1="0" x2="0" y1="0" y2="1" gradientUnits="objectBoundingBox"><stop offset="0%" stopColor="currentColor" stopOpacity=".23" /><stop offset="100%" stopColor="currentColor" stopOpacity=".02" /></linearGradient></defs>
        {[19, 77, 135].map(y => <line key={y} x1={12} y1={y} x2={507} y2={y} className="chart-grid-line" />)}
        <polygon points={`${xy[0][0]},135 ${line} ${xy.at(-1)![0]},135`} fill={`url(#${fillId})`} />
        <polyline points={line} stroke="currentColor" fill="none" strokeWidth="3.2" strokeLinejoin="round" />
        {xy.map(([x, y], i) => <circle key={data[i].date + i} cx={x} cy={y} r={data.length > 25 ? 2.5 : 4} fill="currentColor"><title>{formatDay(data[i].date)} · {data[i].detail ?? `${fmt(data[i].value)} ${unit}`}</title></circle>)}
      </svg>
      <div className="chart-dates"><span>{shortDate.format(dateObject(data[0].date))}</span><span>{shortDate.format(dateObject(data.at(-1)!.date))}</span></div>
    </div>
    {all.length > data.length && <small className="muted">На графике последние 60 дат.</small>}
  </>
}

function MeasureForm({ initial, save }: { initial?: Measure; save(value: Measure): boolean }) {
  const [date, setDate] = useState(initial?.date ?? localDay())
  const [weight, setWeight] = useState(initial?.weight?.toString() ?? '')
  const [waist, setWaist] = useState(initial?.waist?.toString() ?? '')
  const [error, setError] = useState('')
  function submit(e: FormEvent) {
    e.preventDefault()
    const result = measureSchema.safeParse({ id: initial?.id ?? newId(), updatedAt: new Date().toISOString(), date, weight: numberInput(weight), waist: numberInput(waist) })
    if (!result.success) { setError('Укажи дату и хотя бы один показатель. Вес 35–250 кг, талия 35–220 см.'); return }
    setError('')
    if (!save(result.data)) setError('Замер не сохранился.')
  }
  return <form className="form-stack" onSubmit={submit}>
    <Field label="Дата"><Input type="date" value={date} required max={localDay()} onChange={e => setDate(e.target.value)} /></Field>
    <div className="field-grid">
      <Field label="Вес, кг"><Input inputMode="decimal" placeholder="—" value={weight} onChange={e => setWeight(e.target.value)} /></Field>
      <Field label="Талия, см"><Input inputMode="decimal" placeholder="—" value={waist} onChange={e => setWaist(e.target.value)} /></Field>
    </div>
    {error && <p role="alert" className="error">{error}</p>}
    <Button type="submit">Сохранить замер</Button>
  </form>
}

function strengthPoints(sets: SetRecord[], id: ExerciseId) {
  const ex = exercises[id]
  const best = new Map<string, SetRecord>()
  for (const set of sets) {
    if (set.ex !== id) continue
    const current = best.get(set.date)
    const direction = ex.unit === 'кг помощи' ? -1 : 1
    const currentWeight = (current?.weight ?? 0) * direction
    const setWeight = (set.weight ?? 0) * direction
    if (!current || setWeight > currentWeight || (setWeight === currentWeight && (set.reps ?? set.seconds ?? 0) > (current.reps ?? current.seconds ?? 0))) {
      best.set(set.date, set)
    }
  }
  return [...best.values()].map(s => ({ date: s.date, value: s.weight ?? s.reps ?? s.seconds ?? 0, detail: valueText(s) }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function Progress({ data, update, openNew = false }: { data: Data; update(fn: (data: Data) => Data, success?: string): boolean; openNew?: boolean }) {
  const [metric, setMetric] = useState<Metric>('weight')
  const [editing, setEditing] = useState<Measure | 'new' | null>(openNew ? 'new' : null)
  const [selected, setSelected] = useState<ExerciseId>('bench')
  const records = newest(data.measures)
  const exerciseIds = Array.from(new Set(newest(data.sets).map(s => s.ex)))
  const exercise = exerciseIds.includes(selected) ? selected : exerciseIds[0]
  const latest = records.find(r => r[metric] !== undefined)
  const points = Array.from(new Map(records.filter(r => r[metric] !== undefined).reverse().map(r => [r.date, { date: r.date, value: r[metric]! }])).values())
  const strength = exercise ? strengthPoints(data.sets, exercise) : []
  const lastWeek = localDay(dateShift(new Date(), -6))
  const beforeWeek = localDay(dateShift(new Date(), -13))
  const recentValues = points.filter(p => p.date >= lastWeek && p.date <= localDay()).map(p => p.value)
  const beforeValues = points.filter(p => p.date >= beforeWeek && p.date < lastWeek).map(p => p.value)
  const average = (v: number[]) => v.reduce((a, b) => a + b, 0) / v.length
  const delta = recentValues.length >= 2 && beforeValues.length >= 2 ? average(recentValues) - average(beforeValues) : undefined
  const unit = metric === 'weight' ? 'кг' : 'см'

  function closeMeasure() {
    setEditing(null)
    if (location.hash === '#progress/new') location.replace('#progress')
  }

  return <>
    <PageHeader title="Прогресс" text="Замеры и рабочие результаты за разные даты."
      action={<Button onClick={() => setEditing('new')}><Plus aria-hidden="true" /> Добавить замер</Button>} />
    <div className="progress-grid">
      <section className="panel chart-panel">
        <div className="between"><h2>Вес и талия</h2><Ruler size={20} className="muted" aria-hidden="true" /></div>
        <div className="segmented" aria-label="Показатель тела">
          <button type="button" aria-pressed={metric === 'weight'} onClick={() => setMetric('weight')}>Вес</button>
          <button type="button" aria-pressed={metric === 'waist'} onClick={() => setMetric('waist')}>Талия</button>
        </div>
        <div className="chart-value"><strong>{latest ? fmt(latest[metric]!) : '—'}</strong><span>{unit}</span></div>
        {metric === 'weight' && recentValues.length >= 2 && <p className="muted">Среднее за 7 дней {fmt(average(recentValues))} кг{delta !== undefined && ` · ${delta > 0 ? '+' : ''}${fmt(delta)} кг к предыдущим 7 дням`}</p>}
        <Chart points={points} unit={unit} label={metric === 'weight' ? 'Изменение веса' : 'Изменение талии'} />
      </section>
      <section className="panel chart-panel">
        <div className="between"><h2>Силовые</h2><Dumbbell size={20} className="muted" aria-hidden="true" /></div>
        {!exercise ? <Empty icon={<TrendingUp aria-hidden="true" />} title="Запиши первый подход" text="Затем здесь появятся рабочий вес, повторения или время." action={<Button asChild variant="outline"><a href="#diary">В дневник</a></Button>} /> : <>
          <Field label="Упражнение">
            <select value={exercise} onChange={e => setSelected(e.target.value as ExerciseId)}>{exerciseIds.map(id => <option key={id} value={id}>{exercises[id].name}</option>)}</select>
          </Field>
          <div className="chart-value"><strong>{fmt(strength[0].value)}</strong><span>{exercises[exercise].unit ?? (exercises[exercise].kind === 'time' ? 'с' : 'повт.')}</span></div>
          <p className="muted">{strength[0].detail} · {formatDay(strength[0].date)}</p>
          <Chart points={strength} unit={exercises[exercise].unit ?? (exercises[exercise].kind === 'time' ? 'с' : 'повт.')} label="Подходы по дням" />
          <Disclosure title="Лучший подход за каждый день">
            <p>Выбирается максимальный вес (или минимальная помощь), при равном весе — больше повторений. Для движений без веса сравниваются повторения или секунды.</p>
            {strength.map(s => <div className="between measure-row" key={s.date}><span>{formatDay(s.date)}</span><strong>{s.detail}</strong></div>)}
          </Disclosure>
        </>}
      </section>
    </div>
    <div className="progress-grid progress-lists">
      <section className="panel">
        <h2>История замеров</h2>
        {records.length === 0 ? <Empty icon={<Weight aria-hidden="true" />} title="Пока без замеров" text="Взвешивайся утром в схожих условиях. Талию измеряй раз в неделю в одной точке после обычного выдоха." /> : records.map(m => <div className="record-row" key={m.id}>
          <div><strong>{formatDay(m.date)}</strong><span>{[m.weight !== undefined && `${fmt(m.weight)} кг`, m.waist !== undefined && `${fmt(m.waist)} см`].filter(Boolean).join(' · ')}</span></div>
          <Button type="button" size="icon" variant="ghost" aria-label={`Редактировать замер за ${formatDay(m.date)}`} onClick={() => setEditing(m)}><Pencil aria-hidden="true" /></Button>
        </div>)}
      </section>
      <section className="panel">
        <h2>История тренировок</h2>
        {data.workouts.length === 0 ? <p className="muted">Завершённые занятия появятся здесь.</p> : newest(data.workouts).map(w => <div className="record-row" key={w.id}>
          <div><strong>{dayById(w.day).title}</strong><span>{formatDay(w.date)} · {data.sets.filter(s => s.workoutId === w.id).length} подх.</span></div>
        </div>)}
      </section>
    </div>
    <Dialog open={editing !== null} onOpenChange={open => { if (!open) closeMeasure() }}>
      {editing && <DialogContent className="dialog-content">
        <DialogHeader><DialogTitle>{editing === 'new' ? 'Новый замер' : 'Редактировать замер'}</DialogTitle>
          <DialogDescription>Можно записать вес, талию или оба значения.</DialogDescription></DialogHeader>
        <MeasureForm initial={editing === 'new' ? undefined : editing} save={m => {
          const ok = update(d => {
            const sameDate = d.measures.find(r => r.date === m.date && r.id !== m.id)
            const combined = { ...sameDate, ...m, weight: m.weight ?? sameDate?.weight, waist: m.waist ?? sameDate?.waist }
            return { ...d, measures: [...d.measures.filter(x => x.id !== m.id && x.date !== m.date), combined] }
          }, 'Замер сохранён')
          if (ok) closeMeasure()
          return ok
        }} />
      </DialogContent>}
    </Dialog>
  </>
}
