<div align="center">
<h3>@schuelerconnect/schema</h1>
<p>
<img alt="npm" src="https://img.shields.io/npm/v/@schuelerconnect/schema?color=red&style=for-the-badge">
<img alt="NPM" src="https://img.shields.io/npm/l/@schuelerconnect/schema?color=orange&style=for-the-badge">
<img alt="npm" src="https://img.shields.io/npm/dt/@schuelerconnect/schema?color=yellow&style=for-the-badge">
<img alt="GitHub issues" src="https://img.shields.io/github/issues/schueler-connect/schema?color=green&style=for-the-badge">
<img alt="Testabdeckung" src="./coverage.svg">
</p>
<p>Built with ❤️ by <a href="https://github.com/codemaster138">@codemaster138</a></p>
<img alt="" src="assets/cover.png"/>
</div>

🌎 Deutsch | [English](README-en.md)

`@schuelerconnect/schema` ist eine leichte (~4kb) package, die es erlaubt, einfach und ohne redundanz typensichere GraphQL-Schemen zu schreiben:

```ts
import * as $ from "@schuelerconnect/schema";

const meinSchema = $.schema(
	// queries
	{
		zaehler: $.int,
	},
	// mutationen
	{
		zaehlerSetzen: $.resolver({ zahl: $.int.required() }, $.boolean),
	}
);

const meineResolver: $.Infer<typeof meinSchema> = {
	// ...
};

// type Query {
//   zaehler: Int,
// }
//
// type Mutation {
// ...
const graphQLCode = meinSchema.toGraphQL();
```

## API

### `$.schema(): Schema`

Definiert ein GraphQL-Schema.

Parameter:

- `queries` – felder für `type Query` im GraphQL-Schema.
- `mutations` – felder für `type Mutation` im GraphQL-Schema

### `$.{datentyp}: SchemaType`

Eingebaute datentypen:

- `int` (GraphQL: `Int`) – Ganzahl
- `float` (GraphQL: `Float`) – Dezimalzahl
- `boolean` (GraphQL: `Boolean`) – Boole'scher wert
- `string` (GraphQL: `String`) – Zeichenkette
- `id` (GraphQL: `ID`) – Nicht für Menschen lesbare Zeichenkette

### `SchemaType#required(): SchemaType`

Erforderliche (nicht-`null`bare) version eines Datentypen. Diese Methode ist bei _allen_ Datentypen, inklusive denen, die bspw. mit `$.array` oder `$.type` definiert wurden.

Beispiel:

```ts
$.string.required(); // GraphQL: String!
```

### `$.array()`

Eine liste.

Parameter:

- `type` – Datentyp der elemente in der Liste

Rückgabe: Ein Datentyp für eine liste des übergebenen Datentypen `type`

Beispiel:

```ts
// GraphQL: `[String]`
$.array($.string);

// GraphQL: `[[String]]`
$.array($.array($.string));
```

### `$.type(): SchemaType`

Definiert einen neuen `type` im GraphQL-Schema. In Typescript ist es der Äquivalent eines `interface`s.

Parameter:

- `name` – Name des typen im GraphQL-Schema
- `shape` – Felder des Datentypen (siehe Beispiele)

Rückgabe: Ein neuer Datentyp im Schema

Beispiele:

```ts
// GraphQL:
// type Book {
//   name: String,
//   author: String,
//   year: Int
// }
const book = $.type("Book", {
	name: $.string,
	author: $.string,
	year: $.int,
});
```

#### Dokumentationskommentar pro Datentyp

Um über der definition des Datentypen einen Dokumentationskommentar anzuzeigen, verwenden Sie `.typeDocstring()`. Diese Methode verhält sich ansonsten genau wie [`.docstring()`](#schematypedocstring).

#### Erweitern

Typen die mit `$.type` generiert wurden können mit `.extend()` erweitert werden.

Parameter:

- `name` – Name des neuen typen im GraphQL-Schema
- `shape` – Zusätzliche / Überschriebene Felder des neuen Datentypen

Rückgabe: Ein erweiterter datentyp

Beispiel:

```ts
// GraphQL:
// type BookWithVolumes {
//   name: String,
//   author: String,
//   year: Int,
//   volumes: Int,
// }
const bookWithVolumes = book.extend("BookWithVolumes", { volumes: $.int });
```

> **Wichtig:** Datentypen nie zweimal definieren! Wenn die Definition `"B"` mehrmals im Code vorkommt, kommt sie auch mehrmals im Schema vor:
>
> ```ts
> // FALSCH:
> $.type("A", {
> 	b1: $.type("B", { b: $.string }),
> 	b2: $.type("B", { b: $.string }),
> });
> ```
>
> Speichern sie Datentypen stattdessen in einer variable:
>
> ```ts
> // RICHTIG:
> const B = $.type("B", { b: $.string });
>
> $.type("A", { b1: B, b2: B });
> ```

### `$.resolver(): SchemaType`

Diese Methode definiert einen Resolver der bestimmte Argumente annimt.

Parameter:

- `args` – Angenommene argumente in der Form `{ arg1: datentyp1, arg2: datentyp2 }`
- `returns` – Rückgabedatentyp des resolvers

Beispiel:

```ts
// GraphQL:
// type A {
//   abc(xyz: String): Boolean
// }
$.type("A", {
	abc: $.resolver({ xyz: $.string }, $.boolean),
});
```

### `SchemaType#docstring()`

Definiert ein Dokumentationskommentar auf ein feld. Diese methode ist bei *allen* datentypen verfübar.

Parameter:

- `doc` – Dokumentationskomentar

```ts
$.schema({
	test: $.string.docstring("test test");
}, {});

// type Query {
//   """
//   test test
//   """
//   test: String
// }
$.toGraphQL();
```

## Datentypsicherheit

Um korrekte TypeScript-Datentypen für das Schema zur verfügung zu stellen, exportiert `@schuelerconnect/schema` den Datentypen `Infer<T>`:

```ts
const meinSchema = $.schema(/* ... */);

type schemaDatentypen = $.Infer<typeof meinSchema>;

const meineResolver: schemaDatentypen = {
	// ...
};
```

## Bekannte Mängel

- `union`s werden nicht unterstützt
- `enum`s werden nicht unterstützt
- Eigene scalar-datentypen werden nicht unterstützt

<div align="center">
<img alt="" src="assets/footer.png"/>
<p>Copyright © 2022-present <a href="https://github.com/codemaster138/">@codemaster138</a> & <a href="https://github.com/cubeforme/">@cubeforme</a></p>
<img alt="NPM" src="https://img.shields.io/npm/l/scadm?color=orange&style=for-the-badge">
</div>
