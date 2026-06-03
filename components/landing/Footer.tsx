import Link from "next/link";
import React from "react";

export function Footer() {
  return (
    <footer className="glass-panel backdrop-blur-md relative w-full overflow-hidden border-t border-neutral-200/50 px-8 pt-20 pb-12 dark:border-white/[0.05]">
      {/* Top Glow Effect */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[100px] w-[600px] rounded-full bg-primary/10 blur-[80px] pointer-events-none"></div>

      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between text-sm text-neutral-500 sm:flex-row md:px-8">
        <div className="flex flex-col gap-4">
          <div className="mr-0 mb-4 md:mr-4 md:flex">
            <Link
              className="relative z-20 flex items-center space-x-2 text-sm font-normal text-black transition-opacity hover:opacity-80"
              href="/"
            >
              <img
                alt="logo"
                width="30"
                height="30"
                src="/logo.svg"
              />
              <span className="font-medium text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-foreground hidden sm:block text-black dark:text-white">
                Frugal
              </span>
            </Link>
          </div>
          <div className="text-neutral-500 dark:text-neutral-400 space-y-1">
            <p>A product of Gray Matter Labs.</p>
            <p>Made by Nilesh Kumar.</p>
            <p>© copyright Frugal 2026. All rights reserved.</p>
            <div className="flex gap-4 pt-4">
              <Link className="hover:text-neutral-800 transition-colors" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link className="hover:text-neutral-800 transition-colors" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link className="hover:text-neutral-800 transition-colors" href="#">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                <span className="sr-only">GitHub</span>
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 items-start gap-12 sm:mt-0 lg:grid-cols-3 lg:gap-20">
          <div className="flex w-full flex-col justify-center space-y-6">
            <p className="hover:text-neutral-800 font-bold text-neutral-600 transition-colors dark:text-neutral-300">
              Pages
            </p>
            <ul className="hover:text-neutral-800 list-none space-y-4 text-neutral-600 transition-colors dark:text-neutral-300">
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#features">
                  Features
                </Link>
              </li>
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#how-it-works">
                  How it Works
                </Link>
              </li>
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#pricing">
                  Pricing
                </Link>
              </li>
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#faq">
                  FAQ
                </Link>
              </li>
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#waitlist">
                  Waitlist
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <p className="hover:text-neutral-800 font-bold text-neutral-600 transition-colors dark:text-neutral-300">
              Legal
            </p>
            <ul className="hover:text-neutral-800 list-none space-y-4 text-neutral-600 transition-colors dark:text-neutral-300">
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#">
                  Privacy Policy
                </Link>
              </li>
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#">
                  Terms of Service
                </Link>
              </li>
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <p className="hover:text-neutral-800 font-bold text-neutral-600 transition-colors dark:text-neutral-300">
              Register
            </p>
            <ul className="hover:text-neutral-800 list-none space-y-4 text-neutral-600 transition-colors dark:text-neutral-300">
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#">
                  Sign Up
                </Link>
              </li>
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#">
                  Login
                </Link>
              </li>
              <li className="list-none">
                <Link className="hover:text-neutral-800 transition-colors" href="#">
                  Forgot Password
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="relative mt-24 flex items-center justify-center">
        <p className="bg-gradient-to-b from-neutral-200 to-neutral-50 bg-clip-text text-center text-6xl font-black tracking-tighter text-transparent select-none md:text-9xl lg:text-[12rem] xl:text-[15rem] dark:from-neutral-800 dark:to-neutral-950">
          FRUGAL
        </p>
      </div>
    </footer>
  );
}