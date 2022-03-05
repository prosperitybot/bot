import { Event } from '../typings/Event';

// Events
import GuildCreateEvent from '../events/GuildCreateEvent';
import GuildDeleteEvent from '../events/GuildDeleteEvent';
import InteractionCreateEvent from '../events/InteractionCreateEvent';
import ReadyEvent from '../events/ReadyEvent';

const Events: Event[] = [
  GuildCreateEvent,
  GuildDeleteEvent,
  InteractionCreateEvent,
  ReadyEvent,
];

export default Events;
