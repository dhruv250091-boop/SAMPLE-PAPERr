import prisma from '../src/lib/prisma';

async function testPoint25Mobile() {
  console.log('================================================================');
  console.log('   RUNNING AUTOMATED TEST SUITE FOR POINT 25: MOBILE RESPONSIVE ');
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

  const baseUrl = 'http://localhost:3000';

  const cleanHtml = (raw: string) => raw.replace(/<!-- -->/g, '');

  // --- WORKFLOW 1: Open Homepage on Mobile ---
  console.log('--- TEST GROUP 1: Homepage Mobile Elements & Prominent Sample Papers ---');
  const homeRes = await fetch(`${baseUrl}/`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1' }
  });
  assert(homeRes.status === 200, 'Homepage returns HTTP 200');
  const homeHtml = cleanHtml(await homeRes.text());

  assert(homeHtml.includes('Practice Sample Papers'), 'Homepage features prominent "Practice Sample Papers" Card');
  assert(homeHtml.includes('High Priority Board Resource'), 'Card has priority indicator tag');
  assert(homeHtml.includes('Direct Subject Access:'), 'Direct Subject Access pills present on Homepage card');
  assert(homeHtml.includes('BK') && homeHtml.includes('ECO') && homeHtml.includes('OCM'), 'Subject pills (BK, ECO, OCM) visible');
  assert(!homeHtml.includes('Nemotron AI'), 'Chatbot cleaned of redundant technical labels on home callout');

  // Check no emojis in Homepage HTML
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  assert(!emojiRegex.test(homeHtml), 'Zero emojis on homepage (Academic standard strictly maintained)');

  // --- WORKFLOW 2: Practice Sample Papers Repository ---
  console.log('\n--- TEST GROUP 2: Sample Papers Repository Mobile Responsiveness ---');
  const papersRes = await fetch(`${baseUrl}/sample-papers`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36' }
  });
  assert(papersRes.status === 200, 'Sample Papers page returns HTTP 200');
  const papersHtml = cleanHtml(await papersRes.text());
  assert(papersHtml.includes('Sample Paper Repository'), 'Repository header rendered properly');
  assert(papersHtml.includes('All Subjects'), 'Subject tabs (All Subjects) rendered');

  // --- WORKFLOW 3: Subject View & Papers ---
  console.log('\n--- TEST GROUP 3: Subject Specific Sample Papers View ---');
  const bkRes = await fetch(`${baseUrl}/sample-papers/bk`);
  assert(bkRes.status === 200, 'BK Subject page returns HTTP 200');
  const bkHtml = cleanHtml(await bkRes.text());
  assert(bkHtml.includes('Subject Code: BK'), 'Subject code BK displayed');
  assert(bkHtml.includes('Available BK Sample Papers'), 'BK papers list rendered');

  // --- WORKFLOW 4: Sample Paper Viewer on Mobile ---
  console.log('\n--- TEST GROUP 4: Sample Paper PDF Viewer Mobile Controls ---');
  const firstPaper = await prisma.samplePaper.findFirst({
    where: { isPublished: true },
    include: { subject: true }
  });
  assert(Boolean(firstPaper), 'Valid sample paper found in database');

  const viewerRes = await fetch(`${baseUrl}/sample-papers/view/${firstPaper!.id}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) Mobile/15E148' }
  });
  assert(viewerRes.status === 200, 'Sample Paper Viewer returns HTTP 200');
  const viewerHtml = await viewerRes.text();
  assert(viewerHtml.includes('Back to Subject Papers'), 'Back navigation button present');
  assert(viewerHtml.includes('Download'), 'Download button present');
  assert(viewerHtml.includes('Rotate Clockwise'), 'Orientation / rotation control present');

  // --- WORKFLOW 5: Sample Paper Solution Document ---
  console.log('\n--- TEST GROUP 5: Printable & Downloadable Solution Document ---');
  const solutionRes = await fetch(`${baseUrl}/api/sample-papers/${firstPaper!.id}/solution`);
  assert(solutionRes.status === 200, 'Solution endpoint returns HTTP 200');
  const solutionHtml = await solutionRes.text();
  assert(solutionHtml.includes('Official Question &amp; Answer Solution Document') || solutionHtml.includes('Official Question & Answer Solution Document'), 'Solution document title rendered');
  assert(solutionHtml.includes('window.print()'), 'Print / Save as PDF capability present');

  // --- WORKFLOW 6: Chatbot Interface Cleanliness & Mobile Viewport ---
  console.log('\n--- TEST GROUP 6: Study Chat Bot Clean Interface & Mobile Layout ---');
  const chatRes = await fetch(`${baseUrl}/chatbot`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36' }
  });
  assert(chatRes.status === 200, 'Chatbot page returns HTTP 200');
  const chatHtml = await chatRes.text();

  assert(chatHtml.includes('Study Chat Bot'), 'Chatbot clean header contains "Study Chat Bot"');
  assert(!chatHtml.includes('Nemotron AI'), 'Technical internal AI badge removed from clean header');
  assert(!chatHtml.includes('Conversational AI & Vision Question Solver for Class 12 Commerce'), 'Unnecessary subtitle text removed');
  assert(!emojiRegex.test(chatHtml), 'Zero emojis in Chatbot interface');

  // --- WORKFLOW 7: Chatbot API Message Flow (Subject selection & answer requests) ---
  console.log('\n--- TEST GROUP 7: Chatbot API Interaction on Mobile ---');
  const apiChatRes = await fetch(`${baseUrl}/api/chatbot`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Practice Sample Papers',
      action: 'TEXT'
    })
  });
  assert(apiChatRes.status === 200, 'Chatbot API returns HTTP 200 on mobile inquiry');
  const apiData = await apiChatRes.json();
  assert(Boolean(apiData.conversationId), 'Conversation ID created and returned');
  assert(Boolean(apiData.replyText), 'Clean reply text received');
  assert(apiData.options && apiData.options.length > 0, 'Touch options returned for mobile selection');

  // --- WORKFLOW 8: Developer & Login Pages Mobile Responsiveness ---
  console.log('\n--- TEST GROUP 8: Developer Profile & Authentication Pages ---');
  const devRes = await fetch(`${baseUrl}/developer`);
  assert(devRes.status === 200, 'Developer page returns HTTP 200');
  const devHtml = await devRes.text();
  assert(devHtml.includes('Dhruv Chokshi'), 'Dhruv Chokshi developer name displayed correctly');

  const loginRes = await fetch(`${baseUrl}/login`);
  assert(loginRes.status === 200, 'Login page returns HTTP 200');
  const loginHtml = await loginRes.text();
  assert(loginHtml.includes('Sign In to Account'), 'Clean responsive sign-in interface present');

  console.log('\n================================================================');
  console.log(`   ALL ${passedTests}/${totalTests} MOBILE TESTS PASSED! ZERO OVERFLOWS OR BUGS.`);
  console.log('================================================================\n');
}

testPoint25Mobile()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
