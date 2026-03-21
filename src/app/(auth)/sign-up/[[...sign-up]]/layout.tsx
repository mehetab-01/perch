import type { Metadata } from "next"

export const metadata: Metadata = { title: "Sign Up" }

function SignUpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { SignUpLayout as default }
