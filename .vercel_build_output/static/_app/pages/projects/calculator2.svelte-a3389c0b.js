import{S as Ke,i as We,s as Ze,e as r,t as O,k as T,c as o,a as c,g as S,d,n as Y,b as t,f as Le,F as e,Q as se,R as ae,h as Oe,T as ie,U as Qe,j as xe,m as $e,o as et,x as tt,u as st,L as lt,v as at,J as ne}from"../../chunks/vendor-76a697cc.js";import{C as nt}from"../../chunks/Chart-c7e5f752.js";function ze(s,l,a){const X=s.slice();return X[14]=l[a],X[15]=l,X[16]=a,X}function Ge(s){let l,a,X=s[1][s[16]]+"",D,g,m,f=s[0][s[16]]+"",b,i,A,p,v,F,y;function I(){return s[11](s[16])}function j(){s[12].call(p,s[16])}return{c(){l=r("tr"),a=r("td"),D=O(X),g=T(),m=r("td"),b=O(f),i=T(),A=r("td"),p=r("input"),v=T(),this.h()},l(h){l=o(h,"TR",{class:!0});var u=c(l);a=o(u,"TD",{class:!0});var G=c(a);D=S(G,X),G.forEach(d),g=Y(u),m=o(u,"TD",{class:!0});var N=c(m);b=S(N,f),N.forEach(d),i=Y(u),A=o(u,"TD",{class:!0});var P=c(A);p=o(P,"INPUT",{id:!0,oninput:!0,type:!0,min:!0,max:!0,class:!0}),P.forEach(d),v=Y(u),u.forEach(d),this.h()},h(){t(a,"class","svelte-1mdk0x8"),t(m,"class","svelte-1mdk0x8"),t(p,"id","number1"),t(p,"oninput","this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*)\\./g, '$1');"),t(p,"type","number"),t(p,"min","0"),t(p,"max","100"),t(p,"class","svelte-1mdk0x8"),t(A,"class","svelte-1mdk0x8"),t(l,"class","svelte-1mdk0x8")},m(h,u){Le(h,l,u),e(l,a),e(a,D),e(l,g),e(l,m),e(m,b),e(l,i),e(l,A),e(A,p),se(p,s[5][s[16]]),e(l,v),F||(y=[ae(p,"change",I),ae(p,"input",j)],F=!0)},p(h,u){s=h,u&2&&X!==(X=s[1][s[16]]+"")&&Oe(D,X),u&1&&f!==(f=s[0][s[16]]+"")&&Oe(b,f),u&32&&ie(p.value)!==s[5][s[16]]&&se(p,s[5][s[16]])},d(h){h&&d(l),F=!1,Qe(y)}}}function rt(s){let l;return{c(){l=O(s[4])},l(a){l=S(a,s[4])},m(a,X){Le(a,l,X)},p(a,X){X&16&&Oe(l,a[4])},d(a){a&&d(l)}}}function ot(s){return{c:ne,l:ne,m:ne,p:ne,d:ne}}function dt(s){let l,a,X,D,g,m,f,b,i,A,p,v,F,y,I,j,h,u,G,N,P,fe,he,L,K,W,Xe,me,Z,R,M,pe,ve,q,_e,ke,J,be,Ee,Q,Te,C,B,Ye,ge,z,Ae,x,U,re,ye,Se,$=s[0],E=[];for(let n=0;n<$.length;n+=1)E[n]=Ge(ze(s,$,n));function Ie(n,_){return typeof n[4]=="undefined"||n[4]===null?ot:rt}let oe=Ie(s),H=oe(s);return U=new nt({props:{data:s[0],labels:s[1],colors:s[6]}}),{c(){l=r("div"),a=r("pre"),X=O(`X1 = 50 (oud)
Y = 50 (ander fonds)
a = 0,7 (gewenste fractie X)
X2 = (nieuw)

X2 = 0.7 * (X2 + Y)
X2 = dX + X1
dX + X1 = 0.7 * ((dX + X1) + Y)
dX + X1 = 0.7dX + 0.7X1 + 0.7Y
dX = 0.7dX - 0.3X1 + 0.7Y
0.3dX = 0.7Y - 0.3X1
dX = (1/0.3) * (0.7Y - 0.3X1)
dX = 2,33Y - X1
dX = 66,5

dX + X1 = a * ((dX + X1) + Y)
dX + X1 = a*dX + a*X1 + a*Y
dX = a*dX + (a*X1 - X1) + a*Y
dx - a*dX = (a*X1 - X1) + a*Y 
(1 - a) * dX = (a*X1 - X1) + a*Y 
dX = ((a*X1 - X1) + a*Y) / (1 - a) 

TEST:
dX = ((0,7 * 50 - 50) + 0,7*50) / (1 - 0,7)
dX = 66,5

SO:
dX = ((a*X1 - X1) + a*Y) / (1 - a) 

FOR MORE THAN 2 ASSETS`),D=T(),g=r("div"),m=r("div"),f=r("ol"),b=r("li"),i=r("label"),A=O("Asset"),p=T(),v=r("input"),F=T(),y=r("li"),I=r("label"),j=O("Amount"),h=T(),u=r("input"),G=T(),N=r("li"),P=r("button"),fe=O("Add fund"),he=T(),L=r("table"),K=r("caption"),W=r("h3"),Xe=O("List of assets"),me=T(),Z=r("thead"),R=r("tr"),M=r("th"),pe=O("Asset"),ve=T(),q=r("th"),_e=O("Amount"),ke=T(),J=r("th"),be=O("Desired %"),Ee=T(),Q=r("tbody");for(let n=0;n<E.length;n+=1)E[n].c();Te=T(),C=r("tfoot"),B=r("th"),Ye=O("Total:"),ge=T(),z=r("td"),H.c(),Ae=T(),x=r("div"),xe(U.$$.fragment),this.h()},l(n){l=o(n,"DIV",{class:!0});var _=c(l);a=o(_,"PRE",{class:!0});var w=c(a);X=S(w,`X1 = 50 (oud)
Y = 50 (ander fonds)
a = 0,7 (gewenste fractie X)
X2 = (nieuw)

X2 = 0.7 * (X2 + Y)
X2 = dX + X1
dX + X1 = 0.7 * ((dX + X1) + Y)
dX + X1 = 0.7dX + 0.7X1 + 0.7Y
dX = 0.7dX - 0.3X1 + 0.7Y
0.3dX = 0.7Y - 0.3X1
dX = (1/0.3) * (0.7Y - 0.3X1)
dX = 2,33Y - X1
dX = 66,5

dX + X1 = a * ((dX + X1) + Y)
dX + X1 = a*dX + a*X1 + a*Y
dX = a*dX + (a*X1 - X1) + a*Y
dx - a*dX = (a*X1 - X1) + a*Y 
(1 - a) * dX = (a*X1 - X1) + a*Y 
dX = ((a*X1 - X1) + a*Y) / (1 - a) 

TEST:
dX = ((0,7 * 50 - 50) + 0,7*50) / (1 - 0,7)
dX = 66,5

SO:
dX = ((a*X1 - X1) + a*Y) / (1 - a) 

FOR MORE THAN 2 ASSETS`),w.forEach(d),D=Y(_),g=o(_,"DIV",{class:!0});var k=c(g);m=o(k,"DIV",{class:!0});var le=c(m);f=o(le,"OL",{class:!0});var ee=c(f);b=o(ee,"LI",{class:!0});var de=c(b);i=o(de,"LABEL",{for:!0,class:!0});var Pe=c(i);A=S(Pe,"Asset"),Pe.forEach(d),p=Y(de),v=o(de,"INPUT",{id:!0,type:!0,class:!0}),de.forEach(d),F=Y(ee),y=o(ee,"LI",{class:!0});var ue=c(y);I=o(ue,"LABEL",{for:!0,class:!0});var He=c(I);j=S(He,"Amount"),He.forEach(d),h=Y(ue),u=o(ue,"INPUT",{id:!0,oninput:!0,type:!0,class:!0}),ue.forEach(d),G=Y(ee),N=o(ee,"LI",{class:!0});var Re=c(N);P=o(Re,"BUTTON",{id:!0,class:!0});var we=c(P);fe=S(we,"Add fund"),we.forEach(d),Re.forEach(d),ee.forEach(d),le.forEach(d),he=Y(k),L=o(k,"TABLE",{class:!0});var V=c(L);K=o(V,"CAPTION",{class:!0});var Fe=c(K);W=o(Fe,"H3",{class:!0});var Ne=c(W);Xe=S(Ne,"List of assets"),Ne.forEach(d),Fe.forEach(d),me=Y(V),Z=o(V,"THEAD",{class:!0});var Ce=c(Z);R=o(Ce,"TR",{class:!0});var te=c(R);M=o(te,"TH",{scope:!0,class:!0});var Be=c(M);pe=S(Be,"Asset"),Be.forEach(d),ve=Y(te),q=o(te,"TH",{scope:!0,class:!0});var Ue=c(q);_e=S(Ue,"Amount"),Ue.forEach(d),ke=Y(te),J=o(te,"TH",{scope:!0,class:!0});var Ve=c(J);be=S(Ve,"Desired %"),Ve.forEach(d),te.forEach(d),Ce.forEach(d),Ee=Y(V),Q=o(V,"TBODY",{class:!0});var je=c(Q);for(let De=0;De<E.length;De+=1)E[De].l(je);je.forEach(d),Te=Y(V),C=o(V,"TFOOT",{class:!0});var ce=c(C);B=o(ce,"TH",{scope:!0,colspan:!0,class:!0});var Me=c(B);Ye=S(Me,"Total:"),Me.forEach(d),ge=Y(ce),z=o(ce,"TD",{class:!0});var qe=c(z);H.l(qe),qe.forEach(d),ce.forEach(d),V.forEach(d),k.forEach(d),Ae=Y(_),x=o(_,"DIV",{class:!0});var Je=c(x);$e(U.$$.fragment,Je),Je.forEach(d),_.forEach(d),this.h()},h(){t(a,"class","svelte-1mdk0x8"),t(i,"for","name"),t(i,"class","svelte-1mdk0x8"),t(v,"id","name"),t(v,"type","text"),t(v,"class","svelte-1mdk0x8"),t(b,"class","svelte-1mdk0x8"),t(I,"for","number"),t(I,"class","svelte-1mdk0x8"),t(u,"id","number"),t(u,"oninput","this.value = this.value.replace(/[^0-9.]/g, '').replace(/(\\..*)\\./g, '$1');"),t(u,"type","number"),t(u,"class","svelte-1mdk0x8"),t(y,"class","svelte-1mdk0x8"),t(P,"id","submit"),t(P,"class","svelte-1mdk0x8"),t(N,"class","svelte-1mdk0x8"),t(f,"class","svelte-1mdk0x8"),t(m,"class","svelte-1mdk0x8"),t(W,"class","svelte-1mdk0x8"),t(K,"class","svelte-1mdk0x8"),t(M,"scope","col"),t(M,"class","svelte-1mdk0x8"),t(q,"scope","col"),t(q,"class","svelte-1mdk0x8"),t(J,"scope","col"),t(J,"class","svelte-1mdk0x8"),t(R,"class","svelte-1mdk0x8"),t(Z,"class","svelte-1mdk0x8"),t(Q,"class","svelte-1mdk0x8"),t(B,"scope","row"),t(B,"colspan","1"),t(B,"class","svelte-1mdk0x8"),t(z,"class","svelte-1mdk0x8"),t(C,"class","svelte-1mdk0x8"),t(L,"class","svelte-1mdk0x8"),t(g,"class","svelte-1mdk0x8"),t(x,"class","svelte-1mdk0x8"),t(l,"class","container svelte-1mdk0x8")},m(n,_){Le(n,l,_),e(l,a),e(a,X),e(l,D),e(l,g),e(g,m),e(m,f),e(f,b),e(b,i),e(i,A),e(b,p),e(b,v),se(v,s[3]),e(f,F),e(f,y),e(y,I),e(I,j),e(y,h),e(y,u),se(u,s[2]),e(f,G),e(f,N),e(N,P),e(P,fe),e(g,he),e(g,L),e(L,K),e(K,W),e(W,Xe),e(L,me),e(L,Z),e(Z,R),e(R,M),e(M,pe),e(R,ve),e(R,q),e(q,_e),e(R,ke),e(R,J),e(J,be),e(L,Ee),e(L,Q);for(let w=0;w<E.length;w+=1)E[w].m(Q,null);e(L,Te),e(L,C),e(C,B),e(B,Ye),e(C,ge),e(C,z),H.m(z,null),e(l,Ae),e(l,x),et(U,x,null),re=!0,ye||(Se=[ae(v,"input",s[9]),ae(u,"input",s[10]),ae(P,"click",s[7])],ye=!0)},p(n,[_]){if(_&8&&v.value!==n[3]&&se(v,n[3]),_&4&&ie(u.value)!==n[2]&&se(u,n[2]),_&291){$=n[0];let k;for(k=0;k<$.length;k+=1){const le=ze(n,$,k);E[k]?E[k].p(le,_):(E[k]=Ge(le),E[k].c(),E[k].m(Q,null))}for(;k<E.length;k+=1)E[k].d(1);E.length=$.length}oe===(oe=Ie(n))&&H?H.p(n,_):(H.d(1),H=oe(n),H&&(H.c(),H.m(z,null)));const w={};_&1&&(w.data=n[0]),_&2&&(w.labels=n[1]),U.$set(w)},i(n){re||(tt(U.$$.fragment,n),re=!0)},o(n){st(U.$$.fragment,n),re=!1},d(n){n&&d(l),lt(E,n),H.d(),at(U),ye=!1,Qe(Se)}}}function ut(s,l,a){let X=[],D=[],g=["#ff5100","#00bdb0","#993000","#00ffee","#949e9d","#bfd9d7","#abede9","#FFA076","#6f7b7a"],m,f,b,i=[];const A=(h,u)=>h+u;function p(){if(typeof f=="undefined"||f===null){alert("Please provide a name for your asset.");return}if(typeof m=="undefined"||m===null){alert("Please provide an amount for your asset");return}X.push(m),D.push(f),a(0,X),a(1,D),a(4,b=X.reduce(A)),a(2,m=null),a(3,f=null)}function v(h){if(i[h]<0||i[h]>100){a(5,i[h]=0,i),alert("Please enter a value between 1 and 100");return}if(i.reduce(A)>100){alert("You have more than 100%!"),a(5,i[h]=0,i);return}typeof i[h]=="undefined"&&i.push(i[h]),a(5,i),console.log(i)}function F(){f=this.value,a(3,f)}function y(){m=ie(this.value),a(2,m)}const I=h=>v(h);function j(h){i[h]=ie(this.value),a(5,i)}return[X,D,m,f,b,i,g,p,v,F,y,I,j]}class ft extends Ke{constructor(l){super();We(this,l,ut,dt,Ze,{})}}export{ft as default};
