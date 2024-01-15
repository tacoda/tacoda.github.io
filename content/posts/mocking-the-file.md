---
title: "Mocking the File"
date: 2024-01-15T11:30:03+00:00
publishdate: 2024-01-15T11:30:03+00:00
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

Last time, we discovered that we needed a more robust testing object for our file dependency.

Why? Because in our test we are `read`ing from our fake `todo.txt` file in order to `write` to our fake `done.txt` file. But we never defined `write` on our `FakeFile` class. We have a few options here.

First, we could just add another _method stub_ to our `FakeFile`. But, as discussed before, this becomes hard to scale as we grow our test suite. What do I mean when I say _method stub_? I'm referring to this:

```python
class FakeFile:
    def write(self, message):
        pass
```

Notice that the `write` method will override the behavior of writing a real file. It just doesn't do anything. In this way, `write` is a _method stub_. It's a method that we stub out for our testing purposes that does nothing. What's the point? So we don't have to write to a real file.

But we've seen this is not enough. Instead of adding another method for `read`, let's mock the file. How is mocking different? Mocking will allow us to define custom behavior. This allows us to test more effectively, because we can easily setup the environment necessary before running the test.

> Is this overkill? This is a lot of work to fake a file.
>
> This may seem like a lot of work, but it's actually making our tests, and our code, more predictable and easier to change. If you can get away without a mock, you usually want to do so. The thing that makes a file a good candidate to mock is that it is I/O. Good candidates to mock in your tests usually lie at the boundaries of your domain code. When you see I/O, this is a dead giveaway.
>
> Here are more examples of useful things to mock when testing:
> - Files
> - Databases
> - Network Traffic
> - APIs and Services

> If I fake all of my assets, how do I know my code will work?
>
> Because fake data supports real tests. Real tests exercise real code. The focus of your tests should be your domain code. If you depend on files for your implmentation, then you are suddenly testing two things: your domain code and files.

## Adding a Mock

Add the `pytest-mock` library.

```sh
poetry add pytest-mock
```

Import everything into the test file.

```python
from unittest.mock import Mock
```

Normally, we would do something like the following to use `Mock`.

```python
@pytest.fixture
def todo_file(mocker):
    mock = Mock()
    mocker.patch('open', return_value=mock)
    return mock
```

However, this will return an error. Because we are mocking the built-in function `open`, we need to use the library a little different. As a matter of fact, it has a specific API for doing this.

First, we update the import to get the functions we need.

```python
from unittest.mock import mock_open, patch
```

Now let's update the fixture.

```python
@pytest.fixture
def todo_file():
    mock = mock_open()
    return patch('{}.open'.format(__name__), mock, create=True)
```

Run the tests.

```sh
poetry run pytest
# tests/test_task.py .FF
```

We end up with two failures, but that's okay. Look at the messages.

```
FAILED tests/test_task.py::test_adding_task - AttributeError: '_patch' object has no attribute 'write'
FAILED tests/test_task.py::test_marking_task_done - AssertionError: assert 'Buy Bread' in 'Error: todo #1 does not exist.\n'
```

Here we have two issues. First, we are not mocking the `write` method. First, let's focus on only the `test_adding_task` test. Here's a quick test:

```python
def test_adding_task(todo_file, capsys):
    with todo_file:
        with open('todo.txt', 'a') as f:
            task = Task(f, f)
            task.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out
```

Notice how ugly things have gotten in our test? This is a _code smell_. Why did this happen? Because `add`ing a task doesn't really belong to a `Task`, but a `TaskList`. As a consequence, there is a lot of setup that we have to do in the test to make the test use the correct file. Really, this test should be testing a `TaskList`.

To show that this is actually an organization problem, and not a lexical one, let's update the test for listing tasks:

```python
def test_listing_tasks(todo_file, capsys):
    with todo_file:
        with open('todo.txt', 'a') as f:
            task = Task(f, f)
            task.ls()
    captured = capsys.readouterr()
    assert "[1] Buy Milk" in captured.out
```

