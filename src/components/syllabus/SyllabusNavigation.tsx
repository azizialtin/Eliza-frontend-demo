import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Subchapter } from "@/lib/api"

interface SyllabusNavigationProps {
    previousSubchapter: Subchapter | null
    nextSubchapter: Subchapter | null
    onNavigate: (id: string) => void
}

export function SyllabusNavigation({ previousSubchapter, nextSubchapter, onNavigate }: SyllabusNavigationProps) {
    return (
        <>
            {previousSubchapter && (
                <button
                    onClick={() => onNavigate(previousSubchapter.id)}
                    className="fixed left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border-2 border-eliza-blue shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
                    title={`Previous: ${previousSubchapter.title}`}
                >
                    <ChevronLeft className="h-6 w-6 text-eliza-blue group-hover:text-eliza-purple transition-colors" />
                </button>
            )}

            {nextSubchapter && (
                <button
                    onClick={() => onNavigate(nextSubchapter.id)}
                    className="fixed right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white border-2 border-eliza-blue shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
                    title={`Next: ${nextSubchapter.title}`}
                >
                    <ChevronRight className="h-6 w-6 text-eliza-blue group-hover:text-eliza-purple transition-colors" />
                </button>
            )}
        </>
    )
}
