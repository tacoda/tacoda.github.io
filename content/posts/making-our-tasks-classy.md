---
title: "Making Our Tasks Classy"
date: 2024-01-09T15:30:03+00:00
publishdate: 2024-01-09T15:30:03+00:00
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

The next thing we will do is define the idea of a task using a class. Why do we want to do this? Quite a few reasons:

- Python is an object-oriented language
- Abstractions help us understand things as humans
- It will be easier to test

To start, we will append the new class in `todo/task.py`:

```python
class Task:
    pass
```

This is a minimal implementation of the `Task`. `pass` tells the Python interpreter to do nothing. Without this, Python will fail because it is expected an indented body.

Normally we would want to add tests around this, but our app is not quite in a place to make that easy to do. So before writing any code here, we should think about how we _want_ to interact with something. I call this _programming by wishful thinking_ and is something I picked up while learning Scheme many years ago. Later, when we add tests, we will verify this wishful thinking with tests.

## Task

A task can be added, deleted, and marked done. But two of these are actually operations for a list of tasks: namely adding and deleting. To keep our task simple, let's try to keep it focused only on what is relevant to the task. That is, we want `Task` to have a **single responsibility**.

First, `Task` has a description. This description will be something like `"Buy Milk"`. Also, a task can be marked done. Currently, this is done using a number which identifies the task. This is actually a list operation, and the naiive implementation for done is a boolean. Let's start by adding the description to the constructor:

```python
class Task:
    def __init__(self, description: str):
        self.description = description
        self.done = False

task = Task('Buy Milk')
print(task)
# <todo.task.Task object at 0x10276a270>
```

Here we have defined a constructor with `__init__`. In addition to `self`, the constructor will require a description parameter, which we have type-hinted to be a `str`. Inside the constructor, we assign the description and set `done` to `False`. To test this, we have a line to create a new task and print it. The output is a description of the object, which we will clean up later to be more user-friendly.

So far, the only operation that really belongs to a task, is marking it done. So, let's add that method.

```python
class Task:
    def __init__(self, description: str):
        self.description = description
        self.done = False

    def mark_done(self):
        self.done = True

task = Task('Buy Milk')
print(task.done)
# False
task.mark_done()
print(task.done)
# True
```

Adding a `mark_done` method here will allow us to use this in our client code (the code that deals with arguments). This concludes the basic functionality that we need for a task. But we are not done! Remember those other functions that didn't really belong to a task? What _should_ they belong to?

## Task List

The remaining operations in our to do app are really managing a list of tasks. So, let's go through the same exercise, but for `TaskList`.

```python
class TaskList:
    pass
```

Tasks can be added, listed, and deleted from a Task List. We will leave the report aside for the time being. We _could_ simply use a Python list for this. However, we are wrapping these in objects to ensure that we are programming in our domain instead. As we do more with objects, we will revisit this idea in more depth.

We will start with the constructor again. What _should_ it do?

```python
class TaskList:
    def __init__(self):
        self.tasks = []
```

Here, the `TaskList` starts with an empty list. The next simplest problem is listing the tasks. Since Python's attributes are public, we can just use `task_list.tasks` for this. The problem with this is that it requires accessing the property directly and it isn't very descriptive from the client code perspective. So, we will just add a simple getter method to wrap it in a more intuitive interface.

```python
class TaskList:
    def __init__(self):
        self.tasks = []
    
    def list(self):
        return self.tasks
```

Now, the client code can list all the tasks in the task list by calling `task_list.list()`. Next up, we need a way to add tasks to the task list.

```python
class TaskList:
    def __init__(self):
        self.tasks = []
    
    def list(self):
        return self.tasks
    
    def add(self, task: Task):
        self.tasks.append(task)
```

Here we are type-hinting the `Task`, so we have some nice type-checking around our interface. With this in place, we could not add something else, like a string, to the Task List by accident (as long as we're using this interface).

The last two pieces of functionality currently rely upon a numerical index. So we will keep this implementation simple for now and revisit that later when we update the client code.

```python
class TaskList:
    def __init__(self):
        self.tasks = []
    
    def list(self):
        return self.tasks
    
    def add(self, task: Task):
        self.tasks.append(task)

    def delete(self, index: int):
        del self.tasks[index - 1]

    def mark_done(self, index: int):
        task = self.tasks[index - 1]
        task.mark_done()
```

There are some problems with our current design, but we will run into them as we go. This will be a good exercise in testing, but sometimes getting started with a simple implmentation is the lowest amount of friction.

Now that we have our new classes, the next step is to break them out into their own files and then use them in the client code. We'll do this soon to find out what problems we run into.

## Wrapping Up

This was a nice exercise in figuring out what our API should be. This is important because it gives us direction. But, at the end of the day, we still need working software. So let's just wrap all of this task behavior into a class and use it in the client code.

### `todo/task.py`

```python
import sys
import datetime

class Task:
    def add(s):
        f = open('todo.txt', 'a')
        f.write(s)
        f.write("\n")
        f.close()
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


    def ls():
        try:

            nec()
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
            nec()
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

### `todo.py`

```python
import sys
from todo.task import Task


if __name__ == '__main__':
    try:
        args = sys.argv
        if(args[1] == 'add'):
            if(len(args[2:]) == 0):
                sys.stdout.buffer.write(
                    "Error: Missing todo string. Nothing added!".encode('utf8'))
            else:
                Task.add(args[2:])

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
                Task.deL(args[2:])

    except Exception:
        Task.help()
```

```sh
python todo.py

# Usage :-
# $ ./todo add "todo item" # Add a new todo
# $ ./todo ls			 # Show remaining todos
# $ ./todo del NUMBER	 # Delete a todo
# $ ./todo done NUMBER	 # Complete a todo
# $ ./todo help			 # Show usage
# $ ./todo report		 # Statistics
```

All we have done here is wrap up everything in a `Task` class that is really acting like a module in this case. Next up, we are going to add tests so we can make changes with more confidence.

## Key Takeaways

- Use classes to define your problem domain
- Wishful thinking is good for API design
- Tests are good for verifying behavior