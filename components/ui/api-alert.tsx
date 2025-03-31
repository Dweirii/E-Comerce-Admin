"use client"

import type React from "react"
import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Check, Copy, Eye, EyeOff, Lock, Shield, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import toast from "react-hot-toast"

interface ApiAlertProps {
  title: string
  description: string
  variant: "Public" | "Admin"
  expiresIn?: string
}

const textMap: Record<ApiAlertProps["variant"], string> = {
  Public: "Public",
  Admin: "Restricted",
}

const variantMap: Record<ApiAlertProps["variant"], BadgeVariant> = {
  Public: "secondary",
  Admin: "destructive",
}

type BadgeVariant = "secondary" | "destructive"

export const ApiAlert: React.FC<ApiAlertProps> = ({ title, description, variant = "Public", expiresIn }) => {
  const [copied, setCopied] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isSecure = description.startsWith("https://")
  const isAdmin = variant === "Admin"

  const maskApiRoute = (route: string) => {
    if (!route) return ""
    const parts = route.split("/")

    // Keep the domain visible but mask the path
    if (parts.length >= 3) {
      const domain = parts.slice(0, 3).join("/")
      const maskedPath = parts
        .slice(3)
        .map(() => "•••••")
        .join("/")
      return maskedPath ? `${domain}/•••••` : domain
    }

    return route.substring(0, 10) + "•••••••••••"
  }

  const onCopy = () => {
    if (isAdmin && !confirmOpen) {
      setConfirmOpen(true)
      return
    }

    navigator.clipboard.writeText(description)
    setCopied(true)
    toast.success("API Route copied to the clipboard")
    setConfirmOpen(false)

    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  const toggleReveal = () => {
    setRevealed(!revealed)
  }

  return (
    <>
      <Alert
        className="border-l-4 shadow-md transition-all p-4 sm:p-6 bg-background/95"
        style={{
          borderLeftColor: isAdmin ? "hsl(var(--destructive))" : "hsl(var(--secondary))",
        }}
      >
        <div className="flex flex-col sm:flex-row items-start gap-3">
          {isAdmin ? (
            <ShieldAlert className="h-6 w-6 text-destructive" />
          ) : (
            <Shield className="h-6 w-6 text-secondary" />
          )}
          <div className="flex-1">
            <AlertTitle className="flex flex-col sm:flex-row items-center gap-x-2 gap-y-1 mb-2 font-semibold">
              <span className="text-lg">{title}</span>
              <div className="flex items-center gap-2">
                <Badge variant={variantMap[variant]} className="px-2 py-1 text-xs font-medium">
                  {textMap[variant]}
                </Badge>
                {isSecure && (
                  <Badge
                    variant="outline"
                    className="px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border-green-200"
                  >
                    <Lock className="h-3 w-3 mr-1" />
                    Secure
                  </Badge>
                )}
                {expiresIn && (
                  <Badge variant="outline" className="px-2 py-1 text-xs font-medium">
                    Expires in {expiresIn}
                  </Badge>
                )}
              </div>
            </AlertTitle>
            <AlertDescription>
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <code className="block rounded bg-muted px-3 py-2 font-mono text-sm overflow-x-auto w-full">
                    {revealed ? description : maskApiRoute(description)}
                  </code>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={toggleReveal}
                      className="transition-all duration-200 hover:bg-muted"
                    >
                      {revealed ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          <span className="ml-2 hidden sm:inline">Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          <span className="ml-2 hidden sm:inline">Reveal</span>
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onCopy}
                      className={`transition-all duration-200 hover:bg-muted ${isAdmin ? "border-destructive/30 hover:border-destructive/50" : ""}`}
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
                </div>
                {isAdmin && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <ShieldAlert className="h-3 w-3 inline mr-1" />
                    This is a restricted API route. Do not share with unauthorized users.
                  </p>
                )}
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              Confirm Copying Restricted API Route
            </DialogTitle>
            <DialogDescription>
              You are about to copy a restricted API route. This route should only be used in secure environments and
              never shared publicly.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-muted p-3 rounded-md border border-destructive/20">
            <code className="text-sm font-mono break-all">{description}</code>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onCopy}>
              <Lock className="h-4 w-4 mr-2" />
              Copy Securely
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

