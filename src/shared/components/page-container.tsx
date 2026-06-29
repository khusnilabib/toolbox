// src/shared/components/page-container.tsx — Max-width wrapper.
import { cn } from '@/lib/utils';
import type { ElementType, ReactNode } from 'react';

export interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Tailwind max-width token, defaults to 7xl. */
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
  as?: ElementType;
}

const widthMap: Record<NonNullable<PageContainerProps['width']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export function PageContainer({
  children,
  className,
  width = '7xl',
  as: Tag = 'div',
}: PageContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widthMap[width], className)}>
      {children}
    </Tag>
  );
}
