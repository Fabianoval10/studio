"use client";

import type { ReportFormData, UploadedImage } from "@/types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PawPrint } from "lucide-react";
import NextImage from "next/image";
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';

interface ReportPreviewProps {
  formData: ReportFormData;
  reportText: string | null;
  uploadedImages: UploadedImage[];
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ label, value, className }) => {
  if (value === null || value === undefined || value === "" || (typeof value === 'number' && isNaN(value))) return null;
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

export function ReportPreview({ formData, reportText, uploadedImages }: ReportPreviewProps) {
    if (!formData) return null;

    const fullAge = `${formData.ageYears || 0} ano(s)${formData.ageMonths && formData.ageMonths > 0 ? ' e ' + formData.ageMonths + ' mes(es)' : '' }`;

    return (
      <>
        <div id="printable-area">
          {/* --- PAGE 1: COVER --- */}
          <div className="print-page">
             <img src="/capa.jpg" alt="Capa do Laudo" className="print-fill-image" data-ai-hint="report cover" />
          </div>
          
          {/* --- PAGE 2: INFO --- */}
          <div className="print-page" id="info-page">
            <header className="flex justify-between items-center text-center flex-col mb-12">
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
                  <DetailItem label="Idade" value={fullAge} />
                  <DetailItem label="Vet. Solicitante" value={formData.referringVet} />
                </CardContent>
              </Card>
            </main>
  
            <footer className="info-page-footer">
              <div className="mx-auto">
                <p className="font-bold">{formData.clinicName}</p>
                <p>M.V. Resp.: {formData.vetName}</p>
                <p>Data do Exame: {format(new Date(formData.examDate), "PPP", { locale: ptBR })}</p>
              </div>
            </footer>
          </div>
  
          {/* --- PAGE 3: REPORT BODY --- */}
          <div className="print-page with-background" id="report-body-page">
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
          </div>
  
          {/* --- PAGE 4: IMAGES (Conditional) --- */}
          {uploadedImages.length > 0 && (
            <div className="print-page with-background" id="images-page">
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
            </div>
          )}
          
          {/* --- FINAL PAGE --- */}
          <div className="print-page">
            <img src="/pagina%20fim.png" alt="Página Final do Laudo" className="print-fill-image" data-ai-hint="report back" />
          </div>
        </div>
        <style jsx global>{`
          .print-container {
            display: none;
          }
  
          @media print {
            @page {
              size: A4;
              margin: 0;
            }

            html, body {
              margin: 0;
              padding: 0;
              height: 100%;
              width: 100%;
              background-color: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .no-print {
              display: none !important;
            }
  
            .print-container, #printable-area {
              display: block !important;
            }
            
            .print-page {
              page-break-after: always !important;
              height: 100%;
              width: 100%;
              position: relative;
              overflow: hidden;
              background: white;
            }

            #printable-area > .print-page:last-child {
                page-break-after: auto !important;
            }

            .print-fill-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover !important;
            }
  
            #info-page {
               display: flex;
               flex-direction: column;
               justify-content: space-between;
               text-align: center;
               padding: 2cm !important;
            }

            .info-page-footer {
                padding-top: 1cm;
                font-family: 'Montserrat', sans-serif !important;
                font-size: 10pt !important;
                color: #555 !important;
            }
            
            /* --- FONT STYLES --- */
            .cover-title-print, .report-title-print, .info-title-print {
              font-family: 'Montserrat', sans-serif !important;
              font-weight: 300 !important;
              font-size: 18pt !important;
              color: hsl(var(--primary)) !important;
              margin-bottom: 1rem;
              text-align: left;
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

            /* --- BACKGROUND STYLES --- */
            .print-page.with-background {
              background-image: url('/folha%20padrão.jpg') !important;
              background-size: 100% 100% !important;
              background-position: center !important;
              background-repeat: no-repeat !important;
            }

            .with-background > .report-main-content {
              padding: 3cm 2.5cm !important;
            }
          }
        `}</style>
      </>
    );
  }
