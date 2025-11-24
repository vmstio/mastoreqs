---
seo:
  title: mastoreqs.com
  description: Requirement matrix for Mastodon dependencies
---

::u-page-hero
#title
Mastodon Requirements

#description
This document is a best-effort, community maintained, support matrix of recent Mastodon releases and their underlying dependencies. It is designed to provide high-level guidance for determining upgrade paths, and what to deploy in an environment. Administrators should also consult the release notes for your version of Mastodon, and any product dependencies, before upgrading.

#links
  :::u-button
  ---
  color: neutral
  icon: i-simple-icons-ruby
  size: xl
  to: /components/ruby
  variant: outline
  ---
  Ruby
  :::
  
  :::u-button
  ---
  color: neutral
  icon: i-simple-icons-nodedotjs
  size: xl
  to: /components/node
  variant: outline
  ---
  Node
  :::
  
  :::u-button
  ---
  color: neutral
  icon: i-cib-postgresql
  size: xl
  to: /components/postgres
  variant: outline
  ---
  Postgres
  :::
  
  :::u-button
  ---
  color: neutral
  icon: i-simple-icons-amazonelasticache
  size: xl
  to: /components/cache
  variant: outline
  ---
  Cache
  :::

  :::u-button
  ---
  color: neutral
  size: xl
  to: /general/lifecycle
  trailing-icon: i-lucide-arrow-right
  ---
  More
  :::
::

::u-page-section
#title
Recent Changes

#features
  :::u-page-feature
  ---
  icon: i-simple-icons-nuxt
  target: _blank
  to: https://docus.dev
  ---
  #title
  Built with [Docus 5]{.text-primary}
  
  #description
  The static site generator for this page has been updated to Docus v5.
  :::

  :::u-page-feature
  ---
  icon: i-simple-icons-mastodon
  target: _blank
  to: https://ui.nuxt.com/
  ---
  #title
  Support for [Mastodon 4.6]{.text-primary}
  
  #description
  Support for the latest development branch has been added.
  :::

  :::u-page-feature
  ---
  icon: i-cib-postgresql
  target: _blank
  to: https://www.postgresql.org/about/news/postgresql-18-released-3142/
  ---
  #title
  Validated for [Postgres 18]{.text-primary}
  
  #description
  Matrix updated for the latest branch of the Postgres database.
  :::

::
