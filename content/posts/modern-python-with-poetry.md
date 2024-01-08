---
title: "Modern Python with Poetry"
date: 2024-01-06T11:30:03+00:00
publishdate: 2024-01-06T11:30:03+00:00
tags: ["python", "programming"]
author: "Ian Johnson"
showToc: false
TocOpen: false
draft: false
hidemeta: false
comments: false
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

Poetry provides some really great [documentation](https://python-poetry.org/docs/basic-usage/) to help get you started.
In this series, we will be using Poetry because it has a modern interface that adheres to the `pyproject.toml` standard. It will also enable us to learn how to take our Python projects from a beginner's script to a complete package.