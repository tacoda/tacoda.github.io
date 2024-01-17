---
title: "Refactoring Our Tests"
date: 2024-01-17T11:30:03+00:00
publishdate: 2024-01-17T11:30:03+00:00
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

Now that we have green tests, we can keep promoting methods from `Task` to `TaskList`. But before we do, let's do a little investigation and consider our tests.

## Task Deletion

Following is the current implementation of deleting a task. Again, deleting a task is something that this list should do.

```python
def deL(no):
    try:
        no = int(no)
        Task.nec()
        with open("todo.txt", "r+") as f:
            lines = f.readlines()
            f.seek(0)
            for i in lines:
                if i.strip('\n') != d[no]:
                    f.write(i)
            f.truncate()
        print(f"Deleted todo #{no}")

    except Exception as e:
        print(f"Error: todo #{no} does not exist. Nothing deleted.")
```

Notice the call to `Task.nec`. This is the second time we've run into this. What is it?

```python
def nec():
    try:
        f = open('todo.txt', 'r')
        c = 1
        for line in f:
            line = line.strip('\n')
            d.update({c: line})
            c = c+1
    except:
        sys.stdout.buffer.write("There are no pending todos!".encode('utf8'))
```

Honestly, I'm not sure what `nec` is referencing. This is a naming issue. So what is this method doing? Well, it:

- Opens the todo file
- Updates the (global) dictionary with each line from the file, with the new line stripped off
- Writes a message to `stdout` if anything goes wrong

So what is it actually doing? It seems like it's just state management. We don't need this anymore if we aren't going to use a global. Also, this is very close to using exceptions for flow control. In general, this is not a good idea. However, sometimes it _does_ makes sense. For example, if the file does not exist. Okay, let's hop back to deleting tasks.

First, let's give this a better name. `deL` is just a shortened version of `delete`. Make sure not to use `del`, as that is a Python keyword (and likely the reason this method is named slightly different).

Also, take note that `deL` takes a `no` (number) argument. `todo.txt` refers to tasks by number, so we need to pass that in. What is the number? It's the line number! Recall the assertion from our last implmented test:

```python
assert "[1] Buy Milk" in captured.out
```

Remember how I said this test wasn't that good? One of the issues here is that it is expecting the wrong string. It's assuming that `Buy Milk` is the first task in the file. We can even see this evidenced in the mock, as we had to do the following:

```python
mock = mock_open(read_data='[1] Buy Milk')
```

In our real `todo.txt` file, there is no number. Instead the content is just `Buy Milk`. So, we really should update our test data here. This will also force us to implement the task numbering so we can refer to it in other places.

## Considering Our Tests

Let's ask ourselves the bigger question: are we testing the right thing? Perhaps not. We are invoking our system under test and asserting that it works based on output to `stdout`. It is not testing anything about the logical consequences of the test. In a case like `list`, checking for `stdout` seems fine -- and testing the correct message is sent to `stdout` _is_ a valid test.

What about `add`? Here there _is_ something we can test. We can test that if we add a task to the task list, then that item is now in the task list. We could do this by either:

- Asserting the last task in the task list is the task that was added
- Asserting that the length of the task list increases by one

## Refactoring Our Tests

Yes, because tests are code, they too can be refactored. And DRY matters with tests too! Let's clean some of this up so we can easily add our remaining methods and complete separating our domain objects.

Here is the current state of our tests for `TaskList`. There is quite a bit of duplication that is obvious, so let's start there.

```python
@pytest.fixture
def todo_file():
    mock = mock_open(read_data='[1] Buy Milk')
    return patch('{}.open'.format(__name__), mock, create=True)

def test_adding_task_to_list(todo_file, capsys):
    with todo_file:
        with open('todo.txt', 'a') as todo:
            with open('done.txt', 'a') as done:
                task_list = TaskList(todo, done)
                task_list.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out


def test_listing_tasks(todo_file, capsys):
    with todo_file:
        with open('todo.txt', 'a') as todo:
            with open('done.txt', 'a') as done:
                task_list = TaskList(todo, done)
                task_list.ls()
    captured = capsys.readouterr()
    assert "[1] Buy Milk" in captured.out
```

First, let's take note that the `todo_file` fixture is also being used for `done.txt`, so let's rename that.

```python
@pytest.fixture
def fake_file():
    mock = mock_open(read_data='[1] Buy Milk')
    return patch('{}.open'.format(__name__), mock, create=True)


def test_adding_task_to_list(fake_file, capsys):
    with fake_file:
        with open('todo.txt', 'a') as todo:
            with open('done.txt', 'a') as done:
                task_list = TaskList(todo, done)
                task_list.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out


def test_listing_tasks(fake_file, capsys):
    with fake_file:
        with open('todo.txt', 'a') as todo:
            with open('done.txt', 'a') as done:
                task_list = TaskList(todo, done)
                task_list.ls()
    captured = capsys.readouterr()
    assert "[1] Buy Milk" in captured.out
```

