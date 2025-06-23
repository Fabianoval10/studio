
"use server";

import type { ReportFormData } from "@/types";
import { generateReport, type GenerateReportInput, type GenerateReportOutput } from "@/ai/flows/generate-report";
import { reportFormSchema } from "@/types";

// This new function assembles the final report text from the structured AI output.
// This gives us full control over the final format, making it much more reliable.
function assembleReportText(structuredOutput: GenerateReportOutput): string {
    const reportSections = [
        `Fígado: ${structuredOutput.figado}`,
        `Vesícula biliar: ${structuredOutput.vesiculaBiliar}`,
        `Pâncreas: ${structuredOutput.pancreas}`,
        `Alças intestinais: ${structuredOutput.alcasIntestinais}`,
        `Cavidade gástrica: ${structuredOutput.cavidadeGastrica}`,
        `Baço: ${structuredOutput.baco}`,
        `Rins: ${structuredOutput.rins}`,
        `Adrenais: ${structuredOutput.adrenais}`,
        `Vesícula urinária: ${structuredOutput.vesiculaUrinaria}`,
        `\nImpressões Diagnósticas / Conclusões / Observações Adicionais:\n${structuredOutput.conclusoes}`
    ];
    
    return reportSections.join('\n\n'); // Use double newline for paragraph breaks
}

export async function handleGenerateReportAction(
  data: ReportFormData
): Promise<{ success: boolean; reportText?: string; error?: string }> {
  try {
    const validatedData = reportFormSchema.parse(data);
    
    const aiInput: GenerateReportInput = {
      animalSpecies: validatedData.species,
      findings: validatedData.findings,
      additionalNotes: validatedData.additionalNotes,
    };

    console.log('[handleGenerateReportAction] AI Input para generateReport:', JSON.stringify(aiInput, null, 2));

    // The AI now returns a structured object
    const result: GenerateReportOutput = await generateReport(aiInput);

    console.log('[handleGenerateReportAction] Resultado ESTRUTURADO do fluxo generateReport:', JSON.stringify(result, null, 2));

    if (result) {
      // Assemble the final report text from the structured data
      const reportText = assembleReportText(result);
      // Sanitize the assembled text to be safe
      const sanitizedReportText = reportText.replace(/<\/?[^>]+(>|$)/g, "").trim();
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
