import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarHeart,
  Check,
  ChevronDown,
  Flower2,
  Heart,
  LoaderCircle,
  Quote,
  Scissors,
  ShieldCheck,
  Sparkles,
  Store,
  Sun,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Layout } from "@/components/layout/Layout";
import { Container } from "@/components/layout/Container";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { submitWaitlistSignup } from "@/lib/submissions";
import { trackEvent } from "@/lib/analytics";

/* -------------------------------------------------------------- shared bits */

const Eyebrow = ({ children }: { children: string }) => (
  <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{children}</p>
);

const Tick = ({ children }: { children: string }) => (
  <li className="flex items-start gap-3">
    <span className="mt-px grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full bg-background/15 text-primary">
      <Check className="h-3 w-3" />
    </span>
    {children}
  </li>
);

/* --------------------------------------------------------------------- hero */

const TRUST_POINTS = [
  { icon: ShieldCheck, label: "0% interest" },
  { icon: Wallet, label: "3 easy payments" },
  { icon: Heart, label: "Soft credit check" },
];

const Hero = () => (
  <section className="relative overflow-hidden bg-glow">
    {/* Decorative bloom behind the hero. Purely atmospheric, hence aria-hidden. */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-[140px] -top-[180px] h-[620px] w-[620px] rounded-full"
      style={{ background: "radial-gradient(circle, hsl(357 80% 85% / .55), transparent 68%)" }}
    />

    <Container className="relative grid items-center gap-16 py-20 md:py-24 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:pb-24 lg:pt-[88px]">
      <div>
        <span className="inline-flex w-fit items-center rounded-sm bg-primary px-3 py-1.5 font-display text-xs font-extrabold uppercase tracking-[0.22em] text-primary-foreground">
          Glow now, pay later
        </span>

        <h1 className="mt-[26px] font-display text-[clamp(3.25rem,10vw,5.75rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.035em]">
          After
          <span className="block text-primary">Glow</span>
        </h1>

        <p className="mt-[22px] font-display text-[15px] font-bold uppercase tracking-[0.18em] text-foreground/[0.78]">
          Beauty and wellness, on your terms.
        </p>

        <p className="mt-[26px] max-w-[460px] text-lg leading-relaxed text-muted-foreground">
          Split beauty treatments, wellness sessions and luxury products into three interest-free payments. Nothing to
          pay upfront. Self-care, made effortless.
        </p>

        <div className="mt-[34px] flex flex-wrap gap-3">
          <Button asChild size="lg" className="rounded-full px-7">
            <Link to="/waitlist">Join the waitlist</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full px-7">
            <a href="#how-it-works">
              How it works <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-x-[26px] gap-y-3 text-xs text-muted-foreground">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* The price card overlaps the portrait on desktop; below lg it stacks so
          nothing is clipped on a narrow screen. */}
      <div className="relative">
        <ImagePlaceholder
          caption="Hero portrait — treatment in progress"
          align="top"
          className="h-[380px] w-full sm:h-[540px]"
        />

        <div className="mt-6 w-full rounded-3xl bg-card p-[22px] shadow-soft lg:absolute lg:-left-[46px] lg:bottom-11 lg:mt-0 lg:w-[300px]">
          <p className="text-xs uppercase tracking-[0.2em] text-primary">Radiance Facial</p>
          <p className="mb-4 mt-2 font-display text-[30px] font-bold tracking-[-0.02em]">£120.00</p>
          <div className="flex gap-2">
            {["Today", "In 2 wks", "In 4 wks"].map((when, i) => (
              <div
                key={when}
                className={`flex-1 rounded-xl px-2 py-2.5 text-center ${
                  i === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                }`}
              >
                <p className="font-display text-lg font-bold">£40</p>
                <p className="mt-[3px] text-xs uppercase tracking-[0.08em] opacity-80">{when}</p>
              </div>
            ))}
          </div>
          <p className="mt-3.5 text-xs text-muted-foreground">0% interest · No upfront payment</p>
        </div>
      </div>
    </Container>
  </section>
);

/* ------------------------------------------------------------------ marquee */

