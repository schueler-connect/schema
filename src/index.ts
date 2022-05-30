export type Infer<S> = S extends SchemaType<infer X>
  ? X
  : never;

type TypeOfShape<S extends SchemaType | Shape> = S extends SchemaType<infer X>
  ? X
  : S extends Shape
  ? { [K in keyof S]: TypeOfShape<S[K]> }
  : never;

interface Shape {
  [key: string]: SchemaType | Shape;
}

class SharedBoolean {
  constructor(public inner: boolean) {}
}

export class SchemaType<T = unknown> {
  // Required for type inference
  public p?: T;
  public _docstring?: string;

  constructor() {}

  clone(): SchemaType<T> {
    throw "not implemented";
  }

  /**
   * @hidden
   */
  _render(): string {
    throw "not implemented";
  }

  /**
   * @hidden
   */
  _body(): string {
    throw "not implemented";
  }

  /**
   * @hidden
   */
  _params(): string {
    return "";
  }

  /**
   * @hidden
   */
  _reset() {}

  docstring(str: string) {
    const t = this.clone();
    t._docstring = str;
    return t;
  }
}

class TrivialSchemaType<T> extends SchemaType<T> {
  // To avoid duck-typing when deciding whether a type
  // can be used inside an input type
  public worksInInput = true;

  constructor(protected gql: string, private __body?: () => string) {
    super();
  }

  clone() {
    return new TrivialSchemaType<T>(this.gql);
  }

  _render() {
    return this.gql;
  }

  _body() {
    return this.__body?.() || "";
  }

  /**
   * Define type to be non-nullable
   */
  required(): TrivialSchemaType<
    TrivialResolver<Exclude<Resolved<T>, undefined>>
  > {
    if (this.gql.endsWith("!")) throw "Already non-nullable";
    return new TrivialSchemaType<
      TrivialResolver<Exclude<Resolved<T>, undefined>>
    >(this.gql + "!", this.__body);
  }

  docstring(str: string) {
    const t = this.clone();
    t._docstring = str;
    return t;
  }
}

const indent = (s: string) =>
  s
    .split("\n")
    .map((l) => "  " + l)
    .join("\n");

type TrivialResolver<T = unknown> = T | ((...args: any) => T | Promise<T>);

interface Arguments {
  [key: string]: TrivialResolver | Arguments;
}
type Resolved<T> = T extends Arguments
  ? { [K in keyof T]: Resolved<T[K]> }
  : T extends TrivialResolver<infer T>
  ? T
  : never;

export const boolean = new TrivialSchemaType<
  TrivialResolver<boolean | undefined>
>("Boolean");
export const int = new TrivialSchemaType<TrivialResolver<number | undefined>>(
  "Int"
);
export const float = new TrivialSchemaType<TrivialResolver<number | undefined>>(
  "Float"
);
export const string = new TrivialSchemaType<
  TrivialResolver<string | undefined>
>("String");
export const id = new TrivialSchemaType<TrivialResolver<string | undefined>>(
  "ID"
);

type t = Infer<typeof string>;

/**
 * @deprecated use `$.boolean` instead
 */
export const bool = boolean;
// TODO: export const customScalar = () => {};

class ArraySchemaType<T> extends TrivialSchemaType<
  TrivialResolver<Resolved<T>[] | undefined>
> {
  // To avoid duck-typing when deciding whether a type
  // can be used inside an input type
  public worksInInput = true;

  constructor(gql: string, public inner: SchemaType<T>) {
    super(gql, () => inner._body());
  }

  clone() {
    return new ArraySchemaType<T>(this.gql, this.inner);
  }

  _reset() {
    this.inner._reset();
  }
}

export const array = <T>(t: SchemaType<T>) =>
  new ArraySchemaType<T>(`[${t._render()}]`, t);

type Common<A, B> = {
  [P in keyof A & keyof B]: A[P] | B[P];
};

type Merge<A, B> = Omit<A, keyof Common<A, B>> & B;

class InterfaceSchemaType<T = object | undefined> extends SchemaType<T> {
  protected _gdocstring: string = "";

  constructor(
    protected readonly name: string,
    public shape: T,
    public written: SharedBoolean
  ) {
    super();
  }

  clone() {
    return new InterfaceSchemaType<T>(this.name, this.shape, this.written);
  }

  _render() {
    return this.name;
  }

  _body() {
    if (this.written.inner) return "";
    this.written.inner = true;
    return `${
      this._gdocstring ? `"""\n${this._gdocstring}\n"""\n` : ""
    }type ${this.name.replace("!", "")} {\n${indent(
      Object.entries(this.shape)
        .map(
          ([k, v]) =>
            `${
              v._docstring ? `"""\n${v._docstring}\n"""\n` : ""
            }${k}${v._params()}: ${v._render()}`
        )
        .join(",\n")
    )}\n}\n\n${Object.values(this.shape)
      .map((v: SchemaType) => v._body())
      .join("\n")}`;
  }

  _reset() {
    this.written.inner = false;
    Object.values(this.shape).forEach((v: SchemaType) => v._reset());
  }

