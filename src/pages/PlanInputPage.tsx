import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Wallet, Clock, ArrowRight } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { usePlanStore } from '../store/usePlanStore';
import type { PlanCondition } from '../types';

const AREAS = ['東京', '神奈川', '大阪', '京都', '北海道', '福岡', '全国'];
const BUDGETS: { value: PlanCondition['budget']; label: string }[] = [
  { value: '~3000', label: '〜3,000円' },
  { value: '~5000', label: '〜5,000円' },
  { value: '~10000', label: '〜10,000円' },
  { value: '~30000', label: '〜30,000円' },
];
const DURATIONS: { value: PlanCondition['duration']; label: string; desc: string }[] = [
  { value: 'half', label: '半日', desc: '3〜4時間' },
  { value: 'full', label: '一日', desc: '8〜10時間' },
  { value: 'overnight', label: '1泊2日', desc: '宿泊あり' },
];

const PREFECTURES: Record<string, string> = {
  '東京': '東京都',
  '神奈川': '神奈川県',
  '大阪': '大阪府',
  '京都': '京都府',
  '北海道': '北海道',
  '福岡': '福岡県',
  '全国': '',
};

export function PlanInputPage() {
  const navigate = useNavigate();
  const { setCondition } = usePlanStore();
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState<PlanCondition['budget'] | ''>('');
  const [duration, setDuration] = useState<PlanCondition['duration'] | ''>('');

  const canProceed = area && budget && duration;

  const handleNext = () => {
    if (!canProceed) return;
    setCondition({
      area,
      prefecture: PREFECTURES[area] || '',
      budget: budget as PlanCondition['budget'],
      duration: duration as PlanCondition['duration'],
    });
    navigate('/plan/swipe');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="デートプランを作る" showBack />

      <div className="px-4 pt-4 space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 mb-2">
            <p className="text-gray-700 text-sm leading-relaxed">
              条件を選んでスワイプ開始！2人でそれぞれスワイプして、マッチしたスポットからAIがプランを作ります。
            </p>
          </div>
        </motion.div>

        {/* エリア選択 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-rose-500" />
            <h2 className="font-bold text-gray-900">エリア</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {AREAS.map(a => (
              <button
                key={a}
                onClick={() => setArea(a)}
                className={`px-4 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  area === a
                    ? 'bg-rose-500 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-300'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
        </section>

        {/* 予算 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Wallet size={18} className="text-rose-500" />
            <h2 className="font-bold text-gray-900">予算（1人あたり）</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {BUDGETS.map(b => (
              <button
                key={b.value}
                onClick={() => setBudget(b.value)}
                className={`px-4 py-3 rounded-2xl text-sm font-medium transition-all text-center ${
                  budget === b.value
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-300'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </section>

        {/* 所要時間 */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-rose-500" />
            <h2 className="font-bold text-gray-900">所要時間</h2>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {DURATIONS.map(d => (
              <button
                key={d.value}
                onClick={() => setDuration(d.value)}
                className={`px-3 py-3 rounded-2xl text-center transition-all ${
                  duration === d.value
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-300'
                }`}
              >
                <p className="font-bold text-sm">{d.label}</p>
                <p className={`text-xs mt-0.5 ${duration === d.value ? 'text-white/80' : 'text-gray-400'}`}>
                  {d.desc}
                </p>
              </button>
            ))}
          </div>
        </section>

        <Button
          fullWidth
          size="lg"
          disabled={!canProceed}
          onClick={handleNext}
          className="flex items-center justify-center gap-2"
        >
          スワイプ開始！
          <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
}
