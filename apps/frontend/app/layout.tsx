import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { getAuthenticatedUser } from "@/services/auth.service";
import {
  LogOut,
  User as UserIcon,
  LayoutDashboard,
  History,
  Shirt,
} from "lucide-react";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StyLens — AI Fashion Stylist",
  description: "Get expert AI fashion styling and outfit analysis in seconds.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getAuthenticatedUser();

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased selection:bg-indigo-100 selection:text-indigo-900`}
    >
      <body className="min-h-full flex flex-col text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        <nav className="sticky top-0 z-50 w-full glass border-b !border-white/20">
          <div className="max-w-7xl mx-auto px-4 h-20 grid grid-cols-3 items-center">
            <div className="flex justify-start">
              <a href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-xl font-outfit shadow-lg shadow-slate-200 group-hover:scale-110 transition-all duration-500">
                  S
                </div>
                <span className="font-outfit font-bold text-2xl tracking-tight text-slate-900">
                  StyLens
                </span>
              </a>
            </div>

            <div className="flex justify-center">
              {user && (
                <div className="hidden md:flex items-center gap-8">
                  <a
                    href="/homepage"
                    className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2 group"
                  >
                    <LayoutDashboard
                      size={18}
                      className="group-hover:text-slate-900 transition-colors"
                    />
                    Homepage
                  </a>
                  <a
                    href="/closet"
                    className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2 group"
                  >
                    <Shirt
                      size={18}
                      className="group-hover:text-slate-900 transition-colors"
                    />
                    Closet
                  </a>
                  <a
                    href="/history"
                    className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-all flex items-center gap-2 group"
                  >
                    <History
                      size={18}
                      className="group-hover:text-slate-900 transition-colors"
                    />
                    History
                  </a>
                </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-4 md:gap-10">
              {user ? (
                <>
                  <div className="h-5 w-[1px] bg-slate-200 hidden md:block" />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 text-slate-600 flex items-center justify-center shadow-sm">
                      <UserIcon size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-600 hidden xl:inline">
                      {user.email}
                    </span>
                    <form action="/auth/signout" method="post">
                      <button
                        type="submit"
                        className="text-sm font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5"
                      >
                        <LogOut size={18} />
                        <span className="hidden sm:inline">Sign Out</span>
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <>
                  <a
                    href="/login"
                    className="text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                  >
                    Log In
                  </a>
                  <a
                    href="/signup"
                    className="text-sm font-bold text-white bg-btn-primary px-7 py-3 rounded-2xl hover:bg-btn-primary-hover transition-all shadow-xl shadow-slate-200 hover:-translate-y-0.5"
                  >
                    Sign Up
                  </a>
                </>
              )}
            </div>
          </div>
        </nav>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="py-16 bg-navbar-bg backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="flex items-center gap-3 opacity-80">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                S
              </div>
              <span className="font-outfit font-bold tracking-tight text-lg">
                StyLens
              </span>
            </div>
            <div className="text-sm text-slate-400 font-medium">
              © {new Date().getFullYear()} StyLens. Crafted for style.
            </div>
            <div className="flex items-center gap-8 text-sm font-bold text-slate-400">
              <a href="#" className="hover:text-slate-900 transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-slate-900 transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
