---
title: "Regular Languages"
date: 2023-01-02T11:30:03+00:00
# weight: 1
# aliases: ["/first"]
tags: ["language", "regex", "regular expressions", "posix", "pcre", "pomsky"]
author: "Ian Johnson"
# author: ["Me", "You"] # multiple authors
showToc: true
TocOpen: false
draft: false
hidemeta: false
comments: false
# description: "Regular Languages, PCRE, and Pomsky."
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

## Regular Languages

The [Chomsky Hierarchy](https://en.wikipedia.org/wiki/Chomsky_hierarchy) is a containment hierarchy of formal grammars.



```
(
    [123]
    [+*]
)*
[123]
```

Turn expression into grammar

```
EXPR = NUM
EXPR = NUM OP EXPR
```

This is a regular grammar because it came from a regex

We need to put the expression into a regular form
THis will be a right regular grammar

```
RULE1 = '1'
RULE2 =  '1' RULE2
```

### Right Regular Grammar

```
EXPR = '1'
EXPR = '2'
EXPR = '3'
EXPR = '1' OP_EXPR
EXPR = '2' OP_EXPR
EXPR = '3' OP_EXPR
OP_EXPR = '+' EXPR
OP_EXPR = '*' EXPR
```

### Finite State Machine

```mermaid
stateDiagram-v2
    EXPR --> OP_EXPR : 1
    EXPR --> OP_EXPR : 2
    EXPR --> OP_EXPR : 3
    OP_EXPR --> EXPR: +
    OP_EXPR --> EXPR: *
    EXPR --> END : 1
    EXPR --> END : 2
    EXPR --> END : 3
```

## POSIX

POSIX Basic Regular Expressions

## PCRE

When a developer refers generally to _regular expressions_, they are usually referring to **PCRE** &mdash; Perl Compatible Regular Expressions. These are the regular expressions that you will find almost everywhere, because they are POSIX-compliant.

## Pomsky

[Pomsky](https://pomsky-lang.org) is a language that compiles to regular expressions. It is currently in an alpha stage and will likely change in the next few releases. Pomsky covers all of the usual cases of regular expressions, but with a syntax that is less terse and more semantic.

### Variables

Pomsky has variables, which takes us one step away from a finite state machine.

```
let operator = '+' | '-' | '*' | '/';
let number = '-'? [digit]+;

number (operator number)*
```

## Some Examples

| Meaning | POSIX | PCRE | Pomsky | Accepted | Rejected |
|---|---|---|---|---|---|
| The word `hello` | `'hello'` | `'hello'` | `'hello'` | hello | bye |
| Word character followed by a space and new line | `\w\s\n` | `\w\s\n` | `[word] [space] [n]` | 'a ⏎' | 'a⏎' |

