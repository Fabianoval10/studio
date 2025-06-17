"use client";

import type { Control, FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from "react-hook-form";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ReportFormData, UploadedImage } from "@/types";
import { reportFormSchema } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, ImageIcon, Trash2, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import React, { useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ReportFormProps {
  onSubmit: (data: ReportFormData, images: File[]) => Promise<void>;
  isLoading: boolean;
  initialData?: Partial<ReportFormData>;
}

// Helper component for form fields to reduce repetition
const FormField = ({ name, label, errors, children }: { name: keyof ReportFormData, label: string, errors: FieldErrors<ReportFormData>, children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label htmlFor={name} className={errors[name] ? "text-destructive" : ""}>
      {label}
    </Label>
    {children}
    {errors[name] && (
      <p className="text-sm text-destructive">{errors[name]?.message as string}</p>
    )}
  </div>
);


export function ReportForm({ onSubmit, isLoading, initialData }: ReportFormProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      sex: "Unknown",
      sedation: "None",
      ageYears: 0,
      ageMonths: 0,
      clinicName: "VETscribe Advanced Imaging",
      clinicAddress: "123 Wellness Road, Petville, PV 54321",
      clinicLogoUrl: "https://placehold.co/200x75.png?text=VETscribe&font=belleza",
      vetName: "Dr. Pawsworth",
      ...initialData,
      examDate: initialData?.examDate ? new Date(initialData.examDate) : new Date(),
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file => ({
        id: crypto.randomUUID(),
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setUploadedImages(prev => [...prev, ...newFiles]);
    }
  };

  const removeImage = (id: string) => {
    setUploadedImages(prev => prev.filter(img => {
      if (img.id === id) {
        URL.revokeObjectURL(img.previewUrl); // Clean up object URL
        return false;
      }
      return true;
    }));
  };

  const onFormSubmit = (data: ReportFormData) => {
    const imageFiles = uploadedImages.map(img => img.file);
    onSubmit(data, imageFiles);
  };
  
  const currentSedation = watch("sedation");

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
          <FileText className="w-8 h-8" /> Create New Report
        </CardTitle>
        <CardDescription className="font-body">
          Fill in the details below to generate an ultrasound report.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          <ScrollArea className="h-[calc(100vh-20rem)] pr-4">
            <div className="space-y-6">
            
            <AccordionSection title="Clinic Information">
                <FormField name="clinicName" label="Clinic Name" errors={errors}>
                  <Input id="clinicName" {...register("clinicName")} />
                </FormField>
                <FormField name="clinicAddress" label="Clinic Address" errors={errors}>
                  <Input id="clinicAddress" {...register("clinicAddress")} />
                </FormField>
                <FormField name="clinicLogoUrl" label="Clinic Logo URL" errors={errors}>
                  <Input id="clinicLogoUrl" {...register("clinicLogoUrl")} placeholder="https://example.com/logo.png"/>
                </FormField>
                 <FormField name="vetName" label="Veterinarian Name" errors={errors}>
                  <Input id="vetName" {...register("vetName")} />
                </FormField>
            </AccordionSection>

            <AccordionSection title="Pet Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="petName" label="Pet Name" errors={errors}>
                  <Input id="petName" {...register("petName")} />
                </FormField>
                <FormField name="ownerName" label="Owner Name" errors={errors}>
                  <Input id="ownerName" {...register("ownerName")} />
                </FormField>
                <FormField name="species" label="Species" errors={errors}>
                  <Input id="species" {...register("species")} />
                </FormField>
                <FormField name="breed" label="Breed" errors={errors}>
                  <Input id="breed" {...register("breed")} />
                </FormField>
                <div className="grid grid-cols-2 gap-2">
                  <FormField name="ageYears" label="Age (Years)" errors={errors}>
                    <Input id="ageYears" type="number" {...register("ageYears")} min="0" />
                  </FormField>
                  <FormField name="ageMonths" label="Age (Months)" errors={errors}>
                    <Input id="ageMonths" type="number" {...register("ageMonths")} min="0" max="11" />
                  </FormField>
                </div>
                <FormField name="sex" label="Sex" errors={errors}>
                  <Controller
                    name="sex"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="sex"><SelectValue placeholder="Select sex" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Male Neutered">Male Neutered</SelectItem>
                          <SelectItem value="Female Spayed">Female Spayed</SelectItem>
                          <SelectItem value="Unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField name="patientId" label="Patient ID (Optional)" errors={errors}>
                  <Input id="patientId" {...register("patientId")} />
                </FormField>
              </div>
            </AccordionSection>

            <AccordionSection title="Exam Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="referringVet" label="Referring Veterinarian (Optional)" errors={errors}>
                  <Input id="referringVet" {...register("referringVet")} />
                </FormField>
                <FormField name="examDate" label="Exam Date" errors={errors}>
                   <Controller
                    name="examDate"
                    control={control}
                    render={({ field }) => (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={`w-full justify-start text-left font-normal ${!field.value && "text-muted-foreground"}`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </FormField>
              </div>
              <FormField name="examType" label="Exam Type (e.g. Abdominal Ultrasound)" errors={errors}>
                <Input id="examType" {...register("examType")} />
              </FormField>
              <FormField name="clinicalHistory" label="Clinical History / Reason for Exam" errors={errors}>
                <Textarea id="clinicalHistory" {...register("clinicalHistory")} rows={3} />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="sedation" label="Sedation" errors={errors}>
                  <Controller
                    name="sedation"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="sedation"><SelectValue placeholder="Select sedation level" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="None">None</SelectItem>
                          <SelectItem value="Light">Light</SelectItem>
                          <SelectItem value="Moderate">Moderate</SelectItem>
                          <SelectItem value="Heavy">Heavy</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                {currentSedation !== "None" && (
                  <FormField name="sedationAgent" label="Sedation Agent(s) (Optional)" errors={errors}>
                    <Input id="sedationAgent" {...register("sedationAgent")} />
                  </FormField>
                )}
              </div>
            </AccordionSection>

            <AccordionSection title="Exam Images">
              <FormField name="imageUpload" label="Upload Exam Images (Optional)" errors={errors}>
                <Input id="imageUpload" type="file" accept="image/*" multiple onChange={handleImageUpload} className="file:text-primary file:font-medium" />
              </FormField>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="relative group aspect-square border rounded-md overflow-hidden shadow">
                      <Image src={img.previewUrl} alt="Exam image preview" layout="fill" objectFit="cover" data-ai-hint="ultrasound scan" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(img.id)}
                        aria-label="Remove image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

            <AccordionSection title="Findings & Report Generation">
              <FormField name="findings" label="Structured Findings" errors={errors}>
                <Textarea
                  id="findings"
                  {...register("findings")}
                  rows={8}
                  placeholder="Describe all observed structures and any abnormalities in detail. E.g., Liver: Normal size and echogenicity. No focal lesions identified. Spleen: Mildly enlarged with diffuse hypoechoic nodularity..."
                  className="font-body"
                />
              </FormField>
              <FormField name="additionalNotes" label="Additional Notes / Impressions (Optional)" errors={errors}>
                <Textarea id="additionalNotes" {...register("additionalNotes")} rows={4} placeholder="Any other comments, differential diagnoses, or recommendations." className="font-body"/>
              </FormField>
            </AccordionSection>
            </div>
          </ScrollArea>

          <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Report...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Generate Report
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}


// Simple Accordion-like section for styling
const AccordionSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-4 py-4">
    <h3 className="text-xl font-headline text-primary border-b pb-2 mb-4">{title}</h3>
    <div className="space-y-4">
     {children}
    </div>
  </div>
);

// This component ensures that browser-specific APIs are only called on the client-side.
const ClientOnlyForm: React.FC<ReportFormProps> = (props) => {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <ReportForm {...props} /> : <div>Loading form...</div>; // Or a skeleton loader
};

export default ClientOnlyForm;

