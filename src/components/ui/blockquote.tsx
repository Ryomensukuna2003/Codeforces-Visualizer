import React from 'react';
import { cn } from '@/lib/utils';

type BlockquoteProps = {
  children?: React.ReactNode;
  className?: string;
};

const Blockquote = ({ children, className }: BlockquoteProps) => {
  return (
    <div
      className={cn(
        "relative rounded-lg  border-l-gray-700 bg-gray-100 py-5 pl-5 pr-5 text-lg  leading-relaxed text-gray-500",
        className,
      )}
    >
      {children}
    </div>
  );
};

const BlockquoteAuthor = ({ children, className }: BlockquoteProps) => {
  return (
    <p className={cn('mt-5 pr-4 text-right font-bold not-italic text-gray-700', className)}>
      {children}
    </p>
  );
};

export { Blockquote, BlockquoteAuthor };
