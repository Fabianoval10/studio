import { z } from 'zod';

export const reportFormSchema = z.object({
  // Clinic Info (can be pre-filled or part of settings later)
  clinicName: z.string().min(1, "Nome da clínica é obrigatório").default("Baddha Ultrassonografia"),
  vetName: z.string().min(1, "Nome do veterinário(a) é obrigatório").default("Dra. Míriam Barp F. da Costa"),

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
  
  // Findings & Notes for AI
  findings: z.string().min(10, "Achados detalhados são obrigatórios para geração do laudo (mín 10 caracteres)"),
  additionalNotes: z.string().optional(),
});

export type ReportFormData = z.infer<typeof reportFormSchema>;

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
}
