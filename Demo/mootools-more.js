// MooTools: the javascript framework.
// Load this file's selection again by visiting: http://mootools.net/more/512fd1917d2d71d8f22608a7133fe249 
// Or build this file again with packager using: packager build More/String.QueryString
/*
---
copyrights:
  - [MooTools](http://mootools.net)

licenses:
  - [MIT License](http://mootools.net/license.txt)
...
*/
MooTools.More={version:"1.4.0.1",build:"a4244edf2aa97ac8a196fc96082dd35af1abab87"};String.implement({parseQueryString:function(d,a){if(d==null){d=true;
}if(a==null){a=true;}var c=this.split(/[&;]/),b={};if(!c.length){return b;}c.each(function(i){var e=i.indexOf("=")+1,g=e?i.substr(e):"",f=e?i.substr(0,e-1).match(/([^\]\[]+|(\B)(?=\]))/g):[i],h=b;
if(!f){return;}if(a){g=decodeURIComponent(g);}f.each(function(k,j){if(d){k=decodeURIComponent(k);}var l=h[k];if(j<f.length-1){h=h[k]=l||{};}else{if(typeOf(l)=="array"){l.push(g);
}else{h[k]=l!=null?[l,g]:g;}}});});return b;},cleanQueryString:function(a){return this.split("&").filter(function(e){var b=e.indexOf("="),c=b<0?"":e.substr(0,b),d=e.substr(b+1);
return a?a.call(null,c,d):(d||d===0);}).join("&");}});