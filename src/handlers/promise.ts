import { Command, HandlerOptions, HandlerApp } from '../types';

export function withPromise(command: Command): Promise<HandlerOptions | HandlerApp> {
  let resolve: (x: HandlerOptions | HandlerApp) => any;

  const promise = new Promise<HandlerOptions | HandlerApp>((_resolve) => {
    resolve = _resolve;
  });

  command.handler = function (x: HandlerOptions | HandlerApp) {
    resolve(x);
  };

  return promise as Promise<HandlerOptions | HandlerApp>;
}