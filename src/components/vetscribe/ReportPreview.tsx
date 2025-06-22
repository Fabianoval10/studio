
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
        <div id="printable-area">
          {/* Div para a capa. Forçará uma quebra de página APÓS ela. Adicionado &nbsp; para robustez. */}
          <div className="print-cover-page">&nbsp;</div>
          
          {/* Wrapper para o conteúdo do laudo, que fluirá por uma ou mais páginas. */}
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
          
          {/* Div para a página final. Forçará uma quebra de página ANTES dela. Adicionado &nbsp; para robustez. */}
          <div className="print-final-page">&nbsp;</div>
        </div>

        <style jsx global>{`
          .print-container {
            display: none;
          }
  
          @media print {
            /* Configurações globais da página de impressão */
            @page {
              size: A4;
              margin: 0;
            }

            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            
            /* FUNDO PADRÃO: Aplica o timbrado a TODAS as páginas por padrão. */
            body {
                background-image: url('/timbrado.jpg') !important;
                background-size: 210mm 297mm !important;
                background-repeat: no-repeat !important; 
            }

            .no-print { display: none !important; }
            #printable-area { display: block !important; }

            /* Estrutura das páginas de capa e final */
            .print-cover-page, .print-final-page {
                position: relative; /* Ajuda na renderização correta */
                width: 210mm;
                height: 297mm;
                background-size: cover !important;
                background-position: center !important;
                background-repeat: no-repeat !important;
            }
            
            /* SOBREPOSIÇÃO 1: A capa usa sua própria imagem e força uma quebra de página depois. */
            .print-cover-page {
                background-image: url('/capa.jpg') !important;
                page-break-after: always;
            }

            /* SOBREPOSIÇÃO 2: A página final usa sua própria imagem e força uma quebra de página antes. */
            .print-final-page {
                background-image: url('/fim.jpg') !important;
                page-break-before: always;
            }

            /* Conteúdo do Laudo: Apenas um wrapper com padding para alinhar o texto dentro do timbrado. */
            .print-content-wrapper {
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

    