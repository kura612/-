import type { AppState } from '../types';

const KEY = 'smokefree.state.v1';

export const emptyState: AppState = { version: 1, profile: null, cravings: [] };

/**
 * localStorage から状態を読む。壊れた値や別バージョンが入っていても
 * アプリが起動しなくならないよう、読めなければ初期状態に倒す。
 */
export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<AppState>;
    if (parsed?.version !== 1) return emptyState;
    return {
      version: 1,
      profile: parsed.profile ?? null,
      cravings: Array.isArray(parsed.cravings) ? parsed.cravings : [],
    };
  } catch {
    return emptyState;
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // プライベートブラウジングなどで書き込めない場合は保存を諦める
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 同上
  }
}
