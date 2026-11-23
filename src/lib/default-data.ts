export interface SiteSettings {
  clinicName: string;
  whatsapp: string;
  email: string;
  address: string;
  mapsUrl: string;
  mapsEmbed?: string;
  openingHours: {
    weekdays: string;
    weekends: string;
    homeCare: string;
  };
  socialLinks: {
    whatsapp: string;
    instagram: string;
    facebook: string;
  };
}

export interface AboutData {
  headline: string;
  bio: string;
  nurseName: string;
  nurseRole: string;
  nursePhoto: string;
  experienceYears: number;
  legalBadge: string;
  checklist: Array<{
    title: string;
    desc: string;
  }>;
  quote: string;
}

export interface ServiceItem {
  id?: string;
  title: string;
  desc: string;
  image: string;
  badge: string;
}

export interface CertificateItem {
  id?: string;
  title: string;
  category: string;
  issuer: string;
  noReg: string;
  validity: string;
  desc: string;
  img: string;
  badge: string;
}

export interface TestimonialItem {
  id?: string;
  name: string;
  role: string;
  rating: number;
  service: string;
  review: string;
  date: string;
}

export const defaultSettings: SiteSettings = {
  clinicName: "Homecareku",
  whatsapp: "6281234567890",
  email: "info@homecareku.com",
  address: "Jl. Kesehatan No. 123, Kel. Sejahtera, Kec. Makmur, Kota Sehat 12345",
  mapsUrl: "https://maps.google.com/?q=Kudus,+Jawa+Tengah",
  mapsEmbed: "",
  openingHours: {
    weekdays: "08.00 – 20.00 WIB",
    weekends: "08.00 – 18.00 WIB",
    homeCare: "Siaga 24 Jam (Reservasi WA)",
  },
  socialLinks: {
    whatsapp: "https://wa.me/6281234567890",
    instagram: "https://instagram.com",
    facebook: "https://facebook.com",
  },
};

export const defaultAbout: AboutData = {
  headline: "Sentuhan Medis Humanis,\nHangat & Berpengalaman",
  bio: "Halo, saya Ns. Sari Dewi, S.Kep — perawat berlisensi resmi dengan pengalaman lebih dari 8 tahun dalam keperawatan klinis dan komunitas. Homecareku hadir dengan dedikasi memberikan pelayanan medis berstandar rumah sakit yang aman, privat, dan penuh empati langsung di kenyamanan rumah pasien maupun fasilitas klinik kami.",
  nurseName: "Ns. Sari Dewi, S.Kep",
  nurseRole: "Perawat Penanggung Jawab Klinis",
  nursePhoto: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=800&q=80",
  experienceYears: 8,
  legalBadge: "STR & SIPP Kemenkes Aktif",
  checklist: [
    { title: "Profesi Ners", desc: "Lulusan Ners dari universitas terkemuka dengan predikat memuaskan" },
    { title: "Sertifikasi Wound Care", desc: "Tersertifikasi Modern Wound Care (InWCCA), BHD & Phlebotomy" },
    { title: "5+ Tahun RS Rujukan", desc: "Pengalaman penanganan rawat inap, luka akut & kronis di RS provinsi" },
    { title: "Standar Sterilisasi Kemenkes", desc: "Protokol aseptik ketat dan instrumen medis sekali pakai higienis" },
  ],
  quote: "Setiap pasien adalah prioritas kami. Kami hadir bukan hanya untuk melakukan tindakan fisik, melainkan mendampingi proses kesembuhan dengan ketulusan dan ketenangan bagi keluarga.",
};

