import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useControls } from "leva";
import { useEffect, useRef, useState } from "react";
import { MathUtils, Vector3 } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { GameState } from "../App";
import { Character } from "./Character";
import { Bazooka } from "./Bazooka";
import { BombProjectile } from "./BombProjectile";

const normalizeAngle = (angle) => {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
};

const lerpAngle = (start, end, t) => {
  start = normalizeAngle(start);
  end = normalizeAngle(end);

  if (Math.abs(end - start) > Math.PI) {
    if (end > start) {
      start += 2 * Math.PI;
    } else {
      end += 2 * Math.PI;
    }
  }

  return normalizeAngle(start + (end - start) * t);
};

export const CharacterController = () => {
  const { WALK_SPEED, RUN_SPEED, ROTATION_SPEED, JUMP_FORCE, CAMERA_ROTATION_SPEED } = useControls(
    "Character Control",
    {
      WALK_SPEED: { value: 0.8, min: 0.1, max: 4, step: 0.1 },
      RUN_SPEED: { value: 1.6, min: 0.2, max: 12, step: 0.1 },
      ROTATION_SPEED: {
        value: degToRad(0.5),
        min: degToRad(0.1),
        max: degToRad(5),
        step: degToRad(0.1),
      },
      JUMP_FORCE: { value: 8, min: 1, max: 20, step: 0.5 },
      CAMERA_ROTATION_SPEED: { value: 0.005, min: 0.001, max: 0.02, step: 0.001 },
    }
  );
  const rb = useRef();
  const container = useRef();
  const character = useRef();

  const [animation, setAnimation] = useState("idle");
  const [isGrounded, setIsGrounded] = useState(true);
  const [isJumping, setIsJumping] = useState(false);
  const [isShooting, setIsShooting] = useState(false);
  // Remove local state, use GameState instead

  const characterRotationTarget = useRef(0);
  const rotationTarget = useRef(0);
  const cameraRotationTarget = useRef(0);
  const cameraTarget = useRef();
  const cameraPosition = useRef();
  const cameraWorldPosition = useRef(new Vector3());
  const cameraLookAtWorldPosition = useRef(new Vector3());
  const cameraLookAt = useRef(new Vector3());
  const [, get] = useKeyboardControls();
  const isClicking = useRef(false);
  const isRightClicking = useRef(false);
  const mousePosition = useRef({ x: 0, y: 0 });
  const lastShootTime = useRef(0);
  const explosionForceRef = useRef(new Vector3(0, 0, 0));

  useEffect(() => {
    const onMouseDown = (e) => {
      if (e.button === 0) { // Left click
        console.log("Left mouse click detected!");
        // Handle shooting first
        const currentTime = Date.now();
        console.log("Shooting check:", {
          ammo: GameState.ammo,
          canShoot: GameState.canShoot,
          timeSinceLastShot: currentTime - lastShootTime.current
        });
        if (GameState.ammo > 0 && GameState.canShoot && currentTime - lastShootTime.current > 300 && GameState.activeProjectiles.length < 5) {
          GameState.ammo -= 1;
          GameState.canShoot = false;
          GameState.shootCooldown = 0.3;
          lastShootTime.current = currentTime;
          setIsShooting(true);
          
          // Create projectile from character-relative bazooka position
          const characterWorldPos = character.current.getWorldPosition(new Vector3());
          // Bazooka offset relative to character (same as bazooka position in the component)
          const bazookaOffset = new Vector3(0.15, 0.1, 0.2);
          
          // Calculate bazooka world position relative to character
          const bazookaWorldPos = new Vector3();
          bazookaWorldPos.copy(characterWorldPos).add(bazookaOffset);
          
          // Calculate shoot direction based on character's front direction
          // Use character's rotation to determine front direction
          const characterFrontDirection = new Vector3(0, 0, 1); // Character's front is along positive Z axis
          characterFrontDirection.applyAxisAngle(new Vector3(0, 1, 0), characterRotationTarget.current + cameraRotationTarget.current);
          
          // Create shoot direction with upward angle
          const shootDirection = new Vector3(
            characterFrontDirection.x,
            0.15, // Upward angle for arc trajectory
            characterFrontDirection.z
          );
          
          console.log("Character front direction:", characterFrontDirection);
          console.log("Shoot direction:", shootDirection);
          
          const projectileId = Date.now();
          const newProjectile = {
            id: projectileId,
            position: [bazookaWorldPos.x, bazookaWorldPos.y, bazookaWorldPos.z],
            direction: [shootDirection.x, shootDirection.y, shootDirection.z]
          };
          
          GameState.activeProjectiles.push(newProjectile);
          
          console.log("Bazooka fired! Ammo remaining:", GameState.ammo);
          console.log("Projectile created:", newProjectile);
          console.log("Total projectiles:", GameState.activeProjectiles.length);
          
          // Add shooting sound effect (optional)
          try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
          } catch (e) {
            // Audio not supported or blocked
          }
          
          // Reset shooting animation after 300ms
          setTimeout(() => setIsShooting(false), 300);
        }
        
        // Then handle movement
        isClicking.current = true;
      } else if (e.button === 2) { // Right click
        isRightClicking.current = true;
        mousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };
    const onMouseUp = (e) => {
      if (e.button === 0) { // Left click
        isClicking.current = false;
      } else if (e.button === 2) { // Right click
        isRightClicking.current = false;
      }
    };
    const onMouseMove = (e) => {
      if (isRightClicking.current) {
        const deltaX = e.clientX - mousePosition.current.x;
        cameraRotationTarget.current += deltaX * CAMERA_ROTATION_SPEED;
        console.log("Camera rotation:", cameraRotationTarget.current, "Delta:", deltaX);
        mousePosition.current = { x: e.clientX, y: e.clientY };
      }
    };
    
    // Prevent context menu on right click
    const onContextMenu = (e) => {
      e.preventDefault();
    };
    
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("contextmenu", onContextMenu);
    
    // touch
    document.addEventListener("touchstart", onMouseDown);
    document.addEventListener("touchend", onMouseUp);
    
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("touchstart", onMouseDown);
      document.removeEventListener("touchend", onMouseUp);
    };
  }, []);

  useFrame(({ camera, mouse }) => {
    // Update shoot cooldown
    if (GameState.shootCooldown > 0) {
      GameState.shootCooldown = Math.max(0, GameState.shootCooldown - 0.016); // 60fps = 0.016s per frame
      if (GameState.shootCooldown <= 0.016) {
        GameState.canShoot = true;
      }
    }

    // Handle explosion forces - only check every 3 frames to reduce performance impact
    if (rb.current && GameState.explosions.length > 0 && Math.floor(Date.now() / 16) % 3 === 0) {
      const characterPos = rb.current.translation();
      let totalForceX = 0, totalForceY = 0, totalForceZ = 0;
      
      // Process explosions in reverse order to safely remove old ones
      for (let i = GameState.explosions.length - 1; i >= 0; i--) {
        const explosion = GameState.explosions[i];
        
        // Remove old explosions first
        if (explosion.time < Date.now() - 2000) {
          GameState.explosions.splice(i, 1);
          continue;
        }
        
        // Simplified distance calculation
        const dx = characterPos.x - explosion.position[0];
        const dy = characterPos.y - explosion.position[1];
        const dz = characterPos.z - explosion.position[2];
        const distanceSquared = dx * dx + dy * dy + dz * dz;
        const maxRadius = explosion.radius || 15;
        const maxRadiusSquared = maxRadius * maxRadius;
        
        if (distanceSquared < maxRadiusSquared) {
          const distance = Math.sqrt(distanceSquared);
          const forceStrength = explosion.strength || 20;
          const distanceFactor = 1 - (distance / maxRadius);
          const force = forceStrength * distanceFactor * distanceFactor;
          
          // Simplified direction calculation
          const invDistance = 1 / distance;
          const dirX = dx * invDistance;
          const dirY = dy * invDistance + 0.3; // Add upward bias
          const dirZ = dz * invDistance;
          
          // Normalize the direction
          const dirLength = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);
          const invDirLength = 1 / dirLength;
          
          totalForceX += dirX * invDirLength * force;
          totalForceY += dirY * invDirLength * force;
          totalForceZ += dirZ * invDirLength * force;
        }
      }
      
      // Apply explosion force to character
      if (Math.abs(totalForceX) > 0.1 || Math.abs(totalForceY) > 0.1 || Math.abs(totalForceZ) > 0.1) {
        const currentVel = rb.current.linvel();
        rb.current.setLinvel(
          new Vector3(
            currentVel.x + totalForceX * 0.016,
            currentVel.y + totalForceY * 0.016,
            currentVel.z + totalForceZ * 0.016
          ),
          true
        );
      }
    }

    if (rb.current) {
      const vel = rb.current.linvel();

      // Check if grounded (simple Y velocity check)
      const isCurrentlyGrounded = vel.y < 0.1 && vel.y > -0.1;
      setIsGrounded(isCurrentlyGrounded);
      
      // Handle jump
      if (get().jump && isCurrentlyGrounded && !isJumping) {
        vel.y = JUMP_FORCE;
        setIsJumping(true);
        setAnimation("jump");
      }
      
      // Reset jumping state when landing
      if (isCurrentlyGrounded && isJumping) {
        setIsJumping(false);
      }

      const movement = {
        x: 0,
        z: 0,
      };

      if (get().forward) {
        movement.z = 1;
      }
      if (get().backward) {
        movement.z = -1;
      }

      let speed = get().run ? RUN_SPEED : WALK_SPEED;

      if (isClicking.current && (Math.abs(mouse.x) > 0.1 || Math.abs(mouse.y) > 0.1)) {
        console.log("clicking", mouse.x, mouse.y);
        if (Math.abs(mouse.x) > 0.1) {
          movement.x = -mouse.x;
        }
        movement.z = mouse.y + 0.4;
        if (Math.abs(movement.x) > 0.5 || Math.abs(movement.z) > 0.5) {
          speed = RUN_SPEED;
        }
      }

      if (get().left) {
        movement.x = 1;
      }
      if (get().right) {
        movement.x = -1;
      }

      // Calculate movement direction relative to camera rotation
      if (movement.x !== 0 || movement.z !== 0) {
        // Calculate the target rotation based on input direction
        const inputAngle = Math.atan2(movement.x, movement.z);
        
        // Apply camera rotation to get world-space direction
        const worldAngle = inputAngle + rotationTarget.current + cameraRotationTarget.current;
        
        // Set character rotation target (visual rotation)
        characterRotationTarget.current = inputAngle;
        
        // Apply movement in world space
        vel.x = Math.sin(worldAngle) * speed;
        vel.z = Math.cos(worldAngle) * speed;
        if (!isJumping && !isShooting) {
          if (speed === RUN_SPEED) {
            setAnimation("run");
          } else {
            setAnimation("walk");
          }
        }
      } else if (!isJumping && !isShooting) {
        setAnimation("idle");
      }
      
      // Override animation for shooting
      if (isShooting) {
        setAnimation("jump"); // Use jump animation for shooting effect
      }
      character.current.rotation.y = lerpAngle(
        character.current.rotation.y,
        characterRotationTarget.current,
        0.1
      );

      rb.current.setLinvel(vel, true);
    }

    character.current.getWorldPosition(GameState.characterPosition);

    // CAMERA
    container.current.rotation.y = MathUtils.lerp(
      container.current.rotation.y,
      rotationTarget.current + cameraRotationTarget.current,
      0.1
    );

    GameState.containerRotation = container.current.rotation.y;

    cameraPosition.current.getWorldPosition(cameraWorldPosition.current);
    camera.position.lerp(cameraWorldPosition.current, 0.1);

    if (cameraTarget.current) {
      cameraTarget.current.getWorldPosition(cameraLookAtWorldPosition.current);
      cameraLookAt.current.lerp(cameraLookAtWorldPosition.current, 0.1);

      camera.lookAt(cameraLookAt.current);
    }
  });

  return (
    <RigidBody colliders={false} lockRotations ref={rb}>
      <group ref={container}>
        <group ref={cameraTarget} position-z={1.5} />
        <group ref={cameraPosition} position-y={4} position-z={-4} />
        <group ref={character}>
          <Character scale={0.18} position-y={-0.25} animation={animation} />
          <Bazooka 
            scale={0.3} 
            position={[0.15, 0.1, 0.2]} 
            rotation={[0, Math.PI / 2, 0]}
            isShooting={isShooting}
          />
        </group>
      </group>
      <CapsuleCollider args={[0.08, 0.15]} />
    </RigidBody>
  );
};
