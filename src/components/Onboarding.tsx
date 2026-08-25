import { useState } from 'react';
import type { Profile } from '../types';
import { toLocalInputValue } from '../lib/time';
import { formatNumber, savingsPerDays } from '../lib/stats';

type Props = {
  initial?: Profile | null;
  submitLabel?: string;
  onSubmit: (profile: Profile) => void;
  onCancel?: () => void;
};

/** 初回セットアップ兼、設定の編集フォーム */
export default function Onboarding({
  initial,
  submitLabel = 'はじめる',
  onSubmit,
  onCancel,
}: Props) {
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
      className="card form"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(draft);
      }}
    >
      <h2 className="section-title">{initial ? '設定' : 'はじめる前に'}</h2>

      <label className="field">
        <span className="eyebrow">禁煙を始めた日時</span>
        <input
          type="datetime-local"
          value={quitAt}
          max={toLocalInputValue(new Date())}
          onChange={(e) => setQuitAt(e.target.value)}
          required
        />
      </label>
      {future && <p className="error">未来の日時は設定できません。</p>}

      <div className="field-row">
        <label className="field">
          <span className="eyebrow">1日の本数</span>
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
        <label className="field">
          <span className="eyebrow">1箱の本数</span>
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

      <label className="field">
        <span className="eyebrow">1箱の価格（円）</span>
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
        <dl className="preview">
          <div>
            <dt className="eyebrow">1ヶ月で</dt>
            <dd>
              {formatNumber(savingsPerDays(draft, 30))}
              <span className="cell-unit">円</span>
            </dd>
          </div>
          <div>
            <dt className="eyebrow">1年で</dt>
            <dd>
              {formatNumber(savingsPerDays(draft, 365))}
              <span className="cell-unit">円</span>
            </dd>
          </div>
        </dl>
      )}

      <div className="actions">
        {onCancel && (
          <button type="button" className="btn quiet" onClick={onCancel}>
            キャンセル
          </button>
        )}
        <button type="submit" className="btn solid" disabled={!valid}>
          {submitLabel}
        </button>
      </div>

      <p className="footnote">
        入力した内容はこの端末のブラウザにだけ保存されます。外部には送信されません。
      </p>
    </form>
  );
}
