import {
  CameraControls,
  Environment,
  Float,
  MeshReflectorMaterial,
  RenderTexture,
  Text,
  useFont,
} from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import { Color } from "three";
import { degToRad, lerp } from "three/src/math/MathUtils";
import { Camping } from "./Camping";
import { currentPageAtom } from "./UI";
import MeController from "./MeController";
import { Physics, RigidBody } from "@react-three/rapier";

const bloomColor = new Color("#fff");
bloomColor.multiplyScalar(1.5);

export const Experience = () => {
  const controls = useRef();
  const meshFitCameraHome = useRef();
  const meshFitCameraStore = useRef();
  const textMaterial = useRef();
  const [currentPage, setCurrentPage] = useAtom(currentPageAtom);

  useFrame((_, delta) => {
    textMaterial.current.opacity = lerp(
      textMaterial.current.opacity,
      currentPage === "home" || currentPage === "intro" ? 1 : 0,
      delta * 1.5
    );
  });

  const intro = async () => {
    controls.current.dolly(-22);
    controls.current.smoothTime = 2.3;
    setTimeout(() => {
      setCurrentPage("home");
    }, 1200);
    fitCamera();
  };

  const fitCamera = async () => {
    if (currentPage === "store") {
      controls.current.smoothTime = 0.8;
      controls.current.fitToBox(meshFitCameraStore.current, true);
    } else {
      controls.current.smoothTime = 1.6;
      controls.current.fitToBox(meshFitCameraHome.current, true);
      controls.current.rotate(0, degToRad(-8), true);
    }
  };

  useEffect(() => {
    intro();
  }, []);

  useEffect(() => {
    fitCamera();
    window.addEventListener("resize", fitCamera);
    return () => window.removeEventListener("resize", fitCamera);
  }, [currentPage]);

  return (
    <>
      <CameraControls ref={controls} />
      <Physics>
        <mesh
          ref={meshFitCameraHome}
          position-z={1.5}
          position-x={-0.4}
          visible={false}
        >
          <boxGeometry args={[13, 2, 2]} />
          <meshBasicMaterial color="orange" transparent opacity={0.5} />
        </mesh>
        <Text
          font={"fonts/Poppins-Black.ttf"}
          position-x={-2}
          position-y={-0.5}
          position-z={1}
          lineHeight={0.8}
          textAlign="center"
          rotation-y={degToRad(30)}
          anchorY={"bottom"}
        >
          WELCOME TO{"\n"}MY WORLD
          <meshBasicMaterial
            color={bloomColor}
            toneMapped={false}
            ref={textMaterial}
          >
            <RenderTexture attach={"map"}>
              <color attach="background" args={["#fff"]} />
              <Environment preset="sunset" />
              <Float floatIntensity={4} rotationIntensity={5}>
                <Camping
                  scale={1.6}
                  rotation-y={-degToRad(25)}
                  rotation-x={degToRad(40)}
                  position-y={-0.5}
                />
              </Float>
            </RenderTexture>
          </meshBasicMaterial>
        </Text>
        <group rotation-y={degToRad(-25)} position-x={3}>
          <Camping scale={0.6} html />
          <mesh ref={meshFitCameraStore} visible={false}>
            <boxGeometry args={[2, 1, 2]} />
            <meshBasicMaterial color="red" transparent opacity={0.5} />
          </mesh>
        </group>

        <RigidBody type="fixed" colliders="trimesh">
          <mesh position-y={-0.48} rotation-x={-Math.PI / 2}>
            <planeGeometry args={[100, 100]} />
            <MeshReflectorMaterial
              blur={[100, 100]}
              resolution={2048}
              mixBlur={1}
              mixStrength={10}
              roughness={1}
              depthScale={1}
              opacity={0.5}
              transparent
              minDepthThreshold={0.4}
              maxDepthThreshold={1.4}
              color="#333"
              metalness={0.5}
            />
          </mesh>
        </RigidBody>

        <MeController position={[0.5, 0, 0.5]} />
        <Environment preset="sunset" />
      </Physics>
    </>
  );
};

useFont.preload("fonts/Poppins-Black.ttf");
