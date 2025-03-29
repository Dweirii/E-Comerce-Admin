import { SizesClient } from "./_components/client"
import prismadb from "@/lib/prismadb"
import { format } from "date-fns"
import type { SizeColumn } from "./_components/columns"
import { FilterIcon, ListIcon, PlusCircle, RulerIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const SizePage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params

  const sizes = await prismadb.size.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  })

  const formattedSizes: SizeColumn[] = sizes.map((size) => ({
    id: size.id,
    name: size.name,
    value: size.value,
    createdAt: format(size.createdAt, "MMMM do, yyyy"),
  }))

  // Get unique size values for visualization
  const uniqueSizeValues = [...new Set(formattedSizes.map((size) => size.value))]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card border-b px-6 py-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <RulerIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <span>Sizes</span>
          </h1>
          <Button className="self-start md:self-auto" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </header>

      {formattedSizes.length > 0 && (
        <div className="p-4 md:p-8 pb-0 md:pb-0">
          <div className="bg-card rounded-lg border p-6">
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <RulerIcon className="h-4 w-4 text-primary" />
              Size Distribution
            </h3>
            <div className="flex flex-wrap items-end gap-2 h-24">
              {uniqueSizeValues.map((value) => {
                const count = formattedSizes.filter((size) => size.value === value).length
                const percentage = Math.max(20, (count / formattedSizes.length) * 100)

                return (
                  <div key={value} className="flex flex-col items-center">
                    <div
                      className="w-12 bg-primary/80 rounded-t-md flex items-end justify-center text-xs font-medium text-primary-foreground"
                      style={{ height: `${percentage}%` }}
                    >
                      {count}
                    </div>
                    <div className="text-xs mt-1 font-medium">{value}</div>
                  </div>
                )
              })}
              {uniqueSizeValues.length === 0 && (
                <div className="w-full text-center text-muted-foreground text-sm">No size data available</div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8">
        <div className="rounded-lg border bg-card shadow-sm transition-all">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <ListIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-medium">Size List</h2>
            </div>

            {formattedSizes.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 border-primary/20">
                  {formattedSizes.length} {formattedSizes.length === 1 ? "size" : "sizes"}
                </Badge>
                <Button variant="outline" size="sm">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {formattedSizes.length > 0 ? (
            <div className="p-4">
              <SizesClient data={formattedSizes} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <RulerIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No sizes found</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven&apos;t created any sizes yet. Sizes help categorize your products by their dimensions or
                measurements.
              </p>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Size
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default SizePage

