import React from 'react';

const colorClasses = [
  {
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    ring: 'ring-violet-700/10',
  },
  {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    ring: 'ring-blue-700/10',
  },
  {
    bg: 'bg-green-50',
    text: 'text-green-700',
    ring: 'ring-green-600/10',
  },
  {
    bg: 'bg-pink-50',
    text: 'text-pink-700',
    ring: 'ring-pink-700/10',
  },
  {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    ring: 'ring-yellow-600/10',
  },
];

type CategoryBadgeProps = {
  categoryName: string;
  variant?: 'outline' | 'default';
};

export default function CategoryBadge({
  categoryName,
  variant = 'default',
}: CategoryBadgeProps) {
  // Simple hash to pick a color based on the name
  const hash = categoryName
    .split('')
    .reduce((acc, char) => char.charCodeAt(0) + acc, 0);
  const color = colorClasses[hash % colorClasses.length];

  const baseClasses =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';

  if (variant === 'outline') {
    return (
      <span
        className={`${baseClasses} text-gray-600 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 cursor-pointer`}
      >
        {categoryName}
      </span>
    );
  }

  return (
    <span
      className={`${baseClasses} ${color.bg} ${color.text} ring-1 ring-inset ${color.ring}`}
    >
      {categoryName}
    </span>
  );
}