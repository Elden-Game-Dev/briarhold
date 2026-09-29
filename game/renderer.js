/* Small native WebGL2 renderer. Shapes are built once, batched into meshes,
   lit by a sun and sky, and rendered with a real depth-map shadow pass. */
"use strict";
const R3=(()=>{
  const I=()=>new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);
  function mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)o[c*4+r]+=a[k*4+r]*b[c*4+k];return o;}
  function transform(x=0,y=0,z=0,ry=0,s=1){const c=Math.cos(ry)*s,n=Math.sin(ry)*s;return new Float32Array([c,0,-n,0,0,s,0,0,n,0,c,0,x,y,z,1]);}
  function norm(a){const d=Math.hypot(...a)||1;return a.map(v=>v/d);}
  const sub=(a,b)=>a.map((v,i)=>v-b[i]);
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
  function lookAt(eye,target){const z=norm(sub(eye,target)),x=norm(cross([0,1,0],z)),y=cross(z,x);return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-dot(x,eye),-dot(y,eye),-dot(z,eye),1]);}
  function ortho(l,r,b,t,n,f){return new Float32Array([2/(r-l),0,0,0,0,2/(t-b),0,0,0,0,-2/(f-n),0,-(r+l)/(r-l),-(t+b)/(t-b),-(f+n)/(f-n),1]);}
  function color(hex){if(Array.isArray(hex))return hex;const n=parseInt(hex.replace('#',''),16);return [(n>>16)&255,(n>>8)&255,n&255].map(v=>Math.pow(v/255,2.2));}
  class Builder{
    constructor(){this.v=[];}
    tri(a,b,c,col,kind=0){const n=norm(cross(sub(b,a),sub(c,a))),co=color(col);for(const p of [a,b,c])this.v.push(...p,...n,...co,kind);}
    quad(a,b,c,d,col,kind=0){this.tri(a,b,c,col,kind);this.tri(a,c,d,col,kind);}
    box(x,y,z,w,h,d,col,ry=0){const c=Math.cos(ry),s=Math.sin(ry),p=[];for(const [a,b,e] of [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]){const u=a*w/2,v=e*d/2;p.push([x+u*c+v*s,y+b*h/2,z-u*s+v*c]);}for(const f of [[0,3,2,1],[4,5,6,7],[0,4,7,3],[1,2,6,5],[3,7,6,2],[0,1,5,4]])this.quad(...f.map(i=>p[i]),col);return this;}
    cylinder(x,y,z,r,h,col,sides=12,top=r){for(let i=0;i<sides;i++){const a=i/sides*Math.PI*2,b=(i+1)/sides*Math.PI*2;const p=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],q=[x+Math.cos(b)*r,y,z+Math.sin(b)*r],u=[x+Math.cos(a)*top,y+h,z+Math.sin(a)*top],v=[x+Math.cos(b)*top,y+h,z+Math.sin(b)*top];this.quad(p,u,v,q,col);this.tri([x,y+h,z],v,u,col);this.tri([x,y,z],p,q,col);}return this;}
    sphere(x,y,z,r,col,sides=10,rings=5,stretch=[1,1,1],kind=0){for(let j=0;j<rings;j++)for(let i=0;i<sides;i++){const p=(u,v)=>{const a=u/sides*Math.PI*2,b=v/rings*Math.PI;return [x+Math.sin(b)*Math.cos(a)*r*stretch[0],y+Math.cos(b)*r*stretch[1],z+Math.sin(b)*Math.sin(a)*r*stretch[2]];};this.quad(p(i,j),p(i+1,j),p(i+1,j+1),p(i,j+1),col,kind);}return this;}
    arch(x,y,z,w,h,t,d,col){const r=w/2,base=h-r;this.box(x-r-t/2,y+base/2,z,t,base,d,col);this.box(x+r+t/2,y+base/2,z,t,base,d,col);for(let i=0;i<14;i++){const a=i/14*Math.PI,b=(i+1)/14*Math.PI;const p=(ang,rad,depth)=>[x+Math.cos(ang)*rad,y+base+Math.sin(ang)*rad,z+depth];const A=p(a,r,-d/2),B=p(b,r,-d/2),C=p(b,r+t,-d/2),D=p(a,r+t,-d/2),E=p(a,r,d/2),F=p(b,r,d/2),G=p(b,r+t,d/2),H=p(a,r+t,d/2);this.quad(A,B,C,D,col);this.quad(H,G,F,E,col);this.quad(A,E,F,B,col);this.quad(D,C,G,H,col);}return this;}
    ring(x,y,z,inner,outer,col,start=0,end=Math.PI*2,kind=2){for(let i=0;i<48;i++){const a=start+(end-start)*i/48,b=start+(end-start)*(i+1)/48;this.quad([x+Math.cos(a)*inner,y,z+Math.sin(a)*inner],[x+Math.cos(a)*outer,y,z+Math.sin(a)*outer],[x+Math.cos(b)*outer,y,z+Math.sin(b)*outer],[x+Math.cos(b)*inner,y,z+Math.sin(b)*inner],col,kind);}return this;}
  }
  const vs=`#version 300 es
  precision highp float;layout(location=0)in vec3 aPos;layout(location=1)in vec3 aNormal;layout(location=2)in vec3 aColor;layout(location=3)in float aKind;
  uniform mat4 uVP,uModel,uLight;uniform float uTime;out vec3 vNormal,vColor,vWorld;out vec4 vShadow;out float vKind;
  void main(){vec3 p=aPos;if(aKind>0.5&&aKind<1.5)p.y+=sin(p.x*1.3+uTime)*cos(p.z*.8+uTime*.7)*.06;if(aKind>2.5){p.x+=sin(uTime*1.2+p.z*.4)*.08;p.z+=cos(uTime*.8+p.x*.3)*.045;}vec4 world=uModel*vec4(p,1.);vWorld=world.xyz;vNormal=normalize(mat3(uModel)*aNormal);vColor=aColor;vShadow=uLight*world;vKind=aKind;gl_Position=uVP*world;}`;
  const fs=`#version 300 es
  precision highp float;in vec3 vNormal,vColor,vWorld;in vec4 vShadow;in float vKind;uniform sampler2D uShadow;uniform vec3 uEye;uniform float uTime,uAlpha,uFlash;out vec4 frag;
  void main(){vec3 n=normalize(vNormal);if(!gl_FrontFacing)n=-n;vec3 sun=normalize(vec3(-.45,.85,.4));float diffuse=max(dot(n,sun),0.);vec3 sp=vShadow.xyz/vShadow.w*.5+.5;float shade=0.;float bias=max(.0005,.0015*(1.-diffuse));if(sp.x>0.&&sp.x<1.&&sp.y>0.&&sp.y<1.&&sp.z<1.){for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++)shade+=sp.z-bias>texture(uShadow,sp.xy+vec2(x,y)/2048.).r?.075:0.;}
  vec3 ambient=mix(vec3(.31,.35,.37),vec3(.62,.70,.69),n.y*.5+.5);vec3 col=vColor*(ambient+vec3(1.05,.92,.69)*diffuse*(1.-shade));
  if(vKind>.5&&vKind<1.5){float ripple=sin(vWorld.x*2.3+uTime*1.7+sin(vWorld.z*2.))+sin(vWorld.z*3.-uTime*1.3);col+=vec3(.025,.09,.09)*max(0.,ripple);vec3 halfV=normalize(sun+normalize(uEye-vWorld));col+=vec3(.8,.75,.55)*pow(max(dot(n,halfV),0.),80.)*.55;}
  if(vKind>1.5&&vKind<2.5)col=vColor*1.6;col=mix(col,vec3(1.,.9,.65),uFlash);float fog=smoothstep(70.,165.,length(uEye-vWorld));col=mix(col,vec3(.47,.61,.61),fog*.7);col=col/(col+vec3(.78));frag=vec4(pow(col,vec3(1./2.2)),uAlpha);}`;
  const depthVS=`#version 300 es
  layout(location=0)in vec3 aPos;uniform mat4 uVP,uModel;void main(){gl_Position=uVP*uModel*vec4(aPos,1.);}`;
  const depthFS=`#version 300 es
  precision highp float;void main(){}`;
  class Renderer{
    constructor(canvas){this.canvas=canvas;const gl=this.gl=canvas.getContext('webgl2',{antialias:true,alpha:false,preserveDrawingBuffer:true});if(!gl)throw new Error('This browser needs WebGL 2 to explore Briarhold. Please open this file in a current Chrome, Edge, or Firefox browser.');
      const program=(v,f)=>{const p=gl.createProgram();for(const [type,source] of [[gl.VERTEX_SHADER,v],[gl.FRAGMENT_SHADER,f]]){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));gl.attachShader(p,s);}gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));return p;};
      this.main=program(vs,fs);this.depth=program(depthVS,depthFS);this.locations=new Map();
      this.shadow=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,this.shadow);gl.texImage2D(gl.TEXTURE_2D,0,gl.DEPTH_COMPONENT24,2048,2048,0,gl.DEPTH_COMPONENT,gl.UNSIGNED_INT,null);for(const p of [gl.TEXTURE_MIN_FILTER,gl.TEXTURE_MAG_FILTER])gl.texParameteri(gl.TEXTURE_2D,p,gl.NEAREST);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      this.fbo=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbo);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,this.shadow,0);gl.drawBuffers([gl.NONE]);gl.readBuffer(gl.NONE);if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('The shadow framebuffer is unavailable.');gl.bindFramebuffer(gl.FRAMEBUFFER,null);
      this.light=mul(ortho(-66,66,-66,66,1,180),lookAt([-48,90,43],[0,0,0]));gl.enable(gl.DEPTH_TEST);gl.disable(gl.CULL_FACE);
    }
    loc(p,n){const key=(p===this.main?'m':'d')+n;if(!this.locations.has(key))this.locations.set(key,this.gl.getUniformLocation(p,n));return this.locations.get(key);}
    mesh(builder){const gl=this.gl,vao=gl.createVertexArray(),buffer=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(builder.v),gl.STATIC_DRAW);for(const [loc,size,off] of [[0,3,0],[1,3,3],[2,3,6],[3,1,9]]){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,40,off*4);}return {vao,count:builder.v.length/10};}
    resize(){const d=Math.min(window.devicePixelRatio||1,1.5),w=Math.round(this.canvas.clientWidth*d),h=Math.round(this.canvas.clientHeight*d);if(this.canvas.width!==w||this.canvas.height!==h){this.canvas.width=w;this.canvas.height=h;}this.aspect=w/h;}
    render(objects,cam,time){const gl=this.gl;this.resize();const eye=[cam.x+34,cam.y+34,cam.z+42],view=lookAt(eye,[cam.x,cam.y,cam.z]);const vp=mul(ortho(-cam.span*this.aspect/2,cam.span*this.aspect/2,-cam.span/2,cam.span/2,.1,210),view);this.vp=vp;this.eye=eye;
      gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbo);gl.viewport(0,0,2048,2048);gl.clear(gl.DEPTH_BUFFER_BIT);gl.useProgram(this.depth);gl.uniformMatrix4fv(this.loc(this.depth,'uVP'),false,this.light);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(1.2,2);
      for(const o of objects){if(o.noShadow||o.alpha<.5)continue;gl.uniformMatrix4fv(this.loc(this.depth,'uModel'),false,o.matrix||I());gl.bindVertexArray(o.mesh.vao);gl.drawArrays(gl.TRIANGLES,0,o.mesh.count);}gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,this.canvas.width,this.canvas.height);gl.clearColor(.65,.76,.76,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.useProgram(this.main);gl.uniformMatrix4fv(this.loc(this.main,'uVP'),false,vp);gl.uniformMatrix4fv(this.loc(this.main,'uLight'),false,this.light);gl.uniform3fv(this.loc(this.main,'uEye'),eye);gl.uniform1f(this.loc(this.main,'uTime'),time);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,this.shadow);gl.uniform1i(this.loc(this.main,'uShadow'),0);
      for(const o of objects){const alpha=o.alpha??1;if(alpha<1){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);}else{gl.disable(gl.BLEND);gl.depthMask(true);}gl.depthFunc(o.xray?gl.GREATER:gl.LESS);if(o.xray)gl.enable(gl.CULL_FACE);else gl.disable(gl.CULL_FACE);gl.uniformMatrix4fv(this.loc(this.main,'uModel'),false,o.matrix||I());gl.uniform1f(this.loc(this.main,'uAlpha'),alpha);gl.uniform1f(this.loc(this.main,'uFlash'),o.flash||0);gl.bindVertexArray(o.mesh.vao);gl.drawArrays(gl.TRIANGLES,0,o.mesh.count);}gl.depthFunc(gl.LESS);gl.disable(gl.CULL_FACE);gl.depthMask(true);gl.disable(gl.BLEND);
    }
  }
  return {Builder,Renderer,I,mul,transform,color};
})();

