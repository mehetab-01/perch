"use client"

import { SignIn } from "@clerk/nextjs"
import { motion } from "framer-motion"

function SignInPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, #6366f1, #0ea5e9, #10b981)",
          backgroundSize: "200% 200%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Perch
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Book meeting-ready cafe spaces
          </p>
        </div>

        <SignIn
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </main>
  )
}

export { SignInPage as default }
