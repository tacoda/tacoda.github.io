---
title: "Making Withdrawals"
date: 2023-02-14T13:30:03+00:00
publishdate: 2023-02-14T13:30:03+00:00
# weight: 5
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
import gleam/int
import gleam/float

pub type Account {
  Account(balance: Amount)
}

pub type Amount {
  Amount(amount: Int)
}

pub fn create_account() -> Account {
  Account(Amount(0))
}

pub fn get_balance(account: Account) -> Amount {
  account.balance
}

pub fn deposit(account: Account, amount: Amount) -> Account {
  case amount.amount {
    n if n >= 0 -> Account(Amount(account.balance.amount + amount.amount))
    _n -> account
  }
}

pub fn to_string(balance: Amount) -> String {
  balance.amount |> int.to_string
}

pub fn main() {
  create_account()
  |> get_balance
  |> to_string
  |> io.println
}
```

**`test/bam_test.gleam`:**

```gleam
import gleeunit
import gleeunit/should
import bam.{Amount, create_account, deposit, get_balance}

pub fn main() {
  gleeunit.main()
}

pub fn deposit_increases_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> get_balance
  |> should.equal(Amount(100))
}

pub fn negative_deposit_does_not_increase_account_balance_test() {
  create_account()
  |> deposit(Amount(-100))
  |> get_balance
  |> should.equal(Amount(0))
}

pub fn deposits_should_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> deposit(Amount(100))
  |> get_balance
  |> should.equal(Amount(200))
}

pub fn negative_deposits_should_not_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> deposit(Amount(-100))
  |> get_balance
  |> should.equal(Amount(100))
}
```

```sh
gleam test
# ....
# Finished in 0.XXX seconds
# 4 tests, 0 failures
```

## Creating Our First Withdrawal Test

```gleam
pub fn withdrawal_decreases_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(50))
  |> get_balance
  |> should.equal(Amount(50))
}
```

```sh
gleam test
# error: Unknown variable
#    ┌─ ./test/bam_test.gleam:42:6
#    │
# 42 │   |> withdraw(Amount(50))
#    │      ^^^^^^^^ did you mean `Error`?
# 
# The name `withdraw` is not in scope here.
```

Recall that the name is not defined because it is a) not imported and b) not defined.

```gleam
import bam.{Amount, create_account, deposit, get_balance, withdraw}
```

```sh
gleam test
# error: Unknown module field
#   ┌─ ./test/bam_test.gleam:3:59
#   │
# 3 │ import bam.{Amount, create_account, deposit, get_balance, withdraw}
#   │                                                           ^^^^^^^^ did you mean `Account`?
# 
# The module `bam` does not have a `withdraw` field.
```

Recall that Gleam is trying to a field because we have not created the function yet. Let's duplicate the `deposit` function and rename it to `withdraw`:

```gleam
pub fn withdraw(account: Account, amount: Amount) -> Account {
  case amount.amount {
    n if n >= 0 -> Account(Amount(account.balance.amount + amount.amount))
    _n -> account
  }
}
```

```
gleam test
# ....F
# Failures:
# 
#   1) bam_test:withdrawal_deccreases_account_balance_test/0
#      Failure: ?assertEqual({amount,50}, Actual)
#        expected: {amount,50}
#             got: {amount,150}
#      %% eunit_proc.erl:346:in `eunit_proc:with_timeout/3`
#      Output: 
#      Output: 
# 
# Finished in 0.XXX seconds
# 5 tests, 1 failures
```

Here we are getting a proper failure. Our test is failing as we would expect, because we are performing the wrong operation. Now let's fix that logic error.

```gleam
pub fn withdraw(account: Account, amount: Amount) -> Account {
  case amount.amount {
    n if n >= 0 -> Account(Amount(account.balance.amount - amount.amount))
    _n -> account
  }
}
```

```sh
gleam test
# .....
# Finished in 0.018 seconds
# 5 tests, 0 failures
```

Green tests! This is fantastic, but our code files are starting to get a little long and have not real organization. Since we now have enough capabilities to warrant using modules, let's add them to clean up our code organization.

## Remaining Withdrawal Tests

Before do that, let's drive out the rest of the withdrawal tests:

```gleam
import gleeunit
import gleeunit/should
import bam.{Amount, create_account, deposit, get_balance, withdraw}

pub fn main() {
  gleeunit.main()
}

pub fn deposit_increases_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> get_balance
  |> should.equal(Amount(100))
}

pub fn negative_deposit_does_not_change_account_balance_test() {
  create_account()
  |> deposit(Amount(-100))
  |> get_balance
  |> should.equal(Amount(0))
}

