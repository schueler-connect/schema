function e(e,t,n,r){Object.defineProperty(e,t,{get:n,set:r,enumerable:!0,configurable:!0})}e(module.exports,"bool",(()=>r)),e(module.exports,"int",(()=>s)),e(module.exports,"float",(()=>i)),e(module.exports,"string",(()=>o)),e(module.exports,"id",(()=>h)),e(module.exports,"array",(()=>u)),e(module.exports,"type",(()=>c)),e(module.exports,"resolver",(()=>p)),e(module.exports,"schema",(()=>_));class t{constructor(){}clone(){throw"not implemented"}_render(){throw"not implemented"}_body(){throw"not implemented"}_params(){return""}_reset(){}docstring(e){const t=this.clone();return t._docstring=e,t}}class n extends t{constructor(e){super(),this.gql=e}clone(){return new n(this.gql)}_render(){return this.gql}_body(){return""}required(){if(this.gql.endsWith("!"))throw"Already non-nullable";return new n(this.gql+"!")}}const r=new n("Boolean"),s=new n("Int"),i=new n("Float"),o=new n("String"),h=new n("ID");class a extends n{constructor(e,t){super(e),this.inner=t}clone(){return new a(this.gql,this.inner)}_body(){return this.inner._body()}_reset(){this.inner._reset()}}const u=e=>new a(`[${e._render()}]`,e);class l extends t{constructor(e,t){super(),this.name=e,this.shape=t,this.written=!1}clone(){return new l(this.name,this.shape)}_render(){return this.name}_body(){return this.written?"":(this.written=!0,`${this._docstring?`"""\n${this._docstring}\n"""\n`:""}type ${this.name.replace("!","")} {\n${e=Object.entries(this.shape).map((([e,t])=>`${t._docstring?`"""\n${t._docstring}\n"""\n`:""}${e}${t._params()}: ${t._render()}`)).join(",\n"),e.split("\n").map((e=>"  "+e)).join("\n")}\n}\n\n${Object.values(this.shape).map((e=>e._body())).join("\n")}`);var e}_reset(){this.written=!1,Object.values(this.shape).forEach((e=>e._reset()))}extend(e,t){return new l(e,{...this.shape,...t})}toGraphQL(){return this._reset(),this._body().split("\n").filter((e=>!!e)).join("\n").replace(/}\n/g,"}\n\n")+"\n"}required(){if(this.name.endsWith("!"))throw"Already non-nullable";return new l(this.name+"!",this.shape)}}const c=(e,t)=>new l(e,t);class d extends t{constructor(e,t){super(),this.args=e,this.returns=t}clone(){return new d(this.args,this.returns)}_body(){return Object.values(this.args).concat(this.returns).map((e=>e._body())).join("\n")}_render(){return this.returns._render()}_params(){return`(${Object.entries(this.args).map((([e,t])=>`${e}: ${t._render()}`)).join(", ")})`}_reset(){Object.values(this.args).forEach((e=>e._reset()))}}const p=(e,t)=>new d(e,t);class m extends l{constructor(e,t){super("Schema",{Query:e.shape,Mutation:t.shape}),this.queries=e,this.mutations=t}clone(){return new m(this.queries,this.mutations)}toGraphQL(){return this.queries._reset(),this.mutations._reset(),`${this.queries.toGraphQL()}\n\n${this.mutations.toGraphQL()}`.split("\n").filter((e=>!!e)).join("\n").replace(/}\n/g,"}\n\n")+"\n"}}const _=(e,t)=>new m(c("Query",e),c("Mutation",t));