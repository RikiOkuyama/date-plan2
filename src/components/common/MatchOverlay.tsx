import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import type { Spot } from '../../types';

interface MatchOverlayProps {
  spot: Spot | null;
  onDismiss: () => void;
}

export function MatchOverlay({ spot, onDismiss }: MatchOverlayProps) {
  return (
    <AnimatePresence>
      {spot && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={onDismiss}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="bg-white rounded-3xl p-8 mx-6 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: 3, duration: 0.4 }}
              className="flex justify-center mb-4"
            >
              <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
                <Heart size={32} className="text-rose-500" fill="currentColor" />
              </div>
            </motion.div>

            <h2 className="text-2xl font-black text-gray-900 mb-1">マッチ!</h2>
            <p className="text-gray-500 text-sm mb-4">2人とも行きたいと思ってる！</p>

            <img
              src={spot.imageUrl}
              alt={spot.name}
              className="w-full h-36 object-cover rounded-2xl mb-3"
            />
            <p className="font-bold text-gray-900 text-base">{spot.name}</p>
            <p className="text-sm text-gray-500 mt-1">{spot.category}</p>

            <button
              onClick={onDismiss}
              className="mt-5 w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 rounded-2xl"
            >
              次のスポットへ
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
