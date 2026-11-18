<script setup lang="ts">
import { COPPER_PER_SILVER } from '~~/shared/constants/economy';
import copperIcon from '~/assets/images/coin_copper_icon.png';
import silverIcon from '~/assets/images/coin_silver_icon.png';
import { LOGS_ECONOMY } from '~/assets/ts/constants/content/account';

interface IProps {
    /** Amount in copper crowns; invalid values show the missing-value state. */
    value: number | null | undefined;
    /** Display copper only or split the amount into silver and copper. */
    mode?: 'copper' | 'coins';
    /** Add a plus sign to positive amounts. */
    signed?: boolean;
}

interface IMoneyPart {
    currency: 'silver' | 'copper';
    amount: number;
    icon: string;
    title: string;
}

const props = withDefaults(defineProps<IProps>(), {
    mode: 'copper',
    signed: false,
});

const numberFormatter = new Intl.NumberFormat('ru-RU');

const pluralRules = new Intl.PluralRules('ru-RU');

const currencyNames = LOGS_ECONOMY.money.currencyNames;

const validValue = computed(() => {
    if (typeof props.value !== 'number' || !Number.isSafeInteger(props.value)) {
        return null;
    }

    return props.value;
});

const prefix = computed(() => {
    if (validValue.value === null) {
        return '';
    }

    if (validValue.value < 0) {
        return '−';
    }

    return props.signed && validValue.value > 0 ? '+' : '';
});

const parts = computed<IMoneyPart[]>(() => {
    if (validValue.value === null) {
        return [];
    }

    const amount = Math.abs(validValue.value);
    const copper: IMoneyPart = {
        currency: 'copper',
        amount,
        icon: copperIcon,
        title: LOGS_ECONOMY.money.copperTitle,
    };

    if (props.mode === 'copper') {
        return [copper];
    }

    return [
        {
            currency: 'silver',
            amount: Math.floor(amount / COPPER_PER_SILVER),
            icon: silverIcon,
            title: LOGS_ECONOMY.money.silverTitle,
        },
        {
            ...copper,
            amount: amount % COPPER_PER_SILVER,
        },
    ];
});

const accessibleLabel = computed(() => {
    if (validValue.value === null) {
        return LOGS_ECONOMY.money.missingAmount;
    }

    const amounts = parts.value.map((part) => {
        const names: Record<string, string> = currencyNames[part.currency];
        const unit = names[pluralRules.select(part.amount)] ?? part.title;

        return `${numberFormatter.format(part.amount)} ${unit}`;
    });

    if (prefix.value === '−') {
        return [LOGS_ECONOMY.money.minus, ...amounts].join(' ');
    }

    if (prefix.value === '+') {
        return [LOGS_ECONOMY.money.plus, ...amounts].join(' ');
    }

    return amounts.join(' ');
});
</script>

<template>
    <span
        :class="$style.money"
        role="img"
        :aria-label="accessibleLabel"
        data-test="economy-money"
    >
        <span v-if="validValue === null" aria-hidden="true">
            {{ LOGS_ECONOMY.money.missingValue }}
        </span>

        <span
            v-else
            :class="$style.content"
            aria-hidden="true"
        >
            <span
                v-for="(part, index) in parts"
                :key="part.currency"
                :class="$style.part"
            >
                <span>
                    {{ index === 0 ? prefix : '' }}{{ numberFormatter.format(part.amount) }}
                </span>

                <img
                    :src="part.icon"
                    :class="$style.coin"
                    :title="part.title"
                    width="22"
                    height="22"
                    alt=""
                >
            </span>
        </span>
    </span>
</template>

<style module lang="scss">
.money {
    display: inline-flex;
    vertical-align: middle;
    max-width: 100%;
    color: inherit;
    font-variant-numeric: tabular-nums;
}

.content {
    display: inline-flex;
    flex-wrap: wrap;
    gap: $space-8;
    align-items: center;
}

.part {
    display: inline-flex;
    gap: 0;
    align-items: center;
    color: inherit;
}

.coin {
    flex-shrink: 0;
    object-fit: contain;
    image-rendering: pixelated;
    width: rem(22);
    height: rem(22);
}
</style>
