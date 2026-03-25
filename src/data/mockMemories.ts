import type { Memory } from '../types';
import { mockSpots } from './mockSpots';

export const mockMemories: Memory[] = [
  {
    id: 'mem-1',
    planId: 'plan-demo-1',
    spotId: 'spot-4',
    spot: mockSpots[3],
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
    ],
    rating: 5,
    note: '最高の夕日だった！また来たい',
    visitedAt: '2026-02-14',
    badge: {
      id: 'badge-1',
      name: '波と恋人バッジ',
      imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=200&q=80',
      description: '江の島で特別な思い出を作ったカップルに贈られるバッジ',
      dateId: 'plan-demo-1',
      earnedAt: '2026-02-14',
    },
  },
  {
    id: 'mem-2',
    planId: 'plan-demo-2',
    spotId: 'spot-7',
    spot: mockSpots[6],
    photos: [
      'https://images.unsplash.com/photo-1551913902-c92207136625?w=400&q=80',
    ],
    rating: 5,
    note: 'チームラボ、幻想的すぎた。2人で同じ場所に立って写真撮った',
    visitedAt: '2026-01-20',
    badge: {
      id: 'badge-2',
      name: '光の旅人バッジ',
      imageUrl: 'https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=200&q=80',
      description: 'デジタルアートの世界を2人で旅したカップルに贈られるバッジ',
      dateId: 'plan-demo-2',
      earnedAt: '2026-01-20',
    },
  },
  {
    id: 'mem-3',
    planId: 'plan-demo-3',
    spotId: 'spot-2',
    spot: mockSpots[1],
    photos: [
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80',
    ],
    rating: 4,
    note: '渋谷スカイ、夜がきれいだった',
    visitedAt: '2025-12-31',
  },
];
