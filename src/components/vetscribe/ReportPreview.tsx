
"use client";

import type { ReportFormData, UploadedImage } from "@/types";
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, AlertTriangle, Info, FileText, Mail, PawPrint } from "lucide-react";
import NextImage from "next/image";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      <div id="printable-area" className="printable-content bg-gray-100 p-4">
        {/* --- PAGE 1: COVER --- */}
        <div className="print-page" id="cover-page">
          <header className="flex justify-between items-center text-center flex-col mb-16">
            <div className="flex items-center gap-3 bg-primary text-primary-foreground p-3 rounded-full mb-4">
              <PawPrint className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-headline text-primary font-bold">VETLD</h1>
            <p className="text-sm text-muted-foreground">Laudos de Ultrassom Inteligentes</p>
          </header>

          <main className="flex-grow flex flex-col justify-center items-center text-center">
            <h2 className="cover-title-print text-4xl font-headline font-light text-primary mb-12">
              LAUDO DE ULTRASSONOGRAFIA ABDOMINAL
            </h2>
            
            <Card className="w-full max-w-2xl text-left shadow-md border">
              <CardHeader>
                <CardTitle className="info-title-print">INFORMAÇÕES DO PACIENTE</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm info-body-print">
                <DetailItem label="Tutor" value={formData.ownerName} />
                <DetailItem label="Paciente" value={formData.petName} />
                <DetailItem label="ID do Paciente" value={formData.patientId} />
                <DetailItem label="Espécie" value={formData.species} />
                <DetailItem label="Raça" value={formData.breed} />
                <DetailItem label="Sexo" value={formData.sex} />
                <DetailItem label="Idade" value={`${formData.ageYears} ano(s)${formData.ageMonths && formData.ageMonths > 0 ? ' e ' + formData.ageMonths + ' mes(es)' : '' }`} />
                <DetailItem label="Vet. Solicitante" value={formData.referringVet} />
              </CardContent>
            </Card>
          </main>

          <footer className="text-center mt-16 info-body-print">
            <p className="font-bold">{formData.clinicName}</p>
            <p>CRMV: {formData.vetName}</p>
            <p>Data do Exame: {format(formData.examDate, "PPP", { locale: ptBR })}</p>
          </footer>
        </div>

        <div className="print-page-break"></div>

        {/* --- PAGE 2: REPORT BODY --- */}
        <div className="print-page" id="report-body-page">
          <header className="print-report-header">
            <div className="flex justify-between items-center">
              <span className="font-bold text-primary">VETLD</span>
              <span>Paciente: {formData.petName}</span>
            </div>
          </header>
          
          <main className="report-main-content">
            {reportText && (
              <>
                <h3 className="report-title-print">LAUDO DESCRITIVO</h3>
                <div className="whitespace-pre-wrap font-sans report-text-block">
                  {renderBoldMarkdown(reportText)}
                </div>
              </>
            )}
          </main>

          <footer className="print-report-footer">
            <NextImage
              src="/ASSINATURA.png"
              alt="Assinatura Digitalizada"
              width={150} 
              height={50} 
              data-ai-hint="doctor signature"
              className="mx-auto"
            />
            <p className="text-xs text-center mt-1 info-body-print">{formData.vetName}</p>
          </footer>
        </div>

        {/* --- PAGE 3: IMAGES --- */}
        {uploadedImages.length > 0 && (
          <>
            <div className="print-page-break"></div>
            <div className="print-page" id="images-page">
              <header className="print-report-header">
                 <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">VETLD</span>
                    <span>Imagens do Exame - Paciente: {formData.petName}</span>
                 </div>
              </header>
              <main className="report-main-content">
                  <h3 className="report-title-print">IMAGENS DO EXAME</h3>
                  <div className="print-image-grid">
                    {uploadedImages.map((img, index) => (
                      <div key={img.id} className="print-image-item">
                        <NextImage
                          src={img.previewUrl}
                          alt={`Imagem do exame ${index + 1}`}
                          width={300} 
                          height={225}
                          className="w-full h-auto rounded-md"
                          data-ai-hint="ultrasound medical"
                        />
                      </div>
                    ))}
                  </div>
              </main>
              <footer className="print-report-footer">
                <NextImage
                  src="/ASSINATURA.png"
                  alt="Assinatura Digitalizada"
                  width={150} 
                  height={50} 
                  data-ai-hint="doctor signature"
                  className="mx-auto"
                />
                <p className="text-xs text-center mt-1 info-body-print">{formData.vetName}</p>
              </footer>
            </div>
          </>
        )}
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
        <CardContent className="flex-grow overflow-y-auto bg-muted/20">
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
        .print-page {
          background-color: white;
          padding: 2rem;
          margin-bottom: 1rem;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
          min-height: 1123px; /* A4 height in pixels for screen representation */
        }
        .print-page-break {
          display: none;
        }
        .print-report-header, .print-report-footer {
          display: none;
        }

        @media print {
          @page {
            size: A4;
            margin: 1cm;
          }

          body, html {
            background-color: white !important;
          }
          
          body * {
            visibility: hidden;
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
          }

          #printable-area, #printable-area * {
            visibility: visible !important;
          }
          
          .no-print, .hide-in-print, .bg-muted\\/20 {
            display: none !important;
            background-color: transparent !important;
          }

          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0;
            margin: 0;
            background-color: transparent !important;
          }

          .print-page-break {
            page-break-after: always !important;
            display: block;
            height: 0;
            visibility: hidden;
          }

          .print-page {
            width: 100%;
            height: 100%;
            min-height: 0;
            padding: 0 !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
            background-color: transparent !important;
            display: flex;
            flex-direction: column;
            page-break-inside: avoid !important;
          }

          #cover-page {
             justify-content: space-between;
             text-align: center;
             padding: 2cm 0;
          }
          
          .report-main-content {
            flex-grow: 1;
          }

          .print-report-footer {
            display: block !important;
            margin-top: auto; /* Push to bottom */
            padding-top: 1rem;
            width: 100%;
            text-align: center;
          }

          /* --- FONT STYLES --- */
          .cover-title-print, .report-title-print, .info-title-print {
            font-family: 'Montserrat', sans-serif !important;
            font-weight: 300 !important; /* light */
            font-size: 18pt !important;
            color: #78655B !important;
            margin-bottom: 1rem;
          }
          .info-body-print, .info-body-print *, .report-text-block, .report-text-block * {
            font-family: 'Montserrat', sans-serif !important;
            font-size: 11pt !important;
            line-height: 1.5;
            color: black !important;
          }
          .report-text-block b {
             font-weight: 700 !important;
          }
          
          /* --- IMAGE GRID --- */
          .print-image-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5cm;
            margin-top: 1rem;
          }
          .print-image-item {
            page-break-inside: avoid !important;
            border: 1px solid #ccc;
            padding: 2px;
            border-radius: 4px;
          }
        }
      `}</style>
    </>
  );
}
