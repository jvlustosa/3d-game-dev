import { useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import { Vector3 } from "three";

export function ExplosionParticle({ particle }) {
  const meshRef = useRef();
  const [position, setPosition] = useState(new Vector3(...particle.position));
  const [velocity] = useState(new Vector3(...particle.velocity));
  const [life, setLife] = useState(particle.life);
  const [color] = useState(particle.color);

  useFrame((state, delta) => {
    if (meshRef.current && life > 0) {
      // Update position
      position.add(velocity.clone().multiplyScalar(delta));
      meshRef.current.position.copy(position);
      
      // Apply gravity
      velocity.y -= 9.8 * delta;
      
      // Update life
      const newLife = life - delta;
      setLife(newLife);
      
      // Fade out
      const scale = Math.max(0, newLife / particle.life);
      meshRef.current.scale.setScalar(0.1 * scale);
      
      // Change color as it fades
      const material = meshRef.current.material;
      if (material) {
        material.opacity = scale;
        material.transparent = true;
      }
    }
  });

  if (life <= 0) return null;

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={1} />
    </mesh>
  );
}
