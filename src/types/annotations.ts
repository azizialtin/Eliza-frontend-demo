export type AnnotationType = 'note' | 'question';
export type ResponderType = 'ai' | 'teacher' | 'student';

export interface AnnotationAttachment {
    id: string;
    kind: 'image' | 'file' | 'audio';
    file_url: string;
    content_type?: string;
    file_size?: number;
    created_at: string;
}

export interface AnnotationAnswer {
    id: string;
    responder_type: ResponderType;
    responder_id?: string | null;
    body: string;
    metadata?: Record<string, any>;
    is_accepted: boolean;
    created_at: string;
}

export interface Annotation {
    id: string;
    annotation_type: AnnotationType;
    title?: string | null;
    body: string;

    // Anchor fields
    start_offset: number | null;
    end_offset: number | null;
    anchor_text: string | null;

    is_stale: boolean;
    is_deleted: boolean;
    created_at: string;
    updated_at: string;

    answers: AnnotationAnswer[];
    attachments: AnnotationAttachment[];
}

export interface CreateAnnotationDTO {
    annotation_type: AnnotationType;
    title?: string;
    body: string;
    start_offset?: number;
    end_offset?: number;
    anchor_text?: string;
}

export interface CreateAnswerDTO {
    responder_type: ResponderType;
    body?: string;
    metadata?: Record<string, any>;
    mark_accepted?: boolean;
}
