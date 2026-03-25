import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  right?: ReactNode;
  transparent?: boolean;
}

export function Header({ title, showBack = false, right, transparent = false }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={`flex items-center justify-between px-4 py-3 ${
        transparent ? 'bg-transparent' : 'bg-white border-b border-gray-100'
      }`}
    >
      <div className="w-10">
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
        )}
      </div>
      <h1 className="text-base font-bold text-gray-900 flex-1 text-center">{title}</h1>
      <div className="w-10 flex justify-end">{right}</div>
    </header>
  );
}
