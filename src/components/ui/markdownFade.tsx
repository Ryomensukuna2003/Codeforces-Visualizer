import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface MarkdownFadeProps {
  content: string;
  className?: string;
}

export const MarkdownFade: React.FC<MarkdownFadeProps> = ({ content, className = '' }) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    setKey(prevKey => prevKey + 1);
  }, [content]);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
        className={className}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </motion.div>
    </AnimatePresence>
  );
};

export default MarkdownFade;