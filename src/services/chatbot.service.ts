import prisma from '@/lib/prisma';
import { callNvidiaAI } from '@/lib/nvidia';
import { addMessageToConversation, createConversation } from './conversation.service';
import { getOrGeneratePaperSolution } from './paper-solution.service';

export interface ChatbotRequest {
  message: string;
  userId?: string | null;
  conversationId?: string | null;
  subjectCode?: string | null;
  paperId?: string | null;
  imageUrl?: string | null;
  imageBase64?: string | null;
  action?: 'TEXT' | 'SELECT_SUBJECT' | 'SELECT_YEAR' | 'REQUEST_ANSWERS' | 'NEW_CHAT';
}

export interface ChatbotResponseOption {
  label: string;
  value: string;
  type: 'SUBJECT' | 'YEAR' | 'ACTION' | 'LINK';
  payload?: Record<string, unknown>;
}

export interface ChatbotReply {
  conversationId: string;
  replyText: string;
  intent: string;
  options?: ChatbotResponseOption[];
  paper?: Record<string, unknown> | null;
  answers?: Record<string, unknown>[] | null;
  imageUrl?: string | null;
  detectedMatch?: Record<string, unknown> | null;
}

export type DetectedIntent =
  | 'GREETING'
  | 'SAMPLE_PAPER_SEARCH'
  | 'SUBJECT_SELECTION'
  | 'YEAR_SELECTION'
  | 'ANSWER_REQUEST'
  | 'QUESTION_PAPER_REQUEST'
  | 'IMAGE_QUESTION'
  | 'GENERAL_STUDY_QUESTION'
  | 'UNKNOWN';

export async function findMatchingSamplePaperQuestion(
  queryText: string,
  subjectCode?: string | null
) {
  const lower = queryText.toLowerCase().trim();
  if (!lower) return null;

  const topicKeywords: { phrase: string; subject: string; searchTerms: string[] }[] = [
    { phrase: 'henri fayol', subject: 'OCM', searchTerms: ['fayol', 'principles of management', 'unity of command'] },
    { phrase: 'principles of management', subject: 'OCM', searchTerms: ['fayol', 'unity of command', 'principles'] },
    { phrase: 'consumer protection', subject: 'OCM', searchTerms: ['consumer protection', 'district commission', 'national commission'] },
    { phrase: 'district commission', subject: 'OCM', searchTerms: ['district commission', 'state commission', 'consumer protection'] },
    { phrase: 'partnership final accounts', subject: 'BK', searchTerms: ['final accounts', 'balance sheet', 'trial balance'] },
    { phrase: 'admission of partner', subject: 'BK', searchTerms: ['admission', 'revaluation', 'goodwill'] },
    { phrase: 'goodwill', subject: 'BK', searchTerms: ['goodwill', 'sacrificing ratio', 'revaluation'] },
    { phrase: 'law of demand', subject: 'ECO', searchTerms: ['law of demand', 'demand curve', 'alfred marshall'] },
    { phrase: 'elasticity of demand', subject: 'ECO', searchTerms: ['elasticity', 'price elasticity', 'flatter'] },
    { phrase: 'diminishing marginal utility', subject: 'ECO', searchTerms: ['diminishing marginal utility', 'dmu', 'satiety'] },
    { phrase: 'national income', subject: 'ECO', searchTerms: ['national income', 'gdp', 'expenditure method'] },
    { phrase: 'shares', subject: 'SP', searchTerms: ['shares', 'debentures', 'equity'] },
    { phrase: 'debentures', subject: 'SP', searchTerms: ['debentures', 'creditors', 'shares'] }
  ];

  let targetSubject = subjectCode;
  const matchedTopic = topicKeywords.find((tk) => lower.includes(tk.phrase) || tk.searchTerms.some((st) => lower.includes(st)));
  if (matchedTopic && !targetSubject) {
    targetSubject = matchedTopic.subject;
  }

  const questions = await prisma.question.findMany({
    where: targetSubject
      ? { samplePaper: { subject: { code: targetSubject } } }
      : undefined,
    include: {
      samplePaper: {
        include: { subject: true }
      }
    },
    take: 40
  });

  for (const q of questions) {
    const qLower = q.questionText.toLowerCase();
    const subLower = (q.subQuestion || '').toLowerCase();

    if (matchedTopic && matchedTopic.searchTerms.some((term) => qLower.includes(term) || subLower.includes(term))) {
      return {
        paper: q.samplePaper,
        question: q
      };
    }

    const words = lower.split(/\s+/).filter((w) => w.length > 4);
    const matchesCount = words.filter((w) => qLower.includes(w)).length;
    if (matchesCount >= 2) {
      return {
        paper: q.samplePaper,
        question: q
      };
    }
  }

  const papers = await prisma.samplePaper.findMany({
    where: targetSubject
      ? { subject: { code: targetSubject }, isPublished: true }
      : { isPublished: true },
    include: { subject: true },
    take: 10
  });

  for (const p of papers) {
    const yearStr = p.year.toString();
    if (lower.includes(yearStr) && (lower.includes(p.subject.code.toLowerCase()) || lower.includes(p.subject.name.toLowerCase()))) {
      return {
        paper: p,
        question: {
          id: p.id,
          questionNumber: 'Complete Paper',
          subQuestion: null,
          questionText: p.title,
          marks: 80
        }
      };
    }
  }

  return null;
}

