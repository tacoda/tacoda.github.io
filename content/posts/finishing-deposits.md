---
title: "Finishing Deposits"
date: 2023-01-20T11:30:03+00:00
publishdate: 2023-01-20T11:30:03+00:00
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

```sh
gleam test
# ..
# Finished in 0.XXX seconds
# 2 tests, 0 failures
```

---

> **NOTE:** Since I had not worked with this code in a recent time, and because I updated my packages from brew, my project failed. I resolved this by managing `gleam` using `asdf`.

## Describing Deposit Behavior

Let's start by describing the positive behavior of deposits.

### Deposits Should Accumulate

Let's start off defining a test:

```gleam
pub fn deposits_should_accumulate_test() {
  create_account()
  |> deposit(10.0)
  |> deposit(10.0)
  |> get_balance
  |> should.equal(20.0)
}
```

```sh
gleam test
# ...
# Finished in 0.XXX seconds
# 3 tests, 0 failures
```

**Beautiful!** Our code was general enough that we got this one for free.

### Negative Deposits Should Not Accumulate

There is one last case to test. This is an edge case, but it's worth driving out the test for completeness.

```gleam
pub fn negative_deposits_should_not_accumulate_test() {
  create_account()
  |> deposit(10.0)
  |> deposit(-10.0)
  |> get_balance
  |> should.equal(10.0)
}
```

```sh
gleam test
# ....
# Finished in 0.XXX seconds
# 4 tests, 0 failures
```

We get this one for free too, since our code has already handled this case.

### Redefining the Negative Deposit Test

When looking at the tests, I noticed a glaring `should.not_equal` and decided to rewrite the assertion using `should.equal`:

```gleam
pub fn negative_deposit_does_not_increase_account_balance_test() {
  create_account()
  |> deposit(-10.0)
  |> get_balance
  |> should.equal(0.0)
}
```

```sh
gleam test
# ....
# Finished in 0.XXX seconds
# 4 tests, 0 failures
```

**Awesome!** Green tests `==` Onward!

## Let's Refactor!

Now that we have green tests and we have described the basic behavior of deposits, let's refactor some things. One thing that I'd like to change is the way that we store the balance.

Recall that our `Account` type has a `balance` which is a `Float` type:

```gleam
pub type Account {
  Account(balance: Float)
}
```

Now that we have driven out some initial tests, I feel confident enough to refactor the type of the `balance`. Why?

### `Float` Is Not The Right Type

It is tempting to use a float for the balance because that type adequately describes the balance. However, it does _not_ adequately **define** the balance. The main reason for this is because of the way that floating-point numbers are stored in computers.

The solution to this is to use an `Integer`, but of course we are going to want a little more structure than that.

## Drive Out the Desired Interface with Types

What should the type for the balance be? Let's start to explore that:

```gleam
pub type Balance {
  Balance(amount: Float)
}
```

Starting off with this contrived example, we can see that same problem with the inner `Float` type. First we change the inner type to `Integer`.

```gleam
pub type Balance {
  Balance(amount: Integer)
}
```

Now comes the more important question. What is a balance? What does it mean? Does it make sense? In our usage of balance, we are really tracking an amount of units. If that sounds too esoteric, that's because _it is_. Here is another indicator that we need to drive out a better interface.

What is this a balance of? Money. Even that seems a little too vague for my taste, so I'm going to choose the term **Currency**:

```gleam
pub type Currency {
  Currency(amount: Integer)
}
```

Seeing the interface now, I realize that this is overly-qualified because it does not make sense for a currency to have an amount. Rather, the currency is a _property_ of the Balance.

```gleam
pub type Balance {
  Balance(amount: Integer, currency: Currency)
}

pub type Currency {
  Currency
}
```

The currency is now staring me in the face. But in this case, we have actually _revealed_ an enumeration! We know this because we can define a set of currencies. Let's define those enumerations:

```gleam
pub type Currency {
  EUR
  GBP
  USD
}
```

This list is good enough to get started, but would obviously need to include all of the currencies that the bank will have to deal with.

## Use It or Lose It

Now let's use our new interface in the account:

```gleam
pub type Account {
  Account(balance: Balance)
}
```

```sh
gleam build
# error: Type mismatch
#    ┌─ ./src/bam.gleam:18:11
#    │
# 18 │   Account(0.0)
#    │           ^^^
# Expected type:
# 
#     Balance
# 
# Found type:
# 
#     Float
```

Gleam is telling us we need to update the calls to account to use the new type.

```gleam
pub fn create_account() -> Account {
  Account(Balance(0))
}
```

