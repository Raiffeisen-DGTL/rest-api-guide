- [Common](#common)
  - [external-ref-forbidden](#external-ref-forbidden)

## Common

### external-ref-forbidden

| Severity | Description                             |
|----------|-----------------------------------------|
| ERROR    | Все $ref должны ссылаться не должны ссылнать на внешние файлы |

#### Описание

Правило проверяет наличие внешних ссылок в спецификации

#### Решение

```textmate
Проверьте все $ref в вашей спецификации и убедитесь, что все они ведут в эту же спецификацию
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        name:
          type: string
        age:
          type: integer
    Address:
      type: object
      properties:
        street:
          type: string
paths:
  /users:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

##### Неправильно
```yaml
paths:
  /users:
    get:
      responses:
        '200':
          content:
            application/json:
              schema:
                $ref: 'https://example.com/api.yaml#/components/schemas/User'
```
