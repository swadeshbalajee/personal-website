/**
 * Central site configuration.
 *
 * Every personal detail on the site should be driven from this file (or from
 * content files under `src/content/`) rather than hardcoded in components or
 * pages. Replace the placeholder values below with real information before
 * publishing. See docs/CUSTOMIZATION.md for a full walkthrough.
 */

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  href: string;
  /** Icon name understood by `src/components/common/Icon.astro`. */
  icon: 'github' | 'linkedin' | 'mail' | 'rss' | 'link';
}

export interface GiscusConfig {
  repo: `${string}/${string}`;
  repoId: string;
  category: string;
  categoryId: string;
  mapping: 'pathname' | 'url' | 'title' | 'og:title';
  strict: boolean;
  reactionsEnabled: boolean;
  inputPosition: 'top' | 'bottom';
  theme: string;
  lang: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface SiteConfig {
  /** Placeholder — replace with the real production URL before deploying. */
  url: string;
  name: string;
  title: string;
  shortBio: string;
  longIntro: string;
  email: string;
  nav: NavLink[];
  social: SocialLink[];
  /** Path to a résumé file placed under `public/`, or null if none yet. */
  resumePath: string | null;
  /**
   * GitHub username scanned at build time for auto-synced projects: any
   * public, non-fork repo whose README's last line reads "Website: Approved"
   * is pulled into Projects automatically. See docs/CUSTOMIZATION.md.
   */
  githubUsername: string;
  /** Shown in the homepage's compact skills section and reused on the About page. */
  skills: SkillGroup[];
  /** Short list of things currently being learned or explored, shown on the homepage. */
  currentlyExploring: string[];
  /** Curated blog topics, always shown on /blog and /tags even before any post uses them. */
  blogCategories: string[];
  seo: {
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    defaultSocialImage: string;
  };
  featuredArticleCount: number;
  featuredProjectCount: number;
  comments: {
    enabled: boolean;
    giscus: GiscusConfig | null;
  };
}

// Placeholder site URL used throughout the codebase (sitemap, RSS, canonical
// tags, JSON-LD, robots.txt). Update this before deploying anywhere.
export const SITE_URL = 'https://example.com';

export const siteConfig: SiteConfig = {
  url: SITE_URL,
  name: 'Swadesh B',
  title: 'RL Researcher',
  shortBio:
    'MS student in the DSAI department, researching reinforcement learning and large language models under Prof. Ravi.',
  longIntro:
    "I'm an MS student in the DSAI department, working under Prof. Ravi on reinforcement learning " +
    'and large language models. This site collects project write-ups and technical notes on RL, ' +
    'LLMs, and machine learning more broadly.',
  email: 'swadeshbalajee13@gmail.com',

  nav: [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: 'Projects', href: '/projects' },
    { label: 'Publications', href: '/publications' },
    { label: 'Archive', href: '/archive' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],

  social: [
    { label: 'GitHub', href: 'https://github.com/swadeshbalajee', icon: 'github' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/swadesb', icon: 'linkedin' },
    { label: 'Email', href: 'mailto:swadeshbalajee13@gmail.com', icon: 'mail' },
    { label: 'RSS', href: '/rss.xml', icon: 'rss' },
  ],

  // Set to a real path (e.g. '/resume.pdf') once a résumé file exists under
  // public/. Left as null so the site never links to a document that isn't there.
  resumePath: null,

  githubUsername: 'swadeshbalajee',

  skills: [
    { category: 'Languages', items: ['Python', 'Java', 'C++', 'Triton'] },
    {
      category: 'Research Areas',
      items: [
        'Reinforcement Learning',
        'Large Language Models',
        'Machine Learning',
        'Deep Learning',
      ],
    },
  ],

  currentlyExploring: [
    'Reinforcement learning algorithms and theory',
    'RL fine-tuning and alignment for large language models',
    'Agentic AI systems built on RL-trained policies',
  ],

  // Always shown on /blog and /tags (even with zero posts yet) so the site's
  // topic taxonomy is visible before content catches up. Individual posts
  // still tag themselves freely — these are just the curated top-level ones.
  blogCategories: [
    'Machine Learning',
    'Reinforcement Learning',
    'Deep Learning',
    'LLMs',
    'Agentic AI',
    'Astronomy',
    'Robotics',
  ],

  seo: {
    defaultTitle: 'Swadesh B — RL Researcher',
    titleTemplate: '%s — Swadesh B',
    defaultDescription:
      'Personal portfolio and technical blog on reinforcement learning, large language models, and machine learning research.',
    defaultSocialImage: '/social-card.svg',
  },

  featuredArticleCount: 3,
  featuredProjectCount: 3,

  comments: {
    // Comments stay disabled until real Giscus repository identifiers are
    // configured below. See docs/CUSTOMIZATION.md for how to obtain them
    // from https://giscus.app — this file only stores configuration, it
    // never performs any deployment or hosting setup.
    enabled: false,
    giscus: null,
    // Example configuration once you have real values:
    // giscus: {
    //   repo: 'your-username/your-repo',
    //   repoId: 'R_kgDOxxxxxx',
    //   category: 'Comments',
    //   categoryId: 'DIC_kwDOxxxxxx',
    //   mapping: 'pathname',
    //   strict: true,
    //   reactionsEnabled: true,
    //   inputPosition: 'top',
    //   theme: 'preferred_color_scheme',
    //   lang: 'en',
    // },
  },
};
