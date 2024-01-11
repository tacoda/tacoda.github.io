---
title: "Breaking the File Dependency"
date: 2024-01-11T11:30:03+00:00
publishdate: 2024-01-11T11:30:03+00:00
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

In the last post, we ran into a problem with the file dependency. A little foresight also indicated that this will become a bigger problem as we go.

What we really need is a way to _fake_ the file. Right now the details of this implementation are internal to the `Task` class. So, in order to test this effectively, we are going to have to change some things. Let's get started!

### `todo/task.py`

```python
class Task:
    def add(s):
        f = open('todo.txt', 'a')
        f.write(s)
        f.write("\n")
        f.close()
        s = '"'+s+'"'
        print(f"Added todo: {s}")
```

This portion of the `Task` is the `add` method that we are interested in testing. Notice on the first line in the method, we are direction opening the file. This file, it follows, is a _dependency_ of this method. That is, `add` depends on the `todo.txt` file. The problem is that we do not have an _enabling point_ to use to inject custom behavior (which is what we want for the test).

## Pulling Behavior Up

Now, we could pass in the filename to the `add` method. That would give us an enabling point, but it still suffers from the problem that it's looking at a file on disk. It also affects our API in a suboptimal way.

> In this context, by API I mean the application programming interface. Namely, the way the method is called. Adding the filename would change our API from:
> `Task.add('Buy Milk')` to: `Task.add('Buy Milk', 'todo.txt')`.

As a matter of design, it also associates a unexpected parameter with a basic function of a task. How can we accomplish this in a better way? We _could_ use the constructor:

```python
class Task:
    def __init__(self, filename: str):
        self.f = open(filename, 'a')

    def add(self, s):
        self.f.write(s)
        self.f.write("\n")
        self.f.close()
        s = '"'+s+'"'
        print(f"Added todo: {s}")
```

In this method, we pass the filename into the constructor. This gives us our enabling point: I can construct a `Task` with a different filename. This still isn't ideal, but that's the process that we are working through right now. We are pulling behavior up step-by-step.

## Breaking the Dependency

When I refer to _pulling behavior up_, I mean up in the call stack. To be concrete, the file behavior now happens _before_ we call add, when we construct the `Task`. Unfortunately, we are still tied to the filesystem. How do we fix this? By changing our input:

### `todo/task.py`

```python
class Task:
    def __init__(self, file):
        self.file = file

    def add(self, s):
        self.file.write(s)
        self.file.write("\n")
        s = '"'+s+'"'
        print(f"Added todo: {s}")
```

Here is how our client code would be affected:

### `todo.py`

```python
with open('todo.txt', 'a') as f:
    task = Task(f)
    task.add(''.join(args[2:]))
```

More progress! We have pulled the dependency out of the `Task` class (in this scenario). What is the advantage? Well, now we can inject our own file when testing. We _could_ use a test file. But, that file dependency re-introduces the problem -- that tests could affect each other by changing the file on disk. So what's the solution? Fake the file using a Python object.

## Stubbing Out a Fake File

For testing purposes, we'll need a fake file. To do that, we will have to create our own class that responds to the same interface as the file. Actually, right now we only care about writing, because that is the only method being invoked on the file in the method.

```python
class FakeFile:
    pass
```

Starting from a blank implementation, as we have before. Now, let's fake the `write` interface.

```python
class FakeFile:
    def write(self, message: str):
        pass
```

Now we can use this stub in our tests! Let's add our test for `Task.add`:

### `tests/test_task.py`

```python
def test_adding_task(capsys):
    fake_file = FakeFile()
    task = Task(fake_file)
    task.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out
```

```sh
poetry run pytest
# tests/test_task.py ..
# 2 passed in 0.01s
```

And it passes! So we have:

- Broken the file dependency
- Faked the file to test our `add` method
- Passed in the file into the constructor in the client code

This may seem a little suspect. So, if you're like me, you'll want to see this fail too. Let's make that happen. Let's break it in the simplest possible way. We'll just update the expectation.


```python
def test_adding_task(capsys):
    fake_file = FakeFile()
    task = Task(fake_file)
    task.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Sell Bread" in captured.out
```

```sh
poetry run pytest
# FAILED tests/test_task.py::test_adding_task - assert 'Sell Bread' in 'Added todo: "Buy Bread"\n'
```

And we get a failure. Now we can feel more confident that this test gives us meaningful feedback. Swap the expectation back and run tests again to verify we are back to **Green**.

```python
def test_adding_task(capsys):
    fake_file = FakeFile()
    task = Task(fake_file)
    task.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out
```

```sh
poetry run pytest
# tests/test_task.py ..
# 2 passed in 0.01s
```

Okay, here's the best part: running this test does **not** change the file on disk, because it's just using the fake object. This makes our tests:

- Focused on our domain
- Less brittle
- Independent of the file system

Next time, we will update the `Task.ls` test to use the fake file and then write the remainder of the tests needed for `Task`. You may have noticed a lot of this functionality doesn't really belong in `Task` -- you're right, it should be in `TaskList`. We'll create those objects and tests iteratively as we continue.

## Key Takeaways

- Break dependencies by pulling them up into the constructor
- Pass in those dependencies in client code
- Create fake dependencies for your tests