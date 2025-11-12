import React from 'react';

interface CardField {
  label: string;
  value: React.ReactNode;
  fullWidth?: boolean;
  highlight?: boolean;
}

interface MobileCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  fields: CardField[];
  actions?: React.ReactNode;
  status?: React.ReactNode;
  onClick?: () => void;
  onLongPress?: () => void;
  className?: string;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  title,
  subtitle,
  fields,
  actions,
  status,
  onClick,
  onLongPress,
  className = '',
}) => {
  const longPressTimer = React.useRef<NodeJS.Timeout>();

  const handleTouchStart = () => {
    if (onLongPress) {
      longPressTimer.current = setTimeout(() => {
        onLongPress();
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-3 ${
        onClick ? 'cursor-pointer active:bg-gray-50' : ''
      } ${className}`}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        {status && <div className="ml-3 flex-shrink-0">{status}</div>}
      </div>

      {/* Fields Grid */}
      <div className="grid grid-cols-2 gap-3">
        {fields.map((field, index) => (
          <div
            key={index}
            className={`${field.fullWidth ? 'col-span-2' : ''} ${
              field.highlight ? 'bg-blue-50 -mx-2 px-2 py-2 rounded' : ''
            }`}
          >
            <dt className="text-xs font-medium text-gray-500 mb-1">
              {field.label}
            </dt>
            <dd className="text-sm font-semibold text-gray-900">
              {field.value}
            </dd>
          </div>
        ))}
      </div>

      {/* Actions */}
      {actions && (
        <div className="mt-4 pt-3 border-t border-gray-200 flex gap-2">
          {actions}
        </div>
      )}
    </div>
  );
};

interface MobileListProps {
  items: any[];
  renderCard: (item: any, index: number) => React.ReactNode;
  emptyMessage?: string;
  className?: string;
}

export const MobileList: React.FC<MobileListProps> = ({
  items,
  renderCard,
  emptyMessage = 'Geen items gevonden',
  className = '',
}) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item, index) => (
        <React.Fragment key={item.id || index}>
          {renderCard(item, index)}
        </React.Fragment>
      ))}
    </div>
  );
};
