
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
  examType: z.string().describe('Tipo de exame de ultrassom realizado.'),
  animalSpecies: z.string().describe('Espécie do animal examinado.'),
  animalBreed: z.string().describe('Raça do animal examinado.'),
  animalSex: z.string().describe('Sexo do animal examinado.'),
  animalAge: z.number().describe('Idade do animal em anos.'),
  examDate: z.string().describe('Data em que o exame de ultrassom foi realizado.'),
  findings: z.string().describe('Achados estruturados do exame de ultrassom.'),
  additionalNotes: z.string().optional().describe('Quaisquer notas ou observações adicionais.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  reportText: z.string().describe('O texto do laudo de ultrassom gerado.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `Você é um radiologista veterinário experiente. Gere um laudo de ultrassom detalhado com base nos seguintes dados estruturados. Use terminologia veterinária apropriada. O laudo deve ser gerado em Português do Brasil.

Tipo de Exame: {{{examType}}}
Espécie Animal: {{{animalSpecies}}}
Raça Animal: {{{animalBreed}}}
Sexo Animal: {{{animalSex}}}
Idade Animal: {{{animalAge}}} anos
Data do Exame: {{{examDate}}}
Achados: {{{findings}}}
Notas Adicionais: {{{additionalNotes}}}

Laudo:
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input): Promise<GenerateReportOutput> => {
    console.log('[generateReportFlow] Input:', JSON.stringify(input, null, 2));
    try {
      const response = await prompt(input);
      const output = response.output;

      console.log('[generateReportFlow] Raw response from prompt:', JSON.stringify(response, null, 2));
      console.log('[generateReportFlow] Output from prompt:', JSON.stringify(output, null, 2));

      if (!output) {
        console.error('[generateReportFlow] Prompt returned null or undefined output.');
        throw new Error('A IA não retornou um resultado estruturado. Verifique o prompt e a configuração do modelo.');
      }
      
      if (typeof output.reportText !== 'string' || output.reportText.trim() === '') {
          console.error('[generateReportFlow] Output is missing reportText or it is empty:', output);
          throw new Error('A IA gerou um resultado, mas o texto do laudo está ausente ou vazio.');
      }

      return output;
    } catch (flowError: any) {
      console.error('[generateReportFlow] Error in flow execution:', flowError);
      let errorMessage = 'Erro desconhecido no fluxo de IA.';
      if (flowError instanceof Error) {
        errorMessage = flowError.message;
      } else if (typeof flowError === 'string') {
        errorMessage = flowError;
      }
      throw new Error(`Falha no fluxo de geração de laudo: ${errorMessage}`);
    }
  }
);
