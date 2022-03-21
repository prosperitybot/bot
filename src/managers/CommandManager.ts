import { Command } from '../typings/Command';

// Commands
import About from '../commands/About';
import Admin from '../commands/Admin';
// eslint-disable-next-line import/no-cycle
import Help from '../commands/Help';
import IgnoredChannels from '../commands/IgnoredChannels';
import IgnoredRoles from '../commands/IgnoredRoles';
import Import from '../commands/Import';
import Language from '../commands/Language';
import Leaderboard from '../commands/Leaderboard';
import Level from '../commands/Level';
import LevelRoles from '../commands/LevelRoles';
import Levels from '../commands/Levels';
import Settings from '../commands/Settings';
import Whitelabel from '../commands/Whitelabel';
import Xp from '../commands/Xp';

const Commands: Command[] = [
  About,
  Admin,
  Help,
  IgnoredChannels,
  IgnoredRoles,
  Import,
  Language,
  Leaderboard,
  Level,
  LevelRoles,
  Levels,
  Settings,
  Whitelabel,
  Xp,
];

export default Commands;
