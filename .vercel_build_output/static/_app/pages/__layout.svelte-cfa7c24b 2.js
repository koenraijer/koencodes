import{S as U,i as V,s as O,e as T,D as R,c as B,a as w,E as W,d as c,b as _,F as k,G as ne,f as y,H as D,I as P,J as le,K as se,L as oe,M as ae,N as ie,x as M,u as A,B as ue,O as X,P as Y,j as z,k as N,m as F,n as q,o as G,p as re,q as fe,Q as Z,v as J,z as de,R as me,t as K,g as L,T as _e,U as ce}from"../chunks/vendor-46806856.js";function he(n){let e,t,o,a,i,s;return{c(){e=T("button"),t=R("svg"),o=R("line"),a=R("line"),this.h()},l(l){e=B(l,"BUTTON",{name:!0,"aria-label":!0,id:!0,style:!0,class:!0});var r=w(e);t=W(r,"svg",{class:!0,width:!0,height:!0});var g=w(t);o=W(g,"line",{id:!0,x1:!0,y1:!0,x2:!0,y2:!0,style:!0,class:!0}),w(o).forEach(c),a=W(g,"line",{id:!0,x1:!0,y1:!0,x2:!0,y2:!0,style:!0,class:!0}),w(a).forEach(c),g.forEach(c),r.forEach(c),this.h()},h(){_(o,"id","top"),_(o,"x1","0"),_(o,"y1","9"),_(o,"x2","32"),_(o,"y2","9"),k(o,"transition","transform "+n[1]+"s ease-in-out, opacity "+n[1]+"s ease-in-out"),_(o,"class","svelte-1ompq2"),_(a,"id","bot"),_(a,"x1","0"),_(a,"y1","28"),_(a,"x2","32"),_(a,"y2","28"),k(a,"transition","transform "+n[1]+"s ease-in-out, opacity "+n[1]+"s ease-in-out"),_(a,"class","svelte-1ompq2"),_(t,"class","hamburger svelte-1ompq2"),_(t,"width","32"),_(t,"height","32"),_(e,"name","Menu"),_(e,"aria-label","Menu"),_(e,"id","burger-button"),k(e,"transition","color "+n[1]+"s ease-in-out"),k(e,"color",n[0]?n[3]:n[2]),_(e,"class","svelte-1ompq2"),ne(e,"open",n[0])},m(l,r){y(l,e,r),D(e,t),D(t,o),D(t,a),i||(s=P(e,"click",n[4]),i=!0)},p(l,[r]){r&2&&k(o,"transition","transform "+l[1]+"s ease-in-out, opacity "+l[1]+"s ease-in-out"),r&2&&k(a,"transition","transform "+l[1]+"s ease-in-out, opacity "+l[1]+"s ease-in-out"),r&2&&k(e,"transition","color "+l[1]+"s ease-in-out"),r&13&&k(e,"color",l[0]?l[3]:l[2]),r&1&&ne(e,"open",l[0])},i:le,o:le,d(l){l&&c(e),i=!1,s()}}}function ge(n,e,t){let{open:o}=e,{duration:a}=e,{burgerColor:i}=e,{menuColor:s}=e;const l=()=>t(0,o=!o);return n.$$set=r=>{"open"in r&&t(0,o=r.open),"duration"in r&&t(1,a=r.duration),"burgerColor"in r&&t(2,i=r.burgerColor),"menuColor"in r&&t(3,s=r.menuColor)},[o,a,i,s,l]}class be extends U{constructor(e){super();V(this,e,ge,he,O,{open:0,duration:1,burgerColor:2,menuColor:3})}}function ve(n){let e,t,o;const a=n[8].default,i=se(a,n,n[7],null);return{c(){e=T("div"),t=T("div"),i&&i.c(),this.h()},l(s){e=B(s,"DIV",{class:!0,style:!0});var l=w(e);t=B(l,"DIV",{id:!0,style:!0,class:!0});var r=w(t);i&&i.l(r),r.forEach(c),l.forEach(c),this.h()},h(){_(t,"id","menu"),k(t,"padding",n[3]),k(t,"padding-top",n[4]),k(t,"display",n[0]?"block":"none"),_(t,"class","svelte-1pavh4v"),_(e,"class","sidemenu svelte-1pavh4v"),k(e,"width",n[2]),k(e,"left",n[0]?"0px":"-"+n[2]),k(e,"transition","left "+n[1]+"s ease-in-out")},m(s,l){y(s,e,l),D(e,t),i&&i.m(t,null),o=!0},p(s,[l]){i&&i.p&&(!o||l&128)&&oe(i,a,s,s[7],o?ie(a,s[7],l,null):ae(s[7]),null),(!o||l&8)&&k(t,"padding",s[3]),(!o||l&16)&&k(t,"padding-top",s[4]),(!o||l&1)&&k(t,"display",s[0]?"block":"none"),(!o||l&4)&&k(e,"width",s[2]),(!o||l&5)&&k(e,"left",s[0]?"0px":"-"+s[2]),(!o||l&2)&&k(e,"transition","left "+s[1]+"s ease-in-out")},i(s){o||(M(i,s),o=!0)},o(s){A(i,s),o=!1},d(s){s&&c(e),i&&i.d(s)}}}function ke(n,e,t){let{$$slots:o={},$$scope:a}=e,{open:i=!1}=e,{duration:s}=e,{width:l}=e,{padding:r}=e,{paddingTop:g}=e,{backgroundColor:v}=e,{menuColor:p}=e;return n.$$set=d=>{"open"in d&&t(0,i=d.open),"duration"in d&&t(1,s=d.duration),"width"in d&&t(2,l=d.width),"padding"in d&&t(3,r=d.padding),"paddingTop"in d&&t(4,g=d.paddingTop),"backgroundColor"in d&&t(5,v=d.backgroundColor),"menuColor"in d&&t(6,p=d.menuColor),"$$scope"in d&&t(7,a=d.$$scope)},[i,s,l,r,g,v,p,a,o]}class pe extends U{constructor(e){super();V(this,e,ke,ve,O,{open:0,duration:1,width:2,padding:3,paddingTop:4,backgroundColor:5,menuColor:6})}}function Ce(n){let e,t,o,a,i,s,l,r,g,v,p,d,f,u,b,C,H,I,S;function Q(m){n[15](m)}let h={};return n[1]!==void 0&&(h.theme=n[1]),f=new me({props:h}),X.push(()=>Y(f,"theme",Q)),{c(){e=T("h2"),t=T("a"),o=K("Home"),a=N(),i=T("h2"),s=T("a"),l=K("Blog"),r=N(),g=T("h2"),v=T("a"),p=K("Email me"),d=N(),z(f.$$.fragment),b=N(),C=T("input"),this.h()},l(m){e=B(m,"H2",{});var E=w(e);t=B(E,"A",{class:!0,href:!0});var j=w(t);o=L(j,"Home"),j.forEach(c),E.forEach(c),a=q(m),i=B(m,"H2",{});var x=w(i);s=B(x,"A",{class:!0,href:!0});var $=w(s);l=L($,"Blog"),$.forEach(c),x.forEach(c),r=q(m),g=B(m,"H2",{});var ee=w(g);v=B(ee,"A",{class:!0,href:!0});var te=w(v);p=L(te,"Email me"),te.forEach(c),ee.forEach(c),d=q(m),F(f.$$.fragment,m),b=q(m),C=B(m,"INPUT",{"aria-label":!0,name:!0,class:!0,type:!0}),this.h()},h(){_(t,"class","menuitem svelte-pa3h4w"),_(t,"href","/"),_(s,"class","menuitem svelte-pa3h4w"),_(s,"href","/blog"),_(v,"class","menuitem svelte-pa3h4w"),_(v,"href","mailto:koenraijer@protonmail.com"),_(C,"aria-label","Darkmode"),_(C,"name","Darkmode"),_(C,"class","toggle svelte-pa3h4w"),_(C,"type","checkbox")},m(m,E){y(m,e,E),D(e,t),D(t,o),y(m,a,E),y(m,i,E),D(i,s),D(s,l),y(m,r,E),y(m,g,E),D(g,v),D(v,p),y(m,d,E),G(f,m,E),y(m,b,E),y(m,C,E),H=!0,I||(S=[P(t,"click",n[13]),P(s,"click",n[14]),P(C,"click",n[16])],I=!0)},p(m,E){const j={};!u&&E&2&&(u=!0,j.theme=m[1],Z(()=>u=!1)),f.$set(j)},i(m){H||(M(f.$$.fragment,m),H=!0)},o(m){A(f.$$.fragment,m),H=!1},d(m){m&&c(e),m&&c(a),m&&c(i),m&&c(r),m&&c(g),m&&c(d),J(f,m),m&&c(b),m&&c(C),I=!1,_e(S)}}}function we(n){let e,t,o,a,i,s,l;const r=[n[3]];function g(u){n[12](u)}let v={};for(let u=0;u<r.length;u+=1)v=ue(v,r[u]);n[0]!==void 0&&(v.open=n[0]),t=new be({props:v}),X.push(()=>Y(t,"open",g));const p=[n[4]];function d(u){n[17](u)}let f={$$slots:{default:[Ce]},$$scope:{ctx:n}};for(let u=0;u<p.length;u+=1)f=ue(f,p[u]);return n[0]!==void 0&&(f.open=n[0]),i=new pe({props:f}),X.push(()=>Y(i,"open",d)),{c(){e=T("nav"),z(t.$$.fragment),a=N(),z(i.$$.fragment)},l(u){e=B(u,"NAV",{});var b=w(e);F(t.$$.fragment,b),a=q(b),F(i.$$.fragment,b),b.forEach(c)},m(u,b){y(u,e,b),G(t,e,null),D(e,a),G(i,e,null),l=!0},p(u,[b]){const C=b&8?re(r,[fe(u[3])]):{};!o&&b&1&&(o=!0,C.open=u[0],Z(()=>o=!1)),t.$set(C);const H=b&16?re(p,[fe(u[4])]):{};b&262151&&(H.$$scope={dirty:b,ctx:u}),!s&&b&1&&(s=!0,H.open=u[0],Z(()=>s=!1)),i.$set(H)},i(u){l||(M(t.$$.fragment,u),M(i.$$.fragment,u),l=!0)},o(u){A(t.$$.fragment,u),A(i.$$.fragment,u),l=!1},d(u){u&&c(e),J(t),J(i)}}}function ye(n,e,t){let o,{open:a=!1}=e,{duration:i=.25}=e,{width:s="100vw"}=e,{padding:l="2rem"}=e,{paddingTop:r="4rem"}=e,{backgroundColor:g="#111344"}=e,{burgerColor:v="rgb(18.4, 18.4, 18.4)"}=e,{menuColor:p="white"}=e,d={duration:i,burgerColor:v,menuColor:p},f={duration:i,width:s,padding:l,paddingTop:r,backgroundColor:g,menuColor:p},u;de(()=>{document.body.className=u});function b(h){a=h,t(0,a)}const C=()=>t(0,a=!a),H=()=>t(0,a=!a);function I(h){u=h,t(1,u)}const S=()=>t(1,u=o);function Q(h){a=h,t(0,a)}return n.$$set=h=>{"open"in h&&t(0,a=h.open),"duration"in h&&t(5,i=h.duration),"width"in h&&t(6,s=h.width),"padding"in h&&t(7,l=h.padding),"paddingTop"in h&&t(8,r=h.paddingTop),"backgroundColor"in h&&t(9,g=h.backgroundColor),"burgerColor"in h&&t(10,v=h.burgerColor),"menuColor"in h&&t(11,p=h.menuColor)},n.$$.update=()=>{n.$$.dirty&2&&t(2,o=u==="dark"?"light":"dark")},[a,u,o,d,f,i,s,l,r,g,v,p,b,C,H,I,S,Q]}class Ee extends U{constructor(e){super();V(this,e,ye,we,O,{open:0,duration:5,width:6,padding:7,paddingTop:8,backgroundColor:9,burgerColor:10,menuColor:11})}}function Te(n){let e,t,o,a,i,s,l,r,g,v;e=new Ee({});const p=n[3].default,d=se(p,n,n[2],null);return{c(){z(e.$$.fragment),t=N(),o=T("h1"),a=T("a"),i=K("koen.wtf"),s=N(),l=T("div"),d&&d.c(),this.h()},l(f){F(e.$$.fragment,f),t=q(f),o=B(f,"H1",{class:!0});var u=w(o);a=B(u,"A",{href:!0,class:!0});var b=w(a);i=L(b,"koen.wtf"),b.forEach(c),u.forEach(c),s=q(f),l=B(f,"DIV",{class:!0});var C=w(l);d&&d.l(C),C.forEach(c),this.h()},h(){_(a,"href","/"),_(a,"class","svelte-1u3kuhv"),_(o,"class","sitetitle svelte-1u3kuhv"),_(l,"class","container svelte-1u3kuhv")},m(f,u){G(e,f,u),y(f,t,u),y(f,o,u),D(o,a),D(a,i),y(f,s,u),y(f,l,u),d&&d.m(l,null),r=!0,g||(v=P(a,"click",function(){ce(n[0]=!1)&&(n[0]=!1).apply(this,arguments)}),g=!0)},p(f,[u]){n=f,d&&d.p&&(!r||u&4)&&oe(d,p,n,n[2],r?ie(p,n[2],u,null):ae(n[2]),null)},i(f){r||(M(e.$$.fragment,f),M(d,f),r=!0)},o(f){A(e.$$.fragment,f),A(d,f),r=!1},d(f){J(e,f),f&&c(t),f&&c(o),f&&c(s),f&&c(l),d&&d.d(f),g=!1,v()}}}function Be(n,e,t){let{$$slots:o={},$$scope:a}=e,{location:i}=e,{open:s=!1}=e;return n.$$set=l=>{"location"in l&&t(1,i=l.location),"open"in l&&t(0,s=l.open),"$$scope"in l&&t(2,a=l.$$scope)},[s,i,a,o]}class He extends U{constructor(e){super();V(this,e,Be,Te,O,{location:1,open:0})}}export{He as default};
