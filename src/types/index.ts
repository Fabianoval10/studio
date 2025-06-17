import { z } from 'zod';

export const reportFormSchema = z.object({
  // Clinic Info (can be pre-filled or part of settings later)
  clinicName: z.string().min(1, "Clinic name is required").default("VETscribe Advanced Imaging"),
  clinicAddress: z.string().min(1, "Clinic address is required").default("123 Wellness Road, Petville, PV 54321"),
  clinicLogoUrl: z.string().url("Must be a valid URL").optional().default("https://placehold.co/200x75.png?text=VETscribe"),
  vetName: z.string().min(1, "Veterinarian name is required").default("Dr. Pawsworth"),

  // Pet Info
  petName: z.string().min(1, "Pet name is required"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().min(1, "Breed is required"),
  ageYears: z.coerce.number({invalid_type_error: "Age must be a number"}).min(0, "Age must be positive or zero").max(50),
  ageMonths: z.coerce.number({invalid_type_error: "Months must be a number"}).min(0).max(11).optional().default(0),
  sex: z.enum(["Male", "Female", "Male Neutered", "Female Spayed", "Unknown"]),
  ownerName: z.string().min(1, "Owner name is required"),
  patientId: z.string().optional(),

  // Exam Info
  referringVet: z.string().optional(),
  examDate: z.date({ required_error: "Exam date is required" }),
  examType: z.string().min(1, "Exam type is required (e.g., Abdominal Ultrasound, Echocardiogram)"),
  clinicalHistory: z.string().min(1, "Clinical history is required"),
  sedation: z.enum(["None", "Light", "Moderate", "Heavy"]),
  sedationAgent: z.string().optional(),

  // Findings & Notes for AI
  findings: z.string().min(10, "Detailed findings are required for report generation (min 10 characters)"),
  additionalNotes: z.string().optional(),
});

export type ReportFormData = z.infer<typeof reportFormSchema>;

export interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
}
