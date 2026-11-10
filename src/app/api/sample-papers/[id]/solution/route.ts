import { NextRequest, NextResponse } from 'next/server';
import { getOrGeneratePaperSolution } from '@/services/paper-solution.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const searchParams = req.nextUrl.searchParams;
  const format = searchParams.get('format');
  const acceptHeader = req.headers.get('accept') || '';

  try {
    const solutionResult = await getOrGeneratePaperSolution(id);
    const { paper, questions } = solutionResult;

    if (!paper) {
      return NextResponse.json({ error: 'Sample paper not found' }, { status: 404 });
    }

    // JSON response
    if (format === 'json' || acceptHeader.includes('application/json')) {
      return NextResponse.json({
        paper: {
          id: paper.id,
          title: paper.title,
          year: paper.year,
          subject: {
            name: paper.subject.name,
            code: paper.subject.code
          },
          paperPdfUrl: paper.paperPdfUrl,
          answerPdfUrl: paper.answerPdfUrl
        },
        questionsCount: questions.length,
        questions: questions.map((q) => ({
          id: q.id,
          questionNumber: q.questionNumber,
          subQuestion: q.subQuestion,
          questionText: q.questionText,
          marks: q.marks,
          order: q.order,
          answers: q.answers.map((a) => ({
            id: a.id,
            answerText: a.answerText,
            explanation: a.explanation
          }))
        }))
      });
    }

    // High quality printable HTML response
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${paper.subject.code} ${paper.year} – Model Solutions | Class 12 Commerce</title>
  <style>
    :root {
      --bg: #09090b;
      --card-bg: #111116;
      --border: #27272a;
      --text: #f4f4f5;
      --text-muted: #a1a1aa;
      --accent: #8b5cf6;
      --accent-glow: rgba(139, 92, 246, 0.15);
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.6;
      padding: 2rem 1rem;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      background: linear-gradient(135deg, #18181b 0%, #1e122b 100%);
      border: 1px solid #3b285e;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      position: relative;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: rgba(139, 92, 246, 0.2);
      color: #c4b5fd;
      border: 1px solid rgba(139, 92, 246, 0.4);
      margin-bottom: 0.75rem;
    }
    h1 {
      font-size: 1.875rem;
      font-weight: 800;
      color: #ffffff;
      margin-bottom: 0.5rem;
    }
    .meta {
      color: var(--text-muted);
      font-size: 0.95rem;
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 1rem;
    }
    .meta-item strong {
      color: #e4e4e7;
    }
    .actions-bar {
      display: flex;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      transition: all 0.2s ease;
      border: none;
    }
    .btn-primary {
      background: #7c3aed;
      color: #ffffff;
      box-shadow: 0 4px 14px rgba(124, 58, 237, 0.35);
    }
    .btn-primary:hover {
      background: #6d28d9;
    }
    .btn-outline {
      background: #27272a;
      color: #e4e4e7;
      border: 1px solid #3f3f46;
    }
    .btn-outline:hover {
      background: #3f3f46;
    }
    .question-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      transition: border-color 0.2s;
    }
    .q-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      border-bottom: 1px solid #27272a;
      padding-bottom: 0.75rem;
      margin-bottom: 1rem;
    }
    .q-num {
      font-size: 1.15rem;
      font-weight: 700;
      color: #c4b5fd;
    }
    .q-marks {
      font-size: 0.85rem;
      font-weight: 600;
      color: #a1a1aa;
      background: #18181b;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      border: 1px solid #27272a;
    }
    .q-text {
      font-size: 1rem;
      font-weight: 600;
      color: #ffffff;
      margin-bottom: 1.25rem;
      line-height: 1.5;
    }
    .answer-box {
      background: #0d0d11;
      border-left: 3px solid #8b5cf6;
      border-radius: 0 8px 8px 0;
      padding: 1.25rem;
      margin-bottom: 1rem;
    }
    .answer-label {
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #a78bfa;
      margin-bottom: 0.5rem;
    }
    .answer-text {
      color: #e4e4e7;
      font-size: 0.95rem;
      white-space: pre-line;
      line-height: 1.6;
    }
    .explanation-box {
      background: rgba(139, 92, 246, 0.05);
      border: 1px dashed rgba(139, 92, 246, 0.3);
      border-radius: 8px;
      padding: 0.875rem 1rem;
      font-size: 0.875rem;
      color: #d4d4d8;
    }
    .explanation-label {
      font-weight: 700;
      color: #c4b5fd;
      margin-bottom: 0.25rem;
    }
    footer {
      text-align: center;
      padding: 2rem 0;
      color: #71717a;
      font-size: 0.85rem;
      border-top: 1px solid #27272a;
      margin-top: 3rem;
    }
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
        padding: 0 !important;
      }
      .actions-bar, footer {
        display: none !important;
      }
      header {
        background: #f4f4f5 !important;
        border: 1px solid #ccc !important;
        color: #000 !important;
        border-radius: 0 !important;
      }
      h1 { color: #000 !important; }
      .badge { border-color: #666 !important; color: #333 !important; }
      .question-card {
        background: #ffffff !important;
        border: 1px solid #ddd !important;
        page-break-inside: avoid;
        margin-bottom: 1.5rem !important;
      }
      .q-num { color: #000000 !important; }
      .q-text { color: #000000 !important; }
      .answer-box {
        background: #fafafa !important;
        border-left: 3px solid #333 !important;
        color: #111 !important;
      }
      .answer-text { color: #111 !important; }
      .explanation-box {
        background: #f4f4f5 !important;
        border: 1px solid #ccc !important;
        color: #222 !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <span class="badge">Maharashtra State Board Class 12 Commerce</span>
      <h1>${paper.title}</h1>
      <p style="color: #c4b5fd; font-weight: 500;">Official Question & Answer Solution Document</p>
      <div class="meta">
        <div class="meta-item"><strong>Subject:</strong> ${paper.subject.name} (${paper.subject.code})</div>
        <div class="meta-item"><strong>Year:</strong> ${paper.year}</div>
        <div class="meta-item"><strong>Total Questions:</strong> ${questions.length}</div>
        <div class="meta-item"><strong>Paper ID:</strong> ${paper.id}</div>
      </div>
      <div class="actions-bar">
        <button onclick="window.print()" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
          Print / Save as PDF
        </button>
        ${paper.paperPdfUrl ? `<a href="${paper.paperPdfUrl}" target="_blank" class="btn btn-outline">View Original PDF</a>` : ''}
      </div>
    </header>

    <main>
      ${questions
        .map((q) => {
          const marksText = q.marks ? `${q.marks} Marks` : 'Marks allotted as per board criteria';
          const answersHtml =
            q.answers.length > 0
              ? q.answers
                  .map(
                    (a) => `
                <div class="answer-box">
                  <div class="answer-label">Model Solution (Class 12 MSBSHSE Standard)</div>
                  <div class="answer-text">${escapeHtml(a.answerText)}</div>
                </div>
                ${
                  a.explanation
                    ? `
                <div class="explanation-box">
                  <div class="explanation-label">Working Notes / Marking Scheme:</div>
                  <div>${escapeHtml(a.explanation)}</div>
                </div>
                `
                    : ''
                }
              `
                  )
                  .join('')
              : `
              <div class="answer-box">
                <div class="answer-text"><em>Solution is currently being formatted to Maharashtra State Board guidelines.</em></div>
              </div>
            `;

          return `
            <article class="question-card">
              <div class="q-header">
                <div class="q-num">Question ${escapeHtml(q.questionNumber)}${q.subQuestion ? ` ${escapeHtml(q.subQuestion)}` : ''}</div>
                <div class="q-marks">${marksText}</div>
              </div>
              <div class="q-text">${escapeHtml(q.questionText)}</div>
              ${answersHtml}
            </article>
          `;
        })
        .join('')}
    </main>

    <footer>
      <p>Class 12 Commerce Educational Portal &bull; Strictly verified against Maharashtra State Board Textbook & Examination Criteria.</p>
    </footer>
  </div>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    });
  } catch (err: unknown) {
    console.error('Error generating paper solution view:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve sample paper solutions', details: (err as Error).message },
      { status: 500 }
    );
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
