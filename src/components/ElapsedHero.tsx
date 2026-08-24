import type { Profile } from '../types';
import { elapsedSince, humanizeDuration } from '../lib/time';
import { achievedCount, MILESTONES, nextMilestone } from '../lib/milestones';
import Icon from './icons';
import Ring from './Ring';

type Props = { profile: Profile; now: number };

const pad = (n: number) => String(n).padStart(2, '0');

/** 経過時間と、次の回復マイルストーンまでの進捗 */
export default function ElapsedHero({ profile, now }: Props) {
  const e = elapsedSince(profile.quitAt, now);
  const next = nextMilestone(e.totalMs);
  const done = achievedCount(e.totalMs);

  return (
    <section className="card hero">
      <div className="hero-main">
        <div className="hero-count">
          <p className="eyebrow">禁煙してから</p>
          <p className="days" aria-live="polite">
            <span className="days-num">{e.days}</span>
            <span className="days-unit">日</span>
          </p>
          <p className="hero-clock">
            {pad(e.hours)}:{pad(e.minutes)}:{pad(e.seconds)}
          </p>
        </div>

        <Ring
          ratio={next ? next.ratio : 1}
          label={next ? `次のマイルストーンまで ${Math.round(next.ratio * 100)}%` : '全達成'}
        >
          <Icon name={next ? next.milestone.icon : 'star'} size={20} />
          <span className="ring-pct">{next ? `${Math.round(next.ratio * 100)}%` : '100%'}</span>
        </Ring>
      </div>

      <div className="hero-foot">
        {next ? (
          <>
            <div className="hero-next">
              <p className="eyebrow">次の回復</p>
              <p className="hero-next-label">{next.milestone.label}</p>
              <p className="hero-next-desc">{next.milestone.description}</p>
            </div>
            <div className="hero-remaining">
              <p className="eyebrow">残り</p>
              <p className="hero-remaining-value">{humanizeDuration(next.remainingMs)}</p>
            </div>
          </>
        ) : (
          <p className="hero-next-label">すべての回復マイルストーンを達成しました</p>
        )}
      </div>

      <p className="hero-progress-note">
        <span>回復マイルストーン</span>
        <span className="num">
          {done} <span className="dim">/ {MILESTONES.length}</span>
        </span>
      </p>
    </section>
  );
}
