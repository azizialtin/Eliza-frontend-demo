
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
    activity_type: 'chapter_review' | 'tutoring_qa' | 'self_challenge' | 'test_simulation' | 'request_explanation' | 'extra_challenge';
    did_student_prompt: boolean;
    content_id?: string;
    is_correct?: boolean; // 1 or 0
    difficulty_level?: number; // 1-4 (1=Easy, 2=Medium, 3=Hard, 4=Expert)
    prompt_text?: string; // The actual question/prompt asked
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
    all_time_streak: number; // Best streak ever
    avg_mastery: number; // 0-100%
    avg_difficulty: number; // 1-4 average difficulty attempted
    interactions_count: number;
    exercise_attempts: number; // Total exercises attempted
    correct_answers: number; // Total correct answers
    status_flag: 'On Track' | 'High Help Needed' | 'Consistent' | 'Struggling';
    time_spent_minutes: number; // Total time on platform
}

// --- Mock Data Store ---

// 1. Classes
export const MOCK_CLASSES = ['9 Integral', '10 Algebra'];

// Helper to generate students
const generateStudents = (): GamifiedStudent[] => {
    const firstNames = [
        'Altin', 'Ersjan', 'Timofey', 'Ana', 'Besnik', 'Era', 'Joni', 'Darte', 'Bora', 'Fatbardh',
        'Genta', 'Drilon', 'Albana', 'Bardh', 'Clirim', 'Diana', 'Elton', 'Fjolla', 'Gentian', 'Hana',
        'Ilir', 'Jeta', 'Klevis', 'Lule', 'Marin', 'Nora', 'Orion', 'Pranvera', 'Qendrim', 'Rita',
        'Shpend', 'Teuta', 'Urim', 'Valbona', 'Xhevahir', 'Yllka', 'Zamira', 'Arben', 'Blerta', 'Dardan',
        'Elira', 'Festim', 'Ganimete', 'Hamdi', 'Ismail', 'Jeton', 'Kaltrina', 'Liridon', 'Mimoza', 'Naser',
        'Olti', 'Petrit', 'Qemal', 'Roza', 'Skender', 'Tomi', 'Uliks', 'Vera', 'Xhon', 'Ylber',
        'Zana', 'Agim', 'Besart', 'Drita', 'Emma', 'Fidan', 'Geri', 'Heidi', 'Iliriana', 'Jetmir',
        'Krenar', 'Linda', 'Mira', 'Njomza', 'Orinda', 'Pellumb', 'Qamil', 'Rinor', 'Sara', 'Taulant',
        'Una', 'Valdet', 'Xhelal', 'Ylli', 'Zef', 'Adrian', 'Besa', 'Denis', 'Edona', 'Florent',
        'Gloria', 'Henri', 'Ina', 'Jon', 'Kevin', 'Laura', 'Melisa', 'Noel', 'Omar', 'Paula'
    ];

    const lastNames = [
        'Azizi', 'Keri', 'Kuznetsov', 'Prifti', 'Hoxha', 'Malo', 'Basha', 'Pipa', 'Zeka', 'Vela',
        'Ismajli', 'Gashi', 'Rama', 'Dedaj', 'Berisha', 'Krasniqi', 'Mustafa', 'Hodza', 'Shehu', 'Meta',
        'Dervishi', 'Morina', 'Shala', 'Kastrati', 'Kelmendi', 'Demiri', 'Halili', 'Aliu', 'Sahiti', 'Bytyqi',
        'Kurteshi', 'Syla', 'Hyseni', 'Ibrahimi', 'Mehmeti', 'Rexhepi', 'Kabashi', 'Beqiri', 'Bajrami', 'Osmani',
        'Hasani', 'Selimi', 'Gashi', 'Muja', 'Hoti', 'Veseli', 'Abazi', 'Tahiri', 'Limani', 'Rrahmani',
        'Maliqi', 'Kryeziu', 'Lahu', 'Curri', 'Sadiku', 'Gjonbalaj', 'Isufi', 'Zeneli', 'Jashari', 'Kola'
    ];

    const students: GamifiedStudent[] = [];
    let idCounter = 1;

    // Generate 200 students for each class
    MOCK_CLASSES.forEach((className) => {
        for (let i = 0; i < 200; i++) {
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const id = idCounter.toString().padStart(5, '0');
            const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@school.com`;
            const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}${i}`;

            students.push({
                id,
                first_name: firstName,
                last_name: lastName,
                email,
                role: 'STUDENT',
                school_id: '01',
                preferred_language: Math.random() > 0.5 ? 'en' : 'sq',
                is_active: true,
                student_username: username,
                school_name: 'EK',
                class_name: className,
                avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}${i}`
            });

            idCounter++;
        }
    });

    return students;
};

// 2. Students - Now generated dynamically
export const MOCK_STUDENTS: GamifiedStudent[] = generateStudents();

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

    // Auto-fill random data for all students with varying patterns
    // Create different student archetypes
    const keyIds = new Set(['00001', '00002', '00003', '00201', '00212']); // Updated IDs for new format

    MOCK_STUDENTS.forEach(s => {
        if (keyIds.has(s.id)) return; // Skip manually defined students

        // Student ID as number for pattern generation
        const studentNum = parseInt(s.id);
        const rand = studentNum % 100; // Use ID for consistent randomness

        // Determine student archetype based on ID
        let numLogs, avgDifficulty, successRate, interactionRate, consistency;

        if (rand < 20) {
            // ~20% High Performers (On Track)
            numLogs = 40 + (rand % 20);
            avgDifficulty = 3 + (rand % 10) / 10; // 3.0-3.9 (Hard)
            successRate = 0.75 + (rand % 20) / 100; // 75-95%
            interactionRate = rand % 5; // Low interactions
            consistency = 0.8; // Very consistent
        } else if (rand < 40) {
            // ~20% Struggling (High Help Needed)
            numLogs = 50 + (rand % 30);
            avgDifficulty = 1.5 + (rand % 10) / 10; // 1.5-2.4 (Easy-Medium)
            successRate = 0.4 + (rand % 30) / 100; // 40-70%
            interactionRate = 15 + (rand % 30); // High interactions
            consistency = 0.3; // Inconsistent
        } else if (rand < 60) {
            // ~20% Consistent Learners
            numLogs = 60 + (rand % 20);
            avgDifficulty = 2.0 + (rand % 10) / 10; // 2.0-2.9 (Medium)
            successRate = 0.70 + (rand % 20) / 100; // 70-90%
            interactionRate = rand % 8;
            consistency = 0.9; // Very consistent
        } else {
            // ~40% Average Students
            numLogs = 20 + (rand % 30);
            avgDifficulty = 1.8 + (rand % 12) / 10; // 1.8-2.9
            successRate = 0.60 + (rand % 25) / 100; // 60-85%
            interactionRate = rand % 10;
            consistency = 0.5; // Moderate
        }

        // Generate logs based on archetype
        for (let k = 0; k < numLogs; k++) {
            const day = Math.floor(k * (30 / numLogs)); // Spread over 30 days
            const skipDay = Math.random() > consistency;

            if (skipDay) continue;

            // Vary activity types
            const activityRoll = Math.random();
            let activityType: StudentInteractionLog['activity_type'];
            let isCorrect: boolean | undefined;
            let difficulty: number | undefined;

            if (activityRoll < 0.4) {
                activityType = 'chapter_review';
            } else if (activityRoll < 0.6) {
                activityType = 'self_challenge';
                difficulty = Math.round(avgDifficulty);
                isCorrect = Math.random() < successRate;
            } else if (activityRoll < 0.75) {
                activityType = 'test_simulation';
                difficulty = Math.round(avgDifficulty);
                isCorrect = Math.random() < successRate;
            } else if (activityRoll < 0.9) {
                activityType = 'tutoring_qa';
            } else {
                activityType = 'extra_challenge';
                difficulty = Math.round(avgDifficulty);
                isCorrect = Math.random() < successRate;
            }

            const prompts = activityType === 'tutoring_qa' ? interactionRate : 0;
            const duration = 10 + Math.floor(Math.random() * 40);

            addLog(s.id, day, activityType, duration, prompts, isCorrect, difficulty);
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
            all_time_streak: 0,
            avg_mastery: 0,
            avg_difficulty: 0,
            interactions_count: 0,
            exercise_attempts: 0,
            correct_answers: 0,
            status_flag: 'On Track',
            time_spent_minutes: 0
        });
    });

    const masteryCalc: Map<string, { total: number; count: number }> = new Map();
    const difficultyCalc: Map<string, { total: number; count: number }> = new Map();
    const interactionRankMap: Map<string, number> = new Map();
    const sortedLogs = [...MOCK_LOGS].sort((a, b) => new Date(a.timestamp_start).getTime() - new Date(b.timestamp_start).getTime());

    sortedLogs.forEach(log => {
        const studentStat = stats.get(log.student_id);
        if (!studentStat) return;

        const durationMin = differenceInMinutes(new Date(log.timestamp_end), new Date(log.timestamp_start));

        // Track time spent
        studentStat.time_spent_minutes += durationMin;

        if (log.activity_type === 'chapter_review' && durationMin >= CHAPTER_COMPLETION_TIME_MIN) {
            studentStat.total_xp += 10;
        }

        // Track all interactions (prompts)
        if (log.did_student_prompt) {
            studentStat.interactions_count++;

            if (log.activity_type === 'chapter_review') {
                const key = `${log.student_id}-${log.chapter_number}`;
                const currentRank = (interactionRankMap.get(key) || 0) + 1;
                interactionRankMap.set(key, currentRank);
                const points = BASE_POINT * Math.pow(INTERACTION_MULTIPLIER, currentRank - 1);
                studentStat.total_xp += Math.round(points);
            }
        }

        // Track exercises (challenges and tests)
        if (['self_challenge', 'test_simulation', 'extra_challenge'].includes(log.activity_type) && log.is_correct !== undefined) {
            studentStat.exercise_attempts++;

            const diffMult = log.difficulty_level || 1;
            const points = (diffMult * BASE_POINT * (log.is_correct ? 1 : 0)) + 1;
            studentStat.total_xp += points;

            // Track difficulty attempted
            if (!difficultyCalc.has(log.student_id)) difficultyCalc.set(log.student_id, { total: 0, count: 0 });
            const d = difficultyCalc.get(log.student_id)!;
            d.total += diffMult;
            d.count++;

            // Track mastery (correct answers)
            if (!masteryCalc.has(log.student_id)) masteryCalc.set(log.student_id, { total: 0, count: 0 });
            const m = masteryCalc.get(log.student_id)!;
            if (log.is_correct) {
                studentStat.correct_answers++;
                m.total += diffMult;
                m.count++;
            }
        }
    });

    students.forEach(s => {
        const stat = stats.get(s.id)!;

        // Calculate average mastery
        const m = masteryCalc.get(s.id);
        if (m && m.count > 0) {
            const avgDiff = m.total / m.count;
            stat.avg_mastery = Math.round((avgDiff / 4) * 100);
        }

        // Calculate average difficulty attempted
        const d = difficultyCalc.get(s.id);
        if (d && d.count > 0) {
            stat.avg_difficulty = Math.round((d.total / d.count) * 10) / 10; // Round to 1 decimal
        }

        // Calculate streaks
        const studentLogs = MOCK_LOGS.filter(l => l.student_id === s.id);
        const activeDays = new Set(studentLogs.map(l => format(new Date(l.timestamp_start), 'yyyy-MM-dd')));

        // Current streak
        let currentStreak = 0;
        const today = new Date();
        let checkDate = today;
        if (!activeDays.has(format(today, 'yyyy-MM-dd'))) checkDate = subDays(today, 1);

        while (activeDays.has(format(checkDate, 'yyyy-MM-dd'))) {
            currentStreak++;
            checkDate = subDays(checkDate, 1);
            if (currentStreak > 365) break;
        }

        // All-time best streak
        let maxStreak = 0;
        let tempStreak = 0;
        let prevDate: Date | null = null;

        Array.from(activeDays).sort().forEach(dateStr => {
            const date = new Date(dateStr);
            if (prevDate && differenceInMinutes(date, prevDate) <= 24 * 60 * 2) {
                tempStreak++;
            } else {
                maxStreak = Math.max(maxStreak, tempStreak);
                tempStreak = 1;
            }
            prevDate = date;
        });
        maxStreak = Math.max(maxStreak, tempStreak);

        stat.streak_days = currentStreak;
        stat.all_time_streak = Math.max(currentStreak, maxStreak);

        // Determine status flag based on CSV criteria
        const correctRate = stat.exercise_attempts > 0 ? stat.correct_answers / stat.exercise_attempts : 0;

        if (stat.interactions_count > 30 && correctRate < 0.6) {
            stat.status_flag = 'High Help Needed';
        } else if (stat.streak_days >= 7 && correctRate >= 0.7) {
            stat.status_flag = 'Consistent';
        } else if (correctRate >= 0.75 && stat.avg_difficulty >= 2.5) {
            stat.status_flag = 'On Track';
        } else if (correctRate < 0.5 || stat.exercise_attempts < 5) {
            stat.status_flag = 'Struggling';
        } else {
            stat.status_flag = 'On Track';
        }

        // Assign badges
        if (currentStreak >= 3) stat.badges.push('🔥 Consistency');
        if (stat.total_xp > 150) stat.badges.push('⭐ Top Student');
        if (stat.interactions_count > 15) stat.badges.push('💬 Inquisitive');
        if (stat.avg_difficulty >= 3.5) stat.badges.push('💪 Difficulty Master');
    });

    const sorted = Array.from(stats.values()).sort((a, b) => b.total_xp - a.total_xp);
    sorted.forEach((s, idx) => s.rank = idx + 1);
    return sorted;
};

// --- Actionable Insights Functions ---

export interface CommonError {
    chapter: number;
    exercise: string;
    errorCount: number;
    totalAttempts: number;
    errorRate: number;
}

export interface CommonPrompt {
    concept: string;
    count: number;
    relatedChapters: number[];
}

export const getCommonErrors = (classId?: string): CommonError[] => {
    const targetStudentIds = new Set(MOCK_STUDENTS.filter(s => !classId || s.class_name === classId).map(s => s.id));

    // Mock exercise data - in real app this would come from logs
    const exerciseErrors: Map<string, { errors: number; total: number }> = new Map();

    MOCK_LOGS.forEach(log => {
        if (!targetStudentIds.has(log.student_id)) return;
        if (!['self_challenge', 'test_simulation', 'extra_challenge'].includes(log.activity_type)) return;
        if (log.is_correct === undefined) return;

        const key = `${log.chapter_number}-${log.difficulty_level || 1}`;
        if (!exerciseErrors.has(key)) {
            exerciseErrors.set(key, { errors: 0, total: 0 });
        }

        const stat = exerciseErrors.get(key)!;
        stat.total++;
        if (!log.is_correct) {
            stat.errors++;
        }
    });

    const errors: CommonError[] = [];
    exerciseErrors.forEach((stat, key) => {
        const [chapter, difficulty] = key.split('-').map(Number);
        const errorRate = stat.total > 0 ? stat.errors / stat.total : 0;

        if (errorRate > 0.4) { // Only show if >40% error rate
            errors.push({
                chapter,
                exercise: `Exercise ${difficulty === 1 ? 'Easy' : difficulty === 2 ? 'Medium' : difficulty === 3 ? 'Hard' : 'Expert'} ${Math.floor(Math.random() * 10) + 1}`,
                errorCount: stat.errors,
                totalAttempts: stat.total,
                errorRate
            });
        }
    });

    return errors.sort((a, b) => b.errorRate - a.errorRate).slice(0, 5);
};

export const getCommonPrompts = (classId?: string): CommonPrompt[] => {
    const targetStudentIds = new Set(MOCK_STUDENTS.filter(s => !classId || s.class_name === classId).map(s => s.id));

    // Common concepts students ask about (mocked data)
    const concepts = [
        { concept: 'Integration by parts', count: 0, chapters: [1, 2] },
        { concept: 'Substitution method', count: 0, chapters: [1] },
        { concept: 'Limits at infinity', count: 0, chapters: [3] },
        { concept: 'Derivative of composite functions', count: 0, chapters: [2] },
        { concept: 'Area under curve', count: 0, chapters: [1] },
        { concept: 'Polynomial expansion', count: 0, chapters: [4] },
        { concept: 'Quadratic formula', count: 0, chapters: [4] },
        { concept: 'Trigonometric identities', count: 0, chapters: [6] }
    ];

    // Count interactions by chapter to determine popular concepts
    const chapterInteractions: Map<number, number> = new Map();

    MOCK_LOGS.forEach(log => {
        if (!targetStudentIds.has(log.student_id)) return;
        if (!log.did_student_prompt) return;

        const count = chapterInteractions.get(log.chapter_number) || 0;
        chapterInteractions.set(log.chapter_number, count + 1);
    });

    // Assign counts to concepts based on chapter interactions
    concepts.forEach(c => {
        c.chapters.forEach(ch => {
            c.count += chapterInteractions.get(ch) || 0;
        });
    });

    return concepts
        .filter(c => c.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(c => ({
            concept: c.concept,
            count: c.count,
            relatedChapters: c.chapters
        }));
};
