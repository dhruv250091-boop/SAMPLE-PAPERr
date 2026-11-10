'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Tablet,
  Laptop,
  Sparkles,
  FileText,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function ThreeDDeviceShowcase() {
  const [activeDevice, setActiveDevice] = useState<'laptop' | 'tablet' | 'book'>('laptop');

  return (
    <div className="relative w-full max-w-5xl mx-auto py-8">
      {/* Background Purple Ambient Glow */}
      <div className="absolute inset-0 -z-10 flex items-center justify-center">
        <div className="w-[500px] h-[350px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Device Selector Tabs with Pop Animation */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-3 mb-6 sm:mb-8 px-2">
        <button
          type="button"
          onClick={() => setActiveDevice('laptop')}
          className={`btn-pop flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm font-semibold cursor-pointer border transition-all touch-target ${
            activeDevice === 'laptop'
              ? 'bg-[#8B5CF6] text-white border-[#A855F7] shadow-[0_0_20px_rgba(139,92,246,0.5)]'
              : 'bg-[#12121A]/80 text-[#A3A3B5] border-[#222230] hover:text-white hover:border-purple-500/40'
          }`}
        >
          <Laptop className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span><span className="hidden sm:inline">3D </span>Laptop</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDevice('tablet')}
          className={`btn-pop flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm font-semibold cursor-pointer border transition-all touch-target ${
            activeDevice === 'tablet'
              ? 'bg-[#8B5CF6] text-white border-[#A855F7] shadow-[0_0_20px_rgba(139,92,246,0.5)]'
              : 'bg-[#12121A]/80 text-[#A3A3B5] border-[#222230] hover:text-white hover:border-purple-500/40'
          }`}
        >
          <Tablet className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span><span className="hidden sm:inline">3D PDF </span>Tablet</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveDevice('book')}
          className={`btn-pop flex items-center space-x-1.5 sm:space-x-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-sm font-semibold cursor-pointer border transition-all touch-target ${
            activeDevice === 'book'
              ? 'bg-[#8B5CF6] text-white border-[#A855F7] shadow-[0_0_20px_rgba(139,92,246,0.5)]'
              : 'bg-[#12121A]/80 text-[#A3A3B5] border-[#222230] hover:text-white hover:border-purple-500/40'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span><span className="hidden sm:inline">3D </span>Commerce Book</span>
        </button>
      </div>

      {/* 3D Stage Container */}
      <div className="perspective-container flex items-center justify-center min-h-[320px] sm:min-h-[440px] px-1 sm:px-4">
        <AnimatePresence mode="wait">
          {/* ================= 1. 3D LAPTOP ================= */}
          {activeDevice === 'laptop' && (
            <motion.div
              key="laptop"
              initial={{ opacity: 0, rotateX: 20, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, rotateX: 6, y: 0, scale: 1 }}
              exit={{ opacity: 0, rotateX: -20, y: -20, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl animate-float-3d"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Laptop Screen */}
              <div className="relative rounded-t-2xl bg-[#0C0C12] border-2 border-purple-500/30 p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(139,92,246,0.25)]">
                {/* Screen Bezel & Web Camera */}
                <div className="w-2 h-2 rounded-full bg-purple-500/60 mx-auto mb-2 shadow-[0_0_8px_rgba(139,92,246,0.8)]" />

                {/* Inner Screen Display: Interactive Model Solutions */}
                <div className="rounded-xl bg-[#08080C] border border-[#20202E] p-4 text-xs font-sans space-y-3 overflow-hidden">
                  <div className="flex items-center justify-between pb-2 border-b border-[#20202E]">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                      <span className="font-bold text-white flex items-center space-x-1">
                        <BookOpen className="w-3.5 h-3.5 text-[#8B5CF6]" />
                        <span>Maharashtra Board Model Solution Vault</span>
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                      Class 12 Commerce
                    </span>
                  </div>

                  {/* Sample Solution Display */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center bg-[#14141E] px-3 py-1.5 rounded-xl border border-purple-500/20 text-[11px]">
                      <span className="font-bold text-purple-400">OCM – Section C Model Answer</span>
                      <span className="text-[10px] text-[#A3A3B5] font-mono">Q.4 (8 Marks)</span>
                    </div>

                    <div className="glass-card-glow text-[#F0F0F5] px-3.5 py-2.5 rounded-xl text-[11px] space-y-1.5">
                      <div className="flex items-center space-x-1 text-purple-400 font-semibold text-[10px]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Henry Fayol&apos;s 14 Principles of Management:</span>
                      </div>
                      <p className="leading-relaxed text-[#D4D4E8]">
                        According to the Maharashtra State Board curriculum, the core examination principles are:
                      </p>
                      <div className="space-y-0.5 pt-1 text-[10px] text-[#A3A3B5]">
                        <p>1. <span className="text-white font-medium">Division of Work:</span> Specialization produces more & better work.</p>
                        <p>2. <span className="text-white font-medium">Unity of Command:</span> Each employee receives orders from only 1 boss.</p>
                        <p>3. <span className="text-white font-medium">Discipline:</span> Respect for agreements and authority.</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar Mockup */}
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-[#707085]">Verified by Board Examiners</span>
                    <Link
                      href="/sample-papers"
                      className="px-3 py-1 rounded-lg bg-[#8B5CF6] text-white font-bold text-[10px] hover:bg-[#A855F7] transition-colors"
                    >
                      View Sample Papers
                    </Link>
                  </div>
                </div>
              </div>

              {/* Laptop Keyboard Base & Trackpad */}
              <div className="relative h-6 bg-gradient-to-b from-[#181824] via-[#101017] to-[#08080C] rounded-b-2xl border-t border-purple-500/30 border-x border-b border-[#222230] shadow-[0_20px_40px_rgba(0,0,0,0.9)] flex items-center justify-center">
                <div className="w-24 h-1.5 rounded-full bg-purple-600/40 shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
              </div>
              <div className="w-[85%] h-2 bg-gradient-to-r from-transparent via-purple-600/40 to-transparent mx-auto rounded-full blur-[2px] mt-1" />
            </motion.div>
          )}

          {/* ================= 2. 3D TABLET ================= */}
          {activeDevice === 'tablet' && (
            <motion.div
              key="tablet"
              initial={{ opacity: 0, rotateY: -25, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: -6, scale: 1 }}
              exit={{ opacity: 0, rotateY: 25, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md animate-float-gentle"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="rounded-3xl bg-[#0F0F16] border-2 border-purple-500/40 p-4 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.9),0_0_35px_rgba(139,92,246,0.3)]">
                {/* Tablet Header Bar */}
                <div className="flex items-center justify-between px-2 mb-3">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="text-[11px] font-mono font-bold text-white">3D PDF Digital Reader</span>
                  </div>
                  <span className="text-[10px] text-purple-400 font-mono">100% Zoom • Verified</span>
                </div>

                {/* Tablet Display Content: Sample Paper Page */}
                <div className="rounded-2xl bg-[#09090D] border border-purple-500/20 p-4 text-xs space-y-3">
                  <div className="text-center pb-2 border-b border-purple-500/20">
                    <p className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
                      MAHARASHTRA STATE BOARD
                    </p>
                    <h3 className="text-sm font-bold text-white font-heading">
                      Book Keeping & Accountancy – 2026
                    </h3>
                    <p className="text-[10px] text-[#A3A3B5]">Time: 3 Hours • Max Marks: 80</p>
                  </div>

                  <div className="p-3 rounded-xl bg-[#14141E] border border-[#20202E] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-400 text-[11px]">Q.1 Practical Question</span>
                      <span className="text-[10px] text-[#A3A3B5] font-mono">12 Marks</span>
                    </div>
                    <p className="text-[11px] text-[#C2C2D4] leading-relaxed">
                      Ramesh and Suresh are partners sharing profits in 3:2 ratio. Calculate Gross Profit and prepare Partnership Balance Sheet.
                    </p>
                    <div className="p-2 rounded-lg bg-[#09090D] border border-purple-500/20 font-mono text-[10px] text-purple-300">
                      Balance Sheet Total: Rs. 2,67,000 (Verified Solution Available)
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link
                      href="/sample-papers"
                      className="btn-pop inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#8B5CF6] hover:bg-[#A855F7] text-white font-semibold text-[11px] shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open In PDF Viewer</span>
                    </Link>
                    <span className="text-[10px] text-[#707085]">Page 1 of 8</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= 3. 3D COMMERCE BOOK ================= */}
          {activeDevice === 'book' && (
            <motion.div
              key="book"
              initial={{ opacity: 0, rotateY: 35, scale: 0.9 }}
              animate={{ opacity: 1, rotateY: 14, scale: 1 }}
              exit={{ opacity: 0, rotateY: -35, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm animate-float-3d"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* 3D Realistic Book Shell */}
              <div className="relative flex items-stretch">
                {/* Book Spine (Left 3D Thickness) */}
                <div
                  className="w-12 bg-gradient-to-r from-[#3B0764] via-[#581C87] to-[#8B5CF6] rounded-l-md border-y border-l border-purple-500/50 shadow-[-15px_15px_30px_rgba(0,0,0,0.8)] flex flex-col justify-between py-6 items-center text-white"
                  style={{ transform: 'rotateY(-25deg)', transformOrigin: 'right center' }}
                >
                  <div className="w-1.5 h-6 bg-[#C084FC] rounded-full shadow-[0_0_8px_#C084FC]" />
                  <span
                    className="font-bold text-[10px] tracking-widest text-[#E9D5FF] uppercase [writing-mode:vertical-rl] rotate-180"
                  >
                    COMMERCE XII 2026
                  </span>
                  <BookOpen className="w-4 h-4 text-white" />
                </div>

                {/* Book Front Cover */}
                <div className="flex-1 rounded-r-2xl bg-gradient-to-br from-[#160B24] via-[#101018] to-[#0A0A0E] border-2 border-purple-500/40 p-6 shadow-[25px_25px_60px_rgba(0,0,0,0.9),0_0_35px_rgba(139,92,246,0.3)] space-y-4">
                  {/* Purple Foil Emblem */}
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-950 border border-purple-400 flex items-center justify-center text-white shadow-[0_0_20px_rgba(139,92,246,0.6)]">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>

                  <div>
                    <span className="text-[10px] font-mono tracking-widest text-purple-400 uppercase font-bold">
                      OFFICIAL STUDY COMPENDIUM
                    </span>
                    <h3 className="text-xl font-extrabold text-white font-heading mt-1 leading-tight">
                      Class 12 Commerce Complete Syllabus
                    </h3>
                    <p className="text-xs text-[#A3A3B5] mt-1.5">
                      OCM • Accountancy • Economics • Secretarial Practice • English • IT
                    </p>
                  </div>

                  <div className="pt-4 border-t border-purple-500/20 space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-[#C2C2D4]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>30 Full Board Question Papers</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#C2C2D4]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Step-by-Step Model Answers</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#C2C2D4]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                      <span>Complete Marking Schemes</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Link
                      href="/sample-papers"
                      className="btn-pop w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-purple-900/40"
                    >
                      <span>Explore Curriculum Library</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Right Book Page Layers Edge */}
                <div
                  className="w-4 bg-gradient-to-r from-[#20202B] via-[#4A4A5E] to-[#1A1A24] rounded-r-sm border-y border-r border-[#3A3A4C]"
                  style={{ transform: 'rotateY(40deg)', transformOrigin: 'left center' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
