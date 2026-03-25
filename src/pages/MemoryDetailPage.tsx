import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MapPin, Award, Edit2, Check, Calendar, Plus, X, Camera, Image } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { useMemoryStore } from '../store/useMemoryStore';
import { Button } from '../components/common/Button';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function MemoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { memories, updateMemory } = useMemoryStore();
  const memory = memories.find(m => m.id === id);

  const [isEditing, setIsEditing] = useState(false);
  const [note, setNote] = useState(memory?.note || '');
  const [rating, setRating] = useState(memory?.rating || 0);
  const [photos, setPhotos] = useState<string[]>(memory?.photos || []);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!memory) {
    navigate('/gallery');
    return null;
  }

  const handleSave = () => {
    updateMemory(memory.id, { note, rating, photos });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setNote(memory.note);
    setRating(memory.rating);
    setPhotos(memory.photos);
    setIsEditing(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setIsUploading(true);
    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      setPhotos(prev => [...prev, ...dataUrls]);
      if (!isEditing) setIsEditing(true);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const displayPhotos = isEditing ? photos : memory.photos;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <Header
        title={memory.spot.name}
        showBack
        right={
          isEditing ? (
            <button onClick={handleSave} className="p-1 rounded-full hover:bg-gray-100">
              <Check size={20} className="text-rose-500" />
            </button>
          ) : (
            <button onClick={() => setIsEditing(true)} className="p-1 rounded-full hover:bg-gray-100">
              <Edit2 size={20} className="text-gray-600" />
            </button>
          )
        }
      />

      {/* 写真エリア */}
      <div className="relative">
        {displayPhotos.length > 0 ? (
          <div
            className="grid gap-0.5"
            style={{ gridTemplateColumns: displayPhotos.length === 1 ? '1fr' : '1fr 1fr' }}
          >
            {displayPhotos.map((photo, i) => (
              <div key={i} className="relative">
                <img
                  src={photo}
                  alt=""
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                />
                {isEditing && (
                  <button
                    onClick={() => removePhoto(i)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center"
                  >
                    <X size={14} className="text-white" />
                  </button>
                )}
              </div>
            ))}

            {/* 追加ボタン（編集中のみ表示） */}
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="h-48 bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-400 hover:bg-gray-200 transition-colors"
              >
                {isUploading ? (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-rose-500 animate-spin" />
                ) : (
                  <>
                    <Plus size={24} />
                    <span className="text-xs">写真を追加</span>
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="relative">
            <img src={memory.spot.imageUrl} alt={memory.spot.name} className="w-full h-64 object-cover" />
            <button
              onClick={() => { setIsEditing(true); setTimeout(() => fileInputRef.current?.click(), 50); }}
              disabled={isUploading}
              className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 text-white"
            >
              {isUploading ? (
                <div className="w-8 h-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
              ) : (
                <>
                  <Camera size={32} />
                  <span className="text-sm font-bold">写真を追加する</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* 写真追加ボタン（非編集時・写真なし以外の場合に表示） */}
        {!isEditing && displayPhotos.length > 0 && (
          <button
            onClick={() => { setIsEditing(true); setTimeout(() => fileInputRef.current?.click(), 100); }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full"
          >
            <Image size={13} />
            写真を追加
          </button>
        )}
      </div>

      {/* 非表示のファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="px-4 pt-4 space-y-4">
        {/* 基本情報 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h1 className="font-black text-gray-900 text-xl">{memory.spot.name}</h1>
          <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
            <Calendar size={14} />
            <span>{memory.visitedAt}</span>
            <span>·</span>
            <MapPin size={14} />
            <span className="truncate">{memory.spot.address}</span>
          </div>

          {/* レーティング */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-gray-600 font-medium">評価</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(v => (
                <button
                  key={v}
                  onClick={() => { setRating(v); if (!isEditing) setIsEditing(true); }}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={24}
                    className={v <= (isEditing ? rating : memory.rating) ? 'text-yellow-400' : 'text-gray-200'}
                    fill="currentColor"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* メモ */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2">思い出メモ</h3>
          {isEditing ? (
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="このスポットの思い出を残そう..."
              className="w-full bg-gray-50 rounded-xl p-3 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-rose-300 resize-none"
              rows={4}
            />
          ) : (
            <p className="text-sm text-gray-700 leading-relaxed">
              {memory.note || (
                <span
                  className="text-gray-400 cursor-pointer"
                  onClick={() => setIsEditing(true)}
                >
                  タップしてメモを追加...
                </span>
              )}
            </p>
          )}
        </div>

        {/* スポット情報 */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-2">スポット情報</h3>
          <p className="text-sm text-gray-600 leading-relaxed">{memory.spot.description}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {memory.spot.tags.map(tag => (
              <span key={tag} className="text-xs bg-rose-50 text-rose-500 px-2.5 py-1 rounded-full font-medium">
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* バッジ */}
        {memory.badge && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl p-4 border border-yellow-200 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-md">
                <Award size={28} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-amber-600 font-medium mb-0.5">獲得バッジ</p>
                <h3 className="font-black text-gray-900">{memory.badge.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{memory.badge.description}</p>
              </div>
            </div>
          </motion.div>
        )}

        {isEditing && (
          <div className="flex gap-3 pb-4">
            <Button variant="outline" onClick={handleCancel} className="flex-1">
              キャンセル
            </Button>
            <Button onClick={handleSave} className="flex-1">
              保存する
            </Button>
          </div>
        )}
      </div>

      {/* 写真フルスクリーン表示 */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
          >
            <button className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <X size={20} className="text-white" />
            </button>
            <img
              src={selectedPhoto}
              alt=""
              className="max-w-full max-h-full object-contain"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
