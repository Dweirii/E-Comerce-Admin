"use client";

import { SignIn } from "@clerk/nextjs";
import { BarChart4, LineChart, PieChart, ShoppingBag } from 'lucide-react';
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SignInPage() {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration errors with clerk component
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[#0A0D14] flex flex-col lg:flex-row">
      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D111A] flex-col justify-center items-center p-8 relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" 
             style={{ 
               backgroundImage: 'linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(to right, #2563EB 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E3A8A]/20 to-transparent"></div>
        
        <div className="max-w-md text-center lg:text-left relative z-10">
          <div className="flex justify-center lg:justify-start mb-10">
            <div className="bg-[#1E3A8A]/20 p-4 rounded-xl border border-[#3B82F6]/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
              <ShoppingBag className="h-10 w-10 text-[#3B82F6]" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Enterprise Commerce Suite</h1>
          <p className="text-[#94A3B8] mb-10 text-sm sm:text-base leading-relaxed">
            Advanced analytics and management platform for enterprise e-commerce operations. 
            Optimize performance, streamline inventory, and maximize revenue with our comprehensive solution.
          </p>
          
          {/* Professional dashboard mockup */}
          <div className="relative h-72 w-full rounded-xl overflow-hidden border border-[#1E293B] shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 bg-[#0F172A]/90"></div>
            
            {/* Dashboard header */}
            <div className="absolute top-0 left-0 right-0 h-10 bg-[#1E293B] border-b border-[#334155] flex items-center px-4">
              <div className="w-24 h-4 bg-[#3B82F6]/20 rounded-sm"></div>
              <div className="ml-auto flex space-x-2">
                <div className="w-4 h-4 rounded-full bg-[#3B82F6]/30"></div>
                <div className="w-4 h-4 rounded-full bg-[#3B82F6]/20"></div>
                <div className="w-4 h-4 rounded-full bg-[#3B82F6]/10"></div>
              </div>
            </div>
            
            {/* Dashboard content */}
            <div className="absolute top-10 inset-x-0 bottom-0 p-4 grid grid-cols-12 gap-4">
              {/* Sidebar */}
              <div className="col-span-3 bg-[#1E293B]/50 rounded-lg border border-[#334155]/50 p-2">
                <div className="w-full h-4 bg-[#3B82F6]/20 rounded-sm mb-3"></div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-full h-3 bg-[#64748B]/20 rounded-sm mb-2"></div>
                ))}
              </div>
              
              {/* Main content */}
              <div className="col-span-9 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 h-16">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-[#1E293B]/50 rounded-lg border border-[#334155]/50 p-2 flex flex-col justify-between">
                      <div className="w-1/2 h-2 bg-[#64748B]/30 rounded-sm"></div>
                      <div className="w-2/3 h-3 bg-[#3B82F6]/30 rounded-sm"></div>
                    </div>
                  ))}
                </div>
                
                {/* Charts */}
                <div className="grid grid-cols-2 gap-3 h-32">
                  <div className="bg-[#1E293B]/50 rounded-lg border border-[#334155]/50 p-2 flex flex-col">
                    <div className="w-1/3 h-2 bg-[#64748B]/30 rounded-sm mb-2"></div>
                    <div className="flex-1 flex items-end justify-between px-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div 
                          key={i} 
                          className="w-3 bg-[#3B82F6]/60 rounded-t-sm" 
                          style={{ height: `${15 + Math.random() * 40}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#1E293B]/50 rounded-lg border border-[#334155]/50 p-2 flex flex-col">
                    <div className="w-1/3 h-2 bg-[#64748B]/30 rounded-sm mb-2"></div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full border-4 border-[#3B82F6]/30 relative">
                        <div className="absolute inset-0 border-t-4 border-r-4 border-[#3B82F6] rounded-full rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Feature highlights */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: BarChart4, label: "Analytics" },
              { icon: LineChart, label: "Forecasting" },
              { icon: PieChart, label: "Reporting" }
            ].map((item, i) => (
              <div key={i} className="bg-[#1E293B]/50 rounded-lg p-4 border border-[#334155]/50 flex flex-col items-center">
                <item.icon className="h-6 w-6 text-[#3B82F6] mb-2" />
                <div className="text-[#94A3B8] text-xs font-medium">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-4 sm:p-8  bg-[#0D111A]">
        <div className="w-full max-w-md">
          <div className="absolute inset-0 opacity-5" 
              style={{ 
                backgroundImage: 'linear-gradient(#2563EB 1px, transparent 1px), linear-gradient(to right, #2563EB 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
              }}>
          </div>   
            {mounted && (
              <div className="dark items-center">
                <SignIn
                  path="/sign-in"
                  routing="path"
                  signUpUrl="/sign-up"
                  afterSignInUrl="/"
                />
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
