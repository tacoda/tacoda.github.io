---
title: "Getting Started with Python in AWS"
date: 2023-06-24T11:30:03+00:00
publishdate: 2023-06-24T11:30:03+00:00
# weight: 5
# aliases: ["/first"]
tags: ["python", "aws", "programming", "cloud"]
author: "Ian Johnson"
# author: ["Me", "You"] # multiple authors
showToc: false
TocOpen: false
draft: false
hidemeta: false
comments: false
# description: ""
# canonicalURL: "https://canonical.url/to/page"
# disableHLJS: true # to disable highlightjs
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
# cover:
#     image: "https://media.licdn.com/dms/image/D4E16AQGw6Ow73j0HUA/profile-displaybackgroundimage-shrink_350_1400/0/1671636629469?e=1677715200&v=beta&t=2MKRKo682atDczyT6l15uNkubCEeFVdHy11zfOULI5w" # image path/url
#     alt: "<alt text>" # alt text
#     caption: "<text>" # display caption under cover
#     relative: false # when using page bundles set this to true
#     hidden: true # only hide on current single page
# editPost:
#     URL: "https://github.com/tacoda.github.io/content"
#     Text: "Suggest Changes" # edit text
#     appendFilePath: true # to append file path to Edit link
---

## Make an AWS Account

First, make an AWS account.

## Create an EC2 Instance

Navigate to **EC2** in the AWS dashboard and select instances.

Create a `t2.micro` EC2 instance with the Amazon Linux distribution.

Create a new key pair.

Since I am using Windows to write this post, create a PPK to use PuTTY.

## Configure PuTTY

Configure PuTTY to:

1. Use `username@dnsname` in address
  - Note: Default username is `ec2-user`
2. Add private key for authentication under SSH credentials
3. Save configuration for easy reuse

## Connect to Instance

After clicking OK, a session should be created with your new EC2 instance.

Login prompt looks like:

```
[ec2-user@ip-ip-address ~]$
```

## Verify `aws`

```
which aws
```

The advantage to using the Amazon Linux is that the `aws` cli tool is already installed.

```
aws s3 ls
```

Gives us no results because we still need to configure `aws`. We will do this later when we create another IAM user.

## Install asdf

```
sudo dnf install git
sudo dnf install make automake gcc gcc-c++ kernel-devel
sudo dnf install bzip2 ncurses libffi readline
git clone https://github.com/asdf-vm/asdf.git ~/.asdf --branch v0.12.0
. "$HOME/.asdf/asdf.sh"
. "$HOME/.asdf/completions/asdf.bash"
asdf
```

## Install Python

```
asdf pluin add python
asdf list-all python
asdf install python 3.11.0
asdf global python 3.11.0
```

## Verify Python

```
which python
```