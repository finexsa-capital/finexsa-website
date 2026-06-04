// FINEXSA Client Portal — Excel Import Preview
// Milestone 3: client-side Excel parsing + preview only. No MIZAN run yet.

import { qs, showAlert, clearAlert, toast } from "./client-ui.js";

export const REQUIRED_HEADERS = [
  "Account Name",
  "Opening Balance",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec"
];

export const OPTIONAL_HEADERS = [
  "Account Number",
  "Classification",
  "Department",
  "Notes"
];

export function normalizeHeader(value) {
  return String(value == null ? "" : value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

export function findHeader(headers, wanted) {
  const normalizedWanted = normalizeHeader(wanted);
  return headers.find((h) => normalizeHeader(h) === normalizedWanted) || "";
}

export function validateHeaders(headers) {
  const missing = [];
  REQUIRED_HEADERS.forEach((h) => {
    if (!findHeader(headers, h)) missing.push(h);
  });
  return missing;
}

export function normalizeAmount(value) {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;

  const txt = String(value)
    .trim()
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/٬/g, "")
    .replace(/,/g, "")
    .replace(/\s+/g, "");

  const n = Number(txt);
  return Number.isFinite(n) ? n : NaN;
}

export async function parseExcelFile(file) {
  if (!file) throw new Error("لم يتم اختيار ملف.");

  const ext = file.name.toLowerCase().split(".").pop();
  if (!["xlsx", "xls", "csv"].includes(ext)) {
    throw new Error("الملف يجب أن يكون Excel أو CSV.");
  }

  if (!window.XLSX) {
    throw new Error("تعذر تحميل مكتبة قراءة Excel. تحقق من اتصال الإنترنت.");
  }

  const buffer = await file.arrayBuffer();
  const workbook = window.XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) throw new Error("ملف Excel لا يحتوي أي صفحات.");

  const sheet = workbook.Sheets[firstSheetName];
  const rows = window.XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: FalseToJsTrue()
  });

  if (!rows.length) {
    throw new Error("الصفحة الأولى فارغة أو لا تحتوي بيانات.");
  }

  const headers = Object.keys(rows[0] || {});
  const missing = validateHeaders(headers);

  const parsedRows = rows
    .map((row, index) => normalizeRow(row, headers, index + 2))
    .filter((row) => row.accountName || row.accountNumber);

  return {
    fileName: file.name,
    sheetName: firstSheetName,
    totalRows: rows.length,
    parsedRows,
    headers,
    missingHeaders: missing,
    warnings: buildWarnings(parsedRows, missing)
  };
}

// Small helper to avoid Python auto-capitalization confusion in generated text.
function FalseToJsTrue() {
  return false;
}

function normalizeRow(row, headers, excelRowNumber) {
  const get = (header) => {
    const found = findHeader(headers, header);
    return found ? row[found] : "";
  };

  const monthKeys = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const months = {};
  monthKeys.forEach((m) => {
    months[m] = normalizeAmount(get(m));
  });

  return {
    excelRowNumber,
    accountName: String(get("Account Name") || "").trim(),
    accountNumber: String(get("Account Number") || "").trim(),
    openingBalance: normalizeAmount(get("Opening Balance")),
    months,
    classification: String(get("Classification") || "").trim(),
    department: String(get("Department") || "").trim(),
    notes: String(get("Notes") || "").trim()
  };
}

function buildWarnings(rows, missingHeaders) {
  const warnings = [];

  if (missingHeaders.length) {
    warnings.push({
      type: "error",
      message: `يوجد أعمدة مطلوبة مفقودة: ${missingHeaders.join(", ")}`
    });
  }

  rows.forEach((row) => {
    if (!row.accountName) {
      warnings.push({
        type: "error",
        message: `السطر ${row.excelRowNumber}: اسم الحساب مفقود.`
      });
    }

    if (Number.isNaN(row.openingBalance)) {
      warnings.push({
        type: "warning",
        message: `السطر ${row.excelRowNumber}: الرصيد الافتتاحي ليس رقماً واضحاً.`
      });
    }

    Object.keys(row.months).forEach((m) => {
      if (Number.isNaN(row.months[m])) {
        warnings.push({
          type: "warning",
          message: `السطر ${row.excelRowNumber}: قيمة ${m} ليست رقماً واضحاً.`
        });
      }
    });

    if (!row.classification) {
      warnings.push({
        type: "warning",
        message: `السطر ${row.excelRowNumber}: الحساب غير مصنف بعد وسيحتاج Mapping.`
      });
    }
  });

  return warnings;
}

export function renderImportPreview(result) {
  qs("#import-result").classList.remove("is-hidden");
  qs("#file-name").textContent = result.fileName;
  qs("#sheet-name").textContent = result.sheetName;
  qs("#rows-count").textContent = result.parsedRows.length;
  qs("#headers-count").textContent = result.headers.length;

  const missingBox = qs("#missing-headers");
  if (result.missingHeaders.length) {
    missingBox.className = "client-alert";
    missingBox.textContent = "أعمدة مطلوبة مفقودة: " + result.missingHeaders.join(", ");
    missingBox.classList.remove("is-hidden");
  } else {
    missingBox.className = "client-alert success";
    missingBox.textContent = "تم العثور على كل الأعمدة المطلوبة.";
    missingBox.classList.remove("is-hidden");
  }

  renderWarnings(result.warnings);
  renderRows(result.parsedRows);

  try {
    sessionStorage.setItem("finexsa_import_preview", JSON.stringify(result));
  } catch (_) {
    // Preview may be large. Not critical at Milestone 3.
  }
}

function renderWarnings(warnings) {
  const wrap = qs("#warnings-list");
  if (!warnings.length) {
    wrap.innerHTML = `<div class="client-alert success">لا توجد ملاحظات على الملف.</div>`;
    return;
  }

  const topWarnings = warnings.slice(0, 30);
  wrap.innerHTML = topWarnings.map((w) => `
    <div class="client-alert ${w.type === "error" ? "" : "warning"}">${escapeHtml(w.message)}</div>
  `).join("");

  if (warnings.length > 30) {
    wrap.innerHTML += `<div class="client-alert warning">تم عرض أول 30 ملاحظة فقط من أصل ${warnings.length}.</div>`;
  }
}

function renderRows(rows) {
  const tbody = qs("#preview-table-body");
  const topRows = rows.slice(0, 50);

  tbody.innerHTML = topRows.map((row) => {
    const totalMonths = Object.values(row.months).reduce((sum, v) => sum + (Number.isFinite(v) ? v : 0), 0);
    return `
      <tr>
        <td>${row.excelRowNumber}</td>
        <td><strong>${escapeHtml(row.accountName || "—")}</strong></td>
        <td>${escapeHtml(row.accountNumber || "—")}</td>
        <td>${formatNum(row.openingBalance)}</td>
        <td>${formatNum(totalMonths)}</td>
        <td>${escapeHtml(row.classification || "بحاجة Mapping")}</td>
        <td>${escapeHtml(row.department || "—")}</td>
      </tr>
    `;
  }).join("");

  qs("#preview-limit-note").textContent = rows.length > 50
    ? `تم عرض أول 50 صفاً فقط من أصل ${rows.length}.`
    : "";
}

function formatNum(value) {
  if (!Number.isFinite(value)) return "غير رقمي";
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
