<script setup lang="ts">
import type { ICharacterParameters, ICharacterSkills } from '~~/shared/@types/character';
import type { ECharacterParameter, ECharacterPreset, ECharacterSkill } from '~/assets/ts/enums/character';
import { MAX_PARAMETER_VALUE, MAX_PARAMETERS_POINTS, MAX_SKILL_VALUE, MAX_SKILLS_POINTS, PARAMETER_CHEAP_VALUE, PARAMETER_EXPENSIVE_COST, PARAMETERS_DEFAULT_VALUE, SKILLS_DEFAULT_VALUE } from '~~/shared/constants/character';
import { CHARACTER_PARAMETERS, CHARACTER_PARAMETERS_COLUMN_SIZE, CHARACTER_PRESET_VALUES, CHARACTER_PRESETS } from '~/assets/ts/constants/character';
import { CHARACTER_FORM_PARAMETERS } from '~/assets/ts/constants/content/account';
import { ESize } from '~/assets/ts/enums/common';

import CharacterFormTemplate from '~/components/pages/account/character/form/CharacterFormTemplate.vue';

interface IProps {
    /** Правка уже созданного персонажа: описание блока не выводится */
    isEditable?: boolean;
}

const props = withDefaults(defineProps<IProps>(), {
    isEditable: false,
});

const parameters = defineModel<ICharacterParameters>('parameters', { default: () => ({ ...PARAMETERS_DEFAULT_VALUE }) });
const skills = defineModel<ICharacterSkills>('skills', { default: () => ({ ...SKILLS_DEFAULT_VALUE }) });

const presetValue = ref<ECharacterPreset | null>(null);

const parametersPoints = computed(() => MAX_PARAMETERS_POINTS - getParametersSpent(parameters.value));
const skillsPoints = computed(() => MAX_SKILLS_POINTS - getSkillsSpent(skills.value));

const description = computed(() => !props.isEditable ? CHARACTER_FORM_PARAMETERS.description : '');
const cols = computed(() => [
    CHARACTER_PARAMETERS.slice(0, CHARACTER_PARAMETERS_COLUMN_SIZE),
    CHARACTER_PARAMETERS.slice(CHARACTER_PARAMETERS_COLUMN_SIZE),
]);

function getParameterMax(key: ECharacterParameter): number {
    const current = parameters.value[key];

    let max = current;

    while (max < MAX_PARAMETER_VALUE && getParameterCost(max + 1) - getParameterCost(current) <= parametersPoints.value) {
        max++;
    }

    return max;
}

function getParameterMultiplier(key: ECharacterParameter): number {
    return parameters.value[key] >= PARAMETER_CHEAP_VALUE ? PARAMETER_EXPENSIVE_COST : 1;
}

function getSkillMax(key: ECharacterSkill): number {
    return Math.min(MAX_SKILL_VALUE, skills.value[key] + skillsPoints.value);
}

function setParameter(key: ECharacterParameter, value: number) {
    parameters.value = { ...parameters.value, [key]: value };
}

function setSkill(key: ECharacterSkill, value: number) {
    skills.value = { ...skills.value, [key]: value };
}

watch(presetValue, (newValue) => {
    if (!newValue) {
        parameters.value = { ...PARAMETERS_DEFAULT_VALUE };
        skills.value = { ...SKILLS_DEFAULT_VALUE };

        return;
    }

    const preset = CHARACTER_PRESET_VALUES[newValue];

    parameters.value = { ...preset.parameters };
    skills.value = { ...preset.skills };
});
</script>

<template>
    <CharacterFormTemplate
        :title="CHARACTER_FORM_PARAMETERS.title"
        :description="description"
        :class="$style.CharacterFormParameters"
    >
        <div :class="$style.counts">
            <div :class="$style.countsCard">
                {{ CHARACTER_FORM_PARAMETERS.parameters }}

                <VTooltip :text="CHARACTER_FORM_PARAMETERS.parametersHint" :max-width="260">
                    <VIcon
                        name="info"
                        :size="12"
                        :class="$style.countsHintIcon"
                    />
                </VTooltip>

                <span :class="$style.countsNum">
                    <VNumber :value="parametersPoints" />
                </span>
            </div>
            <div :class="$style.countsCard">
                {{ CHARACTER_FORM_PARAMETERS.skills }}
                <span :class="$style.countsNum">
                    <VNumber :value="skillsPoints" />
                </span>
            </div>
        </div>

        <div :class="$style.presets">
            <div :class="$style.presetsTitle">
                {{ CHARACTER_FORM_PARAMETERS.presetsTitle }}
            </div>

            <VTags
                v-model="presetValue"
                :items="CHARACTER_PRESETS"
                :size="ESize.Small"
            />
        </div>

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

                        <VCounter
                            :model-value="parameters[param.value]"
                            :min="PARAMETERS_DEFAULT_VALUE[param.value]"
                            :max="getParameterMax(param.value)"
                            :multiplier="getParameterMultiplier(param.value)"
                            @update:model-value="setParameter(param.value, $event)"
                        />
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

                            <VCounter
                                :model-value="skills[skill.value]"
                                :max="getSkillMax(skill.value)"
                                @update:model-value="setSkill(skill.value, $event)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </CharacterFormTemplate>
</template>

<style module lang="scss">
.counts {
    display: flex;
    gap: $space-8;
}

.countsCard {
    @include t4;

    display: flex;
    flex: 1;
    gap: $space-4;
    align-items: center;
    height: $space-40;
    padding: $space-8 $space-12;
    border-radius: $radius-4;
    background-color: $surface-sunken;
    color: $text-secondary;
}

.countsHintIcon {
    margin-top: rem(1);
    color: $text-muted;
    cursor: pointer;
}

.countsNum {
    @include mono2;

    margin-left: auto;
}

.presetsTitle {
    @include l4;

    margin-bottom: $space-8;
    color: $text-muted;
}

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
</style>
