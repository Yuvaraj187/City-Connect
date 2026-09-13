// components/authority/Dashboard.tsx - FINAL SIMPLIFIED VERSION

import React from 'react';
// THE FIX IS HERE: We now import the chart components directly from the library.
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { kpis, revenueData, passengerVolumeData } from '../../data';

// KpiCard component is unchanged and correct.
const KpiCard: React.FC<{ title: string; value: string; change: string; changeType: 'increase' | 'decrease' }> = ({ title, value, change, changeType }) => {
  const isIncrease = changeType === 'increase';
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border dark:bg-slate-800 dark:border-slate-700">
      <h4 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h4>
      <p className="text-3xl font-bold mt-1 text-slate-800 dark:text-slate-100">{value}</p>
      <div className="flex items-center mt-2">
        <span className={`text-sm font-semibold ${isIncrease ? 'text-green-600' : 'text-red-600'}`}>{change}</span>
        <span className="text-xs text-slate-400 dark:text-slate-500 ml-1">vs last period</span>
      </div>
    </div>
  );
};

const Dashboard: React.FC = () => {
  // We check for dark mode to style the chart text correctly.
  const isDarkMode = document.documentElement.classList.contains('dark');
  const chartTextColor = isDarkMode ? '#cbd5e1' : '#64748b';
  const chartGridColor = isDarkMode ? '#334155' : '#e2e8f0';

  // THE FIX: The entire complex useEffect and useState for loading is GONE.
  // It's no longer needed because the library is imported directly.

  return (
    <div className="space-y-8">
      {/* KPIs Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map(kpi => <KpiCard key={kpi.title} {...kpi} />)}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-96 dark:bg-slate-800 dark:border-slate-700">
              <h4 className="font-bold text-lg text-slate-700 mb-4 dark:text-slate-200">Monthly Revenue (in ₹1000s)</h4>
              <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                      <XAxis dataKey="month" tick={{ fill: chartTextColor }} />
                      <YAxis tick={{ fill: chartTextColor }} />
                      <Tooltip
                          contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                          cursor={{fill: isDarkMode ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.5)'}}
                      />
                      <Legend wrapperStyle={{ color: chartTextColor }} />
                      <Bar dataKey="revenue" fill="#4F46E5" name="Revenue (₹)" />
                  </BarChart>
              </ResponsiveContainer>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-100 h-96 dark:bg-slate-800 dark:border-slate-700">
              <h4 className="font-bold text-lg text-slate-700 mb-4 dark:text-slate-200">Daily Passenger Volume</h4>
              <ResponsiveContainer width="100%" height="90%">
                  <LineChart data={passengerVolumeData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} />
                      <XAxis dataKey="day" tick={{ fill: chartTextColor }} />
                      <YAxis tick={{ fill: chartTextColor }} />
                      <Tooltip 
                          contentStyle={{ backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', borderColor: isDarkMode ? '#334155' : '#e2e8f0' }}
                          cursor={{stroke: isDarkMode ? '#475569' : '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3'}}
                      />
                      <Legend wrapperStyle={{ color: chartTextColor }} />
                      <Line type="monotone" dataKey="passengers" stroke="#10b981" strokeWidth={2} name="Passengers" activeDot={{ r: 8 }} />
                  </LineChart>
              </ResponsiveContainer>
          </div>
    </div>
    </div>
  );
};

export default Dashboard;