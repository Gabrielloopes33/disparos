import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAddLeads } from "@/hooks/useDispatchQueue";
import { QueueLead } from "@/services/supabase";
import { toast } from "sonner";

interface ParsedCSV {
  headers: string[];
  rows: string[][];
}

interface ColumnMapping {
  name: string;
  email: string;
  ddi: string;
  phone: string;
  organization_name: string;
}

export function ImportCSV() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsedCSV, setParsedCSV] = useState<ParsedCSV | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    name: "",
    email: "",
    ddi: "",
    phone: "",
    organization_name: "",
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ inserted: number; errors: string[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const addLeads = useAddLeads();

  const parseCSV = (text: string): ParsedCSV => {
    const lines = text.split(/\r?\n/).filter((line) => line.trim());
    if (lines.length === 0) throw new Error("Arquivo vazio");

    // Detect separator (comma or semicolon)
    const firstLine = lines[0];
    const separator = firstLine.includes(";") ? ";" : ",";

    const headers = firstLine.split(separator).map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1).map((line) =>
      line.split(separator).map((cell) => cell.trim().replace(/^"|"$/g, ""))
    );

    return { headers, rows };
  };

  const handleFileSelect = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Por favor, selecione um arquivo CSV");
      return;
    }

    try {
      const text = await file.text();
      const parsed = parseCSV(text);
      setParsedCSV(parsed);
      setImportResult(null);

      // Auto-map columns based on common names
      const autoMapping: ColumnMapping = {
        name: "",
        email: "",
        ddi: "",
        phone: "",
        organization_name: "",
      };

      const lowerHeaders = parsed.headers.map((h) => h.toLowerCase());

      // Name
      const nameIndex = lowerHeaders.findIndex((h) =>
        ["name", "nome", "full_name", "fullname", "nome_completo"].includes(h)
      );
      if (nameIndex >= 0) autoMapping.name = parsed.headers[nameIndex];

      // Email
      const emailIndex = lowerHeaders.findIndex((h) =>
        ["email", "e-mail", "mail", "email_address"].includes(h)
      );
      if (emailIndex >= 0) autoMapping.email = parsed.headers[emailIndex];

      // DDI
      const ddiIndex = lowerHeaders.findIndex((h) =>
        ["ddi", "country_code", "codigo_pais", "ddd_pais"].includes(h)
      );
      if (ddiIndex >= 0) autoMapping.ddi = parsed.headers[ddiIndex];

      // Phone
      const phoneIndex = lowerHeaders.findIndex((h) =>
        ["phone", "telefone", "celular", "mobile", "whatsapp", "fone", "tel"].includes(h)
      );
      if (phoneIndex >= 0) autoMapping.phone = parsed.headers[phoneIndex];

      // Organization
      const orgIndex = lowerHeaders.findIndex((h) =>
        ["organization_name", "empresa", "company", "organization", "org", "company_name"].includes(h)
      );
      if (orgIndex >= 0) autoMapping.organization_name = parsed.headers[orgIndex];

      setColumnMapping(autoMapping);
      toast.success(`CSV carregado: ${parsed.rows.length} linhas encontradas`);
    } catch (error) {
      toast.error("Erro ao ler arquivo CSV");
      console.error(error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleImport = async () => {
    if (!parsedCSV) return;

    if (!columnMapping.phone) {
      toast.error("Mapeie pelo menos a coluna de telefone");
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      const leads: Omit<QueueLead, "id" | "created_at">[] = [];

      for (const row of parsedCSV.rows) {
        const getValue = (header: string) => {
          if (!header) return "";
          const index = parsedCSV.headers.indexOf(header);
          return index >= 0 ? row[index] || "" : "";
        };

        const phone = getValue(columnMapping.phone).replace(/\D/g, "");
        if (!phone || phone.length < 8) continue; // Skip invalid phones

        const ddi = getValue(columnMapping.ddi).replace(/\D/g, "") || "55";

        leads.push({
          name: getValue(columnMapping.name) || "Sem nome",
          email: getValue(columnMapping.email) || undefined,
          ddi,
          phone,
          complete_phone: `${ddi}${phone}`,
          organization_name: getValue(columnMapping.organization_name) || undefined,
        });
      }

      if (leads.length === 0) {
        toast.error("Nenhum lead válido encontrado no CSV");
        setIsImporting(false);
        return;
      }

      const result = await addLeads.mutateAsync(leads);
      setImportResult(result);

      if (result.errors.length === 0) {
        toast.success(`${result.inserted} leads importados com sucesso!`);
      } else {
        toast.warning(`${result.inserted} importados, ${result.errors.length} erros`);
      }
    } catch (error: any) {
      const is503 = error?.message?.includes('503');
      toast.error(
        is503
          ? "Servidor Supabase indisponível. Verifique os serviços."
          : "Erro ao importar leads. Verifique a conexão."
      );
      console.error(error);
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setParsedCSV(null);
    setColumnMapping({
      name: "",
      email: "",
      ddi: "",
      phone: "",
      organization_name: "",
    });
    setImportResult(null);
  };

  const downloadTemplate = () => {
    const template = "name,email,ddi,phone,organization_name\nJoão Silva,joao@email.com,55,11999999999,Empresa ABC\nMaria Santos,maria@email.com,55,21888888888,Empresa XYZ";
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_leads.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {!parsedCSV ? (
        <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Upload className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Importar CSV</h2>
                <p className="text-sm text-muted-foreground">Adicione leads à fila de disparos</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Baixar Template
            </Button>
          </div>

          <div
            className={cn(
              "border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer",
              isDragOver
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Arraste um arquivo CSV ou clique para selecionar</p>
            <p className="text-sm text-muted-foreground">
              O arquivo deve conter pelo menos uma coluna de telefone
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Column Mapping */}
          <div className="rounded-xl border border-border bg-card p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <FileSpreadsheet className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Mapear Colunas</h2>
                  <p className="text-sm text-muted-foreground">
                    {parsedCSV.rows.length} linhas encontradas
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={resetImport}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Select
                  value={columnMapping.name}
                  onValueChange={(v) => setColumnMapping((m) => ({ ...m, name: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {parsedCSV.headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Select
                  value={columnMapping.email}
                  onValueChange={(v) => setColumnMapping((m) => ({ ...m, email: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {parsedCSV.headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>DDI (código do país)</Label>
                <Select
                  value={columnMapping.ddi}
                  onValueChange={(v) => setColumnMapping((m) => ({ ...m, ddi: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Padrão: 55 (Brasil)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Usar 55 (Brasil)</SelectItem>
                    {parsedCSV.headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  Telefone <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={columnMapping.phone}
                  onValueChange={(v) => setColumnMapping((m) => ({ ...m, phone: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Obrigatório" />
                  </SelectTrigger>
                  <SelectContent>
                    {parsedCSV.headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Empresa</Label>
                <Select
                  value={columnMapping.organization_name}
                  onValueChange={(v) => setColumnMapping((m) => ({ ...m, organization_name: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Nenhum</SelectItem>
                    {parsedCSV.headers.map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6">
              <h3 className="font-medium mb-3">Preview (primeiras 5 linhas)</h3>
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Nome</th>
                      <th className="px-3 py-2 text-left">Email</th>
                      <th className="px-3 py-2 text-left">DDI</th>
                      <th className="px-3 py-2 text-left">Telefone</th>
                      <th className="px-3 py-2 text-left">Empresa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedCSV.rows.slice(0, 5).map((row, i) => {
                      const getValue = (header: string) => {
                        if (!header) return "-";
                        const index = parsedCSV.headers.indexOf(header);
                        return index >= 0 ? row[index] || "-" : "-";
                      };
                      return (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">{getValue(columnMapping.name)}</td>
                          <td className="px-3 py-2">{getValue(columnMapping.email)}</td>
                          <td className="px-3 py-2">
                            {getValue(columnMapping.ddi) === "-" ? "55" : getValue(columnMapping.ddi)}
                          </td>
                          <td className="px-3 py-2">{getValue(columnMapping.phone)}</td>
                          <td className="px-3 py-2">{getValue(columnMapping.organization_name)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Import Button */}
            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={resetImport}>
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={!columnMapping.phone || isImporting}
                className="gap-2"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Importar {parsedCSV.rows.length} leads
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Import Result */}
          {importResult && (
            <div
              className={cn(
                "rounded-xl border p-6 animate-fade-in",
                importResult.errors.length === 0
                  ? "border-green-500/50 bg-green-500/5"
                  : "border-amber-500/50 bg-amber-500/5"
              )}
            >
              <div className="flex items-center gap-3 mb-4">
                {importResult.errors.length === 0 ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-amber-500" />
                )}
                <div>
                  <h3 className="font-semibold">Importação Concluída</h3>
                  <p className="text-sm text-muted-foreground">
                    {importResult.inserted} leads importados com sucesso
                  </p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-amber-500 mb-2">
                    {importResult.errors.length} erro(s):
                  </p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {importResult.errors.slice(0, 5).map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                    {importResult.errors.length > 5 && (
                      <li>• ... e mais {importResult.errors.length - 5} erros</li>
                    )}
                  </ul>
                </div>
              )}

              <Button variant="outline" onClick={resetImport} className="mt-4">
                Importar outro arquivo
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