const MARQUEE_ITEMS = [
  "0% interest, always",
  "Nothing to pay upfront",
  "Soft credit check only",
  "Trusted UK partners",
  "Three easy payments",
];

/**
 * Trust strip. The design centres a single nowrap row and lets it clip at both
 * edges on a wide screen. That is fine there, but on a phone it would hide most
 * of the row, so below md it scrolls instead of clipping.
 */
const Marquee = () => (
  <div className="overflow-x-auto bg-foreground py-[18px] text-background [scrollbar-width:none] md:overflow-hidden [&::-webkit-scrollbar]:hidden">
    <div className="flex w-max items-center gap-10 px-6 font-display text-[13px] font-bold uppercase tracking-[0.22em] md:w-auto md:justify-center md:px-0">
      {MARQUEE_ITEMS.map((item, i) => (
        <span key={item} className="flex items-center gap-10 whitespace-nowrap">
          {item}
          {i < MARQUEE_ITEMS.length - 1 ? <span className="text-primary">✳</span> : null}
        </span>
      ))}
    </div>
  </div>
);

/* -------------------------------------------------------------------- steps */

const STEPS = [
  { n: "01", t: "Choose your treatment", d: "Browse partner salons, spas and wellness studios in our network." },
  {
    n: "02",
    t: "Split into 3 payments",
    d: "Spread the cost across three interest-free payments, with nothing to pay upfront.",
  },
  { n: "03", t: "Glow and enjoy", d: "Show up, relax, and feel beautiful. We will handle the rest." },
];

const Steps = () => (
  <Container className="scroll-mt-24 py-20 md:py-[104px]" id="how-it-works">
    <div className="grid items-end gap-12 lg:grid-cols-2">
      <div>
        <Eyebrow>How it works</Eyebrow>
        <h2 className="mt-3.5 max-w-[460px] font-display text-[clamp(2.25rem,5vw,3.375rem)] leading-[1.02]">
          Three steps to your glow.
        </h2>
      </div>
      <p className="max-w-[420px] text-base leading-[1.7] text-muted-foreground lg:justify-self-end">
        No hidden fees, no interest, no deposit. You book the treatment you actually want, and pay for it the way that
        suits you.
      </p>
    </div>

    <div className="relative mt-14">
      {/* Connector between the three numbered discs — desktop only, where the
          steps actually sit in a row. */}
      <div
        aria-hidden="true"
        className="absolute left-[16%] right-[16%] top-[34px] hidden h-px bg-primary/45 md:block"
      />
      <div className="relative grid gap-8 md:grid-cols-3">
        {STEPS.map((step) => (
          <div key={step.n} className="text-center">
            <div className="mx-auto grid h-[68px] w-[68px] place-items-center rounded-full border border-primary/50 bg-background font-display text-[22px] font-bold text-primary">
              {step.n}
            </div>
            <h3 className="mt-[26px] font-display text-2xl">{step.t}</h3>
            <p className="mx-auto mt-2.5 max-w-[290px] text-[15px] leading-relaxed text-muted-foreground">{step.d}</p>
          </div>
        ))}
      </div>
    </div>
  </Container>
);

/* --------------------------------------------------------------- categories */

const CATEGORIES = [
  { icon: Flower2, label: "Facials & skin" },
  { icon: Scissors, label: "Hair" },
  { icon: Heart, label: "Massage & spa" },
  { icon: Sparkles, label: "Lashes & brows" },
  { icon: Zap, label: "Laser & injectables" },
  { icon: Sun, label: "Tanning & nails" },
];

const Categories = () => (
  <section className="bg-blush py-20 md:py-24">
    <Container>
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <Eyebrow>What you can book</Eyebrow>
          <h2 className="mt-3.5 font-display text-[clamp(2rem,4.5vw,2.875rem)] leading-[1.05]">
            Everything that makes you feel like you.
          </h2>
        </div>
        <Button asChild variant="outline" className="shrink-0 rounded-full">
          <Link to="/book">
            See all treatments <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-11 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-3xl border border-border/60 bg-card px-[26px] py-[22px] shadow-card-soft"
          >
            <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-primary/[0.16] text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-bold tracking-[-0.02em]">{label}</span>
          </div>
        ))}
      </div>
    </Container>
  </section>
);

