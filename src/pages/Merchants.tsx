import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChartColumn,
  Check,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitMerchantApplication } from "@/lib/submissions";

const merchantSchema = z.object({
  business_name: z.string().trim().min(1, { message: "Business name is required" }).max(200),
  category: z.string().trim().max(100).optional(),
  contact_name: z.string().trim().min(1, { message: "Your name is required" }).max(100),
  role: z.string().trim().max(100).optional(),
  email: z.string().trim().email({ message: "Please enter a valid email" }).max(255),
  locations: z.number().int().min(1).max(10000),
  message: z.string().trim().max(2000).optional(),
});

const HERO_STATS = [
  { icon: Users, label: "Repeat bookings" },
  { icon: Zap, label: "Funded upfront" },
];

const BENEFITS = [
  {
    icon: Wallet,
    t: "Get paid upfront",
    d: "Receive the full treatment cost the next business day. We take on the credit risk — no chargebacks, no chasing.",
  },
  {
    icon: Sparkles,
    t: "Attract new clients",
    d: "Get featured on our website and across our social channels — discovered by glow-getters actively looking to book.",
  },
  {
    icon: Zap,
    t: "No integration needed",
    d: "Customers receive a voucher code from AfterGlow and book their appointment with you as normal — nothing to install, no POS changes.",
  },
  {
    icon: TrendingUp,
    t: "Bigger basket sizes",
    d: "Merchants on AfterGlow see average order values rise by up to 40% when clients spread the cost.",
  },
  {
    icon: ChartColumn,
    t: "Repeat bookings",
    d: "Loyalty perks and re-engagement nudges built in, so your clients keep coming back to you.",
  },
  {
    icon: ShieldCheck,
    t: "Risk-free for you",
    d: "We handle credit checks, payments, and customer support — so you can focus on your clients.",
  },
];

const CTA_POINTS = [
  "Paid in full, next business day",
  "0% risk — we cover the credit",
  "Featured on our website and socials",
  "Dedicated partnerships team",
];

const Merchants = () => {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({
    business_name: "",
    category: "",
    contact_name: "",
    role: "",
    email: "",
    locations: 1,
    message: "",
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;

    const parsed = merchantSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    setPending(true);
    const data = parsed.data;
    const result = await submitMerchantApplication({
      business_name: data.business_name,
      category: data.category || undefined,
      contact_name: data.contact_name,
      role: data.role || undefined,
      email: data.email.toLowerCase(),
      locations: data.locations,
      message: data.message || undefined,
    });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    toast.success("Application received — we will be in touch within 48 hours.");
  };

  return (
    <Layout>
      <section className="bg-glow">
        <div className="container pt-16 pb-12 md:pt-20 md:pb-16">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-foreground/70">
                For merchants
              </span>

              <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
                Grow your salon with <em className="not-italic text-primary">AfterGlow</em>.
              </h1>

              <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                Your clients book and pay with a simple voucher code. We pay you upfront — your clients pay us in three.
                Built for spas, salons, clinics and wellness studios.
              </p>

              <div className="mt-10 grid grid-cols-2 gap-4">
                {HERO_STATS.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-border/60 bg-card p-5 shadow-card-soft"
                  >
                    <stat.icon className="h-5 w-5 text-primary" />
                    <p className="mt-3 font-display text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card id="partner-form" className="scroll-mt-24 rounded-3xl border-border/60 shadow-soft">
              <CardContent className="p-8 md:p-10">
                {submitted ? (
                  <div className="py-10 text-center">
                    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-8 w-8" />
                    </div>
                    <h2 className="mt-6 font-display text-3xl">Thank you ✨</h2>
                    <p className="mt-2 text-muted-foreground">
                      Our partnerships team will reach out within 48 hours to onboard your business.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="font-display text-3xl">Become a partner</h2>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="business">Business name</Label>
                        <Input
                          id="business"
                          required
                          maxLength={200}
                          placeholder="Lumière Skin Studio"
                          value={form.business_name}
                          onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          maxLength={100}
                          placeholder="Spa, salon, clinic…"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="contact">Your name</Label>
                        <Input
                          id="contact"
                          required
                          maxLength={100}
                          placeholder="Ava Rose"
                          value={form.contact_name}
                          onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Role</Label>
                        <Input
                          id="role"
                          maxLength={100}
                          placeholder="Owner / Manager"
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        maxLength={255}
                        placeholder="ava@studio.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="locations">Number of locations</Label>
                      <Input
                        id="locations"
                        type="number"
                        min={1}
                        value={form.locations}
                        onChange={(e) => setForm({ ...form, locations: Number(e.target.value) || 1 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Tell us about your business</Label>
                      <Textarea
                        id="message"
                        rows={4}
                        maxLength={2000}
                        placeholder="What services do you offer?"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                      />
                    </div>

                    <Button type="submit" size="lg" disabled={pending} className="w-full rounded-full">
                      {pending ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Sending application…
                        </>
                      ) : (
                        "Apply to partner"
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="container pt-10 pb-16 md:pt-12 md:pb-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Why merchants choose AfterGlow</p>
          <h2 className="mt-3 font-display text-4xl md:text-5xl">Everything you need to grow.</h2>
          <p className="mt-4 text-muted-foreground">
            Flexible payments turn browsers into bookers — and bookers into regulars.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <Card key={benefit.t} className="rounded-3xl border-border/60 shadow-card-soft">
              <CardContent className="p-8">
                <benefit.icon className="h-7 w-7 text-primary" />
                <h3 className="mt-4 font-display text-2xl">{benefit.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{benefit.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-blush py-20 md:py-28">
        <div className="container">
          <Card className="rounded-3xl border-0 bg-foreground text-background shadow-soft">
            <CardContent className="grid gap-10 p-10 md:grid-cols-[1.4fr_1fr] md:items-center md:p-16">
              <div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-extrabold uppercase tracking-[0.22em] text-primary-foreground">
                  Become a partner
                </span>

                <h2 className="mt-5 font-display text-4xl leading-[1.05] md:text-5xl">
                  Ready to grow your bookings with <em className="not-italic text-primary">AfterGlow</em>?
                </h2>

                <p className="mt-5 max-w-xl text-background/70">
                  Join the salons, spas and clinics already turning curious clients into loyal regulars. Apply in two
                  minutes — go live this week.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Button asChild size="lg" className="rounded-full px-7">
                    <a href="#partner-form">
                      Apply to partner <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                  <Button asChild size="lg" variant="secondary" className="rounded-full px-7">
                    <Link to="/book">See it in action</Link>
                  </Button>
                </div>
              </div>

              <ul className="space-y-4 rounded-2xl bg-background/5 p-6 text-sm text-background/80 ring-1 ring-background/10">
                {CTA_POINTS.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="mt-0.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Merchants;
