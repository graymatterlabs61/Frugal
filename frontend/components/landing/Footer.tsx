import Link from "next/link";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-white/[0.05] px-8 pt-20 pb-0">
      {/* Top glow */}
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/50 to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-0 -translate-x-1/2 h-[120px] w-[600px] rounded-full bg-primary/8 blur-[80px] pointer-events-none" />

      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between text-sm text-muted-foreground sm:flex-row md:px-8">
        <div className="flex flex-col gap-4">
          <div className="mr-0 mb-4 md:mr-4">
            <Link
              className="relative z-20 inline-flex items-center gap-2.5 transition-opacity hover:opacity-80 group"
              href="/"
            >
              <img
                alt="Frugal logo"
                width="28"
                height="28"
                src="/logo.svg"
                className="group-hover:drop-shadow-[0_0_8px_#FF500B66] transition-[filter] duration-300"
              />
              <span className="font-ethnocentric text-base md:text-lg tracking-tight text-foreground pt-2">
                Frugal
              </span>
            </Link>
          </div>
          <div className="text-muted-foreground space-y-1.5">
            <p>A product of Gray Matter Labs.</p>
            <p>Made by Nilesh Kumar.</p>
            <p className="text-muted-foreground/60">&copy; {currentYear} Frugal. All rights reserved.</p>
            <div className="pt-3">
              <a
                className="footer-link text-sm"
                href="mailto:support@getfrugal.dev"
              >
                support@getfrugal.dev
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 grid grid-cols-2 items-start gap-10 sm:mt-0 lg:grid-cols-4 lg:gap-16">
          <div className="flex w-full flex-col justify-center space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
              Product
            </p>
            <ul className="list-none space-y-3.5">
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
                <Link className="footer-link" href="/pricing">
                  Plans &amp; Comparison
                </Link>
              </li>
            </ul>
          </div>
          <div className="flex flex-col justify-center space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
              Company
            </p>
            <ul className="list-none space-y-3.5">
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
          <div className="flex flex-col justify-center space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
              Legal
            </p>
            <ul className="list-none space-y-3.5">
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
          <div className="flex flex-col justify-center space-y-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
              Support
            </p>
            <ul className="list-none space-y-3.5">
              <li className="list-none">
                <a className="footer-link" href="mailto:support@getfrugal.dev">
                  support@getfrugal.dev
                </a>
              </li>
              <li className="list-none">
                <a className="footer-link" href="mailto:feedback@getfrugal.dev">
                  Send Feedback
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="relative mt-20 overflow-hidden">
        <p className="font-ethnocentric leading-none block bg-gradient-to-b from-foreground/10 via-foreground/5 to-background/0 bg-clip-text text-center text-6xl tracking-tighter text-transparent select-none md:text-9xl lg:text-[12rem] xl:text-[15rem]">
          FRUGAL
        </p>
      </div>
    </footer>
  );
}