import { useState } from 'react'
import { Activity, ArrowRight, Clock3, Dumbbell } from 'lucide-react'
import { Disclosure, PageHeader } from './common'
import { Button } from './ui/button'
import { dose, exerciseProgression, exercises, optionalDays, plans, weekdays, type Day, type Slot } from '@/lib/training'
import { ramping, type Data } from '@/lib/data'
import { safety, sources } from '@/lib/knowledge'

export function ExerciseDetail({ slot, ramp, past }: { slot: Slot; ramp: boolean; past?: string }) {
  const ex = exercises[slot.exercise]
  const reserve = ex.kind === 'time'
    ? (slot.exercise === 'walk' ? 'Можешь говорить предложениями.' : slot.exercise === 'mobility' ? 'Остановись на лёгком натяжении.' : 'Оставь 5–10 секунд устойчивого удержания.')
    : `Оставь ${ramp ? '3–4' : '2–3'} повторения в запасе.`
  const load = ex.kind === 'weight'
    ? 'Начни с лёгкого веса. Сделай нижнюю границу повторений в ровной технике. Если запас сильно больше целевого, добавь малый шаг после отдыха. Если меньше — снизь вес.'
    : ex.kind === 'reps'
      ? 'Начни с облегчённой версии и увеличивай амплитуду постепенно.'
      : 'Начни с нижней границы времени или упрости вариант, если контроль теряется.'
  return <div className="exercise-detail">
    <p>{ex.muscles}.</p>
    {past && <p className="past-result">До паузы: <strong>{past}</strong>. Для первой тренировки подбери нагрузку заново.</p>}
    <dl>
      <div><dt>Рабочие подходы</dt><dd>{ramp ? slot.startSets : slot.sets} × {dose(ex)}{ex.rest > 0 ? ` · отдых ${ex.rest % 60 ? ex.rest + ' с' : ex.rest / 60 + ' мин'}` : ''}</dd></div>
      <div><dt>Разминка</dt><dd>{ex.warm}</dd></div>
      <div><dt>Нагрузка</dt><dd>{load} {reserve} {ex.unit ? `Запись — ${ex.unit}.` : ''}</dd></div>
      <div><dt>Техника</dt><dd>{ex.tech}</dd></div>
      <div><dt>Прогрессия</dt><dd>{exerciseProgression(ex)}</dd></div>
      <div><dt>Усталость и плато</dt><dd>Если техника ухудшается, снизь нагрузку, упрости вариант или убери один подход. Сравни 2–3 одинаковых занятия. При устойчивом спаде на неделю сократи объём на треть и проверь сон, питание и отдых.</dd></div>
      <div><dt>Замена</dt><dd>{ex.swap}</dd></div>
    </dl>
  </div>
}

