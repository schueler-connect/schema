import { expectType } from "tsd";

import * as $ from ".";

describe("SchemaType", () => {
  test("Cannot be cloned", () => {
    expect(() => new $.SchemaType().clone()).toThrow("not implemented");
  });

  test("Cannot be rendered", () => {
    expect(() => new $.SchemaType()._render()).toThrow("not implemented");
    expect(() => new $.SchemaType()._body()).toThrow("not implemented");
  });
});

describe("$.{type}", () => {
  test("Cannot be doubly required", () => {
    expect(() => $.int.required().required()).toThrow("Already non-nullable");
  });

  test("Clones correctly", () => {
    expect($.int.clone()).toStrictEqual($.int);
  });

  test("Can be documented", () => {
    const w = $.type("Wrapper", {
      a: $.int.docstring("A comment"),
      b: $.int,
    });

    expect(w.toGraphQL()).toBe(
      "" +
        "type Wrapper {\n" +
        '  """\n' +
        "  A comment\n" +
        '  """\n' +
        "  a: Int,\n" +
        "  b: Int\n" +
        "}\n"
    );
  });

  // test("Non-required value", () => {
  //   const t = $.string;
  //   expectType<
  //     | string
  //     | undefined
  //     | (() => string | undefined | Promise<string | undefined>)
  //   >("" as $.Infer<typeof t>);

	// 	let _: $.Infer<typeof t> = undefined;
  // });
});

