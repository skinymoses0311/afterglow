import { Link } from "react-router-dom";
import { CalendarHeart, Heart, ShieldCheck, Store, Wallet } from "lucide-react";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const STEPS = [
  {
    n: "01",
    t: "Choose your treatment",
    d: "Browse partner salons, spas and wellness studios in our network.",
  },
  {
    n: "02",
    t: "Split into 3 payments",
    d: "Spread the cost across three interest-free payments — with nothing to pay upfront.",
  },
  {
    n: "03",
    t: "Glow and enjoy",
    d: "Show up, relax, and feel beautiful. We will handle the rest.",
  },
];

const Index = () => (
  <Layout>
    <section className="relative overflow-hidden bg-glow">
      <div className="container relative pt-20 pb-12 md:pt-28 md:pb-16 lg:pt-32">
        <div className="flex flex-col justify-center">
          <span className="inline-flex w-fit items-center gap-2 rounded-sm bg-primary px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.22em] text-primary-foreground">
            Glow now, pay later
          </span>

          <h1 className="mt-6 font-display text-5xl font-extrabold uppercase leading-[1.05] tracking-tight md:text-6xl lg:text-7xl">
            After
            <span className="block text-primary">Glow</span>
          </h1>

          <p className="mt-4 font-display text-lg font-bold uppercase tracking-[0.18em] text-foreground/80">
            Beauty and wellness, on your terms.
          </p>

          <p className="mt-6 max-w-lg text-lg text-muted-foreground">
            AfterGlow lets you split beauty treatments, wellness sessions and luxury products into easy, interest-free
            payments. Self-care, made effortless.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/waitlist">Join the waitlist</Link>
            </Button>
          </div>

          <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> 0% interest
            </span>
            <span className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-primary" /> 3 easy payments
            </span>
            <span className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" /> Soft credit check
            </span>
          </div>
        </div>
      </div>
    </section>

    <section className="container pt-10 pb-16 md:pt-12 md:pb-20">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">How it works</p>
        <h2 className="mt-3 font-display text-4xl md:text-5xl">Three steps to your glow.</h2>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {STEPS.map((step) => (
          <Card key={step.n} className="rounded-3xl border-border/60 bg-card shadow-card-soft">
            <CardContent className="p-8">
              <span className="font-display text-5xl text-primary/70">{step.n}</span>
              <h3 className="mt-4 font-display text-2xl">{step.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.d}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    <section className="bg-blush py-20 md:py-28">
      <div className="container grid gap-6 md:grid-cols-2">
        <Card className="rounded-3xl border-0 bg-card shadow-soft">
          <CardContent className="flex h-full flex-col p-10">
            <CalendarHeart className="h-8 w-8 text-primary" />
            <h3 className="mt-5 font-display text-3xl">For glow-getters</h3>
            <p className="mt-3 text-muted-foreground">
              Book any treatment and split the cost into three interest-free payments, with nothing to pay upfront.
              Total transparency, no surprises.
            </p>
            <Button asChild className="mt-8 w-fit rounded-full" size="lg">
              <Link to="/book">Book now</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 bg-foreground text-background shadow-soft">
          <CardContent className="flex h-full flex-col p-10">
            <Store className="h-8 w-8 text-primary" />
            <h3 className="mt-5 font-display text-3xl">For merchants</h3>
            <p className="mt-3 text-background/70">
              Attract new clients and grow repeat bookings. Get paid upfront whilst we handle the rest.
            </p>
            <Button asChild variant="secondary" className="mt-8 w-fit rounded-full" size="lg">
              <Link to="/merchants">Become a partner</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  </Layout>
);

export default Index;
