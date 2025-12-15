"use client"

import * as React from "react"
import { Check, ChevronsUpDown, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ELIZA_COLORS } from "@/lib/constants"

export interface Child {
    id: string
    name: string
    avatar?: string
}

interface ChildSelectorProps {
    childrenList: Child[]
    selectedChildId: string
    onSelect: (childId: string) => void
}

export function ChildSelector({ childrenList, selectedChildId, onSelect }: ChildSelectorProps) {
    const [open, setOpen] = React.useState(false)
    const selectedChild = childrenList.find((c) => c.id === selectedChildId)

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[250px] justify-between h-12 rounded-xl border-2 hover:bg-gray-50"
                    style={{ borderColor: ELIZA_COLORS.PURPLE }}
                >
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-eliza-purple/10 flex items-center justify-center">
                            <User className="w-4 h-4 text-eliza-purple" />
                        </div>
                        <span className="font-semibold text-gray-700">
                            {selectedChild ? selectedChild.name : "Select child..."}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[250px] p-0 rounded-xl">
                <Command>
                    <CommandInput placeholder="Search child..." />
                    <CommandList>
                        <CommandEmpty>No child found.</CommandEmpty>
                        <CommandGroup>
                            {childrenList.map((child) => (
                                <CommandItem
                                    key={child.id}
                                    value={child.name}
                                    onSelect={() => {
                                        onSelect(child.id)
                                        setOpen(false)
                                    }}
                                    className="cursor-pointer"
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedChildId === child.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {child.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
