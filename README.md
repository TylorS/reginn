# Reginn

> Composable Command Line Applications

Reginn helps you conquer the world of command line applications functionally.

Reginn empowers you with simple functions to implement complex command-line
applications with expressive code and ease. By sandboxing side effects into
tightly-controlled areas of your application, your code will become easy to
read, reason about, and test.

## Why Reginn?

Reginn was built to eliminate the crutch on monolithic imperative APIs to work
with on the command line.

Leading alternatives are both largely unmaintained and
feature large imperative classes, which tend to be bad for reusability. Many of them
introduce lots of new syntax that you have to learn and they all are based around
the way you format strings. That is usually a recipe for disaster.
Many alternatives also force the intermixing of where you declare your application’s
intent and where side effects exist that leads to poor separation of concerns
and testability.

Reginn is laser-focused to create small, testable functions that allow you to
build you command line applications with assurances not found elsewhere. Reginn
introduces zero new syntaxes to your application and no new concepts, since you
already know functions.

## This is for me!
```sh
npm install --save reginn

# Do awesome things!
```

## Basic Usage and Tutorial

#### Defining what we want

We're going to walk through the process of creating a small application
that reads an input file, and writes it somewhere else. Let's dive in!

The end result we're looking for is an application we can use like this

```sh
node ./cli.js move -i path/to/file -o new/path/to/file
# without abbreviation
node ./cli.js move --input path/to/file --output new/path/to/file
```

Let's break it down into a few pieces first to see what it is we're trying to
achieve. We're going to work right to left, as this is how function composition
works.

#### Creating Option Flags

First we want to define how our application can process `-o new/path/to/file`
The code to do this is

```js
import { flag, alias } from 'reginn'

const outputFlag = flag(alias('output', 'o'))
```

Remember that we're dealing with function composition. Here we are describing
that we want to create a `Flag` with an alias of `output` and an abbreviation of
`o`.

Let's break that down a little further.

