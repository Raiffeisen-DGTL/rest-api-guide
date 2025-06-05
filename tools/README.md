# Инструменты для API First

> 🛠 Подборка проверенных инструментов для работы по API First в банке

- [Инструменты для API First](#инструменты-для-api-first)
  - [Редакторы спецификаций](#редакторы-спецификаций)
    - [VS Code + расширения](#vs-code--расширения)
    - [IntelliJ IDEA + плагины](#intellij-idea--плагины)
    - [Stoplight Studio](#stoplight-studio)
  - [Кодогенерация](#кодогенерация)
    - [OpenAPI Generator](#openapi-generator)
      - [Пример настройки кодогенерации в Gradle](#пример-настройки-кодогенерации-в-gradle)
    - [Modelina - генерация моделей на основе AsyncAPI](#modelina---генерация-моделей-на-основе-asyncapi)
  - [Mock-серверы](#mock-серверы)
    - [Prism by Stoplight](#prism-by-stoplight)
    - [Wiremock - генерация моделей на основе AsyncAPI](#wiremock---генерация-моделей-на-основе-asyncapi)
  - [Тестирование](#тестирование)
    - [Pact](#pact)
    - [Spring Cloud Contract](#spring-cloud-contract)
  - [Валидация](#валидация)
    - [Spectral by Stoplight](#spectral-by-stoplight)
    - [Vacuum Quobix](#vacuum-quobix)
  - [Документация](#документация)
    - [Redocly](#redocly)
    - [Docusaurus + OpenAPI Plugin](#docusaurus--openapi-plugin)
    - [Swagger UI](#swagger-ui)
    - [OpenAPI Generator](#openapi-generator-1)


## Редакторы спецификаций

### VS Code + расширения
**Рекомендуется для большинства команд**
- ✅ Бесплатный
- ✅ Автодополнение для OpenAPI
- ✅ Визуализация OpenAPI в Swagger UI прямо в редакторе
- ✅ Встроенная валидация по схеме
- ✅ Поддержка Spectral плагина
- ❌ Ручное редактирование спецификации

**Ссылки**
- [VS Code](https://code.visualstudio.com/)
- [Плагин - OpenAPI (Swagger) Editor](https://marketplace.visualstudio.com/items?itemName=42Crunch.vscode-openapi)
- [Плагин - Spectral](https://marketplace.visualstudio.com/items?itemName=stoplight.spectral)

### IntelliJ IDEA + плагины
**Для Java разработчиков**
- ✅ Интеграция с кодом
- ✅ Рефакторинг
- ✅ Генерация кода
- ✅ Привычно для JVM разработчиков
- ❌ Ручное редактирование спецификации
- ❌ В Community версии встроенный плагин не работает, нужно искать аналоги


### Stoplight Studio
**Для визуального проектирования**
- ✅ Визуальный редактор
- ✅ Встроенная документация
- ✅ Встроенная проверка по правилам Spectral
- ❌ Нет контроля над выходной спецификацией
- ❌ Выходная спецификация может требовать ручной корректировки
- ❌ Платный для команд

## Кодогенерация

### OpenAPI Generator
**Универсальное решение**

- Из OpenAPI можно получить код для сервера, клиента, документации, тестов, postman-коллекции и т.д.
- Интегрируется как через CLI, так и через Gradle/Maven плагин
- Имеет самое обширное коммьюнити среди доступных решений на рынке

Поддерживает самые популярные в банке языки:
- **Backend**: Java/Kotlin (Spring), Go, Python (FastAPI)
- **Frontend**: TypeScript (Axios, Fetch), JavaScript
- **Mobile**: Kotlin, Swift

**Ссылки**
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Доступные генераторы](https://openapi-generator.tech/docs/generators)
- [Gradle плагин](https://plugins.gradle.org/plugin/org.openapi.generator)
- [Maven плагин](https://github.com/OpenAPITools/openapi-generator/tree/master/modules/openapi-generator-maven-plugin)

#### Пример настройки кодогенерации в Gradle

```kotlin
plugins {
    kotlin("jvm") version "2.0.20"
    id("org.openapi.generator") version "7.11.0"
}

group = "ru.raif"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
}

openApiGenerate {
    globalProperties.set(
        mapOf(
            "models" to ""
        )
    )
    generatorName.set("spring")
    inputSpec.set("$rootDir/specs/openapi.yaml")
    outputDir.set("${buildDir}/generated")
    modelPackage.set("ru.raif.model")
}

tasks.test {
    useJUnitPlatform()
}
kotlin {
    jvmToolchain(21)
}
```

### Modelina - генерация моделей на основе AsyncAPI
**Лучший генератор моделей для асинхронных систем**

- ✅ Позволяет адаптировать API First для асинхронных систем/сервисов
- ✅ Легко встраивается в пайплайн с помощью CLI
- ✅ AsyncAPI описывает специфику очередей и топиков лучше чем OpenAPI
- ❌ Конфигурация пишется на Typescript, нужно базовое понимание
- ❌ Для кастомизации моделей, нужно писать на Typescript
- ❌ AsyncAPI не такой зрелый как OpenAPI, могут быть баги


**Ссылки**
- [Modelina](https://modelina.org/examples)
- [Пример настройки генерации Kotlin моделей](https://modelina.org/examples?selectedExample=generate-kotlin-models)
- [Пример использования генерации моделей в команде CDC Integrations](https://gitlabci.raiffeisen.ru/cdc-integrations/analytics/api-spec/-/blob/main/plugin/scripts/generateModels.ts)


## Mock-серверы

### Prism by Stoplight
**Рекомендуется для быстрого старта**
- ✅ Простая установка
- ✅ Динамические примеры
- ✅ Валидация запросов
- ✅ Бесплатный

**Ссылки**
- [Prism](https://github.com/stoplightio/prism)

### Wiremock - генерация моделей на основе AsyncAPI
**Отличный выбор для JVM разработчиков**
- ✅ Java-friendly
- ✅ Есть standalone версия
- ✅ Запись/воспроизведение
- ✅ Программируемые сценарии
- ✅ Отлично вписывается в процесс тестирования

**Ссылки**
- [Wiremock](https://wiremock.org/)
- [Kotlin генератор для wiremock](https://openapi-generator.tech/docs/generators/kotlin-wiremock/)
- [Java генератор для wiremock](https://openapi-generator.tech/docs/generators/java-wiremock/)


## Тестирование

### Pact
**Контрактное тестирование для микросервисов**
- ✅ Consumer-driven contracts
- ✅ Версионирование контрактов
- ✅ Broker для хранения

**Ссылки**
- [Pact.io](https://docs.pact.io/)

### Spring Cloud Contract
**Отличный выбор для JVM разработчиков**

**Ссылки**
- [Spring Cloud Contract](https://spring.io/projects/spring-cloud-contract)

## Валидация

### Spectral by Stoplight
**Отличный выбор для JVM разработчиков**


- ✅ Кастомные правила
- ✅ Интеграция с CI/CD
- ✅ Расширяемость
- ✅ Поддержка всех форматов
- ❌ Написан на JS, может быть медленным в CI/CD

**Ссылки**
- [Spectral](https://github.com/stoplightio/spectral)

### Vacuum Quobix
- ✅ Основан на стандарте правил Spectral
- ✅ Очень быстрый - написан на Go
- ✅ Имеет различные форматы отчетов(HTML, JUnit, JSON)
- ✅ Имеет встроенный набор правил

**Ссылки**
- [Vacuum](https://quobix.com/vacuum/about/)
- [Пример интеграции в Gradle в команде CDC Integrations](https://gitlabci.raiffeisen.ru/cdc-integrations/analytics/api-spec/-/blob/main/plugin/build.gradle.kts?ref_type=heads#L659)

## Документация

### Redocly
**Простая в настройке документация**

- ✅ Красивый дизайн
- ✅ Кастомизация
- ✅ SEO-friendly
- ✅ Встроенные примеры кода

**Ссылки**
- [Redocly](https://redocly.com/)
- [Пример документации](https://pay.raif.ru/doc/sbp.html)

### Docusaurus + OpenAPI Plugin
**Для комплексной документации**
- ✅ Markdown поддержка
- ✅ Версионирование
- ✅ Поиск
- ✅ Кастомные страницы

**Ссылки**
- [Docusaurus](https://docusaurus.io/)
- [Docusaurus OpenAPI Plugin](https://github.com/PaloAltoNetworks/docusaurus-openapi-docs)
- [Пример документации](https://developer.raiffeisen.ru/docs/api)

### Swagger UI
**Стандартное решение**
- ✅ Интерактивная документация
- ✅ Доступен в VS Code/IDE по-умолчанию. Также встроен в Gitlab
- ✅ Try it out
- ✅ Простая интеграция

**Ссылки**
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Swagger UI в Gitlab](https://docs.gitlab.com/api/openapi/openapi_interactive/)


### OpenAPI Generator
**Тоже умеет генерировать документацию**

- Набор генераторов документации в различных форматах таких как md, asciidoc, html и тп

**Ссылки**
- [OpenAPI Generator](https://openapi-generator.tech/)
- [Доступные генераторы](https://openapi-generator.tech/docs/generators)