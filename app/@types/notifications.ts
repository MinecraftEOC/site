import type { ENotificationType } from '~/assets/ts/enums/common';

export type TNotification = ENotificationType.Success | ENotificationType.Error;

export interface INotification {
    id: number;
    type: TNotification;
    title: string;
    text: string;
}
