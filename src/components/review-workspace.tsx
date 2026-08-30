"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getPage, getSession, saveSession } from "@/client/db/session-db";
import type { Question, Session } from "@/client/types";

const fallbackPage = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='900' height='1200' viewBox='0 0 900 1200'%3E%3Crect width='900' height='1200' fill='%23fffdf8'/%3E%3Cpath d='M78 82H822M78 112H590M78 205H730M78 235H815M78 265H620M78 395H795M78 425H610M78 455H770M78 605H805M78 635H690M78 665H780M78 820H800M78 850H625' stroke='%237a746d' stroke-width='4' stroke-linecap='round' opacity='.6'/%3E%3Ctext x='78' y='58' font-family='cursive' font-size='32' fill='%233a3632'%3EHandwritten answer sheet%3C/text%3E%3Ctext x='78' y='175' font-family='cursive' font-size='26' fill='%233a3632'%3EQ1. Photosynthesis uses sunlight...%3C/text%3E%3Ctext x='78' y='365' font-family='cursive' font-size='26' fill='%233a3632'%3EQ2(a). Plant cells have a cell wall...%3C/text%3E%3Ctext x='78' y='575' font-family='cursive' font-size='26' fill='%233a3632'%3EQ3. Chlorophyll absorbs light energy...%3C/text%3E%3C/svg%3E";

