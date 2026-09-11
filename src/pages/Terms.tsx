import { Link } from "react-router-dom";

import { LegalPage, Section, P, Bullets, Mail, Ext } from "@/components/legal/LegalPage";

/** Website Terms and Conditions, published as supplied. */

const PrivacyLink = () => (
  <Link to="/privacy" className="text-primary underline underline-offset-2 hover:no-underline">
    Privacy Policy
  </Link>
);

const Terms = () => (
  <LegalPage
    title="Website Terms and Conditions"
    standfirst="The terms on which you may use the AfterGlow website."
    meta={
      <>
        <Ext href="https://www.afterglowcredit.com">www.afterglowcredit.com</Ext>
        <span aria-hidden="true"> · </span>
        Last updated: 12 September 2026
      </>
    }
  >
    <Section n={1} title="About these terms">
      <P>
        These terms and conditions govern your use of the AfterGlow website. By accessing or using this website, you
        confirm that you accept these terms and agree to comply with them. If you do not agree, you must not use this
        website.
      </P>
    </Section>

    <Section n={2} title="About us">
      <P>
        This website is operated by AfterGlow Credit Limited [company number to be confirmed], a company registered in
        England and Wales [registered office address to be confirmed]. You can contact us at{" "}
        <Mail address="hello@afterglowcredit.com" />.
      </P>
    </Section>

    <Section n={3} title="Changes to these terms">
      <P>
        We may revise these terms at any time by updating this page. The “last updated” date at the top of this page
        indicates when these terms were last changed. Please check this page from time to time to take notice of any
        changes, as they are binding on you.
      </P>
    </Section>

    <Section n={4} title="Use of the website">
      <P>You may use this website only for lawful purposes. You must not:</P>
      <Bullets
        items={[
          "use this website in any way that breaches any applicable law or regulation",
          "use this website in any way that is fraudulent or harmful",
          "attempt to gain unauthorised access to any part of this website, the server on which it is hosted, or any connected database",
          "introduce viruses, trojans, worms or other malicious software",
        ]}
      />
      <P>
        Our use of cookies and similar technologies is described in our <PrivacyLink />.
      </P>
    </Section>

    <Section n={5} title="Intellectual property">
      <P>
        All content on this website — including text, graphics, logos, images and software — is the property of
        AfterGlow Credit Limited or its licensors and is protected by copyright and other intellectual property laws.
        You may not reproduce, distribute or otherwise use any content from this website without our prior written
        consent.
      </P>
    </Section>

    <Section n={6} title="No financial advice">
      <P>
        This website is provided for general information purposes only. Nothing on this website constitutes financial,
        credit or other professional advice. You should not rely on any content on this website as a basis for making
        any financial decision. AfterGlow does not yet offer regulated consumer credit products; when it does, those
        products will be subject to their own separate terms and conditions and regulatory disclosures.
      </P>
    </Section>

    <Section n={7} title="Waitlist and merchant enquiry forms">
      <P>
        This website may include a customer waitlist form and a merchant enquiry form. By submitting information
        through either form, you agree that:
      </P>
      <Bullets
        items={[
          "the information you provide is accurate and up to date",
          <>
            we may use your information in accordance with our <PrivacyLink />
          </>,
          "submission of the waitlist form does not constitute an application for credit or create any contractual relationship",
          "submission of a merchant enquiry does not guarantee a partnership or listing on the AfterGlow platform",
        ]}
      />
      <P>
        For full details of how we handle your personal data, please see our <PrivacyLink />.
      </P>
    </Section>

    <Section n={8} title="Privacy and data protection">
      <P>
        We collect and process personal data in connection with your use of this website. Full details of how we
        collect, use, store and share your personal data, including information about cookies and your data protection
        rights, are set out in our <PrivacyLink />, which forms part of these terms.
      </P>
    </Section>

    <Section n={9} title="Third-party links">
      <P>
        This website may contain links to third-party websites. These links are provided for your convenience only. We
        have no control over the content of those sites and accept no responsibility for them or for any loss or damage
        that may arise from your use of them.
      </P>
    </Section>

    <Section n={10} title="Limitation of liability">
      <P>To the fullest extent permitted by law:</P>
      <Bullets
        items={[
          "we exclude all implied conditions, warranties and representations",
          "we shall not be liable for any loss or damage arising out of or in connection with the use of this website, whether in contract, tort (including negligence), breach of statutory duty or otherwise",
          "we shall not be liable for any indirect, consequential or special loss",
        ]}
      />
      <P>
        Nothing in these terms excludes or limits our liability for death or personal injury caused by our negligence,
        fraud or fraudulent misrepresentation, or any other liability that cannot be excluded or limited by English law.
      </P>
      <P>
        If you are a consumer, nothing in these terms affects your statutory rights. Advice about your statutory rights
        is available from your local Citizens Advice Bureau or Trading Standards office.
      </P>
    </Section>

    <Section n={11} title="Website availability">
      <P>
        We do not guarantee that this website will always be available or that access will be uninterrupted. We may
        suspend, withdraw or restrict the availability of all or any part of this website for business or operational
        reasons. We will try to give you reasonable notice of any suspension or withdrawal where practicable.
      </P>
    </Section>

    <Section n={12} title="Governing law and jurisdiction">
      <P>
        These terms are governed by and construed in accordance with the laws of England and Wales. Any dispute arising
        out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of
        England and Wales.
      </P>
      <P>
        If you are a consumer resident in Scotland, you may also bring proceedings in the Scottish courts. If you are a
        consumer resident in Northern Ireland, you may also bring proceedings in the courts of Northern Ireland.
      </P>
    </Section>

    <Section n={13} title="Contact">
      <P>
        If you have any questions about these terms, please contact us at <Mail address="hello@afterglowcredit.com" />.
      </P>
      <P className="pt-6 text-xs uppercase tracking-[0.2em] text-primary">End of terms</P>
    </Section>
  </LegalPage>
);

export default Terms;
