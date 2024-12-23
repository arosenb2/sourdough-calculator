import React from 'react';
import { formatPercentage } from '../../utils/formatting';

export default function RecipeRow({ label, weight, percentage, isTotal, isHeader }) {
  const baseClasses = isHeader 
    ? "border-b border-gray-200 dark:border-gray-600 font-semibold text-gray-600 dark:text-gray-300"
    : isTotal
      ? "font-semibold border-t border-gray-200 dark:border-gray-600 pt-2 text-gray-800 dark:text-white"
      : "text-gray-800 dark:text-gray-200";

  return (
    <>
      <div className={baseClasses}>{label}</div>
      <div className={`text-right ${baseClasses}`}>
        {weight !== undefined && `${weight}g`}
      </div>
      <div className={`text-right ${baseClasses}`}>
        {percentage !== undefined && `${formatPercentage(percentage)}%`}
      </div>
    </>
  );
}