export function ReviewWorkspace({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [selectedId, setSelectedId] = useState("q1");
  const [expanded, setExpanded] = useState<string | null>("q1");
  const [zoom, setZoom] = useState(100);
  const [tab, setTab] = useState<"questions" | "answers">("questions");
  const [pageUrl, setPageUrl] = useState<string | null>(null);

  useEffect(() => { void getSession(sessionId).then((saved) => { if (saved) setSession(saved); }); }, [sessionId]);
  useEffect(() => {
    const pageId = session?.answerSheetPageIds[0];
    if (!pageId) return;
    let url: string | undefined;
    void getPage(pageId).then((page) => { if (page) { url = URL.createObjectURL(page.blob); setPageUrl(url); } });
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [session]);
  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if (!session) return;
      const index = session.questions.findIndex((question) => question.id === selectedId);
      if (event.key === "ArrowDown" || event.key === "ArrowUp") { event.preventDefault(); const next = Math.max(0, Math.min(session.questions.length - 1, index + (event.key === "ArrowDown" ? 1 : -1))); setSelectedId(session.questions[next].id); }
      if (event.key === "Enter") setExpanded(selectedId);
      if (event.key === "+") setZoom((value) => Math.min(300, value + 25));
      if (event.key === "-") setZoom((value) => Math.max(50, value - 25));
    };
    addEventListener("keydown", keydown); return () => removeEventListener("keydown", keydown);
  }, [selectedId, session]);

  const selected = session?.questions.find((question) => question.id === selectedId);
  const mapping = session?.mappings.find((item) => item.questionId === selectedId);
  const selectedBlock = session?.answerBlocks.find((item) => item.id === mapping?.answerBlockId);
  const selectedRegion = selectedBlock?.regions[0];
  const grade = session?.grades.find((item) => item.questionId === selectedId);
  const total = useMemo(() => session?.grades.reduce((sum, item) => sum + item.awarded, 0) ?? 0, [session]);

  const select = (question: Question) => { setSelectedId(question.id); setExpanded(question.id); setTab("answers"); };
  const updateMark = async (delta: number) => {
    if (!session || !grade) return;
    const grades = session.grades.map((item) => item.questionId === grade.questionId ? { ...item, awarded: Math.max(0, Math.min(item.max, item.awarded + delta)), edited: true } : item);
    const next = { ...session, grades, updatedAt: Date.now() };
    setSession(next); await saveSession(next);
  };

  if (!session) return <main className="loading-page"><div className="spark">✦</div><h1>Loading exam…</h1><button onClick={() => router.push("/")}>Return to upload</button></main>;

  return <main className="app-shell">
    <aside className="sidebar"><a className="brand" href="/">Veda<span>AI</span></a><span className="toolkit-pill">✦ AI Teacher&apos;s Toolkit</span><nav><a>⌂ Home</a><a>▦ My Classes</a><a>▤ Assignments</a><a className="active">◈ Exams</a><a>▱ My Library</a><a>⚙ Settings</a></nav><div className="school-card"><span>DV</span><div><strong>Delhi Public School</strong><small>Teacher workspace</small></div></div></aside>
    <section className="main-area">
      <header className="topbar"><button className="back" onClick={() => router.push("/")}>← Exams</button><span className="exam-tag">Grade {session.examContext?.grade ?? "–"} · {session.examContext?.subject ?? "subject"} · {session.examContext?.paperLanguage ?? "language"}</span><div className="top-actions"><span className="retention">◷ Saved on this device · clears in 24h</span><button aria-label="Help">?</button><button aria-label="Notifications">♧</button><span className="avatar">M</span><strong>Madhur⌄</strong></div></header>
      <div className="mobile-tabs"><button className={tab === "questions" ? "active" : ""} onClick={() => setTab("questions")}>Questions</button><button className={tab === "answers" ? "active" : ""} onClick={() => setTab("answers")}>Answer sheet</button></div>
      <div className="review-grid">
        <section className={`questions-panel ${tab === "questions" ? "mobile-active" : ""}`}>
          <div className="panel-title"><div><h1>Extracted Questions</h1><p>From question paper</p></div><button onClick={() => setExpanded(expanded ? null : "all")}>{expanded ? "Collapse all" : "Expand all"}</button></div>
          <div className="question-list" role="listbox" aria-label="Extracted questions">{session.questions.map((question, index) => {
            const questionGrade = session.grades.find((item) => item.questionId === question.id)!;
            const questionMapping = session.mappings.find((item) => item.questionId === question.id)!;
            const flag = session.flags.find((item) => item.relatedQuestionIds.includes(question.id) && !item.dismissed);
            const isExpanded = expanded === "all" || expanded === question.id;
            return <article key={question.id} className={`question-row ${selectedId === question.id ? "selected" : ""}`}><button className="question-button" onClick={() => select(question)}><span className="question-index">{index + 1}</span><span className="question-copy"><span>{question.label}. {question.text}</span>{questionMapping.confidence > 0 && questionMapping.confidence < .62 && <small>Low confidence mapping</small>}</span>{questionGrade.verdict === "unanswered" ? <span className="chip danger">Unanswered</span> : <span className="chip success">{questionGrade.awarded}/{questionGrade.max}</span>}<span className="chevron">⌄</span></button>{isExpanded && <div className="feedback"><div className="feedback-heading"><strong>AI Feedback</strong>{flag && <span className="chip warning">Review</span>}</div>{flag && <p className="flag-copy">{flag.detail}</p>}<p>{questionGrade.feedback}</p><div className="edit-mark"><span>Mark</span><button onClick={() => updateMark(-.5)} aria-label="Decrease mark">−</button><strong>{questionGrade.awarded}/{questionGrade.max}</strong><button onClick={() => updateMark(.5)} aria-label="Increase mark">+</button><button className="text-action">Re-link answer</button></div></div>}</article>;
          })}</div>
          <div className="orphan"><strong>Unmatched answers</strong><span>No orphan answers found.</span></div>
        </section>
        <section className={`viewer-panel ${tab === "answers" ? "mobile-active" : ""}`}>
          <header className="viewer-header"><div><h2>Answer Sheet</h2><span>{session.answerSheetFileName}</span></div><div className="viewer-controls"><button onClick={() => setZoom((value) => Math.max(50, value - 25))}>−</button><span>{zoom}%</span><button onClick={() => setZoom((value) => Math.min(300, value + 25))}>+</button><i></i><button>‹</button><span>Page 1 of {Math.max(1, session.answerSheetPageIds.length)}</span><button>›</button></div></header>
          <div className="sheet-scroll"><div className="sheet" style={{ width: `${zoom}%` }}><img src={pageUrl ?? fallbackPage} alt="Answer sheet page 1" />{selectedRegion && <button className={`answer-highlight ${mapping && mapping.confidence < .62 ? "low" : ""}`} style={{ left: `${selectedRegion.bbox.x * 100}%`, top: `${selectedRegion.bbox.y * 100}%`, width: `${selectedRegion.bbox.w * 100}%`, height: `${selectedRegion.bbox.h * 100}%` }} onClick={() => setTab("questions")}><span>Q{selected?.label}</span></button>}{!selectedRegion && <div className="unanswered-note">No answer region was mapped to Q{selected?.label}.</div>}</div></div>
          <footer className="summary"><div><span>Total marks</span><strong>{total} / {session.grades.reduce((sum, item) => sum + item.max, 0)}</strong></div><div><span>Attempted</span><strong>{session.grades.filter((item) => item.verdict !== "unanswered").length} of {session.questions.length}</strong></div><button>View summary →</button></footer>
        </section>
      </div>
    </section>
  </main>;
}
