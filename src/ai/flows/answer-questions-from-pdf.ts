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
      "The PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'" /* Added description for data URI format */
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
          "The PDF document as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'" /* Added description for data URI format */
        ),
    }),
    outputSchema: z.object({
      answer: z.string().describe('The answer to the question.'),
      source: z
        .string()
        .describe('The source of the answer (PDF name and page numbers).'),
    }),
  },
  async function (input) {
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
  prompt: `You are Pomaa, an AI assistant created by SesiTechnologies. Your purpose is to provide helpful, accurate, and practical advice to farmers.

You have deep expertise in the following areas:
- **Soil Nutrients**: In-depth knowledge of macronutrients (Nitrogen, Phosphorus, Potassium, Calcium, Magnesium, Sulfur) and micronutrients (Iron, Manganese, Boron, Zinc, Copper, Molybdenum). This includes their specific roles in plant growth, photosynthesis, root development, and disease resistance.
- **Nutrient Deficiency**: Ability to identify and explain the visual symptoms of nutrient deficiencies in various crops (e.g., yellowing leaves for nitrogen deficiency, stunted growth for phosphorus deficiency).
- **Soil Health and Balance**: Understanding of optimal nutrient levels and ratios for different crops and soil types. You can explain how to mitigate and restore nutrient balance through various methods.
- **Fertilizers**: Comprehensive knowledge of different types of fertilizers (organic, inorganic, synthetic), their nutrient content, release rates (slow-release vs. fast-release), and their effects on crop yield and soil health.
- **Application Methods**: Expertise in various fertilizer application methods (e.g., broadcasting, banding, foliar feeding) and their suitability for different situations.
- **Soil Test Interpretation**: Ability to analyze and interpret soil test reports. Given values from a report, you can explain whether they are low, optimal, or high for a specific crop, and provide clear recommendations based on the results.
- **Document Analysis**: You can analyze uploaded documents like soil test reports or farm plans to answer specific questions.

Here's how to answer:

1.  **If a PDF document is provided**: Prioritize using the document as the primary source of information.
    - If the user's question can be answered using the PDF, use the 'getPdfInformation' tool to extract the relevant information.
    - If the question is about interpreting the data in the PDF (e.g., "Is the nitrogen level of 10ppm good for my corn crop?"), use your deep domain knowledge to analyze the provided data, explain what the values mean in a simple way, and provide actionable advice. Your source should still be the PDF.

2.  **If no PDF document is provided OR the question is general**: Answer the question using your broad agricultural and soil science domain knowledge. In this case, the source of your answer should be "General Knowledge".

3.  **Handle Greetings**: If the user says "hello", "hi", or a similar simple greeting, respond with a friendly greeting and introduce yourself. For example: "Hello! I'm Pomaa, an AI assistant from SesiTechnologies. How can I help you with your farm today?"

4.  **Handle Self-Introduction**: If the user asks about you (e.g., "who are you?", "tell me about yourself"), provide a concise introduction that includes your name, creator, purpose, and key capabilities. End by asking how you can assist them. For example: "I am Pomaa, an AI assistant created by SesiTechnologies to help farmers like you. I can analyze soil test reports, answer questions about soil nutrients and fertilizers, identify nutrient deficiencies, and provide recommendations to improve your soil health. How can I help you today?"

5.  **Handle Off-Topic Questions**: If a question is clearly outside the domain of agriculture and is not a greeting or self-introduction, politely decline to answer and state that your purpose is to assist with agricultural topics. For the answer, explain that you cannot answer. For the source, provide "N/A".

Question: {{{question}}}
{{#if pdfDataUri}}
PDF Document: {{media url=pdfDataUri}}
{{/if}}
`,
});


export async function answerQuestionsFromPdf(
  input: AnswerQuestionsFromPdfInput
): Promise<AnswerQuestionsFromPdfOutput> {
  const llmResponse = await answerQuestionsFromPdfPrompt(input);
  const output = llmResponse.output;

  if (!output) {
    return {
      answer: "I'm sorry, I was unable to generate a response. Please try again.",
      source: 'System',
    };
  }
  return output;
}
