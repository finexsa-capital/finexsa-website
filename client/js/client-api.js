// FINEXSA Client Portal — Firestore API wrapper
// Milestone 2: Companies + Fiscal Years

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./client-auth.js";
import { CLIENT_CONFIG } from "./client-config.js";

export async function listClientCompanies(ownerUid) {
  const col = collection(db, CLIENT_CONFIG.collections.clientCompanies);

  try {
    const q = query(
      col,
      where("ownerUid", "==", ownerUid),
      orderBy("createdAt", "desc")
    );
    return await readDocs(q);
  } catch (error) {
    console.warn("Companies query fallback:", error);
    const fallback = query(col, where("ownerUid", "==", ownerUid));
    const rows = await readDocs(fallback);
    return rows.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }
}

async function readDocs(q) {
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getClientCompany(companyId, ownerUid) {
  if (!companyId) throw new Error("معرّف الشركة مفقود.");

  const ref = doc(db, CLIENT_CONFIG.collections.clientCompanies, companyId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("لم يتم العثور على الشركة.");
  }

  const data = { id: snap.id, ...snap.data() };

  if (ownerUid && data.ownerUid !== ownerUid) {
    throw new Error("لا تملك صلاحية الوصول إلى هذه الشركة.");
  }

  return data;
}

export async function createClientCompany(ownerUid, payload) {
  const clean = {
    ownerUid,
    companyName: String(payload.companyName || "").trim(),
    country: String(payload.country || "Türkiye").trim(),
    baseCurrency: String(payload.baseCurrency || "USD").trim().toUpperCase(),
    businessType: String(payload.businessType || "").trim(),
    inventoryPolicy: String(payload.inventoryPolicy || "periodic").trim(),
    hasDepartments: Boolean(payload.hasDepartments),
    hasTarget: Boolean(payload.hasTarget),
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  if (!clean.companyName) {
    throw new Error("اسم الشركة مطلوب.");
  }

  const ref = await addDoc(collection(db, CLIENT_CONFIG.collections.clientCompanies), clean);
  return { id: ref.id, ...clean };
}

export async function listFiscalYears(companyId) {
  if (!companyId) throw new Error("معرّف الشركة مفقود.");

  const col = collection(
    db,
    CLIENT_CONFIG.collections.clientCompanies,
    companyId,
    "fiscal_years"
  );

  try {
    const q = query(col, orderBy("createdAt", "desc"));
    return await readDocs(q);
  } catch (error) {
    console.warn("Fiscal years query fallback:", error);
    return await readDocs(col);
  }
}


export async function getFiscalYear(companyId, fiscalYearId) {
  if (!companyId) throw new Error("معرّف الشركة مفقود.");
  if (!fiscalYearId) throw new Error("معرّف السنة المالية مفقود.");

  const ref = doc(
    db,
    CLIENT_CONFIG.collections.clientCompanies,
    companyId,
    "fiscal_years",
    fiscalYearId
  );

  const snap = await getDoc(ref);

  if (!snap.exists()) {
    throw new Error("لم يتم العثور على السنة المالية.");
  }

  return { id: snap.id, ...snap.data() };
}

export async function createFiscalYear(companyId, payload) {
  if (!companyId) throw new Error("معرّف الشركة مفقود.");

  const yearName = String(payload.yearName || "").trim();
  const startDate = String(payload.startDate || "").trim();
  const endDate = String(payload.endDate || "").trim();

  if (!yearName) throw new Error("اسم السنة المالية مطلوب.");
  if (!startDate) throw new Error("تاريخ بداية السنة مطلوب.");
  if (!endDate) throw new Error("تاريخ نهاية السنة مطلوب.");

  const clean = {
    yearName,
    startDate,
    endDate,
    status: String(payload.status || "draft").trim(),
    openingSource: String(payload.openingSource || "manual").trim(),
    allMonthsActive: payload.allMonthsActive !== false,
    notes: String(payload.notes || "").trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const ref = await addDoc(
    collection(db, CLIENT_CONFIG.collections.clientCompanies, companyId, "fiscal_years"),
    clean
  );

  return { id: ref.id, ...clean };
}
