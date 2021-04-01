---
layout: post
title:  "How and Why to Avoid Nil"
date:   2020-04-01 12:00:00 -0400
categories: ruby nil
---
# Why do nils happen?

# Solutions

## Invert the Object Relationship

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

