import { useMemo, useState } from 'react';
import type { Craving, TriggerId } from '../types';
import { TRIGGERS, copingTip } from '../lib/cravings';
import Icon from './icons';
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
      <section className="card prompt">
        <div className="prompt-text">
          <p className="prompt-title">吸いたくなったら</p>
          <p className="prompt-sub">
            {saved === null
              ? 'その瞬間に記録すると、自分のパターンが見えてきます。'
              : saved
                ? '記録しました。よく耐えました。'
                : '記録しました。次に活かしましょう。'}
          </p>
        </div>
        <button type="button" className="btn solid" onClick={() => setOpen(true)}>
          <Icon name="plus" size={16} />
          記録する
        </button>
      </section>
    );
  }

  return (
    <section className="card logger">
      <div className="logger-head">
        <h2 className="section-title">いまの「吸いたい」</h2>
        <button
          type="button"
          className="icon-btn"
          aria-label="閉じる"
          onClick={() => setOpen(false)}
        >
          <Icon name="close" size={16} />
        </button>
      </div>

      <p className="eyebrow">強さ</p>
      <div className="segmented" role="group" aria-label="欲求の強さ">
        {INTENSITIES.map((i) => (
          <button
            key={i.value}
            type="button"
            className={`segment${intensity === i.value ? ' active' : ''}`}
            aria-pressed={intensity === i.value}
            onClick={() => setIntensity(i.value)}
          >
            <span className="segment-num">{i.value}</span>
            <span className="segment-label">{i.label}</span>
          </button>
        ))}
      </div>

      <p className="eyebrow">きっかけ</p>
      <div className="chips">
        {TRIGGERS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`chip${trigger === t.id ? ' active' : ''}`}
            aria-pressed={trigger === t.id}
            onClick={() => setTrigger(t.id)}
          >
            <Icon name={t.icon} size={15} />
            {t.label}
          </button>
        ))}
      </div>

      <label className="field">
        <span className="eyebrow">メモ（任意）</span>
        <input
          type="text"
          value={note}
          maxLength={120}
          placeholder="どこで、誰と、何をしていた？"
          onChange={(e) => setNote(e.target.value)}
        />
      </label>

      <p className="tip">
        <Icon name="bulb" size={15} />
        <span>{tip}</span>
      </p>

      {timer ? (
        <UrgeTimer onDone={() => setTimer(false)} />
      ) : (
        <button type="button" className="btn quiet wide" onClick={() => setTimer(true)}>
          3分やり過ごすタイマー
        </button>
      )}

      <div className="actions">
        <button type="button" className="btn quiet" onClick={() => save(false)}>
          吸ってしまった
        </button>
        <button type="button" className="btn solid" onClick={() => save(true)}>
          吸わずに乗り切った
        </button>
      </div>
    </section>
  );
}
