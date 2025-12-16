# Frontend Quiz Integration - Technical Specifications

## Table of Contents
1. [Overview](#overview)
2. [Quiz Types](#quiz-types)
3. [Chapter Quiz Flow](#chapter-quiz-flow)
4. [Topic Quiz Flow](#topic-quiz-flow)
5. [Practice Session Flow](#practice-session-flow)
6. [API Endpoints](#api-endpoints)
7. [Data Models](#data-models)
8. [UI/UX Guidelines](#uiux-guidelines)
9. [Error Handling](#error-handling)

---

## Overview

The Aula quiz system provides three types of learning experiences:

1. **Chapter Quizzes** - Graded quizzes with remediation (must complete)
2. **Topic Quizzes** - Final assessments covering all chapters (no remediation)
3. **Practice Sessions** - Ungraded sandbox practice with adaptive difficulty

### Key Concepts

- **Interactive Flow**: Students answer questions one-by-one with immediate feedback
- **Remediation**: Wrong answers trigger remedial exercises (2 correct required)
- **Personalization**: AI adapts questions based on student performance
- **Progressive Learning**: Chapter → Topic → Practice cycle

---

## Quiz Types

### 1. Chapter Quiz
- **Purpose**: Assess understanding of a single chapter
- **Questions**: 10 questions per quiz
- **Remediation**: Required for all wrong answers
- **Status Flow**: `IN_PROGRESS` → `SUBMITTED` → `COMPLETED`
- **Question Types**:
  - Multiple Choice (40%) - 4 options
  - Fill in the Blank (30%)
  - Short Calculation (30%)

### 2. Topic Quiz
- **Purpose**: Final comprehensive assessment across all chapters in a topic
- **Questions**: 15 questions (default, configurable)
- **Remediation**: None (final assessment)
- **Eligibility**: Must complete ALL chapter quizzes first
- **Personalization**: 60% weak areas, 40% strong areas
- **Status Flow**: `IN_PROGRESS` → `SUBMITTED` → `COMPLETED`

### 3. Practice Session
- **Purpose**: Ungraded learning sandbox
- **Questions**: 5 initial (can generate more one at a time)
- **Remediation**: None
- **Grading**: Not saved, just immediate feedback
- **Context-Aware**: Uses quiz mistakes to target weak areas
- **Difficulty Levels**: EASY, MEDIUM, HARD

---

## Chapter Quiz Flow

### Step 0: Get Quiz for Chapter (Before Starting)

Before you can start a quiz, you need to get the quiz information for a specific chapter.

**Endpoint:**
```http
GET /api/v1/quizzes/chapter/{chapter_id}
```

**Response:**
```json
{
  "quiz_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Quiz: Machine Learning Basics",
  "chapter_id": "chapter-uuid",
  "topic_id": "topic-uuid",
  "total_questions": 10,
  "created_at": "2025-01-15T10:30:00Z",
  "has_attempt": true,
  "attempt_status": "COMPLETED",  // or "IN_PROGRESS", "SUBMITTED", null
  "attempt_id": "attempt-uuid",
  "score": 7,
  "percentage": 70.0,
  "completed_at": "2025-01-15T11:00:00Z"
}
```

**Use Cases:**

1. **Display Quiz Card in Chapter View:**
```typescript
// Show quiz availability and status
const response = await fetch(`/api/v1/quizzes/chapter/${chapterId}`);
const quizInfo = await response.json();

if (!quizInfo.has_attempt) {
  // Show "Start Quiz" button
  showStartButton(quizInfo.quiz_id);
} else if (quizInfo.attempt_status === "IN_PROGRESS") {
  // Show "Resume Quiz" button
  showResumeButton(quizInfo.attempt_id);
} else if (quizInfo.attempt_status === "SUBMITTED") {
  // Show "Complete Remediation" button
  showRemediationButton(quizInfo.attempt_id);
} else if (quizInfo.attempt_status === "COMPLETED") {
  // Show score and "Retake Quiz" option
  showCompletedStatus(quizInfo.score, quizInfo.percentage);
}
```

2. **Check Before Practice Session:**
```typescript
// Check if student has completed quiz (for context-aware practice)
const response = await fetch(`/api/v1/quizzes/chapter/${chapterId}`);
const quizInfo = await response.json();

if (quizInfo.has_attempt && quizInfo.attempt_status === "COMPLETED") {
  // Practice can use quiz mistakes as context
  showPracticeWithContext();
} else {
  // Regular practice without context
  showRegularPractice();
}
```

3. **Chapter Progress Tracking:**
```typescript
// Show chapter completion status
const response = await fetch(`/api/v1/quizzes/chapter/${chapterId}`);
const quizInfo = await response.json();

const chapterStatus = {
  hasQuiz: true,
  quizCompleted: quizInfo.attempt_status === "COMPLETED",
  score: quizInfo.percentage,
  unlocked: quizInfo.attempt_status === "COMPLETED"
};
```

**Error Handling:**
- **404**: No quiz exists for this chapter yet (teacher hasn't created it)
- **401**: User not authenticated
- **500**: Server error

### Phase 1: Taking the Quiz

```
START QUIZ
    ↓
GET FIRST QUESTION
    ↓
ANSWER QUESTION → IMMEDIATE FEEDBACK (✓/✗ + explanation)
    ↓
NEXT QUESTION
    ↓
REPEAT UNTIL ALL ANSWERED
    ↓
QUIZ SUMMARY (score + list of wrong questions)
```

#### Step-by-Step Implementation

**Step 1: Start Quiz**
```http
POST /api/v1/quizzes/{quiz_id}/start
```
Response includes:
- `attempt_id` - Store this for subsequent requests
- `total_questions` - Total number of questions
- `current_index` - Current position (0-based)
- `question` - First question object (without correct answer)

**Step 2: Display Question**
Show to student:
- Question text
- Options (if multiple choice)
- Input field (if fill blank or calculation)
- Progress indicator (e.g., "Question 3 of 10")

**Step 3: Submit Answer**
```http
POST /api/v1/quizzes/attempts/{attempt_id}/answer-question
Body: {
  "question_id": "q1",
  "answer": "student's answer"
}
```

Response includes:
- `is_correct` - Boolean
- `explanation` - Always shown
- `correct_answer` - Only if wrong
- `next_question` - Next question object or null
- `all_questions_answered` - Boolean flag

**Step 4: Show Immediate Feedback**
Display modal or inline feedback:
- ✓ "Correct!" with explanation
- ✗ "Incorrect" with explanation + correct answer

Then automatically show next question or move to summary.

**Step 5: Quiz Summary**
```http
GET /api/v1/quizzes/attempts/{attempt_id}/summary
```

Display:
- Score: "You got 7/10 (70%)"
- List of wrong questions with:
  - Question text
  - Your answer
  - Correct answer
  - Explanation
  - Recommended difficulty level

### Phase 2: Remediation (For Wrong Answers)

```
FOR EACH WRONG QUESTION:
    ↓
CHOOSE DIFFICULTY (EASY/MEDIUM/HARD)
    ↓
COMPLETE 2 REMEDIAL EXERCISES
    ↓
IF WRONG → NEW REMEDIAL QUESTION
    ↓
REPEAT UNTIL 2 CORRECT
    ↓
NEXT WRONG QUESTION
    ↓
ALL REMEDIATION COMPLETE → QUIZ COMPLETED
```

#### Step-by-Step Implementation

**Step 1: Choose Difficulty**
Present difficulty selector for each wrong question:
- EASY: "I need more help with basics"
- MEDIUM: "Same difficulty as the original"
- HARD: "Challenge me with harder questions"

```http
POST /api/v1/quizzes/attempts/{attempt_id}/choose-difficulty/{question_id}
Body: {
  "difficulty": "EASY" | "MEDIUM" | "HARD"
}
```

Response includes:
- `remedial_id` - Track this for answering
- `question` - Remedial question (without answer)
- `difficulty` - Chosen difficulty
- `progress` - `{completed: 0, required: 2}`

**Step 2: Answer Remedial Exercise**
```http
POST /api/v1/quizzes/remedial/{remedial_id}/answer
Body: {
  "answer": "student's answer"
}
```

Response includes:
- `is_correct` - Boolean
- `explanation` - Always shown
- `progress` - `{completed: int, required: 2}`
- `next_remedial` - New question if needed
- `remediation_complete` - Boolean (true after 2 correct)

**Step 3: Track Progress**
Display progress indicator:
- "Remedial Exercises: 1/2 correct"
- Progress bar

**Step 4: Handle Completion**
When `remediation_complete: true`:
- Show success message
- Move to next wrong question
- If all done, show final completion screen

---

## Topic Quiz Flow

### Prerequisites Check

**Before starting, check eligibility:**
```http
GET /api/v1/topic-quizzes/topic/{topic_id}/existing
```

Response:
- `has_quiz` - Already generated?
- `quiz_id` - Existing quiz ID
- `has_attempt` - Already attempted?
- `attempt_completed` - Already finished?

**If no quiz exists, check eligibility:**
```http
GET /api/v1/topic-quizzes/{quiz_id}/eligibility
```

Response:
- `eligible` - Can student take it?
- `reason` - Why not (if applicable)
- `missing_chapters` - List of incomplete chapter quizzes

### Flow

```
CHECK ELIGIBILITY
    ↓
GENERATE TOPIC QUIZ (one-time, personalized)
    ↓
TAKE QUIZ (same as Chapter Quiz Phase 1)
    ↓
QUIZ COMPLETE (no remediation)
```

#### Step-by-Step Implementation

**Step 1: Generate Topic Quiz**
```http
POST /api/v1/topic-quizzes/generate
Body: {
  "topic_id": "uuid",
  "question_count": 15  // optional, default 15
}
```

Response includes:
- `quiz_id` - Use this to start the quiz
- `performance_analysis` - Student's weak areas
- `questions` - Sanitized questions
- `title` - "Final Quiz: [Topic Name]"

**Step 2: Take Quiz**
Use the same flow as Chapter Quiz Phase 1:
- Start quiz: `POST /api/v1/quizzes/{quiz_id}/start`
- Answer questions one by one
- Get summary

**Important**: Topic quizzes do NOT have remediation. After summary, quiz is complete.

---

## Practice Session Flow

### Characteristics
- **Ungraded**: No scores saved to permanent records
- **Adaptive**: Uses quiz mistakes if available
- **On-Demand**: Generate more questions anytime
- **Session-Based**: Questions stored server-side per session

### Flow

```
START PRACTICE SESSION
    ↓
CHOOSE DIFFICULTY
    ↓
GET INITIAL QUESTIONS (5 by default)
    ↓
ANSWER QUESTIONS → IMMEDIATE FEEDBACK
    ↓
GENERATE MORE (optional, one at a time)
    ↓
END SESSION (or auto-deactivates on new session)
```

#### Step-by-Step Implementation

**Step 1: Start Practice Session**
```http
POST /api/v1/practice/sessions
Body: {
  "chapter_id": "uuid",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "question_count": 5  // optional
}
```

Response includes:
- `session_id` - Store for subsequent requests
- `questions` - Array of sanitized questions
- `quiz_context_used` - Was student's quiz history used?

**Step 2: Display Questions**
Show all questions at once or one at a time (your choice).

**Step 3: Answer Question**
```http
POST /api/v1/practice/sessions/{session_id}/answer
Body: {
  "question_id": "prac-xxx",
  "answer": "student's answer"
}
```

Response includes:
- `is_correct` - Boolean
- `explanation` - Always shown
- `correct_answer` - If wrong
- `questions_completed` - Total answered
- `total_correct` - Total correct in session

**Step 4: Show Feedback**
Immediate feedback after each answer (same as quiz).

**Step 5: Generate More Questions (Optional)**
```http
POST /api/v1/practice/sessions/{session_id}/generate-more
```

Response:
- `question` - New sanitized question

**Step 6: View Session State (Optional)**
```http
GET /api/v1/practice/sessions/{session_id}
```

Returns full session data including all questions and answers.

---

## API Endpoints

### Chapter Quiz Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/quizzes/chapter/{chapter_id}` | **Get quiz by chapter ID with attempt status** |
| POST | `/api/v1/quizzes/{quiz_id}/start` | Start quiz attempt, get first question |
| GET | `/api/v1/quizzes/attempts/{attempt_id}/current-question` | Get current question |
| POST | `/api/v1/quizzes/attempts/{attempt_id}/answer-question` | Submit answer, get feedback |
| GET | `/api/v1/quizzes/attempts/{attempt_id}/summary` | Get quiz summary with wrong questions |
| POST | `/api/v1/quizzes/attempts/{attempt_id}/choose-difficulty/{question_id}` | Choose remedial difficulty |
| POST | `/api/v1/quizzes/remedial/{remedial_id}/answer` | Submit remedial answer |

### Topic Quiz Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/topic-quizzes/generate` | Generate personalized topic quiz |
| GET | `/api/v1/topic-quizzes/{quiz_id}/eligibility` | Check if student can take quiz |
| GET | `/api/v1/topic-quizzes/topic/{topic_id}/existing` | Check for existing topic quiz |

**Note**: After generation, use regular quiz endpoints to take topic quiz.

### Practice Session Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/practice/sessions` | Start new practice session |
| POST | `/api/v1/practice/sessions/{session_id}/answer` | Submit practice answer |
| POST | `/api/v1/practice/sessions/{session_id}/generate-more` | Generate one more question |
| GET | `/api/v1/practice/sessions/{session_id}` | Get full session state |

### Authentication

All endpoints require:
```
Authorization: Bearer {access_token}
```

**Role Requirements**:
- Chapter/Topic Quiz: STUDENT or ADMIN
- Practice: STUDENT or ADMIN
- Teacher endpoints: TEACHER or ADMIN

---

## Data Models

### Question Object (Student View - Sanitized)

```typescript
interface Question {
  id: string;
  type: "multiple_choice" | "fill_blank" | "short_calculation";
  question: string;
  options?: string[];  // Only for multiple_choice
  difficulty: "easy" | "medium" | "hard";
  points?: number;
}
```

### Answer Feedback Response

```typescript
interface AnswerFeedback {
  is_correct: boolean;
  explanation: string;
  correct_answer?: string;  // Only if wrong
  next_question?: Question;  // Next question or null
  all_questions_answered: boolean;
}
```

### Quiz Summary

```typescript
interface QuizSummary {
  attempt_id: string;
  score: number;
  total: number;
  percentage: number;
  wrong_questions: WrongQuestion[];
  remediation_required: boolean;
}

interface WrongQuestion {
  question_id: string;
  question_text: string;
  your_answer: string;
  correct_answer: string;
  explanation: string;
  recommended_difficulty: "easy" | "medium" | "hard";
}
```

### Remedial Exercise

```typescript
interface RemedialQuestion {
  remedial_id: string;
  question: Question;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  progress: {
    completed: number;
    required: number;  // Always 2
  };
}

interface RemedialAnswerResponse {
  is_correct: boolean;
  explanation: string;
  progress: {
    completed: number;
    required: number;
  };
  next_remedial?: {
    remedial_id: string;
    question: Question;
  };
  remediation_complete: boolean;
}
```

### Practice Session

```typescript
interface PracticeSession {
  session_id: string;
  questions: Question[];
  quiz_context_used: boolean;  // Were quiz mistakes used?
}

interface PracticeAnswerResponse {
  is_correct: boolean;
  explanation: string;
  correct_answer?: string;
  questions_completed: number;
  total_correct: number;
}
```

### Topic Quiz

```typescript
interface TopicQuizResponse {
  quiz_id: string;
  title: string;
  topic_id: string;
  student_id: string;
  question_count: number;
  performance_analysis: {
    weak_categories: Array<{
      category: string;
      count: number;
      weighted_count: number;
    }>;
    weak_chapters: Array<{
      chapter_id: string;
      title: string;
      percentage: number;
    }>;
    overall_percentage: number;
    total_questions: number;
    total_correct: number;
  };
  questions: Question[];
  created_at: string;
}
```

---

## UI/UX Guidelines

### Chapter Quiz Interface

#### Quiz Taking Phase

**1. Question Display**
```
┌─────────────────────────────────────────┐
│ Chapter Quiz: Machine Learning Basics   │
│ Question 3 of 10                        │
├─────────────────────────────────────────┤
│                                         │
│ What is supervised learning?           │
│                                         │
│ ○ Learning with labeled data           │
│ ○ Learning without labels              │
│ ○ Reinforcement learning               │
│ ○ Unsupervised clustering              │
│                                         │
│         [Submit Answer]                 │
└─────────────────────────────────────────┘
```

**2. Immediate Feedback (Correct)**
```
┌─────────────────────────────────────────┐
│ ✓ Correct!                              │
├─────────────────────────────────────────┤
│ Supervised learning uses labeled        │
│ training data where each example has    │
│ an input and the correct output.        │
│                                         │
│         [Next Question]                 │
└─────────────────────────────────────────┘
```

**3. Immediate Feedback (Incorrect)**
```
┌─────────────────────────────────────────┐
│ ✗ Incorrect                             │
├─────────────────────────────────────────┤
│ Your answer: Learning without labels    │
│ Correct answer: Learning with labeled   │
│                 data                    │
│                                         │
│ Explanation: Supervised learning uses   │
│ labeled training data where each...     │
│                                         │
│         [Next Question]                 │
└─────────────────────────────────────────┘
```

**4. Quiz Summary**
```
┌─────────────────────────────────────────┐
│ Quiz Complete!                          │
├─────────────────────────────────────────┤
│ Score: 7/10 (70%)                       │
│                                         │
│ Wrong Answers (3):                      │
│                                         │
│ 1. What is overfitting?                 │
│    Your answer: Model too simple        │
│    Correct: Model too complex           │
│    Difficulty: ●●○ MEDIUM               │
│                                         │
│ 2. Which algorithm for classification?  │
│    Your answer: Linear Regression       │
│    Correct: Logistic Regression         │
│    Difficulty: ●●● HARD                 │
│                                         │
│ 3. What is a decision tree?            │
│    Your answer: Neural network          │
│    Correct: Tree structure for decisions│
│    Difficulty: ●●○ MEDIUM               │
│                                         │
│   [Start Remediation]                   │
└─────────────────────────────────────────┘
```

#### Remediation Phase

**1. Difficulty Selection**
```
┌─────────────────────────────────────────┐
│ Remediation (1 of 3)                    │
├─────────────────────────────────────────┤
│ Question: What is overfitting?          │
│ Your answer was: Model too simple       │
│                                         │
│ Choose difficulty level:                │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ ⚡ EASY                          │    │
│ │ I need help with the basics     │    │
│ └─────────────────────────────────┘    │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ ● MEDIUM (Recommended)          │    │
│ │ Similar to the original question│    │
│ └─────────────────────────────────┘    │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ 🔥 HARD                          │    │
│ │ Challenge me with harder topics │    │
│ └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**2. Remedial Exercise**
```
┌─────────────────────────────────────────┐
│ Remedial Exercise                       │
│ Progress: 0/2 correct ●○                │
├─────────────────────────────────────────┤
│ Which scenario demonstrates overfitting?│
│                                         │
│ ○ Model performs well on training and  │
│   test data                            │
│ ○ Model performs well on training but  │
│   poorly on test data                  │
│ ○ Model performs poorly on both        │
│ ○ Model cannot learn patterns          │
│                                         │
│         [Submit Answer]                 │
└─────────────────────────────────────────┘
```

**3. Remedial Feedback (Wrong)**
```
┌─────────────────────────────────────────┐
│ ✗ Not quite right                       │
│ Progress: 0/2 correct ○○                │
├─────────────────────────────────────────┤
│ Correct answer: Model performs well on  │
│ training but poorly on test data        │
│                                         │
│ Explanation: Overfitting means the      │
│ model memorized training data but       │
│ doesn't generalize to new data.         │
│                                         │
│      [Try Another Question]             │
└─────────────────────────────────────────┘
```

**4. Remedial Feedback (Correct)**
```
┌─────────────────────────────────────────┐
│ ✓ Correct!                              │
│ Progress: 1/2 correct ●○                │
├─────────────────────────────────────────┤
│ Great! One more correct answer needed.  │
│                                         │
│         [Next Exercise]                 │
└─────────────────────────────────────────┘
```

**5. Remediation Complete**
```
┌─────────────────────────────────────────┐
│ ✓ Remediation Complete!                 │
│ Progress: 2/2 correct ●●                │
├─────────────────────────────────────────┤
│ You've mastered this concept!           │
│                                         │
│ Remaining: 2 more questions             │
│                                         │
│      [Continue to Next Question]        │
└─────────────────────────────────────────┘
```

**6. All Remediation Complete**
```
┌─────────────────────────────────────────┐
│ 🎉 Quiz Completed!                      │
├─────────────────────────────────────────┤
│ Original Score: 7/10 (70%)              │
│ All remediation exercises completed!    │
│                                         │
│ ✓ 3 concepts reinforced                 │
│ ✓ 6 additional exercises completed      │
│                                         │
│ You're ready to move on to the next     │
│ chapter!                                │
│                                         │
│   [Back to Course] [Start Practice]     │
└─────────────────────────────────────────┘
```

### Topic Quiz Interface

**1. Pre-Quiz Check**
```
┌────────────��────────────────────────────┐
│ Final Topic Quiz                        │
│ Introduction to Machine Learning        │
├─────────────────────────────────────────┤
│ Requirements:                           │
│ ✓ Supervised Learning (85%)            │
│ ✓ Neural Networks (60%)                │
│ ✓ Model Evaluation (80%)               │
│                                         │
│ This quiz is personalized based on      │
│ your performance across all chapters.   │
│                                         │
│ • 15 questions                          │
│ • No remediation                        │
│ • Final assessment                      │
│                                         │
│      [Generate My Quiz]                 │
└─────────────────────────────────────────┘
```

**2. Generating Quiz**
```
┌─────────────────────────────────────────┐
│ Generating Your Quiz...                 │
├─────────────────────────────────────────┤
│         ⏳                              │
│                                         │
│ Analyzing your performance...           │
│ Creating personalized questions...      │
│                                         │
│ (This takes 30-60 seconds)              │
└─────────────────────────────────────────┘
```

**3. Quiz Introduction**
```
┌─────────────────────────────────────────┐
│ Your Personalized Topic Quiz            │
├─────────────────────────────────────────┤
│ Based on your performance:              │
│                                         │
│ Focus Areas:                            │
│ • Neural Networks (60% weak)            │
│ • Overfitting concepts                  │
│ • Algorithm selection                   │
│                                         │
│ Strong Areas:                           │
│ • Model Evaluation (80%)                │
│ • Basic concepts                        │
│                                         │
│ Question Distribution:                  │
│ • 60% on concepts you struggled with    │
│ • 40% verification of strong areas      │
│                                         │
│         [Start Quiz]                    │
└─────────────────────────────────────────┘
```

**4. Quiz Complete (No Remediation)**
```
┌─────────────────────────────────────────┐
│ Topic Quiz Complete!                    │
├─────────────────────────────────────────┤
│ Score: 12/15 (80%)                      │
│                                         │
│ Performance by Chapter:                 │
│ • Supervised Learning: 4/5 ✓            │
│ • Neural Networks: 3/5 ⚠                │
│ • Model Evaluation: 5/5 ✓✓              │
│                                         │
│ Recommendation:                         │
│ Consider practicing Neural Networks     │
│ topics for better understanding.        │
│                                         │
│   [View Details] [Start Practice]       │
└─────────────────────────────────────────┘
```

### Practice Session Interface

**1. Start Practice**
```
┌─────────────────────────────────────────┐
│ Practice Mode                           │
│ Chapter: Neural Networks                │
├─────────────────────────────────────────┤
│ Choose difficulty:                      │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ ⚡ EASY                          │    │
│ │ Build confidence with basics    │    │
│ └─────────────────────────────────┘    │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ ● MEDIUM                        │    │
│ │ Standard difficulty level       │    │
│ └─────────────────────────────────┘    │
│                                         │
│ ┌─────────────────────────────────┐    │
│ │ 🔥 HARD                          │    │
│ │ Challenge yourself              │    │
│ └─────────────────────────────────┘    │
│                                         │
│ ℹ We found quiz mistakes to practice!  │
│                                         │
│         [Start Practice]                │
└─────────────────────────────────────────┘
```

**2. Practice Questions**
```
┌─────────────────────────────────────────┐
│ Practice Session (MEDIUM)               │
│ Progress: 3/5 answered | 2 correct ⭐⭐  │
├─────────────────────────────────────────┤
│ Question 4                              │
│                                         │
│ What is backpropagation used for?       │
│                                         │
│ ○ Forward pass calculation             │
│ ○ Calculating gradients for training   │
│ ○ Data preprocessing                   │
│ ○ Model evaluation                     │
│                                         │
│         [Submit Answer]                 │
│                                         │
│ [Generate More Questions]               │
└─────────────────────────────────────────┘
```

**3. Practice Feedback**
```
┌─────────────────────────────────────────┐
│ ✓ Correct!                              │
├─────────────────────────────────────────┤
│ Backpropagation is the algorithm used   │
│ to calculate gradients for updating     │
│ weights in neural networks.             │
│                                         │
│ Session Stats: 3 correct, 1 wrong       │
│                                         │
│         [Continue]                      │
└─────────────────────────────────────────┘
```

**4. Generate More**
```
┌─────────────────────────────────────────┐
│ Practice Session                        │
│ Progress: 5/5 complete | 4 correct ⭐⭐⭐⭐│
├─────────────────────────────────────────┤
│ Great progress!                         │
│                                         │
│ Want to practice more?                  │
│                                         │
│   [Generate 1 More Question]            │
│   [End Session]                         │
└─────────────────────────────────────────┘
```

### Visual Design Guidelines

**Colors**
- ✓ Correct: Green (#10B981)
- ✗ Incorrect: Red (#EF4444)
- Warning/Info: Yellow/Amber (#F59E0B)
- Primary Action: Blue (#3B82F6)

**Icons**
- ✓ Checkmark for correct
- ✗ X mark for incorrect
- ⚡ Lightning for easy
- ● Circle for medium
- 🔥 Fire for hard
- ⭐ Star for correct answers
- ⏳ Hourglass for loading
- ℹ Info icon for context hints

**Progress Indicators**
- Use progress bars for remediation (●●○ style)
- Show "Question X of Y" for quizzes
- Display stats in practice mode

**Difficulty Badges**
```
EASY:   ⚡●○○
MEDIUM: ●●○
HARD:   ●●●
```

---

## Error Handling

### Common Errors

**1. Quiz Not Found (404)**
```json
{
  "detail": "Quiz not found"
}
```
Action: Redirect to course page with error message.

**2. Already Completed (400)**
```json
{
  "detail": "Quiz already completed"
}
```
Action: Show completion screen with option to view results.

**3. Not Eligible for Topic Quiz (400)**
```json
{
  "detail": "You must complete the quiz for chapter 'Neural Networks' before taking the topic quiz."
}
```
Action: Show missing requirements with links to incomplete chapters.

**4. Session Expired (404)**
```json
{
  "detail": "Session not found or inactive"
}
```
Action: Restart practice session.

**5. Authentication Error (401)**
```json
{
  "detail": "Not authenticated"
}
```
Action: Redirect to login.

**6. Permission Denied (403)**
```json
{
  "detail": "Only students can attempt quizzes"
}
```
Action: Show permission error.

### Error Recovery

**Network Errors**
- Save answers locally before submitting
- Retry failed requests automatically (max 3 attempts)
- Show "Reconnecting..." indicator

**State Management**
- Store `attempt_id` and `session_id` in localStorage
- Resume quiz if page is refreshed
- Clear state only after completion

---

## State Management Recommendations

### Quiz State

```typescript
interface QuizState {
  quizId: string;
  attemptId: string;
  status: "not_started" | "in_progress" | "submitted" | "completed";
  currentIndex: number;
  totalQuestions: number;
  currentQuestion: Question | null;
  answers: Record<string, string>;  // questionId -> answer
  summary: QuizSummary | null;
}
```

### Remediation State

```typescript
interface RemediationState {
  wrongQuestions: WrongQuestion[];
  currentIndex: number;  // Which wrong question
  currentRemedialId: string | null;
  progress: Record<string, {completed: number, required: number}>;
  allComplete: boolean;
}
```

### Practice State

```typescript
interface PracticeState {
  sessionId: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  questions: Question[];
  answers: Record<string, {answer: string, isCorrect: boolean}>;
  questionsCompleted: number;
  totalCorrect: number;
  quizContextUsed: boolean;
}
```

---

## Testing Checklist

### Chapter Quiz
- [ ] Start quiz successfully
- [ ] Answer questions one by one
- [ ] See immediate feedback (correct/incorrect)
- [ ] Navigate through all questions
- [ ] View quiz summary
- [ ] Choose remedial difficulty
- [ ] Complete 2 remedial exercises
- [ ] Handle wrong remedial answers (generate new)
- [ ] Complete all remediation
- [ ] View final completion screen

### Topic Quiz
- [ ] Check eligibility
- [ ] Generate topic quiz
- [ ] View performance analysis
- [ ] Take quiz (same flow as chapter)
- [ ] Complete quiz (no remediation)

### Practice Session
- [ ] Start session with difficulty
- [ ] Answer practice questions
- [ ] See immediate feedback
- [ ] Generate more questions
- [ ] End session
- [ ] Context hints show when quiz mistakes used

### Edge Cases
- [ ] Resume interrupted quiz (page refresh)
- [ ] Handle network errors gracefully
- [ ] Prevent double submissions
- [ ] Handle empty/invalid answers
- [ ] Session timeout handling
- [ ] Multiple browser tabs (use latest state)

---

## Performance Considerations

**1. Question Loading**
- Questions loaded one at a time (no need to prefetch all)
- Cache current question in memory

**2. API Calls**
- Debounce rapid submissions
- Use loading states during API calls
- Implement request cancellation on navigation

**3. State Persistence**
- Save critical state (attempt_id) to localStorage
- Clear old session data on completion

**4. Image/Media**
- Lazy load images in question text
- Optimize images to < 100KB

---

## Analytics & Tracking (Optional)

Track these events for insights:
- Quiz started
- Question answered (correct/incorrect)
- Quiz completed
- Remediation started
- Remediation completed
- Practice session started
- Practice questions generated
- Topic quiz generated

---

## Future Enhancements (Not Required Now)

- Timer per question (optional)
- Hints system (unlock after 1 wrong attempt)
- Peer comparison (anonymous)
- Question flagging for review
- Saved sessions (pause/resume later)
- Offline mode support
- Voice input for answers

---

## Support & Questions

For technical questions about the API:
- Check the full API documentation: `/docs/QUIZ_AND_BLOG_SERVICES.md`
- Test endpoints with Swagger UI: `http://localhost:8000/docs`

For implementation questions:
- Contact backend team
- Review test files in `tests/api/` for example flows

---

## Appendix: Full API Reference

### Base URL
```
Production: https://api.aula.com/api/v1
Development: http://localhost:8000/api/v1
```

### Authentication Header
```
Authorization: Bearer {access_token}
```

### Content Type
```
Content-Type: application/json
```

### Rate Limits
- Quiz generation: 5 per minute per user
- Answer submission: 60 per minute per user
- Practice questions: 20 per minute per user

---

*Document Version: 1.0*
*Last Updated: 2025-12-16*
*API Version: v1*