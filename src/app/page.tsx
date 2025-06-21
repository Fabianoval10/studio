
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { ReportFormData } from "@/types";
import ClientOnlyReportForm from "@/components/vetscribe/ReportForm";
import { AppHeader } from "@/components/vetscribe/AppHeader";
import { handleGenerateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export default function VetScribePage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFormSubmit = useCallback(async (data: ReportFormData, images: File[]) => {
    setIsLoading(true);

    try {
      const result = await handleGenerateReportAction(data);
      if (result.success && result.reportText) {
        
        const imageDataForStorage = await Promise.all(
          images.map(async (file) => ({
            id: crypto.randomUUID(),
            dataUri: await fileToDataUri(file),
          }))
        );

        sessionStorage.setItem('uploadedImages', JSON.stringify(imageDataForStorage));
        sessionStorage.setItem('reportFormData', JSON.stringify(data));
        sessionStorage.setItem('generatedReportText', JSON.stringify(result.reportText));
        
        window.open('/laudo', '_blank');

        toast({
          title: "Laudo Gerado com Sucesso",
          description: "A pré-visualização do laudo foi aberta em uma nova aba.",
          variant: "default",
        });
      } else {
        toast({
          title: "Erro ao Gerar Laudo",
          description: result.error || "Não foi possível gerar o laudo. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro inesperado.";
      toast({
        title: "Erro Crítico",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4">
        <div className="max-w-4xl mx-auto">
          <ClientOnlyReportForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
      </main>
    </div>
  );
}
