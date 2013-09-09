# remoteStorage modules

This is the official repository for remoteStorage community modules.

### Work in progress!

We're currently in the process of adding, updating, and polishing the core
modules. Experimental and unfinished modules live in a respective branch named
after the module name.

If you want to help or learn more about how modules work, just hop on the IRC
channel and say hello: [irc://irc.freenode.net:7000/remotestorage](irc://irc.freenode.net:7000/remotestorage)

We also introduced new community forums (including a modules category), where
you can ask and discuss anything: [http://community.remotestorage.io](http://community.remotestorage.io).

### Getting your code into the master branch

Just issue a pull request, and we'll jointly review the code and help each
other making it ready for master.

### Using the module console

This repository contains a module console, which is a NodeJS script to help you debug modules.

For example to use the "contacts" module, run this:

```
scripts/module-console.js contacts
```

This will load the given module ("contacts" in this case) and give you a prompt. By default caching is enabled, so you don't need to connect to any remotestorage server.
The prompt works like any other node prompt, with one important exception: Whenever a command returns a promise, it will wait for the promise to be fulfilled or rejected and then print the result. That makes it a lot easier to test asynchronous code in a trial & error way.
