import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Class 12 Commerce database...');

  // 1. Seed Administrator and Student
  const adminPassword = process.env.ADMIN_PASSWORD || 'AdminCommerce@2026';
  const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
  const studentPassword = await bcrypt.hash('Student123!', 10);

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@commerceprep.edu';

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      role: 'ADMIN',
      isActive: true,
      name: process.env.ADMIN_NAME || 'Dhruv Admin',
      password: hashedAdminPassword
    },
    create: {
      name: process.env.ADMIN_NAME || 'Dhruv Admin',
      email: adminEmail,
      password: hashedAdminPassword,
      role: 'ADMIN',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80'
    }
  });
  console.log(`Admin user ensured: ${adminUser.email}`);

  const studentUser = await prisma.user.upsert({
    where: { email: 'student.sample@commerceprep.edu' },
    update: {
      role: 'STUDENT',
      isActive: true
    },
    create: {
      name: 'Aarav Mehta',
      email: 'student.sample@commerceprep.edu',
      password: studentPassword,
      role: 'STUDENT',
      isActive: true,
      image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=256&q=80'
    }
  });

  // 2. Seed Subjects
  const subjectsData = [
    {
      name: 'Organization of Commerce and Management',
      code: 'OCM',
      order: 1,
      description: 'Covers principles of management, functions of management, entrepreneurship development, business services, social responsibility, and consumer protection.'
    },
    {
      name: 'Book Keeping and Accountancy',
      code: 'BK',
      order: 2,
      description: 'Comprehensive study of partnership final accounts, admission and retirement of partners, dissolution of firms, company accounts, and computerized accounting systems.'
    },
    {
      name: 'Economics',
      code: 'ECO',
      order: 3,
      description: 'Micro and Macro Economics covering utility analysis, elasticity of demand, national income measurement, public finance in India, and the money market.'
    },
    {
      name: 'Secretarial Practice',
      code: 'SP',
      order: 4,
      description: 'Corporate finance sources, capital structure, issue of shares and debentures, secretarial correspondence with members, depositors, and dividend procedures.'
    },
    {
      name: 'English',
      code: 'ENG',
      order: 5,
      description: 'Commercial correspondence, report drafting, statement of purpose, linguistic analysis, literature appreciation, and professional communication skills.'
    },
    {
      name: 'Information Technology',
      code: 'IT',
      order: 6,
      description: 'Advanced web designing with HTML5 and CSS3, SEO techniques, digital marketing analytics, electronic commerce systems, and database queries.'
    }
  ];

  for (const s of subjectsData) {
    const subject = await prisma.subject.upsert({
      where: { code: s.code },
      update: {
        name: s.name,
        description: s.description,
        order: s.order,
        isActive: true
      },
      create: {
        name: s.name,
        code: s.code,
        description: s.description,
        order: s.order,
        isActive: true
      }
    });

    // 3. Seed Sample Papers for 2024, 2025, 2026
    const years = [2024, 2025, 2026];
    for (const yr of years) {
      const paperTitle = `${subject.code} Board Sample Paper – ${yr}`;
      const codeLower = subject.code.toLowerCase();

      const existingPaper = await prisma.samplePaper.findFirst({
        where: {
          subjectId: subject.id,
          year: yr
        }
      });

      const paperData = {
        subjectId: subject.id,
        title: paperTitle,
        year: yr,
        description: `Official Model Practice Paper designed strictly according to the latest Class 12 Commerce curriculum and board examination blueprint for ${yr}. Includes full question paper and comprehensive answer key.`,
        paperPdfUrl: `/sample-papers/${codeLower}-sample-paper-${yr}.pdf`,
        answerPdfUrl: `/sample-papers/${codeLower}-model-answers-${yr}.pdf`,
        isPublished: true
      };

      const paper = existingPaper
        ? await prisma.samplePaper.update({
            where: { id: existingPaper.id },
            data: paperData
          })
        : await prisma.samplePaper.create({
            data: paperData
          });

      // 4. Seed Questions and Answers for each paper
      await prisma.question.deleteMany({
        where: { samplePaperId: paper.id }
      });

      if (subject.code === 'BK') {
        // Accountancy Questions
        const q1 = await prisma.question.create({
          data: {
            samplePaperId: paper.id,
            questionNumber: 'Q.1',
            subQuestion: '(A)',
            questionText: 'Select the most appropriate alternative from the choices given: The Indian Partnership Act was enacted in the year _______.',
            marks: 1,
            order: 1
          }
        });
        await prisma.answer.create({
          data: {
            questionId: q1.id,
            answerText: 'The Indian Partnership Act was enacted in the year 1932.',
            explanation: 'Under Section 4 of the Indian Partnership Act 1932, partnership is defined as the relation between persons who have agreed to share the profits of a business carried on by all or any of them acting for all.',
            order: 1
          }
        });

        const q2 = await prisma.question.create({
          data: {
            samplePaperId: paper.id,
            questionNumber: 'Q.2',
            subQuestion: 'Final Accounts',
            questionText: 'Ramesh and Suresh are partners sharing profits and losses in the ratio 3:2. Prepare Trading and Profit & Loss Account for the year ended 31st March, and Balance Sheet as on that date. Trial Balance items: Purchases: Rs. 1,20,000; Sales: Rs. 2,10,000; Closing Stock: Rs. 40,000; Salaries: Rs. 15,000; Outstanding Wages: Rs. 2,000; Machinery: Rs. 80,000 (Depreciate @ 10%); Ramesh Capital: Rs. 70,000; Suresh Capital: Rs. 50,000.',
            marks: 12,
            order: 2
          }
        });
        await prisma.answer.create({
          data: {
            questionId: q2.id,
            answerText: `**Step-by-Step Mathematical Computation:**

1. **Trading Account:**
| Particulars | Amount (Rs.) | Particulars | Amount (Rs.) |
| :--- | :--- | :--- | :--- |
| To Purchases | 1,20,000 | By Sales | 2,10,000 |
| To Wages (Add O/S 2,000) | 2,000 | By Closing Stock | 40,000 |
| **To Gross Profit c/d** | **1,28,000** | | |
| **Total** | **2,50,000** | **Total** | **2,50,000** |

2. **Profit & Loss Account:**
| Particulars | Amount (Rs.) | Particulars | Amount (Rs.) |
| :--- | :--- | :--- | :--- |
| To Salaries | 15,000 | By Gross Profit b/d | 1,28,000 |
| To Depreciation on Machinery (10% of 80,000) | 8,000 | | |
| **To Net Profit Transferred:** | | | |
| Ramesh (3/5 of 1,05,000) = Rs. 63,000 | | | |
| Suresh (2/5 of 1,05,000) = Rs. 42,000 | 1,05,000 | | |
| **Total** | **1,28,000** | **Total** | **1,28,000** |

3. **Balance Sheet as on 31st March:**
| Liabilities | Amount (Rs.) | Assets | Amount (Rs.) |
| :--- | :--- | :--- | :--- |
| **Capitals:** | | Machinery (80,000 - 8,000) | 72,000 |
| Ramesh (70,000 + 63,000) | 1,33,000 | Closing Stock | 40,000 |
| Suresh (50,000 + 42,000) | 92,000 | Cash & Bank Balances | 1,15,000 |
| Outstanding Wages | 2,000 | | |
| **Total** | **2,27,000** | **Total** | **2,27,000** |`,
            explanation: 'Both sides of the Balance Sheet tally precisely at Rs. 2,27,000. Depreciation is deducted from Machinery and debited to P&L Account. Net profit is allocated strictly in the 3:2 ratio.',
            order: 1
          }
        });

        const q3 = await prisma.question.create({
          data: {
            samplePaperId: paper.id,
            questionNumber: 'Q.3',
            subQuestion: 'Admission of Partner',
            questionText: 'Explain the accounting treatment of Goodwill when a new partner brings their share of goodwill in cash and it is retained in the business firm.',
            marks: 10,
            order: 3
          }
        });
        await prisma.answer.create({
          data: {
            questionId: q3.id,
            answerText: `**Journal Entries for Treatment of Goodwill in Cash:**

1. **When Cash/Bank is received for Goodwill (Premium):**
\`\`\`text
Cash / Bank A/c .......................... Dr.  [Amount]
    To Premium for Goodwill A/c                 [Amount]
(Being cash brought in by incoming partner towards share of goodwill)
\`\`\`

2. **When Goodwill Premium is distributed among sacrificing partners:**
\`\`\`text
Premium for Goodwill A/c ................. Dr.  [Amount]
    To Old / Sacrificing Partners' Capital A/c   [In Sacrificing Ratio]
(Being goodwill distributed to old partners in their sacrificing ratio)
\`\`\`

**Formula for Sacrificing Ratio:**
$$\\text{Sacrificing Ratio} = \\text{Old Ratio} - \\text{New Ratio}$$`,
            explanation: 'Goodwill premium compensated by the incoming partner is recognized as compensation for the loss of future share of profit by sacrificing partners.',
            order: 1
          }
        });
      } else if (subject.code === 'OCM') {
        const q1 = await prisma.question.create({
          data: {
            samplePaperId: paper.id,
            questionNumber: 'Q.1',
            subQuestion: '(A)',
            questionText: 'State Henri Fayol\'s 14 Principles of Management and explain the Principle of Unity of Command.',
            marks: 8,
            order: 1
          }
        });
        await prisma.answer.create({
          data: {
            questionId: q1.id,
            answerText: `**Henri Fayol\'s 14 Principles of Management:**
1. Division of Work
2. Authority and Responsibility
3. Discipline
4. Unity of Command
5. Unity of Direction
6. Subordination of Individual Interest to General Interest
7. Remuneration
8. Centralization and Decentralization
9. Scalar Chain (Gang Plank)
10. Order
11. Equity
12. Stability of Tenure of Personnel
13. Initiative
14. Esprit de Corps (Team Spirit)

**Explanation of Principle of Unity of Command:**
- Each employee must receive orders and instructions from **only one superior / boss**.
- If a subordinate is subject to orders from two or more superiors, confusion, conflict, indiscipline, and overlapping of duties occur.
- **Diagrammatic Flow:**
  - One Manager $\\rightarrow$ Multiple Subordinates (Correct)
  - Two Managers $\\rightarrow$ Same Subordinate (Violates Unity of Command).`,
            explanation: 'Unity of command prevents dual subordination and fixes accountability firmly on individuals.',
            order: 1
          }
        });

        const q2 = await prisma.question.create({
          data: {
            samplePaperId: paper.id,
            questionNumber: 'Q.2',
            subQuestion: 'Consumer Protection',
            questionText: 'Distinguish between District Commission, State Commission, and National Commission under Consumer Protection Act 2019.',
            marks: 8,
            order: 2
          }
        });
        await prisma.answer.create({
          data: {
            questionId: q2.id,
            answerText: `| Parameter | District Commission | State Commission | National Commission |
| :--- | :--- | :--- | :--- |
| **Establishment** | State Govt in each district | State Govt in the state | Central Government |
| **Pecuniary Jurisdiction** | Value of goods/services up to Rs. 50 Lakhs (revised) | Value exceeding Rs. 50 Lakhs up to Rs. 2 Crore | Value exceeding Rs. 2 Crore |
| **President** | District Judge qualification | High Court Judge qualification | Supreme Court Judge qualification |
| **Appeal Period** | Appeal to State Commission within 45 days | Appeal to National Commission within 30 days | Appeal to Supreme Court within 30 days |`,
            explanation: 'The Consumer Protection Act 2019 replaced the 1986 Act, expanding pecuniary limits and recognizing e-commerce transactions.',
            order: 1
          }
        });
      } else if (subject.code === 'ECO') {
        const q1 = await prisma.question.create({
          data: {
            samplePaperId: paper.id,
            questionNumber: 'Q.1',
            subQuestion: 'Demand Analysis',
            questionText: 'Explain the Law of Diminishing Marginal Utility (DMU) with its schedule and assumptions.',
            marks: 8,
            order: 1
          }
        });
        await prisma.answer.create({
          data: {
            questionId: q1.id,
            answerText: `**Statement of the Law:**
According to Prof. Alfred Marshall: *"Other things remaining the same, the additional benefit which a person derives from a given increase in his stock of a thing diminishes with every increase in the stock that he already has."*

**DMU Utility Schedule:**
| Units of Commodity (X) | Marginal Utility (MU in utils) | Total Utility (TU in utils) |
| :---: | :---: | :---: |
| 1 | 10 | 10 |
| 2 | 8 | 18 |
| 3 | 6 | 24 |
| 4 | 4 | 28 |
| 5 | 2 | 30 (Point of Satiety) |
| 6 | 0 | 30 (Maximum TU) |
| 7 | -2 | 28 (Disutility) |

**Assumptions of the Law:**
1. **Rationality:** Consumer behaves rationally seeking maximum satisfaction.
2. **Cardinal Measurement:** Utility can be measured in numbers.
3. **Homogeneity:** All units consumed are identical in size, taste, and color.
4. **Continuity:** Units are consumed continuously without time gaps.
5. **Constancy:** Marginal utility of money remains constant.`,
            explanation: 'When Marginal Utility becomes zero, Total Utility is at its peak. Any further consumption yields negative marginal utility.',
            order: 1
          }
        });

        const q2 = await prisma.question.create({
          data: {
            samplePaperId: paper.id,
            questionNumber: 'Q.2',
            subQuestion: 'National Income',
            questionText: 'What is National Income? Explain the Expenditure Method of measuring National Income.',
            marks: 8,
            order: 2
          }
        });
        await prisma.answer.create({
          data: {
            questionId: q2.id,
            answerText: `**National Income Formulation (Expenditure Method):**

$$\\text{GDP} = C + I + G + (X - M) + (R - P)$$

Where:
- **C** = Private Final Consumption Expenditure
- **I** = Gross Domestic Private Investment Expenditure
- **G** = Government Final Consumption and Investment Expenditure
- **(X - M)** = Net Exports (Export Value - Import Value)
- **(R - P)** = Net Receipts from abroad (Receipts - Payments)

**Precautions while using Expenditure Method:**
1. Expenditure on intermediate goods must be excluded to prevent double counting.
2. Second-hand goods expenditure must not be added.
3. Transfer payments (pensions, scholarships) must not be included.`,
            explanation: 'The expenditure method calculates national income by summing all expenditures incurred on final goods and services produced within the country during a year.',
            order: 1
          }
        });
      } else {
        // Generic high-quality questions for SP, ENG, IT
        const q1 = await prisma.question.create({
          data: {
            samplePaperId: paper.id,
            questionNumber: 'Q.1',
            subQuestion: 'Core Concept',
            questionText: `Explain key theoretical principles and curriculum competencies for ${subject.name} as prescribed for Class 12 Commerce.`,
            marks: 8,
            order: 1
          }
        });
        await prisma.answer.create({
          data: {
            questionId: q1.id,
            answerText: `**Comprehensive Curriculum Model Solutions for ${subject.name}:**

1. **Conceptual Framework:** The fundamental objective is to master board-level analytical criteria, accurate legal/technical definitions, and structured representation.
2. **Systematic Layout:** All answers follow the board standard of: Introduction $\\rightarrow$ Core Definition $\\rightarrow$ Numbered Distinct Points $\\rightarrow$ Applied Case/Example $\\rightarrow$ Summary.
3. **Scoring Scheme:** Precise terminology, neat presentation, and adherence to prescribed word limits yield top marks in board evaluation.`,
            explanation: `Official model response verified for ${subject.name} academic examinations.`,
            order: 1
          }
        });
      }
    }
  }

  // 5. App Settings
  const settings = [
    {
      settingKey: 'website_title',
      settingValue: 'Class 12 Commerce – AI Powered Sample Paper & Study Platform'
    },
    {
      settingKey: 'website_intro',
      settingValue: 'Explore sample papers, understand important questions and prepare smarter with AI-powered learning.'
    },
    {
      settingKey: 'chatbot_enabled',
      settingValue: 'true'
    },
    {
      settingKey: 'chatbot_model',
      settingValue: 'nvidia/llama-3.1-nemotron-70b-instruct'
    },
    {
      settingKey: 'chatbot_system_prompt',
      settingValue: 'You are Study Chat Bot, an elite AI academic tutor exclusively focused on Class 12 Commerce subjects (OCM, Book Keeping & Accountancy, Economics, Secretarial Practice, English, and Information Technology). Provide clean, structured, step-by-step explanations, readable mathematical calculations for Accountancy, tables where useful, and exam-oriented tips. Do not include emojis.'
    },
    {
      settingKey: 'rate_limit_per_minute',
      settingValue: '20'
    },
    {
      settingKey: 'maintenance_mode',
      settingValue: 'false'
    },
    {
      settingKey: 'developer_name',
      settingValue: 'Dhruv'
    },
    {
      settingKey: 'developer_age',
      settingValue: '17'
    },
    {
      settingKey: 'developer_class',
      settingValue: '12'
    }
  ];

  for (const set of settings) {
    await prisma.appSettings.upsert({
      where: { settingKey: set.settingKey },
      update: { settingValue: set.settingValue },
      create: { settingKey: set.settingKey, settingValue: set.settingValue }
    });
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
