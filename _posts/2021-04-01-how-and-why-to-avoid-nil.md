---
layout: post
title:  "How and Why to Avoid Nil"
date:   2020-04-01 12:00:00 -0400
categories: ruby nil
---

# How and Why to Avoid Nil

## Why do nils happen?

## Solutions

- Invert the Object Relationship
- Guard Against Nils in a Manual Attribute Reader
- Introduce New Domain Concepts

### Invert the Object Relationship

{% highlight ruby %}
class Person
end

class Subscription
  attr_reader :person
end

person = Person.new
if false
  person.subscribe!
end
puts person.subscription
{% endhighlight %}

### Guard Against Nils in a Manual Attribute Reader

Create your own smart getter.

{% highlight ruby %}
class Person
  def subscribe!
    @subscription = Subscription.new
  end

  def subscription
    @subscription or raise NoSubscriptionError
  end
end

class NoSubscriptionError < Exception
end

class Subscription
end

person = Person.new
if false
  person.subscribe!
end
puts person.subscription
{% endhighlight %}

### Introduce New Domain Concepts

Make a specialization.

{% highlight ruby %}
class Person
  def subscribe
    Subscriber.new(Subscription.new)
  end
end

class Subscriber
  attr_reader :subscription

  def initialize(subscription)
    @subscription = subscription
  end
end

class Subscription
end
{% endhighlight %}
