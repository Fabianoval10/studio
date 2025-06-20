
"use server";

import type { ReportFormData } from "@/types";
import { generateReport, type GenerateReportInput, type GenerateReportOutput } from "@/ai/flows/generate-report";
import { reportFormSchema } from "@/types";

function formatAge(years: number, months?: number): number {
  let totalAgeInYears = years;
  if (months && months > 0) {
    totalAgeInYears += months / 12;
  }
  return parseFloat(totalAgeInYears.toFixed(2));
}

const organMeasurementLabels: { [K in keyof ReportFormData]?: string } = {
  medidaFigado: "Fígado",
  medidaVesiculaBiliar: "Vesícula Biliar",
  medidaPancreas: "Pâncreas",
  medidaDuodeno: "Duodeno",
  medidaJejuno: "Jejuno",
  medidaIleo: "Íleo",
  medidaColon: "Cólon",
  medidaCavidadeGastrica: "Cavidade Gástrica",
  medidaBaco: "Baço",
  medidaAdrenais: "Adrenais",
  medidaVesiculaUrinaria: "Vesícula Urinária",
};

export async function handleGenerateReportAction(
  data: ReportFormData
): Promise<{ success: boolean; reportText?: string; error?: string }> {
  try {
    const validatedData = reportFormSchema.parse(data);

    const medidasAdicionadas: string[] = [];
    for (const key in organMeasurementLabels) {
      const typedKey = key as keyof ReportFormData;
      const measurementValue = validatedData[typedKey];
      if (measurementValue && typeof measurementValue === 'string' && measurementValue.trim() !== "") {
        const label = organMeasurementLabels[typedKey];
        medidasAdicionadas.push(`- ${label}: ${measurementValue.trim()}`);
      }
    }

    const organMeasurementsString = medidasAdicionadas.length > 0 ? medidasAdicionadas.join("\n") : undefined;

    const aiInput: GenerateReportInput = {
      animalSpecies: validatedData.species,
      animalBreed: validatedData.breed,
      animalSex: validatedData.sex,
      animalAge: formatAge(validatedData.ageYears, validatedData.ageMonths),
      examDate: validatedData.examDate.toISOString().split('T')[0],
      findings: validatedData.findings,
      organMeasurements: organMeasurementsString,
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