export function Training({ data, setPlan, start }: { data: Data; setPlan(value: 3 | 4): void; start(day: Day): void }) {
  const [dayId, setDayId] = useState('')
  const plan = plans[data.settings.plan]
  const selected = [...plan, ...optionalDays].find(d => d.id === dayId) ?? plan[0]
  const ramp = ramping(data)
  return <>
    <PageHeader title="Тренировки" text="Два варианта недели с акцентом на плечи и руки." />
    <div className="between controls-row">
      <div className="segmented" aria-label="Посещений зала в неделю">
        {([3, 4] as const).map(n => <button type="button" key={n} aria-pressed={data.settings.plan === n} onClick={() => { setPlan(n); setDayId('') }}>{n} дня</button>)}
      </div>
      <span className="subtle-pill"><Activity size={16} aria-hidden="true" /> {ramp ? 'Возврат к нагрузке' : 'Рабочий объём'}</span>
    </div>
    <div className="training-layout">
      <div className="training-days">
        {plan.map((d, i) => <button key={d.id} type="button" className="day-chip" aria-pressed={selected.id === d.id} onClick={() => setDayId(d.id)}>
          <span className="day-letter">{weekdays[d.weekday]}</span><span><strong>{d.title}</strong><small>День {i + 1} · {d.duration}</small></span>
        </button>)}
      </div>
      <section className="panel workout-plan" id="day-plan" aria-label={selected.title}>
        <span className="subtle-pill"><Clock3 size={16} aria-hidden="true" /> {selected.duration}</span>
        <h2>{selected.title}</h2>
        <p>{selected.goal}</p>
        <Disclosure title="Разминка тренировки">
          {selected.id === 'cardio' ? <p>Начни с 3–5 минут в лёгком темпе.</p> : <p>5–8 минут спокойной ходьбы или велосипеда, затем 5–8 повторений движений дня без веса. Подводящие подходы указаны в карточках. Они не входят в рабочие.</p>}
        </Disclosure>
        {selected.slots.map((slot, i) => {
          const ex = exercises[slot.exercise]
          return <Disclosure key={selected.id + slot.exercise} title={<span className="exercise-heading"><span className="step-index">{String(i + 1).padStart(2, '0')}</span><span><strong>{ex.name}</strong><small>{ramp ? slot.startSets : slot.sets} × {dose(ex)}</small></span></span>}>
            <ExerciseDetail slot={slot} ramp={ramp} past={data.profile?.pastLifts?.[slot.exercise]} />
          </Disclosure>
        })}
        <Button onClick={() => start(selected)} className="start-plan"><Dumbbell aria-hidden="true" /> В дневник <ArrowRight aria-hidden="true" /></Button>
      </section>
      <section className="training-optional">
        <div className="section-bar mini"><h2>Дополнительно</h2></div>
        {optionalDays.map(d => <button key={d.id} type="button" className="day-extra" aria-pressed={selected.id === d.id} onClick={() => {
          setDayId(d.id)
          requestAnimationFrame(() => document.getElementById('day-plan')?.scrollIntoView({ block: 'start' }))
        }}>
          <span>{d.title}</span><small>{d.duration}</small>
        </button>)}
      </section>
    </div>
    <section className="panel guides">
      <h2>Как тренироваться</h2>
      <Disclosure title="Возврат после паузы и пропущенные дни">
        <p>Первые две недели — до двух рабочих подходов на упражнение, 3–4 повторения в запасе (RIR). Начни с трёх дней. Затем добавь прописанный объём при устойчивом самочувствии и нормальном восстановлении. Четыре дня можно выбрать после адаптации. При перерыве от двух недель приложение снова покажет лёгкий объём.</p>
        <p>Пропустил день — продолжи с ближайшей незавершённой тренировки по порядку. Три дня обычно разделяй хотя бы сутками. В четырёхдневной схеме дни подряд чередуют верх и низ. Оставь примерно 48 часов до следующей нагрузки на ту же группу. Не объединяй два дня в один.</p>
      </Disclosure>
      <Disclosure title="Сила, плечи и руки">
        <p>Начинай с главного движения, когда ещё свеж. После адаптации держи в главном жиме 6–8 повторений, в остальных базовых движениях обычно 8–12. Отдыхай до 2–3 минут, если дыхание и техника ещё не восстановились.</p>
        <p>Махи и задние дельты дают 8 прямых подходов в трёхдневном плане и 9 в четырёхдневном. Жимы дополнительно нагружают дельты и трицепс, тяги — бицепс. Прямых рабочих подходов на бицепс и трицепс — примерно по 5–6 за неделю после адаптации. Держи 2–3 повторения в запасе. При хорошем восстановлении и устойчивом плато добавь один подход к одному приоритетному упражнению и оцени 2–3 недели.</p>
        <p>Пример прогрессии: 3 × 6 → 3 × 7 → 3 × 8. Когда 3 × 8 получается два занятия с тем же запасом, прибавь минимальный шаг (например 2–2,5 кг суммарно для штанги), затем вернись к 6 повторениям. Если следующий шаг гантелей слишком большой, задержись на текущем весе. В дефиците сохранение рабочих весов уже хороший результат.</p>
      </Disclosure>
      <Disclosure title="Поясница, таз и подвижность">
        {safety.map(s => <p key={s}>{s}</p>)}
        <a href={sources[2].url} target="_blank" rel="noreferrer">Обзор по наклону таза</a>
      </Disclosure>
      <Disclosure title="Ходьба, бег и восстановление">
        <p>Первую неделю сохрани привычное движение. Добавь 10 минут ходьбы или велосипеда после 1–2 силовых при хорошем самочувствии либо прогуляйся отдельно. Степпер — тоже вариант в разговорном темпе. Смотри среднюю активность по одному источнику. Если нагрузки переносятся легко, прибавь около 500–1 000 шагов к привычному дневному уровню или 5 минут к одному кардио.</p>
        <p>Лёгкий бег можно начать с чередования бега и ходьбы после 1–2 недель комфортной ходьбы. После плохо проведённой ночи, при тяжёлой разминке или стойкой усталости оставь дополнительный повтор в запасе либо сократи один подход. Отдельные баллы готовности часов используй только как контекст.</p>
      </Disclosure>
    </section>
  </>
}
