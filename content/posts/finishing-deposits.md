---
title: "Finishing Deposits"
date: 2023-01-20T11:30:03+00:00
publishdate: 2023-01-20T11:30:03+00:00
weight: 5
# aliases: ["/first"]
tags: ["gleam", "beam", "programming", "testing"]
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

## Our Initial State

**`src/bam.gleam`:**

```gleam
import gleam/io
import gleam/float

pub type Account {
  Account(balance: Float)
}

pub fn create_account() -> Account {
  Account(0.0)
}

pub fn get_balance(account: Account) -> Float {
  account.balance
}

pub fn deposit(account: Account, amount: Float) -> Account {
  case amount {
    n if n >=. 0.0 -> Account(account.balance +. amount)
    _n -> account
  }
}

pub fn main() {
  create_account()
  |> get_balance
  |> float.to_string
  |> io.println
}
```

**`test/bam_test.gleam`:**

```gleam
import gleeunit
import gleeunit/should
import bam.{create_account, deposit, get_balance}

pub fn main() {
  gleeunit.main()
}

pub fn deposit_increases_account_balance_test() {
  create_account()
  |> deposit(10.0)
  |> get_balance
  |> should.equal(10.0)
}

pub fn negative_deposit_does_not_increase_account_balance_test() {
  create_account()
  |> deposit(-10.0)
  |> get_balance
  |> should.not_equal(-10.0)
}
```