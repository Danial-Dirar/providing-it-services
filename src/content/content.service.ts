import { Injectable } from '@nestjs/common';

/**
 * Single source of truth for every piece of editorial content on the site.
 *
 * Everything the client will eventually want to change — service copy,
 * industry list, office details, stats — lives here so the templates stay
 * structural. Swapping this for a CMS later means replacing one provider.
 */

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface Service {
  /** Two-letter practice code used as the structural marker across the site. */
  code: string;
  slug: string;
  title: string;
  /** Short line used on cards and in nav. */
  tagline: string;
  /** Long-form intro on the detail page. */
  intro: string;
  /** What the client actually receives. */
  deliverables: string[];
  /** How the practice works day to day. */
  approach: { heading: string; body: string }[];
  /** Tooling and platforms this practice works in. */
  stack: string[];
  /** Engagement shapes buyers can pick from. */
  engagements: { name: string; body: string }[];
  /** Questions prospects always ask this practice. */
  faqs: { q: string; a: string }[];
}

export interface Industry {
  slug: string;
  name: string;
  body: string;
  /** Things this sector actually asks us for. */
  needs: string[];
}

export interface CaseStudy {
  slug: string;
  /** Anonymised until the client signs a public reference agreement. */
  client: string;
  sector: string;
  title: string;
  summary: string;
  challenge: string;
  approach: string[];
  outcome: { metric: string; label: string }[];
  services: string[];
  duration: string;
}

export interface Role {
  slug: string;
  title: string;
  practice: string;
  type: string;
  location: string;
  level: string;
  summary: string;
  responsibilities: string[];
  requirements: string[];
}

export interface HubCity {
  name: string;
  /** Hours offset from Dhaka (UTC+6). Negative = behind Dhaka. */
  offset: number;
  /** IANA zone, used for the live clock strip. */
  zone: string;
}

@Injectable()
export class ContentService {
  readonly company = {
    name: 'Providing IT Services',
    shortName: 'PITS',
    tagline: 'Technology · Consulting · Support',
    legalName: 'Providing IT Services',
    founded: '2019',
    description:
      'A Dhaka-based technology services firm building software, data platforms and back-office operations for companies in Bangladesh and abroad.',
    address: {
      line1: 'Level 5, House 32, Road 11',
      line2: 'Banani, Dhaka 1213',
      country: 'Bangladesh',
      maps: 'https://maps.google.com/?q=Banani,+Dhaka+1213,+Bangladesh',
    },
    phone: '+880 1XXX-XXXXXX',
    phoneHref: '+8801XXXXXXXXX',
    email: 'hello@providingitservices.com',
    salesEmail: 'newbusiness@providingitservices.com',
    careersEmail: 'careers@providingitservices.com',
    hours: 'Sunday – Thursday, 09:00 – 18:00 (GMT+6)',
    social: [
      { name: 'LinkedIn', href: 'https://www.linkedin.com/company/providing-it-services' },
      { name: 'GitHub', href: 'https://github.com/providing-it-services' },
      { name: 'Facebook', href: 'https://www.facebook.com/providingitservices' },
    ],
  };

  /** Cities we quote delivery overlap against. Offsets are from Dhaka (UTC+6). */
  readonly hubs: HubCity[] = [
    { name: 'London', offset: -5, zone: 'Europe/London' },
    { name: 'New York', offset: -10, zone: 'America/New_York' },
    { name: 'Dubai', offset: -2, zone: 'Asia/Dubai' },
    { name: 'Singapore', offset: 2, zone: 'Asia/Singapore' },
    { name: 'Sydney', offset: 4, zone: 'Australia/Sydney' },
  ];

  readonly nav: NavItem[] = [
    { label: 'Services', href: '/services' },
    { label: 'Industries', href: '/industries' },
    { label: 'Work', href: '/work' },
    { label: 'About', href: '/about' },
    { label: 'Careers', href: '/careers' },
  ];

