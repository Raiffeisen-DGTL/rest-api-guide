# Термины

**Embedded Finance** - это интеграция финансовых услуг непосредственно в продукты и услуги бизнеса через API. 
Это позволяет как финансовым, так и нефинансовым предприятиям предлагать такие услуги, как платежи, кредитование и страхование, не подвергаясь регулированию в качестве финансовых организаций 
и не создавая самостоятельно какую-либо финансовую инфраструктуру. 
Для нашего банка в целом и для CIB в частности это является стратегической целью так как поваляет привлекать клиентов с большими транзакционными потребностями, а также удерживать клиентов 

**API as a Product** - означает отношение к вашему API как к продукту, начиная с его концептуализации и заканчивая постоянным управлением. Включать в себя реализацию принципов проектирования, ориентированных на пользователя, создание более качественной документации и поддержание прочных отношений с клиентами.
Для нас эта концепция включает совместную работу клиентских менеджеров, менеджеров продуктов, продуктовых команд и поддержки. Она позволяет развивать стратегию Embedded Finance не только через проектирование удобных API, но и через качественную документацию, легкий онбординг и комплексное сопровождение клиента.

**API First** - это подход к разработке программного обеспечения (инженерная практика), в котором основное внимание 
уделяется проектированию и разработке API приложения (интерфейс прикладного программирования) перед любыми другими частями приложения.
Сам контракт (API) является главным источником правды о продукте и при этом развивается по тем же правилам, что и код (контроль версий, code review, ci/cd).

# API First

Под практикой API First мы подразумеваем:
- Проектирование API до начала разработки
- Хранение API в человеко-машино-читаемом формате (OpenApiSpec, AsyncApiSpec..)
- Отслеживание изменений API в системе контроля версий (Git)
- Использование API как единому источнику правды о системе/продукте (протокол, документация...)
- Создание консистентного API руководствуясь общими "Лучшими практиками"

---



1. [Описание критериев зрелости команды разрабатывающей API](team-maturity.md)
2. [Гайд где собраны лучшие практики и договоренности создания Restful API](rest-api-guide.md)
3. [Процесс работы над API](api-before-impl.md)
4. [Процесс кросскомандного ревью API](api-review-process.md)
5. [Глоссарий RaifPay](glossary.md)
6. [OpenApi Best Practice](open-api-guide.md)
