import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetLoginAttempts,
  verifyCredentials,
  createSessionToken,
} from "@/lib/auth-server";

export async function POST(req: NextRequest) {
  try {
    // Ambil client IP untuk rate limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // 1. Cek proteksi rate limit brute force
    const rateCheck = checkRateLimit(ip);
    if (rateCheck.blocked) {
      const minutesLeft = Math.ceil((rateCheck.remainingMs || 0) / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Terlalu banyak percobaan login yang gagal. Akun dikunci sementara demi keamanan. Silakan coba lagi dalam ${minutesLeft} menit.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body || {};

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username dan password wajib diisi." },
        { status: 400 }
      );
    }

    // 2. Verifikasi kredensial di server
    const isValid = verifyCredentials(username, password);

    if (!isValid) {
      const record = recordFailedAttempt(ip);
      if (record.isNowBlocked) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Username atau password salah. Anda telah mencapai batas maksimal 5 kali percobaan. Akun dikunci sementara selama 5 menit.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: `Username atau password salah. Sisa kesempatan: ${record.attemptsLeft} kali lagi.`,
        },
        { status: 401 }
      );
    }

    // 3. Login sukses: reset rate limit & buat signed token
    resetLoginAttempts(ip);
    const signedToken = createSessionToken(username);

    // 4. Simpan ke HttpOnly Cookie (tidak bisa dibaca/dimanipulasi oleh JavaScript browser)
    const cookieStore = await cookies();
    cookieStore.set("admin_session", signedToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 hari
    });

    return NextResponse.json({
      success: true,
      user: username.trim().toLowerCase(),
      message: "Login berhasil.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server saat memproses login." },
      { status: 500 }
    );
  }
}
