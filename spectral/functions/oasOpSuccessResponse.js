"use strict";
import {createRulesetFunction} from '@stoplight/spectral-core';
import {oas3} from '@stoplight/spectral-formats';


export default createRulesetFunction(
    {
        // Входной параметр - это объект (обычно `responses` секция у операции)
        input: {
            type: "object",
        },
        options: null,
    },
    function oasOpSuccessResponse(input, opts, context) {
        // Определяем, что документ действительно OpenAPI 3.x
        const isOAS3X = context.document.formats?.has(oas3) === true;

        // Перебираем все ключи ответов
        for (const response of Object.keys(input)) {
            // Для OpenAPI 3.x разрешены обобщённые "2XX" и "3XX"
            if (isOAS3X && (response === "2XX" || response === "3XX")) {
                return; // всё ок — есть успешный ответ
            }

            // Если статус‑код от 200 до 399 включительно — это успешный ответ
            const code = Number(response);
            if (!isNaN(code) && code >= 200 && code < 400) {
                return; // есть успешный ответ, ошибки нет
            }
        }

        // Если не найдено ни одного успешного кода — возвращаем ошибку проверки
        return [
            {
                message: "Operation must define at least a single 2xx or 3xx response",
            },
        ];
    }
);