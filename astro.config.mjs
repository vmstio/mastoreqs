// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
  site: 'https://mastoreqs.com',
  integrations: [
    starlight({
      title: 'Mastodon Requirements',
      description: 'Community maintained support matrix of recent Mastodon releases and their underlying dependencies.',
      favicon: '/favicon.svg',
      customCss: ['./src/styles/custom.css'],
      // Hide the "On this page" table of contents site-wide. Individual pages
      // can opt back in with `tableOfContents: true` in their frontmatter.
      tableOfContents: false,
      components: {
        // Remove the prev/next page navigation footer site-wide.
        Pagination: './src/components/EmptyPagination.astro',
      },
      head: [
        // Order matters: advisor-core defines window.MastoAdvisor, which both
        // matrix.js and advisor.js consume. All defer, so they run in
        // document order.
        {
          tag: 'script',
          attrs: { src: '/scripts/advisor-core.js', defer: true },
        },
        {
          tag: 'script',
          attrs: { src: '/scripts/matrix.js', defer: true },
        },
        {
          tag: 'script',
          attrs: { src: '/scripts/advisor.js', defer: true },
        },
      ],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/mastodon/mastodon',
        },
        {
          icon: 'mastodon',
          label: 'Mastodon',
          href: 'https://github.com/mastodon/mastodon',
        },
      ],
      sidebar: [
        {
          label: 'Overview',
          items: [
            { label: 'Home', link: '/' },
            { label: 'Upgrade Advisor', link: '/advisor/' },
            { label: 'Support Lifecycle', link: '/lifecycle/' },
          ],
        },
        {
          label: 'Components',
          autogenerate: { directory: 'components' },
        },
      ],
    }),
  ],
});
