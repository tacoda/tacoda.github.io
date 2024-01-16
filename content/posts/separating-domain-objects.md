---
title: "Separating Domain Objects"
date: 2024-01-16T11:30:03+00:00
publishdate: 2024-01-16T11:30:03+00:00
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

Before we continue, let's do a quick recap of the current state of our code.

### `todo.py`

```python
import sys
from todo.task import Task


if __name__ == '__main__':
    args = sys.argv
    if(args[1] == 'add'):
        if(len(args[2:]) == 0):
            sys.stdout.buffer.write(
                "Error: Missing todo string. Nothing added!".encode('utf8'))
        else:
            with open('todo.txt', 'a') as f:
                    task = Task(f)
                    task.add(''.join(args[2:]))

    elif(args[1] == 'done' and len(args[2:]) == 0):
        if(len(args[2:]) == 0):
            sys.stdout.buffer.write(
                "Error: Missing NUMBER for marking todo as done.".encode('utf8'))
        else:
            Task.done(args[2:])

    elif(args[1] == 'del' and len(args[2:]) == 0):
        if(len(args[2:]) == 0):
            sys.stdout.buffer.write(
                "Error: Missing NUMBER for deleting todo.".encode('utf8'))
        else:
            Task.deL(args[2])

    elif(args[1] == 'ls'):
        Task.ls()
```

### `todo/task.py`

```python
import sys
import datetime

d = {}
don = {}

class Task:
    def __init__(self, todo_file, done_file):
        self.todo_file = todo_file
        self.done_file = done_file

    def add(self, s):
        self.todo_file.write(s)
        self.todo_file.write("\n")
        s = '"'+s+'"'
        print(f"Added todo: {s}")

    def help():
        sa = """Usage :-
    $ ./todo add "todo item" # Add a new todo
    $ ./todo ls			 # Show remaining todos
    $ ./todo del NUMBER	 # Delete a todo
    $ ./todo done NUMBER	 # Complete a todo
    $ ./todo help			 # Show usage
    $ ./todo report		 # Statistics"""
        sys.stdout.buffer.write(sa.encode('utf8'))

    def ls(self):
        try:

            Task.nec()
            l = len(d)
            k = l

            for i in d:
                sys.stdout.buffer.write(f"[{l}] {d[l]}".encode('utf8'))
                sys.stdout.buffer.write("\n".encode('utf8'))
                l = l-1

        except Exception as e:
            raise e

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

    def done(self, no):
        try:

            nec()
            no = int(no)
            st = 'x '+str(datetime.datetime.today()).split()[0]+' '+d[no]
            self.done_file.write(st)
            self.done_file.write("\n")
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

    def report():
        nec()
        try:

            nf = open('done.txt', 'r')
            c = 1
            for line in nf:
                line = line.strip('\n')
                don.update({c: line})
                c = c+1
            print(
                f'{str(datetime.datetime.today()).split()[0]} Pending : {len(d)} Completed : {len(don)}')
        except:
            print(
                f'{str(datetime.datetime.today()).split()[0]} Pending : {len(d)} Completed : {len(don)}')

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

### `tests/test_task.py`


```python
import pytest
from unittest.mock import mock_open, patch
from todo.task import Task

# Skipping this test until we finish re-organizing
@pytest.mark.skip
def test_marking_task_done(task, capsys):
    task.done(1)
    captured = capsys.readouterr()
    assert "Buy Bread" in captured.out

```

### `tests/test_task_list.py`

```python
import pytest
from unittest.mock import mock_open, patch
from todo.task_list import TaskList

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

def test_listing_tasks(todo_file, capsys):
    with todo_file:
        with open('todo.txt', 'a') as todo:
            with open('done.txt', 'a') as done:
                task_list = TaskList(todo, done)
                task_list.ls()
    captured = capsys.readouterr()
    assert "[1] Buy Milk" in captured.out
