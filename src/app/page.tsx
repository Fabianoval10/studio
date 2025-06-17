
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { ReportFormData, UploadedImage } from "@/types";
import ClientOnlyReportForm from "@/components/vetscribe/ReportForm"; // Use the client-only wrapper
import { ReportPreview } from "@/components/vetscribe/ReportPreview";
import { AppHeader } from "@/components/vetscribe/AppHeader";
import { handleGenerateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

export default function VetScribePage() {
  const [currentFormData, setCurrentFormData] = useState<ReportFormData | null>(null);
  const [generatedReportText, setGeneratedReportText] = useState<string | null>(null);
  const [currentUploadedImages, setCurrentUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0); // State to trigger printing
  const { toast } = useToast();

  const handleFormSubmit = useCallback(async (data: ReportFormData, images: File[]) => {
    setIsLoading(true);
    setError(null);
    setGeneratedReportText(null); 

    const uploadedImageObjects: UploadedImage[] = images.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setCurrentUploadedImages(prevImages => {
      prevImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
      return uploadedImageObjects;
    });
    setCurrentFormData(data); 


    try {
      const result = await handleGenerateReportAction(data);
      if (result.success && result.reportText) {
        setGeneratedReportText(result.reportText);
        toast({
          title: "Laudo Gerado",
          description: "A IA gerou o rascunho do laudo com sucesso. A caixa de diálogo de impressão será aberta.",
          variant: "default",
        });
        setPrintTrigger(prev => prev + 1); // Trigger printing
      } else {
        setError(result.error || "Falha ao gerar o laudo.");
        toast({
          title: "Erro",
          description: result.error || "Não foi possível gerar o laudo. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro inesperado.";
      setError(errorMessage);
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  useEffect(() => {
    return () => {
      currentUploadedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, [currentUploadedImages]);

  useEffect(() => {
    if (printTrigger > 0 && generatedReportText && !isLoading) {
      console.log('[VetScribePage] Conditions met for printing. printTrigger:', printTrigger, 'generatedReportText exists:', !!generatedReportText, 'isLoading:', isLoading);
      // Small delay to ensure DOM is updated before printing
      const timer = setTimeout(() => {
        console.log('[VetScribePage] Calling window.print() now.');
        window.print();
      }, 500); 
      return () => {
        console.log('[VetScribePage] Clearing print timer.');
        clearTimeout(timer);
      }
    } else {
       if (printTrigger > 0) {
         console.log('[VetScribePage] Conditions NOT met for printing. printTrigger:', printTrigger, 'generatedReportText exists:', !!generatedReportText, 'isLoading:', isLoading);
       }
    }
  }, [printTrigger, generatedReportText, isLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader className="no-print" />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start max-h-[calc(100vh-100px)] lg:max-h-[calc(100vh-120px)]">
          <div className="lg:max-h-[calc(100vh-120px)] no-print"> 
             <ClientOnlyReportForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>

          <div className="lg:sticky lg:top-[calc(theme(spacing.8)+70px)] lg:max-h-[calc(100vh-120px)] overflow-hidden"> 
            <ReportPreview
              formData={currentFormData}
              reportText={generatedReportText}
              uploadedImages={currentUploadedImages}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>
      </main>
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background-color: #fff !important; 
            -webkit-print-color-adjust: exact; 
            color-adjust: exact; 
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-height: none !important;
          }
          .lg\\:sticky { 
            position: static !important;
          }
          .lg\\:max-h-\\[calc\\(100vh-120px\\)\\] { 
             max-height: none !important;
          }
          .overflow-hidden { 
            overflow: visible !important;
          }
           .overflow-y-auto { 
            overflow-y: visible !important;
          }
          .pr-4 { 
            padding-right: 0 !important;
          }
          .report-form-scroll-area > div {
             max-height: none !important;
             height: auto !important;
             overflow: visible !important;
          }
           /* Ensure ReportPreview's #printable-area is the only thing visible */
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
            font-size: 10pt; 
          }
        }
      `}</style>
    </div>
  );
}
