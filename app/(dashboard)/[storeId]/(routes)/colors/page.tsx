import { ColorClient } from "./_components/client"
import prismadb from "@/lib/prismadb"
import { format } from "date-fns"
import type { ColorColumn } from "./_components/columns"
import { DropletIcon, PaletteIcon, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const ColorPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params

  const colors = await prismadb.color.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  })

  const formattedColors: ColorColumn[] = colors.map((color) => ({
    id: color.id,
    name: color.name,
    value: color.value,
    createdAt: format(color.createdAt, "MMMM do, yyyy"),
  }))

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card border-b px-6 py-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <PaletteIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <span>Colors</span>
          </h1>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-8">
        <div className="rounded-lg border bg-card shadow-sm transition-all">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <DropletIcon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-medium">Color List</h2>
            </div>

            {formattedColors.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {formattedColors.slice(0, 5).map((color) => (
                    <div
                      key={color.id}
                      className="w-4 h-4 rounded-full border"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                  {formattedColors.length > 5 && (
                    <div className="text-xs text-muted-foreground ml-1">+{formattedColors.length - 5} more</div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total: {formattedColors.length} {formattedColors.length === 1 ? "color" : "colors"}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {formattedColors.length > 0 ? (
            <div className="p-4">
              <ColorClient data={formattedColors} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <DropletIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No colors found</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven&apos;t created any colors yet. Colors help categorize your products and provide options for
                customers to choose from.
              </p>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Color
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ColorPage

