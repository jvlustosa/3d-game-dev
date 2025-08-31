import { useGLTF } from "@react-three/drei";
import React, { useState, useEffect } from "react";

export function Bazooka({ isShooting, ...props }) {
  const { nodes, materials } = useGLTF("/models/stylized_bazooka_by_jungle_jim_220kb.glb");
  const [showMuzzleFlash, setShowMuzzleFlash] = useState(false);
  
  useEffect(() => {
    if (isShooting) {
      setShowMuzzleFlash(true);
      const timer = setTimeout(() => setShowMuzzleFlash(false), 100);
      return () => clearTimeout(timer);
    }
  }, [isShooting]);
  
  return (
    <group {...props} dispose={null}>
      <group scale={0.01}>
        <group position={[15.856, -9.65, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[10.801, 6.952, 10.801]}>
          <mesh geometry={nodes.Cube001_Material003_0.geometry} material={materials['Material.003']} />
          <mesh geometry={nodes.Cube001_Material001_0.geometry} material={materials['Material.001']} />
        </group>
        <group position={[-25.505, -11.128, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[9.033, 5.813, 9.033]}>
          <mesh geometry={nodes.Cube002_Material003_0.geometry} material={materials['Material.003']} />
          <mesh geometry={nodes.Cube002_Material001_0.geometry} material={materials['Material.001']} />
        </group>
        <group position={[0, 15.728, 0]} rotation={[-Math.PI / 2, Math.PI / 2, 0]} scale={[16.523, 16.523, 101.619]}>
          <mesh geometry={nodes.Cylinder_Material_0.geometry} material={materials.Material} />
          <mesh geometry={nodes.Cylinder_Material001_0.geometry} material={materials['Material.001']} />
        </group>
        <mesh geometry={nodes.Cube_Material_0.geometry} material={materials.Material} position={[-80.299, 41.982, 0]} rotation={[Math.PI / 2, 0, -Math.PI]} scale={[-9.239, 2.621, 11.732]} />
        <mesh geometry={nodes.Cube003_Material001_0.geometry} material={materials['Material.001']} position={[15.843, -5.012, 0]} rotation={[-Math.PI / 2, 0.464, 0]} scale={[1.139, 0.921, 4.852]} />
        
        {/* Muzzle flash effect */}
        {showMuzzleFlash && (
          <mesh position={[-80.299, 41.982, -0.5]} rotation={[Math.PI / 2, 0, -Math.PI]}>
            <sphereGeometry args={[0.5, 8, 8]} />
            <meshBasicMaterial color="#ffaa00" transparent opacity={0.8} />
          </mesh>
        )}
        
        {/* Simple aim line sight */}
        <group position={[-80.299, 41.982, 0]}>
          {/* Create a simple line extending forward from bazooka */}
          {Array.from({ length: 30 }, (_, i) => (
            <mesh key={i} position={[i * 0.2, i * 0.1, 0]}>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshBasicMaterial color="#ff0000" />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("/models/stylized_bazooka_by_jungle_jim_220kb.glb");
