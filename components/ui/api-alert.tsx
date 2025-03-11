"use client"

import React, { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, Copy, Server } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"

interface ApiAlertProps {
  title: string
  description: string
  variant: "Public" | "Admin"
}

const textMap: Record<ApiAlertProps["variant"], string> = {
  Public: "Public",
  Admin: "Admin",
}

const variantMap: Record<ApiAlertProps["variant"], BadgeVariant> = {
  Public: "secondary",
  Admin: "destructive",
}

type BadgeVariant = "secondary" | "destructive"

export const ApiAlert: React.FC<ApiAlertProps> = ({ title, description, variant = "Public" }) => {
  const [copied, setCopied] = useState(false)

  const onCopy = () => {
    navigator.clipboard.writeText(description)
    setCopied(true)
    toast.success("API Route copied to the clipboard")

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <Alert
      className="border-l-4 shadow-md transition-all p-4 sm:p-6"
      style={{
        borderLeftColor:
          variant === "Admin" ? "hsl(var(--destructive))" : "hsl(var(--secondary))",
      }}
    >
      <div className="flex flex-col sm:flex-row items-start gap-3">
        <Server className="h-6 w-6 text-muted-foreground" />
        <div className="flex-1">
          <AlertTitle className="flex flex-col sm:flex-row items-center gap-x-2 gap-y-1 mb-2 font-semibold">
            <span className="text-lg">{title}</span>
            <Badge
              variant={variantMap[variant]}
              className="px-2 py-1 text-xs font-medium"
            >
              {textMap[variant]}
            </Badge>
          </AlertTitle>
          <AlertDescription>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <code className="block rounded bg-muted px-3 py-2 font-mono text-sm overflow-x-auto w-full">
                {description}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={onCopy}
                className="transition-all duration-200 hover:bg-muted"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="ml-2 hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">Copy</span>
                  </>
                )}
              </Button>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}
