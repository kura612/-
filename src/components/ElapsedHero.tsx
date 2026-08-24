import type { Profile } from '../types';
import { elapsedSince, humanizeDuration } from '../lib/time';
import { achievedCount, MILESTONES, nextMilestone } from '../lib/milestones';

type Props = { profile: Profile; now: number };

/** 画面上部の「禁煙してからの経過時間」と次のマイルストーンまでの進捗 */
export default function ElapsedHero({ profile, now }: Props) {
  const e = elapsedSince(profile.quitAt, now);
  const next = nextMilestone(e.totalMs);
  const done = achievedCount(e.totalMs);

  return (
    <section className="card hero">
      <p className="hero-label">禁煙してから</p>
      <div className="clock" aria-live="polite">
        <Unit value={e.days} unit="日" wide />
        <Unit value={e.hours} unit="時間" />
        <Unit value={e.minutes} unit="分" />
        <Unit value={e.seconds} unit="秒" />
      </div>

      {next ? (
        <div className="next-milestone">
          <div className="next-head">
            <span className="next-icon" aria-hidden="true">
              {next.milestone.icon}
            </span>
            <div>
              <p className="next-title">
                次は <strong>{next.milestone.label}</strong>
              </p>
              <p className="muted small">{next.milestone.description}</p>
            </div>
            <span className="next-remaining">あと {humanizeDuration(next.remainingMs)}</span>
          </div>
          <div
            className="bar"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(next.ratio * 100)}
          >
            <div className="bar-fill" style={{ width: `${next.ratio * 100}%` }} />
          </div>
        </div>
      ) : (
        <p className="next-title">🎉 すべての回復マイルストーンを達成しました。</p>
      )}

      <p className="muted small center">
        回復マイルストーン {done} / {MILESTONES.length} 達成
      </p>
    </section>
  );
}

function Unit({ value, unit, wide = false }: { value: number; unit: string; wide?: boolean }) {
  return (
    <div className={`unit${wide ? ' wide' : ''}`}>
      <span className="unit-value">{wide ? value : String(value).padStart(2, '0')}</span>
      <span className="unit-label">{unit}</span>
    </div>
  );
}
