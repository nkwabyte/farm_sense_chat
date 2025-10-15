'use server';
/**
 * @fileOverview Summarizes the content of a PDF document.
 *
 * - summarizePdfContent - A function that handles the PDF summarization process.
 * - SummarizePdfContentInput - The input type for the summarizePdfContent function.
 * - SummarizePdfContentOutput - The return type for the summarizePdfContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePdfContentInputSchema = z.object({
  pdfText: z.string().describe('The text content extracted from the PDF document.'),
});
export type SummarizePdfContentInput = z.infer<typeof SummarizePdfContentInputSchema>;

const SummarizePdfContentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the PDF document content.'),
});
export type SummarizePdfContentOutput = z.infer<typeof SummarizePdfContentOutputSchema>;

export async function summarizePdfContent(input: SummarizePdfContentInput): Promise<SummarizePdfContentOutput> {
  return summarizePdfContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizePdfContentPrompt',
  input: {schema: SummarizePdfContentInputSchema},
  output: {schema: SummarizePdfContentOutputSchema},
  prompt: `You are Pomaa, an expert AI assistant from SesiTechnologies specializing in summarizing agricultural documents.

  Please provide a concise summary of the following PDF document content:

  {{pdfText}}`,
});

const summarizePdfContentFlow = ai.defineFlow(
  {
    name: 'summarizePdfContentFlow',
    inputSchema: SummarizePdfContentInputSchema,
    outputSchema: SummarizePdfContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
