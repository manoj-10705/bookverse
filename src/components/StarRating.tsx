import React, { useState } from 'react';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  readonly = false,
  size = 'md'
}) => {
  const [hover, setHover] = useState(0);

  const sizeClasses: Record<string, string> = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  const handleClick = (starValue: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starValue);
    }
  };

  const displayRating = hover || rating;

  return (
    <div className="flex items-center space-x-0.5">
      {[1, 2, 3, 4, 5].map((starValue) => (
        <button
          key={starValue}
          type="button"
          disabled={readonly}
          className={`
            ${sizeClasses[size]}
            ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-125 focus:outline-none'}
            transition-all duration-200
          `}
          onClick={() => handleClick(starValue)}
          onMouseEnter={() => !readonly && setHover(starValue)}
          onMouseLeave={() => !readonly && setHover(0)}
        >
          <span className={`${starValue <= displayRating
            ? 'text-amber-400 drop-shadow-[0_0_3px_rgba(251,191,36,0.6)]'
            : 'text-gray-300 dark:text-gray-600'
          }`}>
            ★
          </span>
        </button>
      ))}
    </div>
  );
};

export default StarRating;
