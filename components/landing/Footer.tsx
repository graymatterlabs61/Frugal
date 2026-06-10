import Link from "next/link";

export function Footer() {
  return (
    <footer className=" backdrop-blur-md relative w-full overflow-hidden border-t border-neutral-200/50 px-8 pt-20 pb-0 dark:border-white/[0.05]">
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
              <span className="font-ethnocentric text-base md:text-lg lg:text-xl tracking-tight text-foreground block dark:text-white">
                Frugal
              </span>
            </Link>
          </div>
          <div className="text-neutral-500 dark:text-neutral-400 space-y-1">
            <p>A product of Gray Matter Labs.</p>
            <p>Made by Nilesh Kumar.</p>
            <p>© copyright Frugal 2026. All rights reserved.</p>
            {/* Social icons removed until real profiles exist — placeholder "#"
                links are dead UI. Restore with actual handles at launch. */}
            <div className="pt-4">
              <a
                className="footer-link text-sm underline-offset-4 hover:underline"
                href="mailto:support@getfrugal.dev"
              >
                support@getfrugal.dev
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 items-start gap-10 sm:mt-0 lg:grid-cols-4 lg:gap-16">
          <div className="flex w-full flex-col justify-center space-y-6">
            <p className="font-semibold text-foreground/60 text-xs uppercase tracking-widest mb-1">
              Product
            </p>
            <ul className="list-none space-y-4">
              <li className="list-none">
                <Link className="footer-link" href="#features">Features</Link>
              </li>
              <li className="list-none">
                <Link className="footer-link" href="#how-it-works">
                  How it Works
                </Link>
              </li>
              <li className="list-none">
                <Link className="footer-link" href="#pricing">
                  Pricing
                </Link>
              </li>
              <li className="list-none">
                <Link className="footer-link" href="#faq">
                  FAQ
                </Link>
              </li>
              <li className="list-none">
                <Link className="footer-link" href="#waitlist">
                  Waitlist
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <p className="font-semibold text-foreground/60 text-xs uppercase tracking-widest mb-1">
              Company
            </p>
            <ul className="list-none space-y-4">
              <li className="list-none">
                <Link className="footer-link" href="/about">
                  About Us
                </Link>
              </li>
              <li className="list-none">
                <Link className="footer-link" href="/contact">
                  Contact
                </Link>
              </li>
              <li className="list-none">
                <Link className="footer-link" href="/signup">
                  Sign Up
                </Link>
              </li>
              <li className="list-none">
                <Link className="footer-link" href="/login">
                  Login
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <p className="font-semibold text-foreground/60 text-xs uppercase tracking-widest mb-1">
              Legal
            </p>
            <ul className="list-none space-y-4">
              <li className="list-none">
                <Link className="footer-link" href="/privacy">
                  Privacy Policy
                </Link>
              </li>
              <li className="list-none">
                <Link className="footer-link" href="/terms">
                  Terms of Service
                </Link>
              </li>
              <li className="list-none">
                <Link className="footer-link" href="/cookies">
                  Cookie Policy
                </Link>
              </li>
              <li className="list-none">
                <Link className="footer-link" href="/refund">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <p className="font-semibold text-foreground/60 text-xs uppercase tracking-widest mb-1">
              Support
            </p>
            <ul className="list-none space-y-4">
              <li className="list-none">
                <a className="footer-link" href="mailto:support@frugal.so">
                  support@frugal.so
                </a>
              </li>
              <li className="list-none">
                <a className="footer-link" href="mailto:feedback@frugal.so">
                  Send Feedback
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="relative mt-16 overflow-hidden">
        <p className="font-ethnocentric leading-none block bg-gradient-to-b from-neutral-200 to-neutral-50 bg-clip-text text-center text-6xl tracking-tighter text-transparent select-none md:text-9xl lg:text-[12rem] xl:text-[15rem] dark:from-neutral-700 dark:to-neutral-950">
          FRUGAL
        </p>
      </div>
    </footer>
  );
}