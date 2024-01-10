---
title: "Testing Our Tasks"
date: 2024-01-10T11:30:03+00:00
publishdate: 2024-01-10T11:30:03+00:00
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

Now that we have wrapped our domain logic in a class, we can start to change it. But before we do that, it's a good idea to add tests. Why? Because passing tests will give us confidence that the changes we've added do not break things. However, we will run into some issues with the current implementation. I hope that it's instructive to walk through them.

First, we need to add `pytest`. Python has many testing libraries, but this is a very popular one that we are going to use. To add the dependency:

```sh
poetry add pytest
```

Poetry will add `pytest` to the `pyproject.toml` file as a dependency. Poetry also creates a `poetry.lock` file. This file is similiar to lock files in other package management systems (). The role of the lock file is to be specific about the version of dependencies required. Why do we need another file for that?

The reason for this is that software libraries and package managers, in general, but specifically here, rely on semantic versioning. [Semantic versioning](https://semver.org/) is really useful for distributing packages in a predictable way. What does this look like for our project?

In `pyproject.toml`:

```toml
[tool.poetry.dependencies]
python = "^3.12"
pytest = "^7.4.4"
```

In our dependencies section, we see pytest has a version of `"^7.4.4"`. The caret means that we are will use version `7.4.4` and any version that includes backward-compatible changes, up to, but not including, version `8.0.0`. So, which version do we have?

In `poetry.lock`:

```toml
[[package]]
name = "pytest"
version = "7.4.4"
description = "pytest: simple powerful testing with Python"
optional = false
python-versions = ">=3.7"
files = [
    {file = "pytest-7.4.4-py3-none-any.whl", hash = "sha256:b090cdf5ed60bf4c45261be03239c2c1c22df034fbffe691abe93cd80cea01d8"},
    {file = "pytest-7.4.4.tar.gz", hash = "sha256:2cf0005922c6ace4a3e2ec8b4080eb0d9753fdc93107415332f50ce9e7994280"},
]
```

There are lots of thing in the lock file, but here we are only looking at the block for `pytest`. We can verify that we are using version `7.4.4`. If we updated our dependencies and there was, for example, a `7.4.6` version then that version would be installed and referenced here. We can also see file hashes. These are used to actually target a version specifically by hash, making it extremely reliable in reproducing the build.

> **Should I version control my lock file?**
>
> That depends. In general:
> - If you are building an application,
> you will want to version control the lock file because
> it makes building your application more predictable.
> - If you are building a library,
> you do not want to version control the lock file because
> you want the consumers of your library to be able to
> control _their_ lock file.

Now that we've added `pytest`, let's use it!

```sh
poetry run pytest
# no tests ran in 0.00s
```

Great! We have successfully run our test suite of zero tests.

## Adding Tests

First, we have to add a place for our tests.

```sh
mkdir tests
```

Now we create a file to test our `Task`.

```sh
touch tests/test_task.py
```

It is important to note here that I am following `pytest` conventions for naming so `pytest` will pick up our tests automatically. Let's add a dummy test and make sure this works.

### `tests/test_task.py`

```python
def test_it_works():
    assert True == True
```

```sh
poetry run pytest
# tests/test_task.py .
# 1 passed in 0.00s
```

And we have our first passing test! Of course, this test isn't really valuable because it's asserting that `True` is `True`. It will always pass.

## Testing `Task.ls`

Let's add an initial test for listing tasks. This test seems to have the lowest barrier in getting started. So how would we test this? Well, the list command lists out all of the tasks stored in the `todo.txt` file. So, one approach is to have that created.

Suppose that I have the following `todo.txt` file:

```
Buy Milk
```

Here are the results of how `ls` currently behaves:

```sh
poetry run python todo.py ls
# [1] Buy Milk
```

> I'm using `poetry run` here just to be explicit about it. Any time I am using python implicitly, I will add a `poetry shell`. Feel free to work the way you feel comfortable.

So our initial (naiive) implementation of test would look like:

```python
from todo.task import Task

def test_listing_tasks():
    assert Task.ls() == "[1] Buy Milk"
```

Running this gives an error:

```sh
poetry run pytest
# E   ModuleNotFoundError: No module named 'todo'
```

To fix this, add an `__init__.py` file to the tests folder.

```sh
touch tests/__init__.py
```

Running again:

```sh
poetry run pytest
# FAILED tests/test_task.py::test_listing_tasks - AssertionError: assert None == '[1] Buy Milk'
```

Now we have our first real failing test! Maybe failure doesn't sound so great, but recall that **Red** is the first step of TDD. So, a real failing test is more valuable than our previous test. Now, we need to get the test to **Green**. The simplest way to do this is to assert it returns `None`, because that is the current implmentation. However, changing the test to pass seems poor and asserting the value is `None` doesn't really bring value as a test.

In the current implementation, this text is sent to `stdout`. Let's update the test to do that. In `pytest`, we can use fixtures to solve this problem and we are already provided a `capsys` fixture to check system output.

```python
from todo.task import Task

def test_listing_tasks(capsys):
    Task.ls()
    captured = capsys.readouterr()
    assert "[1] Buy Milk" in captured.out
```

```sh
poetry run pytest
# tests/test_task.py .
# 1 passed in 0.00s
```

And we have our first **real** passing test! There are a few issues with this test that we are going to run into soon.

But first, take a look at the structure of our test.

1. It now takes `capsys` as an argument
2. We invoke the system under test 
3. We make a variable to read the output
4. We assert the expected text is present

The next logical place to test is `add`.

## Testing `Task.add`

Before we start testing add, let's review how it works.

First, we call add in this fashion:

```sh
poetry run python todo.py add "Buy Bread"
# Added todo: "Buy Bread"
```

Great! So now we have output we can test for. But what _really_ happened? Recall that we are storing the tasks in a `todo.txt` file. So this command actually appended text to that file. This means our test will have to change our text file, which affects our list test too! This is the problem of dependencies in testing. So, what's the next step? One option is to create another file for testing. However, this doesn't really get rid of the problem if we are still mutating the file on disk. What we really need is a way to _fake_ the file. Right now the details of this implementation are internal to the `Task` class. So, in order to test this effectively, we are going to have to change some of the stucture here. It is actually quite common that you have to _break dependencies_ when wrapping legacy code in tests. Next time, we will break the dependency on the file.

## Key Takeaways

- Add dependencies with `poetry add`
- Run tests using `poetry run pytest`
- Ensure your tests bring value
- TDD lifecyle: Red, Green, Refactor
- Dependencies cause problems in tests, just like they do in code