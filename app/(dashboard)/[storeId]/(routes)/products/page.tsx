import { ProductClient } from "./_components/client"
import prismadb from "@/lib/prismadb"
import { format } from "date-fns"
import type { ProductColumn } from "./_components/columns"
import { formatter } from "@/lib/utils"
import { ArchiveIcon, BoxesIcon, FilterIcon, PackageIcon, PlusCircle, StarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

const ProductsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params

  const products = await prismadb.product.findMany({
    where: { storeId },
    include: {
      category: true,
      size: true,
      color: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured: item.isFeatured ? "Yes" : "No",
    isArchived: item.isArchived ? "Yes" : "No",
    price: formatter.format(item.price.toNumber()),
    category: item.category.name,
    size: item.size.name,
    color: item.color.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }))

  // Calculate product statistics
  const totalProducts = formattedProducts.length
  const featuredProducts = formattedProducts.filter((product) => product.isFeatured === "Yes").length
  const archivedProducts = formattedProducts.filter((product) => product.isArchived === "Yes").length
  const activeProducts = totalProducts - archivedProducts

  // Get unique categories
  const categories = [...new Set(formattedProducts.map((product) => product.category))]

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card border-b px-6 py-4 md:px-8 md:py-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <PackageIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
            <span>Products</span>
          </h1>
          <Button className="self-start md:self-auto" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>
      </header>

      {totalProducts > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 md:p-8 pb-0 md:pb-0">
          <div className="bg-card rounded-lg border p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Products</p>
              <p className="text-2xl font-bold">{totalProducts}</p>
            </div>
            <div className="rounded-full bg-primary/10 p-2">
              <BoxesIcon className="h-5 w-5 text-primary" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Products</p>
              <p className="text-2xl font-bold">{activeProducts}</p>
            </div>
            <div className="rounded-full bg-green-500/10 p-2">
              <PackageIcon className="h-5 w-5 text-green-500" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Featured</p>
              <p className="text-2xl font-bold">{featuredProducts}</p>
            </div>
            <div className="rounded-full bg-amber-500/10 p-2">
              <StarIcon className="h-5 w-5 text-amber-500" />
            </div>
          </div>

          <div className="bg-card rounded-lg border p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Archived</p>
              <p className="text-2xl font-bold">{archivedProducts}</p>
            </div>
            <div className="rounded-full bg-gray-500/10 p-2">
              <ArchiveIcon className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8">
        <div className="rounded-lg border bg-card shadow-sm transition-all">
          <div className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-2 mb-4 md:mb-0">
                <BoxesIcon className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-medium">Product List</h2>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                {categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {categories.slice(0, 3).map((category) => (
                      <Badge key={category} variant="outline" className="bg-primary/5 border-primary/20">
                        {category}
                      </Badge>
                    ))}
                    {categories.length > 3 && <Badge variant="outline">+{categories.length - 3} more</Badge>}
                  </div>
                )}

                <Button variant="outline" size="sm">
                  <FilterIcon className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            {totalProducts > 0 && (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8">
                  All ({totalProducts})
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  Active ({activeProducts})
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  Featured ({featuredProducts})
                </Button>
                <Button variant="ghost" size="sm" className="h-8">
                  Archived ({archivedProducts})
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {formattedProducts.length > 0 ? (
            <div className="p-4">
              <ProductClient data={formattedProducts} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="rounded-full bg-primary/10 p-3 mb-4">
                <PackageIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-sm mb-6">
                You haven&apos;t added any products to your store yet. Add products to display them to your customers.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default ProductsPage

