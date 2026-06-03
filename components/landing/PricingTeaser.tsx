"use client";

import React, { useState } from "react";

export function PricingTeaser() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="mx-auto w-full max-w-7xl px-4 py-10 md:py-16 lg:py-32">
      <h2 className="mx-auto max-w-2xl text-center text-xl font-medium tracking-tight text-neutral-900 md:text-4xl lg:text-7xl dark:text-white">
        Pick a pricing that fits your needs
      </h2>
      <p className="mx-auto mt-8 max-w-md text-center text-base text-neutral-500 md:text-xl dark:text-neutral-400">
        Every plan includes a free tier. Choose the one that fits your needs.
      </p>

      <div className="relative mt-8 w-full">
        {/* Overlay */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center backdrop-blur-xl bg-white/40 dark:bg-black/40 rounded-[2.5rem]">
          <div className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-8 py-4 shadow-2xl backdrop-blur-md">
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-xl md:text-2xl font-bold tracking-tight text-transparent">
              Pricing will appear on launch
            </span>
          </div>
        </div>

        {/* Blurred Content */}
        <div className="pointer-events-none select-none opacity-40 blur-[4px] h-[350px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_0%,transparent_100%)]">
          {/* Pricing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span
              className={`text-sm font-medium ${!isYearly ? "text-neutral-900 dark:text-white" : "text-neutral-500"
                }`}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-200 dark:bg-neutral-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out ${isYearly ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
            <span
              className={`text-sm font-medium flex items-center ${isYearly ? "text-neutral-900 dark:text-white" : "text-neutral-500"
                }`}
            >
              Yearly
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-600 dark:bg-green-900/30 dark:text-green-400">
                Save 20%
              </span>
            </span>
          </div>

          <div className="mt-12 grid w-full grid-cols-1 gap-4 md:mt-20 md:grid-cols-3 md:gap-8">
            {/* Hobby Plan */}
            <div className="flex w-full flex-col rounded-3xl p-2 glass-panel backdrop-blur-md">
              <div className="rounded-[18px] px-8 py-12 md:px-8 md:py-12 bg-white/10 dark:bg-black/10 shadow-[0_8px_8px_-3px_rgba(0,0,0,0.04),0_3px_3px_-1.5px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.04)] dark:shadow-[0_8px_8px_-3px_rgba(255,255,255,0.02),0_0_0_1px_rgba(255,255,255,0.05)]">
                <p className="text-base font-bold md:text-2xl text-neutral-700 dark:text-neutral-200">
                  Hobby
                </p>
                <p className="mt-2 text-sm text-balance lg:text-base text-neutral-500 dark:text-neutral-400">
                  For indie hackers trying out AI for the first time.
                </p>
              </div>
              <div className="mt-2 p-8 md:mt-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-medium tracking-tight md:text-3xl lg:text-6xl text-neutral-800 dark:text-neutral-100">
                    {isYearly ? "$159" : "$199"}
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    /
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    Month
                  </span>
                </div>
                <button className="mt-4 w-full cursor-pointer rounded-full px-4 py-4 text-base font-medium transition-all duration-200 active:scale-[0.98] md:mt-6 bg-white text-neutral-600 shadow-[0_8px_8px_-3px_rgba(0,0,0,0.04),0_3px_3px_-1.5px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-neutral-950 dark:text-neutral-300 dark:shadow-[0_8px_8px_-3px_rgba(255,255,255,0.02),0_0_0_1px_rgba(255,255,255,0.05)]">
                  Start a free trial
                </button>
                <div
                  className="h-(--height) w-full bg-size-[var(--width)_var(--height)] [mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),linear-gradient(black,black)] dark:[mask:linear-gradient(to_left,var(--background-dark)_var(--fade-stop),transparent),linear-gradient(to_right,var(--background-dark)_var(--fade-stop),transparent),linear-gradient(black,black)] mask-exclude z-30 bg-[linear-gradient(to_right,#e5e5e5,#e5e5e5_50%,transparent_0,transparent)] dark:bg-[linear-gradient(to_right,#404040,#404040_50%,transparent_0,transparent)] my-8"
                  style={
                    {
                      "--background": "#ffffff",
                      "--background-dark": "#171717",
                      "--height": "1px",
                      "--width": "5px",
                      "--fade-stop": "100%",
                      "--offset": "200px",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "exclude",
                    } as React.CSSProperties
                  }
                ></div>
                <p className="font-mono text-sm tracking-tight uppercase text-neutral-400 dark:text-neutral-500">
                  Hobby plan includes
                </p>
                <div className="my-4 flex flex-col gap-6">
                  {[
                    { text: " per month", bold: "120 projects" },
                    { text: "Unlimited workspaces", bold: null },
                    { text: "2 AI Model Choices", bold: null },
                    { text: "History & Export", bold: null },
                    { text: "Basic email support", bold: null },
                    { text: "1 member seat", bold: null },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start justify-start gap-2">
                      <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-2 stroke-[4px] text-neutral-700 dark:text-neutral-300"
                        >
                          <path d="M5 12l5 5l10 -10"></path>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {feature.bold ? (
                          <>
                            <span className="font-bold">{feature.bold}</span>
                            {feature.text}
                          </>
                        ) : (
                          feature.text
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Pro Plan */}
            <div className="flex w-full flex-col rounded-3xl p-2 glass-panel backdrop-blur-md ring-1 ring-primary/20">
              <div className="rounded-[18px] px-8 py-12 md:px-8 md:py-12 bg-neutral-900/40 shadow-[0_8px_16px_-4px_rgba(0,0,0,0.15),0_4px_6px_-2px_rgba(0,0,0,0.1),0_0_0_1px_rgba(0,0,0,0.08)] dark:bg-white/10 dark:shadow-[0_8px_16px_-4px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.06)]">
                <p className="text-base font-bold md:text-2xl text-white dark:text-neutral-900">
                  Pro
                </p>
                <p className="mt-2 text-sm text-balance lg:text-base text-neutral-400 dark:text-neutral-600">
                  For teams that need more power and flexibility.
                </p>
              </div>
              <div className="mt-2 p-8 md:mt-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-medium tracking-tight md:text-3xl lg:text-6xl text-white dark:text-neutral-900">
                    {isYearly ? "$399" : "$499"}
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-500">
                    /
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-500">
                    Month
                  </span>
                </div>
                <button className="mt-4 w-full cursor-pointer rounded-full px-4 py-4 text-base font-medium transition-all duration-200 active:scale-[0.98] md:mt-6 bg-linear-to-t from-indigo-600 to-indigo-500 text-white shadow-[0px_0.5px_1px_0px_var(--color-indigo-300)_inset]">
                  Get started
                </button>
                <div
                  className="h-(--height) w-full bg-size-[var(--width)_var(--height)] [mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),linear-gradient(black,black)] dark:[mask:linear-gradient(to_left,var(--background-dark)_var(--fade-stop),transparent),linear-gradient(to_right,var(--background-dark)_var(--fade-stop),transparent),linear-gradient(black,black)] mask-exclude z-30 bg-[linear-gradient(to_right,#525252,#525252_50%,transparent_0,transparent)] dark:bg-[linear-gradient(to_right,#a3a3a3,#a3a3a3_50%,transparent_0,transparent)] my-8"
                  style={
                    {
                      "--background": "#171717",
                      "--background-dark": "#f5f5f5",
                      "--height": "1px",
                      "--width": "5px",
                      "--fade-stop": "100%",
                      "--offset": "200px",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "exclude",
                    } as React.CSSProperties
                  }
                ></div>
                <p className="font-mono text-sm tracking-tight uppercase text-neutral-500 dark:text-neutral-500">
                  Pro plan includes
                </p>
                <div className="my-4 flex flex-col gap-6">
                  {[
                    { text: "", bold: "Unlimited projects" },
                    { text: "Unlimited workspaces", bold: null },
                    { text: " included", bold: "All AI Models" },
                    { text: "History & Export", bold: null },
                    { text: "Priority email support", bold: null },
                    { text: " seats", bold: "10 member" },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start justify-start gap-2">
                      <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-neutral-700 dark:bg-neutral-300">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-2 stroke-[4px] text-white dark:text-neutral-900"
                        >
                          <path d="M5 12l5 5l10 -10"></path>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-neutral-300 dark:text-neutral-700">
                        {feature.bold ? (
                          <>
                            <span className="font-bold">{feature.bold}</span>
                            {feature.text}
                          </>
                        ) : (
                          feature.text
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="flex w-full flex-col rounded-3xl p-2 glass-panel backdrop-blur-md">
              <div className="rounded-[18px] px-8 py-12 md:px-8 md:py-12 bg-white/10 shadow-[0_8px_8px_-3px_rgba(0,0,0,0.04),0_3px_3px_-1.5px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-black/10 dark:shadow-[0_8px_8px_-3px_rgba(255,255,255,0.02),0_0_0_1px_rgba(255,255,255,0.05)]">
                <p className="text-base font-bold md:text-2xl text-neutral-700 dark:text-neutral-200">
                  Enterprise
                </p>
                <p className="mt-2 text-sm text-balance lg:text-base text-neutral-500 dark:text-neutral-400">
                  For large organizations with custom needs.
                </p>
              </div>
              <div className="mt-2 p-8 md:mt-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-medium tracking-tight md:text-3xl lg:text-6xl text-neutral-800 dark:text-neutral-100">
                    {isYearly ? "690" : "$69"}
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    /
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {isYearly ? "Year" : "Month"}
                  </span>
                </div>
                <button className="mt-4 w-full cursor-pointer rounded-full px-4 py-4 text-base font-medium transition-all duration-200 active:scale-[0.98] md:mt-6 bg-white text-neutral-600 shadow-[0_8px_8px_-3px_rgba(0,0,0,0.04),0_3px_3px_-1.5px_rgba(0,0,0,0.04),0_0_0_1px_rgba(0,0,0,0.04)] dark:bg-neutral-950 dark:text-neutral-300 dark:shadow-[0_8px_8px_-3px_rgba(255,255,255,0.02),0_0_0_1px_rgba(255,255,255,0.05)]">
                  Contact sales
                </button>
                <div
                  className="h-(--height) w-full bg-size-[var(--width)_var(--height)] [mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),linear-gradient(black,black)] dark:[mask:linear-gradient(to_left,var(--background-dark)_var(--fade-stop),transparent),linear-gradient(to_right,var(--background-dark)_var(--fade-stop),transparent),linear-gradient(black,black)] mask-exclude z-30 bg-[linear-gradient(to_right,#e5e5e5,#e5e5e5_50%,transparent_0,transparent)] dark:bg-[linear-gradient(to_right,#404040,#404040_50%,transparent_0,transparent)] my-8"
                  style={
                    {
                      "--background": "#ffffff",
                      "--background-dark": "#171717",
                      "--height": "1px",
                      "--width": "5px",
                      "--fade-stop": "100%",
                      "--offset": "200px",
                      maskComposite: "exclude",
                      WebkitMaskComposite: "exclude",
                    } as React.CSSProperties
                  }
                ></div>
                <p className="font-mono text-sm tracking-tight uppercase text-neutral-400 dark:text-neutral-500">
                  Enterprise plan includes
                </p>
                <div className="my-4 flex flex-col gap-6">
                  {[
                    { text: "", bold: "Everything in Pro" },
                    { text: "Custom integrations", bold: null },
                    { text: "Dedicated account manager", bold: null },
                    { text: "SSO & SAML", bold: null },
                    { text: "24/7 phone support", bold: null },
                    { text: "Unlimited member seats", bold: null },
                  ].map((feature, idx) => (
                    <div key={idx} className="flex items-start justify-start gap-2">
                      <div className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="size-2 stroke-[4px] text-neutral-700 dark:text-neutral-300"
                        >
                          <path d="M5 12l5 5l10 -10"></path>
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {feature.bold ? (
                          <>
                            <span className="font-bold">{feature.bold}</span>
                            {feature.text}
                          </>
                        ) : (
                          feature.text
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}