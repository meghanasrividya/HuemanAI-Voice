import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  Bot,
  Check,
  Download,
  PlugZap,
  Search,
  Shield,
} from "lucide-react";

function FeatureCard({
  icon,
  title,
  description,
  delayMs,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  delayMs?: number;
}) {
  return (
    <div
      className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(0,0,0,0.55)] animate-fade-in"
      style={delayMs ? { animationDelay: `${delayMs}ms` } : undefined}
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10 transition-colors group-hover:bg-white/[0.08]">
        {icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/65">{description}</p>
    </div>
  );
}

export default function Home() {
  const userName: string | null = null;
  const isLoggedIn = Boolean(userName);

  return (
    <div className="min-h-dvh bg-[#050505] text-white selection:bg-white/10">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {[
          {
            className:
              "absolute left-1/2 top-1/2 h-[70vw] w-[70vw] md:h-[700px] md:w-[700px] rounded-full blur-3xl animate-movable-glow",
            style: {
              background:
                "radial-gradient(circle, rgba(247, 85, 20, 0.08) 0%, rgba(247, 85, 20, 0.05) 40%, transparent 100%)",
              animationDelay: "4s",
            },
          },
          {
            className:
              "absolute right-1/3 top-2/3 h-[60vw] w-[60vw] md:h-[600px] md:w-[600px] rounded-full blur-3xl animate-movable-glow",
            style: {
              background:
                "radial-gradient(circle, rgba(255, 121, 23, 0.11) 0%, rgba(255, 121, 23, 0.07) 40%, transparent 100%)",
              animationDelay: "2s",
            },
          },
          {
            className:
              "absolute left-1/3 top-1/2 h-[65vw] w-[65vw] md:h-[650px] md:w-[650px] rounded-full blur-3xl animate-movable-glow",
            style: {
              background:
                "radial-gradient(circle, rgba(255, 156, 26, 0.09) 0%, rgba(255, 156, 26, 0.05) 40%, transparent 100%)",
              animationDelay: "5s",
            },
          },
          {
            className:
              "absolute left-0 top-0 h-[500px] w-[500px] rounded-full blur-3xl animate-movable-glow",
            style: {
              background:
                "radial-gradient(circle, rgba(255, 121, 23, 0.08) 0%, rgba(255, 121, 23, 0.05) 40%, transparent 100%)",
              animationDelay: "6s",
            },
          },
          {
            className:
              "absolute right-0 top-0 h-[500px] w-[500px] rounded-full blur-3xl animate-movable-glow",
            style: {
              background:
                "radial-gradient(circle, rgba(247, 85, 20, 0.08) 0%, rgba(247, 85, 20, 0.05) 40%, transparent 100%)",
              animationDelay: "2.2s",
            },
          },
          {
            className:
              "absolute left-0 bottom-0 h-[500px] w-[500px] rounded-full blur-3xl animate-movable-glow",
            style: {
              background:
                "radial-gradient(circle, rgba(255, 156, 26, 0.08) 0%, rgba(255, 156, 26, 0.05) 40%, transparent 100%)",
              animationDelay: "5.5s",
            },
          },
          {
            className:
              "absolute right-0 bottom-0 h-[500px] w-[500px] rounded-full blur-3xl animate-movable-glow",
            style: {
              background:
                "radial-gradient(circle, rgba(255, 121, 23, 0.08) 0%, rgba(255, 121, 23, 0.05) 40%, transparent 100%)",
              animationDelay: "3.8s",
            },
          },
          {
            className:
              "absolute left-1/4 top-1/4 h-[40vw] w-[40vw] md:h-[400px] md:w-[400px] rounded-full bg-white/[0.02] blur-3xl animate-movable-glow",
            style: { animationDelay: "5s" },
          },
          {
            className:
              "absolute right-1/4 bottom-1/4 h-[35vw] w-[35vw] md:h-[350px] md:w-[350px] rounded-full bg-white/[0.015] blur-3xl animate-movable-glow",
            style: { animationDelay: "6.5s" },
          },
          {
            className:
              "absolute left-1/2 top-1/3 h-[45vw] w-[45vw] md:h-[450px] md:w-[450px] rounded-full bg-white/[0.018] blur-3xl animate-movable-glow",
            style: { animationDelay: "7s" },
          },
          {
            className:
              "absolute right-1/3 bottom-1/2 h-[40vw] w-[40vw] md:h-[400px] md:w-[400px] rounded-full bg-white/[0.015] blur-3xl animate-movable-glow",
            style: { animationDelay: "4.2s" },
          },
        ].map((g, idx) => (
          <div key={idx} className={g.className} style={g.style as any} />
        ))}
      </div>

      <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-black/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-10">
          <div className="text-[42px] font-semibold leading-none tracking-tight text-white">
            HuëmanAI
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-14 text-base">
              <span className="text-white/60">
                Welcome, <span className="text-white/80">{userName}</span>
              </span>
              <Link href="/dashboard" className="font-semibold text-white">
                Dashboard
              </Link>
            </div>
          ) : (
            <Link href="/login" className="text-base font-semibold text-white">
              Login
            </Link>
          )}
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative flex min-h-dvh items-center justify-center px-4 pt-20">
          <div className="mx-auto w-full max-w-6xl py-20">
            <div className="relative space-y-8 rounded-2xl py-20 text-center animate-fade-in">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div
                  className="absolute h-[80vw] w-[80vw] rounded-full blur-3xl animate-movable-glow md:h-[1000px] md:w-[1000px]"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(247, 85, 20, 0.15) 0%, rgba(255, 121, 23, 0.12) 40%, rgba(255, 156, 26, 0.08) 30%, transparent 100%)",
                  }}
                />
              </div>

              <div className="relative space-y-4">
                <div
                  className="pointer-events-none absolute left-1/2 top-1/2 h-[60vw] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-text-glow-move md:h-[500px] md:w-[800px]"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(255, 121, 23, 0.60) 0%, rgba(255, 121, 23, 0.40) 40%, rgba(255, 121, 23, 0.20) 70%, transparent 100%)",
                  }}
                />

                <h1 className="relative z-10 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl">
                  Intelligent Conversations.
                  <br />
                  <span>Complete Control.</span>
                </h1>
                <p className="relative z-10 mx-auto max-w-3xl text-lg text-white/60 md:text-xl">
                  HuemanAI Voice Agents handle every call — from reservations to
                  feedback — with real-time insights, AI summaries, and
                  actionable analytics.
                </p>
              </div>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/login"
                  className="group inline-flex h-12 items-center justify-center rounded-md border border-white/10 bg-[#f3d7c7] px-8 text-base font-medium text-black shadow-lg transition-all hover:shadow-xl hover:scale-105"
                >
                  Login to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 text-black" />
                </Link>
                <Link
                  href="#"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-white/10 bg-white/5 px-8 text-base font-medium text-white/90 transition-all hover:bg-white/10 hover:scale-105"
                >
                  Request Demo
                </Link>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/55">
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-white" />
                  <span>Enterprise-grade security</span>
                </span>
                <span className="text-white/15">•</span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-white" />
                  <span>GDPR compliant</span>
                </span>
                <span className="text-white/15">•</span>
                <span className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-white" />
                  <span>99.9% uptime</span>
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-8 pt-10 text-center">
          <h2 className="mx-auto max-w-4xl text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            Everything you need to manage voice interactions
          </h2>
          <p className="mt-4 text-sm text-white/55 sm:text-base">
            Powerful AI-driven features that transform how you handle calls
          </p>

          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Bot className="h-6 w-6 text-white" />}
              title="AI Handled Calls"
              description="Every call, transcribed, categorized, and analyzed automatically."
              delayMs={0}
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-white" />}
              title="Smart Insights"
              description="See sentiment, conversions, and CX metrics in real time."
              delayMs={100}
            />
            <FeatureCard
              icon={<PlugZap className="h-6 w-6 text-white" />}
              title="Effortless Integrations"
              description="Connect Twilio, SevenRooms, Salesforce, and more in seconds."
              delayMs={200}
            />
            <FeatureCard
              icon={<Shield className="h-6 w-6 text-white" />}
              title="Enterprise Security"
              description="End-to-end encryption, GDPR compliant, enterprise ready."
              delayMs={300}
            />
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                Your Voice Data, Visualized
              </h2>
              <p className="mt-4 text-lg text-white/55">
                Powerful dashboards that make sense of every conversation
              </p>
            </div>

            <div className="relative rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-1 shadow-2xl">
              <div className="rounded-xl bg-black/60 p-8 backdrop-blur-sm">
                <div className="flex flex-col items-stretch justify-between gap-4 border-b border-white/10 pb-6 md:flex-row md:items-center">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-lg font-semibold text-white">
                      Dashboard
                    </div>
                    <div className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-black/30 p-1 text-sm text-white/70">
                      <span className="rounded-full px-3 py-1.5 text-white/55">
                        All
                      </span>
                      <span className="rounded-full px-3 py-1.5 text-white/55">
                        Reservation
                      </span>
                      <span className="rounded-full px-3 py-1.5 text-white/55">
                        Sales
                      </span>
                      <span className="rounded-full bg-white px-3 py-1.5 font-semibold text-black">
                        Feedback
                      </span>
                      <span className="rounded-full px-3 py-1.5 text-white/55">
                        Enquiry
                      </span>
                      <span className="rounded-full px-3 py-1.5 text-white/55">
                        Support
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-3 md:justify-end">
                    <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/70">
                      All Sites
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/70">
                      Last 7 days
                    </div>
                    <button className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white/80">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                    <button className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white/80">
                      <Search className="h-4 w-4" />
                    </button>
                  </div>
                </div>

            <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/35 p-6 text-left">
                <div className="text-xs font-semibold tracking-widest text-white/60">
                  ASPECT SENTIMENT (FEEDBACK)
                </div>
                <div className="mt-1 text-xs text-white/45">
                  Sentiment breakdown by aspect
                </div>

                <div className="mt-6 space-y-5">
                  {[
                    { label: "Food", value: 82 },
                    { label: "Service", value: 75 },
                    { label: "Ambience", value: 88 },
                    { label: "Price", value: 58 },
                    { label: "Staff", value: 79 },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                        <span>{row.label}</span>
                        <span className="text-white/50">{row.value}% positive</span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-white/55"
                          style={{ width: `${row.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/35 p-6 text-left">
                <div className="text-xs font-semibold tracking-widest text-white/60">
                  FORECAST VS ACTUAL
                </div>
                <div className="mt-1 text-xs text-white/45">
                  Actual +7.5% vs forecast (last 7 days)
                </div>

                <div className="mt-8 h-44 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02))] p-4">
                  <div className="h-full w-full rounded-xl bg-[radial-gradient(closest-side,rgba(255,255,255,0.14),rgba(255,255,255,0))]" />
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-black/35 p-6 text-left">
                <div className="text-xs font-semibold tracking-widest text-white/60">
                  COMPLAINT TOPICS
                </div>
                <div className="mt-1 text-xs text-white/45">
                  Most common complaint categories
                </div>

                <div className="mt-6 grid grid-cols-[140px_1fr] gap-6">
                  <div className="flex items-center justify-center">
                    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-white/10">
                      <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_220deg,rgba(255,255,255,0.80)_0deg,rgba(255,255,255,0.80)_140deg,rgba(255,255,255,0.15)_140deg,rgba(255,255,255,0.15)_360deg)]" />
                      <div className="relative flex h-20 w-20 flex-col items-center justify-center rounded-full bg-black/60 text-center ring-1 ring-white/10">
                        <div className="text-2xl font-semibold text-white">
                          100
                        </div>
                        <div className="text-xs text-white/55">Total</div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm text-white/65">
                    {[
                      { label: "Service Delay", value: "38 (38.0%)" },
                      { label: "Order Error", value: "25 (25.0%)" },
                      { label: "Staff Attitude", value: "18 (18.0%)" },
                      { label: "Billing", value: "12 (12.0%)" },
                      { label: "Other", value: "7 (7.0%)" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-white/55" />
                          <span>{row.label}</span>
                        </div>
                        <span className="text-white/45">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/35 p-6 text-left">
                <div className="text-xs font-semibold tracking-widest text-white/60">
                  COMMON KEYWORDS
                </div>
                <div className="mt-1 text-xs text-white/45">
                  AI extracted from feedback transcripts
                </div>

                <div className="mt-8 flex h-40 flex-wrap items-center justify-center gap-x-5 gap-y-4 text-white/55">
                  <span className="text-4xl font-semibold text-white">
                    excellent
                  </span>
                  <span className="text-3xl">slow</span>
                  <span className="text-3xl">delicious</span>
                  <span className="text-3xl">cold</span>
                  <span className="text-3xl">friendly</span>
                  <span className="text-xl">noisy</span>
                  <span className="text-2xl">fresh</span>
                  <span className="text-2xl">expensive</span>
                  <span className="text-4xl font-semibold text-white/85">
                    amazing
                  </span>
                  <span className="text-xl">disappointing</span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {[
                { value: "1,247", label: "Calls Today" },
                { value: "94%", label: "Positive Sentiment" },
                { value: "68%", label: "Conversion Rate" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-white/10 bg-black/30 px-8 py-6 text-center"
                >
                  <div className="text-3xl font-semibold text-white">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-white/55">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-14 pt-8 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            Trusted by leading hospitality brands
          </h2>

          <div className="mx-auto mt-10 w-full max-w-6xl overflow-hidden">
            <div className="flex animate-scroll whitespace-nowrap">
              {[
                { src: "/Assets/company-logo/fna.png", alt: "FnA Technology" },
                { src: "/Assets/company-logo/be_logo_color.png", alt: "Belong Earth" },
                { src: "/Assets/company-logo/chakra.png", alt: "Chakra" },
                { src: "/Assets/company-logo/royal.webp", alt: "RoyalNest" },
                { src: "/Assets/company-logo/orufy.svg", alt: "Orufy" },
                { src: "/Assets/company-logo/dgc.png", alt: "DGC" },
                { src: "/Assets/company-logo/fna.png", alt: "FnA Technology" },
                { src: "/Assets/company-logo/be_logo_color.png", alt: "Belong Earth" },
                { src: "/Assets/company-logo/chakra.png", alt: "Chakra" },
                { src: "/Assets/company-logo/royal.webp", alt: "RoyalNest" },
                { src: "/Assets/company-logo/orufy.svg", alt: "Orufy" },
                { src: "/Assets/company-logo/dgc.png", alt: "DGC" },
              ].map((logo, idx) => (
                <div
                  key={`${logo.alt}-${idx}`}
                  className="mx-6 flex shrink-0 items-center md:mx-8 lg:mx-10"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={120}
                    height={48}
                    className="h-10 w-auto select-none object-contain grayscale opacity-50 transition duration-300 hover:opacity-80 hover:grayscale-0"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-16 pt-12 text-center">
          <div className="mx-auto max-w-4xl rounded-[34px] border border-white/10 bg-white/[0.04] px-8 py-14 backdrop-blur-md">
            <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready to Experience AI-Driven Voice Automation?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-white/55 sm:text-base">
              Join leading hospitality brands using HuemanAI to transform their
              guest communications
            </p>

            <div className="mt-10 flex justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-9 py-3.5 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 bg-black/30">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 md:grid-cols-2">
          <div>
            <div className="text-4xl font-semibold tracking-tight text-white">
              HuëmanAI
            </div>
            <p className="mt-8 max-w-md text-sm leading-relaxed text-white/55">
              AI-powered voice automation for the hospitality industry.
              <br />
              <span className="text-white/40">by FNA Technology LLP</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 md:justify-self-end">
            <div>
              <div className="text-sm font-semibold text-white">Product</div>
              <div className="mt-5 space-y-3 text-sm text-white/55">
                <Link href="/login" className="block hover:text-white">
                  Login
                </Link>
                <Link href="/dashboard" className="block hover:text-white">
                  Features
                </Link>
                <Link href="/dashboard" className="block hover:text-white">
                  Pricing
                </Link>
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">Legal</div>
              <div className="mt-5 space-y-3 text-sm text-white/55">
                <Link href="#" className="block hover:text-white">
                  Privacy Policy
                </Link>
                <Link href="#" className="block hover:text-white">
                  Terms of Service
                </Link>
                <Link href="#" className="block hover:text-white">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-8 text-center text-sm text-white/45">
          © {new Date().getFullYear()} HuemanAI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
