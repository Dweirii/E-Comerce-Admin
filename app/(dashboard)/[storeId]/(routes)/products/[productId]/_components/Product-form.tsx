"use client"

import type React from "react"
import type { Category, Color, Image as ImageType, Product, Size } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import * as z from "zod"
import { Trash,  X, ArrowLeft, DollarSign, Tag } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { AleartModal } from "@/components/modals/alert-modal"
import { UploadButton } from "@/utils/uploadthing"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useMobile } from "@/hooks/use-mobile"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"


const formSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  image: z.array(z.object({ url: z.string() })).min(1, "At least one image is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  colorId: z.string().min(1, "Color is required"),
  sizeId: z.string().min(1, "Size is required"),
  isFeatured: z.boolean().default(false),
  isArchived: z.boolean().default(false),
})

type ProductFormValues = z.infer<typeof formSchema>

interface ProductFormProps {
  initialData:
    | (Product & {
        image: ImageType[]
      })
    | null
  categories: Category[]
  colors: Color[]
  sizes: Size[]
}

export const ProductForm: React.FC<ProductFormProps> = ({ initialData, colors, sizes, categories }) => {
  // State management
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("images")

  // Hooks
  const params = useParams()
  const router = useRouter()
  const isMobile = useMobile()


  // UI text variables
  const title = initialData ? "Edit Product" : "Create Product"
  const description = initialData ? "Make changes to your product" : "Add a new product to your store"
  const toastMessage = initialData ? "Product updated successfully" : "Product created successfully"
  const action = initialData ? "Save changes" : "Create product"

  // Form initialization
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          price: Number.parseFloat(String(initialData?.price)),
          image: initialData.image || [],
        }
      : {
          name: "",
          image: [],
          price: 0,
          categoryId: "",
          colorId: "",
          sizeId: "",
          isFeatured: false,
          isArchived: false,
        },
  })

  // Form submission handler
  const onSubmit = async (data: ProductFormValues) => {
    try {
      setLoading(true)

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/products/${params.productId}`, data)
      } else {
        await axios.post(`/api/${params.storeId}/products`, data)
      }
      router.refresh()
      router.push(`/${params.storeId}/products`)
      toast.success(toastMessage)
    } catch (error) {
      toast.error("Something went wrong")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  // Delete handler
  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/products/${params.productId}`)
      router.refresh()
      router.push(`/${params.storeId}/products`)
      toast.success("Product deleted successfully")
    } catch {
      toast.error("Make sure you removed all items using this product first")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  // Watch form values
  const images = form.watch("image")

  // Image handlers
  const handleRemoveImage = (index: number) => {
    const currentImages = [...images]
    currentImages.splice(index, 1)
    form.setValue("image", currentImages, { shouldValidate: true })
  }

  const handleAddImage = (url: string) => {
    const currentImages = [...images]
    currentImages.push({ url })
    form.setValue("image", currentImages, { shouldValidate: true })
  }

  return (
    <>
      <AleartModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-4 sm:gap-y-0">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 md:hidden"
            onClick={() => router.push(`/${params.storeId}/products`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Heading title={title} description={description} />
        </div>
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size={isMobile ? "default" : "sm"}
            onClick={() => setOpen(true)}
            className="self-start sm:self-auto"
          >
            <Trash className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>
      <Separator className="my-4" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full pb-24 md:pb-0">
          <Tabs defaultValue="images" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full md:w-auto">
              <TabsTrigger value="images">Images</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
            </TabsList>
            <TabsContent value="images" className="mt-6">
              <Card>
                <CardContent className="pt-6">
                <FormField
                    control={form.control}
                    name="image"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">Product Images</FormLabel>
                        <FormDescription>
                          Upload images of your product. The first image will be used as the main product image.
                        </FormDescription>
                        <FormControl>
                          <div className="w-full space-y-4 mt-2">
                            {/* Image Gallery */}
                            {images.length > 0 && (
                              <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                                <div className="flex gap-3 p-4">
                                  {images.map((image, index) => (
                                    <div key={index} className="relative group">
                                      <div className="overflow-hidden rounded-md border w-[150px] h-[150px]">
                                        <Image
                                          src={image.url || "/placeholder.svg"}
                                          alt={`Product image ${index + 1}`}
                                          className="h-full w-full object-cover"
                                          width={150}
                                          height={150}
                                        />
                                      </div>
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute -top-2 -right-2 h-6 w-6 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </ScrollArea>
                            )}

                            {/* Upload Button */}
                            <UploadButton
                              endpoint="imageUploader"
                              onClientUploadComplete={(res) => {
                                const fileUrl = res?.[0]?.url;
                                if (fileUrl) {
                                  handleAddImage(fileUrl);
                                  toast.success("Upload completed");
                                } else {
                                  toast.error("Upload failed: No file URL returned");
                                }
                              }}
                              onUploadError={(error) => {
                                toast.error(`Upload failed: ${error.message}`);
                              }}
                              className="ut-button:bg-primary ut-button:text-primary-foreground ut-button:hover:bg-primary/90 ut-button:rounded-md ut-button:font-medium ut-button:h-10 ut-button:px-4 ut-button:py-2"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <div className="flex justify-end mt-6">
                <Button type="button" onClick={() => setActiveTab("details")} disabled={images.length === 0}>
                  Next: Product Details
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="details" className="mt-6 space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Tag className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                  disabled={loading}
                                  placeholder="Product Name"
                                  {...field}
                                  className="h-12 text-base pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Price</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  disabled={loading}
                                  placeholder="9.99"
                                  {...field}
                                  className="h-12 text-base pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                  </div>
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Product Attributes</h3>
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">Category</FormLabel>
                            <Select
                              disabled={loading}
                              onValueChange={field.onChange}
                              value={field.value}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue defaultValue={field.value} placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="colorId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Color</FormLabel>
                              <Select
                                disabled={loading}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue defaultValue={field.value} placeholder="Select a color" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {colors.map((color) => (
                                    <SelectItem key={color.id} value={color.id}>
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="h-4 w-4 rounded-full"
                                          style={{ backgroundColor: color.value }}
                                        />
                                        {color.name}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="sizeId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base">Size</FormLabel>
                              <Select
                                disabled={loading}
                                onValueChange={field.onChange}
                                value={field.value}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-12">
                                    <SelectValue defaultValue={field.value} placeholder="Select a size" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {sizes.map((size) => (
                                    <SelectItem key={size.id} value={size.id}>
                                      {size.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-medium mb-4">Product Visibility</h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="text-base">Featured Product</FormLabel>
                            <FormDescription>This product will appear on the home page</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="isArchived"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-1" />
                          </FormControl>
                          <div className="space-y-1">
                            <FormLabel className="text-base">Archive Product</FormLabel>
                            <FormDescription>This product will not appear in the store</FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setActiveTab("images")}>
                  Back to Images
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : action}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 md:hidden flex justify-between gap-x-2 z-10">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => router.push(`/${params.storeId}/products`)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button disabled={loading} type="submit" className="flex-1">
              {loading ? "Saving..." : action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

