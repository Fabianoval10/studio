import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
        <Settings className="w-8 h-8"/>
        Configurações
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Aplicativo</CardTitle>
          <CardDescription>
            Gerencie suas preferências do VETLD aqui.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-body">Esta funcionalidade será implementada em breve.</p>
        </CardContent>
      </Card>
    </div>
  );
}
