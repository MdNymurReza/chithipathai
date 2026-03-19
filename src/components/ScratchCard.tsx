import React, { useEffect, useRef, useState } from 'react';

interface ScratchCardProps {
  width?: number;
  height?: number;
  finishPercent?: number;
  onComplete?: () => void;
  children: React.ReactNode;
  coverColor?: string;
}

export default function ScratchCard({
  width = 300,
  height = 150,
  finishPercent = 50,
  onComplete,
  children,
  coverColor = '#C0C0C0' // Silver
}: ScratchCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFinished, setIsFinished] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fill with cover color
    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, width, height);

    // Add some "scratchable" texture
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    for (let i = 0; i < 100; i++) {
      ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
    }
    
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.textAlign = 'center';
    ctx.fillText('SCRATCH HERE', width / 2, height / 2 + 5);

  }, [width, height, coverColor]);

  const getMousePos = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas || isFinished) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();

    checkPercent();
  };

  const checkPercent = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) {
        transparentPixels++;
      }
    }

    const percent = (transparentPixels / (width * height)) * 100;
    if (percent >= finishPercent) {
      setIsFinished(true);
      if (onComplete) onComplete();
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const pos = getMousePos(e);
    scratch(pos.x, pos.y);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div className="relative inline-block overflow-hidden rounded-lg shadow-inner bg-black/5" style={{ width, height }}>
      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
        {children}
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className={`absolute inset-0 cursor-crosshair transition-opacity duration-500 ${isFinished ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      />
    </div>
  );
}
