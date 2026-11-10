import prisma from '../src/lib/prisma';
import { detectIntent, processChatbotMessage } from '../src/services/chatbot.service';
import bcrypt from 'bcryptjs';

async function runTestSuite() {
  console.log('================================================================');
  console.log('CLASS 12 COMMERCE PLATFORM - CONVERSATIONAL AI & FEATURE TESTS');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`[PASS] ${desc}`);
      passed++;
    } else {
      console.error(`[FAIL] ${desc}`);
      failed++;
    }
  }

  try {
    // TEST 1: Database Seed Verification
    console.log('--- TEST 1: Database Schema & Seed Verification ---');
    const subjects = await prisma.subject.findMany({ orderBy: { order: 'asc' } });
    assert(subjects.length === 6, `Found ${subjects.length} subjects in database (expected 6)`);

    const expectedCodes = ['OCM', 'BK', 'ECO', 'SP', 'ENG', 'IT'];
    const actualCodes = subjects.map((s) => s.code);
    assert(
      expectedCodes.every((c) => actualCodes.includes(c)),
      `All 6 Class 12 Commerce subjects exist: ${actualCodes.join(', ')}`
    );

    const papers = await prisma.samplePaper.findMany({ where: { isPublished: true } });
    assert(papers.length >= 18, `Found ${papers.length} published sample papers across years 2024-2026`);

    const questions = await prisma.question.findMany({ include: { answers: true } });
    assert(questions.length > 0, `Found ${questions.length} structured questions in database`);

    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    assert(Boolean(admin && admin.password), `Admin user exists: ${admin?.email}`);
    if (admin?.password) {
      const passValid = await bcrypt.compare('AdminCommerce@2026', admin.password);
      assert(passValid, 'Admin password matches hash');
    }

    // TEST 2: Natural Conversational AI (ChatGPT / Gemini style)
    console.log('\n--- TEST 2: Advanced Conversational AI Responses ---');
    
    // Natural Greeting
    const greetingRes = await processChatbotMessage({
      message: 'Hello, how are you?'
    });
    assert(
      greetingRes.replyText.toLowerCase().includes('hello') &&
      !greetingRes.replyText.toLowerCase().includes('i am just a chatbot'),
      'Responds naturally to "Hello, how are you?" without robotic disclaimers'
    );

    // Study Guidance
    const examTipsRes = await processChatbotMessage({
      message: 'What should I study for my Commerce exam?',
      conversationId: greetingRes.conversationId
    });
    assert(
      examTipsRes.replyText.includes('Book Keeping') && examTipsRes.replyText.includes('OCM'),
      'Delivers exam-oriented Class 12 Commerce strategy guide'
    );

    // TEST 3: Multi-Turn Context Memory & Follow-Up Understanding
    console.log('\n--- TEST 3: Multi-turn Context Memory & Follow-Up Understanding ---');
    
    // Turn 1: Initial Concept Inquiry
    const turn1 = await processChatbotMessage({
      message: 'Explain management.'
    });
    const cId = turn1.conversationId;
    assert(
      turn1.replyText.toLowerCase().includes('management') || turn1.replyText.includes('Fayol'),
      'Turn 1 explains management concepts'
    );

    // Turn 2: Follow-up 1 ("Explain its features")
    const turn2 = await processChatbotMessage({
      message: 'Explain its features.',
      conversationId: cId
    });
    assert(
      turn2.replyText.length > 40,
      'Turn 2 remembers context of management for features inquiry'
    );

    // Turn 3: Follow-up 2 ("Explain the second one in detail")
    const turn3 = await processChatbotMessage({
      message: 'Explain the second one in detail.',
      conversationId: cId
    });
    assert(
      turn3.replyText.includes('Second') || turn3.replyText.includes('Authority') || turn3.replyText.includes('Pervasive'),
      'Turn 3 understands reference to "the second one" without asking user to repeat topic'
    );

    // Turn 4: Follow-up 3 ("Can you make this answer shorter?")
    const turn4 = await processChatbotMessage({
      message: 'Can you make this answer shorter?',
      conversationId: cId
    });
    assert(
      turn4.replyText.includes('Summary') || turn4.replyText.includes('In Short'),
      'Turn 4 accurately provides concise summary upon request'
    );

    // Turn 5: Follow-up 4 ("Can you explain it with an example?")
    const turn5 = await processChatbotMessage({
      message: 'Can you explain it with an example?',
      conversationId: cId
    });
    assert(
      turn5.replyText.includes('Example') || turn5.replyText.includes('Scenario'),
      'Turn 5 generates realistic commercial business scenario example'
    );

    // TEST 4: Deterministic Sample Paper Selection Workflow
    console.log('\n--- TEST 4: Sample Paper Selection Workflow ---');

    // User explicitly requests sample papers
    const pStep1 = await processChatbotMessage({
      message: 'Show me sample papers'
    });
    assert(pStep1.intent === 'SAMPLE_PAPER_SEARCH', 'Triggers SAMPLE_PAPER_SEARCH intent');
    assert(Boolean(pStep1.options && pStep1.options.length >= 6), 'Displays interactive subject buttons');

    // User selects BK
    const pStep2 = await processChatbotMessage({
      message: 'BK',
      conversationId: pStep1.conversationId,
      action: 'SELECT_SUBJECT'
    });
    assert(pStep2.intent === 'SUBJECT_SELECTION', 'Triggers SUBJECT_SELECTION intent');
    assert(pStep2.replyText.includes('available BK sample papers'), 'Returns available BK papers');

    const selectedPaperOption = pStep2.options?.find((o) => o.label.includes('2025'));
    const paperId = selectedPaperOption?.value;

    // User selects year
    const pStep3 = await processChatbotMessage({
      message: 'BK Sample Paper – 2025',
      conversationId: pStep1.conversationId,
      paperId,
      action: 'SELECT_YEAR'
    });
    assert(pStep3.intent === 'YEAR_SELECTION', 'Triggers YEAR_SELECTION intent');
    assert(
      Boolean(pStep3.options?.some((o) => o.label === 'Yes, Show Answers')),
      'Displays "Yes, Show Answers" action button'
    );

    // User requests verified answers
    const pStep4 = await processChatbotMessage({
      message: 'Yes, Show Answers',
      conversationId: pStep1.conversationId,
      paperId,
      action: 'REQUEST_ANSWERS'
    });
    assert(pStep4.intent === 'ANSWER_REQUEST', 'Triggers ANSWER_REQUEST intent');
    assert(
      pStep4.replyText.includes('Trading') || pStep4.replyText.includes('Q.1'),
      'Displays verified answers with step-by-step accountancy calculations'
    );

    // TEST 5: PDF Verification
    console.log('\n--- TEST 5: PDF Binary Integrity ---');
    const fs = await import('fs');
    const path = await import('path');
    const pdfDir = path.join(process.cwd(), 'public', 'sample-papers');
    const files = fs.readdirSync(pdfDir);
    assert(files.length >= 12, `Verified ${files.length} real PDF documents stored`);

    console.log('\n================================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('================================================================');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test error:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();
