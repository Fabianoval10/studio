
'use server';
/**
 * @fileOverview Extrai medições de uma imagem de ultrassom usando IA.
 *
 * - extractImageMeasurements - Uma função que lida com a extração de medições da imagem.
 * - ExtractImageMeasurementsInput - O tipo de entrada para a função extractImageMeasurements.
 * - ExtractImageMeasurementsOutput - O tipo de retorno para a função extractImageMeasurements.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MeasurementSchema = z.object({
  label: z.string().describe('O rótulo ou nome da medição (ex: "Comprimento do Fígado", "Diâmetro Aórtico").'),
  value: z.string().describe('O valor numérico da medição (ex: "5.2", "1.8").'),
  unit: z.string().describe('A unidade da medição (ex: "cm", "mm", "MHz").'),
});

const ExtractImageMeasurementsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "Uma imagem de ultrassom, como um data URI que deve incluir um tipo MIME e usar codificação Base64. Formato esperado: 'data:<mimetype>;base64,<dados_codificados>'."
    ),
});
export type ExtractImageMeasurementsInput = z.infer<typeof ExtractImageMeasurementsInputSchema>;

const ExtractImageMeasurementsOutputSchema = z.object({
  measurements: z.array(MeasurementSchema).describe('Uma lista das medições extraídas da imagem. Retorna uma lista vazia se nenhuma medição puder ser identificada de forma confiável.'),
});
export type ExtractImageMeasurementsOutput = z.infer<typeof ExtractImageMeasurementsOutputSchema>;

export async function extractImageMeasurements(input: ExtractImageMeasurementsInput): Promise<ExtractImageMeasurementsOutput> {
  return extractImageMeasurementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractImageMeasurementsPrompt',
  input: {schema: ExtractImageMeasurementsInputSchema},
  output: {schema: ExtractImageMeasurementsOutputSchema},
  prompt: `Você é um especialista em analisar imagens de ultrassom veterinário e extrair medições.
Dada a seguinte imagem de ultrassom, identifique quaisquer medições visíveis (como comprimentos, diâmetros, áreas, etc., frequentemente indicadas por linhas de calibre, cruzes ou anotações numéricas na imagem).

Para cada medição identificada, forneça:
1.  Um rótulo descritivo (ex: "Comprimento Fetal", "Espessura Endometrial", "Diâmetro do Vaso").
2.  O valor numérico da medição.
3.  A unidade da medição (ex: "cm", "mm", "MHz").

Se houver várias medições, liste todas elas.
Se nenhuma medição for claramente visível ou quantificável de forma confiável na imagem, retorne uma lista vazia para 'measurements'.
Não invente medições se elas não estiverem presentes ou legíveis.

Imagem para Análise:
{{media url=photoDataUri}}
`,
});

const extractImageMeasurementsFlow = ai.defineFlow(
  {
    name: 'extractImageMeasurementsFlow',
    inputSchema: ExtractImageMeasurementsInputSchema,
    outputSchema: ExtractImageMeasurementsOutputSchema,
  },
  async (input) => {
    console.log('[extractImageMeasurementsFlow] Input photoDataUri (primeiros 100 chars):', input.photoDataUri.substring(0,100));
    try {
      const response = await prompt(input);
      const output = response.output;

      if (!output) {
        console.error('[extractImageMeasurementsFlow] Prompt retornou output nulo ou indefinido.');
        return { measurements: [] };
      }
      console.log('[extractImageMeasurementsFlow] Medições extraídas:', JSON.stringify(output.measurements, null, 2));
      return output;
    } catch (flowError: any) {
      console.error('[extractImageMeasurementsFlow] Erro na execução do fluxo:', flowError);
      // Retorna uma lista vazia em caso de erro para não quebrar o fluxo principal
      return { measurements: [] };
    }
  }
);
