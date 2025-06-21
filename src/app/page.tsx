
"use client";

import React, { useState, useCallback } from 'react';
import type { ReportFormData } from "@/types";
import ClientOnlyReportForm from "@/components/vetscribe/ReportForm";
import { AppHeader } from "@/components/vetscribe/AppHeader";
import { handleGenerateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";

const resizeImage = (file: File, maxWidth: number, maxHeight: number): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("FileReader did not return a result."));
      }
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Could not get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Use JPEG format with quality compression for smaller file size.
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = (err) => reject(err);
      img.src = event.target.result as string;
    };
    reader.onerror = (err) => reject(err);
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
            dataUri: await resizeImage(file, 800, 800), // Resize image before storing
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
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          toast({
            title: "Erro Crítico: Imagens Muito Grandes",
            description: "O tamanho total das imagens excede o limite do navegador. Por favor, tente com menos imagens ou imagens menores.",
            variant: "destructive",
          });
      } else {
          const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro inesperado.";
          toast({
            title: "Erro Crítico",
            description: errorMessage,
            variant: "destructive",
          });
      }
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
