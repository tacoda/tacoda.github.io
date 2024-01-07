---
title: "Modern Python with Poetry"
date: 2024-01-06T11:30:03+00:00
publishdate: 2024-01-06T11:30:03+00:00
# weight: 5
# aliases: ["/first"]
tags: ["python", "programming"]
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
ShowReadingTime: true
ShowBreadCrumbs: true
ShowPostNavLinks: true
ShowWordCount: true
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

The intended audience here is advanced beginners. Maybe you've taken a Python course, or completed a tutorial. Maybe you have a basic, but solid understanding of the language. Maybe you have a Python script in place that does work for you. Great!

Now what? How do we move that understanding into real, working software?

In this series, we will be working with Python 3. Poetry requires at least Python 3.8.

## Pipx

[Pipx](https://pipx.pypa.io/) is a package manager that distributes Python code.

I am on a Mac, so I can install Pipx via Brew:

```sh
brew install pipx
```

## Poetry

[Poetry](https://python-poetry.org/docs/) is a tool for dependency management and packaging. Traditionally a tool called virtualenv has been the standard in Python, but it seems like that is transitioning from `requirements.txt` to `pyproject.toml`.

```sh
pipx install poetry
```

In this series, we will be using Poetry because it has a modern interface that adheres to the `pyproject.toml` standard. It will also enable us to learn how to take our Python projects from a beginner's script to a complete package.