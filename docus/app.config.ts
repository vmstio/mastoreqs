export default defineAppConfig({
  docus: {
    title: 'Mastodon Requirements',
    description: 'Dependency matrix for Mastodon',
    image: 'https://www.mastoreqs.com/mastodon-branches.png',
    socials: {
      mastodon: {
        label: 'Mastodon',
        icon: 'simple-icons:mastodon',
        href: 'https://vmst.io/@vmstan',
      },
      github: 'vmstan/mastoreqs'
    },
    aside: {
      level: 1,
      collapsed: true,
      exclude: []
    },
    header: {
      logo: false,
      title: 'Mastodon Requirements',
      showLinkIcon: true
    },
    footer: {
      iconLinks: [
        {
          href: 'https://nuxt.com',
          icon: 'simple-icons:nuxtdotjs'
        }
      ]
    }
  }
})
