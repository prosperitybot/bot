import { Event } from '../typings/Event';

// Events
import GuildCreateEvent from '../events/GuildCreateEvent';
import GuildMemberAddEvent from '../events/GuildMemberAddEvent';
import GuildDeleteEvent from '../events/GuildDeleteEvent';
import InteractionCreateEvent from '../events/InteractionCreateEvent';
import MessageEvent from '../events/MessageEvent';
import ReadyEvent from '../events/ReadyEvent';

const Events: Event[] = [
  GuildCreateEvent,
  GuildDeleteEvent,
  GuildMemberAddEvent,
  InteractionCreateEvent,
  MessageEvent,
  ReadyEvent,
];

export default Events;
