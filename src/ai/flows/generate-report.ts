'use server';

/**
 * @fileOverview Generates a draft ultrasound report from structured data input.
 *
 * - generateReport - A function that handles the generation of the ultrasound report.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportInputSchema = z.object({
  examType: z.string().describe('Type of ultrasound exam performed.'),
  animalSpecies: z.string().describe('Species of the animal examined.'),
  animalBreed: z.string().describe('Breed of the animal examined.'),
  animalSex: z.string().describe('Sex of the animal examined.'),
  animalAge: z.number().describe('Age of the animal in years.'),
  examDate: z.string().describe('Date the ultrasound exam was performed.'),
  findings: z.string().describe('Structured findings from the ultrasound exam.'),
  additionalNotes: z.string().optional().describe('Any additional notes or observations.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  reportText: z.string().describe('The generated ultrasound report text.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an experienced veterinary radiologist. Generate a detailed ultrasound report based on the following structured data. Use appropriate veterinary terminology.

Exam Type: {{{examType}}}
Animal Species: {{{animalSpecies}}}
Animal Breed: {{{animalBreed}}}
Animal Sex: {{{animalSex}}}
Animal Age: {{{animalAge}}} years
Exam Date: {{{examDate}}}
Findings: {{{findings}}}
Additional Notes: {{{additionalNotes}}}

Report:
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
