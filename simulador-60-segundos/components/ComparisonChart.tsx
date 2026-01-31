import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../utils/finance';
import { AmortizationResult } from '../types';

interface ComparisonChartProps {
  sacData: AmortizationResult;
  priceData: AmortizationResult;
}

const ComparisonChart: React.FC<ComparisonChartProps> = ({ sacData, priceData }) => {
  // Sample data to improve performance, take every nth item if array is large
  const step = Math.ceil(sacData.schedule.length / 30); // Limit to ~30 points
  const chartData = sacData.schedule
    .filter((_, index) => index % step === 0 || index === sacData.schedule.length - 1)
    .map((item, index) => {
      // Find corresponding price item safely
      const priceItem = priceData.schedule.find(p => p.month === item.month) || priceData.schedule[index];
      return {
        month: item.month,
        sacInstallment: item.installment,
        priceInstallment: priceItem.installment,
      };
    });

  return (
    <div className="h-64 w-full mt-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-sm font-semibold text-gray-700 mb-4 text-center">Evolução das Parcelas (R$)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <defs>
            <linearGradient id="colorSac" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="month" 
            tick={{fontSize: 10, fill: '#6b7280'}} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `Mês ${val}`}
          />
          <YAxis 
            tick={{fontSize: 10, fill: '#6b7280'}} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => `R$${(val/1000).toFixed(0)}k`}
          />
          <Tooltip 
            formatter={(value: number) => formatCurrency(value)}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }}/>
          <Area 
            type="monotone" 
            dataKey="sacInstallment" 
            name="Parcela SAC" 
            stroke="#10b981" 
            strokeWidth={2}
            fill="url(#colorSac)" 
          />
          <Area 
            type="monotone" 
            dataKey="priceInstallment" 
            name="Parcela PRICE" 
            stroke="#3b82f6" 
            strokeWidth={2}
            fill="url(#colorPrice)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ComparisonChart;