import { Sparkles, type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TabConfig {
    id: string
    label: string
    icon: LucideIcon
    color: string
    locked?: boolean
}

interface SyllabusTabsProps {
    tabs: TabConfig[]
    activeTab: string
    onTabChange: (id: string) => void
}

export function SyllabusTabs({ tabs, activeTab, onTabChange }: SyllabusTabsProps) {
    return (
        <div className="flex flex-wrap gap-3 justify-center">
            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id

                return (
                    <button
                        key={tab.id}
                        onClick={() => !tab.locked && onTabChange(tab.id)}
                        disabled={tab.locked}
                        className={cn(
                            "relative group font-['Space_Grotesk'] font-semibold px-6 py-3 rounded-2xl transition-all duration-300",
                            "hover:scale-105 hover:shadow-md active:scale-95",
                            isActive ? "shadow-lg scale-105" : "bg-white hover:bg-gray-50 border border-gray-200",
                            tab.locked && "opacity-50 cursor-not-allowed hover:scale-100",
                        )}
                        style={{
                            backgroundColor: isActive ? tab.color : undefined,
                            color: isActive ? "white" : "#374151",
                            border: isActive ? "none" : undefined,
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <Icon className={cn("h-5 w-5 transition-transform duration-300")} />
                            <span className="text-sm md:text-base">{tab.label}</span>
                            {tab.locked && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[hsl(0,96.9%,62.4%)] rounded-full" />
                            )}
                        </div>

                        {/* Sparkle effect on active tab */}
                        {isActive && <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-white opacity-80" />}
                    </button>
                )
            })}
        </div>
    )
}
