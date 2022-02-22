import { Command } from '../typings/Command';

// Commands
import About from '../commands/About';
import Admin from '../commands/Admin';
import IgnoredChannels from '../commands/IgnoredChannels';
import IgnoredRoles from '../commands/IgnoredRoles';
import Import from '../commands/Import';
import Language from '../commands/Language';
import Leaderboard from '../commands/Leaderboard';

const Commands: Command[] = [
  About,
  Admin,
  IgnoredChannels,
  IgnoredRoles,
  Import,
  Language,
  Leaderboard,
];

export default Commands;
