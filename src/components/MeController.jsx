import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { CapsuleCollider, RigidBody } from "@react-three/rapier";
import { useEffect, useRef, useState } from "react";
import { Me } from "./Me";

const WALK_SPEED = 1.6;
const RUN_SPEED = 2.5;

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

export default function MeController(props) {
  const rb = useRef();
  const container = useRef();
  const character = useRef();

  const [animation, setAnimation] = useState("idle");

  const characterRotationTarget = useRef(0);
  const [, get] = useKeyboardControls();

  useFrame(() => {
    if (rb.current) {
      const vel = rb.current.linvel();

      const movement = {
        x: 0,
        z: 0,
      };

      if (get().forward) {
        movement.z = -1;
      }
      if (get().backward) {
        movement.z = 1;
      }

      let speed = get().run ? RUN_SPEED : WALK_SPEED;

      if (get().left) {
        movement.x = -1;
      }
      if (get().right) {
        movement.x = 1;
      }

      if (movement.x !== 0 || movement.z !== 0) {
        characterRotationTarget.current = Math.atan2(movement.x, movement.z);
        character.current.rotation.y = lerpAngle(
          character.current.rotation.y,
          characterRotationTarget.current,
          0.1
        );

        vel.x = Math.sin(characterRotationTarget.current) * speed;
        vel.z = Math.cos(characterRotationTarget.current) * speed;
        if (speed === RUN_SPEED) {
          setAnimation("SlowRun");
        } else {
          setAnimation("Walking");
        }
      } else {
        setAnimation("BreathingIdle");
      }

      rb.current.setLinvel(vel, true);
    }
  });

  return (
    <group {...props}>
      <RigidBody colliders={false} lockRotations ref={rb}>
        <group ref={container}>
          <group ref={character}>
            <Me scale={0.8} animation={animation} />
          </group>
        </group>
        <CapsuleCollider args={[0.3, 0.3]} position={[0, 0.58, 0]} />
      </RigidBody>
    </group>
  );
}
