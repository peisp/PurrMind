import React from 'react';

const PrimaryButton = ({ children, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl
               hover:shadow-lg hover:opacity-90 active:opacity-80
               transition-all duration-300 focus:outline-none focus:ring-2 
               focus:ring-primary-400 focus:ring-offset-2 font-medium ${className}`}
  >
    {children}
  </button>
);

export default PrimaryButton; 