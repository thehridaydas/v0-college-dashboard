import { redirect } from "next/navigation"

// Root page just sends unauthenticated users to login.
// Authenticated users are sent directly to their dashboard by the login form.
// Middleware will redirect any authenticated user who somehow lands here.
export default function RootPage() {
  redirect("/login")
}
