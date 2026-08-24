import type { Profile } from '../types';
import { DAY, MINUTE } from './time';

/** 1本吸うのにかかる時間の目安 (分)。「取り戻した時間」の計算に使う。 */
export const MINUTES_PER_CIGARETTE = 5;

export type Savings = {
  /** 吸わずに済んだ本数 (小数を含む理論値) */
  cigarettesAvoided: number;
  /** 節約できた金額 (円) */
  moneySaved: number;
  /** 喫煙に使わずに済んだ時間 (ms) */
  timeRegainedMs: number;
  /** 1本あたりの単価 (円) */
  pricePerCigarette: number;
};

/**
 * 経過時間と喫煙習慣から、吸わずに済んだ本数・節約金額・取り戻した時間を求める。
 * 1箱の本数や価格が 0 以下でも NaN を返さないようガードする。
 */
export function calcSavings(profile: Profile, elapsedMs: number): Savings {
  const perDay = Math.max(0, profile.cigarettesPerDay);
  const perPack = profile.cigarettesPerPack > 0 ? profile.cigarettesPerPack : 20;
  const pricePerCigarette = Math.max(0, profile.pricePerPack) / perPack;
  const cigarettesAvoided = (Math.max(0, elapsedMs) / DAY) * perDay;

  return {
    cigarettesAvoided,
    moneySaved: cigarettesAvoided * pricePerCigarette,
    timeRegainedMs: cigarettesAvoided * MINUTES_PER_CIGARETTE * MINUTE,
    pricePerCigarette,
  };
}

/** 指定した期間 (日数) あたりの節約ペース (円) */
export function savingsPerDays(profile: Profile, days: number): number {
  return calcSavings(profile, days * DAY).moneySaved;
}

const yen = new Intl.NumberFormat('ja-JP', {
  style: 'currency',
  currency: 'JPY',
  maximumFractionDigits: 0,
});

export function formatYen(value: number): string {
  return yen.format(Math.floor(value));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ja-JP').format(Math.floor(value));
}
