
'use server';

/**
 * @fileOverview Generates a complete ultrasound report text from detailed form data.
 *
 * - generateReport - A function that handles the generation of the ultrasound report text.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// This input schema should reflect all the fields from the form
const GenerateReportInputSchema = z.object({
  species: z.string().describe("Espécie do animal."),
  examFindings: z.string().optional().describe("Achados gerais do exame descritos pelo usuário."),
  figado: z.string().optional(),
  vesiculaBiliar: z.string().optional(),
  pancreas: z.string().optional(),
  estomago: z.string().optional(),
  intestino: z.string().optional(),
  rimDireito: z.string().optional(),
  rimEsquerdo: z.string().optional(),
  baco: z.string().optional(),
  adrenais: z.string().optional(),
  vesiculaUrinaria: z.string().optional(),
  prostata: z.string().optional(),
  uteroOvarios: z.string().optional(),
  linfonodos: z.string().optional(),
  liquidoLivre: z.string().optional(),
  outros: z.string().optional(),
  additionalNotes: z.string().optional().describe("Notas do usuário para a conclusão."),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

// The output is a single block of formatted text.
export type GenerateReportOutput = string;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateReportInputSchema},
  output: {format: 'text'},
  prompt: `Você é um radiologista veterinário experiente. Sua tarefa é gerar o corpo de um laudo de ultrassom em Português do Brasil, com base nos dados fornecidos.

A resposta deve ser APENAS o texto do laudo, formatado e pronto para ser inserido em um documento. Mantenha a ordem dos órgãos.

REGRAS:
1.  Use o campo 'Achados Gerais do Exame' como a fonte primária de informação. A descrição de cada órgão deve refletir o que está descrito ali.
2.  Use os campos de 'Medidas Anatômicas' para adicionar detalhes específicos (como dimensões) à descrição do órgão correspondente.
3.  Se um campo de 'Medida Anatômica' estiver vazio, mas o órgão for mencionado nos 'Achados Gerais', baseie a descrição inteiramente nos 'Achados Gerais'.
4.  Se tanto os 'Achados Gerais' quanto o campo de 'Medida Anatômica' de um órgão específico estiverem vazios ou não mencionarem o órgão, você DEVE gerar uma descrição padrão de normalidade para a espécie ({{{species}}}).
5.  No final, crie um parágrafo de "Impressões Diagnósticas / Conclusões / Observações Adicionais". Se o campo 'additionalNotes' for fornecido, use-o como base para as conclusões. Caso contrário, use a frase 'Nada mais digno de nota na data da avaliação.'.
6.  Separe a descrição de cada órgão com DUAS quebras de linha (\n\n).

DADOS BRUTOS FORNECIDOS:
- Espécie: {{{species}}}
- Achados Gerais do Exame: {{{examFindings}}}
- Fígado: {{{figado}}}
- Vesícula Biliar: {{{vesiculaBiliar}}}
- Pâncreas: {{{pancreas}}}
- Estômago: {{{estomago}}}
- Alças Intestinais: {{{intestino}}}
- Rim Direito: {{{rimDireito}}}
- Rim Esquerdo: {{{rimEsquerdo}}}
- Baço: {{{baco}}}
- Adrenais: {{{adrenais}}}
- Vesícula Urinária: {{{vesiculaUrinaria}}}
- Próstata: {{{prostata}}}
- Útero e Ovários: {{{uteroOvarios}}}
- Linfonodos: {{{linfonodos}}}
- Líquido Livre: {{{liquidoLivre}}}
- Outros Achados: {{{outros}}}
- Notas para Conclusão: {{{additionalNotes}}}
`,
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: z.string(),
  },
  async (input): Promise<GenerateReportOutput> => {
    console.log('[generateReportFlow] Input:', JSON.stringify(input, null, 2));
    try {
      const response = await prompt(input);
      const text = response.text;
      
      if (!text) {
        throw new Error('A IA não retornou um texto.');
      }
      
      console.log('[generateReportFlow] Text output from prompt:', text);
      return text;
    } catch (flowError: any)      {
      console.error('[generateReportFlow] Error in flow execution:', flowError);
      throw new Error(`Falha no fluxo de geração de laudo: ${flowError.message}`);
    }
  }
);
