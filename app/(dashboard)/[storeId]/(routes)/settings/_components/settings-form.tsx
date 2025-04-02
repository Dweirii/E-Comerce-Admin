"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Heading } from "@/components/ui/heading"
import type { Store } from "@prisma/client"
import * as z from "zod"
import { Trash, Save, Info } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useState } from "react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import toast from "react-hot-toast"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { AleartModal } from "@/components/modals/alert-modal"
import { ApiAlert } from "@/components/ui/api-alert"
import { useOrigin } from "@/hooks/use-origin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface SettingsFormProps {
  initialData: Store & {
    title?: string
    description?: string
  }
}

const formSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
})

type SettingsFormValues = z.infer<typeof formSchema>

export const SettingsForm: React.FC<SettingsFormProps> = ({ initialData }) => {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const router = useRouter()
  const origin = useOrigin()

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
      title: initialData.title || "",
      description: initialData.description || "",
    },
  })

  const onSubmit = async (data: SettingsFormValues) => {
    try {
      setLoading(true)

      await axios.patch(`/api/stores/${params.storeId}`, {
        name: data.name,
      })

      await axios.post(`/api/metadata/${params.storeId}`, {
        title: data.title,
        description: data.description,
      })

      router.refresh()
      toast.success("Store settings updated")
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const onDelete = async () => {
    try {
      setLoading(true)
      await axios.delete(`/api/stores/${params.storeId}`)
      router.refresh()
      router.push("/")
      toast.success("Store deleted.")
    } catch {
      toast.error("Make sure you removed all products and categories first.")
    } finally {
      setLoading(false)
      setOpen(false)
    }
  }

  return (
    <>
      <AleartModal isOpen={open} onClose={() => setOpen(false)} onConfirm={onDelete} loading={loading} />

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <Heading title="Settings" description="Manage store preferences" />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button disabled={loading} variant="destructive" size="sm" onClick={() => setOpen(true)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete Store
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete this store and all its data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Update your store details and SEO information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Store Name */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Name</FormLabel>
                        <FormControl>
                          <Input
                            disabled={loading}
                            placeholder="Store name"
                            {...field}
                            className="transition-all focus-visible:ring-primary"
                          />
                        </FormControl>
                        <FormDescription>This is your store&apos;s display name</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end">
                  <Button disabled={loading} type="submit" className="transition-all">
                    <Save className="h-4 w-4 mr-2" />
                    Save changes
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              API Information
              <Info className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
            <CardDescription>Use this endpoint to access your store&apos;s API</CardDescription>
          </CardHeader>
          <CardContent>
            <ApiAlert
              title="NEXT_PUBLIC_API_URL"
              description={`${origin}/api/${params.storeId}`}
              variant="Public"
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}

