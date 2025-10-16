"use strict";
const {createRulesetFunction} = require('@stoplight/spectral-core');

/**
 * Функция возвращает индексы элементов массива tags,
 * у которых повторяются значения поля "name".
 *
 * @param {Array<{ name: string }>} tags — массив тегов, где каждый тег — объект с полем name
 * @returns {number[]} — массив индексов дублирующихся тегов
 */
function getDuplicateTagsIndexes(tags) {
    return tags
        .map(item => item.name) // получаем массив имён тегов
        .reduce((acc, item, i, arr) => {
            // если indexOf(name) !== текущему индексу, значит элемент повторяется
            if (arr.indexOf(item) !== i) {
                acc.push(i);
            }
            return acc;
        }, []);
}

/**
 * Основная функция проверки.
 * Проверяет, что имена тегов уникальны (т.е. нет дубликатов).
 */
export default createRulesetFunction(
    {
        // Описание входных данных (input): ожидаем массив объектов вида { name: string }
        input: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {type: "string"},
                },
                required: ["name"],
            },
        },
        options: null, // дополнительных опций у функции нет
    },
    /**
     * Собственно реализация проверки.
     * @param {Array<{ name: string }>} targetVal — фактическое значение, которое проверяется
     * @param {*} _ — неиспользуемый аргумент (опции)
     * @param {object} ctx — контекст Spectral, содержит путь `path` внутри проверяемого документа
     * @returns {Array<object>} — массив результатов (ошибок), либо пустой, если всё корректно
     */
    function uniquenessTags(targetVal, _, ctx) {
        // Находим индексы дубликатов
        const duplicatedTags = getDuplicateTagsIndexes(targetVal);

        // Если дубликатов нет — возвращаем пустой массив (нет ошибок)
        if (duplicatedTags.length === 0) return [];

        const results = [];

        // Для каждого повторяющегося тега добавляем сообщение об ошибке
        for (const duplicatedIndex of duplicatedTags) {
            const duplicatedTag = targetVal[duplicatedIndex].name;
            results.push({
                message: `"tags" object contains duplicate tag name "${duplicatedTag}".`,
                path: [...ctx.path, duplicatedIndex, "name"], // указываем путь к проблемному элементу
            });
        }

        return results;
    }
);