import type { MatchedSpot, DatePlan, PlanCondition, PlanScheduleItem, CostBreakdown, Mission, RouteInfo } from '../types';
import { generateText, isApiKeyConfigured } from './gemini';
import { getRoute } from './maps';

const COST_PER_PRICE_LEVEL: Record<number, number> = {
  1: 500,
  2: 1500,
  3: 3000,
  4: 6000,
};

const FALLBACK_MISSIONS: Array<{ text: string; difficulty: 'easy' | 'hard' }> = [
  { text: '2人で同じものを注文してみよう', difficulty: 'easy' },
  { text: '2人一緒に空の写真を撮ろう', difficulty: 'easy' },
  { text: '今日の思い出を一言で表すと？お互い答えてみよう', difficulty: 'easy' },
  { text: 'お互いへの感謝を3つ言い合おう', difficulty: 'easy' },
  { text: 'メニューを見ずに直感で注文してみよう', difficulty: 'hard' },
  { text: '今日行った場所で一番気に入ったシーンを2人で再現してみよう', difficulty: 'hard' },
  { text: '地図なしで近くの隠れた名所を探してみよう', difficulty: 'hard' },
];

function generateFallbackMissions(spots: MatchedSpot[]): Mission[] {
  const categories = spots.map(ms => ms.spot.category);
  const extra: Mission[] = [];
  if (categories.some(c => c.includes('海') || c.includes('自然'))) {
    extra.push({ id: 'm-sea-1', text: '2人で同じ形の石や貝殻を探してみよう', difficulty: 'easy', completed: false });
  }
  if (categories.some(c => c.includes('グルメ') || c.includes('食'))) {
    extra.push({ id: 'm-food-1', text: '食べたことがないメニューを1品チャレンジしよう', difficulty: 'hard', completed: false });
  }
  const base = [...FALLBACK_MISSIONS]
    .sort(() => Math.random() - 0.5)
    .slice(0, 2)
    .map((m, i) => ({ ...m, id: `m-base-${i}`, completed: false }));
  return [...extra.slice(0, 1), ...base].slice(0, 3);
}

async function generateMissions(spots: MatchedSpot[], condition: PlanCondition): Promise<Mission[]> {
  if (!isApiKeyConfigured()) {
    return generateFallbackMissions(spots);
  }

  const spotList = spots.map(ms => `${ms.spot.name}（${ms.spot.category}）`).join('、');
  const prompt = `カップル向けデートのミッションを3つ生成してください。
訪問スポット: ${spotList}
エリア: ${condition.area}

ミッションは「2人で一緒にやること」「その場所・雰囲気ならではの体験」を意識してください。
easyは気軽にできること、hardは少し勇気・チャレンジが必要なことです。
スポットの雰囲気や特徴を活かした、毎回異なるユニークなミッションにしてください。

以下のJSON配列のみで返してください（他のテキスト不要）:
[
  {"text": "ミッション内容（20文字以内）", "difficulty": "easy"},
  {"text": "ミッション内容（20文字以内）", "difficulty": "easy"},
  {"text": "ミッション内容（20文字以内）", "difficulty": "hard"}
]`;

  try {
    const raw = await generateText(prompt);
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('parse failed');
    const parsed = JSON.parse(match[0]);
    if (!Array.isArray(parsed)) throw new Error('not array');
    return parsed.slice(0, 3).map((m: { text: string; difficulty: string }, i: number) => ({
      id: `m-ai-${i}`,
      text: m.text,
      difficulty: (m.difficulty === 'hard' ? 'hard' : 'easy') as 'easy' | 'hard',
      completed: false,
    }));
  } catch {
    return generateFallbackMissions(spots);
  }
}

function generateCostBreakdown(schedule: PlanScheduleItem[], routeTransportTotal?: number): CostBreakdown {
  const food = schedule
    .filter(s => s.spot.category.includes('グルメ') || s.spot.category.includes('食'))
    .reduce((sum, s) => sum + COST_PER_PRICE_LEVEL[s.spot.priceLevel] * 1.5, 800);

  const admission = schedule
    .filter(s => ['アート・展示', '展望台', 'アクティビティ', '展望台・夜景'].includes(s.spot.category))
    .reduce((sum, s) => sum + COST_PER_PRICE_LEVEL[s.spot.priceLevel], 0);

  // ルート計算がある場合は実際の交通費、なければ固定推定値
  const transport = routeTransportTotal ?? (600 + schedule.length * 200);
  const cafe = 600;
  const shopping = 0;

  return {
    food: Math.round(food),
    transport: Math.round(transport),
    admission: Math.round(admission),
    cafe,
    shopping,
    total: Math.round(food + transport + admission + cafe + shopping),
  };
}

