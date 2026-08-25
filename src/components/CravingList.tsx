import type { Craving } from '../types';
import { triggerIcon, triggerLabel } from '../lib/cravings';
import Icon from './icons';

type Props = { cravings: Craving[]; onRemove: (id: string) => void };

const fmt = new Intl.DateTimeFormat('ja-JP', {
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** 記録の一覧（新しい順） */
export default function CravingList({ cravings, onRemove }: Props) {
  if (cravings.length === 0) return null;

  return (
    <section className="card">
      <h2 className="section-title">
        記録
        <span className="section-note">{cravings.length}件</span>
      </h2>
      <ul className="craving-list">
        {cravings.slice(0, 50).map((c) => (
          <li key={c.id}>
            <span className={`state ${c.resisted ? 'resisted' : 'smoked'}`} aria-hidden="true" />
            <div className="craving-main">
              <p className="craving-head">
                <Icon name={triggerIcon(c.trigger)} size={14} />
                <span className="craving-trigger">{triggerLabel(c.trigger)}</span>
                <span className="craving-intensity" aria-label={`強さ ${c.intensity}`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <span key={n} className={`tick${n <= c.intensity ? ' on' : ''}`} />
                  ))}
                </span>
                <span className="craving-time">{fmt.format(new Date(c.at))}</span>
              </p>
              {c.note && <p className="craving-note">{c.note}</p>}
            </div>
            <span className={`badge${c.resisted ? ' good' : ''}`}>
              {c.resisted ? '乗り切った' : '吸った'}
            </span>
            <button
              type="button"
              className="icon-btn"
              aria-label="この記録を削除"
              onClick={() => onRemove(c.id)}
            >
              <Icon name="trash" size={15} />
            </button>
          </li>
        ))}
      </ul>
      {cravings.length > 50 && <p className="footnote">直近50件を表示しています。</p>}
    </section>
  );
}
