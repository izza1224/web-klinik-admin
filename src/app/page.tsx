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
import { isFirebaseReady } from "@/lib/firebase";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<
    "services" | "about" | "certificates" | "testimonials" | "settings" | "firebase"
  >("services");

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
  const [copiedRules, setCopiedRules] = useState(false);

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

  // Firebase client config helper
  const [customFirebaseConfig, setCustomFirebaseConfig] = useState({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
  });

  useEffect(() => {
    // Load existing stored Firebase config if any
    try {
      const stored = localStorage.getItem("homecareku_firebase_config");
      if (stored) {
        setCustomFirebaseConfig(JSON.parse(stored));
      }
    } catch {}

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
        setTestimonials(t);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setFeedback({ type, text });
    setTimeout(() => setFeedback(null), 4500);
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

  const handleSaveFirebaseConfig = () => {
    if (!customFirebaseConfig.projectId || !customFirebaseConfig.apiKey) {
      showToast("error", "Project ID dan API Key wajib diisi!");
      return;
    }
    localStorage.setItem("homecareku_firebase_config", JSON.stringify(customFirebaseConfig));
    showToast("success", "Konfigurasi Firebase disimpan! Halaman akan direfresh...");
    setTimeout(() => window.location.reload(), 1500);
  };

  const handleResetFirebaseConfig = () => {
    if (confirm("Reset konfigurasi Firebase di browser dan gunakan environment variables?")) {
      localStorage.removeItem("homecareku_firebase_config");
      window.location.reload();
    }
  };

  const permanentRulesCode = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Izinkan baca & tulis permanen tanpa batas waktu (Anti-Kadaluwarsa 7 Hari)
      allow read, write: if true;
    }
  }
}`;

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
              { id: "firebase", label: "Petunjuk Firebase", icon: <Database className="w-4 h-4" /> },
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
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Semua perubahan akan langsung tampil di website utama saat disimpan.
              </p>
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
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      URL Foto / Gambar Layanan
                    </label>
                    <input
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={newService.image}
                      onChange={(e) => setNewService({ ...newService, image: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
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
                          <label className="text-[10px] font-bold text-slate-500 uppercase">
                            URL Gambar
                          </label>
                          <input
                            type="text"
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
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        URL Foto Perawat
                      </label>
                      <input
                        type="text"
                        value={about.nursePhoto}
                        onChange={(e) => setAbout({ ...about, nursePhoto: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Tahun Pengalaman
                        </label>
                        <input
                          type="number"
                          value={about.experienceYears}
                          onChange={(e) =>
                            setAbout({ ...about, experienceYears: Number(e.target.value) || 0 })
                          }
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500"
                        />
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
                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                        URL Gambar Dokumen
                      </label>
                      <input
                        type="text"
                        placeholder="https://images.unsplash.com/..."
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
                          <label className="text-[10px] text-slate-400">URL Foto Dokumen</label>
                          <input
                            type="text"
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
                {testimonials.map((t, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{t.name}</span>
                        {t.service && (
                          <span className="text-[10px] font-bold text-teal-400 bg-teal-950/60 border border-teal-800 px-2 py-0.5 rounded-full">
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
                ))}
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

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Tautan Google Maps
                    </label>
                    <input
                      type="text"
                      value={settings.mapsUrl}
                      onChange={(e) => setSettings({ ...settings, mapsUrl: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
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

          {/* ============================================================== */}
          {/* TAB 6: PANDUAN FIREBASE & ANTI-KADALUWARSA 7 HARI */}
          {/* ============================================================== */}
          {activeTab === "firebase" && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800">
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  <Database className="w-5 h-5 text-teal-400" />
                  Petunjuk Firebase &amp; Solusi Anti-Kadaluwarsa 7 Hari
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Panduan lengkap agar database Firebase Anda aktif selamanya tanpa kadaluwarsa.
                </p>
              </div>

              {/* Box PENTING: Penjelasan Mengapa Dulu Kadaluwarsa 7 Hari */}
              <div className="bg-amber-950/40 border border-amber-500/40 p-6 rounded-3xl space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span>Kenapa Dulu Web Anda Pernah Kadaluwarsa Setelah 7 Hari?</span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Saat Anda pertama kali membuat database Cloud Firestore di Firebase Console dan memilih{" "}
                  <strong>&ldquo;Start in test mode&rdquo;</strong>, Firebase secara otomatis memberikan batas waktu kadaluwarsa 7 atau 30 hari dalam aturan keamanan (Security Rules):
                </p>
                <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/20 font-mono text-[11px] text-rose-300">
                  allow read, write: if request.time &lt; timestamp.date(2026, 11, 28); // ⚠️ Otomatis MATI setelah 7 hari!
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Setelah tanggal tersebut terlewati, Firebase akan menolak semua permintaan baca/tulis data sehingga website tampak kembali ke data default atau gagal memuat database.
                </p>
              </div>

              {/* Solusi: Salin Aturan Permanen */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Solusi: Aturan Keamanan Permanen (Selamanya Aktif)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Copy kode aturan di bawah ini dan paste ke tab <strong>Rules</strong> di Firebase Console Firestore.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(permanentRulesCode);
                      setCopiedRules(true);
                      setTimeout(() => setCopiedRules(false), 2500);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-teal-300 border border-slate-700 transition-colors"
                  >
                    {copiedRules ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedRules ? "Tersalin!" : "Salin Rules"}</span>
                  </button>
                </div>

                <pre className="bg-slate-900 border border-slate-800 p-4 rounded-2xl text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                  {permanentRulesCode}
                </pre>

                {/* 3 Langkah Mudah di Firebase Console */}
                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Langkah Menerapkan di Firebase Console:
                  </p>
                  <ol className="list-decimal list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed">
                    <li>
                      Buka Firebase Console (<a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-teal-400 underline">console.firebase.google.com</a>) &rarr; Pilih Project Anda.
                    </li>
                    <li>
                      Di menu samping kiri, klik <strong>Build &rarr; Firestore Database &rarr; Tab Rules</strong>.
                    </li>
                    <li>
                      Hapus semua isi teks aturan yang lama, lalu <strong>Paste</strong> kode aturan permanen di atas.
                    </li>
                    <li>
                      Klik tombol biru <strong>&ldquo;Publish&rdquo;</strong>. Selesai! Database Anda sekarang aktif selamanya tanpa batas waktu kadaluwarsa.
                    </li>
                  </ol>
                </div>
              </div>

              {/* Form Input Firebase Config Langsung di Browser */}
              <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-teal-400" />
                  Hubungkan Firebase ke Website Ini
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Anda bisa menempelkan konfigurasi dari Firebase Console (Project Settings &rarr; General &rarr; Your apps &rarr; SDK setup and configuration) langsung di sini tanpa perlu mengedit file code:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Project ID
                    </label>
                    <input
                      type="text"
                      placeholder="contoh: web-klinik-homecare"
                      value={customFirebaseConfig.projectId}
                      onChange={(e) =>
                        setCustomFirebaseConfig({ ...customFirebaseConfig, projectId: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      API Key
                    </label>
                    <input
                      type="text"
                      placeholder="AIzaSy..."
                      value={customFirebaseConfig.apiKey}
                      onChange={(e) =>
                        setCustomFirebaseConfig({ ...customFirebaseConfig, apiKey: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Auth Domain
                    </label>
                    <input
                      type="text"
                      placeholder="project-id.firebaseapp.com"
                      value={customFirebaseConfig.authDomain}
                      onChange={(e) =>
                        setCustomFirebaseConfig({ ...customFirebaseConfig, authDomain: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                      Storage Bucket
                    </label>
                    <input
                      type="text"
                      placeholder="project-id.appspot.com"
                      value={customFirebaseConfig.storageBucket}
                      onChange={(e) =>
                        setCustomFirebaseConfig({ ...customFirebaseConfig, storageBucket: e.target.value })
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleResetFirebaseConfig}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold"
                  >
                    Reset Konfigurasi
                  </button>
                  <button
                    onClick={handleSaveFirebaseConfig}
                    className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md shadow-teal-700/30"
                  >
                    Simpan Konfigurasi &amp; Hubungkan
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
