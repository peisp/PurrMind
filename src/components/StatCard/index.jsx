import React from 'react';

const StatCard = ({ label, value, color = 'primary' }) => (
  <div className={`bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm 
    hover:shadow-md transition-shadow duration-300 border border-gray-100 dark:border-gray-700`}>
    <span className="text-sm text-gray-600 dark:text-gray-400 block">
      {label}
    </span>
    <span className={`text-xl font-semibold text-${color}-600 dark:text-${color}-400`}>
      {value}
    </span>
  </div>
);

export default StatCard; 