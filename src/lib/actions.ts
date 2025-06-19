
"use server";

import type { ReportFormData } from "@/types";
import { generateReport, type GenerateReportInput, type GenerateReportOutput } from "@/ai/flows/generate-report";
import { extractImageMeasurements, type ExtractImageMeasurementsInput, type ExtractImageMeasurementsOutput } from "@/ai/flows/extract-image-measurements";
import { reportFormSchema } from "@/types";

function formatAge(years: number, months?: number): number {
  let totalAgeInYears = years;
  if (months && months > 0) {
    totalAgeInYears += months / 12;
  }
  return parseFloat(totalAgeInYears.toFixed(2));
}

export async function handleGenerateReportAction(
  data: ReportFormData,
  image_data_uris?: string[]
): Promise<{ success: boolean; reportText?: string; error?: string }> {
  try {
    const validatedData = reportFormSchema.parse(data);
    let findingsWithMeasurements = validatedData.findings;

    if (image_data_uris && image_data_uris.length > 0) {
      let allExtractedMeasurementsText = "\n\n--- Medições Extraídas das Imagens ---\n";
      let measurementsFound = false;

      for (let i = 0; i < image_data_uris.length; i++) {
        const imageDataUri = image_data_uris[i];
        const measurementInput: ExtractImageMeasurementsInput = { photoDataUri: imageDataUri };
        
        console.log(`[handleGenerateReportAction] Solicitando medições para imagem ${i + 1}`);
        try {
          const measurementResult: ExtractImageMeasurementsOutput = await extractImageMeasurements(measurementInput);
          
          if (measurementResult && measurementResult.measurements && measurementResult.measurements.length > 0) {
            measurementsFound = true;
            allExtractedMeasurementsText += `Imagem ${i + 1}:\n`;
            measurementResult.measurements.forEach(m => {
              allExtractedMeasurementsText += `- ${m.label}: ${m.value} ${m.unit}\n`;
            });
          } else {
            allExtractedMeasurementsText += `Imagem ${i + 1}: Nenhuma medição clara extraída.\n`;
          }
        } catch (imgError: any) {
          console.error(`[handleGenerateReportAction] Erro ao extrair medições da imagem ${i + 1}:`, imgError);
          allExtractedMeasurementsText += `Imagem ${i + 1}: Erro ao processar medições (${imgError.message || 'erro desconhecido'}).\n`;
        }
      }

      if (measurementsFound) {
        findingsWithMeasurements += allExtractedMeasurementsText;
      } else {
         findingsWithMeasurements += "\n\nNenhuma medição quantificável foi extraída das imagens fornecidas ou não foram encontradas medições claras.";
      }
       console.log("[handleGenerateReportAction] Achados com medições:", findingsWithMeasurements);
    }


    const aiInput: GenerateReportInput = {
      animalSpecies: validatedData.species,
      animalBreed: validatedData.breed,
      animalSex: validatedData.sex,
      animalAge: formatAge(validatedData.ageYears, validatedData.ageMonths),
      examDate: validatedData.examDate.toISOString().split('T')[0],
      findings: findingsWithMeasurements, // Usar os achados com as medições
      additionalNotes: validatedData.additionalNotes,
    };

    console.log('[handleGenerateReportAction] AI Input para generateReport:', JSON.stringify(aiInput, null, 2));

    const result: GenerateReportOutput = await generateReport(aiInput);

    console.log('[handleGenerateReportAction] Resultado do fluxo generateReport:', JSON.stringify(result, null, 2));

    if (result && result.reportText) {
      return { success: true, reportText: result.reportText };
    } else {
      console.error('[handleGenerateReportAction] Fluxo retornou com sucesso, mas reportText está ausente ou vazio:', result);
      return { success: false, error: "A IA retornou uma resposta inesperada (texto do laudo ausente)." };
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
