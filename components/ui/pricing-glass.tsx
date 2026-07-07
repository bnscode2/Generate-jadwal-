"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, Variants } from "framer-motion";
import { Check } from "lucide-react";

const NOISE_PATTERN = 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")';

export type TierType = {
  name: string;
  priceMonthly: string;
  priceAnnual: string;
  description: string;
  isPopular?: boolean;
  features: string[];
};

export interface PricingGlassProps {
  title?: string;
  description?: string;
  tiers: TierType[];
  className?: string;
}

function PricingCard({ tier, isAnnual }: { tier: TierType, isAnnual: boolean }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const legoVariant: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 60, scale: 0.95 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          transition: { 
            type: "spring", stiffness: 300, damping: 24,
            staggerChildren: 0.1,
            delayChildren: 0.15
          } 
        }
      }}
      onMouseMove={handleMouseMove}
      className={`group relative w-full overflow-hidden rounded-[32px] bg-white/1 backdrop-blur-3xl backdrop-saturate-200 backdrop-brightness-110 flex flex-col transition-all duration-500 ${
        tier.isPopular 
        ? "border border-white/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),inset_0_-1px_1px_rgba(255,255,255,0.05),0_32px_64px_-12px_rgba(0,0,0,0.6),0_0_80px_rgba(255,255,255,0.05)] md:-translate-y-4" 
        : "border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15),0_32px_64px_-12px_rgba(0,0,0,0.6)]"
      }`}
    >
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none rounded-[32px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`radial-gradient(600px at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.15), transparent)`
        }}
      />

      {tier.isPopular && (
        <div 
          className="absolute inset-0 z-0 rounded-[32px] pointer-events-none p-px"
          style={{
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude"
          }}
        >
          <div 
            className="absolute -inset-full animate-[spin_4s_linear_infinite]"
            style={{ background: "conic-gradient(from 0deg, transparent 70%, rgba(255,255,255,0.8) 100%)" }}
          />
        </div>
      )}

      <div className="absolute inset-0 z-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: NOISE_PATTERN }} />

      {tier.isPopular && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 px-4 py-1 bg-white/10 backdrop-blur-md border-b border-x border-white/10 rounded-b-xl text-xs font-medium text-white/90 shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
          Most Popular
        </div>
      )}

      <div className="relative z-10 flex flex-col p-8 md:p-10 flex-1 pointer-events-none">
        <motion.h3 variants={legoVariant} className="text-xl font-semibold text-white/80 tracking-wide">
          {tier.name}
        </motion.h3>
        
        <motion.div variants={legoVariant} className="flex items-baseline gap-1 mt-4 mb-2">
          <span className="text-white/40 text-2xl font-medium tracking-tight">$</span>
          <div className="h-[60px] overflow-hidden flex items-center">
             <AnimatePresence mode="popLayout">
               <motion.span
                 key={isAnnual ? tier.priceAnnual : tier.priceMonthly}
                 initial={{ y: 40, opacity: 0, filter: "blur(4px)" }}
                 animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                 exit={{ y: -40, opacity: 0, filter: "blur(4px)" }}
                 transition={{ type: "spring", stiffness: 400, damping: 30 }}
                 className="block text-[60px] font-bold text-white tracking-tighter leading-none"
               >
                 {isAnnual ? tier.priceAnnual : tier.priceMonthly}
               </motion.span>
             </AnimatePresence>
          </div>
          <span className="text-white/40 text-lg font-medium ml-1">/mo</span>
        </motion.div>
        
        <motion.p variants={legoVariant} className="text-white/40 text-sm leading-relaxed mb-8 min-h-[40px]">
          {tier.description}
        </motion.p>
        
        <motion.div variants={legoVariant} className="w-full h-px bg-white/10 mb-8" />
        
        <div className="flex flex-col gap-4 mb-10 flex-1">
          {tier.features.map((feat: string, i: number) => (
            <motion.div key={i} variants={legoVariant} className="flex items-start gap-3">
              <div className="shrink-0 flex items-center justify-center w-5 h-5 mt-0.5 rounded-full bg-white/10 border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                <Check className="w-3 h-3 text-white/90" strokeWidth={3} />
              </div>
              <span className="text-white/70 font-medium text-[14px] leading-tight">{feat}</span>
            </motion.div>
          ))}
        </div>

        <motion.div variants={legoVariant} className="pointer-events-auto">
          <button className={`w-full py-4 rounded-[16px] font-semibold text-[15px] transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25)] ${
            tier.isPopular 
            ? "bg-white text-black hover:bg-white/90 hover:scale-[1.02]" 
            : "bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:scale-[1.02]"
          }`}>
            Get Started
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}

export function PricingGlass({ 
  title = "Simple, transparent pricing.", 
  description = "Choose the perfect plan for your needs. Switch to annual billing and save up to 20%.",
  tiers,
  className
}: PricingGlassProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const legoVariant: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  return (
    <motion.div 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } }
      }}
      className={`w-full flex flex-col items-center justify-center p-4 gap-16 relative ${className || ""}`}
    >
      
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-white/5 blur-[120px] rounded-full pointer-events-none z-0"
        animate={{ scale: isAnnual ? 1.05 : 1, opacity: isAnnual ? 0.08 : 0.05 }}
        transition={{ duration: 1 }}
      />

      <div className="flex flex-col items-center gap-8 relative z-20 w-full">
        <div className="text-center space-y-4 px-4">
          <motion.h2 variants={legoVariant} className="text-4xl md:text-5xl font-bold text-white tracking-tight">{title}</motion.h2>
          <motion.p variants={legoVariant} className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto">
            {description}
          </motion.p>
        </div>

        <motion.div variants={legoVariant} className="relative p-1.5 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)] flex items-center">
          <button 
            onClick={() => setIsAnnual(false)}
            className={`relative px-6 md:px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-300 z-10 ${!isAnnual ? "text-white" : "text-white/50 hover:text-white/80"}`}
          >
            Monthly
          </button>
          <button 
            onClick={() => setIsAnnual(true)}
            className={`relative px-6 md:px-8 py-3 rounded-full text-sm font-semibold transition-colors duration-300 z-10 ${isAnnual ? "text-white" : "text-white/50 hover:text-white/80"}`}
          >
            Annually
            <span className="absolute -top-3 -right-3 md:-right-6 px-2 py-1 bg-white/90 text-black text-[10px] font-bold rounded-full tracking-wider shadow-lg">SAVE 20%</span>
          </button>

          <motion.div 
            className="absolute left-1.5 top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full bg-white/10 border border-white/20 shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
            animate={{ x: isAnnual ? "100%" : "0%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </motion.div>
      </div>

      <div className="relative w-full grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch z-20">
        {tiers.map((tier) => (
          <PricingCard key={tier.name} tier={tier} isAnnual={isAnnual} />
        ))}
      </div>

    </motion.div>
  );
}
