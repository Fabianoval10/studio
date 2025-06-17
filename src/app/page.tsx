"use client";

import React, { useState, useCallback } from 'react';
import type { ReportFormData, UploadedImage } from "@/types";
import ClientOnlyReportForm from "@/components/vetscribe/ReportForm"; // Use the client-only wrapper
import { ReportPreview } from "@/components/vetscribe/ReportPreview";
import { AppHeader } from "@/components/vetscribe/AppHeader";
import { handleGenerateReportAction } from "@/lib/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from '@/components/ui/scroll-area';

export default function VetScribePage() {
  const [currentFormData, setCurrentFormData] = useState<ReportFormData | null>(null);
  const [generatedReportText, setGeneratedReportText] = useState<string | null>(null);
  const [currentUploadedImages, setCurrentUploadedImages] = useState<UploadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFormSubmit = useCallback(async (data: ReportFormData, images: File[]) => {
    setIsLoading(true);
    setError(null);
    setGeneratedReportText(null); // Clear previous report

    // Create UploadedImage objects for preview
    const uploadedImageObjects: UploadedImage[] = images.map(file => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file)
    }));
    setCurrentUploadedImages(prevImages => {
      // Revoke old object URLs before setting new ones
      prevImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
      return uploadedImageObjects;
    });
    setCurrentFormData(data); // Set form data for preview immediately


    try {
      const result = await handleGenerateReportAction(data);
      if (result.success && result.reportText) {
        setGeneratedReportText(result.reportText);
        toast({
          title: "Laudo Gerado",
          description: "A IA gerou o rascunho do laudo com sucesso.",
          variant: "default",
        });
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
  
  // Clean up object URLs on component unmount
  React.useEffect(() => {
    return () => {
      currentUploadedImages.forEach(img => URL.revokeObjectURL(img.previewUrl));
    };
  }, [currentUploadedImages]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start max-h-[calc(100vh-100px)] lg:max-h-[calc(100vh-120px)]">
          {/* Form Section with its own scroll */}
          <div className="lg:max-h-[calc(100vh-120px)] overflow-hidden">
             <ClientOnlyReportForm onSubmit={handleFormSubmit} isLoading={isLoading} />
          </div>

          {/* Preview Section with its own scroll */}
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
      {/* Global print styles */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #fff !important; /* Ensure white background for printing */
            -webkit-print-color-adjust: exact; /* Chrome, Safari */
            color-adjust: exact; /* Firefox, Edge */
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            max-height: none !important;
          }
          .lg\\:sticky { /* Undo sticky positioning for print */
            position: static !important;
          }
          .lg\\:max-h-\\[calc\\(100vh-120px\\)\\] { /* Allow full height for print */
             max-height: none !important;
          }
          .overflow-hidden { /* Allow content to flow for print */
            overflow: visible !important;
          }
           .overflow-y-auto { /* Allow content to flow for print */
            overflow-y: visible !important;
          }
          .pr-4 { /* Remove scrollbar padding for print */
            padding-right: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
