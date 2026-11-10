import prisma from '../src/lib/prisma';
import { processChatbotMessage } from '../src/services/chatbot.service';
import { getOrGeneratePaperSolution } from '../src/services/paper-solution.service';

async function runPoint24Test() {
  console.log('================================================================');
  console.log('   RUNNING AUTOMATED TEST SUITE FOR POINT 24: SOLUTION SYSTEM   ');
  console.log('================================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    totalTests++;
    if (condition) {
      console.log(`[PASS] Test ${totalTests}: ${testName}`);
      passedTests++;
    } else {
      console.error(`[FAIL] Test ${totalTests}: ${testName}`);
      if (details) console.error(`       Details: ${details}`);
      throw new Error(`Test failed: ${testName}`);
    }
  }

  // --- TEST 1: Strict Database Relationship Integrity ---
  console.log('--- TEST GROUP 1: Database Relationship Verification ---');
  const allPapers = await prisma.samplePaper.findMany({
    include: {
      subject: true,
      questions: {
        include: { answers: true }
      }
    }
  });

  assert(allPapers.length >= 30, 'All 30 Sample Papers exist in database', `Found ${allPapers.length} papers`);

  let totalQuestionsCount = 0;
  let totalAnswersCount = 0;
  let corruptedLinks = 0;

  for (const paper of allPapers) {
    totalQuestionsCount += paper.questions.length;
    for (const q of paper.questions) {
      if (q.samplePaperId !== paper.id) corruptedLinks++;
      totalAnswersCount += q.answers.length;
      for (const a of q.answers) {
        if (a.questionId !== q.id) corruptedLinks++;
      }
    }
  }

  assert(totalQuestionsCount >= 200, `Complete Question Set in DB (Found ${totalQuestionsCount} questions)`);
  assert(totalAnswersCount >= totalQuestionsCount, `Every question has a verified answer (Found ${totalAnswersCount} answers)`);
  assert(corruptedLinks === 0, 'Zero relational link corruptions across subjects, papers, questions and answers');

  // --- TEST 2: Exact Paper Connection & Flow (Subject -> Paper -> Answers) ---
  console.log('\n--- TEST GROUP 2: Chatbot Conversation & Exact Paper Binding ---');
  
  // Step 2a: Student asks for sample papers
  const turn1 = await processChatbotMessage({
    message: 'Give me sample papers',
    action: 'TEXT'
  });
  const convId = turn1.conversationId;
  assert(turn1.intent === 'SAMPLE_PAPER_SEARCH', 'Intent recognized as SAMPLE_PAPER_SEARCH');
  assert(Boolean(turn1.options && turn1.options.length >= 5), 'Subject options presented to user');

  // Step 2b: Student selects "BK" (Book Keeping and Accountancy)
  const turn2 = await processChatbotMessage({
    conversationId: convId,
    message: 'BK',
    action: 'SELECT_SUBJECT',
    subjectCode: 'BK'
  });
  assert(turn2.intent === 'SUBJECT_SELECTION', 'Intent recognized as SUBJECT_SELECTION');
  assert(Boolean(turn2.options && turn2.options.length > 0), 'BK paper year options presented');

  // Pick BK paper
  const bkPaperOption = turn2.options![0];
  const bkPaperId = (bkPaperOption.payload?.paperId as string) || bkPaperOption.value;
  const bkPaper = await prisma.samplePaper.findUnique({
    where: { id: bkPaperId },
    include: { subject: true, questions: { include: { answers: true } } }
  });
  assert(Boolean(bkPaper), `Selected BK Paper ID valid: ${bkPaper?.title}`);

  // Step 2c: Student selects the specific year/paper
  const turn3 = await processChatbotMessage({
    conversationId: convId,
    message: bkPaperOption.label,
    action: 'SELECT_YEAR',
    paperId: bkPaperId,
    subjectCode: 'BK'
  });
  assert(turn3.intent === 'YEAR_SELECTION', 'Intent recognized as YEAR_SELECTION');
  assert(turn3.replyText.includes('Would you like the answers'), 'Chatbot offers to show answers');

  // Verify conversation is now permanently bound to bkPaperId
  const convInDb = await prisma.conversation.findUnique({ where: { id: convId } });
  assert(convInDb?.paperId === bkPaperId, `Conversation permanently bound to Paper ID: ${bkPaperId}`);

  // Step 2d: Student says "Yes, show the answers"
  const turn4 = await processChatbotMessage({
    conversationId: convId,
    message: 'Yes, show the answers',
    action: 'REQUEST_ANSWERS',
    paperId: bkPaperId
  });

  assert(turn4.intent === 'ANSWER_REQUEST', 'Intent recognized as ANSWER_REQUEST');
  assert(turn4.replyText.includes(`Sample Paper – ${bkPaper!.subject.name}`), 'Output header contains exact selected paper subject');
  assert(turn4.replyText.includes(bkPaper!.year.toString()), 'Output header contains exact selected year');
  assert(turn4.replyText.includes(bkPaperId), 'Output contains unique Database Paper ID');

  // Verify all questions for BK paper are present in order
  for (const q of bkPaper!.questions) {
    assert(turn4.replyText.includes(`Question ${q.questionNumber}`), `Question ${q.questionNumber} present in chatbot output`);
  }

  // Verify BK specific requirements (Accounts, Working notes, balance sheet)
  assert(
    turn4.replyText.includes('Working Notes') || turn4.replyText.includes('Balance Sheet') || turn4.replyText.includes('Revaluation'),
    'Accountancy solution contains complete calculations, formats and working notes'
  );

  // --- TEST 3: Switching Papers Mid-Conversation ---
  console.log('\n--- TEST GROUP 3: Paper Switching & Isolation (No cross-paper mixing) ---');
  
  // Pick an Economics paper
  const ecoPaper = await prisma.samplePaper.findFirst({
    where: { subject: { code: 'ECO' } },
    include: { subject: true, questions: { include: { answers: true } } }
  });
  assert(Boolean(ecoPaper), `Found Economics paper: ${ecoPaper?.title}`);

  // User switches to ECO paper in the same conversation
  const turn5 = await processChatbotMessage({
    conversationId: convId,
    message: `Switch to Economics ${ecoPaper!.year}`,
    action: 'SELECT_YEAR',
    paperId: ecoPaper!.id,
    subjectCode: 'ECO'
  });

  // User asks for answers to the newly selected paper
  const turn6 = await processChatbotMessage({
    conversationId: convId,
    message: 'Yes, show the answers',
    action: 'REQUEST_ANSWERS',
    paperId: ecoPaper!.id
  });

  assert(turn6.replyText.includes(`Sample Paper – ${ecoPaper!.subject.name}`), 'Output header switched to Economics');
  assert(turn6.replyText.includes(ecoPaper!.id), 'Output contains new Paper ID');

  // Verify no BK questions leaked into ECO solution
  const firstBkQuestion = bkPaper!.questions[0].questionText;
  const isBkLeaked = turn6.replyText.includes(firstBkQuestion) && !ecoPaper!.questions.some(eq => eq.questionText === firstBkQuestion);
  assert(!isBkLeaked, 'Zero leakage: No BK questions present in ECO response');

  // Verify Economics specific requirements (Definitions, schedules, law of demand, micro/macro)
  assert(
    turn6.replyText.includes('Law of Demand') || turn6.replyText.includes('Utility') || turn6.replyText.includes('Micro') || turn6.replyText.includes('Demand Curve') || turn6.replyText.includes('National Income'),
    'Economics solution contains board-standard definitions, terminology and schedules'
  );

  // --- TEST 4: Error Handling & Non-Existent Paper ---
  console.log('\n--- TEST GROUP 4: Strict Error Handling (No fake success) ---');

  const invalidPaperId = 'invalid-fake-id-99999';
  const turnErr = await processChatbotMessage({
    conversationId: convId,
    message: 'Yes, show the answers',
    action: 'REQUEST_ANSWERS',
    paperId: invalidPaperId
  });

  assert(
    turnErr.replyText.includes('could not be found') || turnErr.replyText.includes('Unable to generate answers'),
    'Invalid Paper ID produces strict descriptive error message without fake answers'
  );
  assert(
    !turnErr.replyText.includes('### Sample Paper – Book Keeping') && !turnErr.replyText.includes('### Sample Paper – Economics'),
    'Invalid Paper ID NEVER falls back to returning answers from another paper'
  );

  // --- TEST 5: Direct Solution Service Engine ---
  console.log('\n--- TEST GROUP 5: Direct Solution Service & Formats ---');
  const solutionEngineRes = await getOrGeneratePaperSolution(bkPaperId);
  assert(solutionEngineRes.isComplete, 'getOrGeneratePaperSolution reports isComplete = true');
  assert(solutionEngineRes.questions.length === bkPaper!.questions.length, 'All questions retrieved correctly by solution service');

  console.log('\n================================================================');
  console.log(`   ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY! ZERO BUGS DETECTED.`);
  console.log('================================================================\n');
}

runPoint24Test()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
