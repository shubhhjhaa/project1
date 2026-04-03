"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

let socket: any;

export default function AdminDashboard() {
    const [isAuth, setIsAuth] = useState(false);
    const [passcode, setPasscode] = useState("");
    const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'coupons'>('orders');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

    const [orders, setOrders] = useState<any[]>([]);
    const [menuData, setMenuData] = useState<any[]>([]);
    const [couponsData, setCouponsData] = useState<any[]>([]);

    useEffect(() => {
        // Initial HTTP fetch (Guarantees data loads on Serverless platforms for viewing)
        fetch('/api/data')
            .then(res => res.json())
            .then(db => {
                setMenuData(prev => prev.length ? prev : (db.menu || []));
                setCouponsData(prev => prev.length ? prev : (db.coupons || []));
                setOrders(prev => prev.length ? prev : (db.orders || []));
            })
            .catch(console.error);

        socket = io();

        socket.on("app_data", (db: any) => {
            setMenuData(db.menu || []);
            setCouponsData(db.coupons || []);
            setOrders(prev => prev.length ? prev : (db.orders || []));
        });

        socket.on("order_update", (newOrder: any) => {
            setOrders(prev => [newOrder, ...prev]);
        });

        socket.on("order_status_updated", ({ id, status }: any) => {
            setOrders(prev => prev.map(order => order.id === id ? { ...order, status } : order));
        });

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const completeOrder = (id: string) => {
        setOrders(prev => prev.map(order => order.id === id ? { ...order, status: "Completed" } : order));
        socket.emit("update_order_status", { id, status: "Completed" });
    };

    const handleAuth = (e: React.FormEvent) => {
        e.preventDefault();
        if (passcode === 'zaika123') setIsAuth(true);
        else alert("Invalid Admin Protocol.");
    };

    // ----- Menu Management -----
    const addCategory = () => {
        const newCat = prompt("Enter new category name:");
        if (!newCat) return;
        const newMenu = [...menuData, { title: newCat, items: [] }];
        socket.emit("admin_update_menu", newMenu);
    };

    const addDish = (catIndex: number) => {
        const name = prompt("Dish Name:");
        if (!name) return;
        const price = prompt("Price (e.g. ₹299):");
        const desc = prompt("Description:");

        const newMenu = [...menuData];
        newMenu[catIndex].items.push({
            id: Math.floor(Math.random() * 100000),
            name,
            price: price || '₹0',
            desc: desc || ''
        });
        socket.emit("admin_update_menu", newMenu);
    };

    const deleteDish = (catIndex: number, itemId: number) => {
        if (!confirm("Delete this dish globally?")) return;
        const newMenu = [...menuData];
        newMenu[catIndex].items = newMenu[catIndex].items.filter((i: any) => i.id !== itemId);
        socket.emit("admin_update_menu", newMenu);
    };

    // ----- Coupon Management -----
    const addCoupon = () => {
        const code = prompt("Coupon Code (e.g. FREEBIE):");
        if (!code) return;
        const type = prompt("Type (flat, percent, item):");
        const value = prompt("Value (e.g. 50, 10, chef-dessert):");
        const min = prompt("Minimum Order (default 0):");

        const newCoupons = [...couponsData, {
            code: code.toUpperCase(),
            type: type || 'flat',
            value: type === 'item' ? value : Number(value),
            minOrder: Number(min) || 0,
            desc: prompt("Description:") || '',
            active: true
        }];
        socket.emit("admin_update_coupons", newCoupons);
    };

    const toggleCoupon = (idx: number) => {
        const newCoupons = [...couponsData];
        newCoupons[idx].active = !newCoupons[idx].active;
        socket.emit("admin_update_coupons", newCoupons);
    };

    const deleteCoupon = (idx: number) => {
        if (!confirm("Permanently destroy coupon?")) return;
        const newCoupons = [...couponsData];
        newCoupons.splice(idx, 1);
        socket.emit("admin_update_coupons", newCoupons);
    };

    if (!isAuth) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
                <form onSubmit={handleAuth} className="bg-black/80 backdrop-blur-xl p-8 rounded-2xl border border-white/10 w-full max-w-sm box-glow">
                    <h2 className="text-2xl text-white font-serif tracking-wide mb-6 text-center">Zaika Admin Portal</h2>
                    <input
                        type="password"
                        placeholder="Admin Passcode"
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-neon-cyan focus:outline-none transition-colors mb-4"
                    />
                    <button type="submit" className="w-full bg-neon-cyan text-black font-bold tracking-wide py-3 rounded-xl hover:opacity-90 transition-opacity">
                        ACCESS ROOT
                    </button>
                    <p className="text-xs text-white/30 text-center mt-4">Hint: Use 'zaika123'</p>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
            <h1 className="text-3xl font-serif font-medium mb-8 tracking-wide border-b border-white/10 pb-4 uppercase text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-cyan flex justify-between items-center">
                <span>Zaika Control Center</span>
                <span className="text-xs text-green-400 font-mono tracking-widest px-4 py-1 rounded-full bg-green-400/10 border border-green-400/20">LIVE SOCKET CONNECTED</span>
            </h1>

            {/* TABS */}
            <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
                {['orders', 'menu', 'coupons'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-2 rounded-full font-medium tracking-wide uppercase text-sm transition-all border ${activeTab === tab
                            ? 'bg-neon-cyan text-black border-neon-cyan'
                            : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* TAB CONTENTS */}
            <div className="w-full">
                {activeTab === 'orders' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {orders.map((order, idx) => (
                                <motion.div key={order.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-2xl border backdrop-blur-xl ${order.status === "Completed" ? "bg-white/5 border-white/5 opacity-50" : "bg-black/60 border-neon-cyan/30 box-glow"}`}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div><h3 className="text-2xl font-bold">{order.table}</h3><p className="text-white/50 text-sm">{order.name} • {order.phone}</p></div>
                                        <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10">{order.status}</div>
                                    </div>
                                    <div className="text-sm font-mono text-white/40 mb-6">#{order.id} • {order.payment}</div>

                                    {expandedOrderId !== order.id ? (
                                        <button onClick={() => setExpandedOrderId(order.id)} className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-medium border border-white/10 text-sm">
                                            View Order
                                        </button>
                                    ) : (
                                        <div className="flex flex-col gap-4 mt-2 border-t border-white/10 pt-4">
                                            <div className="flex flex-col gap-2 max-h-40 overflow-y-auto pr-2">
                                                {order.items?.map((item: any, i: number) => (
                                                    <div key={i} className="flex justify-between items-center text-sm">
                                                        <span className="text-white/80 font-medium bg-black/40 px-2 py-1 rounded w-8 text-center mr-2">{item.quantity}x</span>
                                                        <span className="text-white flex-1 truncate pr-2">{item.name}</span>
                                                        <span className="text-neon-cyan font-mono">{item.price}</span>
                                                    </div>
                                                ))}
                                                {!order.items?.length && <p className="text-white/40 text-sm">No items found</p>}
                                            </div>
                                            <div className="flex gap-2 border-t border-white/10 pt-4">
                                                <button onClick={() => setExpandedOrderId(null)} className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors font-medium border border-white/10 text-sm text-white/70">
                                                    Close
                                                </button>
                                                {order.status !== "Completed" && (
                                                    <button onClick={() => completeOrder(order.id)} className="flex-[2] py-3 rounded-xl bg-neon-cyan/20 hover:bg-neon-cyan/30 text-neon-cyan transition-colors font-bold border border-neon-cyan/30 text-sm">
                                                        Mark Completed
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                            {orders.length === 0 && <div className="col-span-full h-64 flex flex-col items-center justify-center text-white/30 border border-dashed border-white/10 rounded-3xl">No incoming orders</div>}
                        </AnimatePresence>
                    </div>
                )}

                {activeTab === 'menu' && (
                    <div className="flex flex-col gap-10">
                        {menuData.map((category, catIdx) => (
                            <div key={catIdx} className="bg-white/5 rounded-2xl p-6 border border-white/10">
                                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-6">
                                    <h3 className="text-2xl font-serif text-white">{category.title}</h3>
                                    <button onClick={() => addDish(catIdx)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition">+ Add Dish</button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {category.items.map((item: any) => (
                                        <div key={item.id} className="bg-black/50 p-4 rounded-xl border border-white/5 flex flex-col gap-2">
                                            <div className="flex justify-between">
                                                <h4 className="font-bold text-lg">{item.name}</h4>
                                                <span className="text-neon-cyan font-mono">{item.price}</span>
                                            </div>
                                            <p className="text-sm text-white/50">{item.desc}</p>
                                            <button onClick={() => deleteDish(catIdx, item.id)} className="self-end mt-2 text-xs text-red-400 hover:text-red-300">Delete</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick={addCategory} className="py-4 border border-dashed border-white/20 rounded-2xl text-white/50 hover:text-white hover:border-white/50 transition">
                            + Add New Category
                        </button>
                    </div>
                )}

                {activeTab === 'coupons' && (
                    <div className="flex flex-col gap-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-serif">Active Promotion Codes</h2>
                            <button onClick={addCoupon} className="px-4 py-2 bg-neon-cyan hover:opacity-80 text-black font-bold rounded-lg text-sm transition">+ Add Coupon</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {couponsData.map((coupon, idx) => (
                                <div key={idx} className={`p-6 rounded-2xl border transition-colors ${coupon.active ? 'bg-black/60 border-white/20' : 'bg-white/5 border-white/5 opacity-50'}`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-mono font-bold tracking-widest">{coupon.code}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => toggleCoupon(idx)} className="text-xs px-3 py-1 rounded bg-white/10 hover:bg-white/20">{coupon.active ? 'Disable' : 'Enable'}</button>
                                            <button onClick={() => deleteCoupon(idx)} className="text-xs px-3 py-1 rounded bg-red-500/20 text-red-300 hover:bg-red-500/40">Delete</button>
                                        </div>
                                    </div>
                                    <p className="text-white/60 text-sm mb-4">{coupon.desc}</p>
                                    <div className="flex gap-4 text-xs font-mono text-white/40">
                                        <span className="bg-white/5 px-2 py-1 rounded">Type: {coupon.type}</span>
                                        <span className="bg-white/5 px-2 py-1 rounded">Val: {coupon.value}</span>
                                        <span className="bg-white/5 px-2 py-1 rounded">Min: ₹{coupon.minOrder}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
