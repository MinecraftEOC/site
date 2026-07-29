import type { INotification, TNotification } from '~/@types/notifications';
import { ENotificationType } from '~/assets/ts/enums/common';

export const useNotificationStore = defineStore('notification', () => {
    const REMOVE_TIMER = 10000;
    let lastId = 0;

    const list = ref<INotification[]>([]);

    function add(title: string, text: string = '', type: TNotification = ENotificationType.Success) {
        const id = ++lastId;
        list.value.push({ id, type, title, text });

        setTimeout(() => {
            remove(id);
        }, REMOVE_TIMER);
    }

    function remove(id: number) {
        list.value = list.value.filter(item => item.id !== id);
    }

    function removeAll() {
        list.value = [];
    }

    return {
        list,

        add,
        remove,
        removeAll,
    };
});
