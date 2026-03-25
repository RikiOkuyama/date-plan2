import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { usePlanStore } from '../store/usePlanStore';
import { chatWithHistory } from '../utils/gemini';
import type { PlanScheduleItem } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  planUpdated?: boolean;
  timestamp: Date;
}

type GeminiRole = 'user' | 'model';
interface GeminiTurn { role: GeminiRole; parts: string; }

// Geminiに渡すシステムコンテキスト（プランの状態を常に最新で注入する）
function buildSystemContext(
  plan: NonNullable<ReturnType<typeof usePlanStore.getState>['currentPlan']>,
  availableSpots: ReturnType<typeof usePlanStore.getState>['availableSpots']
): string {
  const durationLabel = { half: '半日', full: '一日', overnight: '1泊2日' }[plan.condition.duration];
  // availableSpotsが空の場合は現在のスケジュールのスポットを候補として使う
  const spotSource = availableSpots.length > 0 ? availableSpots : plan.schedule.map(s => s.spot);
  const spotList = spotSource.map(s =>
    `- ${s.name}（${s.category}、¥${[0,500,1500,3000,6000][s.priceLevel]}目安）`
  ).join('\n');
  const schedule = plan.schedule.map(s =>
    `  ${s.time} ${s.spot.name}（${s.spot.category}）${s.duration ? ' ' + s.duration : ''}${s.memo ? ' ※' + s.memo : ''}`
  ).join('\n');

  return `あなたはカップル向けデートプランアドバイザーです。チャットを通じてリアルタイムでデートプランを修正するAIです。

【現在のプラン】
エリア: ${plan.condition.area}
所要時間: ${durationLabel}
予算（1人あたり）: ${plan.condition.budget.replace('~', '〜')}円
合計費用目安: ¥${plan.costBreakdown.total.toLocaleString()}
スケジュール:
${schedule}

【選べるスポット一覧（このエリアで利用可能）】
${spotList}

ユーザーのリクエストに応じてプランを調整してください。必ず以下のJSON形式のみで返してください（他のテキスト不要）。
スケジュールを変更する場合は updated_schedule を含め、変更不要な場合は null にしてください。
spot_name は【選べるスポット一覧】の名前から選んでください。

{
  "reply": "ユーザーへの返答（日本語・タメ口でフレンドリーに。変更点があれば何をどう変えたか具体的に説明）",
  "updated_schedule": [
    { "time": "HH:MM", "spot_name": "スポット名", "duration": "約XX時間", "memo": "このスポットでの過ごし方（1〜2文）" }
  ] | null
}`;
}

