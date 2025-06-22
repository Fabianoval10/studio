
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
      return text.split('\n').map((paragraph, pIndex) => (
        <p key={pIndex} style={{ minHeight: '1.2em' }}>
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
          {/* Page 1: Cover Page */}
          <div className="print-page print-cover-page">
             <img src="/capa.jpg" alt="Capa do Laudo" className="print-fill-image" />
          </div>
          
          {/* This wrapper contains all content that should have the letterhead background */}
          <div className="print-content-section">
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
              <div className="report-text-container">
                  <div className="report-date-print">
                    {format(new Date(formData.examDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR }).toUpperCase()}
                  </div>
                  <div className="report-text-block">
                      {renderBoldMarkdown(reportText)}
                  </div>
              </div>
            )}
    
            {uploadedImages.length > 0 && (
               <div className="print-image-container">
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
              </div>
            )}
          </div>
          
          {/* Last Page: Final Page */}
          <div className="print-page print-final-page">
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
              background-color: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            .no-print { display: none !important; }
            .print-container, #printable-area { display: block !important; }
            
            /* Cover and Final pages are simple, full-height divs */
            .print-page {
              width: 210mm;
              height: 297mm;
              overflow: hidden;
              position: relative;
            }
            .print-fill-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .print-cover-page { page-break-after: always; }
            .print-final-page { page-break-before: always; }

            /* THIS IS THE CORE FIX */
            /* The body itself gets the repeating background */
            body {
              background-image: url('/timbrado.jpg') !important;
              background-size: 210mm 297mm !important;
              background-repeat: repeat-y !important; /* repeat on Y axis if content flows */
            }
            /* The cover/final pages get a white background to hide the body's background */
            .print-cover-page, .print-final-page {
              background-color: white !important;
            }
            
            /* The content section uses PADDING to create margins inside the background image */
            .print-content-section {
              padding: 6.0cm 2cm 7.5cm 2.5cm;
              box-sizing: border-box;
              width: 100%;
              font-family: 'Montserrat', sans-serif;
              color: #333;
              /* It needs page breaks to separate it from cover/final */
              page-break-before: always;
              page-break-after: always;
            }

            /* General content styling */
            .info-grid-print {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2.5rem;
              page-break-after: avoid;
              margin-bottom: 2rem; /* space before report text starts */
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
            .report-text-container {
              page-break-before: always; /* If info and text need to be on separate pages */
            }
            .report-date-print {
                font-size: 10pt;
                color: #4a4a4a;
                text-align: right;
                margin-bottom: 2.5rem;
                padding-right: 0.2cm;
            }
            .report-text-block {
              font-size: 11pt;
              line-height: 1.6;
            }
            .report-text-block p {
                margin: 0 0 0.5em 0;
            }
            .report-text-block b, .info-grid-print b {
               font-weight: 700;
               color: black;
            }

            /* Image grid styling */
            .print-image-container {
              page-break-before: always;
            }
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

    