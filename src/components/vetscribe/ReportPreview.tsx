
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
        <div className="print-watermark">
          <NextImage
            src="/baddha-logo.png"
            alt="Baddha Ultrassonografia Marca D'água"
            layout="fill"
            objectFit="contain"
            data-ai-hint="baddha logo"
          />
        </div>

        <div className="flex justify-between items-start mb-4 print:pt-0 print:mb-1">
          <div className="print:max-w-[55%]">
             <NextImage
                src="/baddha-logo.png"
                alt={`${formData.clinicName || 'Baddha Ultrassonografia'} Logo`}
                width={120} 
                height={27}
                className="mb-1 print:mb-0 object-contain print:w-[100px] print:h-auto print:mt-0"
                data-ai-hint="baddha ultrasound logo"
                priority
              />
            <h1 className="text-xl font-headline text-primary print:text-[10pt] print:leading-tight print:mt-0">{formData.clinicName || "Baddha Ultrassonografia"}</h1>
            <p className="text-xs text-foreground/80 print:text-[7pt] print:leading-tight print:mt-0">Veterinário(a): {formData.vetName || "Dra. Míriam Barp F. da Costa"}</p>
          </div>
          <div className="text-right print:max-w-[45%] print:text-[7pt]">
            <h2 className="text-lg font-headline text-primary print:text-[9pt] print:leading-tight print:mt-0">Laudo de Ultrassonografia Veterinária</h2>
            <DetailItem label="Data do Exame" value={format(formData.examDate, "PPP", { locale: ptBR })} className="print:leading-tight print:mt-0" />
            <DetailItem label="Data do Laudo" value={format(new Date(), "PPP", { locale: ptBR })} className="print:leading-tight print:mt-0" />
          </div>
        </div>

        <Separator className="my-3 print:my-1" />

        <h3 className="text-base font-headline text-primary mb-1 print:text-[9pt] print:mb-0.5 print:mt-1">Informações do Paciente</h3>
        <div className="grid grid-cols-2 gap-x-3 gap-y-0 text-xs print:text-[7pt] print:gap-y-px print:leading-snug mb-3">
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
        
        {reportText && (
          <>
            <h3 className="text-base font-headline text-primary mt-3 mb-1 print:text-[9pt] print:mt-1 print:mb-0.5">Achados, Impressões e Conclusões</h3>
            <div className="whitespace-pre-wrap p-2 border rounded-md bg-primary/5 text-sm print:text-[8pt] print:border-none print:p-0 print:leading-normal">
              {reportText}
            </div>
          </>
        )}

        {formData.additionalNotes && (
           <>
            <h3 className="text-base font-headline text-primary mt-3 mb-1 print:text-[9pt] print:mt-1 print:mb-0.5">Observações Adicionais</h3>
            <div className="whitespace-pre-wrap p-2 border rounded-md bg-muted/30 text-sm print:text-[8pt] print:border-none print:p-0 print:leading-normal">
              {formData.additionalNotes}
            </div>
          </>
        )}

        {uploadedImages.length > 0 && (
          <>
            <h3 className="text-base font-headline text-primary mt-4 mb-1 print:text-[9pt] print:mt-2 print:mb-0.5">Imagens do Exame</h3>
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
            padding: 0; 
            margin: 0; 
            position: relative; /* Important for z-index context of watermark */
            padding-bottom: 20mm; /* Space for the footer */
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
            bottom: 5mm; /* Adjusted as per request */
            left: 0;
            right: 0;
            text-align: center; 
            z-index: 1000; /* Above watermark, below content if overlap */
          }
          .print-page-footer img {
            max-width: 150px; 
            max-height: 50px; 
            height: auto; 
            border: none !important;
            /* display: inline-block; Already centered by text-align on parent */
          }

          .print-watermark {
            display: block !important;
            position: fixed !important;
            top: 50%;
            left: 50%;
            width: 15cm; 
            height: 15cm;
            transform: translate(-50%, -50%);
            opacity: 0.05 !important; 
            z-index: -1 !important; /* Behind all content */
            pointer-events: none; 
          }
          .print-watermark img {
             width: 100%;
             height: 100%;
             object-fit: contain; 
          }

          /* Print-specific typography and spacing refinement */
          #printable-area .print\\:text-\\[10pt\\] { font-size: 10pt !important; }
          #printable-area .print\\:text-\\[9pt\\] { font-size: 9pt !important; }
          #printable-area .print\\:text-\\[8pt\\] { font-size: 8pt !important; }
          #printable-area .print\\:text-\\[7pt\\] { font-size: 7pt !important; }

          #printable-area .print\\:leading-tight { line-height: 1.2 !important; }
          #printable-area .print\\:leading-snug { line-height: 1.375 !important; }
          #printable-area .print\\:leading-normal { line-height: 1.5 !important; }
          
          #printable-area .print\\:mb-0 { margin-bottom: 0 !important; }
          #printable-area .print\\:mb-0\\.5 { margin-bottom: 0.1rem !important; }
          #printable-area .print\\:mb-1 { margin-bottom: 0.15rem !important; }
          
          #printable-area .print\\:mt-0 { margin-top: 0 !important; }
          #printable-area .print\\:mt-1 { margin-top: 0.15rem !important; }
          #printable-area .print\\:mt-2 { margin-top: 0.3rem !important; }

          #printable-area .print\\:my-1 { margin-top: 0.15rem !important; margin-bottom: 0.15rem !important; }
          #printable-area .print\\:pt-0 { padding-top: 0 !important; }
          
          #printable-area .print\\:gap-1 { gap: 0.15rem !important; }
          #printable-area .print\\:gap-y-px { row-gap: 1px !important; }
          #printable-area .print\\:p-0\\.5 { padding: 0.125rem !important; }
          #printable-area .print\\:w-\\[100px\\] { width: 100px !important; }
        }
      `}</style>
    </>
  );
}
    
