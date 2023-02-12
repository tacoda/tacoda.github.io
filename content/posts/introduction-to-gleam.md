---
title: "Introduction to Gleam"
date: 2023-01-16T11:30:03+00:00
publishdate: 2023-01-16T11:30:03+00:00
# weight: 1
# aliases: ["/first"]
tags: ["gleam", "beam", "programming"]
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

## Introduction

The Erlang/Elixir VMs, AKA the BEAM (Bogdan/Björn's Erlang Abstract Machine). In essence, it is a concurrent runtime that provides fault-tolerance and distribution out of the box. Gleam is a new programming language for the BEAM virtual machine. It aims to bring better type safety and more readable code to your Elixir and Erlang projects. Gleam programs can be compiled to BEAM bytecode and then run on any BEAM compatible runtime.

## The Erlang/Elixir VMs, AKA the BEAM

> **BEAM:** Bogdan/Björn's Erlang Abstract Machine

The BEAM is the virtual machine that runs Elixir and Erlang. It is not a programming language; it's more like a runtime environment for running an OTP application. The BEAM is used to run any type of OTP application (not only Elixir or Erlang), including applications written in C or Java which use their own custom VM stack.

## What is this "OTP" thing?

> **OTP:** Open Telecom Platform

The Open Telecom Platform (OTP), is a collection of middleware, libraries, and tools that are commonly used on the BEAM which leverage the strengths of the platform. One example of functionality found in OTP is a Supervisor. A Supervisor is a common pattern on the BEAM which uses one process to manage other processes. The OTP Supervisor is the analog of the object-oriented Observer pattern.

## In essence, it is a concurrent runtime that provides fault-tolerance and distribution out of the box.

In essence, it is a concurrent runtime that provides fault-tolerance and distribution out of the box. The BEAM has two main components: the virtual machine and the programming language.

The VM is a stack-based machine in which each instruction stores data on its operands' stacks and returns values to those stacks. This allows for efficient implementation of recursion, tail calls, and higher order functions (also known as anonymous functions). The VM also supports Erlang's pattern matching capabilities via match statements. Match statements can be used to reduce boilerplate code by allowing developers to reuse previously defined functions instead of writing similar implementations over again. This means less work for you!

## Gleam is a new programming language for the BEAM virtual machine.

Gleam is a new programming language for the BEAM virtual machine. It aims to bring better type safety and more readable code to your Elixir and Erlang projects. Gleam programs can be compiled to BEAM bytecode and then run on any BEAM compatible runtime, such as Elixir and Erlang, or even the Erlang VM on other operating systems like Linux or MacOS.

Check out the website at [https://gleam.run](https://gleam.run/). The source code is available on GitHub at [https://github.com/gleam-lang](https://github.com/gleam-lang).

## It aims to bring better type safety and more readable code to your Elixir and Erlang projects.

You can use Gleam for both frontend and backend web applications (or anything else, really). Gleam runs on the Erlang virtual machine. The compiler generates Erlang which is then sent to the Erlang compiler. The compiler also has the ability to target JavaScript to allow it to be run in-browser or on the V8 platform.

## Gleam programs can be compiled to BEAM bytecode and then run on any BEAM compatible runtime.

BEAM bytecode is the same as Elixir bytecode; it's what we use to write programs in Elixir. The BEAM is a virtual machine, but it's also a concurrent runtime with built-in support for lightweight threads (also known as processes). A single process executes one or more instructions at a time. These threads are scheduled by the virtual machine itself, which means that you don't have to worry about things like thread schedulers when writing your code. In fact, there are no locks whatsoever in the runtime system!

## Gleam has some really cool features and I am excited to learn more about it

Gleam programs can be compiled to BEAM bytecode and then run on any BEAM compatible runtime, including the Erlang VM, Node.js or any JavaScript environment (such as web browsers). I am personally very hopeful that WebAssembly will be added as a compilation target soon.

Here is a quick TL;DR of the features that I am most excited about:

1. Static types
2. Easy deployment with [Fly.io](https://fly.io/)
3. Nice error messages
4. Functional programming
    - Functions and lists and tuples, oh my!
5. Clean syntax
6. Pattern matching
7. Explicit Result and Option types
8. Utilizing the BEAM and OTP

## Conclusion

Gleam is an exciting new language that will help us write better code in Elixir and Erlang. It has some really cool features, including type safety and better syntax. I'm looking forward to learning more about it!

For more information about Gleam, visit the following links:

- [Gleam.run](https://gleam.run/)
- [Gleam Language Tour](https://gleam.run/book/tour/)
- [Gleam stdlib Docs](https://hexdocs.pm/gleam_stdlib/)
- [Awesome Gleam](https://hexdocs.pm/gleam_stdlib/)
