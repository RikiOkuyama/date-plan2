import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Calendar, Award, Image } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { useMemoryStore } from '../store/useMemoryStore';

export function GalleryPage() {
  const navigate = useNavigate();
  const { memories } = useMemoryStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header title="思い出ギャラリー" />

      {memories.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Image size={32} className="text-gray-400" />
          </div>
          <h2 className="text-gray-700 font-bold text-lg">まだ思い出がありません</h2>
          <p className="text-gray-400 text-sm mt-2 text-center">
            デートが完了したら思い出が追加されます
          </p>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <div className="grid grid-cols-1 gap-4">
            {memories.map((memory, i) => (
              <motion.div
                key={memory.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/memories/${memory.id}`)}
              >
                {/* 写真グリッド */}
                <div className="relative">
                  {memory.photos.length === 1 ? (
                    <img
                      src={memory.photos[0]}
                      alt={memory.spot.name}
                      className="w-full h-52 object-cover"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-0.5 h-52">
                      {memory.photos.slice(0, 4).map((photo, pi) => (
                        <div key={pi} className={`${memory.photos.length === 3 && pi === 0 ? 'row-span-2' : ''} overflow-hidden`}>
                          <img src={photo} alt="" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {memory.badge && (
                    <div className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                      <Award size={20} className="text-yellow-500" />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-gray-900">{memory.spot.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Calendar size={11} />
                        <span>{memory.visitedAt}</span>
                        <span className="mx-1">·</span>
                        <span>{memory.spot.category}</span>
                      </div>
                    </div>
                    {memory.rating > 0 && (
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={i < memory.rating ? 'text-yellow-400' : 'text-gray-200'}
                            fill="currentColor"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {memory.note && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{memory.note}</p>
                  )}
                  {memory.badge && (
                    <div className="flex items-center gap-2 mt-3 bg-yellow-50 rounded-xl px-3 py-2">
                      <Award size={16} className="text-yellow-500" />
                      <span className="text-xs text-yellow-700 font-medium">{memory.badge.name}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
