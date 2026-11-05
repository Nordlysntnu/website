import * as guards from './20261105_230846_administrator_guards'
import * as migration_20261105_230845_initial_v01 from './20261105_230845_initial_v01';

export const migrations = [
  {
    up: migration_20261105_230845_initial_v01.up,
    down: migration_20261105_230845_initial_v01.down,
    name: '20261105_230845_initial_v01'
  },
  { up: guards.up, down: guards.down, name: '20261105_230846_administrator_guards' },
];
