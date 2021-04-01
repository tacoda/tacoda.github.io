---
layout: default
title: Projects
permalink: /projects/
---

<ul>
  {% for project in site.pages %}
  {% if project.dir contains '_projects' %}
	    <li>
	      <a href="{{ project.url }}">{{ project.title }}</a>
	    </li>
    {% endif %}
  {% endfor %}
</ul>
