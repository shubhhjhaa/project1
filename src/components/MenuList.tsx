"use client";

import { motion } from "framer-motion";

const MENU_CATEGORIES = [
    {
        title: "Starters",
        items: [
            { id: 101, name: "Tandoori Paneer Tikka", price: "₹249", desc: "Charcoal smoked paneer with secret Indian spices" },
            { id: 102, name: "Crispy Veg Manchurian", price: "₹199", desc: "Desi-Chinese style crispy vegetable dumplings" },
        ]
    },
    {
        title: "Main Course",
        items: [
            { id: 201, name: "Zaika Butter Chicken", price: "₹349", desc: "Rich, creamy butter chicken cooked with authentic Indian spices" },
            { id: 202, name: "Smoked Dal Makhani", price: "₹249", desc: "Slow-cooked black lentils prepared over 24 hours" },
            { id: 203, name: "Awadhi Dum Biryani", price: "₹399", desc: "Fragrant basmati rice layered with aromatic saffron and spices" },
        ]
    },
    {
        title: "Breads",
        items: [
            { id: 301, name: "Garlic Butter Naan", price: "₹60", desc: "Freshly prepared tandoori breads straight from the clay oven" },
            { id: 302, name: "Tandoori Roti", price: "₹20", desc: "Classic whole wheat flatbread baked in tandoor" }
        ]
    },
    {
        title: "Desserts & Beverages",
        items: [
            { id: 401, name: "Saffron Rasmalai", price: "₹149", desc: "Soft cottage cheese dumplings soaked in saffron milk" },
            { id: 402, name: "Royal Patiala Lassi", price: "₹99", desc: "Thick, creamy yogurt blend garnished with dry fruits" }
        ]
    }
];

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
    onAddToCart: (item: any) => void;
}

export default function MenuList({ onAddToCart }: MenuListProps) {
    return (
        <div className="w-full flex flex-col gap-24 pointer-events-auto">
            {MENU_CATEGORIES.map((category, idx) => (
                <motion.div
                    key={idx}
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col gap-8"
                >
                    <motion.h2 variants={itemVariants as any} className="text-3xl md:text-5xl font-serif font-medium tracking-wide text-white border-b border-white/10 pb-4">
                        {category.title}
                    </motion.h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {category.items.map((item) => (
                            <motion.div
                                key={item.id}
                                variants={itemVariants as any}
                                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
                                className="glass-card p-6 flex flex-col justify-between group cursor-pointer transition-colors duration-300"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-serif font-medium tracking-wide text-white group-hover:text-neon-cyan transition-colors">{item.name}</h3>
                                        <span className="text-lg font-light text-white/80">{item.price}</span>
                                    </div>
                                    <p className="text-sm text-white/50">{item.desc}</p>
                                </div>

                                <button
                                    onClick={() => onAddToCart(item)}
                                    className="mt-6 self-start px-6 py-2 rounded-full border border-white/20 bg-white/5 hover:bg-neon-blue/20 hover:border-neon-blue hover:text-white hover:box-glow transition-all duration-300 flex items-center gap-2 text-sm"
                                >
                                    <span className="font-medium">+ Add</span>
                                </button>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
