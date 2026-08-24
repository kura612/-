import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { useNow } from './hooks/useNow';
import { elapsedSince } from './lib/time';
import Onboarding from './components/Onboarding';
import ElapsedHero from './components/ElapsedHero';
import StatGrid from './components/StatGrid';
import MilestoneList from './components/MilestoneList';
import CravingLogger from './components/CravingLogger';
import CravingInsights from './components/CravingInsights';
import CravingList from './components/CravingList';
import Settings from './components/Settings';

type Tab = 'home' | 'cravings' | 'settings';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'home', label: 'ホーム', icon: '🏠' },
  { id: 'cravings', label: '記録', icon: '📊' },
  { id: 'settings', label: '設定', icon: '⚙️' },
];

export default function App() {
  const { profile, cravings, setProfile, addCraving, removeCraving, resetAll } = useAppState();
  const [tab, setTab] = useState<Tab>('home');
  const now = useNow(1000);

  if (!profile) {
    return (
      <div className="app onboarding-screen">
        <header className="brand">
          <h1>
            <span aria-hidden="true">🚭</span> Smokefree
          </h1>
          <p className="muted">吸わなかった時間が、そのまま積み上がっていくアプリ。</p>
        </header>
        <main>
          <Onboarding onSubmit={setProfile} />
        </main>
      </div>
    );
  }

  const { totalMs } = elapsedSince(profile.quitAt, now);

  return (
    <div className="app">
      <header className="brand compact">
        <h1>
          <span aria-hidden="true">🚭</span> Smokefree
        </h1>
      </header>

      <main>
        {tab === 'home' && (
          <>
            <ElapsedHero profile={profile} now={now} />
            <StatGrid profile={profile} cravings={cravings} now={now} />
            <CravingLogger onAdd={addCraving} />
            <MilestoneList elapsedMs={totalMs} />
          </>
        )}

        {tab === 'cravings' && (
          <>
            <CravingLogger onAdd={addCraving} />
            <CravingInsights cravings={cravings} now={now} />
            <CravingList cravings={cravings} onRemove={removeCraving} />
          </>
        )}

        {tab === 'settings' && (
          <Settings
            profile={profile}
            cravings={cravings}
            onSave={setProfile}
            onReset={resetAll}
          />
        )}
      </main>

      <nav className="tabbar" aria-label="メインナビゲーション">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tab${tab === t.id ? ' active' : ''}`}
            aria-current={tab === t.id ? 'page' : undefined}
            onClick={() => setTab(t.id)}
          >
            <span aria-hidden="true">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
