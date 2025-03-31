"use client"

import type React from "react"

import type { Store } from "@prisma/client"
import { useParams, useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useStoreModal } from "@/hooks/use-store-modal"
import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Check, ChevronsUpDown, StoreIcon, PlusCircle, Search, X, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command"
import { useSidebar } from "@/components/ui/sidebar"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"

type PopoverTriggerProps = React.ComponentPropsWithoutRef<typeof PopoverTrigger>

interface StoreSwitcherProps extends PopoverTriggerProps {
  items: Store[]
}

export default function StoreSwitcher({ className, items = [] }: StoreSwitcherProps) {
  const storeModal = useStoreModal()
  const params = useParams()
  const router = useRouter()
  const { open: isSidebarOpen } = useSidebar()

  const formattedItems = items.map((item) => ({
    label: item.name,
    value: item.id,
  }))

  const currentStore = formattedItems.find((item) => item.value === params.storeId)

  const [openPopover, setOpenPopover] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [recentlySelected, setRecentlySelected] = useState<string | null>(null)

  // Clear recently selected after animation completes
  useEffect(() => {
    if (recentlySelected) {
      const timer = setTimeout(() => {
        setRecentlySelected(null)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [recentlySelected])

  const onStoreSelect = (store: { value: string; label: string }) => {
    setOpenPopover(false)
    setRecentlySelected(store.value)
    router.push(`/${store.value}`)
  }

  const clearSearch = () => {
    setSearchQuery("")
  }

  if (!isSidebarOpen) return null

  // Get random pastel color based on store name for the store icon background
  const getStoreColor = (storeName: string) => {
    const colors = [
      "bg-gradient-to-br from-red-100 to-red-200 text-red-700",
      "bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700",
      "bg-gradient-to-br from-green-100 to-green-200 text-green-700",
      "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700",
      "bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700",
      "bg-gradient-to-br from-pink-100 to-pink-200 text-pink-700",
      "bg-gradient-to-br from-indigo-100 to-indigo-200 text-indigo-700",
      "bg-gradient-to-br from-teal-100 to-teal-200 text-teal-700",
    ]

    // Simple hash function to get consistent color for the same store name
    const hash = storeName.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0)

    return colors[hash % colors.length]
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30,
        }}
        className="relative"
      >
        {recentlySelected && currentStore && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: -40 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-10"
          >
            <Badge
              variant="outline"
              className="bg-primary/10 backdrop-blur-md text-primary border-primary/20 shadow-md px-3 py-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary/70" />
              Switched to {currentStore.label}
            </Badge>
          </motion.div>
        )}

        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              role="combobox"
              aria-expanded={openPopover}
              aria-label="Select a store"
              className={cn(
                "w-[220px] justify-between transition-all duration-300 group",
                "border-muted-foreground/20 hover:border-primary/50 hover:shadow-sm",
                "focus:ring-2 focus:ring-primary/20 focus:border-primary/30",
                "backdrop-blur-sm bg-background/80",
                openPopover && "border-primary/70 shadow-md ring-2 ring-primary/20",
                className,
              )}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {currentStore ? (
                  <motion.div
                    layoutId={`store-icon-${currentStore.value}`}
                    className={cn(
                      "h-7 w-7 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm",
                      getStoreColor(currentStore.label),
                    )}
                  >
                    <StoreIcon className="h-3.5 w-3.5" />
                  </motion.div>
                ) : (
                  <div className="h-7 w-7 rounded-md bg-muted/70 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                    <StoreIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                )}
                <span className="truncate font-medium">{currentStore ? currentStore.label : "Select a store"}</span>
              </div>
              <motion.div animate={{ rotate: openPopover ? 180 : 0 }} transition={{ duration: 0.2, ease: "easeInOut" }}>
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50 group-hover:opacity-100" />
              </motion.div>
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[320px] p-0 shadow-xl border-primary/10 overflow-hidden backdrop-blur-md bg-background/80 rounded-xl"
            align="start"
            sideOffset={8}
          >
            <Command className="bg-transparent">
              <div className="relative p-1.5">
                <div className="relative rounded-lg overflow-hidden backdrop-blur-sm bg-muted/30 border border-muted/30">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <CommandInput
                    placeholder="Search stores..."
                    className="pl-9 h-10 border-none bg-transparent focus:ring-0"
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
              <CommandList className="max-h-[300px] overflow-auto scrollbar-thin scrollbar-thumb-muted/50 scrollbar-track-transparent">
                <CommandEmpty>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-8 text-center"
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted/30 backdrop-blur-sm mb-3">
                      <Search className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No stores found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try a different search term</p>
                  </motion.div>
                </CommandEmpty>
                <CommandGroup heading="Your Stores" className="px-2 py-2">
                  <AnimatePresence>
                    {formattedItems.map((store) => (
                      <motion.div
                        key={store.value}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                      >
                        <CommandItem
                          value={store.label}
                          onSelect={() => onStoreSelect(store)}
                          onMouseEnter={() => setHoveredItem(store.value)}
                          onMouseLeave={() => setHoveredItem(null)}
                          className={cn(
                            "text-sm relative my-1 rounded-lg transition-all duration-150 p-2",
                            hoveredItem === store.value && "bg-primary/10 backdrop-blur-sm",
                            currentStore?.value === store.value && "bg-primary/5 backdrop-blur-sm",
                          )}
                        >
                          <div className="flex items-center gap-3 w-full">
                            <motion.div
                              layoutId={`store-icon-${store.value}`}
                              className={cn(
                                "h-8 w-8 rounded-md flex items-center justify-center flex-shrink-0 shadow-sm",
                                getStoreColor(store.label),
                              )}
                            >
                              <StoreIcon className="h-4 w-4" />
                            </motion.div>
                            <span
                              className={cn(
                                "transition-colors duration-150",
                                currentStore?.value === store.value && "font-medium text-primary",
                              )}
                            >
                              {store.label}
                            </span>

                            {currentStore?.value === store.value && (
                              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                                <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center">
                                  <Check className="h-3 w-3 text-primary" />
                                </div>
                              </motion.div>
                            )}
                          </div>

                          {currentStore?.value === store.value && (
                            <motion.div
                              layoutId="activeStoreIndicator"
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-primary"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.2 }}
                            />
                          )}

                          {hoveredItem === store.value && store.value !== currentStore?.value && (
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 w-1 rounded-full bg-primary/40"
                              initial={{ opacity: 0, scaleY: 0 }}
                              animate={{ opacity: 1, scaleY: 1 }}
                              exit={{ opacity: 0, scaleY: 0 }}
                              transition={{ duration: 0.15 }}
                            />
                          )}
                        </CommandItem>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </CommandGroup>
              </CommandList>

              <div className="px-1.5 py-1">
                <CommandSeparator className="bg-border/30 my-1" />
              </div>

              <div className="p-1.5">
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <CommandItem
                    onSelect={() => {
                      setOpenPopover(false)
                      storeModal.onOpen()
                    }}
                    className="mx-1 rounded-lg hover:bg-primary/10 backdrop-blur-sm transition-colors duration-150 p-2"
                  >
                    <div className="flex items-center w-full">
                      <div className="h-8 w-8 rounded-md bg-primary/10 backdrop-blur-sm flex items-center justify-center mr-3 shadow-sm">
                        <PlusCircle className="h-4 w-4 text-primary" />
                      </div>
                      <span className="font-medium">Create a new store</span>
                    </div>
                  </CommandItem>
                </motion.div>
              </div>
            </Command>
          </PopoverContent>
        </Popover>
      </motion.div>
    </AnimatePresence>
  )
}