Running tests:

```sh
poetry run pytest
# tests/test_task_list.py ..
```

Okay, now let's dry up the `TaskList` into its own fixture.

```python
@pytest.fixture
def fake_file():
    mock = mock_open(read_data='[1] Buy Milk')
    return patch('{}.open'.format(__name__), mock, create=True)

@pytest.fixture
def task_list(fake_file):
    with fake_file:
        with open('todo.txt', 'a') as todo:
            with open('done.txt', 'a') as done:
                return TaskList(todo, done)

def test_adding_task_to_list(task_list, capsys):
    task_list.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out


def test_listing_tasks(task_list, capsys):
    task_list.ls()
    captured = capsys.readouterr()
    assert "[1] Buy Milk" in captured.out
```

Running tests again:

```sh
poetry run pytest
# tests/test_task_list.py ..
```

Let's also remove the task numbering. We'll address that soon.

```python
@pytest.fixture
def fake_file():
    mock = mock_open(read_data='Buy Milk')
    return patch('{}.open'.format(__name__), mock, create=True)


@pytest.fixture
def task_list(fake_file):
    with fake_file:
        with open('todo.txt', 'a') as todo:
            with open('done.txt', 'a') as done:
                return TaskList(todo, done)


def test_adding_task_to_list(task_list, capsys):
    task_list.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out


def test_listing_tasks(task_list, capsys):
    task_list.ls()
    captured = capsys.readouterr()
    assert "Buy Milk" in captured.out
```

Running tests again:

```sh
poetry run pytest
# tests/test_task.py s
# tests/test_task_list.py ..
```

Great! Also note that I've pointed out above that we are skipping the `Task` test for now. I'm intentionally doing this to focus on the `TaskList`. To do this, I just added a pytest mark to that test. Here's what that looks like:

```python
@pytest.mark.skip
def test_marking_task_done(task, capsys):
    task.done(1)
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out
```

Since we have marked the test to be skipped, pytest will happily skip it and report it in our test as `s`. So now let's get a little more information from out tests. Run them with a `-v` flag.

```sh
poetry run pytest
# tests/test_task.py::test_marking_task_done SKIPPED (unconditional skip)
# tests/test_task_list.py::test_adding_task_to_list PASSED
# tests/test_task_list.py::test_listing_tasks PASSED
```

Note that we get an output of our test method names. This is great, but it would be even better if they read like sentences.

> Naming matters! It's one of the hard problems in programming; don't take it lightly -- even with tests.

Let's rename those tests to be more descriptive.

```python
@pytest.fixture
def fake_file():
    mock = mock_open(read_data='Buy Milk')
    return patch('{}.open'.format(__name__), mock, create=True)


@pytest.fixture
def task_list(fake_file):
    with fake_file:
        with open('todo.txt', 'a') as todo:
            with open('done.txt', 'a') as done:
                return TaskList(todo, done)


def test_adding_a_task_displays_output(task_list, capsys):
    task_list.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out


def test_listing_tasks_displays_output(task_list, capsys):
    task_list.ls()
    captured = capsys.readouterr()
    assert "Buy Milk" in captured.out
```

Run tests with `-v` again:

```sh
poetry run pytest -v
# tests/test_task.py::test_marking_task_done SKIPPED (unconditional skip)]
# tests/test_task_list.py::test_adding_a_task_displays_output PASSED
# tests/test_task_list.py::test_listing_tasks_displays_output PASSED 
```

Now our tests are much more descriptive. What's the benefit. Now I can just read my tests and I know what they are tests. These descriptions are better, but they are still not quite english-like. We are going to extend that soon.

This also allows us to easily add our other cases.

```python
@pytest.fixture
def fake_file():
    mock = mock_open(read_data='Buy Milk')
    return patch('{}.open'.format(__name__), mock, create=True)


@pytest.fixture
def task_list(fake_file):
    with fake_file:
        with open('todo.txt', 'a') as todo:
            with open('done.txt', 'a') as done:
                return TaskList(todo, done)


def test_adding_a_task_displays_output(task_list, capsys):
    task_list.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out


def test_adding_a_task_increases_list_size(task_list):
    before = len(task_list.all())
    task_list.add("Buy Bread")
    after = len(task_list.all())
    assert after == before + 1


def test_adding_a_task_appends_that_task(task_list):
    task_list.add("Buy Bread")
    task = task_list.all()
    assert "Buy Bread" == task.description


def test_listing_tasks_displays_output(task_list, capsys):
    task_list.ls()
    captured = capsys.readouterr()
    assert "Buy Milk" in captured.out
```

Adding these tests does cause errors and failures, but this is the direction that we are heading. Before we do, notice that our tests are now named well, organized well, and are more focused on the system under test.

## Key Takeaways

- It's helpful to consider what _should_ be tested when ensuring test coverage
    - Ask yourself: _Am I testing the right thing?_
- Naming matters
- Tests are code too -- don't be afraid to change them