interface DetailedPlanContent {
  summary: string;
  scheduleDetails: Array<{
    spot_name: string;
    time: string;
    duration: string;
    memo: string;
    tip: string;
    transport_to_next?: string;
  }>;
}

function generateFallbackContent(condition: PlanCondition, spots: MatchedSpot[]): DetailedPlanContent {
  const durationLabel = { half: '半日', full: '一日', overnight: '1泊2日' }[condition.duration];
  const budgetLabel = condition.budget.replace('~', '〜');
  const startHour = condition.duration === 'half' ? 13 : 10;
  const hoursPerSpot = condition.duration === 'half' ? 1.5 : 2.5;

  return {
    summary: `${condition.area}を舞台に、${durationLabel}の素敵なデートプランができました！${spots.map(ms => ms.spot.name).join('、')}を巡る、予算${budgetLabel}円のプランです。2人のスワイプでマッチしたスポットを優先的に組み込みました。移動しやすい順番に並べているので、効率よく楽しめます。`,
    scheduleDetails: spots.map((ms, i) => ({
      spot_name: ms.spot.name,
      time: `${(startHour + Math.floor(i * hoursPerSpot)).toString().padStart(2, '0')}:00`,
      duration: condition.duration === 'half' ? '約1.5時間' : '約2時間',
      memo: ms.spot.description,
      tip: ms.priority === 'high' ? '2人ともお気に入りのスポット！ゆっくり時間をかけて楽しんで。' : '2人でのんびり楽しもう。',
      transport_to_next: i < spots.length - 1 ? '電車・バスで約15分' : undefined,
    })),
  };
}

async function generateDetailedPlanContent(
  condition: PlanCondition,
  spots: MatchedSpot[]
): Promise<DetailedPlanContent> {
  if (!isApiKeyConfigured()) {
    return generateFallbackContent(condition, spots);
  }

  const durationLabel = { half: '半日', full: '一日', overnight: '1泊2日' }[condition.duration];
  const budgetLabel = condition.budget.replace('~', '〜');
  const startHour = condition.duration === 'half' ? 13 : 10;

  const spotList = spots.map((ms, i) =>
    `${i + 1}. ${ms.spot.name}（${ms.spot.category}、¥${COST_PER_PRICE_LEVEL[ms.spot.priceLevel]}目安）\n   説明: ${ms.spot.description}\n   住所: ${ms.spot.address}${ms.priority === 'high' ? '\n   ※ 2人ともお気に入りの優先スポット' : ''}`
  ).join('\n\n');

  const prompt = `あなたはカップル向けデートプランアドバイザーです。
以下の${spots.length}スポットを使ったデートプランを、まるで現地を熟知するローカルガイドのように詳細に作成してください。

【条件】
エリア: ${condition.area}
所要時間: ${durationLabel}
予算（1人あたり）: ${budgetLabel}円
スタート時刻: ${startHour}:00

【スポット一覧（優先順）】
${spotList}

以下のJSON形式でプランを返してください。JSON以外のテキストは絶対に含めないでください。

{
  "summary": "5〜6文の魅力的なプラン紹介（2人への語りかけ形式・テンションが上がる文体・絵文字なし）。このプランだけの見どころ・コース取りの妙・2人が体験できる特別な瞬間を具体的に描写すること。ニッチなスポットがあればその魅力を特に強調する。",
  "schedule": [
    {
      "spot_name": "スポット名（必ず上記リストから）",
      "time": "HH:MM（${startHour}:00スタートで移動効率を考慮した最適な順番に）",
      "duration": "約X時間（カフェ1h・観光地1.5h・レストラン1.5h・テーマパーク3h・散歩コース2h等）",
      "memo": "このスポットでの具体的な過ごし方・2人で楽しめる体験・絶対に見るべきポイント（3〜4文。「ここに来たらこれをすべき」という行動レベルの具体的アドバイスを含める。ニッチスポットはその場所ならではの魅力を詳しく伝える）",
      "tip": "予約の要否・おすすめオーダー・混雑を避けるベストな時間帯・地元民しか知らないコツなど実用的なプチ情報（1〜2文）",
      "transport_to_next": "次のスポットへの具体的な移動手段と所要時間（例: 都営バス97系統で約12分、徒歩なら15分）（最後のスポットは省略）"
    }
  ]
}`;

  try {
    const raw = await generateText(prompt);
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('JSON parse failed');
    const parsed = JSON.parse(jsonMatch[0]);
    // scheduleキーとscheduleDetailsキーの両方に対応
    if (parsed.schedule && !parsed.scheduleDetails) {
      parsed.scheduleDetails = parsed.schedule;
    }
    return parsed as DetailedPlanContent;
  } catch {
    return generateFallbackContent(condition, spots);
  }
}