export const defaultServices: ServiceItem[] = [
  {
    title: "Perawatan Luka",
    desc: "Perawatan luka diabetes, pasca operasi, luka bakar, dan kronis menggunakan teknik modern wound care steril.",
    image: "https://images.unsplash.com/photo-1609840533741-62c180d0be79?w=600&q=75",
    badge: "Klinik & Home Care",
  },
  {
    title: "Khitan Modern",
    desc: "Metode modern (klem/laser), minim nyeri, cepat sembuh, aman untuk anak-anak maupun dewasa.",
    image: "https://rumahsunatdrmahdian.com/wp-content/uploads/2022/03/MAHDIAN-KLEM-1.jpeg",
    badge: "Klinik",
  },
  {
    title: "Pemasangan Infus",
    desc: "Rehidrasi, vitamin drip, atau terapi obat intravena, langsung di klinik maupun home visit.",
    image: "https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?w=600&q=75",
    badge: "Klinik & Home Care",
  },
  {
    title: "Pemasangan NGT",
    desc: "Pemasangan selang lambung dengan prosedur aseptik ketat dan panduan nutrisi lengkap.",
    image: "https://cdn.hellosehat.com/wp-content/uploads/2021/02/33d3ea69-nasogastric-tube.jpg?w=800&q=75",
    badge: "Klinik & Home Care",
  },
  {
    title: "Pemasangan Kateter",
    desc: "Pemasangan dan penggantian kateter urin dengan teknik steril untuk mencegah risiko infeksi.",
    image: "https://images.pexels.com/photos/35609688/pexels-photo-35609688.jpeg?auto=compress&cs=tinysrgb&w=600",
    badge: "Klinik & Home Care",
  },
  {
    title: "Terapi Bekam",
    desc: "Bekam basah/kering oleh terapis bersertifikat untuk melancarkan peredaran darah dan relaksasi.",
    image: "https://images.pexels.com/photos/6629531/pexels-photo-6629531.jpeg?auto=compress&cs=tinysrgb&w=600",
    badge: "Klinik & Home Care",
  },
  {
    title: "Terapi Inframerah",
    desc: "Fisioterapi sinar infrared untuk meredakan nyeri sendi, kaku otot, dan mempercepat pemulihan.",
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Infrared_Heat_Lamp.jpg?width=600",
    badge: "Klinik",
  },
  {
    title: "Cek Lab Mini",
    desc: "Gula darah, kolesterol, asam urat, hemoglobin – hasil cepat dalam hitungan menit, harga terjangkau.",
    image: "https://images.unsplash.com/photo-1683727027478-5df5f0c89d27?w=600&q=75",
    badge: "Klinik",
  },
];

export const defaultCertificates: CertificateItem[] = [
  {
    title: "Surat Tanda Registrasi (STR) Perawat",
    category: "Legalitas & Lisensi Nasional",
    issuer: "Konsil Tenaga Kesehatan Indonesia (KTKI) - Kemenkes RI",
    noReg: "No. Registrasi: 14 01 5 2 1 20-3849102",
    validity: "Terdaftar Resmi Seumur Hidup",
    desc: "Bukti tertulis legalitas kompetensi medis perawat yang diakui resmi oleh Kementerian Kesehatan Republik Indonesia untuk seluruh wilayah NKRI.",
    img: "https://images.unsplash.com/photo-1589330694653-dad6bc0140fa?w=1000&q=85",
    badge: "Kemenkes RI",
  },
  {
    title: "Surat Izin Praktik Perawat (SIPP)",
    category: "Izin Praktik Mandiri & Home Care",
    issuer: "Dinas Kesehatan & DPMPTSP Kota",
    noReg: "No. Izin: 446/0921/SIPP/DINKES/2022",
    validity: "Izin Praktik Aktif & Terverifikasi",
    desc: "Izin operasional legal penyelenggaraan pelayanan asuhan keperawatan mandiri, visit home care, dan tindakan medis di klinik.",
    img: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?w=1000&q=85",
    badge: "Dinkes Resmi",
  },
  {
    title: "Sertifikat Modern Wound Care (CWCC)",
    category: "Keahlian Klinis Spesialis",
    issuer: "Indonesian Wound Care Clinician (InWCCA)",
    noReg: "No. Sertifikat: WCA-ID/2021/0845-EXP",
    validity: "Certified Wound Specialist",
    desc: "Sertifikasi keahlian tata laksana luka modern (luka diabetes/gangren, dekubitus, luka bakar, dan luka pasca-operasi) berstandar steril.",
    img: "https://images.unsplash.com/photo-1584433144859-1fc3ab64a957?w=1000&q=85",
    badge: "Spesialis Luka",
  },
];

