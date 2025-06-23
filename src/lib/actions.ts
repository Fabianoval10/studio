
"use server";

import type { ReportFormData } from "@/types";
import { generateReport, type GenerateReportInput } from "@/ai/flows/generate-report";
import { reportFormSchema } from "@/types";

export async function handleGenerateReportAction(
  data: ReportFormData
): Promise<{ success: boolean; reportText?: string; error?: string }> {
  try {
    const validatedData = reportFormSchema.parse(data);
    
    // The generateReport flow expects a specific subset of the form data.
    // We select only the relevant fields to pass to the AI.
    const aiInput: GenerateReportInput = {
      species: validatedData.species,
      figado: validatedData.figado,
      vesiculaBiliar: validatedData.vesiculaBiliar,
      pancreas: validatedData.pancreas,
      estomago: validatedData.estomago,
      intestino: validatedData.intestino,
      rimDireito: validatedData.rimDireito,
      rimEsquerdo: validatedData.rimEsquerdo,
      baco: validatedData.baco,
      adrenais: validatedData.adrenais,
      vesiculaUrinaria: validatedData.vesiculaUrinaria,
      prostata: validatedData.prostata,
      uteroOvarios: validatedData.uteroOvarios,
      linfonodos: validatedData.linfonodos,
      liquidoLivre: validatedData.liquidoLivre,
      outros: validatedData.outros,
      additionalNotes: validatedData.additionalNotes,
    };

    console.log('[handleGenerateReportAction] AI Input para generateReport:', JSON.stringify(aiInput, null, 2));

    // The AI returns a single block of text
    const result: string = await generateReport(aiInput);

    console.log('[handleGenerateReportAction] Resultado (texto) do fluxo generateReport:', result);

    if (result) {
      // Sanitize the assembled text to be safe
      const sanitizedReportText = result.replace(/<\/?[^>]+(>|$)/g, "").trim();
      return { success: true, reportText: sanitizedReportText };
    } else {
      console.error('[handleGenerateReportAction] Fluxo retornou com sucesso, mas o resultado está vazio:', result);
      return { success: false, error: "A IA retornou uma resposta inesperada (resultado vazio)." };
    }
  } catch (e: any) {
    console.error("[handleGenerateReportAction] Erro capturado:", e);
    let errorMessage = "Ocorreu um erro desconhecido ao gerar o laudo.";

    if (e instanceof Error) {
      errorMessage = e.message;
      if ((e as any).issues) { 
         const zodError = e as any;
         errorMessage = `Erro de validação: ${zodError.issues.map((issue: any) => `${issue.path.join('.')} - ${issue.message}`).join('; ')}`;
      }
    } else if (typeof e === 'string') {
      errorMessage = e;
    } else if (e && typeof e.message === 'string') {
      errorMessage = e.message;
    }
    
    return { success: false, error: errorMessage };
  }
}
