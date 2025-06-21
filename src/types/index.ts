import { z } from 'zod';

export const reportFormSchema = z.object({
  // Clinic Info
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

  // Anatomical Measurements (cm) - all optional strings
  medidaFigadoCm: z.string().optional(),
  medidaVesiculaBiliarCm: z.string().optional(),
  medidaPancreasCm: z.string().optional(),
  medidaDuodenoCm: z.string().optional(),
  medidaJejunoCm: z.string().optional(),
  medidaIleoCm: z.string().optional(),
  medidaColonCm: z.string().optional(),
  medidaCavidadeGastricaCm: z.string().optional(),
  medidaBacoCm: z.string().optional(),
  medidaRimEsquerdoCm: z.string().optional(),
  medidaRimDireitoCm: z.string().optional(),
  medidaAdrenalEsquerdaCranialCm: z.string().optional(),
  medidaAdrenalEsquerdaCaudalCm: z.string().optional(),
  medidaAdrenalDireitaCranialCm: z.string().optional(),
  medidaAdrenalDireitaCaudalCm: z.string().optional(),
  medidaVesiculaUrinariaCm: z.string().optional(),
});

export type ReportFormData = z.infer<typeof reportFormSchema>;

export interface UploadedImage {
  id: string;
  file?: File; // File is optional now
  previewUrl: string; // This can be a blob URL or a data URI
}
