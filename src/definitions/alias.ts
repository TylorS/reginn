import { Alias } from '../types';

export function alias (name: string, abbreviation?: string): Alias {
  return new ReginnAlias(replaceDash(name), replaceDash(abbreviation || name));
}

class ReginnAlias implements Alias {
  public type: 'alias' = 'alias';
  public name: string;
  public abbreviation: string;

  constructor (name: string, abbreviation: string) {
    this.name = name;
    this.abbreviation = abbreviation;
  }
}

function replaceDash (str: string) {
  return str.replace('/-+/', '');
}
