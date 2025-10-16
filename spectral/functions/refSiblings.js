"use strict";

import {createRulesetFunction} from "@stoplight/spectral-core";
import {isObject} from "./utils/isObject";

/**
 * Получает значение родительского ключа по JSON-пути.
 *
 * @param {unknown} document - Полный документ, в котором ведётся проверка
 * @param {Array<string|number>} path - JSON-путь (список ключей до нужного значения)
 * @returns {unknown} - Возвращает родительский объект для текущего пути или null, если путь некорректен
 */
function getParentValue(document, path) {
    if (path.length === 0) {
        // В корне нет родителя
        return null;
    }

    // Начинаем с корня документа
    let piece = document;

    // Проходим по всем частям пути, кроме последней — она указывает на текущее значение
    for (let i = 0; i < path.length - 1; i += 1) {
        if (!isObject(piece)) {
            // Если на промежуточном шаге встречаем не объект — дальше идти нельзя
            return null;
        }

        piece = piece[path[i]]; // спускаемся по дереву JSON
    }

    return piece;
}

/**
 * Основная функция проверки.
 * Реализует правило: свойство `$ref` (или аналогичное “ключевое слово”) не должно находиться рядом с другими свойствами.
 *
 * @param {*} targetVal — значение текущего проверяемого узла (Spectral передаёт его сам)
 * @param {*} opts — опции правила (в данном случае не используются)
 * @param {object} ctx — контекст, содержащий `document` (весь JSON) и `path` (путь до текущего значения)
 * @returns {(Array|undefined)} — возвращает массив ошибок, если правило нарушено, или undefined, если всё ок
 */
export default createRulesetFunction(
    {
        input: null,
        options: null,
    },
    function refSiblings(targetVal, opts, {document, path}) {
        // Получаем объект, содержащий текущее свойство
        const value = getParentValue(document.data, path);

        // Проверяем, является ли родитель объектом
        if (!isObject(value)) return;

        const keys = Object.keys(value);

        // Если объект содержит только одно свойство (например, только "$ref"), всё ок
        if (keys.length === 1) {
            return;
        }

        // Здесь мы будем накапливать найденные нарушения
        const results = [];

        // actualObjPath = путь к самому объекту (без последнего элемента, т.е. без имени проверяемого свойства)
        const actualObjPath = path.slice(0, -1);

        // Перебираем все ключи родителя
        for (const key of keys) {
            // Проверяем, есть ли в объекте "особое" поле (например "$ref")
            if (key === "ref") {
                // Пропускаем само поле $ref — ошибка должна ставиться на остальные
                continue;
            }

            // Добавляем ошибку: $ref (или аналог) не должен находиться рядом с другими свойствами
            results.push({
                message: "Поле \"$ref\" не должно быть размещено рядом с другими свойствами.",
                path: [...actualObjPath, key],
            });
        }

        // Возвращаем список найденных нарушений
        return results;
    }
);