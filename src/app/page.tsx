
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { ReportFormData, UploadedImage } from "@/types";
import ClientOnlyReportForm from "@/components/vetscribe/ReportForm"; // Use the client-only wrapper
import { ReportPreview } from "@/components/vetscribe/ReportPreview";
import { AppHeader } from "@/components/vetscribe/AppHeader";
import { handleGenerateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

// Função para converter File para Data URI
const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};


export default function VetScribePage() {
  const [currentFormData, setCurrentFormData] = useState<ReportFormData | null>(null);
  const [generatedReportText, setGeneratedReportText] = useState<string | null>(null);
  const [currentUploadedImages, setCurrentUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [printTrigger, setPrintTrigger] = useState(0); 
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

    // Converter imagens para Data URIs
    let imageDataUris: string[] = [];
    if (images.length > 0) {
      try {
        imageDataUris = await Promise.all(images.map(fileToDataUri));
      } catch (conversionError) {
        console.error("Erro ao converter imagens para Data URI:", conversionError);
        setError("Falha ao processar as imagens para análise. Verifique o console para mais detalhes.");
        toast({
          title: "Erro de Imagem",
          description: "Não foi possível processar uma ou mais imagens.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      // Passar Data URIs para a action
      const result = await handleGenerateReportAction(data, imageDataUris);
      if (result.success && result.reportText) {
        setGeneratedReportText(result.reportText);
        toast({
          title: "Laudo Gerado",
          description: "A IA gerou o rascunho do laudo com sucesso. A caixa de diálogo de impressão será aberta.",
          variant: "default",
        });
        setPrintTrigger(prev => prev + 1); 
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
      <main className="flex-grow container mx-auto px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start h-[calc(100vh-85px)] lg:h-[calc(100vh-100px)]">
          
          <div className="lg:h-full no-print">
             <ClientOnlyReportForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>

          
          <div className="lg:h-full"> 
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
            -webkit-print-color-adjust: exact !important; 
            color-adjust: exact !important; 
          }
          main { 
            padding: 0 !important;
            margin: 0 !important;
          }
          .lg\\:sticky { 
            position: static !important;
          }
           
          .overflow-hidden {
            overflow: visible !important;
          }
           .overflow-y-auto {
            overflow-y: visible !important;
          }
        }
      `}</style>
    </div>
  );
}
    
