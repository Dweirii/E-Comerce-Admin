import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import prismadb from "@/lib/prismadb"
import { SettingsForm } from "./_components/settings-form"
import { ModeToggle } from "@/components/theme-toggle"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Settings, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SettingsPageProps {
  params: Promise<{ storeId: string }>
}

const SettingsPage = async ({ params }: SettingsPageProps) => {
  const { storeId } = await params

  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      userId,
    },
  })

  if (!store) {
    redirect("/")
  }

  return (
    <div className="flex-col space-y-6">
      <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-6 border-b bg-card">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <Link href={`/`}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to stores</span>
              </Button>
            </Link>
            <h1 className="text-xl font-semibold flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Store Settings
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">Manage your store preferences and settings</p>
        </div>
        <ModeToggle />
      </div>

      <div className="px-4 md:px-8 pb-8">
        <div className="flex items-center gap-2 mb-6">
          <div className="rounded-full bg-primary/10 p-2">
            <Store className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-medium">{store.name}</h2>
            <p className="text-sm text-muted-foreground">Store ID: {store.id}</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Update your store details and preferences</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="pt-6">
            <SettingsForm initialData={store} />
          </CardContent>
        </Card>

        <div className="mt-6 text-sm text-muted-foreground text-center">
          <p>Last updated: {new Date(store.updatedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage

