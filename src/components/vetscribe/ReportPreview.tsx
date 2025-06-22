
"use client";

import type { ReportFormData, UploadedImage } from "@/types";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
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

export function ReportPreview({ formData, reportText, uploadedImages }: ReportPreviewProps) {
    if (!formData) return null;

    return (
      <>
        <div id="printable-area">
          {/* --- PAGE 1: IMAGE COVER --- */}
          <div className="print-page" id="cover-image-page">
             <NextImage
                src="/capa.jpg"
                alt="Capa do Laudo"
                layout="fill"
                objectFit="cover"
                objectPosition="center"
                data-ai-hint="report cover"
                priority
             />
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
  
            <CardFooter className="text-center mt-16 info-body-print">
              <div className="mx-auto">
                <p className="font-bold">{formData.clinicName}</p>
                <p>CRMV: {formData.vetName}</p>
                <p>Data do Exame: {format(new Date(formData.examDate), "PPP", { locale: ptBR })}</p>
              </div>
            </CardFooter>
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
          
          {/* --- FINAL PAGE: IMAGE --- */}
          <div className="print-page-break"></div>
          <div className="print-page" id="final-image-page">
            <NextImage
                src="/pagina fim.png"
                alt="Página Final do Laudo"
                layout="fill"
                objectFit="contain"
                objectPosition="center"
                data-ai-hint="report back"
            />
          </div>

        </div>
        <style jsx global>{`
          .print-container {
            display: none;
          }
  
          @media print {
            body, html {
              background-color: white !important;
            }
            
            .no-print {
              display: none !important;
            }
  
            .print-container, #printable-area {
              display: block !important;
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
              height: 100vh;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              box-shadow: none !important;
              background-color: white !important;
              display: flex;
              flex-direction: column;
              page-break-inside: avoid !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              position: relative;
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
              margin-top: auto;
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

    