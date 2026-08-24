export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

export type Elapsed = {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** 開始日時から now までの経過を日/時/分/秒に分解する。未来の日時なら 0 に丸める。 */
export function elapsedSince(startIso: string, now: number): Elapsed {
  const start = Date.parse(startIso);
  const totalMs = Number.isNaN(start) ? 0 : Math.max(0, now - start);
  return {
    totalMs,
    days: Math.floor(totalMs / DAY),
    hours: Math.floor((totalMs % DAY) / HOUR),
    minutes: Math.floor((totalMs % HOUR) / MINUTE),
    seconds: Math.floor((totalMs % MINUTE) / 1000),
  };
}

/** ミリ秒を「3日 4時間」「12分」のような読みやすい日本語にする。 */
export function humanizeDuration(ms: number): string {
  if (ms < MINUTE) return `${Math.floor(ms / 1000)}秒`;
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)}分`;
  if (ms < DAY) {
    const h = Math.floor(ms / HOUR);
    const m = Math.floor((ms % HOUR) / MINUTE);
    return m > 0 ? `${h}時間 ${m}分` : `${h}時間`;
  }
  const d = Math.floor(ms / DAY);
  const h = Math.floor((ms % DAY) / HOUR);
  return h > 0 ? `${d}日 ${h}時間` : `${d}日`;
}

/** input[type=datetime-local] 用のローカル時刻文字列 (YYYY-MM-DDTHH:mm) */
export function toLocalInputValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

/** 同じ日付か (ローカルタイム基準) */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
