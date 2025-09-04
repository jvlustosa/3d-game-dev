import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";

export const StartPortal = () => {
  const portalRef = useRef();
  const ringRef = useRef();
  const particlesRef = useRef();

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate the portal ring
    if (ringRef.current) {
      ringRef.current.rotation.y = time * 0.5;
    }
    
    // Animate particles
    if (particlesRef.current) {
      particlesRef.current.rotation.y = time * 0.3;
    }
    
    // Pulse effect
    if (portalRef.current) {
      const scale = 1 + Math.sin(time * 2) * 0.1;
      portalRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, 2, 0]}>
      {/* Main portal ring */}
      <RigidBody type="fixed" colliders={false}>
        <group ref={portalRef}>
          {/* Outer ring */}
          <mesh ref={ringRef}>
            <torusGeometry args={[1.5, 0.1, 16, 32]} />
            <meshStandardMaterial color="#00FFFF" emissive="#00FFFF" emissiveIntensity={0.3} />
          </mesh>
          
          {/* Inner ring */}
          <mesh rotation-y={Math.PI / 2}>
            <torusGeometry args={[1.2, 0.08, 16, 32]} />
            <meshStandardMaterial color="#FF00FF" emissive="#FF00FF" emissiveIntensity={0.2} />
          </mesh>
          
          {/* Portal center */}
          <mesh>
            <circleGeometry args={[1, 32]} />
            <meshStandardMaterial 
              color="#FFFFFF" 
              transparent 
              opacity={0.3}
              emissive="#FFFFFF"
              emissiveIntensity={0.1}
            />
          </mesh>
        </group>
      </RigidBody>

      {/* Floating particles */}
      <group ref={particlesRef}>
        {[...Array(8)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 2,
              Math.sin((i / 8) * Math.PI * 2) * 0.5,
              Math.sin((i / 8) * Math.PI * 2) * 2
            ]}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial 
              color="#00FF00" 
              emissive="#00FF00" 
              emissiveIntensity={0.5} 
            />
          </mesh>
        ))}
      </group>

      {/* Ground marker */}
      <mesh position={[0, 0.01, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[2, 32]} />
        <meshStandardMaterial 
          color="#00FF00" 
          transparent 
          opacity={0.5}
          emissive="#00FF00"
          emissiveIntensity={0.2}
        />
      </mesh>

      {/* Text indicator */}
      <mesh position={[0, 3, 0]}>
        <planeGeometry args={[2, 0.5]} />
        <meshStandardMaterial 
          color="#FFFFFF" 
          transparent 
          opacity={0.8}
          emissive="#FFFFFF"
          emissiveIntensity={0.1}
        />
      </mesh>
    </group>
  );
};