export function detectIntent(text: string, currentAction?: string, hasImage?: boolean): DetectedIntent {
  const lower = text.toLowerCase().trim();

  if (currentAction === 'SELECT_SUBJECT') return 'SUBJECT_SELECTION';
  if (currentAction === 'SELECT_YEAR') return 'YEAR_SELECTION';
  if (currentAction === 'REQUEST_ANSWERS') return 'ANSWER_REQUEST';

  if (hasImage) return 'IMAGE_QUESTION';

  // 1. Strict Sample Paper Triggers
  const samplePaperKeywords = [
    'sample paper',
    'sample papers',
    'previous year paper',
    'previous year papers',
    'past paper',
    'past papers',
    'model paper',
    'model papers',
    'question paper',
    'question papers',
    'board paper',
    'board papers',
    'show papers',
    'show sample paper',
    'show sample papers',
    'give me paper',
    'give me papers',
    'i want paper',
    'i want sample papers',
    'i need a class 12 commerce paper',
    'find class 12 sample papers',
    'find economics sample papers',
    'find ocm sample papers',
    'find sample papers'
  ];

  for (const kw of samplePaperKeywords) {
    if (lower.includes(kw)) {
      return 'SAMPLE_PAPER_SEARCH';
    }
  }

  // 2. Direct Subject Selection for sample papers (e.g. user typed "OCM" or "BK" in selection phase)
  const subjectTriggers = ['ocm', 'bk', 'accountancy', 'accounts', 'book keeping', 'economics', 'sp', 'secretarial practice', 'english', 'information technology', 'it'];
  for (const st of subjectTriggers) {
    if (lower === st || lower === `${st} paper` || lower === `${st} papers` || lower === `i want ${st} papers` || lower === `give me ${st} papers`) {
      return 'SUBJECT_SELECTION';
    }
  }

  // 3. Answer requests
  if (
    lower.includes('show answer') ||
    lower.includes('show answers') ||
    lower.includes('show the answer') ||
    lower.includes('show the answers') ||
    lower.includes('view answer') ||
    lower.includes('view answers') ||
    lower.includes('model answer') ||
    lower.includes('model answers') ||
    lower.includes('give me answer') ||
    lower.includes('give me answers') ||
    lower === 'yes, show answers' ||
    lower === 'yes, show the answers' ||
    lower === 'yes' ||
    lower === 'yes please' ||
    lower === 'show model answers'
  ) {
    return 'ANSWER_REQUEST';
  }

  // 4. Question Paper PDF request
  if (lower.includes('open question paper') || lower.includes('no, open question paper')) {
    return 'QUESTION_PAPER_REQUEST';
  }

  // 5. Natural Greetings
  if (
    lower === 'hi' ||
    lower === 'hello' ||
    lower === 'hey' ||
    lower.startsWith('hi ') ||
    lower.startsWith('hello ') ||
    lower.startsWith('hey ') ||
    lower.startsWith('good morning') ||
    lower.startsWith('good afternoon')
  ) {
    return 'GREETING';
  }

  // All other study inquiries, follow-up questions, and conversations
  return 'GENERAL_STUDY_QUESTION';
}

