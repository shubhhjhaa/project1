"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function SuccessScreen() {
    const [isDone, setIsDone] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[60] h-screen w-screen overflow-hidden bg-[#050505] flex flex-col items-center justify-center pointer-events-auto"
        >
            {/* Subtle warm background glow */}
            <div className="absolute w-72 h-72 bg-[#ff7b00]/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="flex flex-col items-center justify-center z-10 w-full px-4">
                {/* Center Animated Icon (Chef / Checkmark) */}
                <div className="relative w-32 h-32 flex items-center justify-center mb-6">
                    <AnimatePresence mode="wait">
                        {!isDone ? (
                            <motion.div
                                key="chef"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, y: [0, -12, 0] }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                    opacity: { duration: 0.5 },
                                    y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" }
                                }}
                                className="text-6xl drop-shadow-2xl absolute"
                            >
                                👨‍🍳
                            </motion.div>
                        ) : (
                            <motion.div
                                key="check"
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: [1.2, 1] }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="text-6xl text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.5)] absolute"
                            >
                                ✔
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pop Effect on Completion */}
                    {isDone && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 2, opacity: [0.8, 0] }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="absolute inset-0 rounded-full border border-green-400/30"
                        />
                    )}
                </div>

                {/* Success Text */}
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-2xl md:text-3xl font-serif font-medium text-white mb-8 select-none text-center"
                >
                    Order Placed Successfully
                </motion.h2>

                {/* Progress Plate */}
                <div className="relative w-64 md:w-80 h-2 md:h-2.5 rounded-full bg-white/5 border border-white/10 overflow-hidden mb-12 shadow-inner">
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }}
                        onAnimationComplete={() => setIsDone(true)}
                        className="absolute left-0 top-0 h-full rounded-full"
                        style={{
                            backgroundImage: "linear-gradient(90deg, #ff7b00, #ffb347)"
                        }}
                    />
                    {/* Glow pulse when fill completes */}
                    <motion.div
                        animate={{ opacity: isDone ? [0, 1, 0] : 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 bg-[#ffb347]/50 mix-blend-overlay"
                    />
                </div>

                {/* CTA Button */}
                <div className="h-12 flex items-center justify-center">
                    <AnimatePresence>
                        {isDone && (
                            <motion.button
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{
                                    scale: 1.05,
                                    boxShadow: "0 0 20px rgba(255,123,0,0.3)",
                                    borderColor: "rgba(255,255,255,0.3)"
                                }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => window.location.reload()}
                                className="px-10 py-3 bg-white/5 border border-white/10 rounded-full font-medium tracking-wide text-white/80 hover:text-white transition-colors"
                            >
                                Done
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
