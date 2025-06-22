import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
        <LayoutDashboard className="w-8 h-8" />
        Dashboard
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao VETLD</CardTitle>
          <CardDescription>
            Este é o seu painel de controle. Mais funcionalidades em breve!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-body">Navegue pela barra lateral para criar novos laudos ou visualizar os existentes.</p>
        </CardContent>
      </Card>
    </div>
  );
}
