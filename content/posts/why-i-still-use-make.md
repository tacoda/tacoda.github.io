---
title: "Why I Still Use Make"
date: 2023-01-20T11:30:03+00:00
publishdate: 2023-01-20T11:30:03+00:00
weight: 5
tags: ["make", "tooling", "programming"]
author: "Ian Johnson"
showToc: false
TocOpen: false
draft: false
hidemeta: false
comments: false
# description: ""
# canonicalURL: "https://canonical.url/to/page"
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
cover:
    image: "https://unsplash.com/photos/xEy9QNUCdRI" # image path/url
#     alt: "<alt text>" # alt text
#     caption: "<text>" # display caption under cover
#     relative: false # when using page bundles set this to true
#     hidden: true # only hide on current single page
# editPost:
#     URL: "https://github.com/tacoda.github.io/content"
#     Text: "Suggest Changes" # edit text
#     appendFilePath: true # to append file path to Edit link
---

## A Uniform Interface

A uniform interface saves us time by adhering to particular conventions. Adhering to `make` conventions will help developers be more productive.

## It's Open to Extension

Since a `Makefile` is just text, we can easily add new targets or modify behavior using arguments. Personally, I prefer the new targets strategy. If I find myself adding arguments to modify behavior, I usually wrap that up in a shell script and then just pass the arguments through `make` to the script.

### Bash Scripting

This is a personal choice that I lean toward because I like to wrap up anything complex in a bash script. As a consequence, it keeps my `Makefiles` clean, because the targets are just invoking scripts. I prefer to wrap complex behavior in bash scripts because I can encapsulate each step in a function. This also allows me to do any necessary environment adjustments in the script. If the bash script becomes complex enough, that is an indicator that the script may need to be written in a language other than bash. However, in the context of using `make`, a bash script is usually the right tool for the job.

## It's Everywhere

Perhaps the greatest advantage of `make` is that it is everywhere. Since it is usually already installed, we only need to worry about the dependecies we need for our application. I have used other task runners and several of them are quite nice. However, I always end up coming back to `make` because I don't have to worry about dependencies to build the code.

## Disclaimer

I am not saying that _you_ should use `make`. Use whatever tool that works best for you. I am only describing why _I_ use it.