export function PlanEditPage() {
  const navigate = useNavigate();
  const { currentPlan, availableSpots, updateSchedule } = usePlanStore();
  const [messages, setMessages] = useState<Message[]>([{
    id: 'init',
    role: 'assistant',
    content: 'プランについて何でも相談して！\n\n「ランチを安くして」「夜景スポットに変えて」「ニッチな場所に変更して」など気軽にどうぞ。',
    timestamp: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  // Gemini マルチターン用の会話履歴（UIの messages とは別に管理）
  const [geminiHistory, setGeminiHistory] = useState<GeminiTurn[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!currentPlan) {
    navigate('/');
    return null;
  }

  const handleSend = async (overrideInput?: string) => {
    const text = overrideInput ?? input;
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = text;
    setInput('');
    setIsTyping(true);

    try {
      // プランの最新状態をコンテキストとして毎回注入し、その後に実際の会話履歴を続ける
      const systemContext = buildSystemContext(currentPlan, availableSpots);
      const fullHistory: GeminiTurn[] = [
        { role: 'user', parts: systemContext },
        {
          role: 'model',
          parts: '{"reply":"わかった！プランについて何でも相談して！「ランチ安くして」「ニッチな場所に変えて」など気軽にどうぞ。","updated_schedule":null}',
        },
        ...geminiHistory,
      ];

      // Gemini マルチターン API 呼び出し
      const raw = await chatWithHistory(fullHistory, currentInput);

      // 会話履歴を更新（次回の呼び出しに引き継ぐ）
      setGeminiHistory(prev => [
        ...prev,
        { role: 'user' as GeminiRole, parts: currentInput },
        { role: 'model' as GeminiRole, parts: raw },
      ]);

      // JSONを抽出（コードブロックで囲まれていても対応）
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('JSONの解析に失敗しました');

      const parsed = JSON.parse(jsonMatch[0]) as {
        reply: string;
        updated_schedule: Array<{ time: string; spot_name: string; duration: string; memo?: string }> | null;
      };

      let planUpdated = false;

      if (parsed.updated_schedule && parsed.updated_schedule.length > 0) {
        // スポット名でマッチングして実際のSpotオブジェクトに変換
        const allKnownSpots = [
          ...availableSpots,
          ...currentPlan.schedule.map(s => s.spot),
        ];
        const newSchedule: PlanScheduleItem[] = parsed.updated_schedule
          .map(item => {
            const spot = allKnownSpots.find(s =>
              s.name === item.spot_name || s.name.includes(item.spot_name) || item.spot_name.includes(s.name)
            );

            // スポットが見つからない場合は現在のスケジュールの同じ順番のスポットを流用
            const fallbackSpot = currentPlan.schedule[parsed.updated_schedule!.indexOf(item)]?.spot;
            const resolvedSpot = spot ?? fallbackSpot;
            if (!resolvedSpot) return null;

            return {
              time: item.time,
              spot: resolvedSpot,
              duration: item.duration || '約2時間',
              memo: item.memo || '',
              estimatedCost: [0, 500, 1500, 3000, 6000][resolvedSpot.priceLevel],
            } as PlanScheduleItem;
          })
          .filter((s): s is PlanScheduleItem => s !== null);

        if (newSchedule.length > 0) {
          updateSchedule(newSchedule);
          planUpdated = true;
        }
      }

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: parsed.reply,
        planUpdated,
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('[PlanEdit] Error:', err);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'エラーが発生しました。もう一度試してみて。',
        timestamp: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const quickReplies = ['予算内に収めて', 'ニッチな場所に変えて', 'ランチを安くして', '夜景スポット追加して'];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header
        title="AIチャットでプラン編集"
        showBack
        right={
          <button onClick={() => navigate('/plan/result')} className="text-rose-500 text-sm font-bold">
            完了
          </button>
        }
      />

      {/* 現在のプランサマリー（リアルタイム更新） */}
      <div className="mx-4 my-2 bg-white rounded-2xl p-3 border border-gray-100 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1.5">
          <Sparkles size={12} className="text-rose-500" />
          <span className="font-medium">現在のプラン</span>
        </div>
        <div className="space-y-1">
          {currentPlan.schedule.map((s, i) => (
            <div key={s.spot.id + i} className="flex items-center gap-2 text-xs">
              <span className="text-rose-500 font-bold w-10 flex-shrink-0">{s.time}</span>
              <span className="text-gray-800 font-medium truncate">{s.spot.name}</span>
              <span className="text-gray-400 flex-shrink-0">{s.spot.category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* メッセージリスト */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 min-h-0">
        {messages.map(msg => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
              msg.role === 'assistant' ? 'bg-rose-500' : 'bg-gray-200'
            }`}>
              {msg.role === 'assistant' ? <Bot size={16} className="text-white" /> : <User size={16} className="text-gray-600" />}
            </div>
            <div className="flex flex-col gap-1 max-w-[80%]">
              <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === 'assistant'
                  ? 'bg-white border border-gray-100 shadow-sm text-gray-800'
                  : 'bg-rose-500 text-white'
              }`}>
                {msg.content}
              </div>
              {msg.planUpdated && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1.5 text-xs text-green-600 font-medium pl-1"
                  >
                    <CheckCircle2 size={13} />
                    プランを更新しました
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 shadow-sm rounded-2xl px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-gray-400"
                  animate={{ scale: [1, 1.5, 1] }}
                  transition={{ delay: i * 0.2, duration: 0.6, repeat: Infinity }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* クイック返信 */}
      <div className="px-4 pb-2 flex-shrink-0">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {quickReplies.map(qr => (
            <button
              key={qr}
              onClick={() => handleSend(qr)}
              className="flex-shrink-0 text-xs bg-white border border-rose-200 text-rose-500 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-rose-50"
            >
              {qr}
            </button>
          ))}
        </div>
      </div>

      {/* 入力エリア */}
      <div className="px-4 pb-6 bg-white border-t border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-2 pt-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="プランへのリクエストを入力..."
            className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-rose-300"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-11 h-11 rounded-full bg-rose-500 flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
          >
            {isTyping ? <RefreshCw size={18} className="text-white animate-spin" /> : <Send size={18} className="text-white" />}
          </button>
        </div>
      </div>
    </div>
  );
}
