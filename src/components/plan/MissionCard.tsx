import { motion } from 'framer-motion';
import type { Mission } from '../../types';
import { CheckCircle2, Circle, Zap, Flame } from 'lucide-react';

interface MissionCardProps {
  mission: Mission;
  onComplete: (id: string) => void;
}

export function MissionCard({ mission, onComplete }: MissionCardProps) {
  return (
    <motion.div
      layout
      className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
        mission.completed
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-100'
      }`}
    >
      <button
        onClick={() => !mission.completed && onComplete(mission.id)}
        className="mt-0.5 flex-shrink-0"
        disabled={mission.completed}
      >
        {mission.completed ? (
          <CheckCircle2 size={22} className="text-green-500" fill="currentColor" />
        ) : (
          <Circle size={22} className="text-gray-300" />
        )}
      </button>

      <div className="flex-1">
        <p className={`text-sm leading-relaxed ${mission.completed ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
          {mission.text}
        </p>
        <div className="flex items-center gap-1 mt-1">
          {mission.difficulty === 'hard' ? (
            <span className="flex items-center gap-1 text-xs text-orange-500 font-medium">
              <Flame size={11} />
              チャレンジ
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-blue-400 font-medium">
              <Zap size={11} />
              ゆる達成
            </span>
          )}
          {mission.completed && (
            <span className="text-xs text-green-500 font-medium ml-1">達成！</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
