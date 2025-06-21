
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
  animalSpecies: z.string().describe('Espécie do animal examinado.'),
  animalBreed: z.string().describe('Raça do animal examinado.'),
  animalSex: z.string().describe('Sexo do animal examinado.'),
  animalAge: z.number().describe('Idade do animal em anos.'),
  examDate: z.string().describe('Data em que o exame de ultrassom foi realizado.'),
  findings: z.string().describe('Achados estruturados do exame de ultrassom fornecidos pelo usuário.'),
  additionalNotes: z.string().optional().describe('Quaisquer notas ou observações adicionais fornecidas pelo usuário.'),
  organMeasurements: z.string().optional().describe('Medidas anatômicas detalhadas dos órgãos em cm, fornecidas pelo usuário.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  reportText: z.string().describe('O texto do laudo de ultrassom gerado, seguindo o modelo especificado.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `Você é um radiologista veterinário experiente. Gere um laudo de ultrassom COMPLETO e DETALHADO em Português do Brasil.
O laudo DEVE seguir EXATAMENTE a estrutura e formato do modelo abaixo, incluindo todas as quebras de linha e parágrafos.

Dados do Paciente e Exame (NÃO INCLUIR DIRETAMENTE NO LAUDO FINAL, APENAS PARA CONTEXTO):
Espécie Animal: {{{animalSpecies}}}
Raça Animal: {{{animalBreed}}}
Sexo Animal: {{{animalSex}}}
Idade Animal: {{{animalAge}}} anos
Data do Exame: {{{examDate}}}

Achados Fornecidos pelo Usuário (Use para preencher o modelo abaixo, complementando com as 'Medidas Anatômicas' quando apropriado):
{{{findings}}}

{{#if organMeasurements}}
Medidas Anatômicas (cm) Fornecidas pelo Usuário (Use para preencher ou complementar as medidas no modelo abaixo. Estas medidas devem ter prioridade sobre os exemplos do modelo):
{{{organMeasurements}}}
{{/if}}

{{#if additionalNotes}}
Notas Adicionais Fornecidas pelo Usuário (Use para a seção de conclusões/observações):
{{{additionalNotes}}}
{{/if}}

Instruções Detalhadas para Preenchimento do Modelo:
1.  Utilize os 'Achados Fornecidos pelo Usuário' para formar a base da descrição de cada órgão no modelo.
2.  Se 'Medidas Anatômicas (cm) Fornecidas pelo Usuário' estiverem presentes, elas DEVEM ser usadas para preencher as medidas correspondentes no modelo, substituindo quaisquer valores de exemplo do modelo. Incorpore essas medidas naturalmente na descrição do órgão.
3.  Se um órgão nos 'Achados Fornecidos pelo Usuário' tiver uma descrição específica, use-a para esse órgão.
4.  Se um órgão no modelo não for mencionado ou detalhado nos 'Achados Fornecidos pelo Usuário', você deve usar uma descrição padrão de normalidade para esse órgão (conforme sugerido no modelo) ou, se apropriado, indicar que não foi avaliado ou que não há alterações significativas, MAS SEMPRE MANTENHA O PARÁGRAFO E A ESTRUTURA DO ÓRGÃO NO LAUDO.
5.  Se uma medida específica não for fornecida nem nos 'Achados' nem nas 'Medidas Anatômicas', utilize o valor representativo normal do modelo para a espécie e raça, ou indique que a medida não foi obtida, mas mantenha o formato da frase que contém a medida no texto.
6.  **Ao descrever uma alteração significativa ou uma medida específica fornecida pelo usuário, coloque essa parte do texto em negrito usando a sintaxe Markdown (\`**texto em negrito**\`). Por exemplo: \`Paredes normoespessas (duodeno **0,25 cm**/jejuno 0,19 cm/íleo 0,21 cm/cólon 0,11 cm)\` ou \`Baço: **Levemente aumentado com ecotextura heterogênea**.\`**

MODELO OBRIGATÓRIO DO LAUDO (USE ESTA ESTRUTURA E FORMATAÇÃO EXATAS):

Fígado: de contornos definidos, margens regulares, bordas arredondadas, dimensões preservadas, ecotextura homogênea, ecogenicidade mantida. Arquitetura vascular preservada.

Vesícula biliar: de paredes finas e regulares, repleta por conteúdo anecogênico homogêneo. Não existem evidências de obstrução em vias biliares intra ou extra hepáticas.

Pâncreas: de superfícies regulares em suas porções passíveis de visualização em ramo direito, dimensões preservadas medindo aproximadamente 0,45 cm de diâmetro, ecogenicidade mantida.

Alças intestinais: de distribuição topográfica habitual, paredes normoespessas (duodeno 0,18 cm/jejuno 0,19 cm/íleo 0,21 cm/cólon 0,11 cm) e com estratificação de camadas mantida. Motilidade progressiva preservada.

Cavidade gástrica: de paredes finas medindo aproximadamente 0,19 cm em região de corpo, estratificação de camadas mantida, repleta por conteúdo alimentar. Motilidade progressiva preservada.

Baço: de contornos definidos e margens regulares, dimensões mantidas, ecotextura homogênea e ecogenicidade mantida.

Rins: de dimensões preservadas, medindo aproximadamente 6,65 cm o rim esquerdo e 5,53 cm o rim direito, margens regulares, com relações e definição córtico medular preservadas, ecogenicidade mantida em cortical.

Adrenais: de dimensões e formato anatômico preservados, definição córtico medular mantida, medindo (margem cranial x margem caudal) aproximadamente 0,41 cm x 0,42 cm a adrenal esquerda e 0,41 cm x 0,42 cm a adrenal direita.

Vesícula urinária: em distensão adequada, paredes finas (aproximadamente 0,15 cm) e mucosas regulares, repleta por conteúdo anecogênico.

{{#if additionalNotes}}
Impressões Diagnósticas / Conclusões / Observações Adicionais:
{{{additionalNotes}}}
{{else}}
Nada mais digno de nota na data da avaliação.
{{/if}}

IMPORTANTE: O texto do laudo final gerado deve ser APENAS o conteúdo do laudo, começando com 'Fígado:' e terminando com a última frase da conclusão/observação. NÃO inclua os dados do paciente, 'Achados Fornecidos pelo Usuário', ou 'Medidas Anatômicas' como seções separadas no texto do laudo final; estas informações devem ser integradas DENTRO das descrições dos órgãos do modelo. NÃO inclua uma seção 'Veterinário Responsável' nem placeholders como '[Nome do Veterinário Radiologista]' ou '[Número de Registro Profissional]'. MANTENHA AS QUEBRAS DE LINHA DUPLAS (PARÁGRAFOS) EXATAMENTE COMO NO MODELO.
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

      console.log(`[generateReportFlow] Length of generated reportText: ${output.reportText.length}`);

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
