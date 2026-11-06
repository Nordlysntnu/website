import * as migration_20261105_230845_initial_v01 from './20261105_230845_initial_v01';
import * as migration_20261105_230846_administrator_guards from './20261105_230846_administrator_guards';
import * as migration_20261106_142318_website_publication from './20261106_142318_website_publication';

export const migrations = [
  {
    up: migration_20261105_230845_initial_v01.up,
    down: migration_20261105_230845_initial_v01.down,
    name: '20261105_230845_initial_v01',
  },
  {
    up: migration_20261105_230846_administrator_guards.up,
    down: migration_20261105_230846_administrator_guards.down,
    name: '20261105_230846_administrator_guards',
  },
  {
    up: migration_20261106_142318_website_publication.up,
    down: migration_20261106_142318_website_publication.down,
    name: '20261106_142318_website_publication'
  },
];
