import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Heart, Star, ChevronUp, Users, CheckCircle2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { SwipeCard } from '../components/swipe/SwipeCard';
import { MatchOverlay } from '../components/common/MatchOverlay';
import { usePlanStore } from '../store/usePlanStore';
import { useAppStore } from '../store/useAppStore';
import type { Spot, SwipeDirection } from '../types';
import { Button } from '../components/common/Button';

type SwipePhase = 'user1' | 'user2' | 'done';

export function SwipePage() {
  const navigate = useNavigate();
  const { availableSpots, swipeResults, addSwipeResult, condition } = usePlanStore();
  const { user1Name, user2Name } = useAppStore();

  const [phase, setPhase] = useState<SwipePhase>('user1');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchedSpot, setMatchedSpot] = useState<Spot | null>(null);
  const [_swipedRight, setSwipedRight] = useState<Set<string>>(new Set());

  const currentUser = phase === 'user1' ? 'user1' : 'user2';
  const currentUserName = phase === 'user1' ? user1Name : user2Name;
  const spots = availableSpots.slice(0, 15);

  useEffect(() => {
    if (!condition) navigate('/plan/new');
  }, [condition, navigate]);

  const handleSwipe = (direction: SwipeDirection) => {
    if (currentIndex >= spots.length) return;
    const spot = spots[currentIndex];

    addSwipeResult({ spotId: spot.id, direction, userId: currentUser });

    if (direction !== 'left' && phase === 'user2') {
      const u1Result = swipeResults.find(r => r.spotId === spot.id && r.userId === 'user1');
      if (u1Result && u1Result.direction !== 'left') {
        setMatchedSpot(spot);
      }
    }

    if (direction !== 'left') {
      setSwipedRight(prev => new Set([...prev, spot.id]));
    }

    setCurrentIndex(prev => prev + 1);
  };

  const handleButtonSwipe = (direction: SwipeDirection) => handleSwipe(direction);

  const handlePhaseEnd = () => {
    if (phase === 'user1') {
      setPhase('user2');
      setCurrentIndex(0);
      setSwipedRight(new Set());
    } else {
      navigate('/plan/generating');
    }
  };

  const isDone = currentIndex >= spots.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-4">
      <Header title={`${currentUserName}のスワイプ`} />

      {/* ユーザー切り替えインジケーター */}
      <div className="px-4 pt-2 pb-3">
        <div className="flex items-center bg-white rounded-2xl p-1 shadow-sm border border-gray-100">
          <div className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
            phase === 'user1' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-400'
          }`}>
            <Users size={15} />
            {user1Name}
          </div>
          <div className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-bold transition-all ${
            phase === 'user2' ? 'bg-rose-500 text-white shadow-sm' : 'text-gray-400'
          }`}>
            {phase === 'user1' ? <span className="text-xs">🔒</span> : <Users size={15} />}
            {user2Name}
          </div>
        </div>
      </div>

      {/* 操作ヒント */}
      <div className="px-4 mb-3">
        <div className="flex justify-between text-xs text-gray-400 bg-white rounded-xl px-4 py-2 border border-gray-100">
          <span className="flex items-center gap-1"><X size={11} className="text-gray-400" />左：パス</span>
          <span className="flex items-center gap-1 text-rose-500"><Star size={11} fill="currentColor" />上：絶対行きたい！</span>
          <span className="flex items-center gap-1 text-green-500"><Heart size={11} fill="currentColor" />右：行きたい</span>
        </div>
      </div>

      {/* スワイプカードエリア */}
      <div className="px-4">
        <div className="relative" style={{ height: '520px' }}>
          {!isDone ? (
            <>
              {spots.slice(currentIndex, currentIndex + 2).reverse().map((spot, i, arr) => (
                <SwipeCard
                  key={spot.id}
                  spot={spot}
                  onSwipe={handleSwipe}
                  isTop={i === arr.length - 1}
                />
              ))}

              {/* 進捗インジケーター */}
              <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
                {currentIndex + 1} / {spots.length}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center h-full text-center"
            >
              <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                <CheckCircle2 size={40} className="text-rose-500" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">
                {currentUserName}のスワイプ完了！
              </h2>
              {phase === 'user1' && (
                <p className="text-gray-500 text-sm mb-6">
                  次は{user2Name}がスワイプします
                </p>
              )}
              {phase === 'user2' && (
                <p className="text-gray-500 text-sm mb-6">
                  2人のスワイプが完了しました！AIがプランを作ります
                </p>
              )}
              <Button onClick={handlePhaseEnd} size="lg" className="px-10">
                {phase === 'user1' ? `${user2Name}に渡す` : 'プランを生成する'}
              </Button>
            </motion.div>
          )}
        </div>

        {/* ボタン操作 */}
        {!isDone && (
          <div className="flex items-center justify-center gap-5 mt-3">
            <button
              onClick={() => handleButtonSwipe('left')}
              className="w-14 h-14 rounded-full bg-white shadow-md border border-gray-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              <X size={24} className="text-gray-500" />
            </button>
            <button
              onClick={() => handleButtonSwipe('up')}
              className="w-12 h-12 rounded-full bg-white shadow-md border border-rose-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              <ChevronUp size={22} className="text-rose-500" />
            </button>
            <button
              onClick={() => handleButtonSwipe('right')}
              className="w-14 h-14 rounded-full bg-rose-500 shadow-md flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
            >
              <Heart size={24} className="text-white" fill="white" />
            </button>
          </div>
        )}
      </div>

      <MatchOverlay spot={matchedSpot} onDismiss={() => setMatchedSpot(null)} />
    </div>
  );
}
