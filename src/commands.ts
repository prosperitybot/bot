import { Command } from './types/Command';

// Commands
import About from './commands/about';
import Admin from './commands/admin';
import Import from './commands/import';

const Commands: Command[] = [
  About,
  Admin,
  Import,
];

export default Commands;
