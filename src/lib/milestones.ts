import type { IconName } from '../components/icons';
import { DAY, HOUR, MINUTE } from './time';

export type Milestone = {
  /** 禁煙開始からの経過時間 (ms) */
  at: number;
  label: string;
  description: string;
  icon: IconName;
};

/**
 * 一般に知られている禁煙後の体の回復の目安。
 * (出典: WHO / CDC などが公開している禁煙後のタイムライン)
 * あくまで一般的な目安で、個人差があります。
 */
export const MILESTONES: Milestone[] = [
  {
    at: 20 * MINUTE,
    label: '20分',
    description: '上がっていた心拍数と血圧が落ち着き始めます。',
    icon: 'pulse',
  },
  {
    at: 8 * HOUR,
    label: '8時間',
    description: '血液中の一酸化炭素が減り、酸素が全身に届きやすくなります。',
    icon: 'wind',
  },
  {
    at: DAY,
    label: '24時間',
    description: '心臓発作のリスクが下がり始めます。',
    icon: 'heart',
  },
  {
    at: 2 * DAY,
    label: '48時間',
    description: '傷んでいた味覚と嗅覚が戻り始め、食事がおいしく感じられます。',
    icon: 'droplet',
  },
  {
    at: 3 * DAY,
    label: '72時間',
    description: '体内のニコチンがほぼ抜け、気管支がゆるんで呼吸が楽になります。',
    icon: 'lungs',
  },
  {
    at: 14 * DAY,
    label: '2週間',
    description: '血行が良くなり、歩行や運動が以前より楽になります。',
    icon: 'walk',
  },
  {
    at: 30 * DAY,
    label: '1ヶ月',
    description: '肺の機能が改善し、咳や息切れが減ってきます。',
    icon: 'flex',
  },
  {
    at: 90 * DAY,
    label: '3ヶ月',
    description: '肺の繊毛が回復し、感染症にかかりにくくなります。',
    icon: 'shield',
  },
  {
    at: 270 * DAY,
    label: '9ヶ月',
    description: '咳・息切れ・だるさがさらに軽くなります。',
    icon: 'feather',
  },
  {
    at: 365 * DAY,
    label: '1年',
    description: '冠動脈疾患のリスクが喫煙を続けた場合の約半分になります。',
    icon: 'award',
  },
  {
    at: 5 * 365 * DAY,
    label: '5年',
    description: '脳卒中のリスクが非喫煙者に近づきます。',
    icon: 'brain',
  },
  {
    at: 10 * 365 * DAY,
    label: '10年',
    description: '肺がんで亡くなるリスクが吸い続けた場合の約半分になります。',
    icon: 'leaf',
  },
  {
    at: 15 * 365 * DAY,
    label: '15年',
    description: '冠動脈疾患のリスクが非喫煙者と同程度になります。',
    icon: 'star',
  },
];

export type MilestoneProgress = {
  milestone: Milestone;
  achieved: boolean;
  /** 未達成なら 0〜1 の進捗、達成済みなら 1 */
  ratio: number;
  /** 未達成の場合の残り時間 (ms)、達成済みなら 0 */
  remainingMs: number;
};

export function milestoneProgress(elapsedMs: number): MilestoneProgress[] {
  return MILESTONES.map((milestone, i) => {
    const prev = i === 0 ? 0 : MILESTONES[i - 1].at;
    const achieved = elapsedMs >= milestone.at;
    const span = milestone.at - prev;
    const ratio = achieved ? 1 : Math.max(0, Math.min(1, (elapsedMs - prev) / span));
    return {
      milestone,
      achieved,
      ratio,
      remainingMs: achieved ? 0 : milestone.at - elapsedMs,
    };
  });
}

/** 次に到達するマイルストーン。すべて達成済みなら null。 */
export function nextMilestone(elapsedMs: number): MilestoneProgress | null {
  return milestoneProgress(elapsedMs).find((m) => !m.achieved) ?? null;
}

export function achievedCount(elapsedMs: number): number {
  return MILESTONES.filter((m) => elapsedMs >= m.at).length;
}
