import { Command, Handler } from '../types';

export function withCallback (command: Command, handler: Handler): void {
  command.handler = handler;
}