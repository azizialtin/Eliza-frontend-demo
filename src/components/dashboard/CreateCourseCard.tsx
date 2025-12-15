import { Plus } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface CreateCourseCardProps {
    title: string
    description: string
    characterImage: string
    onClick: () => void
    themeColor?: string // e.g., "eliza-red", "eliza-purple"
}

export function CreateCourseCard({
    title,
    description,
    characterImage,
    onClick,
    themeColor = "eliza-red"
}: CreateCourseCardProps) {
    return (
        <div className="mb-10 animate-scale-in">
            <Card
                className={`group border-2 border-dashed border-gray-200 cursor-pointer hover:border-${themeColor}/50 hover:bg-${themeColor === 'eliza-red' ? 'red' : 'purple'}-50/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-3xl overflow-hidden bg-white`}
                onClick={onClick}
            >
                <CardContent className="p-8 md:p-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className={`w-16 h-16 rounded-2xl bg-${themeColor}/10 flex items-center justify-center group-hover:bg-${themeColor} group-hover:scale-110 transition-all duration-300`}>
                                <Plus className={`h-8 w-8 text-${themeColor} group-hover:text-white transition-colors`} />
                            </div>
                            <div className="text-center md:text-left">
                                <h3 className={`font-brand text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-${themeColor} transition-colors`}>
                                    {title}
                                </h3>
                                <p className="font-brand text-gray-500 text-sm md:text-base">
                                    {description}
                                </p>
                            </div>
                        </div>
                        <img
                            src={characterImage || "/placeholder.svg"}
                            alt=""
                            className="w-24 h-24 object-contain hidden lg:block opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300"
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
