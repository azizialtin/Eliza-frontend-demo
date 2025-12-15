import React, { createContext, useContext, useState, useEffect } from 'react';
import { Annotation, CreateAnnotationDTO, CreateAnswerDTO } from '@/types/annotations';
import { getAuthToken, MANAGER_URL } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AnnotationContextType {
    annotations: Annotation[];
    activeAnnotationId: string | null;
    isDrawerOpen: boolean;
    setActiveAnnotationId: (id: string | null) => void;
    setDrawerOpen: (open: boolean) => void;
    createAnnotation: (dto: CreateAnnotationDTO) => Promise<void>;
    createAnswer: (annotationId: string, dto: CreateAnswerDTO) => Promise<void>;
    deleteAnnotation: (id: string) => Promise<void>;
    isLoading: boolean;
}

const AnnotationContext = createContext<AnnotationContextType | undefined>(undefined);

export function useAnnotationManager() {
    const context = useContext(AnnotationContext);
    if (!context) {
        throw new Error('useAnnotationManager must be used within an AnnotationProvider');
    }
    return context;
}

interface AnnotationProviderProps {
    sectionId: string;
    children: React.ReactNode;
}

export function AnnotationProvider({ sectionId, children }: AnnotationProviderProps) {
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null);
    const [isDrawerOpen, setDrawerOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const { isAuthenticated } = useAuth();

    // Fetch annotations
    useEffect(() => {
        const fetchAnnotations = async () => {
            const token = getAuthToken();
            if (!sectionId || !token) return;

            setIsLoading(true);
            try {
                const response = await fetch(`${MANAGER_URL}/api/v1/content/sections/${sectionId}/annotations`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch annotations');

                const data = await response.json();
                setAnnotations(data);
            } catch (error) {
                console.error(error);
                // toast({ title: 'Failed to load annotations', variant: 'destructive' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnnotations();
    }, [sectionId, isAuthenticated]);

    const createAnnotation = async (dto: CreateAnnotationDTO) => {
        const token = getAuthToken();
        if (!sectionId || !token) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${MANAGER_URL}/api/v1/content/sections/${sectionId}/annotations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dto)
            });

            if (!response.ok) throw new Error('Failed to create annotation');

            const newAnnotation = await response.json();

            setAnnotations(prev => [...prev, newAnnotation]);
            setActiveAnnotationId(newAnnotation.id);
            setDrawerOpen(true);

            toast({ title: 'Annotation created' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to create annotation', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    const deleteAnnotation = async (id: string) => {
        const token = getAuthToken();
        if (!token) return;

        try {
            const response = await fetch(`${MANAGER_URL}/api/v1/content/annotations/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete annotation');

            setAnnotations(prev => prev.filter(a => a.id !== id));
            toast({ title: 'Annotation deleted' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to delete annotation', variant: 'destructive' });
        }
    };

    const createAnswer = async (annotationId: string, dto: CreateAnswerDTO) => {
        const token = getAuthToken();
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${MANAGER_URL}/api/v1/content/annotations/${annotationId}/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(dto)
            });

            if (!response.ok) throw new Error('Failed to create answer');

            const newAnswer = await response.json();

            // Update the annotation with the new answer
            setAnnotations(prev => prev.map(ann =>
                ann.id === annotationId
                    ? { ...ann, answers: [...ann.answers, newAnswer] }
                    : ann
            ));

            toast({ title: dto.responder_type === 'ai' ? 'AI answer generated' : 'Answer added' });
        } catch (error) {
            console.error(error);
            toast({ title: 'Failed to create answer', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnnotationContext.Provider value={{
            annotations,
            activeAnnotationId,
            isDrawerOpen,
            setActiveAnnotationId,
            setDrawerOpen,
            createAnnotation,
            createAnswer,
            deleteAnnotation,
            isLoading
        }}>
            {children}
        </AnnotationContext.Provider>
    );
}
