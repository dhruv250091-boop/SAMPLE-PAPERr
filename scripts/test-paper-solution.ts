import { getOrGeneratePaperSolution } from '../src/services/paper-solution.service';
import prisma from '../src/lib/prisma';

async function run() {
  const paper = await prisma.samplePaper.findFirst({
    where: { subject: { code: 'BK' }, year: 2024, month: 'March' }
  });
  console.log('Testing paper:', paper?.id, paper?.title);
  if (!paper) return;
  const res = await getOrGeneratePaperSolution(paper.id);
  console.log('Result source:', res.source);
  console.log('Questions count:', res.questions.length);
  for (const q of res.questions) {
    console.log(q.questionNumber, '| Marks:', q.marks, '| Q:', q.questionText.slice(0, 80).replace(/\n/g, ' '));
    console.log('   Answer:', q.answers[0]?.answerText.slice(0, 100).replace(/\n/g, ' '));
  }
}
run().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
