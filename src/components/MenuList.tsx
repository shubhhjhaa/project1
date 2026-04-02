"use client";

import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as any, stiffness: 100, damping: 15 } }
};

interface MenuListProps {
    menuData: any[];
    cartItems: any[];
    onUpdateQuantity: (id: string | number, newQuantity: number) => void;
    onAddToCart: (item: any) => void;
}

export default function MenuList({ menuData, cartItems, onUpdateQuantity, onAddToCart }: MenuListProps) {
    return (
        <div className="w-full flex flex-col gap-24 pointer-events-auto">
            {menuData.map((category, idx) => (
                <motion.div
                    key={idx}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col gap-8"
                >
                    <motion.h2 variants={itemVariants as any} className="text-2xl sm:text-3xl md:text-5xl font-serif font-medium tracking-wide text-white border-b border-white/10 pb-2 sm:pb-4">
                        {category.title}
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {category.items.map((item: any) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants as any}
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                className="glass-card p-4 sm:p-6 flex flex-col justify-between group cursor-pointer transition-colors duration-300 h-full"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2 gap-4">
                                        <h3 className="text-lg sm:text-xl font-serif font-medium tracking-wide text-white group-hover:text-neon-cyan transition-colors leading-tight">{item.name}</h3>
                                        <span className="text-base sm:text-lg font-light text-white/80 whitespace-nowrap">{item.price}</span>
                                    </div>
                                    <p className="text-sm text-white/50">{item.desc}</p>
                                </div>

                                <div className="mt-4 sm:mt-6 h-10 flex">
                                    <AnimatePresence mode="wait">
                                        {(() => {
                                            const cartItem = cartItems.find((i) => i.id === item.id);
                                            const quantity = cartItem?.quantity || 0;

                                            if (quantity > 0) {
                                                return (
                                                    <motion.div
                                                        key="stepper"
                                                        initial={{ scale: 0.9, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0.9, opacity: 0 }}
                                                        className="flex items-center bg-black/50 rounded-full border border-white/20 p-1 w-full sm:w-auto h-10 shadow-inner overflow-hidden"
                                                    >
                                                        <motion.button
                                                            whileTap={{ scale: 0.8 }}
                                                            whileHover={{ backgroundColor: "rgba(255, 123, 0, 0.2)" }}
                                                            onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, quantity - 1); }}
                                                            className="flex-1 sm:w-10 h-full rounded-full flex items-center justify-center text-white/70 hover:text-white"
                                                        >–</motion.button>
                                                        <span className="text-white text-sm font-medium w-8 text-center select-none">{quantity}</span>
                                                        <motion.button
                                                            whileTap={{ scale: 0.8 }}
                                                            whileHover={{ backgroundColor: "rgba(255, 123, 0, 0.2)" }}
                                                            onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.id, quantity + 1); }}
                                                            className="flex-1 sm:w-10 h-full rounded-full flex items-center justify-center text-neon-blue hover:text-white"
                                                        >+</motion.button>
                                                    </motion.div>
                                                );
                                            }

                                            return (
                                                <motion.button
                                                    key="add"
                                                    initial={{ scale: 0.9, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    exit={{ scale: 0.9, opacity: 0 }}
                                                    onClick={(e) => { e.stopPropagation(); onAddToCart(item); }}
                                                    className="px-5 sm:px-6 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-neon-blue/20 hover:border-neon-blue hover:text-white hover:box-glow transition-all duration-300 flex items-center gap-2 text-sm w-full sm:w-auto justify-center sm:justify-start h-10"
                                                >
                                                    <span className="font-medium">+ Add</span>
                                                </motion.button>
                                            );
                                        })()}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
