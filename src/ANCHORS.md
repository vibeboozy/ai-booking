/\*\*

- ANCHOR: shared
- PURPOSE: Документация якорной разметки TripVibe для разработчиков и LLM.
-
- Каждый исходный файл MUST содержать JSDoc-блок:
-
- ```

  ```

- /\*\*
- - ANCHOR: {module} — search | listing | booking | profile | reviews | shared
- - PURPOSE: — одно предложение: за что отвечает файл
- - Dependencies: — модули, API, lib
- - CRITICAL: — (optional) hard requirements
- -
- - DO:
- - - ...
- - DONT:
- - - ...
- \*\/
- ```

  ```

-
- Public API модулей — только через src/modules/{module}/index.ts
  \*/

export {};
