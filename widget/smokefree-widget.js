// Smokefree — iOS ホーム画面ウィジェット (Scriptable 用)
//
// 禁煙アプリ本体と同じ計算で、経過日数・節約金額・次の回復までの進捗を表示する。
// 必要なのは下の4項目だけ。開始日時さえ分かれば何日先でも正確に計算できるので、
// 本体アプリと通信したり同期したりする必要はない。
//
// 導入手順は widget/README.md を参照。

// ============================================================
// 設定 — ここを自分の値に書き換える
// ============================================================
const CONFIG = {
  quitAt: '2026-08-01T09:00', // 禁煙を始めた日時 (YYYY-MM-DDTHH:mm、端末のローカル時刻)
  cigarettesPerDay: 15, // 禁煙前に1日あたり吸っていた本数
  cigarettesPerPack: 20, // 1箱あたりの本数
  pricePerPack: 600, // 1箱あたりの価格（円）
};

// ウィジェットのパラメータに「2026-08-01T09:00,20,20,600」と入れると、
// このファイルを書き換えなくても上の設定を上書きできる。
function resolveConfig() {
  const raw = args.widgetParameter;
  if (!raw) return CONFIG;
  const [quitAt, perDay, perPack, price] = raw.split(',').map((s) => s.trim());
  return {
    quitAt: quitAt || CONFIG.quitAt,
    cigarettesPerDay: Number(perDay) || CONFIG.cigarettesPerDay,
    cigarettesPerPack: Number(perPack) || CONFIG.cigarettesPerPack,
    pricePerPack: Number(price) || CONFIG.pricePerPack,
  };
}

// ============================================================
// 配色 — 本体アプリのトークンに合わせている
// ============================================================
const COLOR = {
  bg: Color.dynamic(new Color('#ffffff'), new Color('#0b0c0e')),
  ink: Color.dynamic(new Color('#15171b'), new Color('#eaecef')),
  ink2: Color.dynamic(new Color('#5a6069'), new Color('#9aa1aa')),
  ink3: Color.dynamic(new Color('#8c929b'), new Color('#6a717a')),
  line: Color.dynamic(new Color('#dcdcd8'), new Color('#2a2e34')),
  accent: Color.dynamic(new Color('#12775b'), new Color('#5ec79a')),
};

// ============================================================
// 計算 — src/lib/ と同じロジック
// ============================================================
const MINUTE = 60000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MINUTES_PER_CIGARETTE = 5;

const MILESTONES = [
  { at: 20 * MINUTE, label: '20分' },
  { at: 8 * HOUR, label: '8時間' },
  { at: DAY, label: '24時間' },
  { at: 2 * DAY, label: '48時間' },
  { at: 3 * DAY, label: '72時間' },
  { at: 14 * DAY, label: '2週間' },
  { at: 30 * DAY, label: '1ヶ月' },
  { at: 90 * DAY, label: '3ヶ月' },
  { at: 270 * DAY, label: '9ヶ月' },
  { at: 365 * DAY, label: '1年' },
  { at: 5 * 365 * DAY, label: '5年' },
  { at: 10 * 365 * DAY, label: '10年' },
  { at: 15 * 365 * DAY, label: '15年' },
];

function elapsedSince(quitAt, now) {
  const start = new Date(quitAt).getTime();
  if (Number.isNaN(start)) return null;
  return Math.max(0, now - start);
}

function calcSavings(cfg, elapsedMs) {
  const perPack = cfg.cigarettesPerPack > 0 ? cfg.cigarettesPerPack : 20;
  const cigarettes = (elapsedMs / DAY) * Math.max(0, cfg.cigarettesPerDay);
  return {
    cigarettes,
    money: cigarettes * (Math.max(0, cfg.pricePerPack) / perPack),
    timeMs: cigarettes * MINUTES_PER_CIGARETTE * MINUTE,
  };
}

