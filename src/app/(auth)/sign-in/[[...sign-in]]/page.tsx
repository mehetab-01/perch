import { SignIn } from "@clerk/nextjs"

export const metadata = {
  title: "Sign In — Perch",
}

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <SignIn />
    </main>
  )
}
