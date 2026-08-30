import type { ExamContext, Session } from "@/client/types";

const subjectSamples: Record<ExamContext["subject"], { questions: [string, string, string, string]; answers: [string, string, string]; feedback: [string, string, string] }> = {
  physics: {
    questions: ["State Newton's second law and calculate the force on a 2 kg body accelerating at 3 m/s².", "Differentiate between speed and velocity.", "Draw a ray diagram for a convex lens.", "Why is the SI unit written with a unit symbol?"],
    answers: ["Newton's second law says F = ma. F = 2 kg × 3 m/s² = 6 N.", "Speed is distance per time and is scalar. Velocity is displacement per time and has direction.", "The SI unit gives a standard way to communicate a measured quantity."],
    feedback: ["You stated the law and used the correct formula, unit, and calculation.", "You identified both the quantity and direction distinction clearly.", "You explained the value of standard units. Add that the symbol avoids language ambiguity."],
  },
  chemistry: {
    questions: ["Balance the equation: H₂ + O₂ → H₂O.", "State two differences between an element and a compound.", "Draw and label a basic atom diagram.", "Why is a chemical equation balanced?"],
    answers: ["2H₂ + O₂ → 2H₂O. There are four hydrogen atoms and two oxygen atoms on both sides.", "An element has one kind of atom. A compound has atoms of two or more elements chemically combined.", "An equation is balanced to follow conservation of mass."],
    feedback: ["You balanced the equation correctly and explained the atom count.", "You gave two accurate differences using scientific language.", "You correctly named conservation of mass. Include that atoms are not created or destroyed."],
  },
  biology: {
    questions: ["Explain the process of photosynthesis and name the organelle where it occurs.", "State two differences between plant and animal cells.", "Draw and label a simple plant cell diagram.", "Why is chlorophyll important for plants?"],
    answers: ["Photosynthesis is how green plants make food using sunlight, carbon dioxide and water. It happens in chloroplasts.", "Plant cells have a cell wall and chloroplasts. Animal cells do not have either.", "Chlorophyll absorbs light energy for photosynthesis."],
    feedback: ["You explained the inputs and named chloroplasts correctly.", "You gave two clear and accurate differences.", "You identified light absorption. Add that this energy is used to make food."],
  },
  mathematics: {
    questions: ["Solve 3x + 5 = 20, showing each step.", "Find the area of a triangle with base 8 cm and height 5 cm.", "Construct and label a right-angled triangle.", "Why should units be written in an answer?"],
    answers: ["3x + 5 = 20; 3x = 15; x = 5.", "Area = ½ × 8 cm × 5 cm = 20 cm².", "Units show what measurement the numerical answer represents."],
    feedback: ["Your algebraic steps are complete and the final value is correct.", "You used the correct formula and included square centimetres.", "You explained why a number alone is incomplete. Name the unit alongside the value."],
  },
  hindi: {
    questions: ["'परिश्रम का महत्व' विषय पर संक्षिप्त अनुच्छेद लिखिए।", "संज्ञा और सर्वनाम में दो अंतर लिखिए।", "दिए गए चित्र का वर्णन कीजिए।", "वाक्य में विराम-चिह्नों का महत्व बताइए।"],
    answers: ["परिश्रम से व्यक्ति अपने लक्ष्य को प्राप्त करता है। लगातार मेहनत करने से आत्मविश्वास बढ़ता है।", "संज्ञा किसी व्यक्ति, वस्तु या स्थान का नाम है। सर्वनाम संज्ञा के स्थान पर आता है।", "विराम-चिह्न वाक्य का सही अर्थ और ठहराव बताते हैं।"],
    feedback: ["आपने विषय पर स्पष्ट और प्रासंगिक विचार लिखे हैं।", "आपने दोनों व्याकरणिक अवधारणाओं का सही अंतर बताया है।", "आपने अर्थ और ठहराव दोनों का उल्लेख किया है। एक उदाहरण भी जोड़ें।"],
  },
};

export const demoSession = (id: string, questionPaperFileName: string, answerSheetFileName: string, answerSheetPageIds: string[], examContext: ExamContext): Session => {
  const now = Date.now();
  const sample = subjectSamples[examContext.subject];
  return {
    id,
    title: answerSheetFileName.replace(/\.[^.]+$/, "") || "Untitled answer sheet",
    examContext,
    questionPaperFileName,
    answerSheetFileName,
    answerSheetPageIds,
    stage: "ready",
    createdAt: now,
    updatedAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000,
    questions: [
      { id: "q1", label: "1", order: 0, text: sample.questions[0], maxMarks: 3, source: { page: 0, bbox: { x: .1, y: .12, w: .7, h: .12 } }, ocrConfidence: .96 },
      { id: "q2", label: "2 (a)", order: 1, text: sample.questions[1], maxMarks: 2, source: { page: 0, bbox: { x: .1, y: .28, w: .7, h: .1 } }, ocrConfidence: .94 },
      { id: "q3", label: "2 (b)", order: 2, text: sample.questions[2], maxMarks: 2, source: { page: 0, bbox: { x: .1, y: .42, w: .7, h: .1 } }, ocrConfidence: .9 },
      { id: "q4", label: "3", order: 3, text: sample.questions[3], maxMarks: 2, source: { page: 0, bbox: { x: .1, y: .57, w: .7, h: .1 } }, ocrConfidence: .92 },
    ],
    answerBlocks: [
      { id: "a1", declaredLabel: "Q1", text: sample.answers[0], startPage: 0, endPage: 0, regions: [{ page: 0, bbox: { x: .12, y: .17, w: .74, h: .18 } }] },
      { id: "a2", declaredLabel: "2(a)", text: sample.answers[1], startPage: 0, endPage: 0, regions: [{ page: 0, bbox: { x: .12, y: .43, w: .74, h: .13 } }] },
      { id: "a3", declaredLabel: "3", text: sample.answers[2], startPage: 0, endPage: 0, regions: [{ page: 0, bbox: { x: .12, y: .66, w: .74, h: .11 } }] },
    ],
    mappings: [
      { questionId: "q1", answerBlockId: "a1", method: "label", confidence: .97, rationale: "Declared label Q1 matches question 1." },
      { questionId: "q2", answerBlockId: "a2", method: "label", confidence: .95, rationale: "Declared label 2(a) matches question 2(a)." },
      { questionId: "q3", answerBlockId: null, method: "positional", confidence: 0, rationale: "No matching answer block was found." },
      { questionId: "q4", answerBlockId: "a3", method: "label", confidence: .91, rationale: "Declared label 3 matches question 3." },
    ],
    grades: [
      { questionId: "q1", awarded: 3, max: 3, verdict: "correct", feedback: sample.feedback[0], edited: false },
      { questionId: "q2", awarded: 2, max: 2, verdict: "correct", feedback: sample.feedback[1], edited: false },
      { questionId: "q3", awarded: 0, max: 2, verdict: "unanswered", feedback: "No answer was mapped to this question.", edited: false },
      { questionId: "q4", awarded: 1.5, max: 2, verdict: "partial", feedback: sample.feedback[2], edited: false },
    ],
    flags: [{ id: "f1", code: "CHOICE_UNDER_ATTEMPT", severity: "info", title: "One question is unanswered", detail: "Question 2 (b) has no mapped answer region.", evidence: [{ page: 0, bbox: { x: .1, y: .42, w: .7, h: .1 } }], relatedQuestionIds: ["q3"], dismissed: false }],
  };
};
