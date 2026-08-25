import type { IconName } from '../components/icons';
import type { Craving, TriggerId } from '../types';
import { DAY, isSameDay } from './time';

export const TRIGGERS: { id: TriggerId; label: string; icon: IconName }[] = [
  { id: 'after-meal', label: '食後', icon: 'utensils' },
  { id: 'coffee', label: 'コーヒー・お茶', icon: 'coffee' },
  { id: 'alcohol', label: 'お酒', icon: 'glass' },
  { id: 'stress', label: 'ストレス', icon: 'flame' },
  { id: 'boredom', label: '退屈', icon: 'cloud' },
  { id: 'social', label: '人付き合い', icon: 'users' },
  { id: 'wake-up', label: '起きてすぐ', icon: 'sunrise' },
  { id: 'break', label: '休憩中', icon: 'sofa' },
  { id: 'other', label: 'その他', icon: 'sparkle' },
];

export function triggerLabel(id: TriggerId): string {
  return TRIGGERS.find((t) => t.id === id)?.label ?? 'その他';
}

export function triggerIcon(id: TriggerId): IconName {
  return TRIGGERS.find((t) => t.id === id)?.icon ?? 'sparkle';
}

/** 欲求に打ち勝てた割合 (0〜1)。記録が無ければ null。 */
export function resistRate(cravings: Craving[]): number | null {
  if (cravings.length === 0) return null;
  return cravings.filter((c) => c.resisted).length / cravings.length;
}

export function cravingsToday(cravings: Craving[], now: number): Craving[] {
  const today = new Date(now);
  return cravings.filter((c) => isSameDay(new Date(c.at), today));
}

export function cravingsWithinDays(cravings: Craving[], days: number, now: number): Craving[] {
  const from = now - days * DAY;
  return cravings.filter((c) => Date.parse(c.at) >= from);
}

/** きっかけ別の件数を多い順に返す */
export function byTrigger(cravings: Craving[]): { id: TriggerId; count: number }[] {
  const counts = new Map<TriggerId, number>();
  for (const c of cravings) counts.set(c.trigger, (counts.get(c.trigger) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count);
}

/** 0〜23時の時間帯ごとの件数 (常に長さ 24 の配列) */
export function byHour(cravings: Craving[]): number[] {
  const hours = new Array(24).fill(0) as number[];
  for (const c of cravings) {
    const d = new Date(c.at);
    if (!Number.isNaN(d.getTime())) hours[d.getHours()] += 1;
  }
  return hours;
}

/** 直近 days 日ぶんの日別件数を古い順に返す */
export function dailyCounts(
  cravings: Craving[],
  days: number,
  now: number,
): { date: Date; count: number }[] {
  const result: { date: Date; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * DAY);
    const count = cravings.filter((c) => isSameDay(new Date(c.at), date)).length;
    result.push({ date, count });
  }
  return result;
}

/** 欲求をやり過ごすためのヒント。強さに応じて出し分ける。 */
export function copingTip(intensity: number): string {
  const light = [
    'コップ一杯の水をゆっくり飲んでみましょう。',
    '深呼吸を5回。吸うより長く吐くのがコツです。',
    '席を立って、少しだけ体を動かしてみましょう。',
  ];
  const strong = [
    '欲求のピークは3〜5分。タイマーが終わるまで待てば必ず弱まります。',
    '「なぜ禁煙を始めたか」を思い出して、1つ声に出してみましょう。',
    '手を冷たい水で洗う・歯を磨くなど、口と手を別のことで塞ぎましょう。',
    '今いる場所から離れて、外の空気を吸ってきましょう。',
  ];
  const pool = intensity >= 4 ? strong : light;
  return pool[Math.floor(Math.random() * pool.length)];
}
