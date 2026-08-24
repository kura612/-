import { useMemo, useState } from 'react';
import type { Craving, TriggerId } from '../types';
import { TRIGGERS, copingTip } from '../lib/cravings';
import UrgeTimer from './UrgeTimer';

type Props = { onAdd: (craving: Omit<Craving, 'id'>) => void };

const INTENSITIES: { value: 1 | 2 | 3 | 4 | 5; label: string }[] = [
  { value: 1, label: 'かすか' },
  { value: 2, label: '軽い' },
  { value: 3, label: 'ふつう' },
  { value: 4, label: '強い' },
  { value: 5, label: '限界' },
];

/** 「吸いたい」と思った瞬間に記録するフォーム */
export default function CravingLogger({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [intensity, setIntensity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [trigger, setTrigger] = useState<TriggerId>('stress');
  const [note, setNote] = useState('');
  const [timer, setTimer] = useState(false);
  const [saved, setSaved] = useState<null | boolean>(null);

  // 強さを変えた時だけヒントを引き直す
  const tip = useMemo(() => copingTip(intensity), [intensity]);

  function save(resisted: boolean) {
    onAdd({
      at: new Date().toISOString(),
      intensity,
      trigger,
      resisted,
      note: note.trim() || undefined,
    });
    setNote('');
    setIntensity(3);
    setTimer(false);
    setOpen(false);
    setSaved(resisted);
    window.setTimeout(() => setSaved(null), 4000);
  }

  if (!open) {
    return (
      <section className="card logger-closed">
        <div>
          <h2>吸いたくなったら</h2>
          <p className="muted small">
            その瞬間に記録すると、あとで自分のパターンが見えてきます。
          </p>
          {saved !== null && (
            <p className={`flash ${saved ? 'good' : 'neutral'}`}>
              {saved ? '記録しました。よく耐えました 👏' : '記録しました。次に活かしましょう。'}
            </p>
          )}
        </div>
        <button type="button" className="btn primary big" onClick={() => setOpen(true)}>
          吸いたい気持ちを記録
        </button>
      </section>
    );
  }

  return (
    <section className="card logger">
      <h2>いまの「吸いたい」を記録</h2>

      <p className="field-label">強さ</p>
      <div className="chips">
        {INTENSITIES.map((i) => (
          <button
            key={i.value}
            type="button"
            className={`chip${intensity === i.value ? ' active' : ''}`}
            aria-pressed={intensity === i.value}
            onClick={() => setIntensity(i.value)}
          >
            <span className="chip-num">{i.value}</span>
            {i.label}
          </button>
        ))}
      </div>

      <p className="field-label">きっかけ</p>
      <div className="chips">
        {TRIGGERS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chip${trigger === t.id ? ' active' : ''}`}
            aria-pressed={trigger === t.id}
            onClick={() => setTrigger(t.id)}
          >
            <span aria-hidden="true">{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <label className="note">
        <span className="field-label">メモ（任意）</span>
        <input
          type="text"
          value={note}
          maxLength={120}
          placeholder="どこで、誰と、何をしていた？"
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <p className="tip">💡 {tip}</p>

      {timer ? (
        <UrgeTimer onDone={() => setTimer(false)} />
      ) : (
        <button type="button" className="btn ghost" onClick={() => setTimer(true)}>
          3分やり過ごすタイマーを使う
        </button>
      )}

      <div className="actions">
        <button type="button" className="btn ghost" onClick={() => setOpen(false)}>
          閉じる
        </button>
        <button type="button" className="btn subtle" onClick={() => save(false)}>
          吸ってしまった
        </button>
        <button type="button" className="btn primary" onClick={() => save(true)}>
          吸わずに乗り切った
        </button>
      </div>
    </section>
  );
}
