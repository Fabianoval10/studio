// src/ai/flows/initial-report-template.ts
'use server';

/**
 * @fileOverview Generates an initial ultrasound report template based on a prompt.
 *
 * - generateInitialReport - A function that generates the initial report.
 * - InitialReportInput - The input type for the generateInitialReport function.
 * - InitialReportOutput - The return type for the generateInitialReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const InitialReportInputSchema = z.object({
  prompt: z.string().describe('A prompt describing the ultrasound report.'),
});
export type InitialReportInput = z.infer<typeof InitialReportInputSchema>;

const InitialReportOutputSchema = z.object({
  report: z.string().describe('The generated ultrasound report.'),
});
export type InitialReportOutput = z.infer<typeof InitialReportOutputSchema>;

export async function generateInitialReport(input: InitialReportInput): Promise<InitialReportOutput> {
  return initialReportFlow(input);
}

const initialReportPrompt = ai.definePrompt({
  name: 'initialReportPrompt',
  input: {schema: InitialReportInputSchema},
  output: {schema: InitialReportOutputSchema},
  prompt: `You are an expert veterinary ultrasound report generator.
  Based on the following prompt, generate a detailed ultrasound report.

  Prompt: {{{prompt}}}
  `,
});

const initialReportFlow = ai.defineFlow(
  {
    name: 'initialReportFlow',
    inputSchema: InitialReportInputSchema,
    outputSchema: InitialReportOutputSchema,
  },
  async input => {
    const {output} = await initialReportPrompt(input);
    return output!;
  }
);
