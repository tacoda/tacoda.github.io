---
title: "Giving Our Tests Context"
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

At the end of the last post, we added tests that cause errors and failures, so let's recap what that looks like.

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
    assert "Buy Bread" in task.description


def test_listing_tasks_displays_output(task_list, capsys):
    task_list.ls()
    captured = capsys.readouterr()
    assert "Buy Milk" in captured.out
```

```sh
poetry run pytest
# FAILED tests/test_task_list.py::test_adding_a_task_increases_list_size - assert 0 == (1 + 1)
# FAILED tests/test_task_list.py::test_adding_a_task_appends_that_task - AttributeError: 'list' object has no attribute 'description'
```

Here we have two problems. First, our task list size is not increasing. Second, we are referencing an attribute on the `Task` that does not exist. We'll add this functionality next time. First, we'll add more context to our tests.

## Adding Context

Notice the length of our test names. Notice how they are attempting to describe the test case. Now, imagine all of the different things that a `TaskList` could do. How does that scale for our tests? Currently, we would have to add a test for each piece of functionality. Then, hopefully, we would DRY up duplication. But we would end up with many disparate tests that use a variety of fixtures to describe the system under test. It would be better if we could group our tests. Let's add another dependency to get this done.

```sh
poetry add pytest-describe
```

With `pytest-describe`, we can write contextualized tests similar to RSpec. We can add a `describe` function surrounding our first test to see how this works.

```python
def describe_task_list():
    def test_adding_a_task_displays_output(task_list, capsys):
        task_list.add("Buy Bread")
        captured = capsys.readouterr()
        assert "Buy Bread" in captured.out
```

Running tests:

```sh
poetry run pytest -v
# tests/test_task.py::test_marking_task_done SKIPPED (unconditional skip)
# tests/test_task_list.py::describe_task_list::test_adding_a_task_displays_output PASSED
# tests/test_task_list.py::test_adding_a_task_increases_list_size FAILED
# tests/test_task_list.py::test_adding_a_task_appends_that_task FAILED
# tests/test_task_list.py::test_listing_tasks_displays_output PASSED
```

Notice the output of our new test?

`tests/test_task_list.py::describe_task_list::test_adding_a_task_displays_output PASSED`

We have added context to our test. Now we know that our test is describing a task list. Great! Let's indent the rest of the tests.

```sh
poetry run pytest -v
# tests/test_task.py::test_marking_task_done SKIPPED (unconditional skip)
# tests/test_task_list.py::describe_task_list::test_adding_a_task_displays_output PASSED
# tests/test_task_list.py::describe_task_list::test_adding_a_task_increases_list_size FAILED
# tests/test_task_list.py::describe_task_list::test_adding_a_task_appends_that_task FAILED
# tests/test_task_list.py::describe_task_list::test_listing_tasks_displays_output PASSED
```

Awesome! Even though this gives us more context, it still has limited value. Let's revisit our first test to give it more value.

`tests/test_task_list.py::describe_task_list::test_adding_a_task_displays_output PASSED`

First, having the prepended `test` makes the sentence a little harder to read. Plus, we already know it's a test. Let's rename the test to start with `it`, in RSpec style.

```python
def describe_task_list():
    def it_displays_output_when_adding_a_task(task_list, capsys):
        task_list.add("Buy Bread")
        captured = capsys.readouterr()
        assert "Buy Bread" in captured.out
```

```sh
poetry run pytest -v
# tests/test_task_list.py::describe_task_list::it_displays_output_when_adding_a_task PASSED
```

We are just focusing on this test for now. Then we'll apply the change to the rest of our tests. This sentence reads a little better, but it's still not quite English-like. Let's swap the predicate to not be a passive voice:

```python
def describe_task_list():
    def when_adding_a_task_it_displays_output(task_list, capsys):
        task_list.add("Buy Bread")
        captured = capsys.readouterr()
        assert "Buy Bread" in captured.out
```

```sh
poetry run pytest -v
# tests/test_task_list.py::describe_task_list::when_adding_a_task_it_displays_output PASSED 
```

## Adding Custom Prefixes

This is better, but it's not quite there. Notice the tests starts with `when`. What does this tell us? That we have additional context. Let's add one more layer of context.

```python
def describe_task_list():
    def when_adding_a_task():
        def it_displays_output(task_list, capsys):
            task_list.add("Buy Bread")
            captured = capsys.readouterr()
            assert "Buy Bread" in captured.out
