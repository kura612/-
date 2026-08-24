import type { Craving, Profile } from '../types';
import { calcSavings, formatNumber, formatYen, savingsPerDays } from '../lib/stats';
import { elapsedSince, humanizeDuration } from '../lib/time';
import { resistRate } from '../lib/cravings';

type Props = { profile: Profile; cravings: Craving[]; now: number };

/** 節約金額・吸わなかった本数・取り戻した時間・欲求に打ち勝った率 */
export default function StatGrid({ profile, cravings, now }: Props) {
  const { totalMs } = elapsedSince(profile.quitAt, now);
  const s = calcSavings(profile, totalMs);
  const rate = resistRate(cravings);

  return (
    <section className="stat-grid">
      <Stat
        icon="💰"
        label="節約できた金額"
        value={formatYen(s.moneySaved)}
        sub={`1ヶ月で ${formatYen(savingsPerDays(profile, 30))} のペース`}
        accent="money"
      />
      <Stat
        icon="🚭"
        label="吸わずに済んだ本数"
        value={`${formatNumber(s.cigarettesAvoided)} 本`}
        sub={`約 ${formatNumber(s.cigarettesAvoided / profile.cigarettesPerPack)} 箱ぶん`}
        accent="cigs"
      />
      <Stat
        icon="⏳"
        label="取り戻した時間"
        value={humanizeDuration(s.timeRegainedMs)}
        sub="1本5分として計算"
        accent="time"
      />
      <Stat
        icon="🛡️"
        label="欲求に打ち勝った率"
        value={rate === null ? '—' : `${Math.round(rate * 100)}%`}
        sub={rate === null ? 'まだ記録がありません' : `${cravings.length} 件の記録から`}
        accent="win"
      />
    </section>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <div className={`card stat stat-${accent}`}>
      <span className="stat-icon" aria-hidden="true">
        {icon}
      </span>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      <p className="muted small">{sub}</p>
    </div>
  );
}
