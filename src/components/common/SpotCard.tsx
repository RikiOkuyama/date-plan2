import type { Spot } from '../../types';
import { Star, MapPin } from 'lucide-react';

interface SpotCardProps {
  spot: Spot;
  onClick?: () => void;
  compact?: boolean;
}

const priceLevelLabel = ['', '¥', '¥¥', '¥¥¥', '¥¥¥¥'];

export function SpotCard({ spot, onClick, compact = false }: SpotCardProps) {
  if (compact) {
    return (
      <div
        className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
        onClick={onClick}
      >
        <img
          src={spot.imageUrl}
          alt={spot.name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 text-sm truncate">{spot.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{spot.category}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="flex items-center gap-0.5 text-xs text-yellow-500">
              <Star size={11} fill="currentColor" />
              {spot.rating}
            </span>
            <span className="text-xs text-gray-400">{priceLevelLabel[spot.priceLevel]}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="relative">
        <img
          src={spot.imageUrl}
          alt={spot.name}
          className="w-full h-48 object-cover"
        />
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 px-2 py-1 rounded-full">
          {spot.category}
        </span>
        <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
          {priceLevelLabel[spot.priceLevel]}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-base">{spot.name}</h3>
        <div className="flex items-center gap-1 mt-1 text-gray-500 text-xs">
          <MapPin size={12} />
          <span>{spot.address}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{spot.description}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="flex items-center gap-1 text-sm text-yellow-500 font-medium">
            <Star size={14} fill="currentColor" />
            {spot.rating}
          </span>
          <div className="flex gap-1 flex-wrap">
            {spot.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-xs bg-rose-50 text-rose-600 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
