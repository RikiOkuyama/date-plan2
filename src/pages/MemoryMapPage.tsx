import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Star, MapPin, Heart } from 'lucide-react';
import { useMemoryStore } from '../store/useMemoryStore';
import { Header } from '../components/layout/Header';

// カスタムマーカーアイコン
const createCustomIcon = (color: string) => L.divIcon({
  html: `<div style="
    width: 36px; height: 36px;
    background: ${color};
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    border: 3px solid white;
    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  className: '',
});

const JAPAN_CENTER: [number, number] = [36.2048, 138.2529];

function MapContent() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export function MemoryMapPage() {
  const navigate = useNavigate();
  const { memories, getPrefectureCount } = useMemoryStore();
  const prefCount = getPrefectureCount();
  const visitedPrefCount = Object.keys(prefCount).length;
  const totalPrefCount = 47;
  const conquestRate = Math.round((visitedPrefCount / totalPrefCount) * 100);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header title="思い出マップ" />

      {/* 制覇率バー */}
      <div className="mx-4 mt-2 mb-2 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Heart size={16} className="text-rose-500" fill="currentColor" />
            <span className="font-bold text-gray-900 text-sm">全国制覇率</span>
          </div>
          <span className="text-2xl font-black text-rose-500">{conquestRate}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${conquestRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          {visitedPrefCount}都道府県 / 47都道府県
        </p>
      </div>

      {/* 地図 */}
      <div className="flex-1 mx-4 mb-2 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
        <MapContainer
          center={JAPAN_CENTER}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapContent />
          {memories.map(memory => (
            <Marker
              key={memory.id}
              position={[memory.spot.lat, memory.spot.lng]}
              icon={createCustomIcon(memory.badge ? '#f43f5e' : '#fb7185')}
              eventHandlers={{
                click: () => {},
              }}
            >
              <Popup>
                <div className="p-1 min-w-[180px]">
                  <img
                    src={memory.photos[0] || memory.spot.imageUrl}
                    alt={memory.spot.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <p className="font-bold text-gray-900 text-sm">{memory.spot.name}</p>
                  <p className="text-xs text-gray-500">{memory.visitedAt}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(memory.rating)].map((_, i) => (
                      <Star key={i} size={12} className="text-yellow-400" fill="currentColor" />
                    ))}
                  </div>
                  {memory.note && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{memory.note}</p>
                  )}
                  <button
                    onClick={() => navigate(`/memories/${memory.id}`)}
                    className="mt-2 w-full text-xs bg-rose-500 text-white py-1.5 rounded-lg font-medium"
                  >
                    詳細を見る
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* 訪問済み都道府県リスト */}
      <div className="mx-4 mb-24 bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-1">
          <MapPin size={14} className="text-rose-500" />
          訪問済みエリア
        </h3>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(prefCount).map(pref => (
            <span
              key={pref}
              className="text-xs bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full font-medium"
            >
              {pref} ({prefCount[pref]})
            </span>
          ))}
          {Object.keys(prefCount).length === 0 && (
            <p className="text-sm text-gray-400">まだ訪問済みの場所がありません</p>
          )}
        </div>
      </div>
    </div>
  );
}
