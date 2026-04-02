"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CartProps {
    isOpen: boolean;
    onClose: () => void;
    cartItems: any[];
    onUpdateQuantity: (id: string | number, newQuantity: number) => void;
    onAddToCart: (item: any) => void;
    onCheckout: () => void;
}

export default function Cart({ isOpen, onClose, cartItems, onUpdateQuantity, onAddToCart, onCheckout }: CartProps) {
    const [couponInput, setCouponInput] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
    const [couponStatus, setCouponStatus] = useState<{ msg: string; type: "success" | "error" } | null>(null);
    const [isOffersModalOpen, setIsOffersModalOpen] = useState(false);

    const subtotal = cartItems.reduce((acc, item) => acc + parseFloat(item.price.replace('₹', '')) * (item.quantity || 1), 0);

    // Watch for PARTY20 drops boundary condition
    useEffect(() => {
        if (appliedCoupon === 'PARTY20' && subtotal <= 999 && subtotal > 0) {
            setAppliedCoupon(null);
            setCouponStatus({ msg: "PARTY20 removed. Order subtotal fell below ₹999", type: "error" });
        }
    }, [subtotal, appliedCoupon]);

    let discount = 0;
    if (appliedCoupon === 'WELCOME50') {
        discount = 50;
    } else if (appliedCoupon === 'ZAIKA10') {
        discount = subtotal * 0.1;
    } else if (appliedCoupon === 'PARTY20') {
        discount = subtotal * 0.2;
    }

    const finalTotal = Math.max(0, subtotal - discount);

    const handleApplyCoupon = (code: string) => {
        const uppercaseCode = code.toUpperCase();
        setCouponStatus(null);

        if (uppercaseCode === 'WELCOME50' || uppercaseCode === 'ZAIKA10' || uppercaseCode === 'PARTY20' || uppercaseCode === 'CHEFCHOICE') {
            if (uppercaseCode === 'PARTY20' && subtotal <= 999) {
                setCouponStatus({ msg: "PARTY20 is valid on orders above ₹999", type: "error" });
                return;
            }

            // Remove existing free dessert if we're swapping coupons
            if (appliedCoupon === 'CHEFCHOICE' && uppercaseCode !== 'CHEFCHOICE') {
                onUpdateQuantity('chef-dessert', 0);
            }

            if (uppercaseCode === 'CHEFCHOICE' && appliedCoupon !== 'CHEFCHOICE') {
                onAddToCart({ id: 'chef-dessert', name: 'Gulab Jamun (Chef\'s Choice)', price: '₹0', quantity: 1 });
            }

            setAppliedCoupon(uppercaseCode);
            setCouponInput(uppercaseCode);
            setCouponStatus({ msg: "Coupon applied successfully", type: "success" });
            setIsOffersModalOpen(false);
        } else {
            setCouponStatus({ msg: "Invalid coupon code", type: "error" });
        }
    };

    const handleRemoveCoupon = () => {
        if (appliedCoupon === 'CHEFCHOICE') {
            onUpdateQuantity('chef-dessert', 0);
        }
        setAppliedCoupon(null);
        setCouponStatus(null);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Cart Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md glass-panel !rounded-none z-50 flex flex-col border-l border-white/10"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-2xl font-serif font-medium tracking-wide text-white">Your Order</h2>
                            <button
                                onClick={onClose}
                                className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-white"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Items list */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            <AnimatePresence>
                                {cartItems.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="flex-1 flex items-center justify-center text-white/40"
                                    >
                                        Your cart feels exclusively empty.
                                    </motion.div>
                                ) : (
                                    cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="p-4 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group"
                                        >
                                            <div className="flex-1">
                                                <h4 className="text-white font-medium">{item.name}</h4>
                                                <p className="text-sm text-white/50">{item.price}</p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center gap-2 bg-black/50 rounded-full px-1 py-1 border border-white/10 shadow-inner">
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    whileHover={{ backgroundColor: "rgba(255, 123, 0, 0.2)" }}
                                                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                                                >
                                                    –
                                                </motion.button>
                                                <span className="text-white text-sm font-medium w-4 text-center">
                                                    {item.quantity || 1}
                                                </span>
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    whileHover={{ backgroundColor: "rgba(255, 123, 0, 0.2)" }}
                                                    onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)}
                                                    className="w-7 h-7 rounded-full flex items-center justify-center text-neon-blue hover:text-white transition-colors cursor-pointer"
                                                >
                                                    +
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Coupon Section */}
                        {cartItems.length > 0 && !appliedCoupon && (
                            <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponInput}
                                        onChange={(e) => setCouponInput(e.target.value)}
                                        className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-neon-cyan transition-colors uppercase text-sm"
                                    />
                                    <button
                                        onClick={() => handleApplyCoupon(couponInput)}
                                        className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-colors font-medium border border-white/10 text-sm"
                                    >
                                        Apply
                                    </button>
                                </div>

                                {couponStatus?.type === 'error' && (
                                    <p className="text-red-400 text-sm mt-3 px-1">{couponStatus.msg}</p>
                                )}

                                <div className="mt-3 flex justify-end">
                                    <button
                                        onClick={() => setIsOffersModalOpen(true)}
                                        className="text-xs text-white/50 hover:text-white underline decoration-white/20 hover:decoration-white/60 transition-all font-medium"
                                    >
                                        View Offers
                                    </button>
                                </div>
                            </div>
                        )}

                        {appliedCoupon && (
                            <div className="px-6 py-4 border-t border-white/10 bg-white/5">
                                <div className="flex justify-between items-center bg-black/30 p-4 rounded-xl border border-white/10">
                                    <div>
                                        {couponStatus?.type === 'success' && (
                                            <p className="text-green-400 text-xs font-medium mb-1">Coupon applied successfully</p>
                                        )}
                                        <p className="text-white/80 text-sm font-medium">
                                            Code: <span className="font-mono text-white ml-1">{appliedCoupon}</span>
                                        </p>
                                    </div>
                                    <button onClick={handleRemoveCoupon} className="text-xs font-medium text-white/40 hover:text-red-400 transition-colors uppercase tracking-wider bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg border border-white/5">
                                        Remove
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer / Checkout */}
                        {cartItems.length > 0 && (
                            <div className="p-6 border-t border-white/10 bg-black/40">
                                {appliedCoupon && (
                                    <div className="flex justify-between items-center mb-2 text-sm text-white/50">
                                        <span>Subtotal</span>
                                        <span>₹{subtotal.toFixed(2)}</span>
                                    </div>
                                )}
                                {appliedCoupon && discount > 0 && (
                                    <div className="flex justify-between items-center mb-4 text-sm text-green-400">
                                        <span>Discount</span>
                                        <span>-₹{discount.toFixed(2)}</span>
                                    </div>
                                )}
                                {appliedCoupon && discount === 0 && appliedCoupon === 'CHEFCHOICE' && (
                                    <div className="flex justify-between items-center mb-4 text-sm text-green-400">
                                        <span>Discount</span>
                                        <span>FREE DESSERT</span>
                                    </div>
                                )}

                                <motion.div
                                    key={finalTotal}
                                    initial={{ scale: 1.05, color: "#fff" }}
                                    animate={{ scale: 1, color: "#00D6FF" }}
                                    className="flex justify-between items-center mb-6 text-lg text-white"
                                >
                                    <span className="font-light text-white/70">Total</span>
                                    <span className="font-semibold text-neon-cyan">₹{finalTotal.toFixed(2)}</span>
                                </motion.div>

                                <button
                                    onClick={onCheckout}
                                    className="w-full py-4 rounded-full bg-gradient-to-r from-neon-blue to-neon-cyan text-white font-semibold text-lg hover:box-glow transition-all active:scale-[0.98]"
                                >
                                    Proceed to Checkout
                                </button>
                            </div>
                        )}

                        {/* Offers Modal Bottom Sheet */}
                        <AnimatePresence>
                            {isOffersModalOpen && (
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="absolute inset-x-0 bottom-0 top-1/4 bg-[#050505] shadow-[0_-20px_50px_rgba(0,0,0,0.8)] z-50 flex flex-col rounded-t-3xl border border-white/10 border-b-0"
                                >
                                    <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#050505]/95 backdrop-blur-md rounded-t-3xl">
                                        <h3 className="text-xl font-serif text-white font-medium">Available Offers</h3>
                                        <button
                                            onClick={() => setIsOffersModalOpen(false)}
                                            className="text-white/50 hover:text-white transition-colors text-sm font-medium"
                                        >
                                            Close
                                        </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                                        {[
                                            { code: 'WELCOME50', desc: 'Flat ₹50 OFF on your order' },
                                            { code: 'ZAIKA10', desc: '10% OFF your entire bill' },
                                            { code: 'PARTY20', desc: '20% OFF on orders above ₹999' },
                                            { code: 'CHEFCHOICE', desc: 'Free Gulab Jamun included' }
                                        ].map(offer => (
                                            <div key={offer.code} className="bg-white/5 border border-white/10 rounded-xl p-4 flex justify-between items-center group hover:bg-white/[0.07] transition-colors">
                                                <div>
                                                    <p className="font-mono text-white font-semibold mb-1 tracking-wider">{offer.code}</p>
                                                    <p className="text-white/50 text-sm max-w-[200px]">{offer.desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setCouponInput(offer.code);
                                                        handleApplyCoupon(offer.code);
                                                    }}
                                                    className="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors border border-white/10 uppercase tracking-wider"
                                                >
                                                    Apply
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
