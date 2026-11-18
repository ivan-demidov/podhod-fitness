import { useState, type FormEvent } from 'react'
import { Activity, Download, HardDrive, Smartphone, Upload } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Disclosure, Field, PageHeader } from './common'
import { downloadBackup, numberInput, profileSchema, type Data, type Profile, type Settings } from '@/lib/data'

function ProfileForm({ profile, save }: { profile: Profile | null; save(value: Profile): boolean }) {
  const [error, setError] = useState('')
  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const field = (name: string) => String(form.get(name) ?? '')
    const result = profileSchema.safeParse({
      ...profile, name: field('name'), age: numberInput(field('age')), height: numberInput(field('height')),
      weight: numberInput(field('weight')), activity: numberInput(field('activity')), deficit: numberInput(field('deficit')),
      sex: field('sex'), notes: field('notes'), supplement: field('supplement'),
    })
    if (!result.success) {
      const labels: Record<string, string> = { age: 'возраст 18–90 лет', height: 'рост 130–230 см', weight: 'вес 35–250 кг', activity: 'активность 1,15–1,75', deficit: 'целый дефицит 0–400 ккал', sex: 'пол для формулы' }
      const invalid = [...new Set(result.error.issues.map(i => labels[String(i.path[0])] ?? 'длину текста'))]
      setError(`Проверь: ${invalid.join(', ')}.`)
      return
    }
    setError('')
    if (!save(result.data)) setError('Профиль не сохранился.')
  }
  return <form className="form-stack" onSubmit={handleSave}>
    <div className="field-grid">
      <Field label="Имя"><Input name="name" defaultValue={profile?.name} maxLength={60} autoComplete="given-name" /></Field>
      <Field label="Возраст, лет"><Input name="age" defaultValue={profile?.age} inputMode="numeric" required /></Field>
      <Field label="Рост, см"><Input name="height" defaultValue={profile?.height} inputMode="decimal" required /></Field>
      <Field label="Исходный вес, кг"><Input name="weight" defaultValue={profile?.weight} inputMode="decimal" required /></Field>
      <Field label="Пол для расчёта">
        <select name="sex" defaultValue={profile?.sex ?? ''} required><option value="" disabled>Выбрать</option><option value="male">Мужской</option><option value="female">Женский</option></select>
      </Field>
      <Field label="Активность · коэффициент" hint="Коэффициент для начальной оценки расхода.">
        <Input name="activity" defaultValue={profile?.activity ?? 1.38} inputMode="decimal" required />
      </Field>
      <Field label="Дефицит, ккал" hint="0 — поддержание по расчёту."><Input name="deficit" defaultValue={profile?.deficit ?? 300} inputMode="numeric" required /></Field>
    </div>
    <Field label="Что принимаю сейчас"><Input name="supplement" defaultValue={profile?.supplement} maxLength={200} /></Field>
    <Field label="Ограничения и заметки"><textarea name="notes" rows={5} defaultValue={profile?.notes} maxLength={3000} /></Field>
    {error && <p className="error" role="alert">{error}</p>}
    <Button type="submit">Сохранить профиль</Button>
  </form>
}

