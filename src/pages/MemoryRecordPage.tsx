import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, Check, Plus, X, MapPin, CheckCircle2 } from 'lucide-react';
import { Header } from '../components/layout/Header';
import { Button } from '../components/common/Button';
import { usePlanStore } from '../store/usePlanStore';
import { useMemoryStore } from '../store/useMemoryStore';
import type { Memory } from '../types';

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface SpotRecord {
  spotId: string;
  visited: boolean;
  photos: string[];
  uploading: boolean;
}

export function MemoryRecordPage() {
  const navigate = useNavigate();
  const { currentPlan } = usePlanStore();
  const { addMemory } = useMemoryStore();

  const [records, setRecords] = useState<SpotRecord[]>(
    () => (currentPlan?.schedule ?? []).map(item => ({
      spotId: item.spot.id,
      visited: true,
      photos: [],
      uploading: false,
    }))
  );

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!currentPlan) {
    navigate('/');
    return null;
  }

  const toggleVisited = (spotId: string) => {
    setRecords(prev => prev.map(r => r.spotId === spotId ? { ...r, visited: !r.visited } : r));
  };

  const handleFileChange = async (spotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setRecords(prev => prev.map(r => r.spotId === spotId ? { ...r, uploading: true } : r));
    try {
      const dataUrls = await Promise.all(files.map(fileToDataUrl));
      setRecords(prev => prev.map(r =>
        r.spotId === spotId ? { ...r, photos: [...r.photos, ...dataUrls], uploading: false } : r
      ));
    } catch {
      setRecords(prev => prev.map(r => r.spotId === spotId ? { ...r, uploading: false } : r));
    }
    if (fileInputRefs.current[spotId]) fileInputRefs.current[spotId]!.value = '';
  };

  const removePhoto = (spotId: string, index: number) => {
    setRecords(prev => prev.map(r =>
      r.spotId === spotId ? { ...r, photos: r.photos.filter((_, i) => i !== index) } : r
    ));
  };

  const handleSave = () => {
    const visitedDate = new Date().toISOString().split('T')[0];
    records.filter(r => r.visited).forEach(record => {
      const item = currentPlan.schedule.find(s => s.spot.id === record.spotId);
      if (!item) return;
      const memory: Memory = {
        id: `mem-${Date.now()}-${record.spotId}`,
        planId: currentPlan.id,
        spotId: record.spotId,
        spot: item.spot,
        photos: record.photos,
        rating: 0,
        note: '',
        visitedAt: visitedDate,
      };
      addMemory(memory);
    });
    navigate('/gallery');
  };

  const visitedCount = records.filter(r => r.visited).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      <Header title="思い出を記録する" showBack />

      <div className="px-4 pt-4 pb-2">
        <p className="text-sm text-gray-500">
          行ったスポットを選んで写真を追加しよう。写真は後からでも追加できるよ。
        </p>
      </div>

      <div className="px-4 space-y-4 mt-2">
        {currentPlan.schedule.map((item, i) => {
          const record = records.find(r => r.spotId === item.spot.id)!;
          return (
            <motion.div
              key={item.spot.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`bg-white rounded-2xl shadow-sm border overflow-hidden transition-all ${
                record.visited ? 'border-rose-200' : 'border-gray-100 opacity-60'
              }`}
            >
              {/* スポットヘッダー */}
              <div className="flex items-center gap-3 p-3">
                <img
                  src={item.spot.imageUrl}
                  alt={item.spot.name}
                  className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 text-xs text-rose-500 font-bold mb-0.5">
                    <span>{item.time}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">{item.spot.name}</h3>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin size={10} />
                    {item.spot.category}
                  </p>
                </div>
                {/* 行った/行かなかったトグル */}
                <button
                  onClick={() => toggleVisited(item.spot.id)}
                  className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    record.visited ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Check size={18} />
                </button>
              </div>

              {/* 写真エリア（行ったスポットのみ） */}
              {record.visited && (
                <div className="px-3 pb-3">
                  <div className="flex gap-2 flex-wrap">
                    {/* アップロード済み写真 */}
                    {record.photos.map((photo, pi) => (
                      <div key={pi} className="relative w-20 h-20">
                        <img src={photo} alt="" className="w-20 h-20 rounded-xl object-cover" />
                        <button
                          onClick={() => removePhoto(item.spot.id, pi)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center"
                        >
                          <X size={11} className="text-white" />
                        </button>
                      </div>
                    ))}

                    {/* 写真追加ボタン */}
                    <button
                      onClick={() => fileInputRefs.current[item.spot.id]?.click()}
                      disabled={record.uploading}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center gap-1 text-rose-400 hover:border-rose-400 hover:bg-rose-50 transition-colors"
                    >
                      {record.uploading ? (
                        <div className="w-5 h-5 rounded-full border-2 border-rose-200 border-t-rose-500 animate-spin" />
                      ) : record.photos.length === 0 ? (
                        <>
                          <Camera size={20} />
                          <span className="text-xs font-medium">写真追加</span>
                        </>
                      ) : (
                        <Plus size={20} />
                      )}
                    </button>
                  </div>

                  <input
                    ref={el => { fileInputRefs.current[item.spot.id] = el; }}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => handleFileChange(item.spot.id, e)}
                  />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 保存ボタン（固定フッター） */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-4 max-w-md mx-auto">
        <Button fullWidth size="lg" onClick={handleSave} disabled={visitedCount === 0}>
          <CheckCircle2 size={18} className="mr-2" />
          {visitedCount}件をギャラリーに保存する
        </Button>
      </div>
    </div>
  );
}