/* ---------------------------------------------------------------- audiences */

const MERCHANT_POINTS = ["Paid in full, next business day", "0% risk. We cover the credit", "No integration, no POS changes"];

const Audiences = () => (
  <Container className="py-20 md:py-[104px]">
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="overflow-hidden rounded-3xl border-0 shadow-soft">
        <ImagePlaceholder caption="Client after a treatment" rounded="rounded-none" className="h-[230px] w-full" />
        <CardContent className="p-10">
          <CalendarHeart className="h-[30px] w-[30px] text-primary" />
          <h3 className="mt-[18px] font-display text-[32px]">For glow-getters</h3>
          <p className="mt-3.5 text-base leading-relaxed text-muted-foreground">
            Book any treatment and split the cost into three interest-free payments, with nothing to pay upfront. Total
            transparency, no surprises.
          </p>
          <Button asChild size="lg" className="mt-[30px] w-fit rounded-full">
            <Link to="/book">Book now</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-3xl border-0 bg-foreground text-background shadow-soft">
        <CardContent className="flex h-full flex-col p-10">
          <Store className="h-[30px] w-[30px] text-primary" />
          <h3 className="mt-[18px] font-display text-[32px]">For merchants</h3>
          <p className="mt-3.5 text-base leading-relaxed text-background/70">
            Attract new clients and grow repeat bookings. Get paid in full the next business day whilst we handle the
            rest.
          </p>
          <ul className="mt-[26px] flex flex-col gap-3 text-sm text-background/80">
            {MERCHANT_POINTS.map((point) => (
              <Tick key={point}>{point}</Tick>
            ))}
          </ul>
          <Button asChild variant="secondary" size="lg" className="mt-auto w-fit rounded-full">
            <Link to="/merchants">Become a partner</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  </Container>
);

/* -------------------------------------------------------------------- quote */

const Testimonial = () => (
  <section className="bg-secondary py-20 md:py-24">
    <Container className="grid items-center gap-12 md:grid-cols-[auto_1fr]">
      <ImagePlaceholder
        caption="Client portrait"
        rounded="rounded-full"
        className="mx-auto h-[200px] w-[200px] shrink-0 md:mx-0"
      />
      <div>
        <Quote className="h-[30px] w-[30px] text-primary" />
        <p className="mt-4 max-w-[760px] text-pretty font-display text-[clamp(1.5rem,3.5vw,2.125rem)] font-bold leading-[1.25] tracking-[-0.02em]">
          I had been putting off the same appointment for a year. Splitting it into three made it something I could
          actually book.
        </p>
        <p className="mt-[22px] text-sm text-muted-foreground">Ava R. · London · Waitlist member</p>
      </div>
    </Container>
  </section>
);

/* ---------------------------------------------------------------------- faq */

const FAQ_ITEMS = [
  {
    q: "Is there any interest?",
    a: "No. AfterGlow is 0% interest on every plan, every time. The price you see is the price you pay, split into three.",
  },
  {
    q: "Do you run a credit check?",
    a: "A soft check only, which never affects your credit score. It takes a few seconds and happens while you book.",
  },
  {
    q: "When do the payments come out?",
    a: "There is nothing to pay upfront. Your three payments are taken automatically every two weeks from the day you book.",
  },
  {
    q: "What if I need to cancel?",
    a: "Cancellation is handled by the salon under their own policy. If a treatment is refunded, we cancel the remaining payments.",
  },
];

