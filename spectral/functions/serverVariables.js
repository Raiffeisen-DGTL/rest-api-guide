"use strict";

import { createRulesetFunction } from "@stoplight/spectral-core";

// --------------------- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---------------------

function parseUrlVariables(str) {
    if (typeof str !== "string") return [];
    const variables = str.match(/{(.+?)}/g);
    if (!variables || variables.length === 0) return [];
    return variables.map(v => v.slice(1, -1));
}

export function getMissingProps(arr, props) {
    return arr.filter(val => !props.includes(val));
}

export function getRedundantProps(arr, keys) {
    return keys.filter(val => !arr.includes(val));
}

function accumulateRedundantVariables(results, path, foundVariables, definedVariablesKeys) {
    if (definedVariablesKeys.length === 0) return;
    const redundantVariables = getRedundantProps(foundVariables, definedVariablesKeys);
    for (const variable of redundantVariables) {
        results.push({
            message: `Server's "variables" object has unused defined "${variable}" url variable.`,
            path: [...path, "variables", variable],
        });
    }
}

function accumulateMissingVariables(results, path, foundVariables, definedVariablesKeys) {
    const missingVariables =
        definedVariablesKeys.length === 0 ? foundVariables : getMissingProps(foundVariables, definedVariablesKeys);
    if (missingVariables.length > 0) {
        results.push({
            message: `Not all server's variables are described with "variables" object. Missed: ${missingVariables.join(", ")}.`,
            path: [...path, "variables"],
        });
    }
}

function checkVariableEnumValues(results, path, name, enumValues, defaultValue) {
    if (defaultValue !== undefined && !enumValues.includes(defaultValue)) {
        results.push({
            message: `Server Variable "${name}" has a default not listed in the enum.`,
            path: [...path, "variables", name, "default"],
        });
    }
}

// ------------------------- URL ПОДСТАНОВКИ -------------------------

function escapeRegexp(value) {
    return value.replace(/[\\^$*+?.()|[\]{}]/g, "\\$&");
}

function toReplaceRegExp(name) {
    return RegExp(escapeRegexp(`{${name}}`), "g");
}

function toApplicableVariable([name, values]) {
    return [toReplaceRegExp(name), values.map(encodeURI)];
}

// генератор для подстановок (упрощён)
export function applyUrlVariables(url, variables) {
    const results = [];
    function _applyUrlVariables(u, i) {
        if (i >= variables.length) {
            results.push(u);
            return;
        }
        const [regex, vals] = toApplicableVariable(variables[i]);
        for (const v of vals) {
            _applyUrlVariables(u.replace(regex, v), i + 1);
        }
    }
    _applyUrlVariables(url, 0);
    return results;
}

function checkSubstitutions(results, path, url, variables) {
    if (variables.length === 0) return;
    const substituted = applyUrlVariables(url, variables);
    const invalidUrls = [];
    for (const substitutedUrl of substituted) {
        try {
            new URL(substitutedUrl);
        } catch {
            invalidUrls.push(substitutedUrl);
            if (invalidUrls.length === 5) break;
        }
    }

    if (invalidUrls.length >= 5) {
        results.push({
            message: `At least 5 substitutions of server variables resulted in invalid URLs: ${invalidUrls.join(", ")} and more`,
            path: [...path, "variables"],
        });
    } else if (invalidUrls.length > 0) {
        results.push({
            message: `A few substitutions of server variables resulted in invalid URLs: ${invalidUrls.join(", ")}`,
            path: [...path, "variables"],
        });
    }
}

// ------------------ ОСНОВНОЙ ЭКСПОРТИРУЕМЫЙ ОБРАБОТЧИК ------------------

export default createRulesetFunction(
    {
        input: {
            errorMessage: "Invalid Server Object",
            type: "object",
            properties: {
                url: { type: "string" },
                variables: {
                    type: "object",
                    additionalProperties: {
                        type: "object",
                        properties: {
                            enum: { type: "array", items: { type: "string" } },
                            default: { type: "string" },
                            description: { type: "string" },
                            examples: { type: "string" },
                        },
                        patternProperties: { "^x-": true },
                        additionalProperties: false,
                    },
                },
            },
            required: ["url"],
        },
        errorOnInvalidInput: true,
        options: {
            type: ["object", "null"],
            properties: {
                checkSubstitutions: { type: "boolean", default: false },
                requireDefault: { type: "boolean", default: false },
            },
            additionalProperties: false,
        },
    },
    function serverVariables(_a, opts, ctx) {
        const { url, variables } = _a;
        const results = [];
        const foundVariables = parseUrlVariables(url);
        const definedVariablesKeys = variables ? Object.keys(variables) : [];

        accumulateRedundantVariables(results, ctx.path, foundVariables, definedVariablesKeys);

        if (foundVariables.length === 0) return results;
        accumulateMissingVariables(results, ctx.path, foundVariables, definedVariablesKeys);

        if (!variables) return results;

        const variablePairs = [];
        for (const key of definedVariablesKeys) {
            if (!foundVariables.includes(key)) continue;
            const variable = variables[key];
            if ("enum" in variable) {
                variablePairs.push([key, variable.enum]);
                checkVariableEnumValues(results, ctx.path, key, variable.enum, variable.default);
            } else if ("default" in variable) {
                variablePairs.push([key, [variable.default]]);
            } else {
                variablePairs.push([key, []]);
            }

            if (!("default" in variable) && opts?.requireDefault === true) {
                results.push({
                    message: `Server Variable "${key}" has a missing default.`,
                    path: [...ctx.path, "variables", key],
                });
            }
        }

        if (opts?.checkSubstitutions === true) {
            checkSubstitutions(results, ctx.path, url, variablePairs);
        }

        return results;
    }
);