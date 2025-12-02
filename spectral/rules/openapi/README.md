# Описание автоматизированных правил Spectral для OpenAPI
  
- [Описание автоматизированных правил Spectral для OpenAPI](#описание-автоматизированных-правил-spectral-для-openapi)
  - [Required ruleset](#required-ruleset)
    - [oas3-schema](#oas3-schema)
    - [supported-schema-version](#supported-schema-version)
    - [contact-x-short-team-name-required](#contact-x-short-team-name-required)
    - [contact-x-team-id-required](#contact-x-team-id-required)
  - [Base ruleset](#base-ruleset)
    - [info-contact](#info-contact)
    - [provide-head-method](#provide-head-method)
    - [all-off-types-consistency](#all-off-types-consistency)
    - [array-items](#array-items)
    - [blank-strings-forbidden](#blank-strings-forbidden)
    - [body-fields-camel-case](#body-fields-camel-case)
    - [duplicated-entry-in-enum](#duplicated-entry-in-enum)
    - [empty-objects-forbidden](#empty-objects-forbidden)
    - [enum-discriminator-upper-snake-case](#enum-discriminator-upper-snake-case)
    - [info-description](#info-description)
    - [method-operation-id-camel-case](#method-operation-id-camel-case)
    - [method-request-response-components](#method-request-response-components)
    - [no-eval-in-markdown](#no-eval-in-markdown)
    - [no-script-tags-in-markdown](#no-script-tags-in-markdown)
    - [not-use-redirection-codes](#not-use-redirection-codes)
    - [oas3-api-servers](#oas3-api-servers)
    - [oas3-parameter-description](#oas3-parameter-description)
    - [oas3-server-trailing-slash](#oas3-server-trailing-slash)
    - [openapi-tags](#openapi-tags)
    - [openapi-tags-alphabetical](#openapi-tags-alphabetical)
    - [openapi-tags-uniqueness](#openapi-tags-uniqueness)
    - [operation-description](#operation-description)
    - [operation-operationId](#operation-operationid)
    - [operation-operationId-unique](#operation-operationid-unique)
    - [operation-operationId-valid-in-url](#operation-operationid-valid-in-url)
    - [use-most-common-http-codes](#use-most-common-http-codes)
    - [operation-singular-tag](#operation-singular-tag)
    - [path-keys-no-trailing-slash](#path-keys-no-trailing-slash)
    - [path-not-include-query](#path-not-include-query)
    - [query-params-camel-case](#query-params-camel-case)
    - [tag-description](#tag-description)
    - [url-versioning](#url-versioning)
    - [no-ref-siblings](#no-ref-siblings)
    - [oas3-1-callbacks-in-webhook](#oas3-1-callbacks-in-webhook)
    - [oas3-1-servers-in-webhook](#oas3-1-servers-in-webhook)
    - [oas3-callbacks-in-callbacks](#oas3-callbacks-in-callbacks)
    - [oas3-examples-value-or-externalValue](#oas3-examples-value-or-externalvalue)
    - [oas3-operation-security-defined](#oas3-operation-security-defined)
    - [oas3-server-variables](#oas3-server-variables)
    - [oas3-unused-component](#oas3-unused-component)
    - [oas3-valid-media-example](#oas3-valid-media-example)
    - [oas3-valid-schema-example](#oas3-valid-schema-example)
    - [object-request-response-postfix](#object-request-response-postfix)
    - [operation-parameters](#operation-parameters)
    - [operation-success-response](#operation-success-response)
    - [operation-tag-defined](#operation-tag-defined)
    - [path-declarations-must-exist](#path-declarations-must-exist)
    - [path-kebab-case](#path-kebab-case)
    - [path-no-redundant-prefixes](#path-no-redundant-prefixes)
    - [path-params](#path-params)
    - [typed-enum](#typed-enum)
    - [valid-schema-example](#valid-schema-example)

## Required ruleset
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

### provide-head-method

| Severity | Description                                                   |
|----------|---------------------------------------------------------------|
| WARN     | API для скачивания файлов должно поддерживать метод **HEAD**  |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#api-для-скачивания-файлов-обязано-поддерживать-head-запрос) 

#### Описание

Если API предоставляет возможность скачивания файлов (например, PDF, Excel, ZIP и т.д.), то для соответствующего GET-метода должен быть реализован соответствующий HEAD-метод. Это позволяет клиентам получать метаинформацию о файле (размер, тип и т.д.) без необходимости загружать сам файл.

#### Решение

```textmate
Для каждого GET-метода, который возвращает файл (на основе MIME-типа в ответе), добавьте соответствующий HEAD-метод с аналогичной сигнатурой, но без тела ответа.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/files:
    get:
      summary: Скачать файл
      operationId: downloadFile
      responses:
        '200':
          description: Файл
          content:
            application/pdf:
              schema:
                type: string
                format: binary
    head:
      summary: Получить метаинформацию о файле
      operationId: downloadFileHead
      responses:
        '200':
          description: Метаинформация о файле
          headers:
            Content-Length:
              description: Размер файла в байтах
              schema:
                type: integer
                example: 1
            Content-Type:
              description: MIME-тип файла
              schema:
                type: string
                example: application/pdf
```

##### Неправильно
```yaml
paths:
  /v1/files:
    get:
      summary: Скачать файл
      operationId: downloadFile
      responses:
        '200':
          description: Файл
          content:
            application/pdf:
              schema:
                type: string
                format: binary
# Отсутствует HEAD-метод
```

---

### all-off-types-consistency

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Все элементы allOf должны иметь одинаковый тип      |

#### Описание

При использовании ключевого слова `allOf` для комбинирования схем, все элементы в массиве `allOf` должны иметь одинаковый тип. Это правило проверяет, что все ссылаемые или встроенные схемы в `allOf` соответствуют этому требованию. Смешивание разных типов в `allOf` может привести к неоднозначности и ошибкам при валидации данных.

#### Решение

```textmate
Убедитесь, что все элементы в массиве allOf имеют одинаковый тип. При необходимости пересмотрите структуру схемы.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 23
    Employee:
      type: object
      properties:
        department:
          type: string
          example: exampleDepartment
    UserEmployee:
      allOf:
        - $ref: '#/components/schemas/User'  # object
        - $ref: '#/components/schemas/Employee'  # object
        - type: object  # тоже object
          properties:
            position:
              type: string
              example: examplePosition
```

##### Неправильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
    EmployeeId:
      type: integer
    UserWithId:
      allOf:
        - $ref: '#/components/schemas/User'  # object
        - $ref: '#/components/schemas/EmployeeId'  # integer
```

---

### array-items

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Объекты типа Array должны содержать массив элементов |

#### Описание

Все объекты с типом `array` должны содержать поле `items`, описывающее тип элементов массива. Это требование OpenAPI 3.x, без этого поле массив не может быть корректно валидирован и документирован.

#### Решение

```textmate
Добавьте поле `items` к каждому объекту с типом `array`, описав тип элементов массива.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    UserList:
      type: array
      items:
        type: object
        properties:
          id:
            type: integer
            example: 12
          name:
            type: string
            example: exampleName
```

##### Неправильно
```yaml
components:
  schemas:
    UserList:
      type: array
      # Отсутствует поле items
```

---

### blank-strings-forbidden

| Severity | Description              |
|----------|--------------------------|
| ERROR    | Пустые строки запрещены  |

#### Описание

В спецификации OpenAPI не допускаются пустые или содержащие только пробельные символы строки в ключевых полях, таких как `description`, `title`, `summary`, `example` и `required`. Такие значения не несут смысловой нагрузки и могут привести к некорректному отображению документации.

#### Решение

```textmate
Замените пустые строки на содержательные значения или удалите поля, если они не обязательны.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    get:
      summary: Получить список пользователей
      description: Возвращает список всех пользователей системы
      responses:
        '200':
          description: Список пользователей
          content:
            application/json:
              schema:
                type: array
                items:
                  type: object
                  properties:
                    id:
                      type: integer
                      example: 12
                    name:
                      type: string
                      example: John Doe
```

##### Неправильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
  description:    # Пустая строка (только пробелы)
paths:
  /users:
    get:
      summary: ""  # Пустая строка
      description: "   "  # Строка с пробелами
      responses:
        '200':
          description: Список пользователей
```

---

### body-fields-camel-case

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Поля в requestBody и responseBody должны быть в camelCase |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#используем-для-именования-полей-тела-запроса-camelcase) 

#### Описание

Все поля в телах запросов и ответов должны быть в формате camelCase. Это правило проверяет, что имена полей в схемах requestBody, responseBody и компонентах следуют стилю именования camelCase, что является стандартом для большинства API.

#### Решение

```textmate
Измените имена полей в схемах на формат camelCase (например, firstName вместо first_name или FirstName).
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 12
        firstName:
          type: string
          example: John
        lastName:
          type: string
          example: Doe
        emailAddress:
          type: string
          example: john.doe@example.com
paths:
  /v1/users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
```

##### Неправильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 12
        first_name:  # snake_case вместо camelCase
          type: string
          example: John
        LastName:    # PascalCase вместо camelCase
          type: string
          example: Doe
        email_address:  # snake_case вместо camelCase
          type: string
          example: john.doe@example.com
```

---

### duplicated-entry-in-enum

| Severity | Description                        |
|----------|------------------------------------|
| ERROR    | Значения в ENUM должны быть уникальны |

#### Описание

Все значения в перечислениях (enum) должны быть уникальными. Наличие дубликатов в enum может привести к путанице и ошибкам в реализации API, а также к некорректной работе клиентских приложений.

#### Решение

```textmate
Удалите дублирующиеся значения из перечислений, оставив только уникальные элементы.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    UserRole:
      type: string
      enum:
        - ADMIN
        - USER
        - GUEST
        - MODERATOR
```

##### Неправильно
```yaml
components:
  schemas:
    UserRole:
      type: string
      enum:
        - ADMIN
        - USER
        - GUEST
        - ADMIN      # Дубликат
        - MODERATOR
        - USER       # Дубликат
```

---

### empty-objects-forbidden

| Severity | Description              |
|----------|--------------------------|
| ERROR    | Запрещены пустые объекты |

#### Описание

В спецификации OpenAPI не допускаются пустые объекты (объекты без свойств). Такие объекты не несут смысловой нагрузки и могут привести к ошибкам в генерации кода и документации.

#### Решение

```textmate
Добавьте свойства в пустые объекты или удалите их, если они не нужны.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 12
        name:
          type: string
          example: John Doe
    ErrorResponse:
      type: object
      properties:
        error:
          type: string
          example: "Something went wrong"
```

##### Неправильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 12
        name:
          type: string
          example: John Doe
    EmptyObject:  # Пустой объект без свойств
      type: object
```

---

### enum-discriminator-upper-snake-case

| Severity | Description                                                              |
|----------|--------------------------------------------------------------------------|
| ERROR    | Перечисления и значения маппинга для дискриминаторов именуются UPPER_SNAKE_CASE |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#используем-upper_snake_case-для-enum-и-mapping-для-discriminator) 

#### Описание

Все значения в перечислениях (enum) и маппингах для discriminator должны следовать формату UPPER_SNAKE_CASE. Это правило обеспечивает единообразие именования в спецификации API.

#### Решение

```textmate
Измените имена значений enum и discriminator на формат UPPER_SNAKE_CASE (например, USER_ADMIN вместо userAdmin или UserAdmin).
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    Pet:
      type: object
      discriminator:
        propertyName: petType
        mapping:
          DOG: '#/components/schemas/Dog'
          CAT: '#/components/schemas/Cat'
      properties:
        petType:
          type: string
          enum:
            - DOG
            - CAT
    UserStatus:
      type: string
      enum:
        - ACTIVE
        - INACTIVE
        - PENDING_APPROVAL
```

##### Неправильно
```yaml
components:
  schemas:
    Pet:
      type: object
      discriminator:
        propertyName: petType
        mapping:
          dog: '#/components/schemas/Dog'      # Должно быть DOG
          Cat: '#/components/schemas/Cat'      # Должно быть CAT
      properties:
        petType:
          type: string
          enum:
            - dog      # Должно быть DOG
            - Cat      # Должно быть CAT
    UserStatus:
      type: string
      enum:
        - active       # Должно быть ACTIVE
        - Inactive     # Должно быть INACTIVE
        - pendingApproval  # Должно быть PENDING_APPROVAL
```

---

### info-description

| Severity | Description                               |
|----------|-------------------------------------------|
| ERROR    | Блок info должен содержать раздел description |

#### Описание

Блок info в спецификации OpenAPI должен содержать описание API (поле description). Это поле предоставляет важную информацию о назначении и функциональности API.

#### Решение

```textmate
Добавьте описание API в поле info.description.
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
  description: This API provides access to user management functionality.
```

##### Неправильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
  # Отсутствует описание API
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

---

### method-operation-id-camel-case

| Severity | Description                            |
|----------|----------------------------------------|
| ERROR    | OperationId должны быть в camelCase формате |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#используем-camelcase-для-operationid-метода) 

#### Описание

Все идентификаторы операций (operationId) должны следовать формату camelCase. Это правило обеспечивает единообразие именования методов в API.

#### Решение

```textmate
Измените operationId на формат camelCase (например, getUserById вместо get_user_by_id или GetUserById).
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users/{id}:
    get:
      operationId: getUserById
      summary: Получить пользователя по ID
      responses:
        '200':
          description: Информация о пользователе
```

##### Неправильно
```yaml
paths:
  /users/{id}:
    get:
      operationId: get_user_by_id  # snake_case вместо camelCase
      summary: Получить пользователя по ID
      responses:
        '200':
          description: Информация о пользователе
```

---

### method-request-response-components

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Тело запроса и ответа должны быть вынесены в блок components как schema |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#выносим-тело-запроса-и-ответа-методов-в-отдельный-блок) 

#### Описание

Тела запросов и ответов должны быть определены как схемы в разделе components, а не встроены непосредственно в операции. Это способствует переиспользованию схем и улучшает читаемость спецификации.

#### Решение

```textmate
Вынесите схемы тел запросов и ответов в раздел components.schemas и ссылайтесь на них через $ref.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 123
        name:
          type: string
          example: name
paths:
  /v1/users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
```

##### Неправильно
```yaml
paths:
  /v1/users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: integer
                name:
                  type: string
```

---

### no-eval-in-markdown

| Severity | Description                                      |
|----------|--------------------------------------------------|
| ERROR    | Блок description и title не должен содержать eval() |

#### Описание

Поля description и title в спецификации не должны содержать вызовы функции eval(), так как это может представлять угрозу безопасности и привести к выполнению произвольного кода.

#### Решение

```textmate
Удалите все вызовы eval() из полей description и title.
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  description: This API provides user management functionality.
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
    x-team-id: 180
paths:
  /v1/users:
    get:
      summary: Get list of users
      description: Returns a list of all users in the system.
      responses:
        '200':
          description: A list of users
```

##### Неправильно
```yaml
openapi: 3.0.3
info:
  title: User Management API
  version: 1.0.0
  description: This API provides user management functionality. eval('alert("test")')
paths:
  /users:
    get:
      summary: Get list of users
      description: Returns a list of all users in the system. eval('console.log("test")')
      responses:
        '200':
          description: A list of users eval('someFunction()')
```

---

### no-script-tags-in-markdown

| Severity | Description                                      |
|----------|--------------------------------------------------|
| ERROR    | Блок description и title не должен содержать `<script>` |

#### Описание

Поля description и title в спецификации не должны содержать HTML теги `<script>`, так как это может представлять угрозу безопасности и привести к выполнению произвольного JavaScript кода.

#### Решение

```textmate
Удалите все теги <script> из полей description и title.
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  description: This API provides user management functionality.
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
    x-team-id: 180
paths:
  /v1/users:
    get:
      summary: Get list of users
      description: Returns a list of all users in the system.
      responses:
        '200':
          description: A list of users
```

##### Неправильно
```yaml
openapi: 3.0.3
info:
  title: User Management API
  version: 1.0.0
  description: This API provides user management functionality. <script>alert('test')</script>
paths:
  /users:
    get:
      summary: Get list of users
      description: Returns a list of all users in the system. <script>console.log('test')</script>
      responses:
        '200':
          description: A list of users <script>someFunction()</script>
```

---

### not-use-redirection-codes

| Severity | Description                                  |
|----------|----------------------------------------------|
| ERROR    | Не используйте коды перенаправления в responses |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#не-используй-статусы-перенаправления-запроса) 


#### Описание

В спецификации API не рекомендуется использовать коды перенаправления HTTP (3xx), кроме 304 (Not Modified). Клиенты API должны получать прямые ответы, а не перенаправления.

#### Решение

```textmate
Избегайте использования кодов перенаправления в API. Возвращайте прямые ответы с данными.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users/{id}:
    get:
      responses:
        '200':
          description: Информация о пользователе
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
        '404':
          description: Пользователь не найден
```

##### Неправильно
```yaml
paths:
  /users/{id}:
    get:
      responses:
        '301':  # Код перенаправления
          description: Пользователь перемещен
          headers:
            Location:
              description: Новый URL пользователя
              schema:
                type: string
        '302':  # Код перенаправления
          description: Пользователь временно перемещен
          headers:
            Location:
              description: Временный URL пользователя
              schema:
                type: string
```

---

### oas3-api-servers

| Severity | Description                   |
|----------|-------------------------------|
| ERROR    | Servers должны быть заполнены |

#### Описание

Спецификация OpenAPI 3.x должна содержать список серверов (servers), определяющих базовые URL для доступа к API. Это необходимо для правильной генерации клиентского кода и документации.

#### Решение

```textmate
Добавьте список серверов в корень спецификации.
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  description: This API provides user management functionality.
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
    x-team-id: 180
servers:
  - url: https://api.example.com/v1
    description: Prod
  - url: https://staging-api.example.com/v1
    description: Test
paths:
  /v1/users:
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
# Отсутствует список серверов
paths:
  /users:
    get:
      responses:
        '200':
          description: A list of users
```

---

### oas3-parameter-description

| Severity | Description                            |
|----------|----------------------------------------|
| WARN     | Параметры должны иметь заполненный description |

#### Описание

Все параметры API должны иметь описание (description), объясняющее их назначение и формат. Это улучшает понимание API и упрощает его использование.

#### Решение

```textmate
Добавьте описание ко всем параметрам API.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    get:
      parameters:
        - name: limit
          in: query
          description: Максимальное количество возвращаемых пользователей
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 10
      responses:
        '200':
          description: Список пользователей
```

##### Неправильно
```yaml
paths:
  /users:
    get:
      parameters:
        - name: limit
          in: query
          # Отсутствует описание параметра
          schema:
            type: integer
            minimum: 1
            maximum: 100
            default: 10
      responses:
        '200':
          description: Список пользователей
```

---

### oas3-server-trailing-slash

| Severity | Description                                |
|----------|--------------------------------------------|
| INFO     | Servers не должны заканчиваться на символ / |

#### Описание

URL серверов в спецификации OpenAPI не должны заканчиваться символом "/". Это помогает избежать путаницы при формировании полных URL для доступа к API.

#### Решение

```textmate
Удалите завершающий символ "/" из URL серверов.
```

#### Примеры

##### Правильно
```yaml
servers:
  - url: https://api.example.com/v1
    description: Prod
  - url: https://staging-api.example.com/v1
    description: Test
```

##### Неправильно
```yaml
servers:
  - url: https://api.example.com/v1/  # Завершающий символ "/"
    description: Production server
  - url: https://staging-api.example.com/v1/  # Завершающий символ "/"
    description: Staging server
```

---

### openapi-tags

| Severity | Description                    |
|----------|--------------------------------|
| ERROR    | Массив tags не должен быть пустым |

#### Описание

Спецификация OpenAPI должна содержать хотя бы один тег в массиве tags. Теги используются для группировки операций API и улучшения навигации в документации.

#### Решение

```textmate
Добавьте хотя бы один тег в массив tags в корне спецификации.
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  description: This API provides user management functionality.
  version: 1.0.0
  contact:
    name: CDC Integrations
    x-short-team-name: CDCI
    x-team-id: 180
tags:
  - name: Users
    description: Операции с пользователями
  - name: Orders
    description: Операции с заказами
```

##### Неправильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
tags:
# Отсутствуют элементы в массиве tags
paths:
  /users:
    get:
      responses:
        '200':
          description: Список пользователей
```

---

### openapi-tags-alphabetical

| Severity | Description                    |
|----------|--------------------------------|
| INFO     | Tags должны быть в алфавитном порядке |

#### Описание

Все теги в спецификации API должны быть упорядочены в алфавитном порядке по их имени. Это правило проверяет, что теги в разделе `tags` следуют алфавитному порядку, что улучшает читаемость и навигацию в документации.

#### Решение

```textmate
Упорядочите теги в разделе `tags` в алфавитном порядке по их имени.
```

#### Примеры

##### Правильно
```yaml
tags:
  - name: Accounts      
    description: Операции с аккаунтами
  - name: Orders        
    description: Операции с заказами
  - name: Users         
    description: Операции с пользователями
```

##### Неправильно
```yaml
tags:
  - name: Users         # Нарушен алфавитный порядок
    description: Операции с пользователями
  - name: Accounts      
    description: Операции с аккаунтами
  - name: Orders        
    description: Операции с заказами
```

---

### openapi-tags-uniqueness

| Severity | Description                    |
|----------|--------------------------------|
| ERROR    | Названия тегов должны быть уникальными |

#### Описание

Все названия тегов в спецификации API должны быть уникальными. Это правило проверяет, что в разделе `tags` нет дублирующихся названий тегов, что может привести к путанице и ошибкам в документации.

#### Решение

```textmate
Убедитесь, что все названия тегов в разделе `tags` уникальны.
```

#### Примеры

##### Правильно
```yaml
tags:
  - name: Users        
    description: Операции с пользователями
  - name: Orders        
    description: Операции с заказами
  - name: Accounts      
    description: Операции с аккаунтами
```

##### Неправильно
```yaml
tags:
  - name: Users         
    description: Операции с пользователями
  - name: Orders       
    description: Операции с заказами
  - name: Users         # Недопустимо: дубликат имени
    description: Операции с пользователями (дубликат)
```

---

### operation-description

| Severity | Description                                      |
|----------|--------------------------------------------------|
| WARN     | Блок operation.description должен быть заполнен не пустой строкой |

#### Описание

Каждая операция API должна иметь описание (description), объясняющее ее назначение, поведение и особенности. Это улучшает понимание API и упрощает его использование.

#### Решение

```textmate
Добавьте описание ко всем операциям API.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    get:
      summary: Получить список пользователей
      description: Возвращает список всех пользователей системы с возможностью фильтрации и пагинации.
      responses:
        '200':
          description: Список пользователей
```

##### Неправильно
```yaml
paths:
  /users:
    get:
      summary: Получить список пользователей
      # Отсутствует описание операции
      responses:
        '200':
          description: Список пользователей
```

---

### operation-operationId

| Severity | Description                         |
|----------|-------------------------------------|
| ERROR    | Каждый path должен иметь operationId |

#### Описание

Каждая операция API должна иметь уникальный идентификатор (operationId). Это необходимо для генерации клиентского кода и обеспечения уникальности методов.

#### Решение

```textmate
Добавьте operationId к каждой операции API.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    get:
      operationId: getUsers
      summary: Получить список пользователей
      responses:
        '200':
          description: Список пользователей
    post:
      operationId: createUser
      summary: Создать нового пользователя
      responses:
        '201':
          description: Пользователь создан
```

##### Неправильно
```yaml
paths:
  /users:
    get:
      # Отсутствует operationId
      summary: Получить список пользователей
      responses:
        '200':
          description: Список пользователей
    post:
      # Отсутствует operationId
      summary: Создать нового пользователя
      responses:
        '201':
          description: Пользователь создан
```

---

### operation-operationId-unique

| Severity | Description                         |
|----------|-------------------------------------|
| ERROR    | OperationId должен быть уникальным |

#### Описание

Все идентификаторы операций (operationId) в спецификации API должны быть уникальными. Это правило проверяет, что каждое поле `operationId` в разделе `paths` уникально, что необходимо для правильной генерации клиентского кода и избежания конфликтов.

#### Решение

```textmate
Убедитесь, что каждый operationId в спецификации уникален.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    get:
      operationId: getUsers
      summary: Получить список пользователей
      responses:
        '200':
          description: Список пользователей
  /v1/orders:
    get:
      operationId: getOrders      
      summary: Получить список заказов
      responses:
        '200':
          description: Список заказов
```

##### Неправильно
```yaml
paths:
  /users:
    get:
      operationId: getUsers       
      summary: Получить список пользователей
      responses:
        '200':
          description: Список пользователей
  /orders:
    get:
      operationId: getUsers        # Недопустимо: дубликат ID
      summary: Получить список заказов
      responses:
        '200':
          description: Список заказов
```

---

### operation-operationId-valid-in-url

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | OperationId не должен содержать запрещенных символов |

#### Описание

Идентификаторы операций (operationId) не должны содержать символов, которые недопустимы в URL. Это правило проверяет, что значения operationId могут быть безопасно использованы в URL без необходимости кодирования.

#### Решение

```textmate
Измените operationId, убрав недопустимые символы. Используйте только разрешенные символы: буквы, цифры и следующие специальные символы: -._~:/?#[]@!##### 
```
#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    get:
      operationId: getUsers        # Допустимые символы
      summary: Получить список пользователей
      responses:
        '200':
          description: Список пользователей
```

##### Неправильно
```yaml
paths:
  /users:
    get:
      operationId: get users       # Недопустимо: пробел
      summary: Получить список пользователей
      responses:
        '200':
          description: Список пользователей
    post:
      operationId: create|user     # Недопустимо: символ |
      summary: Создать нового пользователя
      responses:
        '201':
          description: Пользователь создан
```

---

### use-most-common-http-codes

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Используйте только наиболее распространенные коды состояния HTTP |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#используй-только-наиболее-распространенные-коды-состояния-http) 

#### Описание

В API следует использовать только наиболее распространенные коды состояния HTTP. Это правило запрещает использование редко используемых кодов состояния, которые могут быть непонятны разработчикам или неправильно интерпретированы клиентами.

#### Решение

```textmate
Используйте только распространенные коды состояния HTTP. Такие коды как 205,206,207,301,302,303,307,308,408,417,418,422,424,431,505,507,511 запрещены
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    get:
      operationId: getUsers
      responses:
        '200':  # Распространенный код
          description: Список пользователей
        '400':  # Распространенный код
          description: Неверный запрос
        '500':  # Распространенный код
          description: Внутренняя ошибка сервера
```

##### Неправильно
```yaml
paths:
  /v1/users:
    get:
      operationId: getUsers
      responses:
        '205':  # Редко используемый код
          description: Сброс содержимого
        '418':  # Редко используемый код (I'm a teapot)
          description: Я чайник
        '505':  # Редко используемый код
          description: Версия HTTP не поддерживается
```

---

### operation-singular-tag

| Severity | Description                          |
|----------|--------------------------------------|
| ERROR    | Метод должен иметь не более одного тега |

#### Описание

Каждая операция API должна иметь не более одного тега. Это упрощает классификацию операций и улучшает структуру документации.

#### Решение

```textmate
Убедитесь, что каждая операция имеет не более одного тега.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    get:
      tags:
        - Users  # Один тег
      operationId: getUsers
      summary: Получить список пользователей
      responses:
        '200':
          description: Список пользователей
```

##### Неправильно
```yaml
paths:
  /users:
    get:
      tags:
        - Users   # Первый тег
        - Common  # Второй тег - нарушение правила
      summary: Получить список пользователей
      responses:
        '200':
          description: Список пользователей
```

---

### path-keys-no-trailing-slash

| Severity | Description                       |
|----------|-----------------------------------|
| INFO     | Path не должен заканчиваться на символ / |

#### Описание

Пути к ресурсам API не должны заканчиваться символом "/". Это помогает избежать путаницы и обеспечивает единообразие в API.

#### Решение

```textmate
Удалите завершающий символ "/" из путей к ресурсам.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:      # Путь без завершающего "/"
    get:
      summary: Получить список пользователей
      operationId: getUsers
      responses:
        '200':
          description: Список пользователей
```

##### Неправильно
```yaml
paths:
  /users/:     # Путь с завершающим "/"
    get:
      responses:
        '200':
          description: Список пользователей
```

---

### path-not-include-query

| Severity | Description                           |
|----------|---------------------------------------|
| ERROR    | Path не должен содержать символов "?" |

#### Описание

Пути к ресурсам API не должны содержать символы "?", так как параметры запроса должны передаваться отдельно, а не быть частью пути.

#### Решение

```textmate
Перенесите параметры из пути в соответствующие секции параметров.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    get:
      summary: Получить список пользователей
      operationId: getUsers
      parameters:
        - name: limit
          in: query
          description: Максимальное количество возвращаемых пользователей
          schema:
            type: integer
      responses:
        '200':
          description: Список пользователей
```

##### Неправильно
```yaml
paths:
  /users?limit={limit}:  # Путь содержит символ "?"
    get:
      responses:
        '200':
          description: Список пользователей
```

---

### query-params-camel-case

| Severity | Description                       |
|----------|-----------------------------------|
| ERROR    | Params должны быть в camelCase формате |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#используем-для-именования-параметров-запроса-camelcase) 

#### Описание

Все параметры запроса (query parameters) должны следовать формату camelCase. Это правило обеспечивает единообразие именования параметров в API.

#### Решение

```textmate
Измените имена параметров запроса на формат camelCase (например, userId вместо user_id или UserId).
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    summary: Получить список пользователей
    operationId: getUsers
    get:
      parameters:
        - name: userId      # camelCase
          in: query
          description: Идентификатор пользователя
          schema:
            type: integer
      responses:
        '200':
          description: Список пользователей
```

##### Неправильно
```yaml
paths:
  /users:
    get:
      parameters:
        - name: user_id     # snake_case вместо camelCase
          in: query
          description: Идентификатор пользователя
          schema:
            type: integer
        - name: PageSize    # PascalCase вместо camelCase
          in: query
          description: Размер страницы
          schema:
            type: integer
      responses:
        '200':
          description: Список пользователей
```

---

### tag-description

| Severity | Description                    |
|----------|--------------------------------|
| WARN     | Блок tags должен содержать description |

#### Описание

Каждый тег в спецификации API должен иметь описание (description), объясняющее группу операций, которую он представляет. Это улучшает навигацию и понимание структуры API.

#### Решение

```textmate
Добавьте описание ко всем тегам в спецификации.
```

#### Примеры

##### Правильно
```yaml
tags:
  - name: Users
    description: Операции с пользователями системы
  - name: Orders
    description: Операции с заказами пользователей
```

##### Неправильно
```yaml
tags:
  - name: Users
    # Отсутствует описание тега
  - name: Orders
    # Отсутствует описание тега
```

---

### url-versioning

| Severity | Description                                                              |
|----------|--------------------------------------------------------------------------|
| ERROR    | Версия должна быть указана в пути запроса, в начале метода, в формате /beta, /v1, /v2 и т.д. |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#используй-версионирование-в-url) 

#### Описание

Версия API должна быть указана в пути запроса в начале, в формате /beta, /v1, /v2 и т.д. Это позволяет легко управлять версиями API и обеспечивает единообразие.

#### Решение

```textmate
Добавьте версию API в начало всех путей.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    get:
      summary: Получить список пользователей
      operationId: getUsers
      responses:
        '200':
          description: Список пользователей
```

##### Неправильно
```yaml
paths:
  /users:    # Отсутствует версия в пути
    get:
      responses:
        '200':
          description: Список пользователей
```

---

### no-ref-siblings

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Рядом с $ref не должно быть других свойств          |

#### Описание

Свойство `$ref` не должно находиться рядом с другими свойствами в одном объекте. Это правило проверяет, что при использовании ссылок `$ref` они находятся в отдельном объекте без других свойств. Наличие других свойств рядом с `$ref` может привести к неопределенному поведению в различных инструментах обработки OpenAPI.

#### Решение

```textmate
Переместите свойства, которые находятся рядом с `$ref`, в отдельный объект или объедините их с объектом, на который ссылается `$ref`.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 1
        name:
          type: string
          example: name
    UserWithAddress:
      allOf:
        - $ref: '#/components/schemas/User'
        - type: object
          properties:
            address:
              type: string
              example: address
```

##### Неправильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
    UserWithAddress:
      allOf:
        - $ref: '#/components/schemas/User'
          # Недопустимо: address находится рядом с $ref
          address:
            type: string
```

---

### oas3-1-callbacks-in-webhook

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Webhooks не должны включать в себя callbacks        |

#### Описание

В OpenAPI 3.1 webhooks не должны содержать callbacks. Это правило проверяет, что в вебхуках не определены коллбэки, так как это может привести к циклическим зависимостям и усложнить обработку API-спецификации.

#### Решение

```textmate
Удалите коллбэки из вебхуков или переместите их в соответствующие операции.
```

#### Примеры

##### Правильно
```yaml
webhooks:
  userUpdated:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '200':
          description: Success
```

##### Неправильно
```yaml
webhooks:
  userUpdated:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '200':
          description: Success
      # Недопустимо: callbacks в webhook
      callbacks:
        myEvent:
          '{$request.body#/callbackUrl}':
            post:
              requestBody:
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        message:
                          type: string
              responses:
                '200':
                  description: Success
```

---

### oas3-1-servers-in-webhook

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Webhooks не должны включать в себя servers          |

#### Описание

В OpenAPI 3.1 webhooks не должны содержать определения серверов. Это правило проверяет, что в вебхуках не определены серверы, так как это может привести к путанице в конфигурации и усложнить обработку API-спецификации.

#### Решение

```textmate
Удалите определения серверов из вебхуков. Используйте глобальные серверы или серверы на уровне операций.
```

#### Примеры

##### Правильно
```yaml
servers:
  - url: https://api.example.com/v1
    description: Production server
webhooks:
  userUpdated:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '200':
          description: Success
```

##### Неправильно
```yaml
webhooks:
  userUpdated:
    post:
      # Недопустимо: servers в webhook
      servers:
        - url: https://webhook.example.com/v1
          description: Webhook server
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '200':
          description: Success
```

---

### oas3-callbacks-in-callbacks

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Callbacks не должны включать в себя callbacks       |

#### Описание

В OpenAPI callbacks не должны содержать вложенные callbacks. Это правило проверяет, что в коллбэках не определены другие коллбэки, так как это может привести к бесконечной рекурсии и усложнить обработку API-спецификации.

#### Решение

```textmate
Удалите вложенные коллбэки или реорганизуйте структуру API так, чтобы избежать вложенности.
```

#### Примеры

##### Правильно
```yaml
paths:
  /subscribe:
    post:
      responses:
        '200':
          description: Subscription created
      callbacks:
        # Внешний коллбэк
        myEvent:
          '{$request.body#/callbackUrl}':
            post:
              requestBody:
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        message:
                          type: string
              responses:
                '200':
                  description: Success
```

##### Неправильно
```yaml
paths:
  /subscribe:
    post:
      responses:
        '200':
          description: Subscription created
      callbacks:
        # Внешний коллбэк
        myEvent:
          '{$request.body#/callbackUrl}':
            post:
              requestBody:
                content:
                  application/json:
                    schema:
                      type: object
                      properties:
                        message:
                          type: string
              responses:
                '200':
                  description: Success
              # Недопустимо: вложенный коллбэк
              callbacks:
                nestedEvent:
                  '{$request.body#/nestedCallbackUrl}':
                    post:
                      requestBody:
                        content:
                          application/json:
                            schema:
                              type: object
                              properties:
                                status:
                                  type: string
                      responses:
                        '200':
                          description: Nested success
```

---

### oas3-examples-value-or-externalValue

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| WARN     | Examples должен содержать value или externalValue   |

#### Описание

В OpenAPI 3.x примеры (examples) должны содержать либо поле `value` с непосредственным значением, либо поле `externalValue` с ссылкой на внешний файл. Наличие обоих полей одновременно или отсутствие обоих недопустимо.

#### Решение

```textmate
Убедитесь, что каждый пример содержит либо поле `value`, либо поле `externalValue`, но не оба сразу.
```

#### Примеры

##### Правильно
```yaml
components:
  examples:
    userDetails:
      summary: Пример данных пользователя
      value:
        id: 123
        name: John Doe
        email: john.doe@example.com
    externalExample:
      summary: Внешний пример
      externalValue: 'https://example.com/examples/user.json'
```

##### Неправильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
components:
  examples:
    # Недопустимо: одновременно указаны value и externalValue
    badExample:
      summary: Неправильный пример
      value:
        id: 123
        name: John Doe
      externalValue: 'https://example.com/examples/user.json'
    # Недопустимо: отсутствуют оба поля
    anotherBadExample:
      summary: Еще один неправильный пример
      description: Пример без value и externalValue
```

---

### oas3-operation-security-defined

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Операция "security" должна быть определена в объекте "components.securitySchemes" |

#### Описание

В OpenAPI 3.x все схемы безопасности, указанные в операциях, должны быть определены в разделе `components.securitySchemes`. Это правило проверяет, что все ссылки на схемы безопасности в операциях соответствуют определенным схемам.

#### Решение

```textmate
Убедитесь, что все схемы безопасности, используемые в операциях, определены в `components.securitySchemes`.
```

#### Примеры

##### Правильно
```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
paths:
  /users:
    get:
      summary: Получить список пользователей
      security:
        - BearerAuth: []  # Ссылается на определенную схему
      responses:
        '200':
          description: Список пользователей
  /public/info:
    get:
      summary: Получить публичную информацию
      security:
        - ApiKeyAuth: []  # Ссылается на определенную схему
      responses:
        '200':
          description: Публичная информация
```

##### Неправильно
```yaml
components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
    # Недопустимо: отсутствует определение ApiKeyAuth
paths:
  /users:
    get:
      summary: Получить список пользователей
      security:
        - BearerAuth: []  # Правильно: ссылается на определенную схему
      responses:
        '200':
          description: Список пользователей
  /public/info:
    get:
      summary: Получить публичную информацию
      security:
        - ApiKeyAuth: []  # Недопустимо: ссылается на неопределенную схему
      responses:
        '200':
          description: Публичная информация
```

---

### oas3-server-variables

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Переменные из servers должны быть определены в variables и не должно быть неиспользуемых переменных |

#### Описание

В OpenAPI 3.x все переменные, используемые в URL серверов, должны быть определены в объекте `variables`, и наоборот, все определенные переменные должны использоваться в URL. Это правило также проверяет, что у переменных с перечислениями значения по умолчанию соответствуют одному из допустимых значений.

#### Решение

```textmate
Убедитесь, что все переменные, используемые в URL серверов, определены в `variables`, и что все определенные переменные используются в URL.
```

#### Примеры

##### Правильно
```yaml
servers:
  - url: https://api.{environment}.example.com/v1
    description: Сервер API
    variables:
      environment:
        default: production
        enum:
          - production
          - staging
          - development
```

##### Неправильно
```yaml
openapi: 3.0.3
servers:
  - url: https://api.{environment}.example.com/v1
    description: Сервер API
    variables:
      environment:
        default: production
        enum:
          - production
          - staging
          # Недопустимо: неиспользуемая переменная
      version:
        default: v1
  # Недопустимо: переменная {region} не определена
  - url: https://{region}.api.example.com/{version}
    description: Региональный сервер
    variables:
      version:
        default: v1
```

---

### oas3-unused-component

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Спецификация не должна содержать неиспользуемые компоненты |

#### Описание

В OpenAPI 3.x спецификация не должна содержать неиспользуемые компоненты в разделе `components`. Это правило проверяет, что все схемы, ответы, параметры и другие компоненты, определенные в `components`, используются где-либо в спецификации. Наличие неиспользуемых компонентов увеличивает размер спецификации и может привести к путанице.

#### Решение

```textmate
Удалите неиспользуемые компоненты из раздела `components` или используйте их в соответствующих частях спецификации.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 1
        name:
          type: string
          example: name
  responses:
    UserResponse:
      description: Данные пользователя
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/User'
```

##### Неправильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
    # Недопустимо: неиспользуемая схема
    Order:
      type: object
      properties:
        id:
          type: integer
        amount:
          type: number
  responses:
    UserResponse:
      description: Данные пользователя
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/User'
    # Недопустимо: неиспользуемый ответ
    OrderResponse:
      description: Данные заказа
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Order'
paths:
  /users:
    get:
      responses:
        '200':
          $ref: '#/components/responses/UserResponse'
  # Недопустимо: отсутствует путь /orders, который использовал бы Order и OrderResponse
```

---

### oas3-valid-media-example

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Examples должны соответствовать объявленной схеме   |

#### Описание

В OpenAPI 3.x примеры (examples) в медиа-типах (content) должны соответствовать объявленной схеме. Это правило проверяет, что значения примеров соответствуют структуре и типам данных, определенным в схеме.

#### Решение

```textmate
Исправьте примеры так, чтобы они соответствовали объявленной схеме.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: integer
                  example: 123
                name:
                  type: string
                  example: John Doe
                email:
                  type: string
                  format: email
                  example: john.doe@example.com
            # Пример соответствует схеме
            example:
              id: 123
              name: John Doe
              email: john.doe@example.com
```

##### Неправильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
paths:
  /users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                id:
                  type: integer
                name:
                  type: string
                email:
                  type: string
                  format: email
            # Недопустимо: пример не соответствует схеме
            example:
              id: "123"  # Должно быть число, а не строка
              name: John Doe
              email: not-an-email  # Неверный формат email
      responses:
        '201':
          description: Пользователь создан
```

---

### oas3-valid-schema-example

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Examples в описании схемы должны соответствовать объявленным типам |

#### Описание

В OpenAPI 3.x примеры (examples) и значения по умолчанию (default), определенные в описании схем, должны соответствовать объявленным типам данных. Это правило проверяет, что значения примеров и значений по умолчанию соответствуют структуре и типам данных, определенным в схеме.

#### Решение

```textmate
Исправьте примеры и значения по умолчанию так, чтобы они соответствовали объявленным типам.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          # Пример соответствует типу
          example: 123
        name:
          type: string
          # Значение по умолчанию соответствует типу
          default: "Anonymous"
        email:
          type: string
          format: email
          # Пример соответствует формату
          example: "user@example.com"
      required:
        - id
        - name
```

##### Неправильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          # Недопустимо: пример не соответствует типу
          example: "123"  # Должно быть число, а не строка
        name:
          type: string
          # Недопустимо: значение по умолчанию не соответствует типу
          default: 456  # Должна быть строка, а не число
        email:
          type: string
          format: email
          # Недопустимо: пример не соответствует формату
          example: "not-an-email"
      required:
        - id
        - name
```

---

### object-request-response-postfix

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| WARN     | Объекты запросов и ответов должны быть заданы стилем PascalCase с постфиксами Request/Response |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#объекты-запросов-и-ответов-именуются-стилем-pascalcase-с-постфиксами-requestresponse) 

#### Описание

В OpenAPI схемы, используемые в запросах и ответах, должны следовать определенному стилю именования. Схемы, используемые только в запросах, должны заканчиваться на `Request`, а схемы, используемые только в ответах, должны заканчиваться на `Response`. Это правило применяется только к схемам, которые фактически используются в запросах или ответах.

#### Решение

```textmate
Переименуйте схемы, используемые в запросах и ответах, чтобы они заканчивались на соответствующие постфиксы.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    # Схема запроса заканчивается на Request
    CreateUserRequest:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
          format: email
    # Схема ответа заканчивается на Response
    UserResponse:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email
    # Схема, используемая и в запросе, и в ответе, может не иметь постфикса
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email
paths:
  /v1/users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUserRequest'
      responses:
        '201':
          description: Пользователь создан
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/UserResponse'
```

##### Неправильно
```yaml
components:
  schemas:
    # Недопустимо: схема запроса не заканчивается на Request
    CreateUser:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
          format: email
    # Недопустимо: схема ответа не заканчивается на Response
    User:
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        email:
          type: string
          format: email
paths:
  /users:
    post:
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateUser'
      responses:
        '201':
          description: Пользователь создан
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'
```

---

### operation-parameters

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Параметры в методах должны быть уникальными         |

#### Описание

В OpenAPI операциях параметры должны быть уникальными по комбинации полей `name` и `in`. Также запрещено одновременное использование параметров с `in: body` и `in: formData`, а также использование более одного параметра с `in: body`.

#### Решение

```textmate
Убедитесь, что все параметры в операциях уникальны по комбинации `name` и `in`, и что не используются запрещенные комбинации параметров.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users/{id}:
    get:
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
        - name: includeDetails
          in: query
          schema:
            type: boolean
            default: false
```

##### Неправильно
```yaml
paths:
  /users/{id}:
    get:
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: integer
        - name: id  # Недопустимо: дубликат параметра с тем же name и in
          in: path
          required: true
          schema:
            type: string
```

---

### operation-success-response

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Метод должен иметь 2xx либо 3xx ответ               |

#### Описание

В OpenAPI каждая операция должна определять как минимум один успешный ответ с кодом состояния 2xx или 3xx. Это правило проверяет, что для каждой операции определен хотя бы один успешный ответ.

#### Решение

```textmate
Добавьте хотя бы один успешный ответ (с кодом 2xx или 3xx) для каждой операции.
```

#### Примеры

##### Правильно
```yaml

paths:
  /v1/users:
    get:
      summary: Получить список пользователей
      responses:
        '200':  # Успешный ответ
          description: Список пользователей
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/User'
```

##### Неправильно
```yaml
paths:
  /users:
    get:
      summary: Получить список пользователей
      responses:
        '400':  # Недопустимо: только ошибочные ответы
          description: Неверный запрос
        '500':
          description: Внутренняя ошибка сервера
```

---

### operation-tag-defined

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Tags методов должны быть определены в глобальном списке tags |

#### Описание

В OpenAPI все теги, используемые в операциях, должны быть определены в глобальном списке `tags` в корне документа. Это правило проверяет, что все теги, указанные в операциях, имеют соответствующее определение в глобальном списке.

#### Решение

```textmate
Добавьте все используемые теги в глобальный список `tags` в корне документа.
```

#### Примеры

##### Правильно
```yaml
# Глобальное определение тегов
tags:
  - name: Users
    description: Операции с пользователями
  - name: Orders
    description: Операции с заказами
paths:
  /v1/users:
    get:
      tags:
        - Users  # Тег определен в глобальном списке
      summary: Получить список пользователей
      responses:
        '200':
          description: Список пользователей
  /v1/orders:
    get:
      tags:
        - Orders  # Тег определен в глобальном списке
      summary: Получить список заказов
      responses:
        '200':
          description: Список заказов
```

##### Неправильно
```yaml
# Глобальное определение тегов
tags:
  - name: Users
    description: Операции с пользователями
  # Недопустимо: отсутствует определение тега Orders
paths:
  /users:
    get:
      tags:
        - Users  # Тег определен в глобальном списке
      summary: Получить список пользователей
      responses:
        '200':
          description: Список пользователей
  /orders:
    get:
      tags:
        - Orders  # Недопустимо: тег не определен в глобальном списке
      summary: Получить список заказов
      responses:
        '200':
          description: Список заказов
```

---

### path-declarations-must-exist

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Параметры пути не должны записываться пустыми элементами, например "/given/{}" |

#### Описание

В OpenAPI пути не должны содержать пустых параметров, таких как `"/given/{}"`. Это правило проверяет, что все параметры пути имеют имена и не являются пустыми.

#### Решение

```textmate
Убедитесь, что все параметры пути имеют имена в формате `{имя_параметра}`.
```

#### Примеры

##### Правильно
```yaml
openapi: 3.0.3
info:
  title: Example API
  version: 1.0.0
paths:
  /v1/orders/{orderId}/items/{itemId}:  # Несколько параметров с именами
    get:
      parameters:
        - name: orderId
          in: path
          required: true
          schema:
            type: integer
        - name: itemId
          in: path
          required: true
          schema:
            type: integer

```

##### Неправильно
```yaml
paths:
  /users/{}:  # Недопустимо: пустой параметр пути
    get:
      responses:
        '200':
          description: Данные пользователя
```

---

### path-kebab-case

| Severity | Description                              |
|----------|------------------------------------------|
| ERROR    | Path должны быть в kebabCase формате     |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#использование-kebab-case-для-пути) 

#### Описание

Все пути в API должны следовать формату kebab-case, где слова разделены дефисами и состоят только из строчных букв и цифр. Это правило проверяет, что все сегменты пути соответствуют этому формату.

#### Решение

```textmate
Измените пути так, чтобы все сегменты следовали формату kebab-case (например, /user-profiles вместо /user_profiles или /UserProfiles).
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/user-profiles:  # kebab-case
    get:
      summary: Получить список профилей пользователей
      operationId: getUserProfiles
      responses:
        '200':
          description: Список профилей пользователей
```

##### Неправильно
```yaml
paths:
  /v1/user_profiles:  # snake_case вместо kebab-case
    get:
      operationId: getUserProfiles
      responses:
        '200':
          description: Список профилей пользователей
  /v1/userProfiles:   # camelCase вместо kebab-case
    get:
      operationId: getUserProfiles2
      responses:
        '200':
          description: Список профилей пользователей
  /v1/UserProfiles:   # PascalCase вместо kebab-case
    get:
      operationId: getUserProfiles3
      responses:
        '200':
          description: Список профилей пользователей
```

---

### path-no-redundant-prefixes

| Severity | Description                                                              |
|----------|--------------------------------------------------------------------------|
| ERROR    | В paths запрещено использовать сегменты api, openapi, http, service      |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#избегать-избыточных-префиксов-в-пути) 

#### Описание

В путях API запрещено использовать избыточные префиксы, такие как `api`, `openapi`, `http` и `service`. Эти префиксы считаются избыточными, так как они не добавляют смысловой нагрузки и могут привести к неоднозначности в структуре API.

#### Решение

```textmate
Удалите избыточные префиксы из путей API.
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users:  # Правильно: без избыточных префиксов
    get:
      summary: Получить список пользователей
      operationId: getUsers
      responses:
        '200':
          description: Список пользователей
```

##### Неправильно
```yaml
paths:
  /api/v1/users:  # Недопустимо: избыточный префикс api
    get:
      operationId: getUsers
      responses:
        '200':
          description: Список пользователей
  /openapi/v1/orders:  # Недопустимо: избыточный префикс openapi
    get:
      operationId: getOrders
      responses:
        '200':
          description: Список заказов
```

---

### path-params

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Параметры пути должны быть описаны и использованы   |

#### Описание

Все параметры пути, используемые в шаблонах путей (например, `{id}` в `/users/{id}`), должны быть правильно описаны в разделе `parameters` на уровне пути или операции. Каждый параметр должен иметь свойство `required` со значением `true` и не должен быть определен несколько раз. Кроме того, все описанные параметры пути должны использоваться в соответствующем шаблоне пути.

#### Решение

```textmate
Убедитесь, что все параметры пути:
1. Описаны в разделе `parameters` на уровне пути или операции
2. Имеют свойство `required: true`
3. Не дублируются
4. Используются в соответствующем шаблоне пути
```

#### Примеры

##### Правильно
```yaml
paths:
  /v1/users/{id}:  # Параметр {id} используется в пути
    get:
      summary: Получить пользователя по ID
      operationId: getUserById
      parameters:
        - name: id  # Параметр описан
          in: path
          required: true  # Обязательный параметр
          schema:
            type: integer
            example: 123
```

##### Неправильно
```yaml
paths:
  /v1/users/{id}:  # Параметр {id} используется в пути
    get:
      summary: Получить пользователя по ID
      operationId: getUserById
      parameters:
        - name: id
          in: path
          # Недопустимо: отсутствует required: true
          schema:
            type: integer
      responses:
        '200':
          description: Данные пользователя
  /v1/products/{productId}:  # Параметр {productId} используется в пути
    get:
      summary: Получить продукт по ID
      operationId: getProductById
      parameters:
        - name: productId
          in: path
          required: true
          schema:
            type: integer
        - name: productId  # Недопустимо: дублирование параметра
          in: path
          required: true
          schema:
            type: integer
      responses:
        '200':
          description: Данные продукта
```

---

### typed-enum

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Каждый элемент Enum должен соответствовать указанному типу |

#### Описание

Все значения в перечислениях (enum) должны соответствовать типу, указанному в свойстве `type` схемы. Это правило проверяет, что каждый элемент перечисления имеет правильный тип данных в соответствии с определением схемы.

#### Решение

```textmate
Убедитесь, что все значения в перечислении соответствуют типу, указанному в свойстве `type` схемы.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    UserRole:
      type: string
      enum:
        - ADMIN
        - USER
        - GUEST
    UserStatus:
      type: integer
      enum:
        - 1
        - 2
        - 3
```

##### Неправильно
```yaml
components:
  schemas:
    UserRole:
      type: string
      enum:
        - ADMIN
        - USER
        - 123
    UserStatus:
      type: integer
      enum:
        - 1
        - 2
        - "ACTIVE"
    Priority:
      type: number
      enum:
        - 1.5
        - 2.7
        - true
```

---
### valid-schema-example

| Severity | Description                                         |
|----------|-----------------------------------------------------|
| ERROR    | Все схемы должны иметь example                      |

#### Описание правила в API Guide

[Ссылка на описания правила](../../../rules/rules.md#заполняй-примеры-в-документации) 

#### Описание

Все схемы в спецификации API должны содержать примеры (примеры значений для полей). Это правило проверяет, что каждая схема имеет поле `example`, которое демонстрирует ожидаемую структуру данных. Это улучшает понимание API и упрощает его использование для разработчиков.

#### Решение

```textmate
Добавьте поле `example` к каждой схеме и каждому свойству в схемах, демонстрирующее ожидаемые значения.
```

#### Примеры

##### Правильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 123
        name:
          type: string
          example: John Doe
        email:
          type: string
          format: email
          example: john.doe@example.com
      example:  # Пример для всей схемы
        id: 123
        name: John Doe
        email: john.doe@example.com
```

##### Неправильно
```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          # Отсутствует example
        name:
          type: string
          # Отсутствует example
        email:
          type: string
          format: email
          # Отсутствует example
      # Отсутствует example для всей схемы
    Error:
      type: object
      properties:
        code:
          type: integer
          # Отсутствует example
        message:
          type: string
          # Отсутствует example
      # Отсутствует example для всей схемы
```

---
