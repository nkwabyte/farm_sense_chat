'use server';
/**
 * @fileOverview This file defines a Genkit flow for answering questions based on the content of a PDF document.
 *
 * - answerQuestionsFromPdf - A function that takes a question and a PDF document as input and returns an answer based on the document's content.
 * - AnswerQuestionsFromPdfInput - The input type for the answerQuestionsFromPdf function.
 * - AnswerQuestionsFromPdfOutput - The return type for the answerQuestionsFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsFromPdfInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
  pdfDataUri: z
    .string()
    .describe(
      'The PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* Added description for data URI format */
    ),
});
export type AnswerQuestionsFromPdfInput = z.infer<
  typeof AnswerQuestionsFromPdfInputSchema
>;

const AnswerQuestionsFromPdfOutputSchema = z.object({
  answer: z.string().describe('The answer to the question.'),
  source: z
    .string()
    .describe('The source of the answer (PDF name and page numbers).'),
});
export type AnswerQuestionsFromPdfOutput = z.infer<
  typeof AnswerQuestionsFromPdfOutputSchema
>;

const pdfInformationTool = ai.defineTool(
  {
    name: 'getPdfInformation',
    description: 'This tool extracts relevant information from a PDF document to answer user questions about agriculture. Use this tool if the question requires information from the PDF document.',
    inputSchema: z.object({
      question: z.string().describe('The question to be answered.'),
      pdfDataUri: z
        .string()
        .describe(
          'The PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' /* Added description for data URI format */
        ),
    }),
    outputSchema: z.object({
      answer: z.string().describe('The answer to the question.'),
      source: z
        .string()
        .describe('The source of the answer (PDF name and page numbers).'),
    }),
  },
  async (input) => {
    // Placeholder implementation for extracting information from the PDF.
    // In a real application, this would involve parsing the PDF and
    // extracting relevant text based on the question.
    // For now, return a canned response.
    return {
      answer: `This is a placeholder answer from the PDF.  The question was: ${input.question}`,
      source: 'ExamplePDF.pdf, page 1',
    };
  },
);

const answerQuestionsFromPdfPrompt = ai.definePrompt({
  name: 'answerQuestionsFromPdfPrompt',
  tools: [pdfInformationTool],
  input: {schema: AnswerQuestionsFromPdfInputSchema},
  output: {schema: AnswerQuestionsFromPdfOutputSchema},
  prompt: `You are an AI assistant specialized in answering questions about agriculture based on uploaded PDF documents.

  If the question requires information from the PDF document, use the 'getPdfInformation' tool to extract relevant information from the PDF.
  Otherwise, if the question does not require information from the PDF document, respond using your general knowledge.

  Question: {{{question}}}
  PDF Document: {{media url=pdfDataUri}}`,
});

export async function answerQuestionsFromPdf(
  input: AnswerQuestionsFromPdfInput
): Promise<AnswerQuestionsFromPdfOutput> {
  return answerQuestionsFromPdfFlow(input);
}

const answerQuestionsFromPdfFlow = ai.defineFlow(
  {
    name: 'answerQuestionsFromPdfFlow',
    inputSchema: AnswerQuestionsFromPdfInputSchema,
    outputSchema: AnswerQuestionsFromPdfOutputSchema,
  },
  async input => {
    const {output} = await answerQuestionsFromPdfPrompt(input);
    return output!;
  }
);
