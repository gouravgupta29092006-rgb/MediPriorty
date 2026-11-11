import React from 'react';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'rect' | 'circle' | 'pill' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  width,
  height,
  style,
  ...props
}) => {
  const variantClasses = {
    rect: 'rounded-lg',
    circle: 'rounded-full',
    pill: 'rounded-full',
    text: 'rounded h-4',
  }[variant];

  return (
    <div
      aria-hidden="true"
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/80 ${variantClasses} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      {...props}
    />
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lastLineWidth?: string;
}> = ({ lines = 2, className = '', lastLineWidth = '70%' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className="h-3.5"
          style={{
            width: i === lines - 1 ? lastLineWidth : '100%',
          }}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div
      className={`bg-bg-surface border border-border rounded-xl p-5 shadow-sm space-y-4 ${className}`}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="w-24 h-4" />
        <Skeleton variant="circle" className="w-8 h-8" />
      </div>
      <Skeleton className="w-16 h-8" />
      <Skeleton className="w-32 h-3" />
    </div>
  );
};

export const SkeletonTable: React.FC<{
  rows?: number;
  columns?: number;
  className?: string;
}> = ({ rows = 5, columns = 6, className = '' }) => {
  return (
    <div className={`bg-bg-surface border border-border rounded-xl overflow-hidden shadow-sm ${className}`}>
      {/* Table Header Placeholder */}
      <div className="bg-bg-surface-2/60 border-b border-border p-4 flex items-center gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className={`h-4 ${i === 0 ? 'w-24' : 'flex-1'}`} />
        ))}
      </div>

      {/* Table Rows Placeholder */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={`h-4 ${
                  c === 0 ? 'w-20' : c === columns - 1 ? 'w-16 ml-auto' : 'flex-1'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonChart: React.FC<{
  type?: 'doughnut' | 'bar';
  className?: string;
}> = ({ type = 'doughnut', className = '' }) => {
  return (
    <div className={`bg-bg-surface border border-border rounded-xl p-6 shadow-sm flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1.5">
          <Skeleton className="w-36 h-4" />
          <Skeleton className="w-24 h-3" />
        </div>
        <Skeleton variant="circle" className="w-6 h-6" />
      </div>

      {type === 'doughnut' ? (
        <div className="flex-1 flex flex-col items-center justify-center my-4">
          <div className="w-44 h-44 rounded-full border-8 border-slate-200 dark:border-slate-800 animate-pulse flex items-center justify-center">
            <Skeleton variant="circle" className="w-20 h-20" />
          </div>
          <div className="flex gap-4 mt-6">
            <Skeleton className="w-16 h-3" />
            <Skeleton className="w-16 h-3" />
            <Skeleton className="w-16 h-3" />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-end pt-6">
          <div className="flex items-end justify-between gap-4 h-44 border-b border-border pb-2 px-4">
            <Skeleton className="w-12 h-24 rounded-t-lg" />
            <Skeleton className="w-12 h-36 rounded-t-lg" />
            <Skeleton className="w-12 h-20 rounded-t-lg" />
            <Skeleton className="w-12 h-40 rounded-t-lg" />
          </div>
          <div className="flex justify-between pt-3 px-4">
            <Skeleton className="w-10 h-3" />
            <Skeleton className="w-10 h-3" />
            <Skeleton className="w-10 h-3" />
            <Skeleton className="w-10 h-3" />
          </div>
        </div>
      )}
    </div>
  );
};

