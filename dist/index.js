function e(e,t,n,r){Object.defineProperty(e,t,{get:n,set:r,enumerable:!0,configurable:!0})}e(module.exports,"SchemaType",(()=>n)),e(module.exports,"bool",(()=>s)),e(module.exports,"int",(()=>i)),e(module.exports,"float",(()=>o)),e(module.exports,"string",(()=>h)),e(module.exports,"id",(()=>a)),e(module.exports,"array",(()=>c)),e(module.exports,"type",(()=>d)),e(module.exports,"resolver",(()=>_)),e(module.exports,"schema",(()=>w));class t{constructor(e){this.inner=e}}class n{constructor(){}clone(){throw"not implemented"}_render(){throw"not implemented"}_body(){throw"not implemented"}_params(){return""}_reset(){}docstring(e){const t=this.clone();return t._docstring=e,t}}class r extends n{constructor(e,t){super(),this.gql=e,this.__body=t}clone(){return new r(this.gql)}_render(){return this.gql}_body(){return this.__body?.()||""}required(){if(this.gql.endsWith("!"))throw"Already non-nullable";return new r(this.gql+"!",this.__body)}}const s=new r("Boolean"),i=new r("Int"),o=new r("Float"),h=new r("String"),a=new r("ID");class u extends r{constructor(e,t){super(e,(()=>t._body())),this.inner=t}clone(){return new u(this.gql,this.inner)}_reset(){this.inner._reset()}}const c=e=>new u(`[${e._render()}]`,e);class l extends n{constructor(e,t,n){super(),this.name=e,this.shape=t,this.written=n,this._gdocstring=""}clone(){return new l(this.name,this.shape,this.written)}_render(){return this.name}_body(){return this.written.inner?"":(this.written.inner=!0,`${this._gdocstring?`"""\n${this._gdocstring}\n"""\n`:""}type ${this.name.replace("!","")} {\n${e=Object.entries(this.shape).map((([e,t])=>`${t._docstring?`"""\n${t._docstring}\n"""\n`:""}${e}${t._params()}: ${t._render()}`)).join(",\n"),e.split("\n").map((e=>"  "+e)).join("\n")}\n}\n\n${Object.values(this.shape).map((e=>e._body())).join("\n")}`);var e}_reset(){this.written.inner=!1,Object.values(this.shape).forEach((e=>e._reset()))}extend(e,n){return new l(e,{...this.shape,...n},new t(!1))}toGraphQL(){return this._reset(),this._body().split("\n").filter((e=>!!e)).join("\n").replace(/}\n/g,"}\n\n")+"\n"}required(){if(this.name.endsWith("!"))throw"Already non-nullable";return new l(this.name+"!",this.shape,this.written)}typeDocstring(e){const t=this.clone();return t._gdocstring=e,t}}const d=(e,n)=>new l(e,n,new t(!1));class p extends n{constructor(e,t){super(),this.args=e,this.returns=t}clone(){return new p(this.args,this.returns)}_body(){return Object.values(this.args).concat(this.returns).map((e=>e._body())).join("\n")}_render(){return this.returns._render()}_params(){return`(${Object.entries(this.args).map((([e,t])=>`${e}: ${t._render()}`)).join(", ")})`}_reset(){Object.values(this.args).forEach((e=>e._reset()))}}const _=(e,t)=>new p(e,t);class m extends l{constructor(e,n){super("Schema",{Query:e.shape,Mutation:n.shape},new t(!1)),this.queries=e,this.mutations=n}clone(){return new m(this.queries,this.mutations)}toGraphQL(){return this.queries._reset(),this.mutations._reset(),`${this.queries.toGraphQL()}\n\n${this.mutations.toGraphQL()}`.split("\n").filter((e=>!!e)).join("\n").replace(/}\n/g,"}\n\n")+"\n"}}const w=(e,t)=>new m(d("Query",e),d("Mutation",t));