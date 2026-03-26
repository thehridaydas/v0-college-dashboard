import { redirect } from "next/navigation"

// Redirect principal profile to dashboard
export default function PrincipalProfilePage() {
  redirect("/dashboard/principal")
}
