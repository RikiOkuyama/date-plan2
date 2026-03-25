import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, MapPin, Sparkles, MessageSquare, CheckCircle2, ChevronDown, ChevronUp, Lightbulb, Train } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { CostSimulation } from '../components/plan/CostSimulation';
import { MissionCard } from '../components/plan/MissionCard';
import { usePlanStore } from '../store/usePlanStore';

export function PlanResultPage() {
  const navigate = useNavigate();
  const { currentPlan, updateMissionCompleted } = usePlanStore();
  const [showCost, setShowCost] = useState(true);
  const [showMissions, setShowMissions] = useState(true);

  if (!currentPlan) {
    return <Navigate to="/" replace />;
  }

  const handleComplete = () => {
    navigate('/plan/record');
  };

  const durationLabel = { half: '半日', full: '一日', overnight: '1泊2日' }[currentPlan.condition.duration];

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header
        title="デートプラン"
        showBack
        right={
          <button
            onClick={() => navigate('/plan/edit')}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <MessageSquare size={20} className="text-rose-500" />
          </button>
        }
      />

      {/* ヒーロー */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-500 px-5 py-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 text-white/80 text-sm mb-1">
            <MapPin size={14} />
            <span>{currentPlan.condition.area}</span>
            <span>・</span>
            <Clock size={14} />
            <span>{durationLabel}</span>
          </div>
          <h1 className="text-white text-2xl font-black leading-tight mb-3">
            {currentPlan.condition.area}デートプラン
          </h1>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
            <p className="text-white/90 text-sm leading-relaxed">{currentPlan.aiSummary}</p>
          </div>
        </motion.div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* スケジュール */}
        <section>
          <h2 className="font-black text-gray-900 flex items-center gap-2 mb-3">
            <Sparkles size={18} className="text-rose-500" />
            AIスケジュール
          </h2>
          <div className="space-y-3">
            {currentPlan.schedule.map((item, i) => (
              <motion.div
                key={item.spot.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex gap-3"
              >
                {/* タイムライン */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {item.time}
                  </div>
                  {i < currentPlan.schedule.length - 1 && (
                    <div className="w-0.5 h-8 bg-rose-200 mt-1" />
                  )}
                </div>

                {/* スポット情報 */}
                <div className="flex-1 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 -mt-1">
                  <div className="flex items-start gap-3">
                    <img
                      src={item.spot.imageUrl}
                      alt={item.spot.name}
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 text-sm">{item.spot.name}</h3>
                        {currentPlan.matchedSpots.find(ms => ms.spot.id === item.spot.id)?.priority === 'high' && (
                          <span className="bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            絶対行く！
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{item.spot.category} · {item.duration}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        <MapPin size={10} className="inline mr-1" />
                        {item.spot.address}
                      </p>
                    </div>
                  </div>
                  {item.memo && (
                    <p className="text-xs text-gray-700 mt-2.5 leading-relaxed border-t border-gray-50 pt-2">{item.memo}</p>
                  )}
                  {item.tip && (
                    <div className="flex items-start gap-1.5 mt-2 bg-amber-50 rounded-xl px-2.5 py-2">
                      <Lightbulb size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-amber-700 leading-relaxed">{item.tip}</p>
                    </div>
                  )}
                </div>
                {/* 移動情報 */}
                {item.transportToNext && i < currentPlan.schedule.length - 1 && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 pl-12 py-1">
                    <Train size={11} className="flex-shrink-0" />
                    <span>{item.transportToNext}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </section>

        {/* 支払いシミュレーション */}
        <section>
          <button
            className="flex items-center justify-between w-full mb-2"
            onClick={() => setShowCost(!showCost)}
          >
            <h2 className="font-black text-gray-900">支払いシミュレーション</h2>
            {showCost ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
          </button>
          {showCost && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CostSimulation breakdown={currentPlan.costBreakdown} budget={currentPlan.condition.budget} />
            </motion.div>
          )}
        </section>

        {/* ミッション */}
        {currentPlan.missions.length > 0 && (
          <section>
            <button
              className="flex items-center justify-between w-full mb-2"
              onClick={() => setShowMissions(!showMissions)}
            >
              <h2 className="font-black text-gray-900 flex items-center gap-2">
                <span>ミッション</span>
                <span className="bg-rose-100 text-rose-600 text-xs px-2 py-0.5 rounded-full">
                  {currentPlan.missions.length}個
                </span>
              </h2>
              {showMissions ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
            </button>
            {showMissions && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                {currentPlan.missions.map(mission => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    onComplete={updateMissionCompleted}
                  />
                ))}
                <p className="text-xs text-gray-400 text-center mt-2">
                  ミッション達成でオリジナルバッジをゲット！
                </p>
              </motion.div>
            )}
          </section>
        )}

        {/* アクション */}
        <div className="space-y-3 pb-4">
          <Button fullWidth size="lg" onClick={() => navigate('/plan/edit')} variant="outline">
            <MessageSquare size={18} className="mr-2" />
            AIチャットでプランを調整する
          </Button>
          <Button fullWidth size="lg" onClick={handleComplete}>
            <CheckCircle2 size={18} className="mr-2" />
            デート完了！思い出を記録する
          </Button>
        </div>
      </div>
    </div>
  );
}