First we create a new [`Alias`](#alias). An alias is a low-level type designed
to associate other types with a name and optionally an abbreviation to that
name. We do that here by calling `alias('output', 'o')`.

Secondly we wrap that alias inside of Reginn's `flag()` function. This creates
our second type introduced here: [`Flag`](#flag). A Flag is a mechanism for
creating options that change or define the behavior of your applications.

Can you guess how we are going to create the next piece of our API?

We want to enable this: `-i path/to/file`

```js
const inputFlag = flag(alias('input', 'i'))
```

Exactly like the `outputFlag` above!

#### Building Commands

Next we want to be able to describe the command `build` that accepts these
flags. We are going to introduce a new type.

```js
import { command } from 'reginn'

const moveCommand = command(alias('move'), inputFlag, outputFlag)
```

Here we're introducing a new type [`Command`](#command). Commands are composed
of an `Alias` and any number of `Flag`s.

Commands are a very special type and is where we branch our code to sandbox our
side effects.

#### Sandboxing Side-Effects

Here we are going to perform our applications sole purpose. Reginn has a few
functions to create side-effects but here we are going to use a `Promise`.

```js
import { readFile, writeFile } from 'fs'

import { asPromise } from 'reginn'

asPromise(moveCommand).then(({ args, options }) => {
  // lets read our input file
  readFile(options.input, 'utf8', (err, content) => {
    if (err) throw err

    // and lets write it to our output file
    writeFile(options.output, content, 'utf8', (err) => {
      if (err) throw err
    })
  })
})
```

Calling `asPromise` with a `Command` as the sole argument returns to us a
Promise that will resolve when the command has been matched. The resolved promise
will have access to an object with `args` and `options`.

`args` here is an array of strings, representing all non-Flag parameters given to
our application.

`options` here is a hash of flags we are explicitly handling, and have been matched.

For example:

```sh
node ./cli.js move notAFlag --input file.js --output output.js --unhandledFlag
```

The resulting `args` will be `[ 'notAFlag' ]` and `options` will be
```js
{
  input: "file.js",
  output: "output.js"
}
```

So lets recap what we've done so far. We've learned how to create flags to give
options to our application, build commands that can make use of those flags, and
lastly how to do something with all that.

The last thing we need to do is run it!

The code to do so is

```js
import { run } from 'reginn'

run(moveCommand)
```

This is all we need to implement the API we set out to describe. Here is the entire
application.

```js
import { command, flag, alias, run, asPromise } from 'reginn'

const outputFlag = flag(alias('output', 'o'))
const inputFlag = flag(alias('input', 'i'))
const moveCommand = command(alias('move'), inputFlag, outputFlag)

asPromise(moveCommand).then(({ args, options }) => {
  // lets read our input file
  readFile(options.input, 'utf8', (err, content) => {
    if (err) throw err

    // and lets write it to our output file
    writeFile(options.output, content, 'utf8', (err) => {
      if (err) throw err
    })
  })
})

run(moveCommand)
```

At this point I hope you now understand the core concepts of what Reginn is
trying to do, and what it is capable of.

Thank you for taking the time to read this and please open an issue for
suggestions and comments!


## API Documentation
---

### Types

All of the types used by Reginn are simple objects exposed by functions of the
same lowercased name, which are described above.

#### Alias

##### `alias (name: string, aliasedName?: string): Alias`

An alias is used to associate other types to a usable value
for a user of your command line applications. An Alias is a fundamental type,
that can not be composed of other types.

```typescript
type Alias = {
  type: 'alias',
  value: [string, string]
};
```

**Example:**

```js
import { alias } from 'reginn'

alias('name')
alias('name', 'aliasToName')
```

#### Description

##### `function desc(description: string): Desc`

A Description is used to associate a description to your `Flag`s and `Command`s.
It can be particular useful for generating output about your application.

**Example:**

```js
import { desc, flag, alias } from 'reginn'

flag(alias('input'), desc('Takes in a relative path an input file'))
```

See [`help`](#help) for a more concrete example.

#### Type

##### `function type (value: 'string' | 'boolean'): Type`

A Type is created to distinguish how to parse the input of a [Flag](#flag).

```typescript
type Type = {
  type: 'type',
  value: 'string' | 'boolean'
};
```

**Example:**

```js
import { type } from 'reginn'

type('boolean')
```

#### Flag

##### `function flag(...definitions: Array<Alias | Type>): Flag`

A Flag is a mid-level type which can be composed of `Type` and `Alias`. A flag
is used to associate options to part of your command.

```typescript
type Flag = {
  type: 'flag',
  flagType: 'string' | 'boolean',
  alias: Array<[string, string]>
};
```

**Example:**

```js
import { flag, type, alias } from 'reginn'

flag(type('boolean'), alias('example'))
```

#### Command

##### `command(...definitions: Array<Flag | Alias | Command>): Command`

A Command is a very special type which allows us to compose many options together
to create a public facing API, and also as a place to sandbox our side-effects.

A Command is typically composed of types `Alias` and `Flag`, but for subcommands,  
can be composed with other `Command` types. In the case of matching a command
that has subcommands, the parent's handler will receive an instance of type `App`.

```typescript
asPromise(commandWithSubCommands).then((app: App) => {
  run(app) // run your sub application
})

// or simply

asPromise(commandWithSubCommands).then(run)
```

The reason that subcommands are handled in this way, is because executing
commands is a side-effect! Furthermore, it is possible to provide extra logic
to be performed before calling the subcommmands like composing with another App.

```
type Command = {
  type: 'command',
  command?: Array<Command>,
  flag?: CommandFlags,
  alias?: Array<[string, string]>,
  handler?: Handler
};

type CommandFlags = {
  alias?: Array< { [name: string]: string } >,
  string?: string[],
  boolean?: string[]
};

type Handler = (input: HandlerOption) => any;

type HandlerOption = {
  args: string,
  options: Object
};

```

**Example:**

```js
import { command, flag, alias } from 'reginn'
run
command(flag(alias('only'), alias('test'))
```

#### App

##### `app(...definitions: Array<Flag | Command | App>): App`

An `App` is a collection of any number of Commands, Flags, and also other Apps to
create a container for many commands and flags for you application.

A large application can be composed or any
number of smaller applications e.g. `app(app(), app(), app())`, where app's
are composed of commands and flags.

A note on composing many applications: A deep merge is performed from left to
right on each containing application. What this means, is if there is a overlap
of commands between the applications, the one defined on the application to
the right will override the application to the left.

```typescript
export type App = {
  type: 'app',
  command: Array<Command>,
  flag?: CommandFlags,
  args?: Array<string> // only present for subcommand apps
  options?: Object // only present for subcommand appss
}
```

**Example:**

```js
import { app, command, alias } from 'reginn'

const gitApp = app(command(alias('git')))

const hgApp = app(command(alias('hg')))

const vcsApp = app(gitApp, hgApp)
```

### Running you Application
---

#### `run(args: string[], appOrCommand: App | Command): App`
#### `run(appOrCommand: App | Command): App`


`run()` is the function which gets your application off of it's feet by
processing arguments, and executing command handlers. Calling run with an array
of strings allows for you to explicitly define what is parsed by the application
which is immensely useful for testing.

```js
import { run } from 'reginn'

run(application)
```


### Handlers

Handlers are the mechanisms for performing side-effects from commands.

#### `asPromise(cmd: Command): Promise<HandlerOption | App>`

```js
import { asPromise } from 'reginn'

asPromise(command).then(({ args, options }) => {
  // do stuff
})
```

#### `asStream(cmd: Command): Stream<HandlerOption | App>`

The `Stream` type being referred to here is a [most.js](https://gitub.com/cujojs/most) Stream.

```js
import { asStream } from 'reginn'

asStream(command).observe(({ args, options }) => {
  // do stuff
})
```

#### `withCallback(cmd: Command, callback: (input: HandlerOption | App) => any): void`

```js
import { withCallback } from 'reginn'

withCallback(command, ({ args, options }) => {
  // do stuff
})
```

### Commands

#### `help(application: string, ...definitions: Array<Flag, App, Command>): App`

`help` is a function that takes a name of you application and adds a new
command to your application. This allows your users to call `node cli.js help`
and print out how to use your application.

Lets take a look at how we would do this in our input/output example above and
see how we would make use of `help`

**example**

```js
// NOTE: we'll import desc and help in addition to previous imports
import { command, flag, alias, run, asPromise, desc, help } from 'reginn'

const outputFlag = flag(alias('output', 'o'), desc('Where to output our input file'))
const inputFlag = flag(alias('input', 'i'), desc('Where to read an input file'))
const moveCommand = command(alias('move'), inputFlag, outputFlag, desc('Move a file.'))

asPromise(moveCommand).then(({ args, options }) => {
  // lets read our input file
  readFile(options.input, 'utf8', (err, content) => {
    if (err) throw err

    // and lets write it to our output file
    writeFile(options.output, content, 'utf8', (err) => {
      if (err) throw err
    })
  })
})

run(help('myApp', moveCommand))
```

```sh
node ./myapp.js help

myApp

  COMMANDS:
    move - Move a file.

  FLAGS:
    input - Where to read an input file
    output - Where to output our input file
```
