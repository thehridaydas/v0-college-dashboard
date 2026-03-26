import { redirect } from "next/navigation"

// Redirect admin profile to settings page
export default function AdminProfilePage() {
  redirect("/dashboard/admin/settings")
}
