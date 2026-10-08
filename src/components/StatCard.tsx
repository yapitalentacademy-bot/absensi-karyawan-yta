'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: 'blue' | 'emerald' | 'amber' | 'rose' | 'purple';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
}) => {
  const colorMap = {
    blue: {
      bg: 'from-blue-600/20 to-indigo-600/10 border-blue-500/30',
      iconBg: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
      valueColor: 'text-blue-300',
    },
    emerald: {
      bg: 'from-emerald-600/20 to-teal-600/10 border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      valueColor: 'text-emerald-300',
    },
    amber: {
      bg: 'from-amber-600/20 to-yellow-600/10 border-amber-500/30',
      iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      valueColor: 'text-amber-300',
    },
    rose: {
      bg: 'from-rose-600/20 to-pink-600/10 border-rose-500/30',
      iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      valueColor: 'text-rose-300',
    },
    purple: {
      bg: 'from-purple-600/20 to-indigo-600/10 border-purple-500/30',
      iconBg: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
      valueColor: 'text-purple-300',
    },
  };

  const scheme = colorMap[colorScheme];

  return (
    <div className={`glass-panel p-5 rounded-2xl border bg-gradient-to-br ${scheme.bg} transition-all duration-300 hover:scale-[1.02] shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-3xl font-extrabold tracking-tight ${scheme.valueColor}`}>
            {value}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-inner ${scheme.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};