/** 次に到達するマイルストーンと、そこまでの進捗（直前のマイルストーンからの割合） */
function nextMilestone(elapsedMs) {
  for (let i = 0; i < MILESTONES.length; i++) {
    if (elapsedMs < MILESTONES[i].at) {
      const prev = i === 0 ? 0 : MILESTONES[i - 1].at;
      const span = MILESTONES[i].at - prev;
      return {
        label: MILESTONES[i].label,
        ratio: Math.max(0, Math.min(1, (elapsedMs - prev) / span)),
        remainingMs: MILESTONES[i].at - elapsedMs,
      };
    }
  }
  return null;
}

function achievedCount(elapsedMs) {
  return MILESTONES.filter((m) => elapsedMs >= m.at).length;
}

function humanize(ms) {
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)}分`;
  if (ms < DAY) return `${Math.floor(ms / HOUR)}時間`;
  const d = Math.floor(ms / DAY);
  if (d < 100) {
    const h = Math.floor((ms % DAY) / HOUR);
    return h > 0 ? `${d}日${h}時間` : `${d}日`;
  }
  return `${d}日`;
}

const nf = new Intl.NumberFormat('ja-JP');
const yen = (n) => `¥${nf.format(Math.floor(n))}`;

// ============================================================
// 描画パーツ
// ============================================================

/** 進捗リングを画像として描く。中央に文字を入れられる。 */
function ringImage(ratio, size, centerText) {
  const ctx = new DrawContext();
  ctx.size = new Size(size, size);
  ctx.opaque = false;
  ctx.respectScreenScale = true;

  const lineWidth = size * 0.085;
  const radius = (size - lineWidth) / 2;
  const center = size / 2;

  // Scriptable の Path には円弧がないので、小さな円を並べて線に見せる
  const arc = (from, to, color) => {
    ctx.setFillColor(color);
    const steps = Math.max(2, Math.round((to - from) * 260));
    for (let i = 0; i <= steps; i++) {
      const t = from + (to - from) * (i / steps);
      const angle = -Math.PI / 2 + t * Math.PI * 2;
      const x = center + Math.cos(angle) * radius - lineWidth / 2;
      const y = center + Math.sin(angle) * radius - lineWidth / 2;
      ctx.fillEllipse(new Rect(x, y, lineWidth, lineWidth));
    }
  };

  arc(0, 1, COLOR.line);
  if (ratio > 0) arc(0, Math.min(1, ratio), COLOR.accent);

  if (centerText) {
    ctx.setTextAlignedCenter();
    ctx.setTextColor(COLOR.ink);
    ctx.setFont(Font.mediumSystemFont(size * 0.2));
    const h = size * 0.26;
    ctx.drawTextInRect(centerText, new Rect(0, center - h / 2, size, h));
  }

  return ctx.getImage();
}

function addLabel(stack, text, font, color) {
  const t = stack.addText(text);
  t.font = font;
  t.textColor = color;
  t.lineLimit = 1;
  return t;
}

/** 「40 日」のように、数字と単位を並べる */
function addBigNumber(stack, value, unit, size) {
  const row = stack.addStack();
  row.centerAlignContent();
  const num = row.addText(String(value));
  num.font = Font.lightSystemFont(size);
  num.textColor = COLOR.ink;
  num.minimumScaleFactor = 0.7;
  num.lineLimit = 1;
  row.addSpacer(3);
  const u = row.addText(unit);
  u.font = Font.mediumSystemFont(size * 0.32);
  u.textColor = COLOR.ink2;
}

// ============================================================
// ウィジェット本体
// ============================================================
function buildSmall(widget, data) {
  addLabel(widget, '禁煙してから', Font.mediumSystemFont(9), COLOR.ink3);
  widget.addSpacer(2);
  addBigNumber(widget, data.days, '日', 40);
  widget.addSpacer(6);

  addLabel(widget, yen(data.savings.money), Font.semiboldSystemFont(15), COLOR.accent);
  addLabel(widget, `${nf.format(Math.floor(data.savings.cigarettes))} 本を回避`, Font.systemFont(10), COLOR.ink3);

  widget.addSpacer();

  if (data.next) {
    const bar = widget.addStack();
    bar.layoutHorizontally();
    bar.size = new Size(0, 3);
    bar.cornerRadius = 1.5;
    bar.backgroundColor = COLOR.line;
    const fill = bar.addStack();
    fill.size = new Size(Math.max(2, 130 * data.next.ratio), 3);
    fill.cornerRadius = 1.5;
    fill.backgroundColor = COLOR.accent;
    bar.addSpacer();

    widget.addSpacer(4);
    addLabel(
      widget,
      `次 ${data.next.label} · あと${humanize(data.next.remainingMs)}`,
      Font.systemFont(9),
      COLOR.ink3,
    );
  } else {
    addLabel(widget, 'すべて達成', Font.systemFont(9), COLOR.accent);
  }
}

function buildMedium(widget, data) {
  const row = widget.addStack();
  row.layoutHorizontally();
  row.centerAlignContent();

  // 左：日数と内訳
  const left = row.addStack();
  left.layoutVertically();

  addLabel(left, '禁煙してから', Font.mediumSystemFont(9), COLOR.ink3);
  left.addSpacer(2);
  addBigNumber(left, data.days, '日', 42);
  left.addSpacer(8);

  const facts = [
    ['節約', yen(data.savings.money)],
    ['回避', `${nf.format(Math.floor(data.savings.cigarettes))} 本`],
    ['取り戻した時間', humanize(data.savings.timeMs)],
  ];
  for (const [label, value] of facts) {
    const line = left.addStack();
    line.layoutHorizontally();
    line.centerAlignContent();
    addLabel(line, label, Font.systemFont(10), COLOR.ink3);
    line.addSpacer(6);
    addLabel(line, value, Font.mediumSystemFont(11), COLOR.ink);
  }

  row.addSpacer();

  // 右：次のマイルストーンまでのリング
  const right = row.addStack();
  right.layoutVertically();
  right.centerAlignContent();

  const ratio = data.next ? data.next.ratio : 1;
  const percent = `${Math.round(ratio * 100)}%`;
  const img = right.addImage(ringImage(ratio, 150, percent));
  img.imageSize = new Size(74, 74);

  right.addSpacer(5);
  const caption = right.addStack();
  caption.layoutVertically();
  caption.centerAlignContent();
  addLabel(caption, data.next ? `次 ${data.next.label}` : 'すべて達成', Font.mediumSystemFont(11), COLOR.ink);
  if (data.next) {
    addLabel(caption, `あと ${humanize(data.next.remainingMs)}`, Font.systemFont(9), COLOR.ink3);
  }
  addLabel(caption, `${data.achieved} / ${MILESTONES.length} 達成`, Font.systemFont(9), COLOR.ink3);
}

function buildError(widget, message) {
  addLabel(widget, 'Smokefree', Font.mediumSystemFont(10), COLOR.ink3);
  widget.addSpacer(4);
  const t = widget.addText(message);
  t.font = Font.systemFont(12);
  t.textColor = COLOR.ink;
}

/** 日数の表示が変わる瞬間（開始時刻の毎日の応当時刻）に更新をかける */
function nextRefreshDate(quitAt, now) {
  const start = new Date(quitAt).getTime();
  const passed = Math.floor((now - start) / DAY) + 1;
  const nextDayBoundary = start + passed * DAY;
  return new Date(Math.min(nextDayBoundary, now + 30 * MINUTE));
}

function createWidget() {
  const cfg = resolveConfig();
  const widget = new ListWidget();
  widget.backgroundColor = COLOR.bg;
  widget.setPadding(14, 14, 14, 14);

  const now = Date.now();
  const elapsed = elapsedSince(cfg.quitAt, now);

  if (elapsed === null) {
    buildError(widget, `開始日時を読み取れません:\n${cfg.quitAt}`);
    return widget;
  }

  const data = {
    days: Math.floor(elapsed / DAY),
    savings: calcSavings(cfg, elapsed),
    next: nextMilestone(elapsed),
    achieved: achievedCount(elapsed),
  };

  if (config.widgetFamily === 'small') buildSmall(widget, data);
  else buildMedium(widget, data);

  widget.refreshAfterDate = nextRefreshDate(cfg.quitAt, now);
  return widget;
}

const widget = createWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // Scriptable アプリ内で実行した時のプレビュー
  await widget.presentMedium();
}
Script.complete();
