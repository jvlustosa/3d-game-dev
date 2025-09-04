import { RigidBody } from "@react-three/rapier";
import { useRef } from "react";
import { useSnapshot } from "valtio";
import { StartPortal } from "./StartPortal";
import { CollectibleKey } from "./CollectibleKey";
import { GameState } from "../App";

export const ParkourMap = () => {
  const group = useRef();
  const { collectedKeys } = useSnapshot(GameState);
  
  // console.log("ParkourMap component rendered");

  // Posições das chaves flutuando em cima dos objetos
  const keyPositions = [
    { id: 1, position: [8, 4.5, 0] },   // Primeira chave - em cima do segundo prédio
    { id: 2, position: [32, 7.5, 0] },  // Segunda chave - em cima do prédio mais alto
    { id: 3, position: [57, 6.5, 0] }   // Terceira chave - em cima do penúltimo prédio
  ];

  const handleKeyCollect = (keyId) => {
    GameState.collectedKeys.add(keyId);
    console.log(`Chave ${keyId} coletada! Total: ${GameState.collectedKeys.size}/3`);
  };

  // Configuração dos prédios
  const buildings = [
    { position: [0, 0, 0], width: 4, height: 8, depth: 4 },
    { position: [8, 0, 0], width: 3, height: 6, depth: 3 },
    { position: [15, 0, 0], width: 5, height: 10, depth: 4 },
    { position: [24, 0, 0], width: 4, height: 7, depth: 3 },
    { position: [32, 0, 0], width: 6, height: 12, depth: 5 },
    { position: [42, 0, 0], width: 3, height: 5, depth: 3 },
    { position: [49, 0, 0], width: 4, height: 9, depth: 4 },
    { position: [57, 0, 0], width: 5, height: 11, depth: 4 },
    { position: [65, 0, 0], width: 4, height: 6, depth: 4 },
    { position: [73, 0, 0], width: 6, height: 14, depth: 5 },
  ];

  // Plataformas intermediárias para parkour
  const platforms = [
    { position: [6, 2, 0], width: 1.5, height: 0.2, depth: 2 },
    { position: [12, 1.5, 0], width: 1.5, height: 0.2, depth: 2 },
    { position: [19, 3, 0], width: 2, height: 0.2, depth: 2.5 },
    { position: [28, 2.5, 0], width: 1.5, height: 0.2, depth: 2 },
    { position: [37, 4, 0], width: 2, height: 0.2, depth: 2.5 },
    { position: [46, 1.5, 0], width: 1.5, height: 0.2, depth: 2 },
    { position: [53, 3.5, 0], width: 2, height: 0.2, depth: 2.5 },
    { position: [61, 2, 0], width: 1.5, height: 0.2, depth: 2 },
    { position: [69, 4.5, 0], width: 2, height: 0.2, depth: 2.5 },
  ];

  // Obstáculos móveis
  const movingObstacles = [
    { position: [10, 1, 0], width: 0.5, height: 0.5, depth: 0.5 },
    { position: [21, 2, 0], width: 0.5, height: 0.5, depth: 0.5 },
    { position: [35, 3, 0], width: 0.5, height: 0.5, depth: 0.5 },
    { position: [50, 2.5, 0], width: 0.5, height: 0.5, depth: 0.5 },
    { position: [67, 3, 0], width: 0.5, height: 0.5, depth: 0.5 },
  ];

  // Plataformas suspensas (mais difíceis)
  const hangingPlatforms = [
    { position: [11, 4, 0], width: 1, height: 0.1, depth: 1 },
    { position: [26, 5, 0], width: 1, height: 0.1, depth: 1 },
    { position: [44, 6, 0], width: 1, height: 0.1, depth: 1 },
    { position: [63, 5.5, 0], width: 1, height: 0.1, depth: 1 },
  ];

  return (
    <group ref={group}>
      {/* Prédios principais */}
      {buildings.map((building, index) => (
        <RigidBody key={`building-${index}`} type="fixed" colliders="cuboid">
          <mesh position={building.position} castShadow receiveShadow>
            <boxGeometry args={[building.width, building.height, building.depth]} />
            <meshStandardMaterial color="#696969" />
          </mesh>
        </RigidBody>
      ))}

      {/* Plataformas de parkour */}
      {platforms.map((platform, index) => (
        <RigidBody key={`platform-${index}`} type="fixed" colliders="cuboid">
          <mesh position={platform.position} castShadow receiveShadow>
            <boxGeometry args={[platform.width, platform.height, platform.depth]} />
            <meshStandardMaterial color="#808080" />
          </mesh>
        </RigidBody>
      ))}

      {/* Obstáculos móveis */}
      {movingObstacles.map((obstacle, index) => (
        <RigidBody key={`obstacle-${index}`} type="dynamic" colliders="cuboid">
          <mesh position={obstacle.position} castShadow receiveShadow>
            <boxGeometry args={[obstacle.width, obstacle.height, obstacle.depth]} />
            <meshStandardMaterial color="#A9A9A9" />
          </mesh>
        </RigidBody>
      ))}

      {/* Plataformas suspensas */}
      {hangingPlatforms.map((platform, index) => (
        <RigidBody key={`hanging-${index}`} type="fixed" colliders="cuboid">
          <mesh position={platform.position} castShadow receiveShadow>
            <boxGeometry args={[platform.width, platform.height, platform.depth]} />
            <meshStandardMaterial color="#D3D3D3" />
          </mesh>
        </RigidBody>
      ))}

      {/* Chão base */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[40, -0.5, 0]} receiveShadow>
          <boxGeometry args={[90, 1, 10]} />
          <meshStandardMaterial color="#708090" />
        </mesh>
      </RigidBody>

      {/* Paredes laterais para evitar queda */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[-2, 4, 0]} receiveShadow>
          <boxGeometry args={[1, 8, 10]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
      </RigidBody>
      
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[82, 4, 0]} receiveShadow>
          <boxGeometry args={[1, 8, 10]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
      </RigidBody>

      {/* Linha de chegada */}
      <RigidBody type="fixed" colliders="cuboid">
        <mesh position={[80, 0.5, 0]} receiveShadow>
          <boxGeometry args={[2, 1, 4]} />
          <meshStandardMaterial color="#C0C0C0" />
        </mesh>
      </RigidBody>

      {/* Portal de início */}
      <StartPortal />

      {/* Chaves coletáveis */}
      {keyPositions.map((key) => (
        <CollectibleKey
          key={key.id}
          keyId={key.id}
          position={key.position}
          onCollect={handleKeyCollect}
        />
      ))}
    </group>
  );
};