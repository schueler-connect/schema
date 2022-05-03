import { expectType } from "tsd";

import * as $ from ".";

describe('SchemaType', () => {
	test('Cannot be cloned', () => {
		expect(() => new $.SchemaType().clone()).toThrow("not implemented");
	});

	test('Cannot be rendered', () => {
		expect(() => new $.SchemaType()._render()).toThrow("not implemented");
		expect(() => new $.SchemaType()._body()).toThrow("not implemented");
	});
})

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
        | undefined
        | ((...args: any) => number | undefined | Promise<number | undefined>);
      afloat:
        | number
        | undefined
        | ((...args: any) => number | undefined | Promise<number | undefined>);
      abool:
        | boolean
        | undefined
        | ((
            ...args: any
          ) => boolean | undefined | Promise<boolean | undefined>);
      astring:
        | string
        | undefined
        | ((...args: any) => string | undefined | Promise<string | undefined>);
      anid:
        | string
        | undefined
        | ((...args: any) => string | undefined | Promise<string | undefined>);
    }>({} as $.Infer<typeof t>);

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
    }>({} as $.Infer<typeof t>);

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
    };
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
        | undefined
        | ((
            ...args: any
          ) => expectT | undefined | Promise<expectT | undefined>);
      x:
        | number
        | undefined
        | ((...args: any) => number | undefined | Promise<number | undefined>);
    }>({} as $.Infer<typeof p>);

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
    };
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
        | undefined
        | ((
            ...args: any
          ) => expectT | undefined | Promise<expectT | undefined>);
      x:
        | number
        | undefined
        | ((...args: any) => number | undefined | Promise<number | undefined>);
    };
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
        | undefined
        | ((
            ...args: any
          ) => expectP | undefined | Promise<expectP | undefined>);
      x:
        | number
        | undefined
        | ((...args: any) => number | undefined | Promise<number | undefined>);
    }>({} as $.Infer<typeof g>);

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
    };
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
        | undefined
        | ((...args: any) => string | undefined | Promise<string | undefined>);
    }>({} as $.Infer<typeof e>);

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
});

describe("$.array", () => {
  test("Primitive array", () => {
    const a = $.array($.string);

    expectType<
      | (string | undefined)[]
      | undefined
      | ((
          ...args: any
        ) =>
          | (string | undefined)[]
          | undefined
          | Promise<(string | undefined)[] | undefined>)
    >([] as $.Infer<typeof a>);

    const w = $.type("Wrapper", {
      v: a.required(),
    });

    expectType<{
      v:
        | (string | undefined)[]
        | ((
            ...args: any
          ) => (string | undefined)[] | Promise<(string | undefined)[]>);
    }>({} as $.Infer<typeof w>);

    expect(w.toGraphQL()).toBe(
      "" + "type Wrapper {\n" + "  v: [String]!\n" + "}\n"
    );
  });

  test("Optional type array", () => {
    const a = $.array($.type("X", { x: $.int.required() }));

    expectType<
      | ({ x: number } | undefined)[]
      | undefined
      | ((
          ...args: any
        ) =>
          | ({ x: number } | undefined)[]
          | undefined
          | Promise<({ x: number } | undefined)[] | undefined>)
    >([] as $.Infer<typeof a>);

    const w = $.type("Wrapper", {
      v: a,
    });

    expectType<{
      v:
        | ({ x: number } | undefined)[]
        | undefined
        | ((
            ...args: any
          ) =>
            | ({ x: number } | undefined)[]
            | undefined
            | Promise<({ x: number } | undefined)[] | undefined>);
    }>({} as $.Infer<typeof w>);

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
      | ({ x: number } | undefined)[]
      | undefined
      | ((
          ...args: any
        ) =>
          | ({ x: number } | undefined)[]
          | undefined
          | Promise<({ x: number } | undefined)[] | undefined>)
    >([] as $.Infer<typeof a>);

    const w = $.type("Wrapper", {
      v: a.required(),
    });

    expectType<{
      v:
        | ({ x: number } | undefined)[]
        | ((
            ...args: any
          ) =>
            | ({ x: number } | undefined)[]
            | Promise<({ x: number } | undefined)[]>);
    }>({} as $.Infer<typeof w>);

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
        | undefined
        | ((...args: any) => number | undefined | Promise<number | undefined>);
    };
    expectType<expectI>({} as $.Infer<typeof i>);

    const r = $.resolver({ anumber: $.int, astring: $.string, i: i }, i);

    const w = $.type("Wrapper", {
      v: r,
    });

    expectType<{
      v: (
        parent: any,
        args: {
          anumber: number | undefined;
          astring: string | undefined;
          i: { a: number; b: number | undefined };
        },
        ctx: any,
        info: any
      ) =>
        | expectI
        | undefined
        | ((...args: any) => expectI | undefined | Promise<expectI | undefined>)
        | Promise<
            | expectI
            | undefined
            | ((
                ...args: any
              ) => expectI | undefined | Promise<expectI | undefined>)
          >;
    }>({} as $.Infer<typeof w>);

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
});
