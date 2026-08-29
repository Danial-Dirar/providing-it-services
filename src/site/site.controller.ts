import { Controller, Get, NotFoundException, Param, Render } from '@nestjs/common';
import { ContentService } from '../content/content.service';
import { BUDGET_BANDS } from '../contact/dto/create-enquiry.dto';

/**
 * Every server-rendered page on the marketing site.
 *
 * Each handler returns the view model only — `@Render` picks the template and
 * the `PageContextInterceptor` merges in company, nav and request metadata so
 * handlers stay focused on the page's own content.
 */
@Controller()
export class SiteController {
  constructor(private readonly content: ContentService) {}

  @Get()
  @Render('pages/home')
  home() {
    return {
      page: 'home',
      meta: {
        title: 'Providing IT Services — Software, data and operations from New York',
        description:
          'A New York-based technology services firm building software, data platforms and back-office operations for companies across the United States and abroad. Web development, data analytics, ITeS, IT consultancy, BPO and business development.',
      },
      services: this.content.services,
      industries: this.content.industries,
      caseStudies: this.content.caseStudies,
      process: this.content.process,
      principles: this.content.principles,
      stats: this.content.stats,
      hubs: this.content.hubs,
    };
  }

  @Get('services')
  @Render('pages/services')
  services() {
    return {
      page: 'services',
      meta: {
        title: 'Services — Providing IT Services',
        description:
          'Six practices under one roof: web and software development, data and analytics, IT enabled services, IT consultancy, business process outsourcing and business development.',
      },
      hero: {
        eyebrow: 'Services',
        title: 'Six practices, one accountable team',
        lede: 'Most firms sell you one of these and subcontract the rest. We run all six from the same floor in Lower Manhattan, which is why a data problem that turns out to be a process problem does not become a new procurement exercise.',
      },
      services: this.content.services,
      process: this.content.process,
    };
  }

  @Get('services/:slug')
  @Render('pages/service-detail')
  serviceDetail(@Param('slug') slug: string) {
    const service = this.content.getService(slug);
    if (!service) throw new NotFoundException();

    return {
      page: 'services',
      meta: {
        title: `${service.title} — Providing IT Services`,
        description: service.tagline,
      },
      service,
      others: this.content.otherServices(slug),
      related: this.content.caseStudies.filter((c) => c.services.includes(service.title)),
    };
  }

  @Get('industries')
  @Render('pages/industries')
  industries() {
    return {
      page: 'industries',
      meta: {
        title: 'Industries — Providing IT Services',
        description:
          'Sector experience across banking and fintech, media and publishing, telecom, healthcare, e-commerce, logistics, education and the nonprofit sector.',
      },
      hero: {
        eyebrow: 'Industries',
        title: 'Sectors we already know the vocabulary of',
        lede: 'Domain knowledge is the difference between a three-week discovery and a three-day one. These are the sectors where we start with the questions rather than the definitions.',
      },
      industries: this.content.industries,
      caseStudies: this.content.caseStudies,
    };
  }

  @Get('work')
  @Render('pages/work')
  work() {
    return {
      page: 'work',
      meta: {
        title: 'Work — Providing IT Services',
        description:
          'Selected engagements in lending, logistics and SaaS support operations, with the numbers that came out of them.',
      },
      hero: {
        eyebrow: 'Work',
        title: 'Three engagements, described honestly',
        lede: 'Client names stay anonymous until a public reference is agreed in writing. The problems, the approach and the numbers are exactly as they happened.',
      },
      caseStudies: this.content.caseStudies,
    };
  }

  @Get('work/:slug')
  @Render('pages/work-detail')
  workDetail(@Param('slug') slug: string) {
    const study = this.content.getCaseStudy(slug);
    if (!study) throw new NotFoundException();

    return {
      page: 'work',
      meta: { title: `${study.title} — Providing IT Services`, description: study.summary },
      study,
      others: this.content.caseStudies.filter((c) => c.slug !== slug),
    };
  }

  @Get('about')
  @Render('pages/about')
  about() {
    return {
      page: 'about',
      meta: {
        title: 'About — Providing IT Services',
        description:
          'Who we are, how we work, and what we commit to in writing. A technology services firm based in Lower Manhattan, New York.',
      },
      hero: {
        eyebrow: 'About',
        title: 'A services firm that puts its commitments in writing',
        lede: 'We started in New York with a straightforward view: most services relationships fail on communication rather than capability. Everything about how we run engagements follows from that.',
      },
      principles: this.content.principles,
      stats: this.content.stats,
      process: this.content.process,
      hubs: this.content.hubs,
    };
  }

  @Get('careers')
  @Render('pages/careers')
  careers() {
    return {
      page: 'careers',
      meta: {
        title: 'Careers — Providing IT Services',
        description:
          'Open roles in engineering, analytics and operations at Providing IT Services in Lower Manhattan, New York.',
      },
      hero: {
        eyebrow: 'Careers',
        title: 'Work on systems that go into production',
        lede: 'Everything we build has a client using it on Monday. That is the appeal and the pressure, and it is worth knowing which one you are signing up for.',
      },
      roles: this.content.roles,
    };
  }

  @Get('careers/:slug')
  @Render('pages/role-detail')
  roleDetail(@Param('slug') slug: string) {
    const role = this.content.getRole(slug);
    if (!role) throw new NotFoundException();

    return {
      page: 'careers',
      meta: { title: `${role.title} — Careers at Providing IT Services`, description: role.summary },
      role,
      others: this.content.roles.filter((r) => r.slug !== slug),
    };
  }

  @Get('contact')
  @Render('pages/contact')
  contact() {
    return {
      page: 'contact',
      meta: {
        title: 'Contact — Providing IT Services',
        description:
          'Start a conversation about a project, a team or an audit. We reply to every enquiry within one working day.',
      },
      services: this.content.services,
      budgets: BUDGET_BANDS,
      hubs: this.content.hubs,
    };
  }

  @Get('privacy')
  @Render('pages/legal')
  privacy() {
    return {
      page: 'legal',
      meta: {
        title: 'Privacy notice — Providing IT Services',
        description: 'How Providing IT Services collects, uses and retains personal data.',
      },
      doc: 'privacy',
      hero: { eyebrow: 'Legal', title: 'Privacy notice', lede: 'What we collect through this website, why, and how long we keep it.' },
    };
  }

  @Get('terms')
  @Render('pages/legal')
  terms() {
    return {
      page: 'legal',
      meta: {
        title: 'Terms of use — Providing IT Services',
        description: 'Terms governing use of the Providing IT Services website.',
      },
      doc: 'terms',
      hero: { eyebrow: 'Legal', title: 'Terms of use', lede: 'The terms that apply when you use this website.' },
    };
  }
}
