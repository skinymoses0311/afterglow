import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import { Layout } from "@/components/layout/Layout";
import { Container } from "@/components/layout/Container";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { Button } from "@/components/ui/button";

const Eyebrow = ({ children }: { children: string }) => (
  <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">{children}</p>
);

const About = () => (
  <Layout>
    <section className="relative overflow-hidden bg-glow">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[160px] -top-[200px] h-[600px] w-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, hsl(357 80% 85% / .5), transparent 68%)" }}
      />
      <Container className="relative py-20 md:py-24">
        <Eyebrow>About AfterGlow</Eyebrow>
        <h1 className="mt-4 max-w-[760px] font-display text-[clamp(2.5rem,7vw,4rem)] leading-[1.03]">
          Feel good now.
          <span className="block text-primary">Pay your way.</span>
        </h1>
        <p className="mt-7 max-w-[560px] text-lg leading-relaxed text-muted-foreground">
          AfterGlow was created from a simple belief: everyone deserves to feel their best, without having to put life
          on hold.
        </p>
      </Container>
    </section>

    <Container className="py-20 md:py-[104px]">
      <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:gap-20">
        <div className="space-y-6 text-lg leading-relaxed text-muted-foreground">
          <p>
            Beauty and wellness treatments are often the first things we postpone when money is tight — a facial, a
            massage, Botox, a treatment you've been meaning to book, a little bit of time for yourself.
          </p>
          <p className="font-display text-[clamp(1.5rem,3.5vw,2rem)] leading-[1.25] text-foreground">
            We wanted to change that.
          </p>
          <p>
            AfterGlow makes it easier to access the treatments you want, while giving you a more manageable way to pay.
          </p>
          <p>
            We work with carefully selected beauty and wellness businesses, helping customers discover treatments they
            love and access flexible payment options.
          </p>
          <p>
            And for our merchant partners, we are building a simple way to offer their customers more flexibility,
            without changing the experience they know and love.
          </p>
        </div>

        <div className="lg:pt-2">
          <div className="rounded-3xl bg-blush p-10 shadow-card-soft md:p-12">
            <Eyebrow>Why AfterGlow?</Eyebrow>
            <p className="mt-5 text-lg leading-relaxed text-foreground/80">
              Because looking after yourself is not a luxury you have to justify. Whether it's five minutes of
              confidence before a big event, some much-needed time to yourself, or simply doing something that makes
              you feel good — that is what AfterGlow is about.
            </p>
          </div>
        </div>
      </div>
    </Container>

    {/* The three words the brand is built on, given room to breathe. */}
    <section className="bg-foreground py-20 text-background md:py-24">
      <Container className="text-center">
        <p className="font-display text-[clamp(2rem,6vw,3.5rem)] leading-[1.1]">
          Beauty. <span className="text-primary">Wellness.</span> Flexibility.
        </p>
        <p className="mt-6 font-display text-lg uppercase tracking-[0.22em] text-background/70">
          Welcome to AfterGlow
        </p>
      </Container>
    </section>

    <Container className="py-20 md:py-[104px]">
      <div className="grid items-center gap-12 md:grid-cols-[auto_1fr] md:gap-16">
        {/* TODO: swap for Louisa's headshot once the file is in the repo. */}
        <ImagePlaceholder
          caption="Louisa, founder"
          rounded="rounded-3xl"
          className="mx-auto h-[340px] w-full max-w-[300px] shrink-0 md:mx-0 md:h-[400px] md:w-[320px] md:max-w-none"
        />

        <div>
          <Eyebrow>Meet the founder</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(2rem,4.5vw,2.75rem)] leading-[1.05]">Hi, I'm Louisa.</h2>
          <div className="mt-6 space-y-5 text-lg leading-relaxed text-muted-foreground">
            <p>
              I created AfterGlow as I wanted to make beauty and wellness feel more accessible and achievable —
              particularly at those points in life when looking after yourself can so easily fall to the bottom of the
              list.
            </p>
            <p>AfterGlow is about making those moments a little easier to say yes to.</p>
          </div>
        </div>
      </div>
    </Container>

    <section className="bg-blush py-20 md:py-24">
      <Container className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-display text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.05]">
            Be first to <em className="not-italic text-primary">glow</em>.
          </h2>
          <p className="mt-3 max-w-[420px] text-muted-foreground">
            Join the waitlist for £10 welcome credit and first dibs on launches near you.
          </p>
        </div>
        <Button asChild size="lg" className="shrink-0 rounded-full px-7">
          <Link to="/waitlist">
            Join the waitlist <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Container>
    </section>
  </Layout>
);

export default About;
