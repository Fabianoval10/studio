
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
  prompt: `Você é um especialista em radiologia veterinária e sua tarefa é redigir a seção de achados e a impressão diagnóstica de um laudo de ultrassom em Português do Brasil.

Sua resposta deve ser APENAS o texto do laudo, pronto para ser copiado e colado. Siga as instruções e o formato com rigor.

**INSTRUÇÕES DE GERAÇÃO:**

1.  **FORMATAÇÃO GERAL:**
    *   Para cada órgão, inicie a linha com o nome do órgão em **negrito**, seguido por um hífen. Exemplo: \`**Fígado** - \`.
    *   Mantenha a ordem dos órgãos exatamente como listado abaixo em "DADOS FORNECIDOS".
    *   Separe a descrição de cada órgão com uma quebra de linha.
    *   Quando incluir medidas dos "Dados Fornecidos", coloque-as em **negrito** (ex: **5.2 cm** ou **5.2 x 3.1 cm**).

2.  **CONTEÚDO DA DESCRIÇÃO DE CADA ÓRGÃO:**
    *   **PRIORIZE OS DADOS DO USUÁRIO:** Se o usuário descreveu o órgão nos "Achados Gerais do Exame" ou forneceu uma medida no campo anatômico específico, crie a descrição com base nesses dados.
    *   **USE O TEXTO PADRÃO QUANDO NÃO HOUVER DADOS:** Se um órgão **NÃO** for mencionado nos achados e seu campo de medida estiver vazio, você **DEVE** usar o texto padrão correspondente da seção "TEXTOS PADRÃO DE NORMALIDADE" abaixo, sem alterações.
    *   **INCORPORE MEDIDAS:** Se o usuário fornecer uma medida em um campo anatômico, incorpore-a de forma fluida na descrição, colocando-a em negrito. Se estiver usando um texto padrão que já contém uma medida de exemplo, substitua a medida do exemplo pela fornecida pelo usuário.

3.  **IMPRESSÃO DIAGNÓSTICA (CONCLUSÃO):**
    *   Após as descrições de todos os órgãos, adicione um parágrafo final intitulado \`**IMPRESSÃO DIAGNÓSTICA:**\`.
    *   O conteúdo deste parágrafo deve ser baseado nas "Notas para Conclusão" do usuário.
    *   Se o campo "Notas para Conclusão" estiver vazio, **E SOMENTE NESSE CASO**, use o seguinte texto: "Nada mais digno de nota na data da avaliação.".

**DADOS FORNECIDOS:**
- Espécie: {{{species}}}
- Achados Gerais do Exame: {{{examFindings}}}
- Notas para Conclusão: {{{additionalNotes}}}

--- MEDIDAS ANATÔMICAS (opcional) ---
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

--- TEXTOS PADRÃO DE NORMALIDADE (usar se não houver dados para o órgão) ---
**Fígado:** Fígado de contornos definidos, margens regulares, bordas arredondadas, dimensões preservadas, ecotextura homogênea, ecogenicidade mantida. Arquitetura vascular preservada.
**Vesícula Biliar:** Vesícula biliar de paredes finas e regulares, repleta por conteúdo anecogênico homogêneo. Não existem evidências de obstrução em vias biliares intra ou extra hepáticas.
**Pâncreas:** Pâncreas de superfícies regulares em suas porções passíveis de visualização em ramo direito, dimensões preservadas medindo **0,45 cm** de diâmetro, ecogenicidade mantida.
**Estômago:** Cavidade gástrica de paredes finas medindo **0,19 cm** em região de corpo, estratificação de camadas mantida, repleta por conteúdo alimentar. Motilidade progressiva preservada.
**Intestino:** Alças intestinais de distribuição topográfica habitual, paredes normoespessas (duodeno **0,18 cm**/jejuno **0,19 cm**/íleo **0,21 cm**/cólon **0,11 cm**) e com estratificação de camadas mantida. Motilidade progressiva preservada.
**Baço:** Baço de contornos definidos e margens regulares, dimensões mantidas, ecotextura homogênea e ecogenicidade mantida.
**Rins:** Rins de dimensões preservadas, medindo **6,65 cm** o rim esquerdo e **5,53 cm** o rim direito, margens regulares, com relações e definição córtico medular preservadas, ecogenicidade mantida em cortical.
**Adrenais:** Adrenais de dimensões e formato anatômico preservados, definição córtico medular mantida, medindo (margem cranial x margem caudal) **0,41 cm x 0,42 cm** a adrenal esquerda e **0,41 cm x 0,42 cm** a adrenal direita.
**Vesícula Urinária:** Vesícula urinária em distensão adequada, paredes finas (**0,75 cm**) e mucosas regulares, repleta por conteúdo anecogênico.
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
