import fs from 'fs';
import path from 'path';

function createMinimalPdf(title: string, subtitle: string, lines: string[]): Buffer {
  const contentStream = [
    'BT',
    '/F1 18 Tf',
    '50 730 Td',
    `(${title.replace(/[()\\]/g, '')}) Tj`,
    '/F1 12 Tf',
    '0 -30 Td',
    `(${subtitle.replace(/[()\\]/g, '')}) Tj`,
    '/F1 10 Tf',
    '0 -25 Td',
    ...lines.map((l) => `(${l.replace(/[()\\]/g, '')}) Tj 0 -16 Td`),
    'ET'
  ].join('\n');

  const streamLen = Buffer.byteLength(contentStream, 'utf8');

  const obj1 = '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n';
  const obj2 = '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n';
  const obj3 = '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n';
  const obj4 = `4 0 obj\n<< /Length ${streamLen} >>\nstream\n${contentStream}\nendstream\nendobj\n`;
  const obj5 = '5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n';

  const header = '%PDF-1.4\n';
  const offset1 = header.length;
  const offset2 = offset1 + obj1.length;
  const offset3 = offset2 + obj2.length;
  const offset4 = offset3 + obj3.length;
  const offset5 = offset4 + obj4.length;
  const xrefOffset = offset5 + obj5.length;

  const pad = (n: number) => n.toString().padStart(10, '0');

  const xref = [
    'xref',
    '0 6',
    '0000000000 65535 f ',
    `${pad(offset1)} 00000 n `,
    `${pad(offset2)} 00000 n `,
    `${pad(offset3)} 00000 n `,
    `${pad(offset4)} 00000 n `,
    `${pad(offset5)} 00000 n `,
    'trailer',
    '<< /Size 6 /Root 1 0 R >>',
    'startxref',
    `${xrefOffset}`,
    '%%EOF\n'
  ].join('\n');

  const fullPdf = header + obj1 + obj2 + obj3 + obj4 + obj5 + xref;
  return Buffer.from(fullPdf, 'utf-8');
}

