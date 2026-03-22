"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

/* ── Deterministic pseudo-random ── */

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

function round(n: number, decimals = 2) {
  const f = 10 ** decimals
  return Math.round(n * f) / f
}

/* ── Pre-computed particles ── */

type Particle = {
  id: number
  x: number
  y: number
  yEnd: number
  xDrift: number
  size: number
  duration: number
  delay: number
  opacity: number
}

const PARTICLES: Particle[] = Array.from({ length: 40 }, (_, i) => {
  const r = (offset: number) => seededRandom(i * 7 + offset)
  const y = round(r(0) * 100)
  return {
    id: i,
    x: round(r(1) * 100),
    y,
    yEnd: round(y - 25 - r(6) * 40),
    xDrift: round((r(7) - 0.5) * 80),
    size: round(r(2) * 2.5 + 0.5),
    duration: round(r(3) * 14 + 8),
    delay: round(r(4) * -20),
    opacity: round(r(5) * 0.12 + 0.02, 3),
  }
})

/* ── Floating warm motes ── */

function Particles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: `radial-gradient(circle, rgba(251,191,36,${p.opacity}), transparent)`,
            boxShadow: `0 0 ${round(p.size * 4)}px rgba(251,191,36,${round(p.opacity * 0.6, 3)})`,
          }}
          animate={{
            y: [`${p.y}vh`, `${p.yEnd}vh`],
            x: ["0px", `${p.xDrift}px`],
            opacity: [0, p.opacity, p.opacity * 0.8, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  )
}

/* ── SVG pendant lamp with warm bulb glow ── */

function PendantLamp() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2" aria-hidden="true">
      <svg
        viewBox="0 0 80 140"
        className="h-36 w-20 sm:h-44 sm:w-24"
        overflow="visible"
      >
        {/* Ceiling wire */}
        <line
          x1="40" y1="0" x2="40" y2="60"
          stroke="#44403c"
          strokeWidth="1"
        />

        {/* Lamp shade — elegant cone */}
        <path
          d="M26,60 L40,55 L54,60"
          fill="none"
          stroke="#57534e"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M26,60 Q26,64 28,65 L52,65 Q54,64 54,60"
          fill="#1c1917"
          stroke="#57534e"
          strokeWidth="1"
        />

        {/* Filament bulb */}
        <motion.ellipse
          cx="40" cy="72" rx="5" ry="7"
          fill="none"
          stroke="#FBBF24"
          strokeWidth="0.8"
          opacity={0.6}
        />
        {/* Inner filament */}
        <motion.path
          d="M38,69 Q40,75 42,69"
          fill="none"
          stroke="#FBBF24"
          strokeWidth="0.6"
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Warm bulb glow — pulsing */}
        <motion.circle
          cx="40" cy="72" r="12"
          fill="url(#bulbGlow)"
          animate={{ opacity: [0.5, 0.8, 0.5], r: [12, 14, 12] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.circle
          cx="40" cy="72" r="30"
          fill="url(#bulbGlowOuter)"
          animate={{ opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />

        <defs>
          <radialGradient id="bulbGlow">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="bulbGlowOuter">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#F59E0B" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Light cone below lamp */}
      <div
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: "130px",
          width: "min(700px, 95vw)",
          height: "65vh",
          background:
            "conic-gradient(from 180deg at 50% 0%, transparent 38%, rgba(251,191,36,0.03) 44%, rgba(251,191,36,0.06) 50%, rgba(251,191,36,0.03) 56%, transparent 62%)",
        }}
      />
    </div>
  )
}

/* ── Warm pool of light on the "floor" ── */

function FloorGlow() {
  return (
    <motion.div
      className="pointer-events-none absolute bottom-[8%] left-1/2 -translate-x-1/2"
      aria-hidden="true"
      animate={{ opacity: [0.4, 0.6, 0.4], scale: [1, 1.03, 1] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        width: "min(500px, 80vw)",
        height: "30px",
        borderRadius: "50%",
        background:
          "radial-gradient(ellipse, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.03) 40%, transparent 70%)",
        filter: "blur(8px)",
      }}
    />
  )
}

/* ── Steam wisps from the coffee cup ── */

const WISPS = [
  { d: "M0,40 Q5,-10 0,-40", delay: 0, x: -4 },
  { d: "M0,40 Q-8,-5 2,-40", delay: 0.8, x: 4 },
  { d: "M0,40 Q6,-15 -3,-40", delay: 1.6, x: 0 },
] as const

