
"use client";

import type { ReportFormData, UploadedImage } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, AlertTriangle, Info, FileText } from "lucide-react";
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
      <span className="font-semibold text-foreground/80 font-headline">{label}: </span>
      <span className="font-body text-foreground">{String(value)}</span>
    </div>
  );
};

export function ReportPreview({ formData, reportText, uploadedImages, isLoading, error }: ReportPreviewProps) {
  const handlePrint = () => {
    window.print();
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
          <AlertTitle className="font-headline">Erro ao Gerar Laudo</AlertTitle>
          <AlertDescription className="font-body">{error}</AlertDescription>
        </Alert>
      );
    }

    if (!formData) {
      return (
        <Alert className="m-4 border-primary/50">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="font-headline text-primary">Pré-visualização do Laudo</AlertTitle>
          <AlertDescription className="font-body">
            Preencha o formulário e clique em "Gerar Laudo" para ver a pré-visualização aqui.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div id="printable-area" className="p-2 md:p-6 font-body printable-content">
        {/* Watermark - Only visible on print */}
        <div className="print-watermark">
          <NextImage
            src="/baddha-logo.png"
            alt="Baddha Ultrassonografia Marca D'água"
            layout="fill"
            objectFit="contain"
            data-ai-hint="baddha logo"
          />
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-start mb-4 print:mb-2">
          <div className="print:max-w-[60%]">
             <NextImage
                src="/baddha-logo.png"
                alt={`${formData.clinicName || 'Baddha Ultrassonografia'} Logo`}
                width={180} 
                height={40} 
                className="mb-1 object-contain print:w-[150px] print:h-auto"
                data-ai-hint="baddha ultrasound logo"
                priority
              />
            <h1 className="text-xl font-headline text-primary print:text-base">{formData.clinicName || "Baddha Ultrassonografia"}</h1>
            <p className="text-xs text-foreground/80 print:text-[7pt]">Veterinário(a): {formData.vetName || "Dra. Míriam Barp F. da Costa"}</p>
          </div>
          <div className="text-right print:max-w-[40%]">
            <h2 className="text-lg font-headline text-primary print:text-sm">Laudo de Ultrassonografia Veterinária</h2>
            <DetailItem label="Data do Exame" value={format(formData.examDate, "PPP", { locale: ptBR })} className="print:text-[7pt]" />
            <DetailItem label="Data do Laudo" value={format(new Date(), "PPP", { locale: ptBR })} className="print:text-[7pt]" />
          </div>
        </div>

        <Separator className="my-3 print:my-1" />

        {/* Patient Information */}
        <h3 className="text-base font-headline text-primary mb-1 print:text-xs print:mb-0.5">Informações do Paciente</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 mb-3 text-xs print:text-[7pt] print:gap-y-px">
          <DetailItem label="Nome" value={formData.petName} />
          <DetailItem label="ID" value={formData.patientId} />
          <DetailItem label="Espécie" value={formData.species} />
          <DetailItem label="Raça" value={formData.breed} />
          <DetailItem label="Idade" value={`${formData.ageYears} ano(s)${formData.ageMonths && formData.ageMonths > 0 ? ' e ' + formData.ageMonths + ' mes(es)' : '' }`} />
          <DetailItem label="Sexo" value={formData.sex} />
          <DetailItem label="Tutor" value={formData.ownerName} />
          <DetailItem label="Vet. Solicitante" value={formData.referringVet} />
        </div>

        <Separator className="my-3 print:my-1" />

        {/* Findings - Hidden on print */}
        <div className="no-print">
          <h3 className="text-lg font-headline text-primary mt-4 mb-2">Achados</h3>
          <div className="whitespace-pre-wrap p-2 border rounded-md bg-muted/30 text-sm">
            {formData.findings}
          </div>
        </div>

        {/* AI Generated Report / Impressions */}
        {reportText && (
          <>
            <h3 className="text-base font-headline text-primary mt-3 mb-1 print:text-xs print:mt-1.5 print:mb-0.5">Impressões / Conclusões</h3>
            <div className="whitespace-pre-wrap p-2 border rounded-md bg-primary/5 text-sm print:text-[8pt] print:border-none print:p-0">
              {reportText}
            </div>
          </>
        )}

        {/* Additional Notes */}
        {formData.additionalNotes && (
           <>
            <h3 className="text-base font-headline text-primary mt-3 mb-1 print:text-xs print:mt-1.5 print:mb-0.5">Observações Adicionais</h3>
            <div className="whitespace-pre-wrap p-2 border rounded-md bg-muted/30 text-sm print:text-[8pt] print:border-none print:p-0">
              {formData.additionalNotes}
            </div>
          </>
        )}

        {/* Images Section */}
        {uploadedImages.length > 0 && (
          <>
            <h3 className="text-base font-headline text-primary mt-4 mb-1 print:text-xs print:mt-2 print:mb-0.5">Imagens do Exame</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 print:grid-cols-3 gap-2 print:gap-1">
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
        
        {/* Placeholder for signature area on screen, hidden in print */}
        <div className="hide-in-print mt-12 pt-6 border-t">
           {/* This div is for potential on-screen signature elements, hidden in print */}
        </div>

        {/* Fixed Footer for Print - This will appear on every printed page */}
        <div className="print-page-footer">
          <NextImage
            src="/ASSINATURA.png"
            alt="Assinatura Digitalizada"
            width={150} 
            height={50} 
            data-ai-hint="doctor signature"
            priority
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
          <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
            <FileText className="w-8 h-8" /> Pré-visualização do Laudo
          </CardTitle>
          <CardDescription className="font-body">
            Revise o laudo gerado abaixo. Use o botão de imprimir para salvar como PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          {renderContent()}
        </CardContent>
        <CardFooter className="flex-shrink-0 border-t pt-6 justify-end">
          <Button onClick={handlePrint} disabled={!formData || isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Printer className="mr-2 h-4 w-4" /> Imprimir para PDF
          </Button>
        </CardFooter>
      </Card>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          #printable-area, 
          #printable-area *,
          .print-page-footer, 
          .print-page-footer *,
          .print-watermark,
          .print-watermark * { 
            visibility: visible !important;
          }
          
          .no-print, .hide-in-print {
            display: none !important;
          }

          #printable-area {
            width: 100%;
            font-size: 8pt; 
            padding: 0; /* Reset padding for full control */
            margin: 0;
            position: relative; /* Important for z-index stacking of watermark */
            padding-bottom: 20mm; /* Space for the fixed footer */
          }
          
          .page-break-before {
            page-break-before: always;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
          }
          
          .print-page-footer {
            display: block !important; 
            position: fixed;
            bottom: 8mm;
            left: 0;
            right: 0;
            width: 100%;
            text-align: center; 
            z-index: 1000; 
          }
          .print-page-footer img {
            max-width: 150px; 
            max-height: 50px; 
            height: auto; 
            border: none !important; /* Ensure no border on signature image */
          }

          .print-watermark {
            display: block !important;
            position: fixed !important;
            top: 50%;
            left: 50%;
            width: 15cm; 
            height: 15cm;
            transform: translate(-50%, -50%);
            opacity: 0.05 !important; /* Very light opacity for watermark */
            z-index: -1 !important; /* Behind the content */
            pointer-events: none; /* Ensure it's not interactive */
          }
          .print-watermark img {
             width: 100%;
             height: 100%;
             object-fit: contain; /* Ensure logo scales correctly within 15cm box */
          }

          /* Reduce header size for print */
          #printable-area .print\\:text-base { font-size: 10pt !important; }
          #printable-area .print\\:text-sm { font-size: 9pt !important; }
          #printable-area .print\\:text-xs { font-size: 8pt !important; }
          #printable-area .print\\:text-\\[7pt\\] { font-size: 7pt !important; }
          #printable-area .print\\:text-\\[8pt\\] { font-size: 8pt !important; }

          #printable-area .print\\:mb-2 { margin-bottom: 0.5rem !important; }
          #printable-area .print\\:mb-1 { margin-bottom: 0.25rem !important; }
          #printable-area .print\\:mb-0\\.5 { margin-bottom: 0.125rem !important; }
          #printable-area .print\\:mt-2 { margin-top: 0.5rem !important; }
          #printable-area .print\\:mt-1\\.5 { margin-top: 0.375rem !important; }
          #printable-area .print\\:my-1 { margin-top: 0.25rem !important; margin-bottom: 0.25rem !important; }
          #printable-area .print\\:gap-1 { gap: 0.25rem !important; }
          #printable-area .print\\:gap-y-px { gap-row: 1px !important; }
          #printable-area .print\\:p-0\\.5 { padding: 0.125rem !important; }
        }
      `}</style>
    </>
  );
}
    