describe("$.type", () => {
  test("Flat partial type", () => {
    const t = $.type("Test", {
      aninteger: $.int,
      afloat: $.float,
      abool: $.bool,
      astring: $.string,
      anid: $.id,
    });

    expectType<{
      aninteger:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
      afloat:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
      abool:
        | boolean
        | undefined | null
        | ((
            ...args: any
          ) => boolean | undefined | null | Promise<boolean | undefined | null>);
      astring:
        | string
        | undefined | null
        | ((...args: any) => string | undefined | null | Promise<string | undefined | null>);
      anid:
        | string
        | undefined | null
        | ((...args: any) => string | undefined | null | Promise<string | undefined | null>);
    } | undefined | null>({} as $.Infer<typeof t>);

    expect(t.toGraphQL()).toBe(
      "" +
        "type Test {\n" +
        "  aninteger: Int,\n" +
        "  afloat: Float,\n" +
        "  abool: Boolean,\n" +
        "  astring: String,\n" +
        "  anid: ID\n" +
        "}\n"
    );
  });

  test("Flat type with required properties", () => {
    const t = $.type("Test", {
      aninteger: $.int.required(),
      afloat: $.float.required(),
      abool: $.bool.required(),
      astring: $.string.required(),
      anid: $.id.required(),
    });

    expectType<{
      aninteger: number | ((...args: any) => number | Promise<number>);
      afloat: number | ((...args: any) => number | Promise<number>);
      abool: boolean | ((...args: any) => boolean | Promise<boolean>);
      astring: string | ((...args: any) => string | Promise<string>);
      anid: string | ((...args: any) => string | Promise<string>);
    } | undefined | null>({} as $.Infer<typeof t>);

    expect(t.toGraphQL()).toBe(
      "" +
        "type Test {\n" +
        "  aninteger: Int!,\n" +
        "  afloat: Float!,\n" +
        "  abool: Boolean!,\n" +
        "  astring: String!,\n" +
        "  anid: ID!\n" +
        "}\n"
    );
  });

  test("Singly nested type", () => {
    const t = $.type("Test", {
      aninteger: $.int.required(),
      afloat: $.float.required(),
      abool: $.bool.required(),
      astring: $.string.required(),
      anid: $.id.required(),
    });

    type expectT = {
      aninteger: number | ((...args: any) => number | Promise<number>);
      afloat: number | ((...args: any) => number | Promise<number>);
      abool: boolean | ((...args: any) => boolean | Promise<boolean>);
      astring: string | ((...args: any) => string | Promise<string>);
      anid: string | ((...args: any) => string | Promise<string>);
    } | undefined | null;
    expectType<expectT>({} as $.Infer<typeof t>);

    const p = $.type("Parent", {
      reqchild: t.required(),
      child: t,
      x: $.int,
    });

    expectType<{
      reqchild: expectT | ((...args: any) => expectT | Promise<expectT>);
      child:
        | expectT
        | undefined | null
        | ((
            ...args: any
          ) => expectT | undefined | null | Promise<expectT | undefined | null>);
      x:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
    } | undefined | null>({} as $.Infer<typeof p>);

    expect(p.toGraphQL()).toBe(
      "" +
        "type Parent {\n" +
        "  reqchild: Test!,\n" +
        "  child: Test,\n" +
        "  x: Int\n" +
        "}\n" +
        "\n" +
        "type Test {\n" +
        "  aninteger: Int!,\n" +
        "  afloat: Float!,\n" +
        "  abool: Boolean!,\n" +
        "  astring: String!,\n" +
        "  anid: ID!\n" +
        "}\n"
    );
  });

  test("Deeply nested type", () => {
    const t = $.type("Child", {
      aninteger: $.int.required(),
      afloat: $.float.required(),
      abool: $.bool.required(),
      astring: $.string.required(),
      anid: $.id.required(),
    });

    type expectT = {
      aninteger: number | ((...args: any) => number | Promise<number>);
      afloat: number | ((...args: any) => number | Promise<number>);
      abool: boolean | ((...args: any) => boolean | Promise<boolean>);
      astring: string | ((...args: any) => string | Promise<string>);
      anid: string | ((...args: any) => string | Promise<string>);
    } | undefined | null;
    expectType<expectT>({} as $.Infer<typeof t>);

    const p = $.type("Parent", {
      reqchild: t.required(),
      child: t,
      x: $.int,
    });

    type expectP = {
      reqchild: expectT | ((...args: any) => expectT | Promise<expectT>);
      child:
        | expectT
        | undefined | null
        | ((
            ...args: any
          ) => expectT | undefined | null | Promise<expectT | undefined | null>);
      x:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
    } | undefined | null;
    expectType<expectP>({} as $.Infer<typeof p>);

    const g = $.type("Grandparent", {
      reqchild: p.required(),
      child: p,
      x: $.int,
    });
    expectType<{
      reqchild: expectP | ((...args: any) => expectP | Promise<expectP>);
      child:
        | expectP
        | undefined | null
        | ((
            ...args: any
          ) => expectP | undefined | null | Promise<expectP | undefined | null>);
      x:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
    } | undefined | null>({} as $.Infer<typeof g>);

    expect(g.toGraphQL()).toBe(
      "" +
        "type Grandparent {\n" +
        "  reqchild: Parent!,\n" +
        "  child: Parent,\n" +
        "  x: Int\n" +
        "}\n" +
        "\n" +
        "type Parent {\n" +
        "  reqchild: Child!,\n" +
        "  child: Child,\n" +
        "  x: Int\n" +
        "}\n" +
        "\n" +
        "type Child {\n" +
        "  aninteger: Int!,\n" +
        "  afloat: Float!,\n" +
        "  abool: Boolean!,\n" +
        "  astring: String!,\n" +
        "  anid: ID!\n" +
        "}\n"
    );
  });

  test("Extended type", () => {
    const t = $.type("Test", {
      aninteger: $.int.required(),
      afloat: $.float.required(),
      abool: $.bool.required(),
      astring: $.string.required(),
      anid: $.id.required(),
    });

    type expectT = {
      aninteger: number | ((...args: any) => number | Promise<number>);
      afloat: number | ((...args: any) => number | Promise<number>);
      abool: boolean | ((...args: any) => boolean | Promise<boolean>);
      astring: string | ((...args: any) => string | Promise<string>);
      anid: string | ((...args: any) => string | Promise<string>);
    } | undefined | null;
    expectType<expectT>({} as $.Infer<typeof t>);

    const e = t.extend("Extended", {
      // Override
      astring: $.bool.required(),
      // Add field
      anotherid: $.id,
    });

    expectType<{
      aninteger: number | ((...args: any) => number | Promise<number>);
      afloat: number | ((...args: any) => number | Promise<number>);
      abool: boolean | ((...args: any) => boolean | Promise<boolean>);
      astring: boolean | ((...args: any) => boolean | Promise<boolean>);
      anid: string | ((...args: any) => string | Promise<string>);
      anotherid:
        | string
        | undefined | null
        | ((...args: any) => string | undefined | null | Promise<string | undefined | null>);
    } | undefined | null>({} as $.Infer<typeof e>);

    expect(e.toGraphQL()).toBe(
      "" +
        "type Extended {\n" +
        "  aninteger: Int!,\n" +
        "  afloat: Float!,\n" +
        "  abool: Boolean!,\n" +
        "  astring: Boolean!,\n" +
        "  anid: ID!,\n" +
        "  anotherid: ID\n" +
        "}\n"
    );
  });

  test("With doc comment", () => {
    const t = $.type("Test", { a: $.string });
    const w = $.type("Wrapper", { v: t.docstring("A comment") });

    expect(w.toGraphQL()).toBe(
      "" +
        "type Wrapper {\n" +
        '  """\n' +
        "  A comment\n" +
        '  """\n' +
        "  v: Test\n" +
        "}\n" +
        "\n" +
        "type Test {\n" +
        "  a: String\n" +
        "}\n"
    );
  });

  test("With type-level doc comment", () => {
    const t = $.type("Test", { a: $.string }).typeDocstring("A comment");
    const w = $.type("Wrapper", { v: t });

    expect(w.toGraphQL()).toBe(
      "" +
        "type Wrapper {\n" +
        "  v: Test\n" +
        "}\n" +
        "\n" +
        '"""\n' +
        "A comment\n" +
        '"""\n' +
        "type Test {\n" +
        "  a: String\n" +
        "}\n"
    );
  });
});

