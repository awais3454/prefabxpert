import React from 'react';
import { Html, useProgress } from '@react-three/drei';

export function ModelLoader() {
  const { progress } = useProgress();

  return (
    <Html center>
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Spinner or progress indicator */}
        <div className="relative h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="h-10 w-10 animate-spin text-primary"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        </div>

        {/* Text showing progress */}
        <div className="text-center font-montserrat">
          <p className="text-sm font-bold uppercase tracking-wider text-primary">
            Sfeer creëren...
          </p>
          <p className="text-[10px] tabular-nums text-muted-foreground">
            {Math.round(progress)}%
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </Html>
  );
}
