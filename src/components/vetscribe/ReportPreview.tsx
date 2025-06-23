
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
      return text.split('\n').filter(p => p.trim() !== '').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ));
    };

    return (
      <>
        {/* Container for printing, positioned off-screen */}
        <div id="printable-area" className="print-container">
          {/* Cover Page */}
          <div className="print-page print-cover-page" style={{ backgroundImage: "url('/capa.jpg')" }}>
            &nbsp;
          </div>

          {/* Main content with letterhead background */}
          <div className="print-content-wrapper">
             <main>
                {/* NEW WRAPPER to keep patient data, exam data, and report text together */}
                <div className="report-content-group">
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
                </div>

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

          {/* Final Page */}
          <div className="print-page print-final-page" style={{ backgroundImage: "url('/fim.jpg')" }}>
            &nbsp;
          </div>
        </div>

        <style jsx global>{`
          .print-container {
            /* Position off-screen to pre-render without being visible */
            position: absolute !important;
            left: -9999px !important;
            top: auto !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
          }

          @media print {
            /* Hide everything except the print container */
            body > *:not(.print-container) {
              display: none !important;
            }

            .print-container {
              position: static !important;
              left: auto !important;
              top: auto !important;
              width: auto !important;
              height: auto !important;
              overflow: visible !important;
            }

            @page {
              size: A4;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            body {
                /* Default background for all content pages */
                background-image: url('/timbrado.jpg') !important;
                background-size: 210mm 297mm !important;
                background-repeat: no-repeat !important;
            }

            .print-page {
              position: relative;
              width: 210mm;
              height: 297mm;
              background-size: cover !important;
              background-position: center !important;
              background-repeat: no-repeat !important;
              page-break-inside: avoid;
            }

            .print-cover-page {
                page-break-after: always;
                background-image: url('/capa.jpg') !important;
            }

            .print-final-page {
                page-break-before: always;
                background-image: url('/fim.jpg') !important;
            }
            
            .print-page-content {
                display: none;
            }

            .print-content-wrapper {
              /* Margins for the letterhead */
              padding: 2cm 2cm 5cm 2.5cm;
              color: black;
              background: transparent;
              width: 210mm;
              box-sizing: border-box;
            }

            main {
              padding: 0;
            }
            
            /* This group ensures all its content stays on one page */
            .report-content-group {
              page-break-inside: avoid;
            }

            .info-grid-print {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2.5rem;
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
            }
            .report-text-block {
              font-size: 11pt;
              line-height: 1.6;
            }
            .report-text-block p {
                margin: 0 0 1em 0;
                text-align: justify;
            }

            .print-image-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-auto-rows: 2.1cm; /* This creates the 3x7 grid for 21 images */
              gap: 0.2cm;
              margin-top: 1.5rem;
              page-break-before: auto;
            }
            .print-image-item {
              border: 1px solid #ccc;
              padding: 2px;
              border-radius: 4px;
              overflow: hidden;
              page-break-inside: avoid;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .print-image-item img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 2px;
            }
          }
        `}</style>
      </>
    );
}
