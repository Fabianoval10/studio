
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
import { ptBR } from 'date-fns/locale';
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
      sex: "Desconhecido",
      sedation: "Nenhuma",
      ageYears: 0,
      ageMonths: 0,
      clinicName: "VETscribe Imagens Avançadas",
      vetName: "Dr(a). AuMiau",
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
    <Card className="shadow-lg flex flex-col h-full">
      <CardHeader>
        <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
          <FileText className="w-8 h-8" /> Criar Novo Laudo
        </CardTitle>
        <CardDescription className="font-body">
          Preencha os detalhes abaixo para gerar um laudo de ultrassom.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0 overflow-y-hidden"> {/* Adjusted for flex layout and internal scroll */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-grow p-6 space-y-6"> {/* p-6 for form padding, flex-grow for form to take space */}
          <ScrollArea className="flex-grow pr-4 report-form-scroll-area"> {/* flex-grow for scroll area, added class for print styles */}
            <div className="space-y-6">
            
            <AccordionSection title="Informações da Clínica">
                <FormField name="clinicName" label="Nome da Clínica" errors={errors}>
                  <Input id="clinicName" {...register("clinicName")} />
                </FormField>
                 <FormField name="vetName" label="Nome do Veterinário(a)" errors={errors}>
                  <Input id="vetName" {...register("vetName")} />
                </FormField>
            </AccordionSection>

            <AccordionSection title="Informações do Pet">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="petName" label="Nome do Pet" errors={errors}>
                  <Input id="petName" {...register("petName")} />
                </FormField>
                <FormField name="ownerName" label="Nome do Tutor" errors={errors}>
                  <Input id="ownerName" {...register("ownerName")} />
                </FormField>
                <FormField name="species" label="Espécie" errors={errors}>
                  <Input id="species" {...register("species")} />
                </FormField>
                <FormField name="breed" label="Raça" errors={errors}>
                  <Input id="breed" {...register("breed")} />
                </FormField>
                <div className="grid grid-cols-2 gap-2">
                  <FormField name="ageYears" label="Idade (Anos)" errors={errors}>
                    <Input id="ageYears" type="number" {...register("ageYears")} min="0" />
                  </FormField>
                  <FormField name="ageMonths" label="Idade (Meses)" errors={errors}>
                    <Input id="ageMonths" type="number" {...register("ageMonths")} min="0" max="11" />
                  </FormField>
                </div>
                <FormField name="sex" label="Sexo" errors={errors}>
                  <Controller
                    name="sex"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="sex"><SelectValue placeholder="Selecione o sexo" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Macho">Macho</SelectItem>
                          <SelectItem value="Fêmea">Fêmea</SelectItem>
                          <SelectItem value="Macho Castrado">Macho Castrado</SelectItem>
                          <SelectItem value="Fêmea Castrada">Fêmea Castrada</SelectItem>
                          <SelectItem value="Desconhecido">Desconhecido</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                <FormField name="patientId" label="ID do Paciente (Opcional)" errors={errors}>
                  <Input id="patientId" {...register("patientId")} />
                </FormField>
              </div>
            </AccordionSection>

            <AccordionSection title="Informações do Exame">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="referringVet" label="Veterinário Solicitante (Opcional)" errors={errors}>
                  <Input id="referringVet" {...register("referringVet")} />
                </FormField>
                <FormField name="examDate" label="Data do Exame" errors={errors}>
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
                            {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Escolha uma data</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </FormField>
              </div>
              <FormField name="examType" label="Tipo de Exame (ex: Ultrassom Abdominal)" errors={errors}>
                <Input id="examType" {...register("examType")} />
              </FormField>
              <FormField name="clinicalHistory" label="Histórico Clínico / Motivo do Exame" errors={errors}>
                <Textarea id="clinicalHistory" {...register("clinicalHistory")} rows={3} />
              </FormField>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField name="sedation" label="Sedação" errors={errors}>
                  <Controller
                    name="sedation"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger id="sedation"><SelectValue placeholder="Selecione o nível de sedação" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Nenhuma">Nenhuma</SelectItem>
                          <SelectItem value="Leve">Leve</SelectItem>
                          <SelectItem value="Moderada">Moderada</SelectItem>
                          <SelectItem value="Pesada">Pesada</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </FormField>
                {currentSedation !== "Nenhuma" && (
                  <FormField name="sedationAgent" label="Agente(s) de Sedação (Opcional)" errors={errors}>
                    <Input id="sedationAgent" {...register("sedationAgent")} />
                  </FormField>
                )}
              </div>
            </AccordionSection>

            <AccordionSection title="Imagens do Exame">
              <FormField name="findings" label="Carregar Imagens do Exame (Opcional)" errors={errors}>
                <Input id="imageUpload" type="file" accept="image/*" multiple onChange={handleImageUpload} className="file:text-primary file:font-medium" />
              </FormField>
              {uploadedImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                  {uploadedImages.map((img) => (
                    <div key={img.id} className="relative group aspect-square border rounded-md overflow-hidden shadow">
                      <Image src={img.previewUrl} alt="Pré-visualização da imagem do exame" layout="fill" objectFit="cover" data-ai-hint="ultrasound scan" />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => removeImage(img.id)}
                        aria-label="Remover imagem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </AccordionSection>

            <AccordionSection title="Achados & Geração de Laudo">
              <FormField name="findings" label="Achados Estruturados" errors={errors}>
                <Textarea
                  id="findings"
                  {...register("findings")}
                  rows={8}
                  placeholder="Descreva todas as estruturas observadas e quaisquer anormalidades em detalhe. Ex: Fígado: Tamanho e ecogenicidade normais. Ausência de lesões focais. Baço: Levemente aumentado com nodularidade hipoecóica difusa..."
                  className="font-body"
                />
              </FormField>
              <FormField name="additionalNotes" label="Observações Adicionais / Impressões (Opcional)" errors={errors}>
                <Textarea id="additionalNotes" {...register("additionalNotes")} rows={4} placeholder="Quaisquer outros comentários, diagnósticos diferenciais ou recomendações." className="font-body"/>
              </FormField>
            </AccordionSection>
            </div>
          </ScrollArea>

          <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground mt-auto"> {/* mt-auto to push button down in flex col */}
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Gerando Laudo...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                Gerar Laudo
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

  return isClient ? <ReportForm {...props} /> : 
    (
      <Card className="shadow-lg flex flex-col h-full">
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
            <FileText className="w-8 h-8" /> Carregando...
          </CardTitle>
          <CardDescription className="font-body">
            O formulário está sendo preparado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
};

export default ClientOnlyForm;

