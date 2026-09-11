import { Link } from "react-router-dom";

import { LegalPage, Section, SubHeading, P, Bullets, Lead, Mail, Ext, Table } from "@/components/legal/LegalPage";
import { reopenConsent } from "@/components/ConsentBanner";

/**
 * Privacy and Cookie Policy, as supplied by AfterGlow's advisers.
 *
 * Published as drafted. The only edits are to internal section cross-references,
 * which pointed at the wrong sections; every change is listed in the README.
 * No wording has been altered.
 */

const COOKIE_ROWS: string[][] = [
  [
    "cookie_consent / afterglow_cookie_consent",
    "AfterGlow (first party)",
    "Stores your cookie consent preferences so you are not asked to consent again on each visit",
    "Strictly necessary",
    "Persistent",
    "12 months",
  ],
  [
    "_ga",
    "Google (Google Analytics)",
    "Distinguishes unique visitors to the website by assigning a randomly generated number as a client identifier. Used to calculate visitor, session and campaign data for site analytics.",
    "Performance and analytics",
    "Persistent",
    "Two years",
  ],
  [
    "_ga_[container-id]",
    "Google (Google Analytics)",
    "Used by Google Analytics to maintain session state",
    "Performance and analytics",
    "Persistent",
    "Two years",
  ],
  [
    "_gid",
    "Google (Google Analytics)",
    "Distinguishes users for analytics purposes",
    "Performance and analytics",
    "Persistent",
    "24 hours",
  ],
  [
    "_gat",
    "Google (Google Analytics)",
    "Used to throttle request rate to Google Analytics",
    "Performance and analytics",
    "Persistent",
    "One minute",
  ],
  [
    "_fbp",
    "Meta (Facebook)",
    "Used by Meta to deliver, measure and improve the relevance of advertisements. Tracks visits across websites.",
    "Targeting and advertising",
    "Persistent",
    "Three months",
  ],
  [
    "_fbc",
    "Meta (Facebook)",
    "Stores the last Facebook click identifier when a user arrives at the website from a Facebook advertisement",
    "Targeting and advertising",
    "Persistent",
    "Three months",
  ],
  [
    "_gcl_au",
    "Google (Google Ads)",
    "Used by Google Ads conversion tracking to store and track conversions",
    "Targeting and advertising",
    "Persistent",
    "Three months",
  ],
  [
    "_gcl_aw",
    "Google (Google Ads)",
    "Stores information about ad clicks from Google Ads to attribute website conversions",
    "Targeting and advertising",
    "Persistent",
    "Three months",
  ],
  [
    "li_sugr",
    "LinkedIn",
    "Used by LinkedIn for tracking conversions, retargeting and analytics from the LinkedIn Insight Tag",
    "Targeting and advertising",
    "Persistent",
    "Three months",
  ],
  [
    "AnalyticsSyncHistory",
    "LinkedIn",
    "Used by LinkedIn to store information about the time a sync took place with the lms_analytics cookie",
    "Targeting and advertising",
    "Persistent",
    "30 days",
  ],
  [
    "bcookie",
    "LinkedIn",
    "Browser ID cookie set by LinkedIn for identification purposes",
    "Targeting and advertising",
    "Persistent",
    "One year",
  ],
  [
    "UserMatchHistory",
    "LinkedIn",
    "Used by LinkedIn for tracking conversions",
    "Targeting and advertising",
    "Persistent",
    "30 days",
  ],
  [
    "_ttp",
    "TikTok",
    "Used by TikTok to track activity on non-TikTok websites to measure the effectiveness of TikTok advertisements",
    "Targeting and advertising",
    "Persistent",
    "13 months",
  ],
  [
    "_tt_enable_cookie",
    "TikTok",
    "Used by TikTok to check whether cookies can be placed on the user's browser",
    "Targeting and advertising",
    "Persistent",
    "13 months",
  ],
  [
    "tt_pixel_session_index",
    "TikTok",
    "Used by TikTok Pixel to track user sessions for analytics and ad measurement",
    "Targeting and advertising",
    "Session",
    "Session",
  ],
];

