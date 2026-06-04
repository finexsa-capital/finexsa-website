// FINEXSA Client Portal — Excel Import Preview
// Milestone 3.5: Arabic-facing template + Code_Map-ready structure.
// This stage reads Arabic or English headers, previews data, and prepares for Mapping.
// No final save and no MIZAN run yet.

import { qs } from "./client-ui.js";

export const FIELD_ALIASES = {
  accountName: ["اسم الحساب", "Account Name", "account name", "الحساب"],
  accountNumber: ["رقم الحساب", "Account Number", "account number", "كود الحساب"],
  openingBalance: ["الرصيد الافتتاحي", "Opening Balance", "opening balance", "افتتاحي"],

  Jan: ["كانون الثاني", "يناير", "Jan", "January"],
  Feb: ["شباط", "فبراير", "Feb", "February"],
  Mar: ["آذار", "مارس", "Mar", "March"],
  Apr: ["نيسان", "أبريل", "Apr", "April"],
  May: ["أيار", "مايو", "May"],
  Jun: ["حزيران", "يونيو", "Jun", "June"],
  Jul: ["تموز", "يوليو", "Jul", "July"],
  Aug: ["آب", "أغسطس", "Aug", "August"],
  Sep: ["أيلول", "سبتمبر", "Sep", "September"],
  Oct: ["تشرين الأول", "أكتوبر", "Oct", "October"],
  Nov: ["تشرين الثاني", "نوفمبر", "Nov", "November"],
  Dec: ["كانون الأول", "ديسمبر", "Dec", "December"],

  classification: ["التصنيف المالي", "Classification", "التصنيف", "Financial Classification"],
  department: ["القسم", "Department", "مركز التكلفة"],
  notes: ["ملاحظات", "Notes", "بيان"]
};

export const REQUIRED_FIELDS = [
  "accountName",
  "openingBalance",
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

export const FIELD_LABELS_AR = {
  accountName: "اسم الحساب",
  accountNumber: "رقم الحساب",
  openingBalance: "الرصيد الافتتاحي",
  Jan: "كانون الثاني",
  Feb: "شباط",
  Mar: "آذار",
  Apr: "نيسان",
  May: "أيار",
  Jun: "حزيران",
  Jul: "تموز",
  Aug: "آب",
  Sep: "أيلول",
  Oct: "تشرين الأول",
  Nov: "تشرين الثاني",
  Dec: "كانون الأول",
  classification: "التصنيف المالي",
  department: "القسم",
  notes: "ملاحظات"
};

export const MONTH_KEYS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function normalizeHeader(value) {
  return String(value == null ? "" : value)
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .toLowerCase();
}

export function findHeader(headers, fieldKey) {
  const aliases = FIELD_ALIASES[fieldKey] || [fieldKey];
  const normalizedAliases = aliases.map(normalizeHeader);

  return headers.find((h) => normalizedAliases.includes(normalizeHeader(h))) || "";
}

export function validateHeaders(headers) {
  const missing = [];
  REQUIRED_FIELDS.forEach((fieldKey) => {
    if (!findHeader(headers, fieldKey)) missing.push(FIELD_LABELS_AR[fieldKey] || fieldKey);
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
    raw: false
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

function normalizeRow(row, headers, excelRowNumber) {
  const get = (fieldKey) => {
    const found = findHeader(headers, fieldKey);
    return found ? row[found] : "";
  };

  const months = {};
  MONTH_KEYS.forEach((m) => {
    months[m] = normalizeAmount(get(m));
  });

  return {
    excelRowNumber,
    accountName: String(get("accountName") || "").trim(),
    accountNumber: String(get("accountNumber") || "").trim(),
    openingBalance: normalizeAmount(get("openingBalance")),
    months,
    classification: String(get("classification") || "").trim(),
    department: String(get("department") || "").trim(),
    notes: String(get("notes") || "").trim(),

    // Reserved for Milestone 4 Mapping. Do not expose to client yet.
    mappedCode: "",
    aggregateCode: "",
    contributionRule: "",
    aggregationSign: ""
  };
}

function buildWarnings(rows, missingHeaders) {
  const warnings = [];

  if (missingHeaders.length) {
    warnings.push({
      type: "error",
      message: `يوجد أعمدة مطلوبة مفقودة: ${missingHeaders.join("، ")}`
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
          message: `السطر ${row.excelRowNumber}: قيمة ${FIELD_LABELS_AR[m]} ليست رقماً واضحاً.`
        });
      }
    });

    if (!row.classification) {
      warnings.push({
        type: "warning",
        message: `السطر ${row.excelRowNumber}: الحساب غير مصنف بعد وسيحتاج ربطاً في شاشة Mapping.`
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
    missingBox.textContent = "أعمدة مطلوبة مفقودة: " + result.missingHeaders.join("، ");
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
    // Preview may be large. Not critical at Milestone 3.5.
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
