---
title: "Covering Our To Do App with More Tests"
date: 2024-01-12T11:30:03+00:00
publishdate: 2024-01-12T11:30:03+00:00
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

Now that we have a fake file, we can use it to update our `Task.ls` test before adding the remaining tests.

```python
def test_listing_tasks(capsys):
    fake_file = FakeFile()
    task = Task(fake_file)
    task.ls()
    captured = capsys.readouterr()
    assert "[1] Buy Milk" in captured.out
```

## DRYing Up Tests

Here is what that test would look like after adding the file. But before we do, notice that we have some duplication in our tests. What are we duplicating? The objects that are being created to test. This is an opportunity for using fixtures. First, let's make our fake file a fixture. Here's what our entire test file looks like after that change:

### `tests/test_task.py`

```python
import pytest
from todo.task import Task

class FakeFile:
    def write(self, message: str):
        pass

@pytest.fixture
def task_file():
    return FakeFile()

def test_listing_tasks(task_file, capsys):
    task = Task(task_file)
    task.ls()
    captured = capsys.readouterr()
    assert "[1] Buy Milk" in captured.out


def test_adding_task(task_file, capsys):
    task = Task(task_file)
    task.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out
```

First, we import `pytest`. Then, we decorate a function with `@pytest.fixture` to let pytest know it's a fixture. Last, we add the function name to the tests that need it as a parameter. We have removed some of the duplication in our tests, which makes them more focused on _testing_ and less focused on _setup_.

Notice something else we are duplicating here? The task creation is _also_ something we can more into a fixture:

```python
@pytest.fixture
def task_file():
    return FakeFile()

@pytest.fixture
def task(task_file):
    return Task(task_file)

def test_listing_tasks(task, capsys):
    task.ls()
    captured = capsys.readouterr()
    assert "[1] Buy Milk" in captured.out


def test_adding_task(task, capsys):
    task.add("Buy Bread")
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out
```

Awesome! So fixtures can call other fixtures. For example, our `task` fixture uses our `task_file` fixture. Also, our tasks can ignore `task_file` and just pay attention to the `task` fixture. Let's run our tests:

```sh
poetry run pytest
# tests/test_task.py F.
# FAILED tests/test_task.py::test_listing_tasks - TypeError: Task.ls() takes 0 positional arguments but 1 was given
```

We have one failing test. The reason why this test is failing is because we didn't update the `Task.ls` API. Let's do that next!

> Ponder again on that test failure. Our **test** worked! It alerted us to a problem in our code. Catching the error now allows us to fix it now, rather than discover it in prodution.

```python
def ls(self):
```

Here, we just add the `self` argument to `ls`. Now, `self` is an instance method. In this way, with `add` and `ls`, we are taking steps to transition the `Task` from a dummy wrapper class to a more idiomatic one. Okay, let's run those tests again.

```sh
poetry run pytest
# tests/test_task.py ..
```

And we are back to **Green**!

## Testing `Task.done`

Let's take a quick look at the `done` method before testing:

```python
def done(no):
    try:

        nec()
        no = int(no)
        f = open('done.txt', 'a')
        st = 'x '+str(datetime.datetime.today()).split()[0]+' '+d[no]
        f.write(st)
        f.write("\n")
        f.close()
        print(f"Marked todo #{no} as done.")
        
        with open("todo.txt", "r+") as f:
            lines = f.readlines()
            f.seek(0)
            for i in lines:
                if i.strip('\n') != d[no]:
                    f.write(i)
            f.truncate()
    except:
        print(f"Error: todo #{no} does not exist.")
```

The `done` method has two file dependencies. Well, we know what do here. We can pull those things up into the constructor. We can do this by extracting behavior like we did before. Another way is to write the test using _programming by wishful thinking_.

## Programming by Wishful Thinking

This method is a bit more in-line with a strict adherence to TDD. First, we add the test as we would like to write it:

```python
def test_marking_task_done(task, capsys):
    task.done(1)
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out
```

This test leaves a bit to be desired, but we will refactor out tests step-by-step as we go. Regardless, this is our initial implementation of the test. We are:

- Calling `done` on a `task`
- Verifying that text is in the output

This is similar in form to our other tests. But, we still have a problem. The _other_ file dependency. From the code, we know that's `done.txt`. So we know where our target is; let's take the next step.

```sh
poetry run pytest
# FAILED tests/test_task.py::test_marking_task_done - AssertionError: assert 'Buy Bread' in 'Error: todo #1 does not exist.\n'
```

Still at **Red**. That's okay -- we're defining the API here. Let's mock that `done.txt` file.

```python
@pytest.fixture
def todo_file():
    return FakeFile()

@pytest.fixture
def done_file():
    return FakeFile()

@pytest.fixture
def task(todo_file, done_file):
    return Task(todo_file, done_file)
```

Alright, so we are adding the `done_file` parameter to the constructor. This pulls out another dependency.

> But now I need to pass all these things in!
>
> Yes, but you have control over how you construct them. Also, we know that eventually these parameters will be gone, as they really are a concern of the `TaskList`. The point here is to take legacy Python code and convert it in predictable increments that continue to work.

```sh
poetry run pytest
# tests/test_task.py EEE
```

Now our tests error! Errors are different from failures. Failures happen when a test assertion fails. Errors happen for any reason they would normally happen in Python. Here's ours:

```
ERROR tests/test_task.py::test_listing_tasks - TypeError: Task.__init__() takes 2 positional arguments but 3 were given
ERROR tests/test_task.py::test_adding_task - TypeError: Task.__init__() takes 2 positional arguments but 3 were given
ERROR tests/test_task.py::test_marking_task_done - TypeError: Task.__init__() takes 2 positional arguments but 3 were given
```

So our tests are throwing errors because `Task` is getting the wrong number of arguments. Of course it is; we added that in our test. Let's go update our code to make it pass:

```python
class Task:
    def __init__(self, todo_file, done_file):
        self.file = todo_file
```

Here, we add an argument and update the reference from before.

```sh
poetry run pytest
# tests/test_task.py ..F
# FAILED tests/test_task.py::test_marking_task_done - AssertionError: assert 'Buy Bread' in 'Error: todo #1 does not exist.\n'
```

We are back to **Red**, but with failures instead of errors. This is great! Now, let's add an implementation to get this to **Green**!

```python
class Task:
    def __init__(self, todo_file, done_file):
        self.todo_file = todo_file
        self.done_file = done_file

    def add(self, s):
        self.todo_file.write(s)
        self.todo_file.write("\n")
        s = '"'+s+'"'
        print(f"Added todo: {s}")

    def done(self, no):
        try:

            nec()
            no = int(no)
            st = 'x '+str(datetime.datetime.today()).split()[0]+' '+d[no]
            self.done_file.write(st)
            self.done_file.write("\n")
            print(f"Marked todo #{no} as done.")

            ...
```

```sh
poetry run pytest
# FAILED tests/test_task.py::test_marking_task_done - AssertionError: assert 'Buy Bread' in 'Error: todo #1 does not exist.\n'
```

Still at **Red**. 🤔

Why? Because in this case we are `read`ing from our fake `todo.txt` file in order to `write` to our fake `done.txt` file. But we never defined `write` on our `FakeFile` class. We could do this, but there are a few methods we will have to fake. It seems our custom stub is not enough to support our testing needs. So, we need to turn this into a mock. We'll do that next time!

## Key Takeaways

- Use fixtures to set up objects for tests
- Keep tests focused on only the test
- Code design can be driven from the top using tests (this is TDD!)
- Take note of how much more confident we are in the state of our code at every step