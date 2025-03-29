import { UserButton } from "@clerk/nextjs"
import StoreSwitcher from "@/components/store-switcher"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prismadb from "@/lib/prismadb"
import { SidebarProvider} from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/sidebar-nav"
import { cookies } from "next/headers"

const Navbar = async () => {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const stores = await prismadb.store.findMany({
    where: {
      userId,
    },
  })

  // Get the sidebar state from cookies
  const cookieStore = cookies()
  const defaultOpen = (await cookieStore).get("sidebar:state")?.value === "true"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <SidebarNav
        storeSwitcher={<StoreSwitcher items={stores} />}
        userButton={
          <div className="flex justify-center pr-2">
            <UserButton afterSignOutUrl="/" />
          </div>
        }
      />
    </SidebarProvider>
  )
}

export default Navbar

