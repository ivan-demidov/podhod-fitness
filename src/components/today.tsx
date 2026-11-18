import { ArrowRight, ChartNoAxesCombined, Check, ChevronRight, Clock3, Dumbbell, Footprints, Goal, Plus, Utensils } from 'lucide-react'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { PageHeader } from './common'
import { dayById, formatDay, localDay, monday, nextDay, newest, type Data } from '@/lib/data'
import { targets } from '@/lib/nutrition'
import { plans, weekdays, type Day } from '@/lib/training'
import { cn } from '@/lib/utils'

export function Today({ data, start, firstRun }: { data: Data; start(day: Day): void; firstRun(): void }) {
  const now = new Date()
  const next = nextDay(data, now)
  const active = data.draft ? dayById(data.draft.day) : next.day
  const plan = plans[data.settings.plan]
  const completed = data.workouts.filter(w => w.date >= monday(now) && w.date <= localDay(now) && plan.some(d => d.id === w.day))
  const latest = newest(data.measures.filter(m => m.waist !== undefined))[0]
  const daily = data.profile ? targets(data.profile) : undefined
  const dateLine = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' }).format(now)
  const stepBase = data.profile?.fitbit ? Math.round(data.profile.fitbit.steps / 500) * 500 : undefined
  return <>
    <PageHeader title={data.profile?.name ? `Привет, ${data.profile.name}` : 'Сегодня'}
      eyebrow={dateLine}
      action={<Button asChild variant="outline" className="quick-add"><a href="#progress"><Plus aria-hidden="true" /> <span>Замер</span></a></Button>}
    />
    {!data.profile && <div className="setup-banner">
      <div><strong>Твой план начинается здесь</strong><p>Загрузи личный файл из чата или заполни профиль вручную.</p></div>
      <Button variant="outline" onClick={firstRun}>Загрузить профиль<ChevronRight aria-hidden="true" /></Button>
    </div>}
    <div className="dashboard-grid">
      <section className="workout-hero" aria-label="Ближайшая тренировка" style={{ "--hero-image": `url("${import.meta.env.BASE_URL}gym.webp")` } as React.CSSProperties}>
        <div className="hero-copy">
          <p className="hero-kicker"><span className="live-dot" />{data.draft ? 'ТРЕНИРОВКА ИДЁТ' : 'СЛЕДУЮЩАЯ ТРЕНИРОВКА'}</p>
          <h2>{active.title}</h2>
          <div className="hero-meta"><span><Clock3 aria-hidden="true" /> {active.duration}</span><span><Dumbbell aria-hidden="true" /> {active.slots.length} упр.</span></div>
          {!data.draft && <p className="hero-when">{next.date === localDay(now) ? 'Можно начать сегодня' : formatDay(next.date)}</p>}
          <Button className="hero-button" onClick={() => start(active)}>{data.draft ? 'Продолжить тренировку' : 'Начать тренировку'} <ArrowRight aria-hidden="true" /></Button>
        </div>
      </section>
      <Card className="panel week-panel gap-0 shadow-none py-0">
        <div className="between"><h2>Ритм недели</h2><Dumbbell size={20} aria-hidden="true" className="muted" /></div>
        <div className="weekly-score"><strong>{completed.length}<small> / {data.settings.plan}</small></strong><span>зал на этой неделе</span></div>
        <div className="week-track" aria-label="График силовых на неделю">
          {[1, 2, 3, 4, 5, 6, 0].map(i => {
            const filled = completed.some(w => new Date(w.date + 'T12:00:00').getDay() === i)
            const planned = plan.some(d => d.weekday === i)
            return <div key={i} className={cn('week-day', filled && 'is-done', planned && 'is-planned', i === now.getDay() && 'is-today')} aria-label={`${weekdays[i]} — ${filled ? 'выполнено' : planned ? 'зал по плану' : 'восстановление'}`}>
              <span>{weekdays[i]}</span><div>{filled ? <Check size={16} aria-hidden="true" /> : <i />}</div>
            </div>
          })}
        </div>
        <a href="#training" className="text-link">Открыть план <ChevronRight size={16} aria-hidden="true" /></a>
      </Card>
    </div>
    <section className="today-focus">
      <div className="section-bar"><h2>Ориентиры</h2></div>
      <div className="stat-grid">
        <a className="panel stat-card" href="#progress"><Goal aria-hidden="true" /><span>Талия</span><strong>{latest?.waist ? latest.waist.toLocaleString('ru-RU') : '—'}{latest?.waist && <small> см</small>}</strong><small>{latest ? formatDay(latest.date) : 'Добавить первый замер'}</small></a>
        <a className="panel stat-card" href="#nutrition"><Utensils aria-hidden="true" /><span>Питание</span><strong>{daily ? daily.kcal.toLocaleString('ru-RU') : '—'}{daily && <small> ккал</small>}</strong><small>{daily ? `${daily.protein} г белка в день` : 'Рассчитать по профилю'}</small></a>
        <a className="panel stat-card" href="#training"><Footprints aria-hidden="true" /><span>Ходьба</span><strong>{stepBase ? stepBase.toLocaleString('ru-RU') : '10–20'}<small>{stepBase ? ' шагов' : ' мин'}</small></strong><small>{stepBase ? 'Старт по Fitbit Air' : 'Спокойный разговорный темп'}</small></a>
      </div>
    </section>
    <section className="panel focus-panel">
      <div className="focus-icon"><ChartNoAxesCombined aria-hidden="true" /></div>
      <div><h2>Фокус на 6–8 недель</h2><p>Уменьшать талию постепенно, вернуть рабочие веса и регулярно тренировать плечи, руки и корпус.</p></div>
      <a className="icon-link" href="#progress" aria-label="Мой прогресс"><ChevronRight aria-hidden="true" /></a>
    </section>
  </>
}
