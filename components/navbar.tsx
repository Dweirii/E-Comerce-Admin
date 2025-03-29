import { UserButton } from "@clerk/nextjs"
import StoreSwitcher from "@/components/store-switcher"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prismadb from "@/lib/prismadb"
import { SidebarProvider } from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/sidebar-nav"
import { cookies } from "next/headers"
import type { Store } from "@prisma/client"

/**
 * Navbar component that handles authentication, store fetching,
 * and renders the sidebar navigation with store switcher and user button.
 */
const Navbar = async () => {
  // Check if user is authenticated
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  let stores: Store[] = []

  try {
    // Fetch stores for the current user
    stores = await prismadb.store.findMany({
      where: {
        userId,
      },
      orderBy: {
        name: "asc", // Sort stores alphabetically
      },
    })
  } catch (error) {
    console.error("Failed to fetch stores:", error)
    // Continue with empty stores array rather than crashing
  }

  // Get the sidebar state from cookies
  const cookieStore = cookies()
  let defaultOpen = true // Default to open if cookie is not set

  try {
    const sidebarCookie = (await cookieStore).get("sidebar:state")
    defaultOpen = sidebarCookie ? sidebarCookie.value === "true" : true
  } catch (error) {
    console.error("Failed to read sidebar cookie:", error)
    // Continue with default value
  }

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarNav
        storeSwitcher={<StoreSwitcher items={stores} className="px-2 py-2" />}
        userButton={
          <div className="flex items-center justify-center p-2">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  userButtonAvatarBox: "h-8 w-8",
                },
              }}
            />
          </div>
        }
      />
    </SidebarProvider>
  )
}

export default Navbar

