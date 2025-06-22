
"use client";

import { ReportForm } from '@/components/vetscribe/ReportForm';
import { AppHeader } from '@/components/vetscribe/AppHeader';
import { ReportPreview } from '@/components/vetscribe/ReportPreview';
import type { ReportFormData, UploadedImage } from "@/types";
import { useState, useCallback, useEffect } from "react";
import { handleGenerateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import ClientOnlyReportForm from '@/components/vetscribe/ReportForm';

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
      // Delay printing slightly to allow state to update and component to re-render
      const timer = setTimeout(() => {
        window.print();
        setReportDataForPrint(null); // Reset after printing
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [reportDataForPrint]);


  const handleFormSubmit = useCallback(async (data: ReportFormData, images: File[]) => {
    setIsLoading(true);
    setReportDataForPrint(null);
    
    try {
      // Convert images to data URIs for preview
      const imagePromises = images.map(file => {
        return new Promise<UploadedImage>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            if (!event.target?.result) {
              return reject(new Error("FileReader did not return a result."));
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
        const errorMessage = result.error || "Failed to generate report. Please try again.";
        toast({
          title: "Error Generating Report",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (e: any) {
        const errorMessage = e.message.includes('quota') 
            ? "Images are too large or too many. Try uploading fewer or smaller images."
            : (e instanceof Error ? e.message : "An unexpected error occurred.");
        toast({
            title: "Critical Error",
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

      {/* This component will only be rendered when we have data for printing */}
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
