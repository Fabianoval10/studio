
"use client";

import type { ReportFormData, UploadedImage } from "@/types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
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

const DogIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
        <path d="M48.6,85.2c-1-2.1-1.8-4.3-2.3-6.6c-0.4-1.8-0.8-3.7-1.1-5.5c-0.2-1.3-0.4-2.6-0.5-3.9c0.1-2.4,0.7-4.7,1.8-6.8 c0.6-1.1,1.3-2.1,2.1-3.1c-2.1-0.2-4.2-0.4-6.3-0.5c-2-0.1-4-0.1-6,0c-2.7,0.1-5.4,0.5-8,1.2c-1,0.3-2,0.6-3,1 c-1.5,0.6-3,1.3-4.3,2.3c-0.8,0.6-1.5,1.3-2.1,2.1c-1.3,1.6-2,3.5-2.1,5.5c0,1.3,0.2,2.6,0.6,3.9c0.4,1.3,1,2.6,1.7,3.8 c-2.4-0.5-4.7-1.3-6.8-2.6c-0.7-0.4-1.4-0.9-2-1.4c-2.3-2-3-5.2-2.1-7.9c0.5-1.5,1.4-2.8,2.6-3.9c0.6-0.6,1.3-1.1,2-1.6 c4.3-2.9,9.4-4.3,14.6-4.5c2.6-0.1,5.2-0.1,7.8,0c3,0.1,6,0.5,8.9,1.2c2.9,0.7,5.7,1.8,8.2,3.3c-3,3.6-5.2,7.8-6.3,12.3 c-0.5,2.1-0.6,4.2-0.4,6.3c0.1,1.1,0.2,2.2,0.4,3.3c-2.2-0.6-4.3-1.4-6.3-2.6c-0.9-0.5-1.8-1.1-2.6-1.8c-1.2-1-2.1-2.2-2.8-3.5 c-0.7-1.4-1-2.9-1-4.4c0-1.1,0.1-2.2,0.4-3.3c0.3-1,0.7-2,1.2-2.9c-1-0.1-2-0.1-3,0c-3.1,0.3-6.2,1.1-9,2.4 c-1.2,0.6-2.3,1.3-3.3,2.1c-2,1.7-3.1,4.1-3,6.6c0,1.4,0.3,2.8,0.9,4.1c0.6,1.3,1.5,2.5,2.5,3.5c1.1,1,2.3,1.9,3.6,2.6 c2.7,1.4,5.6,2.3,8.6,2.6c1.5,0.2,3,0.2,4.5,0.2c2.8,0,5.6-0.4,8.2-1.2c2.7-0.9,5.2-2.2,7.4-4c-0.6-3.2-0.7-6.4-0.4-9.6 c0.2-2.1,0.7-4.1,1.5-6.1c0.7-1.7,1.6-3.3,2.8-4.8c-1.6-0.9-3.3-1.6-5-2.1c-3.5-1.1-7.2-1.6-10.9-1.5c-3.1,0.1-6.2,0.5-9.2,1.4 c-2.9,0.8-5.7,2.1-8.2,3.7c-0.7,0.4-1.3,0.9-1.9,1.4c-1.2,1.1-2.1,2.4-2.7,3.8c-0.6,1.5-0.9,3.1-0.8,4.7c0.1,2.5,1,4.8,2.6,6.7 c1.1,1.3,2.5,2.4,4,3.2c3.1,1.6,6.4,2.5,9.8,2.7c3,0.2,6-0.1,8.9-0.8c3-0.8,5.8-2,8.3-3.7c-0.2,0.8-0.3,1.6-0.3,2.4 c0,1.2,0.2,2.4,0.5,3.6c0.4,1.1,0.8,2.2,1.4,3.2c0.6,1,1.3,2,2.1,2.9c1,1.1,2.1,2.1,3.2,3c0.4,0.3,0.8,0.6,1.2,0.9 c-1.5,2.1-3.5,3.8-5.8,5.1c-2.7,1.5-5.6,2.5-8.6,3c-3,0.5-6.1,0.5-9.1,0.1c-3-0.4-5.9-1.3-8.6-2.6c-2.7-1.3-5.2-3.1-7.3-5.2 c-1-1-1.9-2.1-2.7-3.3c-1.1-1.6-1.8-3.4-2.1-5.3c-0.3-2.1,0-4.2,0.7-6.2c0.8-2,2-3.9,3.6-5.4c1.1-1,2.3-1.8,3.6-2.5 c3.2-1.6,6.6-2.6,10.1-3c3.4-0.4,6.8-0.4,10.2,0.1c3.5,0.4,6.9,1.3,10.1,2.6c3.2,1.3,6.2,3.1,8.8,5.2c-1.3,2.5-2,5.2-2.1,7.9 c-0.1,2.1,0.3,4.2,1.1,6.2c0.7,1.8,1.8,3.5,3.2,4.9c0.9,0.9,1.9,1.7,2.9,2.4c-0.1,0.2-0.2,0.3-0.2,0.5c-0.5,0.7-1,1.4-1.5,2.1 c-1.1,1.3-2.3,2.5-3.6,3.6c-2.7,2.1-5.8,3.6-9,4.4c-3.2,0.8-6.5,1-9.8,0.6c-3.2-0.4-6.3-1.4-9.2-2.9c-2.8-1.5-5.4-3.5-7.6-5.8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
)