const outDir = path.join(process.cwd(), 'public', 'sample-papers');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const papers = [
  {
    code: 'ocm',
    years: [2024, 2025, 2026],
    subjectName: 'Organization of Commerce and Management',
    q: [
      'Q.1 (A) Select correct option and rewrite the sentence (5 Marks)',
      '1. Principle of specialisation applies to all work: Division of Work',
      '2. Henry Fayol is known as the father of modern management.',
      'Q.2 Explain the concept of Outsourcing and BPO (8 Marks)',
      'Q.3 Case Study: Consumer Protection Act 2019 provisions (10 Marks)'
    ],
    ans: [
      'MODEL ANSWERS & EVALUATION CRITERIA',
      'Ans 1: Division of Work divides total work into small units for efficiency.',
      'Ans 2: Modern management principles by Fayol emphasize 14 principles.',
      'Ans 3: BPO involves contracting non-core activities to specialized third parties.',
      'Ans 4: Consumer Redressal Forums: District Commission, State, National.'
    ]
  },
  {
    code: 'bk',
    years: [2024, 2025, 2026],
    subjectName: 'Book Keeping and Accountancy',
    q: [
      'Q.1 Objective Questions & Multiple Choice (5 Marks)',
      'Q.2 Partnership Final Accounts: Trading, P&L A/c and Balance Sheet (12 Marks)',
      'Trial Balance Details: Purchases Rs. 45,000, Sales Rs. 85,000, Capital Rs. 50,000',
      'Q.3 Admission of a Partner: Revaluation A/c and Goodwill Treatment (10 Marks)',
      'Q.4 Dissolution of Partnership Firm: Realisation Account entries (10 Marks)'
    ],
    ans: [
      'MODEL ANSWERS & COMPUTATION SHEET',
      'Trading A/c Gross Profit calculated: Rs. 40,000.',
      'Net Profit transferred to Partners Capital in 3:2 ratio: Rs. 24,000 and Rs. 16,000.',
      'Balance Sheet total tallied at Rs. 1,12,000.',
      'Sacrificing Ratio = Old Ratio - New Ratio. Goodwill credited to sacrificing partners.',
      'Realisation Account: Realisation Profit Rs. 4,500 distributed equally.'
    ]
  },
  {
    code: 'eco',
    years: [2024, 2025, 2026],
    subjectName: 'Economics',
    q: [
      'Q.1 Choose the correct alternative (5 Marks)',
      'Q.2 Explain the Law of Diminishing Marginal Utility with assumptions (8 Marks)',
      'Q.3 Types of Price Elasticity of Demand: Ed = 0, Ed = 1, Ed > 1 (8 Marks)',
      'Q.4 National Income: Measurement methods and difficulties (10 Marks)',
      'Q.5 Role of Reserve Bank of India in monetary policy (8 Marks)'
    ],
    ans: [
      'MODEL ANSWERS & DIAGRAMS EXPLANATION',
      'Law of DMU: Other things remaining constant, additional utility diminishes.',
      'Assumptions: Rationality, Cardinal measurement, Homogeneity, Continuity.',
      'Elasticity Types: Perfectly Elastic, Perfectly Inelastic, Unitary, Relatively Elastic.',
      'National Income: Output Method, Income Method, Expenditure Method.',
      'RBI Tools: Repo Rate, Reverse Repo Rate, CRR, SLR, Open Market Operations.'
    ]
  },
  {
    code: 'sp',
    years: [2024, 2025, 2026],
    subjectName: 'Secretarial Practice',
    q: [
      'Q.1 Match the pairs and fill in the blanks (5 Marks)',
      'Q.2 Distinguish between Shares and Debentures (5 Marks)',
      'Q.3 Draft a letter to shareholder regarding payment of dividend through ECS (5 Marks)',
      'Q.4 Procedure for issue of bonus shares under Companies Act 2013 (10 Marks)'
    ],
    ans: [
      'MODEL ANSWERS & FORMAL LETTER TEMPLATES',
      'Shares represent ownership capital; Debentures represent borrowed capital.',
      'Dividend letter drafted with reference number, Folio number, and dividend warrant.',
      'Bonus shares issued out of free reserves or securities premium account.',
      'Board resolution and shareholders approval in general meeting mandatory.'
    ]
  },
  {
    code: 'eng',
    years: [2024, 2025, 2026],
    subjectName: 'English (Class 12 Commerce)',
    q: [
      'Section I: Reading Skill, Grammar, Vocabulary (16 Marks)',
      'Section II: Poetry and Appreciation (14 Marks)',
      'Section III: Writing Skills - Report Writing, Statement of Purpose (16 Marks)',
      'Section IV: Novel - History of English Drama and Commerce themes (16 Marks)'
    ],
    ans: [
      'MODEL ANSWERS & MARKING SCHEME',
      'Reading passage comprehension key points and vocabulary contextual meanings.',
      'Poetic appreciation: Theme, Poetic devices, Rhyme scheme, Personal opinion.',
      'Writing Skills: Format 1 mark, Content 2 marks, Language accuracy 1 mark.',
      'Novel responses: Character sketch, Theme of commercialization and morality.'
    ]
  },
  {
    code: 'it',
    years: [2024, 2025, 2026],
    subjectName: 'Information Technology',
    q: [
      'Q.1 Multiple Choice Questions (Single and Multiple Correct) (10 Marks)',
      'Q.2 Fill in blanks: Advanced Web Designing HTML5 and CSS3 (10 Marks)',
      'Q.3 Digital Marketing: SEO Techniques, On-page and Off-page optimization (8 Marks)',
      'Q.4 Computing with ERP and E-Commerce security protocols (10 Marks)'
    ],
    ans: [
      'MODEL ANSWERS & CODE SAMPLES',
      'HTML5 semantic tags: <header>, <nav>, <section>, <article>, <footer>.',
      'CSS Flexbox properties: display: flex, justify-content, align-items.',
      'SEO on-page: Title tag, Meta description, Alt tags, Keyword density.',
      'E-Commerce security: SSL/TLS encryption, SET protocol, 2FA authorization.'
    ]
  }
];

papers.forEach((p) => {
  p.years.forEach((yr) => {
    const qPdf = createMinimalPdf(
      `Class 12 Commerce - ${p.subjectName}`,
      `Board Sample Examination Paper - Academic Year ${yr}`,
      p.q
    );
    const aPdf = createMinimalPdf(
      `Class 12 Commerce - ${p.subjectName} (Official Solutions)`,
      `Model Answers & Marking Scheme - Year ${yr}`,
      p.ans
    );

    const qPath = path.join(outDir, `${p.code}-sample-paper-${yr}.pdf`);
    const aPath = path.join(outDir, `${p.code}-model-answers-${yr}.pdf`);

    fs.writeFileSync(qPath, qPdf);
    fs.writeFileSync(aPath, aPdf);
  });
});

console.log('Sample paper PDFs created in public/sample-papers successfully!');