function SteamWisps({ mouseX }: { mouseX: number }) {
  return (
    <svg
      viewBox="-25 -50 50 100"
      className="absolute -top-[4.5rem] left-1/2 h-20 w-14 -translate-x-1/2 sm:-top-24 sm:h-28 sm:w-20"
      aria-hidden="true"
    >
      {WISPS.map((wisp, i) => (
        <motion.path
          key={i}
          d={wisp.d}
          fill="none"
          stroke="rgba(251,191,36,0.2)"
          strokeWidth={1.2}
          strokeLinecap="round"
          style={{ translateX: wisp.x + mouseX * 0.15 * (i % 2 === 0 ? 1 : -1) }}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: [0, 1, 1],
            opacity: [0, 0.35, 0],
            y: [0, -10, -20],
          }}
          transition={{
            duration: 3.5,
            delay: wisp.delay,
            repeat: Infinity,
            ease: "easeOut",
          }}
        />
      ))}
    </svg>
  )
}

/* ── Swinging "CLOSED" sign ── */

function ClosedSign() {
  return (
    <motion.div
      className="mt-5 inline-block origin-top"
      animate={{ rotate: [-1.5, 1.5, -1.5] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <div className="mx-auto h-3 w-px bg-neutral-700" />
      <div className="rounded-sm border border-perch-primary-800/50 bg-gradient-to-b from-perch-primary-950/80 to-perch-primary-950/50 px-4 py-1.5 shadow-lg shadow-perch-primary-900/20">
        <span className="font-display text-[0.6rem] font-bold uppercase tracking-[0.3em] text-perch-primary-500/70">
          Closed
        </span>
      </div>
    </motion.div>
  )
}

/* ── Coffee cup SVG ── */

function CoffeeCup() {
  return (
    <svg
      viewBox="0 0 120 80"
      className="h-16 w-28 sm:h-20 sm:w-32"
      aria-label="A coffee cup sitting on a saucer"
      role="img"
    >
      {/* Warm reflection under saucer */}
      <ellipse
        cx="55" cy="75" rx="35" ry="3"
        fill="url(#cupReflection)"
        opacity="0.3"
      />

      {/* Saucer */}
      <motion.ellipse
        cx="55" cy="70" rx="48" ry="5.5"
        fill="none"
        stroke="#B45309"
        strokeWidth="1.2"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      />

      {/* Cup body */}
      <motion.path
        d="M27,36 L27,58 Q27,66 40,66 L70,66 Q83,66 83,58 L83,36"
        fill="none"
        stroke="#FBBF24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.1 }}
      />

      {/* Cup rim */}
      <motion.line
        x1="25" y1="36" x2="85" y2="36"
        stroke="#FBBF24"
        strokeWidth="1.8"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.6 }}
      />

      {/* Handle */}
      <motion.path
        d="M83,41 Q97,41 97,52 Q97,61 83,61"
        fill="none"
        stroke="#D97706"
        strokeWidth="1.2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      />

      {/* Coffee surface */}
      <motion.path
        d="M32,43 Q55,47 78,43"
        fill="none"
        stroke="#78350F"
        strokeWidth="0.8"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 0.5 }}
        transition={{ duration: 0.8, delay: 1 }}
      />

      <defs>
        <radialGradient id="cupReflection" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  )
}

/* ── Cafe silhouette elements (flipped chairs on tables) ── */

function CafeSilhouette() {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 overflow-hidden" aria-hidden="true">
      <svg
        viewBox="0 0 1200 200"
        className="absolute bottom-0 h-28 w-full opacity-[0.04] sm:h-40"
        preserveAspectRatio="xMidYMax slice"
      >
        {/* Left table with flipped chair */}
        <rect x="80" y="120" width="100" height="4" rx="2" fill="#FBBF24" />
        <line x1="95" y1="124" x2="95" y2="180" stroke="#FBBF24" strokeWidth="3" />
        <line x1="165" y1="124" x2="165" y2="180" stroke="#FBBF24" strokeWidth="3" />
        {/* Flipped chair on table */}
        <rect x="105" y="85" width="30" height="3" rx="1" fill="#FBBF24" />
        <line x1="110" y1="88" x2="110" y2="120" stroke="#FBBF24" strokeWidth="2" />
        <line x1="130" y1="88" x2="130" y2="120" stroke="#FBBF24" strokeWidth="2" />
        <line x1="108" y1="85" x2="108" y2="60" stroke="#FBBF24" strokeWidth="2" />
        <line x1="132" y1="85" x2="132" y2="60" stroke="#FBBF24" strokeWidth="2" />

        {/* Right table with flipped chair */}
        <rect x="950" y="130" width="120" height="4" rx="2" fill="#FBBF24" />
        <line x1="970" y1="134" x2="970" y2="185" stroke="#FBBF24" strokeWidth="3" />
        <line x1="1050" y1="134" x2="1050" y2="185" stroke="#FBBF24" strokeWidth="3" />
        {/* Flipped chair */}
        <rect x="990" y="95" width="30" height="3" rx="1" fill="#FBBF24" />
        <line x1="995" y1="98" x2="995" y2="130" stroke="#FBBF24" strokeWidth="2" />
        <line x1="1015" y1="98" x2="1015" y2="130" stroke="#FBBF24" strokeWidth="2" />
        <line x1="993" y1="95" x2="993" y2="68" stroke="#FBBF24" strokeWidth="2" />
        <line x1="1017" y1="95" x2="1017" y2="68" stroke="#FBBF24" strokeWidth="2" />

        {/* Center-left stool */}
        <circle cx="350" cy="155" r="15" fill="none" stroke="#FBBF24" strokeWidth="2" />
        <line x1="340" y1="170" x2="335" y2="195" stroke="#FBBF24" strokeWidth="2" />
        <line x1="360" y1="170" x2="365" y2="195" stroke="#FBBF24" strokeWidth="2" />

        {/* Center-right small table */}
        <rect x="780" y="150" width="70" height="3" rx="1" fill="#FBBF24" />
        <line x1="800" y1="153" x2="800" y2="195" stroke="#FBBF24" strokeWidth="2.5" />
        <line x1="835" y1="153" x2="835" y2="195" stroke="#FBBF24" strokeWidth="2.5" />

        {/* Floor line */}
        <line x1="0" y1="195" x2="1200" y2="195" stroke="#FBBF24" strokeWidth="0.5" opacity="0.5" />
      </svg>
    </div>
  )
}

