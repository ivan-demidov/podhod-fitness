import { ArrowUpRight, BookOpen, ShieldCheck } from 'lucide-react'
import { Disclosure, PageHeader } from './common'
import { safety, sources } from '@/lib/knowledge'
import type { Profile } from '@/lib/data'

function EvidenceLink({ id }: { id: (typeof sources)[number]['id'] }) {
  const source = sources.find(s => s.id === id)
  return source && <a className="source-inline" href={source.url} target="_blank" rel="noreferrer">{source.title} <ArrowUpRight size={15} aria-hidden="true" /></a>
}

export function Knowledge({ profile }: { profile: Profile | null }) {
  return <>
    <PageHeader title="Добавки и знания" text="Как применять рекомендации и на какие данные они опираются." />
    <div className="knowledge-grid">
      <section className="panel">
        <div className="between"><h2>Добавки</h2><ShieldCheck className="muted" size={22} aria-hidden="true" /></div>
        <p>На старте приоритет — регулярные тренировки, питание и сон. Добавки по желанию и под конкретную задачу.</p>
        {profile?.supplement && <div className="callout"><strong>Сейчас в профиле</strong><p>{profile.supplement}</p></div>}
        <Disclosure title="Супрадин Иммуно · проверь этикетку">
          <p>Есть версии с разными составами и порциями. Пока неизвестна твоя версия, используй инструкцию своей упаковки и не добавляй отдельно витамин D, витамин C или цинк без проверки суммарных доз. Если назначат лекарства, покажи состав врачу или фармацевту. Например, цинк может мешать всасыванию некоторых антибиотиков. Варианты с прополисом требуют внимания при аллергии на продукты пчеловодства.</p>
          <p>Дополнительные магний, цинк, D3 + K2, омега‑3, цитруллин и предтренировочные комплексы сейчас не обязательны. При показаниях к витамину D дозу определяет врач. Особенно важно проверять совместимость K2, если принимаешь варфарин.</p>
          <EvidenceLink id="supradyn" /> <EvidenceLink id="supradyn-forte" /> <EvidenceLink id="vitd" /> <EvidenceLink id="zinc" /> <EvidenceLink id="vitk" />
        </Disclosure>
        <Disclosure title="Креатин моногидрат · по желанию">
          <p>Если после первых двух недель вернулся к регулярным тренировкам, можно попробовать 3 г ежедневно, включая выходные. Время не принципиально, с едой может быть удобнее. Загрузка не нужна. Оцени переносимость и журнал силы через 8–12 недель. Возможен небольшой средний прирост силы, а также прибавка воды и массы тела. Эффект для конкретного человека непредсказуем.</p>
          <p>При заболевании почек, сниженной функции почек или приёме средств, влияющих на неё, согласуй с врачом до начала. Сообщи о креатине, если сдаёшь анализ на креатинин. При повторяющихся проблемах с ЖКТ прекрати приём. Надёжные данные умеренные для здоровых молодых взрослых, слабее для отдельных клинических групп.</p>
          <EvidenceLink id="creatine" /> <EvidenceLink id="creatine-dose" /> <EvidenceLink id="kidney" />
        </Disclosure>
        <Disclosure title="Протеин · если белка из еды не хватает">
          <p>Ориентир из меню обычно можно набрать едой. Если в конкретный день не хватает около 20–25 г белка, порция порошка с таким количеством белка (проверь этикетку) может закрыть разницу. Принимай в удобный приём пищи в такие дни, без фиксированного курса. Дополнительной пользы при достаточном общем белке обычно мало.</p>
          <p>При аллергии на белок молока избегай сывороточного протеина. При непереносимости лактозы проверяй этикетку или бери переносимую пищевую альтернативу. Согласуй целевое количество белка при заболевании почек и время приёма при использовании леводопы. Доказательность умеренная для общего количества белка на фоне силовых.</p>
          <EvidenceLink id="protein" />
        </Disclosure>
      </section>
      <section className="panel">
        <div className="between"><h2>Безопасность</h2><BookOpen className="muted" size={22} aria-hidden="true" /></div>
        <Disclosure title="Поясница и ощущение наклона таза" open>
          {safety.map(t => <p key={t}>{t}</p>)}
          <EvidenceLink id="pelvis" /> <EvidenceLink id="back" /> <EvidenceLink id="urgent" />
        </Disclosure>
        <Disclosure title="Что считать прогрессом">
          <p>На первом этапе отслеживай регулярность, талию и средний вес. Для силы сравнивай рабочие подходы одного движения с похожей техникой, оборудованием и запасом повторений. Силовые или упражнения на пресс могут укрепить мышцы, но уменьшение объёма живота связано в том числе с общим изменением жировой массы.</p>
          <EvidenceLink id="fat" /> <EvidenceLink id="strength" />
        </Disclosure>
      </section>
    </div>
    <section className="panel guides">
      <h2>Источники</h2>
      {sources.map(s => <Disclosure key={s.id} title={<span><strong>{s.title}</strong><small className="block muted">{s.date}</small></span>}>
        <p>{s.text}</p><EvidenceLink id={s.id} />
      </Disclosure>)}
    </section>
  </>
}
