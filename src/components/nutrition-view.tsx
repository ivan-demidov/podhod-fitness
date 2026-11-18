import { useState } from 'react'
import { Calculator, ChevronRight, ShoppingBasket, Utensils, Wheat } from 'lucide-react'
import { Button } from './ui/button'
import { Disclosure, PageHeader } from './common'
import { foods, mealLabels, menu, nutrition, shopping, targets } from '@/lib/nutrition'
import { type Data } from '@/lib/data'

const num = (x: number) => Math.round(x).toLocaleString('ru-RU')
const portions = [...new Set(shopping.map(f => f.category))]
const weekKcal = menu.reduce((acc, d) => acc + nutrition(d.meals.flatMap(m => m.items)).kcal, 0) / 7

export function Nutrition({ data, toggle }: { data: Data; toggle(id: string): void }) {
  const [selected, setSelected] = useState((new Date().getDay() + 6) % 7)
  const [view, setView] = useState<'menu' | 'list'>('menu')
  const day = menu[selected]
  const total = nutrition(day.meals.flatMap(m => m.items))
  const profile = data.profile
  const target = profile ? targets(profile) : undefined

  return <>
    <PageHeader title="Питание" text="Ориентиры на день и меню на семь дней." />
    <section className="panel nutrition-target">
      <div className="between"><h2>Твой дневной ориентир</h2><Calculator className="muted" size={21} aria-hidden="true" /></div>
      {target && profile ? <>
        <div className="macro-row">
          {[[target.kcal, 'ккал'], [target.protein, 'г белка'], [target.fat, 'г жиров'], [target.carbs, 'г углеводов']].map(([value, label]) => <div key={label}><strong>{num(Number(value))}</strong><span>{label}</span></div>)}
        </div>
        <Disclosure title="Как получились эти значения">
          <p>Начальная оценка для взрослого. Входные данные из профиля: {profile.age} лет, {profile.height} см, {profile.weight.toLocaleString('ru-RU')} кг, {profile.sex === 'male' ? 'мужской' : 'женский'} пол.</p>
          <p>Формула Миффлина — Сан Жеора: 10 × вес + 6,25 × рост − 5 × возраст {profile.sex === 'male' ? '+ 5' : '− 161'} = около {num(target.rmr)} ккал в покое. Коэффициент {profile.activity.toLocaleString('ru-RU')} даёт около {num(target.expenditure)} ккал на поддержание. Вычитаем {profile.deficit} ккал и округляем до 50 ккал.</p>
          <p>Белок — около 1,9 г/кг, жиры — около 0,85 г/кг. Оставшаяся энергия — углеводы: (ккал − 4 × белок − 9 × жиры) / 4.</p>
          <p>Коэффициент — рабочая оценка по шагам и планируемым занятиям. Расход из Fitbit служит контекстом. Среднее меню — {num(weekKcal)} ккал в день. Если профиль и меню расходятся, меняй порции гарнира и масла, сохранив основные источники белка.</p>
        </Disclosure>
      </> : <div className="between"><p>Заполни профиль, чтобы получить расчёт.</p><Button asChild variant="outline"><a href="#profile">В профиль <ChevronRight aria-hidden="true" /></a></Button></div>}
      <Disclosure title="Как корректировать по весу и талии">
        <p>Взвешивайся утром 3–4 раза в неделю, смотри среднее за 7 дней. Талию измеряй раз в неделю в одинаковых условиях после обычного выдоха. Для первых 6–8 недель ориентир — плавный спад примерно 0,2–0,4 кг в неделю или постепенное уменьшение талии при стабильном весе.</p>
        <p>Дай стартовым порциям 2–3 недели. Если вес и талия стоят при стабильном режиме, уменьши рацион примерно на 100–150 ккал или немного добавь ходьбы. При снижении быстрее 0,5 кг в неделю две недели подряд или падении сил и ухудшении восстановления добавь 100–150 ккал. Меняй один фактор за раз. Через 6–8 недель оцени динамику и при необходимости перейди на поддержание.</p>
        <p>Жир уходит с тела в индивидуальном порядке. Упражнения на пресс укрепляют мышцы живота. Талия и силовые показатели помогут оценить прогресс вместе.</p>
      </Disclosure>
    </section>

    <div className="section-bar nutrition-switch">
      <div className="segmented" aria-label="Раздел питания">
        <button type="button" onClick={() => setView('menu')} aria-pressed={view === 'menu'}><Utensils size={16} aria-hidden="true" /> Меню</button>
        <button type="button" onClick={() => setView('list')} aria-pressed={view === 'list'}><ShoppingBasket size={17} aria-hidden="true" /> Покупки</button>
      </div>
    </div>
    {view === 'menu' ? <>
      <div className="menu-days" aria-label="День меню">{menu.map((d, i) => <button key={d.short} type="button" aria-label={d.day} aria-pressed={selected === i} onClick={() => setSelected(i)}>{d.short}</button>)}</div>
      <div className="between menu-heading">
        <h2>{day.day}</h2>
        <div className="subtle-pill"><Wheat size={16} aria-hidden="true" /> {num(total.fiber)} г клетчатки</div>
      </div>
      <p className="menu-totals">{num(total.kcal)} ккал · Б {num(total.protein)} г · Ж {num(total.fat)} г · У {num(total.carbs)} г</p>
      <div className="meal-grid">
        {day.meals.map((m, i) => {
          const t = nutrition(m.items)
          return <section key={i} className="panel meal-card">
            <div className="between"><span className="eyebrow">{mealLabels[i]}</span><strong className="meal-kcal">{num(t.kcal)} ккал</strong></div>
            <h3>{m.name}</h3>
            <ul>{m.items.map(([id, grams]) => <li key={id}><span>{foods[id].label}</span><strong>{grams} г</strong></li>)}</ul>
          </section>
        })}
      </div>
      <p className="muted caption">Крупы и чечевица указаны сухими, мясо и картофель — сырыми. Масло включено. Для остальных продуктов указан вес съедобной части. Калории и БЖУ округлены.</p>
    </> : <section className="panel">
      <div className="between"><h2>Список на неделю</h2><span className="subtle-pill">{shopping.filter(f => data.settings.shopping.includes(f.id)).length} / {shopping.length}</span></div>
      <p className="muted">Количество рассчитано из меню на одного человека. Для покупки округли до упаковки и учти потери при очистке.</p>
      {portions.map(category => <div className="shopping-group" key={category}><h3>{category}</h3>
        {shopping.filter(f => f.category === category).map(f => <label className="shopping-line" key={f.id}>
          <input type="checkbox" checked={data.settings.shopping.includes(f.id)} onChange={() => toggle(f.id)} />
          <span>{f.label}</span><strong>{f.grams >= 1000 ? `${(f.grams / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 2 })} кг` : `${f.grams} г`}</strong>
        </label>)}
      </div>)}
    </section>}
    <section className="panel guides">
      <h2>Готовка и замены</h2>
      <Disclosure title="Заготовки на 2–3 дня">
        <p>Готовь крупы и мясо отдельными порциями. Курицу, индейку и картофель можно запекать, фарш — тушить с овощами, чечевицу — варить до мягкости. Овощи подойдут свежие или замороженные без добавок. Разложи готовое по порциям, охлади сразу после приготовления, часть можно заморозить.</p>
      </Disclosure>
      <Disclosure title="Простые замены">
        <p>Курица и индейка обычно взаимозаменяемы грамм к грамму. 70 г сухой крупы близки по энергии к 300–330 г сырого картофеля. 150 г творога 5% примерно соответствуют по белку 250–270 г указанного йогурта 2%, сверяй этикетку. Брокколи можно заменить капустой, ягоды — фруктом. При замене орехов из-за аллергии используй только переносимые продукты, а калории и БЖУ проверь отдельно.</p>
      </Disclosure>
      <Disclosure title="Клетчатка, витамины и минералы">
        <p>Овёс, цельнозерновой хлеб, бобовые, овощи и фрукты дают клетчатку. Молочные продукты — источник кальция, мясо и бобовые — железа, овощи и цитрусовые — витамина C. Лён, грецкие орехи и рапсовое масло дают растительную омега‑3 (АЛК). Если обычно ешь меньше бобовых или клетчатки, начни с меньших порций и повышай постепенно.</p>
        <p>Полный расчёт микронутриентов не проводился. При длительном повторении меню стоит проверить по этикеткам и базе состава продуктов кальций, железо, витамин D и йод, особенно если рыбу и морепродукты обычно не ешь. Йодированная соль может заменить обычную в том же количестве. Индивидуально оцени переносимость молочных продуктов, яиц, глютена, орехов и мёда.</p>
      </Disclosure>
    </section>
  </>
}
