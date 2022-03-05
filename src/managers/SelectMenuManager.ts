import { SelectMenu } from '../typings/SelectMenu';

// Select Menus
import AdminSelectMenu from '../selectMenus/AdminSelectMenu';
import DbAdminSelectMenu from '../selectMenus/DbAdminSelectMenu';
import GuildSettingsNotificationsSelectMenu from '../selectMenus/GuildSettingsNotificationsSelectMenu';
import ServerLanguageSelectMenu from '../selectMenus/ServerLanguageSelectMenu';
import UserLanguageSelectMenu from '../selectMenus/UserLanguageSelectMenu';
import ServerLanguageSettingsSelectMenu from '../selectMenus/ServerLanguageSettingsSelectMenu';

const SelectMenus: SelectMenu[] = [
  AdminSelectMenu,
  DbAdminSelectMenu,
  GuildSettingsNotificationsSelectMenu,
  ServerLanguageSelectMenu,
  ServerLanguageSettingsSelectMenu,
  UserLanguageSelectMenu,
];

export default SelectMenus;
