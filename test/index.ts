/// <reference path="../node_modules/@types/node/index.d.ts" />
/// <reference path="../node_modules/@types/mocha/index.d.ts" />

import * as assert from 'assert';
import * as sinon from 'sinon';
import { run, app, command, alias, flag, description, withPromise, withCallback } from '../src';
import { yellow, white } from '../src/utils';

describe('Reginn', () => {
  describe('app', () => {
    it('should compose with other apps', () => {
      const app1 = app(
        command(alias('hello'), flag('string', alias('option1'))),
        flag('string', alias('option1'))
      );

      const app2 = app(
        command(alias('bye'), flag('string', alias('option2'))),
        flag('string', alias('option2')),
      );

      const app3 = app(app1, app2);

      assert(app3.commands.length === 2);
      assert.strictEqual((app3.flags as any).string[0], 'option1');
      assert.strictEqual((app3.flags as any).string[1], 'option2');
    });
  });

  describe('help', () => {
    it('should add a help commmand', (done) => {
      const sandbox = sinon.sandbox.create();
      const stub = sandbox.stub(console, 'log');

      const cmd = command(alias('hello'), description('Hello Command'),
        flag('string', alias('option', 'o'), description('option flag')));

      const cmd2 = command(alias('hi'), description('Hi Command'),
        flag('string', alias('option', 'o'), description('option flag')));

      const helpMessage = `
hello  -  Hello Command
  --option, -o  :  option flag

hi  -  Hi Command
  --option, -o  :  option flag`;

      run(['hello', '--help'], app(cmd, cmd2)).then(() => {
        assert(stub.withArgs(helpMessage));
        sandbox.restore();
        done();
      }).catch((err) => {
        sandbox.restore();
        done(err);
      });
    });
  });

  describe('run', () => {
    it('should return an application object describing what it did', () => {
      const sandbox = sinon.sandbox.create();
      const spy = sandbox.spy();

      const cmd = command(alias('hello'));

      cmd.handler = spy;

      return run(['hello', 'world'], cmd).then((x: any) => {
        assert(x.type === 'app');
        assert(x.args.join(' ') === 'hello world');
        assert(spy.calledOnce);
        sandbox.restore();
      });
    });

    it('should execute a commands handler', (done) => {
      const cmd = command(alias('hello'));

      const promise = withPromise(cmd);

      run(['hello', 'world'], cmd);

      promise.then(({ args }) => {
        assert(Array.isArray(args));
        assert(args[0] === 'world');
        done();
      });
    });

    it('should show a warning when a command is matched without a handler', (done) => {
      const sandbox = sinon.sandbox.create();
      const stub = sandbox.stub(console, 'log');

      const cmd = command(alias('test'));

      run(['test'], cmd).then(() => {
        sinon.assert.calledOnce(stub);
        sinon.assert.calledWithExactly(stub,
          sinon.match(yellow('test') + white(' does not have an associated handler!')));

        sandbox.restore();
        done();
      }).catch(error => {
        sandbox.restore();
        done(error);
      });
    });

    it('should handle commands without an alias', (done) => {
      const cmd = command(flag('string', alias('option')));

      withPromise(cmd).then(({ args, options }) => {
        assert(typeof options === 'object');
        assert(options.option === 'thing');
        assert.deepEqual(args, ['hi']);
        done();
      });

      run(['hi', '--option', 'thing'], cmd);
    });

    it('should handle commands with subcommands', (done) => {
      const child = command(alias('commit'), flag('boolean', alias('--dry-run')));

      withCallback(child, ({ options }) => {
        assert(options.dryRun);
        done();
      });

      const parent = command(alias('git'), child);
      withPromise(parent).then(run);

      run(['git', 'commit', '--dry-run'], parent);
    });
  });
});