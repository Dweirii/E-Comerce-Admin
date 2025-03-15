"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import type { Color } from "@prisma/client"
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

interface ColorsFormProps {
  initialData: Color | null
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  value: z.string().min(4, "Value is required").regex(/^#/,{
    message: "String must be a valid hex code"
  }),
});

type ColorsFormValues = z.infer<typeof formSchema>

export const ColorsForm: React.FC<ColorsFormProps> = ({ initialData }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const params = useParams()
  const router = useRouter()

  const title = initialData ? "Edit color" : "Create color"
  const description = initialData ? "Edit a color" : "Add a new color"
  const toastMessage = initialData ? "color updated" : "color created"
  const action = initialData ? "Save changes" : "Create"

  const form = useForm<ColorsFormValues>({
    resolver: zodResolver(formSchema),

    defaultValues: initialData
      ? { name: initialData.name, value: initialData.value }
      : { name: "", value: "" },
  })

  const onSubmit = async (data: ColorsFormValues) => {
    try {
      setLoading(true)

      if (initialData) {
        await axios.patch(`/api/${params.storeId}/colors/${params.colorId}`, data)
      } else {
        await axios.post(`/api/${params.storeId}/colors`, data)
      }
      router.refresh();
      router.push(`/${params.storeId}/colors`);
      toast.success(toastMessage)
      if (!initialData) {
        router.push(`/${params.storeId}/colors`)
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
      await axios.delete(`/api/${params.storeId}/colors/${params.colorId}`)
      router.refresh()
      router.push(`/${params.storeId}/colors`)
      toast.success("Colors deleted.")
    } catch {
      toast.error("Make sure you removed all products using this color first.")
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
            onClick={() => router.push(`/${params.storeId}/colors`)}
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
                  <FormLabel className="text-base">Namel</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Color Name" {...field} className="h-12 text-base" />
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
                    <div className="flex items-center gap-x-4">
                      <Input disabled={loading} placeholder="Color Value" {...field} className="h-12 text-base" />
                        <div
                          className="border p-4 rounded-full"
                          style={{ backgroundColor: field.value}}
                        />
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
              onClick={() => router.push(`/${params.storeId}/colors`)}
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

