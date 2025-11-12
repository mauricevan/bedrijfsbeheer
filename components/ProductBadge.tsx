import React from 'react';
import { ProductBadge as BadgeType } from '../types';

interface ProductBadgeProps {
  badge: BadgeType;
  size?: 'sm' | 'md' | 'lg';
}

export const ProductBadge: React.FC<ProductBadgeProps> = ({ badge, size = 'md' }) => {
  const getBadgeStyles = (): { bg: string; text: string; icon?: string } => {
    switch (badge.type) {
      case 'new':
        return { bg: 'bg-green-500', text: 'text-white', icon: '🆕' };
      case 'sale':
        return { bg: 'bg-red-500', text: 'text-white', icon: '🔥' };
      case 'featured':
        return { bg: 'bg-yellow-500', text: 'text-white', icon: '⭐' };
      case 'bestseller':
        return { bg: 'bg-purple-500', text: 'text-white', icon: '🏆' };
      case 'lowstock':
        return { bg: 'bg-orange-500', text: 'text-white', icon: '⚠️' };
      case 'custom':
        return {
          bg: badge.color || 'bg-blue-500',
          text: 'text-white',
        };
      default:
        return { bg: 'bg-gray-500', text: 'text-white' };
    }
  };

  const getSizeClasses = (): string => {
    switch (size) {
      case 'sm':
        return 'text-xs px-2 py-0.5';
      case 'lg':
        return 'text-sm px-3 py-1.5';
      case 'md':
      default:
        return 'text-xs px-2.5 py-1';
    }
  };

  const getLabel = (): string => {
    if (badge.label) return badge.label;

    switch (badge.type) {
      case 'new':
        return 'NIEUW';
      case 'sale':
        return 'ACTIE';
      case 'featured':
        return 'UITGELICHT';
      case 'bestseller':
        return 'BESTSELLER';
      case 'lowstock':
        return 'WEINIG VOORRAAD';
      default:
        return 'LABEL';
    }
  };

  const styles = getBadgeStyles();

  return (
    <span
      className={`
        inline-flex items-center gap-1 font-bold rounded-full uppercase tracking-wide
        ${styles.bg} ${styles.text} ${getSizeClasses()}
        shadow-sm
      `}
    >
      {styles.icon && <span>{styles.icon}</span>}
      {getLabel()}
    </span>
  );
};

interface ProductBadgeListProps {
  badges: BadgeType[];
  maxBadges?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProductBadgeList: React.FC<ProductBadgeListProps> = ({
  badges,
  maxBadges = 3,
  size = 'md',
  className = '',
}) => {
  // Sort by priority (higher first)
  const sortedBadges = [...badges]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, maxBadges);

  if (sortedBadges.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {sortedBadges.map((badge, index) => (
        <ProductBadge key={index} badge={badge} size={size} />
      ))}
    </div>
  );
};
