import { useState } from 'react';
import type { Profile } from '../types';
import { toLocalInputValue } from '../lib/time';
import { formatYen, savingsPerDays } from '../lib/stats';

type Props = {
  initial?: Profile | null;
  submitLabel?: string;
  onSubmit: (profile: Profile) => void;
  onCancel?: () => void;
};

/** 初回セットアップ兼、設定の編集フォーム */
export default function Onboarding({ initial, submitLabel = '禁煙をはじめる', onSubmit, onCancel }: Props) {
  const [quitAt, setQuitAt] = useState(() =>
    toLocalInputValue(initial ? new Date(initial.quitAt) : new Date()),
  );
  const [cigarettesPerDay, setPerDay] = useState(String(initial?.cigarettesPerDay ?? 20));
  const [cigarettesPerPack, setPerPack] = useState(String(initial?.cigarettesPerPack ?? 20));
  const [pricePerPack, setPrice] = useState(String(initial?.pricePerPack ?? 600));

  const draft: Profile = {
    quitAt: new Date(quitAt || Date.now()).toISOString(),
    cigarettesPerDay: Number(cigarettesPerDay) || 0,
    cigarettesPerPack: Number(cigarettesPerPack) || 20,
    pricePerPack: Number(pricePerPack) || 0,
  };

  const future = Date.parse(draft.quitAt) > Date.now() + 60_000;
  const valid = draft.cigarettesPerDay > 0 && draft.pricePerPack > 0 && !future;

  return (
    <form
      className="card onboarding"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(draft);
      }}
    >
      <h2>{initial ? '設定を変更' : 'はじめる前に'}</h2>
      <p className="muted">
        入力した内容はこの端末のブラウザにだけ保存されます。サーバーには何も送信されません。
      </p>

      <label>
        <span>禁煙を始めた（始める）日時</span>
        <input
          type="datetime-local"
          value={quitAt}
          max={toLocalInputValue(new Date())}
          onChange={(e) => setQuitAt(e.target.value)}
          required
        />
      </label>
      {future && <p className="error">未来の日時は設定できません。</p>}

      <div className="grid-2">
        <label>
          <span>1日の本数</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={200}
            value={cigarettesPerDay}
            onChange={(e) => setPerDay(e.target.value)}
            required
          />
        </label>
        <label>
          <span>1箱の本数</span>
          <input
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            value={cigarettesPerPack}
            onChange={(e) => setPerPack(e.target.value)}
            required
          />
        </label>
      </div>

      <label>
        <span>1箱の価格（円）</span>
        <input
          type="number"
          inputMode="numeric"
          min={1}
          max={10000}
          value={pricePerPack}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </label>

      {valid && (
        <p className="preview">
          この習慣なら <strong>{formatYen(savingsPerDays(draft, 30))}</strong> / 月、
          <strong>{formatYen(savingsPerDays(draft, 365))}</strong> / 年を吸わずに残せます。
        </p>
      )}

      <div className="actions">
        {onCancel && (
          <button type="button" className="btn ghost" onClick={onCancel}>
            キャンセル
          </button>
        )}
        <button type="submit" className="btn primary" disabled={!valid}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
