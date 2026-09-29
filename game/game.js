/* THE BEACON OF BRIARHOLD
   World coordinates use X/Z for the ground and Y for height. The camera keeps
   one compass direction, and movement is relative to that fixed screen view. */
"use strict";
(()=>{
const $=id=>document.getElementById(id),B=R3.Builder;
let renderer;
try{renderer=new R3.Renderer($('view'));}catch(error){$('loading').textContent=error.message;return;}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,t)=>{const v=clamp((t-a)/(b-a),0,1);return v*v*(3-2*v);};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
function rand(x,z,k=0){let n=Math.imul(Math.floor(x*29)+517,374761393)+Math.imul(Math.floor(z*31)+113,668265263)+k;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
const river=z=>-1+Math.sin(z*.12)*2;
function ground(x,z){return 2.4*smooth(4,10,x)*smooth(36,30,x)*smooth(-5,-14,z)*smooth(-45,-39,z);}
function onBridge(x,z){return (Math.abs(z-12)<1.75||Math.abs(z+12)<1.75)&&Math.abs(x-river(z))<5.3;}
function moat(x,z){return x>6&&x<32&&z>-13.9&&z<-10.1;}
function height(x,z){if(onBridge(x,z))return .48; if(moat(x,z)&&x>15.9&&x<20.1)return 1.1+(-z-10.1)/3.8*1.3; return ground(x,z);}
let obstacles=[],paths=[];
const blockedRect=(x,z,w,d)=>obstacles.push({x,z,w,d});
const blockedCircle=(x,z,r)=>obstacles.push({x,z,r});
function pointSegment(x,z,a,b){const dx=b[0]-a[0],dz=b[1]-a[1],t=clamp(((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz||1),0,1);return Math.hypot(x-a[0]-t*dx,z-a[1]-t*dz);}
function nearPath(x,z,padding=2.4){return paths.some(p=>p.some((a,i)=>i&&pointSegment(x,z,p[i-1],a)<padding));}
function waterAt(x,z){return (Math.abs(x-river(z))<3.2&&!onBridge(x,z))||(moat(x,z)&&!(x>15.9&&x<20.1));}
const land=new B(),water=new B(),architecture=new B(),front=new B(),decor=new B();
const colors={stone:'#b6b59b',shadow:'#849394',light:'#d3ceb0',roof:'#3d7183',roofLight:'#548c94',wood:'#886747',leaf:'#71956b',gold:'#e7b865',mint:'#72e0c4'};
function path(points,width=2.3){paths.push(points);for(let s=1;s<points.length;s++){const a=points[s-1],b=points[s],d=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=-(b[1]-a[1])/d*width/2,nz=(b[0]-a[0])/d*width/2;for(let i=0;i<Math.ceil(d/.7);i++){const t=i/Math.ceil(d/.7),u=(i+1)/Math.ceil(d/.7),x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t,xx=a[0]+(b[0]-a[0])*u,zz=a[1]+(b[1]-a[1])*u;if(waterAt(x,z)||onBridge(x,z))continue;land.quad([x+nx,ground(x+nx,z+nz)+.025,z+nz],[xx+nx,ground(xx+nx,zz+nz)+.025,zz+nz],[xx-nx,ground(xx-nx,zz-nz)+.025,zz-nz],[x-nx,ground(x-nx,z-nz)+.025,z-nz],rand(x,z)>.5?'#c5b891':'#cbbb92');}}}
// Paths and distinct destinations are authored by hand, before adding foliage.
path([[-25,22],[-24,16],[-13,12],[7,12],[20,10]]);
path([[-24,16],[-29,4],[-24,-14],[-13,-13],[7,-12],[18,-7],[18,-17]],2.6);
path([[-25,22],[-30,29],[-31,33]]);
path([[7,12],[17,1],[18,-7]]);
path([[-29,4],[-17,0],[-13,-13]],1.8);

// Uneven terrain, a real river cut, shoreline faces, and distant mountain forms.
for(let z=-48;z<46;z+=1.5)for(let x=-47;x<47;x+=1.5){if(Math.abs(x+.75-river(z+.75))<3.1||moat(x+.75,z+.75))continue;const shade=rand(x,z),col=x>5&&z<-9?'#869b78':shade<.28?'#829e70':shade>.8?'#88a274':'#849f70';const y=(a,b)=>ground(a,b)-smooth(.85,1,Math.max(Math.abs(a)/48,Math.abs(b)/48))*3;land.quad([x,y(x,z),z],[x,y(x,z+1.5),z+1.5],[x+1.5,y(x+1.5,z+1.5),z+1.5],[x+1.5,y(x+1.5,z),z],col);}
// Keep paths above the terrain (both meshes share land, depth resolves them).
for(let z=-54;z<52;z+=1.2){const c=river(z),cc=river(z+1.2);water.quad([c-3.7,-.5,z],[c-3.7,-.5,z+1.2],[cc+3.7,-.5,z+1.2],[c+3.7,-.5,z],'#4b9b9c',1);for(const s of [-1,1])land.quad([c+s*3.6,-.6,z],[c+s*3.6,.05,z],[cc+s*3.6,.05,z+1.2],[cc+s*3.6,-.6,z+1.2],'#7d9180');}
water.quad([6,.25,-14],[6,.25,-10],[32,.25,-10],[32,.25,-14],'#518d95',1);
water.quad([-150,-3,-150],[-150,-3,150],[150,-3,150],[150,-3,-150],'#74a6a3',1);
for(let i=0;i<15;i++){const x=-72+i*10,z=-72-rand(i,3)*10;land.cylinder(x,-5,z,8+rand(i,4)*9,7+rand(i,8)*9,i%2?'#799698':'#899c99',5,0);}

function roof(b,x,y,z,w,d,h,col=colors.roof){b.tri([x-w/2,y,z-d/2],[x+w/2,y,z-d/2],[x,y+h,z-d/2],col);b.tri([x+w/2,y,z+d/2],[x-w/2,y,z+d/2],[x,y+h,z+d/2],col);b.quad([x-w/2,y,z-d/2],[x,y+h,z-d/2],[x,y+h,z+d/2],[x-w/2,y,z+d/2],col);b.quad([x+w/2,y,z+d/2],[x,y+h,z+d/2],[x,y+h,z-d/2],[x+w/2,y,z-d/2],col===colors.roof?colors.roofLight:'#b8876b');for(let i=1;i<5;i++){const t=i/5;b.box(x-w/2*(1-t),y+h*t+.04,z,.1,.07,d+.08,col===colors.roof?'#648c91':'#c09b7e');b.box(x+w/2*(1-t),y+h*t+.04,z,.1,.07,d+.08,col===colors.roof?'#4a7881':'#a27561');}}
function windowArch(b,x,y,z,w=1,h=1.5){b.box(x,y+h/2,z,w,h,.07,'#253f53');b.arch(x,y,z+.06,w,h,.14,.1,colors.light);b.box(x,y+h*.48,z+.11,.06,h*.88,.04,'#e5c183');b.box(x,y+h*.56,z+.12,w,.06,.04,'#e5c183');b.box(x-w*.23,y+h*.35,z+.1,w*.4,h*.6,.04,'#b9d3b8');b.box(x+w*.23,y+h*.35,z+.1,w*.4,h*.6,.04,'#dfb569');}
function banner(b,x,y,z,col='#ac6563'){b.cylinder(x,y-2.7,z,.035,3,'#c7b187',6);b.box(x+.45,y-.25,z,.9,.1,.1,'#dbbd7f');b.quad([x+.06,y-.3,z],[x+.06,y-2,z],[x+.45,y-2.3,z+.08],[x+.9,y-1.95,z+.12],col);b.tri([x+.06,y-.3,z],[x+.9,y-1.95,z+.12],[x+.9,y-.3,z],col);b.box(x+.46,y-1.08,z+.1,.13,.62,.04,'#ead595');}
function tower(b,x,z,r=2.2,h=7,roofed=true){const y=ground(x,z);b.cylinder(x,y,z,r+.35,.5,colors.shadow,14);b.cylinder(x,y+.5,z,r,h,colors.stone,14);for(let j=1;j<5;j++)b.cylinder(x,y+j*h/5,z,r+.07,.16,colors.light,14);b.cylinder(x,y+h,z,r+.35,.55,colors.light,14);for(let i=0;i<12;i++){const a=i/12*Math.PI*2;b.box(x+Math.cos(a)*(r+.05),y+h+.8,z+Math.sin(a)*(r+.05),.7,.65,.7,colors.stone,a);}windowArch(b,x,y+h*.47,z+r+.035,.65,1.3);if(roofed){b.cylinder(x,y+h+.3,z,r+.7,3.5,colors.roof,14,0);b.cylinder(x,y+h+3.8,z,.045,1.5,'#ccbb83',6);banner(b,x,y+h+5.15,z,'#be7b62');}blockedCircle(x,z,r);}
function wall(b,x,z,w,d,h=3.8){const y=2.4;b.box(x,y+h/2,z,w,h,d,colors.stone);b.box(x,y+h,z,w+.2,.25,d+.2,colors.light);const length=Math.max(w,d);for(let i=0;i<Math.floor(length/.95);i++){const v=-length/2+(i+.5)*length/Math.floor(length/.95);b.box(x+(w>d?v:0),y+h+.45,z+(d>w?v:0),w>d?.58:w+.15,.65,d>w?.58:d+.15,colors.light);}for(let i=0;i<length/2;i++){const v=-length/2+(i+.5)*2;b.box(x+(w>d?v:0),y+1.4,z+(d>w?v:0),w>d?1.1:w+.08,.08,d>w?1.1:d+.08,'#929c8e');}blockedRect(x,z,w,d);}
// The castle is assembled as architecture: raised stonework, a gatehouse,
// four towers, a great hall, buttresses, windows, roofs, and a courtyard.
architecture.box(18.5,2.25,-27,22, .4,24,'#a5ae97');
for(let x=8.7;x<29;x+=1.4)for(let z=-36.8;z<-16.4;z+=1.4)architecture.box(x,2.485,z,1.3,.04,1.3,rand(x,z)>.65?'#a6b2a0':'#b0b9a5');
wall(architecture,8,-26.5,.85,21);wall(architecture,29,-26.5,.85,21);wall(architecture,18.5,-37.5,21,.85);
wall(front,11.1,-16,6.2,1,3.5);wall(front,25.4,-16,7.2,1,3.5);
tower(front,8,-16,2.15,7.1,true);tower(front,29,-16,2.15,8.3,true);
tower(architecture,8,-37,2.2,8.3,true);tower(architecture,29,-37,2.2,10,true);
front.arch(18,2.4,-16,4.1,5.5,.7,2.2,colors.light);front.box(18,8.2,-16,6.2,1,2.4,colors.stone);roof(front,18,8.7,-16,6.8,3.3,2.2);banner(front,21.4,7.8,-14.8);banner(front,13.5,7,-14.8,'#688f91');
blockedRect(15.1,-16,1.8,1.8);blockedRect(20.9,-16,1.8,1.8);
// A great hall and its taller central beacon tower make the silhouette varied.
architecture.box(18,5.5,-34.5,13,6.1,5.4,colors.stone);blockedRect(18,-34.5,13,5.4);roof(architecture,18,8.55,-34.5,14.5,7,4);
for(const x of [12.6,15.2,20.8,23.4])windowArch(architecture,x,5.1,-31.75,1,2.1);
architecture.arch(18,2.4,-31.73,2.1,3.7,.3,.4,colors.light);architecture.box(18,4,-31.77,2.05,3.2,.12,'#536b75');
for(const x of [11.3,14.5,21.5,24.7]){architecture.box(x,4,-31.3,.5,3.2,1,colors.shadow);architecture.box(x,5.7,-31.6,.7,.3,.7,colors.light);}
architecture.cylinder(18,8.5,-35,2,6.5,colors.stone,8);architecture.cylinder(18,14.8,-35,2.5,4.3,colors.roof,8,0);architecture.cylinder(18,19,-35,.12,1.5,colors.gold,8);architecture.sphere(18,20.6,-35,.4,colors.gold,8,4);
windowArch(architecture,18,12,-32.97,.8,1.8);banner(architecture,19.5,14.5,-32.9,'#b36560');
// Stair treads, bridge planks and chains approach the gate over its moat.
for(let i=0;i<14;i++){const z=-9.4-i*.43,y=height(18,clamp(z,-13.8,-10.2));architecture.box(18,y-.12,z,4.1,.23,.41,i%2?'#a78458':'#b29364');}for(const x of [16.1,19.9]){for(let i=0;i<15;i++)architecture.box(x,3.3+i*.07,-10.3-i*.35,.065,.08,.32,'#536975');}
function bridge(z,stone){const c=river(z);const b=architecture;for(let i=0;i<22;i++)b.box(c-5.5+i*.5,.35,z,.48,.28,3.4,stone?'#b4b69e':i%2?'#9e805c':'#b3996f');for(const side of [-1,1]){for(let x=c-5.5;x<=c+5.5;x+=1.35){b.box(x,1,z+side*1.68,.18,1.4,.18,stone?'#a8afa0':'#6f6551');b.sphere(x,1.8,z+side*1.68,.17,'#d0c59f',6,3);}b.box(c,1.28,z+side*1.68,11.3,.15,.17,stone?'#c7c8ab':'#b29a6a');}for(const x of [c-3.5,c+3.5])b.box(x,-.35,z,.6,1.6,3,'#7c8e87');}
bridge(12,true);bridge(-12,false);
function cottage(x,z,w=5,d=4){const y=ground(x,z);architecture.box(x,y+1.5,z,w,3,d,'#d1c3a0');architecture.box(x,y+.23,z,w+.25,.45,d+.25,'#8f9582');roof(architecture,x,y+3,z,w+1,d+1,2.3,'#997063');for(const xx of [-w/2+.13,w/2-.13])architecture.box(x+xx,y+1.8,z+d/2+.02,.15,2.5,.14,'#786858');windowArch(architecture,x-1.2,y+1,z+d/2+.07,.65,1.1);architecture.arch(x+1,y,z+d/2+.05,.9,1.95,.15,.2,'#e0cfaa');architecture.box(x+1,y+.9,z+d/2+.02,.83,1.8,.08,'#667c75');architecture.box(x-w*.25,y+4.2,z-.8,.7,2,.8,'#a69f8a');blockedRect(x,z,w,d);}
cottage(-29,23,5.3,4);cottage(-18,23,5.2,4.2);cottage(-29,15,4,3.8);
// Hamlet well, garden fences, flower beds and lanterns.
architecture.cylinder(-22,24*0,-.0+25,1,.6,'#a5ae98',12);architecture.cylinder(-22,.58,25,.8,.1,'#3d666e',12);blockedCircle(-22,25,1);
for(const x of [-22.9,-21.1])architecture.box(x,1.35,25,.13,2.6,.13,'#80684e');roof(architecture,-22,2.6,25,2.7,2,1.1);
function fence(x,z,length,ry=0){for(let i=0;i<=length;i++){const xx=x+Math.cos(ry)*i,zz=z-Math.sin(ry)*i;decor.box(xx,.6,zz,.13,1.2,.13,'#9c9270');}for(const y of [.35,.86])decor.box(x+Math.cos(ry)*length/2,y,z-Math.sin(ry)*length/2,length,.13,.12,'#baac83',ry);}
fence(-34,26,7);fence(-20,26,6);fence(-34,16,8,Math.PI/2);
function lamp(x,z){const y=ground(x,z);decor.box(x,y+1.3,z,.11,2.6,.11,'#716951');decor.box(x,y+2.6,z,.43,.58,.43,'#eac47a');decor.cylinder(x,y+2.94,z,.4,.35,'#547877',4,0);decor.box(x,y+2.37,z,.52,.1,.52,'#566f6c');}
for(const [x,z] of [[-23,18],[-15,13],[7,13],[16,-8],[21,-8],[11,-21],[26,-21],[-29,29]])lamp(x,z);
// Ruined watchtower at the river sigil; broken arches surround the grove sigil.
tower(architecture,24,9,1.9,4.5,false);
architecture.arch(20,0,8,2.2,3.2,.3,.6,'#b1b59c');
for(const [x,z] of [[-26,-16],[-21,-16],[-26,-11]]){decor.cylinder(x,0,z,.4,2.2+rand(x,z),'#b0b59b',8);blockedCircle(x,z,.5);}
decor.arch(-23.5,0,-17,3.2,3.8,.35,.7,'#b7baa1');
// Landmark-safe, deterministic vegetation. Small decorative plants have no
// collision; trunks and boulders do, using the same positions as their models.
function tree(x,z,size=1){const y=ground(x,z),r=rand(x,z);decor.cylinder(x,y,z,.23*size,2.7*size,'#7e7358',7,.12*size);decor.sphere(x,y+3.1*size,z,1.65*size,r>.5?'#6c906a':'#587e69',9,5,[1,1.05,1],3);decor.sphere(x-.7*size,y+3.8*size,z-.1,1.12*size,'#8aa775',8,4,[1,1,1],3);decor.sphere(x+.8*size,y+3*size,z+.4,1.1*size,'#7a9b6c',8,4,[1,1,1],3);blockedCircle(x,z,.55*size);}
for(let z=-40;z<40;z+=3.6)for(let x=-40;x<40;x+=3.6){const xx=x+(rand(x,z)-.5)*2,zz=z+(rand(x,z,61)-.5)*2;if(waterAt(xx,zz)||onBridge(xx,zz)||nearPath(xx,zz,3)||xx>5&&zz<-7||Math.hypot(xx+25,zz-22)<10||Math.hypot(xx+31,zz-32)<4||Math.hypot(xx-21,zz-10)<6||Math.hypot(xx+24,zz+14)<5)continue;if(rand(x,z,23)<.52)tree(xx,zz,.75+rand(x,z,13)*.65);else if(rand(x,z,21)>.83){decor.sphere(xx,ground(xx,zz)+.35,zz,.8,'#8d9c8d',6,3,[1.4,.8,1]);blockedCircle(xx,zz,.75);}}
for(let i=0;i<900;i++){const x=rand(i,8)*86-43,z=rand(i,16)*84-42;if(waterAt(x,z)||nearPath(x,z,1.8)||x>6&&z<-9)continue;const y=ground(x,z);const col=i%4===0?'#dfbf8d':i%4===1?'#b598a8':'#a0b58a';decor.cylinder(x,y,z,.045,.25,'#759568',4);decor.sphere(x,y+.3,z,.11,col,5,3,[1,.6,1]);}
// A hidden walled garden is planted with a ring of flowers and a small fountain.
for(let i=0;i<30;i++){const a=i/30*Math.PI*2;decor.sphere(-31+Math.cos(a)*3.2,.3,32+Math.sin(a)*3.2,.26,i%2?'#c892a0':'#e1c181',6,3);}
architecture.cylinder(-31,0,33,1.2,.35,'#acb4a0',12);architecture.cylinder(-31,.35,33,.85,.1,'#79b1b2',12);

const meshes={land:renderer.mesh(land),water:renderer.mesh(water),architecture:renderer.mesh(architecture),front:renderer.mesh(front),decor:renderer.mesh(decor)};
const models={};
function model(name,build){const b=new B();build(b);models[name]=renderer.mesh(b);}
model('hero',b=>{b.box(0,.95,0,.62,.65,.37,'#567e89');b.box(0,1.23,0,.73,.2,.44,'#d0bf94');b.sphere(0,1.58,0,.31,'#e5c296',8,5);b.sphere(0,1.79,-.03,.33,'#67564d',8,4,[1,.5,1]);b.box(0,1.65,.27,.29,.06,.055,'#364d58');b.box(0,1.18,-.27,.64,.55,.08,'#bb785e');b.tri([-.38,1.4,-.3],[.4,1.4,-.3],[.32,.32,-.49],'#bc795d');b.tri([-.38,1.4,-.3],[.32,.32,-.49],[-.32,.32,-.49],'#a66556');b.box(-.46,.94,0,.2,.6,.22,'#d0b080');b.box(-.49,.75,.06,.28,.25,.28,'#947658');});
model('leg',b=>{b.box(0,.33,0,.23,.5,.25,'#405a66');b.box(0,.09,.08,.27,.18,.4,'#786650');});
model('sword',b=>{b.box(0,.88,0,.18,.63,.22,'#d5b68b');b.box(0,.54,.28,.12,.12,.48,'#857051');b.box(0,.54,.49,.55,.11,.13,'#d4b772');b.box(0,.54,1.05,.18,.065,1.06,'#dce6dc');b.tri([-.09,.54,1.58],[.09,.54,1.58],[0,.54,1.86],'#e8f4e9');b.box(-.066,.58,1.05,.026,.02,.99,'#a3c5cb');});
model('moss',b=>{b.sphere(0,.62,0,.65,'#698b63',9,5,[1,.85,1]);b.sphere(-.15,.99,-.12,.45,'#9db278',7,4,[1,.45,1]);for(const x of [-.23,.23]){b.sphere(x,.66,.54,.16,'#e7d5a1',7,4);b.sphere(x,.66,.67,.07,'#334b4f',6,3);b.box(x,.1,.1,.27,.2,.5,'#658466');}});
model('beetle',b=>{b.sphere(0,.6,0,.64,'#a86856',10,5,[1,.9,1.25]);b.sphere(0,.98,-.15,.43,'#ca956c',8,4,[1,.5,1.1]);for(const x of [-.52,.52]){b.box(x,.22,.25,.18,.4,.27,'#715c57');b.box(x,.22,-.3,.18,.4,.27,'#715c57');b.cylinder(x,.8,.46,.11,.45,'#d9bc87',5,0);}for(const x of [-.19,.19])b.sphere(x,.7,.68,.08,'#3a404b',6,3);});
model('boss',b=>{b.cylinder(0,.3,0,.65,1.6,'#6f8590',8,.95);b.box(0,2.15,0,1.3,1.1,.9,'#8ba1a5');b.sphere(0,2.95,0,.58,'#bbc4b3',8,5);b.box(0,3,.5,.75,.15,.13,'#5fc6be');b.cylinder(0,3.3,0,.15,.65,'#d5ba79',6,0);b.box(-1,1.9,.2,.35,1.3,.5,'#84999d');b.box(-1.15,1.75,.55,.22,1.7,1.15,'#788f96');b.box(-1.15,1.85,1.13,.08,.85,.07,'#d6bf88');b.box(1,1.9,.1,.35,1.3,.5,'#84999d');b.box(1.1,1.2,1.1,.19,.1,2.5,'#c0d3d0');b.box(1.1,1.2,.4,.7,.15,.15,'#dbbd80');for(const x of [-.42,.42])b.box(x,.22,.1,.5,.45,.9,'#607983');});
model('coin',b=>{b.cylinder(0,0,0,.22,.1,'#ecca77',10);b.cylinder(0,.1,0,.14,.04,'#f8dc91',10);});
model('sigil',b=>{b.sphere(0,0,0,.5,'#8ee0cb',4,2,[.65,1.4,.65]);b.ring(0,0,0,.7,.78,'#e3c181');});
model('heart',b=>{b.sphere(-.13,.1,0,.22,'#de857d',8,4);b.sphere(.13,.1,0,.22,'#de857d',8,4);b.cylinder(0,-.32,0,0,.4,'#de857d',4,.27);});
model('speed',b=>{b.cylinder(0,0,0,.2,.45,'#8bd4b7',8,.18);b.cylinder(0,.45,0,.12,.12,'#d0bb84',8);});
model('particle',b=>b.sphere(0,0,0,.13,'#f9db94',5,3));
model('slash',b=>b.ring(0,.55,0,1.3,2.25,'#f4deab',-.65,.65));
model('ring',b=>b.ring(0,.025,0,.92,1,'#f3be89'));
model('pedestal',b=>{b.cylinder(0,0,0,.85,.3,'#8d9d96',10);b.cylinder(0,.3,0,.6,.55,'#b9c3ac',8);b.cylinder(0,.85,0,.8,.14,'#d3ceb0',10);});
model('beacon',b=>{b.cylinder(0,0,0,1.35,.3,'#90a6a1',10);b.cylinder(0,.3,0,1,.4,'#c4cdb4',10);b.cylinder(0,.7,0,.65,.8,'#8ea69d',8);b.sphere(0,2.4,0,.85,'#a5e8d7',5,2,[.8,1.7,.8]);});
model('gate',b=>{for(let x=-1.7;x<1.8;x+=.48)b.box(x,2.2,0,.1,4.4,.17,'#687d7e');for(const y of [1,2.8,4.2])b.box(0,y,0,3.8,.12,.18,'#c3b783');});
model('chest',b=>{b.box(0,.35,0,.9,.7,.6,'#9a7852');b.box(0,.7,0,1,.12,.68,'#bd965d');for(const x of [-.3,.3])b.box(x,.42,.31,.12,.65,.06,'#d6bb74');b.box(0,.48,.35,.17,.19,.05,'#dfcc8b');});

// Mutable gameplay data is rebuilt in reset(), leaving all reusable artwork intact.
let player,enemies,coins,items,sigils,chests,particles,mode='title',time=0,defeated=0;
let keys=new Set(),cam={x:13,y:3,z:-22,span:40},toastTimer=0,promptTarget=null,worldTimer=0;
let soundOn=true,audio=null,mapTick=0,hitOverlay=0,region='';
const sigilPlaces=[{x:-24,z:-14,name:'The Woodland Sigil'},{x:20,z:10,name:'The River Sigil'},{x:-31,z:32,name:'The Garden Sigil'}];
const enemyPlaces=[[-20,10,'moss'],[-28,-6,'moss'],[-22,-11,'moss'],[-24,-17,'beetle'],[-13,-10,'moss'],[-17,0,'beetle'],[10,13,'moss'],[18,12,'beetle'],[23,12,'moss'],[-27,30,'moss'],[13,-5,'beetle'],[25,-8,'moss'],[18,-24,'boss']];
function reset(){
  player={x:-24,z:19,y:0,angle:0,hp:6,coins:0,speed:0,inv:0,attack:0,cooldown:0,dodge:0,dodgeWait:0,dx:0,dz:0,step:0};
  enemies=enemyPlaces.map(([x,z,type],i)=>({x,z,type,homeX:x,homeZ:z,hp:type==='boss'?14:type==='moss'?2:3,max:type==='boss'?14:type==='moss'?2:3,angle:0,flash:0,stun:0,windup:0,charge:0,wait:1+i*.19,alive:true}));
  coins=[];
  for(const p of paths)for(let i=1;i<p.length;i++){
    const a=p[i-1],b=p[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]);
    for(let d=2;d<length;d+=4.2){
      const x=a[0]+(b[0]-a[0])*d/length,z=a[1]+(b[1]-a[1])*d/length;
      if(!waterAt(x,z))coins.push({x,z,taken:false});
    }
  }
  items=[[-17,13,'heart'],[-25,-9,'heart'],[15,13,'heart'],[-30,28,'heart'],[18,-8,'heart'],[-15,-12,'speed'],[8,10,'speed']].map(([x,z,type])=>({x,z,type,taken:false}));
  sigils=sigilPlaces.map(s=>({...s,taken:false}));
  chests=[{x:-35,z:4,open:false},{x:27,z:19,open:false},{x:11,z:-28,open:false}];
  particles=[];defeated=0;time=0;toastTimer=0;worldTimer=0;promptTarget=null;hitOverlay=0;region='';
  $('prompt').textContent='';$('boss').hidden=true;$('boost').textContent='';$('damage').style.opacity=0;$('toast').classList.remove('show');
  keys.clear();cam={x:player.x+1,y:0,z:player.z-3,span:29};updateHud();
}
function countSigils(){return sigils.filter(s=>s.taken).length;}
function canStand(x,z,r=.34,ignoreGate=false){if(Math.abs(x)>43||z>42||z<-43||waterAt(x,z))return false;if(!ignoreGate&&countSigils()<3&&Math.abs(x-18)<2.15+r&&Math.abs(z+16)<.5+r)return false;for(const o of obstacles){if(o.r){if(Math.hypot(x-o.x,z-o.z)<o.r+r)return false;}else{const xx=clamp(x,o.x-o.w/2,o.x+o.w/2),zz=clamp(z,o.z-o.d/2,o.z+o.d/2);if((x-xx)**2+(z-zz)**2<r*r)return false;}}return true;}
function move(e,dx,dz,r=.34){if(canStand(e.x+dx,e.z,r))e.x+=dx;if(canStand(e.x,e.z+dz,r))e.z+=dz;}
function toast(text){$('toast').textContent=text;$('toast').classList.add('show');toastTimer=3.3;}
function sfx(kind){if(!soundOn)return;try{audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();const notes={coin:[700,1000],hit:[160],slash:[280,130],item:[520,720],sigil:[440,660,880],win:[440,550,660,880]}[kind]||[350];notes.forEach((f,i)=>{const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime+i*.08;o.type=kind==='hit'?'triangle':'sine';o.frequency.setValueAtTime(f,t);g.gain.setValueAtTime(.055,t);g.gain.exponentialRampToValueAtTime(.001,t+.22);o.connect(g).connect(audio.destination);o.start(t);o.stop(t+.23);});}catch(_){}}
function sparks(x,z,n=12){for(let i=0;i<n;i++){const a=i/n*Math.PI*2;particles.push({x,z,y:height(x,z)+.65,vx:Math.cos(a)*(1+rand(i,time)*2),vz:Math.sin(a)*(1+rand(time,i)*2),vy:2+rand(i,n)*2,life:.65+rand(n,i)*.4});}}
function updateHud(){$('health').textContent='♥'.repeat(player.hp)+'♡'.repeat(6-player.hp);$('coins').innerHTML=`${player.coins} <small>COINS</small>`;$('kills').innerHTML=`${defeated} <small>DEFEATED</small>`;$('sigils').innerHTML=sigils.map(s=>`<span class="${s.taken?'found':''}">${s.taken?'◆':'◇'}</span>`).join('');const n=countSigils(),boss=enemies.find(e=>e.type==='boss');$('objective').textContent=n<3?`Find the Dawn Sigils · ${n} / 3`:boss.alive?'The gate is open. Face the Hollow Warden.':'Relight the beacon before the great hall.';}
function screen(state){mode=state;const overlay=$('overlay');overlay.hidden=state==='playing';$('hud').hidden=state==='title';$('pauseButton').hidden=state==='title';if(state==='playing'){$('start').blur();return;}const info={title:['A STORYBOOK ADVENTURE','The Beacon<br><em>of Briarhold</em>','Beyond the old river stands a sleeping castle.<br>Find three Dawn Sigils. Lift your sword.<br>Bring its light back to the valley.','BEGIN YOUR JOURNEY'],paused:['YOUR JOURNEY IS WAITING','A moment<br><em>of quiet</em>','Briarhold will be here when you return.','RESUME JOURNEY'],won:['THE VALLEY SHINES AGAIN','The beacon<br><em>is alight.</em>','You reclaimed the Dawn Sigils and awakened Briarhold.<br>The valley remembers its light.','PLAY AGAIN'],lost:['A NEW DAWN AWAITS','The light<br><em>grows quiet.</em>','Gather your courage and try another path.<br>Hearts restore health; a timely dodge saves it.','TRY AGAIN']}[state];$('eyebrow').textContent=info[0];$('title').innerHTML=info[1];$('description').innerHTML=info[2];$('start').innerHTML=info[3]+' <span>→</span>';$('stats').hidden=!['won','lost'].includes(state);$('stats').innerHTML=`<span>${player.coins} coins</span><span>${defeated} defeated</span><span>${countSigils()} sigils</span>`;$('introControls').hidden=state!=='title';keys.clear();}

function hurt(amount=1){if(player.inv>0||player.dodge>0||mode!=='playing')return;player.hp=Math.max(0,player.hp-amount);player.inv=1.15;hitOverlay=.8;sparks(player.x,player.z,10);sfx('hit');updateHud();if(player.hp===0)screen('lost');}
function sword(){if(mode!=='playing'||player.cooldown>0||player.dodge>0)return;player.attack=.32;player.cooldown=.43;player.hit=false;sfx('slash');
  const target=enemies.filter(e=>e.alive&&dist(e,player)<2.9).sort((a,b)=>dist(a,player)-dist(b,player))[0];if(target)player.angle=Math.atan2(target.x-player.x,target.z-player.z);
}
function strike(){for(const e of enemies){if(!e.alive||e.type==='boss'&&countSigils()<3)continue;const dx=e.x-player.x,dz=e.z-player.z,d=Math.hypot(dx,dz),reach=e.type==='boss'?3.1:2.55;if(d>reach||(dx*Math.sin(player.angle)+dz*Math.cos(player.angle))/(d||1)<.05)continue;e.hp--;e.flash=.23;e.stun=.22;sparks(e.x,e.z,8);if(e.hp<=0){e.alive=false;defeated++;sfx('item');if(e.type==='boss'){toast('The Warden is still. Relight the beacon.');items.push({x:e.x,z:e.z,type:'heart',taken:false});}else{coins.push({x:e.x,z:e.z,taken:false});if(rand(e.homeX,e.homeZ,7)<.3)items.push({x:e.x+.6,z:e.z,type:'heart',taken:false});}updateHud();}}}
function dodge(){if(mode!=='playing'||player.dodgeWait>0)return;player.dodge=.23;player.dodgeWait=.95;player.inv=Math.max(player.inv,.28);if(Math.hypot(player.dx,player.dz)<.1){player.dx=Math.sin(player.angle);player.dz=Math.cos(player.angle);}sfx('slash');}
function interact(){if(mode!=='playing')return;if(promptTarget?.kind==='chest'){promptTarget.item.open=true;player.coins+=5;player.hp=Math.min(6,player.hp+2);sparks(player.x,player.z,18);sfx('item');toast('A traveller’s cache · 5 coins and restored health');updateHud();}else if(promptTarget?.kind==='beacon'){sfx('win');screen('won');}}
function update(dt){time+=dt;worldTimer+=dt;toastTimer-=dt;if(toastTimer<=0)$('toast').classList.remove('show');hitOverlay=Math.max(0,hitOverlay-dt*2);$('damage').style.opacity=hitOverlay;
  for(const k of ['inv','speed','cooldown','dodgeWait'])player[k]=Math.max(0,player[k]-dt);
  const previousAttack=player.attack;player.attack=Math.max(0,player.attack-dt);if(previousAttack>.19&&player.attack<=.19&&!player.hit){strike();player.hit=true;}
  let sx=Number(keys.has('d')||keys.has('arrowright'))-Number(keys.has('a')||keys.has('arrowleft'));
  let sy=Number(keys.has('s')||keys.has('arrowdown'))-Number(keys.has('w')||keys.has('arrowup'));
  const mag=Math.hypot(sx,sy);player.moving=mag>0;
  if(player.dodge>0){player.dodge-=dt;move(player,player.dx*14*dt,player.dz*14*dt);sparks(player.x,player.z,1);}
  else if(mag>0){sx/=mag;sy/=mag;const dx=sx*.777+sy*.629,dz=-sx*.629+sy*.777;player.dx=dx;player.dz=dz;if(player.attack<=0)player.angle=Math.atan2(dx,dz);const speed=player.speed>0?6.8:4.8;move(player,dx*speed*dt,dz*speed*dt);player.step+=dt*10;}
  player.y=height(player.x,player.z);
  for(const c of coins)if(!c.taken&&dist(player,c)<.7){c.taken=true;player.coins++;sparks(c.x,c.z,7);sfx('coin');updateHud();}
  for(const i of items)if(!i.taken&&dist(player,i)<.8){if(i.type==='heart'&&player.hp===6)continue;i.taken=true;if(i.type==='heart')player.hp=Math.min(6,player.hp+2);else player.speed=10;sparks(i.x,i.z,11);sfx('item');updateHud();}
  for(const s of sigils)if(!s.taken&&dist(player,s)<1.2){const guarded=enemies.some(e=>e.alive&&Math.hypot(e.homeX-s.x,e.homeZ-s.z)<6);if(guarded){if(toastTimer<=0)toast('Defeat the sigil’s nearby guardians.');}else{s.taken=true;sparks(s.x,s.z,28);sfx('sigil');toast(countSigils()===3?'All three sigils! Briarhold’s gate has opened.':s.name+' recovered');player.hp=Math.min(6,player.hp+1);updateHud();}}
  for(const e of enemies){if(!e.alive)continue;e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,e.stun-dt);e.wait=Math.max(0,e.wait-dt);const d=dist(e,player);if(e.type==='boss'){
      const active=countSigils()===3&&player.z<-16&&d<14;$('boss').hidden=!active;$('bossFill').style.width=(e.hp/e.max*100)+'%';if(!active)continue;e.angle=Math.atan2(player.x-e.x,player.z-e.z);
      if(e.windup>0){e.windup-=dt;if(e.windup<=0){sparks(e.x,e.z,25);if(dist(player,e)<4.1)hurt(2);e.wait=2;}}
      else if(e.wait<=0&&d<4.4)e.windup=.85;
      else if(e.stun<=0&&d>2)move(e,Math.sin(e.angle)*1.45*dt,Math.cos(e.angle)*1.45*dt,.72);
    }else{if(e.stun>0)continue;const chase=d<8;let a,speed;if(chase){a=Math.atan2(player.x-e.x,player.z-e.z);speed=e.type==='moss'?1.75:2.6;if(e.type==='beetle'&&e.wait<=0){e.charge=.55;e.wait=3;}if(e.charge>0){e.charge-=dt;speed=4.3;}}else{a=Math.atan2(e.homeX-e.x,e.homeZ-e.z)+Math.sin(time*.6+e.homeX)*.8;speed=Math.hypot(e.x-e.homeX,e.z-e.homeZ)>1.5?.75:.2;}e.angle=a;move(e,Math.sin(a)*speed*dt,Math.cos(a)*speed*dt,.43);if(d<.95){hurt();move(e,-Math.sin(a)*.4,-Math.cos(a)*.4,.43);}}
  }
  if(!enemies.find(e=>e.type==='boss').alive)$('boss').hidden=true;
  promptTarget=null;for(const c of chests)if(!c.open&&dist(c,player)<1.6)promptTarget={kind:'chest',item:c};const boss=enemies.find(e=>e.type==='boss');if(countSigils()===3&&!boss.alive&&Math.hypot(player.x-18,player.z+30)<2)promptTarget={kind:'beacon'};
  $('prompt').textContent=promptTarget?(promptTarget.kind==='chest'?'E · Open the traveller’s cache':'E · Relight the beacon'):'';
  $('boost').textContent=player.speed>0?`Swiftleaf · ${Math.ceil(player.speed)}s` : player.dodgeWait>.1?'Dodge recovering…':'';
  const name=player.x>6&&player.z<-9?'BRIARHOLD CASTLE':player.x<-18&&player.z>27?'THE HIDDEN GARDEN':player.x<-10&&player.z<-4?'WHISPERWOOD':Math.abs(player.x-river(player.z))<8?'THE OLD RIVER':'LANTERN HAMLET';if(region!==name){region=name;$('region').textContent=name;}
  // A broad camera dead zone keeps the composition stable through small moves.
  // It only glides when the adventurer moves toward the edges of the frame.
  const target={x:player.x+1.8,z:player.z-2.5};const dx=target.x-cam.x,dz=target.z-cam.z;
  if(Math.abs(dx)>2)cam.x+=(dx-Math.sign(dx)*2)*Math.min(1,dt*2.8);if(Math.abs(dz)>2)cam.z+=(dz-Math.sign(dz)*2)*Math.min(1,dt*2.8);
  cam.y+=(player.y-cam.y)*Math.min(1,dt*2);cam.span+=( (player.z<-13&&player.x>5?34:28)-cam.span)*Math.min(1,dt*1.2);
  for(const p of particles){p.x+=p.vx*dt;p.z+=p.vz*dt;p.y+=p.vy*dt;p.vy-=7*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);
  mapTick+=dt;if(mapTick>.15){drawMap();mapTick=0;}
}
function drawMap(){const c=$('map').getContext('2d'),w=148;c.clearRect(0,0,w,w);c.save();c.beginPath();c.arc(74,74,73,0,Math.PI*2);c.clip();c.fillStyle='#34594e';c.fillRect(0,0,w,w);const pt=(x,z)=>[74+x*1.55,74+z*1.55];c.strokeStyle='#7db8b9';c.lineWidth=8;c.beginPath();for(let z=-48;z<=48;z++){const p=pt(river(z),z);if(z===-48)c.moveTo(...p);else c.lineTo(...p);}c.stroke();c.strokeStyle='#b6b796';c.lineWidth=2;for(const p of paths){c.beginPath();p.forEach((v,i)=>{const q=pt(...v);if(i)c.lineTo(...q);else c.moveTo(...q);});c.stroke();}c.fillStyle='#b8bda6';const keep=pt(8,-37);c.fillRect(keep[0],keep[1],32,33);c.fillStyle='#456b6e';c.fillRect(keep[0]+5,keep[1]+5,22,22);for(const s of sigils){const p=pt(s.x,s.z);c.fillStyle=s.taken?'#6b9789':'#ffe1a3';c.beginPath();c.arc(...p,3.5,0,Math.PI*2);c.fill();}const p=pt(player.x,player.z);c.fillStyle='#fff5d3';c.beginPath();c.arc(...p,3.5,0,Math.PI*2);c.fill();c.strokeStyle='#213e48';c.stroke();c.restore();c.font='9px Verdana';c.fillStyle='#f8e4b8';c.textAlign='center';c.fillText('N',74,12);}
function render(){const objects=[{mesh:meshes.land},{mesh:meshes.water,noShadow:true},{mesh:meshes.architecture},{mesh:meshes.decor}];
  const push=(name,x,y,z,a=0,s=1,more={})=>objects.push({mesh:models[name],matrix:R3.transform(x,y,z,a,s),...more});
  for(const s of sigils){push('pedestal',s.x,height(s.x,s.z),s.z);if(!s.taken)push('sigil',s.x,height(s.x,s.z)+1.7+Math.sin(time*2+s.x)*.12,s.z,time*.8);}
  for(const c of coins)if(!c.taken)push('coin',c.x,height(c.x,c.z)+.8+Math.sin(time*3+c.x)*.12,c.z,time*2);
  for(const i of items)if(!i.taken)push(i.type,i.x,height(i.x,i.z)+.6+Math.sin(time*3+i.x)*.1,i.z,time*.7);
  for(const c of chests)if(!c.open)push('chest',c.x,ground(c.x,c.z),c.z);
  push('beacon',18,2.4,-30,time*.14);if(countSigils()<3)push('gate',18,2.4,-16);
  for(const e of enemies)if(e.alive){push(e.type,e.x,height(e.x,e.z)+(e.type==='boss'?0:Math.sin(time*6+e.x)*.05),e.z,e.angle,1,{flash:e.flash>0?.65:0});if(e.windup>0)push('ring',e.x,height(e.x,e.z)+.05,e.z,0,4.1,{alpha:.75,noShadow:true});}
  const bob=player.moving?Math.sin(player.step)*.06:Math.sin(time*2)*.018,base=R3.transform(player.x,player.y+bob,player.z,player.angle);const flash=player.inv>0&&Math.floor(time*14)%2===0?.45:0;
  objects.push({mesh:models.hero,matrix:base,flash});
  for(const side of [-1,1])objects.push({mesh:models.leg,matrix:R3.mul(base,R3.transform(side*.19,player.moving?Math.max(0,Math.sin(player.step+side*1.57))*.12:0,player.moving?Math.sin(player.step+side*1.57)*.1:0)),flash});
  const swing=player.attack>0?-1.4+(1-player.attack/.32)*2.8:0;
  objects.push({mesh:models.sword,matrix:R3.mul(base,R3.transform(.46,0,0,swing)),flash});
  if(player.attack>0)push('slash',player.x,player.y,player.z,-player.angle-Math.PI/2+(.5-player.attack/.32),1,{alpha:.55,noShadow:true});
  for(const p of particles)push('particle',p.x,p.y,p.z,time,Math.max(.1,p.life));
  // Foreground fortifications become a cutaway once the player is inside.
  objects.push({mesh:meshes.front,alpha:(mode==='playing'||mode==='review')&&player.z<-15&&player.x>5?.22:1});
  // Show the adventurer's warm silhouette only where scenery hides them.
  objects.push({mesh:models.hero,matrix:base,alpha:.4,flash:.9,xray:true,noShadow:true});
  renderer.render(objects,cam,time);
}
let last=performance.now();
function frame(now){const dt=Math.min(.04,(now-last)/1000);last=now;if(mode==='playing')update(dt);else if(mode==='title'){time+=dt;cam.x=13+Math.sin(time*.12)*1.2;cam.y=4;cam.z=-22;cam.span=43;}else if(mode==='won')time+=dt;render();requestAnimationFrame(frame);}
document.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(!e.repeat){if(k===' ')sword();if(k==='shift')dodge();if(k==='e')interact();if(k==='p'||k==='escape'){if(mode==='playing')screen('paused');else if(mode==='paused')screen('playing');}}keys.add(k);});
document.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
window.addEventListener('blur',()=>{keys.clear();if(mode==='playing')screen('paused');});
$('start').addEventListener('click',()=>{if(mode==='paused')screen('playing');else{reset();screen('playing');toast('The golden map markers show the three Dawn Sigils.');drawMap();}});
$('sound').addEventListener('click',()=>{soundOn=!soundOn;$('sound').textContent=soundOn?'♪ SOUND ON':'♪ SOUND OFF';});
$('pauseButton').addEventListener('click',()=>screen(mode==='paused'?'playing':'paused'));
reset();screen('title');$('loading').hidden=true;$('loading').style.display='none';requestAnimationFrame(frame);

