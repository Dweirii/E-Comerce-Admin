"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import type { Size } from "@prisma/client"
import * as z from "zod"
import { Trash, ArrowLeft } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { AleartModal } from "@/components/modals/alert-modal"


interface SizesFormProps {
  initialData: Size | null
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(1, "Value is required"),
})

type SizesFormValues = z.infer<typeof formSchema>

export const SizesForm: React.FC<SizesFormProps> = ({ initialData }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const router = useRouter()

  const title = initialData ? "Edit size" : "Create size"
  const description = initialData ? "Edit a size" : "Add a new size"
  const toastMessage = initialData ? "size updated" : "size created"
  const action = initialData ? "Save changes" : "Create"

  const form = useForm<SizesFormValues>({
    resolver: zodResolver(formSchema),

    defaultValues: initialData
      ? { name: initialData.name, value: initialData.value }
      : { name: "", value: "" },
  })

  const onSubmit = async (data: SizesFormValues) => {
    try {
      setLoading(true)

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/sizes/${params.sizeId}`, data)
      } else {
        await axios.post(`/api/${params.storeId}/sizes`, data)
      }
      router.refresh();
      router.push(`/${params.storeId}/sizes`);
      toast.success(toastMessage)
      if (!initialData) {
        router.push(`/${params.storeId}/sizes`)
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
      await axios.delete(`/api/${params.storeId}/sizes/${params.sizeId}`)
      router.refresh()
      router.push(`/${params.storeId}/sizes`)
      toast.success("Size deleted.")
    } catch {
      toast.error("Make sure you removed all products using this size first.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
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
            onClick={() => router.push(`/${params.storeId}/sizes`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <Heading title={title} description={description} />
        </div>
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Label</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Size Label" {...field} className="h-12 text-base" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base">Value</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="The Value" {...field} className="h-12 text-base" />
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
              onClick={() => router.push(`/${params.storeId}/sizes`)}
              className="flex-1 md:flex-none"
            >
              Cancel
            </Button>
            <Button disabled={loading} type="submit" className="flex-1 md:flex-none">
                  {loading ? "Loading..." : action}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

