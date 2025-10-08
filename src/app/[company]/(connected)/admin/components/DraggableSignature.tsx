import React, { ReactNode, useRef, useState } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";

interface DraggableProps {
  children: ReactNode;
  onDragStop: (x: number, y: number) => void;
  initialPosition?: { x: number; y: number };
  bounds?: "parent" | string;
  isPlaced: boolean;
  onReset?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function DraggableSignature({
  onDragStop,
  children,
  initialPosition = { x: 0, y: 0 },
  isPlaced,
  onReset,
  disabled = false,
  className = "",
}: DraggableProps) {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);

  const handleStop = (e: DraggableEvent, data: DraggableData) => {
    setIsDragging(false);
    setPosition({ x: data.x, y: data.y });
    onDragStop(data.x, data.y);
  };

  const handleStart = () => {
    setIsDragging(true);
  };

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPosition(initialPosition);
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="relative inline-block">
      <Draggable
        nodeRef={nodeRef}
        defaultPosition={initialPosition}
        onStart={handleStart}
        onStop={handleStop}
        disabled={disabled || isPlaced}
      >
        <div
          ref={nodeRef}
          className={`
            transition-all duration-200 ease-in-out
            ${isDragging ? "scale-105 opacity-80 z-50 shadow-xl" : "scale-100 opacity-100 z-10"}
            ${disabled || isPlaced ? "cursor-default" : "cursor-grab active:cursor-grabbing"}
            ${className}
          `}
          style={{ pointerEvents: "auto" }}
        >
          {children}

          {/* Overlay de statut */}
          {isPlaced && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-20 rounded flex items-center justify-center">
              <span className="text-white text-sm font-bold bg-green-600 rounded-full w-6 h-6 flex items-center justify-center">
                ✓
              </span>
            </div>
          )}
        </div>
      </Draggable>

      {/* Bouton de réinitialisation */}
      {isPlaced && onReset && (
        <button
          onClick={handleReset}
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold border-2 border-white shadow-md hover:bg-red-600 transition-colors z-20"
          title="Réinitialiser la position"
        >
          ×
        </button>
      )}
    </div>
  );
}
