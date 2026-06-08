'use client';

import React from 'react';
import { cn } from '@/lib/utils';

const LOSHU_ORDER = [4, 9, 2, 3, 5, 7, 8, 1, 6];

interface LoShuGridProps {
  counts?: Record<number, number>;
  className?: string;
}

export function LoShuGrid({ counts, className }: LoShuGridProps) {
  return (
    <div className={cn("grid grid-cols-3 grid-rows-3 aspect-square border-2 border-slate-800 rounded-lg overflow-hidden w-full max-w-[200px] mx-auto", className)}>
      {LOSHU_ORDER.map((num) => {
        const count = counts ? counts[num] : 0;
        const displayValue = count > 0 ? String(num).repeat(count) : num;
        
        return (
          <div 
            key={num} 
            className={cn(
              "border border-slate-800 flex items-center justify-center font-bold transition-all overflow-hidden p-1 break-all text-center leading-none",
              count > 0 
                ? "bg-slate-950 text-slate-100 text-lg sm:text-xl md:text-2xl" 
                : "bg-transparent text-slate-800 text-lg sm:text-xl md:text-2xl"
            )}
            title={`Number ${num}`}
          >
            {displayValue}
          </div>
        );
      })}
    </div>
  );
}
