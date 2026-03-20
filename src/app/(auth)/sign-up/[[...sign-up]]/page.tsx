import { SignUp } from "@clerk/nextjs"

export const metadata = {
  title: "Sign Up — Perch",
}

export default function SignUpPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-950">
      <SignUp />
    </main>
  )
}
