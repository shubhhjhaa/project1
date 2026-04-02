"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CanvasImageSequence from "@/components/CanvasImageSequence";
import Menu3D from "@/components/Menu3D";
import MenuList from "@/components/MenuList";
import Cart from "@/components/Cart";
import CheckoutForm from "@/components/CheckoutForm";
import SuccessScreen from "@/components/SuccessScreen";

export default function Home() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddToCart = (item: any) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: (i.quantity || 1) + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (id: string | number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== id));
    } else {
      setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: newQuantity } : i));
    }
  };

  const startCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = () => {
    setIsCheckoutOpen(false);
    setCartItems([]);
    setIsSuccess(true);
  };

  return (
    <main className="relative w-full h-[500vh]">
      {/* Background Frame Sequence */}
      <CanvasImageSequence />

      {/* Floating Cart Icon */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCartOpen(true)}
        className="fixed top-8 right-8 z-30 w-14 h-14 rounded-full glass-card flex items-center justify-center text-white border border-white/20 hover:box-glow group"
      >
        <span className="text-xl">🛒</span>
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-neon-cyan text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
          </span>
        )}
      </motion.button>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onAddToCart={handleAddToCart}
        onCheckout={startCheckout}
      />

      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutForm
            onBack={() => { setIsCheckoutOpen(false); setIsCartOpen(true); }}
            onSuccess={handleOrderSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && <SuccessScreen />}
      </AnimatePresence>

      {/* Hero Section Container (Fixed so it stays while scrolling the pseudo-height) */}
      <div className="fixed inset-0 z-10 pointer-events-none flex flex-col pt-24 px-8 md:px-24">
        {/* Hero Text */}
        <div className="flex flex-col gap-8 pointer-events-auto max-w-2xl mt-12">

          <h1 className="w-full overflow-hidden block">
            <svg viewBox="0 0 600 110" className="w-full h-auto drop-shadow-sm overflow-visible">
              {/* Very minimal subtle upward curve path */}
              <path id="titleCurve" d="M 0,90 Q 250,75 550,90" fill="transparent" />
              <text
                fill="#FFFFFF"
                style={{ fontFamily: "var(--font-playfair)", textShadow: "0 0 12px rgba(255,255,255,0.15)" }}
                fontSize="62"
                fontWeight="bold"
                letterSpacing="1"
              >
                <textPath href="#titleCurve" startOffset="0%">
                  Zaika Junction
                </textPath>
              </text>
            </svg>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
            className="text-lg md:text-xl font-sans max-w-md"
            style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.5px", lineHeight: 1.6 }}
          >
            Authentic desi flavors, crafted with passion and served with elegance.
          </motion.p>
        </div>

        {/* 3D Menu Interactive Layer */}
        <div className="absolute inset-0 top-[20%] h-[60%] pointer-events-auto">
          <Menu3D />
        </div>
      </div>

      {/* Main Menu Items (Scrollable Content over the sequence) */}
      <div className="relative z-20 top-[150vh] px-8 md:px-24 w-full max-w-7xl mx-auto flex flex-col gap-48 pb-[100vh]">
        <MenuList onAddToCart={handleAddToCart} />
      </div>

    </main>
  );
}
