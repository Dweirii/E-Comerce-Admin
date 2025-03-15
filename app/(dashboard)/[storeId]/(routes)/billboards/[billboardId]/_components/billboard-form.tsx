"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import type { Billboard } from "@prisma/client"
import * as z from "zod"
import { Trash, ImageIcon, X, ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState, useEffect } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { AleartModal } from "@/components/modals/alert-modal"
import { UploadButton } from "@/utils/uploadthing"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface BillboardsFormProps {
  initialData: Billboard | null
}

const formSchema = z.object({
  label: z.string().min(1, "Label is required"),
  imageUrl: z.string().min(1, "Image is required"),
})

type BillboardsFormValues = z.infer<typeof formSchema>

export const BillboardsForm: React.FC<BillboardsFormProps> = ({ initialData }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  const params = useParams()
  const router = useRouter()

  // Check if viewport is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Simulate upload progress
  useEffect(() => {
    if (isUploading) {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval)
            return prev 
          }
          return prev + 5
        })
      }, 100)

      return () => {
        clearInterval(interval)
      }
    } else {
      setUploadProgress(0)
    }
  }, [isUploading])

  const title = initialData ? "Edit billboard" : "Create billboard"
  const description = initialData ? "Edit a billboard" : "Add a new billboard"
  const toastMessage = initialData ? "Billboard updated" : "Billboard created"
  const action = initialData ? "Save changes" : "Create"

  const form = useForm<BillboardsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? { label: initialData.label, imageUrl: initialData.imageUrl }
      : { label: "", imageUrl: "" },
  })

  const onSubmit = async (data: BillboardsFormValues) => {
    try {
      setLoading(true)

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/billboards/${params.billboardId}`, data)
      } else {
        await axios.post(`/api/${params.storeId}/billboards`, data)
      }
      router.refresh();
      router.push(`/${params.storeId}/billboards`);
      toast.success(toastMessage)
      if (!initialData) {
        router.push(`/${params.storeId}/billboards`)
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/${params.storeId}/billboards/${params.billboardId}`)
      router.refresh()
      router.push(`/${params.storeId}/billboards`)
      toast.success("Billboard deleted.")
    } catch {
      toast.error("Make sure you removed all categories using this billboard first.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  const imageUrl = form.watch("imageUrl")

  const handleRemoveImage = () => {
    form.setValue("imageUrl", "", { shouldValidate: true })
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
            onClick={() => router.push(`/${params.storeId}/billboards`)}
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="flex flex-col space-y-8">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Label</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Billboard Label" {...field} className="h-12 text-base" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Billboard Image</FormLabel>
                  <FormControl>
                    <div className="w-full">
                      {!imageUrl ? (
                        <Card
                          className={cn(
                            "border-dashed border-2 hover:border-primary/50 transition",
                            isUploading && "border-primary/50",
                          )}
                        >
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center justify-center h-[180px] sm:h-[220px] w-full">
                              {isUploading ? (
                                <div className="flex flex-col items-center space-y-4 w-full max-w-xs">
                                  <div className="animate-pulse rounded-full h-12 w-12 bg-primary/20 flex items-center justify-center">
                                    <ImageIcon className="h-6 w-6 text-primary animate-pulse" />
                                  </div>
                                  <div className="w-full space-y-2">
                                    <Progress value={uploadProgress} className="h-2 w-full" />
                                    <p className="text-sm text-center text-muted-foreground">
                                      Uploading... {uploadProgress}%
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center justify-center space-y-4 text-center">
                                  <div className="rounded-full bg-primary/10 p-3">
                                    <ImageIcon className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-base font-medium">Upload a billboard image</p>
                                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (max. 4MB)</p>
                                  </div>

                                  <div className=" h-15 w-33 flex justify-center bg-black rounded-2xl pt-5 lg:h-13 lg:w-25 ">
                                  <UploadButton
                                      endpoint="imageUploader"
                                      onUploadBegin={() => {
                                        setIsUploading(true);
                                      }}
                                      onClientUploadComplete={(res) => {
                                        setIsUploading(false);
                                        setUploadProgress(100);
                                        setTimeout(() => setUploadProgress(0), 500);

                                        const fileUrl = res?.[0]?.url;
                                        if (fileUrl) {
                                          form.setValue("imageUrl", fileUrl, { shouldValidate: true });
                                          toast.success("Upload completed");
                                        } else {
                                          toast.error("Upload failed: No file URL returned");
                                        }
                                      }}
                                      onUploadError={(error: Error) => {
                                        setIsUploading(false);
                                        setUploadProgress(0);
                                        toast.error(`Upload failed: ${error.message}`);
                                      }}
                                      className="ut-button:bg-blue-600 ut-button:text-white ut-button:hover:bg-blue-700 ut-button:rounded-md ut-button:font-medium ut-button:h-10 ut-button:px-4 ut-button:py-2 ut-allowed-content:text-sm"
                                    />
                                  </div>

                                  <p className="text-xs text-muted-foreground mt-2">
                                    This image will be displayed as a banner on your store
                                  </p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <div className="relative rounded-md overflow-hidden border border-border group">
                          <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              onClick={handleRemoveImage}
                              className="shadow-lg"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              onClick={handleRemoveImage}
                              className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0"
                            >
                              Change Image
                            </Button>
                          </div>
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt="Billboard image"
                            className="h-[180px] sm:h-[220px] w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      )}
                      <input type="hidden" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 md:relative md:border-0 md:p-0 md:bg-transparent flex justify-end gap-x-2 z-10">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => router.push(`/${params.storeId}/billboards`)}
              className="flex-1 md:flex-none"
            >
              Cancel
            </Button>
            <Button disabled={loading || isUploading} type="submit" className="flex-1 md:flex-none">
              {loading ? "Loading..." : action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

