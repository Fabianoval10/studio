
"use client";

import React, { useState, useEffect } from 'react';
import { ReportPreview } from '@/components/vetscribe/ReportPreview';
import type { ReportFormData, UploadedImage } from '@/types';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function LaudoPage() {
    const [formData, setFormData] = useState<ReportFormData | null>(null);
    const [reportText, setReportText] = useState<string | null>(null);
    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        try {
            const storedFormData = sessionStorage.getItem('reportFormData');
            const storedReportText = sessionStorage.getItem('generatedReportText');
            const storedImagesData = sessionStorage.getItem('uploadedImages');

            if (storedFormData && storedReportText) {
                const parsedFormData = JSON.parse(storedFormData);
                
                // Zod não consegue fazer parse de strings de data diretamente para Date, então convertemos manualmente.
                if(parsedFormData.examDate) {
                    parsedFormData.examDate = new Date(parsedFormData.examDate);
                }

                setFormData(parsedFormData);
                setReportText(JSON.parse(storedReportText));

                if (storedImagesData) {
                    const parsedImages: { id: string, dataUri: string }[] = JSON.parse(storedImagesData);
                    const imagesForPreview: UploadedImage[] = parsedImages.map(img => ({
                        id: img.id,
                        previewUrl: img.dataUri,
                    }));
                    setUploadedImages(imagesForPreview);
                }
            } else {
                setError("Dados do laudo não encontrados. Por favor, gere um novo laudo.");
            }
        } catch (e) {
            console.error("Erro ao carregar dados do laudo:", e);
            setError("Ocorreu um erro ao carregar os dados do laudo. Tente gerar novamente.");
        } finally {
            setIsLoading(false);
        }
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-muted/20">
                <Card className="text-center p-8">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
                    <CardTitle>Carregando Laudo</CardTitle>
                    <CardDescription>Aguarde um momento...</CardDescription>
                </Card>
            </div>
        );
    }
    
    return (
        <div className="bg-muted/20 min-h-screen p-2 sm:p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                 {error || !formData ? (
                     <Alert variant="destructive" className="m-4">
                        <Info className="h-4 w-4" />
                        <AlertTitle>Não foi possível carregar o laudo</AlertTitle>
                        <AlertDescription>{error || "Dados não encontrados."}</AlertDescription>
                    </Alert>
                 ) : (
                    <ReportPreview
                        formData={formData}
                        reportText={reportText}
                        uploadedImages={uploadedImages}
                        isLoading={false}
                        error={null}
                    />
                 )}
            </div>
        </div>
    );
}
