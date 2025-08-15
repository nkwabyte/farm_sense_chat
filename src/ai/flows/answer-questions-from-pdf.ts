'use server';
/**
 * @fileOverview This file defines a Genkit flow for answering questions based on the content of a PDF document.
 *
 * - answerQuestionsFromPdf - A function that takes a question and an optional PDF document as input and returns an answer based on the document's content or general agricultural knowledge.
 * - AnswerQuestionsFromPdfInput - The input type for the answerQuestionsFromPdf function.
 * - AnswerQuestionsFromPdfOutput - The return type for the answerQuestionsFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionsFromPdfInputSchema = z.object({
  question: z.string().describe('The question to be answered.'),
  pdfDataUri: z
    .string()
    .optional()
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
    .optional()
    .describe('The source of the answer (e.g., PDF name and page numbers, or "General Knowledge").'),
});
export type AnswerQuestionsFromPdfOutput = z.infer<
  typeof AnswerQuestionsFromPdfOutputSchema
>;

const pdfInformationTool = ai.defineTool(
  {
    name: 'getPdfInformation',
    description: 'This tool extracts relevant information from a PDF document to answer user questions about agriculture. Use this tool if a PDF is provided and the question requires specific information from it.',
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
  }
);

const answerQuestionsFromPdfPrompt = ai.definePrompt({
  name: 'answerQuestionsFromPdfPrompt',
  tools: [pdfInformationTool],
  input: {schema: AnswerQuestionsFromPdfInputSchema},
  output: {schema: AnswerQuestionsFromPdfOutputSchema},
  prompt: `You are an AI assistant specialized in agriculture. Your goal is to provide helpful and accurate information to farmers.

You have expertise in the following areas:
- The importance of soil quantities (like pH, nitrogen, phosphorus, potassium) and how they help plants.
- Recommended nutrients for various crops.
- The effects of nutrient deficiencies in crops.
- Different types of fertilizers and their effects on crops.
- Various fertilizer application methods.
- Interpreting soil test reports to determine if the readings are good or bad for a given crop.

Here's how to answer:

1.  **If a PDF document is provided**: Prioritize using the document as the primary source of information.
    - If the user's question can be answered using the PDF, use the 'getPdfInformation' tool to extract the relevant information.
    - If the question is about interpreting the data in the PDF (e.g., "Is the nitrogen level good?"), use your domain knowledge to analyze the provided data and provide an interpretation. Your source should still be the PDF.

2.  **If no PDF document is provided OR the question is general**: Answer the question using your broad agricultural domain knowledge. In this case, the source of your answer should be "General Knowledge".

3.  **If a question is outside the domain of agriculture**: Politely decline to answer and state that your purpose is to assist with agricultural topics. For the answer, explain that you cannot answer. For the source, provide "N/A".

Question: {{{question}}}
{{#if pdfDataUri}}
PDF Document: {{media url=pdfDataUri}}
{{/if}}
`,
});


export async function answerQuestionsFromPdf(
  input: AnswerQuestionsFromPdvInput
): Promise<AnswerQuestionsFromPdfOutput> {
  const llmResponse = await answerQuestionsFromPdfPrompt(input);
  const output = llmResponse.output();

  if (!output) {
    return {
      answer: "I'm sorry, I was unable to generate a response. Please try again.",
      source: 'System',
    };
  }
  return output;
}

const answerQuestionsFromPdfFlow = ai.defineFlow(
  {
    name: 'answerQuestionsFromPdfFlow',
    inputSchema: AnswerQuestionsFromPdfInputSchema,
    outputSchema: AnswerQuestionsFromPdfOutputSchema,
  },
  async input => {
    const llmResponse = await answerQuestionsFromPdfPrompt(input);
    const output = llmResponse.output();
    
    if (!output) {
      return {
        answer: "I'm sorry, I was unable to generate a response. Please try again.",
        source: "System"
      };
    }
    return output;
  }
);