import { useState } from 'react';
import type { Craving, Profile } from '../types';
import Onboarding from './Onboarding';

type Props = {
  profile: Profile;
  cravings: Craving[];
  onSave: (profile: Profile) => void;
  onReset: () => void;
};

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
        submitLabel="保存する"
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
        <h2>設定</h2>
        <dl className="settings-list">
          <div>
            <dt>禁煙開始</dt>
            <dd>{new Date(profile.quitAt).toLocaleString('ja-JP')}</dd>
          </div>
          <div>
            <dt>1日の本数</dt>
            <dd>{profile.cigarettesPerDay} 本</dd>
          </div>
          <div>
            <dt>1箱</dt>
            <dd>
              {profile.cigarettesPerPack} 本 / {profile.pricePerPack} 円
            </dd>
          </div>
        </dl>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={exportJson}>
            データを書き出す (JSON)
          </button>
          <button type="button" className="btn primary" onClick={() => setEditing(true)}>
            設定を変更
          </button>
        </div>
      </section>

      <section className="card danger">
        <h2>やり直す</h2>
        <p className="muted small">
          もし吸ってしまっても、そこで終わりではありません。日付をリセットしてまた始められます。
          記録もすべて消えます。
        </p>
        {confirmReset ? (
          <div className="actions">
            <button type="button" className="btn ghost" onClick={() => setConfirmReset(false)}>
              やめておく
            </button>
            <button type="button" className="btn danger" onClick={onReset}>
              本当にすべて削除する
            </button>
          </div>
        ) : (
          <div className="actions">
            <button type="button" className="btn subtle" onClick={() => setConfirmReset(true)}>
              すべてのデータを削除してやり直す
            </button>
          </div>
        )}
      </section>

      <p className="muted small center">
        データはこの端末のブラウザ (localStorage) にのみ保存されます。
      </p>
    </>
  );
}
