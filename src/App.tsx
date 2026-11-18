import { useEffect, useRef, useState, type ChangeEvent, type MouseEvent } from 'react'
import { registerSW } from 'virtual:pwa-register'
import { Activity, BookOpen, ClipboardList, Dumbbell, House, LayoutGrid, Moon, Sun, TrendingUp, Upload, UserRound, Utensils } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Today } from '@/components/today'
import { Training } from '@/components/training-view'
import { Diary } from '@/components/diary'
import { Progress } from '@/components/progress'
import { Nutrition } from '@/components/nutrition-view'
import { Knowledge } from '@/components/knowledge-view'
import { ProfileView } from '@/components/profile'
import { listenStorage, localDay, mergeImport, newId, parseImport, persist, readData, type Data, type Import } from '@/lib/data'
import { type Day } from '@/lib/training'
import { cn } from '@/lib/utils'

const pages = [
  { id: 'today', title: 'Сегодня', icon: House },
  { id: 'training', title: 'Тренировки', icon: Dumbbell },
  { id: 'diary', title: 'Дневник', icon: ClipboardList },
  { id: 'progress', title: 'Прогресс', icon: TrendingUp },
  { id: 'nutrition', title: 'Питание', icon: Utensils },
  { id: 'knowledge', title: 'Добавки и знания', icon: BookOpen },
  { id: 'profile', title: 'Профиль', icon: UserRound },
] as const
type Page = typeof pages[number]['id']
const currentPage = () => pages.find(p => '#' + p.id === location.hash)?.id ?? 'today'
const iconPath = import.meta.env.BASE_URL + 'icon-192.png'

function Brand({ close }: { close?(): void }) {
  return <a href="#today" className="brand" aria-label="Подход, сегодня" onClick={close}>
    <img src={iconPath} width="36" height="36" alt="" />
    <span>Подход</span>
  </a>
}

