import{_ as k}from"../chunks/preload-helper-ec9aa979.js";import{S as H,i as M,s as N,e as v,t as w,k as S,j as y,c as b,a as $,g as L,d as p,n as q,m as T,b as u,f as V,F as f,o as O,h as F,x as I,u as A,v as R,r as Q,w as U,M as W,L as X}from"../chunks/vendor-4f02d0e1.js";import{S as Y}from"../chunks/Seo-1255c03d.js";import{D as Z}from"../chunks/Date-5bcd979e.js";function z(n,t,l){const a=n.slice();return a[1]=t[l].path,a[2]=t[l].metadata.title,a[3]=t[l].metadata.snippet,a[4]=t[l].metadata.date,a}function G(n){let t,l,a,e=n[2]+"",i,o,r,s,h,E,g=n[3]+"",D,c,_,P;return s=new Z({props:{date:n[4]}}),{c(){t=v("a"),l=v("div"),a=v("h3"),i=w(e),o=S(),r=v("span"),y(s.$$.fragment),h=S(),E=v("p"),D=w(g),c=S(),this.h()},l(d){t=b(d,"A",{class:!0,href:!0});var m=$(t);l=b(m,"DIV",{class:!0});var j=$(l);a=b(j,"H3",{class:!0});var x=$(a);i=L(x,e),x.forEach(p),o=q(j),r=b(j,"SPAN",{class:!0});var B=$(r);T(s.$$.fragment,B),B.forEach(p),h=q(j),E=b(j,"P",{class:!0});var C=$(E);D=L(C,g),C.forEach(p),j.forEach(p),c=q(m),m.forEach(p),this.h()},h(){u(a,"class","svelte-s1q2mh"),u(r,"class","date svelte-s1q2mh"),u(E,"class","svelte-s1q2mh"),u(l,"class","blogPost svelte-s1q2mh"),u(t,"class","divlink svelte-s1q2mh"),u(t,"href",_=`${n[1].replace(".md","")}`)},m(d,m){V(d,t,m),f(t,l),f(l,a),f(a,i),f(l,o),f(l,r),O(s,r,null),f(l,h),f(l,E),f(E,D),f(t,c),P=!0},p(d,m){(!P||m&1)&&e!==(e=d[2]+"")&&F(i,e);const j={};m&1&&(j.date=d[4]),s.$set(j),(!P||m&1)&&g!==(g=d[3]+"")&&F(D,g),(!P||m&1&&_!==(_=`${d[1].replace(".md","")}`))&&u(t,"href",_)},i(d){P||(I(s.$$.fragment,d),P=!0)},o(d){A(s.$$.fragment,d),P=!1},d(d){d&&p(t),R(s)}}}function tt(n){let t,l,a=n[0],e=[];for(let o=0;o<a.length;o+=1)e[o]=G(z(n,a,o));const i=o=>A(e[o],1,1,()=>{e[o]=null});return{c(){t=v("div");for(let o=0;o<e.length;o+=1)e[o].c();this.h()},l(o){t=b(o,"DIV",{class:!0});var r=$(t);for(let s=0;s<e.length;s+=1)e[s].l(r);r.forEach(p),this.h()},h(){u(t,"class","blog-parent svelte-s1q2mh")},m(o,r){V(o,t,r);for(let s=0;s<e.length;s+=1)e[s].m(t,null);l=!0},p(o,[r]){if(r&1){a=o[0];let s;for(s=0;s<a.length;s+=1){const h=z(o,a,s);e[s]?(e[s].p(h,r),I(e[s],1)):(e[s]=G(h),e[s].c(),I(e[s],1),e[s].m(t,null))}for(Q(),s=a.length;s<e.length;s+=1)i(s);U()}},i(o){if(!l){for(let r=0;r<a.length;r+=1)I(e[r]);l=!0}},o(o){e=e.filter(Boolean);for(let r=0;r<e.length;r+=1)A(e[r]);l=!1},d(o){o&&p(t),W(e,o)}}}function et(n,t,l){let{dateSortedPosts:a}=t;return n.$$set=e=>{"dateSortedPosts"in e&&l(0,a=e.dateSortedPosts)},[a]}class st extends H{constructor(t){super();M(this,t,et,tt,N,{dateSortedPosts:0})}}function at(n){let t,l,a,e,i,o,r,s,h,E,g,D;return t=new Y({props:{pageTitle:ot,metaDescription:lt}}),h=new st({props:{dateSortedPosts:n[0]}}),{c(){y(t.$$.fragment),l=S(),a=v("main"),e=v("div"),i=v("h1"),o=w("All posts"),r=S(),s=v("div"),y(h.$$.fragment),E=S(),g=v("div"),this.h()},l(c){T(t.$$.fragment,c),l=q(c),a=b(c,"MAIN",{class:!0});var _=$(a);e=b(_,"DIV",{class:!0});var P=$(e);i=b(P,"H1",{class:!0});var d=$(i);o=L(d,"All posts"),d.forEach(p),P.forEach(p),r=q(_),s=b(_,"DIV",{class:!0});var m=$(s);T(h.$$.fragment,m),E=q(m),g=b(m,"DIV",{class:!0}),$(g).forEach(p),m.forEach(p),_.forEach(p),this.h()},h(){u(i,"class","svelte-7iocq3"),u(e,"class","svelte-7iocq3"),u(g,"class","background svelte-7iocq3"),u(s,"class","wrapper svelte-7iocq3"),u(a,"class","container svelte-7iocq3")},m(c,_){O(t,c,_),V(c,l,_),V(c,a,_),f(a,e),f(e,i),f(i,o),f(a,r),f(a,s),O(h,s,null),f(s,E),f(s,g),D=!0},p:X,i(c){D||(I(t.$$.fragment,c),I(h.$$.fragment,c),D=!0)},o(c){A(t.$$.fragment,c),A(h.$$.fragment,c),D=!1},d(c){R(t,c),c&&p(l),c&&p(a),R(h)}}}const J={"./blog/fifthpost.md":()=>k(()=>import("./blog/fifthpost.md-acfe72a6.js"),["pages/blog/fifthpost.md-acfe72a6.js","chunks/vendor-4f02d0e1.js","chunks/blog-afd3a347.js","assets/blog-03e48a3f.css","chunks/Seo-1255c03d.js","chunks/Date-5bcd979e.js"]),"./blog/firstpost.md":()=>k(()=>import("./blog/firstpost.md-a854f92b.js"),["pages/blog/firstpost.md-a854f92b.js","chunks/vendor-4f02d0e1.js","chunks/blog-afd3a347.js","assets/blog-03e48a3f.css","chunks/Seo-1255c03d.js","chunks/Date-5bcd979e.js"]),"./blog/fourthpost.md":()=>k(()=>import("./blog/fourthpost.md-2104ae4b.js"),["pages/blog/fourthpost.md-2104ae4b.js","chunks/vendor-4f02d0e1.js","chunks/blog-afd3a347.js","assets/blog-03e48a3f.css","chunks/Seo-1255c03d.js","chunks/Date-5bcd979e.js"]),"./blog/secondpost.md":()=>k(()=>import("./blog/secondpost.md-ad3a1065.js"),["pages/blog/secondpost.md-ad3a1065.js","chunks/vendor-4f02d0e1.js","chunks/blog-afd3a347.js","assets/blog-03e48a3f.css","chunks/Seo-1255c03d.js","chunks/Date-5bcd979e.js"]),"./blog/thirdpost.md":()=>k(()=>import("./blog/thirdpost.md-96264c27.js"),["pages/blog/thirdpost.md-96264c27.js","chunks/vendor-4f02d0e1.js","chunks/blog-afd3a347.js","assets/blog-03e48a3f.css","chunks/Seo-1255c03d.js","chunks/Date-5bcd979e.js"])};let K=[];for(let n in J)K.push(J[n]().then(({metadata:t})=>({path:n,metadata:t})));const ft=async({page:n})=>{const t=await Promise.all(K),l=n.params.tag;return{props:{posts:t,tag:l}}};let ot="blog",lt="Collection of all blog posts on the website.";function rt(n,t,l){let{posts:a}=t;const e=a.slice().sort((i,o)=>new Date(o.metadata.date)-new Date(i.metadata.date));return n.$$set=i=>{"posts"in i&&l(1,a=i.posts)},[e,a]}class mt extends H{constructor(t){super();M(this,t,rt,at,N,{posts:1,dateSortedPosts:0})}get dateSortedPosts(){return this.$$.ctx[0]}}export{mt as default,ft as load};
