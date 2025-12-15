import { Annotation } from "@/types/annotations";

/**
 * Injects HTML <mark> tags into the markdown text to represent annotations.
 * Handles overlapping and nested annotations by splitting text into segments.
 */
export function injectHighlights(text: string, annotations: Annotation[]): string {
    if (!annotations || annotations.length === 0) return text;

    // 1. Collect all unique boundaries
    const boundaries = new Set<number>();
    boundaries.add(0);
    boundaries.add(text.length);

    annotations.forEach(ann => {
        // Safety check for missing annotation or invalid offsets
        if (!ann || typeof ann.start_offset !== 'number' || typeof ann.end_offset !== 'number') {
            return;
        }

        // Clamp offsets to text length
        const start = Math.max(0, Math.min(ann.start_offset, text.length));
        const end = Math.max(0, Math.min(ann.end_offset, text.length));
        boundaries.add(start);
        boundaries.add(end);
    });

    const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b);

    let result = '';

    // 2. Iterate through segments
    for (let i = 0; i < sortedBoundaries.length - 1; i++) {
        const start = sortedBoundaries[i];
        const end = sortedBoundaries[i + 1];
        const segmentText = text.slice(start, end);

        // Find active annotations for this segment
        // An annotation is active if it covers this entire segment
        const activeAnnotations = annotations.filter(ann =>
            ann &&
            typeof ann.start_offset === 'number' && typeof ann.end_offset === 'number' &&
            ann.start_offset <= start && ann.end_offset >= end
        );

        if (activeAnnotations.length > 0) {
            // Sort by length (shortest first) so nested ones are inside?
            // Actually for highlighting we just want to know if there is *any* annotation.
            // But if we want to support overlapping, we might need more complex logic.
            // For now, let's just pick the first one or merge classes.

            // Let's prioritize questions over notes if both exist
            const primaryAnnotation = activeAnnotations.find(a => a.annotation_type === 'question') || activeAnnotations[0];

            const colorClass = primaryAnnotation.annotation_type === 'question'
                ? 'bg-orange-200/50 text-orange-900 border-b-2 border-orange-300'
                : 'bg-blue-200/50 text-blue-900 border-b-2 border-blue-300';

            result += `<mark class="${colorClass} cursor-pointer hover:bg-opacity-70 transition-colors rounded-sm px-0.5 mx-0.5" data-annotation-id="${primaryAnnotation.id}" data-annotation-type="${primaryAnnotation.annotation_type}">${segmentText}</mark>`;
        } else {
            result += segmentText;
        }
    }
    return result;
}

/**
 * Strips common markdown formatting to get plain text
 */
function stripMarkdown(text: string): string {
    return text
        // Remove bold/italic markers
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Remove inline code
        .replace(/`([^`]+)`/g, '$1')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Attempts to find the start offset of a selected text within the full source text.
 * Uses context (text before/after) to disambiguate multiple occurrences.
 * Handles markdown formatting by normalizing text before comparison.
 */
export function findSelectionOffset(
    fullText: string,
    selectedText: string,
    textBefore: string,
    textAfter: string
): number {
    // Normalize the selected text (strip whitespace variations)
    const normalizedSelected = selectedText.replace(/\s+/g, ' ').trim();

    // 1. Try direct match first
    let simpleIndex = fullText.indexOf(normalizedSelected);
    if (simpleIndex !== -1) {
        // If only one occurrence, return it
        if (fullText.indexOf(normalizedSelected, simpleIndex + 1) === -1) {
            return simpleIndex;
        }
    }

    // 2. Try with markdown stripped (for selections across formatted text)
    const strippedFullText = stripMarkdown(fullText);
    const strippedSelected = stripMarkdown(normalizedSelected);

    const strippedIndex = strippedFullText.indexOf(strippedSelected);
    if (strippedIndex !== -1) {
        // Map back to original text position
        // This is approximate but works for most cases
        let charCount = 0;
        let originalIndex = 0;

        for (let i = 0; i < fullText.length && charCount < strippedIndex; i++) {
            const char = fullText[i];
            // Skip markdown syntax characters
            if (char !== '*' && char !== '_' && char !== '`') {
                charCount++;
            }
            originalIndex = i + 1;
        }

        return originalIndex;
    }

    // 3. Contextual search with stripped text
    if (textBefore) {
        const contextBefore = stripMarkdown(textBefore.slice(-30));
        const searchStr = contextBefore + strippedSelected;
        const matchIndex = strippedFullText.indexOf(searchStr);
        if (matchIndex !== -1) {
            // Map back to original position
            let charCount = 0;
            let originalIndex = 0;

            for (let i = 0; i < fullText.length && charCount < matchIndex + contextBefore.length; i++) {
                const char = fullText[i];
                if (char !== '*' && char !== '_' && char !== '`') {
                    charCount++;
                }
                originalIndex = i + 1;
            }

            return originalIndex;
        }
    }

    // 4. Fallback: return -1 to indicate not found
    console.warn('Could not find selection in source. Selected:', normalizedSelected.substring(0, 50));
    return -1;
}
