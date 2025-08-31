import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { Bomb } from "./Bomb";
import { ExplosionParticle } from "./ExplosionParticle";

export function BombProjectile({ position, direction, onExplode }) {
  const [isExploded, setIsExploded] = useState(false);
  const [explosionParticles, setExplosionParticles] = useState([]);
  const timeRef = useRef(0);
  const rb = useRef();
  const initialVelocity = useRef(new Vector3(direction[0] * 12, direction[1] * 12 + 3, direction[2] * 12));
  
  console.log("BombProjectile created with:", { position, direction });

  // Set initial velocity when RigidBody is ready
  useEffect(() => {
    if (rb.current) {
      console.log("Setting initial velocity:", initialVelocity.current);
      rb.current.setLinvel(initialVelocity.current, true);
    }
  }, []);

  // Simple physics-based animation - no visual effects during flight
  useFrame((state, delta) => {
    if (!isExploded && rb.current) {
      timeRef.current += delta;
      
      // Only check every few frames to reduce performance impact
      if (Math.floor(timeRef.current * 60) % 10 === 0) {
        const pos = rb.current.translation();
        const vel = rb.current.linvel();
        const speed = Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
        
        // Explode after 5 seconds or when stuck
        if (timeRef.current > 5.0 || (speed < 0.5 && pos.y < 1.0)) {
          explode();
        }
      }
    }
  });

  const explode = () => {
    setIsExploded(true);
    
    // Get explosion position from physics body
    const explosionPos = rb.current ? rb.current.translation() : [0, 0, 0];
    
    // Create dramatic explosion particles
    const particles = [];
    for (let i = 0; i < 20; i++) {
      particles.push({
        id: i,
        position: [explosionPos.x, explosionPos.y, explosionPos.z],
        velocity: [
          (Math.random() - 0.5) * 15,
          Math.random() * 12 + 5,
          (Math.random() - 0.5) * 15
        ],
        life: 2.0,
        color: Math.random() > 0.7 ? "#ff4444" : Math.random() > 0.4 ? "#ffaa00" : "#ffffff"
      });
    }
    setExplosionParticles(particles);
    
    // Call explosion callback
    if (onExplode) {
      onExplode();
    }
    
    // Disable the physics body immediately
    if (rb.current) {
      rb.current.setEnabled(false);
    }
  };

  if (isExploded) {
    return (
      <group>
        {explosionParticles.map((particle) => (
          <ExplosionParticle key={particle.id} particle={particle} />
        ))}
      </group>
    );
  }

  return (
    <RigidBody
      ref={rb}
      colliders="ball"
      mass={0.5}
      position={position}
      enabledRotations={[true, true, true]}
      linearDamping={0.2}
      angularDamping={0.9}
      friction={0.2}
      restitution={0.5}
      ccd={false}
    >
      {/* Simple bomb during flight - no animation */}
      <Bomb scale={0.15} />
    </RigidBody>
  );
}
