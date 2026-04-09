import { useState, useRef } from "react";
import { observer } from "mobx-react";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@plane/propel/button";
import { setToast, TOAST_TYPE } from "@plane/propel/toast";
import type { IBulkImportResult } from "@plane/types";
import { PageWrapper } from "@/components/common/page-wrapper";
import { useUserManagement } from "@/hooks/store";
import type { Route } from "./+types/page";

const ImportUsersPage = observer(function ImportUsersPage(_props: Route.ComponentProps) {
  const { bulkImport, fetchUsers } = useUserManagement();
  const [file, setFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<IBulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      setResult(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    setIsImporting(true);
    try {
      const importResult = await bulkImport(file);
      setResult(importResult);
      if (importResult.created > 0) {
        setToast({
          type: TOAST_TYPE.SUCCESS,
          title: "Import complete",
          message: `${importResult.created} user(s) created successfully.`,
        });
        fetchUsers();
      }
      if (importResult.errors.length > 0) {
        setToast({
          type: TOAST_TYPE.WARNING,
          title: "Some rows failed",
          message: `${importResult.errors.length} row(s) had errors.`,
        });
      }
    } catch {
      setToast({ type: TOAST_TYPE.ERROR, title: "Error", message: "Failed to import users" });
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    const csv = "username,email,first_name,last_name,role,workspace_slug\njohndoe,user@example.com,John,Doe,15,my-workspace\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "user_import_template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageWrapper
      header={{
        title: "Import Users",
        description: "Bulk create user accounts from a CSV or XLSX file.",
      }}
    >
      <div className="max-w-2xl space-y-6">
        {/* Template download */}
        <div className="rounded-lg border border-subtle bg-surface-2 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Download template</p>
              <p className="text-xs text-secondary">
                CSV with columns: username, email, first_name, last_name, role (5/15/20), workspace_slug
              </p>
            </div>
            <Button variant="secondary" size="base" onClick={downloadTemplate}>
              <Download className="h-4 w-4" />
              Template
            </Button>
          </div>
        </div>

        {/* File upload */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="flex cursor-pointer flex-col items-center gap-3 rounded-lg border-2 border-dashed border-subtle p-8 hover:border-primary"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <>
              <FileSpreadsheet className="h-10 w-10 text-primary" />
              <div className="text-center">
                <p className="text-sm font-medium text-primary">{file.name}</p>
                <p className="text-xs text-secondary">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-tertiary" />
              <div className="text-center">
                <p className="text-sm font-medium text-primary">Click to upload CSV or XLSX</p>
                <p className="text-xs text-secondary">or drag and drop</p>
              </div>
            </>
          )}
        </div>

        {file && (
          <Button variant="primary" size="base" onClick={handleImport} disabled={isImporting}>
            {isImporting ? "Importing..." : "Import Users"}
          </Button>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-3">
            <div className="rounded-lg border border-subtle p-4">
              <p className="text-sm font-medium text-primary">
                Import Result: {result.created} created, {result.errors.length} errors
              </p>
            </div>

            {result.errors.length > 0 && (
              <div className="overflow-hidden rounded-lg border border-red-200">
                <table className="w-full text-sm">
                  <thead className="bg-red-50 dark:bg-red-900/20">
                    <tr className="text-left text-xs font-medium text-red-700 dark:text-red-400">
                      <th className="px-4 py-2">Row</th>
                      <th className="px-4 py-2">Email</th>
                      <th className="px-4 py-2">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 dark:divide-red-900/30">
                    {result.errors.map((err, i) => (
                      <tr key={i}>
                        <td className="px-4 py-2 text-secondary">{err.row}</td>
                        <td className="px-4 py-2 text-secondary">{err.email}</td>
                        <td className="px-4 py-2 text-red-600 dark:text-red-400">{err.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
});

export const meta: Route.MetaFunction = () => [{ title: "Import Users - God Mode" }];

export default ImportUsersPage;
