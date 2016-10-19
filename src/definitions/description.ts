import { Description } from '../types';

export function description (desc: string): Description {
  return new ReginnDescription(desc);
}

class ReginnDescription implements Description {
  public type: 'description' = 'description';
  public description: string;

  constructor (description: string) {
    this.description = description;
  }
}