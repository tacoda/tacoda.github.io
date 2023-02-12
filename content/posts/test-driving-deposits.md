---
title: "Test-Driving Deposits"
date: 2023-01-19T11:30:03+00:00
publishdate: 2023-01-19T11:30:03+00:00
# weight: 4
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

pub fn get_balance(account: Account) -> Float {
  account.balance
}

pub fn deposit(account: Account, amount: Float) -> Account {
  Account(account.balance +. amount)
}

pub fn main() {
  let account = Account(1.0)

  account
  |> get_balance
  |> float.to_string
  |> io.println
}
```

**`test/bam_test.gleam`:**

```gleam
import gleeunit
import gleeunit/should
import bam.{Account, deposit, get_balance}

pub fn main() {
  gleeunit.main()
}

pub fn deposit_increases_account_balance_test() {
  let account = Account(0.0)

  account
  |> deposit(10.0)
  |> get_balance
  |> should.equal(10.0)
}
```

```sh
gleam test
# .
# Finished in 0.XXX seconds
# 1 tests, 0 failures
```

## Testing Goals

Currently, we have one passing test:

> **Given** an account with a zero balance \
> **When** `10.0` currency is `deposit`ed into that account \
> **Then** `get_balance` for that account `should.equal` `10.0`

This is a simple _happy-path_ test for `deposit`. But now we should drive out the other scenarios. We also know all the types, which means we can be sure that we have full input coverage if our test cases cover all possible paths resulting from the domain of the input type.

Our passing test is representative of a valid input within the type domain. But what if we provide it with something else in the type domain that isn't (logically) valid? The obvious case here is a negative number. If I `deposit` a negative amount, it should not add those funds to the account. Let's drive out that test:

```gleam
import gleeunit
import gleeunit/should
import bam.{Account, deposit, get_balance}

pub fn main() {
  gleeunit.main()
}

pub fn deposit_increases_account_balance_test() {
  let account = Account(0.0)

  account
  |> deposit(10.0)
  |> get_balance
  |> should.equal(10.0)
}

pub fn negative_deposit_does_not_increase_account_balance_test() {
  let account = Account(0.0)

  account
  |> deposit(-10.0)
  |> get_balance
  |> should.not_equal(-10.0)
}
```

Copying the previous test and updating the arguments is enough to capture the _negative amount_ case.

```sh
gleam test
# .F
# Failures:

#   1) bam_test:negative_deposit_does_not_increase_account_balance_test/0
#      Failure: ?assertNotEqual(-10.0, Actual)
#        expected not: == -10.0
#                 got:    -10.0
#      %% eunit_proc.erl:346:in `eunit_proc:with_timeout/3`
#      Output: 
#      Output: 

# Finished in 0.XXX seconds
# 2 tests, 1 failures
```

Here we get the failure we were expecting. We'll continue to drive this out momentarily.

### Testing Goals Defined

Since we know the type (and thus the domain) and our expectations, we can define our use cases.

| Negative | Zero | Positive |
|---|---|---|
| BAD | Add zero | Add amount |

Our edge case here is `0.0`, but that doesn't matter in this case since `0.0` is the additive identity. Therefore, we have x Since it is an edge-case, we will naturally test it. Listing out our test cases we have:

1. Depositing a positive amount adds the amount to the balance.
2. Depositing a zero amount adds zero to the balance.
3. Depositing a negative amount is BAD.

### BAD

Now comes the lurking question: What to do in the BAD case? Should we throw an error? Should we just ignore the operation? We will answer this question as we continue to drive out tests.

## Onward!

Returning to our failing test:

```sh
gleam test
# .F
# Failures:

#   1) bam_test:negative_deposit_does_not_increase_account_balance_test/0
#      Failure: ?assertNotEqual(-10.0, Actual)
#        expected not: == -10.0
#                 got:    -10.0
#      %% eunit_proc.erl:346:in `eunit_proc:with_timeout/3`
#      Output: 
#      Output: 

