export default defineAppConfig({
  docus: {
    title: 'Mastodon Requirements Matrix',
    description: 'Dependency matrix for Mastodon',
    image: 'https://raw.githubusercontent.com/vmstan/vmstio/main/images/vmstio-1280x640@3x.png',
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
      title: 'Mastodon Requirements Matrix',
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
