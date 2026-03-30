import { NextResponse } from "next/server";

// Temporary diagnostic endpoint — remove after debugging
// GET /api/debug/parsers — tests pdf-parse, mammoth, and Ollama connectivity
export async function GET() {
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    steps: {},
  };

  // Step 1: Can we load pdf-parse?
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require("pdf-parse");
    results.steps = {
      ...results.steps as object,
      "1_pdfparse_load": { ok: true, type: typeof pdfParse },
    };

    // Step 1b: Can we parse a minimal PDF?
    try {
      // Minimal valid PDF
      const minimalPdf = Buffer.from(
        "%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n" +
        "2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
        "3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R/Resources<<>>>>endobj\n" +
        "xref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n" +
        "0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n206\n%%EOF"
      );
      const parsed = await pdfParse(minimalPdf);
      results.steps = {
        ...results.steps as object,
        "1b_pdfparse_parse": { ok: true, textLength: parsed.text?.length ?? 0, pages: parsed.numpages },
      };
    } catch (parseErr) {
      results.steps = {
        ...results.steps as object,
        "1b_pdfparse_parse": { ok: false, error: String(parseErr) },
      };
    }
  } catch (loadErr) {
    results.steps = {
      ...results.steps as object,
      "1_pdfparse_load": { ok: false, error: String(loadErr) },
    };
  }

  // Step 2: Can we load mammoth?
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require("mammoth");
    results.steps = {
      ...results.steps as object,
      "2_mammoth_load": { ok: true, hasExtractRawText: typeof mammoth.extractRawText === "function" },
    };
  } catch (loadErr) {
    results.steps = {
      ...results.steps as object,
      "2_mammoth_load": { ok: false, error: String(loadErr) },
    };
  }

  // Step 3: Can we reach Ollama?
  const ollamaUrl = process.env.OLLAMA_URL || "http://ollama:11434";
  try {
    const res = await fetch(`${ollamaUrl}/api/tags`, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    const models = (data.models ?? []).map((m: { name: string }) => m.name);
    results.steps = {
      ...results.steps as object,
      "3_ollama_connect": { ok: true, url: ollamaUrl, models },
    };
  } catch (ollamaErr) {
    results.steps = {
      ...results.steps as object,
      "3_ollama_connect": { ok: false, url: ollamaUrl, error: String(ollamaErr) },
    };
  }

  // Step 4: Check serverExternalPackages config
  try {
    const fs = require("fs");
    const configPath = require("path").join(process.cwd(), "next.config.ts");
    const exists = fs.existsSync(configPath);
    results.steps = {
      ...results.steps as object,
      "4_config": { nextConfigExists: exists, cwd: process.cwd() },
    };
  } catch {
    // ignore
  }

  // Step 5: Check if pdf-parse module files exist
  try {
    const fs = require("fs");
    const path = require("path");
    const modulePaths = [
      path.join(process.cwd(), "node_modules", "pdf-parse", "index.js"),
      path.join(process.cwd(), "node_modules", "pdf-parse", "package.json"),
      path.join(process.cwd(), "node_modules", "mammoth", "lib", "index.js"),
    ];
    const fileChecks: Record<string, boolean> = {};
    for (const p of modulePaths) {
      fileChecks[p] = fs.existsSync(p);
    }
    results.steps = {
      ...results.steps as object,
      "5_module_files": fileChecks,
    };
  } catch {
    // ignore
  }

  return NextResponse.json(results, { status: 200 });
}