# Finished in 0.XXX seconds
# 2 tests, 1 failures
```

We have two options for handling the BAD case here, so let's move forward with the one with less friction: ignoring the operation. What does this mean for our implementation code?

```gleam
pub fn deposit(account: Account, amount: Float) -> Account {
  Account(account.balance +. amount)
}
```

The naiive implementation should simply return the account in the BAD case. But we don't have `if`, so how do we do this? By taking off our OOP hat and putting on our functional hat. The way to have control flow in Gleam is to use `case`.

```gleam
pub fn deposit(account: Account, amount: Float) -> Account {
  case amount >=. 0.0 {
    True -> Account(account.balance +. amount)
    False -> account
  }
}
```

```sh
gleam test
# ..
# Finished in 0.XXX seconds
# 2 tests, 0 failures
```

**Nice!** Green tests! I would like to point out, however, that this `case` as an `if` pattern is a big code smell. Before we move on to refactoring, let's cover a little about pattern matching.

## Pattern Matching For Great Good!

Gleam, like many other functional languages, uses pattern matching for a variety of cases. We can use it control flow, destructure data, and much more. The code above smells to me because of the value that `case` is evaluating: `amount >= 0.0`. This is an expression that returns a boolean and we are pattern matching on the boolean just as one would expect from `if` (or `cond`).

However this code seems to miss the point of the pattern matching, and thus misuse the `case`. The data that matters is the `amount`. The boolean expression we have chosen is only assessing a case of the `amount`. It is, in effect, a redundant `case`. What if we were to look at only the value of `amount`?

```gleam
pub fn deposit(account: Account, amount: Float) -> Account {
  case amount {
    n -> Account(account.balance +. amount)
    _ -> account
  }
}
```

Since `amount` is a `Float`, when we pattern match against `n`, this matches _any_ value. In the BAD case, we are matching against `_`, which is a placeholder for anything. The most common use-case for this is matching against a value that you do not care to reference. In this case, `_` is a catch-all. However, since `amount` is a `Float`, we would never be able to get to this case.

```sh
gleam test
# .F
# Failures:

#   1) bam_test:negative_deposit_does_not_increase_account_balance_test/0
#      Failure: ?assertNotEqual(-10.0, Actual)
#        expected not: == -10.0
#                 got:    -10.0
#      %% eunit_proc.erl:346:in `eunit_proc:with_timeout/3`
#      Output: 
#      Output: 

# Finished in 0.XXX seconds
# 2 tests, 1 failures
```

## Guards To Arms!

Guards allow us to check conditions within the patterns we are matching against. We could _potentially_ use a range here, but since we are comparing `Float` values, that will not work. We would need `Int` values. Rather than messing around with types to satisfy the assertion of a test, let's utilize guards.

> **Note:** A range of `Float` does not really make sense for two reasons:
> 1. Float types are approximations of float numbers and don't play nice with `==`.
> 2. A float type is representation of a real number, which is continuous, so a range would be of little use.
>
> The analog of a range for a float type would be an interval.

```gleam
pub fn deposit(account: Account, amount: Float) -> Account {
  case amount {
    n if n >=. 0.0 -> Account(account.balance +. amount)
    n -> account
  }
}
```

```sh
gleam test
# ..
# Finished in 0.XXX seconds
# 2 tests, 0 failures
```

Back to green tests! However, we also get a warning:

```sh
# n -> account
#      ^ This variable is never used.
```

Since we are not using the value of the float for this branch, we can ignore it by prefixing it with `_`:

```gleam
pub fn deposit(account: Account, amount: Float) -> Account {
  case amount {
    n if n >=. 0.0 -> Account(account.balance +. amount)
    _n -> account
  }
}
```

```sh
gleam test
# ..
# Finished in 0.XXX seconds
# 2 tests, 0 failures
```

And the warning is gone!

## Meditations On Duplication

This is the current state of our code:

**`src/bam.gleam`:**

```gleam
import gleam/io
import gleam/float

pub type Account {
  Account(balance: Float)
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
  let account = Account(1.0)

  account
  |> get_balance
  |> float.to_string
  |> io.println
}
```

**`test/bam_test.gleam`:**

```gleam
import gleeunit
import gleeunit/should
import bam.{Account, deposit, get_balance}

pub fn main() {
  gleeunit.main()
}

pub fn deposit_increases_account_balance_test() {
  let account = Account(0.0)

  account
  |> deposit(10.0)
  |> get_balance
  |> should.equal(10.0)
}

