import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import {
  defaultSettings,
  defaultAbout,
  defaultServices,
  defaultCertificates,
  defaultTestimonials,
  SiteSettings,
  AboutData,
  ServiceItem,
  CertificateItem,
  TestimonialItem,
} from "./default-data";

// Document paths in Firestore
const DOC_SETTINGS = "content/settings";
const DOC_ABOUT = "content/about";
const DOC_SERVICES = "content/services";
const DOC_CERTIFICATES = "content/certificates";
const DOC_TESTIMONIALS = "content/testimonials";

// Safe fetchers with automatic default fallback
export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!db) return defaultSettings;
  try {
    const snap = await getDoc(doc(db, DOC_SETTINGS));
    if (snap.exists()) {
      return { ...defaultSettings, ...(snap.data() as SiteSettings) };
    }
  } catch (err) {
    console.warn("Using default settings due to Firestore error:", err);
  }
  return defaultSettings;
}

export async function saveSiteSettings(settings: SiteSettings): Promise<boolean> {
  if (!db) throw new Error("Firebase belum terhubung. Periksa konfigurasi Firebase Anda.");
  await setDoc(doc(db, DOC_SETTINGS), settings, { merge: true });
  return true;
}

export async function fetchAboutData(): Promise<AboutData> {
  if (!db) return defaultAbout;
  try {
    const snap = await getDoc(doc(db, DOC_ABOUT));
    if (snap.exists()) {
      return { ...defaultAbout, ...(snap.data() as AboutData) };
    }
  } catch (err) {
    console.warn("Using default about data due to Firestore error:", err);
  }
  return defaultAbout;
}

export async function saveAboutData(about: AboutData): Promise<boolean> {
  if (!db) throw new Error("Firebase belum terhubung. Periksa konfigurasi Firebase Anda.");
  await setDoc(doc(db, DOC_ABOUT), about, { merge: true });
  return true;
}

export async function fetchServices(): Promise<ServiceItem[]> {
  if (!db) return defaultServices;
  try {
    const snap = await getDoc(doc(db, DOC_SERVICES));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items as ServiceItem[];
      }
    }
  } catch (err) {
    console.warn("Using default services due to Firestore error:", err);
  }
  return defaultServices;
}

export async function saveServices(services: ServiceItem[]): Promise<boolean> {
  if (!db) throw new Error("Firebase belum terhubung. Periksa konfigurasi Firebase Anda.");
  await setDoc(doc(db, DOC_SERVICES), { items: services }, { merge: true });
  return true;
}

export async function fetchCertificates(): Promise<CertificateItem[]> {
  if (!db) return defaultCertificates;
  try {
    const snap = await getDoc(doc(db, DOC_CERTIFICATES));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items as CertificateItem[];
      }
    }
  } catch (err) {
    console.warn("Using default certificates due to Firestore error:", err);
  }
  return defaultCertificates;
}

export async function saveCertificates(certs: CertificateItem[]): Promise<boolean> {
  if (!db) throw new Error("Firebase belum terhubung. Periksa konfigurasi Firebase Anda.");
  await setDoc(doc(db, DOC_CERTIFICATES), { items: certs }, { merge: true });
  return true;
}

export async function fetchTestimonials(): Promise<TestimonialItem[]> {
  if (!db) return defaultTestimonials;
  try {
    const snap = await getDoc(doc(db, DOC_TESTIMONIALS));
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.items) && data.items.length > 0) {
        return data.items as TestimonialItem[];
      }
    }
  } catch (err) {
    console.warn("Using default testimonials due to Firestore error:", err);
  }
  return defaultTestimonials;
}

export async function saveTestimonials(items: TestimonialItem[]): Promise<boolean> {
  if (!db) throw new Error("Firebase belum terhubung. Periksa konfigurasi Firebase Anda.");
  await setDoc(doc(db, DOC_TESTIMONIALS), { items }, { merge: true });
  return true;
}

// Inisialisasi / Seed semua data default ke Firestore
export async function seedAllDefaultData(): Promise<{ success: boolean; message: string }> {
  if (!db) {
    return {
      success: false,
      message: "Firebase belum terhubung. Silakan masukkan konfigurasi Firebase terlebih dahulu.",
    };
  }

  try {
    await Promise.all([
      setDoc(doc(db, DOC_SETTINGS), defaultSettings),
      setDoc(doc(db, DOC_ABOUT), defaultAbout),
      setDoc(doc(db, DOC_SERVICES), { items: defaultServices }),
      setDoc(doc(db, DOC_CERTIFICATES), { items: defaultCertificates }),
      setDoc(doc(db, DOC_TESTIMONIALS), { items: defaultTestimonials }),
    ]);

    return {
      success: true,
      message: "Semua data awal default berhasil diunggah ke Firebase Firestore!",
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Gagal mengunggah data: ${err?.message || "Terjadi kesalahan"}`,
    };
  }
}
