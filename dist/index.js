function e(e,t,n,r){Object.defineProperty(e,t,{get:n,set:r,enumerable:!0,configurable:!0})}e(module.exports,"bool",(()=>s)),e(module.exports,"int",(()=>i)),e(module.exports,"float",(()=>o)),e(module.exports,"string",(()=>h)),e(module.exports,"id",(()=>a)),e(module.exports,"array",(()=>l)),e(module.exports,"type",(()=>d)),e(module.exports,"resolver",(()=>m)),e(module.exports,"schema",(()=>w));class t{constructor(e){this.inner=e}}class n{constructor(){}clone(){throw"not implemented"}_render(){throw"not implemented"}_body(){throw"not implemented"}_params(){return""}_reset(){}docstring(e){const t=this.clone();return t._docstring=e,t}}class r extends n{constructor(e){super(),this.gql=e}clone(){return new r(this.gql)}_render(){return this.gql}_body(){return""}required(){if(this.gql.endsWith("!"))throw"Already non-nullable";return new r(this.gql+"!")}}const s=new r("Boolean"),i=new r("Int"),o=new r("Float"),h=new r("String"),a=new r("ID");class u extends r{constructor(e,t){super(e),this.inner=t}clone(){return new u(this.gql,this.inner)}_body(){return this.inner._body()}_reset(){this.inner._reset()}}const l=e=>new u(`[${e._render()}]`,e);class c extends n{constructor(e,t,n){super(),this.name=e,this.shape=t,this.written=n}clone(){return new c(this.name,this.shape,new t(!1))}_render(){return this.name}_body(){return this.written.inner?"":(this.written.inner=!0,`${this._docstring?`"""\n${this._docstring}\n"""\n`:""}type ${this.name.replace("!","")} {\n${e=Object.entries(this.shape).map((([e,t])=>`${t._docstring?`"""\n${t._docstring}\n"""\n`:""}${e}${t._params()}: ${t._render()}`)).join(",\n"),e.split("\n").map((e=>"  "+e)).join("\n")}\n}\n\n${Object.values(this.shape).map((e=>e._body())).join("\n")}`);var e}_reset(){this.written.inner=!1,Object.values(this.shape).forEach((e=>e._reset()))}extend(e,n){return new c(e,{...this.shape,...n},new t(!1))}toGraphQL(){return this._reset(),this._body().split("\n").filter((e=>!!e)).join("\n").replace(/}\n/g,"}\n\n")+"\n"}required(){if(this.name.endsWith("!"))throw"Already non-nullable";return new c(this.name+"!",this.shape,this.written)}}const d=(e,n)=>new c(e,n,new t(!1));class p extends n{constructor(e,t){super(),this.args=e,this.returns=t}clone(){return new p(this.args,this.returns)}_body(){return Object.values(this.args).concat(this.returns).map((e=>e._body())).join("\n")}_render(){return this.returns._render()}_params(){return`(${Object.entries(this.args).map((([e,t])=>`${e}: ${t._render()}`)).join(", ")})`}_reset(){Object.values(this.args).forEach((e=>e._reset()))}}const m=(e,t)=>new p(e,t);class _ extends c{constructor(e,n){super("Schema",{Query:e.shape,Mutation:n.shape},new t(!1)),this.queries=e,this.mutations=n}clone(){return new _(this.queries,this.mutations)}toGraphQL(){return this.queries._reset(),this.mutations._reset(),`${this.queries.toGraphQL()}\n\n${this.mutations.toGraphQL()}`.split("\n").filter((e=>!!e)).join("\n").replace(/}\n/g,"}\n\n")+"\n"}}const w=(e,t)=>new _(d("Query",e),d("Mutation",t));