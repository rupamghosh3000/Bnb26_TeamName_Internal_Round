import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export const StrategyCube: React.FC = () => {
  const cubeRef = useRef<THREE.Group>(null!);

  useFrame((state, delta) => {
    if (cubeRef.current) {
      cubeRef.current.rotation.x += delta * 0.2;
      cubeRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <group ref={cubeRef}>
        <mesh>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial
            color="#6736C7"
            wireframe
            roughness={0.1}
            emissive="#9A78E8"
            emissiveIntensity={0.5}
          />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.7]} />
          <meshStandardMaterial color="#FAF9FF" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
};
