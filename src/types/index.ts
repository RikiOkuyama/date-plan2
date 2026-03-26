export type SwipeDirection = 'left' | 'right' | 'up';

export interface Spot {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  lat: number;
  lng: number;
  prefecture: string;
  imageUrl: string;
  priceLevel: 1 | 2 | 3 | 4;
  rating: number;
  tags: string[];
}

export interface SwipeResult {
  spotId: string;
  direction: SwipeDirection;
  userId: 'user1' | 'user2';
}

export interface MatchedSpot {
  spot: Spot;
  priority: 'normal' | 'high'; // right = normal, up = high
}

export interface PlanCondition {
  area: string;
  prefecture: string;
  budget: '~3000' | '~5000' | '~10000' | '~30000';
  duration: 'half' | 'full' | 'overnight';
}

export interface RouteInfo {
  distanceMeters: number;
  durationMinutes: number;
  mode: 'walking' | 'transit';
  description: string;
  estimatedFare: number;
  mapsUrl: string;
}

export interface PlanScheduleItem {
  time: string;
  spot: Spot;
  duration: string;
  memo: string;
  tip?: string;
  transportToNext?: string;
  routeToNext?: RouteInfo;
  estimatedCost: number;
}

export interface CostBreakdown {
  food: number;
  transport: number;
  admission: number;
  cafe: number;
  shopping: number;
  total: number;
}

export interface Mission {
  id: string;
  text: string;
  difficulty: 'easy' | 'hard';
  completed: boolean;
  photoUrl?: string;
}

export interface Badge {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  dateId: string;
  earnedAt: string;
}

export interface DatePlan {
  id: string;
  condition: PlanCondition;
  matchedSpots: MatchedSpot[];
  schedule: PlanScheduleItem[];
  costBreakdown: CostBreakdown;
  missions: Mission[];
  aiSummary: string;
  createdAt: string;
  status: 'planning' | 'completed';
}

export interface Memory {
  id: string;
  planId: string;
  spotId: string;
  spot: Spot;
  photos: string[];
  rating: number;
  note: string;
  visitedAt: string;
  badge?: Badge;
}

export interface UserPair {
  user1Name: string;
  user2Name: string;
  pairedAt: string;
  inviteCode: string;
}
