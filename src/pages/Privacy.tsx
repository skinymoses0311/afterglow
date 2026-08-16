import { Layout } from "@/components/layout/Layout";
import { Container } from "@/components/layout/Container";
import { reopenConsent } from "@/components/ConsentBanner";

/**
 * Privacy notice.
 *
 * Written to describe what the site actually does today — a pre-launch waitlist
 * with no payments, no accounts and no lending. It must be kept in step with the
 * code: if a form starts collecting a new field, or a new third party is added,
 * this page changes too.
 */

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mt-10">
    <h2 className="font-display text-2xl">{title}</h2>
    <div className="mt-3 space-y-3 text-[15px] leading-relaxed text-muted-foreground">{children}</div>
  </section>
);

const Privacy = () => (
  <Layout>
    <section className="bg-glow">
      <Container className="py-16 md:py-20">
        <h1 className="font-display text-[clamp(2.25rem,6vw,3.25rem)] leading-[1.05]">Privacy notice</h1>
        <p className="mt-4 max-w-[640px] text-lg text-muted-foreground">
          How AfterGlow handles your information. Last updated 16 August 2026.
        </p>
      </Container>
    </section>

    <Container className="max-w-[760px] pb-20 pt-12 md:pb-28">
      <p className="text-[15px] leading-relaxed text-muted-foreground">
        AfterGlow is not yet operating. This site collects expressions of interest from people who would like
        to use the service when it launches, and applications from businesses who would like to partner with
        us. It takes no payments, offers no credit, and does not create accounts.
      </p>

      <Section title="Who we are">
        <p>
          AfterGlow is the data controller for the information described here. You can reach us at{" "}
          <a href="mailto:hello@afterglowcredit.com" className="text-primary hover:underline">
            hello@afterglowcredit.com
          </a>
          .
        </p>
      </Section>

      <Section title="What we collect, and why">
        <p>
          <strong className="text-foreground">If you join the waitlist</strong> we collect your email address,
          and optionally your name, your city and the treatments you are interested in. We use this to tell you
          when AfterGlow launches, and to understand which treatments and locations to prioritise. Only the
          email address is required.
        </p>
        <p>
          <strong className="text-foreground">If you apply to become a partner</strong> we collect your business
          name, your name, your email address, your role, the number of locations you operate, and anything you
          write in the message field. We use this to assess and respond to your application.
        </p>
        <p>
          <strong className="text-foreground">If you consent to analytics</strong> we use Google Analytics to
          understand how the site is used — which pages people visit, how they arrived, and where they give up.
          This is described in more detail below.
        </p>
        <p>
          We do not buy personal data, we do not sell it, and we do not use it to make automated decisions
          about you.
        </p>
      </Section>

      <Section title="Our lawful basis">
        <p>
          For the waitlist and partner applications, our basis is your consent: you chose to submit the form,
          and you can withdraw at any time using the link in any email we send, or by contacting us.
        </p>
        <p>For analytics, our basis is your consent, given through the cookie banner.</p>
      </Section>

      <Section title="Cookies and analytics">
        <p>
          We do not use any analytics or advertising cookies unless you accept them. If you do, Google
          Analytics 4 sets cookies that give your browser a random identifier so Google can tell repeat visits
          apart. We do not use Google Analytics for advertising, we have not linked it to Google Ads, and
          Google Signals is switched off.
        </p>
        <p>
          We also set one small cookie of our own to remember whether you accepted or rejected, so we do not
          ask again on every page. It stores nothing but that choice.
        </p>
        <p>
          You can change your mind whenever you like.{" "}
          <button
            type="button"
            onClick={reopenConsent}
            className="text-primary underline underline-offset-2 hover:no-underline"
          >
            Reopen your cookie choices
          </button>
          . If you withdraw consent we delete the Google Analytics cookies from your browser.
        </p>
      </Section>

      <Section title="Who we share it with">
        <p>
          <strong className="text-foreground">Convex</strong> stores the information you submit through the
          forms. Our deployment is hosted in the EU (Ireland).
        </p>
        <p>
          <strong className="text-foreground">Google</strong> processes analytics data if you have consented.
          Google may transfer this to the United States, relying on the UK extension to the EU–US Data Privacy
          Framework.
        </p>
        <p>
          <strong className="text-foreground">Hostinger</strong> provides the server this site runs on. Standard
          web server logs, including IP addresses, are generated as a normal part of serving the site.
        </p>
        <p>
          We may also share information where we are legally required to. Nobody else receives your data.
        </p>
      </Section>

      <Section title="How long we keep it">
        <p>
          Waitlist details are kept until we launch and have contacted you, or until you unsubscribe —
          whichever comes first. If you unsubscribe we keep a record that you opted out, so that we do not
          contact you again by mistake.
        </p>
        <p>Partner applications are kept for two years, so we can pick up conversations that stall.</p>
        <p>Analytics data is retained by Google for 14 months.</p>
      </Section>

      <Section title="Your rights">
        <p>
          You have the right to ask for a copy of your data, to have it corrected or deleted, to restrict or
          object to how we use it, and to receive it in a portable format. Where we rely on consent, you can
          withdraw it at any time — that does not affect anything done before you withdrew.
        </p>
        <p>
          Email{" "}
          <a href="mailto:hello@afterglowcredit.com" className="text-primary hover:underline">
            hello@afterglowcredit.com
          </a>{" "}
          and we will respond within one month.
        </p>
        <p>
          If you are unhappy with how we have handled your information you can complain to the Information
          Commissioner's Office at{" "}
          <a
            href="https://ico.org.uk/make-a-complaint/"
            className="text-primary hover:underline"
            rel="noreferrer"
            target="_blank"
          >
            ico.org.uk
          </a>
          . We would rather you told us first so we can put it right.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          AfterGlow is pre-launch and this notice will change as the service takes shape — particularly when
          we begin offering credit. We will update the date at the top, and if a change is significant we will
          tell waitlist members by email.
        </p>
      </Section>
    </Container>
  </Layout>
);

export default Privacy;
