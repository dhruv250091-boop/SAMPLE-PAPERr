import React from 'react';
import { Code, User, GraduationCap, Calendar, Briefcase, Award } from 'lucide-react';

export const metadata = {
  title: 'Developer – Dhruv Chokshi | Class 12 Commerce Study Platform',
  description: 'Profile of Dhruv Chokshi, developer of the Class 12 Commerce AI Study Platform.'
};

export default function DeveloperPage() {
  return (
    <div className="flex-1 bg-[#09090D] text-white py-8 sm:py-20 transition-colors">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-10">
        {/* Header Badge */}
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-400 text-[11px] sm:text-xs font-bold tracking-wide shadow-[0_0_15px_rgba(139,92,246,0.3)]">
            <Code className="w-3.5 h-3.5" />
            <span>Developer Profile</span>
          </div>
          <h1 className="text-2xl sm:text-5xl font-extrabold text-white tracking-tight font-heading">
            Developer – <span className="purple-text-gradient">Dhruv Chokshi</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#A3A3B5]">
            Full-stack architect & developer of the Class 12 Commerce Study Platform.
          </p>
        </div>

        {/* Minimalist Cyber-Purple Profile Card */}
        <div className="rounded-2xl sm:rounded-3xl bg-[#12121A] border border-purple-500/25 shadow-2xl p-5 sm:p-10 space-y-6 sm:space-y-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 pb-6 sm:pb-8 border-b border-[#222230]">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-purple-500/50 shadow-[0_0_25px_rgba(139,92,246,0.6)] shrink-0 bg-[#09090D]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/developer-avatar.jpeg"
                alt="Dhruv Chokshi"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1.5 text-center sm:text-left">
              <h2 className="text-2xl font-bold text-white tracking-tight font-heading">Dhruv Chokshi</h2>
              <p className="text-sm text-purple-400 font-bold">Website Developer</p>
              <p className="text-xs text-[#A3A3B5]">Class 12 Commerce Senior Secondary Student</p>
            </div>
          </div>

          {/* Core Specifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#09090D] border border-purple-500/20 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#707085] uppercase tracking-wider">Name</p>
                <p className="text-sm font-bold text-white">Dhruv Chokshi</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#09090D] border border-purple-500/20 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#707085] uppercase tracking-wider">Age</p>
                <p className="text-sm font-bold text-white">17</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#09090D] border border-purple-500/20 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#707085] uppercase tracking-wider">Class</p>
                <p className="text-sm font-bold text-white">12</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#09090D] border border-purple-500/20 flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-[#707085] uppercase tracking-wider">Role</p>
                <p className="text-sm font-bold text-white">Website Developer</p>
              </div>
            </div>
          </div>

          {/* Project Box */}
          <div className="p-6 rounded-2xl bg-[#180B24] border border-purple-500/30 flex items-start space-x-4 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-purple-950/60">
              <Award className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Project Architecture</p>
              <h3 className="text-base font-bold text-white font-heading">Class 12 Commerce Study Platform</h3>
              <p className="text-xs text-[#C2C2D4] leading-relaxed">
                An end-to-end full-stack educational system designed for Class 12 Commerce students to practice sample papers and study verified board answers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
