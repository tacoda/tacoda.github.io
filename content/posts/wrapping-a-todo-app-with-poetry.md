---
title: "Wrapping a To Do App with Poetry"
date: 2024-01-08T11:30:03+00:00
publishdate: 2024-01-08T11:30:03+00:00
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

We are going to start with a simple todo cli application with a straight-forward implementation.
The source of this code comes from [Geeks for Geeks](https://www.geeksforgeeks.org/how-to-make-a-todo-list-cli-application-using-python/).

## Starting Code

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

This app uses the name `todo`, but we will start with this file in `todo.py` to try to replicate a beginner's script. If you would like to use this simply as `todo`, you will have to add an interpreter shebang and make the file executable.

```sh
#!/usr/bin/env python3
```

```sh
chmod a+x ./todo
```

Feel free to do this if you would like, but we are going to take a simpler approach. Instead, we will move forward with `todo.py`.

## Make this a Poetry project

To turn this into a poetry project, we need to move this from a file to a directory.

First we make the directory.

```sh
mkdir todo-app
```

Then we move our python file in the new directory.

```sh
mv todo.py todo-app/todo.py
```

Now we navigate to the directory.

```sh
cd todo-app
```

Initialize the new poetry project.

```sh
poetry init

# This command will guide you through creating your pyproject.toml config.

# Package name [todo-app]:  
# Version [0.1.0]:  
# Description []:  
# Author [Ian Johnson <tacoda@hey.com>, n to skip]:  
# License []:  
# Compatible Python versions [^3.12]:  

# Would you like to define your main dependencies interactively? (yes/no) [yes] no
# Would you like to define your development dependencies interactively? (yes/no) [yes] no
# Generated file

# [tool.poetry]
# name = "todo-app"
# version = "0.1.0"
# description = ""
# authors = ["Ian Johnson <tacoda@hey.com>"]
# readme = "README.md"

# [tool.poetry.dependencies]
# python = "^3.12"


# [build-system]
# requires = ["poetry-core"]
# build-backend = "poetry.core.masonry.api"


# Do you confirm generation? (yes/no) [yes]
```

Here, I accept most of the defaults. `Enter` or `Return` will accept the default for each of these prompts. The default value is given in square brackets at the end of a prompty. I specifically chose not to define my dependencies interatively to work through it.

## Run the Project

We can run commands in the virtual environment set up by poetry on a one-by-one basis by using the `run` subcommand.

```sh
poetry run python todo.py            
# Creating virtualenv todo-app-7hL1Y5Tc-py3.12 in /Users/ianjohnson/Library/Caches/pypoetry/virtualenvs
# Usage :-
# $ ./todo add "todo item" # Add a new todo
# $ ./todo ls			 # Show remaining todos
# $ ./todo del NUMBER	 # Delete a todo
# $ ./todo done NUMBER	 # Complete a todo
# $ ./todo help			 # Show usage
# $ ./todo report		 # Statistics
```

Great! We have now wrapped our script inside Poetry. In addition to our `todo.py` script, we now have a `pyproject.toml` file that was generated by Poetry.