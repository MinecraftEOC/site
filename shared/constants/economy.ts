export const COPPER_PER_SILVER = 32;
export const ECONOMY_FILTER_MAX_LENGTH = 128;

export const ECONOMY_FLOW_KINDS = ['emission', 'sink', 'cash_to_bank', 'bank_to_cash', 'transfer', 'manual_adjustment'] as const;

export const ECONOMY_FLOW_LABELS: Readonly<Record<string, string>> = {
    emission: 'Поступление новых денег',
    sink: 'Выбытие денег',
    cash_to_bank: 'Наличные → банк',
    bank_to_cash: 'Банк → наличные',
    transfer: 'Перевод между счетами',
    manual_adjustment: 'Ручная корректировка счёта',
};

export const ECONOMY_OPERATION_LABELS: Readonly<Record<string, string>> = {
    starting_items: 'Выдача стартовых монет',
    trade_sell: 'Продажа предмета NPC',
    trade_buy: 'Покупка предмета у NPC',
    guild_craft_fee: 'Крафт на чужом гильдейском станке',
    guild_order_cash: 'Наличная награда за заказ гильдии',
    guild_order_tax: 'Налог в казну с заказа гильдии',
    guild_order_leader: 'Доля лидеру с заказа гильдии',
    guild_treasury_transfer: 'Перевод баланса гильдии в казну',
    guild_treasury_burn: 'Сгорание остатка баланса гильдии',
    guild_treasury_bonus: 'Доплата гильдии в казну за успешную проверку',
    guild_points_purchase: 'Покупка ОД/ОИ гильдии за наличные',
    manufactory_order: 'Награда за заказ мануфактуры',
    manufactory_forfeit: 'Неустойка за заказ мануфактуры',
    manufactory_tax: 'Налог мануфактуры в казну',
    manufactory_expand: 'Оплата расширения мануфактуры',
    city_challenge: 'Оплата городского вызова из казны',
    council_salary: 'Зарплата члену совета',
    council_prize: 'Премия члену совета',
    election_fee: 'Пошлина за участие в выборах',
    real_estate_purchase: 'Покупка недвижимости',
    bank_deposit: 'Внесение наличных в банк',
    bank_withdraw: 'Снятие наличных из банка',
    bank_transfer: 'Банковский перевод',
    bank_tax: 'Уплата налога через банк',
    bank_file_edit: 'Правка файла банковского счёта',
};

export const ECONOMY_OWNER_LABELS: Readonly<Record<string, string>> = {
    cash: 'Наличные',
    treasury: 'Казна',
    player: 'Игрок',
    guild: 'Гильдия',
    manufactory: 'Мануфактура',
    account: 'Банковский счёт',
};

export const ECONOMY_METRIC_LABELS: Readonly<Record<string, string>> = {
    emission_total: 'Поступило новых денег',
    sink_total: 'Выбыло из экономики',
    net_change: 'Изменение денежной массы',
    cash_to_bank_total: 'Оборот внесения наличных',
    bank_to_cash_total: 'Оборот снятия наличных',
    transfer_total: 'Оборот переводов между счетами',
    manual_adjustment_net: 'Чистая сумма ручных правок',
};

export const ECONOMY_FILTER_KEYS = ['flowKind', 'operationType', 'sessionIndex', 'actor', 'account', 'minAmount', 'maxAmount'] as const;
export type TEconomyFilterKey = typeof ECONOMY_FILTER_KEYS[number];
export type TEconomyFilterInputs = Record<TEconomyFilterKey, string>;

export function createEconomyFilterInputs(): TEconomyFilterInputs {
    return { flowKind: '', operationType: '', sessionIndex: '', actor: '', account: '', minAmount: '', maxAmount: '' };
}
