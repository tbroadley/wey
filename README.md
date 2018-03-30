# Wey

Fast desktop Slack client, written in Node.js with native UI.

__Do not use this for work, you might miss important messages due to bugs and
missing features.__

## Screenshots

## Releases

To find latest releases for different platforms, go to the [Releases][releases]
page on GitHub.

For hackers, you can also `npm install -g wey`.

## Technical stack

* [Node.js](https://nodejs.org)
* [Yue](https://github.com/yue/yue)
* [Yode](https://github.com/yue/yode)

## Resources usage

Resouces used by Wey are based on following things:

* The Node.js runtime.
* Native windows and widgets.
* HTML view used for rendering messages.
* JavaScript code for communicating with Slack.
* Cached Users and messages information in teams.

Normally for multiple teams with heavy traffics, Wey should not have any
significant CPU usage, and RAM ussage is usually under 100MB. However if you
have a team with more than 10k users in it, the memory usage may increase a lot.

## Design principles

Wey is developed with following principles, the ultimate goal is to provide a
fast and powerful chat app.

### Use native UI for almost everything

Most parts of Wey should be created with native UI widgets from Yue library,
when there is need for custom UI, draw it manually.

### HTML is our friend

Webview is a great tool as long as we use it wisely. For rendering the rich
messages of Slack, HTML is the best tool.

The HTML pages showed in Wey should be static for best performance, the usage
of JavaScript in the pages must be minimal. We should not use any external CSS
or JavaScript library/framework, every style and animation must be hand written.

### Minimal dependencies

Be careful when adding dependencies, only use third party modules that are small
and without tons of dependencies.

### Hide details of chat service providers

While Wey currently only supports Slack, it is on roadmap to add support for
more services, and in future we will support plugins to add arbitrary services.

To achieve this we must ensure the views and controllers must only operate on
the public interfaces of models, all internal implementations must be hidden
from outside.

### Separated views

Wey supports multiple windows with different types for reading messages, so the
views should act only as users of models, and should not manage the models.

As benefit creating views in Wey is very fast, opening a new window is almost
as fast as showing a hidden window. Users can close all windows and run Wey in
background, while still be able to open a new window quicly.

### Correctly unload things

While JavaScript has garbage collections, it is still very easy to cause memory
leaks when careless referencing objects together. Views in Wey are reloaded
frequently (for example switching accounts and closing windows), so it is
important to ensure everything event subscription is detached when unloading
a view.

## Resources usage

Resouces used by Wey are based on following things:

* The Node.js runtime.
* Native windows and widgets.
* HTML view used for rendering messages.
* JavaScript code for communicating with Slack.
* Cached Users and messages information in teams.

Normally for multiple teams with heavy traffics, Wey should not have any
significant CPU usage, and RAM ussage is usually under 100MB. However if you
have a team with more than 10k users in it, the memory usage may increase a lot.

## Contributions

Please limit the size of pull requests under 300 lines, otherwise it would be
rather hard to review the code. If you have a big feature to add, please
consider splitting it into multiple pull requests.

It is also encouraged to fork this project or even develop commercial apps based
on this project, as long as you follow the GPLv3 license.

## Login limitations

The Slack APIs are not really friendly for third party client apps, to implement
OAuth we have to first develop a small web app, and then ask your team's admin
to manually add the app to your team.

As workaround Wey can read Slack tokens from system keychain, which are written
to by the official Slack desktop app. So to login with Wey, you need to login
with the official Slack desktop app first.

Wey does not silently read the system keychain, you will be explicitly prompted
by the system when using Wey to read Slack tokens.

Another way to login is to acquire a [token from Slack][token], which is a
deprecated feature and some teams have disabled it.

## Performance bottleneck

In Wey most time are spent on networking, and performance is usually limited by
Slack's APIs.

### Most operations are done via web API

In Slack while there is Real Time Messaging API, most common operations can only
be done via web APIs, i.e. by sending HTTPS requests, and it is really slow.

### Intilization involves multiple web API calls

To sign in and load channels, we have to send multiple requests. For example
`rtm.start` to start RTM client, `team.info` to get team information,
`users.list` to list team's users, `conversations.list` to list all public and
private channels, `conversations.history` to read messages history.

Also the `conversations.list` can not reliably give unread states of channels,
we need to call `conversations.info` API for every channel to get correct
unread states.

So from opening the app to finally reading the messages, there are more than 7
slow HTTPS requests involved.

### No easy way to get joined channels

Currently to get all joined channels, we have to get all channels in a team
first, and then filter them. For teams with large numbers of channels, we may
have to send more than 10 HTTPS requests due to pagination in Slack APIs.

### Messages do not include user information

The messages history we pulled from Slack does not include full user
information, it only has user IDs in it. So in order to render the messages we
have to pull users list first.

However certain Slack teams have more than 20k users, and it is impossible to
download all users' information and cache them. Because of this rendering
messages becomes asynchronous work, whenever an uncached user ID is encountered,
we have to wait and pull user's information before rendering the message.

And for large teams we usually end up with caching more than 10k users, which
uses a huge JavaScript object, and takes lots of memory.

### User information can only be pulled one by one

Slack does not provide an API to pull information of groups of users. You can
either try to pull all users via `users.list`, or pull users one by one via
`user.info`.

For a large team which it is impractical to cache all users, we may end up
sending tens of HTTPS requests for rendering a channel's messages.

### Some bots are not returned in `users.list`

While the `users.list` should also return bot users, it somehow does not return
certain bot users. As a result even for small teams that we can cache all the
users, we still have to spend time fetching user information when rendering
channel messages involving bots.

## License

The main source code under `lib/` are published under GPLv3, other things are
published under public domain.

[releases]: https://github.com/yue/wey/releases
[token]: https://api.slack.com/custom-integrations/legacy-tokens
