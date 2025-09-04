import { useGLTF } from "@react-three/drei";
import { RigidBody } from "@react-three/rapier";
import { useFrame } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";

export const CollectibleKey = ({ position, onCollect, keyId, ...props }) => {
  const { scene } = useGLTF("/models/simple_gold_key.glb");
  const group = useRef();
  const [isCollected, setIsCollected] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Check if key is already collected on mount
  useEffect(() => {
    // This will be handled by the parent component
    // The key will not render if already collected
  }, []);
  
  // Criar instância do áudio
  const audioRef = useRef(null);
  const shadowRef = useRef(null);
  const ringRef = useRef(null);
  
  useEffect(() => {
    // Criar e configurar o áudio
    audioRef.current = new Audio("/sfx/key-sound-effect.wav");
    audioRef.current.volume = 0.5; // Volume moderado
    audioRef.current.preload = "auto";
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useFrame((state) => {
    if (group.current && !isCollected) {
      const time = state.clock.getElapsedTime();
      
      if (isAnimating) {
        // Animação de coleta
        group.current.scale.setScalar(0.005 + Math.sin(time * 10) * 0.002);
        group.current.position.y += 0.1;
        group.current.rotation.y += 0.2;
      } else {
        // Rotação sutil
        group.current.rotation.y = time * 0.5;
        
        // Movimento flutuante sutil
        group.current.position.y = position[1] + Math.sin(time * 1.5) * 0.2;
      }
      
      // Animação da sombra pulsante
      if (shadowRef.current && ringRef.current) {
        const pulse = 1 + Math.sin(time * 2) * 0.15;
        const opacity = 0.2 + Math.sin(time * 1.5) * 0.05;
        
        shadowRef.current.scale.setScalar(pulse);
        shadowRef.current.material.opacity = opacity;
        
        ringRef.current.scale.setScalar(pulse);
        ringRef.current.material.opacity = 0.5 + Math.sin(time * 1.5) * 0.15;
      }
      
      // Sistema de detecção por proximidade (backup)
      if (!isAnimating && !isCollected) {
        // Usar a posição absoluta da chave
        const keyWorldPosition = group.current.getWorldPosition(new THREE.Vector3());
        const cameraPosition = state.camera.position;
        const distance = keyWorldPosition.distanceTo(cameraPosition);
        
        if (distance < 3) {
          console.log("Proximidade detectada! Distância:", distance, "Posição chave:", keyWorldPosition, "Posição câmera:", cameraPosition);
          handleProximityCollection();
        }
      }
    }
  });

  const handleProximityCollection = () => {
    if (!isCollected && !isAnimating) {
      console.log("Chave coletada por proximidade!", keyId);
      setIsAnimating(true);
      
      // Reproduzir som de coleta
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.log("Erro ao reproduzir som:", error);
        });
      }
      
      // Delay antes de remover a chave
      setTimeout(() => {
        setIsCollected(true);
        onCollect && onCollect(keyId);
      }, 500);
    }
  };

  const handleCollision = (event) => {
    console.log("Colisão detectada!", event);
    console.log("Other object:", event.other.rigidBodyObject?.userData);
    console.log("Is player:", event.other.rigidBodyObject?.userData?.isPlayer);
    console.log("Is collected:", isCollected);
    console.log("Is animating:", isAnimating);
    
    if (event.other.rigidBodyObject?.userData?.isPlayer && !isCollected && !isAnimating) {
      console.log("Chave coletada por colisão!", keyId);
      handleProximityCollection();
    }
  };

  if (isCollected) {
    return null; // Remove a chave quando coletada
  }

  return (
    <RigidBody
      type="fixed"
      colliders="ball"
      onCollisionEnter={handleCollision}
      onIntersectionEnter={handleCollision}
      sensor={true}
      {...props}
    >
      {/* Sensor de colisão expandido */}
      <mesh position={[0, 0, 0]} visible={false}>
        <sphereGeometry args={[5, 16, 16]} />
      </mesh>
      
      <group ref={group} position={position} scale={0.005}>
        <primitive 
          object={scene.clone()} 
          castShadow 
          receiveShadow
        />
        
        {/* Indicador visual temporário para debug */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[5, 16, 16]} />
          <meshStandardMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.1}
            wireframe={true}
          />
        </mesh>
        {/* Efeito de brilho dourado */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.4}
            emissive="#FFD700"
            emissiveIntensity={0.8}
          />
        </mesh>
        {/* Partículas douradas */}
        {[...Array(6)].map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.cos((i / 6) * Math.PI * 2) * 0.3,
              Math.sin((i / 6) * Math.PI * 2) * 0.1,
              Math.sin((i / 6) * Math.PI * 2) * 0.3
            ]}
          >
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshStandardMaterial 
              color="#FFD700" 
              emissive="#FFD700" 
              emissiveIntensity={1.2} 
            />
          </mesh>
        ))}
        
        {/* Sombra escura realista no chão */}
        <mesh 
          position={[0, 0.005, 0]} 
          rotation-x={-Math.PI / 2}
        >
          <circleGeometry args={[0.8, 32]} />
          <meshStandardMaterial 
            color="#000000" 
            transparent 
            opacity={0.4}
          />
        </mesh>

        {/* Sombra projetada no chão com efeito brilhante */}
        <mesh 
          ref={shadowRef}
          position={[0, 0.01, 0]} 
          rotation-x={-Math.PI / 2}
        >
          <circleGeometry args={[1.5, 32]} />
          <meshStandardMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.2}
            emissive="#FFD700"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* Anel brilhante da sombra */}
        <mesh 
          ref={ringRef}
          position={[0, 0.015, 0]} 
          rotation-x={-Math.PI / 2}
        >
          <ringGeometry args={[1.2, 1.8, 32]} />
          <meshStandardMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.5}
            emissive="#FFD700"
            emissiveIntensity={0.6}
          />
        </mesh>
        
        {/* Gradiente da sombra */}
        <mesh 
          position={[0, 0.008, 0]} 
          rotation-x={-Math.PI / 2}
        >
          <ringGeometry args={[0.8, 1.2, 32]} />
          <meshStandardMaterial 
            color="#333333" 
            transparent 
            opacity={0.3}
          />
        </mesh>
      </group>
    </RigidBody>
  );
};
