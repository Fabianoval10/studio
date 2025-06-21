
"use client";

import React, { useState, useCallback } from 'react';
import type { ReportFormData, UploadedImage } from "@/types";
import ClientOnlyReportForm from "@/components/vetscribe/ReportForm";
import { ReportPreview } from "@/components/vetscribe/ReportPreview";
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
  const [error, setError] = useState<string | null>(null);

  const [formDataForPreview, setFormDataForPreview] = useState<ReportFormData | null>(null);
  const [reportTextForPreview, setReportTextForPreview] = useState<string | null>(null);
  const [imagesForPreview, setImagesForPreview] = useState<UploadedImage[]>([]);

  const { toast } = useToast();

  const handleFormSubmit = useCallback(async (data: ReportFormData, images: File[]) => {
    setIsLoading(true);
    setError(null);
    setReportTextForPreview(null);

    try {
      const resizedImagesPromises = images.map(async (file) => ({
        id: crypto.randomUUID(),
        previewUrl: await resizeImage(file, 800, 800),
      }));
      const resizedImages = await Promise.all(resizedImagesPromises);

      setFormDataForPreview(data);
      setImagesForPreview(resizedImages);

      const result = await handleGenerateReportAction(data);

      if (result.success && result.reportText) {
        setReportTextForPreview(result.reportText);
        toast({
          title: "Laudo Gerado com Sucesso",
          description: "A pré-visualização foi atualizada. Clique em 'Imprimir para PDF' para salvar.",
          variant: "default",
        });
      } else {
        const errorMessage = result.error || "Não foi possível gerar o laudo. Por favor, tente novamente.";
        setError(errorMessage);
        toast({
          title: "Erro ao Gerar Laudo",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Ocorreu um erro inesperado.";
      setError(errorMessage);
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
      <main className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
        <div className="lg:col-span-1 lg:h-[calc(100vh-80px)]">
           <ClientOnlyReportForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
        <div className="lg:col-span-1 lg:h-[calc(100vh-80px)]">
            <ReportPreview
                formData={formDataForPreview}
                reportText={reportTextForPreview}
                uploadedImages={imagesForPreview}
                isLoading={isLoading}
                error={error}
            />
        </div>
      </main>
    </div>
  );
}
