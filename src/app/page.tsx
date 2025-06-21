
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { ReportFormData, UploadedImage } from "@/types";
import ClientOnlyReportForm from "@/components/vetscribe/ReportForm";
import { AppHeader } from "@/components/vetscribe/AppHeader";
import { handleGenerateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ReportPreview } from '@/components/vetscribe/ReportPreview';

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
  const { toast } = useToast();
  const [reportDataForPrint, setReportDataForPrint] = useState<{
    formData: ReportFormData;
    reportText: string | null;
    uploadedImages: UploadedImage[];
  } | null>(null);

  useEffect(() => {
    if (reportDataForPrint) {
      // A small timeout ensures the component has rendered with the new data before printing
      const timer = setTimeout(() => {
        window.print();
        setReportDataForPrint(null); // Reset state after printing to remove it from the DOM
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [reportDataForPrint]);


  const handleFormSubmit = useCallback(async (data: ReportFormData, images: File[]) => {
    setIsLoading(true);
    setReportDataForPrint(null);
    
    try {
      const resizedImagesPromises = images.map(file => resizeImage(file, 800, 800));
      const resizedDataUris = await Promise.all(resizedImagesPromises);
      
      const uploadedImagesForPreview: UploadedImage[] = resizedDataUris.map(dataUri => ({
        id: crypto.randomUUID(),
        previewUrl: dataUri,
      }));

      const result = await handleGenerateReportAction(data);

      if (result.success && result.reportText) {
        setReportDataForPrint({
            formData: data,
            reportText: result.reportText,
            uploadedImages: uploadedImagesForPreview,
        });
      } else {
        const errorMessage = result.error || "Não foi possível gerar o laudo. Por favor, tente novamente.";
        toast({
          title: "Erro ao Gerar Laudo",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
        const errorMessage = e.message.includes('quota') 
            ? "As imagens são muito grandes ou numerosas. Tente carregar menos imagens ou menores."
            : (e instanceof Error ? e.message : "Ocorreu um erro inesperado.");
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
      <main className="flex-grow container mx-auto p-4 flex justify-center items-start">
        {/* The form is part of the main layout, but will be hidden during printing by the ReportPreview's own CSS */}
        <div className="w-full max-w-4xl">
           <ClientOnlyReportForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </div>
      </main>

      {/* This component is rendered but visually hidden, ready for printing */}
      {reportDataForPrint && (
        <div className="sr-only">
           <ReportPreview
            formData={reportDataForPrint.formData}
            reportText={reportDataForPrint.reportText}
            uploadedImages={reportDataForPrint.uploadedImages}
            isLoading={false}
            error={null}
          />
        </div>
      )}
    </div>
  );
}
