import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Wallet, Clock, ArrowRight } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { usePlanStore } from '../store/usePlanStore';
import type { PlanCondition } from '../types';

const REGIONS: { label: string; prefs: string[] }[] = [
  { label: '全国', prefs: ['全国'] },
  { label: '北海道・東北', prefs: ['北海道', '青森', '岩手', '宮城', '秋田', '山形', '福島'] },
  { label: '関東', prefs: ['茨城', '栃木', '群馬', '埼玉', '千葉', '東京', '神奈川'] },
  { label: '中部', prefs: ['新潟', '富山', '石川', '福井', '山梨', '長野', '岐阜', '静岡', '愛知'] },
  { label: '近畿', prefs: ['三重', '滋賀', '京都', '大阪', '兵庫', '奈良', '和歌山'] },
  { label: '中国・四国', prefs: ['鳥取', '島根', '岡山', '広島', '山口', '徳島', '香川', '愛媛', '高知'] },
  { label: '九州・沖縄', prefs: ['福岡', '佐賀', '長崎', '熊本', '大分', '宮崎', '鹿児島', '沖縄'] },
];

const PREFECTURE_LABEL: Record<string, string> = {
  '北海道': '北海道', '青森': '青森', '岩手': '岩手', '宮城': '宮城',
  '秋田': '秋田', '山形': '山形', '福島': '福島', '茨城': '茨城',
  '栃木': '栃木', '群馬': '群馬', '埼玉': '埼玉', '千葉': '千葉',
  '東京': '東京', '神奈川': '神奈川', '新潟': '新潟', '富山': '富山',
  '石川': '石川', '福井': '福井', '山梨': '山梨', '長野': '長野',
  '岐阜': '岐阜', '静岡': '静岡', '愛知': '愛知', '三重': '三重',
  '滋賀': '滋賀', '京都': '京都', '大阪': '大阪', '兵庫': '兵庫',
  '奈良': '奈良', '和歌山': '和歌山', '鳥取': '鳥取', '島根': '島根',
  '岡山': '岡山', '広島': '広島', '山口': '山口', '徳島': '徳島',
  '香川': '香川', '愛媛': '愛媛', '高知': '高知', '福岡': '福岡',
  '佐賀': '佐賀', '長崎': '長崎', '熊本': '熊本', '大分': '大分',
  '宮崎': '宮崎', '鹿児島': '鹿児島', '沖縄': '沖縄', '全国': '全国',
};

const PREFECTURE_CODE: Record<string, string> = {
  '北海道': '北海道', '青森': '青森県', '岩手': '岩手県', '宮城': '宮城県',
  '秋田': '秋田県', '山形': '山形県', '福島': '福島県', '茨城': '茨城県',
  '栃木': '栃木県', '群馬': '群馬県', '埼玉': '埼玉県', '千葉': '千葉県',
  '東京': '東京都', '神奈川': '神奈川県', '新潟': '新潟県', '富山': '富山県',
  '石川': '石川県', '福井': '福井県', '山梨': '山梨県', '長野': '長野県',
  '岐阜': '岐阜県', '静岡': '静岡県', '愛知': '愛知県', '三重': '三重県',
  '滋賀': '滋賀県', '京都': '京都府', '大阪': '大阪府', '兵庫': '兵庫県',
  '奈良': '奈良県', '和歌山': '和歌山県', '鳥取': '鳥取県', '島根': '島根県',
  '岡山': '岡山県', '広島': '広島県', '山口': '山口県', '徳島': '徳島県',
  '香川': '香川県', '愛媛': '愛媛県', '高知': '高知県', '福岡': '福岡県',
  '佐賀': '佐賀県', '長崎': '長崎県', '熊本': '熊本県', '大分': '大分県',
  '宮崎': '宮崎県', '鹿児島': '鹿児島県', '沖縄': '沖縄県', '全国': '',
};

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

export function PlanInputPage() {
  const navigate = useNavigate();
  const { setCondition } = usePlanStore();
  const [selectedRegion, setSelectedRegion] = useState('関東');
  const [area, setArea] = useState('');
  const [budget, setBudget] = useState<PlanCondition['budget'] | ''>('');
  const [duration, setDuration] = useState<PlanCondition['duration'] | ''>('');

  const canProceed = area && budget && duration;

  const handleNext = () => {
    if (!canProceed) return;
    setCondition({
      area,
      prefecture: PREFECTURE_CODE[area] || '',
      budget: budget as PlanCondition['budget'],
      duration: duration as PlanCondition['duration'],
    });
    navigate('/plan/swipe');
  };

  const currentRegionPrefs = REGIONS.find(r => r.label === selectedRegion)?.prefs ?? [];

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
            {area && (
              <span className="ml-auto text-sm font-bold text-rose-500">{PREFECTURE_LABEL[area]}</span>
            )}
          </div>

          {/* 地方タブ */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-hide">
            {REGIONS.map(r => (
              <button
                key={r.label}
                onClick={() => { setSelectedRegion(r.label); if (r.label === '全国') setArea('全国'); }}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedRegion === r.label
                    ? 'bg-rose-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* 都道府県グリッド */}
          {selectedRegion !== '全国' && (
            <div className="flex flex-wrap gap-2">
              {currentRegionPrefs.map(pref => (
                <button
                  key={pref}
                  onClick={() => setArea(pref)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                    area === pref
                      ? 'bg-rose-500 text-white shadow-md scale-105'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-300'
                  }`}
                >
                  {pref}
                </button>
              ))}
            </div>
          )}
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
