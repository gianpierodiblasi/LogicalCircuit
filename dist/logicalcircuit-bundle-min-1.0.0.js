class LogicalCircuitCore{#a={};#b;#c=["OR","NOR","AND","NAND","XOR","NXOR","NOT","BREAK","CASE","CATCH","CLASS","CONST","CONTINUE","DEBUGGER","DEFAULT","DELETE","DO","ELSE","EXPORT","EXTENDS","FALSE","FINALLY","FOR","FUNCTION","IF","IMPORT","IN","INSTANCEOF","NEW","NULL","RETURN","SUPER","SWITCH","THIS","THROW","TRUE","TRY","TYPEOF","VAR","VOID","WHILE","WITH","LET","STATIC","YIELD","AWAIT","ENUM","IMPLEMENTS","INTERFACE","PACKAGE","PRIVATE","PROTECTED","PUBLIC","ABSTRACT","BOOLEAN","BYTE","CHAR","DOUBLE","FINAL","FLOAT","GOTO","INT","LONG","NATIVE","SHORT","SYNCHRONIZED","THROWS","TRANSIENT","VOLATILE","ARGUMENTS","AS","ASYNC","EVAL","FROM","GET","OF","SET"];#d=["OR","NOR","AND","NAND","XOR","NXOR","NOT"];#e={OR:"||",AND:"&&",XOR:"+",NOR:"||",NAND:"&&",NXOR:"+"};#f={OR:"",AND:"",XOR:"===1",NOR:"",NAND:"",NXOR:"!==1"};constructor(){}setJSON(t){this.#a=JSON.parse(JSON.stringify(t))}getJSON(){return JSON.parse(JSON.stringify(this.#a))}setSimplifier(t){this.#b=t}simplify(){if(!this.#b||!this.isValid())return!1;var t={};Object.keys(this.#a).filter(t=>"IN"===this.#a[t].type).forEach(s=>t[s]={type:"IN"});var s=!0;return Object.keys(this.#a).filter(t=>"OUT"===this.#a[t].type).forEach(e=>{var i=[];this.#g(e,i);for(var o=[],h=0;h<Math.pow(2,i.length);h++){var n={},r=h.toString(2).padStart(i.length,"0");i.forEach((t,s)=>n[t]=!!parseInt(r[s])),this.computeExpression(e,n)&&o.push(h)}t[e]={type:"OUT",from:[]};try{var a=this.#b(o);this.#h(t,e,i,a)}catch(l){s=!1}}),s&&(this.#a=t),s}#g(t,s){"IN"===this.#a[t].type?s.includes(t)||s.push(t):"NOT"===this.#a[t].type?this.#g(this.#a[t].from[0],s):this.#a[t].from.forEach(t=>this.#g(t,s))}#h(t,s,e,i){if(1===(i=i.split(" OR ")).length)this.#i(t,s,e,i[0]);else{var o=this.#j("OR");t[o]={type:"OR",from:[]},i.forEach(s=>this.#i(t,o,e,s)),t[s].from.push(o)}}#i(t,s,e,i){if(1===(i=i.replace("(","").replace(")","").split(" AND ")).length)this.#k(t,s,e,i[0]);else{var o=this.#j("AND");t[o]={type:"AND",from:[]},i.forEach(s=>this.#k(t,o,e,s)),t[s].from.push(o)}}#k(t,s,e,i){if(i.startsWith("NOT ")){var o=this.#j("NOT");t[o]={type:"NOT",from:[e[i.charCodeAt(4)-65]]},t[s].from.push(o)}else t[s].from.push(e[i.charCodeAt(0)-65])}computeExpressions(t){var s={};return this.isValid()&&Object.keys(this.#a).filter(t=>"OUT"===this.#a[t].type).forEach(e=>s[e]=this.computeExpression(e,t)),s}computeExpression(name,parameters){var result;if(this.isValid()&&this.#a[name]&&"OUT"===this.#a[name].type){var toEval=Object.keys(parameters).reduce((t,s)=>t+"var "+s+" = "+parameters[s]+";\n","");eval(toEval+="result = "+this.getJavaScriptExpression(name)+";")}return result}getJavaScriptExpressions(){var t={};return this.isValid()&&Object.keys(this.#a).filter(t=>"OUT"===this.#a[t].type).forEach(s=>t[s]=this.#l(this.#a[s].from[0],!1)),t}getJavaScriptExpression(t){return this.isValid()&&this.#a[t]&&"OUT"===this.#a[t].type?this.#l(this.#a[t].from[0],!1):""}#l(t,s){if("IN"===this.#a[t].type)return t;if("NOT"===this.#a[t].type)return"!"+this.#l(this.#a[t].from[0],!0);var e=this.#a[t].from.map(t=>this.#l(t,!0));switch(this.#a[t].type){case"OR":case"AND":case"XOR":case"NXOR":return(s?"(":"")+e.join(this.#e[this.#a[t].type])+this.#f[this.#a[t].type]+(s?")":"");case"NOR":case"NAND":return"!("+e.join(this.#e[this.#a[t].type])+")"}}isValid(){return Object.keys(this.#a).filter(t=>"OUT"===this.#a[t].type).reduce((t,s)=>t&&this.#m(s),!0)}#m(t){var s=!0;return this.#a[t].from.forEach(t=>{(s&=!!t)&&"IN"!==this.#a[t].type&&(s&=!!this.#m(t))}),!!s}isEmpty(){return!Object.keys(this.#a).length}addInput(t){return this.#n(t,{type:"IN"})}addOutput(t){return this.#n(t,{type:"OUT",from:[""]})}addOR(){return this.#o("OR",["",""])}addNOR(){return this.#o("NOR",["",""])}addAND(){return this.#o("AND",["",""])}addNAND(){return this.#o("NAND",["",""])}addXOR(){return this.#o("XOR",["",""])}addNXOR(){return this.#o("NXOR",["",""])}addNOT(){return this.#o("NOT",[""])}#o(t,s){var e=this.#j(t);return this.#n(e,{type:t,from:s},!0),e}#n(t,s,e){return e?(this.#a[t]=s,!0):!!this.isNameValid(t)&&!this.isNameAlreadyUsed(t)&&(this.#a[t]=s,!0)}#j(t){return"$_"+t.padEnd(5,"_")+new Date().getTime()+"_"+parseInt(1e4*Math.random()).toFixed(0).padStart(4,"0")}incConnector(t){this.#a[t]&&!["IN","OUT","NOT"].includes(this.#a[t].type)&&this.#a[t].from.push("")}decConnector(t){if(this.#a[t]&&!["IN","OUT","NOT"].includes(this.#a[t].type)&&this.#a[t].from.length>2){var s=this.#a[t].from.indexOf("");-1!==s?this.#a[t].from.splice(s,1):this.#a[t].from.pop()}}addConnection(t,s,e){this.isConnectionValid(t,s)&&0<=e&&e<this.#a[s].from.length&&(this.#a[s].from[e]=t)}isConnectionValid(t,s){if(t===s||!this.#a[t]||!this.#a[s])return!1;if("IN"===this.#a[t].type)return"IN"!==this.#a[s].type;if("OUT"===this.#a[t].type)return!1;if("IN"===this.#a[s].type)return!1;if("OUT"===this.#a[s].type)return!0;else return!this.#p(t,s)}#p(t,s){var e=Object.keys(this.#a).filter(t=>this.#d.includes(this.#a[t].type)&&this.#a[t].from.includes(s));return e.includes(t)||e.reduce((s,e)=>s||this.#p(t,e),!1)}removeConnection(t,s){this.#a[t]&&this.#a[t].from&&0<=s&&s<this.#a[t].from.length&&(this.#a[t].from[s]="")}remove(t){this.#a[t]&&(delete this.#a[t],Object.keys(this.#a).filter(t=>"IN"!==this.#a[t].type).forEach(s=>this.#a[s].from=this.#a[s].from.map(s=>s===t?"":s)))}clear(){this.#a={}}getType(t){return this.#a[t]?this.#a[t].type:""}getFrom(t){return this.#a[t]&&"IN"!==this.#a[t].type?this.#a[t].from.slice():[]}isNameValid(t){return"string"==typeof t&&/^[a-z]+[a-z0-9_]*$/i.test(t)&&!this.#c.includes(t.toUpperCase())}isNameAlreadyUsed(t){return!!this.#a[t]}addBlackListWord(t){t&&this.#c.push(t.toUpperCase())}}var uniqueDragAndDropKeyLogicalCircuitUI="";class LogicalCircuitUI{#q;#r=new LogicalCircuitCore;#s={};#t={width:800,height:600,font:"24px sans-serif",lineWidth:2,strokeStyle:"black",fillStyle:"black",cursor:"default",bezierConnector:!1,showOperatorType:!1,interactive:!1};#u={index:0,array:[{json:"{}",jsonUI:"{}"}]};#v={en:{simplifyLabel:"Simplify",reorganizeLabel:"Reorganize",dndTooltip:"Click or Drag&Drop to add a new element",trashTooltip:"To trash an element move and release it here",undoTooltip:"Undo",redoTooltip:"Redo",clearTooltip:"Clear",clearMessage:"Do you really want to clear the current logical circuit?",simplifyMessage:"Do you really want to simplify the current logical circuit?",reorganizeMessage:"Do you really want to reorganize the current logical circuit?"},it:{simplifyLabel:"Semplifica",reorganizeLabel:"Riorganizza",dndTooltip:"Clicca o Trascina&Rilascia per aggiungere un nuovo elemento",trashTooltip:"Per eliminare un elemento muovilo e rilascialo qui",undoTooltip:"Annulla",redoTooltip:"Ripeti",clearTooltip:"Cancella",clearMessage:"Vuoi realmente cancellare il circuito logico corrente?",simplifyMessage:"Vuoi realmente semplificare il circuito logico corrente?",reorganizeMessage:"Vuoi realmente riorganizzare il circuito logico corrente?"}};#w={classId:"",droppable:!1,inTrash:!1,left:0,top:0};#x=[];#y=[];#z;#A;constructor(t,s){this.#q="LogicalCircuitUI_Container_"+new Date().getTime()+"_"+parseInt(1e3*Math.random());try{s.width}catch(e){s={}}this.#t.width=isNaN(s.width)||s.width<0?this.#t.width:s.width,this.#t.height=isNaN(s.height)||s.height<0?this.#t.height:s.height,s.lang&&this.#v[s.lang]?this.#v=this.#v[s.lang]:this.#v[navigator.language.substring(0,2)]?this.#v=this.#v[navigator.language.substring(0,2)]:this.#v=this.#v.en,t.classList.add("LogicalCircuitUI_Container"),t.classList.add(this.#q),t.style.width=this.#t.width+2+"px",this.#A=new LogicalCircuitToolbar(t,this.#q,this.#r,this.#s,this.#t,this.#u,this.#v,this.#w,this.#x,this.#y),this.#z=new LogicalCircuitCanvas(t,this.#q,this.#r,this.#s,this.#t,this.#u,this.#v,this.#w,this.#x,this.#y),this.#A.setCanvas(this.#z),this.#z.setToolbar(this.#A),this.setBezierConnector(s.bezierConnector),this.setShowOperatorType(s.showOperatorType),this.setInteractive(s.interactive)}setJSONs(t,s){this.#u.index=0,this.#u.array=[{json:JSON.stringify(t),jsonUI:JSON.stringify(s)}],this.#r.setJSON(t),Object.keys(this.#s).forEach(t=>delete this.#s[t]),Object.assign(this.#s,s),this.#A.setJSONUI(),this.#z.setJSONUI(),this.#x.forEach(t=>t()),this.#y.forEach(t=>t())}getJSON(){return this.#r.getJSON()}getJSONUI(){return JSON.parse(JSON.stringify(this.#s))}setSimplifier(t){this.#r.setSimplifier(t),this.#A.setSimplifierVisible(!!t)}setReorganizer(t){this.#A.setReorganizer(t)}computeExpressions(t){return this.#r.computeExpressions(t)}computeExpression(t,s){return this.#r.computeExpression(t,s)}getJavaScriptExpressions(){return this.#r.getJavaScriptExpressions()}getJavaScriptExpression(t){return this.#r.getJavaScriptExpression(t)}isValid(){return this.#r.isValid()}setBezierConnector(t){this.#z.setBezierConnector(!!t)}setShowOperatorType(t){this.#z.setShowOperatorType(!!t)}setInteractive(t){this.#z.setInteractive(!!t)}addOnChangeListener(t){this.#x.push(t)}addOnChangeUIListener(t){this.#y.push(t)}addBlackListWord(t){this.#r.addBlackListWord(t)}}class LogicalCircuitToolbar{#q;#r;#s;#t;#u;#v;#w;#x=[];#y=[];#z;#B;#C={top:15,left:15};constructor(t,s,e,i,o,h,n,r,a,l){this.#q=s,this.#r=e,this.#s=i,this.#t=o,this.#u=h,this.#v=n,this.#w=r,this.#x=a,this.#y=l;var c=document.createElement("div");c.classList.add("LogicalCircuitUI_Toolbar"),c.style.width=this.#t.width+2+"px",t.append(c),this.#D(c,"↶",null,this.#v.undoTooltip,null,"UNDO",null,()=>this.#E(),null,null,"small",!0,!0,!1),this.#D(c,"↷",null,this.#v.redoTooltip,null,"REDO",null,()=>this.#F(),null,null,"small",!0,!0,!1),this.#D(c,"\uD83D\uDDD1",null,this.#v.clearTooltip,null,"CLEAR",null,()=>this.#G(),null,"Divide_On_Right","small",!0,!0,!1),this.#H(c),this.#I(c,"OR"),this.#I(c,"AND"),this.#I(c,"XOR"),this.#D(c,"NOT",null,this.#v.dndTooltip,null,"NOT",null,()=>this.#n("NOT"),null,"Divide_On_Right","medium",!1,!0,!0),this.#D(c,this.#v.simplifyLabel,this.#v.reorganizeLabel,null,null,"SIMPLIFY","REORGANIZE",()=>this.#J(),()=>this.#K(),null,"large",!0,!1,!1)}#I(t,s){this.#D(t,s,"N"+s,this.#v.dndTooltip,this.#v.dndTooltip,s,"N"+s,()=>this.#n(s),()=>this.#n("N"+s),null,"medium",!1,!0,!0)}#D(e,i,o,h,n,r,a,l,c,d,u,f,p,g){var m=document.createElement("div");m.classList.add("LogicalCircuitUI_Toolbar_ButtonContainer"),d&&m.classList.add(d),e.append(m),l&&(this.#L(m,i,h,r,u,f,p,g).onclick=t=>l()),c&&(this.#L(m,o,n,a,u,f,p,g).onclick=t=>c())}#H(y){var b=document.createElement("div");b.classList.add("LogicalCircuitUI_Toolbar_TextContainer"),b.classList.add("Divide_On_Right"),y.append(b);var I=document.createElement("input");I.type="text",I.classList.add("IN-OUT"),I.oninput=t=>{var s=!this.#r.isNameValid(I.value)||this.#r.isNameAlreadyUsed(I.value);v.disabled=s,v.setAttribute("draggable",!s),N.disabled=s,N.setAttribute("draggable",!s)},b.append(I);var v=this.#L(b,"IN",this.#v.dndTooltip,"IN","medium",!0,!0,!1),N=this.#L(b,"OUT",this.#v.dndTooltip,"OUT","medium",!0,!0,!1);v.onclick=t=>this.#M(I.value),N.onclick=t=>this.#N(I.value)}#L(x,T,O,U,C,S,w,P){var j=document.createElement("button");return j.textContent=T,j.title=O||"",j.classList.add(U),j.classList.add(C),j.disabled=S,j.style.visibility=w?"visible":"hidden",j.setAttribute("draggable",P),j.ondragstart=t=>this.#O(t,U),j.ondragend=t=>this.#P(t),x.append(j),j}#O(D,E){uniqueDragAndDropKeyLogicalCircuitUI=this.#q,this.#w.classId=E,this.#w.droppable=!1,D.dataTransfer.effectAllowed="move",D.dataTransfer.setDragImage(this.#z.getCanvasForDnD(E,document.querySelector("."+this.#q+" input.IN-OUT").value),5,5)}#P(k){if(this.#w.droppable&&!this.#w.inTrash)switch(this.#w.classId){case"IN":this.#M(document.querySelector("."+this.#q+" input.IN-OUT").value,this.#w.left,this.#w.top);break;case"OUT":this.#N(document.querySelector("."+this.#q+" input.IN-OUT").value,this.#w.left,this.#w.top);break;default:this.#n(this.#w.classId,this.#w.left,this.#w.top)}uniqueDragAndDropKeyLogicalCircuitUI="",this.#w.classId="",this.#w.droppable=!1}#E(){this.#u.index--,this.#r.setJSON(JSON.parse(this.#u.array[this.#u.index].json)),Object.keys(this.#s).forEach(t=>delete this.#s[t]),Object.assign(this.#s,JSON.parse(this.#u.array[this.#u.index].jsonUI)),this.setJSONUI(),this.#z.setJSONUI(),this.#x.forEach(t=>t()),this.#y.forEach(t=>t())}#F(){this.#u.index++,this.#r.setJSON(JSON.parse(this.#u.array[this.#u.index].json)),Object.keys(this.#s).forEach(t=>delete this.#s[t]),Object.assign(this.#s,JSON.parse(this.#u.array[this.#u.index].jsonUI)),this.setJSONUI(),this.#z.setJSONUI(),this.#x.forEach(t=>t()),this.#y.forEach(t=>t())}#G(){confirm(this.#v.clearMessage)&&(this.#u.index=0,this.#u.array=[{json:"{}",jsonUI:"{}"}],this.#r.clear(),Object.keys(this.#s).forEach(t=>delete this.#s[t]),this.setJSONUI(),this.#z.setJSONUI(),this.#x.forEach(t=>t()),this.#y.forEach(t=>t()))}#M($,L,R){this.#r.addInput($),this.#Q($,L,R),this.#R(),this.setJSONUI(),this.#z.setInteractiveValue($,!1),this.#x.forEach(t=>t()),this.#y.forEach(t=>t())}#N(M,A,_){this.#r.addOutput(M),this.#Q(M,A,_),this.#R(),this.setJSONUI(),this.#z.draw(),this.#x.forEach(t=>t()),this.#y.forEach(t=>t())}#n(K,z,X){var q=this.#r["add"+K]();this.#Q(q,z,X),this.#R(),this.setJSONUI(),this.#z.draw(),this.#x.forEach(t=>t()),this.#y.forEach(t=>t())}#Q(W,H,F){this.#s[W]={top:F||this.#C.top,left:H||this.#C.left}}#J(){if(confirm(this.#v.simplifyMessage)&&this.#r.simplify()){var B=this.#r.getJSON();Object.keys(this.#s).forEach(t=>delete this.#s[t]),Object.keys(B).filter(t=>"IN"===this.#r.getType(t)).forEach((t,s,e)=>this.#z.assignPosition(t,s,e,this.#C.left)),Object.keys(B).filter(t=>"NOT"===this.#r.getType(t)).forEach((t,s,e)=>this.#z.assignPosition(t,s,e,this.#t.width/5)),Object.keys(B).filter(t=>"AND"===this.#r.getType(t)).forEach((t,s,e)=>this.#z.assignPosition(t,s,e,2*this.#t.width/5)),Object.keys(B).filter(t=>"OR"===this.#r.getType(t)).forEach((t,s,e)=>this.#z.assignPosition(t,s,e,3*this.#t.width/5)),Object.keys(B).filter(t=>"OUT"===this.#r.getType(t)).forEach((t,s,e)=>this.#z.assignPosition(t,s,e,4*this.#t.width/5));try{this.#z.draw();var V=[];Object.keys(this.#s).filter(t=>"IN"!==this.#r.getType(t)).forEach(t=>this.#r.getFrom(t).forEach(s=>V.push({from:s,to:t})));var J=this.#B(this.#z.getSymbolSize(),V,this.#t.width,this.#t.height);Object.assign(this.#s,J),this.#z.draw()}catch(Y){}this.#R(),this.resetButtons(),this.#x.forEach(t=>t()),this.#y.forEach(t=>t())}}#K(){if(confirm(this.#v.reorganizeMessage))try{var G=[];Object.keys(this.#s).filter(t=>"IN"!==this.#r.getType(t)).forEach(t=>this.#r.getFrom(t).forEach(s=>G.push({from:s,to:t})));var Z=this.#B(this.#z.getSymbolSize(),G,this.#t.width,this.#t.height);Object.keys(this.#s).forEach(t=>delete this.#s[t]),Object.assign(this.#s,Z),this.#R(),this.resetButtons(),this.#z.draw(),this.#y.forEach(t=>t())}catch(Q){}}#R(){this.#u.array.splice(this.#u.index+1),this.#u.index++,this.#u.array.push({json:JSON.stringify(this.#r.getJSON()),jsonUI:JSON.stringify(this.#s)})}setCanvas(t){this.#z=t}setJSONUI(){this.resetButtons(),this.#S()}resetButtons(){var t=this.#r.isEmpty()||!this.#r.isValid();document.querySelector("."+this.#q+" button.UNDO").disabled=0===this.#u.index,document.querySelector("."+this.#q+" button.REDO").disabled=this.#u.index===this.#u.array.length-1,document.querySelector("."+this.#q+" button.CLEAR").disabled=this.#r.isEmpty(),document.querySelector("."+this.#q+" button.SIMPLIFY").disabled=t,document.querySelector("."+this.#q+" button.REORGANIZE").disabled=t}#S(){document.querySelector("."+this.#q+" input.IN-OUT").value="",document.querySelector("."+this.#q+" button.IN").disabled=!0,document.querySelector("."+this.#q+" button.OUT").disabled=!0}setSimplifierVisible(t){document.querySelector("."+this.#q+" button.SIMPLIFY").style.visibility=t?"visible":"hidden"}setReorganizer(t){this.#B=t,document.querySelector("."+this.#q+" button.REORGANIZE").style.visibility=t?"visible":"hidden"}}class LogicalCircuitCanvas{#q;#r;#s;#t;#u;#v;#w;#x=[];#y=[];#A;#z;#T;#U;#V={selected:!1};#W={};#X={};#Y={};#Z={};#$={};#_={};#aa={};#ab;#ac={font:"48px sans-serif",text:"\uD83D\uDDD1",strokeStyle:"red",left:35,top:20,lineWidth:80,radius1:40,radius2:120,gradients:[{pos:0,color:"rgba(0,0,0,0)"},{pos:.5,color:"rgba(0,0,0,0)"},{pos:1,color:"rgba(0,0,0,0.3)"}]};#ad={gap:20,height:40,ONStyle:"green",OFFStyle:"gray",circleStyle:"white"};#ae={radiusLeft:20,lineWidth:30,oneHeight:20,xorGap:12,notRadius:7,font:"9px sans-serif"};#af={pressed:!1,name:"",index:-1,referenceName:"",event:null,canDoStrokeStyle:"green",cannotDoStrokeStyle:"orange",lineWidth:3,radius:5};#ag={grab:"grab",pointer:"pointer",notAllowed:"not-allowed",grabbing:"grabbing"};#ah={name:"",index:-1,referencePath:"",referenceName:"",lineWidth:3,strokeStyle:"green"};#ai={pressed:!1,name:"",offsetLeft:0,offsetTop:0};#aj={selected:!1,name:"",direction:"",font:"14px sans-serif",up:"-",down:"+",max:6,canDoFillStyle:"white",cannotDoFillStyle:"gray"};constructor(t,s,e,i,o,h,n,r,a,l){this.#q=s,this.#r=e,this.#s=i,this.#t=o,this.#u=h,this.#v=n,this.#w=r,this.#x=a,this.#y=l,this.#z=document.createElement("canvas"),this.#z.classList.add("LogicalCircuitUI_Canvas"),this.#z.width=this.#t.width,this.#z.height=this.#t.height,this.#z.onmousemove=t=>this.#ak(t),this.#z.onmousedown=t=>this.#al(t),this.#z.onmouseup=t=>this.#am(t),this.#z.ondragenter=t=>this.#an(t),this.#z.ondragover=t=>this.#ao(t),this.#z.ondragleave=t=>this.#ap(t),t.append(this.#z),this.#U=this.#z.getContext("2d"),this.#U.font=this.#t.font,this.#U.textBaseline="middle",this.#U.lineWidth=this.#t.lineWidth,this.#U.lineJoin="round",this.draw(),this.#T=document.createElement("canvas"),this.#T.classList.add("LogicalCircuitUI_CanvasDnD"),t.append(this.#T)}setToolbar(t){this.#A=t}setJSONUI(){this.setInteractive(this.#t.interactive)}setBezierConnector(t){this.#t.bezierConnector=t,this.draw()}setShowOperatorType(t){this.#t.showOperatorType=t,this.draw()}setInteractive(t){this.#t.interactive=!!t,this.#V.selected=!1,this.#W={},t&&Object.keys(this.#s).filter(t=>"IN"===this.#r.getType(t)).forEach(t=>this.#W[t]=!1),this.draw()}setInteractiveValue(t,s){this.#t.interactive&&(this.#W[t]=s),this.draw()}getSymbolSize(){return Object.keys(this.#_).filter(t=>!this.#s[t]).forEach(t=>delete this.#_[t]),JSON.parse(JSON.stringify(this.#_))}assignPosition(t,s,e,i){this.#s[t]={top:(s+1)*this.#z.height/(e.length+1)-this.#ad.height,left:i}}draw(){this.#z.style.cursor=this.#t.cursor,this.#U.clearRect(0,0,this.#z.width,this.#z.height),this.#aq(),Object.keys(this.#s).forEach(t=>{var s=this.#r.getType(t);switch(s){case"IN":this.#ar(t,"exit");break;case"OUT":this.#ar(t,"0");break;default:this.#as(t,s)}}),Object.keys(this.#s).forEach(t=>{"IN"===this.#r.getType(t)||this.#r.getFrom(t).forEach((s,e)=>this.#at(s,t,e))}),this.#au(),this.#av()}#aq(){this.#U.font=this.#ac.font,this.#U.fillText(this.#ac.text,this.#z.width-this.#ac.left,this.#z.height-this.#ac.top),this.#U.font=this.#t.font;var t=this.#U.createRadialGradient(this.#z.width,this.#z.height,this.#ac.radius1,this.#z.width,this.#z.height,this.#ac.radius2);this.#ac.gradients.forEach(s=>t.addColorStop(s.pos,s.color)),this.#U.lineWidth=this.#ac.lineWidth,this.#U.strokeStyle=t,this.#U.beginPath(),this.#U.arc(this.#z.width,this.#z.height,this.#ac.lineWidth,0,2*Math.PI),this.#U.stroke(),this.#U.lineWidth=this.#t.lineWidth,this.#U.strokeStyle=this.#t.strokeStyle}#ar(s,e){var i=this.#U.measureText(s).width+this.#ad.gap+(this.#t.interactive?this.#ad.gap:0),o=this.#s[s].top+this.#ad.height/2;if(this.#Z[s+"*"+e]={left:this.#s[s].left+("exit"===e?i+this.#af.radius:-this.#af.radius),top:o},this.#aw(s+"*"+e),this.#_[s]={width:i,height:this.#ad.height},this.#$[s]=new Path2D,this.#$[s].rect(this.#s[s].left,this.#s[s].top,i,this.#ad.height),this.#U.stroke(this.#$[s]),this.#t.interactive){h="exit"===e?this.#W[s]?this.#ad.ONStyle:this.#ad.OFFStyle:this.#r.isValid()?this.#r.computeExpression(s,this.#W)?this.#ad.ONStyle:this.#ad.OFFStyle:this.#ad.circleStyle;var h,n=this.#ad.gap/2-2,r=h===this.#ad.ONStyle?this.#s[s].top+2+n+2:this.#s[s].top+this.#ad.height-2-n-2,a=new Path2D;a.roundRect(this.#s[s].left+i-this.#ad.gap-2,this.#s[s].top+2,this.#ad.gap,this.#ad.height-4,this.#ad.gap/2),"exit"===e&&(this.#X[s]=a),this.#U.fillStyle=h,this.#U.fill(a),this.#U.fillStyle=this.#ad.circleStyle,this.#U.beginPath(),this.#U.arc(this.#s[s].left+i-this.#ad.gap/2-2,r,n,0,2*Math.PI),this.#U.fill(),this.#U.fillStyle=this.#t.fillStyle}this.#U.fillText(s,this.#s[s].left+this.#ad.gap/2,this.#Z[s+"*"+e].top)}#as(l,c){this.#$[l]=new Path2D;var d=this.#r.getFrom(l),u=this.#ae.oneHeight*d.length/2,f=this.#s[l].left+this.#ae.lineWidth+("NOT"===c?this.#ae.radiusLeft:0),p=this.#s[l].top+this.#ae.oneHeight*("NOT"===c?2:d.length),g=this.#s[l].top+("NOT"===c?this.#ae.oneHeight:u);this.#ax(l,c,f,g),this.#ay(l,c,d,g,u),this.#az(l,c,d,f,g),this.#aA(l,c,f,p,g,u),this.#aB(l,c)}#ax(m,y,b,I){switch(y){case"OR":case"AND":case"XOR":this.#Z[m+"*exit"]={left:b+this.#ae.radiusLeft+this.#af.radius,top:I};break;case"NOR":case"NAND":case"NXOR":this.#Z[m+"*exit"]={left:b+this.#ae.radiusLeft+2*this.#ae.notRadius+this.#af.radius,top:I};break;case"NOT":this.#Z[m+"*exit"]={left:b+2*this.#ae.notRadius+this.#af.radius,top:I}}this.#aw(m+"*exit")}#ay(v,N,x,T,O){for(var U=Math.PI/(x.length+1),C=0;C<x.length;C++){switch(N){case"OR":case"NOR":var S=U*(C+1)-Math.PI/2;this.#Z[v+"*"+C]={left:this.#s[v].left+(this.#ae.radiusLeft-this.#af.radius)*Math.cos(S),top:T+(O-this.#af.radius)*Math.sin(S)};break;case"AND":case"NAND":this.#Z[v+"*"+C]={left:this.#s[v].left-this.#af.radius,top:this.#s[v].top+this.#ae.oneHeight/2+this.#ae.oneHeight*C};break;case"XOR":case"NXOR":var S=U*(C+1)-Math.PI/2;this.#Z[v+"*"+C]={left:this.#s[v].left+(this.#ae.radiusLeft-this.#af.radius)*Math.cos(S)-this.#ae.xorGap,top:T+(O-this.#af.radius)*Math.sin(S)};break;case"NOT":this.#Z[v+"*"+C]={left:this.#s[v].left-this.#af.radius,top:T}}this.#aw(v+"*"+C)}}#az(w,P,j,D,E){switch(P){case"OR":case"AND":case"XOR":this.#_[w]={width:this.#ae.lineWidth+this.#ae.radiusLeft,height:this.#ae.oneHeight*j.length};break;case"NOR":case"NAND":case"NXOR":var k=new Path2D;k.arc(D+this.#ae.radiusLeft+this.#ae.notRadius,E,this.#ae.notRadius,0,2*Math.PI),this.#$[w].addPath(k),this.#_[w]={width:this.#ae.lineWidth+this.#ae.radiusLeft+2*this.#ae.notRadius,height:this.#ae.oneHeight*j.length};break;case"NOT":var k=new Path2D;k.arc(D+this.#ae.notRadius,E,this.#ae.notRadius,0,2*Math.PI),this.#$[w].addPath(k),this.#_[w]={width:this.#ae.lineWidth+this.#ae.radiusLeft+2*this.#ae.notRadius,height:2*this.#ae.oneHeight}}}#aA($,L,R,M,A,_){switch("NOT"!==L&&(this.#$[$].moveTo(R,M),this.#$[$].lineTo(this.#s[$].left,M)),L){case"OR":case"NOR":this.#$[$].ellipse(this.#s[$].left,A,this.#ae.radiusLeft,_,0,Math.PI/2,-Math.PI/2,!0),this.#$[$].lineTo(R,this.#s[$].top),this.#$[$].quadraticCurveTo(R+3*this.#ae.radiusLeft/5,this.#s[$].top,R+this.#ae.radiusLeft,A),this.#$[$].quadraticCurveTo(R+3*this.#ae.radiusLeft/5,M,R,M);break;case"AND":case"NAND":this.#$[$].lineTo(this.#s[$].left,this.#s[$].top),this.#$[$].lineTo(R,this.#s[$].top),this.#$[$].ellipse(R,A,this.#ae.radiusLeft,_,0,-Math.PI/2,Math.PI/2);break;case"XOR":case"NXOR":this.#$[$].ellipse(this.#s[$].left,A,this.#ae.radiusLeft,_,0,Math.PI/2,-Math.PI/2,!0),this.#$[$].lineTo(R,this.#s[$].top),this.#$[$].ellipse(R,A,this.#ae.radiusLeft,_,0,-Math.PI/2,Math.PI/2);var K=new Path2D;K.ellipse(this.#s[$].left-this.#ae.xorGap,A,this.#ae.radiusLeft,_,0,Math.PI/2,-Math.PI/2,!0),this.#$[$].addPath(K);break;case"NOT":this.#$[$].moveTo(this.#s[$].left,this.#s[$].top),this.#$[$].lineTo(R,A),this.#$[$].lineTo(this.#s[$].left,M),this.#$[$].closePath()}this.#U.stroke(this.#$[$])}#aB(z,X){if(this.#t.showOperatorType){var q;switch(this.#U.font=this.#ae.font,X){case"OR":case"XOR":q=this.#ae.radiusLeft+(this.#_[z].width-this.#ae.radiusLeft-this.#U.measureText(X).width)/2;break;case"AND":q=(this.#_[z].width-this.#U.measureText(X).width)/2;break;case"NOR":case"NXOR":q=this.#ae.radiusLeft+(this.#_[z].width-this.#ae.radiusLeft-this.#U.measureText(X).width)/2-this.#ae.notRadius;break;case"NAND":q=(this.#_[z].width-this.#U.measureText(X).width)/2-this.#ae.notRadius;break;case"NOT":q=(this.#_[z].width-this.#U.measureText(X).width)/4}this.#U.fillText(X,this.#s[z].left+q,this.#s[z].top+this.#_[z].height/2),this.#U.font=this.#t.font}}#aw(W){this.#Y[W]=new Path2D,this.#Y[W].moveTo(this.#Z[W].left,this.#Z[W].top-this.#af.radius),this.#Y[W].lineTo(this.#Z[W].left+this.#af.radius,this.#Z[W].top),this.#Y[W].lineTo(this.#Z[W].left,this.#Z[W].top+this.#af.radius),this.#Y[W].lineTo(this.#Z[W].left-this.#af.radius,this.#Z[W].top),this.#Y[W].closePath(),this.#U.stroke(this.#Y[W])}#at(H,F,B){if(H){if(this.#aa[F+"*"+B]=new Path2D,this.#aa[F+"*"+B].moveTo(this.#Z[H+"*exit"].left,this.#Z[H+"*exit"].top),this.#t.bezierConnector){var V={left:this.#Z[H+"*exit"].left+(this.#Z[F+"*"+B].left-this.#Z[H+"*exit"].left)/2,top:this.#Z[H+"*exit"].top},J={left:V.left,top:this.#Z[F+"*"+B].top};this.#aa[F+"*"+B].bezierCurveTo(V.left,V.top,J.left,J.top,this.#Z[F+"*"+B].left,this.#Z[F+"*"+B].top)}else this.#aa[F+"*"+B].lineTo(this.#Z[F+"*"+B].left,this.#Z[F+"*"+B].top);this.#U.stroke(this.#aa[F+"*"+B])}}#au(){if(this.#ah.name){var Y=this.#r.getType(this.#ah.name);"symbolPath"!==this.#ah.referencePath||(this.#t.interactive&&"IN"===Y?(this.#V.selected=this.#U.isPointInPath(this.#X[this.#ah.name],this.#ab.offsetX,this.#ab.offsetY),this.#z.style.cursor=this.#V.selected?this.#ag.pointer:this.#ag.grab):["IN","OUT","NOT"].includes(Y)?this.#z.style.cursor=this.#ag.grab:this.#aC()),this.#aD()}}#aC(){var G=this.#s[this.#ah.name].left+3*this.#_[this.#ah.name].width/5;switch(this.#r.getType(this.#ah.name)){case"OR":case"AND":case"XOR":break;case"NOR":case"NAND":case"NXOR":G-=this.#ae.notRadius}var Z=this.#r.getFrom(this.#ah.name).length,Q=this.#s[this.#ah.name].top+this.#_[this.#ah.name].height/4,tt=this.#s[this.#ah.name].top+3*this.#_[this.#ah.name].height/4;this.#U.font=this.#aj.font;var ts=this.#U.measureText(this.#aj.up).width,te=this.#U.measureText(this.#aj.down).width,ti=Math.max(ts,te),to=new Path2D,th=new Path2D;this.#U.fillStyle=Z>2?this.#aj.canDoFillStyle:this.#aj.cannotDoFillStyle,th.rect(G-2,this.#s[this.#ah.name].top+3,ti+4,this.#_[this.#ah.name].height/2-3),to.addPath(th),this.#U.fill(th),this.#U.stroke(th),th=new Path2D,this.#U.fillStyle=Z<this.#aj.max?this.#aj.canDoFillStyle:this.#aj.cannotDoFillStyle,th.rect(G-2,this.#s[this.#ah.name].top+this.#_[this.#ah.name].height/2,ti+4,this.#_[this.#ah.name].height/2-3),to.addPath(th),this.#U.fill(th),this.#U.stroke(th),this.#U.fillStyle=this.#t.fillStyle,this.#U.fillText(this.#aj.up,G+(ti-ts)/2,Q),this.#U.fillText(this.#aj.down,G+(ti-te)/2,tt),this.#U.font=this.#t.font,this.#aj.selected=this.#U.isPointInPath(to,this.#ab.offsetX,this.#ab.offsetY),this.#aj.name=this.#ah.name,this.#aj.direction=this.#ab.offsetY<this.#s[this.#ah.name].top+this.#_[this.#ah.name].height/2?"UP":"DOWN",this.#aj.selected?"UP"===this.#aj.direction&&Z>2?this.#z.style.cursor=this.#ag.pointer:"DOWN"===this.#aj.direction&&Z<this.#aj.max?this.#z.style.cursor=this.#ag.pointer:this.#z.style.cursor=this.#ag.notAllowed:this.#z.style.cursor=this.#ag.grab}#aD(){this.#U.lineWidth=this.#ah.lineWidth,this.#ai.pressed?(this.#z.style.cursor=this.#ag.grabbing,this.#U.strokeStyle=this.#aE(this.#z.width,this.#z.height,this.#ac.lineWidth,this.#s[this.#ah.name].left,this.#s[this.#ah.name].top,this.#_[this.#ah.name].width,this.#_[this.#ah.name].height)?this.#ac.strokeStyle:this.#ah.strokeStyle):this.#U.strokeStyle="connectorPath"===this.#ah.referencePath?this.#ac.strokeStyle:this.#ah.strokeStyle,this.#U.stroke(this.#aF(this.#ah.referencePath,this.#ah.referenceName)),this.#U.lineWidth=this.#t.lineWidth,this.#U.strokeStyle=this.#t.strokeStyle}#aE(tn,tr,ta,tl,tc,td,tu){var tf=tn,tp=tr;tn<tl?tf=tl:tn>tl+td&&(tf=tl+td),tr<tc?tp=tc:tr>tc+tu&&(tp=tc+tu);var tg=tn-tf,tm=tr-tp;return Math.sqrt(tg*tg+tm*tm)<=ta}#aF(ty,tb){switch(ty){case"symbolPath":return this.#$[tb];case"knobPath":return this.#Y[tb];case"connectorPath":return this.#aa[tb]}}#av(){if(this.#af.pressed){if(this.#U.beginPath(),this.#U.moveTo(this.#af.event.offsetX,this.#af.event.offsetY),this.#t.bezierConnector){var tI={left:this.#af.event.offsetX+(this.#ab.offsetX-this.#af.event.offsetX)/2,top:this.#af.event.offsetY},tv={left:tI.left,top:this.#ab.offsetY};this.#U.bezierCurveTo(tI.left,tI.top,tv.left,tv.top,this.#ab.offsetX,this.#ab.offsetY)}else this.#U.lineTo(this.#ab.offsetX,this.#ab.offsetY);this.#U.stroke(),this.#af.name&&(this.#U.lineWidth=this.#af.lineWidth,this.#U.strokeStyle=this.#aG(this.#ah.name,this.#ah.index,this.#af.name,this.#af.index)?this.#af.canDoStrokeStyle:this.#af.cannotDoStrokeStyle,this.#U.stroke(this.#Y[this.#af.referenceName]),this.#U.lineWidth=this.#t.lineWidth,this.#U.strokeStyle=this.#t.strokeStyle)}}#ak(tN){this.#ab=tN;var tx=Math.sqrt(Math.pow(tN.offsetX-this.#z.width,2)+Math.pow(tN.offsetY-this.#z.height,2));this.#z.setAttribute("title",tx<this.#ac.radius2?this.#v.trashTooltip:""),this.#ai.pressed?(this.#s[this.#ah.name].top=tN.offsetY-this.#ai.offsetTop,this.#s[this.#ah.name].left=tN.offsetX-this.#ai.offsetLeft):this.#af.pressed?this.#aH(tN):this.#aI(tN),this.draw()}#aH(tT){this.#af.name="",Object.keys(this.#s).forEach(t=>{switch(this.#r.getType(t)){case"IN":!this.#af.name&&this.#U.isPointInPath(this.#Y[t+"*exit"],tT.offsetX,tT.offsetY)&&(this.#af.name=t,this.#af.index=-1,this.#af.referenceName=t+"*exit");break;case"OUT":this.#r.getFrom(t).forEach((s,e)=>{!this.#af.name&&this.#U.isPointInPath(this.#Y[t+"*"+e],tT.offsetX,tT.offsetY)&&(this.#af.name=t,this.#af.index=e,this.#af.referenceName=t+"*"+e)});break;default:!this.#af.name&&this.#U.isPointInPath(this.#Y[t+"*exit"],tT.offsetX,tT.offsetY)&&(this.#af.name=t,this.#af.index=-1,this.#af.referenceName=t+"*exit"),this.#r.getFrom(t).forEach((s,e)=>{!this.#af.name&&this.#U.isPointInPath(this.#Y[t+"*"+e],tT.offsetX,tT.offsetY)&&(this.#af.name=t,this.#af.index=e,this.#af.referenceName=t+"*"+e)})}})}#aI(tO){this.#ah.name="",Object.keys(this.#s).forEach(t=>{switch(this.#r.getType(t)){case"IN":!this.#ah.name&&this.#U.isPointInPath(this.#Y[t+"*exit"],tO.offsetX,tO.offsetY)&&(this.#ah.name=t,this.#ah.index=-1,this.#ah.referencePath="knobPath",this.#ah.referenceName=t+"*exit");break;case"OUT":!this.#ah.name&&this.#U.isPointInPath(this.#Y[t+"*0"],tO.offsetX,tO.offsetY)&&(this.#ah.name=t,this.#ah.index=0,this.#ah.referencePath="knobPath",this.#ah.referenceName=t+"*0"),!this.#ah.name&&this.#r.getFrom(t)[0]&&this.#U.isPointInStroke(this.#aa[t+"*0"],tO.offsetX,tO.offsetY)&&(this.#ah.name=t,this.#ah.index=0,this.#ah.referencePath="connectorPath",this.#ah.referenceName=t+"*0");break;default:!this.#ah.name&&this.#U.isPointInPath(this.#Y[t+"*exit"],tO.offsetX,tO.offsetY)&&(this.#ah.name=t,this.#ah.index=-1,this.#ah.referencePath="knobPath",this.#ah.referenceName=t+"*exit"),this.#r.getFrom(t).forEach((s,e)=>{!this.#ah.name&&this.#U.isPointInPath(this.#Y[t+"*"+e],tO.offsetX,tO.offsetY)&&(this.#ah.name=t,this.#ah.index=e,this.#ah.referencePath="knobPath",this.#ah.referenceName=t+"*"+e),!this.#ah.name&&s&&this.#U.isPointInStroke(this.#aa[t+"*"+e],tO.offsetX,tO.offsetY)&&(this.#ah.name=t,this.#ah.index=e,this.#ah.referencePath="connectorPath",this.#ah.referenceName=t+"*"+e)})}!this.#ah.name&&this.#U.isPointInPath(this.#$[t],tO.offsetX,tO.offsetY)&&(this.#ah.name=t,this.#ah.referencePath="symbolPath",this.#ah.referenceName=t)})}#al(tU){if(this.#ah.name)switch(this.#ah.referencePath){case"knobPath":this.#af.pressed=!0,this.#af.event=tU;break;case"symbolPath":if(this.#aj.selected){var tC=!1,tS=this.#r.getFrom(this.#aj.name).length;switch(this.#aj.direction){case"UP":tS>2&&(tC=!0,this.#r.decConnector(this.#aj.name),this.#s[this.#aj.name].top+=this.#ae.oneHeight/2);break;case"DOWN":tS<this.#aj.max&&(tC=!0,this.#r.incConnector(this.#aj.name),this.#s[this.#aj.name].top-=this.#ae.oneHeight/2)}tC&&(this.#R(),this.#A.resetButtons(),this.draw(),this.#x.forEach(t=>t()),this.#y.forEach(t=>t()))}else this.#V.selected?(this.#W[this.#ah.name]=!this.#W[this.#ah.name],this.draw()):(this.#ai.pressed=!0,this.#ai.offsetLeft=tU.offsetX-this.#s[this.#ah.name].left,this.#ai.offsetTop=tU.offsetY-this.#s[this.#ah.name].top,this.#z.style.cursor=this.#ag.grabbing);break;case"connectorPath":this.#r.removeConnection(this.#ah.name,this.#ah.index),this.#ah.name="",this.#R(),this.#A.resetButtons(),this.draw(),this.#x.forEach(t=>t()),this.#y.forEach(t=>t())}}#am(tw){if(this.#ah.name&&this.#ai.pressed){var tP=!1;this.#aE(this.#z.width,this.#z.height,this.#ac.lineWidth,this.#s[this.#ah.name].left,this.#s[this.#ah.name].top,this.#_[this.#ah.name].width,this.#_[this.#ah.name].height)&&(tP=!0,this.#r.remove(this.#ah.name),delete this.#s[this.#ah.name],this.#ah.name=""),this.#R(),this.#A.resetButtons(),this.draw(),tP&&this.#x.forEach(t=>t()),this.#y.forEach(t=>t())}else if(this.#af.pressed&&this.#af.name&&this.#aG(this.#ah.name,this.#ah.index,this.#af.name,this.#af.index)){var tj=this.#r.getType(this.#ah.name),tD=this.#r.getType(this.#af.name);"IN"===tj?this.#r.addConnection(this.#ah.name,this.#af.name,this.#af.index):"IN"===tD?this.#r.addConnection(this.#af.name,this.#ah.name,this.#ah.index):"OUT"===tj?this.#r.addConnection(this.#af.name,this.#ah.name,0):"OUT"===tD?this.#r.addConnection(this.#ah.name,this.#af.name,0):-1===this.#ah.index?this.#r.addConnection(this.#ah.name,this.#af.name,this.#af.index):-1===this.#af.index&&this.#r.addConnection(this.#af.name,this.#ah.name,this.#ah.index),this.#R(),this.#A.resetButtons(),this.draw(),this.#x.forEach(t=>t()),this.#y.forEach(t=>t())}this.#af.pressed=!1,this.#ai.pressed=!1,this.#aj.selected=!1}#R(){this.#u.array.splice(this.#u.index+1),this.#u.index++,this.#u.array.push({json:JSON.stringify(this.#r.getJSON()),jsonUI:JSON.stringify(this.#s)})}#aG(tE,tk,t$,tL){var tR=this.#r.getType(tE),tM=this.#r.getType(t$);if("IN"===tR&&"IN"===tM)return!1;if("IN"===tR&&"OUT"===tM)return this.#r.isConnectionValid(tE,t$);if("IN"===tR)return -1!==tL&&this.#r.isConnectionValid(tE,t$);if("OUT"===tR&&"IN"===tM)return this.#r.isConnectionValid(t$,tE);if("OUT"===tR&&"OUT"===tM)return!1;else if("OUT"===tR)return -1===tL&&this.#r.isConnectionValid(t$,tE);else if("IN"===tM)return -1!==tk&&this.#r.isConnectionValid(t$,tE);else if("OUT"===tM)return -1===tk&&this.#r.isConnectionValid(tE,t$);else if(-1===tk&&-1===tL)return!1;else if(-1!==tk&&-1!==tL)return!1;else if(-1===tk)return this.#r.isConnectionValid(tE,t$);else if(-1===tL)return this.#r.isConnectionValid(t$,tE);else return!1}#an(tA){this.#aJ(tA)}#ao(t0){this.#aJ(t0)}#aJ(t_){t_.preventDefault();var tK=Math.sqrt(Math.pow(t_.offsetX-this.#z.width,2)+Math.pow(t_.offsetY-this.#z.height,2));this.#w.droppable=uniqueDragAndDropKeyLogicalCircuitUI===this.#q,this.#w.inTrash=tK<this.#ac.radius2,this.#w.left=t_.offsetX,this.#w.top=t_.offsetY,t_.dataTransfer.dropEffect=this.#w.droppable&&!this.#w.inTrash?"move":"none"}#ap(tz){tz.preventDefault(),this.#w.droppable=!1}getCanvasForDnD(t,s){var e,i=new Path2D,o=this.#T.getContext("2d");switch(t){case"IN":case"OUT":e={width:this.#U.measureText(s).width+this.#ad.gap+(this.#t.interactive?this.#ad.gap:0),height:this.#ad.height},i.rect(0,0,e.width,this.#ad.height),this.#T.width=e.width+10,this.#T.height=e.height+10,o.clearRect(0,0,this.#T.width,this.#T.height),o.translate(5,5),o.lineWidth=this.#t.lineWidth,o.lineJoin="round",o.stroke(i),o.font=this.#t.font,o.textBaseline="middle",o.fillText(s,this.#ad.gap/2,this.#ad.height/2);break;default:var h=this.#ae.lineWidth+("NOT"===t?this.#ae.radiusLeft:0);switch(e={height:2*this.#ae.oneHeight},t){case"OR":case"AND":case"XOR":e.width=this.#ae.lineWidth+this.#ae.radiusLeft;break;case"NOR":case"NAND":case"NXOR":var n=new Path2D;n.arc(h+this.#ae.radiusLeft+this.#ae.notRadius,this.#ae.oneHeight,this.#ae.notRadius,0,2*Math.PI),i.addPath(n),e.width=this.#ae.lineWidth+this.#ae.radiusLeft+2*this.#ae.notRadius;break;case"NOT":var n=new Path2D;n.arc(h+this.#ae.notRadius,this.#ae.oneHeight,this.#ae.notRadius,0,2*Math.PI),i.addPath(n),e.width=this.#ae.lineWidth+this.#ae.radiusLeft+2*this.#ae.notRadius}switch("NOT"!==t&&(i.moveTo(h,e.height),i.lineTo(0,e.height)),t){case"OR":case"NOR":i.ellipse(0,this.#ae.oneHeight,this.#ae.radiusLeft,this.#ae.oneHeight,0,Math.PI/2,-Math.PI/2,!0),i.lineTo(h,0),i.quadraticCurveTo(h+3*this.#ae.radiusLeft/5,0,h+this.#ae.radiusLeft,this.#ae.oneHeight),i.quadraticCurveTo(h+3*this.#ae.radiusLeft/5,e.height,h,e.height);break;case"AND":case"NAND":i.lineTo(0,0),i.lineTo(h,0),i.ellipse(h,this.#ae.oneHeight,this.#ae.radiusLeft,this.#ae.oneHeight,0,-Math.PI/2,Math.PI/2);break;case"XOR":case"NXOR":i.ellipse(0,this.#ae.oneHeight,this.#ae.radiusLeft,this.#ae.oneHeight,0,Math.PI/2,-Math.PI/2,!0),i.lineTo(h,0),i.ellipse(h,this.#ae.oneHeight,this.#ae.radiusLeft,this.#ae.oneHeight,0,-Math.PI/2,Math.PI/2);var r=new Path2D;r.ellipse(0-this.#ae.xorGap,this.#ae.oneHeight,this.#ae.radiusLeft,this.#ae.oneHeight,0,Math.PI/2,-Math.PI/2,!0),i.addPath(r);break;case"NOT":i.moveTo(0,0),i.lineTo(h,this.#ae.oneHeight),i.lineTo(0,e.height),i.closePath()}this.#T.width=e.width+10,this.#T.height=e.height+10,o.clearRect(0,0,this.#T.width,this.#T.height),o.lineWidth=this.#t.lineWidth,o.lineJoin="round",o.translate(5,5),o.stroke(i)}return this.#T}}