  readonly services: Service[] = [
    {
      code: 'WD',
      slug: 'web-and-software-development',
      title: 'Web & Software Development',
      tagline: 'Products, platforms and integrations built to survive their second year.',
      intro:
        'We build the systems a business runs on: customer-facing web platforms, internal tools, APIs and the integrations that stitch them to everything already in place. Every engagement ships to a real environment early and keeps shipping, so you are never holding a demo that has never met production traffic.',
      deliverables: [
        'Web platforms and customer portals',
        'Internal operations and admin tooling',
        'REST and GraphQL APIs, service integrations',
        'Legacy system modernisation and migration',
        'Mobile-responsive front-ends and design systems',
        'CI/CD pipelines, monitoring and release process',
      ],
      approach: [
        {
          heading: 'Scope before code',
          body: 'A short discovery produces a written scope, a risk list and a delivery plan you can hold us to. If discovery says the project should be smaller, we say so.',
        },
        {
          heading: 'Ship in two-week increments',
          body: 'Working software goes to a staging environment every fortnight. You review the actual system, not a slide about it.',
        },
        {
          heading: 'Handover is part of the build',
          body: 'Documentation, runbooks and a walkthrough with your team are delivered alongside the code — not promised for later.',
        },
      ],
      stack: [
        'TypeScript', 'Node.js', 'NestJS', 'React', 'Next.js', 'Laravel', 'PHP',
        'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Docker', 'AWS', 'Azure',
      ],
      engagements: [
        { name: 'Fixed-scope project', body: 'A defined outcome, a fixed price and a delivery date. Best when the requirements are settled.' },
        { name: 'Dedicated team', body: 'Named engineers working only on your roadmap, billed monthly. Best when the roadmap keeps moving.' },
        { name: 'Support retainer', body: 'A block of hours each month for fixes, small features and on-call cover on an existing system.' },
      ],
      faqs: [
        { q: 'Do we own the code?', a: 'Yes. Source, infrastructure definitions and documentation transfer to you on final payment, and the repository lives in your organisation from day one if you prefer.' },
        { q: 'Can you take over a half-finished project?', a: 'Often. We start with a paid code and infrastructure audit — a fixed one-week engagement — that tells you honestly whether the codebase is worth continuing.' },
        { q: 'What happens after launch?', a: 'A 30-day warranty on defects is included in every project. Beyond that, most clients move to a support retainer.' },
      ],
    },
    {
      code: 'DA',
      slug: 'data-analytics',
      title: 'Data & Analytics',
      tagline: 'Reporting your board trusts, built on pipelines that do not break quietly.',
      intro:
        'Most companies do not have a data problem, they have twelve versions of the same number. We consolidate the sources, build the pipelines, and put a single reviewed definition behind every metric that reaches a decision-maker — then make it self-serve so your team stops waiting on a monthly export.',
      deliverables: [
        'Data warehouse design and implementation',
        'ETL / ELT pipelines with monitoring and alerting',
        'Executive and operational dashboards',
        'Metric definition and data dictionary',
        'Reporting automation and scheduled distribution',
        'Forecasting and predictive models where the data supports them',
      ],
      approach: [
        {
          heading: 'Start with the decision',
          body: 'We work backwards from the decisions the reporting has to support. Dashboards nobody acts on are the most expensive thing in analytics.',
        },
        {
          heading: 'One definition per number',
          body: 'Every metric gets a written definition, an owner and a test. When finance and operations disagree, the dictionary settles it.',
        },
        {
          heading: 'Pipelines that page someone',
          body: 'Freshness and row-count checks run on every load. A silent failure that leaves yesterday’s numbers on the screen is worse than an outage.',
        },
      ],
      stack: [
        'Python', 'SQL', 'dbt', 'Airflow', 'PostgreSQL', 'BigQuery', 'Snowflake',
        'Power BI', 'Tableau', 'Metabase', 'Apache Superset', 'Pandas',
      ],
      engagements: [
        { name: 'Analytics assessment', body: 'Two to three weeks mapping your sources, gaps and reporting debt, ending in a costed roadmap.' },
        { name: 'Warehouse build', body: 'A fixed-scope project to stand up the warehouse, pipelines and first dashboard set.' },
        { name: 'Embedded analyst', body: 'An analyst inside your team on a monthly basis for ongoing modelling and reporting.' },
      ],
      faqs: [
        { q: 'Our data is a mess. Is it too early?', a: 'No — that is the normal starting condition. The assessment exists precisely to tell you what has to be cleaned first and what can wait.' },
        { q: 'Cloud or on-premise?', a: 'Both. Regulated clients in Bangladesh frequently need on-premise or in-country hosting, and we design for that constraint from the start.' },
        { q: 'Will our team be able to maintain it?', a: 'That is the point of the handover. We train your analysts on the models and leave the transformation layer in plain, reviewed SQL rather than a proprietary tool.' },
      ],
    },
    {
      code: 'ES',
      slug: 'it-enabled-services',
      title: 'IT Enabled Services',
      tagline: 'The operational work behind the software — run properly, measured openly.',
      intro:
        'ITeS is where technology meets the daily grind of running a business: data entry and migration, document digitisation, catalogue and content operations, technical support desks. We staff it with trained operators, run it against written quality targets, and report the numbers whether or not they flatter us.',
      deliverables: [
        'Data entry, cleansing and migration',
        'Document digitisation and indexing',
        'E-commerce catalogue and content operations',
        'Technical support desk (email, chat, voice)',
        'Back-office transaction processing',
        'Quality assurance and manual testing teams',
      ],
      approach: [
        {
          heading: 'Written before staffed',
          body: 'Every process is documented as a runbook and agreed with you before a single operator is assigned. The runbook is the contract.',
        },
        {
          heading: 'Sampled, not assumed',
          body: 'A fixed percentage of output is independently re-checked every day. Accuracy is a measured number on your dashboard, not a claim in a proposal.',
        },
        {
          heading: 'Ramp with a pilot',
          body: 'We start with a paid pilot batch so both sides can see real throughput and quality before committing to headcount.',
        },
      ],
      stack: [
        'Zendesk', 'Freshdesk', 'Jira Service Management', 'Salesforce',
        'Shopify', 'Magento', 'OCR pipelines', 'Custom operator tooling',
      ],
      engagements: [
        { name: 'Pilot batch', body: 'A fixed volume at a fixed price to establish real throughput, accuracy and unit cost.' },
        { name: 'Managed team', body: 'A named team with a team lead, monthly per-seat pricing and an agreed SLA.' },
        { name: 'Overflow capacity', body: 'Trained standby capacity you can switch on for seasonal peaks and switch off after.' },
      ],
      faqs: [
        { q: 'How do you handle our data securely?', a: 'Dedicated workstations, restricted floors, no removable media, NDAs at the individual operator level, and access scoped per project. Client-specific controls are written into the SLA.' },
        { q: 'What accuracy can you commit to?', a: 'It depends on the process complexity — the pilot tells us both. Typical structured data-entry SLAs land at 99.5% field-level accuracy, verified by daily sampling.' },
        { q: 'Can you cover our business hours?', a: 'Yes. Dhaka overlaps a full working day with Europe, Asia-Pacific and the Gulf, and we run shifted teams for North American hours.' },
      ],
    },
    {
      code: 'CS',
      slug: 'it-consultancy',
      title: 'IT Consultancy',
      tagline: 'An outside read on your systems, spend and roadmap — in writing.',
      intro:
        'Sometimes the useful thing is not another vendor building another system. Our consulting practice reviews what you already run — architecture, spend, security posture, team structure — and returns a prioritised, costed set of recommendations you can execute with us, with someone else, or in-house.',
      deliverables: [
        'Technology and architecture audit',
        'Cloud cost and infrastructure review',
        'Security posture and access-control assessment',
        'Vendor and build-versus-buy evaluation',
        'Digital transformation roadmap',
        'Interim technical leadership (fractional CTO)',
      ],
      approach: [
        {
          heading: 'Read the system, then the slides',
          body: 'We review the running infrastructure, the repositories and the invoices before we take anyone’s word for how it works.',
        },
        {
          heading: 'Interview across the org',
          body: 'The engineers, the operators and the finance lead each hold a different piece of the picture. All three get interviewed.',
        },
        {
          heading: 'Ranked by cost of delay',
          body: 'Findings arrive ordered by what they cost you each month they go unfixed, with effort estimates against each one.',
        },
      ],
      stack: [
        'AWS Well-Architected', 'Azure', 'ISO 27001 alignment', 'OWASP ASVS',
        'TOGAF-informed architecture review', 'FinOps practice',
      ],
      engagements: [
        { name: 'Focused audit', body: 'One to two weeks on a single question — cloud spend, a security review, a codebase valuation.' },
        { name: 'Transformation roadmap', body: 'Four to six weeks producing a sequenced, costed multi-year technology plan.' },
        { name: 'Fractional CTO', body: 'Two to eight days a month of senior technical leadership for companies not yet ready to hire one.' },
      ],
      faqs: [
        { q: 'Will you just recommend your own services?', a: 'Audits are priced and delivered independently of any build work. If the answer is a product you should buy, or a team you should hire directly, that is what the report will say.' },
        { q: 'Who sees the findings?', a: 'You do, first. We present to the sponsor before anyone else, so nothing lands in a board pack unread.' },
        { q: 'What do we actually receive?', a: 'A written report, a ranked findings register with effort and cost estimates, and a working session with your team to walk through it.' },
      ],
    },
    {
      code: 'BP',
      slug: 'business-process-outsourcing',
      title: 'Business Process Outsourcing',
      tagline: 'Run a function from Dhaka at a cost that changes the business case.',
      intro:
        'BPO is a staffing decision with an operational risk attached. We take on complete functions — customer support, finance operations, HR administration, lead qualification — recruit and train against your standards, and manage them to an SLA you set. You keep the process ownership; we carry the hiring, attrition and floor management.',
      deliverables: [
        'Customer support and service desk (voice, email, chat)',
        'Finance and accounting operations',
        'HR and payroll administration',
        'Lead qualification and inside sales support',
        'Order management and logistics coordination',
        'Dedicated team recruitment, training and retention',
      ],
      approach: [
        {
          heading: 'Hire to your bar',
          body: 'You define the profile and sit in on final interviews if you want to. Nobody joins your team without your standard being met.',
        },
        {
          heading: 'Transition, then transfer',
          body: 'A structured knowledge transfer with shadowing and reverse-shadowing, so the team is competent before it is accountable.',
        },
        {
          heading: 'Report against the SLA weekly',
          body: 'Volume, resolution time, quality score and utilisation, on a fixed weekly report. Misses come with a cause and a fix.',
        },
      ],
      stack: [
        'Zendesk', 'Intercom', 'HubSpot', 'Salesforce', 'Genesys', 'Five9',
        'Xero', 'QuickBooks', 'SAP', 'Workforce management tooling',
      ],
      engagements: [
        { name: 'Seat-based team', body: 'Monthly per-seat pricing including recruitment, training, floor space, management and equipment.' },
        { name: 'Transaction pricing', body: 'Pricing per ticket, per invoice or per record, where the volume is predictable enough to price it.' },
        { name: 'Build-operate-transfer', body: 'We build and run the team, then transfer it to your own Bangladesh entity on an agreed date.' },
      ],
      faqs: [
        { q: 'How fast can a team start?', a: 'Four to eight weeks from signed scope, depending on headcount and how specialised the profile is. Transition runs in parallel with the last two.' },
        { q: 'What about attrition?', a: 'We carry it. Backfills are our cost and our problem, with a replacement-time commitment written into the SLA.' },
        { q: 'Can the team work our hours?', a: 'Yes. We run shifted rosters including night shifts for North American coverage, with the shift premium priced transparently.' },
      ],
    },
    {
      code: 'BD',
      slug: 'business-development',
      title: 'Business Development',
      tagline: 'Market entry and pipeline support for companies moving into or out of Bangladesh.',
      intro:
        'Two kinds of company come to this practice: international firms trying to enter or source from Bangladesh, and Bangladeshi firms trying to sell abroad. Both need the same things — a credible market read, the right introductions, and someone on the ground who answers the phone. We provide all three.',
      deliverables: [
        'Market entry research and feasibility studies',
        'Partner and vendor identification and vetting',
        'Local entity, licensing and compliance navigation',
        'Outbound pipeline development and lead qualification',
        'Bid, proposal and tender support',
        'Representation and account management on the ground',
      ],
      approach: [
        {
          heading: 'Evidence over enthusiasm',
          body: 'Market reads are built from primary conversations with buyers and operators, not a summary of public reports you could have bought.',
        },
        {
          heading: 'Vet before you meet',
          body: 'Every partner or vendor we introduce has been reference-checked and, where it matters, visited in person.',
        },
        {
          heading: 'A named person on the ground',
          body: 'One accountable contact in Dhaka for the whole engagement. Time-zone distance is hard enough without a rotating cast.',
        },
      ],
      stack: [
        'HubSpot', 'Apollo', 'LinkedIn Sales Navigator', 'BIDA advisory network',
        'BASIS and sector association channels', 'Primary field research',
      ],
      engagements: [
        { name: 'Market entry study', body: 'A fixed-scope research engagement ending in a written go / no-go with sizing and cost assumptions.' },
        { name: 'Representation retainer', body: 'Monthly on-the-ground representation, partner management and reporting.' },
        { name: 'Pipeline programme', body: 'A quarterly outbound programme with agreed meeting targets and full activity reporting.' },
      ],
      faqs: [
        { q: 'Do you take commission on deals?', a: 'Retainer and success-fee structures are both available. We will tell you which one aligns better with your situation, including when that is the cheaper one for you.' },
        { q: 'Can you help us set up an entity?', a: 'We navigate the process and coordinate the legal and accounting firms who execute it. We do not practise law, and we will not pretend otherwise.' },
        { q: 'What sectors do you know best?', a: 'Software and ITeS sourcing, textiles and apparel supply chains, and light manufacturing. Outside those, we say so and scope more research time.' },
      ],
    },
  ];