pub fn negative_deposit_does_not_increase_account_balance_test() {
  let account = Account(0.0)

  account
  |> deposit(-10.0)
  |> get_balance
  |> should.not_equal(-10.0)
}
```

The duplication I would like to focus on **DRY**ing up is with creating an `Account` type. There are two `Account` constructions in our source code and two in our test code. While this may not seem _that_ bad, keep in mind that we will always need to create more test cases, and so this number will continue to grow. Let's take a few approaches.

## More Indirection

We will starting by wrapping up `Account` construction in a private function. During this process, I will omit code we are not focused on. In our test, we create our new `create_account` function:

```gleam
fn create_account() {
  Account(0.0)
}

pub fn deposit_increases_account_balance_test() {
  let account = create_account()

  account
  |> deposit(10.0)
  |> get_balance
  |> should.equal(10.0)
}
```

```sh
gleam test
# ..
# Finished in 0.XXX seconds
# 2 tests, 0 failures
```

🫢 I did not expect this. It just worked, but _should_ it have? The wrapping function makes sense, but we did not give it a return type. Perhaps it needs to be rebuilt.

```sh
gleam build
```

This command is successful. Another try:

```sh
gleam test
# ..
# Finished in 0.XXX seconds
# 2 tests, 0 failures
```

I am unsure why the test function signature does not seem to be verified, but I'm going to clean that up anyway because I would rather be explicit about types in a type-driven language.

> **TIL:** Annotations are entirely optional in Gleam (other than in some cases when using record accessors) so you get no more type safety in adding them. They are good to have though!

```gleam
fn create_account() -> Account {
  Account(0.0)
}

pub fn deposit_increases_account_balance_test() {
  let account = create_account()

  account
  |> deposit(10.0)
  |> get_balance
  |> should.equal(10.0)
}
```

```sh
gleam test
# ..
# Finished in 0.XXX seconds
# 2 tests, 0 failures
```

Take advantage of pipes:

```gleam
pub fn deposit_increases_account_balance_test() {
  create_account()
  |> deposit(10.0)
  |> get_balance
  |> should.equal(10.0)
}
```

```sh
gleam test
# ..
# Finished in 0.XXX seconds
# 2 tests, 0 failures
```

Let's do the same refactoring to the other test:

```gleam
pub fn negative_deposit_does_not_increase_account_balance_test() {
  create_account()
  |> deposit(-10.0)
  |> get_balance
  |> should.not_equal(-10.0)
}
```

This test function did **DRY** up our test code, but it did nothing about our source code. It also had the unfortunate by-product of increasing the total number of lines in our test code. This is a great example of the consequences that happen when we abstract code in the wrong place. So, let's move this constructor into our source code.

## High And DRY

We will start by moving the constructor into the source code as-is.

**`src/bam.gleam`:**

```gleam
import gleam/io
import gleam/float

pub type Account {
  Account(balance: Float)
}

fn create_account() -> Account {
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
  let account = Account(1.0)

  account
  |> get_balance
  |> float.to_string
  |> io.println
}
```

**`test/bam_test.gleam`:**

```gleam
import gleeunit
import gleeunit/should
import bam.{Account, deposit, get_balance}

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
# warning: Unused private function
#   ┌─ ./src/bam.gleam:8:1
#   │
# 8 │ fn create_account() -> Account {
#   │ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ This private function is never used.

# Hint: You can safely remove it.
# error: Unknown variable
#    ┌─ ./test/bam_test.gleam:10:3
#    │
# 10 │   create_account()
#    │   ^^^^^^^^^^^^^^ Did you mean `Account`?

# The name `create_account` is not in scope here.
```

Back to red tests. The saga continues.

The warning is telling us that we have an unused private function. Both of these attributes are bad for us. First, we make `create_account` public:

```gleam
pub fn create_account() -> Account {
  Account(0.0)
}
```

Next, we update the `main` method to consume the new function:

```gleam
pub fn main() {
  let account = create_account()

  account
  |> get_balance
  |> float.to_string
  |> io.println
}
```

Awesome! Now our function is both public _and_ used.

```sh
gleam test
# The name `create_account` is not in scope here.
```

Recall that this is because our `import` is incorrect. Now, we need to import our constructor instead of our type:

```gleam
import bam.{create_account, deposit, get_balance}
```

```sh
gleam test
# ..
# Finished in 0.XXX seconds
# 2 tests, 0 failures
```

Back to green tests! Lot's more to do here, but I think it's time for a well-deserved break.

## Takeaways

- Rely on pattern matching
- _Where_ abstractions are defined matters as much as _which_ abstractions are defined

---

**Next up:** We will explore more options creating accounts and test our edge-case.
