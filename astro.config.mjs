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
      logo: {
        src: './src/assets/mastodon.svg',
        alt: 'Mastodon',
      },
      customCss: ['./src/styles/custom.css'],
      head: [
        {
          tag: 'script',
          attrs: { src: '/scripts/matrix.js', defer: true },
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
