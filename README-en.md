<div align="center">
<h3>@schuelerconnect/schema</h1>
<p>
<img alt="npm" src="https://img.shields.io/npm/v/@schuelerconnect/schema?color=red&style=for-the-badge">
<img alt="NPM" src="https://img.shields.io/npm/l/@schuelerconnect/schema?color=orange&style=for-the-badge">
<img alt="npm" src="https://img.shields.io/npm/dt/@schuelerconnect/schema?color=yellow&style=for-the-badge">
<img alt="GitHub issues" src="https://img.shields.io/github/issues/schueler-connect/schema?color=green&style=for-the-badge">
<img alt="test coverage" src="./coverage.svg">
</p>
<p>Built with ❤️ by <a href="https://github.com/codemaster138">@codemaster138</a></p>
<img alt="" src="assets/cover.png"/>
</div>

🌎  [Deutsch](README.md) | English

`@schuelerconnect/schema` is a lightweight (~4kb) package that allows yout to easily define type-safe GraphQL schemas:

```ts
import * as $ from "@schuelerconnect/schema";

const mySchema = $.schema(
  // queries
  {
    counter: $.int
  },
  // mutations
  {
    setCounter: $.resolver({ value: $.int.required() }, $.boolean),
  }
);

const myResolvers: $.Infer<typeof mySchema> = {
  // ...
};

// type Query {
//   counter: Int,
// }
//
// type Mutation {
// ...
const graphQLSchema = mySchema.toGraphQL();
```

## API

### `$.schema(): Schema`

Defines a GraphQL schema

Parameters:
- `queries` – fields of the `Query` type in the resulting schema
- `muattions` – fields of the `Mutation` type in the resulting schema

### `$.{type}: SchemaType`

Built-in datatypes:

- `int` (GraphQL: `Int`) – Integer
- `float` (GraphQL: `Float`) – Float-ing point number
- `boolean` (GraphQL: `Boolean`) – Boolean value
- `string` (GraphQL: `String`) – String
- `id` (GraphQL: `ID`) – Not human-readable string

### `SchemaType#required(): SchemaType`

Creates a required (non-nullable) version of the Datatype it is called on.

Example:

```ts
$.string.required() // GraphQL: String!
```

### `$.array(): SchemaType`

Types an array of a given type

Parameters:
- `type` – Type of elements in the array

Returns: A type representing an array of a given type

Example:

```ts
// GraphQL: `[String]`
$.array($.string);

// GraphQL: `[[String]]`
$.array($.array(string));
```

### `$.type(): SchemaType`

Defines a new `type` in the GraphQL schema. In typescript, this is the equivalent of an `interface`.

Parameters:

- `name` – Name of the type in the schema
- `shape` – Fields of the type (s. Examples)

Returns: A new datatype in the schema;

Examples:

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

#### Doc comment for type definition

To provide a documentation comment above the definition of the type in the schema, use `.typeDocstring()`. Except for the location in the schema where it generates a comment, it acts the same as [`.docstring()`](#schematypedocstring).

#### Inheritance

Types generated with `$.type` can be extended with `.extend()`.

Parameters:

- `name` – Name of the extended type
- `shape` – Additional/Overriden properties

Returns: An overriden type

Example:

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

> **Important:** Do not define the same type twice – this way, it would also appear twice in the resulting schema:
>
> ```ts
> // WRONG:
> $.type("A", {
> 	b1: $.type("B", { b: $.string }),
> 	b2: $.type("B", { b: $.string }),
> });
> ```
>
> Instead, save it in a variable:
>
> ```ts
> // CORRECT:type("B", { b: $.string });
>
> $.type("A", { b1: B, b2: B });
> ```

### `$.resolver(): SchemaType`

Defines that a resolver method requires paramters.

Parameters:
- `args` – The arguments expected to be passed to the resolver
- `returns` – The resolver's return type

Example:

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

Defines a Documentation string for a field.

Parameters:

- `doc` – Documentation string

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

## Type safety

To get typings for your resolvers, you can use `$.Infer<T>`:

```ts
const mySchema = $.schema(/* ... */);

type schemaTypings = $.Infer<typeof mySchema>;

const myResolvers: schemaTypings = {
  // ...
};
```

## Known shortcomings

- `union`s are currently not supported
- `enum`s are currently not supported
- Custom scalars are not supported

<div align="center">
<img alt="" src="assets/footer.png"/>
<p>Copyright © 2022-present <a href="https://github.com/codemaster138/">@codemaster138</a> & <a href="https://github.com/cubeforme/">@cubeforme</a></p>
<img alt="NPM" src="https://img.shields.io/npm/l/@schuelerconnect/schema?color=orange&style=for-the-badge">
</div>
