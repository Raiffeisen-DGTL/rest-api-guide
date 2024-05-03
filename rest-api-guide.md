# REST API Best Practices

- [REST API Best Practices](#rest-api-best-practices)
  - [Общие рекомендации](#общие-рекомендации)
    - [Формат URL](#формат-url)
    - [HTTP methods](#http-methods)
    - [Детализация ошибки в теле ответа](#детализация-ошибки-в-теле-ответа)
  - [Именование методов](#именование-методов)
    - [Формат URL для эндпоинтов которые возвращают true/false](#формат-url-для-эндпоинтов-которые-возвращают-truefalse)
  - [Aутентификация, авторизация и подпись](#aутентификация-авторизация-и-подпись)
    - [Коды ответов при неудачной аутентификации/авторизации](#коды-ответов-при-неудачной-аутентификацииавторизации)
    - [Обратные вызовы к клиентам](#обратные-вызовы-к-клиентам)
  - [Версионирование](#версионирование)
    - [Обработка ошибок версионирования](#обработка-ошибок-версионирования)
  - [Обратно-совместимые и ломающие изменения](#обратно-совместимые-и-ломающие-изменения)
  - [Формат даты-времени](#формат-даты-времени)
  - [Формат стран, валют и сумм ](#формат-стран-валют-и-сумм-)
  - [Фильтрация](#фильтрация)
    - [Передача массива параметров в запросе GET](#передача-массива-параметров-в-запросе-get)
  - [Сортировка](#сортировка)
  - [Пагинация](#пагинация)
  - [Логирование](#логирование)

Цель гайда - улучшить разработку **новых** версий API и сделать его более единообразным для удобства потребителей.

Существующие контракты полностью сохраняются.

## Общие рекомендации

REST ([Representational State Transfer](https://en.wikipedia.org/wiki/Representational_state_transfer)) - это архитектурная абстракция, которая описывает взаимодействией компонентов в распределенной системе. REST широко используется для создания web API (*RESTful web API*), которое использует протокол HTTP как транспорт.

В RESTful web API обращение к ресурсу происходит по уникальному идентификатору (*URL*), с указанием действия над ресурсом (*HTTP method*), в запросе может передаваться тело запроса (*body*) и дополнительные заголовки (*HTTP header fields*). В ответ на запрос, ресурс возвращает код ответа (*HTTP status code*) и **может** возвращаться тело ответа.

В качество формата тела запроса/ответа рекомендуется использовать только JSON. Использование других форматов (XML/TXT) возможно в исключительных случаях.

### Формат URL

URL формируется по шаблону  https://{FQDN}/api/{product}/{version}/{path}.
Рекомендуем использовать [kebab case](https://en.wiktionary.org/wiki/kebab_case) в наименовании пути.

**URL состоит из следующих частей:**

{FQDN} - полное имя домена \
/api - префикс для отличия API от документации, лендинга и т.п. \
/{product} - префикс продукта из справочника, например: report, fiscal, sbp. \
/{version} - версия всего API продукта. Может находиться только в этой части пути. Нумеруется как: v1, v2, и т.д. \
/{path} - путь.

Других префиксов быть не должно.

**Среды разделены по доменам:**

Например,

<https://pay-dev.raif.ru> - тестовая среда. Для внутренних тестов.\
<https://pay-test.raif.ru> - превью, песочница для партнеров.\
<https://pay.raif.ru> - прод.

**В результате URL может выглядеть так:**

```
https://pay.raif.ru/api/fiscal/v2/customer-receipts
```

### HTTP methods

**GET** - используется только для получения данных от сервера, не изменяет данные на сервере и не должен иметь тела запроса.

**POST** - используется для создания новых ресурсов, генерация идентификатора нового ресурса выполняется на стороне сервера. В общем случае POST не гарантирует [идемпотентность](https://en.wikipedia.org/wiki/Idempotence), если идемпотентность требуется, то необходимо использовать дополнительные значения (*idempotency key*), генерируемые клиентом и передаваемые в заголовке или теле запроса.

**PUT, PATCH** - используются для изменения существующего ресурса на стороне сервера, PUT полностью замещает старую сущность и при его использовании в теле запроса нужно передавать все поля сущности, PATCH выполняет частичное изменение, при его использовании в теле запроса достаточно передать изменяемые поля.

**DELETE** - удаляет ресурс на стороне сервера.

### Детализация ошибки в теле ответа

Признаком ошибки являются коды HTTP status code 4xx и 5xx. Не следует возвращать код HTTP 200 для возврата ошибок.

За исключением коммуникационных ошибок типа 502 Bad Gateway, необходимо детализировать ошибку в теле ответа.

Не следует дублировать HTTP status code в теле сообщения.

Поле **“code”** содержит код ошибки вида SOME_ERROR_DETAIL (SCREAMING_SNAKE_CASE style). Рекомендуем посмотреть какие коды ошибок уже используются, чтобы **не дублировать** уже существующие коды с новым именем.

Поле **"message"** - это человеко читаемое поле, содержащие описание ошибки, которые можно выводить пользователю.

Ошибка валидации запроса необходимо возвращать в виде массива в поле "errors".\
Если необходим структурированный ответ об ошибке валидации, то допустимо включать в поле "errors" вложенные объекты или массивы.

Рекомендуем возвращать traceId для трассировки в теле ответа, чтобы упростить поиск ошибки при взаимодействии с внешними контрагентами. Предпочительный формат [B3](https://github.com/openzipkin/b3-propagation).

$`\textcolor{green}{\text{Рекомендуем:}}`$  

```json
{
    "code": "RECEIPT_VALIDATION_FAILED",
    "message": "Чек не прошел валидацию. Причина: {value}",
    "traceId" : "80f198ee56343ba8"
}

{
  "code": "DATA_ERROR",
  "message": "Ошибки в полях запроса",
  "errors": 
  {
    "username": "Описание ошибки",
    "email": "Не прошла валидация почты"
    "password": "Не заполнено",
    "items": [
      { 
        "amount": "Поле должно быть заполнено",
        "quantity": "число вне допустимого диапазона (ожидалось <5 разрядов>.<3 разрядов>"
      }
    ]
  },
  "traceId": "a123ewr"
}

{
    "code": "RECEIPT_VALIDATION_FAILED",
    "message": "Чек не прошел валидацию. Причина: items[0].amount число вне допустимого диапазона (ожидалось <8 разрядов>.<2 разрядов>), items[0].quantity число вне допустимого диапазона (ожидалось <5 разрядов>.<3 разрядов>)",
    "traceId": "a123ewr"
}
```

$`\textcolor{red}{\text{Не рекомендуем:}}`$  

```json
{
    "timestamp": "2021-01-01T12:00:27.87+00:20",
    "status": 401,
    "error": "Unauthorized",
    "message": "",
    "path": "/api/cards/v1/callback/settings/"
}

200 OK
{
    "code": "ERROR.ACCOUNT_ALREADY_REGISTERED",
    "message": "Счет 40700000007721511123 уже зарегистрирован для этого юридического лица"
}
```

## Именование методов
### Формат URL для эндпоинтов которые возвращают true/false
Иногда надо проверить существование объекта или списка объектов
В соответствии с общепринятыми практиками именования методов  (https://restfulapi.net/resource-naming/), такой энпоинт всего лишь действие и должен быть глаголом.

Ответ не имеет значение главное формат - json.

Не следует использовать:

```
GET https://pay.raif.ru.ru/api/sbp/v1/companies/Romashka
```
В данном случае нет явного признака что будет возвращено true/false и семантика говорит о том что должен вернуться объект и в случае если объект не существует то должно возвращаться 404

```
Через count

GET /api/rbo/pos/posmaster/v1/cnums/{cnum}/terminals/count?sbpAvailable=true
{"terminalsCount": 0}
```

В этом случае используется count, вычисление count с фильтрами может быть достаточно тяжеловестным, count как правило уже выдается в списке


## Aутентификация, авторизация и подпись

Аутентификация позволяет индентифицировать клиента API, авторизация разрешает клиенту определенные действия.

Рекомендуется выполнять аутентификацию всех запросов  с помощью Bearer токенов.

Bearer токен передается в заголовке:

```json
Authorization: Bearer <token>
```

Если для сервиса критична надежная аутентификация, то рекомендуем использовать взаимную аутентификацию TLS с длинной ключа не менее 2048 бит.
В отдельных случаях, допустимо ограничивать доступ к сервису по белому списку IP-адресов.

### Коды ответов при неудачной аутентификации/авторизации

Если аутентификация не пройдена, то следует ответить кодом 401. Аутентификация считается неуспешной в случае:

- Если токен не декодируется
- Если подпись токена невалидна
- Если пользователь по токену не идентифицирован

Если аутентификация пройдена, но дейстие не авторизовано, то следует ответить кодом 403. Неуспешной авторизацией считается если у пользователя не достаточно разрешений для выполнения метода
Если выполнен запрос данных не принадлежащих пользователю, то следует ответить кодом 404.

Необходимо использовать HTTPS для обеспечения безопасного обмена данными между клиентом и сервером.
Используйте ролевую модель авторизации для определения прав доступа пользователей к различным ресурсам API.
Обеспечьте механизмы контроля доступа для предотвращения несанкционированного доступа к API. Например, можно использовать IP-адреса, ограничить доступ по времени или на основе других параметров.

### Обратные вызовы к клиентам

Обратные вызовы к клиентам (*callback*) следует осуществлять через POST запросы с телом в виде JSON. Сообщения должны быть подписаны с помощью алгоритма HMAC-SHA-256 с использованием общего секретного ключа, данные должны включать все поля передаваемого сообщения. Подпись передается в заголовке x-api-signature-sha256.

Для аутентификации рекомендуется использовать Bearer-токен, не рекомендуется HTTP Basic Authorization или полное отсутствие авторизации.
Необходимо использовать HTTPS для обеспечения безопасного обмена.

## Версионирование

В начале пути указывается версия API продукта, и она не меняется, пока не выпустили новую версию продукта целиком:

```
https://pay.raif.ru/api/sbp/v1/companies/Romashka/...
```

Логически несвязанные API продуктов версионируются раздельно.

Это предпочтительная модель версионирования, но в отдельных случаях, может использоваться версионирование на уровне ресурса, чтобы не создавать новую версию API продукта из-за изменений в одном методе.

Версии ресурсов указываются в строке запроса с ключом "version":

$`\textcolor{green}{\text{Рекомендуем:}}`$  

```
https://pay.raif.ru/api/sbp/v1/companies/Romashka/orders?version=2
```

Если версия в строке запроса не указана, подразумевается первая версия ресурса (version=1).

Версии нумеруются только натуральными числами. Без разбиения на major, minor, patch и release.

$`\textcolor{red}{\text{Не рекомендуем:}}`$  

```
https://pay.raif.ru.ru/api/sbp/v1/companies/Romashka/orders?version=2.1
```

### Обработка ошибок версионирования

Если запрошенная версия ресурса недоступна, следует вернуть 400 ошибку с телом:

```json
{
    "code": "UNSUPPORTED_VERSION",
    "message": "Версия {value} не поддерживается",
    "traceId" : "..."
}
```

## Обратно-совместимые и ломающие изменения

В REST API изменения могут быть ломающими (*breaking changes*) или обратно-совместимыми (*backward-compatible changes*) в зависимости от того, будут ли они нарушать существующий контракт API.

Ломающие изменения нарушают контракт API и могут привести к тому, что клиенты, которые ранее работали с API, перестанут работать или будут работать некорректно. Например, если изменить тип возвращаемого значения метода API, это может привести к ошибке на стороне клиента, который ожидал другой тип данных.

Обратно-совместимые изменения не нарушают контракт API и не приводят к сбоям на стороне клиента. Такие изменения могут включать добавление новых ресурсов, методов, параметров запросов, но не изменение или удаление существующих.

Примеры обратно-совместимых изменений:

- добавление новых ресурсов или методов;
- добавление дополнительных параметров в запрос;
- добавление нового заголовка;
- изменение порядка полей в ответе;
- изменение порядка сортировки в ответе.

Некоторые примеры ломающих изменений:

- изменение в стандартном заголовке ответа или кастомном заголовке;
- изменение бизнес-логики (например, в документации описано поведение метода, но внезапно метод возвращает другой результат при неизменных входных данных);
- изменение типа данных параметра или полей в ответе;
- удаление ресурса или метода из API;
- изменение регистра значений в ответе (например, "OK" вместо "ok").

Добавление полей в ответ рекомендуем избегать, чтобы не сломать логику на стороне клиента.
Для ломающих измененений должна создаваться новая версия ресурса.

Важно помнить, что любые изменения в API должны быть хорошо продуманы и документированны, чтобы избежать проблем совместимости и сбоев у потребителей API.

## Формат даты-времени

Используем формат [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601).
Избегаем использования времени / микросекунд / миллисекунд если в этом нет явной необходимости.
Принимаем в запросах время и в UTC, и с указанием чаcового пояса, возвращаем в ответе строго в формате UTC. Если в запросе нет признака UTC или указания часового пояса - возвращаем ошибку валидации.

Паттерны для даты-времени **YYYY-MM-DDThh:mm:ssZ** / **YYYY-MM-DDThh:mm:ss±hh:mm**.

Паттерн для даты **YYYY-MM-DD**.

Используем названия полей вида someData как для даты, так и для даты-времени.

$`\textcolor{green}{\text{Рекомендуем:}}`$  

```json
"birthDate": "1980-01-30"
"qrExpirationDate": "2023-07-22T09:14:38+03:00"
"createDate": "2019-08-24T14:15:22Z"
"transactionDate": "2022-12-08T13:21:04.631543+03:00" 
```

$`\textcolor{red}{\text{Не рекомендуем:}}`$  

```json
"birthday": "1980.01.30"
"dateTime": "2020-01-15T16:01:49.043924"
"createDateTime": "2011-03-01T14:15:22Z"
```

## Формат стран, валют и сумм <a name="Формат_стран_валют"></a>

Формат стран [ISO 3166, UPPER ALPHA-2](https://en.wikipedia.org/wiki/ISO_3166-1).

Формат валют [ISO 4217, UPPER ALPHA-3](https://en.wikipedia.org/wiki/ISO_4217).

Суммы указываются как строка с дробным числом (если количество разрядов >0 ), разделитель точка, количество разрядов зависит от валюты.

Необходимо всегда указывать код валюты.

$`\textcolor{green}{\text{Рекомендуем:}}`$  

```json
"currency": "RUB"
"country": "RU"
"amount": 1110.11
```

$`\textcolor{red}{\text{Не рекомендуем:}}`$  

```json
"currency": "643"
"currency": "Ruble"
"country": "RUS"
"country": "Belarus"
"sum": 1200.1
```

## Фильтрация

Фильтры рекомендуем делать в виде строки запроса GET

$`\textcolor{green}{\text{Рекомендуем:}}`$  

```
GET /api/sbp/v1/products?name=product&price=50&category=electronics
```

Если список аргументов в фильтре слишком длинный (URL может превысить 2048 символов), 
то рекомендуем использовать для реализации фильтров запрос POST с передачей аргументов в теле запроса.

$`\textcolor{green}{\text{Рекомендуем:}}`$  

```
POST /api/sbp/v1/products/search

{
   dateFrom="...",
   dateTo="...",
   ....
}
```

Не рекомендуем передавать аргументы в теле запроса GET.

$`\textcolor{red}{\text{Не рекомендуем:}}`$  

```
GET /api/sbp/v1/products
{
  "name": "product",
  "price": 50,
  "category": "electronics"
}
```

Реализация фильтров с логическими операциями or / not / ... по усмотрению исполнителя, общая рекомендация - избегать необходимости в таких фильтрах.

$`\textcolor{red}{\text{Не рекомендуем:}}`$  

```
GET /api/sbp/v1/products?or_label=A&or_label=B&label_not=C
```

### Передача массива параметров в запросе GET

Для передачи массива параметров в запросе GET рекомендуем передавать параметры через запятую либо через повторяющиеся переменные.

$`\textcolor{green}{\text{Рекомендуем:}}`$  

```
GET /api/sbp/v1/products?ids=1,2,3

GET /api/sbp/v1/products?ids=1&ids=2&ids=3
```

$`\textcolor{red}{\text{Не рекомендуем:}}`$  

```
GET  /api/sbp/v1/products?ids=["1", "2", "3"]

GET /api/sbp/v1/products
{
  "ids": [1, 2, 3]
}

GET /api/sbp/v1/products?status[]=1&status[]=2&status[]=3

GET  /api/sbp/v1/products?ids=1-3
```

## Сортировка

В общем случае, клиент не должен полагаться на сортировку результата сервером, за исключением случаев, когда документация на API явно описывает сортировку по-умолчанию.

В случаях когда запрос возвращает небольшую выборку, более предпочтительным вариантом может оказаться сортировка на стороне клиента.

Если требуется сортировка по одному полю, то рекомендуем указывать поле для сортировки в параметре **sortby** и порядок сортировки в параметре **orderby** (asc/desc).

$`\textcolor{green}{\text{Рекомендуем:}}`$  

```
GET /api/v1/products?sortby=price&orderby=desc
```

$`\textcolor{red}{\text{Не рекомендуем:}}`$  

```
GET /api/v1/users?sort=-created_at,+username

GET /api/v1/products?sortby=price_asc&date_desc

GET /api/v1/users?sort={"created_at":"desc","username":"asc"}
```

Если параметр **orderby** не указан, то по-умолчанию предполагается сортировка по возрастанию (*asc*).

В сложных случаях, когда требуется сортировка по нескольким полях в сочетании со сложными фильтрами и(или) пагинацией, рекомендуем использовать метод POST.

$`\textcolor{green}{\text{Рекомендуем:}}`$  

```
POST /api/v1/users/search
{
    "filter": "some filter",
    "paging": {
        "offset": 50,
        "limit": 20
    },
    "order": [
      {  "priority": 1,
         "sortBy": "created_at",
         "orderBy": "desc"
      },
      {  "priority": 2,
         "sortBy": "username",
         "orderBy": "asc"
      }
    ]
}
```

## Пагинация

Для небольших объемов данных, которые редко изменяются, рекомендуется использовать offset-пагинацию.
Параметр запроса "page" указывает на zero-based номер страницы, "size" - на максимальный размер возвращаемого массива.

Запрос:
```
GET /api/sbp/v1/products?name=potato&page=2&size=20
```
В случае сложных фильтров:
```
POST /api/sbp/v1/products/search
```
```json
{
    "filter": "some filter",
    "paging": {
        "page": 2,
        "size": 20
    }
}
```

Ответ кроме самих данных содержит общее число страниц, число элементов и флаг наличия следующей страницы:
```json
{
    "content": ["foo", "bar"],
    "totalPages": 2,
    "totalElements": 21,
    "last": true
}
```
Для больших или быстро меняющихся наборов данных, лучше использовать курсор-пагинацию.
Для значения курсора следует использовать уникальный индексированный набор полей.
Например, дату создания записи. Для унификации значение курсора кодируется в base64.

Запрос первой страницы может быть без явного указания курсора:
```
GET /api/sbp/v1/products?limit=20
```

Ответ должен содержать значение курсора начала следующей страницы:
```json
{
    "products": [],
    "nextCursor": "ewogICJjcmVhdGVkIjogIjIwMjMtMDctMjJUMDk6MTQ6MzgrMDM6MDAiCn0="
}
```

Запрос следующей страницы со значеним курсора:
```
GET /api/sbp/v1/products?cursor=ewogICJjcmVhdGVkIjogIjIwMjMtMDctMjJUMDk6MTQ6MzgrMDM6MDAiCn0%3D&limit=20
```

Если записей больше нет, nextCursor должен быть пустым:
```json
{
    "products": [{
        "id": 123
    }],
    "nextCursor": ""
}
```

При необходимости сортировки данных, их следует добавлять в курсор.
Запрос:
```
GET /api/sbp/v1/products?sort=price,name&limit=20
```
Ответ:
```json
{
    "products": [{
        "id": 123
    }],
    "nextCursor": "ewogICJwcmljZSI6IDEyLjAxLAogICJuYW1lIiwgInBvdGF0byIsCiAgImNyZWF0ZWQiOiAiMjAyMy0wNy0yMlQwOToxNDozOCswMzowMCIKfQ"
}
```

## Логирование

***NOTE:*** Этот раздел в процессе обсуждения

Используйте логирование для отслеживания действий клиентов и обнаружения несанкционированных доступов.
Регулярно проверяйте безопасность своего API и анализируйте журналы логов для выявления потенциальных уязвимостей.