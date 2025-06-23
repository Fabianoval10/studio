
'use server';

/**
 * @fileOverview Generates a structured ultrasound report from a description of findings.
 *
 * - generateReport - A function that handles the generation of the ultrasound report.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input is now much simpler.
const GenerateReportInputSchema = z.object({
  animalSpecies: z.string().describe('Espécie do animal examinado.'),
  findings: z.string().describe('Achados e medidas do exame de ultrassom fornecidos pelo usuário. A IA deve usar isso para preencher todos os campos.'),
  additionalNotes: z.string().optional().describe('Quaisquer notas ou observações adicionais fornecidas pelo usuário para a conclusão.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

// Output is now structured. This is the key optimization.
const GenerateReportOutputSchema = z.object({
  figado: z.string().describe("Descrição do Fígado. Se não houver informações nos achados, descreva como normal."),
  vesiculaBiliar: z.string().describe("Descrição da Vesícula Biliar e vias biliares. Se não houver informações, descreva como normal."),
  pancreas: z.string().describe("Descrição do Pâncreas. Se não houver informações, descreva como normal."),
  alcasIntestinais: z.string().describe("Descrição das Alças Intestinais (Duodeno, Jejuno, Íleo, Cólon). Se não houver informações, descreva como normal, incluindo medidas padrão."),
  cavidadeGastrica: z.string().describe("Descrição da Cavidade Gástrica. Se não houver informações, descreva como normal."),
  baco: z.string().describe("Descrição do Baço. Se não houver informações, descreva como normal."),
  rins: z.string().describe("Descrição de ambos os Rins (Esquerdo e Direito). Se não houver informações, descreva como normais, incluindo medidas padrão."),
  adrenais: z.string().describe("Descrição de ambas as Adrenais (Esquerda e Direita). Se não houver informações, descreva como normais, incluindo medidas padrão."),
  vesiculaUrinaria: z.string().describe("Descrição da Vesícula Urinária. Se não houver informações, descreva como normal."),
  conclusoes: z.string().describe("Conclusões e impressões diagnósticas. Se houver notas adicionais do usuário, baseie-se nelas. Caso contrário, use 'Nada mais digno de nota na data da avaliação.'"),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

// The prompt is now much cleaner and asks for JSON.
const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `Você é um radiologista veterinário experiente. Sua tarefa é gerar um laudo de ultrassom estruturado em Português do Brasil, preenchendo cada campo do JSON de saída.

Contexto:
- Espécie: {{{animalSpecies}}}
- Achados do Exame (fonte principal de informação): {{{findings}}}
{{#if additionalNotes}}
- Notas Adicionais para Conclusão: {{{additionalNotes}}}
{{/if}}

Instruções:
1.  Analise os 'Achados do Exame' para extrair informações e medidas para cada órgão.
2.  Para cada órgão no JSON de saída, escreva uma descrição técnica e detalhada.
3.  Se uma medida específica de um órgão for fornecida nos 'Achados', incorpore-a naturalmente na descrição.
4.  Se um órgão NÃO for mencionado nos 'Achados', você DEVE preencher o campo correspondente com uma descrição padrão de normalidade para a espécie.
5.  A resposta DEVE ser um objeto JSON válido que corresponda exatamente ao schema de saída.`,
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

      if (!output) {
        throw new Error('A IA não retornou um resultado estruturado.');
      }
      
      console.log('[generateReportFlow] Structured output from prompt:', JSON.stringify(output, null, 2));

      return output;
    } catch (flowError: any) {
      console.error('[generateReportFlow] Error in flow execution:', flowError);
      throw new Error(`Falha no fluxo de geração de laudo: ${flowError.message}`);
    }
  }
);
