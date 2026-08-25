import type { Craving, Profile } from '../types';
import { calcSavings, formatNumber, savingsPerDays } from '../lib/stats';
import { elapsedSince, humanizeDuration } from '../lib/time';
import { resistRate } from '../lib/cravings';
import Icon, { type IconName } from './icons';

type Props = { profile: Profile; cravings: Craving[]; now: number };

/** 節約金額・本数・取り戻した時間・乗り切れた率を並べた計器パネル */
export default function StatGrid({ profile, cravings, now }: Props) {
  const { totalMs } = elapsedSince(profile.quitAt, now);
  const s = calcSavings(profile, totalMs);
  const rate = resistRate(cravings);

  return (
    <section className="card panel">
      <Cell
        icon="coin"
        label="節約できた金額"
        value={formatNumber(s.moneySaved)}
        unit="円"
        sub={`1ヶ月あたり ${formatNumber(savingsPerDays(profile, 30))} 円`}
      />
      <Cell
        icon="nosmoke"
        label="吸わずに済んだ"
        value={formatNumber(s.cigarettesAvoided)}
        unit="本"
        sub={`約 ${formatNumber(s.cigarettesAvoided / profile.cigarettesPerPack)} 箱ぶん`}
      />
      <Cell
        icon="hourglass"
        label="取り戻した時間"
        value={humanizeDuration(s.timeRegainedMs)}
        sub="1本5分として計算"
      />
      <Cell
        icon="target"
        label="乗り切れた率"
        value={rate === null ? '—' : String(Math.round(rate * 100))}
        unit={rate === null ? undefined : '%'}
        sub={rate === null ? 'まだ記録がありません' : `${cravings.length} 件の記録から`}
      />
    </section>
  );
}

function Cell({
  icon,
  label,
  value,
  unit,
  sub,
}: {
  icon: IconName;
  label: string;
  value: string;
  unit?: string;
  sub: string;
}) {
  return (
    <div className="cell">
      <p className="cell-head">
        <Icon name={icon} size={15} />
        <span className="eyebrow">{label}</span>
      </p>
      <p className="cell-value">
        {value}
        {unit && <span className="cell-unit">{unit}</span>}
      </p>
      <p className="cell-sub">{sub}</p>
    </div>
  );
}
