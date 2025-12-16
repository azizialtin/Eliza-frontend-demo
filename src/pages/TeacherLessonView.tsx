"use client"

import { useParams, useSearchParams } from "react-router-dom"
import SyllabusDetail from "./SyllabusDetail"

/**
 * Teacher-specific lesson view wrapper
 * 
 * This component wraps SyllabusDetail to provide teacher-specific navigation behavior.
 * When teachers view lessons from the wizard (Step 3: Generate Content), they can
 * navigate back to the wizard without losing their progress.
 * 
 * Query parameters:
 * - returnTo: "wizard" indicates return to wizard view
 * - step: The wizard step number to return to (typically "3" for content generation)
 * - tab: The active tab in the lesson view (lesson, quiz, pdf, etc.)
 */
export default function TeacherLessonView() {
    const { syllabusId } = useParams()
    const [searchParams] = useSearchParams()

    // Extract navigation state from URL
    const step = searchParams.get('step') || '3'
    const returnTo = searchParams.get('returnTo')

    // Construct the back URL based on context
    // If coming from wizard, return to wizard with preserved step
    // Otherwise, return to regular teacher syllabus management view
    const backUrl = returnTo === 'wizard'
        ? `/app/teacher/syllabus/${syllabusId}?step=${step}`
        : `/app/teacher/syllabus/${syllabusId}`

    return <SyllabusDetail backUrlOverride={backUrl} isCreatorMode={true} />
}
