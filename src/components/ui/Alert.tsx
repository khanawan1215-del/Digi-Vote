import React from 'react';
import { cn } from '@/lib/utils/cn';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiX, FiAlertTriangle } from 'react-icons/fi';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
  ...props
}) => {
  const variants = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: <FiCheckCircle className="h-5 w-5 text-green-600" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: <FiAlertCircle className="h-5 w-5 text-red-600" />,
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: <FiAlertTriangle className="h-5 w-5 text-yellow-600" />,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <FiInfo className="h-5 w-5 text-blue-600" />,
    },
  };

  return (
    <div
      className={cn(
        'border rounded-lg p-4 relative',
        variants[variant].container,
        className
      )}
      {...props}
    >
      <div className="flex">
        <div className="flex-shrink-0">{variants[variant].icon}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className="text-sm font-medium mb-1">{title}</h3>}
          <div className="text-sm">{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};