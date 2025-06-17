"use server";

import type { ReportFormData } from "@/types";
import { generateReport, type GenerateReportInput } from "@/ai/flows/generate-report";
import { reportFormSchema } from "@/types";

function formatAge(years: number, months?: number): number {
  let totalAgeInYears = years;
  if (months && months > 0) {
    totalAgeInYears += months / 12;
  }
  // Return age as a number, potentially with decimals for months.
  // The AI model expects a number for age.
  return parseFloat(totalAgeInYears.toFixed(2));
}

export async function handleGenerateReportAction(
  data: ReportFormData
): Promise<{ success: boolean; reportText?: string; error?: string }> {
  try {
    const validatedData = reportFormSchema.parse(data);

    const aiInput: GenerateReportInput = {
      examType: validatedData.examType,
      animalSpecies: validatedData.species,
      animalBreed: validatedData.breed,
      animalSex: validatedData.sex,
      animalAge: formatAge(validatedData.ageYears, validatedData.ageMonths),
      examDate: validatedData.examDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      findings: validatedData.findings,
      additionalNotes: validatedData.additionalNotes,
    };

    const result = await generateReport(aiInput);

    if (result.reportText) {
      return { success: true, reportText: result.reportText };
    } else {
      return { success: false, error: "A IA falhou em gerar o texto do laudo." };
    }
  } catch (e) {
    if (e instanceof Error) {
      // Handle Zod errors specifically for better messages if needed
      if ((e as any).issues) {
         const zodError = e as any;
         const errorMessage = zodError.issues.map((issue: any) => `${issue.path.join('.')} - ${issue.message}`).join('; ');
         return { success: false, error: `Erro de validação: ${errorMessage}` };
      }
      return { success: false, error: e.message };
    }
    return { success: false, error: "Ocorreu um erro desconhecido." };
  }
}