describe("$.array", () => {
  test("Primitive array", () => {
    const a = $.array($.string);

    expectType<
      | (string | undefined | null)[]
      | undefined | null
      | ((
          ...args: any
        ) =>
          | (string | undefined | null)[]
          | undefined | null
          | Promise<(string | undefined | null)[] | undefined | null>)
    >([] as $.Infer<typeof a>);

    const w = $.type("Wrapper", {
      v: a.required(),
    });

    expectType<{
      v:
        | (string | undefined | null)[]
        | ((
            ...args: any
          ) => (string | undefined | null)[] | Promise<(string | undefined | null)[]>);
    } | undefined | null>({} as $.Infer<typeof w>);

    expect(w.toGraphQL()).toBe(
      "" + "type Wrapper {\n" + "  v: [String]!\n" + "}\n"
    );
  });

  test("Optional type array", () => {
    const a = $.array($.type("X", { x: $.int.required() }));

    expectType<
      | ({ x: number } | undefined | null)[]
      | undefined | null
      | ((
          ...args: any
        ) =>
          | ({ x: number } | undefined | null)[]
          | undefined | null
          | Promise<({ x: number } | undefined | null)[] | undefined | null>)
    >([] as $.Infer<typeof a>);

    const w = $.type("Wrapper", {
      v: a,
    });

    expectType<{
      v:
        | ({ x: number } | undefined | null)[]
        | undefined | null
        | ((
            ...args: any
          ) =>
            | ({ x: number } | undefined | null)[]
            | undefined | null
            | Promise<({ x: number } | undefined | null)[] | undefined | null>);
    } | undefined | null>({} as $.Infer<typeof w>);

    expect(w.toGraphQL()).toBe(
      "" +
        "type Wrapper {\n" +
        "  v: [X]\n" +
        "}\n" +
        "\n" +
        "type X {\n" +
        "  x: Int!\n" +
        "}\n"
    );
  });

  test("Required type array", () => {
    const a = $.array($.type("X", { x: $.int.required() }));

    expectType<
      | ({ x: number } | undefined | null)[]
      | undefined | null
      | ((
          ...args: any
        ) =>
          | ({ x: number } | undefined | null)[]
          | undefined | null
          | Promise<({ x: number } | undefined | null)[] | undefined | null>)
    >([] as $.Infer<typeof a>);

    const w = $.type("Wrapper", {
      v: a.required(),
    });

    expectType<{
      v:
        | ({ x: number } | undefined | null)[]
        | ((
            ...args: any
          ) =>
            | ({ x: number } | undefined | null)[]
            | Promise<({ x: number } | undefined | null)[]>);
    } | undefined | null>({} as $.Infer<typeof w>);

    expect(w.toGraphQL()).toBe(
      "" +
        "type Wrapper {\n" +
        "  v: [X]!\n" +
        "}\n" +
        "\n" +
        "type X {\n" +
        "  x: Int!\n" +
        "}\n"
    );
  });

  test("With doc comment", () => {
    const a = $.array($.string);
    const w = $.type("Wrapper", { v: a.docstring("A comment") });

    expect(w.toGraphQL()).toBe(
      "" +
        "type Wrapper {\n" +
        '  """\n' +
        "  A comment\n" +
        '  """\n' +
        "  v: [String]\n" +
        "}\n"
    );
  });

  test("Cannot be doubly required", () => {
    expect(() => $.type("X", {}).required().required()).toThrow(
      "Already non-nullable"
    );
  });
});

