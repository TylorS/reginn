import { Flag, FlagType, Alias, Description } from '../types';

import { reduce } from 'ramda';

export function flag(flagType: FlagType, ...definitions: Array<Alias | Description>): Flag {
  const { alias, description } = reduce(toType, { alias: [] }, definitions);
  return new ReginnFlag(flagType, alias, description);
}

function toType (acc: { alias: Array<Alias>, description?: string },
                 definition: Alias | Description) {
  if (definition.type === 'alias') {
    acc.alias = acc.alias.concat([ definition ]);
  }

  if (definition.type === 'description') {
    acc.description = definition.description;
  }

  return acc;
}

class ReginnFlag implements Flag {
  public type: 'flag' = 'flag';
  public flagType: FlagType;
  public aliases: Array<Alias>;
  public description: string | undefined;

  constructor (flagType: FlagType, aliases: Array<Alias>, description?: string) {
    this.flagType = flagType;
    this.aliases = aliases;
    this.description = description;
  }
}