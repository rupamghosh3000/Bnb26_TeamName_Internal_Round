import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';

interface CanvasContainerProps {
  children: React.ReactNode;
  className?: string;
  cameraPosition?: [number, number, number];
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  children,
  className = 'w-full h-full',
  cameraPosition = [0, 0, 7],
}) => {
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className={`flex items-center justify-center bg-brand-glow rounded-3xl ${className}`}>
        <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-brand-deep to-brand-soft opacity-80 blur-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Canvas
        camera={{ position: cameraPosition, fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.9} />
        <directionalLight position={[10, 10, 5]} intensity={1.2} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} color="#9A78E8" />
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
};
