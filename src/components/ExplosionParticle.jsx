import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { Vector3, Raycaster } from "three";

export function ExplosionParticle({ particle }) {
  const meshRef = useRef();
  const [life, setLife] = useState(particle.life);
  const [velocity] = useState(new Vector3(particle.velocity[0], particle.velocity[1], particle.velocity[2]));
  const [position] = useState(new Vector3(particle.position[0], particle.position[1], particle.position[2]));
  const [scale, setScale] = useState(1);

  useFrame((state, delta) => {
    if (meshRef.current && life > 0) {
      // Update life
      const newLife = life - delta;
      setLife(newLife);
      
      // Update position with velocity and gravity
      velocity.y -= 15 * delta; // Gravity
      position.add(velocity.clone().multiplyScalar(delta));
      
      // Update mesh position
      meshRef.current.position.copy(position);
      
      // Scale effect - particles grow then shrink
      const lifeProgress = newLife / particle.life;
      if (lifeProgress > 0.5) {
        setScale(1 + (1 - lifeProgress) * 2); // Grow
      } else {
        setScale(lifeProgress * 2); // Shrink
      }
      
      // Update mesh scale
      meshRef.current.scale.setScalar(scale);
      
      // Fade out
      const opacity = Math.max(0, lifeProgress);
      meshRef.current.material.opacity = opacity;
      
      // Remove when life is over
      if (newLife <= 0) {
        meshRef.current.visible = false;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.2, 8, 8]} />
      <meshBasicMaterial 
        color={particle.color} 
        transparent 
        opacity={1}
      />
    </mesh>
  );
}

// Enhanced circular shockwave component with accelerated expansion
export function Shockwave({ position, radius = 8, duration = 1.2 }) {
  const meshRef = useRef();
  const meshRef2 = useRef();
  const [life, setLife] = useState(duration);

  useFrame((state, delta) => {
    if (meshRef.current && meshRef2.current && life > 0) {
      const newLife = life - delta;
      setLife(newLife);
      
      const lifeProgress = newLife / duration;
      // Accelerated scaling - starts fast and slows down
      const accelerationFactor = 1 - (lifeProgress * lifeProgress);
      const currentScale = (1 - accelerationFactor) * radius * 1.5; // 1.5x larger for more dramatic effect
      
      // Primary shockwave ring
      meshRef.current.scale.setScalar(currentScale);
      const opacity = lifeProgress * 0.9; // Higher opacity
      meshRef.current.material.opacity = opacity;
      
      // Secondary shockwave ring (slightly larger)
      meshRef2.current.scale.setScalar(currentScale * 1.3);
      meshRef2.current.material.opacity = opacity * 0.7;
      
      // Dynamic color change for more impact
      const intensity = Math.max(0.4, lifeProgress);
      meshRef.current.material.color.setRGB(intensity, intensity * 0.9, intensity * 0.4);
      meshRef2.current.material.color.setRGB(intensity * 0.8, intensity * 0.7, intensity * 0.3);
      
      if (newLife <= 0) {
        meshRef.current.visible = false;
        meshRef2.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Primary shockwave ring */}
      <mesh ref={meshRef} position={position}>
        <ringGeometry args={[0.1, 0.6, 48]} />
        <meshBasicMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.9}
          side={2}
        />
      </mesh>
      {/* Secondary shockwave ring */}
      <mesh ref={meshRef2} position={position}>
        <ringGeometry args={[0.3, 0.9, 48]} />
        <meshBasicMaterial 
          color="#ffaa00" 
          transparent 
          opacity={0.7}
          side={2}
        />
      </mesh>
    </group>
  );
}

// Enhanced expanding sphere with accelerated shockwave effect
export function ExpandingSphere({ position, radius = 12, duration = 1.0 }) {
  const meshRef = useRef();
  const meshRef2 = useRef();
  const [life, setLife] = useState(duration);

  useFrame((state, delta) => {
    if (meshRef.current && meshRef2.current && life > 0) {
      const newLife = life - delta;
      setLife(newLife);
      
      const lifeProgress = newLife / duration;
      // Accelerated expansion - exponential growth
      const accelerationFactor = Math.pow(1 - lifeProgress, 0.5);
      const currentScale = (1 - accelerationFactor) * radius * 1.8; // 1.8x larger
      
      // Primary expanding sphere
      meshRef.current.scale.setScalar(currentScale);
      const opacity = Math.max(0, lifeProgress * 0.98);
      meshRef.current.material.opacity = opacity;
      
      // Secondary expanding sphere (larger, more transparent)
      meshRef2.current.scale.setScalar(currentScale * 1.4);
      meshRef2.current.material.opacity = opacity * 0.5;
      
      // Bright orange-red shockwave color
      const redIntensity = Math.max(0.5, lifeProgress);
      const orangeIntensity = Math.max(0.3, lifeProgress * 0.8);
      meshRef.current.material.color.setRGB(redIntensity, orangeIntensity, 0);
      meshRef2.current.material.color.setRGB(redIntensity * 0.8, orangeIntensity * 0.6, 0);
      
      if (newLife <= 0) {
        meshRef.current.visible = false;
        meshRef2.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Primary expanding sphere */}
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.1, 20, 20]} />
        <meshBasicMaterial 
          color="#ff4400" 
          transparent 
          opacity={0.98}
          side={2}
        />
      </mesh>
      {/* Secondary expanding sphere */}
      <mesh ref={meshRef2} position={position}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial 
          color="#ff6600" 
          transparent 
          opacity={0.5}
          side={2}
        />
      </mesh>
    </group>
  );
}

// Enhanced character shockwave with accelerated circular effect
export function CharacterShockwave({ position, radius = 15, duration = 1.5 }) {
  const meshRef = useRef();
  const meshRef2 = useRef();
  const meshRef3 = useRef();
  const [life, setLife] = useState(duration);

  useFrame((state, delta) => {
    if (meshRef.current && meshRef2.current && meshRef3.current && life > 0) {
      const newLife = life - delta;
      setLife(newLife);
      
      const lifeProgress = newLife / duration;
      // Accelerated scaling with cubic function for dramatic effect
      const accelerationFactor = Math.pow(1 - lifeProgress, 0.3);
      const currentScale = (1 - accelerationFactor) * radius * 2.0; // 2x larger
      
      // Primary shockwave ring
      meshRef.current.scale.setScalar(currentScale);
      const opacity = Math.max(0, lifeProgress * 0.8);
      meshRef.current.material.opacity = opacity;
      
      // Secondary shockwave ring
      meshRef2.current.scale.setScalar(currentScale * 1.2);
      meshRef2.current.material.opacity = opacity * 0.6;
      
      // Tertiary shockwave ring
      meshRef3.current.scale.setScalar(currentScale * 1.4);
      meshRef3.current.material.opacity = opacity * 0.4;
      
      // Dynamic yellow-orange shockwave color
      const yellowIntensity = Math.max(0.6, lifeProgress);
      const orangeIntensity = Math.max(0.4, lifeProgress * 0.9);
      meshRef.current.material.color.setRGB(yellowIntensity, orangeIntensity, 0);
      meshRef2.current.material.color.setRGB(yellowIntensity * 0.8, orangeIntensity * 0.7, 0);
      meshRef3.current.material.color.setRGB(yellowIntensity * 0.6, orangeIntensity * 0.5, 0);
      
      if (newLife <= 0) {
        meshRef.current.visible = false;
        meshRef2.current.visible = false;
        meshRef3.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Primary shockwave ring */}
      <mesh ref={meshRef} position={position}>
        <ringGeometry args={[0.2, 1.0, 64]} />
        <meshBasicMaterial 
          color="#ffaa00" 
          transparent 
          opacity={0.8}
          side={2}
        />
      </mesh>
      {/* Secondary shockwave ring */}
      <mesh ref={meshRef2} position={position}>
        <ringGeometry args={[0.4, 1.3, 64]} />
        <meshBasicMaterial 
          color="#ff8800" 
          transparent 
          opacity={0.6}
          side={2}
        />
      </mesh>
      {/* Tertiary shockwave ring */}
      <mesh ref={meshRef3} position={position}>
        <ringGeometry args={[0.6, 1.6, 64]} />
        <meshBasicMaterial 
          color="#ff6600" 
          transparent 
          opacity={0.4}
          side={2}
        />
      </mesh>
    </group>
  );
}

// Enhanced sphere shockwave with accelerated circular wave effect
export function SphereShockwave({ position, radius = 20, duration = 2.0 }) {
  const meshRef = useRef();
  const meshRef2 = useRef();
  const [life, setLife] = useState(duration);

  useFrame((state, delta) => {
    if (meshRef.current && meshRef2.current && life > 0) {
      const newLife = life - delta;
      setLife(newLife);
      
      const lifeProgress = newLife / duration;
      // Accelerated expansion with quadratic function
      const accelerationFactor = Math.pow(1 - lifeProgress, 0.4);
      const currentScale = (1 - accelerationFactor) * radius * 2.2; // 2.2x larger
      
      // Primary sphere shockwave
      meshRef.current.scale.setScalar(currentScale);
      const opacity = Math.max(0, lifeProgress * 0.7);
      meshRef.current.material.opacity = opacity;
      
      // Secondary sphere shockwave
      meshRef2.current.scale.setScalar(currentScale * 1.3);
      meshRef2.current.material.opacity = opacity * 0.5;
      
      // Dynamic blue-white shockwave color
      const blueIntensity = Math.max(0.5, lifeProgress);
      const whiteIntensity = Math.max(0.4, lifeProgress * 0.95);
      meshRef.current.material.color.setRGB(whiteIntensity * 0.8, whiteIntensity * 0.9, blueIntensity);
      meshRef2.current.material.color.setRGB(whiteIntensity * 0.6, whiteIntensity * 0.7, blueIntensity * 0.8);
      
      if (newLife <= 0) {
        meshRef.current.visible = false;
        meshRef2.current.visible = false;
      }
    }
  });

  return (
    <group>
      {/* Primary sphere shockwave */}
      <mesh ref={meshRef} position={position}>
        <sphereGeometry args={[0.1, 32, 32]} />
        <meshBasicMaterial 
          color="#4488ff" 
          transparent 
          opacity={0.7}
          side={2}
          wireframe={true}
        />
      </mesh>
      {/* Secondary sphere shockwave */}
      <mesh ref={meshRef2} position={position}>
        <sphereGeometry args={[0.1, 24, 24]} />
        <meshBasicMaterial 
          color="#66aaff" 
          transparent 
          opacity={0.5}
          side={2}
          wireframe={true}
        />
      </mesh>
    </group>
  );
}
