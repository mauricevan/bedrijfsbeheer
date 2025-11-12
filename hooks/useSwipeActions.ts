import { useState, useRef, useCallback } from 'react';

export interface SwipeAction {
  label: string;
  icon?: string;
  color: 'red' | 'blue' | 'green' | 'yellow';
  onAction: () => void;
}

interface UseSwipeActionsOptions {
  leftActions?: SwipeAction[];
  rightActions?: SwipeAction[];
  threshold?: number;
}

export function useSwipeActions({
  leftActions = [],
  rightActions = [],
  threshold = 80,
}: UseSwipeActionsOptions = {}) {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipingActive, setIsSwipingActive] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);
  const elementRef = useRef<HTMLDivElement>(null);

  const getColorClass = (color: SwipeAction['color']) => {
    switch (color) {
      case 'red':
        return 'bg-red-500 text-white';
      case 'blue':
        return 'bg-blue-500 text-white';
      case 'green':
        return 'bg-green-500 text-white';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwipingActive(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isSwipingActive) return;

    currentX.current = e.touches[0].clientX;
    const diff = currentX.current - startX.current;

    // Limit swipe distance
    const maxSwipe = 150;
    const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diff));

    setSwipeOffset(limitedDiff);
  }, [isSwipingActive]);

  const handleTouchEnd = useCallback(() => {
    setIsSwipingActive(false);

    // Execute action if threshold exceeded
    if (Math.abs(swipeOffset) >= threshold) {
      if (swipeOffset > 0 && leftActions.length > 0) {
        leftActions[0].onAction();
      } else if (swipeOffset < 0 && rightActions.length > 0) {
        rightActions[0].onAction();
      }
    }

    // Reset position
    setSwipeOffset(0);
  }, [swipeOffset, threshold, leftActions, rightActions]);

  const renderActions = (actions: SwipeAction[], position: 'left' | 'right') => {
    if (actions.length === 0) return null;

    const isVisible = position === 'left' ? swipeOffset > 0 : swipeOffset < 0;
    const offset = Math.abs(swipeOffset);

    return (
      <div
        className={`absolute top-0 ${
          position === 'left' ? 'left-0' : 'right-0'
        } h-full flex items-center gap-2 px-4 transition-opacity ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: `${offset}px`,
        }}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded font-semibold text-sm whitespace-nowrap ${getColorClass(
              action.color
            )}`}
            onClick={(e) => {
              e.stopPropagation();
              action.onAction();
              setSwipeOffset(0);
            }}
          >
            {action.icon && <span className="mr-2">{action.icon}</span>}
            {action.label}
          </button>
        ))}
      </div>
    );
  };

  return {
    swipeOffset,
    isSwipingActive,
    elementRef,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    renderActions,
    getColorClass,
  };
}