describe("$.resolver", () => {
  test("Resolver", () => {
    const i = $.type("I", {
      a: $.int.required(),
      b: $.float,
    });

    type expectI = {
      a: number | ((...args: any) => number | Promise<number>);
      b:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
    } | undefined | null;
    expectType<expectI>({} as $.Infer<typeof i>);

    const r = $.resolver({ anumber: $.int, astring: $.string, i: i }, i);

    const w = $.type("Wrapper", {
      v: r,
    });

    expectType<{
      v: (
        parent: any,
        args: {
          anumber: number | undefined | null;
          astring: string | undefined | null;
          i: { a: number; b: number | undefined | null };
        },
        ctx: any,
        info: any
      ) =>
        | expectI
        | undefined | null
        | ((...args: any) => expectI | undefined | null | Promise<expectI | undefined | null>)
        | Promise<
            | expectI
            | undefined | null
            | ((
                ...args: any
              ) => expectI | undefined | null | Promise<expectI | undefined | null>)
          >;
    } | undefined | null>({} as $.Infer<typeof w>);

    expect(w.toGraphQL()).toBe(
      "" +
        "type Wrapper {\n" +
        "  v(anumber: Int, astring: String, i: I): I\n" +
        "}\n" +
        "\n" +
        "type I {\n" +
        "  a: Int!,\n" +
        "  b: Float\n" +
        "}\n"
    );
  });

  test("Required return value", () => {
    const i = $.type("I", {
      a: $.int.required(),
      b: $.float,
    });

    type expectI = {
      a: number | ((...args: any) => number | Promise<number>);
      b:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
    };

    const r = $.resolver({ astring: $.string }, i.required());

    const w = $.type("Wrapper", {
      v: r,
    });

    expectType<{
      v: (
        parent: any,
        args: { astring: string | undefined | null },
        ctx: any,
        info: any
      ) =>
        | expectI
        | ((...args: any) => expectI | Promise<expectI>)
        | Promise<expectI | ((...args: any) => expectI | Promise<expectI>)>;
    } | undefined | null>({} as $.Infer<typeof w>);

    expect(w.toGraphQL()).toBe(
      "" +
        "type Wrapper {\n" +
        "  v(astring: String): I!\n" +
        "}\n" +
        "\n" +
        "type I {\n" +
        "  a: Int!,\n" +
        "  b: Float\n" +
        "}\n"
    );
  });

  test("Required return value and docstring", () => {
    const i = $.type("I", {
      a: $.int.required(),
      b: $.float,
    });

    type expectI = {
      a: number | ((...args: any) => number | Promise<number>);
      b:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
    };

    const r = $.resolver({ astring: $.string }, i.required());

    const w = $.type("Wrapper", {
      v: r.docstring("test"),
    });

    expectType<{
      v: (
        parent: any,
        args: { astring: string | undefined | null },
        ctx: any,
        info: any
      ) =>
        | expectI
        | ((...args: any) => expectI | Promise<expectI>)
        | Promise<expectI | ((...args: any) => expectI | Promise<expectI>)>;
    } | undefined | null>({} as $.Infer<typeof w>);

    expect(w.toGraphQL()).toBe(
      "" +
        "type Wrapper {\n" +
        '  """\n' +
        "  test\n" +
        '  """\n' +
        "  v(astring: String): I!\n" +
        "}\n" +
        "\n" +
        "type I {\n" +
        "  a: Int!,\n" +
        "  b: Float\n" +
        "}\n"
    );
  });

  test("With doc comment", () => {
    const r = $.resolver({ a: $.string.required() }, $.int);
    const w = $.type("Wrapper", {
      v: r.docstring("A comment"),
    });

    expect(w.toGraphQL()).toBe(
      "" +
        "type Wrapper {\n" +
        '  """\n' +
        "  A comment\n" +
        '  """\n' +
        "  v(a: String!): Int\n" +
        "}\n"
    );
  });

  test("Without arguments", () => {
    const r = $.resolver({}, $.int);
    const w = $.type("Wrapper", {
      v: r,
    });

    expect(w.toGraphQL()).toBe("" + "type Wrapper {\n" + "  v: Int\n" + "}\n");
  });
});