export async function generateDatePlan(
  condition: PlanCondition,
  matchedSpots: MatchedSpot[],
  startLocation?: { lat: number; lng: number } | null
): Promise<DatePlan> {
  const prioritized = [
    ...matchedSpots.filter(ms => ms.priority === 'high'),
    ...matchedSpots.filter(ms => ms.priority === 'normal'),
  ].slice(0, condition.duration === 'half' ? 2 : condition.duration === 'overnight' ? 5 : 3);

  // Geminiで詳細なプラン内容を生成
  const detailed = await generateDetailedPlanContent(condition, prioritized);

  // scheduleDetailsをPlanScheduleItemに変換
  const schedule: PlanScheduleItem[] = detailed.scheduleDetails
    .map(detail => {
      const matched = prioritized.find(
        ms => ms.spot.name === detail.spot_name ||
          ms.spot.name.includes(detail.spot_name) ||
          detail.spot_name.includes(ms.spot.name)
      );
      if (!matched) return null;
      return {
        time: detail.time,
        spot: matched.spot,
        duration: detail.duration || '約2時間',
        memo: detail.memo || '',
        tip: detail.tip || '',
        transportToNext: detail.transport_to_next,
        estimatedCost: COST_PER_PRICE_LEVEL[matched.spot.priceLevel],
      } as PlanScheduleItem;
    })
    .filter((s): s is PlanScheduleItem => s !== null);

  // Geminiが一部スポットをスキップした場合、フォールバックで補完
  const includedIds = new Set(schedule.map(s => s.spot.id));
  const missing = prioritized.filter(ms => !includedIds.has(ms.spot.id));
  const lastTime = schedule.length > 0 ? schedule[schedule.length - 1].time : `${condition.duration === 'half' ? 13 : 10}:00`;
  const [lastH] = lastTime.split(':').map(Number);
  missing.forEach((ms, i) => {
    schedule.push({
      time: `${(lastH + 2 + i * 2).toString().padStart(2, '0')}:00`,
      spot: ms.spot,
      duration: '約2時間',
      memo: ms.spot.description,
      tip: ms.priority === 'high' ? '2人ともお気に入りのスポット！' : '',
      estimatedCost: COST_PER_PRICE_LEVEL[ms.spot.priceLevel],
    });
  });

  // 現在地→スポット間のルートを計算
  let routeTransportTotal: number | undefined;
  if (startLocation && schedule.length > 0) {
    try {
      const routeInfos: RouteInfo[] = [];
      let prevPos = startLocation;
      for (const item of schedule) {
        const route = await getRoute(prevPos, { ...item.spot });
        routeInfos.push(route);
        item.routeToNext = route;
        prevPos = { lat: item.spot.lat, lng: item.spot.lng };
      }
      routeTransportTotal = routeInfos.reduce((sum, r) => sum + r.estimatedFare, 0);
    } catch (e) {
      console.warn('[generateDatePlan] route calc failed:', e);
    }
  }

  const costBreakdown = generateCostBreakdown(schedule, routeTransportTotal);
  const missions = await generateMissions(prioritized, condition);

  return {
    id: `plan-${Date.now()}`,
    condition,
    matchedSpots: prioritized,
    schedule,
    costBreakdown,
    missions,
    aiSummary: detailed.summary,
    createdAt: new Date().toISOString(),
    status: 'planning',
  };
}
