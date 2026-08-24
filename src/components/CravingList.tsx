import type { Craving } from '../types';
import { triggerIcon, triggerLabel } from '../lib/cravings';

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
      <h2>記録（{cravings.length}件）</h2>
      <ul className="craving-list">
        {cravings.slice(0, 50).map((c) => (
          <li key={c.id} className={c.resisted ? 'resisted' : 'smoked'}>
            <span className="craving-time muted small">{fmt.format(new Date(c.at))}</span>
            <span className="craving-trigger">
              <span aria-hidden="true">{triggerIcon(c.trigger)}</span> {triggerLabel(c.trigger)}
            </span>
            <span className="craving-intensity" title={`強さ ${c.intensity}`}>
              {'●'.repeat(c.intensity)}
              <span className="dim">{'●'.repeat(5 - c.intensity)}</span>
            </span>
            <span className={`badge ${c.resisted ? 'good' : 'neutral'}`}>
              {c.resisted ? '乗り切った' : '吸った'}
            </span>
            {c.note && <span className="craving-note muted small">{c.note}</span>}
            <button
              type="button"
              className="icon-btn"
              aria-label="この記録を削除"
              onClick={() => onRemove(c.id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      {cravings.length > 50 && <p className="muted small">直近50件を表示しています。</p>}
    </section>
  );
}
