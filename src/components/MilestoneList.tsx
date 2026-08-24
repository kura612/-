import { milestoneProgress } from '../lib/milestones';
import { humanizeDuration } from '../lib/time';

type Props = { elapsedMs: number };

/** 健康回復のタイムライン。達成済みと未達成を1本の線で見せる。 */
export default function MilestoneList({ elapsedMs }: Props) {
  const items = milestoneProgress(elapsedMs);

  return (
    <section className="card">
      <h2>体の回復タイムライン</h2>
      <ol className="timeline">
        {items.map(({ milestone, achieved, remainingMs }) => (
          <li key={milestone.label} className={achieved ? 'done' : ''}>
            <span className="dot" aria-hidden="true">
              {achieved ? '✓' : milestone.icon}
            </span>
            <div className="timeline-body">
              <p className="timeline-head">
                <strong>{milestone.label}</strong>
                <span className="muted small">
                  {achieved ? '達成' : `あと ${humanizeDuration(remainingMs)}`}
                </span>
              </p>
              <p className="muted small">{milestone.description}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="muted small">
        ※ 一般的に公表されている禁煙後の回復の目安です。効果には個人差があります。
      </p>
    </section>
  );
}