export const defaultTestimonials: TestimonialItem[] = [
  {
    name: "Ibu Ratna Dewi",
    role: "Keluarga Pasien Stroke",
    rating: 5,
    service: "Home Care & Perawatan Infus",
    review: "Perawatnya ramah sekali, datang tepat waktu ke rumah dan penanganan infusnya rapi tanpa rasa sakit. Sangat membantu keluarga kami yang kesulitan membawa orang tua ke klinik.",
    date: "12 Nov 2026",
  },
  {
    name: "Bpk. Hendra Gunawan",
    role: "Pasien Pasca Operasi",
    rating: 5,
    service: "Modern Wound Care",
    review: "Luka pasca operasi cepat kering dan bersih berkat perawatan steril dari Homecareku. Dijelaskan juga cara perawatan sehari-harinya dengan sangat jelas.",
    date: "28 Okt 2026",
  },
  {
    name: "Bpk. Ahmad Fauzi",
    role: "Orang Tua Pasien Khitan",
    rating: 5,
    service: "Khitan Modern Klem",
    review: "Anak saya khitan di klinik, prosesnya sangat cepat dan anak tidak rewel sama sekali. Hari kedua sudah bisa beraktivitas seperti biasa. Mantap!",
    date: "15 Okt 2026",
  },
  {
    name: "Ibu Siti Mariam",
    role: "Pasien Rutin Cek Lab",
    rating: 5,
    service: "Cek Lab Mini & Terapi Bekam",
    review: "Hasil cek gula darah dan kolesterol langsung keluar di tempat. Dilanjut terapi bekam badannya jadi enteng banget. Sangat recommended!",
    date: "02 Okt 2026",
  },
  {
    name: "Bpk. Bambang Sutrisno",
    role: "Keluarga Pasien Diabetes",
    rating: 5,
    service: "Rawat Luka Diabetes (Gangren)",
    review: "Luka diabetes di kaki bapak mertua yang tadinya memburuk, alhamdulillah sekarang menutup setelah rutin dirawat home care. Teknik balut luka modern-nya sangat higienis dan tidak bau.",
    date: "18 Nov 2026",
  },
  {
    name: "Ibu Nurul Hidayah",
    role: "Ibu Pasca Caesar (Maternity)",
    rating: 5,
    service: "Perawatan Luka Caesar",
    review: "Layanan ganti perban luka SC langsung ke rumah sangat menolong saya yang masih nyeri jalan. Nakesnya teliti, telaten, dan selalu memberi edukasi tentang tanda infeksi.",
    date: "05 Nov 2026",
  },
  {
    name: "Bpk. Eko Prasetyo",
    role: "Keluarga Pasien Lansia",
    rating: 5,
    service: "Pemasangan NGT & Kateter",
    review: "Ibu saya yang tirah baring butuh ganti selang NGT dan kateter urine rutin. Pelayanannya cepat tanggap, sangat berhati-hati, dan selalu sabar memotivasi pasien.",
    date: "22 Okt 2026",
  },
  {
    name: "Ibu Sri Wahyuni",
    role: "Pasien Pemulihan Pasca Sakit",
    rating: 5,
    service: "Suntik Vitamin & Infus Booster",
    review: "Panggil layanan infus multivitamin dan suntik neurobion ke rumah saat badan drop. Nakesnya profesional, tusukan jarumnya halus sekali tidak sakit. Badan langsung fit kembali.",
    date: "10 Okt 2026",
  },
  {
    name: "Bpk. Tri Wahyudi",
    role: "Keluarga Pasien Home Visit",
    rating: 5,
    service: "Fisioterapi & Latihan Gerak",
    review: "Latihan gerak mandiri pasca stroke di rumah sangat memuaskan. Terapisnya telaten membimbing dari yang awalnya cuma bisa berbaring sampai sekarang bisa duduk tegak sendiri.",
    date: "29 Sep 2026",
  },
  {
    name: "Ibu Maya Kartika",
    role: "Pasien Penanganan Luka Bakar",
    rating: 5,
    service: "Perawatan Luka Bakar",
    review: "Tangan melepuh terkena minyak panas, langsung chat WA dan ditangani dengan cepat. Diberikan salep dan penutup luka modern sehingga sembuh tanpa bekas keloid.",
    date: "14 Sep 2026",
  },
];

