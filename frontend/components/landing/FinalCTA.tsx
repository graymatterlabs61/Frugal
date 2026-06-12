"use client";

import React from "react";
import Link from "next/link";
import { ShimmerButton } from "@/components/ui/magic/shimmer-button";

export function FinalCTA() {
  return (
    <section id="get-started" className="glass-panel backdrop-blur-md w-full grid grid-cols-1 md:grid-cols-3 my-20 md:my-40 justify-start relative z-20 max-w-7xl mx-auto rounded-3xl overflow-hidden">
      <div
        className="absolute w-[calc(100%+var(--offset))] h-[var(--height)] left-[calc(var(--offset)/2*-1)] bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)] [background-size:var(--width)_var(--height)] [mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)] [mask-composite:exclude] z-30 dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)] top-0"
        style={
          {
            "--background": "#ffffff",
            "--color": "rgba(0, 0, 0, 0.2)",
            "--height": "1px",
            "--width": "5px",
            "--fade-stop": "90%",
            "--offset": "200px",
            "--color-dark": "rgba(255, 255, 255, 0.2)",
            maskComposite: "exclude",
            WebkitMaskComposite: "exclude",
          } as React.CSSProperties
        }
      />
      <div
        className="absolute w-[calc(100%+var(--offset))] h-[var(--height)] left-[calc(var(--offset)/2*-1)] bg-[linear-gradient(to_right,var(--color),var(--color)_50%,transparent_0,transparent)] [background-size:var(--width)_var(--height)] [mask:linear-gradient(to_left,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_right,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)] [mask-composite:exclude] z-30 dark:bg-[linear-gradient(to_right,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)] bottom-0 top-auto"
        style={
          {
            "--background": "#ffffff",
            "--color": "rgba(0, 0, 0, 0.2)",
            "--height": "1px",
            "--width": "5px",
            "--fade-stop": "90%",
            "--offset": "200px",
            "--color-dark": "rgba(255, 255, 255, 0.2)",
            maskComposite: "exclude",
            WebkitMaskComposite: "exclude",
          } as React.CSSProperties
        }
      />
      <div
        className="absolute h-[calc(100%+var(--offset))] w-[var(--width)] top-[calc(var(--offset)/2*-1)] bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)] [background-size:var(--width)_var(--height)] [mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)] [mask-composite:exclude] z-30 dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)] left-0"
        style={
          {
            "--background": "#ffffff",
            "--color": "rgba(0, 0, 0, 0.2)",
            "--height": "5px",
            "--width": "1px",
            "--fade-stop": "90%",
            "--offset": "80px",
            "--color-dark": "rgba(255, 255, 255, 0.2)",
            maskComposite: "exclude",
            WebkitMaskComposite: "exclude",
          } as React.CSSProperties
        }
      />
      <div
        className="absolute h-[calc(100%+var(--offset))] w-[var(--width)] top-[calc(var(--offset)/2*-1)] bg-[linear-gradient(to_bottom,var(--color),var(--color)_50%,transparent_0,transparent)] [background-size:var(--width)_var(--height)] [mask:linear-gradient(to_top,var(--background)_var(--fade-stop),transparent),_linear-gradient(to_bottom,var(--background)_var(--fade-stop),transparent),_linear-gradient(black,black)] [mask-composite:exclude] z-30 dark:bg-[linear-gradient(to_bottom,var(--color-dark),var(--color-dark)_50%,transparent_0,transparent)] left-auto right-0"
        style={
          {
            "--background": "#ffffff",
            "--color": "rgba(0, 0, 0, 0.2)",
            "--height": "5px",
            "--width": "1px",
            "--fade-stop": "90%",
            "--offset": "80px",
            "--color-dark": "rgba(255, 255, 255, 0.2)",
            maskComposite: "exclude",
            WebkitMaskComposite: "exclude",
          } as React.CSSProperties
        }
      />
      <div className="md:col-span-2 p-8 md:p-14">
        <h2 className="text-left text-neutral-500 dark:text-neutral-200 text-xl md:text-3xl tracking-tight font-medium">
          Stop paying for AI <span className="font-bold text-black dark:text-white">you can&apos;t see</span>.
        </h2>
        <p className="text-left text-neutral-500 mt-4 max-w-lg dark:text-neutral-200 text-base md:text-lg tracking-tight font-medium">
          Whether you&apos;re a solo dev protecting a side project or a team lead managing AI spend across 20 engineers — Frugal gives you the visibility and control you need.
        </p>
        <div className="flex items-start sm:items-center flex-col sm:flex-row sm:gap-4">
          <Link href="/signup" className="mt-8">
            <ShimmerButton
              background="rgba(255,80,11,1)"
              shimmerColor="#ffffff"
              borderRadius="8px"
              className="text-base font-semibold gap-2"
            >
              Get started free
              <svg
                stroke="currentColor"
                fill="currentColor"
                strokeWidth="0"
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-3 w-3 mt-0.5"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </ShimmerButton>
          </Link>
          <a href="mailto:support@getfrugal.dev" className="mt-8 flex space-x-2 items-center group text-base px-4 py-2 rounded-lg text-black dark:text-white border border-neutral-200 dark:border-neutral-800 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]">
            <span>Talk to us</span>
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
              className="text-black dark:text-white group-hover:translate-x-1 stroke-[1px] h-3 w-3 mt-0.5 transition-transform duration-200"
            >
              <path d="M15.02 19.52c-2.341 .736 -5 .606 -7.32 -.52l-4.7 1l1.3 -3.9c-2.324 -3.437 -1.426 -7.872 2.1 -10.374c3.526 -2.501 8.59 -2.296 11.845 .48c1.649 1.407 2.575 3.253 2.742 5.152"></path>
              <path d="M19 22v.01"></path>
              <path d="M19 19a2.003 2.003 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483"></path>
            </svg>
          </a>
        </div>
      </div>
      <div className="border-t md:border-t-0 md:border-l border-dashed p-8 md:p-14">
        <p className="text-base text-neutral-700 dark:text-neutral-200">
          &ldquo;In 2025 I lost a product with 50,000 users to a surprise AI
          bill. Frugal is the alarm system I wish I&apos;d had — so I built
          it.&rdquo;
        </p>
        <div className="flex flex-col text-sm items-start mt-4 gap-1">
          <p className="font-bold text-neutral-800 dark:text-neutral-200">
            Nilesh Kumar
          </p>
          <p className="text-neutral-500 dark:text-neutral-400">
            Founder, Frugal
          </p>
        </div>
      </div>
    </section>
  );
}