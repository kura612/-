import { useEffect, useState } from 'react';

const TOTAL = 180; // 欲求のピークは3〜5分と言われるので3分
const CYCLE = 8; // 4秒吸って4秒吐く

type Props = { onDone: () => void };

/** 欲求をやり過ごす3分タイマー。呼吸のリズムを合わせて表示する。 */
export default function UrgeTimer({ onDone }: Props) {
  const [left, setLeft] = useState(TOTAL);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          window.clearInterval(id);
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsed = TOTAL - left;
  const inhale = elapsed % CYCLE < CYCLE / 2;
  const ratio = elapsed / TOTAL;
  const finished = left === 0;

  return (
    <div className="urge-timer">
      <div className={`breath ${inhale ? 'in' : 'out'}`} aria-hidden="true" />
      <p className="breath-text" aria-live="polite">
        {finished ? '乗り切りました' : inhale ? 'ゆっくり吸って…' : 'ゆっくり吐いて…'}
      </p>
      <p className="countdown">
        {String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}
      </p>
      <div className="bar">
        <div className="bar-fill" style={{ width: `${ratio * 100}%` }} />
      </div>
      <button type="button" className="btn ghost" onClick={onDone}>
        {finished ? '閉じる' : 'タイマーを閉じる'}
      </button>
    </div>
  );
}
