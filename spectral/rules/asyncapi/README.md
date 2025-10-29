# Описание автоматизированных правил Spectral для AsyncAPI

- [Описание автоматизированных правил Spectral для AsyncAPI](#описание-автоматизированных-правил-spectral-для-asyncapi)
  - [Required ruleset](#required-ruleset)
    - [asyncapi-schema](#asyncapi-schema)
    - [external-ref-forbidden](#external-ref-forbidden)
    - [supported-schema-version](#supported-schema-version)
    - [contact-x-short-team-name-required](#contact-x-short-team-name-required)
    - [contact-x-team-id-required](#contact-x-team-id-required)

## Required ruleset

### asyncapi-schema

| Severity | Description                                          |
|----------|------------------------------------------------------|
| ERROR    | Спецификации должна соответствовать схеме AsyncAPI 2+ |

#### Описание

Правило проверяет соответствие спецификации схеме AsyncAPI 2+. Реализовано по средствам стандартной библиотеке правил
Spectral.

#### Решение

```textmate
Убедитесь, что ваша спецификация соответсвует схеме AsyncAPI 2+.
```

#### Примеры

##### Правильно
```yaml
asyncapi: 2.0.0
info:
  title: Example API
  version: 1.0.0
channels: {}
```

##### Неправильно 
```yaml
asyncapi: 2.0.0
#   Отсутствует блок info
channels: {}
```

---

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
channels:
  users:
    subscribe:
      message:
        payload:
          $ref: '#/components/schemas/User'
```

##### Неправильно
```yaml
channels:
  users:
    subscribe:
      message:
        payload:
          $ref: 'https://example.com/api.yaml#/components/schemas/User'
```

---

### supported-schema-version

| Severity | Description                        |
|----------|------------------------------------|
| ERROR    | Спецификация должна быть версии 2+ |

#### Описание

Правило проверяет наличие ключа asyncapi в спецификации и то, что значение соответствует '^[23]\.\d{1}\.\d{1}$'

#### Решение

```textmate
Спецификации должна соответствовать формату AsyncAPI 2+ и иметь значение ключа например asyncapi:'2.0.0'
```

#### Примеры

##### Правильно
```yaml
asyncapi: 2.0.0
info:
  title: Example API
  version: 1.0.0
channels: {}
```

##### Неправильно
```yaml
asyncapi: 1.0.0
info:
  title: Example API
  version: 1.0.0
channels: {}
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
asyncapi: 2.0.0
info:
  title: Example API
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
    x-team-id: 180
channels: {}
```

##### Неправильно
```yaml
asyncapi: 2.0.0
info:
  title: Example API
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-team-id: 180
channels: {}
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
asyncapi: 2.0.0
info:
  title: Example API
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
    x-team-id: 180
channels: {}
```

##### Неправильно
```yaml
asyncapi: 2.0.0
info:
  title: Example API
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
channels: {}
```