/**
 * Menghasilkan URL Google Maps Embed yang valid & dinamis dari berbagai input:
 * - Kode <iframe> Google Maps (otomatis ekstrak src)
 * - Link embed google maps
 * - URL dengan koordinat @lat,lng atau ?q=
 * - Koordinat latitude, longitude langsung (contoh: "-6.8041, 110.8405")
 * - Alamat lengkap klinik
 */
export function getMapEmbedUrl(mapsUrl?: string, mapsEmbed?: string, address?: string): string {
  // 1. Periksa field mapsEmbed jika diisi
  if (mapsEmbed && mapsEmbed.trim()) {
    const raw = mapsEmbed.trim();
    // Jika user paste tag <iframe>, ekstrak src
    const srcMatch = raw.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    // Jika berupa koordinat langsung: "lat,lng" (contoh: -6.8041, 110.8405)
    if (/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/.test(raw)) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(raw.replace(/\s+/g, ""))}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 2. Periksa field mapsUrl jika diisi
  if (mapsUrl && mapsUrl.trim()) {
    const raw = mapsUrl.trim();
    // Jika user paste tag <iframe> ke field mapsUrl
    const srcMatch = raw.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }

    // Jika sudah berupa URL embed google maps
    if (raw.includes("google.com/maps/embed")) {
      return raw;
    }

    // Jika URL Google Maps berisi koordinat @lat,lng (contoh: /@-6.804123,110.840567,17z)
    const coordMatch = raw.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      const lat = coordMatch[1];
      const lng = coordMatch[2];
      return `https://maps.google.com/maps?q=${lat},${lng}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }

    // Jika URL memiliki parameter ?q= atau ?query=
    const qMatch = raw.match(/[?&](?:q|query)=([^&]+)/);
    if (qMatch && qMatch[1]) {
      return `https://maps.google.com/maps?q=${qMatch[1]}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }

    // Jika mapsUrl adalah koordinat langsung: "lat,lng"
    if (/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/.test(raw)) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(raw.replace(/\s+/g, ""))}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }

    // Jika place URL: /maps/place/Nama+Tempat/
    const placeMatch = raw.match(/\/maps\/place\/([^/@]+)/);
    if (placeMatch && placeMatch[1]) {
      return `https://maps.google.com/maps?q=${placeMatch[1]}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 3. Fallback cerdas: gunakan alamat klinik dengan titik pin lokasi
  if (address && address.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(address.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }

  // 4. Default Kudus (Jawa Tengah)
  return "https://maps.google.com/maps?q=Kudus,+Jawa+Tengah&t=&z=14&ie=UTF8&iwloc=&output=embed";
}

/**
 * Menghasilkan link langsung untuk tombol "Buka Petunjuk Arah"
 */
export function getMapDirectLink(mapsUrl?: string, address?: string): string {
  if (mapsUrl && mapsUrl.trim()) {
    const raw = mapsUrl.trim();
    const srcMatch = raw.match(/src=["']([^"']+)["']/i);
    if (srcMatch && srcMatch[1]) {
      return srcMatch[1];
    }
    if (raw.startsWith("http://") || raw.startsWith("https://")) {
      return raw;
    }
    if (/^-?\d+\.\d+\s*,\s*-?\d+\.\d+$/.test(raw)) {
      return `https://maps.google.com/?q=${encodeURIComponent(raw.replace(/\s+/g, ""))}`;
    }
  }
  if (address && address.trim()) {
    return `https://maps.google.com/?q=${encodeURIComponent(address.trim())}`;
  }
  return "https://maps.google.com/?q=Kudus,+Jawa+Tengah";
}
