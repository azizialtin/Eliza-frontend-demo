"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Sparkles, Loader2 } from "lucide-react"

interface AIQuizGeneratorProps {
    isOpen: boolean
    onClose: () => void
    onGenerate: (prompt: string) => Promise<void>
}

export const AIQuizGenerator = ({ isOpen, onClose, onGenerate }: AIQuizGeneratorProps) => {
    const [prompt, setPrompt] = useState("")
    const [generating, setGenerating] = useState(false)

    const handleGenerate = async () => {
        if (!prompt.trim()) return
        setGenerating(true)
        try {
            await onGenerate(prompt)
            onClose()
        } finally {
            setGenerating(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-eliza-purple" />
                        Generate Quiz with AI
                    </DialogTitle>
                    <DialogDescription>
                        Describe what kind of quiz you want, and AI will generate questions for you.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Prompt</Label>
                        <Textarea
                            placeholder="e.g. Create a 5-question multiple choice quiz about recent developments in AI, specifically focusing on Large Language Models for beginners."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={5}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleGenerate} disabled={generating || !prompt.trim()} className="bg-eliza-purple">
                        {generating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="mr-2 h-4 w-4" />
                                Generate
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
