
"use server";

import type { ReportFormData } from "@/types";
import { generateReport, type GenerateReportInput } from "@/ai/flows/generate-report";
import { reportFormSchema, REPORTS_COLLECTION } from "@/types";
import { db } from './firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function getReportsForDisplay() {
  try {
    const reportsSnapshot = await db.collection(REPORTS_COLLECTION).orderBy('createdAt', 'desc').get();
    if (reportsSnapshot.empty) {
      console.log('[getReportsForDisplay] No reports found in Firestore.');
      return [];
    }
    
    const reports = reportsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        petName: data.petName,
        ownerName: data.ownerName,
        species: data.species,
        examDate: (data.examDate as Timestamp).toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        createdAt: (data.createdAt as Timestamp).toDate().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      };
    });

    return reports;
  } catch (error) {
    console.error("[getReportsForDisplay] Error fetching reports from Firestore:", error);
    return [];
  }
}

export async function handleGenerateReportAction(
  data: ReportFormData
): Promise<{ success: boolean; reportText?: string; error?: string }> {
  try {
    const validatedData = reportFormSchema.parse(data);
    
    const aiInput: GenerateReportInput = {
      species: validatedData.species,
      sex: validatedData.sex,
      examFindings: validatedData.examFindings,
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
      additionalNotes: validatedData.additionalNotes,
    };

    console.log('[handleGenerateReportAction] AI Input para generateReport:', JSON.stringify(aiInput, null, 2));

    const result: string = await generateReport(aiInput);

    console.log('[handleGenerateReportAction] Resultado (texto) do fluxo generateReport:', result);

    if (result) {
      const sanitizedReportText = result.replace(/<\/?[^>]+(>|$)/g, "").trim();

      // --- SAVE TO FIRESTORE ---
      try {
        const reportToSave = {
          ...validatedData,
          generatedReportText: sanitizedReportText,
          createdAt: Timestamp.now()
        };
        const docRef = await db.collection(REPORTS_COLLECTION).add(reportToSave);
        console.log(`[handleGenerateReportAction] Report saved to Firestore with ID: ${docRef.id}`);
      } catch (dbError: any) {
        console.error("[handleGenerateReportAction] Firestore save error:", dbError.message);
        return { 
          success: true, 
          reportText: sanitizedReportText, 
          error: "Laudo gerado, mas ocorreu um erro ao salvá-lo. Verifique a configuração do Firebase no seu ambiente." 
        };
      }
      // --- END SAVE TO FIRESTORE ---

      return { success: true, reportText: sanitizedReportText };
    } else {
      console.error('[handleGenerateReportAction] Fluxo retornou com sucesso, mas o resultado está vazio:', result);
      return { success: false, error: "A IA retornou uma resposta inesperada (resultado vazio)." };
    }
  } catch (e: any) {
    console.error("[handleGenerateReportAction] Erro detalhado capturado:", JSON.stringify(e, null, 2));
    let errorMessage = "Ocorreu um erro desconhecido ao gerar o laudo.";

    if (e.cause) {
      // Handle Genkit errors which often wrap the original error in `cause`
      const cause = e.cause as any;
      if(cause.status && cause.message) {
         errorMessage = `Erro da IA (${cause.status}): ${cause.message}`;
      } else {
         errorMessage = cause.message || e.message;
      }
    } else if (e instanceof Error) {
      errorMessage = e.message;
      // Handle Zod validation errors
      if ((e as any).issues) { 
         const zodError = e as any;
         errorMessage = `Erro de validação: ${zodError.issues.map((issue: any) => `${issue.path.join('.')} - ${issue.message}`).join('; ')}`;
      }
    } else if (typeof e === 'string') {
      errorMessage = e;
    } else if (e && typeof e.message === 'string') {
      errorMessage = e.message;
    }
    
    // Provide more user-friendly messages for common issues
    if (errorMessage.includes('Deadline exceeded')) {
      errorMessage = "A IA demorou muito para responder. Por favor, tente simplificar os achados ou tente novamente."
    } else if (errorMessage.includes('API key not valid')) {
      errorMessage = "A chave de API configurada não é válida. Verifique o arquivo .env."
    } else if (errorMessage.includes('quota')) {
      errorMessage = "Atingido o limite de uso da API. Por favor, verifique sua cota no painel da Google AI."
    }

    return { success: false, error: errorMessage };
  }
}
