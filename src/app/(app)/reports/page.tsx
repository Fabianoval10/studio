import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
        <ScrollText className="w-8 h-8"/>
        Laudos Salvos
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Laudos</CardTitle>
          <CardDescription>
            A funcionalidade de banco de dados foi desativada.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <ScrollText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhum laudo para exibir</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Os laudos gerados não estão sendo salvos no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
