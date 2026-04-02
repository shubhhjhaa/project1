"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";

const FRAME_COUNT = 240;

const padFrame = (num: number) => {
    return num.toString().padStart(3, "0");
};

export default function CanvasImageSequence() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [loaded, setLoaded] = useState(0);

    const { scrollYProgress } = useScroll();

    // Preload Images
    useEffect(() => {
        let imagesLoaded = 0;
        const preload = () => {
            for (let i = 1; i <= FRAME_COUNT; i++) {
                const img = new Image();
                img.src = `/frames/ezgif-frame-${padFrame(i)}.png`;
                img.onload = () => {
                    imagesLoaded++;
                    setLoaded(imagesLoaded);
                    if (imagesLoaded === 1) renderFrame(1);
                };
                imagesRef.current[i] = img;
            }
        };
        preload();
    }, []);

    // Render Frame function
    const renderFrame = (index: number) => {
        if (!canvasRef.current || !imagesRef.current[index]) return;
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;

        const img = imagesRef.current[index];

        // Maintain aspect ratio while covering the canvas
        const canvas = canvasRef.current;

        // Scale canvas to device pixel ratio for sharp rendering
        const dpr = window.devicePixelRatio || 1;
        canvas.width = window.innerWidth * dpr;
        canvas.height = window.innerHeight * dpr;
        ctx.scale(dpr, dpr);

        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        const scale = Math.max(
            canvasWidth / img.width,
            canvasHeight / img.height
        );

        const x = (canvasWidth / 2) - (img.width / 2) * scale;
        const y = (canvasHeight / 2) - (img.height / 2) * scale;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    // Sync scroll with frame
    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        // Map 0 -> 1 progress to 1 -> 240 index linearly
        const frameIndex = Math.min(
            FRAME_COUNT,
            Math.max(1, Math.ceil(latest * FRAME_COUNT))
        );
        // Request animation frame for smooth execution
        requestAnimationFrame(() => renderFrame(frameIndex));
    });

    // Handle Resize
    useEffect(() => {
        const handleResize = () => {
            const latest = scrollYProgress.get();
            const frameIndex = Math.min(
                FRAME_COUNT,
                Math.max(1, Math.ceil(latest * FRAME_COUNT))
            );
            renderFrame(frameIndex);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [scrollYProgress]);

    const progress = Math.min((loaded / Math.ceil(FRAME_COUNT * 0.1)) * 100, 100);

    return (
        <>
            <AnimatePresence>
                {progress < 100 && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050505]"
                    >
                        {/* Subtle warm glow behind plate */}
                        <div className="absolute w-64 h-64 bg-[#ff7b00]/10 rounded-full blur-[80px]" />

                        <div className="flex flex-col items-center z-10">
                            {/* Bouncing Chef Emoji */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="text-6xl mb-6 drop-shadow-2xl"
                            >
                                👨‍🍳
                            </motion.div>

                            {/* Plate / Fill Container */}
                            <div className="relative w-56 h-3 rounded-full bg-white/5 border border-white/10 overflow-hidden shadow-inner">
                                <motion.div
                                    initial={{ width: "0%", backgroundPosition: "0% 50%" }}
                                    animate={{
                                        width: `${progress}%`,
                                        backgroundPosition: ["0% 50%", "100% 50%"]
                                    }}
                                    transition={{
                                        width: { ease: "easeOut", duration: 0.4 },
                                        backgroundPosition: { repeat: Infinity, duration: 2, ease: "linear" }
                                    }}
                                    style={{
                                        backgroundImage: "linear-gradient(90deg, #ff7b00, #ffb347, #ff7b00)",
                                        backgroundSize: "200% 100%"
                                    }}
                                    className="absolute left-0 top-0 h-full rounded-full"
                                />
                                {/* Quick glow flash when complete */}
                                {progress >= 100 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.4 }}
                                        className="absolute inset-0 bg-white/60 mix-blend-overlay rounded-full"
                                    />
                                )}
                            </div>

                            {/* Fading text */}
                            <motion.p
                                animate={{ opacity: [0.5, 1, 0.5] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="mt-8 font-sans text-[rgba(255,255,255,0.75)] tracking-wide text-sm"
                            >
                                Preparing your delicious experience...
                            </motion.p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <canvas
                ref={canvasRef}
                className="fixed inset-0 w-full h-full object-cover z-[-1] pointer-events-none opacity-80"
                style={{ filter: "brightness(0.7) contrast(1.1)" }}
            />
        </>
    );
}
