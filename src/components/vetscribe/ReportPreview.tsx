
"use client";

import type { ReportFormData, UploadedImage } from "@/types";
import React from "react";
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
             <img src="/capa.jpg" alt="Capa do Laudo" className="print-fill-image" />
          </div>
          
          {/* --- PAGE 2: INFO (with letterhead) --- */}
          <div className="print-page">
            <img src="/folha%20padrão.jpg" alt="Papel Timbrado" className="print-background" />
            <main className="report-main-content">
              <h3 className="report-title-print text-center">INFORMAÇÕES DO PACIENTE E DO EXAME</h3>
              <div className="info-grid-print">
                <div className="info-section-print">
                  <h4 className="info-subtitle-print">Paciente</h4>
                  <DetailItem label="Tutor" value={formData.ownerName} />
                  <DetailItem label="Paciente" value={formData.petName} />
                  <DetailItem label="ID" value={formData.patientId} />
                  <DetailItem label="Espécie" value={formData.species} />
                  <DetailItem label="Raça" value={formData.breed} />
                  <DetailItem label="Sexo" value={formData.sex} />
                  <DetailItem label="Idade" value={fullAge} />
                </div>
                <div className="info-section-print">
                  <h4 className="info-subtitle-print">Exame</h4>
                  <DetailItem label="Clínica" value={formData.clinicName} />
                  <DetailItem label="M.V. Resp." value={formData.vetName} />
                  <DetailItem label="Vet. Solicitante" value={formData.referringVet} />
                  <DetailItem label="Data do Exame" value={format(new Date(formData.examDate), "PPP", { locale: ptBR })} />
                </div>
              </div>
            </main>
          </div>
  
          {/* --- PAGE 3: REPORT BODY --- */}
          {reportText && (
            <div className="print-page">
                <img src="/folha%20padrão.jpg" alt="Papel Timbrado" className="print-background" />
                <main className="report-main-content">
                    <h3 className="report-title-print">LAUDO DESCRITIVO</h3>
                    <div className="whitespace-pre-wrap font-sans report-text-block">
                        {renderBoldMarkdown(reportText)}
                    </div>
                </main>
            </div>
          )}
  
          {/* --- PAGE 4: IMAGES (Conditional) --- */}
          {uploadedImages.length > 0 && (
            <div className="print-page">
              <img src="/folha%20padrão.jpg" alt="Papel Timbrado" className="print-background" />
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
            <img src="/pagina%20fim.png" alt="Página Final do Laudo" className="print-fill-image" />
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
              page-break-after: always;
              height: 100%;
              width: 100%;
              position: relative;
              overflow: hidden;
              background: white;
            }

            #printable-area > .print-page:last-child {
                page-break-after: auto;
            }

            .print-fill-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .print-background {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              object-fit: fill; /* Stretch to fill the A4 page */
              z-index: 1;
            }
            
            /* --- FONT & LAYOUT STYLES --- */
            .report-main-content {
              position: relative;
              z-index: 2;
              padding: 3cm 2.5cm;
              height: 100%;
              box-sizing: border-box;
            }
            .report-title-print {
              font-family: 'Montserrat', sans-serif;
              font-weight: 300;
              font-size: 16pt;
              color: hsl(var(--primary));
              margin-bottom: 2rem;
              padding-bottom: 0.5rem;
              border-bottom: 1px solid hsl(var(--border));
            }
            .report-title-print.text-center {
              text-align: center;
            }

            .info-body-print, .info-body-print *, .report-text-block, .report-text-block *, .info-grid-print * {
              font-family: 'Montserrat', sans-serif;
              font-size: 11pt;
              line-height: 1.6;
              color: black;
            }
            .report-text-block b, .info-grid-print b {
               font-weight: 700;
            }
            
            /* --- INFO PAGE GRID --- */
            .info-grid-print {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2rem;
            }
            .info-subtitle-print {
              font-weight: 700;
              font-size: 12pt;
              color: hsl(var(--primary));
              margin-bottom: 1rem;
              border-bottom: 1px solid hsl(var(--border));
              padding-bottom: 0.5rem;
            }
            .info-section-print > div {
              margin-bottom: 0.5rem;
            }


            /* --- IMAGE GRID --- */
            .print-image-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 0.5cm;
              margin-top: 1rem;
            }
            .print-image-item {
              page-break-inside: avoid;
              border: 1px solid #ccc;
              padding: 2px;
              border-radius: 4px;
            }
          }
        `}</style>
      </>
    );
  }
    