```sh
gleam build
# error: Type mismatch
#    ┌─ ./src/bam.gleam:22:3
#    │
# 22 │   account.balance
#    │   ^^^^^^^^^^^^^^^
# 
# The type of this returned value doesn't match the return type 
# annotation of this function.
# 
# Expected type:
# 
#     Float
# 
# Found type:
# 
#     Balance
```

> **NOTE:** Side benefits to DRY code: we're done with updating calls to create a new account, including our tests!

Our new eror is because our type signature is no longer accurate. So let's update that:

```gleam
pub fn get_balance(account: Account) -> Balance {
  account.balance
}
```

```sh
gleam build
# error: Type mismatch
#    ┌─ ./src/bam.gleam:27:31
#    │
# 27 │     n if n >=. 0.0 -> Account(account.balance +. amount)
#    │                               ^^^^^^^^^^^^^^^
# 
# The +. operator expects arguments of this type:
# 
#     Float
# 
# But this argument has this type:
# 
#     Balance
```

We are still referring to the old float implementation here.

`account.balance` is now a `Balance` type, so we need to be able to add to that type. We will need a new way to add the items since they are no longer floats. It also begs the question of what type `amount` should be.

Let's defer these decisions until later, in true agile style. Part of the point of this blog series is to experiment through common development practices. For now, let's just focus on getting the types correct enough to compile.

Here is our starting code for this function:

```gleam
pub fn deposit(account: Account, amount: Float) -> Account {
  case amount {
    n if n >=. 0.0 -> Account(account.balance +. amount)
    _n -> account
  }
}
```

Here, we convert `amount` to an `Int` using `truncate`, then add the resulting integer with the store amount, then wrap all of that up in a `Balance` type.

```gleam
pub fn deposit(account: Account, amount: Float) -> Account {
  case amount {
    n if n >=. 0.0 -> Account(Balance(account.balance.amount + float.truncate(amount *. 100.0)))
    _n -> account
  }
}
```

Don't worry. It gets uglier before it gets prettier. Remember, this is just to get it to compile.

```sh
gleam build
# error: Type mismatch
#    ┌─ ./src/bam.gleam:35:6
#    │
# 35 │   |> float.to_string
#    │      ^^^^^^^^^^^^^^^ This function does not accept the piped type
# 
# The argument is:
# 
#     Balance
# 
# But function expects:
# 
#     Float
```

Now `float.to_string` is complaining we didn't give it the expected type. So let's add the ability to convert the `Balance` to a string.

## Printing the Balance

First, we'll update the code to call our custom `to_string` function.

```gleam
pub fn main() {
  create_account()
  |> get_balance
  |> to_string
  |> io.println
}
```

Next, we'll define the `to_string` function:

```gleam
pub fn to_string(balance: Balance) -> String {
  balance.amount |> int.to_string
}
```

Lastly, we'll have to import the `int` package to use the `to_string` function in that module.

```gleam
import gleam/int
```

```sh
gleam build
# error: Type mismatch
#    ┌─ ./test/bam_test.gleam:13:19
#    │
# 13 │   |> should.equal(10.0)
#    │                   ^^^^
# 
# Expected type:
# 
#     Balance
# 
# Found type:
# 
#     Float
```

Now, our tests are complaining about types. This is an indicator to clean up the currency amounts into their own type, but we shouldn't get too crazy on that yet. Let's start off by creating a new way to convert the `Balance` into a `Float`. Once we do that, we can use the new function as a shim so that we don't have to update the tests yet.

Here is our new `to_float` function:

```gleam
pub fn to_float(balance: Balance) -> Float {
  let tmp = balance.amount |> int.to_float
  tmp /. 100.0
}
```

First, we make sure to import it in our tests:

```gleam
import bam.{create_account, deposit, get_balance, to_float}
```

Then, we can insert it into the pipeline to change the type to what the test expects.

```gleam
pub fn deposit_increases_account_balance_test() {
  create_account()
  |> deposit(10.0)
  |> get_balance
  |> to_float
  |> should.equal(10.0)
}
```

We will do this for all of our tests for now. And now we can build...

```sh
gleam build
```

We can test...

```sh
gleam test
# ....
# Finished in 0.XXX seconds
# 4 tests, 0 failures
```

And we're green! Next, we'll update the tests to use a new type. Since we have done so much, here is a check-in on the state of the code:

**`src/bam.gleam`:**

