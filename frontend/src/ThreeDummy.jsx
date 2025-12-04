// ThreeDummy.jsx
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

export default function ThreeDummy({ active = false }) {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [0, 1.5, 3], fov: 45 }}>
        {/* Lighting */}
        <ambientLight intensity={0.4} />
        <directionalLight position={[2, 2, 3]} intensity={1} />

        {/* Dummy Model */}
        <group position={[0, -1, 0]}>
          {/* Head */}
          <mesh position={[0, 1.6, 0]}>
            <sphereGeometry args={[0.22, 32, 32]} />
            <meshStandardMaterial color="#555" emissive="#222" />
          </mesh>

          {/* Torso */}
          <mesh position={[0, 1, 0]}>
            <capsuleGeometry args={[0.25, 0.9, 8, 16]} />
            <meshStandardMaterial color="#555" emissive="#222" />
          </mesh>

          {/* Left Arm */}
          <mesh position={[-0.45, 1.2, 0]}>
            <capsuleGeometry args={[0.12, 0.7, 8, 16]} />
            <meshStandardMaterial color="#444" emissive="#222" />
          </mesh>

          {/* Right Arm */}
          <mesh position={[0.45, 1.2, 0]}>
            <capsuleGeometry args={[0.12, 0.7, 8, 16]} />
            <meshStandardMaterial color="#444" emissive="#222" />
          </mesh>

          {/* Hips */}
          <mesh position={[0, 0.4, 0]}>
            <capsuleGeometry args={[0.22, 0.6, 8, 16]} />
            <meshStandardMaterial color="#444" emissive="#222" />
          </mesh>

          {/* Legs */}
          <mesh position={[-0.22, -0.4, 0]}>
            <capsuleGeometry args={[0.15, 1.0, 8, 16]} />
            <meshStandardMaterial color="#333" emissive="#111" />
          </mesh>

          <mesh position={[0.22, -0.4, 0]}>
            <capsuleGeometry args={[0.15, 1.0, 8, 16]} />
            <meshStandardMaterial color="#333" emissive="#111" />
          </mesh>
        </group>

        {/* Camera control (optional) */}
        <OrbitControls enableZoom={false} enablePan={false} />
      </Canvas>
    </div>
  );
}
