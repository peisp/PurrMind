import React from 'react';

const FilterButton = ({ icon, label, count, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors
      ${active
        ? 'bg-primary bg-opacity-10 text-primary-600 dark:text-primary-400'
        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
      }`}
  >
    <span className="text-xl mr-2">{icon}</span>
    <span className="flex-1">{label}</span>
    {count !== undefined && (
      <span className="text-sm bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
        {count}
      </span>
    )}
  </button>
);

export default FilterButton; 