```

```sh
poetry run pytest -v
```

Whoa! Our test is gone! Why? Because `pytest-describe` is only looking for functions with a `describe` prefix. One option is to add a `describe` before our `when` for this new function name. But, that's going the opposite direction that we are headed (because it won't be English-like). To solve this, we'll add a configuration option for `pytest-describe` to our `pyproject.toml`:

```toml
[tool.pytest.ini_options]
describe_prefixes = ["describe_", "when_"]
```

Here we are just adding the prefix `when` for `pytest-describe` to look for. I chose `when` because it sounds natural and using _Given, When, Then_ statements is really good model for contextualizing behavior. Currently, we only need a `when`, so we're just adding that for now.

Run tests again:

```sh
poetry run pytest -v
# tests/test_task_list.py::describe_task_list::when_adding_a_task::it_displays_output PASSED
```

And the test is back! And it looks great! Now we know that this test is describing a task list. And that this test is asserting that when a task is added to the task list, it displays output. Let's wrap the remaining tests:

```python
def describe_task_list():
    def when_adding_a_task():
        def it_displays_output(task_list, capsys):
            task_list.add("Buy Bread")
            captured = capsys.readouterr()
            assert "Buy Bread" in captured.out

        def it_increases_list_size(task_list):
            before = len(task_list.all())
            task_list.add("Buy Bread")
            after = len(task_list.all())
            assert after == before + 1

        def it_appends_that_task(task_list):
            task_list.add("Buy Bread")
            task = task_list.all()
            assert "Buy Bread" in task.description
```

Notice our function scoping here. All of our `add` tests can just be indented under the new `when_adding_a_task`. One area that could be improved here is adding a `describe` block to identify that we are testing the `add` method. It would look like `describe_add`. This has limited value. It doesn't make our test more English-like, but it _does_ give us additional context. As a developer, we would know that the system under test is `Task.add`. If we do this, we don't necessarily need the configuration for the `when` prefix anymore. But, we'll keep it because it will allow us to further scope. Let's rename this function and continue.

```python
def describe_task_list():
    def describe_add():
        def it_displays_output(task_list, capsys):
            task_list.add("Buy Bread")
            captured = capsys.readouterr()
            assert "Buy Bread" in captured.out

        def it_increases_list_size(task_list):
            before = len(task_list.all())
            task_list.add("Buy Bread")
            after = len(task_list.all())
            assert after == before + 1

        def it_appends_that_task(task_list):
            task_list.add("Buy Bread")
            task = task_list.all()
            assert "Buy Bread" in task.description
```

Now we can scope our last test: which is testing `Task.ls`:

```python
def describe_task_list():
    def describe_add():
        def it_displays_output(task_list, capsys):
            task_list.add("Buy Bread")
            captured = capsys.readouterr()
            assert "Buy Bread" in captured.out

        def it_increases_list_size(task_list):
            before = len(task_list.all())
            task_list.add("Buy Bread")
            after = len(task_list.all())
            assert after == before + 1

        def it_appends_that_task(task_list):
            task_list.add("Buy Bread")
            task = task_list.all()
            assert "Buy Bread" in task.description


    def describe_list():
        def it_displays_output(task_list, capsys):
            task_list.ls()
            captured = capsys.readouterr()
            assert "Buy Milk" in captured.out
```

> It would be nice to DRY up that `task_list` argument, but if we do that it will break the call chain of `pytest-describe`. Here's what that error would look like for reference:
> 
> ```
> ERROR tests/test_task_list.py::describe_task_list::describe_add - TypeError: describe_task_list.<locals>.describe_add() missing 1 required positional argument: 'task_list'
> ```

So why are we keeping `when`? Because it will be useful as we move forward. Let's point out a use-case for it. Take a look at `describe_list`. Is there a case that is not covered here? What if the task list has nothing in it? Let's spec that out:

```python
def describe_list():
    def when_there_are_tasks():
        def it_displays_no_tasks(task_list, capsys):
            task_list.ls()
            captured = capsys.readouterr()
            assert "No tasks" in captured.out


    def when_there_are_no_tasks():
        def it_displays_output_in_a_list(task_list, capsys):
            task_list.ls()
            captured = capsys.readouterr()
            assert "Buy Milk" in captured.out
```

```sh
poetry run pytest -v
# tests/test_task.py::test_marking_task_done SKIPPED (unconditional skip)
# tests/test_task_list.py::describe_task_list::describe_add::it_displays_output PASSED
# tests/test_task_list.py::describe_task_list::describe_add::it_increases_list_size FAILED
# tests/test_task_list.py::describe_task_list::describe_add::it_appends_that_task FAILED
# tests/test_task_list.py::describe_task_list::describe_list::when_there_are_tasks::it_displays_no_tasks FAILED
# tests/test_task_list.py::describe_task_list::describe_list::when_there_are_no_tasks::it_displays_output_in_a_list PASSED
```

Amazing! Now we have test cases that read like English. What's great about this is that even a non-developer can look at these test descriptions and understand what they are doing. That is, they are executable product specifications (or documentation).

Next up, we'll make these tests pass by updating our code.

## Key Takeaways

- Adding context to tests helps with organization _and_ understanding
- `pytest-describe` gives us an RSpec-like API that allows us to better contextualize our tests
- Adding custom prefixes allows us more control over scope _and_ naming
- Tests are executable documentation