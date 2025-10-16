"use strict";
import {createRulesetFunction} from "@stoplight/spectral-core";
import {isObject} from "./utils/isObject";
import {getAllOperations} from "./utils/getAllOperations";

export default createRulesetFunction(
    {
        // На вход функции ожидается объект (весь документ OpenAPI)
        input: {
            type: "object",
        },
        options: null, // никаких дополнительных опций нет
    },
    function oasTagDefined(targetVal) {
        // Список найденных несоответствий (ошибок)
        const results = [];

        // Собираем все глобальные теги в документе
        const globalTags = [];

        if (Array.isArray(targetVal.tags)) {
            for (const tag of targetVal.tags) {
                // Тег считается корректным, если это объект с полем name типа string
                if (isObject(tag) && typeof tag.name === "string") {
                    globalTags.push(tag.name);
                }
            }
        }

        // Достаём список всех операций (paths)
        const {paths} = targetVal;

        // Перебираем операции
        for (const {path, operation, value} of getAllOperations(paths)) {
            if (!isObject(value)) continue;

            const {tags} = value;

            // Если у операции нет массива тегов — просто пропускаем
            if (!Array.isArray(tags)) {
                continue;
            }

            // Проверяем каждый тег операции
            tags.forEach((tag, i) => {
                if (!globalTags.includes(tag)) {
                    results.push({
                        message: "Operation tags must be defined in global tags.",
                        path: ["paths", path, operation, "tags", i],
                    });
                }
            });
        }

        // Возвращаем список ошибок (пустой — если всё корректно)
        return results;
    }
);