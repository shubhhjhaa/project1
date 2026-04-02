"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { io } from "socket.io-client";

let socket: any;

interface CheckoutFormProps {
    onBack: () => void;
    onSuccess: () => void;
}

export default function CheckoutForm({ onBack, onSuccess }: CheckoutFormProps) {
    const [formData, setFormData] = useState({ name: "", phone: "", table: "", payment: "upi" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!socket) {
            socket = io();
        }

        const newOrder = {
            id: Math.random().toString(36).substring(7),
            ...formData,
            time: new Date().toISOString(),
            status: "Preparing"
        };

        socket.emit("new_order", newOrder);

        setTimeout(() => {
            setIsSubmitting(false);
            onSuccess();
        }, 1500);
    };

    return (
        <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 50, opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl z-50 p-6 flex flex-col justify-center items-center"
        >
            <div className="w-full max-w-md w-full relative">
                <button onClick={onBack} className="absolute -top-12 left-0 text-white/50 hover:text-white transition-colors">
                    ← Back to Cart
                </button>
                <h2 className="text-3xl font-serif font-medium tracking-wide text-white mb-8 border-b border-white/10 pb-4">Complete Order</h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="relative group">
                        <input
                            required
                            type="text"
                            id="name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pt-6 pb-2 text-white outline-none focus:border-neon-cyan focus:bg-white/10 transition-all peer text-[16px]"
                            placeholder=" "
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                        <label htmlFor="name" className="absolute left-4 top-4 text-white/50 text-sm transition-all peer-focus:-translate-y-2 peer-focus:text-xs peer-focus:text-neon-cyan peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-xs">
                            Your Name
                        </label>
                    </div>

                    <div className="relative group">
                        <input
                            required
                            type="tel"
                            id="phone"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pt-6 pb-2 text-white outline-none focus:border-neon-cyan focus:bg-white/10 transition-all peer text-[16px]"
                            placeholder=" "
                            value={formData.phone}
                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <label htmlFor="phone" className="absolute left-4 top-4 text-white/50 text-sm transition-all peer-focus:-translate-y-2 peer-focus:text-xs peer-focus:text-neon-cyan peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-xs">
                            Phone Number
                        </label>
                    </div>

                    <div className="relative group">
                        <input
                            required
                            type="text"
                            id="table"
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 pt-6 pb-2 text-white outline-none focus:border-neon-cyan focus:bg-white/10 transition-all peer text-[16px]"
                            placeholder=" "
                            value={formData.table}
                            onChange={e => setFormData({ ...formData, table: e.target.value })}
                        />
                        <label htmlFor="table" className="absolute left-4 top-4 text-white/50 text-sm transition-all peer-focus:-translate-y-2 peer-focus:text-xs peer-focus:text-neon-cyan peer-[:not(:placeholder-shown)]:-translate-y-2 peer-[:not(:placeholder-shown)]:text-xs">
                            Table Number
                        </label>
                    </div>

                    <div className="mt-4">
                        <p className="text-white/70 mb-3 text-sm">Payment Method</p>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, payment: "upi" })}
                                className={`py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${formData.payment === "upi" ? "bg-neon-blue/20 border-neon-blue text-white box-glow" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}`}
                            >
                                UPI
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, payment: "card" })}
                                className={`py-3 rounded-xl border transition-all flex items-center justify-center gap-2 ${formData.payment === "card" ? "bg-neon-cyan/20 border-neon-cyan text-white box-glow" : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"}`}
                            >
                                Card
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="mt-8 py-4 rounded-xl bg-gradient-to-r from-neon-blue to-neon-cyan text-white font-medium hover:box-glow disabled:opacity-70 disabled:hover:box-none transition-all flex justify-center items-center relative overflow-hidden"
                    >
                        {isSubmitting ? (
                            <motion.div
                                className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"
                            />
                        ) : (
                            "Confirm Selection"
                        )}

                        {/* Glossy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </button>
                </form>
            </div>
        </motion.div>
    );
}
