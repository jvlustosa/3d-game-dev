import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";

export function Bomb({ timeToExplode = 5.0, ...props }) {
  const { nodes, materials } = useGLTF("/models/bomb.glb");
  const groupRef = useRef();
  const [flashIntensity, setFlashIntensity] = useState(0);
  const timeRef = useRef(0);
  const lastUpdateRef = useRef(0);
  
  useFrame((state, delta) => {
    if (groupRef.current) {
      timeRef.current += delta;
      
      // Only update flash every 0.1 seconds to reduce performance impact
      if (timeRef.current - lastUpdateRef.current > 0.1) {
        lastUpdateRef.current = timeRef.current;
        
        // Calculate time remaining until explosion
        const timeRemaining = Math.max(0, timeToExplode - timeRef.current);
        const explosionProgress = 1 - (timeRemaining / timeToExplode);
        
        // Simplified flash calculation
        const flashValue = Math.sin(timeRef.current * 3) * 0.5 + 0.5;
        const maxIntensity = 0.6 + (explosionProgress * 0.4);
        const currentIntensity = flashValue * maxIntensity;
        
        setFlashIntensity(currentIntensity);
        
        // Apply flash effect to materials
        if (materials['Material.003']) {
          materials['Material.003'].emissiveIntensity = currentIntensity;
          materials['Material.003'].emissive.setRGB(currentIntensity, currentIntensity * 0.3, 0);
        }
        if (materials['Material.001']) {
          materials['Material.001'].emissiveIntensity = currentIntensity;
          materials['Material.001'].emissive.setRGB(currentIntensity, currentIntensity * 0.3, 0);
        }
      }
    }
  });
  
  return (
    <group ref={groupRef} {...props} dispose={null}>
      <mesh geometry={nodes.Object_4.geometry} material={materials['Material.003']} position={[-0.135, 1.134, 0.174]} rotation={[-0.556, -0.57, -0.389]} />
      <mesh geometry={nodes.Object_6.geometry} material={materials['Material.001']} position={[0.096, 2.008, -0.176]} rotation={[-2.78, -1.001, -0.34]} scale={0.046} />
    </group>
  );
}

useGLTF.preload("/models/bomb.glb");
