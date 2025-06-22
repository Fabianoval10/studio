
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

    const renderBoldMarkdown = (text: string | null) => {
      if (!text) return null;
      const paragraphs = text.split('\n').filter(p => p.trim() !== '');
      return paragraphs.map((paragraph, pIndex) => {
        const parts = paragraph.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={pIndex} style={{ marginBottom: '1em' }}>
            {parts.map((part, index) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return <b key={index}>{part.slice(2, -2)}</b>;
              }
              return part;
            })}
          </p>
        );
      });
    };

    return (
      <>
        <div id="printable-area">
          <div className="print-page print-cover-page">
             <img src="/capa.jpg" alt="Capa do Laudo" className="print-fill-image" />
          </div>
          
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
                        {renderBoldMarkdown(reportText)}
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
          
          <div className="print-page print-final-page">
            <img src="/fim.jpg" alt="Página Final do Laudo" className="print-fill-image" />
          </div>
        </div>

        <style jsx global>{`
          .print-container {
            display: none;
          }
  
          @media print {
            body {
                background-image: url('/timbrado.jpg');
                background-size: 210mm 297mm;
                background-repeat: no-repeat;
                background-position: center;
                -webkit-print-color-adjust: exact !important;
                color-adjust: exact !important;
                print-color-adjust: exact !important;
            }

            @page {
              size: A4;
              margin: 0;
            }

            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
            }
            
            .no-print { display: none !important; }
            .print-container, #printable-area { display: block !important; }

            .print-page {
              page-break-after: always;
            }

            .print-page:last-child {
              page-break-after: auto;
            }
            
            .print-cover-page, .print-final-page {
                background: white !important;
            }

            .print-final-page {
                page-break-before: always;
            }

            .print-fill-image {
                width: 210mm;
                height: 297mm;
                object-fit: cover;
                position: absolute;
                top: 0;
                left: 0;
                z-index: 1;
            }
            
            .print-content-wrapper {
              position: relative;
              z-index: 2;
              color: black;
            }

            .print-content-wrapper main {
              padding: 6.0cm 2cm 7.5cm 2.5cm;
            }

            .info-grid-print {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2.5rem;
              page-break-after: avoid;
              page-break-inside: avoid;
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
                page-break-inside: avoid;
            }
            .report-text-block {
              font-size: 11pt;
              line-height: 1.6;
            }
            .report-text-block p {
                margin: 0 0 1em 0;
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
              page-break-before: always;
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
