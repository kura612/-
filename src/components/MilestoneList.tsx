import { useState } from 'react';
import { milestoneProgress } from '../lib/milestones';
import { humanizeDuration } from '../lib/time';
import Icon from './icons';

type Props = { elapsedMs: number };

/** 折りたたみ時に、現在地の前後だけを見せる件数 */
const BEHIND = 2;
const AHEAD = 3;

/** 健康回復のタイムライン。達成済み・進行中・未到達を1本の線で見せる。 */
export default function MilestoneList({ elapsedMs }: Props) {
  const [expanded, setExpanded] = useState(false);
  const items = milestoneProgress(elapsedMs);
  const currentIndex = items.findIndex((m) => !m.achieved);
  const cursor = currentIndex === -1 ? items.length - 1 : currentIndex;

  const from = expanded ? 0 : Math.max(0, cursor - BEHIND);
  const to = expanded ? items.length : Math.min(items.length, cursor + AHEAD + 1);
  const shown = items.slice(from, to);
  const hidden = items.length - shown.length;

  return (
    <section className="card">
      <h2 className="section-title">
        体の回復
        <span className="section-note">
          {items.filter((m) => m.achieved).length} / {items.length} 達成
        </span>
      </h2>

      {!expanded && from > 0 && <p className="timeline-more">…… ここまで {from} 件を達成</p>}

      <ol className="timeline">
        {shown.map(({ milestone, achieved, remainingMs }, i) => (
          <li
            key={milestone.label}
            className={achieved ? 'done' : from + i === cursor ? 'current' : 'future'}
          >
            <span className="marker">
              <Icon name={achieved ? 'check' : milestone.icon} size={13} />
            </span>
            <div className="timeline-body">
              <p className="timeline-head">
                <span className="timeline-label">{milestone.label}</span>
                <span className="timeline-meta">
                  {achieved ? '達成' : `あと ${humanizeDuration(remainingMs)}`}
                </span>
              </p>
              <p className="timeline-desc">{milestone.description}</p>
            </div>
          </li>
        ))}
      </ol>

      {hidden > 0 && (
        <button type="button" className="btn quiet wide more" onClick={() => setExpanded(true)}>
          すべて表示（残り {hidden} 件）
        </button>
      )}
      {expanded && (
        <button type="button" className="btn quiet wide more" onClick={() => setExpanded(false)}>
          折りたたむ
        </button>
      )}

      <p className="footnote">
        一般に公表されている禁煙後の回復の目安です。効果には個人差があります。
      </p>
    </section>
  );
}
