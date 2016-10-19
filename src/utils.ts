import { Command, CommandFlags, Alias, Flag } from './types';
import { mergeWith, is, reduce } from 'ramda';

export type accumulator = { flags: CommandFlags, commands: Array<Command> }

export function addFlag (seed: accumulator, flag: Flag) {
  return reduce((acc: accumulator, alias: Alias) => {
    const newFlag: any = {
      [ flag.flagType ]: alias.name,
      alias: {},
      description: {}
    };

    if (flag.description) {
      newFlag.description[alias.name] = flag.description;
    }

    if (alias.abbreviation !== alias.name) {
      newFlag.alias[alias.name] = alias.abbreviation;
    }

    acc.flags = deepMerge(acc.flags, newFlag);

    return acc;
  }, seed, flag.aliases);
}

export function deepMerge <U, V>(u: U, v: V): U & V {
  return mergeWith(deepMerger, u, v);
}

function deepMerger (x: any, y: any) {
  return is(Object, x) && is(Object, y)
    ? deepMerge(x, y)
    : y;
}

// colors
// foreground colors
export const black = modifier(30, 39);
export const red = modifier(31, 39);
export const green = modifier(32, 39);
export const yellow = modifier(33, 39);
export const blue = modifier(34, 39);
export const magenta = modifier(35, 39);
export const cyan = modifier(36, 39);
export const white = modifier(37, 39);
export const gray = modifier(90, 39);

// modifiers
export const reset = modifier(0, 0);
export const bold = modifier(1, 22);
export const dim = modifier(2, 22);
export const italic = modifier(3, 23);
export const underline = modifier(4, 24);
export const inverse = modifier(7, 27);
export const hidden = modifier(8, 28);
export const strikeThrough = modifier(9, 29);

// backgrounds
export const bgBlack = modifier(40, 49);
export const bgRed = modifier(41, 49);
export const bgGreen = modifier(42, 49);
export const bgYellow = modifier(43, 49);
export const bgBlue = modifier(44, 49);
export const bgMagenta = modifier(45, 49);
export const bgCyan = modifier(46, 49);
export const bgWhite = modifier(47, 49);

export function modifier (open: number, close: number) {
  return function (str: string) {
    return '\u001b[' + open + 'm' + str + '\u001b[' + close + 'm';
  };
}

const isWindows = process.platform === 'win32';

export const cross = isWindows ? '×' : '✖';
