
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
      <span className="text-foreground">{String(value)}</span>
    </div>
  );
};

export function ReportPreview({ formData, reportText, uploadedImages }: ReportPreviewProps) {
    if (!formData) return null;

    const fullAge = `${formData.ageYears || 0} ano(s)${formData.ageMonths && formData.ageMonths > 0 ? ' e ' + formData.ageMonths + ' mes(es)' : '' }`;

    const renderReportText = (text: string | null) => {
      if (!text) return null;
      // Split by newline, filter empty lines, and wrap each line in a <p> tag.
      return text.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ));
    };

    return (
      <>
        <div id="printable-area">
          {/* RULE 1: A div for the cover page, which forces a page break after it */}
          <div className="print-cover-page"></div>
          
          {/* RULE 2: This is the actual content that will flow across one or more pages with the 'timbrado' background applied to the body */}
          <div className="print-content-wrapper">
             <main>
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

                {reportText && (
                  <>
                    <div className="report-date-print">
                      {format(new Date(formData.examDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }).toUpperCase()}
                    </div>
                    <div className="report-text-block">
                        {renderReportText(reportText)}
                    </div>
                  </>
                )}
        
                {uploadedImages.length > 0 && (
                  <div className="print-image-grid">
                    {uploadedImages.map((img, index) => (
                      <div key={img.id} className="print-image-item">
                        <img
                          src={img.previewUrl}
                          alt={`Imagem do exame ${index + 1}`}
                          data-ai-hint="ultrasound medical"
                        />
                      </div>
                    ))}
                  </div>
                )}
             </main>
          </div>
          
          {/* RULE 3: A div for the final page, which is forced to a new page */}
          <div className="print-final-page"></div>
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
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* RULE 2 (Base): Apply 'timbrado' to ALL pages by default. The browser will repeat this for every new page of content. */
            body {
                background-image: url('/timbrado.jpg') !important;
                background-size: 210mm 297mm !important;
                background-repeat: no-repeat !important; 
            }

            .no-print { display: none !important; }
            #printable-area { display: block !important; }

            .print-cover-page, .print-final-page {
                width: 210mm;
                height: 297mm;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
            }
            
            /* RULE 1 (Override): Override body background with the cover page on the first page. */
            .print-cover-page {
                background-image: url('/capa.jpg') !important;
                page-break-after: always;
            }

            /* RULE 3 (Override): Override body background with the final page, forcing it to a new sheet. */
            .print-final-page {
                background-image: url('/fim.jpg') !important;
                page-break-before: always;
            }

            .print-content-wrapper {
              /* This wrapper's only job is to provide the correct padding for the content to sit within the 'timbrado' design. */
              padding: 6.0cm 2cm 7.5cm 2.5cm;
              color: black;
              background: transparent;
              width: 210mm;
              box-sizing: border-box;
            }
            
            main {
              padding: 0;
            }

            .info-grid-print {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2.5rem;
              page-break-inside: avoid;
              font-size: 11pt;
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
            .report-date-print {
                font-size: 10pt;
                color: #4a4a4a;
                text-align: right;
                margin-bottom: 2.5rem;
                padding-right: 0.2cm;
                page-break-after: avoid;
            }
            .report-text-block {
              font-size: 11pt;
              line-height: 1.6;
            }
            .report-text-block p {
                margin: 0 0 1em 0;
                text-align: justify;
            }
            .report-text-block b, .info-grid-print b {
               font-weight: 700;
               color: black;
            }

            .print-image-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 0.8cm;
              margin-top: 1rem;
              page-break-inside: avoid;
            }
            .print-image-item {
              page-break-inside: avoid;
              border: 1px solid #ccc;
              padding: 2px;
              border-radius: 4px;
            }
            .print-image-item img {
              width: 100%;
              height: auto;
              border-radius: 2px;
            }
          }
        `}</style>
      </>
    );
  }
