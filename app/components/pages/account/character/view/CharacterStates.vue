<script setup lang="ts">
import type { ICharacterStates } from '~~/shared/@types/character';

import { CHARACTER_PARAMETERS, CHARACTER_PARAMETERS_COLUMN_SIZE } from '~/assets/ts/constants/character';
import { CHARACTER_FORM_PARAMETERS } from '~/assets/ts/constants/content/account';

import CharacterFormTemplate from '~/components/pages/account/character/form/CharacterFormTemplate.vue';

interface IProps {
    /** Распределённые характеристики персонажа: параметры вместе с навыками */
    states: ICharacterStates;
}

defineProps<IProps>();

const cols = [
    CHARACTER_PARAMETERS.slice(0, CHARACTER_PARAMETERS_COLUMN_SIZE),
    CHARACTER_PARAMETERS.slice(CHARACTER_PARAMETERS_COLUMN_SIZE),
];
</script>

<template>
    <CharacterFormTemplate :title="CHARACTER_FORM_PARAMETERS.title">
        <div :class="$style.parameters">
            <div
                v-for="(col, index) in cols"
                :key="index"
                :class="$style.col"
            >
                <div
                    v-for="param in col"
                    :key="param.value"
                    :class="$style.param"
                >
                    <div :class="$style.paramHeader">
                        <div :class="$style.paramTitle">
                            <VIcon
                                :name="param.icon"
                                :size="16"
                                :class="$style.paramIcon"
                            />

                            {{ param.label }}

                            <VTooltip :text="param.hint">
                                <VIcon
                                    name="info"
                                    :size="12"
                                    :class="$style.paramTooltipIcon"
                                />
                            </VTooltip>
                        </div>

                        <div :class="$style.value">
                            {{ states.parameters?.[param.value] }}
                        </div>
                    </div>

                    <div :class="$style.skills">
                        <div
                            v-for="skill in param.skills"
                            :key="skill.value"
                            :class="$style.skill"
                        >
                            <VTooltip :text="skill.hint">
                                <div :class="$style.skillTitle">
                                    {{ skill.label }}
                                </div>
                            </VTooltip>

                            <div :class="$style.value">
                                {{ states.skills?.[skill.value] }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </CharacterFormTemplate>
</template>

<style module lang="scss">
.parameters {
    display: flex;
    gap: $space-16;

    @include respond-to(mobile) {
        flex-direction: column;
    }
}

.col {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: $space-16;
    justify-content: space-between;
}

.param {
    display: flex;
    flex-direction: column;
    gap: $space-8;
}

.paramHeader {
    display: flex;
    gap: $space-8;
    justify-content: space-between;
    align-items: center;
}

.paramTitle {
    @include l2;

    display: flex;
    gap: $space-4;
    align-items: center;
}

.paramIcon {
    color: $text-link;
}

.paramTooltipIcon {
    color: $text-muted;
    cursor: pointer;
}

.skills {
    display: flex;
    flex-direction: column;
    gap: $space-4;
}

.skill {
    display: flex;
    gap: $space-8;
    justify-content: space-between;
    align-items: center;
}

.skillTitle {
    @include l3;

    color: $text-secondary;
    cursor: pointer;
    transition: opacity $default-transition;

    @include hover {
        opacity: .8;
    }
}

.value {
    @include mono2;

    display: flex;
    flex-shrink: 0;
    justify-content: center;
    align-items: center;
    min-width: rem(28);
    height: rem(24);
    padding: 0 $space-8;
    border: 1px solid $border-subtle;
    border-radius: $radius-4;
    background-color: $surface-sunken;
}
</style>
