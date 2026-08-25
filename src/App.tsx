import { useState } from 'react';
import { useAppState } from './hooks/useAppState';
import { useNow } from './hooks/useNow';
import { elapsedSince } from './lib/time';
import Icon, { type IconName } from './components/icons';
import Onboarding from './components/Onboarding';
import ElapsedHero from './components/ElapsedHero';
import StatGrid from './components/StatGrid';
import MilestoneList from './components/MilestoneList';
import CravingLogger from './components/CravingLogger';
import CravingInsights from './components/CravingInsights';
import CravingList from './components/CravingList';
import Settings from './components/Settings';

type Tab = 'home' | 'cravings' | 'settings';

const TABS: { id: Tab; label: string; icon: IconName }[] = [
  { id: 'home', label: 'ホーム', icon: 'home' },
  { id: 'cravings', label: '記録', icon: 'chart' },
  { id: 'settings', label: '設定', icon: 'sliders' },
];

export default function App() {
  const { profile, cravings, setProfile, addCraving, removeCraving, resetAll } = useAppState();
  const [tab, setTab] = useState<Tab>('home');
  const now = useNow(1000);

  if (!profile) {
    return (
      <div className="app intro">
        <header className="masthead">
          <p className="wordmark">
            <Icon name="nosmoke" size={17} />
            Smokefree
          </p>
          <h1 className="intro-title">
            吸わなかった時間が、
            <br />
            そのまま積み上がる。
          </h1>
          <p className="intro-sub">
            経過時間・体の回復・浮いたお金・吸いたくなった瞬間を、ひとつの画面で。
          </p>
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
      <header className="masthead compact">
        <p className="wordmark">
          <Icon name="nosmoke" size={16} />
          Smokefree
        </p>
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
          <Settings profile={profile} cravings={cravings} onSave={setProfile} onReset={resetAll} />
        )}
      </main>

      <nav className="tabbar" aria-label="メインナビゲーション">
        <div className="tabbar-inner">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`tab${tab === t.id ? ' active' : ''}`}
              aria-current={tab === t.id ? 'page' : undefined}
              onClick={() => setTab(t.id)}
            >
              <Icon name={t.icon} size={19} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