export function ProfileView({ data, update, requestImport, offline }: {
  data: Data; update(fn: (d: Data) => Data, success?: string): boolean; requestImport(): void; offline: boolean
}) {
  const f = data.profile?.fitbit
  const themes: [Settings['theme'], string][] = [['system', 'Система'], ['light', 'Светлая'], ['dark', 'Тёмная']]
  return <>
    <PageHeader title="Профиль" text="Твои исходные данные, настройки и резервные копии." />
    <div className="profile-grid">
      <section className="panel">
        <div className="section-bar"><h2>Мои данные</h2></div>
        <ProfileForm key={JSON.stringify(data.profile)} profile={data.profile} save={p => update(d => ({ ...d, profile: p }), 'Профиль сохранён')} />
      </section>
      <div className="profile-side">
        <section className="panel">
          <h2>Настройки</h2>
          <p className="caption">Тема оформления</p>
          <div className="segmented" aria-label="Тема оформления">
            {themes.map(([id, label]) => <button key={id} type="button" aria-pressed={data.settings.theme === id} onClick={() => update(d => ({ ...d, settings: { ...d.settings, theme: id } }))}>{label}</button>)}
          </div>
          <p className="caption">Посещения зала в неделю</p>
          <div className="segmented" aria-label="Посещения зала">
            {([3, 4] as const).map(plan => <button key={plan} type="button" aria-pressed={data.settings.plan === plan} onClick={() => update(d => ({ ...d, settings: { ...d.settings, plan } }))}>{plan} дня</button>)}
          </div>
        </section>
        <section className="panel">
          <div className="between"><h2>Данные на устройстве</h2><HardDrive size={21} className="muted" aria-hidden="true" /></div>
          <p>Записи хранятся на этом устройстве. Автоматической синхронизации нет. Очистка данных сайта или удаление приложения может стереть записи. Периодически сохраняй копию в приложении «Файлы» или другом выбранном месте.</p>
          <div className="button-group backup-actions">
            <Button type="button" onClick={() => downloadBackup(data)}><Download aria-hidden="true" /> Экспорт</Button>
            <Button type="button" variant="outline" onClick={requestImport}><Upload aria-hidden="true" /> Импорт</Button>
          </div>
          <p className="caption">Импорт читает файл на устройстве. Одинаковые записи объединяются по их идентификатору, сохраняется версия с более поздним временем изменения.</p>
        </section>
        <section className="panel">
          <div className="between"><h2>На экран «Домой»</h2><Smartphone size={21} className="muted" aria-hidden="true" /></div>
          <ol className="instruction-list"><li>Открой сайт в Safari на iPhone.</li><li>Нажми «Поделиться» → «На экран „Домой“».</li><li>Оставь включённым «Открыть как веб‑приложение», если показан этот переключатель, и нажми «Добавить».</li><li>Открой «Подход» с экрана «Домой» при наличии сети. Импортируй профиль или копию уже внутри установленного приложения.</li></ol>
          <div className="offline-label" role="status"><span className={offline ? 'online-dot' : 'neutral-dot'} /> {offline ? 'Основные экраны готовы к офлайн-работе' : 'Для подготовки офлайн открой рабочую сборку с сетью'}</div>
          <Disclosure title="Особенности iPhone"><p>Таймер отдыха пересчитывается при возвращении в приложение. Сигнала на заблокированном экране нет. Хранилище Safari и ярлыка может различаться. Для переноса используй экспорт и импорт.</p>
            <a href="https://support.apple.com/en-az/guide/iphone/iphea86e5236/26/ios/26" target="_blank" rel="noreferrer">Инструкция Apple</a>
          </Disclosure>
        </section>
      </div>
    </div>
    {f && <section className="panel fitbit-panel">
      <div className="between"><div><h2>Fitbit Air</h2><p className="muted">{f.period}</p></div><Activity size={22} aria-hidden="true" className="muted" /></div>
      <div className="macro-row">
        <div><strong>{f.steps.toLocaleString('ru-RU')}</strong><span>шагов · Fitbit</span></div>
        <div><strong>{f.phoneSteps.toLocaleString('ru-RU')}</strong><span>шагов · телефон</span></div>
        <div><strong>{Math.floor(f.sleepMinutes / 60)}:{String(f.sleepMinutes % 60).padStart(2, '0')}</strong><span>сон · медиана</span></div>
        <div><strong>{f.shortNights}</strong><span>ночей &lt; 7 ч</span></div>
      </div>
      <Disclosure title="Как это использовано">{f.notes.split('\n').map(p => <p key={p}>{p}</p>)}</Disclosure>
    </section>}
  </>
}
