
"use client";

import type { ReportFormData, UploadedImage } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Printer, Image as ImageIcon, AlertTriangle, Info, FileText, Download } from "lucide-react";
import NextImage from "next/image"; // Renamed to avoid conflict with lucide-react Image icon
import { format } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface ReportPreviewProps {
  formData: ReportFormData | null;
  reportText: string | null;
  uploadedImages: UploadedImage[];
  isLoading: boolean;
  error?: string | null;
}

const DetailItem: React.FC<{ label: string; value?: string | number | null; className?: string }> = ({ label, value, className }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className={className}>
      <span className="font-semibold text-foreground/80 font-headline">{label}: </span>
      <span className="font-body text-foreground">{String(value)}</span>
    </div>
  );
};

export function ReportPreview({ formData, reportText, uploadedImages, isLoading, error }: ReportPreviewProps) {
  const handlePrint = () => {
    window.print();
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-6 p-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="font-headline">Erro ao Gerar Laudo</AlertTitle>
          <AlertDescription className="font-body">{error}</AlertDescription>
        </Alert>
      );
    }
    
    if (!formData) {
      return (
        <Alert className="m-4 border-primary/50">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="font-headline text-primary">Pré-visualização do Laudo</AlertTitle>
          <AlertDescription className="font-body">
            Preencha o formulário e clique em "Gerar Laudo" para ver a pré-visualização aqui.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <div id="printable-area" className="p-2 md:p-6 font-body printable-content">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-6 print:mb-4">
          <div>
             <NextImage 
                src="https://placehold.co/220x50.png?text=baddha+ULTRASSONOGRAFIA&font=belleza" 
                alt={`${formData.clinicName || 'Baddha Ultrassonografia'} Logo`}
                width={220} 
                height={50} 
                className="mb-2 object-contain print:max-w-[180px]" 
                data-ai-hint="baddha ultrasound logo"
              />
            <h1 className="text-2xl font-headline text-primary print:text-xl">{formData.clinicName || "Baddha Ultrassonografia"}</h1>
            <p className="text-sm text-foreground/80 print:text-xs">Veterinário(a): {formData.vetName || "Dra. Míriam Barp F. da Costa"}</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-headline text-primary print:text-lg">Laudo de Ultrassom</h2>
            <DetailItem label="Data do Exame" value={format(formData.examDate, "PPP", { locale: ptBR })} />
            <DetailItem label="Data do Laudo" value={format(new Date(), "PPP", { locale: ptBR })} />
          </div>
        </div>

        <Separator className="my-4 print:my-2" />

        {/* Patient Information */}
        <h3 className="text-lg font-headline text-primary mb-2 print:text-base">Informações do Paciente</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mb-4 text-sm print:text-xs print:gap-y-0">
          <DetailItem label="Nome do Paciente" value={formData.petName} />
          <DetailItem label="ID do Paciente" value={formData.patientId} />
          <DetailItem label="Espécie" value={formData.species} />
          <DetailItem label="Raça" value={formData.breed} />
          <DetailItem label="Idade" value={`${formData.ageYears} ano(s)${formData.ageMonths ? ' ' + formData.ageMonths + ' mes(es)' : '' }`} />
          <DetailItem label="Sexo" value={formData.sex} />
          <DetailItem label="Tutor" value={formData.ownerName} />
          <DetailItem label="Vet. Solicitante" value={formData.referringVet} />
        </div>

        <Separator className="my-4 print:my-2" />

        {/* Exam Details */}
        <h3 className="text-lg font-headline text-primary mb-2 print:text-base">Detalhes do Exame</h3>
        <div className="space-y-1 mb-4 text-sm print:text-xs">
          <DetailItem label="Tipo de Exame" value={formData.examType} />
        </div>
        
        {/* Findings - Hidden on print */}
        <div className="no-print">
          <h3 className="text-lg font-headline text-primary mt-4 mb-2 print:text-base">Achados</h3>
          <div className="whitespace-pre-wrap p-2 border rounded-md bg-muted/30 text-sm print:text-xs print:border-none print:p-0">
            {formData.findings}
          </div>
        </div>

        {/* AI Generated Report / Impressions */}
        {reportText && (
          <>
            <h3 className="text-lg font-headline text-primary mt-4 mb-2 print:text-base">Impressões / Conclusões</h3>
            <div className="whitespace-pre-wrap p-2 border rounded-md bg-primary/5 text-sm print:text-xs print:border-none print:p-0">
              {reportText}
            </div>
          </>
        )}

        {/* Additional Notes */}
        {formData.additionalNotes && (
           <>
            <h3 className="text-lg font-headline text-primary mt-4 mb-2 print:text-base">Observações Adicionais</h3>
            <div className="whitespace-pre-wrap p-2 border rounded-md bg-muted/30 text-sm print:text-xs print:border-none print:p-0">
              {formData.additionalNotes}
            </div>
          </>
        )}
        
        {/* Images Section */}
        {uploadedImages.length > 0 && (
          <>
            <h3 className="text-lg font-headline text-primary mt-6 mb-2 print:text-base print:mt-4 page-break-before">Imagens do Exame</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 print:grid-cols-3 print:gap-2">
              {uploadedImages.map((img, index) => (
                <div key={img.id} className="border rounded-md overflow-hidden shadow-sm break-inside-avoid p-1 print:p-0.5 print:border-gray-300">
                  <NextImage 
                    src={img.previewUrl} 
                    alt={`Imagem do exame ${index + 1}`}
                    width={300} // Adjusted for 3-column layout in print
                    height={225} // Adjusted for 3-column layout in print
                    className="w-full h-auto object-contain"
                    data-ai-hint="ultrasound medical"
                  />
                </div>
              ))}
            </div>
          </>
        )}
        
        {/* Footer / Signature line for print */}
        <div className="mt-12 pt-6 border-t print:mt-8 print:pt-4 page-break-before">
          <div className="mb-8 print:mb-6">
            <p className="text-sm text-foreground/70 print:text-xs">Assinatura:</p>
            <div className="h-10 border-b border-foreground/50 print:border-foreground/70 w-3/4 mt-1 print:w-full"></div> {/* Signature line */}
          </div>
          <p className="text-sm text-foreground/80 print:text-xs font-semibold">Míriam Barp F. da Costa</p>
          <p className="text-sm text-foreground/80 print:text-xs">Médica veterinária ultrassonografista</p>
          <p className="text-sm text-foreground/80 print:text-xs">CRMV RS 12398</p>
        </div>

      </div>
    );
  };


  return (
    <Card className="shadow-lg h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="font-headline text-3xl text-primary flex items-center gap-2">
          <FileText className="w-8 h-8" /> Pré-visualização do Laudo
        </CardTitle>
        <CardDescription className="font-body">
          Revise o laudo gerado abaixo. Use o botão de imprimir para salvar como PDF.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto">
        {renderContent()}
      </CardContent>
      <CardFooter className="flex-shrink-0 border-t pt-6 justify-end">
        <Button onClick={handlePrint} disabled={!formData || isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Printer className="mr-2 h-4 w-4" /> Imprimir para PDF
        </Button>
      </CardFooter>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-area, #printable-area * {
            visibility: visible;
          }
          #printable-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            font-size: 9pt; /* Slightly smaller font for print to fit more content */
          }
          .page-break-before {
            page-break-before: always;
          }
          .break-inside-avoid {
            page-break-inside: avoid;
          }
           /* Hide buttons and other non-printable elements */
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Card>
  );
}
