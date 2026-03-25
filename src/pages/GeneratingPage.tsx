import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { usePlanStore } from '../store/usePlanStore';

const MESSAGES = [
  'マッチしたスポットを分析中...',
  '2人の好みを確認しています...',
  '最適な移動ルートを計算中...',
  '予算に合わせて調整中...',
  'ミッションを生成しています...',
  'もうすぐ完成です！',
];

export function GeneratingPage() {
  const navigate = useNavigate();
  const { generatePlan, isGenerating, currentPlan } = usePlanStore();

  useEffect(() => {
    generatePlan();
  }, []);

  useEffect(() => {
    if (currentPlan && !isGenerating) {
      navigate('/plan/result');
    }
  }, [currentPlan, isGenerating, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-500 via-pink-500 to-orange-400 flex flex-col items-center justify-center px-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        className="w-20 h-20 rounded-full border-4 border-white/30 border-t-white mb-8"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Sparkles size={24} className="text-white" />
          <h1 className="text-white text-2xl font-black">AIがプランを作成中</h1>
          <Sparkles size={24} className="text-white" />
        </div>

        <motion.div
          key="message"
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {MESSAGES.map((msg, i) => (
            <motion.p
              key={msg}
              className="text-white/80 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ delay: i * 0.4, duration: 0.8, repeat: Infinity, repeatDelay: MESSAGES.length * 0.4 - 0.8 }}
            >
              {msg}
            </motion.p>
          ))}
        </motion.div>
      </motion.div>

      <div className="absolute bottom-16 flex gap-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-white/60"
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ delay: i * 0.2, duration: 0.8, repeat: Infinity }}
          />
        ))}
      </div>
    </div>
  );
}
