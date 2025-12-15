import blueCharacter from "@/assets/blue-character.png"

interface EmptyStateProps {
    title?: string
    description?: string
    characterImage?: string
    children?: React.ReactNode
}

export function EmptyState({
    title = "No courses yet",
    description = "Click the card above to create your first learning adventure",
    characterImage = blueCharacter,
    children
}: EmptyStateProps) {
    return (
        <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="mb-6">
                <img src={characterImage || "/placeholder.svg"} alt="" className="w-32 h-32 object-contain mx-auto opacity-50" />
            </div>
            <h3 className="font-brand text-2xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="font-brand text-gray-500 max-w-md mx-auto mb-6">{description}</p>
            {children}
        </div>
    )
}