  /**
   * Create a new type extending this one
   */
  extend<S extends Shape = Shape>(
    name: string,
    shape: S
  ): InterfaceSchemaType<
    Merge<Exclude<T, undefined>, TypeOfShape<S>> | undefined
  > {
    return new InterfaceSchemaType(
      name,
      {
        ...this.shape,
        ...shape,
      },
      new SharedBoolean(false)
    ) as InterfaceSchemaType<any>;
  }

  toGraphQL() {
    this._reset();
    return (
      this._body()
        // Fix newlines
        .split("\n")
        .filter((x) => !!x)
        .join("\n")
        .replace(/}\n/g, "}\n\n") + "\n"
    );
  }

  required(): InterfaceSchemaType<Exclude<T, undefined>> {
    if (this.name.endsWith("!")) throw "Already non-nullable";
    return new InterfaceSchemaType(
      this.name + "!",
      this.shape,
      this.written
    ) as any;
  }

  typeDocstring(str: string) {
    const t = this.clone();
    t._gdocstring = str;
    return t;
  }
}

export const type = <S extends Shape = Shape>(
  name: string,
  shape: S
): InterfaceSchemaType<TypeOfShape<S> | undefined> =>
  new InterfaceSchemaType(
    name,
    shape,
    new SharedBoolean(false)
  ) as InterfaceSchemaType<any>;

class ResolverSchemaType<
  R extends SchemaType,
  F extends (...args: any) => TypeOfShape<R> | Promise<TypeOfShape<R>>
> extends SchemaType<F> {
  constructor(private args: Parameters<F>[0], private returns: R) {
    super();
  }

  clone() {
    return new ResolverSchemaType<R, F>(this.args, this.returns);
  }

  _body() {
    return Object.values(this.args)
      .concat(this.returns)
      .map((v: any) => v._body())
      .join("\n");
  }

  _render(): string {
    return this.returns._render();
  }

  _params(): string {
    return Object.entries(this.args).length
      ? `(${Object.entries(this.args)
          .map(([k, v]) => `${k}: ${(v as SchemaType)._render()}`)
          .join(", ")})`
      : "";
  }

  _reset() {
    Object.values(this.args).forEach((v: any) => v._reset());
  }
}

export const resolver = <
  A extends Shape = Shape,
  R extends SchemaType = SchemaType
>(
  args: A,
  returns: R
): ResolverSchemaType<
  R,
  (
    parent: any,
    args: Resolved<TypeOfShape<A>>,
    context: any,
    info: any
  ) => TypeOfShape<R> | Promise<TypeOfShape<R>>
> => new ResolverSchemaType(args, returns) as ResolverSchemaType<any, any>;

type InputSchemaField =
  | TrivialSchemaType<any>
  | ReturnType<typeof array>
  | InputSchemaType;

interface InputShape {
  [key: string]: InputSchemaField;
}

class InputSchemaType<T = object | undefined> extends InterfaceSchemaType<T> {
  constructor(name: string, shape: T, written: SharedBoolean) {
    super(name, shape, written);
  }

  _body(): string {
    if (this.written.inner) return "";
    this.written.inner = true;
    return `${
      this._gdocstring ? `"""\n${this._gdocstring}\n"""\n` : ""
    }input ${this.name.replace("!", "")} {\n${indent(
      Object.entries(this.shape)
        .map(
          ([k, v]) =>
            `${
              v._docstring ? `"""\n${v._docstring}\n"""\n` : ""
            }${k}${v._params()}: ${v._render()}`
        )
        .join(",\n")
    )}\n}\n\n${Object.values(this.shape)
      .map((v: SchemaType) => v._body())
      .join("\n")}`;
  }

  required(): InputSchemaType<Exclude<T, undefined>> {
    if (this.name.endsWith("!")) throw "Already non-nullable";
    return new InputSchemaType(
      this.name + "!",
      this.shape,
      this.written
    ) as any;
  }
}

export const input = <S extends InputShape = InputShape>(
  name: string,
  shape: S
): InputSchemaType<TypeOfShape<S>> =>
  new InputSchemaType(
    name,
    shape,
    new SharedBoolean(false)
  ) as InterfaceSchemaType<any>;

class Schema<
  Q extends object = object,
  M extends object = object
> extends InterfaceSchemaType<{ Query: Q; Mutation: M }> {
  constructor(
    private queries: InterfaceSchemaType<Q>,
    private mutations: InterfaceSchemaType<M>
  ) {
    super(
      "Schema",
      { Query: queries.shape, Mutation: mutations.shape },
      new SharedBoolean(false)
    );
  }

  clone() {
    return new Schema<Q, M>(this.queries, this.mutations);
  }

  toGraphQL(): string {
    this.queries._reset();
    this.mutations._reset();
    return (
      `${this.queries.toGraphQL()}\n\n${this.mutations.toGraphQL()}`
        // Fix newlines
        .split("\n")
        .filter((x) => !!x)
        .join("\n")
        .replace(/}\n/g, "}\n\n") + "\n"
    );
  }
}

export const schema = <Q extends Shape = Shape, M extends Shape = Shape>(
  queries: Q,
  mutations: M
) =>
  new Schema<TypeOfShape<Q>, TypeOfShape<M>>(
    type("Query", queries).required(),
    type("Mutation", mutations).required()
  );
