import type { CostBreakdown } from '../../types';
import { UtensilsCrossed, Train, Ticket, Coffee, ShoppingBag, AlertTriangle } from 'lucide-react';

interface CostSimulationProps {
  breakdown: CostBreakdown;
  budget: string;
}

const budgetMax: Record<string, number> = {
  '~3000': 3000,
  '~5000': 5000,
  '~10000': 10000,
  '~30000': 30000,
};

const costItems = [
  { key: 'food', label: '飲食', icon: UtensilsCrossed, color: 'text-orange-500' },
  { key: 'transport', label: '交通費', icon: Train, color: 'text-blue-500' },
  { key: 'admission', label: '入場料', icon: Ticket, color: 'text-purple-500' },
  { key: 'cafe', label: 'カフェ', icon: Coffee, color: 'text-amber-600' },
  { key: 'shopping', label: 'ショッピング', icon: ShoppingBag, color: 'text-pink-500' },
] as const;

export function CostSimulation({ breakdown, budget }: CostSimulationProps) {
  const max = budgetMax[budget] || 10000;
  const isOver = breakdown.total > max;
  const percentage = Math.min((breakdown.total / max) * 100, 100);

  return (
    <div className={`rounded-2xl p-4 border ${isOver ? 'border-red-200 bg-red-50' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900 text-sm">支払いシミュレーション（1人あたり）</h3>
        {isOver && (
          <div className="flex items-center gap-1 text-red-500 text-xs font-medium">
            <AlertTriangle size={14} />
            予算オーバー
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        {costItems.map(({ key, label, icon: Icon, color }) => {
          const amount = breakdown[key as keyof CostBreakdown] as number;
          if (amount === 0) return null;
          return (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={14} className={color} />
                <span className="text-sm text-gray-600">{label}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">¥{amount.toLocaleString()}</span>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-200 pt-3 mb-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-900">合計</span>
          <span className={`text-xl font-black ${isOver ? 'text-red-500' : 'text-gray-900'}`}>
            ¥{breakdown.total.toLocaleString()}
          </span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>¥0</span>
          <span>予算 ¥{max.toLocaleString()}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${isOver ? 'bg-red-400' : 'bg-gradient-to-r from-green-400 to-emerald-500'}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {isOver && (
          <p className="text-xs text-red-500 mt-2">
            予算を¥{(breakdown.total - max).toLocaleString()}オーバーしています。AIチャットで調整できます。
          </p>
        )}
      </div>
    </div>
  );
}
