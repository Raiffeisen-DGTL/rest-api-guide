# OpenAPI Best Practice

## Авторизация
Авторизация должна быть определена на уровне [Security Scheme](https://spec.openapis.org/oas/v3.1.0#security-scheme-object), если это возможно.

## Методы
- `operationId` - lowerCamelCase, содержит в себе короткое название метода (например, `createOrder` или `getPaymentStatus`).
- Тело запроса и ответа должны быть вынесены в блок [Components Object](https://spec.openapis.org/oas/v3.1.0#components-object) как [Schema](https://spec.openapis.org/oas/v3.1.0#schema).

## Объекты
- Объекты запросов и ответов именуются стилем CamelCase с постфиксами `Request/Response` (например, `CreateOrderRequest`). Исключение составляет случай, когда модель присутствует и в запросе, и в ответе. Тогда постфикс опускается.
- Все объекты, которые используются больше одного раза, должны быть вынесены как отдельные модели/параметры. Их использование происходит с помощью [ссылок](https://spec.openapis.org/oas/v3.1.0#reference-object) `$ref`.