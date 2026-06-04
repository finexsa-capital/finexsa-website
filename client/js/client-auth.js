// FINEXSA Client Portal — Firebase auth/session layer

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { CLIENT_CONFIG } from "./client-config.js";

const app = initializeApp(CLIENT_CONFIG.firebase);
export const auth = getAuth(app);
export const db = getFirestore(app);

export async function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  await signOut(auth);
  window.location.href = CLIENT_CONFIG.routes.login;
}

export async function getClientProfile(uid) {
  const ref = doc(db, CLIENT_CONFIG.collections.users, uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { uid, ...snap.data() };
}

export function profileDisplayName(profile, user) {
  return (
    profile?.companyName ||
    profile?.displayName ||
    profile?.name ||
    user?.displayName ||
    user?.email ||
    "عميل FINEXSA"
  );
}

export function requireClientAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      window.location.href = CLIENT_CONFIG.routes.login;
      return;
    }

    try {
      const profile = await getClientProfile(user.uid);

      if (!profile) {
        await signOut(auth);
        window.location.href = `${CLIENT_CONFIG.routes.login}?error=no-profile`;
        return;
      }

      if (profile.active === false) {
        await signOut(auth);
        window.location.href = `${CLIENT_CONFIG.routes.login}?error=inactive`;
        return;
      }

      try {
        await updateDoc(doc(db, CLIENT_CONFIG.collections.users, user.uid), {
          lastLoginAt: serverTimestamp()
        });
      } catch (_) {
        // لا نوقف الدخول إذا فشل تحديث آخر دخول بسبب صلاحيات Firestore.
      }

      callback({ user, profile });
    } catch (error) {
      console.error("Client auth error:", error);
      await signOut(auth);
      window.location.href = `${CLIENT_CONFIG.routes.login}?error=auth`;
    }
  });
}

export function redirectIfLoggedIn() {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    try {
      const profile = await getClientProfile(user.uid);
      if (profile && profile.active !== false) {
        window.location.href = CLIENT_CONFIG.routes.dashboard;
      }
    } catch (_) {
      // نبقى بصفحة الدخول إذا لم نستطع قراءة الملف.
    }
  });
}

export function translateAuthError(error) {
  const code = error?.code || "";
  if (code === "auth/invalid-credential") return "بيانات الدخول غير صحيحة.";
  if (code === "auth/user-not-found") return "هذا الحساب غير موجود.";
  if (code === "auth/wrong-password") return "كلمة المرور غير صحيحة.";
  if (code === "auth/too-many-requests") return "محاولات كثيرة. حاول لاحقاً.";
  if (code === "auth/invalid-email") return "صيغة البريد الإلكتروني غير صحيحة.";
  if (code === "auth/network-request-failed") return "تعذر الاتصال. تحقق من الإنترنت.";
  return "تعذر تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.";
}