const Privacy = () => (
  <LegalPage
    title="Privacy and Cookie Policy"
    standfirst="How AfterGlow Credit Limited collects, uses, stores and shares your personal data."
    meta={
      <>
        Effective date: 12 September 2026
        <span aria-hidden="true"> · </span>
        Last updated: 12 September 2026
      </>
    }
  >
    <Section n={1} title="Who We Are">
      <P>
        This privacy policy explains how AfterGlow collects, uses, stores and shares your personal data when you visit
        our website, sign up to our waitlist, express interest in partnering with us as a merchant, or (once our
        service launches) use our buy now pay later (“BNPL”) service.
      </P>
      <P>
        AfterGlow is a UK-based beauty and wellness BNPL business. We act as the data controller for the personal data
        described in this policy, meaning we determine the purposes and means of processing your personal data.
      </P>
      <P>Our details are as follows:</P>
      <Bullets
        items={[
          <>Full legal name: AfterGlow Credit Limited</>,
          <>Company number: [To be confirmed]</>,
          <>Registered address: [To be confirmed]</>,
          <>Data protection contact / DPO: [To be confirmed]</>,
          <>
            Email: <Mail address="hello@afterglowcredit.com" />
          </>,
        ]}
      />
      <P>
        If you have any questions about this privacy policy or how we handle your personal data, please contact us
        using the details set out above or in section 16 below.
      </P>
    </Section>

    <Section n={2} title="Personal Data We Collect">
      <P>
        We collect different categories of personal data depending on how you interact with us. We have set out below
        the types of personal data we collect in respect of each category of individual.
      </P>

      <SubHeading>2.1 All website visitors</SubHeading>
      <P>When you visit our website, we automatically collect certain technical and usage data, including:</P>
      <Bullets
        items={[
          "IP address (which may be truncated or anonymised depending on our analytics configuration);",
          "browser type and version, device type and operating system;",
          "pages visited, time spent on pages, clickstream data and referring URL; and",
          "cookie identifiers and similar technology data (see section 6 below).",
        ]}
      />

      <SubHeading>2.2 Customer waitlist and sign-up</SubHeading>
      <P>If you sign up to our customer waitlist or register your interest in our BNPL service, we collect:</P>
      <Bullets
        items={[
          "name;",
          "email address;",
          "any other information you voluntarily provide in the sign-up form (for example, beauty or wellness preferences); and",
          "date and time of registration, IP address.",
        ]}
      />

      <SubHeading>2.3 Merchants and business partners</SubHeading>
      <P>If you are a merchant or business expressing interest in partnering with AfterGlow, we collect:</P>
      <Bullets
        items={[
          "business contact name and job title;",
          "business email address and telephone number;",
          "business name, trading name and company registration number;",
          "business address and website URL;",
          "nature of products or services offered; and",
          "any other information you provide in the merchant enquiry or onboarding form.",
        ]}
      />

      <SubHeading>2.4 BNPL customers (post-launch)</SubHeading>
      <P>
        Once our BNPL service is operational, we will collect additional personal data from customers applying for and
        using the service. This will include:
      </P>
      <Bullets
        items={[
          <>
            <Lead>Identity data:</Lead> full name, date of birth, title, and identity verification documents.
          </>,
          <>
            <Lead>Contact data:</Lead> home address, email address and telephone number.
          </>,
          <>
            <Lead>Financial data:</Lead> bank account details, payment card details, income information, employment
            status and credit history.
          </>,
          <>
            <Lead>Transaction data:</Lead> details of purchases made using the BNPL service, payment history,
            repayment amounts and dates.
          </>,
          <>
            <Lead>Credit and affordability data:</Lead> information obtained from credit reference agencies (“CRAs”),
            fraud prevention agencies and other databases used in credit and affordability assessments.
          </>,
          <>
            <Lead>KYC/AML data:</Lead> information required to verify your identity and comply with anti-money
            laundering and counter-terrorist financing legislation.
          </>,
          <>
            <Lead>Technical data:</Lead> device information, login data, browser fingerprint and similar technical
            identifiers.
          </>,
          <>
            <Lead>Profile data:</Lead> your username or customer reference, purchase preferences and feedback.
          </>,
          <>
            <Lead>Marketing and communications data:</Lead> your preferences in receiving marketing from us and your
            communication preferences.
          </>,
        ]}
      />
      <P>
        <Lead>Special category data:</Lead> We do not intentionally collect special category personal data (such as
        data about health, ethnicity, religious beliefs or sexual orientation). While our service operates in the
        beauty and wellness sector, the fact that a customer uses a beauty or wellness BNPL service does not, of
        itself, reveal special category data. However, if you voluntarily provide information that constitutes special
        category data, we will process it only with your explicit consent and in accordance with applicable law.
      </P>
    </Section>

    <Section n={3} title="How We Use Your Personal Data">
      <P>
        We use your personal data for the purposes set out below. For each purpose, we have identified the lawful basis
        on which we rely under UK GDPR.
      </P>

      <SubHeading>3.1 All website visitors</SubHeading>
      <Table
        head={["Purpose", "Lawful basis"]}
        rows={[
          [
            "Operating, maintaining and improving our website",
            "Legitimate interests (maintaining and improving our online presence and understanding how visitors use our website)",
          ],
          [
            "Analysing website usage and traffic patterns",
            "Legitimate interests (understanding website performance and user behaviour to improve our service); consent for non-essential cookies (see section 6)",
          ],
          [
            "Ensuring website security and preventing fraud or abuse",
            "Legitimate interests (protecting our website, systems and users from security threats)",
          ],
          [
            "Complying with legal obligations (e.g. responding to lawful requests from regulators or law enforcement)",
            "Legal obligation",
          ],
        ]}
      />

      <SubHeading>3.2 Customer waitlist and sign-up</SubHeading>
      <Table
        head={["Purpose", "Lawful basis"]}
        rows={[
          [
            "Managing your waitlist registration and communicating with you about our launch",
            "Performance of a contract (or steps taken at your request prior to entering into a contract); alternatively, legitimate interests (managing and responding to expressions of interest in our service)",
          ],
          [
            "Sending you updates about the launch of the AfterGlow service",
            "Legitimate interests (keeping interested individuals informed about a service they have expressed interest in); consent where required under PECR for electronic marketing",
          ],
          [
            "Sending you marketing communications about AfterGlow products and services",
            "Consent (which you may withdraw at any time; see section 5)",
          ],
          ["Internal record-keeping and administration", "Legitimate interests (maintaining accurate business records)"],
        ]}
      />

      <SubHeading>3.3 Merchants and business partners</SubHeading>
      <Table
        head={["Purpose", "Lawful basis"]}
        rows={[
          [
            "Assessing and processing merchant partnership enquiries and applications",
            "Legitimate interests (evaluating potential business relationships); steps necessary to enter into a contract",
          ],
          [
            "Communicating with merchant contacts about the AfterGlow platform and partnership opportunities",
            "Legitimate interests (managing our business relationships and discussing commercial opportunities)",
          ],
          [
            "Merchant onboarding, due diligence and ongoing relationship management",
            "Performance of a contract; legal obligation (where due diligence is required by law or regulation)",
          ],
          [
            "Sending B2B marketing communications about AfterGlow services to business contacts",
            "Legitimate interests (promoting our services to businesses likely to have a genuine interest); consent where required",
          ],
        ]}
      />

      <SubHeading>3.4 BNPL customers (post-launch)</SubHeading>
      <Table
        head={["Purpose", "Lawful basis"]}
        rows={[
          [
            "Processing your BNPL application and providing the BNPL service",
            "Performance of a contract (or steps taken at your request prior to entering into a contract)",
          ],
          [
            "Carrying out credit and affordability assessments",
            "Performance of a contract; legal obligation (under consumer credit legislation and FCA rules); legitimate interests (responsible lending and assessing creditworthiness)",
          ],
          [
            "Identity verification (KYC) and anti-money laundering / counter-terrorist financing checks",
            "Legal obligation (under the Money Laundering, Terrorist Financing and Transfer of Funds (Information on the Payer) Regulations 2017 and related legislation)",
          ],
          [
            "Fraud prevention and detection",
            "Legal obligation; legitimate interests (preventing and detecting fraud to protect our business and customers)",
          ],
          [
            "Sharing data with credit reference agencies and fraud prevention agencies",
            "Performance of a contract; legal obligation; legitimate interests (responsible lending, fraud prevention and maintaining the integrity of the credit system)",
          ],
          ["Processing payments, managing repayments and administering your account", "Performance of a contract"],
          [
            "Communicating with you about your account, transactions and any arrears or defaults",
            "Performance of a contract; legal obligation",
          ],
          [
            "Complying with regulatory requirements, including FCA rules and reporting obligations",
            "Legal obligation",
          ],
          [
            "Sending you marketing communications about AfterGlow products and services",
            "Consent (which you may withdraw at any time)",
          ],
          [
            "Exercising or defending legal claims",
            "Legitimate interests (establishing, exercising or defending our legal rights)",
          ],
        ]}
      />
    </Section>

    <Section n={4} title="Lawful Bases: Further Information">
      <P>
        <Lead>Legitimate interests:</Lead> Where we rely on legitimate interests as our lawful basis, we have carried
        out a balancing exercise to ensure that our interests do not override your fundamental rights and freedoms. You
        have the right to object to processing based on legitimate interests (see section 13 below). If you wish to
        obtain further information about our balancing assessments, please contact us using the details in section 16.
      </P>
      <P>
        <Lead>Consent:</Lead> Where we rely on consent, you have the right to withdraw your consent at any time.
        Withdrawal of consent does not affect the lawfulness of processing carried out before the withdrawal.
      </P>
      <P>
        <Lead>Automated decision-making:</Lead> Our BNPL credit and affordability assessment process may involve
        automated decision-making, including profiling, which produces legal effects concerning you or similarly
        significantly affects you (for example, a decision to approve or decline your BNPL application). For further
        detail on your rights in relation to automated decision-making, see section 13 below.
      </P>
    </Section>

    <Section n={5} title="Marketing Communications">
      <P>
        We will only send you direct marketing communications by email, SMS or other electronic means where:
      </P>
      <Bullets
        items={[
          "you have given us your specific, informed and freely given consent to receive such communications; or",
          "you are an existing customer (or have negotiated to become one) and we are marketing our own similar products or services to you by email, and we gave you the opportunity to opt out when we first collected your details and in every subsequent communication (the “soft opt-in” under regulation 22 of the Privacy and Electronic Communications Regulations 2003 (“PECR”)).",
        ]}
      />
      <P>In either case, you can opt out of receiving marketing communications at any time by:</P>
      <Bullets
        items={[
          "clicking the “unsubscribe” link in any marketing email;",
          <>
            emailing us at <Mail address="hello@afterglowcredit.com" />; or
          </>,
          "contacting us using the details set out in section 16.",
        ]}
      />
      <P>
        Where you opt out of marketing, this will not affect the lawfulness of any processing carried out before you
        opted out. We may still send you non-marketing communications which are necessary for the administration of
        your account or are required by law (for example, service notifications, transaction confirmations or
        regulatory communications).
      </P>
      <P>
        <Lead>B2B marketing:</Lead> Where we send marketing communications to business contacts at merchant or partner
        organisations, we do so on the basis of our legitimate interests in promoting our services to businesses likely
        to have a genuine interest. Such contacts may opt out at any time using the methods described above.
      </P>
    </Section>

    <Section n={6} title="Cookies and Similar Technologies" id="cookies">
      <P>
        Our website uses cookies and similar technologies (such as pixels, tags and local storage) to distinguish you
        from other users, to improve your experience on our website, and to help us understand how our website is used.
      </P>
      <P>
        Cookies are small text files placed on your device by our website. They allow us to recognise your device and
        store certain information about your preferences or past actions.
      </P>
      <P>We use the following categories of cookies:</P>
      <Bullets
        items={[
          <>
            <Lead>Strictly necessary cookies:</Lead> These are essential for the operation of our website. They
            include, for example, cookies that enable you to navigate our website and use its features. These do not
            require your consent.
          </>,
          <>
            <Lead>Performance and analytics cookies:</Lead> These allow us to recognise and count the number of
            visitors and to see how visitors move around our website. This helps us to improve the way our website
            works. We will only set these cookies with your consent.
          </>,
          <>
            <Lead>Functionality cookies:</Lead> These are used to recognise you when you return to our website,
            enabling us to personalise our content and remember your preferences. We will only set these cookies with
            your consent.
          </>,
          <>
            <Lead>Targeting or advertising cookies:</Lead> If used, these cookies record your visit to our website, the
            pages you have visited and the links you have followed. We will only set these cookies with your consent.
          </>,
        ]}
      />
      <P>The specific cookies currently in use on our website are set out in the table below:</P>
      <Table head={["Cookie Name", "Provider", "Purpose", "Category", "Type", "Duration"]} rows={COOKIE_ROWS} />
      <P>
        The cookies listed above are those in use on our website as at the date of this policy. We will update this
        table if we add or change the cookies we use.
      </P>
      <P>
        When you first visit our website, you will be presented with our cookie consent banner, which allows you to
        accept or reject non-essential cookies. Non-essential cookies (including performance and analytics cookies and
        targeting and advertising cookies) are blocked by default and will not be placed on your device until you give
        your consent. You can change your cookie preferences at any time through the cookie consent banner or our{" "}
        <button
          type="button"
          onClick={reopenConsent}
          className="text-primary underline underline-offset-2 hover:no-underline"
        >
          cookie settings
        </button>
        .
      </P>
      <P>
        You can also manage cookies through your browser settings. Most browsers allow you to view, delete and block
        cookies. Please be aware that if you disable or delete cookies, some features of our website may not function
        properly and your browsing experience may be affected. For further information about managing cookies, visit{" "}
        <Ext href="https://www.allaboutcookies.org">www.allaboutcookies.org</Ext>.
      </P>
    </Section>

    <Section n={7} title="Analytics and Website Tracking">
      <P>
        We use Google Analytics 4 (GA4), provided by Google LLC, to understand how visitors interact with our website
        and to analyse website usage.
      </P>
      <P>
        GA4 sets non-essential cookies (as described in section 6 above) and processes personal data. We will only
        activate GA4 with your consent via our cookie consent banner, unless it is configured to operate without
        cookies and processes only anonymised or aggregated data. AfterGlow has configured Google Analytics in
        accordance with ICO guidance, including the use of IP anonymisation where available.
      </P>
      <P>
        Google processes personal data collected through GA4 as a data processor on AfterGlow's behalf and in
        accordance with our documented instructions. We have entered into an appropriate data processing agreement with
        Google in accordance with Article 28 UK GDPR.
      </P>
    </Section>

    <Section n={8} title="Sharing Personal Data with Third Parties">
      <P>
        We do not sell your personal data. We may share your personal data with the categories of third parties set out
        below, for the purposes described in this policy and only to the extent necessary.
      </P>

      <SubHeading>8.1 Service providers (data processors)</SubHeading>
      <P>
        We engage third-party service providers who process personal data on our behalf and in accordance with our
        documented instructions. We have entered into data processing agreements with each processor in accordance with
        Article 28 UK GDPR. These service providers include:
      </P>
      <Bullets
        items={[
          "Website hosting and infrastructure providers;",
          "Email service providers and CRM platforms;",
          "Analytics providers (see section 7);",
          "Cloud storage and IT service providers; and",
          "Customer support platforms.",
        ]}
      />

      <SubHeading>8.2 Payment providers and technology partners</SubHeading>
      <P>
        Where you use the AfterGlow BNPL service, your payment and transaction data may be shared with payment service
        providers and payment processors who facilitate transactions on our behalf.
      </P>
      <P>
        These providers may act as independent data controllers or as joint controllers with us, depending on the
        nature of the processing. Where a provider acts as a data controller in its own right, its own privacy policy
        will apply to its processing of your personal data.
      </P>

      <SubHeading>8.3 Advertising and analytics partners</SubHeading>
      <P>
        Personal data collected through the advertising pixels and tags on our website (as described in section 6
        above) may be shared with Meta Platforms Ireland Limited (Meta), Google LLC (Google), LinkedIn Ireland
        Unlimited Company (LinkedIn) and TikTok Information Technologies UK Limited (TikTok). These providers process
        personal data collected through their respective pixels and tags as independent data controllers for their own
        purposes, including ad measurement, optimisation and audience building. Their processing of your personal data
        is governed by their own privacy policies:
      </P>
      <Bullets
        items={[
          <>
            Meta: <Ext href="https://www.facebook.com/privacy/policy">www.facebook.com/privacy/policy</Ext>
          </>,
          <>
            Google: <Ext href="https://policies.google.com/privacy">policies.google.com/privacy</Ext>
          </>,
          <>
            LinkedIn:{" "}
            <Ext href="https://www.linkedin.com/legal/privacy-policy">www.linkedin.com/legal/privacy-policy</Ext>
          </>,
          <>
            TikTok: <Ext href="https://www.tiktok.com/legal/privacy-policy">www.tiktok.com/legal/privacy-policy</Ext>
          </>,
        ]}
      />

      <SubHeading>8.4 Credit reference agencies (“CRAs”)</SubHeading>
      <P>
        When you apply for our BNPL service, we will carry out credit and affordability checks. In doing so, we may
        share your personal data with, and receive personal data from, credit reference agencies. The CRAs will record
        our search on your credit file, whether or not your application proceeds.
      </P>
      <P>
        The main CRAs used in the UK are Experian, Equifax and TransUnion. Each CRA has its own privacy notice
        explaining how it uses your personal data:
      </P>
      <Bullets
        items={[
          <>
            Experian: <Ext href="https://www.experian.co.uk/crain">www.experian.co.uk/crain</Ext>
          </>,
          <>
            Equifax: <Ext href="https://www.equifax.co.uk/crain">www.equifax.co.uk/crain</Ext>
          </>,
          <>
            TransUnion: <Ext href="https://www.transunion.co.uk/crain">www.transunion.co.uk/crain</Ext>
          </>,
        ]}
      />

      <SubHeading>8.5 Fraud prevention agencies</SubHeading>
      <P>
        We may share your personal data with fraud prevention agencies and databases to help prevent fraud, money
        laundering and other financial crime. If fraud is detected, you could be refused certain services, finance or
        employment. Further details of how your personal data is used by fraud prevention agencies, and your data
        protection rights, are available from the relevant agency.
      </P>

      <SubHeading>8.6 Regulators, law enforcement and legal advisers</SubHeading>
      <P>We may share your personal data with:</P>
      <Bullets
        items={[
          "the Financial Conduct Authority (“FCA”) or other regulators, in connection with our regulatory obligations;",
          "the Information Commissioner's Office (“ICO”) in connection with data protection matters;",
          "HM Revenue & Customs or other tax authorities;",
          "law enforcement agencies, courts or tribunals where required by law or to exercise or defend legal claims; and",
          "our professional advisers (including legal, accounting and auditing advisers), subject to appropriate confidentiality obligations.",
        ]}
      />

      <SubHeading>8.7 Other disclosures</SubHeading>
      <P>We may also share your personal data:</P>
      <Bullets
        items={[
          "with any person to whom we propose to transfer all or substantially all of our business or assets (including in the event of a reorganisation, dissolution or liquidation);",
          "where we are required to do so by law, regulation, court order or other legal process; or",
          "to protect the rights, property or safety of AfterGlow, our customers, merchants or others.",
        ]}
      />
    </Section>

    <Section n={9} title="KYC, AML, Fraud Prevention and Credit Checks">
      <P>
        As a business operating in the consumer credit and BNPL sector, we are subject to legal and regulatory
        obligations requiring us to:
      </P>
      <Bullets
        items={[
          "verify your identity (Know Your Customer or “KYC” checks) before providing our BNPL service;",
          "carry out anti-money laundering (“AML”) and counter-terrorist financing checks as required by the Money Laundering, Terrorist Financing and Transfer of Funds (Information on the Payer) Regulations 2017;",
          "conduct credit and affordability assessments in accordance with FCA rules and responsible lending obligations; and",
          "check fraud prevention databases to prevent and detect fraud and financial crime.",
        ]}
      />
      <P>These checks may involve:</P>
      <Bullets
        items={[
          "searching your record at CRAs and recording the search on your credit file;",
          "checking your details against fraud prevention databases;",
          "verifying your identity using electronic identity verification services;",
          "assessing your financial circumstances based on information you provide and information obtained from CRAs; and",
          "sharing information about your account and payment conduct with CRAs on an ongoing basis (including where you fail to make payments when due).",
        ]}
      />
      <P>
        <Lead>Automated decision-making in credit assessments:</Lead> Our credit and affordability assessment process
        may involve solely automated decision-making, including profiling, as permitted by Article 22(2) UK GDPR on the
        grounds that the decision is necessary for entering into or performing a contract with you, and/or is
        authorised by applicable law. This means that a decision about whether to approve your BNPL application may be
        made by automated means without human involvement. You have the right to request human intervention, to express
        your point of view and to contest any such automated decision. See section 13 below for further details on your
        rights.
      </P>
      <P>
        The lawful bases for these processing activities are: legal obligation (compliance with AML/KYC and FCA
        regulatory requirements); performance of a contract (steps necessary before and during the provision of the
        BNPL service); and legitimate interests (responsible lending, fraud prevention and the protection of our
        business and customers).
      </P>
    </Section>

    <Section n={10} title="Data Retention">
      <P>
        We retain your personal data only for as long as is necessary for the purposes for which it was collected, or
        as required by applicable law or regulation. When determining the appropriate retention period, we consider the
        amount, nature and sensitivity of the personal data, the potential risk of harm from unauthorised use or
        disclosure, the purposes for which we process it, whether we can achieve those purposes through other means,
        and applicable legal, regulatory and contractual requirements.
      </P>
      <P>
        The following table summarises our general retention periods. Specific retention periods may vary depending on
        individual circumstances.
      </P>
      <Table
        head={["Category of data", "Retention period", "Rationale"]}
        rows={[
          [
            "Website visitor / analytics data",
            "Up to 26 months from date of collection (or as configured in our analytics tools)",
            "Industry standard for analytics; adjusted in accordance with cookie consent",
          ],
          [
            "Waitlist / sign-up data",
            "Until the individual unsubscribes or requests deletion, and for a reasonable period thereafter for record-keeping",
            "Necessary to manage the waitlist and communicate with interested individuals",
          ],
          [
            "Merchant enquiry data",
            "For the duration of the business relationship and for six years following its termination",
            "Limitation period for contractual claims",
          ],
          [
            "BNPL customer data (transactional and account data)",
            "For the duration of the customer relationship and for six years following the closure or settlement of the account",
            "Limitation Act 1980 (six-year limitation period); FCA record-keeping requirements",
          ],
          [
            "Credit and affordability assessment data",
            "For six years from the date of the decision or the closure of the account, whichever is later",
            "Regulatory record-keeping; limitation periods; responsible lending obligations",
          ],
          [
            "KYC / AML records",
            "For five years from the end of the business relationship (or longer where required by law or regulation)",
            "Money Laundering Regulations 2017 (regulation 40)",
          ],
          [
            "Fraud prevention data",
            "In accordance with the applicable fraud prevention agency's retention policy, and our own retention schedule",
            "Regulatory requirements; legitimate interests in fraud prevention",
          ],
          [
            "Marketing consent records",
            "For as long as the consent is relied upon, and for a reasonable period thereafter as evidence of consent",
            "Accountability obligations under UK GDPR",
          ],
        ]}
      />
      <P>
        Where personal data is no longer required, we will securely delete or anonymise it in accordance with our data
        retention and disposal procedures.
      </P>
    </Section>

    <Section n={11} title="International Transfers of Personal Data">
      <P>
        We are based in the United Kingdom. Where we transfer personal data outside the United Kingdom, we ensure that
        appropriate safeguards are in place to protect your personal data in accordance with UK GDPR.
      </P>
      <P>
        Some of our service providers and advertising partners, including Google, Meta, LinkedIn and TikTok, are
        headquartered outside the United Kingdom (principally in the United States) and may transfer personal data
        collected through our website to countries outside the UK. Where the United States is the destination,
        transfers may be made pursuant to the UK Extension to the EU-US Data Privacy Framework where the recipient is
        certified, or under the UK IDTA or UK Addendum to the EU Standard Contractual Clauses.
      </P>
      <P>
        Transfers to countries or territories that the UK Secretary of State has determined provide an adequate level
        of data protection (known as “adequacy regulations”) do not require additional safeguards. The UK currently
        recognises adequacy in respect of the EEA, and certain other jurisdictions.
      </P>
      <P>
        Where we transfer personal data to a country or territory that is not covered by an adequacy decision, we rely
        on one or more of the following safeguards:
      </P>
      <Bullets
        items={[
          "UK International Data Transfer Agreement (“UK IDTA”) or the UK Addendum to the EU Standard Contractual Clauses - approved by the ICO under section 119A of the Data Protection Act 2018;",
          "Binding corporate rules (where applicable); and",
          "Derogations under Article 49 UK GDPR in limited circumstances (for example, where the transfer is necessary for the performance of a contract with you).",
        ]}
      />
      <P>
        If you wish to obtain further details about the safeguards we have put in place for international transfers of
        personal data, please contact us using the details set out in section 16.
      </P>
    </Section>

    <Section n={12} title="Data Security">
      <P>
        We take the security of your personal data seriously and have implemented appropriate technical and
        organisational measures to protect your personal data against unauthorised or unlawful processing, accidental
        loss, destruction or damage. These measures include:
      </P>
      <Bullets
        items={[
          "encryption of personal data in transit and at rest (where appropriate);",
          "access controls to limit access to personal data to authorised personnel on a need-to-know basis;",
          "regular security assessments and penetration testing;",
          "secure development practices for our website and systems;",
          "staff training on data protection and information security; and",
          "incident response and breach notification procedures.",
        ]}
      />
      <P>
        While we take all reasonable precautions, no method of transmission over the internet or method of electronic
        storage is completely secure. We cannot guarantee the absolute security of your personal data.
      </P>
    </Section>

    <Section n={13} title="Your Rights Under UK GDPR" id="your-rights">
      <P>
        Under UK data protection law, you have the following rights in relation to your personal data. These rights are
        not absolute and are subject to certain exemptions and conditions.
      </P>
      <Table
        head={["Right", "Description"]}
        rows={[
          [
            "Right of access",
            "You have the right to request a copy of the personal data we hold about you (a “subject access request” or “SAR”). We will respond within one month of receiving a valid request (or within a further two months where the request is complex or we have received multiple requests).",
          ],
          [
            "Right to rectification",
            "You have the right to request that we correct any inaccurate personal data or complete any incomplete personal data.",
          ],
          [
            "Right to erasure",
            "You have the right to request that we delete your personal data in certain circumstances (for example, where it is no longer necessary for the purpose for which it was collected). This right does not apply where we are required to retain data by law or regulation (for example, KYC/AML records or credit data).",
          ],
          [
            "Right to restriction of processing",
            "You have the right to request that we restrict the processing of your personal data in certain circumstances (for example, while we verify the accuracy of your data following a challenge).",
          ],
          [
            "Right to data portability",
            "You have the right to receive the personal data you have provided to us in a structured, commonly used and machine-readable format, and to transmit that data to another controller, where the processing is based on consent or contract and is carried out by automated means.",
          ],
          [
            "Right to object",
            "You have the right to object to processing based on legitimate interests or for direct marketing purposes. Where you object to direct marketing, we will stop processing your data for that purpose.",
          ],
          [
            "Rights in relation to automated decision-making and profiling",
            "Where we make decisions based solely on automated processing (including profiling) that produce legal effects concerning you or similarly significantly affect you (such as BNPL credit decisions), you have the right to: (i) request human intervention; (ii) express your point of view; and (iii) contest the decision. See section 9 above for further details of our automated decision-making processes.",
          ],
          [
            "Right to withdraw consent",
            "Where we rely on your consent as the lawful basis for processing, you have the right to withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness of processing carried out before the withdrawal.",
          ],
        ]}
      />
      <P>
        To exercise any of your rights, please contact us using the details set out in section 16 below. We may ask you
        to verify your identity before acting on your request. We will not charge a fee for exercising your rights
        unless your request is manifestly unfounded or excessive, in which case we may charge a reasonable fee or
        refuse the request.
      </P>
    </Section>

    <Section n={14} title="Complaints" id="complaints">
      <P>
        If you are dissatisfied with how we have handled your personal data or wish to make a complaint about our data
        protection practices, we encourage you to contact us first so that we can try to resolve the matter:
      </P>
      <Bullets
        items={[
          <>
            By email: <Mail address="hello@afterglowcredit.com" />
          </>,
        ]}
      />
      <P>We will acknowledge your complaint promptly and aim to respond substantively within 30 days.</P>
    </Section>

    <Section n={15} title="The Information Commissioner's Office">
      <P>
        If you are not satisfied with our response to your complaint, or if you believe that we are processing your
        personal data in a way that is not compliant with UK data protection law, you have the right to lodge a
        complaint with the Information Commissioner's Office (“ICO”). The ICO is the UK's independent supervisory
        authority for data protection.
      </P>
      <P className="whitespace-pre-line">
        {"Information Commissioner's Office\nWycliffe House\nWater Lane\nWilmslow\nCheshire SK9 5AF"}
      </P>
      <P>
        Telephone: 0303 123 1113
        <br />
        Website: <Ext href="https://www.ico.org.uk">www.ico.org.uk</Ext>
      </P>
      <P>
        We would, however, appreciate the opportunity to address your concerns before you approach the ICO, and we ask
        that you contact us in the first instance.
      </P>
    </Section>

    <Section n={16} title="How to Contact Us" id="contact-us">
      <P>
        If you have any questions about this privacy policy, wish to exercise your data protection rights, or want to
        raise a concern about how we process your personal data, please contact us:
      </P>
      <P>
        AfterGlow
        <br />
        Email: <Mail address="hello@afterglowcredit.com" />
      </P>
    </Section>

    <Section n={17} title="Children's Data">
      <P>
        Our website and services, including the BNPL service, are not intended for, or directed at, individuals under
        the age of 18. We do not knowingly collect personal data from children under 18.
      </P>
      <P>
        If you are under 18, please do not provide any personal data to us through our website, waitlist, or any other
        means.
      </P>
      <P>
        If we become aware that we have collected personal data from a child under 18, we will take steps to delete
        that data as soon as reasonably practicable. If you believe that we may have collected personal data from a
        child under 18, please contact us immediately using the details set out in section 16.
      </P>
    </Section>

    <Section n={18} title="Changes to This Privacy Policy">
      <P>
        We may update this privacy policy from time to time to reflect changes in our processing activities, legal or
        regulatory requirements, or business practices. Where we make material changes, we will notify you by:
      </P>
      <Bullets
        items={[
          "posting a prominent notice on our website;",
          "sending you a notification by email (where we hold your email address and it is appropriate to do so); and/or",
          "updating the “last updated” date at the top of this policy.",
        ]}
      />
      <P>
        We encourage you to review this privacy policy periodically to stay informed about how we are protecting your
        personal data.
      </P>
      <P>The version of this privacy policy published on our website is the current version.</P>
      <P className="pt-4">
        See also our{" "}
        <Link to="/terms" className="text-primary underline underline-offset-2 hover:no-underline">
          Website Terms and Conditions
        </Link>
        .
      </P>
    </Section>
  </LegalPage>
);

export default Privacy;