export async function processChatbotMessage(req: ChatbotRequest): Promise<ChatbotReply> {
  const { message, userId, action, imageUrl, imageBase64 } = req;
  let { conversationId, subjectCode, paperId } = req;

  // 1. Ensure Conversation exists
  if (!conversationId) {
    const title = (message && message.trim().length > 0)
      ? message.slice(0, 45)
      : 'Question Paper Analysis';
    const newConv = await createConversation(userId || null, title, subjectCode, paperId);
    conversationId = newConv.id;
  } else {
    const existing = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });
    if (!existing) {
      const newConv = await createConversation(userId || null, message.slice(0, 45), subjectCode, paperId);
      conversationId = newConv.id;
    } else {
      const updateData: { paperId?: string; subjectCode?: string } = {};
      if (paperId && paperId !== existing.paperId) {
        updateData.paperId = paperId;
      }
      if (subjectCode && subjectCode !== existing.subjectCode) {
        updateData.subjectCode = subjectCode;
      }
      if (Object.keys(updateData).length > 0) {
        await prisma.conversation.update({
          where: { id: conversationId },
          data: updateData
        });
      }
      subjectCode = subjectCode || existing.subjectCode;
      paperId = paperId || existing.paperId;
    }
  }

  // Record incoming user message with attached image if present
  await addMessageToConversation(conversationId, 'USER', message, { imageUrl }, imageUrl);

  const intent = detectIntent(message, action, Boolean(imageUrl || imageBase64));

  // 2. Structured Sample Paper Workflow (Intent-driven & deterministic)
  if (intent === 'SAMPLE_PAPER_SEARCH') {
    const replyText = "Which subject's sample paper are you looking for?";

    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    });

    const options: ChatbotResponseOption[] = subjects.map((s) => ({
      label: `${s.code} - ${s.name}`,
      value: s.code,
      type: 'SUBJECT'
    }));

    await addMessageToConversation(conversationId, 'ASSISTANT', replyText, { options, intent });

    return {
      conversationId,
      replyText,
      intent,
      options
    };
  }

  if (intent === 'SUBJECT_SELECTION') {
    let matchedCode = subjectCode;
    const lower = message.toLowerCase();

    if (!matchedCode) {
      if (lower.includes('ocm')) matchedCode = 'OCM';
      else if (lower.includes('bk') || lower.includes('account')) matchedCode = 'BK';
      else if (lower.includes('eco')) matchedCode = 'ECO';
      else if (lower.includes('sp') || lower.includes('secretarial')) matchedCode = 'SP';
      else if (lower.includes('eng')) matchedCode = 'ENG';
      else if (lower.includes('it') || lower.includes('information')) matchedCode = 'IT';
    }

    if (!matchedCode) {
      const subjects = await prisma.subject.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
      });
      return {
        conversationId,
        replyText: 'Please select a Class 12 Commerce subject:',
        intent,
        options: subjects.map((s) => ({ label: s.code, value: s.code, type: 'SUBJECT' }))
      };
    }

    const subject = await prisma.subject.findFirst({
      where: { code: matchedCode.toUpperCase(), isActive: true },
      include: {
        samplePapers: {
          where: { isPublished: true },
          orderBy: { year: 'desc' }
        }
      }
    });

    if (!subject || subject.samplePapers.length === 0) {
      const replyText = `No sample papers are currently available for ${matchedCode.toUpperCase()}. The administrator has not published papers for this subject yet.`;
      await addMessageToConversation(conversationId, 'ASSISTANT', replyText, { intent });
      return { conversationId, replyText, intent };
    }

    // Save subject in conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { subjectCode: subject.code }
    });

    const replyText = `Here are the available ${subject.code} sample papers:`;
    const options: ChatbotResponseOption[] = subject.samplePapers.map((p) => ({
      label: `${subject.code} Sample Paper – ${p.year}`,
      value: p.id,
      type: 'YEAR',
      payload: { year: p.year, paperId: p.id }
    }));

    await addMessageToConversation(conversationId, 'ASSISTANT', replyText, { options, intent });

    return {
      conversationId,
      replyText,
      intent,
      options
    };
  }

  if (intent === 'YEAR_SELECTION') {
    let paper = paperId
      ? await prisma.samplePaper.findUnique({
          where: { id: paperId },
          include: { subject: true }
        })
      : null;

    if (!paper) {
      const yearMatch = message.match(/\b(202[0-9])\b/);
      if (yearMatch && subjectCode) {
        const yearInt = parseInt(yearMatch[1], 10);
        paper = await prisma.samplePaper.findFirst({
          where: {
            year: yearInt,
            subject: { code: subjectCode },
            isPublished: true
          },
          include: { subject: true }
        });
      }
    }

    if (!paper) {
      const replyText = 'Please specify the exact paper or year you would like to inspect.';
      await addMessageToConversation(conversationId, 'ASSISTANT', replyText, { intent });
      return { conversationId, replyText, intent };
    }

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { paperId: paper.id, subjectCode: paper.subject.code }
    });

    const replyText = `You selected ${paper.subject.code} Sample Paper – ${paper.year}.\n\nWould you like the answers for this sample paper?`;
    const options: ChatbotResponseOption[] = [
      {
        label: 'Yes, Show Answers',
        value: paper.id,
        type: 'ACTION',
        payload: { action: 'REQUEST_ANSWERS', paperId: paper.id }
      },
      {
        label: 'No, Open Question Paper',
        value: paper.paperPdfUrl,
        type: 'LINK',
        payload: { url: paper.paperPdfUrl, paperId: paper.id }
      }
    ];

    await addMessageToConversation(conversationId, 'ASSISTANT', replyText, {
      options,
      intent,
      paperId: paper.id
    });

    return {
      conversationId,
      replyText,
      intent,
      options,
      paper: {
        id: paper.id,
        title: paper.title,
        year: paper.year,
        subjectCode: paper.subject.code,
        paperPdfUrl: paper.paperPdfUrl,
        answerPdfUrl: paper.answerPdfUrl
      }
    };
  }

  if (intent === 'ANSWER_REQUEST') {
    const activePaperId = paperId;
    if (!activePaperId) {
      const replyText =
        'Please select a sample paper first so I can retrieve its exact verified answers.\n\nWhich subject would you like to explore?';

      const subjects = await prisma.subject.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' }
      });

      const options: ChatbotResponseOption[] = subjects.map((s) => ({
        label: `${s.code} - ${s.name}`,
        value: s.code,
        type: 'SUBJECT'
      }));

      await addMessageToConversation(conversationId, 'ASSISTANT', replyText, { options, intent });
      return { conversationId, replyText, intent, options };
    }

    // Strictly retrieve the exact selected paper and verified solutions
    let solutionResult;
    try {
      solutionResult = await getOrGeneratePaperSolution(activePaperId);
    } catch (err: unknown) {
      console.error(`Error resolving paper solution for paper ${activePaperId}:`, err);
      const replyText = `Unable to generate answers for this sample paper: ${(err as Error).message || 'Verification failure'}.\n\nPlease try again or select another sample paper.`;
      const options: ChatbotResponseOption[] = [
        {
          label: 'Retry Fetching Answers',
          value: activePaperId,
          type: 'ACTION',
          payload: { action: 'REQUEST_ANSWERS', paperId: activePaperId }
        }
      ];
      await addMessageToConversation(conversationId, 'ASSISTANT', replyText, { options, intent, paperId: activePaperId });
      return { conversationId, replyText, intent, options };
    }

    const { paper, questions } = solutionResult;

    if (!paper || questions.length === 0) {
      const replyText = `Sample paper \`${activePaperId}\` could not be found or has no verified questions available. Please choose from the active Class 12 sample papers.`;
      await addMessageToConversation(conversationId, 'ASSISTANT', replyText, { intent });
      return { conversationId, replyText, intent };
    }

    // Permanently maintain exact selected paper ID in conversation
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { paperId: paper.id, subjectCode: paper.subject.code }
    });

    // Format the complete solution adhering strictly to Point 24
    let replyText = `### Sample Paper – ${paper.subject.name} – ${paper.year}\n\n`;
    replyText += `**Official Paper Title:** ${paper.title}\n`;
    replyText += `**Subject Code:** ${paper.subject.code} | **Examination Year:** ${paper.year}\n`;
    replyText += `**Syllabus Standard:** Maharashtra State Board Class 12 Commerce\n`;
    replyText += `**Total Verified Questions:** ${questions.length} | **Unique Paper ID:** \`${paper.id}\`\n\n`;
    replyText += `---\n\n`;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const marksStr = q.marks ? `(Marks: ${q.marks})` : '';
      replyText += `**Question ${q.questionNumber}${q.subQuestion ? ` ${q.subQuestion}` : ''} ${marksStr}**\n\n`;
      replyText += `Question: ${q.questionText}\n\n`;
      replyText += `Answer:\n`;

      if (q.answers && q.answers.length > 0) {
        for (const a of q.answers) {
          replyText += `${a.answerText}\n\n`;
          if (a.explanation) {
            replyText += `*Working Notes / Board Marking Scheme:*\n${a.explanation}\n\n`;
          }
        }
      } else {
        replyText += `[Solution currently being reviewed according to Maharashtra Board evaluation criteria]\n\n`;
      }

      if (i < questions.length - 1) {
        replyText += `---\n\n`;
      }
    }

    const options: ChatbotResponseOption[] = [
      {
        label: 'View Original Question Paper PDF',
        value: paper.paperPdfUrl,
        type: 'LINK',
        payload: { url: paper.paperPdfUrl, paperId: paper.id }
      },
      {
        label: 'Download / Print Complete Solution',
        value: `/api/sample-papers/${paper.id}/solution`,
        type: 'LINK',
        payload: { url: `/api/sample-papers/${paper.id}/solution`, paperId: paper.id }
      }
    ];

    if (paper.answerPdfUrl) {
      options.push({
        label: 'Download Official Board Answer PDF',
        value: paper.answerPdfUrl,
        type: 'LINK',
        payload: { url: paper.answerPdfUrl }
      });
    }

    await addMessageToConversation(conversationId, 'ASSISTANT', replyText, {
      options,
      intent,
      paperId: paper.id
    });

    return {
      conversationId,
      replyText,
      intent,
      options,
      paper: {
        id: paper.id,
        title: paper.title,
        year: paper.year,
        subjectCode: paper.subject.code,
        paperPdfUrl: paper.paperPdfUrl,
        answerPdfUrl: paper.answerPdfUrl
      }
    };
  }

  if (intent === 'QUESTION_PAPER_REQUEST') {
    const activePaperId = paperId;
    const paper = activePaperId
      ? await prisma.samplePaper.findUnique({
          where: { id: activePaperId },
          include: { subject: true }
        })
      : null;

    if (!paper) {
      const replyText = 'Please select a sample paper to view its PDF document.';
      await addMessageToConversation(conversationId, 'ASSISTANT', replyText, { intent });
      return { conversationId, replyText, intent };
    }

    const replyText = `Here is your document link for **${paper.title}**:\n\n[Click here to view / download the Question Paper PDF](${paper.paperPdfUrl})`;
    const options: ChatbotResponseOption[] = [
      {
        label: 'Open Question Paper PDF',
        value: paper.paperPdfUrl,
        type: 'LINK',
        payload: { url: paper.paperPdfUrl }
      },
      {
        label: 'Show Official Answers',
        value: paper.id,
        type: 'ACTION',
        payload: { action: 'REQUEST_ANSWERS', paperId: paper.id }
      }
    ];

    await addMessageToConversation(conversationId, 'ASSISTANT', replyText, { options, intent });

    return {
      conversationId,
      replyText,
      intent,
      options
    };
  }

  // 3. ADVANCED CONVERSATIONAL & VISION AI (GREETING, IMAGE_QUESTION, GENERAL_STUDY_QUESTION)
  // Check if query matches any known Board Sample Paper questions
  const detectedMatch = await findMatchingSamplePaperQuestion(message, subjectCode);

  // Retrieve system prompt configuration
  const systemPromptSetting = await prisma.appSettings.findUnique({
    where: { settingKey: 'chatbot_system_prompt' }
  });

  const systemPrompt =
    systemPromptSetting?.settingValue ||
    `You are Study Chat Bot, a brilliant, warm, and highly capable academic tutor exclusively dedicated to Class 12 Commerce students.
You behave with the conversational naturalness, intelligence, and depth of ChatGPT and Google Gemini.
You specialize in:
- Organization of Commerce and Management (OCM)
- Book Keeping and Accountancy (BK)
- Economics
- Secretarial Practice (SP)
- English
- Information Technology (IT)

Rules for your responses:
1. Converse naturally, politely, and intelligently. Never say "I am just a chatbot" or give robotic responses.
2. Maintain strong context awareness. If the user asks a follow-up ("Explain its features", "Explain the second one in detail", "Make it shorter", "Give an example", "What about the next question?"), understand exactly what they refer to without asking them to repeat themselves.
3. Structure your explanations with clear markdown headings, bullet points, numbered steps, and tables where helpful.
4. For Accountancy, provide step-by-step mathematical calculations, ledger layouts, and working notes.
5. Explain concepts at a senior secondary Class 12 board level, balancing clarity with exam-oriented terminology.
6. Do not include emojis.`;

  // Fetch the 16 most recent messages in the conversation to maintain multi-turn context
  const recentMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 16
  });
  recentMessages.reverse(); // Chronological order

  const nvidiaMessages = [
    { role: 'system' as const, content: systemPrompt },
    ...recentMessages.map((m) => ({
      role: m.role.toLowerCase() === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: m.content
    }))
  ];

  const aiResult = await callNvidiaAI(nvidiaMessages, {
    imageUrl,
    imageBase64
  });

  let finalReplyText = aiResult.text;
  let responseOptions: ChatbotResponseOption[] | undefined;

  if (detectedMatch) {
    const matchHeader = `> **BOARD SAMPLE PAPER MATCH IDENTIFIED**\n> **Subject:** ${detectedMatch.paper.subject.name} (${detectedMatch.paper.subject.code})\n> **Source Paper:** ${detectedMatch.paper.title} (${detectedMatch.paper.year})\n> **Question Reference:** ${detectedMatch.question.questionNumber}${detectedMatch.question.subQuestion ? ` ${detectedMatch.question.subQuestion}` : ''} ${detectedMatch.question.marks ? `(${detectedMatch.question.marks} Marks)` : ''}\n> **Direct Document:** [Open Original Question Paper PDF](/sample-papers/view/${detectedMatch.paper.id})\n\n`;
    finalReplyText = matchHeader + finalReplyText;

    responseOptions = [
      {
        label: `View ${detectedMatch.paper.subject.code} ${detectedMatch.paper.year} Paper PDF`,
        value: `/sample-papers/view/${detectedMatch.paper.id}`,
        type: 'LINK',
        payload: { url: `/sample-papers/view/${detectedMatch.paper.id}`, paperId: detectedMatch.paper.id }
      },
      {
        label: 'Download Sample Paper PDF',
        value: `/api/sample-papers/${detectedMatch.paper.id}/download`,
        type: 'LINK',
        payload: { url: `/api/sample-papers/${detectedMatch.paper.id}/download` }
      }
    ];
  }

  await addMessageToConversation(conversationId, 'ASSISTANT', finalReplyText, {
    intent,
    isFallback: aiResult.isFallback,
    options: responseOptions,
    detectedMatch: detectedMatch
      ? {
          paperId: detectedMatch.paper.id,
          paperTitle: detectedMatch.paper.title,
          year: detectedMatch.paper.year,
          subjectCode: detectedMatch.paper.subject.code
        }
      : null
  });

  return {
    conversationId,
    replyText: finalReplyText,
    intent,
    options: responseOptions,
    imageUrl: imageUrl || null,
    detectedMatch: detectedMatch
      ? {
          paperId: detectedMatch.paper.id,
          title: detectedMatch.paper.title,
          year: detectedMatch.paper.year
        }
      : null
  };
}
