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
import Icon from './icons';

type Props = { cravings: Craving[]; now: number };

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

/** 記録が溜まると見えてくる、自分のクレービングの傾向 */
export default function CravingInsights({ cravings, now }: Props) {
  if (cravings.length === 0) {
    return (
      <section className="card empty">
        <Icon name="chart" size={22} />
        <p className="empty-title">まだ記録がありません</p>
        <p className="empty-sub">
          「吸いたい」と思った時に記録すると、時間帯やきっかけの傾向がここに出ます。
        </p>
      </section>
    );
  }

  const week = cravingsWithinDays(cravings, 7, now);
  const scope = week.length > 0 ? week : cravings;
  const today = cravingsToday(cravings, now);
  const rate = resistRate(cravings) ?? 0;
  const hours = byHour(scope);
  const peakHour = hours.indexOf(Math.max(...hours));
  const triggers = byTrigger(scope);
  const daily = dailyCounts(cravings, 7, now);
  const maxDaily = Math.max(1, ...daily.map((d) => d.count));
  const maxHour = Math.max(1, ...hours);

  return (
    <>
      <section className="card panel three">
        <Fact value={String(today.length)} unit="件" label="今日" />
        <Fact value={String(week.length)} unit="件" label="直近7日" />
        <Fact value={String(Math.round(rate * 100))} unit="%" label="乗り切れた率" />
      </section>

      <section className="card">
        <h2 className="section-title">直近7日</h2>
        <div className="daily-chart">
          {daily.map((d, i) => {
            const isToday = i === daily.length - 1;
            return (
              <div key={d.date.toDateString()} className="daily-col">
                <span className={`daily-count${d.count === 0 ? ' zero' : ''}`}>{d.count}</span>
                <div className="daily-track">
                  <div
                    className={`daily-bar${isToday ? ' today' : ''}`}
                    style={{ height: `${Math.max(2, (d.count / maxDaily) * 100)}%` }}
                  />
                </div>
                <span className={`daily-day${isToday ? ' today' : ''}`}>
                  {WEEKDAYS[d.date.getDay()]}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">
          時間帯
          <span className="section-note">{week.length > 0 ? '直近7日' : '全期間'}</span>
        </h2>
        <div className="hour-chart">
          {hours.map((count, h) => (
            <div key={h} className="hour-col" title={`${h}時 — ${count}件`}>
              <div
                className={`hour-bar${count > 0 ? ' has' : ''}${h === peakHour && count > 0 ? ' peak' : ''}`}
                style={{ height: `${count > 0 ? Math.max(12, (count / maxHour) * 100) : 3}%` }}
              />
            </div>
          ))}
        </div>
        <div className="hour-axis">
          <span>0</span>
          <span>6</span>
          <span>12</span>
          <span>18</span>
          <span>23</span>
        </div>
        {hours[peakHour] > 0 && (
          <p className="insight-note">
            多いのは <strong>{peakHour}時台</strong>。その時間に別の予定を先回りして入れておくと
            乗り切りやすくなります。
          </p>
        )}
      </section>

      <section className="card">
        <h2 className="section-title">きっかけ</h2>
        <ul className="trigger-list">
          {triggers.map((t) => (
            <li key={t.id}>
              <span className="trigger-name">
                <Icon name={triggerIcon(t.id)} size={15} />
                {triggerLabel(t.id)}
              </span>
              <span className="meter">
                <span
                  className="meter-fill"
                  style={{ width: `${(t.count / triggers[0].count) * 100}%` }}
                />
              </span>
              <span className="trigger-count">{t.count}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function Fact({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="cell fact">
      <p className="cell-value">
        {value}
        <span className="cell-unit">{unit}</span>
      </p>
      <p className="eyebrow">{label}</p>
    </div>
  );
}
