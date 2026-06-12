"use client"

import { useEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function FeaturesGrid() {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. General section animations
      gsap.from(".feat-heading", {
        scrollTrigger: { trigger: ".feat-heading", start: "top 88%" },
        y: 40,
        autoAlpha: 0,
        duration: 0.75,
        ease: "power3.out",
      })
      gsap.from(".feat-item", {
        scrollTrigger: { trigger: ".feat-item", start: "top 85%" },
        y: 40,
        autoAlpha: 0,
        stagger: { amount: 0.45, from: "start" },
        duration: 0.7,
        ease: "power3.out",
      })

      // 2. Card 1: Chat Bubbles
      gsap.from(".chat-bubble", {
        scrollTrigger: { trigger: ".chat-card", start: "top 80%" },
        y: 20,
        opacity: 0,
        stagger: 0.2,
        duration: 0.6,
        ease: "back.out(1.5)",
      })

      // 3. Card 2: Glowing Lines & Floating Stack
      gsap.fromTo(".glowing-line", 
        { x: -50, opacity: 0 },
        { 
          x: 400, 
          opacity: 1, 
          duration: 2.5, 
          stagger: { each: 0.4, repeat: -1 }, 
          ease: "linear" 
        }
      )
      
      gsap.to(".floating-stack", {
        y: -10,
        duration: 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      })

      // 4. Card 3: Graph Bars & Cursors
      gsap.from(".graph-bar", {
        scrollTrigger: { trigger: ".graph-card", start: "top 80%" },
        scaleX: 0,
        transformOrigin: "left center",
        stagger: 0.05,
        duration: 0.8,
        ease: "power3.out"
      })
      
      gsap.to(".floating-cursor-1", {
        x: "+=15", y: "-=10",
        duration: 3,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      })
      
      gsap.to(".floating-cursor-2", {
        x: "-=12", y: "+=15",
        duration: 2.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      })

      // 5. Card 4: Marquee
      gsap.to(".marquee-inner", {
        xPercent: -50,
        repeat: -1,
        duration: 25,
        ease: "linear"
      })

    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={ref} id="features" className="px-6 py-24 md:px-8 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Heading */}
        <div className="feat-heading mb-14 text-center">
          <p className="mb-3 font-ethnocentric text-[10px] tracking-widest text-primary">
            Features
          </p>
          <h2 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Developer-first <span className="font-playfair italic tracking-normal font-normal">cost control</span>
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
            Everything you need to attribute, enforce, and control AI API spend
            — for individuals and teams — without changing a line of your existing code.
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-4 md:grid-cols-3 md:grid-rows-2">
          
          {/* Card 1 */}
          <div className="feat-item chat-card flex h-full flex-col justify-between rounded-2xl glass-panel backdrop-blur-md p-6 md:p-8 md:col-span-1 md:row-span-1">
            <div className="h-48 w-full overflow-visible rounded-md md:h-full md:min-h-48">
              <div className="flex h-full flex-col justify-center gap-2">
                <div className="chat-bubble flex items-start gap-2 ">
                  <img alt="Frugal Bot" className="size-5 shrink-0 rounded-full object-cover" src="/logo.svg" />
                  <div className="rounded-lg bg-background/50 px-2 py-1 text-xs text-foreground shadow-sm ring-1 ring-border">Warning: OpenAI spend crossed 80% limit!</div>
                </div>
                <div className="chat-bubble flex items-start gap-2 flex-row-reverse">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[8px] font-bold text-primary ring-1 ring-primary/30">You</span>
                  <div className="rounded-lg bg-background/50 px-2 py-1 text-xs text-foreground shadow-sm ring-1 ring-border">Got it, pausing the cron job.</div>
                </div>
                <div className="chat-bubble flex items-start gap-2 ">
                  <img alt="Frugal Bot" className="size-5 shrink-0 rounded-full object-cover" src="/logo.svg" />
                  <div className="rounded-lg bg-background/50 px-2 py-1 text-xs text-foreground shadow-sm ring-1 ring-border">Anthropic usage is at 45% ($225/$500).</div>
                </div>
                <div className="chat-bubble flex items-start gap-2 flex-row-reverse">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-[8px] font-bold text-blue-400 ring-1 ring-blue-500/30">SK</span>
                  <div className="rounded-lg bg-background/50 px-2 py-1 text-xs text-foreground shadow-sm ring-1 ring-border">Looks good, thanks.</div>
                </div>
              </div>
            </div>
            <div className="mt-4 shrink-0">
              <h3 className="font-heading text-lg font-semibold text-foreground">Automatic enforcement, not just alerts</h3>
              <p className="mt-2 text-sm text-muted-foreground">Hard budget blocks and Slack/email fire the moment spend crosses your threshold — before the damage is done, not after.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="feat-item flex h-full flex-col justify-between rounded-2xl glass-panel backdrop-blur-md p-6 md:p-8 md:col-span-1 md:row-span-1">
            <div className="h-48 w-full overflow-visible rounded-md md:h-full md:min-h-48">
              <div className="relative flex h-full items-center justify-center [mask-image:linear-gradient(to_right,transparent,black_20%,black_80%,transparent)]">
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden">
                  <div className="relative h-px w-full"><div className="absolute inset-0 border-t border-dashed border-border/50"></div><div className="glowing-line absolute top-0 h-px w-12 bg-gradient-to-r from-transparent via-primary to-transparent" style={{ opacity: 0 }}></div></div>
                  <div className="relative h-px w-full"><div className="absolute inset-0 border-t border-dashed border-border/50"></div><div className="glowing-line absolute top-0 h-px w-12 bg-gradient-to-r from-transparent via-primary to-transparent" style={{ opacity: 0 }}></div></div>
                  <div className="relative h-px w-full"><div className="absolute inset-0 border-t border-dashed border-border/50"></div><div className="glowing-line absolute top-0 h-px w-12 bg-gradient-to-r from-transparent via-primary to-transparent" style={{ opacity: 0 }}></div></div>
                  <div className="relative h-px w-full"><div className="absolute inset-0 border-t border-dashed border-border/50"></div><div className="glowing-line absolute top-0 h-px w-12 bg-gradient-to-r from-transparent via-primary to-transparent" style={{ opacity: 0 }}></div></div>
                  <div className="relative h-px w-full"><div className="absolute inset-0 border-t border-dashed border-border/50"></div><div className="glowing-line absolute top-0 h-px w-12 bg-gradient-to-r from-transparent via-primary to-transparent" style={{ opacity: 0 }}></div></div>
                </div>
                <div className="relative z-10 flex items-end gap-12">
                  <div className="relative cursor-pointer floating-stack" style={{ perspective: "1000px" }}>
                    <div className="relative" style={{ width: "72px", height: "54px", transformStyle: "preserve-3d" }}>
                      <div className="absolute inset-0 rounded-lg bg-gradient-to-b from-primary/80 to-primary shadow-sm">
                        <div className="absolute left-1.5 rounded-t-sm bg-gradient-to-b from-primary/60 to-primary/80" style={{ top: "-8px", width: "26px", height: "10px" }}></div>
                      </div>
                      <div className="absolute top-1.5 left-1/2 origin-bottom overflow-hidden rounded bg-background shadow-sm ring-1 ring-border" style={{ zIndex: 10, width: "36px", height: "24px", transform: "translateX(calc(-50% + 0px)) translateY(-10px) rotate(-3deg)" }}>
                        <div className="h-full w-full bg-muted flex items-center justify-center text-[8px] font-mono text-muted-foreground">sk-***</div>
                      </div>
                      <div className="absolute top-1.5 left-1/2 origin-bottom overflow-hidden rounded bg-background shadow-sm ring-1 ring-border" style={{ zIndex: 11, width: "36px", height: "24px", transform: "translateX(calc(-50% + 0px)) translateY(-8px)" }}>
                        <div className="h-full w-full bg-muted flex items-center justify-center text-[8px] font-mono text-muted-foreground">sk-***</div>
                      </div>
                      <div className="absolute top-1.5 left-1/2 origin-bottom overflow-hidden rounded bg-background shadow-sm ring-1 ring-border" style={{ zIndex: 12, width: "36px", height: "24px", transform: "translateX(calc(-50% + 0px)) translateY(-6px) rotate(3deg)" }}>
                        <div className="h-full w-full bg-muted flex items-center justify-center text-[8px] font-mono text-muted-foreground">sk-***</div>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-[85%] origin-bottom rounded-lg bg-gradient-to-b from-primary/60 to-primary shadow-sm" style={{ transformStyle: "preserve-3d", zIndex: 20, transform: "rotateX(-25deg)" }}>
                        <div className="absolute top-2 right-2 left-2 h-px bg-primary-foreground/20"></div>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="relative rounded-lg bg-gradient-to-b from-muted to-muted/50 shadow-sm" style={{ width: "56px", height: "72px" }}>
                      <div className="absolute inset-x-1.5 top-1.5 h-3 rounded-sm bg-background shadow-sm ring-1 ring-border">
                        <div className="flex h-full items-center justify-center gap-0.5">
                          <div className="h-1.5 w-px bg-foreground/20"></div>
                          <div className="h-1.5 w-px bg-foreground/20"></div>
                          <div className="h-1.5 w-px bg-foreground/20"></div>
                          <div className="h-1.5 w-px bg-foreground/20"></div>
                          <div className="h-1.5 w-px bg-foreground/20"></div>
                          <div className="h-1.5 w-px bg-foreground/20"></div>
                        </div>
                      </div>
                      <div className="absolute right-1.5 bottom-1.5 left-1.5 flex flex-col gap-1">
                        <div className="h-4 rounded-sm bg-background shadow-sm ring-1 ring-border">
                          <div className="mt-1 ml-1 h-0.5 w-3 rounded-full bg-foreground/20"></div>
                        </div>
                        <div className="h-4 rounded-sm bg-background shadow-sm ring-1 ring-border">
                          <div className="mt-1 ml-1 h-0.5 w-3 rounded-full bg-foreground/20"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 shrink-0">
              <h3 className="font-heading text-lg font-semibold text-foreground">AES-256 encryption</h3>
              <p className="mt-2 text-sm text-muted-foreground">API keys encrypted before storage. Never logged, never exposed in errors or support tickets.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="feat-item graph-card flex h-full flex-col justify-between rounded-2xl glass-panel backdrop-blur-md p-6 md:p-8 md:col-span-1 md:row-span-2">
            <div className="h-48 w-full overflow-visible rounded-md md:h-full md:min-h-48">
              <div className="relative flex h-full items-center justify-center overflow-visible">
                <div className="relative w-full max-w-[200px] rounded-lg bg-background p-3 shadow-sm ring-1 ring-border">
                  <div className="mb-3 flex items-center gap-1.5">
                    <div className="flex gap-1">
                      <div className="size-2 rounded-full bg-red-400"></div>
                      <div className="size-2 rounded-full bg-yellow-400"></div>
                      <div className="size-2 rounded-full bg-green-400"></div>
                    </div>
                    <div className="ml-2 flex gap-1">
                      <div className="h-2 w-10 rounded bg-muted"></div>
                      <div className="h-2 w-8 rounded bg-muted/50"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex flex-col items-end gap-1.5 pr-1 text-[8px] text-muted-foreground">
                      <span className="leading-none">1</span><span className="leading-none">2</span><span className="leading-none">3</span><span className="leading-none">4</span><span className="leading-none">5</span><span className="leading-none">6</span><span className="leading-none">7</span><span className="leading-none">8</span><span className="leading-none">9</span><span className="leading-none">10</span><span className="leading-none">11</span><span className="leading-none">12</span><span className="leading-none">13</span><span className="leading-none">14</span><span className="leading-none">15</span>
                    </div>
                    <div className="flex-1">
                      <div className="my-1 flex items-center" style={{ paddingLeft: "0px" }}><div className="graph-bar h-1.5 rounded-full bg-primary/60" style={{ width: "60%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "8px" }}><div className="graph-bar h-1.5 rounded-full bg-muted" style={{ width: "75%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "8px" }}><div className="graph-bar h-1.5 rounded-full bg-blue-400/60" style={{ width: "50%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "16px" }}><div className="graph-bar h-1.5 rounded-full bg-muted" style={{ width: "80%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "16px" }}><div className="graph-bar h-1.5 rounded-full bg-emerald-400/60" style={{ width: "45%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "16px" }}><div className="graph-bar h-1.5 rounded-full bg-muted" style={{ width: "65%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "8px" }}><div className="graph-bar h-1.5 rounded-full bg-muted" style={{ width: "30%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "0px" }}><div className="graph-bar h-1.5 rounded-full bg-primary/60" style={{ width: "20%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "0px" }}><div className="graph-bar h-1.5 rounded-full bg-transparent" style={{ width: "0%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "0px" }}><div className="graph-bar h-1.5 rounded-full bg-amber-400/60" style={{ width: "55%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "8px" }}><div className="graph-bar h-1.5 rounded-full bg-muted" style={{ width: "70%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "8px" }}><div className="graph-bar h-1.5 rounded-full bg-blue-400/60" style={{ width: "40%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "16px" }}><div className="graph-bar h-1.5 rounded-full bg-muted" style={{ width: "85%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "8px" }}><div className="graph-bar h-1.5 rounded-full bg-muted" style={{ width: "25%" }}></div></div>
                      <div className="my-1 flex items-center" style={{ paddingLeft: "0px" }}><div className="graph-bar h-1.5 rounded-full bg-amber-400/60" style={{ width: "15%" }}></div></div>
                    </div>
                  </div>
                </div>
                <div className="floating-cursor-1 absolute" style={{ transform: "translateX(48.7701px) translateY(28.2785px)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 drop-shadow-sm text-blue-500"><path d="M3.039 4.277l3.904 13.563c.185 .837 .92 1.516 1.831 1.642l.17 .016a2.2 2.2 0 0 0 1.982 -1.006l.045 -.078l1.4 -2.072l4.05 4.05a2.067 2.067 0 0 0 2.924 0l1.047 -1.047c.388 -.388 .606 -.913 .606 -1.461l-.008 -.182a2.067 2.067 0 0 0 -.598 -1.28l-4.047 -4.048l2.103 -1.412c.726 -.385 1.18 -1.278 1.053 -2.189a2.2 2.2 0 0 0 -1.701 -1.845l-13.524 -3.89a1 1 0 0 0 -1.236 1.24z" fill="currentColor" strokeWidth="0"></path></svg>
                  <div className="absolute top-5 left-3 z-50 flex w-max items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 shadow-sm bg-blue-500">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[8px] font-bold text-white ring-1 ring-white/30">SK</span>
                    <span className="shrink-0 text-[10px] font-medium text-white">Sara</span>
                  </div>
                </div>
                <div className="floating-cursor-2 absolute" style={{ transform: "translateX(107.477px) translateY(64.564px)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5 drop-shadow-sm text-emerald-500"><path d="M3.039 4.277l3.904 13.563c.185 .837 .92 1.516 1.831 1.642l.17 .016a2.2 2.2 0 0 0 1.982 -1.006l.045 -.078l1.4 -2.072l4.05 4.05a2.067 2.067 0 0 0 2.924 0l1.047 -1.047c.388 -.388 .606 -.913 .606 -1.461l-.008 -.182a2.067 2.067 0 0 0 -.598 -1.28l-4.047 -4.048l2.103 -1.412c.726 -.385 1.18 -1.278 1.053 -2.189a2.2 2.2 0 0 0 -1.701 -1.845l-13.524 -3.89a1 1 0 0 0 -1.236 1.24z" fill="currentColor" strokeWidth="0"></path></svg>
                  <div className="absolute top-5 left-3 z-50 flex w-max items-center gap-1.5 rounded-full py-1 pr-2.5 pl-1 shadow-sm bg-emerald-500">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[8px] font-bold text-white ring-1 ring-white/30">DV</span>
                    <span className="shrink-0 text-[10px] font-medium text-white">Dev</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 shrink-0">
              <h3 className="font-heading text-lg font-semibold text-foreground">Spend attribution by project, team, and provider</h3>
              <p className="mt-2 text-sm text-muted-foreground">See exactly who spent what — broken down by project, team member, and provider — updated every 5 minutes across your whole org.</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="feat-item marquee-card flex h-full flex-col justify-between rounded-2xl glass-panel backdrop-blur-md p-6 md:p-8 md:col-span-2 md:row-span-1">
            <div className="h-48 w-full overflow-hidden rounded-md md:h-full md:min-h-48">
              <div className="relative flex h-full items-center [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
                <div className="marquee-inner flex items-stretch gap-3 px-4 w-max">
                  {/* Item 1 */}
                  <div className="group relative w-56 shrink-0 rounded-xl">
                    <div className="absolute inset-0 h-full w-full rounded-[inherit] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:5px_5px] bg-fixed shadow-sm ring-1 ring-border [--pattern-fg:var(--color-white)]/5 opacity-20"></div>
                    <div className="relative flex h-full flex-col rounded-xl bg-background/50 p-4 shadow-sm ring-1 ring-border">
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-foreground">A retry loop on staging hammers the API all weekend. The 80% budget alert fires Saturday morning — not on the invoice.</p>
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">Runaway retry loop</p>
                    </div>
                  </div>
                  {/* Item 2 */}
                  <div className="group relative w-56 shrink-0 rounded-xl">
                    <div className="absolute inset-0 h-full w-full rounded-[inherit] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:5px_5px] bg-fixed shadow-sm ring-1 ring-border [--pattern-fg:var(--color-white)]/5 opacity-20"></div>
                    <div className="relative flex h-full flex-col rounded-xl bg-background/50 p-4 shadow-sm ring-1 ring-border">
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-foreground">A prompt tweak doubles output tokens overnight. The spend chart shows the jump the same morning, per project, per provider.</p>
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">Silent prompt regression</p>
                    </div>
                  </div>
                  {/* Item 3 */}
                  <div className="group relative w-56 shrink-0 rounded-xl">
                    <div className="absolute inset-0 h-full w-full rounded-[inherit] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:5px_5px] bg-fixed shadow-sm ring-1 ring-border [--pattern-fg:var(--color-white)]/5 opacity-20"></div>
                    <div className="relative flex h-full flex-col rounded-xl bg-background/50 p-4 shadow-sm ring-1 ring-border">
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-foreground">A forgotten cron job keeps calling an expensive model every minute. Daily spend triples — the alert lands in Slack within five minutes of the threshold.</p>
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">Zombie cron job</p>
                    </div>
                  </div>
                  {/* Item 4 */}
                  <div className="group relative w-56 shrink-0 rounded-xl">
                    <div className="absolute inset-0 h-full w-full rounded-[inherit] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:5px_5px] bg-fixed shadow-sm ring-1 ring-border [--pattern-fg:var(--color-white)]/5 opacity-20"></div>
                    <div className="relative flex h-full flex-col rounded-xl bg-background/50 p-4 shadow-sm ring-1 ring-border">
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-foreground">A demo link goes viral and traffic spikes 20x. The daily limit holds the line while you decide what to do — before the month-end surprise.</p>
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">Viral traffic spike</p>
                    </div>
                  </div>
                  
                  {/* Duplicated Items for seamless loop */}
                  {/* Item 1 (Dup) */}
                  <div className="group relative w-56 shrink-0 rounded-xl">
                    <div className="absolute inset-0 h-full w-full rounded-[inherit] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:5px_5px] bg-fixed shadow-sm ring-1 ring-border [--pattern-fg:var(--color-white)]/5 opacity-20"></div>
                    <div className="relative flex h-full flex-col rounded-xl bg-background/50 p-4 shadow-sm ring-1 ring-border">
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-foreground">A retry loop on staging hammers the API all weekend. The 80% budget alert fires Saturday morning — not on the invoice.</p>
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">Runaway retry loop</p>
                    </div>
                  </div>
                  {/* Item 2 (Dup) */}
                  <div className="group relative w-56 shrink-0 rounded-xl">
                    <div className="absolute inset-0 h-full w-full rounded-[inherit] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:5px_5px] bg-fixed shadow-sm ring-1 ring-border [--pattern-fg:var(--color-white)]/5 opacity-20"></div>
                    <div className="relative flex h-full flex-col rounded-xl bg-background/50 p-4 shadow-sm ring-1 ring-border">
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-foreground">A prompt tweak doubles output tokens overnight. The spend chart shows the jump the same morning, per project, per provider.</p>
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">Silent prompt regression</p>
                    </div>
                  </div>
                  {/* Item 3 (Dup) */}
                  <div className="group relative w-56 shrink-0 rounded-xl">
                    <div className="absolute inset-0 h-full w-full rounded-[inherit] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:5px_5px] bg-fixed shadow-sm ring-1 ring-border [--pattern-fg:var(--color-white)]/5 opacity-20"></div>
                    <div className="relative flex h-full flex-col rounded-xl bg-background/50 p-4 shadow-sm ring-1 ring-border">
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-foreground">A forgotten cron job keeps calling an expensive model every minute. Daily spend triples — the alert lands in Slack within five minutes of the threshold.</p>
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">Zombie cron job</p>
                    </div>
                  </div>
                  {/* Item 4 (Dup) */}
                  <div className="group relative w-56 shrink-0 rounded-xl">
                    <div className="absolute inset-0 h-full w-full rounded-[inherit] bg-[image:repeating-linear-gradient(315deg,_var(--pattern-fg)_0,_var(--pattern-fg)_1px,_transparent_0,_transparent_50%)] bg-[size:5px_5px] bg-fixed shadow-sm ring-1 ring-border [--pattern-fg:var(--color-white)]/5 opacity-20"></div>
                    <div className="relative flex h-full flex-col rounded-xl bg-background/50 p-4 shadow-sm ring-1 ring-border">
                      <p className="mb-3 flex-1 text-xs leading-relaxed text-foreground">A demo link goes viral and traffic spikes 20x. The daily limit holds the line while you decide what to do — before the month-end surprise.</p>
                      <p className="text-[10px] font-mono font-semibold uppercase tracking-wider text-primary">Viral traffic spike</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 shrink-0">
              <h3 className="font-heading text-lg font-semibold text-foreground">Budget governance for every failure mode</h3>
              <p className="mt-2 text-sm text-muted-foreground">Whether it&apos;s a solo dev&apos;s runaway loop or a team&apos;s unchecked model usage — Frugal catches it early instead of letting it show up on the invoice.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}