// A small local test hook allows the separate development harness to exercise
// the real gameplay and renderer. It has no UI and makes no network requests.
window.Briarhold={
  snapshot:()=>({mode,player:{...player},sigils:sigils.map(s=>({...s})),enemies:enemies.map(e=>({...e})),coins:coins.filter(c=>!c.taken).length,defeated,triangles:Object.values(meshes).reduce((n,m)=>n+m.count/3,0)}),
  review:(scene)=>{reset();screen('playing');if(scene==='castle'){sigils.forEach(s=>s.taken=true);player.x=18;player.z=-8;cam={x:17,y:3,z:-20,span:40};}else if(scene==='courtyard'){sigils.forEach(s=>s.taken=true);player.x=18;player.z=-21;cam={x:18,y:3,z:-26,span:30};}else if(scene==='bridge'){player.x=-5;player.z=12;cam={x:0,y:0,z:8,span:26};}else if(scene==='forest'){player.x=-24;player.z=-12;cam={x:-23,y:0,z:-15,span:25};}player.y=height(player.x,player.z);updateHud();drawMap();mode='review';render();},
  test:()=>{const results=[];const check=(name,fn)=>{try{fn();results.push({name,pass:true});}catch(e){results.push({name,pass:false,error:e.message});}};const assert=(v,m)=>{if(!v)throw Error(m);};
    check('movement and scenery collision',()=>{reset();screen('playing');const x=player.x;move(player,1,0);assert(player.x>x,'movement blocked at spawn');assert(!canStand(-29,23),'cottage collision missing');assert(!canStand(river(0),0),'river collision missing');assert(canStand(river(12),12),'bridge blocked');});
    check('sword damage and defeat',()=>{reset();screen('playing');const e=enemies[0];e.x=player.x;e.z=player.z+1.8;e.hp=1;player.angle=0;strike();assert(!e.alive&&defeated===1,'sword did not defeat enemy');});
    check('health, invulnerability and game over',()=>{reset();screen('playing');hurt();assert(player.hp===5,'no damage');hurt();assert(player.hp===5,'invulnerability failed');player.inv=0;player.hp=1;hurt();assert(mode==='lost','game over missing');});
    check('sigils unlock the gate',()=>{reset();assert(!canStand(18,-16),'closed gate can be crossed');sigils.forEach(s=>s.taken=true);assert(canStand(18,-16),'open gate cannot be crossed');});
    check('coin and heart pickups',()=>{reset();screen('playing');coins[0].x=player.x;coins[0].z=player.z;items[0].x=player.x;items[0].z=player.z;player.hp=3;update(.01);assert(player.coins>0&&player.hp===5,'pickup failed');});
    check('victory and clean restart',()=>{reset();screen('playing');sigils.forEach(s=>s.taken=true);enemies.find(e=>e.type==='boss').alive=false;player.x=18;player.z=-30;update(.01);interact();assert(mode==='won','beacon failed');reset();assert(player.hp===6&&player.coins===0&&countSigils()===0&&enemies.every(e=>e.alive),'restart failed');});
    check('continuous walkable routes',()=>{reset();const step=.65,queue=[[-24,19]],seen=new Set();const snap=(x,z)=>[Math.round(x/step)*step,Math.round(z/step)*step];const start=snap(-24,19);queue[0]=start;seen.add(start.map(v=>Math.round(v/step)).join(','));for(let i=0;i<queue.length;i++){const [x,z]=queue[i];for(const [dx,dz]of[[step,0],[-step,0],[0,step],[0,-step]]){const [nx,nz]=snap(x+dx,z+dz),key=[Math.round(nx/step),Math.round(nz/step)].join(',');if(!seen.has(key)&&canStand(nx,nz,.35)){seen.add(key);queue.push([nx,nz]);}}}for(const s of sigils)assert(queue.some(([x,z])=>Math.hypot(x-s.x,z-s.z)<1),s.name+' unreachable');assert(queue.some(([x,z])=>Math.hypot(x-18,z+15)<1.1),'gate approach unreachable');});
    reset();screen('title');return results;
  }
};
})();




