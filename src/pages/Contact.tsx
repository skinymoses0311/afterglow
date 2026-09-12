import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Check, LoaderCircle, Mail, Store } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Layout } from "@/components/layout/Layout";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitContactEnquiry } from "@/lib/submissions";
import { trackEvent } from "@/lib/analytics";

const ENQUIRY_TYPES = [
  "General enquiry",
  "Joining the waitlist",
  "Becoming a merchant partner",
  "Press",
  "Something else",
];

const contactSchema = z.object({
  name: z.string().trim().min(1, { message: "Please tell us your name" }).max(100),
  email: z.string().trim().email({ message: "Please enter a valid email" }).max(255),
  enquiryType: z.string().trim().min(1),
  message: z.string().trim().min(1, { message: "Please add a message" }).max(2000),
});

const PrivacyLink = () => (
  <Link to="/privacy" className="text-primary underline underline-offset-2 hover:no-underline">
    Privacy and Cookie Policy
  </Link>
);

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    enquiryType: ENQUIRY_TYPES[0],
    message: "",
  });
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (pending) return;

    trackEvent("af_form_submit", { af_form_id: "contact" });

    const parsed = contactSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      trackEvent("af_form_error", { af_form_id: "contact", error_type: "validation" });
      return;
    }

    setPending(true);
    const result = await submitContactEnquiry({
      ...parsed.data,
      email: parsed.data.email.toLowerCase(),
    });
    setPending(false);

    if (!result.ok) {
      toast.error(result.error ?? "Something went wrong. Please try again.");
      trackEvent("af_form_error", { af_form_id: "contact", error_type: "server" });
      return;
    }

    trackEvent("contact_enquiry", { enquiry_type: parsed.data.enquiryType });
    setSent(true);
    toast.success("Message sent — we will be in touch ✨");
  };

  return (
    <Layout>
      <section className="relative overflow-hidden bg-glow">
        <Container className="grid items-start gap-14 py-20 md:py-24 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
          <div className="flex flex-col">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-primary">Contact us</p>
            <h1 className="mt-4 font-display text-[clamp(2.5rem,6vw,3.75rem)] leading-[1.05]">
              We would love to hear from you.
            </h1>
            <p className="mt-6 max-w-[480px] text-lg leading-relaxed text-muted-foreground">
              Do you have a question about AfterGlow, interested in joining the waitlist, or want to become an
              AfterGlow merchant partner? Get in touch and our team will get back to you.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
              <a
                href="mailto:hello@afterglowcredit.com"
                className="flex flex-1 items-center gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-card-soft transition-transform hover:-translate-y-1"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/[0.16] text-primary">
                  <Mail className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    General enquiries
                  </span>
                  <span className="block truncate font-display text-[15px] text-foreground">
                    hello@afterglowcredit.com
                  </span>
                </span>
              </a>

              <a
                href="mailto:merchants@afterglowcredit.com"
                className="flex flex-1 items-center gap-4 rounded-3xl border border-border/60 bg-card p-5 shadow-card-soft transition-transform hover:-translate-y-1"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/[0.16] text-primary">
                  <Store className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-xs uppercase tracking-[0.16em] text-muted-foreground">
                    Merchant enquiries
                  </span>
                  <span className="block truncate font-display text-[15px] text-foreground">
                    merchants@afterglowcredit.com
                  </span>
                </span>
              </a>
            </div>

            <p className="mt-8 text-[15px] text-muted-foreground">
              Anything else? Send us a message and we will point you in the right direction.
            </p>
          </div>

          <Card className="rounded-3xl border-border/60 shadow-soft">
            <CardContent className="p-8 md:p-10">
              {sent ? (
                <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 font-display text-3xl">Message sent ✨</h2>
                  <p className="mt-2 text-muted-foreground">
                    Thank you for getting in touch. Our team will come back to you as soon as we can.
                  </p>
                </div>
              ) : (
                <form id="contact" name="contact" onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="font-display text-3xl">Send us a message</h2>

                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Your name</Label>
                    <Input
                      id="contact-name"
                      required
                      maxLength={100}
                      placeholder="Ava Rose"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={255}
                      placeholder="ava@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-type">What is it about?</Label>
                    <select
                      id="contact-type"
                      value={form.enquiryType}
                      onChange={(e) => setForm({ ...form, enquiryType: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:text-sm"
                    >
                      {ENQUIRY_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea
                      id="contact-message"
                      rows={5}
                      required
                      maxLength={2000}
                      placeholder="How can we help?"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                    />
                  </div>

                  <Button type="submit" size="lg" disabled={pending} className="w-full rounded-full">
                    {pending ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      "Send message"
                    )}
                  </Button>

                  <p className="text-center text-xs leading-relaxed text-muted-foreground">
                    By submitting this form, you agree to AfterGlow processing your personal data in accordance with
                    our <PrivacyLink />.
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </Container>
      </section>
    </Layout>
  );
};

export default Contact;
