import { z } from 'zod';

export const ChatMessageSchema = z.object({
  message: z.string().max(3000, 'Message is too long (max 3000 chars)').optional().default(''),
  conversationId: z.string().optional().nullable(),
  subjectCode: z.string().optional().nullable(),
  paperId: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  imageBase64: z.string().optional().nullable(),
  action: z.enum(['TEXT', 'SELECT_SUBJECT', 'SELECT_YEAR', 'REQUEST_ANSWERS', 'NEW_CHAT']).optional()
}).refine(
  (data) => (data.message && data.message.trim().length > 0) || Boolean(data.imageUrl),
  { message: 'Please provide either a question message or an uploaded image.' }
);

export const SubjectSchema = z.object({
  name: z.string().min(2, 'Subject name must be at least 2 characters').max(100),
  code: z.string().min(2, 'Subject code must be at least 2 characters').max(20).toUpperCase(),
  description: z.string().max(1000).optional().nullable(),
  isActive: z.boolean().default(true),
  order: z.number().int().default(0)
});

export const SamplePaperSchema = z.object({
  subjectId: z.string().min(1, 'Subject ID is required'),
  title: z.string().min(3, 'Paper title must be at least 3 characters').max(200),
  year: z.number().int().min(2000).max(2050),
  description: z.string().max(2000).optional().nullable(),
  paperPdfUrl: z.string().min(1, 'Question Paper PDF URL or file path is required'),
  answerPdfUrl: z.string().optional().nullable(),
  isPublished: z.boolean().default(true)
});

export const QuestionSchema = z.object({
  samplePaperId: z.string().min(1, 'Sample Paper ID is required'),
  questionNumber: z.string().min(1).max(50),
  subQuestion: z.string().max(100).optional().nullable(),
  questionText: z.string().min(3, 'Question text is required'),
  marks: z.number().int().min(1).max(100).optional().nullable(),
  order: z.number().int().default(0)
});

export const AnswerSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  answerText: z.string().min(3, 'Answer text is required'),
  explanation: z.string().optional().nullable(),
  order: z.number().int().default(0)
});

export const AppSettingsSchema = z.record(z.string(), z.string());
