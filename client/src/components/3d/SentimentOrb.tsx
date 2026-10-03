import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

interface SentimentOrbProps {
  sentiment?: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
}

export const SentimentOrb: React.FC<SentimentOrbProps> = ({ sentiment = 'BULLISH' }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
      meshRef.current.rotation.x += delta * 0.2;
    }
  });

  const color = sentiment === 'BULLISH' ? '#10B981' : sentiment === 'BEARISH' ? '#EF4444' : '#9A78E8';

  return (
    <Float speed={2} rotationIntensity={0.6} floatIntensity={0.8}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.2, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          roughness={0.2}
          metalness={0.3}
          distort={0.3}
          speed={2.5}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
};