export default function App() {
  const [snapshot, setSnapshot] = useState(readData)
  const data = snapshot.data
  const [page, setPage] = useState<Page>(currentPage)
  const [flash, setFlash] = useState({ text: '', failed: false, key: 0 })
  const [online, setOnline] = useState(navigator.onLine)
  const [offlineReady, setOfflineReady] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [incoming, setIncoming] = useState<Import | null>(null)
  const [importing, setImporting] = useState(false)
  const [switchDay, setSwitchDay] = useState<Day | null>(null)
  const [darkOS, setDarkOS] = useState(() => matchMedia('(prefers-color-scheme: dark)').matches)
  const file = useRef<HTMLInputElement>(null)
  const dark = data.settings.theme === 'dark' || (data.settings.theme === 'system' && darkOS)

  function notify(text: string, failed = false) { setFlash(prior => ({ text, failed, key: prior.key + 1 })) }

  useEffect(() => {
    function route() {
      setPage(currentPage())
      setMenuOpen(false)
      window.scrollTo(0, 0)
      requestAnimationFrame(() => document.getElementById('page-title')?.focus({ preventScroll: true }))
    }
    function network() { setOnline(navigator.onLine) }
    const storage = listenStorage(() => setSnapshot(readData()))
    const media = matchMedia('(prefers-color-scheme: dark)')
    const color = () => setDarkOS(media.matches)
    const updateReady = () => setOfflineReady(Boolean(navigator.serviceWorker?.controller))
    const viewport = window.visualViewport
    const adjustForKeyboard = () => {
      const inset = viewport && viewport.scale === 1 ? Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop) : 0
      document.documentElement.style.setProperty('--keyboard-inset', inset > 100 ? inset + 'px' : '0px')
    }
    viewport?.addEventListener('resize', adjustForKeyboard)
    viewport?.addEventListener('scroll', adjustForKeyboard)
    addEventListener('hashchange', route)
    addEventListener('online', network)
    addEventListener('offline', network)
    media.addEventListener('change', color)
    navigator.serviceWorker?.addEventListener('controllerchange', updateReady)
    updateReady()
    if (import.meta.env.PROD) {
      registerSW({ immediate: true, onOfflineReady: () => setOfflineReady(true), onRegisterError: () => setOfflineReady(false) })
    }
    return () => {
      storage()
      viewport?.removeEventListener('resize', adjustForKeyboard)
      viewport?.removeEventListener('scroll', adjustForKeyboard)
      removeEventListener('hashchange', route)
      removeEventListener('online', network)
      removeEventListener('offline', network)
      media.removeEventListener('change', color)
      navigator.serviceWorker?.removeEventListener('controllerchange', updateReady)
    }
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#151a15' : '#f5f5ef')
  }, [dark])
  useEffect(() => {
    document.title = `Подход — ${pages.find(p => p.id === page)?.title}`
  }, [page])
  useEffect(() => {
    if (!flash.text) return
    const id = window.setTimeout(() => setFlash(value => ({ ...value, text: '' })), flash.failed ? 7400 : 2400)
    return () => clearTimeout(id)
  }, [flash.key, flash.text, flash.failed])

  function update(fn: (d: Data) => Data, success?: string, recover = false) {
    try {
      setSnapshot({ data: persist(fn, recover), error: '' })
      if (success) notify(success)
      return true
    } catch (err) {
      notify(err instanceof DOMException ? 'Не удалось записать на устройство. Проверь, доступно ли хранилище, и сохрани копию.' : err instanceof Error && !(err.name === 'ZodError') ? err.message : 'Не удалось сохранить данные. Проверь значения и повтори.', true)
      return false
    }
  }

  function openDay(day: Day, replace = false) {
    if (data.draft && data.draft.day !== day.id && !replace) { setSwitchDay(day); return }
    const ok = update(d => {
      if (d.draft?.day === day.id) return d
      const old = d.draft
      if (old && !replace) throw new Error('Уже открыта другая тренировка.')
      const stamp = new Date().toISOString()
      const workouts = old && d.sets.some(s => s.workoutId === old.id) ? [...d.workouts, { id: old.id, day: old.day, date: old.date, updatedAt: stamp }] : d.workouts
      return { ...d, workouts, draft: { id: newId(), day: day.id, date: localDay(), updatedAt: stamp, exercise: day.slots[0].exercise }, timerEnds: 0 }
    })
    if (ok) {
      setSwitchDay(null)
      if (currentPage() === 'diary') window.scrollTo(0, 0)
      else location.hash = 'diary'
    }
  }

  async function loadFile(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    event.target.value = ''
    if (!selected) return
    setImporting(true)
    try {
      if (selected.size > 10 * 1024 * 1024) throw new Error('size')
      setIncoming(parseImport(await selected.text()))
    } catch {
      notify('Файл не прочитан. Выбери JSON-профиль или копию «Подхода» размером до 10 МБ.', true)
    } finally {
      setImporting(false)
    }
  }

  function importData() {
    if (!incoming) return
    if (update(d => mergeImport(d, incoming), incoming.kind === 'podhod-setup' ? 'Личный профиль загружен' : 'Копия импортирована', true)) {
      const setup = incoming.kind === 'podhod-setup'
      setIncoming(null)
      if (setup) location.hash = 'today'
    }
  }

  function interceptHash(event: MouseEvent<HTMLAnchorElement>, id: Page) {
    if (currentPage() !== id) return
    event.preventDefault()
    setMenuOpen(false)
    window.scrollTo(0, 0)
  }

  const openImport = () => file.current?.click()
  const actionTheme = () => update(d => ({ ...d, settings: { ...d.settings, theme: dark ? 'light' : 'dark' } }))
  return <>
    <a className="skip-link" href="#page-title" onClick={e => { e.preventDefault(); document.querySelector<HTMLElement>('#page-title')?.focus() }}>К содержимому</a>
    <aside className="sidebar">
      <Brand />
      <nav aria-label="Разделы приложения" className="side-nav">
        {pages.map(p => <a key={p.id} href={`#${p.id}`} onClick={e => interceptHash(e, p.id)} aria-current={page === p.id ? 'page' : undefined}>
          <p.icon aria-hidden="true" size={21} /><span>{p.title}</span>
        </a>)}
      </nav>
      <div className="sidebar-foot">
        <div className="sidebar-device"><Activity size={18} aria-hidden="true" /><span>{online ? 'Данные на устройстве' : 'Офлайн'}</span></div>
        <Button type="button" size="icon" variant="ghost" aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'} onClick={actionTheme}>{dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</Button>
      </div>
    </aside>
    <header className="mobile-head">
      <Brand />
      <Button size="icon" variant="ghost" aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'} onClick={actionTheme}>{dark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}</Button>
    </header>
    <main className="main">
      {!online && <div className="network-status"><span className="neutral-dot" /> Офлайн · записи сохраняются локально</div>}
      {snapshot.error && <div role="alert" className="warning-banner">{snapshot.error}</div>}
      <div className="view" key={page}>
        {page === 'today' && <Today data={data} start={openDay} firstRun={openImport} />}
        {page === 'training' && <Training data={data} start={openDay} setPlan={plan => update(d => ({ ...d, settings: { ...d.settings, plan } }))} />}
        {page === 'diary' && <Diary data={data} start={openDay} update={update} />}
        {page === 'progress' && <Progress data={data} update={update} />}
        {page === 'nutrition' && <Nutrition data={data} toggle={id => update(d => ({ ...d, settings: { ...d.settings, shopping: d.settings.shopping.includes(id) ? d.settings.shopping.filter(x => x !== id) : [...d.settings.shopping, id] } }))} />}
        {page === 'knowledge' && <Knowledge profile={data.profile} />}
        {page === 'profile' && <ProfileView data={data} update={update} requestImport={openImport} offline={offlineReady} />}
      </div>
    </main>
    <nav className="mobile-tabs" aria-label="Основные разделы">
      {pages.slice(0, 4).map(p => <a key={p.id} href={`#${p.id}`} onClick={e => interceptHash(e, p.id)} aria-current={page === p.id ? 'page' : undefined}>
        <p.icon aria-hidden="true" size={22} /><span>{p.id === 'training' ? 'План' : p.title}</span>
      </a>)}
      <button type="button" className={cn(!pages.slice(0, 4).some(p => p.id === page) && 'is-active')} aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><LayoutGrid size={22} aria-hidden="true" /><span>Ещё</span></button>
    </nav>
    <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
      <DialogContent className="dialog-content mobile-sheet">
        <DialogHeader><DialogTitle>Разделы</DialogTitle><DialogDescription>Питание, знания и настройки.</DialogDescription></DialogHeader>
        {pages.slice(4).map(p => <a key={p.id} className="sheet-link" href={`#${p.id}`} aria-current={page === p.id ? 'page' : undefined} onClick={e => interceptHash(e, p.id)}><p.icon size={23} aria-hidden="true" />{p.title}</a>)}
      </DialogContent>
    </Dialog>
    <input hidden type="file" accept=".json,application/json" ref={file} onChange={loadFile} />
    <Dialog open={incoming !== null} onOpenChange={open => { if (!open) setIncoming(null) }}>
      <DialogContent className="dialog-content">
        <DialogHeader><DialogTitle>{incoming?.kind === 'podhod-setup' ? 'Загрузить личный профиль?' : 'Импортировать резервную копию?'}</DialogTitle>
          <DialogDescription>{incoming?.kind === 'podhod-setup'
            ? `Профиль${incoming.profile.name ? ' · ' + incoming.profile.name : ''}. Данные сохранятся в этом приложении.`
            : incoming?.kind === 'podhod-backup' ? `В файле ${incoming.data.sets.length} подходов, ${incoming.data.measures.length} замеров и ${incoming.data.workouts.length} тренировок. Записи объединятся. Профиль и настройки будут загружены из копии.` : 'Проверь содержимое файла.'}</DialogDescription>
        </DialogHeader>
        <div className="button-group"><Button variant="outline" onClick={() => setIncoming(null)}>Отмена</Button><Button onClick={importData}><Upload aria-hidden="true" /> Импортировать</Button></div>
      </DialogContent>
    </Dialog>
    <Dialog open={switchDay !== null} onOpenChange={open => { if (!open) setSwitchDay(null) }}>
      <DialogContent className="dialog-content">
        <DialogHeader><DialogTitle>Открыть другое занятие?</DialogTitle><DialogDescription>Текущая тренировка с записанными подходами перейдёт в историю. Затем откроется «{switchDay?.title}».</DialogDescription></DialogHeader>
        <div className="button-group"><Button variant="outline" onClick={() => setSwitchDay(null)}>Отмена</Button><Button onClick={() => switchDay && openDay(switchDay, true)}>Открыть</Button></div>
      </DialogContent>
    </Dialog>
    <div className="toast-slot" aria-live="polite">
      {importing && <div className="toast">Читаю файл…</div>}
      {flash.text && <div className={cn('toast', flash.failed && 'toast-error')} key={flash.key}>{flash.text}</div>}
    </div>
  </>
}
