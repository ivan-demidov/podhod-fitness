import type { ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

export function PageHeader({ title, text, eyebrow, action }: { title: string; text?: string; eyebrow?: string; action?: ReactNode }) {
  return <header className="page-header">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 id="page-title" tabIndex={-1}>{title}</h1>
      {text && <p className="page-description">{text}</p>}
    </div>
    {action}
  </header>
}

export function Disclosure({ title, children, open = false }: { title: ReactNode; children: ReactNode; open?: boolean }) {
  return <details className="disclosure" open={open || undefined}>
    <summary>{title}<ChevronDown size={18} aria-hidden="true" /></summary>
    <div className="disclosure-body">{children}</div>
  </details>
}

export function Empty({ icon, title, text, action }: { icon: ReactNode; title: string; text: string; action?: ReactNode }) {
  return <div className="empty">
    <div className="empty-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{text}</p>
    {action}
  </div>
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>
}
