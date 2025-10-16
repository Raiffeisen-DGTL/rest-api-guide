"use strict";
import {isObject} from "./utils/isObject";
import {createRulesetFunction} from "@stoplight/spectral-core";

function computeFingerprint(param) {
    return `${String(param.in)}-${String(param.name)}`;
}

export default createRulesetFunction(
    {
        // В качестве входа ожидаем массив параметров
        input: {
            type: "array",
        },
        options: null,
    },

    /**
     * Проверка параметров OpenAPI‑операции.
     *
     * @param {Array} params — список параметров операции
     * @param {*} _opts — опции правила (не используются)
     * @param {object} ctx — контекст, содержащий путь `path` к проверяемому элементу
     * @returns {Array<object>} — список ошибок, либо пустой массив
     */
    function oasOpParams(params, _opts, {path}) {
        // Если передан не массив — выходим
        if (!Array.isArray(params)) return;

        // Если параметров меньше двух — дубликатов быть не может
        if (params.length < 2) return;

        // Сюда будут записываться найденные нарушения
        const results = [];

        // Счётчики параметров по типу `in`
        const count = {
            body: [],
            formData: [],
        };

        // Список "отпечатков" параметров для поиска дублей
        const list = [];

        // Индексы дублей параметров
        const duplicates = [];

        let index = -1;

        // Перебираем все параметры
        for (const param of params) {
            index++;

            // Пропускаем не‑объекты
            if (!isObject(param)) continue;

            // Пропускаем ссылки ($ref)
            if ("$ref" in param) continue;

            // Проверяем уникальность комбинации name+in
            const fingerprint = computeFingerprint(param);

            if (list.includes(fingerprint)) {
                duplicates.push(index); // найден дубликат
            } else {
                list.push(fingerprint);
            }

            // Сохраняем индекс для body / formData параметров
            if (typeof param.in === "string" && param.in in count) {
                count[param.in].push(index);
            }
        }

        if (duplicates.length > 0) {
            for (const i of duplicates) {
                results.push({
                    message:
                        'A parameter in this operation already exposes the same combination of "name" and "in" values.',
                    path: [...path, i],
                });
            }
        }

        if (count.body.length > 0 && count.formData.length > 0) {
            results.push({
                message:
                    'Operation must not have both "in:body" and "in:formData" parameters.',
            });
        }

        if (count.body.length > 1) {
            for (let i = 1; i < count.body.length; i++) {
                results.push({
                    message:
                        'Operation must not have more than a single instance of the "in:body" parameter.',
                    path: [...path, count.body[i]],
                });
            }
        }

        return results;
    }
);