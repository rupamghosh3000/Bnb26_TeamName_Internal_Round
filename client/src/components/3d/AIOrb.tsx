import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const AIOrb: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x += delta * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.4;
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1}>
      <group>
        <mesh ref={meshRef}>
          <sphereGeometry args={[1.3, 32, 32]} />
          <MeshDistortMaterial
            color="#4B1FA8"
            roughness={0.1}
            metalness={0.4}
            distort={0.35}
            speed={3}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[2.0, 0.03, 16, 64]} />
          <meshStandardMaterial color="#D9CCFF" emissive="#9A78E8" emissiveIntensity={0.8} />
        </mesh>
      </group>
    </Float>
  );
};
