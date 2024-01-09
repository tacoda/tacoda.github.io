---
title: "Re-Organizing Our To Do App"
date: 2024-01-09T11:30:03+00:00
publishdate: 2024-01-09T11:30:03+00:00
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

We are going to change a lot in our to do app, so it's a good idea to re-organize it now. Additionally, making our app adhere to standards helps others to effectively contribute to it.

Right now we have two files in our project:

```sh
ls
# pyproject.toml todo.py
```

First, let's make a folder to hold all of our domain-specific application code.

```sh
mkdir todo
```

We will make a `task.py` file to hold our contents for now, but we will be changing this later.

```sh
touch todo/task.py
```

Let's break out our app code from the main runner. Here's what our code looks like after we're done:

### `todo.py`

```python
import sys
import datetime
from todo.task import help


if __name__ == '__main__':
    try:
        d = {}
        don = {}
        args = sys.argv
        if(args[1] == 'del'):
            args[1] = 'deL'
        if(args[1] == 'add' and len(args[2:]) == 0):
            sys.stdout.buffer.write(
                "Error: Missing todo string. Nothing added!".encode('utf8'))

        elif(args[1] == 'done' and len(args[2:]) == 0):
            sys.stdout.buffer.write(
                "Error: Missing NUMBER for marking todo as done.".encode('utf8'))

        elif(args[1] == 'deL' and len(args[2:]) == 0):
            sys.stdout.buffer.write(
                "Error: Missing NUMBER for deleting todo.".encode('utf8'))
        else:
            globals()[args[1]](*args[2:])

    except Exception as e:

        s = """Usage :-
$ ./todo add "todo item" # Add a new todo
$ ./todo ls			 # Show remaining todos
$ ./todo del NUMBER	 # Delete a todo
$ ./todo done NUMBER	 # Complete a todo
$ ./todo help			 # Show usage
$ ./todo report		 # Statistics"""
        sys.stdout.buffer.write(s.encode('utf8'))
```

In addition to separating the functions into a new file, we have also added an `import` in the main file to reference those functions.

### `todo/task.py`

```python
import sys
import datetime


def help():
    sa = """Usage :-
$ ./todo add "todo item" # Add a new todo
$ ./todo ls			 # Show remaining todos
$ ./todo del NUMBER	 # Delete a todo
$ ./todo done NUMBER	 # Complete a todo
$ ./todo help			 # Show usage
$ ./todo report		 # Statistics"""
    sys.stdout.buffer.write(sa.encode('utf8'))


def add(s):
    f = open('todo.txt', 'a')
    f.write(s)
    f.write("\n")
    f.close()
    s = '"'+s+'"'
    print(f"Added todo: {s}")


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

Now, let's run this! First, we will enter a shell.

```sh
poetry shell
```

Now we can interact with python as we are used to.

```sh
python todo.py
```

When we initially run this, we run into this error:

```
ModuleNotFoundError: No module named 'todo.task'; 'todo' is not a package
```

The reason for this error is because Python does not see our folder as a package. To make that happen, we just have to add an `__init__.py` file to that folder.

```sh
touch todo/__init__.py
```

Now we run again:

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

Success!

This is great, but our code is still a little messy (and it only runs help!) so let's clean it up before we start to change things. Let's stick with only help for now as we get this working, then we'll add in the other functions. With that in place, we will then move into talking about object-oriented programming, design, and testing.

### `todo.py`

```python
import sys
from todo.task import help


if __name__ == '__main__':
    help()
```

Run again to verify:

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

And it works!

Now we can add back our other cases, but instead of sending them all to be processed by `globals()`, we will invoke them directly. Why? Well, because global values tend to be a problem in programs. Also, since we are breaking this up, it would necessarily change that implementation. Why invoke them directly? In this case, it gives us much more control over flow. So let's add that in:

### `todo.py`

```python
import sys
from todo.task import help, add, done, deL


if __name__ == '__main__':
    try:
        args = sys.argv
        if(args[1] == 'add'):
            if(len(args[2:]) == 0):
                sys.stdout.buffer.write(
                    "Error: Missing todo string. Nothing added!".encode('utf8'))
            else:
                add(args[2:])

        elif(args[1] == 'done' and len(args[2:]) == 0):
            if(len(args[2:]) == 0):
                sys.stdout.buffer.write(
                    "Error: Missing NUMBER for marking todo as done.".encode('utf8'))
            else:
                done(args[2:])

        elif(args[1] == 'del' and len(args[2:]) == 0):
            if(len(args[2:]) == 0):
                sys.stdout.buffer.write(
                    "Error: Missing NUMBER for deleting todo.".encode('utf8'))
            else:
                deL(args[2:])

    except Exception:
        help()
```

Still a lot more work to do here, but this is enough to get us started.

Run again to verify:

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

So far, this is looking great! Next up, we are going to change how we are going to wrap our task in a class.

## Key Takeaways

- If Python cannot find your module, you are probably missing an `__init__.py` file
- Avoid global state
- Separate domain logic from interface logic