```gleam
import gleam/io
import gleam/float

pub type Account {
  Account(balance: Balance)
}

pub type Balance {
  Balance(amount: Int)
}

pub type Currency {
  USD
  GBP
}

pub fn create_account() -> Account {
  Account(Balance(0))
}

pub fn get_balance(account: Account) -> Balance {
  account.balance
}

pub fn deposit(account: Account, amount: Float) -> Account {
  case amount {
    n if n >=. 0.0 -> Account(Balance(account.balance.amount + float.truncate(amount *. 100.0)))
    _n -> account
  }
}

pub fn to_string(balance: Balance) -> String {
  balance.amount |> int.to_string
}

pub fn to_float(balance: Balance) -> Float {
  let tmp = balance.amount |> int.to_float
  tmp /. 100.0
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
import bam.{create_account, deposit, get_balance, to_float}

pub fn main() {
  gleeunit.main()
}

pub fn deposit_increases_account_balance_test() {
  create_account()
  |> deposit(10.0)
  |> get_balance
  |> to_float
  |> should.equal(10.0)
}

pub fn negative_deposit_does_not_increase_account_balance_test() {
  create_account()
  |> deposit(-10.0)
  |> get_balance
  |> to_float
  |> should.equal(0.0)
}

pub fn deposits_should_accumulate_test() {
  create_account()
  |> deposit(10.0)
  |> deposit(10.0)
  |> get_balance
  |> to_float
  |> should.equal(20.0)
}

pub fn negative_deposits_should_not_accumulate_test() {
  create_account()
  |> deposit(10.0)
  |> deposit(-10.0)
  |> get_balance
  |> to_float
  |> should.equal(10.0)
}
```

## `Float` Off

In both the tests and the application code, we are still using `Float`s to `deposit`. Getting rid of this will allow us to completely remove `Float`s, as well as get rid of the temporary code that we needed to get it to compile.

Looking at our `Balance` type, we can compare that with the `amount`. The only difference is the context in the `Account`, which is already captured in the type definition. What does this tell us? That the `Balance` is an `Amount`. After replacing `Balance` with `Amount`, we run into type errors:

```gleam
pub type Account {
  Account(balance: Amount)
}

pub type Amount {
  Amount(amount: Int)
}

pub type Currency {
  USD
  GBP
}

pub fn create_account() -> Account {
  Account(Amount(0))
}

pub fn get_balance(account: Account) -> Amount {
  account.balance
}

pub fn deposit(account: Account, amount: Amount) -> Account {
  case amount {
    n if n >=. 0.0 -> Account(Balance(account.balance.amount + float.truncate(amount *. 100.0)))
    _n -> account
  }
}

pub fn to_string(balance: Amount) -> String {
  balance.amount |> int.to_string
}

pub fn to_float(balance: Amount) -> Float {
  let tmp = balance.amount |> int.to_float
  tmp /. 100.0
}
```

```sh
gleam build
# error: Type mismatch
#    ┌─ ./src/bam.gleam:28:10
#    │
# 28 │     n if n >=. 0.0 -> Account(Balance(account.balance.amount + float.truncate(amount *. 100.0)))
#    │          ^
# 
# Expected type:
# 
#     Float
# 
# Found type:
# 
#     Amount
```

Let's clean up those inner types:

```gleam
pub fn deposit(account: Account, amount: Amount) -> Account {
  case amount.amount {
    n if n >= 0 -> Account(Amount(account.balance.amount + amount.amount))
    _n -> account
  }
}
```

```sh
gleam build
# error: Type mismatch
#    ┌─ ./test/bam_test.gleam:11:14
#    │
# 11 │   |> deposit(10.0)
#    │              ^^^^
# 
# Expected type:
# 
#     Amount
# 
# Found type:
# 
#     Float
```

As a simple way to get through this, we will just import our new type and use it directly. We will change that later.

```gleam
import bam.{Amount, create_account, deposit, get_balance}
```

We then use it like so in our tests:

```gleam
pub fn deposit_increases_account_balance_test() {
  create_account()
  |> deposit(Amount(100))
  |> get_balance
  |> should.equal(Amount(100))
}
```

```sh
gleam build
```

It compiles!

```sh
gleam test
# ....
# Finished in 0.086 seconds
# 4 tests, 0 failures
```

Green tests! We have officially swapped the type of balance from `Float` to `Amount(Int)`. This is nice, but we still have further to go. Soon, we will add our currency into the `Amount`, so we can make decisions based on the currency type.

**Bonus Points:** We can remove our `to_float` function, since nothing is using it.

## Ending State

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

pub type Currency {
  USD
  GBP
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

## Takeaways

- Use types to explore the interface
- Use tests to verify the behavior

