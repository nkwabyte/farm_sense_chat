'use server';
/**
 * @fileOverview This file defines a Genkit flow for formatting a technical soil test report into a simple, farmer-friendly version.
 *
 * - formatFarmerReport - A function that takes the text of a report and formats it.
 * - FormatFarmerReportInput - The input type for the formatFarmerReport function.
 * - FormatFarmerReportOutput - The return type for the formatFarmerReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatFarmerReportInputSchema = z.object({
  reportText: z.string().describe('The text content of the technical soil report.'),
});
export type FormatFarmerReportInput = z.infer<typeof FormatFarmerReportInputSchema>;

const FormatFarmerReportOutputSchema = z.object({
  farmDetails: z.string().describe('Summary of the farm name, size, crop, and location.'),
  whatWeChecked: z.string().describe('List of soil properties tested with simple explanations.'),
  whatWeFound: z.string().describe('Explanation of the test results in plain terms.'),
  whatYouShouldDo: z.string().describe('Clear fertilizer advice: type, amount, and application.'),
  moneyMatters: z.string().describe('Total fertilizer cost and expected profit in simple terms.'),
  extraTips: z.string().describe('Other instructions like applying lime or manure with explanations.'),
  detailedExplanation: z.string().describe('A detailed explanation of what the values, details, and figures in the report mean for the farmer and their crops.'),
});
export type FormatFarmerReportOutput = z.infer<typeof FormatFarmerReportOutputSchema>;

export async function formatFarmerReport(input: FormatFarmerReportInput): Promise<FormatFarmerReportOutput> {
  return formatFarmerReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatFarmerReportPrompt',
  input: {schema: FormatFarmerReportInputSchema},
  output: {schema: FormatFarmerReportOutputSchema},
  prompt: `You are a helpful assistant. Your task is to rewrite a technical soil test report and nutrient management plan into a simple and friendly version that an average Ghanaian farmer can easily understand.
The report includes test results for a soybean farmplot, fertilizer recommendations, and a profit estimate. Farmers may not have much formal education, so use clear and plain language. Avoid technical words. If you must use any, explain them in very simple terms.
Structure your response in the following sections:

Farm Details
Summarize the farm name, size, crop, and location.

What We Checked
List the soil properties that were tested, like nitrogen, phosphorus, potassium, and pH. Use simple explanations for what each of them means for plant growth.

What We Found
Explain the results in plain terms, e.g. "Your soil does not have enough nitrogen, but the potassium level is okay."

What You Should Do
Break down the fertilizer advice clearly. Explain:

What type of fertilizer to use

How much to use

When and how to apply it
Use simple units like number of bags or grams per planting hill if given.

Money Matters
Mention the total cost of the fertilizer and the expected profit in simple words. For example, "If you follow the plan, you can make about GHS 3,600 profit after buying fertilizer."

Extra Tips
Give any other instructions like applying lime or manure, and explain why it is helpful. Use farming actions the farmer is familiar with.

Detailed Explanation
After formatting the report, provide a detailed explanation of what the values, details, and figures in the report mean for the farmer and their crops. Explain the 'why' behind the advice. For example, if you recommend a certain fertilizer, explain why that specific type is good for their soil and crop. If a pH level is bad, explain what that means for nutrient absorption.

Keep the sentences short and easy to follow. Use no special characters, no emojis, and no complicated formatting. The tone should be respectful, clear, and helpful.

Here is the report content:
{{{reportText}}}
`,
});

const formatFarmerReportFlow = ai.defineFlow(
  {
    name: 'formatFarmerReportFlow',
    inputSchema: FormatFarmerReportInputSchema,
    outputSchema: FormatFarmerReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
