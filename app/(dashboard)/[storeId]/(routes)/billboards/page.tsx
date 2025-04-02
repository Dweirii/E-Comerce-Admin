import { BillboardClient } from "./_components/client"
import prismadb from "@/lib/prismadb"
import { format } from "date-fns"
import type { BillboardColumn } from "./_components/columns"
import { CalendarIcon, LayoutDashboardIcon, ListIcon, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const BillboardsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params

  const billboards = await prismadb.billboard.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  })

  const formattedBillboard: BillboardColumn[] = billboards.map((item) => ({
    id: item.id,
    label: item.label,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }))

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card border-b px-6 py-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <LayoutDashboardIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <span>Billboards</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="rounded-lg border bg-card shadow-sm transition-all">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <ListIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-medium">Billboard List</h2>
            </div>
            <div className="text-sm text-muted-foreground">
              Total: {formattedBillboard.length} billboard{formattedBillboard.length === 1 ? "" : "s"}
            </div>
          </div>

          <Separator />

          {formattedBillboard.length > 0 ? (
            <div className="p-4">
              <BillboardClient data={formattedBillboard} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <CalendarIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No billboards found</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven&apos;t created any billboards yet. Billboards are used to promote specific collections or products
                on your storefront.
              </p>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Billboard
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default BillboardsPage

