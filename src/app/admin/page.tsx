"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

let socket: any;

export default function AdminDashboard() {
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        socket = io();

        socket.on("order_update", (newOrder: any) => {
            setOrders(prev => [newOrder, ...prev]);
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const completeOrder = (id: string) => {
        setOrders(prev => prev.map(order => order.id === id ? { ...order, status: "Completed" } : order));
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 md:p-16 selection:bg-neon-blue/30 selection:text-white">
            <h1 className="text-4xl font-serif font-medium mb-12 tracking-wide border-b border-white/10 pb-6 uppercase text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-cyan">
                Zaika Junction Kitchen
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {orders.map((order, idx) => (
                        <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className={`p-6 rounded-2xl border backdrop-blur-xl ${order.status === "Completed"
                                ? "bg-white/5 border-white/5 opacity-50"
                                : "bg-black/60 border-neon-cyan/30 box-glow"
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-2xl font-bold">{order.table}</h3>
                                    <p className="text-white/50 text-sm">{order.name} • {order.phone}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === "Completed" ? "bg-white/10 text-white" : "bg-neon-cyan/20 text-neon-cyan"
                                    }`}>
                                    {order.status}
                                </div>
                            </div>

                            <div className="text-sm font-mono text-white/40 mb-6">
                                #{order.id.toUpperCase()} • {new Date(order.time).toLocaleTimeString()} • {order.payment.toUpperCase()}
                            </div>

                            {order.status !== "Completed" && (
                                <button
                                    onClick={() => completeOrder(order.id)}
                                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium border border-white/10 text-sm"
                                >
                                    Mark Completed
                                </button>
                            )}
                        </motion.div>
                    ))}

                    {orders.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="col-span-full h-64 flex items-center justify-center text-white/30 border border-dashed border-white/10 rounded-3xl"
                        >
                            No active orders. Awaiting incoming requests...
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
