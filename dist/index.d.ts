export type Infer<S> = S extends SchemaType<infer X> ? X & {
    [key: string]: any;
} : never;
type TypeOfShape<S extends SchemaType | Shape> = S extends SchemaType<infer X> ? X : S extends Shape ? {
    [K in keyof S]: TypeOfShape<S[K]>;
} : never;
interface Shape {
    [key: string]: SchemaType | Shape;
}
declare class SharedBoolean {
    inner: boolean;
    constructor(inner: boolean);
}
declare class SchemaType<T = unknown> {
    p?: T;
    protected _docstring?: string;
    constructor();
    clone(): SchemaType<T>;
    /**
     * @hidden
     */
    _render(): string;
    /**
     * @hidden
     */
    _body(): string;
    /**
     * @hidden
     */
    _params(): string;
    /**
     * @hidden
     */
    _reset(): void;
    docstring(str: string): SchemaType<T>;
}
declare class TrivialSchemaType<T> extends SchemaType<T> {
    protected gql: string;
    constructor(gql: string);
    clone(): TrivialSchemaType<T>;
    _render(): string;
    _body(): string;
    /**
     * Define type to be non-nullable
     */
    required(): TrivialSchemaType<TrivialResolver<Exclude<Resolved<T>, undefined>>>;
}
type TrivialResolver<T = unknown> = T | ((...args: any) => T | Promise<T>);
interface Arguments {
    [key: string]: TrivialResolver | Arguments;
}
type Resolved<T> = T extends Arguments ? {
    [K in keyof T]: Resolved<T[K]>;
} : T extends TrivialResolver<infer T> ? T : never;
export const bool: TrivialSchemaType<TrivialResolver<boolean | undefined>>;
export const int: TrivialSchemaType<TrivialResolver<number | undefined>>;
export const float: TrivialSchemaType<TrivialResolver<number | undefined>>;
export const string: TrivialSchemaType<TrivialResolver<string | undefined>>;
export const id: TrivialSchemaType<TrivialResolver<string | undefined>>;
declare class ArraySchemaType<T> extends TrivialSchemaType<TrivialResolver<Resolved<T>[]>> {
    inner: SchemaType<T>;
    constructor(gql: string, inner: SchemaType<T>);
    clone(): ArraySchemaType<T>;
    _body(): string;
    _reset(): void;
}
export const array: <T>(t: SchemaType<T>) => ArraySchemaType<T>;
type Common<A, B> = {
    [P in keyof A & keyof B]: A[P] | B[P];
};
type Merge<A, B> = Omit<A, keyof Common<A, B>> & B;
declare class InterfaceSchemaType<T extends object = object> extends SchemaType<T> {
    shape: T;
    written: SharedBoolean;
    constructor(name: string, shape: T, written: SharedBoolean);
    clone(): InterfaceSchemaType<T>;
    _render(): string;
    _body(): string;
    _reset(): void;
    /**
     * Create a new type extending this one
     */
    extend<S extends Shape = Shape>(name: string, shape: S): InterfaceSchemaType<Merge<T, TypeOfShape<S>>>;
    toGraphQL(): string;
    required(): InterfaceSchemaType<TrivialResolver<Exclude<Resolved<T>, undefined>>>;
}
export const type: <S extends Shape = Shape>(name: string, shape: S) => InterfaceSchemaType<TypeOfShape<S>>;
declare class ResolverSchemaType<R extends SchemaType, F extends (...args: any) => TypeOfShape<R> | Promise<TypeOfShape<R>>> extends SchemaType<F> {
    constructor(args: Parameters<F>[0], returns: R);
    clone(): ResolverSchemaType<R, F>;
    _body(): string;
    _render(): string;
    _params(): string;
    _reset(): void;
}
export const resolver: <A extends Shape = Shape, R extends SchemaType<unknown> = SchemaType<unknown>>(args: A, returns: R) => ResolverSchemaType<R, (parent: any, args: Resolved<TypeOfShape<A>>, context: any, info: any) => TypeOfShape<R> | Promise<TypeOfShape<R>>>;
declare class Schema<Q extends object = object, M extends object = object> extends InterfaceSchemaType<{
    Query: Q;
    Mutation: M;
}> {
    constructor(queries: InterfaceSchemaType<Q>, mutations: InterfaceSchemaType<M>);
    clone(): Schema<Q, M>;
    toGraphQL(): string;
}
export const schema: <Q extends Shape = Shape, M extends Shape = Shape>(queries: Q, mutations: M) => Schema<TypeOfShape<Q>, TypeOfShape<M>>;
