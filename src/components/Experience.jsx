import { Environment, OrthographicCamera } from "@react-three/drei";
import { Physics } from "@react-three/rapier";
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import { useSnapshot } from "valtio";
import { GameState } from "../App";
import { CharacterController } from "./CharacterController";
import { Map } from "./Map";
import { ParkourMap } from "./ParkourMap";

export const maps = {
  castle_on_hills: {
    scale: 3,
    position: [-6, -7, 0],
  },
  animal_crossing_map: {
    scale: 20,
    position: [-15, -1, 10],
  },
  city_scene_tokyo: {
    scale: 0.72,
    position: [0, -1, -3.5],
  },
  de_dust_2_with_real_light: {
    scale: 0.3,
    position: [-5, -3, 13],
  },
  medieval_fantasy_book: {
    scale: 0.4,
    position: [-4, 0, -6],
  },
  parkour_buildings: {
    scale: 1,
    position: [0, 0, 0],
  },
};

export const Experience = () => {
  const shadowCameraRef = useRef();
  
  // Garantir que o mapa padrão seja definido
  useEffect(() => {
    if (!GameState.map) {
      GameState.map = "parkour_buildings";
    }
  }, []);

  useControls("Map", {
    map: {
      value: "parkour_buildings",
      options: Object.keys(maps),
      onChange: (value) => {
        GameState.map = value;
      },
    },
  });

  const { map } = useSnapshot(GameState);

  // Debug: verificar qual mapa está sendo renderizado
  // console.log("Current map:", map);

  return (
    <>
      {/* <OrbitControls /> */}
      <Environment preset="sunset" />
      <directionalLight
        intensity={0.65}
        castShadow
        position={[-15, 10, 15]}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00005}
      >
        <OrthographicCamera
          left={-22}
          right={15}
          top={10}
          bottom={-20}
          ref={shadowCameraRef}
          attach={"shadow-camera"}
        />
      </directionalLight>
      <Physics key={map}>
        {map === "parkour_buildings" ? (
          <ParkourMap />
        ) : (
          <Map
            scale={maps[map].scale}
            position={maps[map].position}
            model={`models/${map}.glb`}
          />
        )}
        <CharacterController />
      </Physics>
    </>
  );
};
