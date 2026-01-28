import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface ApiImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
}

export function ApiImage({ src, alt, className = '', fallbackSrc }: ApiImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // If error and no fallback, show placeholder
  if (hasError && !fallbackSrc) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <ImageIcon className="w-12 h-12 text-gray-300" />
      </div>
    );
  }

  return (
    <>
      {isLoading && (
        <div className={`bg-gray-100 flex items-center justify-center absolute inset-0 ${className}`}>
          <div className="animate-pulse">
            <ImageIcon className="w-12 h-12 text-gray-300" />
          </div>
        </div>
      )}
      <img
        src={hasError && fallbackSrc ? fallbackSrc : src}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={isLoading ? { display: 'none' } : {}}
      />
    </>
  );
}
