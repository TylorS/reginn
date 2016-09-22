import { describe, it } from 'mocha'
import assert from 'power-assert'
import sinon from 'sinon'
import { colors } from '@northbrook/util'

import { alias, type, flag, desc, command, app, run,
         withCallback, asPromise, asStream, help } from '../packages/reginn/reginn'

describe('reginn', () => {
  describe('alias', () => {
    it('should return an alias Object', () => {
      const x = alias('test', 't')
      assert(x.type === 'alias')
      assert.deepEqual(x.value, ['test', 't'])
    })

    it('should default to an alias of the same value', () => {
      const x = alias('test')
      assert(x.type === 'alias')
      assert.deepEqual(x.value, ['test', 'test'])
    })
  })

  describe('type', () => {
    it('should return a type object', () => {
      const x = type('boolean')
      assert(x.type === 'type')
      assert(x.value === 'boolean')
    })
  })

  describe('desc', () => {
    it('should return a description type', () => {
      const x = desc('hello')
      assert(x.type === 'desc')
      assert(x.value === 'hello')
    })
  })

  describe('flag', () => {
    it('should create a flag object', () => {
      const x = flag()
      assert(x.type === 'flag')
      assert(x.flagType === 'string')
    })

    it('should be able to be given a new flagType', () => {
      const x = flag(type('boolean'))
      assert(x.type === 'flag')
      assert(x.flagType === 'boolean')
    })

    it('should be able to be given an alias', () => {
      const x = flag(alias('option'))
      assert(x.type === 'flag')
      assert(x.flagType === 'string')
      assert(Array.isArray(x.alias))
      assert.deepEqual(x.alias, [['option', 'option']])
    })

    it('should be able to be given a description', () => {
      const x = flag(desc('hi'))
      assert(x.type === 'flag')
      assert(x.flagType === 'string')
      assert(x.desc === 'hi')
    })
  })

  describe('command', () => {
    it('should create a command object', () => {
      const x = command()
      assert(x.type === 'command')
    })

    it('should accept aliases', () => {
      const x = command(alias('option'))
      assert(x.type === 'command')
      assert(Array.isArray(x.alias))
      assert.deepEqual(x.alias, [['option', 'option']])
    })

    it('should accept flags', () => {
      const x = command(flag(alias('option')))
      assert(x.type === 'command')
      assert(typeof x.flag === 'object')
      assert(typeof x.flag.string === 'object')
      assert(Array.isArray(x.flag.string))
      assert.deepEqual(x.flag.string, ['option'])
    })

    it('should accept a description', () => {
      const x = command(desc('hi'))
      assert(x.type === 'command')
      assert(x.desc === 'hi')
    })

    it('should accept subcommands', () => {
      const x = command(alias('test'), command(flag(alias('option'))))
      assert(x.type === 'command')
      assert(Array.isArray(x.command))

      const y = x.command[0]

      assert(typeof y.flag === 'object')
      assert(typeof y.flag.string === 'object')
      assert(Array.isArray(y.flag.string))
      assert.deepEqual(y.flag.string, ['option'])
    })
  })

  describe('app', () => {
    it('should create an app object', () => {
      const x = app()
      assert(x.type === 'app')
      assert(Array.isArray(x.command))
    })

    it('should compose commands', () => {
      function assertCommand (y) {
        assert(typeof y.flag === 'object')
        assert(typeof y.flag.string === 'object')
        assert(Array.isArray(y.flag.string))
        assert.deepEqual(y.flag.string, ['option'])
      }

      const x = app(command(flag(alias('option'))), command(flag(alias('option'))))
      assert(x.type === 'app')
      assert(Array.isArray(x.command))
      assert(x.command.length === 2)

      assertCommand(x.command[0])
      assertCommand(x.command[1])
    })
  })

  describe('handlers', () => {
    describe('withCallback', () => {
      it('should add a handler to a command', () => {
        const x = command()
        withCallback(x, () => {})
        assert(typeof x.handler === 'function')
      })
    })

    describe('asPromise', () => {
      it('should add a handler returning a promise', () => {
        const x = command()
        const y = asPromise(x)

        assert(typeof x.handler === 'function')
        assert(y instanceof Promise)
      })
    })

    describe('asStream', () => {
      it('should add a handler and return a Stream', () => {
        const x = command()
        const y = asStream(x)

        assert(typeof x.handler === 'function')
        assert(typeof y.observe === 'function')
      })
    })
  })

  describe('help', () => {
    it('should throw without a name', () => {
      assert.throws(() => {
        help()
      })
    })

    it('should return an app with help command', () => {
      const cmd = command(alias('hi'))
      const app = help('name', cmd)

      assert(app.type === 'app')
      assert(app.command[1].alias[0][0] === 'help')
    })
  })

  describe('run', () => {
    it('should throw if not given a command', () => {
      assert.throws(() => {
        run()
      })
    })

    it('should return an application object describing what it did', () => {
      const sandbox = sinon.sandbox.create()
      const spy = sandbox.spy()

      const cmd = command(alias('hello'))

      cmd.handler = spy

      const x = run(['hello', 'world'], cmd)
      assert(x.type === 'app')
      assert(x.args.join(' ') === 'hello world')

      assert(spy.calledOnce)

      sandbox.restore()
    })

    it('should execute a commands handler', () => {
      const cmd = command(alias('hello'))

      const promise = asPromise(cmd)

      run(['hello', 'world'], cmd)

      return promise.then(({ args }) => {
        assert(Array.isArray(args))
        assert(args.join(' ') === 'world')
      })
    })

    it('should show a warning when a command is matched without a handler', () => {
      const sandbox = sinon.sandbox.create()
      sandbox.stub(console, 'log')

      const cmd = command(alias('test'))

      run(['test'], cmd)

      sinon.assert.calledOnce(console.log)
      sinon.assert.calledWithExactly(console.log,
        sinon.match(colors.yellow('test') + colors.white(' does not have an associated handler!')))

      sandbox.restore()
    })

    it('should handle commands without an alias', (done) => {
      const cmd = command(flag(alias('option')))

      asStream(cmd).observe(({ args, options }) => {
        assert(typeof options === 'object')
        assert(options.option === 'thing')
        assert.deepEqual(args, ['hi'])
        done()
      })

      run(['hi', '--option', 'thing'], cmd)
    })

    it('should handle commands with subcommands', (done) => {
      const child = command(alias('commit'), flag(type('boolean'), alias('--dry-run')))

      withCallback(child, ({ args, options }) => {
        assert(options.dryRun)
        done()
      })

      const parent = command(alias('git'), child)
      asPromise(parent).then(run)

      run(['git', 'commit', '--dry-run'], parent)
    })
  })
})
