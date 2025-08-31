import { useGLTF } from "@react-three/drei";
import React from "react";

export function Bomb(props) {
  const { nodes, materials } = useGLTF("/models/bomb.glb");
  
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Object_4.geometry} material={materials['Material.003']} position={[-0.135, 1.134, 0.174]} rotation={[-0.556, -0.57, -0.389]} />
      <mesh geometry={nodes.Object_6.geometry} material={materials['Material.001']} position={[0.096, 2.008, -0.176]} rotation={[-2.78, -1.001, -0.34]} scale={0.046} />
    </group>
  );
}

useGLTF.preload("/models/bomb.glb");
