import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollText } from "lucide-react";
import { getReportsForDisplay } from "@/lib/actions";
import { Badge } from "@/components/ui/badge";

export default async function ReportsPage() {
  const reports = await getReportsForDisplay();

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
            Aqui estão todos os laudos que você gerou, ordenados do mais recente para o mais antigo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {reports.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Data do Exame</TableHead>
                  <TableHead>Nome do Pet</TableHead>
                  <TableHead>Tutor</TableHead>
                  <TableHead>Espécie</TableHead>
                  <TableHead className="w-[140px]">Data de Criação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.examDate}</TableCell>
                    <TableCell>{report.petName}</TableCell>
                    <TableCell>{report.ownerName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{report.species}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{report.createdAt}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
              <ScrollText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Nenhum laudo encontrado</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Comece a gerar laudos na página 'Criar Laudo' para vê-los aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