/* ── Main 404 page ── */

function NotFound() {
  const rawX = useMotionValue(0)
  const smoothX = useSpring(rawX, { stiffness: 50, damping: 20 })
  const steamX = useTransform(smoothX, [-400, 400], [-8, 8])
  const [steamVal, setSteamVal] = useState(0)

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      const center = window.innerWidth / 2
      rawX.set(e.clientX - center)
    }
    window.addEventListener("mousemove", handleMove)
    return () => window.removeEventListener("mousemove", handleMove)
  }, [rawX])

  useEffect(() => {
    return steamX.on("change", (v) => setSteamVal(v))
  }, [steamX])

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0A0908] px-4 text-white selection:bg-perch-primary-500/30">
      {/* Multi-layer ambient lighting */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background: [
            "radial-gradient(ellipse at 50% 25%, rgba(251,191,36,0.05) 0%, transparent 55%)",
            "radial-gradient(ellipse at 50% 100%, rgba(120,53,15,0.06) 0%, transparent 40%)",
            "radial-gradient(ellipse at 20% 80%, rgba(180,83,9,0.02) 0%, transparent 40%)",
            "radial-gradient(ellipse at 80% 80%, rgba(180,83,9,0.02) 0%, transparent 40%)",
          ].join(", "),
        }}
      />

      {/* Subtle noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.015]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
        }}
      />

      <PendantLamp />
      <Particles />
      <FloorGlow />
      <CafeSilhouette />

      {/* Content container */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Giant background 404 */}
        <motion.p
          className="pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-display text-[7rem] font-black leading-none text-perch-primary-500/[0.06] sm:text-[12rem] lg:text-[16rem]"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          aria-hidden="true"
        >
          404
        </motion.p>

        {/* Cup + steam assembly */}
        <motion.div
          className="relative mb-1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <SteamWisps mouseX={steamVal} />
          <CoffeeCup />
        </motion.div>

        {/* Closed sign */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <ClosedSign />
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="mt-8 font-display text-2xl font-bold tracking-tight text-neutral-100 sm:text-3xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          This space isn&apos;t booked yet.
        </motion.h1>

        {/* Subheading */}
        <motion.p
          className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500 sm:text-base"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          Looks like you wandered into an empty room. The cafe you&apos;re
          looking for might have moved, or maybe it&apos;s just closed for
          the night.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
        >
          <Link href="/search">
            <motion.span
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-perch-primary-500 to-perch-primary-400 px-7 py-3 text-sm font-semibold text-black shadow-lg shadow-perch-primary-500/20"
              whileHover={{
                scale: 1.04,
                boxShadow: "0 8px 40px rgba(245,158,11,0.35)",
              }}
              whileTap={{ scale: 0.97 }}
            >
              Find your perch
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                &rarr;
              </motion.span>
            </motion.span>
          </Link>

          <Link href="/">
            <motion.span
              className="inline-flex items-center rounded-full border border-neutral-800 bg-white/[0.02] px-7 py-3 text-sm font-medium text-neutral-400 backdrop-blur-sm transition-colors hover:border-neutral-600 hover:text-neutral-200"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              Back to home
            </motion.span>
          </Link>
        </motion.div>

        {/* Footer quip */}
        <motion.p
          className="mt-14 text-[0.7rem] tracking-wide text-neutral-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          Error 404 &mdash; But hey, at least the vibes are good.
        </motion.p>
      </div>
    </div>
  )
}

export { NotFound as default }
