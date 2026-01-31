import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
  color?: 'blue' | 'emerald' | 'indigo' | 'slate';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, subValue, highlight, color = 'slate' }) => {
  const colorClasses = {
    blue: 'border-l-blue-500 bg-blue-50',
    emerald: 'border-l-emerald-500 bg-emerald-50',
    indigo: 'border-l-indigo-500 bg-indigo-50',
    slate: 'border-l-slate-500 bg-slate-50',
  };

  return (
    <div className={`p-4 rounded-r-lg border-l-4 shadow-sm ${colorClasses[color]} transition-all duration-300 hover:shadow-md`}>
      <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 ${highlight ? 'text-gray-900' : 'text-gray-700'}`}>
        {value}
      </p>
      {subValue && (
        <p className="text-xs text-gray-500 mt-1">{subValue}</p>
      )}
    </div>
  );
};

export default StatCard;