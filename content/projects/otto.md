---
title: "Otto"
# date: 2023-01-16T11:30:03+00:00
# publishdate: 2023-01-16T11:30:03+00:00
weight: 1
# aliases: ["/first"]
tags: ["project", "ruby", "static site generator"]
author: "Ian Johnson"
# author: ["Me", "You"] # multiple authors
showToc: false
TocOpen: false
draft: false
hidemeta: false
comments: false
# description: ""
# canonicalURL: "https://canonical.url/to/page"
# disableHLJS: true # to disable highlightjs
disableShare: false
disableHLJS: false
hideSummary: true
searchHidden: true
ShowReadingTime: false
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowWordCount: false
ShowRssButtonInSectionTermList: true
UseHugoToc: true
# cover:
#     image: "https://media.licdn.com/dms/image/D4E16AQGw6Ow73j0HUA/profile-displaybackgroundimage-shrink_350_1400/0/1671636629469?e=1677715200&v=beta&t=2MKRKo682atDczyT6l15uNkubCEeFVdHy11zfOULI5w" # image path/url
#     alt: "<alt text>" # alt text
#     caption: "<text>" # display caption under cover
#     relative: false # when using page bundles set this to true
#     hidden: true # only hide on current single page
# editPost:
#     URL: "https://github.com/tacoda.github.io/content"
#     Text: "Suggest Changes" # edit text
#     appendFilePath: true # to append file path to Edit link
---

> **Otto** is a static site generator that uses [AsciiDoc](https://asciidoc.org/) as a markup language.

## Quickstart

**Install Otto**

```sh
gem install ottogen
```

**Initialize a new site**

```sh
mkdir mysite && cd mysite
otto init
```

**Build the site**

```sh
otto build
```

**Serve the site**

```sh
otto serve
```

**View the site**

```sh
open http://127.0.0.1:8778/
```

## Links

- [GitHub](https://github.com/tacoda/ottogen)
- [RubyGem](https://rubygems.org/gems/ottogen)