import { ArrowUpRight, BookOpen, ShieldCheck } from 'lucide-react'
import { Disclosure, PageHeader } from './common'
import { safety, sources } from '@/lib/knowledge'
import type { Profile } from '@/lib/data'
import { targets } from '@/lib/nutrition'

function EvidenceLink({ id }: { id: (typeof sources)[number]['id'] }) {
  const source = sources.find(s => s.id === id)
  return source && <a className="source-inline" href={source.url} target="_blank" rel="noreferrer">{source.title} <ArrowUpRight size={15} aria-hidden="true" /></a>
}

export function Knowledge({ profile }: { profile: Profile | null }) {
  const proteinGoal = profile ? `${targets(profile).protein} г белка в день` : 'свой дневной ориентир по белку'
  return <>
    <PageHeader title="Добавки и знания" text="Как применять рекомендации и на какие данные они опираются." />
    <div className="knowledge-grid">
      <section className="panel">
        <div className="between"><h2>Схема приёма добавок</h2><ShieldCheck className="muted" size={22} aria-hidden="true" /></div>
        <p>Для твоей цели обязательных добавок нет. Если хочешь добавить что-то для силовых, можно начать с креатина моногидрата. Протеин пригодится только при недоборе белка.</p>
        {profile?.supplement && <div className="callout"><strong>Сейчас в профиле</strong><p>{profile.supplement}</p></div>}
        <article className="supplement">
          <h3>Креатин моногидрат</h3>
          <p className="caption">По желанию · для силы и повторных интенсивных усилий</p>
          <dl>
            <div><dt>Сколько</dt><dd>3 г моногидрата один раз в день, без загрузочной фазы.</dd></div>
            <div><dt>Когда</dt><dd>Ежедневно, включая дни отдыха. Например, с завтраком, разведя в воде. Привязка к тренировке необязательна.</dd></div>
            <div><dt>Как долго</dt><dd>Если тренировки уже регулярны, попробуй и оцени переносимость и рабочие веса через 8–12 недель. Это срок оценки, обязательного перерыва после него нет.</dd></div>
          </dl>
          <Disclosure title="Эффект, ограничения и источники">
            <p>В исследованиях у здоровых тренирующихся взрослых младше 50 лет креатин в среднем улучшал силовые показатели. Уверенность умеренная, эффект зависит от программы и человека. Масса тела может немного вырасти из-за воды.</p>
            <p>При заболевании или сниженной функции почек либо приёме лекарств, влияющих на почки, согласуй добавку с врачом. Сообщи о креатине при сдаче анализа на креатинин. При стойком расстройстве ЖКТ прекрати приём.</p>
            <EvidenceLink id="creatine" /> <EvidenceLink id="creatine-dose" /> <EvidenceLink id="kidney" />
          </Disclosure>
        </article>
        <article className="supplement">
          <h3>Протеин</h3>
          <p className="caption">По ситуации · чтобы добрать белок</p>
          <dl>
            <div><dt>Сколько</dt><dd>Ориентируйся на {proteinGoal}. Если с едой не хватает 20–25 г, возьми порцию с таким количеством белка по этикетке. Граммы белка и вес порошка могут различаться.</dd></div>
            <div><dt>Когда</dt><dd>В удобный приём пищи или как перекус в день недобора. Можно размешать в воде.</dd></div>
            <div><dt>Как долго</dt><dd>Только в дни, когда порциями еды не закрывается ориентир. Отдельный курс не нужен.</dd></div>
          </dl>
          <Disclosure title="Переносимость и источники">
            <p>Умеренная уверенность в пользе достаточного общего белка на фоне силовых. Если его хватает из еды, порошок обычно мало что добавляет. При аллергии на белок молока исключи сывороточный протеин. При заболевании почек или приёме леводопы согласуй количество и время с врачом.</p>
            <EvidenceLink id="protein" />
          </Disclosure>
        </article>
        <article className="supplement">
          <h3>Супрадин Иммуно</h3>
          <p className="caption">Сначала сверь полное название на упаковке</p>
          <dl>
            <div><dt>Сколько и когда</dt><dd>Следуй дозировке и времени из вкладыша своей версии. У разных форм отличаются дозы, состав и длительность.</dd></div>
            <div><dt>Как долго</dt><dd>Сверь срок во вкладыше. Для роста силы и снижения веса отдельный курс этого комплекса не требуется.</dd></div>
          </dl>
          <Disclosure title="Инструкции к версиям и совместимость">
            <p>Сверь состав перед сочетанием с отдельными витаминами D и C или цинком. Цинк может мешать всасыванию некоторых антибиотиков. С прополисом соблюдай осторожность при аллергии на продукты пчеловодства. При наличии назначения врача следуй назначению.</p>
            <EvidenceLink id="supradyn" /> <EvidenceLink id="supradyn-forte" /> <EvidenceLink id="zinc" />
          </Disclosure>
        </article>
        <Disclosure title="Какие добавки пока не нужны">
          <p>Магний, дополнительные цинк и D3 + K2, омега‑3, цитруллин и предтренировочные комплексы сейчас можно не добавлять ради силы или снижения веса. Витамин D принимают по отдельным показаниям. K2 может взаимодействовать с варфарином.</p>
          <EvidenceLink id="vitd" /> <EvidenceLink id="vitk" />
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