Again, notice the extra boilerplate. We _could_ DRY up the duplication, but both of these tests are telling us to test this functionality at a higher level. So let's do that.

## Moving Behavior to the TaskList

Make test test file.

```sh
touch tests/test_task_list.py
```

### `tests/test_task_list.py`

```python
import pytest
from unittest.mock import mock_open, patch

@pytest.fixture
def todo_file():
    mock = mock_open()
    return patch('{}.open'.format(__name__), mock, create=True)

def test_adding_task_to_list(todo_file, capsys):
    with todo_file:
        with open('todo.txt', 'a') as todo:
            with open('done.txt', 'a') as done:
                task_list = TaskList(todo, done)
                task_list.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out
```

Let's run only this test suite:

```sh
poetry run pytest tests/test_task_list.py
# FAILED tests/test_task_list.py::test_adding_task_to_list - NameError: name 'TaskList' is not defined
```

We did not yet define the class, so let's do that.

```sh
touch todo/task_list.py
```

### `todo/task_list.py`

```python
class TaskList:
    pass
```

And then we add an import in the test.

```python
from todo.task_list import TaskList
```

Let's run tests again.

```sh
poetry run pytest tests/test_task_list.py
# FAILED tests/test_task_list.py::test_adding_task_to_list - TypeError: TaskList() takes no arguments
```

Progress! Now the test is failing because `TaskList` doesn't accept the correct number of arguments. Let's fix that.

### `todo/task_list.py`

```python
class TaskList:
    def __init__(self, todo_file, done_file):
        pass
```

Let's run tests again.

```sh
poetry run pytest tests/test_task_list.py
# FAILED tests/test_task_list.py::test_adding_task_to_list - AttributeError: 'TaskList' object has no attribute 'add'
```

Now we are failing because we do not have an `add` method implemented. Let's add that.


### `todo/task_list.py`

```python
class TaskList:
    def __init__(self, todo_file, done_file):
        pass

    def add(self, task_description):
        pass
```

Let's run tests again.

```sh
poetry run pytest tests/test_task_list.py
# FAILED tests/test_task_list.py::test_adding_task_to_list - AssertionError: assert 'Buy Bread' in ''
```

Now we are failing because the assertion is not true. That is, the test is properly failing. So let's move the test to **Green**. To do this, let's embrace TDD and just make it pass.

### `todo/task_list.py`

```python
class TaskList:
    def __init__(self, todo_file, done_file):
        pass

    def add(self, task_description):
        print('Buy Bread')
```

Let's run tests again.

```sh
poetry run pytest tests/test_task_list.py
# tests/test_task_list.py .
```

And we are **Green**! Now, we should refactor, but we'll hold off for now. We have work to do in the `TaskList` first.

Let's move the last relevant test to `test_task_list.py`.

### `todo/task_list.py`

```python
class TaskList:
    def __init__(self, todo_file, done_file):
        pass

    def add(self, task_description):
        print('Buy Bread')

    def ls(self):
        pass
```

Run those tests!

```sh
poetry run pytest tests/test_task_list.py
# tests/test_task_list.py .F
# FAILED tests/test_task_list.py::test_listing_tasks - AssertionError: assert '[1] Buy Milk' in ''
```

Same thing here. We just need to update the result. Let's make this one go **Green**!

### `todo/task_list.py`

```python
class TaskList:
    def __init__(self, todo_file, done_file):
        pass

    def add(self, task_description):
        print('Buy Bread')

    def ls(self):
        print('[1] Buy Milk')
```

```sh
poetry run pytest tests/test_task_list.py
# tests/test_task_list.py .. 
```

Awesome! We now have green tests, but they are cosmetic. So, next up we will connect those tests to real code, deal with more mocking and test organization

## Key Takeaways

- Mock dependencies at the boundaries of your domain code
- If tests start to get complex, ask yourself if it belongs there
- Don't be afraid to refactor tests -- they are code too
- Fake data supports real tests