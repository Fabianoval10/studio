
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

    const imagesForOnePage = uploadedImages.slice(0, 21);

    return (
      <>
        <div id="printable-area">
            {/* Page 1: Cover */}
            <div className="print-page">
              <img src="/capa.jpg" alt="Capa do Laudo" className="print-full-bg-image" data-ai-hint="report cover" />
            </div>

            {/* Page 2: Content (Patient Info, Exam Info, Report Text) */}
            <div className="print-page">
              <img src="/timbrado.jpg" alt="Papel Timbrado" className="print-full-bg-image" data-ai-hint="letterhead document" />
              <div className="print-content-page">
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
                      <DetailItem label="Data do Exame" value={formData.examDate ? format(formData.examDate, "PPP", { locale: ptBR }) : null} />
                    </div>
                  </div>

                  <hr className="report-divider" />

                  {reportText && (
                    <div className="report-text-block">
                        {reportText.split('\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Page 3: Images (Single Page) */}
            {imagesForOnePage.length > 0 && (
              <div className="print-page">
                <img src="/timbrado.jpg" alt="Papel Timbrado" className="print-full-bg-image" data-ai-hint="letterhead document" />
                <div className="print-image-page">
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
              </div>
            )}

            {/* Final Page */}
            <div className="print-page">
              <img src="/fim.jpg" alt="Página Final do Laudo" className="print-full-bg-image" data-ai-hint="contact information" />
            </div>
        </div>

        <style jsx global>{`
          @media print {
            /* === Basic Setup === */
            body > *:not(#printable-area) {
              display: none !important;
            }

            #printable-area {
                display: block !important;
            }

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

            /* === Page Breaking Logic === */
            .print-page {
              page-break-before: always;
            }
            .print-page:first-child {
              page-break-before: avoid;
            }
            
            .print-page {
              page-break-inside: avoid;
            }


            /* === Page Specific Backgrounds and Layout === */

            .print-full-bg-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                object-fit: cover;
                z-index: -1;
            }
            
            .print-page {
              position: relative;
              width: 210mm;
              height: 297mm;
              box-sizing: border-box;
              overflow: hidden;
            }
            
            .print-content-page {
                position: relative;
                z-index: 1;
                height: 100%;
                box-sizing: border-box;
                padding: 2cm 2.5cm 5.0cm 2.5cm;
                font-family: var(--font-montserrat), sans-serif;
                font-weight: 300;
                font-size: 10pt;
            }
            
            .info-grid-print {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 2.5rem;
            }

            .report-divider {
              border: none;
              height: 1px;
              background-color: #F97316; /* Cor Laranja */
              margin: 1.5rem 0;
            }

            .info-subtitle-print {
              font-weight: 600;
              font-size: 18pt;
              color: hsl(var(--primary));
              margin-bottom: 1rem;
              border-bottom: 1px solid hsl(var(--border));
              padding-bottom: 0.5rem;
            }
            .info-section-print > div {
              margin-bottom: 0.5rem;
            }

            .report-text-block {
              line-height: 1.4;
            }
            .report-text-block p {
                margin: 0 0 0.8em 0;
                text-align: justify;
            }

            .print-image-page {
              position: relative;
              z-index: 1;
              height: 100%;
              display: flex;
              flex-direction: column;
              box-sizing: border-box;
              padding: 2cm 2.5cm 2cm 2.5cm;
            }

            .print-image-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(7, 1fr); /* 3x7 Grid */
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
