"use strict";
import {unreferencedReusableObject} from '@stoplight/spectral-functions';
import {createRulesetFunction} from '@stoplight/spectral-core';
import {isObject} from './utils/isObject';

export default createRulesetFunction(
    {
        // Указываем, что входной объект должен содержать "components"
        input: {
            type: "object",
            properties: {
                components: {
                    type: "object",
                },
            },
            required: ["components"],
        },
        options: null, // без дополнительных опций
    },

    function oasUnusedComponent(targetVal, opts, context) {
        const results = [];

        // Список всех возможных типов reusable-компонентов в OpenAPI.
        const componentTypes = [
            "schemas",
            "responses",
            "parameters",
            "examples",
            "requestBodies",
            "headers",
            "links",
            "callbacks",
        ];

        // Перебираем все секции components
        for (const type of componentTypes) {
            const value = targetVal.components[type];
            if (!isObject(value)) continue;

            // Проверка неиспользуемых элементов внутри каждой категории (schemas, responses, ...).
            const resultsForType = unreferencedReusableObject(
                value,
                {reusableObjectsLocation: `#/components/${type}`},
                context
            );

            // Если функция вернула массив результатов — добавим их к общему списку.
            if (Array.isArray(resultsForType)) {
                results.push(...resultsForType);
            }
        }

        // Возвращаем все найденные предупреждения / ошибки.
        return results;
    }
);