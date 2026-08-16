import { useEffect, useState } from "react";
import { Check, LoaderCircle, X } from "lucide-react";

import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { confirmUnsubscribe, lookupUnsubscribeToken } from "@/lib/submissions";
import { getUnsubscribeToken } from "@/lib/unsubscribeToken";

type State =
  | { status: "loading" }
  | { status: "valid"; email: string }
  | { status: "submitting" }
  | { status: "done" }
  | { status: "already" }
  | { status: "invalid"; message: string };

const Unsubscribe = () => {
  // Read from memory, not the URL: the token is stripped from the address bar
  // at app entry so it can never reach an analytics event. See lib/unsubscribeToken.
  const token = getUnsubscribeToken();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const result = await lookupUnsubscribeToken(token);
        if (!cancelled) setState(result);
      } catch {
        if (!cancelled) {
          setState({ status: "invalid", message: "Could not validate this link. Please try again." });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleConfirm = async () => {
    setState({ status: "submitting" });
    try {
      const result = await confirmUnsubscribe(token);
      setState(result.ok ? { status: "done" } : { status: "invalid", message: "Something went wrong. Please try again." });
    } catch {
      setState({ status: "invalid", message: "Network error. Please try again." });
    }
  };

  return (
    <Layout>
      <section className="bg-glow">
        <div className="container py-24 md:py-32">
          <Card className="mx-auto max-w-lg rounded-3xl border-border/60 shadow-soft">
            <CardContent className="p-10 text-center">
              {state.status === "loading" && (
                <div className="flex flex-col items-center gap-4 py-6">
                  <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Checking your link…</p>
                </div>
              )}

              {state.status === "valid" && (
                <>
                  <h1 className="font-display text-3xl">Unsubscribe from AfterGlow</h1>
                  <p className="mt-3 text-muted-foreground">
                    You will stop receiving emails{state.email ? ` at ${state.email}` : ""}.
                  </p>
                  <Button onClick={handleConfirm} size="lg" className="mt-8 rounded-full">
                    Confirm unsubscribe
                  </Button>
                </>
              )}

              {state.status === "submitting" && (
                <div className="flex flex-col items-center gap-4 py-6">
                  <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground">Updating your preferences…</p>
                </div>
              )}

              {state.status === "done" && (
                <>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-8 w-8" />
                  </div>
                  <h1 className="mt-6 font-display text-3xl">You're unsubscribed</h1>
                  <p className="mt-2 text-muted-foreground">
                    Sorry to see you go. You can rejoin the waitlist any time.
                  </p>
                </>
              )}

              {state.status === "already" && (
                <>
                  <h1 className="font-display text-3xl">Already unsubscribed</h1>
                  <p className="mt-2 text-muted-foreground">
                    This email is already opted out — no further action needed.
                  </p>
                </>
              )}

              {state.status === "invalid" && (
                <>
                  <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-destructive text-destructive-foreground">
                    <X className="h-8 w-8" />
                  </div>
                  <h1 className="mt-6 font-display text-3xl">Link not valid</h1>
                  <p className="mt-2 text-muted-foreground">{state.message}</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
};

export default Unsubscribe;
