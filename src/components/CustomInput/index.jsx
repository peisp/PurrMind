import React from 'react';

const CustomInput = ({ value, onChange, onKeyUp, placeholder }) => (
  <input
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    onKeyUp={onKeyUp}
    className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700/50 rounded-xl
             focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent
             bg-white dark:bg-gray-800 text-gray-900 dark:text-white
             placeholder:text-gray-400 dark:placeholder:text-gray-500
             shadow-soft dark:shadow-none transition-shadow duration-300
             hover:shadow-lg"
  />
);

export default CustomInput; 