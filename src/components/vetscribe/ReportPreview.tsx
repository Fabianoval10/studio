
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
      <span className="font-semibold">{label}: </span> 
      <span>{String(value)}</span>
    </div>
  );
};

export function ReportPreview({ formData, reportText, uploadedImages }: ReportPreviewProps) {
    if (!formData) return null;

    const fullAge = `${formData.ageYears || 0} ano(s)${formData.ageMonths && formData.ageMonths > 0 ? ' e ' + formData.ageMonths + ' mes(es)' : '' }`;

    const IMAGES_PER_PAGE = 24; // 4 columns x 6 rows
    const imagePages = [];
    if (uploadedImages && uploadedImages.length > 0) {
      for (let i = 0; i < uploadedImages.length; i += IMAGES_PER_PAGE) {
        imagePages.push(uploadedImages.slice(i, i + IMAGES_PER_PAGE));
      }
    }

    return (
      <>
        <div id="printable-area">
            {/* Page 1: Cover */}
            <div className="print-page">
              <img src="/capa.jpg" className="print-bg-img" alt="Capa do Laudo" />
            </div>

            {/* Page 2: Content (Patient Info, Exam Info, Report Text) */}
            <div className="print-page">
              <img src="/timbrado.jpg" className="print-bg-img" alt="Papel Timbrado" />
              <div className="print-content-page">
                <div className="report-content-group">
                  <div className="info-grid-print">
                    <div className="info-section-print">
                        <DetailItem label="Paciente" value={formData.petName} />
                        <DetailItem label="Espécie" value={formData.species} />
                        <DetailItem label="Sexo" value={formData.sex} />
                        <DetailItem label="Raça" value={formData.breed} />
                        <DetailItem label="Idade" value={fullAge} />
                    </div>
                    <div className="info-section-print">
                        <DetailItem label="Tutor" value={formData.ownerName} />
                        <DetailItem label="ID" value={formData.patientId} />
                        <DetailItem label="Data do Exame" value={formData.examDate ? format(formData.examDate, "PPP", { locale: ptBR }) : null} />
                    </div>
                    <div className="info-section-print">
                      <DetailItem label="Clínica" value={formData.clinicName} />
                      <DetailItem label="M.V. Resp." value={formData.vetName} />
                      <DetailItem label="Vet. Solicitante" value={formData.referringVet} />
                    </div>
                  </div>

                  <hr className="report-divider" />

                  {reportText && (
                    <div className="report-text-block">
                        {reportText.split('\n').map((paragraph, index) => (
                           <p key={index}>
                            {paragraph.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                              part.startsWith('**') && part.endsWith('**') ? (
                                <strong key={i}>{part.slice(2, -2)}</strong>
                              ) : (
                                part
                              )
                            )}
                          </p>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Image Pages - Dynamically generated */}
            {imagePages.map((pageImages, pageIndex) => (
              <div key={`image-page-${pageIndex}`} className="print-page">
                <img src="/timbrado.jpg" className="print-bg-img" alt="Papel Timbrado" />
                <div className="print-image-page">
                  <div className="print-image-grid">
                    {pageImages.map((img) => (
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
              </div>
            ))}
        </div>

        <style jsx global>{`
          /* --- Print Visibility Control --- */
          @media screen {
            .print-container {
                visibility: hidden;
                position: absolute;
                pointer-events: none;
            }
          }

          @media print {
            body > *:not(.print-container),
            .no-print {
              display: none !important;
            }

            .print-container {
              display: block !important;
              visibility: visible !important;
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
            }
            
            /* --- General Print Setup --- */
            @page {
              size: A4;
              margin: 0;
            }
            html, body {
              margin: 0;
              padding: 0;
              width: 210mm;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* --- Page Breaking Logic --- */
            .print-page {
              page-break-before: always;
              page-break-inside: avoid;
              position: relative;
              width: 210mm;
              height: 297mm;
              box-sizing: border-box;
              overflow: hidden;
            }
            .print-page:first-child {
              page-break-before: avoid;
            }
            .print-page:last-child {
              page-break-after: avoid;
            }
            
            .print-bg-img {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 0;
            }
            
            /* --- Content & Image Page Layout --- */
            .print-content-page {
                position: relative;
                z-index: 1;
                height: 100%;
                box-sizing: border-box;
                padding: 4cm 1cm 10cm 1cm;
            }
            
            .print-image-page {
              position: relative;
              z-index: 1;
              height: 100%;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
              padding: 4cm 1cm 10cm 1cm;
            }

            /* --- Report Content Styling --- */
            .info-grid-print {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 1.5rem;
              font-size: 9pt;
            }

            .info-grid-print .font-semibold,
            .report-text-block strong {
              color: #665045;
              font-weight: 600;
            }

            .info-grid-print, .report-text-block {
                color: #665045;
            }

            .report-divider {
              border: none;
              height: 1px;
              background-color: #665045;
              margin: 1.5rem 0;
            }
            
            .info-section-print > div {
              margin-bottom: 0.5rem;
            }

            .report-text-block {
              font-size: 9pt;
              line-height: 1.4;
            }
            
            .report-text-block p {
                margin: 0 0 0.8em 0;
                text-align: justify;
            }

            /* --- Image Grid Styling --- */
            .print-image-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              grid-template-rows: repeat(6, 1fr); /* 4x6 Grid */
              gap: 0.4cm;
              flex-grow: 1;
            }

            .print-image-item {
              border: 1px solid #e0e0e0;
              padding: 2px;
              border-radius: 4px;
              display: flex;
              justify-content: center;
              align-items: center;
              background-color: #fcfcfc;
              overflow: hidden;
            }
            .print-image-item img {
              width: 100%;
              height: 100%;
              object-fit: contain;
              border-radius: 2px;
            }
          }
        `}</style>
      </>
    );
}