  readonly industries: Industry[] = [
    {
      slug: 'banking-and-fintech',
      name: 'Banking & Fintech',
      body: 'Regulated environments where the audit trail matters as much as the feature. We work inside Bangladesh Bank guidance and the data-residency constraints that come with it.',
      needs: ['Core system integration', 'Regulatory reporting', 'Agent banking tooling', 'Fraud analytics'],
    },
    {
      slug: 'apparel-and-manufacturing',
      name: 'Apparel & Manufacturing',
      body: 'Bangladesh’s largest export sector runs on spreadsheets it has outgrown. We replace them with systems that survive a peak season.',
      needs: ['Production floor tracking', 'Buyer compliance reporting', 'Supply-chain visibility', 'Costing and margin analytics'],
    },
    {
      slug: 'telecom',
      name: 'Telecom',
      body: 'High-volume, low-latency, unforgiving of downtime. Data engineering and support operations at a scale where a percentage point is a real number.',
      needs: ['Subscriber analytics', 'Churn modelling', 'Support desk operations', 'Network reporting automation'],
    },
    {
      slug: 'healthcare',
      name: 'Healthcare',
      body: 'Patient data, clinical workflow and the administrative weight around both. Built with access control as a starting assumption rather than a later hardening pass.',
      needs: ['Patient record systems', 'Appointment and billing workflow', 'Claims processing', 'Diagnostic data pipelines'],
    },
    {
      slug: 'ecommerce-and-retail',
      name: 'E-commerce & Retail',
      body: 'Catalogue operations, storefront performance and the support volume that follows a good campaign. The unglamorous work that decides whether growth is profitable.',
      needs: ['Storefront development', 'Catalogue operations', 'Order management', 'Customer support teams'],
    },
    {
      slug: 'logistics',
      name: 'Logistics & Distribution',
      body: 'Movement, exceptions and proof. Systems that reconcile what was promised with what actually arrived, and flag the difference in time to act on it.',
      needs: ['Fleet and dispatch tooling', 'Delivery exception handling', 'Route and cost analytics', 'Partner integrations'],
    },
    {
      slug: 'education',
      name: 'Education & EdTech',
      body: 'Platforms that must work on a mid-range Android phone over a patchy connection, because that is what the students actually have.',
      needs: ['Learning platforms', 'Admissions and student records', 'Assessment analytics', 'Content operations'],
    },
    {
      slug: 'development-sector',
      name: 'Development Sector & NGOs',
      body: 'Donor-funded programmes with strict reporting obligations and field teams working offline. Monitoring systems built for the constraints of the last mile.',
      needs: ['Monitoring and evaluation systems', 'Offline-first field data capture', 'Donor reporting', 'Beneficiary data management'],
    },
  ];

