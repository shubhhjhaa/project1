"use client";

import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

function FancyPlate({ position, color, delay = 0, hovered, setHovered, id }: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin((state.clock.elapsedTime + delay) * 0.5) * 0.2;
            meshRef.current.rotation.z = Math.cos((state.clock.elapsedTime + delay) * 0.3) * 0.1;

            const targetScale = hovered === id ? 1.15 : 1;
            meshRef.current.scale.setScalar(
                THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1)
            );
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={1.5} floatingRange={[-0.1, 0.1]}>
            <mesh
                ref={meshRef}
                position={position}
                rotation={[Math.PI / 6, 0, 0]}
                onPointerOver={() => setHovered(id)}
                onPointerOut={() => setHovered(null)}
            >
                <cylinderGeometry args={[1.5, 1.2, 0.2, 64]} />
                <meshPhysicalMaterial
                    color={color}
                    metalness={0.8}
                    roughness={0.2}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    envMapIntensity={2}
                />
                {/* Glow if hovered */}
                {hovered === id && (
                    <pointLight color={color} position={[0, 1, 0]} intensity={2} distance={3} />
                )}
            </mesh>
        </Float>
    );
}

export default function Menu3D() {
    const [hovered, setHovered] = useState<number | null>(null);

    const items = [
        { id: 1, pos: [-3, 0, 0], color: "#00D6FF" },
        { id: 2, pos: [0, 0.5, 1], color: "#0050FF" },
        { id: 3, pos: [3, 0, 0], color: "#FFFFFF" },
    ];

    return (
        <div className="absolute inset-0 z-0 h-full w-full pointer-events-none">
            <Canvas camera={{ position: [0, 2, 8], fov: 45 }} className="pointer-events-auto">
                <Environment preset="city" />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <spotLight position={[0, 5, 0]} intensity={2} angle={0.5} penumbra={1} color="#0050FF" />

                {/* Floating Elements Removed per Request */}

                <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={20} blur={2} far={10} />
            </Canvas>
        </div>
    );
}
