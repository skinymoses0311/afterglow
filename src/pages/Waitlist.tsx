import { useState, type FormEvent } from "react";
import { Check, LoaderCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitWaitlistSignup } from "@/lib/submissions";
import { trackEvent } from "@/lib/analytics";

const TREATMENTS = [
  "Facials",
  "Lash extensions",
  "Brow shaping",
  "Massage",
  "Laser hair removal",
  "Injectables",
  "Manicure & pedicure",
  "Hair colour & cut",
  "Spray tan",
  "Skin peels",
  "IV drips",
  "Body contouring",
];

const PERKS = ["Skip the line when we launch", "£10 welcome credit", "First dibs on exclusive launches near you"];

const waitlistSchema = z.object({
  name: z.string().trim().max(100).optional(),
  email: z.string().trim().email({ message: "Please enter a valid email" }).max(255),
  city: z.string().trim().max(100).optional(),
  treatments: z.array(z.string()).min(1, { message: "Pick at least one treatment" }),
});

const Waitlist = () => {
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", city: "", treatments: [] as string[] });

  const toggleTreatment = (treatment: string) => {
    setForm((prev) => ({
      ...prev,
      treatments: prev.treatments.includes(treatment)
        ? prev.treatments.filter((t) => t !== treatment)
        : [...prev.treatments, treatment],
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;

    // Counts attempts. GA4's own form_submit cannot do this: enhanced
    // measurement skips any submit where defaultPrevented is true, and every
    // React form prevents default. Verified against the live tag.
    trackEvent("af_form_submit", { af_form_id: "waitlist" });

    const parsed = waitlistSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      trackEvent("af_form_error", { af_form_id: "waitlist", error_type: "validation" });
      return;
    }

    setPending(true);
    const { name, email, city, treatments } = parsed.data;
    const result = await submitWaitlistSignup({
      name: name || undefined,
      email: email.toLowerCase(),
      city: city || undefined,
      treatments,
    });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      trackEvent("af_form_error", { af_form_id: "waitlist", error_type: "server" });
      return;
    }

    // generate_lead only counts genuinely new signups, so the GA4 key-event
    // total stays comparable with the Convex row count.
    if (result.duplicate) {
      trackEvent("waitlist_duplicate", { form_location: "waitlist_page" });
    } else {
      trackEvent("generate_lead", { lead_source: "waitlist_form", form_location: "waitlist_page" });
    }

    setSubmitted(true);
    toast.success(result.duplicate ? "You are already on the list ✨" : "You are on the list! ✨");
  };

  return (
    <Layout>
      <section className="relative overflow-hidden bg-glow">
        <div className="container grid gap-12 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-foreground/70 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" /> Early access
            </span>

            <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
              Be first to <em className="not-italic text-primary">glow</em>.
            </h1>

            <p className="mt-6 max-w-lg text-lg text-muted-foreground">
              We will match you with trusted partners and get you glowing — split into three easy payments with nothing
              to pay upfront.
            </p>

            <ul className="mt-8 space-y-3 text-sm">
              {PERKS.map((perk) => (
                <li key={perk} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>

          <Card className="rounded-3xl border-border/60 shadow-soft">
            <CardContent className="p-8 md:p-10">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 font-display text-3xl">You are in ✨</h2>
                  <p className="mt-2 text-muted-foreground">
                    We will email you the moment AfterGlow launches in {form.city || "your city"} — with first access to{" "}
                    {form.treatments.slice(0, 2).join(" and ") || "your favourite treatments"}.
                  </p>
                </div>
              ) : (
                <form id="waitlist" name="waitlist" onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display text-3xl">Join the waitlist</h2>

                  <div className="space-y-2">
                    <Label htmlFor="name">Full name</Label>
                    <Input
                      id="name"
                      placeholder="Ava Rose"
                      maxLength={100}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ava@example.com"
                      required
                      maxLength={255}
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="London"
                      maxLength={100}
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>
                      Preferred treatments <span className="text-primary">*</span>
                    </Label>
                    <p className="text-xs text-muted-foreground">Pick everything you would love to book.</p>

                    <div className="grid grid-cols-2 gap-2">
                      {TREATMENTS.map((treatment) => {
                        const selected = form.treatments.includes(treatment);
                        return (
                          <button
                            key={treatment}
                            type="button"
                            aria-pressed={selected}
                            onClick={() => toggleTreatment(treatment)}
                            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-left text-sm transition-colors ${
                              selected
                                ? "border-primary bg-primary/10 text-foreground"
                                : "border-border bg-background hover:bg-secondary"
                            }`}
                          >
                            <span
                              aria-hidden="true"
                              className={`grid h-4 w-4 shrink-0 place-items-center rounded border transition-colors ${
                                selected ? "border-primary bg-primary text-primary-foreground" : "border-border"
                              }`}
                            >
                              {selected ? <Check className="h-3 w-3" /> : null}
                            </span>
                            <span className="truncate">{treatment}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <Button type="submit" size="lg" disabled={pending} className="w-full rounded-full">
                    {pending ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Counting you in…
                      </>
                    ) : (
                      "Count me in ✨"
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground">
                    By joining, you agree to receive launch updates from AfterGlow.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Waitlist;
