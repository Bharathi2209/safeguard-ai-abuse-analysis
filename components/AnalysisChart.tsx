
import React from 'react';
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from 'recharts';
import { Metric } from '../types';

interface AnalysisChartProps {
  metrics: Metric[];
}

const AnalysisChart: React.FC<AnalysisChartProps> = ({ metrics }) => {
  const getBarColor = (score: number) => {
    if (score > 0.7) return '#f43f5e'; // Red
    if (score > 0.4) return '#fbbf24'; // Amber
    return '#10b981'; // Emerald
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
        <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Risk Vector Analysis</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics}>
              <PolarGrid stroke="#f1f5f9" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
              <PolarRadiusAxis angle={30} domain={[0, 1]} tick={false} axisLine={false} />
              <Radar
                name="Severity"
                dataKey="score"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
        <h3 className="text-[10px] font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Category Ranking</h3>
        <div className="flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics} layout="vertical" margin={{ left: 10, right: 30 }}>
              <XAxis type="number" domain={[0, 1]} hide />
              <YAxis 
                dataKey="category" 
                type="category" 
                tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                width={100}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={24}>
                {metrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalysisChart;
