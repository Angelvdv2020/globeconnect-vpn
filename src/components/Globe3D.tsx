import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, OrbitControls, Line } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface GlobeSceneProps {
  isConnected: boolean;
}

function GlobeMesh({ isConnected }: GlobeSceneProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (meshRef.current) {
      const speed = isConnected ? 0.15 : 0.02;
      meshRef.current.rotation.y += delta * speed;
    }
    if (glowRef.current) {
      glowRef.current.rotation.y += delta * 0.1;
    }
  });

  // Generate wireframe lines for the globe
  const wireframeLines = useMemo(() => {
    const lines: [number, number, number][][] = [];
    const radius = 1.8;

    // Latitude lines
    for (let i = -60; i <= 60; i += 30) {
      const points: [number, number, number][] = [];
      const phi = (90 - i) * (Math.PI / 180);
      for (let j = 0; j <= 360; j += 5) {
        const theta = j * (Math.PI / 180);
        points.push([
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta),
        ]);
      }
      lines.push(points);
    }

    // Longitude lines
    for (let i = 0; i < 360; i += 30) {
      const points: [number, number, number][] = [];
      const theta = i * (Math.PI / 180);
      for (let j = 0; j <= 180; j += 5) {
        const phi = j * (Math.PI / 180);
        points.push([
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta),
        ]);
      }
      lines.push(points);
    }

    return lines;
  }, []);

  // Connection line (arc from user to server)
  const connectionLine = useMemo(() => {
    const points: [number, number, number][] = [];
    const r = 2.2;
    for (let i = 0; i <= 50; i++) {
      const t = (i / 50) * Math.PI * 0.6 - Math.PI * 0.3;
      points.push([
        r * Math.cos(t) * 1.2,
        r * Math.sin(t) * 0.5 + 0.5,
        r * Math.sin(t) * 0.8,
      ]);
    }
    return points;
  }, []);

  const idleColor = "#1a3a6e";
  const activeColor = "#00D1FF";
  const lineColor = isConnected ? activeColor : idleColor;

  return (
    <group ref={meshRef}>
      {/* Core sphere */}
      <Sphere args={[1.75, 32, 32]}>
        <meshPhongMaterial
          color={isConnected ? "#0a2a5e" : "#0a1a3e"}
          transparent
          opacity={0.3}
          shininess={100}
        />
      </Sphere>

      {/* Glow sphere */}
      <Sphere args={[1.85, 32, 32]} ref={glowRef}>
        <meshPhongMaterial
          color={isConnected ? activeColor : "#1a2a4e"}
          transparent
          opacity={isConnected ? 0.08 : 0.03}
          side={THREE.BackSide}
        />
      </Sphere>

      {/* Wireframe lines */}
      {wireframeLines.map((points, i) => (
        <Line
          key={i}
          points={points}
          color={lineColor}
          lineWidth={0.5}
          transparent
          opacity={isConnected ? 0.4 : 0.15}
        />
      ))}

      {/* Connection arc when VPN is active */}
      {isConnected && (
        <>
          <Line
            points={connectionLine}
            color={activeColor}
            lineWidth={2}
            transparent
            opacity={0.8}
          />
          {/* Server point */}
          <mesh position={[connectionLine[0][0], connectionLine[0][1], connectionLine[0][2]]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color={activeColor} />
          </mesh>
          {/* User point */}
          <mesh position={[connectionLine[50][0], connectionLine[50][1], connectionLine[50][2]]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#FF8A00" />
          </mesh>
        </>
      )}
    </group>
  );
}

export default function Globe3D({ isConnected }: GlobeSceneProps) {
  return (
    <div className="w-full h-[280px] relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color={isConnected ? "#00D1FF" : "#4466aa"} />
        <pointLight position={[-5, -3, 3]} intensity={0.3} color="#FF8A00" />
        <GlobeMesh isConnected={isConnected} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          maxPolarAngle={Math.PI * 0.65}
          minPolarAngle={Math.PI * 0.35}
        />
      </Canvas>
    </div>
  );
}