```

And if we run tests:

```sh
poetry run pytest
# tests/test_task.py s
# tests/test_task_list.py ..
```

## Separating Domain Objects

So let's continue to separate our domain objects. What do I mean by this? When I refer to your _domain_, I mean the domain of the product that you are building. We are building a todo app, so that's our domain here. Our domain consists of:

- A task list
- Tasks

And any other concepts that may be helpful to us, such as:

- Projects
- Tags
- Priority

What is **not** in our domain is also vitally important. Our domain does **not** include:

- Files
- Databases
- Network

Or any other third-party _dependencies_.

Separating domain objects is simply splitting them up. In our case, `Task` does way too much. It is also doing the work of a `TaskList`. So, in accordance with the **single responsibility principle**, we should separate this.

Currently, we are separating the `Task` from the `TaskList`. Let's start with `add`. Right now, our test for adding to a task list is passing. Although, it is not a good test. We also have some stubbed code in our implementation just to make the test pass. Let's take the next step and promote the `add` behavior from the `Task` to the `TaskList`.

First, just move the implementation:

```python
class TaskList:
    def __init__(self, todo_file, done_file):
        pass

    def add(self, task_description):
        self.todo_file.write(s)
        self.todo_file.write("\n")
        s = '"' + s + '"'
        print(f"Added todo: {s}")
```

And if we run tests:

```sh
poetry run pytest
# E       AttributeError: 'TaskList' object has no attribute 'todo_file'
```

Here, we get an error. We are referring to a `todo_file` that we never assigned. Update the constructor:

```python
class TaskList:
    def __init__(self, todo_file, done_file):
        self.todo_file = todo_file

    def add(self, task_description):
        self.todo_file.write(s)
        self.todo_file.write("\n")
        s = '"' + s + '"'
        print(f"Added todo: {s}")
```

Running tests again:

```sh
poetry run pytest
# E       UnboundLocalError: cannot access local variable 's' where it is not associated with a value
```

Our copied code still references an old variable. Let's update that reference.

```python
class TaskList:
    def __init__(self, todo_file, done_file):
        self.todo_file = todo_file

    def add(self, task_description):
        self.todo_file.write(task_description)
        self.todo_file.write("\n")
        s = '"' + task_description + '"'
        print(f"Added todo: {s}")
```

Running tests again:

```sh
poetry run pytest
# tests/test_task_list.py ..
```

And they pass!

> As a side note, did you notice how many things we had to change from copy-pasting code? This is one of the main reasons why doing that can be problematic. Even worse, if your codebase happens to be untested then it's likely you'll find it in production as a bug.

Now we can delete the `Task.add` method entirely. Running the tests again verifies that this does not break our implmentation.

Next up is `Task.ls`. Here's the method that we will move:

```python
def ls(self):
    try:

        Task.nec()
        l = len(d)
        k = l

        for i in d:
            sys.stdout.buffer.write(f"[{l}] {d[l]}".encode('utf8'))
            sys.stdout.buffer.write("\n".encode('utf8'))
            l = l-1

    except Exception as e:
        raise e
```

Notice the call to `Task.nec`? We'll have to bring that along. Also notice the references to `d`. Those are legacy references from the previous implementation. Here's what `Task.nec` looks like.

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

Now based on the amount of code we have to move _and_ the fact that it depends on global variables, it doesn't even seem worth it to copy-paste. So, let's take a more intentional first step.

First, let's just delete `Task.ls` entirely. Then we run tests again.

```sh
poetry run pytest
# tests/test_task_list.py ..
```

Huh? They are green? Take a look at the tests again. We are no longer testing `Task.ls`. Instead we are testing `TaskList.ls`. This gives us more confidence moving forward. Now let's update the implementation. We'll do basically the same thing as add, but instead of appending to a file, we'll read a file.

```python
def ls(self):
    lines = self.todo_file.readlines()
    for i in lines:
        print(i.strip())
```

Running tests:

```sh
poetry run pytest
# FAILED tests/test_task_list.py::test_listing_tasks - AssertionError: assert '[1] Buy Milk' in ''
```

Now our test is giving us a proper failure. We are no longer just printing something to make it pass. So why is it failing? Well, the assertion is expecting `[1] Buy Milk`, but it's getting nothing. Why? Because we are mocking the file, so there's no content. Let's make the mock return that.

### `tests/test_task_list.py`

```python
@pytest.fixture
def todo_file():
    mock = mock_open(read_data='[1] Buy Milk')
    return patch('{}.open'.format(__name__), mock, create=True)
```

We have just added a `read_data` option to predefine the content of our mocked file. Now let's run tests again.

```sh
poetry run pytest
# tests/test_task_list.py .. 
```

And we are back to **Green**! Next up, we are going to move more methods into the `TaskList` and address how to clean up our tests in `test_task_list.py`

## Key Takeaways

- Separate domain objects so they have a **single responsiblity**
- Avoid copy-pasting code; it leads to bugs
- Use tests and domain-level thinking to define domain concepts in your code
    - This allows you to focus on what is important, rather than what is incidental