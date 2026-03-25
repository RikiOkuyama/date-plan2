import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Star, MapPin } from 'lucide-react';
import type { Spot, SwipeDirection } from '../../types';

interface SwipeCardProps {
  spot: Spot;
  onSwipe: (direction: SwipeDirection) => void;
  isTop: boolean;
}

export function SwipeCard({ spot, onSwipe, isTop }: SwipeCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const likeOpacity = useTransform(x, [20, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -20], [1, 0]);
  const superOpacity = useTransform(y, [-100, -20], [1, 0]);

  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info;
    const swipeThreshold = 80;
    const velocityThreshold = 500;

    if (offset.y < -swipeThreshold || velocity.y < -velocityThreshold) {
      onSwipe('up');
    } else if (offset.x > swipeThreshold || velocity.x > velocityThreshold) {
      onSwipe('right');
    } else if (offset.x < -swipeThreshold || velocity.x < -velocityThreshold) {
      onSwipe('left');
    }
  };

  const priceLevels = ['', '¥', '¥¥', '¥¥¥', '¥¥¥¥'];

  return (
    <motion.div
      className="swipe-card select-none"
      style={{ x, y, rotate }}
      drag={isTop ? true : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ cursor: 'grabbing' }}
    >
      <div className="relative w-full bg-white rounded-3xl shadow-xl overflow-hidden">
        <div className="relative h-96">
          <img
            src={spot.imageUrl}
            alt={spot.name}
            className="w-full h-full object-cover"
            draggable={false}
          />

          {/* 右スワイプ：行きたい */}
          <motion.div
            className="absolute top-8 left-6 bg-green-400 text-white font-black text-2xl px-4 py-2 rounded-2xl border-4 border-green-500 rotate-[-15deg]"
            style={{ opacity: likeOpacity }}
          >
            行きたい!
          </motion.div>

          {/* 左スワイプ：パス */}
          <motion.div
            className="absolute top-8 right-6 bg-gray-400 text-white font-black text-2xl px-4 py-2 rounded-2xl border-4 border-gray-500 rotate-[15deg]"
            style={{ opacity: nopeOpacity }}
          >
            パス
          </motion.div>

          {/* 上スワイプ：絶対行きたい */}
          <motion.div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-rose-500 text-white font-black text-xl px-4 py-2 rounded-2xl border-4 border-rose-600"
            style={{ opacity: superOpacity }}
          >
            絶対行きたい!
          </motion.div>

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-5">
            <span className="inline-block bg-white/90 text-xs font-medium text-gray-700 px-2 py-1 rounded-full mb-2">
              {spot.category}
            </span>
            <h2 className="text-white font-black text-2xl leading-tight">{spot.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1 text-yellow-400 text-sm">
                <Star size={14} fill="currentColor" />
                <span className="font-bold">{spot.rating}</span>
              </div>
              <span className="text-white/70 text-sm">{priceLevels[spot.priceLevel]}</span>
              <div className="flex items-center gap-1 text-white/80 text-xs">
                <MapPin size={12} />
                <span>{spot.prefecture}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 pb-5">
          <p className="text-gray-600 text-sm leading-relaxed">{spot.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {spot.tags.map(tag => (
              <span key={tag} className="text-xs bg-rose-50 text-rose-500 px-2.5 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
