import { useState } from 'react';
import type { Craving, Profile } from '../types';
import Onboarding from './Onboarding';
import Icon from './icons';

type Props = {
  profile: Profile;
  cravings: Craving[];
  onSave: (profile: Profile) => void;
  onReset: () => void;
};

const fmt = new Intl.DateTimeFormat('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export default function Settings({ profile, cravings, onSave, onReset }: Props) {
  const [editing, setEditing] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function exportJson() {
    const blob = new Blob([JSON.stringify({ version: 1, profile, cravings }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smokefree-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (editing) {
    return (
      <Onboarding
        initial={profile}
        submitLabel="保存"
        onSubmit={(p) => {
          onSave(p);
          setEditing(false);
        }}
        onCancel={() => setEditing(false)}
      />
    );
  }

  return (
    <>
      <section className="card">
        <h2 className="section-title">設定</h2>
        <dl className="rows">
          <div>
            <dt>禁煙開始</dt>
            <dd>{fmt.format(new Date(profile.quitAt))}</dd>
          </div>
          <div>
            <dt>1日の本数</dt>
            <dd>
              {profile.cigarettesPerDay}
              <span className="cell-unit">本</span>
            </dd>
          </div>
          <div>
            <dt>1箱</dt>
            <dd>
              {profile.cigarettesPerPack}
              <span className="cell-unit">本</span> / {profile.pricePerPack}
              <span className="cell-unit">円</span>
            </dd>
          </div>
          <div>
            <dt>記録した件数</dt>
            <dd>
              {cravings.length}
              <span className="cell-unit">件</span>
            </dd>
          </div>
        </dl>
        <div className="actions">
          <button type="button" className="btn quiet" onClick={exportJson}>
            <Icon name="download" size={15} />
            書き出す
          </button>
          <button type="button" className="btn solid" onClick={() => setEditing(true)}>
            <Icon name="sliders" size={15} />
            変更する
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="section-title">やり直す</h2>
        <p className="prompt-sub">
          もし吸ってしまっても、そこで終わりではありません。日付をリセットしてまた始められます。
          記録もすべて消えます。
        </p>
        <div className="actions">
          {confirmReset ? (
            <>
              <button type="button" className="btn quiet" onClick={() => setConfirmReset(false)}>
                やめておく
              </button>
              <button type="button" className="btn danger" onClick={onReset}>
                すべて削除する
              </button>
            </>
          ) : (
            <button type="button" className="btn quiet" onClick={() => setConfirmReset(true)}>
              <Icon name="rotate" size={15} />
              データを消してやり直す
            </button>
          )}
        </div>
      </section>

      <p className="footnote center">データはこの端末のブラウザにのみ保存されます。</p>
    </>
  );
}
