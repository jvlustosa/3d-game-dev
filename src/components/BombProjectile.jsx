import { useState, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody } from "@react-three/rapier";
import { Vector3 } from "three";
import { Bomb } from "./Bomb";
import { ExplosionParticle, Shockwave, ExpandingSphere, CharacterShockwave, SphereShockwave } from "./ExplosionParticle";
import { GameState } from "../App";

export function BombProjectile({ position, direction, onExplode, explosionIntensity = 1.0 }) {
  const [isExploded, setIsExploded] = useState(false);
  const [explosionParticles, setExplosionParticles] = useState([]);
  const [showShockwave, setShowShockwave] = useState(false);
  const [showExpandingSphere, setShowExpandingSphere] = useState(false);
  const [showCharacterShockwave, setShowCharacterShockwave] = useState(false);
  const [showSphereShockwave, setShowSphereShockwave] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState([0, 0, 0]);
  const timeRef = useRef(0);
  const rb = useRef();
  const initialVelocity = useRef(new Vector3(direction[0] * 12, direction[1] * 12 + 3, direction[2] * 12));
  
  console.log("BombProjectile created with:", { position, direction, explosionIntensity });

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
    console.log("Bomb exploding with intensity:", explosionIntensity);
    setIsExploded(true);
    
    // Get explosion position from physics body
    const explosionPos = rb.current ? rb.current.translation() : [0, 0, 0];
    setExplosionPosition([explosionPos.x, explosionPos.y, explosionPos.z]);
    
    console.log("Explosion position:", explosionPos);
    
    // Create explosion particles based on intensity
    const baseParticleCount = 15;
    const particleCount = Math.floor(baseParticleCount * explosionIntensity);
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        id: i,
        position: [explosionPos.x, explosionPos.y, explosionPos.z],
        velocity: [
          (Math.random() - 0.5) * 20 * explosionIntensity,
          Math.random() * 15 * explosionIntensity + 8,
          (Math.random() - 0.5) * 20 * explosionIntensity
        ],
        life: 2.0 + (explosionIntensity * 0.5), // Longer life for higher intensity
        color: Math.random() > 0.7 ? "#ff4444" : Math.random() > 0.4 ? "#ffaa00" : "#ffffff"
      });
    }
    setExplosionParticles(particles);
    
    console.log("Created", particles.length, "explosion particles");
    console.log("Setting showExpandingSphere to true");
    console.log("Setting showShockwave to true");
    console.log("Setting showCharacterShockwave to true");
    
    // Show expanding red sphere effect
    setShowExpandingSphere(true);
    
    // Show shockwave effect
    setShowShockwave(true);
    
    // Show character shockwave effect
    setShowCharacterShockwave(true);
    
    // Show sphere shockwave effect
    setShowSphereShockwave(true);
    
    // Add explosion to GameState for character force calculation
    GameState.explosions.push({
      position: [explosionPos.x, explosionPos.y, explosionPos.z],
      radius: 10 * explosionIntensity, // Scale radius with intensity
      strength: 15 * explosionIntensity, // Scale force with intensity
      time: Date.now()
    });
    
    // Call explosion callback
    if (onExplode) {
      onExplode();
    }
    
    // Disable the physics body immediately
    if (rb.current) {
      rb.current.setEnabled(false);
    }
    
    // Hide expanding sphere after animation
    setTimeout(() => {
      console.log("Hiding expanding sphere");
      setShowExpandingSphere(false);
    }, 1000); // Extended from 800ms
    
    // Hide shockwave after animation
    setTimeout(() => {
      console.log("Hiding shockwave");
      setShowShockwave(false);
    }, 1500); // Extended from 1000ms
    
    // Hide character shockwave after animation
    setTimeout(() => {
      console.log("Hiding character shockwave");
      setShowCharacterShockwave(false);
    }, 2000); // Extended from 1200ms
    
    // Hide sphere shockwave after animation
    setTimeout(() => {
      console.log("Hiding sphere shockwave");
      setShowSphereShockwave(false);
    }, 2500); // Extended from 1500ms
  };

  if (isExploded) {
    console.log("Rendering explosion with", explosionParticles.length, "particles");
    console.log("showExpandingSphere:", showExpandingSphere);
    console.log("showShockwave:", showShockwave);
    console.log("showCharacterShockwave:", showCharacterShockwave);
    console.log("showSphereShockwave:", showSphereShockwave);
    console.log("explosionPosition:", explosionPosition);
    
    return (
      <group>
        {explosionParticles.map((particle) => (
          <ExplosionParticle key={particle.id} particle={particle} />
        ))}
        {showExpandingSphere && (
          <ExpandingSphere 
            position={explosionPosition} 
            radius={12 * explosionIntensity} 
            duration={1.0} 
          />
        )}
        {showShockwave && (
          <Shockwave 
            position={explosionPosition} 
            radius={8 * explosionIntensity} 
            duration={1.2} 
          />
        )}
        {showCharacterShockwave && (
          <CharacterShockwave 
            position={explosionPosition} 
            radius={15 * explosionIntensity} 
            duration={1.5} 
          />
        )}
        {showSphereShockwave && (
          <SphereShockwave 
            position={explosionPosition} 
            radius={20 * explosionIntensity} 
            duration={2.0} 
          />
        )}
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
      {/* Bomb with flashing effect during flight */}
      <Bomb scale={0.15} timeToExplode={5.0} />
    </RigidBody>
  );
}
