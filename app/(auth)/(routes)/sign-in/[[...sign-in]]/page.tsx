"use client"

import { SignIn } from "@clerk/nextjs"
import { ShoppingBag } from "lucide-react"
import { useEffect, useState } from "react"

export default function SignInPage() {
  const [mounted, setMounted] = useState(false)

  // Prevent hydration errors with clerk component
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen w-full bg-[#0A0D14] flex flex-col lg:flex-row">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0D111A] flex-col justify-center items-center p-8">
        <div className="max-w-md w-full space-y-8">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-500/10 p-3 rounded-xl">
              <ShoppingBag className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="text-2xl font-bold text-white">Commerce Suite</h1>
          </div>

          <div className="space-y-6">
            <p className="text-gray-400 text-lg leading-relaxed">
              Streamline your e-commerce operations with our comprehensive management platform.
            </p>

            <div className="grid grid-cols-1 gap-4 pt-4">
              {[
                "Real-time analytics and reporting",
                "Inventory management and optimization",
                "Customer insights and engagement tools",
                "Secure payment processing",
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8">
            <div className="p-6 bg-[#151A29] rounded-xl border border-[#1E293B]">
              <div className="flex justify-between items-center mb-6">
                <div className="w-24 h-3 bg-blue-500/20 rounded-md"></div>
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500/30"></div>
                  <div className="w-3 h-3 rounded-full bg-blue-500/20"></div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-[#1E293B]/50 rounded-lg border border-[#2D3748]/50 p-3 flex flex-col justify-between"
                    >
                      <div className="w-1/2 h-2 bg-gray-500/30 rounded-sm"></div>
                      <div className="w-3/4 h-3 bg-blue-500/30 rounded-sm"></div>
                    </div>
                  ))}
                </div>

                <div className="h-24 bg-[#1E293B]/50 rounded-lg border border-[#2D3748]/50 p-3">
                  <div className="w-1/3 h-2 bg-gray-500/30 rounded-sm mb-3"></div>
                  <div className="flex items-end justify-between h-12 px-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-8 bg-blue-500/40 rounded-t-sm"
                        style={{ height: `${30 + Math.random() * 50}%` }}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Sign In Form */}
      <div className="w-full lg:w-1/2 flex justify-center items-center p-6 bg-[#0D111A]">
        <div className="w-full max-w-md">
          {/* Mobile only logo */}
          <div className="flex lg:hidden items-center justify-center mb-8">
            <div className="bg-blue-500/10 p-3 rounded-xl">
              <ShoppingBag className="h-8 w-8 text-blue-500" />
            </div>
            <h1 className="ml-3 text-2xl font-bold text-white">Commerce Suite</h1>
          </div>

          {mounted && (
            <div className="dark">
              <SignIn
                path="/sign-in"
                routing="path"
                signUpUrl="/sign-up"
                afterSignInUrl="/"
                appearance={{
                  elements: {
                    card: "shadow-xl rounded-2xl p-6 bg-black  border border-gray-200 dark:border-gray-700",
                    headerTitle: "text-2xl font-bold text-gray-900 dark:text-gray-100",
                    headerSubtitle: "text-sm text-gray-500 dark:text-gray-400",
                    formFieldLabel: "text-sm font-medium text-gray-700 dark:text-gray-300",
                    formFieldInput:
                      "mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
                    footer: "block text-center mt-4 text-sm text-gray-600 dark:text-gray-300",
                    socialButtonsBlockButton:
                      "bg- dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700",
                    dividerLine: "bg-gray-300 dark:bg-gray-600",
                    formButtonPrimary:
                      "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-md mt-4",
                  },
                  variables: {
                    colorPrimary: "#4F46E5",
                    colorText: "#1F2937",
                    fontSize: "14px",
                    borderRadius: "0.75rem",
                  },
                }}
              />

            </div>
          )}
        </div>
      </div>
    </div>
  )
}