describe("$.input", () => {
  test("Input type", () => {
    const i = $.input("Input", {
      aField: $.string,
      aNumber: $.int,
      aBoolean: $.bool.required(),
    });

    type expectI = {
      aField:
        | string
        | undefined | null
        | ((...args: any) => string | undefined | null | Promise<string | undefined | null>);
      aNumber:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
      aBoolean: boolean | ((...args: any) => boolean | Promise<boolean>);
    };

    expectType<expectI>({} as $.Infer<typeof i>);

    expect(i.toGraphQL()).toBe(
      "" +
        "input Input {\n" +
        "  aField: String,\n" +
        "  aNumber: Int,\n" +
        "  aBoolean: Boolean!\n" +
        "}\n"
    );
  });

  test("Required input type", () => {
    const i = $.input("Input", {
      aField: $.string,
      aNumber: $.int,
      aBoolean: $.bool.required(),
    }).required();

    type expectI = {
      aField:
        | string
        | undefined | null
        | ((...args: any) => string | undefined | null | Promise<string | undefined | null>);
      aNumber:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
      aBoolean: boolean | ((...args: any) => boolean | Promise<boolean>);
    };

    expectType<expectI>({} as $.Infer<typeof i>);

    expect(i.toGraphQL()).toBe(
      "" +
        "input Input {\n" +
        "  aField: String,\n" +
        "  aNumber: Int,\n" +
        "  aBoolean: Boolean!\n" +
        "}\n"
    );
  });
});

describe("Schema", () => {
  test("Simple schema", () => {
    const s = $.schema(
      {
        counter: $.int.required(),
        stats: $.type("Stats", {
          mostRecentChange: $.int.docstring(
            "Milliseconds since epoch at last change or null if no change has been made yet"
          ),
        })
          .required()
          .typeDocstring("Statistics about the application"),
      },
      {
        setCounter: $.resolver({ n: $.int.required() }, $.bool).docstring(
          "Update the counter"
        ),
      }
    );

    type expectS = {
      mostRecentChange:
        | number
        | undefined | null
        | ((...args: any) => number | undefined | null | Promise<number | undefined | null>);
    };

    expectType<{
      Query: {
        counter: number | ((...args: any) => number | Promise<number>);
        stats: expectS | ((...args: any) => expectS | Promise<expectS>);
      };
      Mutation: {
        setCounter: (
          parent: any,
          args: { n: number },
          ctx: any,
          info: any
        ) =>
          | boolean
          | undefined | null
          | ((
              ...args: any
            ) => boolean | undefined | null | Promise<boolean | undefined | null>)
          | Promise<
              | boolean
              | undefined | null
              | ((
                  ...args: any
                ) => boolean | undefined | null | Promise<boolean | undefined | null>)
            >;
      };
    }>({} as $.Infer<typeof s>);

    expect(s.toGraphQL()).toBe(
      "" +
        "type Query {\n" +
        "  counter: Int!,\n" +
        "  stats: Stats!\n" +
        "}\n" +
        "\n" +
        '"""\n' +
        "Statistics about the application\n" +
        '"""\n' +
        "type Stats {\n" +
        '  """\n' +
        "  Milliseconds since epoch at last change or null if no change has been made yet\n" +
        '  """\n' +
        "  mostRecentChange: Int\n" +
        "}\n" +
        "\n" +
        "type Mutation {\n" +
        '  """\n' +
        "  Update the counter\n" +
        '  """\n' +
        "  setCounter(n: Int!): Boolean\n" +
        "}\n"
    );
  });

  test("Cloneable", () => {
    const s = $.schema(
      {
        counter: $.int.required(),
        stats: $.type("Stats", {
          mostRecentChange: $.int.docstring(
            "Milliseconds since epoch at last change or null if no change has been made yet"
          ),
        })
          .required()
          .typeDocstring("Statistics about the application"),
      },
      {
        setCounter: $.resolver({ n: $.int.required() }, $.bool).docstring(
          "Update the counter"
        ),
      }
    );

    expect(s.clone()).toStrictEqual(s);
  });
});
