import { describe, expect, it } from 'vitest';
import { DAY, HOUR, MINUTE, elapsedSince, humanizeDuration, isSameDay } from './time';
import { calcSavings, savingsPerDays } from './stats';
import { achievedCount, milestoneProgress, nextMilestone } from './milestones';
import { byHour, byTrigger, dailyCounts, resistRate } from './cravings';
import type { Craving, Profile } from '../types';

const profile: Profile = {
  quitAt: '2026-01-01T00:00:00.000Z',
  cigarettesPerDay: 20,
  cigarettesPerPack: 20,
  pricePerPack: 600,
};

const quitAtMs = Date.parse(profile.quitAt);

describe('elapsedSince', () => {
  it('日/時/分/秒に分解する', () => {
    const now = quitAtMs + 3 * DAY + 4 * HOUR + 5 * MINUTE + 6000;
    expect(elapsedSince(profile.quitAt, now)).toMatchObject({
      days: 3,
      hours: 4,
      minutes: 5,
      seconds: 6,
    });
  });

  it('開始が未来でも負にならない', () => {
    expect(elapsedSince(profile.quitAt, quitAtMs - DAY).totalMs).toBe(0);
  });

  it('壊れた日時でも落ちない', () => {
    expect(elapsedSince('not-a-date', Date.now()).totalMs).toBe(0);
  });
});

describe('humanizeDuration', () => {
  it('単位を切り替える', () => {
    expect(humanizeDuration(30_000)).toBe('30秒');
    expect(humanizeDuration(5 * MINUTE)).toBe('5分');
    expect(humanizeDuration(2 * HOUR + 30 * MINUTE)).toBe('2時間 30分');
    expect(humanizeDuration(3 * DAY)).toBe('3日');
    expect(humanizeDuration(3 * DAY + 4 * HOUR)).toBe('3日 4時間');
  });
});

describe('isSameDay', () => {
  it('同じ日付なら true', () => {
    expect(isSameDay(new Date(2026, 0, 1, 0, 0), new Date(2026, 0, 1, 23, 59))).toBe(true);
    expect(isSameDay(new Date(2026, 0, 1), new Date(2026, 0, 2))).toBe(false);
  });
});

describe('calcSavings', () => {
  it('1日で1箱ぶんの金額を節約する', () => {
    const s = calcSavings(profile, DAY);
    expect(s.cigarettesAvoided).toBeCloseTo(20);
    expect(s.moneySaved).toBeCloseTo(600);
    expect(s.timeRegainedMs).toBeCloseTo(20 * 5 * MINUTE);
  });

  it('半日なら半分', () => {
    expect(calcSavings(profile, DAY / 2).moneySaved).toBeCloseTo(300);
  });

  it('1箱の本数が0でもNaNにならない', () => {
    const s = calcSavings({ ...profile, cigarettesPerPack: 0 }, DAY);
    expect(Number.isFinite(s.moneySaved)).toBe(true);
  });

  it('30日ぶんの節約ペースを出せる', () => {
    expect(savingsPerDays(profile, 30)).toBeCloseTo(18000);
  });
});

describe('milestones', () => {
  it('経過に応じて達成数が増える', () => {
    expect(achievedCount(0)).toBe(0);
    expect(achievedCount(21 * MINUTE)).toBe(1);
    expect(achievedCount(3 * DAY)).toBe(5);
  });

  it('次のマイルストーンと残り時間を返す', () => {
    const next = nextMilestone(10 * MINUTE);
    expect(next?.milestone.label).toBe('20分');
    expect(next?.remainingMs).toBe(10 * MINUTE);
  });

  it('進捗は0〜1に収まる', () => {
    for (const p of milestoneProgress(2 * DAY)) {
      expect(p.ratio).toBeGreaterThanOrEqual(0);
      expect(p.ratio).toBeLessThanOrEqual(1);
    }
  });

  it('全達成なら次はない', () => {
    expect(nextMilestone(100 * 365 * DAY)).toBeNull();
  });
});

describe('cravings', () => {
  const at = (d: Date) => d.toISOString();
  const base = new Date(2026, 5, 15, 12, 0, 0);
  const list: Craving[] = [
    { id: '1', at: at(base), intensity: 4, trigger: 'stress', resisted: true },
    { id: '2', at: at(new Date(2026, 5, 15, 9, 0)), intensity: 2, trigger: 'coffee', resisted: true },
    { id: '3', at: at(new Date(2026, 5, 14, 12, 0)), intensity: 5, trigger: 'stress', resisted: false },
  ];

  it('乗り切った率を出す', () => {
    expect(resistRate(list)).toBeCloseTo(2 / 3);
    expect(resistRate([])).toBeNull();
  });

  it('きっかけを多い順に集計する', () => {
    expect(byTrigger(list)[0]).toEqual({ id: 'stress', count: 2 });
  });

  it('時間帯を24分割で集計する', () => {
    const hours = byHour(list);
    expect(hours).toHaveLength(24);
    expect(hours[12]).toBe(2);
    expect(hours[9]).toBe(1);
  });

  it('直近7日の日別件数を古い順に返す', () => {
    const daily = dailyCounts(list, 7, base.getTime());
    expect(daily).toHaveLength(7);
    expect(daily.at(-1)?.count).toBe(2);
    expect(daily.at(-2)?.count).toBe(1);
  });
});