  readonly caseStudies: CaseStudy[] = [
    {
      slug: 'nbfi-reporting-platform',
      client: 'A Dhaka-based non-bank financial institution',
      sector: 'Banking & Fintech',
      title: 'Twelve spreadsheets, one regulatory report',
      summary:
        'Monthly regulatory reporting took four analysts eleven days and still arrived with reconciliation gaps. We consolidated the sources and automated the submission pack.',
      challenge:
        'Reporting data lived in the core banking system, three departmental spreadsheets and a legacy loan-origination database that nobody wanted to touch. Every month the same reconciliation argument happened, and every month it delayed the submission.',
      approach: [
        'Mapped every field in the regulatory return back to a source system and documented the ones with no owner.',
        'Built a warehouse layer with the core banking extract, the loan database and the departmental inputs landing on a nightly schedule.',
        'Put freshness and row-count checks on every load, with alerts to a named person rather than a shared inbox.',
        'Rebuilt the submission pack as a generated document with drill-through to the underlying records.',
      ],
      outcome: [
        { metric: '11 days → 2', label: 'Monthly reporting cycle' },
        { metric: '4 → 1', label: 'Analysts on the process' },
        { metric: '100%', label: 'Fields traceable to source' },
      ],
      services: ['Data & Analytics', 'IT Consultancy'],
      duration: '14 weeks',
    },
    {
      slug: 'apparel-production-tracking',
      client: 'A woven garment manufacturer, Gazipur',
      sector: 'Apparel & Manufacturing',
      title: 'Knowing where the order actually is',
      summary:
        'Production status was accurate at the end of the day and guesswork before it. We put line-level tracking in the operators’ hands and gave merchandisers a live view.',
      challenge:
        'Merchandisers answered buyer questions from a spreadsheet updated once daily, which meant every escalation started with a phone call to the floor. Shipment risk surfaced days after it became unavoidable.',
      approach: [
        'Ran two weeks on the floor with supervisors before designing anything, then built to what the line actually does.',
        'Shipped an Android-first tracking app that works offline and syncs when the floor Wi-Fi reaches it.',
        'Built a merchandiser dashboard showing order progress against plan, with a risk flag driven by cumulative variance.',
        'Trained supervisors on-site across two shifts and left a runbook in Bangla and English.',
      ],
      outcome: [
        { metric: '4 hrs → 15 min', label: 'Status data latency' },
        { metric: '9 days', label: 'Average earlier warning on at-risk orders' },
        { metric: '600+', label: 'Operators on the system' },
      ],
      services: ['Web & Software Development', 'IT Enabled Services'],
      duration: '20 weeks',
    },
    {
      slug: 'saas-support-desk',
      client: 'A European B2B SaaS company',
      sector: 'E-commerce & Retail',
      title: 'A support desk that closed the European afternoon gap',
      summary:
        'A twelve-person support team in Dhaka took first-line volume for a European product, cutting first-response time and freeing the in-house team for escalations.',
      challenge:
        'The in-house team was spending its day on password resets and configuration questions, and the backlog reliably peaked at 4pm CET when nobody had capacity left to clear it.',
      approach: [
        'Ran a four-week pilot with three agents to establish real handle time and quality before committing headcount.',
        'Documented the top forty ticket types as runbooks, reviewed and signed off by the client’s support lead.',
        'Scaled to twelve agents on a shifted roster covering 07:00 to 21:00 CET.',
        'Reported volume, first-response time and quality score weekly, with a monthly review of the runbook set.',
      ],
      outcome: [
        { metric: '6 hrs → 41 min', label: 'Median first response' },
        { metric: '72%', label: 'Tickets resolved at first line' },
        { metric: '14 hrs', label: 'Daily coverage window' },
      ],
      services: ['Business Process Outsourcing', 'IT Enabled Services'],
      duration: 'Ongoing since 2023',
    },
  ];

