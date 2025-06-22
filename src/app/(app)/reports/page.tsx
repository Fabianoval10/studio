import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
        <ScrollText className="w-8 h-8"/>
        Laudos
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Laudos</CardTitle>
          <CardDescription>
            Esta página listará todos os seus laudos gerados anteriormente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-body">Funcionalidade em desenvolvimento.</p>
        </CardContent>
      </Card>
    </div>
  );
}
