'use client';

import { Truck, Zap, Crown } from 'lucide-react';

export function DistributorPromoBanner() {
  return (
    <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 px-6 py-12 sm:px-8 sm:py-14">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top-right blue glow */}
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        {/* Bottom-left amber glow */}
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-amber-500/15 blur-3xl" />

        {/* Decorative polycarbonate sheet pattern */}
        <svg
          className="absolute right-0 bottom-0 h-full w-1/3 opacity-5"
          viewBox="0 0 200 400"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="sheets" patternUnits="userSpaceOnUse" width="40" height="40">
              <rect
                x="0"
                y="0"
                width="38"
                height="38"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="200" height="400" fill="url(#sheets)" />
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Top Badge */}
        <div className="mb-4 flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-500/30 to-cyan-500/30 px-4 py-2 backdrop-blur-sm border border-blue-400/50">
            <div className="h-2 w-2 rounded-full bg-blue-300 animate-pulse" />
            <span className="text-xs font-bold text-blue-100 tracking-wider uppercase">
              Limited Partnership
            </span>
          </div>
        </div>

        {/* Main Headline - BOLD */}
        <h2 className="mb-2 text-center text-4xl sm:text-5xl lg:text-6xl font-display font-black text-white leading-tight">
          Become a
          <br />
          <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-200 bg-clip-text text-transparent">
            Covestro Distributor
          </span>
        </h2>

        {/* Subheadline */}
        <p className="mb-8 text-center text-base sm:text-lg text-slate-300 font-medium">
          Join the Global Network of Industry Leaders
        </p>

        {/* Main Offers - BOLD DESIGN */}
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {/* Offer 1 - Magenta banner style */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-pink-600 via-pink-700 to-rose-800 p-5 sm:p-6 border border-pink-500/50 shadow-lg">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-white">
                <Truck className="h-6 w-6" />
              </div>
              <p className="text-lg sm:text-xl font-black text-white mb-1">
                FREE Worldwide
                <br />
                SHIPPING
              </p>
              <p className="text-xs sm:text-sm text-pink-100 font-medium">
                On your first container
              </p>
            </div>
          </div>

          {/* Offer 2 - Yellow/Gold banner style */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-yellow-400 via-yellow-500 to-amber-600 p-5 sm:p-6 border border-yellow-300/50 shadow-lg">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-black/10 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <p className="text-lg sm:text-xl font-black text-slate-900 mb-1">
                50% OFF
                <br />
                REGISTRATION
              </p>
              <p className="text-xs sm:text-sm text-slate-800 font-medium">
                First-year membership fee
              </p>
            </div>
          </div>

          {/* Offer 3 - Blue banner style */}
          <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-800 p-5 sm:p-6 border border-blue-500/50 shadow-lg">
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-white/20 text-white">
                <Crown className="h-6 w-6" />
              </div>
              <p className="text-lg sm:text-xl font-black text-white mb-1">
                PRIORITY
                <br />
                ACCESS
              </p>
              <p className="text-xs sm:text-sm text-blue-100 font-medium">
                Limited to first 50 qualified partners
              </p>
            </div>
          </div>
        </div>

        {/* Scarcity Banner - BOLD DESIGN */}
        <div className="relative mb-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 p-4 shadow-xl">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <div className="relative z-10 flex items-center justify-center gap-2 sm:gap-3">
            <span className="text-2xl sm:text-3xl animate-pulse">🔥</span>
            <p className="text-center text-sm sm:text-base font-black text-white uppercase tracking-wider">
              SECURE YOUR SPOT TODAY
              <br className="hidden sm:block" />
              <span className="text-lg sm:text-xl">Only 50 Available Worldwide</span>
            </p>
            <span className="text-2xl sm:text-3xl animate-pulse">🔥</span>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="mt-6 flex items-center justify-center gap-4 text-xs sm:text-sm text-slate-300">
          <div className="flex items-center gap-1">
            <span className="text-blue-300">✓</span> Covestro Verified
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-500" />
          <div className="flex items-center gap-1">
            <span className="text-blue-300">✓</span> 24/7 Support
          </div>
          <div className="h-1 w-1 rounded-full bg-slate-500" />
          <div className="flex items-center gap-1">
            <span className="text-blue-300">✓</span> Zero Risk
          </div>
        </div>
      </div>
    </div>
  );
}
