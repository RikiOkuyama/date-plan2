import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Heart, MapPin, ChevronRight, Calendar } from 'lucide-react';
import { useMemoryStore } from '../store/useMemoryStore';
import { usePlanStore } from '../store/usePlanStore';
import { useAppStore } from '../store/useAppStore';
import { getSpotsByArea } from '../data/mockSpots';
import { Button } from '../components/common/Button';

export function HomePage() {
  const navigate = useNavigate();
  const { memories } = useMemoryStore();
  const { savedPlans } = usePlanStore();
  const { user1Name, user2Name } = useAppStore();

  const prefCount = Object.keys(
    memories.reduce((acc, m) => ({ ...acc, [m.spot.prefecture]: true }), {})
  ).length;

  const suggestedSpots = getSpotsByArea('全国').slice(0, 4);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 px-5 pt-14 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Heart size={18} className="text-white/80" fill="white" />
            <span className="text-white/80 text-sm">{user1Name} & {user2Name}</span>
          </div>
          <h1 className="text-white text-3xl font-black leading-tight mb-1">
            次のデート、<br />どこ行く？
          </h1>
          <p className="text-white/80 text-sm mb-6">スワイプで2人の行きたいを合わせよう</p>

          <Button
            size="lg"
            className="bg-white text-rose-500 hover:bg-rose-50 shadow-lg w-full justify-center flex items-center gap-2"
            onClick={() => navigate('/plan/new')}
          >
            <Sparkles size={20} />
            デートプランを作る
          </Button>
        </motion.div>
      </div>

      {/* 統計バー */}
      <div className="mx-4 -mt-4 bg-white rounded-2xl shadow-md p-4 flex divide-x divide-gray-100">
        <div className="flex-1 text-center">
          <p className="text-2xl font-black text-rose-500">{memories.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">思い出スポット</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-2xl font-black text-rose-500">{prefCount}</p>
          <p className="text-xs text-gray-500 mt-0.5">都道府県</p>
        </div>
        <div className="flex-1 text-center">
          <p className="text-2xl font-black text-rose-500">{savedPlans.length}</p>
          <p className="text-xs text-gray-500 mt-0.5">プラン数</p>
        </div>
      </div>

      <div className="px-4 mt-6 space-y-6">
        {/* 最近の思い出 */}
        {memories.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Heart size={16} className="text-rose-500" />
                最近の思い出
              </h2>
              <button
                onClick={() => navigate('/gallery')}
                className="text-rose-500 text-sm flex items-center gap-1"
              >
                すべて見る <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-2">
              {memories.slice(0, 2).map(memory => (
                <div
                  key={memory.id}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 shadow-sm border border-gray-100 cursor-pointer"
                  onClick={() => navigate(`/memories/${memory.id}`)}
                >
                  <img
                    src={memory.photos[0] || memory.spot.imageUrl}
                    alt={memory.spot.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm truncate">{memory.spot.name}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      <Calendar size={11} />
                      <span>{memory.visitedAt}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{memory.note}</p>
                  </div>
                  <div className="text-yellow-500 text-xs font-bold">
                    {'★'.repeat(memory.rating)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 行先候補 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <MapPin size={16} className="text-rose-500" />
              おすすめスポット
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {suggestedSpots.map((spot, i) => (
              <motion.div
                key={spot.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 cursor-pointer"
                onClick={() => navigate('/plan/new')}
              >
                <img src={spot.imageUrl} alt={spot.name} className="w-full h-28 object-cover" />
                <div className="p-2.5">
                  <p className="font-bold text-gray-900 text-xs leading-tight">{spot.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{spot.category}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
