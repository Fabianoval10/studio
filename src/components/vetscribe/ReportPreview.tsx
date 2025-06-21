
"use client";

import type { ReportFormData, UploadedImage } from "@/types";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, AlertTriangle, Info, FileText, Mail } from "lucide-react";
import NextImage from "next/image";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface ReportPreviewProps {
  formData: ReportFormData | null;
  reportText: string | null;
  uploadedImages: UploadedImage[];
  isLoading: boolean;
  error?: string | null;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ label, value, className }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className={className}>
      <span className="font-semibold text-foreground/80">{label}: </span>
      <span className="font-sans text-foreground">{String(value)}</span>
    </div>
  );
};

const renderBoldMarkdown = (text: string | null) => {
  if (!text) return null;
  // Regex to find **bolded text**
  return (
    <React.Fragment>
      {text.split(/(\*\*.*?\*\*)/g).map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <b key={index}>{part.slice(2, -2)}</b>;
        }
        return part;
      })}
    </React.Fragment>
  );
};

export function ReportPreview({ formData, reportText, uploadedImages, isLoading, error }: ReportPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    if (!formData) return;
    const subject = `Laudo de Ultrassonografia - ${formData.petName}`;
    const body = `Olá,\n\nSegue em anexo o laudo de ultrassonografia do paciente ${formData.petName}.\n\nPor favor, salve o laudo como PDF e anexe a este e-mail antes de enviar.\n\nAtenciosamente,\n${formData.vetName}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro ao Gerar Laudo</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (!formData) {
      return (
        <Alert className="m-4 border-primary/50">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle>Pré-visualização do Laudo</AlertTitle>
          <AlertDescription>
            Preencha o formulário e clique em "Gerar Laudo" para ver a pré-visualização aqui.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div id="printable-area" className="p-2 md:p-6 printable-content">
        <div className="flex justify-between items-start mb-4">
          <div className="print:max-w-[55%]">
            <h1 className="text-xl font-headline font-bold text-primary">{formData.clinicName || "Nome da Clínica"}</h1>
            <p className="text-sm font-sans text-foreground/80">Veterinário(a): {formData.vetName || "Nome do Veterinário"}</p>
          </div>
          <div className="text-right print:max-w-[45%]">
            <h2 className="text-lg font-headline text-primary">Laudo de Ultrassonografia Veterinária</h2>
            <DetailItem label="Data do Exame" value={format(formData.examDate, "PPP", { locale: ptBR })} />
          </div>
        </div>

        <Separator className="my-3" />

        <h3 className="text-base font-headline text-primary mb-1">Informações do Paciente</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0 text-sm mb-3">
          <DetailItem label="Nome" value={formData.petName} />
          <DetailItem label="ID" value={formData.patientId} />
          <DetailItem label="Espécie" value={formData.species} />
          <DetailItem label="Raça" value={formData.breed} />
          <DetailItem label="Idade" value={`${formData.ageYears} ano(s)${formData.ageMonths && formData.ageMonths > 0 ? ' e ' + formData.ageMonths + ' mes(es)' : '' }`} />
          <DetailItem label="Sexo" value={formData.sex} />
          <DetailItem label="Tutor" value={formData.ownerName} />
          <DetailItem label="Vet. Solicitante" value={formData.referringVet} />
        </div>

        <Separator className="my-3" />
        
        {reportText && (
          <>
            <h3 className="text-base font-headline text-primary mt-3 mb-1">Achados, Impressões e Conclusões</h3>
            <div className="whitespace-pre-wrap p-2 border rounded-md bg-primary/5 font-sans">
              {renderBoldMarkdown(reportText)}
            </div>
          </>
        )}

        {formData.additionalNotes && (
           <>
            <h3 className="text-base font-headline text-primary mt-3 mb-1">Observações Adicionais</h3>
            <div className="whitespace-pre-wrap p-2 border rounded-md bg-muted/30 font-sans">
              {formData.additionalNotes}
            </div>
          </>
        )}

        {uploadedImages.length > 0 && (
          <>
            <h3 className="text-base font-headline text-primary mt-4 mb-1">Imagens do Exame</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-3 gap-2">
              {uploadedImages.map((img, index) => (
                <div key={img.id} className="border rounded-md overflow-hidden shadow-sm break-inside-avoid p-0.5 print:border-gray-300">
                  <NextImage
                    src={img.previewUrl}
                    alt={`Imagem do exame ${index + 1}`}
                    width={200} 
                    height={150}
                    style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
                    data-ai-hint="ultrasound medical"
                  />
                </div>
              ))}
            </div>
          </>
        )}
        
        <div className="hide-in-print mt-12 pt-6 border-t">
        </div>

        <div className="print-page-footer">
          <NextImage
            src="/ASSINATURA.png"
            alt="Assinatura Digitalizada"
            width={150} 
            height={50} 
            data-ai-hint="doctor signature"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    );
  };

  return (
    <>
      <Card className="shadow-lg h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="text-3xl font-headline text-primary flex items-center gap-2">
            <FileText className="w-8 h-8" /> Pré-visualização do Laudo
          </CardTitle>
          <CardDescription className="font-sans">
            Revise o laudo gerado abaixo. Use o botão de imprimir para salvar como PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          {renderContent()}
        </CardContent>
        <CardFooter className="flex-shrink-0 border-t pt-6 justify-end">
           <Button onClick={handleEmail} disabled={!formData || isLoading} variant="outline" className="mr-2">
              <Mail className="mr-2 h-4 w-4" /> Enviar por Email
            </Button>
          <Button onClick={handlePrint} disabled={!formData || isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Printer className="mr-2 h-4 w-4" /> Imprimir para PDF
          </Button>
        </CardFooter>
      </Card>
      <style jsx global>{`
        .print-page-footer {
          display: none; 
        }
        @media print {
          @page {
            margin-top: 5mm; 
            margin-left: 10mm;
            margin-right: 10mm;
            margin-bottom: 25mm;
          }

          body * {
            visibility: hidden;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          #printable-area, 
          #printable-area * {
            visibility: visible !important;
          }
          
          .no-print, .hide-in-print {
            display: none !important;
          }

          #printable-area {
            width: 100%;
            padding: 0; 
            margin: 0; 
            position: relative; 
            padding-bottom: 20mm; /* Space for footer */
            font-size: 11pt;
            font-family: 'Montserrat', sans-serif;
          }
           
          #printable-area h1,
          #printable-area h2,
          #printable-area h3 {
             font-family: 'Montserrat', sans-serif !important;
             font-weight: 300 !important;
             font-size: 18pt !important;
             margin-top: 0.3rem !important;
             margin-bottom: 0.15rem !important;
             line-height: 1.2;
             color: #78655B; /* Principal Brown */
          }

          #printable-area .text-sm,
          #printable-area .text-xs,
          #printable-area .font-sans {
              font-size: 11pt !important;
              font-family: 'Montserrat', sans-serif !important;
          }

          #printable-area .font-headline {
              font-family: 'Montserrat', sans-serif !important;
              font-weight: 700 !important;
          }

          #printable-area .my-3 {
             margin-top: 0.15rem !important; margin-bottom: 0.15rem !important;
          }

          .page-break-before {
            page-break-before: always;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
          }
          
          .print-page-footer {
            visibility: visible !important;
            display: block !important; 
            position: fixed;
            bottom: 5mm; 
            left: 0;
            right: 0;
            text-align: center; 
            z-index: 1000; 
          }
          .print-page-footer img {
            max-width: 150px; 
            max-height: 50px; 
            height: auto; 
            border: none !important;
          }
        }
      `}</style>
    </>
  );
}
