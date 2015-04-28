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

### Development

Module source code lives in the `src` directory. You can use ES6 syntax to
import helper functions and classes, as well as for source code of the module
itself.

There's a Grunt setup for transpiling/building modules. You can watch all
modules in `src` by running:

    grunt watch-src

This will automatically build any changes to a file with the same name in
`dist`. You can also just build all modules using `grunt build`.
