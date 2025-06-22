
"use client";

import type { ReportFormData, UploadedImage } from "@/types";
import React from "react";
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

export function ReportPreview({ formData, reportText, uploadedImages }: ReportPreviewProps) {
    if (!formData) return null;

    const fullAge = `${formData.ageYears || 0} ano(s)${formData.ageMonths && formData.ageMonths > 0 ? ' e ' + formData.ageMonths + ' mes(es)' : '' }`;

    const renderBoldMarkdown = (text: string | null) => {
      if (!text) return null;
      // This regex handles paragraphs and bolding correctly.
      return text.split('\n').map((paragraph, pIndex) => (
        <p key={pIndex} style={{ minHeight: '1.2em' /* ensure empty lines create space */ }}>
          {paragraph.split(/(\*\*.*?\*\*)/g).map((part, index) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <b key={index}>{part.slice(2, -2)}</b>;
            }
            return part;
          })}
        </p>
      ));
    };

    return (
      <>
        <div id="printable-area">
          {/* --- PAGE 1: COVER --- */}
          <div className="print-page">
             <img src="/capa.jpg" alt="Capa do Laudo" className="print-fill-image" />
          </div>
          
          {/* --- PAGE 2: INFO (with letterhead) --- */}
          <div className="print-page with-background">
            <img src="/timbrado.jpg" alt="Papel Timbrado" className="print-background-image" />
            <main className="report-main-content">
              {/* The title "INFORMAÇÕES DO PACIENTE E DO EXAME" is part of the background image */}
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
                  <DetailItem label="Data do Exame" value={format(new Date(formData.examDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })} />
                </div>
              </div>
            </main>
          </div>
  
          {/* --- PAGE 3: REPORT BODY --- */}
          {reportText && (
            <div className="print-page with-background">
                <img src="/timbrado.jpg" alt="Papel Timbrado" className="print-background-image" />
                <main className="report-main-content">
                    {/* The title "LAUDO DESCRITIVO" is part of the background image */}
                    <div className="report-date-print">
                      {format(new Date(formData.examDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }).toUpperCase()}
                    </div>
                    <div className="report-text-block">
                        {renderBoldMarkdown(reportText)}
                    </div>
                </main>
            </div>
          )}
  
          {/* --- PAGE 4: IMAGES (Conditional) --- */}
          {uploadedImages.length > 0 && (
            <div className="print-page with-background">
              <img src="/timbrado.jpg" alt="Papel Timbrado" className="print-background-image" />
              <main className="report-main-content">
                  {/* The title "IMAGENS DO EXAME" is part of the background image */}
                  <div className="print-image-grid">
                    {uploadedImages.map((img, index) => (
                      <div key={img.id} className="print-image-item">
                        <img
                          src={img.previewUrl}
                          alt={`Imagem do exame ${index + 1}`}
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
            <img src="/fim.png" alt="Página Final do Laudo" className="print-fill-image" />
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
              width: 100%;
              height: 100%;
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
              position: relative;
              width: 210mm;
              height: 297mm;
              overflow: hidden;
            }

            #printable-area > .print-page:last-child {
                page-break-after: auto;
            }
            
            .print-fill-image, .print-background-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: 1;
            }

            /* --- FONT & LAYOUT STYLES --- */
            .report-main-content {
              position: relative;
              z-index: 2;
              /* Adjusted padding: Top, Right, Bottom, Left */
              padding: 6.0cm 2cm 2.5cm 2.5cm;
              height: 100%;
              box-sizing: border-box;
              font-family: 'Montserrat', sans-serif;
            }
            
            .report-date-print {
                font-family: 'Montserrat', sans-serif;
                font-size: 10pt;
                color: #4a4a4a;
                text-align: right;
                margin-bottom: 2.5rem;
                padding-right: 0.2cm;
            }

            .report-text-block, .info-grid-print {
              font-family: 'Montserrat', sans-serif;
              font-size: 11pt;
              line-height: 1.6;
              color: #333;
            }

            .report-text-block p {
                margin: 0 0 0.5em 0;
            }

            .report-text-block b, .info-grid-print b {
               font-weight: 700;
               color: black;
            }
            
            /* --- INFO PAGE GRID --- */
            .info-grid-print {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2.5rem;
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
              gap: 0.8cm;
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
    
