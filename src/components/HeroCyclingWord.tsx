'use client';

import { useState, useEffect } from 'react';

const WORDS = [
  { text: 'diktering', gradient: 'from-[#EC4899] to-[#F97316]' },
  { text: 'journaler', gradient: 'from-[#3B82F6] to-[#06B6D4]' },
  { text: 'skjemaer', gradient: 'from-[#8B5CF6] to-[#EC4899]' },
  { text: 'diagnoser', gradient: 'from-[#10B981] to-[#3B82F6]' },
];

export default function HeroCyclingWord() {
  const [index, setIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setAnimating(false);
      }, 400);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const word = WORDS[index];

  return (
    <span
      className={`inline bg-gradient-to-r ${word.gradient} bg-clip-text text-transparent cycling-word-transition ${animating ? 'cycling-word-exit' : 'cycling-word-enter'}`}
      style={{ display: 'inline' }}
    >
      {word.text}
    </span>
  );
}