const Faq = () => {
  const [open, setOpen] = useState(0);

  return (
    <Container className="grid gap-16 py-20 md:py-[104px] lg:grid-cols-[0.8fr_1.2fr]">
      <div>
        <Eyebrow>Good to know</Eyebrow>
        <h2 className="mt-3.5 font-display text-[clamp(2rem,4.5vw,2.875rem)] leading-[1.05]">Questions, answered.</h2>
        <p className="mt-[18px] text-[15px] leading-[1.7] text-muted-foreground">
          Still not sure? Email us at{" "}
          <a href="mailto:hello@afterglowcredit.com" className="text-primary hover:underline">
            hello@afterglowcredit.com
          </a>{" "}
          and a person will reply.
        </p>
      </div>

      <div>
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className="border-b border-border/80">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-trigger-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center justify-between gap-6 py-[22px] text-left font-display text-[19px] font-bold tracking-[-0.02em] text-foreground"
              >
                {item.q}
                <ChevronDown
                  className={`h-[18px] w-[18px] shrink-0 text-primary transition-transform duration-200 ease-in-out ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>
              {isOpen ? (
                <p
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${i}`}
                  className="mb-[22px] max-w-[620px] text-[15px] leading-relaxed text-muted-foreground"
                >
                  {item.a}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </Container>
  );
};

/* ---------------------------------------------------------------------- cta */

const ctaSchema = z.string().trim().email({ message: "Please enter a valid email" }).max(255);

const Cta = () => {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;

    trackEvent("af_form_submit", { af_form_id: "home_cta" });

    const parsed = ctaSchema.safeParse(email);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      trackEvent("af_form_error", { af_form_id: "home_cta", error_type: "validation" });
      return;
    }

    setPending(true);
    // No treatments here — this is a quick capture. The mutation keeps any
    // preferences the person already picked on /waitlist.
    const result = await submitWaitlistSignup({ email: parsed.data.toLowerCase(), treatments: [] });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      trackEvent("af_form_error", { af_form_id: "home_cta", error_type: "server" });
      return;
    }

    // form_location distinguishes this quick capture from the full waitlist
    // page, so the two entry points can be compared.
    if (result.duplicate) {
      trackEvent("waitlist_duplicate", { form_location: "home_cta" });
    } else {
      trackEvent("generate_lead", { lead_source: "waitlist_form", form_location: "home_cta" });
    }

    setDone(true);
    toast.success(result.duplicate ? "You are already on the list ✨" : "You are on the list! ✨");
  };

  return (
    <section className="bg-blush py-20 md:py-[104px]">
      <Container>
        <Card className="rounded-3xl border-0 bg-foreground text-background shadow-soft">
          <CardContent className="grid items-center gap-12 p-10 md:p-16 lg:grid-cols-[1.3fr_1fr]">
            <div>
              <span className="inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 font-display text-xs font-extrabold uppercase tracking-[0.22em] text-primary-foreground">
                Early access
              </span>
              <h2 className="mt-5 font-display text-[clamp(2.125rem,5vw,3.125rem)] leading-[1.03]">
                Be first to <em className="not-italic text-primary">glow</em>.
              </h2>
              <p className="mt-5 max-w-[480px] text-base leading-relaxed text-background/70">
                Join the waitlist for £10 welcome credit and first dibs on launches near you.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {done ? (
                <div className="flex items-center gap-3 rounded-2xl bg-background/10 p-5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </span>
                  <p className="text-sm text-background/80">
                    You are on the list. We will email you the moment AfterGlow launches.
                  </p>
                </div>
              ) : (
                <>
                  <form
                    id="home_cta"
                    name="home_cta"
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-3 sm:flex-row"
                  >
                    <Input
                      type="email"
                      required
                      maxLength={255}
                      aria-label="Email address"
                      placeholder="ava@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="h-12 border-background/[0.28] bg-background/10 text-background placeholder:text-background/60"
                    />
                    <Button type="submit" size="lg" disabled={pending} className="shrink-0 rounded-full">
                      {pending ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Counting you in…
                        </>
                      ) : (
                        "Count me in ✨"
                      )}
                    </Button>
                  </form>
                  <p className="text-xs text-background/[0.55]">
                    By joining, you agree to receive launch updates from AfterGlow.
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
};

/* --------------------------------------------------------------------- page */

const Index = () => (
  <Layout>
    <Hero />
    <Marquee />
    <Steps />
    <Categories />
    <Audiences />
    <Testimonial />
    <Faq />
    <Cta />
  </Layout>
);

export default Index;
