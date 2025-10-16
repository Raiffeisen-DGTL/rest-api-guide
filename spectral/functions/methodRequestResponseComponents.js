export default function methodRequestResponseComponents(paths, _opts, pathsMeta) {
  if (!paths || typeof paths !== 'object') {
    return [];
  }

  const results = [];

  for (const [path, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'].includes(method.toLowerCase())) {
        // Check request body
        if (operation.requestBody && operation.requestBody.content) {
          for (const [mediaType, content] of Object.entries(operation.requestBody.content)) {
            // Check if schema is defined inline (has $ref to components or is defined inline)
            if (content.schema) {
              // If schema has $ref, it's referencing a component (which is good)
              if (content.schema.$ref) {
                // This is a reference to a component, which is what we want
                // No error needed
              } else {
                // Schema is defined inline, which is what we want to flag
                results.push({
                  message: 'Тело запроса и ответа должны быть вынесены в блок Components Object как Schema.',
                  path: [...pathsMeta.path, path, method, 'requestBody', 'content', mediaType, 'schema']
                });
              }
            }
          }
        }

        // Check responses
        if (operation.responses && typeof operation.responses === 'object') {
          for (const [statusCode, response] of Object.entries(operation.responses)) {
            if (response.content && typeof response.content === 'object') {
              for (const [mediaType, content] of Object.entries(response.content)) {
                // Check if schema is defined inline (has $ref to components or is defined inline)
                if (content.schema) {
                  // If schema has $ref, it's referencing a component (which is good)
                  if (content.schema.$ref) {
                    // This is a reference to a component, which is what we want
                    // No error needed
                  } else {
                    // Schema is defined inline, which is what we want to flag
                    results.push({
                      message: 'Тело запроса и ответа должны быть вынесены в блок Components Object как Schema.',
                      path: [...pathsMeta.path, path, method, 'responses', statusCode, 'content', mediaType, 'schema']
                    });
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return results;
}
