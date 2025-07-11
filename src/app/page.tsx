
"use client";

import { AppHeader } from '@/components/vetscribe/AppHeader';
import { ReportPreview } from '@/components/vetscribe/ReportPreview';
import type { ReportFormData, UploadedImage } from "@/types";
import { useState, useCallback, useEffect } from "react";
import { handleGenerateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import ClientOnlyReportForm from '@/components/vetscribe/ReportForm';
import Portal from '@/components/Portal';
import { format } from 'date-fns';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [reportDataForPrint, setReportDataForPrint] = useState<{
    formData: ReportFormData;
    reportText: string | null;
    uploadedImages: UploadedImage[];
  } | null>(null);

  useEffect(() => {
    if (reportDataForPrint) {
      const originalTitle = document.title;
      const formattedDate = format(reportDataForPrint.formData.examDate, 'dd_MM_yyyy');
      const newTitle = `Baddha-${reportDataForPrint.formData.petName}-${formattedDate}`;
      document.title = newTitle;

      const handleAfterPrint = () => {
        setReportDataForPrint(null);
        document.title = originalTitle;
        window.removeEventListener('afterprint', handleAfterPrint);
      };

      window.addEventListener('afterprint', handleAfterPrint);

      // A short delay to allow the ReportPreview component to render before printing.
      const timer = setTimeout(() => {
        window.print();
      }, 500);

      // Cleanup function to remove the listener if the component unmounts.
      return () => {
        clearTimeout(timer);
        document.title = originalTitle;
        window.removeEventListener('afterprint', handleAfterPrint);
      };
    }
  }, [reportDataForPrint]);


  const handleFormSubmit = useCallback(async (data: ReportFormData, images: File[]) => {
    setIsLoading(true);
    setReportDataForPrint(null);
    
    try {
      // 1. Call the AI first. This is the most critical and time-sensitive part.
      const result = await handleGenerateReportAction(data);

      if (result.success && result.reportText) {
        // 2. If AI succeeds, then process images for preview.
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
        
        // 3. Set all data needed for printing at once.
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
        const errorMessage = (e instanceof Error && e.message.includes('FileReader'))
            ? "Ocorreu um erro ao processar uma das imagens. Verifique se os arquivos não estão corrompidos ou são muito grandes."
            : (e instanceof Error ? e.message : "Ocorreu um erro inesperado.");
        toast({
            title: "Erro Crítico no Processamento",
            description: errorMessage,
            variant: "destructive",
        });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return (
    <>
      <div className="no-print min-h-screen bg-gray-50 flex flex-col">
        <AppHeader />
        <main className="flex-grow container mx-auto px-4 py-8">
          <ClientOnlyReportForm onSubmit={handleFormSubmit} isLoading={isLoading} />
        </main>
      </div>

      {reportDataForPrint && (
        <Portal>
          <div className="print-container">
            <ReportPreview
              formData={reportDataForPrint.formData}
              reportText={reportDataForPrint.reportText}
              uploadedImages={reportDataForPrint.uploadedImages}
            />
          </div>
        </Portal>
      )}
    </>
  );
}
