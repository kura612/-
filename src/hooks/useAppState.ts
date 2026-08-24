import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AppState, Craving, Profile } from '../types';
import { clearState, loadState, saveState } from '../lib/storage';

/** アプリ全体の状態。変更のたびに localStorage へ書き戻す。 */
export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());

  useEffect(() => {
    saveState(state);
  }, [state]);

  const setProfile = useCallback((profile: Profile) => {
    setState((s) => ({ ...s, profile }));
  }, []);

  const addCraving = useCallback((craving: Omit<Craving, 'id'>) => {
    setState((s) => ({
      ...s,
      cravings: [{ ...craving, id: crypto.randomUUID() }, ...s.cravings],
    }));
  }, []);

  const removeCraving = useCallback((id: string) => {
    setState((s) => ({ ...s, cravings: s.cravings.filter((c) => c.id !== id) }));
  }, []);

  const resetAll = useCallback(() => {
    clearState();
    setState({ version: 1, profile: null, cravings: [] });
  }, []);

  // 記録は新しい順で保持する
  const cravings = useMemo(
    () => [...state.cravings].sort((a, b) => Date.parse(b.at) - Date.parse(a.at)),
    [state.cravings],
  );

  return { profile: state.profile, cravings, setProfile, addCraving, removeCraving, resetAll };
}