export function ReportPreview({ formData, reportText, uploadedImages, isLoading, error }: ReportPreviewProps) {

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
        {/* --- PAGE 1: STYLIZED COVER --- */}
        <div className="print-page" id="stylized-cover-page">
            <div className="flex-grow w-full bg-accent flex flex-col justify-center items-center p-8 text-primary-foreground relative">
                <div className="text-center space-y-4">
                    <p className="font-sans tracking-widest uppercase text-lg">Baddha ultrassonografia com essência</p>
                    <div className="flex items-center justify-center gap-4">
                        <DogIcon className="w-24 h-24 stroke-current" />
                        <h1 className="font-headline font-bold text-5xl leading-tight">RELATÓRIO<br/>ULTRASSONO-<br/>GRÁFICO</h1>
                    </div>
                </div>
            </div>
            <div className="bg-white w-full p-4 flex justify-between items-center text-xs text-muted-foreground border-t">
                <div className="flex items-center gap-2">
                    <PawPrint className="h-8 w-8 text-primary" />
                    <div>
                        <p className="font-bold text-primary">Baddha</p>
                        <p>ULTRASSONOGRAFIA</p>
                    </div>
                </div>
                <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-2">
                        <Mail className="w-4 h-4"/>
                        <span>baddhaimaginologia@gmail.com</span>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                        <InstagramIcon className="w-4 h-4"/>
                        <span>baddha_ultrassom</span>
                    </div>
                </div>
            </div>
        </div>

        <div className="print-page-break"></div>
        
        {/* --- PAGE 2: INFO --- */}
        <div className="print-page" id="cover-page">
          <header className="flex justify-between items-center text-center flex-col mb-16">
            <div className="flex items-center gap-3 bg-primary text-primary-foreground p-3 rounded-full mb-4">
              <PawPrint className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-headline text-primary font-bold">Baddha Ultrassonografia</h1>
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
            <p>Data do Exame: {format(new Date(formData.examDate), "PPP", { locale: ptBR })}</p>
          </footer>
        </div>

        <div className="print-page-break"></div>

        {/* --- PAGE 3: REPORT BODY --- */}
        <div className="print-page" id="report-body-page">
          <header className="print-report-header">
            <div className="flex justify-between items-center">
              <span className="font-bold text-primary">Baddha Ultrassonografia</span>
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

        {/* --- PAGE 4: IMAGES --- */}
        {uploadedImages.length > 0 && (
          <>
            <div className="print-page-break"></div>
            <div className="print-page" id="images-page">
              <header className="print-report-header">
                 <div className="flex justify-between items-center">
                    <span className="font-bold text-primary">Baddha Ultrassonografia</span>
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
      <Card className="shadow-lg h-full flex flex-col no-print">
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
           <Button onClick={() => window.print()} disabled={!formData || isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
        #stylized-cover-page {
          display: flex;
          flex-direction: column;
          padding: 0;
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
            margin: 0;
          }

          body, html {
            background-color: white !important;
          }
          
          .no-print, .no-print * {
            display: none !important;
          }

          #printable-area, #printable-area * {
            visibility: visible !important;
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
          
          #stylized-cover-page {
             background-color: white !important;
             -webkit-print-color-adjust: exact !important;
             color-adjust: exact !important;
          }

          #stylized-cover-page > .bg-accent {
             background-color: hsl(var(--accent)) !important;
             color: hsl(var(--primary-foreground)) !important;
          }
           #stylized-cover-page > .bg-accent * {
             color: hsl(var(--primary-foreground)) !important;
             stroke: hsl(var(--primary-foreground)) !important;
           }

          #stylized-cover-page > .bg-white {
             background-color: white !important;
          }

          #cover-page {
             justify-content: space-between;
             text-align: center;
             padding: 2cm !important;
          }
          
          .report-main-content {
            flex-grow: 1;
             padding: 2cm !important;
          }

          .print-report-footer {
            display: block !important;
            margin-top: auto; /* Push to bottom */
            padding-bottom: 1cm;
            width: 100%;
            text-align: center;
          }
          
           .print-report-header {
             display: flex !important;
             justify-content: space-between;
             padding: 1cm 2cm 0 2cm !important;
             font-family: 'Montserrat', sans-serif !important;
             font-size: 9pt;
             color: #78655B !important;
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
