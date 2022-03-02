import { Command } from '../typings/Command';

// Commands
import About from '../commands/About';
import Admin from '../commands/Admin';
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

const Commands: Command[] = [
  About,
  Admin,
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
];

export default Commands;
