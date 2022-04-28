export type Infer<S> = S extends SchemaType<infer X>
	? X & { [key: string]: any }
	: never;

type TypeOfShape<S extends SchemaType | Shape> = S extends SchemaType<infer X>
	? X
	: S extends Shape
	? { [K in keyof S]: TypeOfShape<S[K]> }
	: never;

interface Shape {
	[key: string]: SchemaType | Shape;
}

class SchemaType<T = unknown> {
	// Required for type inference
	public p?: T;
	public _docstring?: string;

	constructor() {}

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
		this._docstring = str;
		return this;
	}
}

class TrivialSchemaType<T> extends SchemaType<T> {
	constructor(private gql: string) {
		super();
	}

	_render() {
		return this.gql;
	}

	_body() {
		return "";
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
		>(this.gql + "!");
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

export const bool = new TrivialSchemaType<TrivialResolver<boolean | undefined>>(
	"Boolean"
);
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
// TODO: export const customScalar = () => {};

class ArraySchemaType<T> extends TrivialSchemaType<
	TrivialResolver<Resolved<T>[]>
> {
	constructor(gql: string, public inner: SchemaType<T>) {
		super(gql);
	}

	_body(): string {
		// TODO: Implement
		return this.inner._body();
	}

	_reset() {
		this.inner._reset();
	}
}

export const array = <T>(t: SchemaType<T>) =>
	new ArraySchemaType<T>(`[${t._render()}]`, t);

class InterfaceSchemaType<T extends object = object> extends SchemaType<T> {
	written: boolean = false;

	constructor(private name: string, public shape: T) {
		super();
	}

	_render() {
		return this.name;
	}

	_body() {
		if (this.written) return "";
		this.written = true;
		return `${this._docstring ? `"""\n${this._docstring}\n"""\n` : ""}type ${
			this.name.replace("!", "")
		} {\n${indent(
			Object.entries(this.shape)
				.map(
					([k, v]) =>
						`${
							v._docstring ? `"""\n${v._docstring}\n"""\n` : ""
						}${k}${v._params()}: ${v._render()}`
				)
				.join(",\n")
		)}\n}\n`;
	}

	_reset() {
		this.written = false;
		Object.values(this.shape).forEach((v: SchemaType) => v._reset());
	}

	/**
	 * Create a new type extending this one
	 */
	extend<S extends Shape = Shape>(name: string, shape: S): InterfaceSchemaType<T & TypeOfShape<S>> {
		return new InterfaceSchemaType(name, {...this.shape, ...shape}) as InterfaceSchemaType<any>;
	}

	/**
	 * @hidden
	 */
	renderSchema() {
		return (
			this._body() +
			"\n\n" +
			Object.values(this.shape)
				.map((v: SchemaType) => v._body())
				.join("\n")
		);
	}

	toGraphQL() {
		this._reset();
		return (
			this.renderSchema()
				// Fix newlines
				.split("\n")
				.filter((x) => !!x)
				.join("\n")
				.replace(/}\n/g, "}\n\n") + "\n"
		);
	}

	required(): InterfaceSchemaType<
		TrivialResolver<Exclude<Resolved<T>, undefined>>
	> {
		if (this.name.endsWith("!")) throw "Already non-nullable";
		return new InterfaceSchemaType(this.name + "!", this.shape) as any;
	}
}

export const type = <S extends Shape = Shape>(
	name: string,
	shape: S
): InterfaceSchemaType<TypeOfShape<S>> =>
	new InterfaceSchemaType(name, shape) as InterfaceSchemaType<any>;

class ResolverSchemaType<
	R extends SchemaType,
	F extends (...args: any) => TypeOfShape<R> | Promise<TypeOfShape<R>>
> extends SchemaType<F> {
	constructor(private args: Parameters<F>[0], private returns: R) {
		super();
	}

	_body() {
		return Object.values(this.args)
			.map((v: any) => v._body())
			.join("\n");
	}

	_render(): string {
		return this.returns._render();
	}

	_params(): string {
		return `(${Object.entries(this.args)
			.map(([k, v]) => `${k}: ${(v as SchemaType)._render()}`)
			.join(", ")})`;
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

class Schema<
	Q extends object = object,
	M extends object = object
> extends InterfaceSchemaType<{ Query: Q; Mutation: M }> {
	constructor(
		private queries: InterfaceSchemaType<Q>,
		private mutations: InterfaceSchemaType<M>
	) {
		super("Schema", { Query: queries.shape, Mutation: mutations.shape });
	}

	toGraphQL(): string {
		this.queries._reset();
		this.mutations._reset();
		return (
			`${this.queries.renderSchema()}\n\n${this.mutations.renderSchema()}`
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
		type("Query", queries),
		type("Mutation", mutations)
	);
