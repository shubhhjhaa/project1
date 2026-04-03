"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform, cubicBezier } from "framer-motion";
import { io } from "socket.io-client";
import CanvasImageSequence from "@/components/CanvasImageSequence";
import Menu3D from "@/components/Menu3D";
import MenuList from "@/components/MenuList";
import Cart from "@/components/Cart";
import CheckoutForm from "@/components/CheckoutForm";
import SuccessScreen from "@/components/SuccessScreen";

export default function Home() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [menuData, setMenuData] = useState<any[]>([]);
  const [couponsData, setCouponsData] = useState<any[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    // Initial HTTP fetch (Guarantees data loads on Vercel/Netlify)
    fetch('/api/data')
      .then(res => res.json())
      .then(db => {
        setMenuData(prev => prev.length ? prev : (db.menu || []));
        setCouponsData(prev => prev.length ? prev : (db.coupons || []));
      })
      .catch(console.error);

    // Attempt Socket connection for real-time updates (works locally/custom servers)
    const socket = io();
    socket.on("app_data", (db: any) => {
      setMenuData(db.menu || []);
      setCouponsData(db.coupons || []);
    });
    return () => { 
      socket.disconnect(); 
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Cinematic disappear effect hooks
  const { scrollYProgress } = useScroll();
  const easeCurve = cubicBezier(0.22, 1, 0.36, 1);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0], { ease: easeCurve });
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, isMobile ? -30 : -60], { ease: easeCurve });
  const heroScale = useTransform(scrollYProgress, [0, 0.25], [1, isMobile ? 0.98 : 0.96], { ease: easeCurve });
  const heroBlur = useTransform(scrollYProgress, [0, 0.25], [0, isMobile ? 2 : 4], { ease: easeCurve });
  const heroFilter = useTransform(heroBlur, (v) => `blur(${v}px)`);

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
        className="fixed top-4 md:top-8 right-4 md:right-8 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full glass-card flex items-center justify-center text-white border border-white/20 hover:box-glow group"
      >
        <span className="text-lg md:text-xl">🛒</span>
        {cartItems.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-neon-cyan text-black text-[10px] md:text-xs font-bold w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center">
            {cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0)}
          </span>
        )}
      </motion.button>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        couponsData={couponsData}
        onUpdateQuantity={handleUpdateQuantity}
        onAddToCart={handleAddToCart}
        onCheckout={startCheckout}
      />

      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutForm
            cartItems={cartItems}
            onBack={() => { setIsCheckoutOpen(false); setIsCartOpen(true); }}
            onSuccess={handleOrderSuccess}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSuccess && <SuccessScreen />}
      </AnimatePresence>

      {/* Hero Section Container (Sticky so it stays while scrolling the pseudo-height) */}
      <div className="sticky top-0 h-screen inset-x-0 z-10 pointer-events-none flex flex-col pt-20 md:pt-24 px-4 sm:px-8 md:px-24">
        {/* Cinematic Disappearing Hero Text */}
        <motion.div 
          className="flex flex-col gap-4 md:gap-8 pointer-events-auto max-w-2xl mt-8 md:mt-12 origin-top-left"
          style={{
            opacity: heroOpacity,
            y: heroY,
            scale: heroScale,
            filter: heroFilter,
            willChange: "transform, opacity, filter"
          }}
        >

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
            className="text-base sm:text-lg md:text-xl font-sans max-w-xs sm:max-w-sm md:max-w-md"
            style={{ color: "rgba(255,255,255,0.75)", letterSpacing: "0.5px", lineHeight: 1.6 }}
          >
            Authentic desi flavors, crafted with passion and served with elegance.
          </motion.p>
        </motion.div>

        {/* 3D Menu Interactive Layer */}
        <div className="absolute inset-0 top-[25%] sm:top-[20%] h-[55%] sm:h-[60%] pointer-events-auto">
          <Menu3D />
        </div>
      </div>

      {/* Main Menu Items (Scrollable Content over the sequence) */}
      <div className="relative z-20 top-[150vh] px-4 sm:px-8 md:px-24 w-full max-w-7xl mx-auto flex flex-col gap-32 md:gap-48 pb-[100vh]">
        <MenuList
          menuData={menuData}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          onAddToCart={handleAddToCart}
        />
      </div>

    </main>
  );
}
