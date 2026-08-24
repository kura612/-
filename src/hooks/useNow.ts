import { useEffect, useState } from 'react';

/** 一定間隔で現在時刻 (epoch ms) を更新して返す。カウンタの再描画に使う。 */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    // タブに戻ってきた時は次のtickを待たずに追いつく
    const onVisible = () => setNow(Date.now());
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [intervalMs]);

  return now;
}
