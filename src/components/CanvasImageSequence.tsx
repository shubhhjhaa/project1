"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useScroll, useSpring, useMotionValueEvent, motion, AnimatePresence } from "framer-motion";

const padFrame = (num: number) => {
    return num.toString().padStart(3, "0");
};

export default function CanvasImageSequence() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<HTMLImageElement[]>([]);
    const [loaded, setLoaded] = useState(0);
    const lastDrawnIndexRef = useRef<number>(-1);
    const lastDrawnBlendRef = useRef<number>(-1);

    const { scrollYProgress } = useScroll();
    // Smooth out scroll progress for cinematic feel
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 80,
        damping: 20,
        restDelta: 0.001
    });

    const [isMobile, setIsMobile] = useState(false);
    const [isLowEnd, setIsLowEnd] = useState(false);
    const [config, setConfig] = useState<{ frameCount: number, pathPrefix: string, ext: string } | null>(null);

    useEffect(() => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        
        // Basic performance detection
        const hwConcurrency = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4;
        const lowEnd = mobile && hwConcurrency <= 4;
        setIsLowEnd(lowEnd);

        setConfig(mobile ? {
            frameCount: 40,
            pathPrefix: '/frames-mobile/frame-',
            ext: '.webp'
        } : {
            frameCount: 240,
            pathPrefix: '/frames/ezgif-frame-',
            ext: '.png'
        });
    }, []);

    // Progressive Preload
    useEffect(() => {
        if (!config) return;
        let imagesLoaded = 0;
        
        const loadFrame = (i: number) => {
            return new Promise<void>((resolve) => {
                if (imagesRef.current[i]) {
                    resolve();
                    return;
                }
                const img = new Image();
                img.src = `${config.pathPrefix}${padFrame(i)}${config.ext}`;
                img.onload = () => {
                    imagesLoaded++;
                    setLoaded(Math.max(loaded, imagesLoaded));
                    if (i === 1) renderFrame(1);
                    resolve();
                };
                img.onerror = () => resolve(); // prevent blocking on error
                imagesRef.current[i] = img;
            });
        };

        const preloadProgressive = async () => {
            // Priority 1: Load first 5 frames quickly for fast start
            const initialFrames = Math.min(5, config.frameCount);
            await Promise.all(Array.from({length: initialFrames}, (_, i) => loadFrame(i + 1)));
            
            // Priority 2: Load remaining frames in parallel batches to overcome network latency on production
            const batchSize = isLowEnd ? 5 : 20;
            for (let i = initialFrames + 1; i <= config.frameCount; i += batchSize) {
                const batch = [];
                for (let j = 0; j < batchSize && (i + j) <= config.frameCount; j++) {
                    batch.push(loadFrame(i + j));
                }
                await Promise.all(batch);
                // Tiny delay on low-end devices to avoid freezing the UI thread completely
                if (isLowEnd) await new Promise(r => setTimeout(r, 10)); 
            }
        };
        
        preloadProgressive();
    }, [config, isLowEnd]);

    // Render Frame function
    const renderFrame = useCallback((progressVal: number) => {
        if (!canvasRef.current || !config) return;
        const ctx = canvasRef.current.getContext("2d", { alpha: false }); // Optimize by disabling alpha if possible
        if (!ctx) return;

        const baseIndex = Math.max(1, Math.min(config.frameCount, Math.floor(progressVal)));
        let nextIndex = Math.min(config.frameCount, baseIndex + 1);
        const blend = progressVal - baseIndex;

        // Skip render if nothing changed materially (glitch/jitter prevention)
        if (lastDrawnIndexRef.current === baseIndex && Math.abs(lastDrawnBlendRef.current - blend) < 0.02) {
            return; 
        }

        const img1 = imagesRef.current[baseIndex];
        let img2 = imagesRef.current[nextIndex];

        // Fallback if current frame isn't loaded
        if (!img1 || !img1.complete || img1.naturalWidth === 0) return;
        // Fallback for next img
        if (!img2 || !img2.complete || img2.naturalWidth === 0) {
            img2 = img1; // Just use img1 to prevent flickering
        }

        const canvas = canvasRef.current;
        // Cap DPR on mobile to improve performance
        const maxDpr = isMobile ? (isLowEnd ? 1 : 1.5) : 2;
        const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);
        
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        // Only resize canvas if dimensions actually changed
        if (canvas.width !== Math.floor(canvasWidth * dpr) || canvas.height !== Math.floor(canvasHeight * dpr)) {
            canvas.width = Math.floor(canvasWidth * dpr);
            canvas.height = Math.floor(canvasHeight * dpr);
            ctx.scale(dpr, dpr);
        } else {
            // Reset transform before clearing
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }

        const drawCtx = (img: HTMLImageElement, alpha: number, zoomOffset: number = 0) => {
            if (!img || !img.complete) return;
            
            // Base fill-screen scale
            let scale = Math.max(
                canvasWidth / img.width,
                canvasHeight / img.height
            );
            
            // Depth enhancement: subtle cinematic zoom + parallax effect based on frame index
            const zoomFactor = 1 + ((baseIndex / config.frameCount) * 0.08) + zoomOffset;
            scale *= zoomFactor;

            const drawWidth = img.width * scale;
            const drawHeight = img.height * scale;
            
            const x = (canvasWidth / 2) - (drawWidth / 2);
            // Slight Y offset parallax
            const y = (canvasHeight / 2) - (drawHeight / 2) + ((baseIndex / config.frameCount) * 20);

            ctx.globalAlpha = alpha;
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
        };

        // Fill background to black to prevent transparent glitches
        ctx.fillStyle = "#050505";
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Interpolation and Motion Blur emulation
        // Disable crossfade on extremely low end devices to ensure no frame drops
        const useCrossfade = isMobile && !isLowEnd && blend > 0.05 && img2 && baseIndex !== nextIndex;

        if (useCrossfade) {
            drawCtx(img1, 1 - (blend * 0.5)); // Slight dimming of previous frame
            drawCtx(img2, blend, blend * 0.01); // Next frame with slight zoom for depth feeling
        } else {
            drawCtx(img1, 1);
        }
        
        ctx.globalAlpha = 1.0;
        
        lastDrawnIndexRef.current = baseIndex;
        lastDrawnBlendRef.current = blend;

    }, [config, isMobile, isLowEnd]);

    // Sync scroll with frame interpolation
    useMotionValueEvent(smoothProgress, "change", (latest) => {
        if (!config) return;
        const progressVal = 1 + latest * (config.frameCount - 1);
        // Use requestAnimationFrame explicitly to align with browser paint
        requestAnimationFrame(() => renderFrame(progressVal));
    });

    // Handle Resize boundaries
    useEffect(() => {
        let resizeTicking = false;
        const handleResize = () => {
            if (!resizeTicking) {
                requestAnimationFrame(() => {
                    if (!config) return;
                    const latest = smoothProgress.get();
                    const progressVal = 1 + latest * (config.frameCount - 1);
                    // Force refresh by invalidating cache
                    lastDrawnIndexRef.current = -1;
                    renderFrame(progressVal);
                    resizeTicking = false;
                });
                resizeTicking = true;
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [smoothProgress, config, renderFrame]);

    // Calculate loading progress (fast for initial 5, then background)
    const initialExpected = Math.min(5, config?.frameCount || 40);
    const progress = Math.min((loaded / initialExpected) * 100, 100);

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
                        <div className="absolute w-64 h-64 bg-[#ff7b00]/10 rounded-full blur-[80px]" />

                        <div className="flex flex-col items-center z-10">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                className="text-6xl mb-6 drop-shadow-2xl"
                            >
                                👨‍🍳
                            </motion.div>

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
                                {progress >= 100 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: [0, 1, 0] }}
                                        transition={{ duration: 0.4 }}
                                        className="absolute inset-0 bg-white/60 mix-blend-overlay rounded-full"
                                    />
                                )}
                            </div>

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
                style={{ 
                    filter: "brightness(0.75) contrast(1.15) saturate(1.1)",
                    willChange: "transform, opacity" 
                }}
            />
        </>
    );
}
