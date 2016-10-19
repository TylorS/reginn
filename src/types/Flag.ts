import { Alias } from './Alias';

export type FlagType = 'string' | 'boolean';

export interface Flag {
  type: 'flag';
  flagType: FlagType;
  aliases: Array<Alias>;
  description?: string;
}