import { useMemo, useState, type FormEvent } from "react";
import { Check, Clock, MapPin, Star } from "lucide-react";
import { toast } from "sonner";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface Treatment {
  id: string;
  name: string;
  studio: string;
  city: string;
  category: "Skin" | "Hair" | "Wellness";
  duration: string;
  rating: number;
  price: number;
}

/**
 * Launch line-up. Empty until partners are onboarded — the page falls back to
 * the "COMING SOON" card, which is what the live site currently shows.
 */
const TREATMENTS: Treatment[] = [];

const CATEGORIES = ["All", "Skin", "Hair", "Wellness"] as const;

const Book = () => {
  const [category, setCategory] = useState<string>("All");
  const [selected, setSelected] = useState<Treatment | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const visible = useMemo(
    () => (category === "All" ? TREATMENTS : TREATMENTS.filter((t) => t.category === category)),
    [category],
  );

  return (
    <Layout>
      <section className="bg-glow">
        <div className="container py-16 md:py-20">
          <h1 className="font-display text-5xl font-semibold leading-[1.05] md:text-6xl">
            Find your <em className="not-italic text-primary">glow</em>.
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Book a treatment with any AfterGlow partner and split the cost into three easy, interest-free payments with
            nothing to pay upfront. UK only at launch.
          </p>
        </div>
      </section>

      <section className="container py-12 md:py-16">
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="rounded-full bg-secondary p-1">
            {CATEGORIES.map((c) => (
              <TabsTrigger key={c} value={c} className="rounded-full px-5">
                {c}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={category} className="mt-8">
            {visible.length === 0 ? (
              <Card className="rounded-3xl border-border/60 bg-blush shadow-card-soft">
                <CardContent className="flex flex-col items-center justify-center gap-4 py-20 text-center">
                  <h2 className="font-display text-4xl md:text-5xl">COMING SOON</h2>
                  <p className="max-w-md text-muted-foreground">
                    We are curating our launch line-up of partner salons, spas and wellness studios. Join the waitlist
                    to be first in.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {visible.map((treatment) => (
                  <Card
                    key={treatment.id}
                    className="overflow-hidden rounded-3xl border-border/60 shadow-card-soft transition-transform hover:-translate-y-1"
                  >
                    <div className="aspect-[4/3] bg-blush" />
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-display text-xl">{treatment.name}</h3>
                          <p className="text-sm text-muted-foreground">{treatment.studio}</p>
                        </div>
                        <span className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs">
                          <Star className="h-3.5 w-3.5 fill-primary text-primary" />
                          {treatment.rating}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" /> {treatment.city}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" /> {treatment.duration}
                        </span>
                      </div>

                      <div className="mt-5 flex items-end justify-between">
                        <div>
                          <p className="font-display text-2xl">£{treatment.price}</p>
                          <p className="text-xs text-muted-foreground">or 3× £{(treatment.price / 3).toFixed(2)}</p>
                        </div>
                        <Button
                          onClick={() => {
                            setSelected(treatment);
                            setConfirmed(false);
                          }}
                          className="rounded-full"
                        >
                          Book
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {selected && (
        <BookingModal
          treatment={selected}
          confirmed={confirmed}
          onConfirm={() => {
            setConfirmed(true);
            toast.success("Booking confirmed ✨");
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </Layout>
  );
};

interface BookingModalProps {
  treatment: Treatment;
  confirmed: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const BookingModal = ({ treatment, confirmed, onConfirm, onClose }: BookingModalProps) => (
  <div
    className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4 backdrop-blur-sm"
    onClick={onClose}
  >
    <Card
      className="w-full max-w-lg rounded-3xl border-border/60 shadow-soft"
      onClick={(e) => e.stopPropagation()}
    >
      <CardContent className="p-8">
        {confirmed ? (
          <div className="py-6 text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="mt-6 font-display text-3xl">You're booked ✨</h2>
            <p className="mt-2 text-muted-foreground">
              {treatment.name} at {treatment.studio}. Confirmation sent to your email.
            </p>
            <Button className="mt-6 w-full rounded-full" size="lg" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              onConfirm();
            }}
            className="space-y-5"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-primary">{treatment.studio}</p>
              <h2 className="mt-1 font-display text-3xl">{treatment.name}</h2>
              <p className="text-sm text-muted-foreground">
                {treatment.city} · {treatment.duration}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input id="time" type="time" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-name">Your name</Label>
              <Input id="booking-name" required placeholder="Ava Rose" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="booking-email">Email</Label>
              <Input id="booking-email" type="email" required placeholder="ava@example.com" />
            </div>

            <div className="rounded-2xl bg-secondary p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total</span>
                <span className="font-display text-xl">£{treatment.price.toFixed(2)}</span>
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">3 payments of</span>
                <span className="font-display text-2xl text-foreground">£{(treatment.price / 3).toFixed(2)}</span>
              </div>
              <p className="mt-1 text-right text-xs text-muted-foreground">
                Every 2 weeks · 0% interest · No upfront payment
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" className="flex-1 rounded-full" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 rounded-full">
                Confirm booking
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  </div>
);

export default Book;
