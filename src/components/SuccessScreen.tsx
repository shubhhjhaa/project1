"use client";

import { motion } from "framer-motion";

export default function SuccessScreen() {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black z-[60] flex flex-col items-center justify-center pointer-events-auto"
        >
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
                className="w-32 h-32 rounded-full box-glow bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="text-5xl text-neon-cyan"
                >
                    ✓
                </motion.div>

                {/* Pulsing ring */}
                <motion.div
                    animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                    className="absolute inset-0 rounded-full border border-neon-cyan"
                />
            </motion.div>

            <motion.h2
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-4xl font-serif font-medium tracking-wide text-white mb-4"
            >
                Order Confirmed
            </motion.h2>

            <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-white/50 text-lg max-w-sm text-center"
            >
                The kitchen has received your order. We will serve you shortly.
            </motion.p>

            <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={() => window.location.reload()}
                className="mt-12 text-neon-blue hover:text-white transition-colors"
            >
                Return to Menu
            </motion.button>
        </motion.div>
    );
}
