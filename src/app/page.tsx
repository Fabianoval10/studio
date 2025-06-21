
"use client";

import React, { useState, useCallback, useEffect } from 'react';
import type { ReportFormData, UploadedImage } from "@/types";
import ClientOnlyReportForm from "@/components/vetscribe/ReportForm";
import { AppHeader } from "@/components/vetscribe/AppHeader";
import { handleGenerateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ReportPreview } from '@/components/vetscribe/ReportPreview';

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
      const timer = setTimeout(() => {
        window.print();
        setReportDataForPrint(null); 
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [reportDataForPrint]);


  const handleFormSubmit = useCallback(async (data: ReportFormData, images: File[]) => {
    setIsLoading(true);
    setReportDataForPrint(null);
    
    try {
      const imagePromises = images.map(file => {
        return new Promise<UploadedImage>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (!event.target?.result) {
              return reject(new Error("FileReader não retornou resultado."));
            }
            resolve({
              id: crypto.randomUUID(),
              previewUrl: event.target.result as string,
            });
          };
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });
      });

      const uploadedImagesForPreview = await Promise.all(imagePromises);

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
    <>
      <div className="no-print">
        <div className="flex flex-col min-h-screen bg-background">
          <AppHeader />
          <main className="flex-grow container mx-auto p-4 flex justify-center items-start">
            <div className="w-full max-w-4xl">
               <ClientOnlyReportForm onSubmit={handleFormSubmit} isLoading={isLoading} />
            </div>
          </main>
        </div>
      </div>

      {reportDataForPrint && (
        <div className="print-container">
           <ReportPreview
            formData={reportDataForPrint.formData}
            reportText={reportDataForPrint.reportText}
            uploadedImages={reportDataForPrint.uploadedImages}
          />
        </div>
      )}
    </>
  );
}
