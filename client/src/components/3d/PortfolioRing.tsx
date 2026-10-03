import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

export const PortfolioRing: React.FC = () => {
  const ring1 = useRef<THREE.Mesh>(null!);
  const ring2 = useRef<THREE.Mesh>(null!);
  const ring3 = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (ring1.current) ring1.current.rotation.z += delta * 0.35;
    if (ring2.current) ring2.current.rotation.z -= delta * 0.25;
    if (ring3.current) ring3.current.rotation.z += delta * 0.15;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.6}>
      <group rotation={[Math.PI / 3, 0, 0]}>
        <mesh ref={ring1}>
          <torusGeometry args={[1.6, 0.08, 16, 64]} />
          <meshStandardMaterial color="#6736C7" roughness={0.2} metalness={0.4} />
        </mesh>
        <mesh ref={ring2}>
          <torusGeometry args={[1.2, 0.06, 16, 64]} />
          <meshStandardMaterial color="#9A78E8" roughness={0.25} metalness={0.3} />
        </mesh>
        <mesh ref={ring3}>
          <torusGeometry args={[0.8, 0.05, 16, 64]} />
          <meshStandardMaterial color="#10B981" roughness={0.3} metalness={0.2} />
        </mesh>
      </group>
    </Float>
  );
};

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
