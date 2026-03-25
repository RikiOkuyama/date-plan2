import { motion } from 'framer-motion';
import { Award, Lock } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { useMemoryStore } from '../store/useMemoryStore';

const BADGE_TEMPLATES = [
  { name: '初デートバッジ', description: '初めてのデートプランを作成', icon: '💕', earned: false },
  { name: '全国制覇10%', description: '5都道府県を訪問', icon: '🗾', earned: false },
  { name: 'スワイプマスター', description: '10回スワイプした', icon: '👆', earned: false },
];

export function BadgesPage() {
  const { memories } = useMemoryStore();
  const earnedBadges = memories.flatMap(m => m.badge ? [m.badge] : []);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="バッジコレクション" />

      {/* 獲得済みバッジ */}
      <div className="px-4 pt-4">
        <h2 className="font-black text-gray-900 mb-3 flex items-center gap-2">
          <Award size={18} className="text-yellow-500" />
          獲得済みバッジ
          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">
            {earnedBadges.length}個
          </span>
        </h2>

        {earnedBadges.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {earnedBadges.map((badge, i) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1, type: 'spring', bounce: 0.4 }}
                className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-4 border border-yellow-200 shadow-sm text-center"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center mx-auto mb-3 shadow-md">
                  <Award size={28} className="text-white" />
                </div>
                <h3 className="font-black text-gray-900 text-sm">{badge.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{badge.description}</p>
                <p className="text-xs text-amber-600 mt-2 font-medium">{badge.earnedAt}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm mb-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Award size={28} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">まだバッジがありません</p>
            <p className="text-gray-400 text-xs mt-1">ミッションを達成してバッジをゲットしよう！</p>
          </div>
        )}

        {/* 未獲得バッジ */}
        <h2 className="font-black text-gray-900 mb-3 flex items-center gap-2">
          <Lock size={18} className="text-gray-400" />
          未獲得バッジ
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {BADGE_TEMPLATES.map((template, i) => (
            <motion.div
              key={template.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (earnedBadges.length + i) * 0.1 }}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center opacity-60"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3 text-3xl">
                <span>{template.icon}</span>
              </div>
              <h3 className="font-black text-gray-700 text-sm">{template.name}</h3>
              <p className="text-xs text-gray-400 mt-1">{template.description}</p>
              <div className="mt-2 flex items-center justify-center gap-1 text-gray-400">
                <Lock size={11} />
                <span className="text-xs">未獲得</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* バッジについての説明 */}
        <div className="mt-6 bg-rose-50 rounded-2xl p-4 border border-rose-100">
          <h3 className="font-bold text-rose-700 text-sm mb-1">バッジの獲得方法</h3>
          <ul className="space-y-1">
            <li className="text-xs text-rose-600">• デートのミッションをクリアして写真を投稿</li>
            <li className="text-xs text-rose-600">• AIがデート内容に合わせたオリジナルバッジを生成</li>
            <li className="text-xs text-rose-600">• バッジは2人の思い出として永久保存されます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
