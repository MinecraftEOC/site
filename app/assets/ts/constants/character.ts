import { CharacterStatus } from '~~/generated/prisma/enums';
import { ACCOUNT_ROUTES } from '~/assets/ts/constants/routes';
import { EBadgeColor } from '~/assets/ts/enums/common';

export const CHARACTER_STATUS_COLOR: Record<CharacterStatus, EBadgeColor> = {
    [CharacterStatus.ACTIVE]: EBadgeColor.Success,
    [CharacterStatus.UNVERIFIED]: EBadgeColor.Info,
    [CharacterStatus.RETURNED]: EBadgeColor.Warning,
    [CharacterStatus.BANNED]: EBadgeColor.Danger,
    [CharacterStatus.DEAD]: EBadgeColor.Danger,
    [CharacterStatus.UNAVAILABLE]: EBadgeColor.Warning,
};

export const CHARACTER_STATUS_LINK: Partial<Record<CharacterStatus, string>> = {
    [CharacterStatus.ACTIVE]: ACCOUNT_ROUTES.character,
    [CharacterStatus.UNVERIFIED]: ACCOUNT_ROUTES.characterEdit,
    [CharacterStatus.RETURNED]: ACCOUNT_ROUTES.characterEdit,
};
