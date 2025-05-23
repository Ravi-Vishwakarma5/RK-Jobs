'use client';

import React from 'react';

interface ChartData {
  date: string;
  count: number;
}

interface DashboardChartProps {
  title: string;
  data: ChartData[];
  color: string;
}

const DashboardChart: React.FC<DashboardChartProps> = ({ title, data, color }) => {
  // Find the maximum value for scaling
  const maxCount = Math.max(...data.map(item => item.count), 1);
  
  // Format date to display day of week
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      
      <div className="flex items-end space-x-2 h-40">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center flex-1">
            <div 
              className={`${color} rounded-t w-full`} 
              style={{ 
                height: `${Math.max((item.count / maxCount) * 100, 5)}%`,
                minHeight: '4px'
              }}
            ></div>
            <div className="text-xs text-gray-500 mt-2">{formatDate(item.date)}</div>
            <div className="text-xs font-medium">{item.count}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardChart;
