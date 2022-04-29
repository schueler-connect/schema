function e(e,t,r,n){Object.defineProperty(e,t,{get:r,set:n,enumerable:!0,configurable:!0})}e(module.exports,"bool",(()=>n)),e(module.exports,"int",(()=>s)),e(module.exports,"float",(()=>i)),e(module.exports,"string",(()=>o)),e(module.exports,"id",(()=>a)),e(module.exports,"array",(()=>u)),e(module.exports,"type",(()=>l)),e(module.exports,"resolver",(()=>p)),e(module.exports,"schema",(()=>m));class t{constructor(){}_render(){throw"not implemented"}_body(){throw"not implemented"}_params(){return""}_reset(){}docstring(e){return this._docstring=e,this}}class r extends t{constructor(e){super(),this.gql=e}_render(){return this.gql}_body(){return""}required(){if(this.gql.endsWith("!"))throw"Already non-nullable";return new r(this.gql+"!")}}const n=new r("Boolean"),s=new r("Int"),i=new r("Float"),o=new r("String"),a=new r("ID");class h extends r{constructor(e,t){super(e),this.inner=t}_body(){return this.inner._body()}_reset(){this.inner._reset()}}const u=e=>new h(`[${e._render()}]`,e);class d extends t{constructor(e,t){super(),this.name=e,this.shape=t,this.written=!1}_render(){return this.name}_body(){return this.written?"":(this.written=!0,`${this._docstring?`"""\n${this._docstring}\n"""\n`:""}type ${this.name.replace("!","")} {\n${e=Object.entries(this.shape).map((([e,t])=>`${t._docstring?`"""\n${t._docstring}\n"""\n`:""}${e}${t._params()}: ${t._render()}`)).join(",\n"),e.split("\n").map((e=>"  "+e)).join("\n")}\n}\n\n${Object.values(this.shape).map((e=>e._body())).join("\n")}`);var e}_reset(){this.written=!1,Object.values(this.shape).forEach((e=>e._reset()))}extend(e,t){return new d(e,{...this.shape,...t})}toGraphQL(){return this._reset(),this._body().split("\n").filter((e=>!!e)).join("\n").replace(/}\n/g,"}\n\n")+"\n"}required(){if(this.name.endsWith("!"))throw"Already non-nullable";return new d(this.name+"!",this.shape)}}const l=(e,t)=>new d(e,t);class c extends t{constructor(e,t){super(),this.args=e,this.returns=t}_body(){return Object.values(this.args).map((e=>e._body())).join("\n")}_render(){return this.returns._render()}_params(){return`(${Object.entries(this.args).map((([e,t])=>`${e}: ${t._render()}`)).join(", ")})`}_reset(){Object.values(this.args).forEach((e=>e._reset()))}}const p=(e,t)=>new c(e,t);class _ extends d{constructor(e,t){super("Schema",{Query:e.shape,Mutation:t.shape}),this.queries=e,this.mutations=t}toGraphQL(){return this.queries._reset(),this.mutations._reset(),`${this.queries.toGraphQL()}\n\n${this.mutations.toGraphQL()}`.split("\n").filter((e=>!!e)).join("\n").replace(/}\n/g,"}\n\n")+"\n"}}const m=(e,t)=>new _(l("Query",e),l("Mutation",t));