pub fn deposits_should_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> deposit(Amount(100))
  |> get_balance
  |> should.equal(Amount(200))
}

pub fn negative_deposits_should_not_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> deposit(Amount(-100))
  |> get_balance
  |> should.equal(Amount(100))
}

pub fn withdrawal_deccreases_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(50))
  |> get_balance
  |> should.equal(Amount(50))
}

pub fn negative_withdrawal_does_not_change_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(-100))
  |> get_balance
  |> should.equal(Amount(100))
}

pub fn witdrawals_should_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(20))
  |> withdraw(Amount(20))
  |> get_balance
  |> should.equal(Amount(60))
}

pub fn negative_withdrawals_should_not_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(-100))
  |> withdraw(Amount(-100))
  |> get_balance
  |> should.equal(Amount(100))
}
```

Now we have four tests testing deposits and four tests testing withdrawals.

## Reorganizing Code

First, let's re-organize the production code. We will do that by wrapping up all of the account stuff in a module. This will give us a standard place to extend functionality. First, we'll make a folder to hold all of our business logic. We'll call this `bamlib`. Why did I append `lib`? Two reasons: avoid naming collisons, and test separation.

```sh
mkdir src/bamlib
touch src/bamlib/account.gleam
```

Now we will move everything except for `main` into the new file:

**`src/bamlib/account.gleam`:**

```gleam
import gleam/io
import gleam/int
import gleam/float

pub type Account {
  Account(balance: Amount)
}

pub type Amount {
  Amount(amount: Int)
}

pub fn create_account() -> Account {
  Account(Amount(0))
}

pub fn get_balance(account: Account) -> Amount {
  account.balance
}

pub fn deposit(account: Account, amount: Amount) -> Account {
  case amount.amount {
    n if n >= 0 -> Account(Amount(account.balance.amount + amount.amount))
    _n -> account
  }
}

pub fn withdraw(account: Account, amount: Amount) -> Account {
  case amount.amount {
    n if n >= 0 -> Account(Amount(account.balance.amount - amount.amount))
    _n -> account
  }
}

pub fn to_string(balance: Amount) -> String {
  balance.amount
  |> int.to_string
}
```

```gleam
pub fn main() {
  create_account()
  |> get_balance
  |> to_string
  |> io.println
}
```

```sh
gleam build
# error: Unknown variable
#   ┌─ ./src/bam.gleam:4:3
#   │
# 4 │   create_account()
#   │   ^^^^^^^^^^^^^^ did you mean `Error`?
# 
# The name `create_account` is not in scope here.
```

Here, Gleam cannot find `create_account`. Of course, that's because we moved it. So let's import the new module to use it.

```gleam
import bamlib/account
```

We will also add a prefix to the functions called from account to keep the organization obvious.

```gleam
import bamlib/account

pub fn main() {
  account.create_account()
  |> account.get_balance
  |> account.to_string
  |> io.println
}
```

```sh
gleam build
# error: Unknown module
#   ┌─ ./src/bam.gleam:7:6
#   │
# 7 │   |> io.println
#   │      ^^ did you mean `account`?
# 
# No module has been found with the name `io`.
```

We did get an error here, but nothing with `create_account`, so this is promising. Different error messages `==` progress.

We have accidentally moved the `io` import. There is no code consuming `io` in `bamlib/account.gleam`, so we can simply move this back.

```gleam
import gleam/io
import bamlib/account

pub fn main() {
  account.create_account()
  |> account.get_balance
  |> account.to_string
  |> io.println
}
```

```sh
gleam build
# error: Unknown module field
#   ┌─ ./test/bam_test.gleam:3:13
#   │
# 3 │ import bam.{Amount, create_account, deposit, get_balance, withdraw}
#   │             ^^^^^^ did you mean `main`?
# 
# The module `bam` does not have a `Amount` field.
```

Now our tests are failing, and for the same reason as the production code. None of these names are in `bam` anymore. Instead, they are in `bamlib/account`. So let's update that:

```gleam
import bamlib/account.{Amount, create_account, deposit, get_balance, withdraw}
```

```sh
gleam build
```

_compiles_

```sh
gleam test
# ........
# Finished in 0.XXX seconds
# 8 tests, 0 failures
```

Green tests! Now that we have encapsulated our code into a module, it is much more easily usable, composable, predicatable, and testable.

Here is a quick check-in on the state of the code:

**`src/bam.gleam`:**

```gleam
import gleam/io
import bamlib/account

pub fn main() {
  account.create_account()
  |> account.get_balance
  |> account.to_string
  |> io.println
}
```


**`src/bamlib/account.gleam`:**

```gleam
import gleam/int
import gleam/float

