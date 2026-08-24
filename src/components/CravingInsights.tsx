import type { Craving } from '../types';
import {
  byHour,
  byTrigger,
  cravingsToday,
  cravingsWithinDays,
  dailyCounts,
  resistRate,
  triggerIcon,
  triggerLabel,
} from '../lib/cravings';

type Props = { cravings: Craving[]; now: number };

/** 記録が溜まってきたら見えてくる、自分のクレービングの傾向 */
export default function CravingInsights({ cravings, now }: Props) {
  if (cravings.length === 0) {
    return (
      <section className="card empty">
        <p className="empty-icon" aria-hidden="true">
          📊
        </p>
        <p>まだ記録がありません。</p>
        <p className="muted small">
          「吸いたい」と思った時に記録すると、時間帯やきっかけの傾向がここに表示されます。
        </p>
      </section>
    );
  }

  const week = cravingsWithinDays(cravings, 7, now);
  const today = cravingsToday(cravings, now);
  const rate = resistRate(cravings) ?? 0;
  const hours = byHour(week.length > 0 ? week : cravings);
  const peakHour = hours.indexOf(Math.max(...hours));
  const triggers = byTrigger(week.length > 0 ? week : cravings);
  const daily = dailyCounts(cravings, 7, now);
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const maxHour = Math.max(1, ...hours);

  return (
    <section className="card">
      <h2>あなたの傾向</h2>

      <div className="insight-row">
        <Fact value={`${today.length} 件`} label="今日の記録" />
        <Fact value={`${week.length} 件`} label="直近7日" />
        <Fact value={`${Math.round(rate * 100)}%`} label="乗り切れた率" />
      </div>

      <p className="field-label">直近7日の件数</p>
      <div className="daily-chart">
        {daily.map((d) => (
          <div key={d.date.toDateString()} className="daily-col">
            <div className="daily-bar-wrap">
              <div
                className="daily-bar"
                style={{ height: `${(d.count / maxDaily) * 100}%` }}
                title={`${d.count} 件`}
              />
            </div>
            <span className="muted small">{d.date.getDate()}</span>
          </div>
        ))}
      </div>

      <p className="field-label">時間帯（{week.length > 0 ? '直近7日' : '全期間'}）</p>
      <div className="hour-chart">
        {hours.map((count, h) => (
          <div
            key={h}
            className={`hour-cell${count > 0 ? ' has' : ''}`}
            style={{ opacity: count > 0 ? 0.35 + (count / maxHour) * 0.65 : undefined }}
            title={`${h}時: ${count} 件`}
          />
        ))}
      </div>
      <div className="hour-axis muted small">
        <span>0時</span>
        <span>6時</span>
        <span>12時</span>
        <span>18時</span>
        <span>23時</span>
      </div>
      {hours[peakHour] > 0 && (
        <p className="muted small">
          いちばん多いのは <strong>{peakHour}時台</strong> です。その時間の予定を先回りして
          埋めておくと乗り切りやすくなります。
        </p>
      )}

      <p className="field-label">きっかけ</p>
      <ul className="trigger-list">
        {triggers.map((t) => (
          <li key={t.id}>
            <span className="trigger-name">
              <span aria-hidden="true">{triggerIcon(t.id)}</span> {triggerLabel(t.id)}
            </span>
            <span className="bar">
              <span
                className="bar-fill"
                style={{ width: `${(t.count / triggers[0].count) * 100}%` }}
              />
            </span>
            <span className="muted small">{t.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Fact({ value, label }: { value: string; label: string }) {
  return (
    <div className="fact">
      <p className="fact-value">{value}</p>
      <p className="muted small">{label}</p>
    </div>
  );
}
