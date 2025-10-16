import { createRulesetFunction } from '@stoplight/spectral-core';

export default createRulesetFunction(
    {
        input: {
            type: 'object',
        },
        options: null,
    },
    function validSchemaExample(input, _, context) {
        // Защита от null/undefined или не-объектов
        if (!input || typeof input !== 'object' || Array.isArray(input)) {
            return [];
        }

        let schema = input;

        // Если это $ref — разрешаем его
        if (schema.$ref) {
            try {
                const resolved = context.utils.resolveRef(schema);
                if (resolved && typeof resolved === 'object') {
                    schema = resolved;
                } else {
                    return [
                        {
                            message: 'Не удалось разрешить $ref или ссылка указывает не на объект.',
                            path: context.path,
                        },
                    ];
                }
            } catch (e) {
                return [
                    {
                        message: 'Ошибка при разрешении $ref.',
                        path: context.path,
                    },
                ];
            }
        }

        const errors = [];

        // Если это объект и имеет properties — проверяем примеры у каждого свойства
        if (schema.type === 'object' && schema.properties && typeof schema.properties === 'object') {
            for (const [propName, propSchema] of Object.entries(schema.properties)) {
                const propPath = [...context.path, 'properties', propName];

                // Если свойство — $ref, разрешаем и проверяем example у разрешённой схемы
                if (propSchema.$ref) {
                    try {
                        const resolvedProp = context.utils.resolveRef(propSchema);
                        if (resolvedProp && typeof resolvedProp === 'object' && !('example' in resolvedProp)) {
                            errors.push({
                                message: `Ссылка на схему в свойстве '${propName}' не имеет example.`,
                                path: [...propPath, 'example'],
                            });
                        }
                    } catch (e) {
                        errors.push({
                            message: `Ошибка при разрешении $ref в свойстве '${propName}'.`,
                            path: propPath,
                        });
                    }
                } else {
                    // Проверяем example у самого свойства
                    if (propSchema && typeof propSchema === 'object' && !('example' in propSchema)) {
                        errors.push({
                            message: `Свойство '${propName}' должно иметь пример (example).`,
                            path: [...propPath, 'example'],
                        });
                    }
                }
            }
        } else if (schema.type && schema.type !== 'object') {
            // Для примитивов — проверяем example
            if (!('example' in schema)) {
                errors.push({
                    message: 'Все схемы должны иметь example',
                    path: [...context.path, 'example'],
                });
            }
        }

        return errors;
    }
);