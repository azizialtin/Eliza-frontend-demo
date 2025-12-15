import { useState, useEffect, useCallback } from 'react';
import { apiClient, Syllabus, Chapter, Subchapter, Document } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Syllabus hooks
export const useSyllabi = () => {
    const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchSyllabi = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiClient.getSyllabi();
            setSyllabi(data);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch syllabi';
            setError(message);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchSyllabi();
    }, [fetchSyllabi]);

    const createSyllabus = async (data: { name: string; description?: string; language?: string; is_public?: boolean }) => {
        try {
            const newSyllabus = await apiClient.createSyllabus(data.name);
            setSyllabi(prev => [newSyllabus, ...prev]);
            return newSyllabus;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to create syllabus';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
            throw err;
        }
    };

    const deleteSyllabus = async (syllabusId: string) => {
        try {
            await apiClient.deleteSyllabus(syllabusId);
            setSyllabi(prev => prev.filter(syllabus => syllabus.id !== syllabusId));
            toast({
                title: "Success",
                description: "Syllabus deleted successfully",
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete syllabus';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
            throw err;
        }
    };

    return {
        syllabi,
        loading,
        error,
        createSyllabus,
        deleteSyllabus,
        refetch: fetchSyllabi,
    };
};

// Syllabus detail hook
export const useSyllabus = (syllabusId: string) => {
    const [syllabus, setSyllabus] = useState<Syllabus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchSyllabus = useCallback(async () => {
        if (!syllabusId) return;

        try {
            setLoading(true);
            const data = await apiClient.getSyllabus(syllabusId);
            setSyllabus(data);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch syllabus';
            setError(message);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [syllabusId, toast]);

    useEffect(() => {
        fetchSyllabus();
    }, [fetchSyllabus]);

    return {
        syllabus,
        loading,
        error,
        refetch: fetchSyllabus,
    };
};

// Chapter hook
export const useChapter = (chapterId: string) => {
    const [chapter, setChapter] = useState<Chapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchChapter = useCallback(async () => {
        if (!chapterId) return;

        try {
            setLoading(true);
            const data = await apiClient.getChapter(chapterId);
            setChapter(data);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch chapter';
            setError(message);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [chapterId, toast]);

    useEffect(() => {
        fetchChapter();
    }, [fetchChapter]);

    const openChapter = async (autoGenerateVideos: boolean = true) => {
        try {
            const result = await apiClient.openChapter(chapterId, autoGenerateVideos);
            toast({
                title: "Chapter Opened",
                description: result.message || "Chapter opened successfully",
            });
            await fetchChapter();
            return result;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to open chapter';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
            throw err;
        }
    };

    return {
        chapter,
        loading,
        error,
        openChapter,
        refetch: fetchChapter,
    };
};

// Subchapter hook
export const useSubchapter = (subchapterId: string) => {
    const [subchapter, setSubchapter] = useState<Subchapter | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchSubchapter = useCallback(async () => {
        if (!subchapterId) return;

        try {
            setLoading(true);
            console.log("📡 useSubchapter: Fetching...", subchapterId);
            const data = await apiClient.getSubchapter(subchapterId);
            console.log("📡 useSubchapter: Received data:", data);
            setSubchapter(data);
            setError(null);
        } catch (err) {
            console.error("📡 useSubchapter: Error:", err);
            const message = err instanceof Error ? err.message : 'Failed to fetch subchapter';
            setError(message);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [subchapterId, toast]);

    useEffect(() => {
        fetchSubchapter();
    }, [fetchSubchapter]);

    const markComplete = async () => {
        try {
            await apiClient.markSubchapterComplete(subchapterId);
            setSubchapter(prev => prev ? { ...prev, is_completed: true } : null);
            toast({
                title: "Progress Updated",
                description: "Subchapter marked as completed",
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to update completion status';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
            throw err;
        }
    };

    const generateVideo = async (options?: { initial_model?: string; voice_id?: string }) => {
        try {
            setSubchapter(prev => prev ? {
                ...prev,
                video_status: 'QUEUED',
                video_progress: 0,
                video_message: 'Video generation request sent...'
            } : null);

            const result = await apiClient.generateSubchapterVideo(subchapterId, options);

            toast({
                title: "Video Generation Started",
                description: "Video generation has been queued",
            });
            return result;
        } catch (err) {
            setSubchapter(prev => prev ? {
                ...prev,
                video_status: 'FAILED',
                video_progress: 0,
                video_message: 'Failed to start video generation'
            } : null);

            const message = err instanceof Error ? err.message : 'Failed to generate video';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
            throw err;
        }
    };

    return {
        subchapter,
        loading,
        error,
        markComplete,
        generateVideo,
        refetch: fetchSubchapter,
    };
};

// Video status polling hook (safe polling)
export const useVideoStatusPolling = (subchapterId: string, enabled = false) => {
    const [status, setStatus] = useState<Subchapter | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !subchapterId) return;

        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const poll = async () => {
            try {
                if (isMounted) setLoading(true);
                const data = await apiClient.getVideoStatus(subchapterId);
                if (isMounted) {
                    setStatus(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch video status';
                    setError(message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    // Schedule next poll only after this one completes
                    timeoutId = setTimeout(poll, 10000);
                }
            }
        };

        poll();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [subchapterId, enabled]);

    return {
        status,
        loading,
        error,
        refetch: async () => {
            // Manual refetch wrapper
            try {
                setLoading(true);
                const data = await apiClient.getVideoStatus(subchapterId!);
                setStatus(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed');
            } finally {
                setLoading(false);
            }
        },
    };
};

// Documents hook
export const useDocuments = (syllabusId: string) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const fetchDocuments = useCallback(async () => {
        if (!syllabusId) return;

        try {
            setLoading(true);
            const data = await apiClient.getSyllabusDocuments(syllabusId);
            setDocuments(data);
            setError(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch documents';
            setError(message);
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    }, [syllabusId, toast]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const uploadDocument = async (file: File, autoProcess: boolean = true) => {
        try {
            const uploadResult = await apiClient.uploadDocument(syllabusId, file, autoProcess);
            // Always refetch to pull the authoritative metadata (status, signed_url, etc.)
            await fetchDocuments();
            toast({
                title: "Document Uploaded",
                description: `${file.name} uploaded successfully`,
            });
            return uploadResult;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to upload document';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
            throw err;
        }
    };

    const deleteDocument = async (documentId: string) => {
        try {
            await apiClient.deleteDocument(documentId);
            setDocuments(prev => prev.filter(doc => doc.id !== documentId));
            toast({
                title: "Success",
                description: "Document deleted successfully",
            });
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to delete document';
            toast({
                title: "Error",
                description: message,
                variant: "destructive",
            });
            throw err;
        }
    };

    return {
        documents,
        loading,
        error,
        uploadDocument,
        deleteDocument,
        refetch: fetchDocuments,
    };
};

// Syllabus status polling hook (safe polling)
export const useSyllabusStatusPolling = (syllabusId: string, enabled = false, intervalMs = 10000) => {
    const [status, setStatus] = useState<Syllabus | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !syllabusId) return;

        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const poll = async () => {
            try {
                if (isMounted) setLoading(true);
                const data = await apiClient.getSyllabus(syllabusId);
                if (isMounted) {
                    setStatus(data);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch syllabus status';
                    setError(message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    timeoutId = setTimeout(poll, intervalMs);
                }
            }
        };

        poll();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [syllabusId, enabled, intervalMs]);

    return {
        status,
        loading,
        error,
        refetch: async () => {
            // Manual refetch not tied to polling loop
            try {
                const data = await apiClient.getSyllabus(syllabusId!);
                setStatus(data);
            } catch (e) { }
        },
    };
};

// Blackboard video status hook (safe polling)
export const useBlackboardVideo = (subchapterId: string, enabled = false, intervalMs = 15000) => {
    const [blackboardStatus, setBlackboardStatus] = useState<{
        status: string;
        progress: number;
        message?: string;
        filePath?: string;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !subchapterId) return;

        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const poll = async () => {
            try {
                if (isMounted) setLoading(true);
                const data = await apiClient.getVideoStatus(subchapterId);
                if (isMounted) {
                    setBlackboardStatus({
                        status: data.video_status || 'not_started',
                        progress: data.video_progress || 0,
                        message: data.video_message,
                        filePath: data.video_file_path,
                    });
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    const message = err instanceof Error ? err.message : 'Failed to fetch blackboard video status';
                    setError(message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                    timeoutId = setTimeout(poll, intervalMs);
                }
            }
        };

        poll();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [subchapterId, enabled, intervalMs]);

    return {
        blackboardStatus,
        loading,
        error,
        refetch: async () => { }, // implementation omitted
    };
};
