// FINEXSA Client Portal — Firestore API wrapper for Milestone 1

import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { db } from "./client-auth.js";
import { CLIENT_CONFIG } from "./client-config.js";

export async function listClientCompanies(ownerUid) {
  const col = collection(db, CLIENT_CONFIG.collections.clientCompanies);

  // ملاحظة: إذا احتاج Firestore Index بسبب orderBy، نستعمل fallback بدون ترتيب.
  try {
    const q = query(
      col,
      where("ownerUid", "==", ownerUid),
      orderBy("createdAt", "desc")
    );
    return await readCompanies(q);
  } catch (error) {
    console.warn("Companies query fallback:", error);
    const fallback = query(col, where("ownerUid", "==", ownerUid));
    const rows = await readCompanies(fallback);
    return rows.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }
}

async function readCompanies(q) {
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
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