pub type Account {
  Account(balance: Amount)
}

pub type Amount {
  Amount(amount: Int)
}

pub fn create_account() -> Account {
  Account(Amount(0))
}

pub fn get_balance(account: Account) -> Amount {
  account.balance
}

pub fn deposit(account: Account, amount: Amount) -> Account {
  case amount.amount {
    n if n >= 0 -> Account(Amount(account.balance.amount + amount.amount))
    _n -> account
  }
}

pub fn withdraw(account: Account, amount: Amount) -> Account {
  case amount.amount {
    n if n >= 0 -> Account(Amount(account.balance.amount - amount.amount))
    _n -> account
  }
}

pub fn to_string(balance: Amount) -> String {
  balance.amount
  |> int.to_string
}
```

**`test/bam_test.gleam`:**

```gleam
import gleeunit
import gleeunit/should
import bamlib/account.{Amount, create_account, deposit, get_balance, withdraw}

pub fn main() {
  gleeunit.main()
}

pub fn deposit_increases_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> get_balance
  |> should.equal(Amount(100))
}

pub fn negative_deposit_does_not_change_account_balance_test() {
  create_account()
  |> deposit(Amount(-100))
  |> get_balance
  |> should.equal(Amount(0))
}

pub fn deposits_should_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> deposit(Amount(100))
  |> get_balance
  |> should.equal(Amount(200))
}

pub fn negative_deposits_should_not_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> deposit(Amount(-100))
  |> get_balance
  |> should.equal(Amount(100))
}

pub fn withdrawal_deccreases_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(50))
  |> get_balance
  |> should.equal(Amount(50))
}

pub fn negative_withdrawal_does_not_change_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(-100))
  |> get_balance
  |> should.equal(Amount(100))
}

pub fn witdrawals_should_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(20))
  |> withdraw(Amount(20))
  |> get_balance
  |> should.equal(Amount(60))
}

pub fn negative_withdrawals_should_not_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(-100))
  |> withdraw(Amount(-100))
  |> get_balance
  |> should.equal(Amount(100))
}
```

Next, we'll separate our test code.

## Organizing Tests

There are two main things we have to abide by in order to get our tests running:

1. Test files must have `_test` as a suffix for the filename (before the `.gleam` extension).
2. Test functions must end it `_test` in order to be run.

It seems fairly likely that we will be doing more with accounts and that should warrant it's own set of tests. With this thought in mind, I will create a folder for all account-related tests.

```sh
mkdir test/accounts
touch test/accounts/deposit_test.gleam
touch test/accounts/withdrawal_test.gleam
```

Now, we can move all of our tests into the appropriate place.

**`test/bam_test.gleam`:**

```gleam
import gleeunit

pub fn main() {
  gleeunit.main()
}
```

**`test/accounts/deposit_test.gleam`:**

```gleam
import gleeunit/should
import bamlib/account.{Amount, create_account, deposit, get_balance}

pub fn deposit_increases_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> get_balance
  |> should.equal(Amount(100))
}

pub fn negative_deposit_does_not_change_account_balance_test() {
  create_account()
  |> deposit(Amount(-100))
  |> get_balance
  |> should.equal(Amount(0))
}

pub fn deposits_should_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> deposit(Amount(100))
  |> get_balance
  |> should.equal(Amount(200))
}

pub fn negative_deposits_should_not_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> deposit(Amount(-100))
  |> get_balance
  |> should.equal(Amount(100))
}
```

**`test/accounts/withdrawal_test.gleam`:**

```gleam
import gleeunit/should
import bamlib/account.{Amount, create_account, deposit, get_balance, withdraw}

pub fn withdrawal_deccreases_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(50))
  |> get_balance
  |> should.equal(Amount(50))
}

pub fn negative_withdrawal_does_not_change_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(-100))
  |> get_balance
  |> should.equal(Amount(100))
}

pub fn witdrawals_should_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(20))
  |> withdraw(Amount(20))
  |> get_balance
  |> should.equal(Amount(60))
}

pub fn negative_withdrawals_should_not_accumulate_test() {
  create_account()
  |> deposit(Amount(100))
  |> withdraw(Amount(-100))
  |> withdraw(Amount(-100))
  |> get_balance
  |> should.equal(Amount(100))
}
```

```sh
gleam test
# ........
# Finished in 0.XXX seconds
# 8 tests, 0 failures
```

_Awesome!_

Now that we have our tests separated, we can add features in a more well-defined way. But first, let's use the encapsulation the module has given us to prototype a public interface (i.e., an API).
