
import { User } from './api';
import { differenceInMinutes, subDays, isSameDay, format, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

// --- Constants from SQL Macross ---
const CHAPTER_COMPLETION_TIME_MIN = 10;
const BASE_POINT = 5;
const INTERACTION_MULTIPLIER = 1.25;
const CONSISTENCY_MULTIPLIER = 0.05;

// --- Interfaces ---

export interface StudentInteractionLog {
    log_id: string;
    student_id: string;
    course_id: string;
    timestamp_start: string; // ISO
    timestamp_end: string;   // ISO
    chapter_number: number;
    activity_type: 'chapter_review' | 'tutoring_qa' | 'self_challenge' | 'test_simulation' | 'request_explanation';
    did_student_prompt: boolean;
    content_id?: string;
    is_correct?: boolean; // 1 or 0
    difficulty_level?: number; // 1-4
}

export interface TeacherCourse {
    course_id: string;
    course_name: string;
    teacher_id: string;
}

export interface GamifiedStudent extends User {
    student_username: string;
    school_name: string;
    class_name: string;
    avatar_url?: string;
}

export interface StudentStats {
    student_id: string;
    total_xp: number;
    rank: number;
    badges: string[];
    streak_days: number;
    avg_mastery: number; // 0-100%
    interactions_count: number;
}

// --- Mock Data Store ---

// 1. Classes
export const MOCK_CLASSES = ['9 Integral', '10 Algebra'];

// 2. Students
export const MOCK_STUDENTS: GamifiedStudent[] = [
    // CLASS 9 Integral
    { id: '001', first_name: 'Altin', last_name: 'Azizi', email: 'altin@gmail.com', role: 'STUDENT', school_id: '01', preferred_language: 'en', is_active: true, student_username: 'altin_azizi', school_name: 'EK', class_name: '9 Integral', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Altin' },
    { id: '002', first_name: 'Ersjan', last_name: 'Keri', email: 'ersjan@gmail.com', role: 'STUDENT', school_id: '01', preferred_language: 'en', is_active: true, student_username: 'ersjan_keri', school_name: 'EK', class_name: '9 Integral', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ersjan' },
    { id: '003', first_name: 'Timofey', last_name: 'Kuznetsov', email: 'timofey@gmail.com', role: 'STUDENT', school_id: '01', preferred_language: 'en', is_active: true, student_username: 'timofey_kuznetsov', school_name: 'EK', class_name: '9 Integral', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Timofey' },
    { id: '004', first_name: 'Ana', last_name: 'Prifti', email: 'ana@school.com', role: 'STUDENT', school_id: '01', preferred_language: 'sq', is_active: true, student_username: 'ana_prifti', school_name: 'EK', class_name: '9 Integral', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana' },
    { id: '005', first_name: 'Besnik', last_name: 'Hoxha', email: 'besnik@school.com', role: 'STUDENT', school_id: '01', preferred_language: 'sq', is_active: true, student_username: 'besnik_h', school_name: 'EK', class_name: '9 Integral', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Besnik' },
    { id: '006', first_name: 'Era', last_name: 'Malo', email: 'era@school.com', role: 'STUDENT', school_id: '01', preferred_language: 'sq', is_active: true, student_username: 'era_malo', school_name: 'EK', class_name: '9 Integral', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Era' },
    { id: '007', first_name: 'Joni', last_name: 'Basha', email: 'joni@school.com', role: 'STUDENT', school_id: '01', preferred_language: 'en', is_active: true, student_username: 'joni_b', school_name: 'EK', class_name: '9 Integral', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joni' },

    // CLASS 10 Algebra
    { id: '010', first_name: 'Darte', last_name: 'Pipa', email: 'darte@school.com', role: 'STUDENT', school_id: '01', preferred_language: 'en', is_active: true, student_username: 'darte_p', school_name: 'EK', class_name: '10 Algebra', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Darte' },
    { id: '011', first_name: 'Bora', last_name: 'Zeka', email: 'bora@school.com', role: 'STUDENT', school_id: '01', preferred_language: 'en', is_active: true, student_username: 'bora_z', school_name: 'EK', class_name: '10 Algebra', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bora' },
    { id: '012', first_name: 'Fatbardh', last_name: 'Vela', email: 'fatbardh@school.com', role: 'STUDENT', school_id: '01', preferred_language: 'sq', is_active: true, student_username: 'fatbardh_v', school_name: 'EK', class_name: '10 Algebra', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fatbardh' },
    { id: '013', first_name: 'Genta', last_name: 'Ismajli', email: 'genta@school.com', role: 'STUDENT', school_id: '01', preferred_language: 'en', is_active: true, student_username: 'genta_i', school_name: 'EK', class_name: '10 Algebra', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Genta' },
    { id: '014', first_name: 'Drilon', last_name: 'Gashi', email: 'drilon@school.com', role: 'STUDENT', school_id: '01', preferred_language: 'sq', is_active: true, student_username: 'drilon_g', school_name: 'EK', class_name: '10 Algebra', avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Drilon' },
];

export const MOCK_COURSE: TeacherCourse = {
    course_id: '000000001',
    course_name: 'Matematika 9',
    teacher_id: '000000001'
};

// 3. Interaction Logs
const generateLogs = (): StudentInteractionLog[] => {
    const logs: StudentInteractionLog[] = [];
    const now = new Date();

    const addLog = (studentId: string, daysAgo: number, type: StudentInteractionLog['activity_type'], durationMin: number, prompts: number, correct?: boolean, diff?: number) => {
        const start = subDays(now, daysAgo);
        // Randomize time slightly
        start.setHours(14 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 60), 0);
        const end = new Date(start.getTime() + durationMin * 60000);

        logs.push({
            log_id: Math.random().toString(36).substr(2, 9),
            student_id: studentId,
            course_id: MOCK_COURSE.course_id,
            timestamp_start: start.toISOString(),
            timestamp_end: end.toISOString(),
            chapter_number: 1,
            activity_type: type,
            did_student_prompt: prompts > 0,
            is_correct: correct,
            difficulty_level: diff
        });

        for (let i = 1; i < prompts; i++) {
            logs.push({
                log_id: Math.random().toString(36).substr(2, 9),
                student_id: studentId,
                course_id: MOCK_COURSE.course_id,
                timestamp_start: new Date(start.getTime() + i * 10000).toISOString(),
                timestamp_end: new Date(start.getTime() + i * 10000 + 60000).toISOString(),
                chapter_number: 1,
                activity_type: type,
                did_student_prompt: true,
            });
        }
    };

    // Specific Patterns
    // Altin (001) - Consistent
    for (let i = 0; i < 30; i++) {
        if (i % 7 !== 6) {
            addLog('001', i, 'chapter_review', 45, 0);
            if (i % 2 === 0) addLog('001', i, 'self_challenge', 15, 1, true, 3);
        }
    }

    // Ersjan (002) - High Interaction
    for (let i = 0; i < 30; i++) {
        if (i % 3 === 0) {
            addLog('002', i, 'tutoring_qa', 30, 5);
            addLog('002', i, 'chapter_review', 10, 0);
        }
    }

    // Timofey (003) - Sporadic Genius
    [1, 5, 10, 15, 20].forEach(day => {
        addLog('003', day, 'test_simulation', 45, 0, true, 4);
    });

    // Darte (010) - Class 10 Tester
    for (let i = 0; i < 30; i++) {
        if (i % 2 === 0) {
            addLog('010', i, 'test_simulation', 40, 0, true, 2);
            addLog('010', i, 'chapter_review', 20, 0);
        }
    }

    // Fatbardh (012) - Struggling
    for (let i = 0; i < 30; i += 3) {
        addLog('012', i, 'self_challenge', 20, 2, false, 2);
    }

    // Auto-fill random data involved students
    // Everyone must have data for consistency
    const keyIds = new Set(['001', '002', '003', '010', '012']);
    MOCK_STUDENTS.forEach(s => {
        if (!keyIds.has(s.id)) {
            const numLogs = 5 + Math.floor(Math.random() * 10);
            for (let k = 0; k < numLogs; k++) {
                const day = Math.floor(Math.random() * 30);
                const type = Math.random() > 0.5 ? 'chapter_review' : 'self_challenge';
                addLog(s.id, day, type, 25, 1, true, 2);
            }
        }
    });

    return logs;
};

const MOCK_LOGS = generateLogs();

// --- Calculation Logic ---

export const getDailyActivityStats = () => {
    const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });
    return last7Days.map(day => {
        const dateStr = format(day, 'MMM dd');
        const isoDate = format(day, 'yyyy-MM-dd');
        const activeCount = new Set(MOCK_LOGS.filter(l => format(new Date(l.timestamp_start), 'yyyy-MM-dd') === isoDate).map(l => l.student_id)).size;
        const questionsCount = MOCK_LOGS.filter(l => format(new Date(l.timestamp_start), 'yyyy-MM-dd') === isoDate && (l.activity_type === 'self_challenge' || l.activity_type === 'test_simulation')).length;
        return { date: dateStr, activeStudents: activeCount, questionsAnswered: questionsCount };
    });
};

export const getClassEngagementStats = (classId?: string) => {
    const targetStudentIds = new Set(MOCK_STUDENTS.filter(s => !classId || s.class_name === classId).map(s => s.id));
    const last7Days = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });

    return last7Days.map(day => {
        const dateStr = format(day, 'MMM dd');
        const isoDate = format(day, 'yyyy-MM-dd');
        let readingMins = 0;
        let testingMins = 0;
        let chattingMins = 0;

        MOCK_LOGS.forEach(log => {
            if (!targetStudentIds.has(log.student_id)) return;
            if (format(new Date(log.timestamp_start), 'yyyy-MM-dd') !== isoDate) return;
            const duration = differenceInMinutes(new Date(log.timestamp_end), new Date(log.timestamp_start));
            if (log.activity_type === 'chapter_review') readingMins += duration;
            else if (log.activity_type === 'tutoring_qa' || log.activity_type === 'request_explanation') chattingMins += duration;
            else testingMins += duration;
        });

        return { date: dateStr, reading: Math.round(readingMins), chatting: Math.round(chattingMins), testing: Math.round(testingMins) };
    });
};

export const getClassMasteryStats = (classId?: string) => {
    const isClass10 = classId === '10 Algebra';

    if (isClass10) {
        return [
            { topic: 'Polynomials', avgScore: 88, difficulty: 'Medium' },
            { topic: 'Quadratics', avgScore: 92, difficulty: 'Hard' },
            { topic: 'Complex Numbers', avgScore: 74, difficulty: 'Hard' },
            { topic: 'Sequences', avgScore: 81, difficulty: 'Medium' },
            { topic: 'Inequalities', avgScore: 65, difficulty: 'Easy' }
        ];
    }

    // Class 9 Integral (or default)
    return [
        { topic: 'Integrals', avgScore: 78, difficulty: 'Hard' },
        { topic: 'Derivatives', avgScore: 85, difficulty: 'Hard' },
        { topic: 'Limits', avgScore: 92, difficulty: 'Medium' },
        { topic: 'Functions', avgScore: 88, difficulty: 'Medium' },
        { topic: 'Continuity', avgScore: 70, difficulty: 'Easy' }
    ];
};

export const calculateLeaderboard = (classId?: string): (StudentStats & { student: GamifiedStudent })[] => {
    const stats: Map<string, StudentStats & { student: GamifiedStudent }> = new Map();
    const students = classId ? MOCK_STUDENTS.filter(s => s.class_name === classId) : MOCK_STUDENTS;

    students.forEach(s => {
        stats.set(s.id, {
            student: s,
            student_id: s.id,
            total_xp: 0,
            rank: 0,
            badges: [],
            streak_days: 0,
            avg_mastery: 0,
            interactions_count: 0
        });
    });

    const masteryCalc: Map<string, { total: number; count: number }> = new Map();
    const interactionRankMap: Map<string, number> = new Map();
    const sortedLogs = [...MOCK_LOGS].sort((a, b) => new Date(a.timestamp_start).getTime() - new Date(b.timestamp_start).getTime());

    sortedLogs.forEach(log => {
        const studentStat = stats.get(log.student_id);
        if (!studentStat) return;

        const durationMin = differenceInMinutes(new Date(log.timestamp_end), new Date(log.timestamp_start));
        if (log.activity_type === 'chapter_review' && durationMin >= CHAPTER_COMPLETION_TIME_MIN) {
            studentStat.total_xp += 10;
        }

        if (log.did_student_prompt && log.activity_type === 'chapter_review') {
            studentStat.interactions_count++;
            const key = `${log.student_id}-${log.chapter_number}`;
            const currentRank = (interactionRankMap.get(key) || 0) + 1;
            interactionRankMap.set(key, currentRank);
            const points = BASE_POINT * Math.pow(INTERACTION_MULTIPLIER, currentRank - 1);
            studentStat.total_xp += Math.round(points);
        }

        if ((log.activity_type === 'self_challenge' || log.activity_type === 'test_simulation') && log.is_correct !== undefined) {
            const diffMult = log.difficulty_level || 1;
            const points = (diffMult * BASE_POINT * (log.is_correct ? 1 : 0)) + 1;
            studentStat.total_xp += points;

            if (!masteryCalc.has(log.student_id)) masteryCalc.set(log.student_id, { total: 0, count: 0 });
            const m = masteryCalc.get(log.student_id)!;
            if (log.is_correct) {
                m.total += diffMult;
                m.count++;
            }
        }
    });

    students.forEach(s => {
        const stat = stats.get(s.id)!;
        const m = masteryCalc.get(s.id);
        if (m && m.count > 0) {
            const avgDiff = m.total / m.count;
            stat.avg_mastery = Math.round((avgDiff / 4) * 100);
        }

        const studentLogs = MOCK_LOGS.filter(l => l.student_id === s.id);
        const activeDays = new Set(studentLogs.map(l => format(new Date(l.timestamp_start), 'yyyy-MM-dd')));

        let currentStreak = 0;
        const today = new Date();
        let checkDate = today;
        if (!activeDays.has(format(today, 'yyyy-MM-dd'))) checkDate = subDays(today, 1);

        while (activeDays.has(format(checkDate, 'yyyy-MM-dd'))) {
            currentStreak++;
            checkDate = subDays(checkDate, 1);
            if (currentStreak > 365) break;
        }

        stat.streak_days = currentStreak;
        if (currentStreak >= 3) stat.badges.push('🔥 Consistency');
        if (stat.total_xp > 150) stat.badges.push('⭐ Top Student');
        if (stat.interactions_count > 15) stat.badges.push('💬 Inquisitive');
    });

    const sorted = Array.from(stats.values()).sort((a, b) => b.total_xp - a.total_xp);
    sorted.forEach((s, idx) => s.rank = idx + 1);
    return sorted;
};
