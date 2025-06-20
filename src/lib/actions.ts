
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

function formatOrganMeasurements(data: ReportFormData): string | undefined {
  const measurements: string[] = [];

  if (data.medidaFigadoCm) measurements.push(`- Fígado: ${data.medidaFigadoCm} cm`);
  if (data.medidaVesiculaBiliarCm) measurements.push(`- Vesícula Biliar: ${data.medidaVesiculaBiliarCm} cm`);
  if (data.medidaPancreasCm) measurements.push(`- Pâncreas: ${data.medidaPancreasCm} cm`);
  
  const alcasIntestinais: string[] = [];
  if (data.medidaDuodenoCm) alcasIntestinais.push(`  - Duodeno: ${data.medidaDuodenoCm} cm`);
  if (data.medidaJejunoCm) alcasIntestinais.push(`  - Jejuno: ${data.medidaJejunoCm} cm`);
  if (data.medidaIleoCm) alcasIntestinais.push(`  - Íleo: ${data.medidaIleoCm} cm`);
  if (data.medidaColonCm) alcasIntestinais.push(`  - Cólon: ${data.medidaColonCm} cm`);
  if (alcasIntestinais.length > 0) {
    measurements.push("- Alças Intestinais:");
    measurements.push(...alcasIntestinais);
  }

  if (data.medidaCavidadeGastricaCm) measurements.push(`- Cavidade Gástrica: ${data.medidaCavidadeGastricaCm} cm`);
  if (data.medidaBacoCm) measurements.push(`- Baço: ${data.medidaBacoCm} cm`);

  const rins: string[] = [];
  if (data.medidaRimEsquerdoCm) rins.push(`  - Rim Esquerdo: ${data.medidaRimEsquerdoCm} cm`);
  if (data.medidaRimDireitoCm) rins.push(`  - Rim Direito: ${data.medidaRimDireitoCm} cm`);
  if (rins.length > 0) {
    measurements.push("- Rins:");
    measurements.push(...rins);
  }
  
  const adrenais: string[] = [];
  if (data.medidaAdrenalEsquerdaCranialCm || data.medidaAdrenalEsquerdaCaudalCm) {
    adrenais.push(`  - Adrenal Esquerda (Cranial x Caudal): ${data.medidaAdrenalEsquerdaCranialCm || 'N/A'} x ${data.medidaAdrenalEsquerdaCaudalCm || 'N/A'} cm`);
  }
  if (data.medidaAdrenalDireitaCranialCm || data.medidaAdrenalDireitaCaudalCm) {
    adrenais.push(`  - Adrenal Direita (Cranial x Caudal): ${data.medidaAdrenalDireitaCranialCm || 'N/A'} x ${data.medidaAdrenalDireitaCaudalCm || 'N/A'} cm`);
  }
  if (adrenais.length > 0) {
    measurements.push("- Adrenais:");
    measurements.push(...adrenais);
  }
  
  if (data.medidaVesiculaUrinariaCm) measurements.push(`- Vesícula Urinária: ${data.medidaVesiculaUrinariaCm} cm`);

  if (measurements.length === 0) return undefined;
  return "Medidas Anatômicas (cm) Fornecidas pelo Usuário:\n" + measurements.join("\n");
}

export async function handleGenerateReportAction(
  data: ReportFormData
): Promise<{ success: boolean; reportText?: string; error?: string }> {
  try {
    const validatedData = reportFormSchema.parse(data);
    const organMeasurementsString = formatOrganMeasurements(validatedData);

    const aiInput: GenerateReportInput = {
      animalSpecies: validatedData.species,
      animalBreed: validatedData.breed,
      animalSex: validatedData.sex,
      animalAge: formatAge(validatedData.ageYears, validatedData.ageMonths),
      examDate: validatedData.examDate.toISOString().split('T')[0],
      findings: validatedData.findings,
      additionalNotes: validatedData.additionalNotes,
      organMeasurements: organMeasurementsString,
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
