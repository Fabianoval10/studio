
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CalendarIcon, ImageIcon, Trash2, FileText, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import React, { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ReportFormProps {
  onSubmit: (data: ReportFormData, images: File[]) => Promise<void>;
  isLoading: boolean;
  initialData?: Partial<ReportFormData>;
}

const FormFieldWrapper = ({ name, label, errors, children, className, fieldType = "input" }: { name: keyof ReportFormData | string, label: string, errors: FieldErrors<ReportFormData>, children: React.ReactNode, className?: string, fieldType?: string }) => (
  <div className={cn("space-y-2", className)}>
    <Label htmlFor={name as string} className={errors[name as keyof ReportFormData] ? "text-destructive" : ""}>
      {label}
    </Label>
    {children}
    {errors[name as keyof ReportFormData] && (
      <p className="text-sm text-destructive">{errors[name as keyof ReportFormData]?.message as string}</p>
    )}
  </div>
);


export function ReportForm({ onSubmit, isLoading, initialData }: ReportFormProps) {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      sex: "Desconhecido",
      ageYears: 0,
      ageMonths: 0,
      clinicName: "",
      vetName: "",
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
        URL.revokeObjectURL(img.previewUrl);
        return false;
      }
      return true;
    }));
  };

  const onFormSubmit = (data: ReportFormData) => {
    const imageFiles = uploadedImages.map(img => img.file as File);
    onSubmit(data, imageFiles.filter(f => f));
  };
  

  return (
    <Card className="shadow-lg flex flex-col h-full">
      <CardHeader>
        <CardTitle className="text-3xl text-primary flex items-center gap-2">
          <FileText className="w-8 h-8" /> Criar Novo Laudo
        </CardTitle>
        <CardDescription>
          Preencha os detalhes abaixo para gerar um laudo de ultrassom.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col p-0 overflow-y-hidden">
        <form onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col flex-grow p-6 space-y-6">
          <ScrollArea className="flex-grow pr-4 report-form-scroll-area">
            <Accordion type="multiple" defaultValue={["clinic-info","pet-info","exam-info", "findings-generation"]} className="w-full">
              <AccordionItem value="clinic-info">
                <AccordionTrigger className="text-xl text-primary hover:no-underline">Informações da Clínica</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <FormFieldWrapper name="clinicName" label="Nome da Clínica" errors={errors}>
                    <Input id="clinicName" {...register("clinicName")} />
                  </FormFieldWrapper>
                  <FormFieldWrapper name="vetName" label="Nome do Veterinário(a)" errors={errors}>
                    <Input id="vetName" {...register("vetName")} />
                  </FormFieldWrapper>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="pet-info">
                <AccordionTrigger className="text-xl text-primary hover:no-underline">Informações do Pet</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormFieldWrapper name="petName" label="Nome do Pet" errors={errors}>
                      <Input id="petName" {...register("petName")} />
                    </FormFieldWrapper>
                    <FormFieldWrapper name="ownerName" label="Nome do Tutor" errors={errors}>
                      <Input id="ownerName" {...register("ownerName")} />
                    </FormFieldWrapper>
                    <FormFieldWrapper name="species" label="Espécie" errors={errors}>
                      <Input id="species" {...register("species")} />
                    </FormFieldWrapper>
                    <FormFieldWrapper name="breed" label="Raça" errors={errors}>
                      <Input id="breed" {...register("breed")} />
                    </FormFieldWrapper>
                    <div className="grid grid-cols-2 gap-2">
                      <FormFieldWrapper name="ageYears" label="Idade (Anos)" errors={errors}>
                        <Input id="ageYears" type="number" {...register("ageYears")} min="0" />
                      </FormFieldWrapper>
                      <FormFieldWrapper name="ageMonths" label="Idade (Meses)" errors={errors}>
                        <Input id="ageMonths" type="number" {...register("ageMonths")} min="0" max="11" />
                      </FormFieldWrapper>
                    </div>
                    <FormFieldWrapper name="sex" label="Sexo" errors={errors}>
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
                    </FormFieldWrapper>
                    <FormFieldWrapper name="patientId" label="ID do Paciente (Opcional)" errors={errors}>
                      <Input id="patientId" {...register("patientId")} />
                    </FormFieldWrapper>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="exam-info">
                <AccordionTrigger className="text-xl text-primary hover:no-underline">Informações do Exame</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormFieldWrapper name="referringVet" label="Veterinário Solicitante (Opcional)" errors={errors}>
                      <Input id="referringVet" {...register("referringVet")} />
                    </FormFieldWrapper>
                    <FormFieldWrapper name="examDate" label="Data do Exame" errors={errors}>
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
                    </FormFieldWrapper>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="exam-images">
                <AccordionTrigger className="text-xl text-primary hover:no-underline">Imagens do Exame</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <FormFieldWrapper name="findings" label="Carregar Imagens do Exame (Opcional)" errors={errors} fieldType="images">
                    <Input id="imageUpload" type="file" accept="image/*" multiple onChange={handleImageUpload} className="file:text-primary file:font-medium" />
                  </FormFieldWrapper>
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
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="findings-generation">
                <AccordionTrigger className="text-xl text-primary hover:no-underline">Achados & Geração de Laudo</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  <FormFieldWrapper name="findings" label="Achados e Medidas" errors={errors} fieldType="textarea">
                    <Textarea
                      id="findings"
                      {...register("findings")}
                      rows={10}
                      placeholder="Descreva aqui TODAS as estruturas, anormalidades e medidas. Ex: 'Fígado com dimensões de 5.5cm, contornos regulares e ecotextura homogênea. Baço medindo 10cm x 3cm, apresentando múltiplos nódulos hipoecóicos.'"
                    />
                  </FormFieldWrapper>
                   <FormFieldWrapper name="additionalNotes" label="Observações Adicionais / Impressões (Opcional)" errors={errors} fieldType="textarea">
                    <Textarea id="additionalNotes" {...register("additionalNotes")} rows={4} placeholder="Quaisquer outros comentários, diagnósticos diferenciais ou recomendações."/>
                  </FormFieldWrapper>
                </AccordionContent>
              </AccordionItem>

            </Accordion>
          </ScrollArea>

          <Button type="submit" disabled={isLoading} className="w-full text-lg py-6 bg-accent hover:bg-accent/90 text-accent-foreground mt-auto">
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

const ClientOnlyForm: React.FC<ReportFormProps> = (props) => {
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <Card className="shadow-lg flex flex-col h-full">
        <CardHeader>
          <CardTitle className="text-3xl text-primary flex items-center gap-2">
            <FileText className="w-8 h-8" /> Carregando Formulário...
          </CardTitle>
          <CardDescription>
            O formulário de criação de laudo está sendo preparado.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  return <ReportForm {...props} />;
};

export default ClientOnlyForm;
