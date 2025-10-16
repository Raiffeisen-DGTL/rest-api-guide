# Описание автоматизированных правил Spectral

- [Описание автоматизированных правил Spectral](#описание-автоматизированных-правил-spectral)
  - [Required ruleset](#required-ruleset)
    - [external-ref-forbidden](#external-ref-forbidden)
      - [Описание](#описание)
      - [Решение](#решение)
      - [Примеры](#примеры)
        - [Правильно](#правильно)
        - [Неправильно](#неправильно)
    - [oas3-schema](#oas3-schema)
      - [Описание](#описание-1)
      - [Решение](#решение-1)
      - [Примеры](#примеры-1)
        - [Правильно](#правильно-1)
        - [Неправильно](#неправильно-1)
    - [supported-schema-version](#supported-schema-version)
      - [Описание](#описание-2)
      - [Решение](#решение-2)
      - [Примеры](#примеры-2)
        - [Правильно](#правильно-2)
        - [Неправильно](#неправильно-2)
    - [contact-x-short-team-name-required](#contact-x-short-team-name-required)
      - [Описание](#описание-3)
      - [Решение](#решение-3)
      - [Примеры](#примеры-3)
        - [Правильно](#правильно-3)
        - [Неправильно](#неправильно-3)
    - [contact-x-team-id-required](#contact-x-team-id-required)
      - [Описание](#описание-4)
      - [Решение](#решение-4)
      - [Примеры](#примеры-4)
        - [Правильно](#правильно-4)
        - [Неправильно](#неправильно-4)
  - [Base ruleset](#base-ruleset)
    - [info-contact](#info-contact)
      - [Решение](#решение-5)
      - [Примеры](#примеры-5)
        - [Правильно](#правильно-5)
        - [Неправильно](#неправильно-5)

[](#contact-x-short-team-name-required)
## Required ruleset
### external-ref-forbidden

| Severity | Description                             |
|----------|-----------------------------------------|
| ERROR    | Все $ref должны ссылаться на components |

#### Описание

В данный момент портал принимает только один файл для публикации. В связи с этим нет возможности опубликовать
многофайловые спецификации.

#### Решение

```textmate
Проверьте все $ref в вашей спецификации и убедитесь , что все они ведут в #/components в этой же спецификации
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

---

### oas3-schema

| Severity | Description                                          |
|----------|------------------------------------------------------|
| ERROR    | Спецификации должна соответствовать схеме OpenApi 3+ |

#### Описание

Правило проверяет соответствие спецификации схеме OpenApi 3+. Реализовано по средствам стандартной библиотеке правил
Spectral.  
Подробнее про данное правило можно
почитать [тут](https://docs.stoplight.io/docs/spectral/4dec24461f3af-open-api-rules#oas3-schema)

#### Решение

```textmate
Убедитесь, что ваша спецификация соответсвует схеме OpenApi 3+.  
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

##### Неправильно 
```yaml
openapi: 3.0.3
#   Отсутствует блок info
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

---

### supported-schema-version

| Severity | Description                        |
|----------|------------------------------------|
| ERROR    | Спецификация должна быть версии 3+ |

#### Описание

Правило проверяет наличие ключа openapi в спецификации и то, что значение соответствует '^3\.\d{1}\.\d{1}$'

#### Решение

```textmate
Спецификации должна соответствовать формату OpenApi 3+ и иметь значение ключа например openapi:'3.0.3'
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

##### Неправильно
```yaml
openapi: 2.0
info:
  title: Example API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

---

### contact-x-short-team-name-required

| Severity | Description                                               |
|----------|-----------------------------------------------------------|
| ERROR    | Поле info.contact.x-short-team-name является обязательным |

#### Описание

Для отображения на портале контактов команды ответственной за API, необходимо указать её название.

#### Решение

```textmate
Заполните значение x-short-team-name в info.contact
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
    x-team-id: 180
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

##### Неправильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-team-id: 180
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

---

### contact-x-team-id-required

| Severity | Description                                       |
|----------|---------------------------------------------------|
| ERROR    | Поле info.contact.x-team-id является обязательным |

#### Описание

Для сбора метрик по опубликованным на портале API, необходимо их идентифицировать. Для этого используется идентификатор
команды на Insider

#### Решение

```textmate
Узнайте идентификатор команды на Insider и заполните поле x-team-id в info.contact
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
    x-team-id: 180
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

##### Неправильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

---
## Base ruleset
### info-contact

| Severity | Description                               |
|----------|-------------------------------------------|
| ERROR    | Блок info должен содержать раздел contact |

#### Решение

```textmate
Добавьте в спецификацию раздел info.contact
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
    x-team-id: 180
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

##### Неправильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

---