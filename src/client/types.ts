export type Id = string;
export type Subject = "physics" | "chemistry" | "biology" | "mathematics" | "hindi";
export type PaperLanguage = "english" | "hindi" | "bilingual";
export type Board = "cbse" | "icse" | "state_board" | "other";

export type ExamContext = {
  grade: number;
  subject: Subject;
  board: Board;
  paperLanguage: PaperLanguage;
};

export type BBox = { x: number; y: number; w: number; h: number };
export type Region = { page: number; bbox: BBox };

export type Question = {
  id: Id;
  label: string;
  order: number;
  text: string;
  maxMarks: number | null;
  source: { page: number; bbox: BBox };
  ocrConfidence: number;
};

export type AnswerBlock = {
  id: Id;
  declaredLabel: string | null;
  text: string;
  regions: Region[];
  startPage: number;
  endPage: number;
};

export type Mapping = {
  questionId: Id | null;
  answerBlockId: Id | null;
  method: "label" | "semantic" | "positional" | "manual";
  confidence: number;
  rationale: string;
};

export type Grade = {
  questionId: Id;
  awarded: number;
  max: number;
  verdict: "correct" | "partial" | "incorrect" | "unanswered" | "not_counted";
  feedback: string;
  edited: boolean;
};

export type Flag = {
  id: Id;
  code: string;
  severity: "info" | "review" | "high";
  title: string;
  detail: string;
  evidence: Region[];
  relatedQuestionIds: Id[];
  dismissed: boolean;
};

export type PipelineStage = "uploaded" | "extracting_questions" | "extracting_answers" | "mapping" | "grading" | "integrity" | "ready" | "degraded";

export type Session = {
  id: Id;
  title: string;
  examContext: ExamContext;
  questionPaperFileName: string;
  answerSheetFileName: string;
  questions: Question[];
  answerBlocks: AnswerBlock[];
  mappings: Mapping[];
  grades: Grade[];
  flags: Flag[];
  answerSheetPageIds: Id[];
  stage: PipelineStage;
  createdAt: number;
  updatedAt: number;
  expiresAt: number;
};

export type PageImage = {
  id: Id;
  sessionId: Id;
  kind: "question_paper" | "answer_sheet";
  index: number;
  blob: Blob;
  sha256: string;
};
