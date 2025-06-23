
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

    // Limit images to a single page (21 images max)
    const imagesForOnePage = uploadedImages.slice(0, 21);

    return (
      <>
        {/* This container is positioned off-screen to pre-render for printing, but is visible to the browser */}
        <div id="printable-area" className="print-only-container">
            {/* Page 1: Cover */}
            <div className="print-page print-cover-page">&nbsp;</div>

            {/* Page 2: Content (Patient Info, Exam Info, Report Text) */}
            <div className="print-page print-content-page">
              <div className="print-content-wrapper">
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
                    </div>
                  </div>

                  {reportText && (
                    <>
                      <div className="report-text-block">
                          {renderReportText(reportText)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Page 3: Images (Single Page) */}
            {imagesForOnePage.length > 0 && (
              <div className="print-page print-image-page">
                <div className="print-image-grid">
                  {imagesForOnePage.map((img) => (
                    <div key={img.id} className="print-image-item">
                      <img
                        src={img.previewUrl}
                        alt={`Imagem do exame`}
                        data-ai-hint="ultrasound medical"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Final Page */}
            <div className="print-page print-final-page">&nbsp;</div>
        </div>

        <style jsx global>{`
          .print-only-container {
            position: absolute !important;
            opacity: 0 !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
            z-index: -9999 !important;
            pointer-events: none !important;
          }

          @media print {
            /* === Basic Setup === */
            body > *:not(.print-container) {
              display: none !important;
            }

            .print-container {
                display: block !important;
            }

            .print-only-container {
              position: static !important;
              opacity: 1 !important;
              width: auto !important;
              height: auto !important;
              overflow: visible !important;
              z-index: auto !important;
              pointer-events: auto !important;
            }

            @page {
              size: A4;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 210mm;
              height: 297mm;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* === Page Breaking Logic (The Fix) === */
            
            .print-page {
              page-break-after: always; /* Create a page break AFTER each of these elements */
              page-break-inside: avoid; /* Try not to break the content of a page itself */
              width: 210mm;
              box-sizing: border-box;
              position: relative;
            }

            .print-page:last-child {
              page-break-after: avoid; /* PREVENT a page break after the very last element */
            }


            /* === Page Specific Backgrounds and Layout === */

            body {
                background-image: url('/timbrado.jpg') !important;
                background-size: 210mm 297mm !important;
                background-repeat: no-repeat !important;
                background-position: top left;
            }
            
            .print-cover-page {
                background-image: url('/capa.jpg') !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                height: 297mm;
            }

            .print-final-page {
                background-image: url('/fim.jpg') !important;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
                height: 297mm;
            }

            .print-content-page {
                min-height: 297mm; /* Ensure content page fills at least one sheet */
            }

            .print-content-wrapper {
              padding: 2cm 2.5cm 5.0cm 2.5cm;
              color: black;
              background: transparent;
              width: 100%;
              box-sizing: border-box;
            }
            
            .report-content-group {
              page-break-inside: avoid;
            }

            .info-grid-print {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2.5rem;
              font-size: 10pt;
              margin-bottom: 2.5rem;
            }
            .info-subtitle-print {
              font-weight: 700;
              font-size: 11pt;
              color: hsl(var(--primary));
              margin-bottom: 1rem;
              border-bottom: 1px solid hsl(var(--border));
              padding-bottom: 0.5rem;
            }
            .info-section-print > div {
              margin-bottom: 0.5rem;
            }

            .report-text-block {
              font-size: 10pt;
              line-height: 1.6;
            }
            .report-text-block p {
                margin: 0 0 1em 0;
                text-align: justify;
            }

            .print-image-page {
              display: flex;
              flex-direction: column;
              min-height: 297mm;
              box-sizing: border-box;
              padding: 2cm 2.5cm 2cm 2.5cm;
            }

            .print-image-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(7, 1fr); /* 3x7 Grid */
              gap: 0.4cm; /* Increased gap */
              flex-grow: 1; /* This will make it fill the available space */
            }

            .print-image-item {
              border: 1px solid #e0e0e0;
              padding: 2px;
              border-radius: 4px;
              page-break-inside: avoid;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #fcfcfc;
              overflow: hidden;
            }
            .print-image-item img {
              width: 100%;
              height: 100%;
              object-fit: contain; /* Changed from cover to contain */
              border-radius: 2px;
            }
          }
        `}</style>
      </>
    );
}
