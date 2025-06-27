import { z } from 'zod';

export const reportFormSchema = z.object({
  // Clinic Info
  clinicName: z.string().min(1, "Nome da clínica é obrigatório"),
  vetName: z.string().min(1, "Nome do veterinário(a) é obrigatório"),

  // Pet Info
  petName: z.string().min(1, "Nome do pet é obrigatório"),
  species: z.string().min(1, "Espécie é obrigatória"),
  breed: z.string().min(1, "Raça é obrigatória"),
  ageYears: z.coerce.number({invalid_type_error: "Idade deve ser um número"}).min(0, "Idade deve ser positiva ou zero").max(50),
  ageMonths: z.coerce.number({invalid_type_error: "Meses devem ser um número"}).min(0).max(11).optional().default(0),
  sex: z.enum(["Macho", "Fêmea", "Macho Castrado", "Fêmea Castrada", "Desconhecido"]),
  ownerName: z.string().min(1, "Nome do tutor é obrigatório"),
  patientId: z.string().optional(),

  // Exam Info
  referringVet: z.string().optional(),
  examDate: z.date({ required_error: "Data do exame é obrigatória" }),
  
  // General Findings
  examFindings: z.string().optional(),

  // Anatomical Measurements
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

  // This maps to "conclusoes" for the AI
  additionalNotes: z.string().optional(),
}).refine(data => {
    const measurementFields = [
      data.figado, data.vesiculaBiliar, data.pancreas, data.estomago,
      data.intestino, data.rimDireito, data.rimEsquerdo, data.baco,
      data.adrenais, data.vesiculaUrinaria, data.prostata,
      data.uteroOvarios, data.linfonodos
    ];
    const hasGeneralFindings = data.examFindings && data.examFindings.trim().length > 0;
    const hasSpecificMeasurements = measurementFields.some(field => field && field.trim().length > 0);

    return hasGeneralFindings || hasSpecificMeasurements;
}, {
    message: "É necessário preencher os 'Achados Gerais' ou ao menos um campo nas 'Medidas Anatômicas'.",
    path: ["examFindings"],
});


export type ReportFormData = z.infer<typeof reportFormSchema>;

export interface UploadedImage {
  id: string;
  file?: File; // File is optional now
  previewUrl: string; // This can be a blob URL or a data URI
}