  readonly process = [
    {
      step: '01',
      name: 'Scope',
      duration: '1–2 weeks',
      body: 'A paid discovery that ends in a written scope, a risk register and a price. If the honest answer is that the project should be smaller — or should not happen — you get that in writing too.',
    },
    {
      step: '02',
      name: 'Team',
      duration: '1–3 weeks',
      body: 'We name the people, not the roles. You meet the engineers, analysts or operators who will do the work, and you keep them for the engagement.',
    },
    {
      step: '03',
      name: 'Build',
      duration: 'Two-week cycles',
      body: 'Working output every fortnight into an environment you can use. A written status note goes out weekly whether or not the week went well.',
    },
    {
      step: '04',
      name: 'Handover',
      duration: 'Built in',
      body: 'Documentation, runbooks and a live walkthrough with your team, plus a 30-day defect warranty. Ownership of everything transfers to you.',
    },
  ];

  readonly principles = [
    {
      title: 'The estimate is a commitment',
      body: 'We would rather lose a bid than win it on a number we do not believe. When something slips, you hear it in the weekly note, not at the deadline.',
    },
    {
      title: 'You keep everything',
      body: 'Code, infrastructure definitions, documentation and data are yours. No proprietary layer that makes leaving expensive.',
    },
    {
      title: 'Named people, not resources',
      body: 'You know who is on your account and you keep them. Rotation happens for a reason we explain, not for a utilisation target.',
    },
    {
      title: 'Numbers we did not choose',
      body: 'SLA reporting shows the misses alongside the hits. A dashboard that only ever looks good is not a dashboard.',
    },
  ];

