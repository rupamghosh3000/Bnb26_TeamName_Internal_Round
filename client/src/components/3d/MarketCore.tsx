import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

export const MarketCore: React.FC = () => {
  const coreRef = useRef<THREE.Mesh>(null!);
  const ring1Ref = useRef<THREE.Mesh>(null!);
  const ring2Ref = useRef<THREE.Mesh>(null!);
  const ring3Ref = useRef<THREE.Mesh>(null!);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.25;
      coreRef.current.rotation.x += delta * 0.1;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z += delta * 0.3;
      ring1Ref.current.rotation.x += delta * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.2;
      ring2Ref.current.rotation.z += delta * 0.1;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.x -= delta * 0.25;
      ring3Ref.current.rotation.y += delta * 0.35;
    }
  });

  return (
    <group>
      {/* Central Market Intelligence Core */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={coreRef}>
          <icosahedronGeometry args={[1.5, 3]} />
          <MeshDistortMaterial
            color="#6736C7"
            roughness={0.15}
            metalness={0.2}
            distort={0.25}
            speed={2}
            transparent
            opacity={0.88}
          />
        </mesh>
      </Float>

      {/* Primary Orbital Ring */}
      <mesh ref={ring1Ref} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.5, 0.03, 16, 100]} />
        <meshStandardMaterial color="#9A78E8" emissive="#6736C7" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>

      {/* Secondary Orbital Ring */}
      <mesh ref={ring2Ref} rotation={[-Math.PI / 3, Math.PI / 6, 0]}>
        <torusGeometry args={[3.2, 0.02, 16, 100]} />
        <meshStandardMaterial color="#D9CCFF" emissive="#9A78E8" emissiveIntensity={0.4} roughness={0.3} />
      </mesh>

      {/* Outer Data Ring */}
      <mesh ref={ring3Ref} rotation={[Math.PI / 6, -Math.PI / 4, 0]}>
        <torusGeometry args={[3.8, 0.015, 16, 100]} />
        <meshStandardMaterial color="#6736C7" emissive="#4B1FA8" emissiveIntensity={0.5} transparent opacity={0.6} />
      </mesh>

      {/* Surrounding Market Data Nodes */}
      {[-2.2, 2.2, -1.8, 1.8].map((x, i) => (
        <Float key={i} speed={1.5 + i * 0.3} rotationIntensity={1} floatIntensity={1.5}>
          <mesh position={[x, (i % 2 === 0 ? 1 : -1) * 1.5, (i > 1 ? 1 : -1) * 1.2]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#FFFFFF" emissive="#9A78E8" emissiveIntensity={0.8} />
          </mesh>
        </Float>
      ))}
    </group>
  );
};
