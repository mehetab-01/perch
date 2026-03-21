import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sign In",
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export { AuthLayout as default }