  readonly roles: Role[] = [
    {
      slug: 'senior-backend-engineer',
      title: 'Senior Backend Engineer',
      practice: 'Web & Software Development',
      type: 'Full-time',
      location: 'Banani, Dhaka · Hybrid',
      level: '5+ years',
      summary:
        'Own the server side of client platforms end to end — schema, API, deployment and the on-call that follows. You will be the most senior engineer on at least one account.',
      responsibilities: [
        'Design and build APIs and data models for client platforms',
        'Set the technical direction on an account and defend it in client review',
        'Review the team’s code and raise the floor on the ones learning',
        'Own deployment, monitoring and incident response for what you ship',
      ],
      requirements: [
        'Five or more years building production backend systems',
        'Deep Node.js or PHP, and fluency in relational data modelling',
        'Experience running what you built in production, not just shipping it',
        'Written English strong enough for direct client correspondence',
      ],
    },
    {
      slug: 'data-analyst',
      title: 'Data Analyst',
      practice: 'Data & Analytics',
      type: 'Full-time',
      location: 'Banani, Dhaka · Hybrid',
      level: '2+ years',
      summary:
        'Turn messy client source systems into models and dashboards people actually open. You will sit close to the client and defend your own numbers.',
      responsibilities: [
        'Build and maintain transformation models in SQL and dbt',
        'Design dashboards against the decisions they are meant to support',
        'Write and maintain metric definitions in the client data dictionary',
        'Investigate the discrepancies nobody else wants to trace',
      ],
      requirements: [
        'Two or more years in an analytics role with strong SQL',
        'Working Python for data manipulation',
        'Experience with at least one BI tool at production scale',
        'Comfortable saying a number is wrong in front of the people who reported it',
      ],
    },
    {
      slug: 'customer-support-associate',
      title: 'Customer Support Associate',
      practice: 'Business Process Outsourcing',
      type: 'Full-time · Shift work',
      location: 'Banani, Dhaka · On-site',
      level: 'Entry to 3 years',
      summary:
        'First-line support for international client accounts over email, chat and voice. Full training provided; the bar is written English and patience.',
      responsibilities: [
        'Resolve first-line tickets against documented runbooks',
        'Escalate cleanly, with the diagnosis already done',
        'Flag recurring issues so the runbook or the product gets fixed',
        'Hold quality scores through volume peaks',
      ],
      requirements: [
        'Excellent written English; clear spoken English for voice accounts',
        'Willingness to work shifted hours, including night shifts on some accounts',
        'Comfort with ticketing tools, or the appetite to learn them quickly',
        'Graduate or final-year student',
      ],
    },
    {
      slug: 'frontend-engineer',
      title: 'Frontend Engineer',
      practice: 'Web & Software Development',
      type: 'Full-time',
      location: 'Banani, Dhaka · Hybrid',
      level: '3+ years',
      summary:
        'Build interfaces that hold up on a mid-range Android phone on a weak connection — because that is the device most of our end users have.',
      responsibilities: [
        'Build accessible, responsive interfaces from design or from scratch',
        'Own performance budgets and defend them against feature pressure',
        'Maintain the shared component library across accounts',
        'Work directly with backend engineers on API shape rather than around it',
      ],
      requirements: [
        'Three or more years building production web front-ends',
        'Strong TypeScript, React and real CSS ability',
        'Demonstrable care about accessibility and performance',
        'A portfolio or repository we can actually look at',
      ],
    },
  ];

  readonly stats = [
    { value: '6', label: 'Practice areas under one roof', note: 'Software, data, ITeS, consulting, BPO and business development' },
    { value: '4', label: 'Continents served from Dhaka', note: 'Europe, North America, Asia-Pacific and the Gulf' },
    { value: 'GMT+6', label: 'One time zone, full overlap', note: 'A working day that reaches London, Dubai, Singapore and Sydney' },
    { value: '30 days', label: 'Defect warranty on every build', note: 'Included as standard, not sold as an add-on' },
  ];

  /* ---------------------------------------------------------------------- */

  getService(slug: string): Service | undefined {
    return this.services.find((s) => s.slug === slug);
  }

  getCaseStudy(slug: string): CaseStudy | undefined {
    return this.caseStudies.find((c) => c.slug === slug);
  }

  getRole(slug: string): Role | undefined {
    return this.roles.find((r) => r.slug === slug);
  }

  /** Services other than the one given — used for the "keep reading" rail. */
  otherServices(slug: string): Service[] {
    return this.services.filter((s) => s.slug !== slug);
  }
}
