"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  User,
  Award,
  MessageSquare,
  Settings,
  Database,
  RefreshCw,
  Copy,
  Check,
  ChevronRight,
  Info,
  Upload,
  LocateFixed,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LogOut,
} from "lucide-react";
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
  getMapEmbedUrl,
  getMapDirectLink,
} from "@/lib/default-data";
import {
  fetchSiteSettings,
  saveSiteSettings,
  fetchAboutData,
  saveAboutData,
  fetchServices,
  saveServices,
  fetchCertificates,
  saveCertificates,
  fetchTestimonials,
  saveTestimonials,
  seedAllDefaultData,
} from "@/lib/cms-service";
import { isFirebaseReady, auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "services" | "about" | "certificates" | "testimonials" | "settings"
  >("services");

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        setIsAuthenticated(!!data.authenticated);
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkSession();
  }, []);

  // State data
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [about, setAbout] = useState<AboutData>(defaultAbout);
  const [services, setServices] = useState<ServiceItem[]>(defaultServices);
  const [certs, setCerts] = useState<CertificateItem[]>(defaultCertificates);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>(defaultTestimonials);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // Form tambah layanan baru
  const [newService, setNewService] = useState<ServiceItem>({
    title: "",
    desc: "",
    image: "",
    badge: "Klinik & Home Care",
  });
  const [showAddService, setShowAddService] = useState(false);

  // Form tambah sertifikat baru
  const [newCert, setNewCert] = useState<CertificateItem>({
    title: "",
    category: "Legalitas Resmi",
    issuer: "",
    noReg: "",
    validity: "Terdaftar Resmi",
    desc: "",
    img: "",
    badge: "Resmi",
  });
  const [showAddCert, setShowAddCert] = useState(false);

  // Form tambah testimoni baru
  const [newTestimonial, setNewTestimonial] = useState<TestimonialItem>({
    name: "",
    role: "Keluarga Pasien",
    rating: 5,
    service: "Layanan Medis",
    review: "",
    date: "November 2026",
  });
  const [showAddTestimonial, setShowAddTestimonial] = useState(false);

  // Akumulasi Rating Otomatis Realtime seperti Shopee
  const adminTotalReviews = testimonials.length;
  const adminAvgRating =
    adminTotalReviews > 0
      ? testimonials.reduce((acc, curr) => acc + (Number(curr.rating) || 5), 0) /
        adminTotalReviews
      : 5.0;
  const adminFormattedRating = (Math.round(adminAvgRating * 10) / 10).toFixed(1);

  useEffect(() => {
    // Load CMS data
    Promise.all([
      fetchSiteSettings(),
      fetchAboutData(),
      fetchServices(),
      fetchCertificates(),
      fetchTestimonials(),
    ])
      .then(([s, a, serv, c, t]) => {
        setSettings(s);
        setAbout(a);
        setServices(serv);
        setCerts(c);
        if (t && t.length < defaultTestimonials.length) {
          const existingNames = new Set(t.map((item) => item.name.toLowerCase()));
          const additions = defaultTestimonials.filter(
            (item) => !existingNames.has(item.name.toLowerCase())
          );
          setTestimonials([...t, ...additions]);
        } else {
          setTestimonials(t);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4500);
  };

  // Helper: Kompresi gambar client-side & konversi ke Base64 (max dimensi 900px, kualitas JPEG 82%)
  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!file.type.startsWith("image/")) {
        reject(new Error("File yang dipilih harus berupa gambar (JPG, PNG, WebP)!"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        const img = new window.Image();
        img.onload = () => {
          const maxDim = 900;
          let width = img.width;
          let height = img.height;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(readerEvent.target?.result as string);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error("Gagal membaca file gambar."));
        img.src = readerEvent.target?.result as string;
      };
      reader.onerror = () => reject(new Error("Gagal mengunggah file."));
      reader.readAsDataURL(file);
    });
  };

  // Auth Handlers (Server-Side Verification & HttpOnly Session)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Otomatis sinkronkan juga ke Firebase Auth jika aktif di Firebase Console
        if (auth) {
          try {
            const adminEmail = loginUsername.includes("@")
              ? loginUsername.trim()
              : `${loginUsername.trim()}@homecareku.com`;
            await signInWithEmailAndPassword(auth, adminEmail, loginPassword.trim());
          } catch {
            // Jika belum diaktifkan di Firebase Console, dashboard tetap bisa diakses melalui Next.js server session
          }
        }

        setIsAuthenticated(true);
        setIsLoggingIn(false);
        showToast("success", "Selamat datang, Admin! Berhasil masuk ke dashboard.");
      } else {
        setIsLoggingIn(false);
        setLoginError(data.error || "Username atau password yang Anda masukkan salah.");
      }
    } catch {
      setIsLoggingIn(false);
      setLoginError("Gagal menghubungi server. Periksa koneksi internet Anda.");
    }
  };

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar dari Dashboard Admin?")) {
      try {
        await fetch("/api/auth/logout", { method: "POST" });
        if (auth) {
          await signOut(auth);
        }
      } catch {}
      setIsAuthenticated(false);
      setLoginUsername("");
      setLoginPassword("");
      setLoginError("");
      showToast("info", "Anda telah keluar dari Dashboard Admin.");
    }
  };

  // Handlers untuk simpan
  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSiteSettings(settings);
      showToast("success", "Pengaturan kontak, jam buka, dan alamat berhasil disimpan!");
    } catch (err: any) {
      showToast("error", err?.message || "Gagal menyimpan pengaturan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDetectGPS = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      showToast("error", "Browser Anda tidak mendukung fitur deteksi lokasi GPS.");
      return;
    }
    showToast("info", "Mendeteksi titik koordinat lokasi klinik Anda...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lng = pos.coords.longitude.toFixed(6);
        const coords = `${lat}, ${lng}`;
        setSettings({
          ...settings,
          mapsEmbed: coords,
          mapsUrl: `https://www.google.com/maps?q=${lat},${lng}`,
        });
        showToast("success", `Titik lokasi terdeteksi (${coords})! Klik Simpan Perubahan.`);
      },
      (err) => {
        showToast("error", `Gagal mendeteksi GPS: ${err.message}. Pastikan izin lokasi browser diizinkan.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSaveAbout = async () => {
    setIsSaving(true);
    try {
      await saveAboutData(about);
      showToast("success", "Data profil perawat & Tentang Kami berhasil disimpan!");
    } catch (err: any) {
      showToast("error", err?.message || "Gagal menyimpan data tentang kami.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveServices = async (updatedList = services) => {
    setIsSaving(true);
    try {
      await saveServices(updatedList);
      showToast("success", "Daftar layanan medis berhasil diperbarui ke database!");
    } catch (err: any) {
      showToast("error", err?.message || "Gagal menyimpan layanan.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = async () => {
    if (!newService.title.trim()) {
      showToast("error", "Judul layanan wajib diisi!");
      return;
    }
    const updated = [
      ...services,
      {
        ...newService,
        image:
          newService.image.trim() ||
          "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=75",
      },
    ];
    setServices(updated);
    setNewService({ title: "", desc: "", image: "", badge: "Klinik & Home Care" });
    setShowAddService(false);
    await handleSaveServices(updated);
  };

  const handleDeleteService = async (index: number) => {
    if (confirm(`Yakin ingin menghapus layanan "${services[index]?.title}"?`)) {
      const updated = services.filter((_, i) => i !== index);
      setServices(updated);
      await handleSaveServices(updated);
    }
  };

  const handleSaveCertificates = async (updatedList = certs) => {
    setIsSaving(true);
    try {
      await saveCertificates(updatedList);
      showToast("success", "Data sertifikasi & legalitas berhasil diperbarui!");
    } catch (err: any) {
      showToast("error", err?.message || "Gagal menyimpan sertifikat.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCert = async () => {
    if (!newCert.title.trim()) {
      showToast("error", "Judul sertifikat wajib diisi!");
      return;
    }
    const updated = [
      ...certs,
      {
        ...newCert,
        img:
          newCert.img.trim() ||
          "https://images.unsplash.com/photo-1589330694653-dad6bc0140fa?w=1000&q=85",
      },
    ];
    setCerts(updated);
    setNewCert({
      title: "",
      category: "Legalitas Resmi",
      issuer: "",
      noReg: "",
      validity: "Terdaftar Resmi",
      desc: "",
      img: "",
      badge: "Resmi",
    });
    setShowAddCert(false);
    await handleSaveCertificates(updated);
  };

  const handleDeleteCert = async (index: number) => {
    if (confirm(`Hapus sertifikat "${certs[index]?.title}"?`)) {
      const updated = certs.filter((_, i) => i !== index);
      setCerts(updated);
      await handleSaveCertificates(updated);
    }
  };

  const handleSaveTestimonials = async (updatedList = testimonials) => {
    setIsSaving(true);
    try {
      await saveTestimonials(updatedList);
      showToast("success", "Daftar testimoni pasien berhasil diperbarui!");
    } catch (err: any) {
      showToast("error", err?.message || "Gagal menyimpan testimoni.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTestimonial = async () => {
    if (!newTestimonial.name.trim() || !newTestimonial.review.trim()) {
      showToast("error", "Nama pasien dan ulasan wajib diisi!");
      return;
    }
    const updated = [newTestimonial, ...testimonials];
    setTestimonials(updated);
    setNewTestimonial({
      name: "",
      role: "Keluarga Pasien",
      rating: 5,
      service: "Layanan Medis",
      review: "",
      date: "November 2026",
    });
    setShowAddTestimonial(false);
    await handleSaveTestimonials(updated);
  };

  const handleDeleteTestimonial = async (index: number) => {
    if (confirm(`Hapus ulasan dari "${testimonials[index]?.name}"?`)) {
      const updated = testimonials.filter((_, i) => i !== index);
      setTestimonials(updated);
      await handleSaveTestimonials(updated);
    }
  };

  const handleSeedData = async () => {
    if (
      confirm(
        "Apakah Anda yakin ingin mengunggah semua data awal default (Layanan, Profil Perawat, Sertifikat, Kontak) ke Firebase Firestore sekarang?"
      )
    ) {
      setIsSaving(true);
      const res = await seedAllDefaultData();
      setIsSaving(false);
      if (res.success) {
        showToast("success", res.message);
        // reload
        const [s, a, serv, c, t] = await Promise.all([
          fetchSiteSettings(),
          fetchAboutData(),
          fetchServices(),
          fetchCertificates(),
          fetchTestimonials(),
        ]);
        setSettings(s);
        setAbout(a);
        setServices(serv);
        setCerts(c);
        setTestimonials(t);
      } else {
        showToast("error", res.message);
      }
    }
  };

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-10 h-10 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mb-4" />
        <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase animate-pulse">
          Memuat Sistem Admin...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
        {/* Decorative Background Glows */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full relative z-10">
          {/* Brand Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-teal-500/10 border border-teal-500/30 mb-3 shadow-lg shadow-teal-500/10">
              <ShieldCheck className="w-9 h-9 text-teal-400" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Homecareku Admin
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Portal Manajemen Konten &amp; Layanan Medis Klinik
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-bold text-white mb-1">Masuk ke Dashboard</h2>
            <p className="text-xs text-slate-400 mb-6">
              Silakan masukkan kredensial untuk mengakses menu admin.
            </p>

            {loginError && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Masukkan username"
                    value={loginUsername}
                    onChange={(e) => {
                      setLoginUsername(e.target.value);
                      if (loginError) setLoginError("");
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Masukkan password"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value);
                      if (loginError) setLoginError("");
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                    title={showPassword ? "Sembunyikan password" : "Lihat password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-700/20 cursor-pointer"
              >
                {isLoggingIn ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Memverifikasi Akun...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk ke Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Back to Visitor Site */}
          <div className="text-center mt-6">
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-400 hover:text-teal-300 transition-colors inline-flex items-center gap-1.5"
            >
              <span>← Kembali ke Web Pengunjung (Port 3000)</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Homecareku" width={36} height={36} className="w-9 h-9 object-contain shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">Homecareku</span>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-400 font-bold text-[10px] tracking-wider uppercase border border-teal-500/30">
                  Admin Panel
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Dashboard Manajemen Konten &amp; Database Klinik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Firebase Status Pill */}
            <div
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                isFirebaseReady
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isFirebaseReady ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                }`}
              />
              <span>{isFirebaseReady ? "Firebase Terhubung" : "Mode Standar (Lokal)"}</span>
            </div>

            {/* Inisialisasi Data Default */}
            <button
              onClick={handleSeedData}
              disabled={isSaving}
              className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              title="Upload semua data awal sekarang ke Firebase Firestore"
            >
              <Database className="w-3.5 h-3.5 text-teal-400" />
              <span>Upload Data Default ke DB</span>
            </button>

            {/* Back to Website */}
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-700/30"
            >
              <span>Lihat Website (Port 3000)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all cursor-pointer"
              title="Keluar dari akun admin"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Feedback Toast Notification */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-semibold ${
              feedback.type === "success"
                ? "bg-emerald-950 border-emerald-500 text-emerald-200"
                : feedback.type === "error"
                ? "bg-rose-950 border-rose-500 text-rose-200"
                : "bg-blue-950 border-blue-500 text-blue-200"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : feedback.type === "error" ? (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav Tabs */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-3 sticky top-24 space-y-1">
            <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Menu Pengaturan
            </p>
            {[
              { id: "services", label: "Layanan Medis", icon: <Layers className="w-4 h-4" />, count: services.length },
              { id: "about", label: "Profil & Tentang Kami", icon: <User className="w-4 h-4" /> },
              { id: "certificates", label: "Sertifikasi & Legalitas", icon: <Award className="w-4 h-4" />, count: certs.length },
              { id: "testimonials", label: "Testimoni Pasien", icon: <MessageSquare className="w-4 h-4" />, count: testimonials.length },
              { id: "settings", label: "Kontak & Jam Buka", icon: <Settings className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                  activeTab === tab.id
                    ? "bg-teal-600 text-white shadow-lg shadow-teal-700/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                {tab.count !== undefined && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      activeTab === tab.id ? "bg-teal-800 text-white" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}

            <div className="pt-4 mt-4 border-t border-slate-800/80 px-3">
              <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
                Semua perubahan akan langsung tampil di website utama saat disimpan.
              </p>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar (Logout)</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* ============================================================== */}
          {/* TAB 1: LAYANAN MEDIS */}
          {/* ============================================================== */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-teal-400" />
                    Kelola Layanan Medis
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Ubah foto, judul, deskripsi, badge, atau tambahkan jenis tindakan baru.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddService(!showAddService)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Layanan</span>
                  </button>
                  <button
                    onClick={() => handleSaveServices()}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>{isSaving ? "Menyimpan..." : "Simpan Semua"}</span>
                  </button>
                </div>
              </div>

              {/* Form Tambah Layanan Baru */}
              {showAddService && (
                <div className="bg-slate-950/90 border border-teal-500/40 p-6 rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tambah Layanan Medis Baru
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Nama / Judul Tindakan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Fisioterapi Pasca Stroke"
                        value={newService.title}
                        onChange={(e) => setNewService({ ...newService, title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Badge Lokasi
                      </label>
                      <input
                        type="text"
                        placeholder="Klinik & Home Care / Klinik / Home Care"
                        value={newService.badge}
                        onChange={(e) => setNewService({ ...newService, badge: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                      Foto / Gambar Layanan
                    </label>
                    <label className="flex items-center justify-center gap-2 py-2 px-3 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl cursor-pointer text-xs font-semibold transition-all mb-2">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih Foto dari Komputer</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              const base64 = await processImageFile(file);
                              setNewService({ ...newService, image: base64 });
                              showToast("success", "Foto layanan berhasil dipilih!");
                            } catch (err: any) {
                              showToast("error", err.message || "Gagal memproses gambar");
                            }
                          }
                        }}
                      />
                    </label>
                    <input
                      type="text"
                      placeholder="Atau tempel URL gambar (https://...)"
                      value={newService.image}
                      onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Deskripsi Layanan Singkat
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Penjelasan ringkas mengenai prosedur tindakan dan keamanannya..."
                      value={newService.desc}
                      onChange={(e) => setNewService({ ...newService, desc: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddService(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleAddService}
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                    >
                      Tambahkan ke Layanan
                    </button>
                  </div>
                </div>
              )}

              {/* Grid Layanan yang Sudah Ada */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {services.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between group hover:border-slate-700 transition-all shadow-md"
                  >
                    <div className="space-y-3.5">
                      {/* Image Preview & URL input */}
                      <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&q=75";
                          }}
                        />
                        <div className="absolute top-2.5 right-2.5 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-teal-300 border border-teal-500/30">
                          {item.badge}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Judul Layanan #{idx + 1}
                          </label>
                          <button
                            onClick={() => handleDeleteService(idx)}
                            className="text-rose-400 hover:text-rose-300 p-1 rounded-lg hover:bg-rose-950/40 text-xs inline-flex items-center gap-1 transition-colors"
                            title="Hapus layanan ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => {
                            const updated = [...services];
                            updated[idx].title = e.target.value;
                            setServices(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase">
                            Badge Kategori
                          </label>
                          <input
                            type="text"
                            value={item.badge}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[idx].badge = e.target.value;
                              setServices(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">
                              Foto Layanan
                            </label>
                            <label className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-400 hover:text-teal-300 cursor-pointer">
                              <Upload className="w-3 h-3" />
                              <span>Ganti Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const base64 = await processImageFile(file);
                                      const updated = [...services];
                                      updated[idx].image = base64;
                                      setServices(updated);
                                      showToast("success", "Foto layanan berhasil diperbarui!");
                                    } catch (err: any) {
                                      showToast("error", err.message || "Gagal memproses gambar");
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            placeholder="URL atau pilih foto..."
                            value={item.image}
                            onChange={(e) => {
                              const updated = [...services];
                              updated[idx].image = e.target.value;
                              setServices(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">
                          Deskripsi
                        </label>
                        <textarea
                          rows={2}
                          value={item.desc}
                          onChange={(e) => {
                            const updated = [...services];
                            updated[idx].desc = e.target.value;
                            setServices(updated);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: PROFIL PERAWAT & TENTANG KAMI */}
          {/* ============================================================== */}
          {activeTab === "about" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <User className="w-5 h-5 text-teal-400" />
                    Profil Tenaga Medis (Tentang Kami)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Atur foto perawat, nama, peran, pengalaman tahun, headline, bio, dan kualifikasi.
                  </p>
                </div>
                <button
                  onClick={handleSaveAbout}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-700/30"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Profil"}</span>
                </button>
              </div>

              {/* Layout Mirroring Halaman Depan */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800">
                {/* Kolom Kiri: Foto Perawat & Badges (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Foto &amp; Identitas Visual Perawat
                  </h3>

                  <div className="relative rounded-3xl overflow-hidden border-4 border-slate-800 bg-slate-900 aspect-[3/4] max-w-sm mx-auto shadow-2xl">
                    <img
                      src={about.nursePhoto}
                      alt={about.nurseName}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="font-black text-base leading-tight">{about.nurseName}</p>
                      <p className="text-[11px] text-slate-300">{about.nurseRole}</p>
                    </div>
                  </div>

                  <div className="space-y-3 max-w-sm mx-auto">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-400">
                          Foto Profil Perawat
                        </label>
                        <span className="text-[10px] text-teal-400">JPG/PNG/WebP</span>
                      </div>
                      <label className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 rounded-xl cursor-pointer text-xs font-semibold transition-all mb-2">
                        <Upload className="w-4 h-4" />
                        <span>Pilih &amp; Upload Foto dari Komputer</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const base64 = await processImageFile(file);
                                setAbout({ ...about, nursePhoto: base64 });
                                showToast("success", "Foto profil berhasil dimuat! Jangan lupa klik Simpan.");
                              } catch (err: any) {
                                showToast("error", err.message || "Gagal upload foto");
                              }
                            }
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Atau masukkan URL foto (https://...)"
                        value={about.nursePhoto}
                        onChange={(e) => setAbout({ ...about, nursePhoto: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Pasien Dilayani
                        </label>
                        <input
                          type="number"
                          placeholder="500"
                          value={about.patientCount ?? 500}
                          onChange={(e) =>
                            setAbout({ ...about, patientCount: Number(e.target.value) || 0 })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-bold text-teal-300"
                        />
                        <span className="text-[10px] text-slate-500">Tampil: {about.patientCount ?? 500}+</span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Tahun Pengalaman
                        </label>
                        <input
                          type="number"
                          placeholder="4"
                          value={about.experienceYears}
                          onChange={(e) =>
                            setAbout({ ...about, experienceYears: Number(e.target.value) || 0 })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-bold text-teal-300"
                        />
                        <span className="text-[10px] text-slate-500">Tampil: {about.experienceYears}+ Thn</span>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Teks Badge Legalitas
                        </label>
                        <input
                          type="text"
                          value={about.legalBadge}
                          onChange={(e) => setAbout({ ...about, legalBadge: e.target.value })}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
                        <span className="text-[10px] text-slate-500">Badge foto</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan: Narasi Profil & Kualifikasi (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Narasi Profil &amp; Kualifikasi
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Nama Lengkap &amp; Gelar Perawat
                      </label>
                      <input
                        type="text"
                        value={about.nurseName}
                        onChange={(e) => setAbout({ ...about, nurseName: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Peran / Jabatan Klinis
                      </label>
                      <input
                        type="text"
                        value={about.nurseRole}
                        onChange={(e) => setAbout({ ...about, nurseRole: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Judul Headline Tentang Kami
                    </label>
                    <textarea
                      rows={2}
                      value={about.headline}
                      onChange={(e) => setAbout({ ...about, headline: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Paragraf Bio / Perkenalan
                    </label>
                    <textarea
                      rows={4}
                      value={about.bio}
                      onChange={(e) => setAbout({ ...about, bio: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* 4 Pilar Checklist */}
                  <div className="space-y-2 pt-2">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                      4 Pilar Kompetensi &amp; Kualifikasi
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {about.checklist.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-1.5"
                        >
                          <input
                            type="text"
                            placeholder="Judul Kualifikasi"
                            value={item.title}
                            onChange={(e) => {
                              const updated = [...about.checklist];
                              updated[idx].title = e.target.value;
                              setAbout({ ...about, checklist: updated });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs font-bold text-white focus:outline-none focus:border-teal-500"
                          />
                          <input
                            type="text"
                            placeholder="Deskripsi singkat"
                            value={item.desc}
                            onChange={(e) => {
                              const updated = [...about.checklist];
                              updated[idx].desc = e.target.value;
                              setAbout({ ...about, checklist: updated });
                            }}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-300 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Kutipan / Filosofi Pelayanan (Quote)
                    </label>
                    <textarea
                      rows={2}
                      value={about.quote}
                      onChange={(e) => setAbout({ ...about, quote: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs italic text-teal-300 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: SERTIFIKASI & LEGALITAS RESMI */}
          {/* ============================================================== */}
          {activeTab === "certificates" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Award className="w-5 h-5 text-teal-400" />
                    Kelola Sertifikasi &amp; Dokumen Legalitas
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Ubah dokumen STR, SIPP, sertifikat wound care, nomor registrasi, atau tambah sertifikat baru.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddCert(!showAddCert)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tambah Sertifikat</span>
                  </button>
                  <button
                    onClick={() => handleSaveCertificates()}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>{isSaving ? "Menyimpan..." : "Simpan Semua"}</span>
                  </button>
                </div>
              </div>

              {/* Form Tambah Sertifikat Baru */}
              {showAddCert && (
                <div className="bg-slate-950 border border-teal-500/40 p-6 rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tambah Sertifikat / Legalitas Baru
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Nama Dokumen / Sertifikat
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Sertifikat Phlebotomy Klinis"
                        value={newCert.title}
                        onChange={(e) => setNewCert({ ...newCert, title: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Kategori Sertifikat
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Keahlian Klinis Khusus"
                        value={newCert.category}
                        onChange={(e) => setNewCert({ ...newCert, category: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Lembaga Penerbit
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Kemenkes RI / PPNI"
                        value={newCert.issuer}
                        onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Nomor Registrasi / Izin
                      </label>
                      <input
                        type="text"
                        placeholder="No: 14 01 5 2 1..."
                        value={newCert.noReg}
                        onChange={(e) => setNewCert({ ...newCert, noReg: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Status / Masa Berlaku
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Terdaftar Resmi Seumur Hidup"
                        value={newCert.validity}
                        onChange={(e) => setNewCert({ ...newCert, validity: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold text-slate-400">
                          Foto / Dokumen Sertifikat
                        </label>
                      </div>
                      <label className="flex items-center justify-center gap-1.5 py-2 px-3 bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/30 rounded-xl cursor-pointer text-xs font-semibold transition-all mb-1.5">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload dari Komputer</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const base64 = await processImageFile(file);
                                setNewCert({ ...newCert, img: base64 });
                                showToast("success", "Foto sertifikat berhasil diunggah!");
                              } catch (err: any) {
                                showToast("error", err.message || "Gagal memproses gambar");
                              }
                            }
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        placeholder="Atau tempel URL gambar..."
                        value={newCert.img}
                        onChange={(e) => setNewCert({ ...newCert, img: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Badge Instansi
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Kemenkes RI / Dinkes"
                        value={newCert.badge}
                        onChange={(e) => setNewCert({ ...newCert, badge: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Deskripsi / Bukti Legalitas
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Penjelasan hukum / keabsahan sertifikat..."
                      value={newCert.desc}
                      onChange={(e) => setNewCert({ ...newCert, desc: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddCert(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleAddCert}
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                    >
                      Tambahkan Sertifikat
                    </button>
                  </div>
                </div>
              )}

              {/* Grid Sertifikat yang Ada */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {certs.map((c, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-3xl p-5 flex flex-col justify-between shadow-md space-y-4"
                  >
                    <div className="space-y-3">
                      {/* Preview Image */}
                      <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                        <img
                          src={c.img}
                          alt={c.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1589330694653-dad6bc0140fa?w=1000&q=85";
                          }}
                        />
                        <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-teal-300">
                          {c.badge}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                          Sertifikat #{idx + 1}
                        </label>
                        <button
                          onClick={() => handleDeleteCert(idx)}
                          className="text-rose-400 hover:text-rose-300 text-xs inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-slate-400">Judul Dokumen</label>
                          <input
                            type="text"
                            value={c.title}
                            onChange={(e) => {
                              const updated = [...certs];
                              updated[idx].title = e.target.value;
                              setCerts(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Lembaga Penerbit</label>
                          <input
                            type="text"
                            value={c.issuer}
                            onChange={(e) => {
                              const updated = [...certs];
                              updated[idx].issuer = e.target.value;
                              setCerts(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Nomor Registrasi</label>
                          <input
                            type="text"
                            value={c.noReg}
                            onChange={(e) => {
                              const updated = [...certs];
                              updated[idx].noReg = e.target.value;
                              setCerts(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-[10px] text-slate-400">Foto Dokumen</label>
                            <label className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-400 hover:text-teal-300 cursor-pointer">
                              <Upload className="w-3 h-3" />
                              <span>Ganti Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const base64 = await processImageFile(file);
                                      const updated = [...certs];
                                      updated[idx].img = base64;
                                      setCerts(updated);
                                      showToast("success", "Foto sertifikat berhasil diperbarui!");
                                    } catch (err: any) {
                                      showToast("error", err.message || "Gagal memproses gambar");
                                    }
                                  }
                                }}
                              />
                            </label>
                          </div>
                          <input
                            type="text"
                            placeholder="URL atau pilih foto..."
                            value={c.img}
                            onChange={(e) => {
                              const updated = [...certs];
                              updated[idx].img = e.target.value;
                              setCerts(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Deskripsi Bukti</label>
                          <textarea
                            rows={2}
                            value={c.desc}
                            onChange={(e) => {
                              const updated = [...certs];
                              updated[idx].desc = e.target.value;
                              setCerts(updated);
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: TESTIMONI PASIEN */}
          {/* ============================================================== */}
          {activeTab === "testimonials" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-teal-400" />
                    Kelola Testimoni Pasien
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Masukkan testimoni nyata dari chat WA pasien agar tampil berjalan di halaman depan.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddTestimonial(!showAddTestimonial)}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tulis Testimoni Baru</span>
                  </button>
                  <button
                    onClick={() => handleSaveTestimonials()}
                    disabled={isSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-all"
                  >
                    <Save className="w-4 h-4 text-emerald-400" />
                    <span>{isSaving ? "Menyimpan..." : "Simpan Semua"}</span>
                  </button>
                </div>
              </div>

              {/* Shopee-style Rating Summary Banner */}
              <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-3xl p-5 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-2xl shadow-inner">
                    {adminFormattedRating}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= Math.round(adminAvgRating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-700 fill-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-bold text-amber-300">
                        {adminFormattedRating} dari 5.0 Bintang
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Akumulasi otomatis dari <strong className="text-white">{adminTotalReviews} ulasan</strong> pasien (diakumulasi otomatis seperti Shopee dan tampil di bar statistik web pengunjung).
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Akumulasi Otomatis Aktif</span>
                  </span>
                </div>
              </div>

              {/* Form Tambah Testimoni Baru */}
              {showAddTestimonial && (
                <div className="bg-slate-950 border border-teal-500/40 p-6 rounded-3xl space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Tulis Testimoni Pasien Baru (dari WhatsApp)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Nama Pasien / Keluarga
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Ibu Siti Rahmawati"
                        value={newTestimonial.name}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, name: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Status / Peran Pasien
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Pasien Rutin Bekam / Keluarga Pasien"
                        value={newTestimonial.role}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, role: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Layanan yang Digunakan
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: Home Care Luka Diabetes"
                        value={newTestimonial.service}
                        onChange={(e) => setNewTestimonial({ ...newTestimonial, service: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Rating Kepuasan (1 - 5 Bintang)
                    </label>
                    <select
                      value={newTestimonial.rating}
                      onChange={(e) =>
                        setNewTestimonial({ ...newTestimonial, rating: Number(e.target.value) || 5 })
                      }
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5 Bintang - Sangat Puas)</option>
                      <option value={4}>⭐⭐⭐⭐ (4 Bintang - Puas)</option>
                      <option value={3}>⭐⭐⭐ (3 Bintang - Cukup)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Isi Testimoni / Pesan WA Pasien
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Tuliskan pengalaman nyata pasien setelah mendapatkan perawatan..."
                      value={newTestimonial.review}
                      onChange={(e) => setNewTestimonial({ ...newTestimonial, review: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowAddTestimonial(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleAddTestimonial}
                      className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold"
                    >
                      Tambahkan Testimoni
                    </button>
                  </div>
                </div>
              )}

              {/* Daftar Testimoni */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {testimonials.map((t, idx) => {
                  const initials =
                    t.name
                      .replace(/^(Bpk\.|Ibu|dr\.|Ns\.|H\.|Hj\.)\s*/i, "")
                      .trim()
                      .split(/\s+/)
                      .slice(0, 2)
                      .map((s) => s[0])
                      .join("")
                      .toUpperCase() || "PS";
                  const gradients = [
                    "from-blue-600 to-indigo-600",
                    "from-rose-500 to-pink-600",
                    "from-purple-600 to-indigo-600",
                    "from-amber-500 to-orange-600",
                    "from-emerald-500 to-teal-600",
                    "from-sky-500 to-blue-600",
                    "from-orange-500 to-red-500",
                    "from-cyan-500 to-teal-600",
                    "from-fuchsia-500 to-purple-600",
                    "from-indigo-600 to-violet-600",
                  ];
                  const grad = gradients[idx % gradients.length];
                  return (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-full bg-gradient-to-tr ${grad} text-white font-extrabold text-[10px] flex items-center justify-center flex-shrink-0 border border-white/20`}
                          >
                            {initials}
                          </div>
                          <span className="font-bold text-sm text-white">{t.name}</span>
                          {t.service && (
                            <span className="text-[10px] font-bold text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full">
                              {t.service}
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteTestimonial(idx)}
                          className="text-rose-400 hover:text-rose-300 text-xs inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < (t.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-700 fill-slate-800"
                          }`}
                        />
                      ))}
                      <span className="text-[11px] text-slate-500 ml-1.5">{t.role}</span>
                    </div>

                    <textarea
                      rows={2}
                      value={t.review}
                      onChange={(e) => {
                        const updated = [...testimonials];
                        updated[idx].review = e.target.value;
                        setTestimonials(updated);
                      }}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs italic text-slate-300 focus:outline-none focus:border-teal-500"
                    />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: KONTAK, JAM BUKA & PENGATURAN KLINIK */}
          {/* ============================================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Settings className="w-5 h-5 text-teal-400" />
                    Kontak, Alamat, Jam Buka &amp; Media Sosial
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Ganti nomor WhatsApp, email, alamat klinik, jadwal layanan, dan tautan media sosial.
                  </p>
                </div>
                <button
                  onClick={handleSaveSettings}
                  disabled={isSaving}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-700/30"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
                </button>
              </div>

              <div className="bg-slate-950 p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                {/* Bagian 1: Kontak Utama */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    Kontak Utama Klinik
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Nomor WhatsApp (Awali 62, contoh: 6281234567890)
                      </label>
                      <input
                        type="text"
                        value={settings.whatsapp}
                        onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value.replace(/\D/g, "") })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-400 focus:outline-none focus:border-teal-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        Semua tombol reservasi WhatsApp di seluruh web otomatis mengarah ke nomor ini.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Email Resmi Klinik
                      </label>
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Alamat Lengkap Klinik
                    </label>
                    <textarea
                      rows={2}
                      value={settings.address}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {/* Pengaturan Google Maps & Live Mini Map Preview */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-teal-400" />
                          Pengaturan Google Maps &amp; Titik Lokasi
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Mini maps akan otomatis mengarah ke lokasi terbaru lengkap dengan pin/titik lokasi.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleDetectGPS}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-xs font-semibold transition-all cursor-pointer"
                      >
                        <LocateFixed className="w-3.5 h-3.5 text-teal-400" />
                        <span>Deteksi Lokasi GPS Saat Ini</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
                      {/* Kolom Input (7 cols) */}
                      <div className="lg:col-span-7 space-y-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Tautan Google Maps / Link Berbagi (Share Link)
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: https://maps.app.goo.gl/... atau https://maps.google.com/..."
                            value={settings.mapsUrl}
                            onChange={(e) => setSettings({ ...settings, mapsUrl: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                          />
                          <p className="text-[10px] text-slate-400 mt-1">
                            Link ini dibuka saat pasien klik tombol &quot;Buka Petunjuk Arah di Maps&quot;.
                          </p>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">
                            Kode Sematkan Peta (&lt;iframe&gt;) atau Koordinat Titik Lokasi (Opsional)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Contoh: tempelkan kode <iframe src=...> dari Google Maps 'Sematkan peta', atau koordinat latitude,longitude (contoh: -6.8041, 110.8405)"
                            value={settings.mapsEmbed || ""}
                            onChange={(e) => setSettings({ ...settings, mapsEmbed: e.target.value })}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                          />
                          <div className="text-[10px] text-slate-400 mt-1 space-y-0.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                            <p className="font-semibold text-teal-300">💡 Cara Mendapatkan Titik Akurat:</p>
                            <p>1. Buka <strong>Google Maps</strong> &rarr; cari klinik Anda &rarr; klik <strong>Bagikan</strong> &rarr; pilih tab <strong>Sematkan peta</strong> &rarr; klik <strong>Salin HTML</strong> lalu tempel di sini.</p>
                            <p>2. Atau klik tombol <strong>&quot;Deteksi Lokasi GPS Saat Ini&quot;</strong> di atas untuk mengambil koordinat otomatis.</p>
                          </div>
                        </div>
                      </div>

                      {/* Kolom Pratinjau Mini Map (5 cols) */}
                      <div className="lg:col-span-5 flex flex-col">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            Pratinjau Mini Maps:
                          </label>
                          <span className="text-[10px] text-teal-400">Live Preview</span>
                        </div>
                        <div className="relative w-full h-[220px] rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
                          <iframe
                            key={`${settings.mapsUrl}-${settings.mapsEmbed}-${settings.address}`}
                            title="Pratinjau Lokasi Mini Map"
                            src={getMapEmbedUrl(settings.mapsUrl, settings.mapsEmbed, settings.address)}
                            className="w-full h-full border-0"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 text-center">
                          Tampilan di atas adalah tampilan persis yang akan dilihat pengunjung website.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="border-slate-800" />

                {/* Bagian 2: Jam Pelayanan */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Jam Operasional &amp; Pelayanan
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Senin – Jumat
                      </label>
                      <input
                        type="text"
                        value={settings.openingHours?.weekdays || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            openingHours: { ...settings.openingHours, weekdays: e.target.value },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Sabtu – Minggu
                      </label>
                      <input
                        type="text"
                        value={settings.openingHours?.weekends || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            openingHours: { ...settings.openingHours, weekends: e.target.value },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Home Care Visit
                      </label>
                      <input
                        type="text"
                        value={settings.openingHours?.homeCare || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            openingHours: { ...settings.openingHours, homeCare: e.target.value },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-teal-300 font-bold focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>

                <hr className="border-slate-800" />

                {/* Bagian 3: Media Sosial */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Tautan Media Sosial
                  </h3>
                  <p className="text-xs text-slate-400">
                    Jika Facebook atau Instagram dikosongkan, ikon di footer website otomatis tidak dapat diklik.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Link Instagram
                      </label>
                      <input
                        type="text"
                        placeholder="https://instagram.com/homecareku (atau kosongkan)"
                        value={settings.socialLinks?.instagram || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        Link Facebook
                      </label>
                      <input
                        type="text"
                        placeholder="https://facebook.com/homecareku (atau kosongkan)"
                        value={settings.socialLinks?.facebook || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            socialLinks: { ...settings.socialLinks, facebook: e.target.value },
                          })
                        }
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
