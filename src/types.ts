/** 喫煙習慣と禁煙開始日時。オンボーディングで一度だけ入力し、設定から変更できる。 */
export type Profile = {
  /** 禁煙を開始した日時 (ISO 8601) */
  quitAt: string;
  /** 禁煙前に1日あたり吸っていた本数 */
  cigarettesPerDay: number;
  /** 1箱あたりの本数 */
  cigarettesPerPack: number;
  /** 1箱あたりの価格 (円) */
  pricePerPack: number;
};

/** 吸いたい欲求のきっかけ。集計しやすいよう固定の ID で持つ。 */
export type TriggerId =
  | 'after-meal'
  | 'coffee'
  | 'alcohol'
  | 'stress'
  | 'boredom'
  | 'social'
  | 'wake-up'
  | 'break'
  | 'other';

/** クレービング(吸いたい欲求)1件の記録 */
export type Craving = {
  id: string;
  /** 記録した日時 (ISO 8601) */
  at: string;
  /** 欲求の強さ 1(軽い) 〜 5(強烈) */
  intensity: 1 | 2 | 3 | 4 | 5;
  trigger: TriggerId;
  /** 吸わずに乗り切れたか */
  resisted: boolean;
  note?: string;
};

export type AppState = {
  version: 1;
  profile: Profile | null;
  cravings: Craving[];
};
