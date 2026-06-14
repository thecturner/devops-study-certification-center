// ─── Certification types ──────────────────────────────────────────────────────

export type CertificationId =
  | "datadog-fundamentals"
  | "servicenow-csa"
  | "servicenow-cis-itsm"
  | "servicenow-cad"
  | "k8s-cka"
  | "k8s-ckad"
  | "k8s-cks"
  | "aws-saa"
  | "aws-sap"
  | "aws-dop"
  | "gcp-ace"
  | "gcp-pca"
  | "gcp-pde"
  | "azure-az900"
  | "azure-az104"
  | "azure-az305"
  | "itil4-foundation"
  | "itil4-mp"
  | "itil4-sl"
  | "ccaf";

export interface Certification {
  id: CertificationId;
  name: string;
  vendor: "datadog" | "servicenow" | "kubernetes" | "aws" | "gcp" | "azure" | "itil" | "anthropic";
  description: string;
  color: string;
}

// ─── Question types ──────────────────────────────────────────────────────────

export type QuestionType = "single_choice" | "multi_choice" | "true_false";
export type Difficulty = "easy" | "medium" | "hard";

export interface Choice {
  id: string;
  text: string;
}

export interface Ref {
  label: string;
  url?: string;
}

/** Full question as stored in the question bank (includes correct answers). */
export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  choices: Choice[];
  /** single_choice / true_false → string; multi_choice → string[] */
  correct: string | string[];
  explanation: string;
  topics: string[];
  difficulty: Difficulty;
  refs?: Ref[];
  version: number;
}

/** Question sent to the client, correct answers stripped. */
export interface ClientQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  choices: Choice[];
  topics: string[];
  difficulty: Difficulty;
}

// ─── Quiz config ─────────────────────────────────────────────────────────────

export interface QuizConfig {
  certificationId: CertificationId;
  count: number;
  topics: string[]; // empty = all topics
  difficulty: Difficulty | "all";
  types: QuestionType[]; // empty = all types
  timer?: number; // seconds per quiz, 0 = no timer
  balanced: boolean; // balance questions across topics
  learningMode: boolean;
}

// ─── Session state ────────────────────────────────────────────────────────────

/** Answers: questionId → choiceId (single) or choiceId[] (multi) */
export type AnswerMap = Record<string, string | string[]>;

export interface QuizSession {
  sessionId: string | null;
  config: QuizConfig | null;
  questions: ClientQuestion[];
  answers: AnswerMap;
  checkedQuestionIds: string[];
  learningFeedback: Record<string, QuestionResult>;
  flagged: string[]; // question IDs flagged for review
  currentIndex: number;
  startedAt: number | null; // epoch ms
  submittedAt?: number | null;
  results?: QuizResults | null;
}

// ─── Grading ─────────────────────────────────────────────────────────────────

export interface QuestionResult {
  questionId: string;
  correct: boolean;
  userAnswer: string | string[] | null;
  correctAnswer: string | string[];
  explanation: string;
  shortExplanation: string;
  longExplanation: string;
  preparationNote: string;
  studyPointers: StudyPointer[];
  topics: string[];
  difficulty: Difficulty;
  prompt: string;
  choices: Choice[];
}

export interface TopicScore {
  topicId: string;
  label: string;
  attempted: number;
  correct: number;
  pct: number;
}

export interface DifficultyScore {
  difficulty: Difficulty;
  attempted: number;
  correct: number;
  pct: number;
}

export interface QuizResults {
  totalQuestions: number;
  totalCorrect: number;
  pct: number;
  passed: boolean; // >= 70%
  byTopic: TopicScore[];
  byDifficulty: DifficultyScore[];
  questionResults: QuestionResult[];
  studyGuide: StudyGuide;
}

// ─── Study guide ─────────────────────────────────────────────────────────────

export interface StudyPointer {
  label: string;
  url?: string;
}

export interface StudyScenario {
  title: string;
  prompt: string;
  focus: string;
}

export interface WeakTopic {
  topicId: string;
  label: string;
  pct: number;
  attempted: number;
  correct: number;
  studyPointers: StudyPointer[];
  examScenarios: StudyScenario[];
  missedQuestionIds: string[];
}

export interface StudyGuide {
  weakTopics: WeakTopic[]; // up to 5, sorted worst first
  nextSteps: string[];
}

// ─── Taxonomy ─────────────────────────────────────────────────────────────────

export interface TaxonomyTopic {
  id: string;
  label: string;
  description: string;
  studyPointers: StudyPointer[];
  examScenarios?: StudyScenario[];
  subtopics?: string[];
}

export interface Taxonomy {
  topics: TaxonomyTopic[];
}
