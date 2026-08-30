"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { demoSession } from "@/client/pipeline/demo-session";
import { purgeExpiredSessions, recentSessions, savePage, saveSession } from "@/client/db/session-db";
import type { Board, ExamContext, PaperLanguage, Session, Subject } from "@/client/types";

type Kind = "question" | "answer";
const allowed = ["application/pdf", "image/png", "image/jpeg", "image/webp"];

function formatBytes(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(bytes < 1024 * 1024 ? 1 : 2)} MB`;
}

function FileDrop({ kind, file, onSelect, onClear }: { kind: Kind; file: File | null; onSelect: (file: File) => void; onClear: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const title = kind === "question" ? "Question paper" : "Student answer sheet";
  const helper = kind === "question" ? "Upload the paper students answered" : "Upload one handwritten answer sheet";
  const choose = (candidate?: File) => {
    if (candidate) onSelect(candidate);
  };
  return <section className="upload-card">
    <div className="file-label"><span className="file-icon">{kind === "question" ? "?" : "✎"}</span><div><h2>{title}</h2><p>{helper}</p></div></div>
    {file ? <div className="file-chip"><span className="file-extension">{file.name.split(".").pop()?.toUpperCase()}</span><div><strong>{file.name}</strong><small>{formatBytes(file.size)} · ready to process</small></div><button type="button" onClick={onClear} aria-label={`Remove ${title}`}>×</button></div> : <button className="dropzone" type="button" onClick={() => input.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); choose(event.dataTransfer.files[0]); }}><span>Drop a PDF or image here</span><small>or choose a file · maximum 10 MB</small></button>}
    <input ref={input} className="sr-only" type="file" accept=".pdf,image/png,image/jpeg,image/webp,application/pdf" onChange={(event) => choose(event.target.files?.[0])} />
  </section>;
}

export function UploadWorkspace() {
  const router = useRouter();
  const [question, setQuestion] = useState<File | null>(null);
  const [answer, setAnswer] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<Session[]>([]);
  const [examContext, setExamContext] = useState<ExamContext>({ grade: 10, subject: "biology", board: "cbse", paperLanguage: "english" });
  const ready = Boolean(question && answer && examContext.grade && examContext.subject && examContext.board && examContext.paperLanguage);

  useEffect(() => {
    void (async () => { await purgeExpiredSessions(); setRecent(await recentSessions()); })();
  }, []);

  const choose = (kind: Kind, file: File) => {
    if (!allowed.includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Use a PDF, PNG, JPEG, or WebP file smaller than 10 MB.");
      return;
    }
    setError("");
    kind === "question" ? setQuestion(file) : setAnswer(file);
  };

  const start = async () => {
    if (!question || !answer) return;
    const id = crypto.randomUUID();
    const pageId = `${id}:answer_sheet:0`;
    if (answer.type.startsWith("image/")) await savePage({ id: pageId, sessionId: id, kind: "answer_sheet", index: 0, blob: answer, sha256: "pending-rasterize" });
    const session = demoSession(id, question.name, answer.name, answer.type.startsWith("image/") ? [pageId] : [], examContext);
    await saveSession(session);
    router.push(`/review/${id}`);
  };

  return <main className="upload-page">
    <header className="upload-header"><a className="brand" href="/">Veda<span>AI</span></a><span className="toolkit-pill">✦ AI Teacher&apos;s Toolkit</span><span className="retention">◷ Saved on this device · clears in 24h</span></header>
    <div className="upload-content">
      <p className="eyebrow">EXAMS / ANSWER SHEET MAPPER</p>
      <h1>Map answers to every question.</h1>
      <p className="intro">Upload a question paper and one handwritten answer sheet. VedaAI locates answers, keeps the evidence attached, and leaves every decision with you.</p>
      <section className="exam-context" aria-labelledby="exam-context-title"><div><h2 id="exam-context-title">Exam details</h2><p>This guides notation, language handling, and subject-aware grading.</p></div><div className="context-fields"><label>Grade<select value={examContext.grade} onChange={(event) => setExamContext((current) => ({ ...current, grade: Number(event.target.value) }))}>{Array.from({ length: 12 }, (_, index) => index + 1).map((grade) => <option key={grade} value={grade}>Grade {grade}</option>)}</select></label><label>Subject<select value={examContext.subject} onChange={(event) => setExamContext((current) => ({ ...current, subject: event.target.value as Subject }))}><option value="physics">Physics</option><option value="chemistry">Chemistry</option><option value="biology">Biology</option><option value="mathematics">Mathematics</option><option value="hindi">Hindi</option></select></label><label>Board<select value={examContext.board} onChange={(event) => setExamContext((current) => ({ ...current, board: event.target.value as Board }))}><option value="cbse">CBSE</option><option value="icse">ICSE</option><option value="state_board">State board</option><option value="other">Other</option></select></label><label>Paper language<select value={examContext.paperLanguage} onChange={(event) => setExamContext((current) => ({ ...current, paperLanguage: event.target.value as PaperLanguage }))}><option value="english">English</option><option value="hindi">Hindi (हिंदी)</option><option value="bilingual">Hindi + English</option></select></label></div></section>
      <div className="upload-grid"><FileDrop kind="question" file={question} onSelect={(file) => choose("question", file)} onClear={() => setQuestion(null)} /><FileDrop kind="answer" file={answer} onSelect={(file) => choose("answer", file)} onClear={() => setAnswer(null)} /></div>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="primary-cta" disabled={!ready} onClick={start}>Start mapping <span>→</span></button>
      <p className="cta-helper">{ready ? "Your files will be processed when you start." : "Once both files are uploaded, you’ll be able to map answers with questions."}</p>
      <aside className="privacy-notice"><strong>Before you continue</strong><span>Pages are sent to a third-party model provider for processing, and this exam is saved on this device until it is cleared or expires.</span></aside>
      {recent.length > 0 && <section className="recent"><div className="section-heading"><h2>Recent exams</h2><span>Saved on this device</span></div><div className="recent-list">{recent.map((session) => <button key={session.id} onClick={() => router.push(`/review/${session.id}`)}><strong>{session.title}</strong><span>{session.examContext ? `Grade ${session.examContext.grade} · ${session.examContext.subject}` : "Saved exam"}</span><small>{session.stage === "ready" ? "Ready to review" : "Resuming"} · {new Date(session.updatedAt).toLocaleString()}</small></button>)}</div></section>}
    </div>
  </main>;
}
