import React, { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { AskQuestionWidget } from "./AskQuestionWidget"
import { cn } from "@/lib/utils"

interface InteractiveTextProps {
    children: React.ReactNode
    className?: string
}

export const InteractiveText: React.FC<InteractiveTextProps> = ({ children, className }) => {
    const [isOpen, setIsOpen] = useState(false)

    // Helper to extract text content for the widget context
    const getTextContent = (node: React.ReactNode): string => {
        if (typeof node === 'string') return node
        if (typeof node === 'number') return String(node)
        if (Array.isArray(node)) return node.map(getTextContent).join('')
        if (React.isValidElement(node) && node.props.children) {
            return getTextContent(node.props.children)
        }
        return ''
    }

    const textContent = getTextContent(children)

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <p
                    className={cn(
                        "cursor-pointer transition-all duration-200 rounded-lg px-2 -mx-2 py-1 -my-1 relative",
                        "hover:bg-eliza-purple/10 hover:text-gray-900",
                        isOpen && "bg-eliza-purple/15 ring-1 ring-eliza-purple/30",
                        className
                    )}
                    title="Click to ask a question about this text"
                >
                    {children}
                    {/* Hover hint icon could go here, but might be too noisy */}
                </p>
            </PopoverTrigger>
            <PopoverContent
                className="w-auto p-0 border-none bg-transparent shadow-none"
                align="start"
                side="top"
                sideOffset={10}
            >
                <AskQuestionWidget contextText={textContent} onClose={() => setIsOpen(false)} />
            </PopoverContent>
        </Popover>
    )
}
