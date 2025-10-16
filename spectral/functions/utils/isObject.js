"use strict";

/**
 * Проверяет, является ли значение объектом (и не null, и не массивом).
 *
 * @param {*} value — любое значение
 * @returns {boolean} — true, если значение является объектом
 */
function isObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}
export { isObject };
