import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, Store, User, Settings as SettingsIcon, Package, Phone, Plus, Trash2, Pencil, Eye, EyeOff, ShieldCheck, Check, X, Building2, Hammer, PaintRoller, Plug, Droplets, Layers, Wrench, TreePine, Shield, Grid3X3, LogOut, ArrowLeft, Sparkles, ChevronDown, CreditCard, BadgeCheck, Link2, Database, KeyRound, Copy, ExternalLink } from 'lucide-react';

type AccountVal = { name:string; phone:string; password:string; wilaya:string; specialty:string; role:'trader'|'customer'; shopName:string; approved:boolean; demo?:boolean; shopLogoUrl?:string; subscriptionStatus?:'free'|'paid'; subscriptionExpiry?:string; isFake?:boolean };
type ProductVal = { name:string; price:number; category:string; wilaya:string; traderId:string; traderName:string; shopName:string; traderPhone:string; description:string; imageUrl:string; hidden:boolean; demo?:boolean };
type RequestVal = { productName:string; customerName:string; customerPhone:string; quantity:string; traderName:string; shopName:string; date:string };
type FirebaseVal = { apiKey:string; authDomain:string; projectId:string; storageBucket:string; messagingSenderId:string; appId:string };
type PaymentVal = { publishableKey:string; backendUrl:string };
type CloudinaryVal = { cloudName:string; uploadPreset:string; apiKey:string };
type Rec<T> = { id:string; value:T };
type Tab = 'products'|'traders'|'settings'|'account';

const CATEGORIES = ['إسمنت','حديد','ياجور','رمل وحصى','سباكة','كهرباء','دهان','نجارة وخشب','عزل','أدوات البناء'];
const WILAYAS = ['الجزائر','وهران','قسنطينة','عنابة','البليدة','سطيف','ورقلة','سيدي بلعباس','بسكرة','تلمسان','مستغانم','الشلف','معسكر','بومرداس','بجاية','تيزي وزو','البويرة','جيجل','سكيكدة','أم البواقي','باتنة','تبسة','المسيلة','عين الدفلى','تيارت','سعيدة','تيسمسيلت','الجلفة','البيض','غليزان','النعامة','الأغواط','الوادي','غرداية','بشار','تندوف','تمنراست','إليزي','أدرار','عين تموشنت','سوق أهراس','ميلة','الطارف','تيبازة','برج بوعريريج','خنشلة','عين صالح','عين قزام','تقرت','جانت','المغير','المنيعة','أولاد جلال','برج باجي مختار','بني عباس','تيميمون','تين زاوتين','قالمة'];
function wilayaCode(name:string){ const i=WILAYAS.indexOf(name); return i>=0?String(i+1).padStart(2,'0'):''; }
function formatWilaya(name:string){ const c=wilayaCode(name); return c?`${c} - ${name}`:name; }
function WilayaSelect({value,onChange,includeAll=false,className=''}:{value:string;onChange:(v:string)=>void;includeAll?:boolean;className?:string}){
  const [open,setOpen]=useState(false); const [q,setQ]=useState('');
  const display = value==='كل الولايات' ? 'كل الولايات' : value ? formatWilaya(value) : 'اختر الولاية — 58 ولاية';
  const filtered = WILAYAS.filter(w=>!q.trim() || w.includes(q.trim()) || formatWilaya(w).includes(q.trim()));
  const showAll = includeAll && (!q.trim() || 'كل الولايات'.includes(q.trim()));
  return <div className={`relative ${className}`}>
    <button type="button" onClick={()=>setOpen(v=>!v)} className="w-full flex items-center justify-between gap-2 bg-white border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--navy)]" aria-expanded={open}><span className="flex items-center gap-2 min-w-0"><MapPin className="w-4 h-4 text-[var(--orange)] shrink-0"/><span className="truncate">{display}</span></span><ChevronDown className={`w-4 h-4 shrink-0 transition ${open?'rotate-180':''}`}/></button>
    {open && <div className="absolute z-30 top-full mt-1 left-0 right-0 bg-white border border-[var(--line)] rounded-xl shadow-xl overflow-hidden">
      <div className="p-2 border-b border-[var(--line)]"><input value={q} onChange={e=>setQ(e.target.value)} placeholder="ابحث باسم الولاية أو رقمها…" autoFocus className="w-full border border-[var(--line)] rounded-lg px-3 py-2 text-sm font-semibold bg-white"/></div>
      <div className="max-h-64 overflow-y-auto">
        {showAll && <button type="button" onClick={()=>{onChange('كل الولايات'); setOpen(false); setQ('');}} className="w-full text-right px-3 py-2.5 text-sm font-bold hover:bg-orange-50 flex justify-between"><span>كل الولايات</span><span className="text-[var(--text-soft)]">58 ولاية</span></button>}
        {filtered.map(w=><button key={w} type="button" onClick={()=>{onChange(w); setOpen(false); setQ('');}} className={`w-full text-right px-3 py-2.5 text-sm font-bold hover:bg-orange-50 flex justify-between ${value===w?'bg-orange-50 text-[var(--orange)]':''}`}><span>{w}</span><span className="text-[var(--text-soft)]">{wilayaCode(w)}</span></button>)}
        {filtered.length===0 && !showAll && <p className="px-3 py-3 text-sm font-bold text-[var(--text-soft)]">لا توجد ولاية بهذا الاسم.</p>}
      </div>
    </div>}
  </div>;
}
const DEMO_TRADERS: AccountVal[] = [
  {name:'أمين بن عمر',phone:'0550123456',password:'demo123',wilaya:'سطيف',specialty:'إسمنت',role:'trader',shopName:'مواد بناء سطيف',approved:true,demo:true,shopLogoUrl:'',subscriptionStatus:'free',subscriptionExpiry:'',isFake:true},
  {name:'يوسف حداد',phone:'0660789012',password:'demo123',wilaya:'الجزائر',specialty:'حديد',role:'trader',shopName:'حديد العاصمة',approved:true,demo:true,shopLogoUrl:'',subscriptionStatus:'free',subscriptionExpiry:'',isFake:true},
  {name:'كريم سوف',phone:'0555345678',password:'demo123',wilaya:'الوادي',specialty:'ياجور',role:'trader',shopName:'ياجور الوادي',approved:true,demo:true,shopLogoUrl:'',subscriptionStatus:'free',subscriptionExpiry:'',isFake:true},
  {name:'سعاد مزاب',phone:'0770901234',password:'demo123',wilaya:'غرداية',specialty:'دهان',role:'trader',shopName:'ألوان الجنوب',approved:true,demo:true,shopLogoUrl:'',subscriptionStatus:'free',subscriptionExpiry:'',isFake:true},
  {name:'وهاب غربي',phone:'0556123456',password:'demo123',wilaya:'وهران',specialty:'سباكة',role:'trader',shopName:'سباكة وهران',approved:true,demo:true,shopLogoUrl:'',subscriptionStatus:'free',subscriptionExpiry:'',isFake:true},
  {name:'نادية قسنطينة',phone:'0660783456',password:'demo123',wilaya:'قسنطينة',specialty:'كهرباء',role:'trader',shopName:'كهرباء الجسور',approved:true,demo:true,shopLogoUrl:'',subscriptionStatus:'free',subscriptionExpiry:'',isFake:true},
];
const DEMO_PRODUCTS_RAW = [
  {name:'إسمنت CPJ 45 — كيس 50 كغ',price:650,category:'إسمنت',wilaya:'سطيف',shop:'مواد بناء سطيف',desc:'إسمنت جزائري عالي الجودة، مناسب للبناء والخرسانة.'},
  {name:'حديد التسليح 12 مم — قنطار',price:14500,category:'حديد',wilaya:'الجزائر',shop:'حديد العاصمة',desc:'حديد تسليح معتمد، طول 12 متر، توصيل داخل العاصمة.'},
  {name:'ياجور أحمر 20×20',price:38,category:'ياجور',wilaya:'الوادي',shop:'ياجور الوادي',desc:'ياجور أحمر للبناء، متوفر بكميات كبيرة وأسعار الجملة.'},
  {name:'رمل مغسول — شاحنة',price:8500,category:'رمل وحصى',wilaya:'سطيف',shop:'مواد بناء سطيف',desc:'رمل نظيف مغسول، مناسب للبناء واللياسة.'},
  {name:'دهان أكريليك أبيض — 15 لتر',price:6800,category:'دهان',wilaya:'غرداية',shop:'ألوان الجنوب',desc:'دهان داخلي وخارجي، تغطية ممتازة ويدوم طويلا.'},
  {name:'أنبوب PVC 100 مم',price:1450,category:'سباكة',wilaya:'وهران',shop:'سباكة وهران',desc:'أنابيب سباكة عالية الضغط، مع كل القطع اللازمة.'},
  {name:'كابل كهربائي 2.5 مم',price:4200,category:'كهرباء',wilaya:'قسنطينة',shop:'كهرباء الجسور',desc:'كابل نحاس أصلي، لفة 100 متر، مطابق للمعايير.'},
  {name:'خشب سويدي — لوح',price:3900,category:'نجارة وخشب',wilaya:'الجزائر',shop:'حديد العاصمة',desc:'خشب معالج للنجارة والكوفراج، مقاسات متنوعة.'},
  {name:'عازل مائي — برميل 20 لتر',price:9200,category:'عزل',wilaya:'غرداية',shop:'ألوان الجنوب',desc:'عازل مائي وحراري للأسطح، سهل التطبيق.'},
  {name:'مطرقة بناء + مجموعة أدوات',price:3400,category:'أدوات البناء',wilaya:'وهران',shop:'سباكة وهران',desc:'عدة بناء متكاملة للمحترفين والهواة.'},
];

async function callApi(action:string, args:any){
  const res = await fetch("actions", {method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({action, args})});
  const json:any = await res.json().catch(()=>({}));
  if(!res.ok || json?.error) throw new Error(json?.error || `حدث خطأ (${res.status})`);
  return json.data;
}
function fmt(n:number){ return new Intl.NumberFormat('ar-DZ').format(n); }
function isFakeTrader(v:AccountVal){ return Boolean(v.isFake || v.demo); }
function catIcon(cat:string){
  const c='w-6 h-6';
  if(cat==='إسمنت') return <Layers className={c}/>;
  if(cat==='حديد') return <Hammer className={c}/>;
  if(cat==='ياجور') return <Building2 className={c}/>;
  if(cat==='رمل وحصى') return <Layers className={c}/>;
  if(cat==='سباكة') return <Droplets className={c}/>;
  if(cat==='كهرباء') return <Plug className={c}/>;
  if(cat==='دهان') return <PaintRoller className={c}/>;
  if(cat==='نجارة وخشب') return <TreePine className={c}/>;
  if(cat==='عزل') return <Shield className={c}/>;
  return <Wrench className={c}/>;
}
function catColor(cat:string){
  if(cat==='إسمنت') return '#FFF0DF';
  if(cat==='حديد') return '#EAF0FF';
  if(cat==='دهان') return '#FFEAF2';
  if(cat==='كهرباء') return '#FFF6D6';
  if(cat==='سباكة') return '#E6F7FF';
  return '#EAF7EF';
}
function PlaceholderLogo({label}:{label?:string}){
  return <div className="w-full h-full bg-[var(--navy)] text-white flex flex-col items-center justify-center gap-1 p-3 text-center"><span className="w-10 h-10 rounded-xl bg-[var(--orange)] flex items-center justify-center font-black text-lg">م</span><span className="font-title text-[13px] leading-4">Mawadi</span>{label && <span className="text-[10px] text-white/70 font-bold leading-3 line-clamp-1">{label}</span>}</div>;
}
function LinkedImage({src, alt, className, label}:{src:string; alt:string; className?:string; label?:string}){
  const [failed,setFailed]=useState(false);
  useEffect(()=>{ setFailed(false); },[src]);
  if(!src.trim() || failed) return <div className={className}><PlaceholderLogo label={label}/></div>;
  return <img src={src} alt={alt} onError={()=>setFailed(true)} className={className} loading="lazy" />;
}
function SubscriptionBadge({status}:{status?:string}){
  if(status==='paid') return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full"><BadgeCheck className="w-3 h-3"/> تاجر موثّق - مدفوع</span>;
  return <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">اشتراك مجاني</span>;
}
const FIREBASE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
const BACKEND_SNIPPET = `// Node — على السيرفر فقط، لا تضع Secret Key في التطبيق
// 1) استقبل طلب إنشاء Checkout من التطبيق على مسار سيرفرك الآمن
// 2) من السيرفر فقط، أنشئ Checkout عبر Chargily API
//    باستخدام المفتاح السري من متغيرات البيئة:
//    CHARGILY_SECRET_KEY
// 3) أعد رابط الدفع للتطبيق:
//    { checkout_url: data.checkout_url }
// بيانات الطلب:
//    items: [{ price: 2000, quantity: 1 }]
//    currency: "dzd"
//    description: "Mawadi Trader Subscription - 1 Month"
//    success_url / failure_url: روابط سيرفرك`;

export default function App(){
  const [tab,setTab]=useState<Tab>('products');
  const [accounts,setAccounts]=useState<Rec<AccountVal>[]>([]);
  const [products,setProducts]=useState<Rec<ProductVal>[]>([]);
  const [requests,setRequests]=useState<Rec<RequestVal>[]>([]);
  const [adminCfg,setAdminCfg]=useState<{id:string;email:string;password:string}|null>(null);
  const [firebaseCfg,setFirebaseCfg]=useState<{id:string;value:FirebaseVal}|null>(null);
  const [paymentCfg,setPaymentCfg]=useState<{id:string;value:PaymentVal}|null>(null);
  const [cloudinaryCfg,setCloudinaryCfg]=useState<{id:string;value:CloudinaryVal}|null>(null);
  const [cloudName,setCloudName]=useState(''); const [cloudPreset,setCloudPreset]=useState(''); const [cloudApiKey,setCloudApiKey]=useState(''); const [cloudMsg,setCloudMsg]=useState('');
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState('');
  const [category,setCategory]=useState('الكل');
  const [wilaya,setWilaya]=useState('كل الولايات');
  const [query,setQuery]=useState('');
  const [traderFilter,setTraderFilter]=useState<string|null>(null);
  const [session,setSession]=useState<Rec<AccountVal>|null>(null);
  const [admin,setAdmin]=useState(false);
  const [adminSection,setAdminSection]=useState<'overview'|'integrations'>('overview');
  const [accountView,setAccountView]=useState<'login'|'create'|'reset'>('login');
  const [showAdminModal,setShowAdminModal]=useState(false);
  const [adminEmail,setAdminEmail]=useState('');
  const [adminPass,setAdminPass]=useState('');
  const [adminMsg,setAdminMsg]=useState('');
  const [requestFor,setRequestFor]=useState<Rec<ProductVal>|null>(null);
  const [reqName,setReqName]=useState(''); const [reqPhone,setReqPhone]=useState(''); const [reqQty,setReqQty]=useState('1');
  const [reqMsg,setReqMsg]=useState('');
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState('');
  const [editing,setEditing]=useState<Rec<ProductVal>|null>(null);
  const [editAccount,setEditAccount]=useState<Rec<AccountVal>|null>(null);
  const [editAccName,setEditAccName]=useState(''); const [editAccShop,setEditAccShop]=useState(''); const [editAccPhone,setEditAccPhone]=useState(''); const [editAccPass,setEditAccPass]=useState(''); const [editAccWilaya,setEditAccWilaya]=useState('الجزائر'); const [editAccSpec,setEditAccSpec]=useState(CATEGORIES[0]); const [editAccLogo,setEditAccLogo]=useState(''); const [editAccApproved,setEditAccApproved]=useState(true); const [editAccSub,setEditAccSub]=useState<'free'|'paid'>('free'); const [editAccAdmin,setEditAccAdmin]=useState(false); const [editAccMsg,setEditAccMsg]=useState(''); const [editAccBusy,setEditAccBusy]=useState(false);
  const [editName,setEditName]=useState(''); const [editPrice,setEditPrice]=useState(''); const [editCat,setEditCat]=useState(CATEGORIES[0]); const [editDesc,setEditDesc]=useState(''); const [editImage,setEditImage]=useState('');
  const [loginPhone,setLoginPhone]=useState(''); const [loginPass,setLoginPass]=useState(''); const [loginMsg,setLoginMsg]=useState('');
  const [newName,setNewName]=useState(''); const [newPhone,setNewPhone]=useState(''); const [newPass,setNewPass]=useState(''); const [newWilaya,setNewWilaya]=useState('الجزائر'); const [newRole,setNewRole]=useState<'customer'|'trader'>('customer'); const [newSpec,setNewSpec]=useState(CATEGORIES[0]); const [newShop,setNewShop]=useState(''); const [newLogo,setNewLogo]=useState(''); const [createMsg,setCreateMsg]=useState('');
  const [resetPhone,setResetPhone]=useState(''); const [resetCode,setResetCode]=useState(''); const [resetNew,setResetNew]=useState(''); const [resetStep,setResetStep]=useState(1); const [resetMsg,setResetMsg]=useState('');
  const [pName,setPName]=useState(''); const [pPrice,setPPrice]=useState(''); const [pCat,setPCat]=useState(CATEGORIES[0]); const [pLink,setPLink]=useState(''); const [pDesc,setPDesc]=useState(''); const [pMsg,setPMsg]=useState(''); const [pWilaya,setPWilaya]=useState('الجزائر');
  const [traderWilaya,setTraderWilaya]=useState('كل الولايات'); const [adminWilaya,setAdminWilaya]=useState('كل الولايات');
  const [newAdminEmail,setNewAdminEmail]=useState(''); const [newAdminPass,setNewAdminPass]=useState('');
  const [fbApiKey,setFbApiKey]=useState(''); const [fbAuthDomain,setFbAuthDomain]=useState(''); const [fbProject,setFbProject]=useState('mawadi-4b1e1'); const [fbBucket,setFbBucket]=useState(''); const [fbSender,setFbSender]=useState(''); const [fbAppId,setFbAppId]=useState(''); const [fbMsg,setFbMsg]=useState('');
  const [payKey,setPayKey]=useState(''); const [payBackend,setPayBackend]=useState(''); const [payMsg,setPayMsg]=useState('');
  const [adminTraderFilter,setAdminTraderFilter]=useState<'all'|'real'|'fake'>('all');
  const [confirmDeleteFake,setConfirmDeleteFake]=useState(false);
  const [checkoutOpen,setCheckoutOpen]=useState(false); const [checkoutStep,setCheckoutStep]=useState<'summary'|'checkout'>('summary'); const [cardType,setCardType]=useState<'EDAHABIA'|'CIB'>('EDAHABIA'); const [cardNumber,setCardNumber]=useState(''); const [cardName,setCardName]=useState(''); const [checkoutMsg,setCheckoutMsg]=useState('');

  async function reloadRecords(){
    const [a,p,r,c,fb,pay,cld] = await Promise.all([
      callApi("records.list",{collection:"mawadi_accounts"}),
      callApi("records.list",{collection:"mawadi_products"}),
      callApi("records.list",{collection:"mawadi_requests"}),
      callApi("records.list",{collection:"mawadi_config"}),
      callApi("records.list",{collection:"mawadi_firebase"}),
      callApi("records.list",{collection:"mawadi_payment"}),
      callApi("records.list",{collection:"mawadi_cloudinary"}),
    ]);
    setAccounts((a?.records||[]).map((x:any)=>({id:x.id,value:x.value})));
    setProducts((p?.records||[]).map((x:any)=>({id:x.id,value:x.value})));
    setRequests((r?.records||[]).map((x:any)=>({id:x.id,value:x.value})));
    const cfg = c?.records?.[0];
    if(cfg) setAdminCfg({id:cfg.id,email:cfg.value.adminEmail,password:cfg.value.adminPassword}); else setAdminCfg(null);
    const fbRec = fb?.records?.[0];
    if(fbRec){ setFirebaseCfg({id:fbRec.id,value:fbRec.value}); setFbApiKey(fbRec.value.apiKey||''); setFbAuthDomain(fbRec.value.authDomain||''); setFbProject(fbRec.value.projectId||'mawadi-4b1e1'); setFbBucket(fbRec.value.storageBucket||''); setFbSender(fbRec.value.messagingSenderId||''); setFbAppId(fbRec.value.appId||''); } else { setFirebaseCfg(null); }
    const payRec = pay?.records?.[0];
    if(payRec){ setPaymentCfg({id:payRec.id,value:payRec.value}); setPayKey(payRec.value.publishableKey||''); setPayBackend(payRec.value.backendUrl||''); } else { setPaymentCfg(null); }
    const cldRec = cld?.records?.[0];
    if(cldRec){ setCloudinaryCfg({id:cldRec.id,value:cldRec.value}); setCloudName(cldRec.value.cloudName||''); setCloudPreset(cldRec.value.uploadPreset||''); setCloudApiKey(cldRec.value.apiKey||''); } else { setCloudinaryCfg(null); }
    return {a,p,r,c};
  }

  async function seedIfEmpty(){
    const a = await callApi("records.list",{collection:"mawadi_accounts"});
    const p = await callApi("records.list",{collection:"mawadi_products"});
    if((a?.records?.length||0)>0 || (p?.records?.length||0)>0) return;
    const idMap:Record<string,string>={}; const traderPhone:Record<string,string>={}; const traderName:Record<string,string>={};
    for(let i=0;i<DEMO_TRADERS.length;i++){
      const created = await callApi("records.create",{collection:"mawadi_accounts",value:DEMO_TRADERS[i],idempotency_key:`seed-trader-${i}`});
      idMap[DEMO_TRADERS[i].shopName]=created.id; traderPhone[DEMO_TRADERS[i].shopName]=DEMO_TRADERS[i].phone; traderName[DEMO_TRADERS[i].shopName]=DEMO_TRADERS[i].name;
    }
    for(let i=0;i<DEMO_PRODUCTS_RAW.length;i++){
      const d=DEMO_PRODUCTS_RAW[i];
      const val:ProductVal={name:d.name,price:d.price,category:d.category,wilaya:d.wilaya,traderId:idMap[d.shop]||'',traderName:traderName[d.shop]||'',shopName:d.shop,traderPhone:traderPhone[d.shop]||'',description:d.desc,imageUrl:'',hidden:false,demo:true};
      await callApi("records.create",{collection:"mawadi_products",value:val,idempotency_key:`seed-product-${i}`});
    }
  }

  useEffect(()=>{ (async()=>{
    try{
      setLoading(true); setLoadError('');
      await seedIfEmpty();
      await reloadRecords();
      const cfg = await callApi("records.list",{collection:"mawadi_config"});
      if(!cfg?.records?.length){
        await callApi("records.create",{collection:"mawadi_config",value:{adminEmail:"admin@mawadi.dz",adminPassword:"admin123"},idempotency_key:"mawadi-admin-config"});
        await reloadRecords();
      }
    }catch(e:any){ setLoadError(e?.message||'تعذّر الاتصال بالخدمة. حاول مرة أخرى.'); }
    finally{ setLoading(false); }
  })(); },[]);

  const visibleProducts = useMemo(()=>{
    return products.filter(pr=>{
      if(pr.value.hidden && !admin) return false;
      if(category!=='الكل' && pr.value.category!==category) return false;
      if(wilaya!=='كل الولايات' && pr.value.wilaya!==wilaya) return false;
      if(traderFilter && pr.value.traderId!==traderFilter) return false;
      if(query && !pr.value.name.includes(query) && !pr.value.shopName.includes(query)) return false;
      return true;
    });
  },[products,category,wilaya,traderFilter,query,admin]);
  const traders = useMemo(()=> accounts.filter(a=>a.value.role==='trader' && (traderWilaya==='كل الولايات' || a.value.wilaya===traderWilaya)),[accounts,traderWilaya]);
  const myProducts = useMemo(()=> session ? products.filter(p=>p.value.traderId===session.id) : [],[products,session]);
  const adminTradersFiltered = useMemo(()=>{
    const all = accounts.filter(a=>a.value.role==='trader' && (adminWilaya==='كل الولايات' || a.value.wilaya===adminWilaya));
    if(adminTraderFilter==='real') return all.filter(t=>!isFakeTrader(t.value));
    if(adminTraderFilter==='fake') return all.filter(t=>isFakeTrader(t.value));
    return all;
  },[accounts,adminTraderFilter,adminWilaya]);
  const fakeCount = useMemo(()=> accounts.filter(a=>a.value.role==='trader' && isFakeTrader(a.value)).length,[accounts]);

  async function handleCreateAccount(){
    if(!newName.trim()||!newPhone.trim()||!newPass.trim()){ setCreateMsg('عمّر كل الحقول المطلوبة.'); return; }
    if(accounts.some(a=>a.value.phone===newPhone.trim())){ setCreateMsg('هذا الرقم مسجل من قبل. ادخل بحسابك.'); return; }
    setBusy(true); setCreateMsg('');
    try{
      const val:AccountVal={name:newName.trim(),phone:newPhone.trim(),password:newPass, wilaya:newWilaya, specialty:newRole==='trader'?newSpec:'زبون', role:newRole, shopName:newRole==='trader'?(newShop.trim()||`متجر ${newName.trim()}`):'', approved:newRole==='customer', demo:false, shopLogoUrl:newRole==='trader'?newLogo.trim():'', subscriptionStatus:'free', subscriptionExpiry:'', isFake:false};
      const created = await callApi("records.create",{collection:"mawadi_accounts",value:val,idempotency_key:`account-${newPhone.trim()}-${Date.now()}`});
      await reloadRecords(); setSession({id:created.id,value:val}); setAccountView('login'); setCreateMsg('تم إنشاء حسابك بنجاح ✅'); setNotice(newRole==='trader'?'حساب التاجر بانتظار موافقة الأدمن قبل ما يبان للزبائن.':'مرحبا بيك في موادّي!');
      setNewName(''); setNewPhone(''); setNewPass(''); setNewShop(''); setNewLogo('');
    }catch(e:any){ setCreateMsg(e.message||'تعذّر إنشاء الحساب.'); }
    finally{ setBusy(false); }
  }
  function handleLogin(){
    const found = accounts.find(a=>a.value.phone===loginPhone.trim() && a.value.password===loginPass);
    if(!found){ setLoginMsg('رقم الهاتف أو كلمة المرور غالطة.'); return; }
    setSession(found); setLoginMsg(''); setNotice(`مرحبا بيك، ${found.value.name} 👋`); setTab('account');
  }
  async function handleResetSend(){
    const found = accounts.find(a=>a.value.phone===resetPhone.trim());
    if(!found){ setResetMsg('هذا الرقم موش مسجل.'); return; }
    setResetStep(2); setResetMsg('بعثنا لك رمز التأكيد. للتجربة: 1234');
  }
  async function handleResetConfirm(){
    if(resetCode!=='1234'){ setResetMsg('الرمز غالط. جرّب 1234 للتجربة.'); return; }
    const found = accounts.find(a=>a.value.phone===resetPhone.trim()); if(!found) return;
    setBusy(true);
    try{
      await callApi("records.replace",{collection:"mawadi_accounts",id:found.id,value:{...found.value,password:resetNew}});
      await reloadRecords(); setResetMsg('تم تغيير كلمة المرور ✅ ادخل بحسابك الآن.'); setResetStep(1); setAccountView('login');
    }catch(e:any){ setResetMsg(e.message); } finally{ setBusy(false); }
  }
  async function handleAddProduct(){
    if(!session || session.value.role!=='trader'){ setPMsg('لازم تكون تاجر باش تزيد منتج.'); return; }
    if(!pName.trim()||!pPrice){ setPMsg('اسم المنتج والسعر مطلوبين.'); return; }
    setBusy(true);
    try{
      const val:ProductVal={name:pName.trim(),price:Number(pPrice),category:pCat,wilaya:pWilaya||session.value.wilaya,traderId:session.id,traderName:session.value.name,shopName:session.value.shopName,traderPhone:session.value.phone,description:pDesc,imageUrl:pLink.trim(),hidden:false,demo:false};
      await callApi("records.create",{collection:"mawadi_products",value:val,idempotency_key:`product-${session.id}-${Date.now()}`});
      await reloadRecords(); setPMsg('تمت إضافة المنتج ✅ وراه يبان في قائمة المنتجات.'); setPName(''); setPPrice(''); setPLink(''); setPDesc(''); setTab('products');
    }catch(e:any){ setPMsg(e.message); } finally{ setBusy(false); }
  }
  async function handlePriceRequest(){
    if(!requestFor) return;
    if(!reqName.trim()||!reqPhone.trim()){ setReqMsg('اسمك ورقم هاتفك مطلوبين.'); return; }
    setBusy(true);
    try{
      const val:RequestVal={productName:requestFor.value.name,customerName:reqName.trim(),customerPhone:reqPhone.trim(),quantity:reqQty,traderName:requestFor.value.traderName,shopName:requestFor.value.shopName,date:new Date().toLocaleDateString('ar-DZ')};
      await callApi("records.create",{collection:"mawadi_requests",value:val,idempotency_key:`req-${requestFor.id}-${reqPhone.trim()}-${Date.now()}`});
      await reloadRecords(); setReqMsg('تم إرسال طلب السعر ✅ التاجر راح يتصل بيك قريبا.'); setReqName(''); setReqPhone(''); setReqQty('1');
    }catch(e:any){ setReqMsg(e.message); } finally{ setBusy(false); }
  }
  function handleAdminLogin(){
    const email = adminCfg?.email || 'admin@mawadi.dz'; const pass = adminCfg?.password || 'admin123';
    if(adminEmail.trim()===email && adminPass===pass){ setAdmin(true); setAdminSection('overview'); setAdminMsg(''); setShowAdminModal(false); setTab('settings'); setNotice('دخلت كأدمن ✅'); }
    else setAdminMsg('البريد أو كلمة المرور غالطة.');
  }
  async function approveTrader(id:string,val:AccountVal){ await callApi("records.replace",{collection:"mawadi_accounts",id,value:{...val,approved:true}}); await reloadRecords(); }
  async function deleteTrader(id:string){ await callApi("records.delete",{collection:"mawadi_accounts",id}); await reloadRecords(); }
  async function deleteDemoTraders(){
    setBusy(true); let saved=0; let error:string|null=null;
    try{
      const demos = accounts.filter(a=>a.value.role==='trader' && isFakeTrader(a.value));
      for(const d of demos){ await callApi("records.delete",{collection:"mawadi_accounts",id:d.id}); saved+=1; }
      const demoProds = products.filter(p=>p.value.demo);
      for(const d of demoProds){ await callApi("records.delete",{collection:"mawadi_products",id:d.id}); saved+=1; }
    }catch(e:any){ error=e.message; }
    try{ await reloadRecords(); }catch(e:any){ error = error || e.message; }
    setNotice(error ? `تم حذف ${saved} عنصر، بصح كاين خطأ: ${error}` : `تم حذف كل التجار والمنتجات الوهميين (${saved}) ✅`);
    setConfirmDeleteFake(false); setBusy(false);
  }
  async function toggleHide(p:Rec<ProductVal>){ await callApi("records.replace",{collection:"mawadi_products",id:p.id,value:{...p.value,hidden:!p.value.hidden}}); await reloadRecords(); }
  async function deleteProduct(id:string){ await callApi("records.delete",{collection:"mawadi_products",id}); await reloadRecords(); }
  async function saveEdit(){
    if(!editing) return;
    await callApi("records.replace",{collection:"mawadi_products",id:editing.id,value:{...editing.value,name:editName,price:Number(editPrice),category:editCat,description:editDesc,imageUrl:editImage.trim()}}); await reloadRecords(); setEditing(null); setNotice('تم تعديل المنتج ✅');
  }
  function openEditAccount(rec:Rec<AccountVal>, adminMode=false){
    setEditAccount(rec); setEditAccAdmin(adminMode); setEditAccMsg('');
    setEditAccName(rec.value.name||''); setEditAccShop(rec.value.shopName||''); setEditAccPhone(rec.value.phone||''); setEditAccPass(''); setEditAccWilaya(rec.value.wilaya||'الجزائر'); setEditAccSpec(CATEGORIES.includes(rec.value.specialty)?rec.value.specialty:CATEGORIES[0]); setEditAccLogo(rec.value.shopLogoUrl||''); setEditAccApproved(rec.value.approved); setEditAccSub(rec.value.subscriptionStatus||'free');
  }
  async function saveAccountEdit(){
    if(!editAccount) return;
    if(!editAccName.trim()||!editAccPhone.trim()){ setEditAccMsg('الاسم ورقم الهاتف مطلوبين.'); return; }
    if(accounts.some(a=>a.id!==editAccount.id && a.value.phone===editAccPhone.trim())){ setEditAccMsg('هذا الرقم مسجل لحساب آخر. اختر رقماً آخر.'); return; }
    setEditAccBusy(true); setEditAccMsg('');
    try{
      const isTrader = editAccount.value.role==='trader';
      const updated:AccountVal={...editAccount.value,name:editAccName.trim(),phone:editAccPhone.trim(),password:editAccPass?editAccPass:editAccount.value.password,wilaya:editAccWilaya,specialty:isTrader?editAccSpec:editAccount.value.specialty,shopName:isTrader?editAccShop.trim():editAccount.value.shopName,shopLogoUrl:isTrader?editAccLogo.trim():editAccount.value.shopLogoUrl,approved:editAccAdmin?editAccApproved:editAccount.value.approved,subscriptionStatus:editAccAdmin?editAccSub:editAccount.value.subscriptionStatus};
      await callApi("records.replace",{collection:"mawadi_accounts",id:editAccount.id,value:updated});
      if(isTrader && (updated.shopName!==editAccount.value.shopName || updated.name!==editAccount.value.name)){
        const mine = products.filter(p=>p.value.traderId===editAccount.id);
        for(const p of mine){ await callApi("records.replace",{collection:"mawadi_products",id:p.id,value:{...p.value,shopName:updated.shopName,traderName:updated.name}}); }
      }
      await reloadRecords();
      if(session && session.id===editAccount.id) setSession({id:editAccount.id,value:updated});
      setEditAccount(null); setNotice('تم تحديث حسابك بنجاح ✅');
    }catch(e:any){ setEditAccMsg(e.message||'تعذّر حفظ التعديلات.'); }
    finally{ setEditAccBusy(false); }
  }
  async function changeAdminCreds(){
    if(!adminCfg || !newAdminEmail.trim() || !newAdminPass) { setNotice('عمّر البريد وكلمة المرور الجدد.'); return; }
    await callApi("records.replace",{collection:"mawadi_config",id:adminCfg.id,value:{adminEmail:newAdminEmail.trim(),adminPassword:newAdminPass}}); await reloadRecords(); setNotice('تم تغيير بيانات الأدمن ✅'); setNewAdminEmail(''); setNewAdminPass('');
  }
  async function saveFirebase(){
    if(!fbProject.trim()){ setFbMsg('projectId مطلوب.'); return; }
    setBusy(true); setFbMsg('');
    try{
      const val:FirebaseVal={apiKey:fbApiKey.trim(),authDomain:fbAuthDomain.trim(),projectId:fbProject.trim(),storageBucket:fbBucket.trim(),messagingSenderId:fbSender.trim(),appId:fbAppId.trim()};
      if(firebaseCfg) await callApi("records.replace",{collection:"mawadi_firebase",id:firebaseCfg.id,value:val});
      else await callApi("records.create",{collection:"mawadi_firebase",value:val,idempotency_key:`firebase-${val.projectId}`});
      await reloadRecords(); setFbMsg('تم حفظ إعدادات Firebase ✅');
    }catch(e:any){ setFbMsg(e.message||'تعذّر الحفظ.'); } finally{ setBusy(false); }
  }
  async function savePayment(){
    setBusy(true); setPayMsg('');
    try{
      const val:PaymentVal={publishableKey:payKey.trim(),backendUrl:payBackend.trim()};
      if(paymentCfg) await callApi("records.replace",{collection:"mawadi_payment",id:paymentCfg.id,value:val});
      else await callApi("records.create",{collection:"mawadi_payment",value:val,idempotency_key:'mawadi-payment-config'});
      await reloadRecords(); setPayMsg('تم حفظ إعدادات الدفع ✅');
    }catch(e:any){ setPayMsg(e.message||'تعذّر الحفظ.'); } finally{ setBusy(false); }
  }
  async function saveCloudinary(){
    if(!cloudName.trim() || !cloudPreset.trim()){ setCloudMsg('Cloud Name و Upload Preset مطلوبين.'); return; }
    setBusy(true); setCloudMsg('');
    try{
      const val:CloudinaryVal={cloudName:cloudName.trim(),uploadPreset:cloudPreset.trim(),apiKey:cloudApiKey.trim()};
      if(cloudinaryCfg) await callApi("records.replace",{collection:"mawadi_cloudinary",id:cloudinaryCfg.id,value:val});
      else await callApi("records.create",{collection:"mawadi_cloudinary",value:val,idempotency_key:'mawadi-cloudinary-config'});
      await reloadRecords(); setCloudMsg('تم حفظ إعدادات Cloudinary ✅');
    }catch(e:any){ setCloudMsg(e.message||'تعذّر الحفظ.'); } finally{ setBusy(false); }
  }
  async function handlePaymentSuccess(){
    if(!session) return;
    setBusy(true); setCheckoutMsg('');
    try{
      const expiry = new Date(Date.now()+30*24*60*60*1000).toLocaleDateString('ar-DZ');
      const updated:AccountVal={...session.value,subscriptionStatus:'paid',subscriptionExpiry:expiry};
      await callApi("records.replace",{collection:"mawadi_accounts",id:session.id,value:updated});
      await reloadRecords(); setSession({id:session.id,value:updated}); setCheckoutMsg('تم الدفع بنجاح ✅ اشتراكك مدفوع لمدة 30 يوم.'); setNotice(`تم تفعيل اشتراكك المدفوع حتى ${expiry} ✅`);
      setCheckoutOpen(false); setCheckoutStep('summary');
    }catch(e:any){ setCheckoutMsg(e.message||'تعذّر تحديث الاشتراك.'); } finally{ setBusy(false); }
  }
  function handlePaymentFail(){ setCheckoutMsg('فشل الدفع، حاول مرة أخرى'); }

  const NavBtn = ({id,icon,label}:{id:Tab;icon:React.ReactNode;label:string})=>(
    <button onClick={()=>{setTab(id); setNotice('');}} className={`flex-1 flex flex-col items-center gap-1 py-2 text-[12px] font-bold transition ${tab===id?'text-[var(--orange)]':'text-[#8A96AC]'}`}>
      <span className={`p-1.5 rounded-full ${tab===id?'bg-orange-100':''}`}>{icon}</span>{label}
    </button>
  );

  return (
    <div dir="rtl" data-safe-area-inset-root style={{boxSizing:'border-box',paddingTop:'var(--safe-area-inset-top)',minHeight:'100vh',background:'#FFFFFF',color:'#1A2A4A'}} className="overflow-x-clip">
      <header data-safe-area-sticky-top style={{top:'var(--safe-area-inset-top)'}} className="sticky z-30 header-luxury text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1 justify-center text-center">
            <div className="w-12 h-12 shrink-0 rounded-2xl text-white flex items-center justify-center font-amiri text-[28px] shadow-lg shadow-black/30" style={{background:'linear-gradient(135deg,#FF7A00,#FF9A2E)'}}>م</div>
            <div className="min-w-0 text-center">
              <h1 className="site-title"><span className="text-[#FFB347]">موادّي</span> <span className="text-white" style={{fontFamily:"'Tajawal',sans-serif",fontSize:'22px',fontWeight:500,letterSpacing:'normal'}}>Mawadi</span></h1>
              <p className="site-subtitle leading-5">أول سوق وطني لمواد البناء في الجزائر</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {admin && <span className="hidden sm:flex items-center gap-1 bg-white/15 text-white text-[11px] font-bold px-2 py-1 rounded-full"><ShieldCheck className="w-3.5 h-3.5"/> أدمن</span>}
            <button onClick={()=>setTab('account')} className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center text-white" aria-label="حسابي"><User className="w-5 h-5"/></button>
          </div>
        </div>
        {notice && <div className="max-w-6xl mx-auto px-4 pb-3"><div className="bg-[#EAF7EF] border border-green-200 text-green-800 text-[13px] font-bold px-3 py-2 rounded-xl flex justify-between gap-2"><span>{notice}</span><button onClick={()=>setNotice('')} aria-label="إغلاق"><X className="w-4 h-4"/></button></div></div>}
      </header>

      <main className="max-w-6xl mx-auto px-4 pb-32 pt-4">
        {loadError && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-sm font-bold px-4 py-3 rounded-2xl">⚠️ {loadError} — البيانات المحفوظة غير متوفرة الآن، حاول تحديث الصفحة.</div>}
        {loading && <div className="text-center py-8 font-bold text-[var(--text-soft)]">جارِ تحميل السوق…</div>}

        {tab==='products' && (
          <section>
            <div className="rounded-[22px] hero-luxury text-white p-5 sm:p-6 mb-4 relative overflow-hidden">
              <div className="absolute -left-6 -top-6 w-32 h-32 rounded-full bg-[var(--orange)] opacity-25" />
              <div className="relative">
                <span className="inline-flex items-center gap-1 bg-white/10 border border-[#FFB347]/40 text-[#FFB347] text-[12px] font-bold px-2.5 py-1 rounded-full"><Sparkles className="w-3.5 h-3.5"/> أسعار مباشرة من التجار</span>
                <h2 className="text-[24px] sm:text-[30px] font-black leading-8 mt-3">واش راك تحوّس اليوم؟<br/><span className="text-[#FFB347]">إسمنت، حديد، دهان…</span></h2>
                <p className="text-white/75 text-[13px] font-semibold mt-2">قارن الأسعار، واطلب السعر من أقرب تاجر ليك في ولايتك.</p>
                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <label className="flex-1 flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 text-[var(--navy)]"><Search className="w-4 h-4 text-gray-400 shrink-0"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="حوّس على منتج أو متجر…" className="w-full bg-transparent border-0 text-sm font-bold placeholder:text-gray-400"/></label>
                  <div className="sm:min-w-[220px]"><WilayaSelect value={wilaya} onChange={setWilaya} includeAll /></div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4">
              <button onClick={()=>setCategory('الكل')} className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold border ${category==='الكل'?'bg-[#1A2A4A] text-[#FFB347] border-[#FFB347]/60':'bg-[#E9EDF3] text-[var(--navy)] border-transparent'}`}>الكل</button>
              {CATEGORIES.map(c=><button key={c} onClick={()=>setCategory(c)} className={`shrink-0 px-4 py-2 rounded-full text-[13px] font-bold border ${category===c?'bg-[#1A2A4A] text-[#FFB347] border-[#FFB347]/60':'bg-[#E9EDF3] text-[var(--navy)] border-transparent'}`}>{c}</button>)}
            </div>
            {traderFilter && (()=>{ const t=accounts.find(a=>a.id===traderFilter); return <div className="mt-3 bg-orange-50 border border-orange-200 rounded-xl px-3 py-2 flex items-center justify-between text-[13px] font-bold text-orange-800"><span>منتجات: {t?.value.shopName||'تاجر'}</span><button onClick={()=>setTraderFilter(null)} className="underline">إلغاء الفلتر</button></div>; })()}
            <div className="flex items-center justify-between mt-4 mb-3">
              <h3 className="font-black text-[17px] text-[var(--navy)]">{category==='الكل'?'كل المنتجات':category} <span className="text-[var(--text-soft)] text-[13px] font-bold">({visibleProducts.length})</span></h3>
              <span className="text-[12px] font-bold text-[var(--text-soft)]">{wilaya==='كل الولايات'?'كل الولايات (58 ولاية)':formatWilaya(wilaya)}</span>
            </div>
            {visibleProducts.length===0 ? <div className="bg-white rounded-2xl border border-dashed border-[var(--line)] p-8 text-center"><Package className="w-10 h-10 mx-auto text-gray-300"/><p className="font-bold mt-2">ما كاين حتى منتج بهذا الفلتر.</p><p className="text-sm text-[var(--text-soft)] font-semibold">بدّل الصنف أو الولاية، أو زيد منتج جديد من حسابك كتاجر.</p></div> :
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleProducts.map(p=>(
                <article key={p.id} className="bg-white rounded-[20px] border border-[var(--line)] overflow-hidden card-luxury">
                  <div className="h-36 w-full overflow-hidden bg-[var(--muted)]"><LinkedImage src={p.value.imageUrl||''} alt={p.value.name} label={p.value.shopName} className="w-full h-full object-cover"/></div>
                  <div className="p-4 flex gap-3" style={{background:catColor(p.value.category)}}>
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-white flex items-center justify-center text-[var(--orange)] shadow-sm">{catIcon(p.value.category)}</div>
                    <div className="min-w-0">
                      <span className="text-[11px] font-black bg-white px-2 py-0.5 rounded-full text-[var(--navy)]">{p.value.category}</span>
                      <h4 className="font-black text-[15px] leading-5 mt-1 line-clamp-2">{p.value.name}</h4>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-[13px] text-[var(--text-soft)] font-semibold leading-5 line-clamp-2 min-h-[40px]">{p.value.description||'منتج أصلي بجودة مضمونة، متوفر عند التاجر.'}</p>
                    <div className="flex items-end justify-between mt-3">
                      <div><div className="text-[11px] font-bold text-[var(--text-soft)]">السعر</div><div className="text-[20px] font-black text-[var(--navy)]">{fmt(p.value.price)} <span className="text-[12px] text-[var(--orange)]">دج / DZD</span></div></div>
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-[var(--text-soft)]"><MapPin className="w-3.5 h-3.5 text-[var(--orange)]"/>{formatWilaya(p.value.wilaya)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-[var(--line)]">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[var(--navy)] text-white flex items-center justify-center text-[12px] font-black shrink-0">{(() => { const tr = accounts.find(a=>a.id===p.value.traderId); const logo = tr?.value.shopLogoUrl || ''; return logo ? <LinkedImage src={logo} alt={p.value.shopName} className="w-full h-full object-cover"/> : <span>{p.value.shopName.slice(0,1)}</span>; })()}</div>
                      <div className="min-w-0 flex-1"><p className="text-[13px] font-black truncate">{p.value.shopName}</p><p className="text-[11px] text-[var(--text-soft)] font-semibold">{p.value.traderName} • {p.value.category}</p></div>
                      {p.value.hidden && <span className="text-[11px] font-bold bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1"><EyeOff className="w-3 h-3"/> مخفي</span>}
                    </div>
                    {admin && <div className="mt-2 bg-orange-50 rounded-lg px-2 py-1.5 text-[12px] font-bold text-orange-800 flex items-center gap-1"><Phone className="w-3.5 h-3.5"/> هاتف التاجر (للأدمن فقط): <span dir="ltr">{p.value.traderPhone}</span></div>}
                    <button onClick={()=>{setRequestFor(p); setReqMsg('');}} className="w-full mt-3 btn-gold text-white font-black py-3 rounded-xl text-[14px] transition">اطلب السعر / اتصل بالتاجر</button>
                  </div>
                </article>
              ))}
            </div>}
          </section>
        )}

        {tab==='traders' && (
          <section>
            <h2 className="text-[22px] font-black text-[var(--navy)]">التجار <span className="text-[var(--text-soft)] text-sm">({traders.length})</span></h2>
            <p className="text-[13px] font-semibold text-[var(--text-soft)] mt-1">تجار معتمدين من كل الولايات (58 ولاية). اختر تاجر وشوف واش عندو.</p>
            <div className="mt-3 max-w-sm"><WilayaSelect value={traderWilaya} onChange={setTraderWilaya} includeAll /></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {traders.map(t=>(
                <article key={t.id} className="bg-white rounded-2xl border border-[var(--line)] p-4 flex gap-3">
                  <div className="w-14 h-14 shrink-0 rounded-2xl overflow-hidden bg-[var(--navy)] text-white flex items-center justify-center text-[18px] font-black">{t.value.shopLogoUrl ? <LinkedImage src={t.value.shopLogoUrl} alt={t.value.shopName} className="w-full h-full object-cover"/> : <span>{t.value.shopName.slice(0,1)}</span>}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap"><h3 className="font-black text-[15px]">{t.value.shopName}</h3>{t.value.approved?<span className="text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1"><Check className="w-3 h-3"/> معتمد</span>:<span className="text-[11px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">بانتظار الموافقة</span>}{isFakeTrader(t.value) && <span className="text-[11px] font-bold bg-gray-100 px-2 py-0.5 rounded-full">تجريبي</span>}<SubscriptionBadge status={t.value.subscriptionStatus}/></div>
                    <p className="text-[12px] font-semibold text-[var(--text-soft)] mt-1">{t.value.name} • {t.value.specialty}</p>
                    <p className="text-[12px] font-bold text-[var(--text-soft)] flex items-center gap-1 mt-0.5"><MapPin className="w-3.5 h-3.5 text-[var(--orange)]"/>{formatWilaya(t.value.wilaya)} • {products.filter(p=>p.value.traderId===t.id).length} منتج</p>
                    {t.value.subscriptionStatus==='paid' && t.value.subscriptionExpiry && <p className="text-[11px] font-bold text-green-700 mt-1">الاشتراك ساري حتى: {t.value.subscriptionExpiry}</p>}
                    <button onClick={()=>{setTraderFilter(t.id); setCategory('الكل'); setTab('products');}} className="mt-3 bg-[var(--navy)] text-white text-[13px] font-bold px-4 py-2 rounded-lg">شوف منتجاتو ←</button>
                  </div>
                </article>
              ))}
              {traders.length===0 && <p className="font-bold text-[var(--text-soft)] bg-white p-6 rounded-2xl text-center">ما كاين حتى تاجر بعد. سجّل كتاجر من حسابي.</p>}
            </div>
          </section>
        )}

        {tab==='settings' && (
          <section>
            <h2 className="text-[22px] font-black text-[var(--navy)]">الإعدادات</h2>
            <p className="text-[13px] font-semibold text-[var(--text-soft)] mt-1">إعدادات السوق، والوصول للإدارة للمشرف فقط.</p>
            <div className="bg-white rounded-2xl border border-[var(--line)] p-4 mt-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-[var(--muted)] flex items-center justify-center"><SettingsIcon className="w-5 h-5"/></div><div><p className="font-black">الإعدادات</p><p className="text-[12px] text-[var(--text-soft)] font-semibold">تفضيلات العرض والولاية</p></div></div>
                <span className="text-[12px] font-bold">العربية • دج</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-[var(--bg)] rounded-xl p-3"><p className="text-[18px] font-black">{traders.length}</p><p className="text-[11px] font-bold text-[var(--text-soft)]">تاجر</p></div>
                <div className="bg-[var(--bg)] rounded-xl p-3"><p className="text-[18px] font-black">{products.length}</p><p className="text-[11px] font-bold text-[var(--text-soft)]">منتج</p></div>
                <div className="bg-[var(--bg)] rounded-xl p-3"><p className="text-[18px] font-black">{requests.length}</p><p className="text-[11px] font-bold text-[var(--text-soft)]">طلب سعر</p></div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[var(--line)] p-4 mt-4">
              <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-orange-100 text-[var(--orange)] flex items-center justify-center font-black text-xl">م</div><div><h3 className="font-black">حول موادّي — Mawadi</h3><p className="text-[12px] text-[var(--text-soft)] font-semibold">أول سوق وطني لمواد البناء في الجزائر</p></div></div>
              <p className="text-[13px] font-semibold text-[var(--text-soft)] leading-6 mt-3">قارن أسعار مواد البناء مباشرة من التجار، واطلب السعر من أقرب تاجر في ولايتك. اللغة: العربية • العملة: دينار جزائري (دج).</p>
            </div>

            <button onClick={()=>setShowAdminModal(true)} className="w-full mt-3 bg-white border border-[var(--line)] rounded-2xl p-4 flex items-center justify-between text-right">
              <span className="flex items-center gap-3"><span className="w-11 h-11 rounded-xl bg-orange-100 text-[var(--orange)] flex items-center justify-center"><ShieldCheck className="w-5 h-5"/></span><span><span className="block font-black">الإعدادات</span><span className="block text-[11px] text-[var(--text-soft)] font-semibold opacity-60">إدارة</span></span></span>
              <span className="text-[var(--text-soft)]">‹</span>
            </button>
            {admin ? (
              <div className="bg-white rounded-2xl border border-[var(--line)] p-4 mt-4">
                <div className="flex items-center justify-between flex-wrap gap-2"><h3 className="font-black text-[17px] flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[var(--orange)]"/> لوحة الأدمن</h3><button onClick={()=>{setAdmin(false); setAdminSection('overview'); setNotice('خرجت من حساب الأدمن.');}} className="flex items-center gap-1 text-[13px] font-bold text-red-600"><LogOut className="w-4 h-4"/> خروج الأدمن</button></div>
                <div className="flex gap-2 mt-3">
                  <button onClick={()=>setAdminSection('overview')} className={`flex-1 py-2.5 rounded-xl font-black text-[13px] border ${adminSection==='overview'?'bg-[var(--navy)] text-white border-[var(--navy)]':'bg-white text-[var(--navy)] border-[var(--line)]'}`}>لوحة الإدارة</button>
                  <button onClick={()=>setAdminSection('integrations')} className={`flex-1 py-2.5 rounded-xl font-black text-[13px] border ${adminSection==='integrations'?'bg-[var(--orange)] text-white border-[var(--orange)]':'bg-white text-[var(--navy)] border-[var(--line)]'}`}>إعدادات Firebase و الدفع</button>
                </div>

                {adminSection==='integrations' ? (
                  <div className="mt-4">
                    <div className="bg-white rounded-2xl border border-[var(--line)] p-4">
                      <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-orange-100 text-[var(--orange)] flex items-center justify-center"><Database className="w-5 h-5"/></div><div><h3 className="font-black">ربط Firebase</h3><p className="text-[12px] text-[var(--text-soft)] font-semibold">مشروع mawadi-4b1e1 — جاهز للربط</p></div></div></div>
                      <div className={`mt-3 rounded-xl px-3 py-2 text-[13px] font-bold ${firebaseCfg ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>{firebaseCfg ? `مرتبط بـ ${firebaseCfg.value.projectId||'mawadi-4b1e1'} ✅` : 'غير مرتبط - وضع تجريبي محلي'}</div>
                      <p className="text-[12px] font-semibold text-[var(--text-soft)] mt-2 leading-5">كل الحسابات والمنتجات وطلبات السعر محفوظة في قاعدة بيانات التطبيق (موازية لـ Firestore)، وليست في متصفح الجهاز فقط. بعد تسجيل الخروج وإغلاق التطبيق وإعادة فتحه، يبقى حسابك ويعمل تسجيل الدخول بنفس الرقم وكلمة المرور.</p>
                      <div className="grid gap-2 mt-3">
                        <label className="text-[12px] font-black">apiKey</label><input value={fbApiKey} onChange={e=>setFbApiKey(e.target.value)} placeholder="AIza..." dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <label className="text-[12px] font-black">authDomain</label><input value={fbAuthDomain} onChange={e=>setFbAuthDomain(e.target.value)} placeholder="mawadi-4b1e1.firebaseapp.com" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <label className="text-[12px] font-black">projectId</label><input value={fbProject} onChange={e=>setFbProject(e.target.value)} placeholder="mawadi-4b1e1" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <label className="text-[12px] font-black">storageBucket</label><input value={fbBucket} onChange={e=>setFbBucket(e.target.value)} placeholder="mawadi-4b1e1.appspot.com" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <label className="text-[12px] font-black">messagingSenderId</label><input value={fbSender} onChange={e=>setFbSender(e.target.value)} placeholder="123456789" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <label className="text-[12px] font-black">appId</label><input value={fbAppId} onChange={e=>setFbAppId(e.target.value)} placeholder="1:123...:web:..." dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <button onClick={saveFirebase} disabled={busy} className="bg-[var(--navy)] text-white font-black py-3 rounded-xl text-sm disabled:opacity-50">حفظ إعدادات Firebase</button>
                        {fbMsg && <p className="text-[13px] font-bold text-green-700 bg-green-50 rounded-lg p-2">{fbMsg}</p>}
                      </div>
                      <div className="mt-4 border-t pt-3">
                        <h4 className="font-black text-sm flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[var(--orange)]"/> قواعد Firestore — للتجربة فقط</h4>
                        <pre dir="ltr" className="mt-2 bg-[#0F1830] text-green-200 text-[11px] leading-5 rounded-xl p-3 overflow-x-auto text-left whitespace-pre">{FIREBASE_RULES}</pre>
                        <p className="text-[12px] font-bold text-amber-800 bg-amber-50 rounded-lg p-2 mt-2">للتجربة فقط - بدلها في الإنتاج</p>
                      </div>
                      <div className="mt-4 border-t pt-3">
                        <h4 className="font-black text-sm">بنية المجموعات (Collections)</h4>
                        <div className="grid gap-2 mt-2 text-[12px] font-semibold leading-5">
                          <div className="bg-[var(--bg)] rounded-xl p-3"><p className="font-black text-[var(--navy)]">traders</p><p dir="ltr" className="text-left">name, shopName, phone, wilaya, specialty, shopLogoUrl, subscriptionStatus, subscriptionExpiry, approved, isFake</p></div>
                          <div className="bg-[var(--bg)] rounded-xl p-3"><p className="font-black text-[var(--navy)]">products</p><p dir="ltr" className="text-left">name, price, category, imageUrl, traderId, shopName, wilaya, visible, createdAt</p></div>
                          <div className="bg-[var(--bg)] rounded-xl p-3"><p className="font-black text-[var(--navy)]">priceRequests</p><p dir="ltr" className="text-left">productId, productName, customerPhone, traderId, traderName, date</p></div>
                        </div>
                        <p className="text-[11px] text-[var(--text-soft)] font-semibold mt-2">ملاحظة: الصور بالرابط فقط — لا نستعمل Firebase Storage.</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[var(--line)] p-4 mt-4">
                      <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-orange-100 text-[var(--orange)] flex items-center justify-center"><Package className="w-5 h-5"/></div><div><h3 className="font-black">إعدادات الصور - Cloudinary (مجاني)</h3><p className="text-[12px] text-[var(--text-soft)] font-semibold">الحل 3: Firebase للبيانات + Cloudinary للصور — بلا Blaze وبلا بطاقة بنكية</p></div></div>
                      <div className={`mt-3 rounded-xl px-3 py-2 text-[13px] font-bold ${cloudinaryCfg ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>{cloudinaryCfg ? `مهيأ — الإعدادات محفوظة: ${cloudinaryCfg.value.cloudName}` : 'غير مهيأ — فعّل Cloudinary في لوحة الأدمن لتفعيل الرفع من الجهاز'}</div>
                      <p className="text-[12px] font-bold text-green-800 bg-green-50 rounded-lg p-2 mt-2">رفع الصور من الجهاز متاح الآن — استعمل زر "اختر صورة" في كل استمارة.</p>
                      <p className="text-[12px] font-bold text-[var(--text-soft)] bg-[var(--bg)] rounded-lg p-2 mt-2">اسم الـ Preset لازم يكون مطابق تماماً لما أنشأته في Cloudinary (حساس لحالة الأحرف).</p>
                      {cloudinaryCfg && <p className="text-[12px] font-bold text-green-800 bg-green-50 rounded-lg p-2 mt-2" dir="ltr">القيم المحفوظة حالياً: Cloud Name: {cloudinaryCfg.value.cloudName} • Preset: {cloudinaryCfg.value.uploadPreset}</p>}
                      <div className="grid gap-2 mt-3">
                        <label className="text-[12px] font-black">Cloud Name *</label><input value={cloudName} onChange={e=>setCloudName(e.target.value)} placeholder="مثال: mawadi-shop" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <label className="text-[12px] font-black">Upload Preset (Unsigned) *</label><input value={cloudPreset} onChange={e=>setCloudPreset(e.target.value)} placeholder="مثال: mawadi_unsigned" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <label className="text-[12px] font-black">API Key (اختياري - اتركه فارغاً للرفع غير الموقّع)</label><input value={cloudApiKey} onChange={e=>setCloudApiKey(e.target.value)} placeholder="اتركه فارغاً" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <button onClick={saveCloudinary} disabled={busy} className="bg-[var(--navy)] text-white font-black py-3 rounded-xl text-sm disabled:opacity-50">حفظ إعدادات Cloudinary</button>
                        {cloudMsg && <p className="text-[13px] font-bold text-green-700 bg-green-50 rounded-lg p-2">{cloudMsg}</p>}
                      </div>
                      <div className="mt-4 border-t pt-3"><h4 className="font-black text-sm">كيفاش تضبط Cloudinary؟</h4><ol className="text-[13px] font-semibold text-[var(--text-soft)] leading-6 mt-2 list-decimal pr-5"><li>ادخل cloudinary.com وافتح حساب مجاني.</li><li>روح Settings &gt; Upload &gt; Add upload preset &gt; Signing Mode = Unsigned &gt; Save.</li><li>انسخ Cloud Name + Preset name والصقهم هنا.</li></ol><p className="text-[12px] font-bold text-green-700 bg-green-50 rounded-lg p-2 mt-2">الخطة المجانية: حتى 25GB — كافية لصور المتجر.</p></div>
                    </div>

                    <div className="bg-white rounded-2xl border border-[var(--line)] p-4 mt-4">
                      <div className="flex items-center gap-3"><div className="w-11 h-11 rounded-xl bg-orange-100 text-[var(--orange)] flex items-center justify-center"><CreditCard className="w-5 h-5"/></div><div><h3 className="font-black">إعدادات الدفع</h3><p className="text-[12px] text-[var(--text-soft)] font-semibold">Chargily Pay V2 — EDAHABIA و CIB</p></div></div>
                      <div className="grid gap-2 mt-3">
                        <label className="text-[12px] font-black">Chargily Publishable Key (pk_...)</label><input value={payKey} onChange={e=>setPayKey(e.target.value)} placeholder="pk_..." dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <label className="text-[12px] font-black">Backend Checkout URL</label><input value={payBackend} onChange={e=>setPayBackend(e.target.value)} placeholder="https://your-server.com/api/create-checkout" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/>
                        <button onClick={savePayment} disabled={busy} className="bg-[var(--orange)] text-white font-black py-3 rounded-xl text-sm disabled:opacity-50">حفظ إعدادات الدفع</button>
                        {payMsg && <p className="text-[13px] font-bold text-green-700 bg-green-50 rounded-lg p-2">{payMsg}</p>}
                      </div>
                      <p className="text-[12px] font-bold text-red-700 bg-red-50 border border-red-100 rounded-xl p-3 mt-3 leading-5">⚠️ الـ Secret Key يبقى في السيرفر فقط، أبداً في التطبيق. في التطبيق نستعمل Publishable Key فقط، وإنشاء الدفع يتم عبر نداء آمن للسيرفر.</p>
                      <div className="mt-3"><h4 className="font-black text-sm flex items-center gap-2"><KeyRound className="w-4 h-4 text-[var(--orange)]"/> مثال السيرفر (Node) لإنشاء Checkout</h4><pre dir="ltr" className="mt-2 bg-[#0F1830] text-green-200 text-[11px] leading-5 rounded-xl p-3 overflow-x-auto text-left whitespace-pre">{BACKEND_SNIPPET}</pre></div>
                    </div>
                  </div>
                ) : (
                  <div>
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="bg-orange-50 rounded-xl p-3"><p className="text-[20px] font-black text-[var(--orange)]">{traders.length}</p><p className="text-[11px] font-bold">إجمالي التجار</p></div>
                  <div className="bg-blue-50 rounded-xl p-3"><p className="text-[20px] font-black text-[var(--navy)]">{products.length}</p><p className="text-[11px] font-bold">إجمالي المنتجات</p></div>
                  <div className="bg-green-50 rounded-xl p-3"><p className="text-[20px] font-black text-green-700">{requests.length}</p><p className="text-[11px] font-bold">طلبات السعر</p></div>
                </div>
                {!confirmDeleteFake ? (
                  <button onClick={()=>setConfirmDeleteFake(true)} disabled={busy} className="w-full mt-3 bg-red-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50">حذف كل التجار الوهميين ({fakeCount})</button>
                ) : (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3"><p className="text-[13px] font-bold text-red-800">متأكد؟ راح نحذف {fakeCount} تاجر وهمي (isFake == true) ومنتجاتهم التجريبية. هذا الإجراء ما يرجعش.</p><div className="flex gap-2 mt-2"><button onClick={deleteDemoTraders} disabled={busy} className="flex-1 bg-red-600 text-white font-bold py-2.5 rounded-lg text-sm disabled:opacity-50">نعم، احذف الكل</button><button onClick={()=>setConfirmDeleteFake(false)} className="flex-1 bg-white border font-bold py-2.5 rounded-lg text-sm">إلغاء</button></div></div>
                )}
                <div className="mt-4 border-t pt-3">
                  <h4 className="font-black">تغيير بيانات الأدمن (للمالك فقط)</h4>
                  <div className="grid sm:grid-cols-2 gap-2 mt-2"><input value={newAdminEmail} onChange={e=>setNewAdminEmail(e.target.value)} placeholder="بريد أدمن جديد" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white"/><input value={newAdminPass} onChange={e=>setNewAdminPass(e.target.value)} placeholder="كلمة مرور جديدة" type="password" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white"/></div>
                  <button onClick={changeAdminCreds} className="mt-2 bg-[var(--navy)] text-white font-bold px-4 py-2 rounded-lg text-sm">حفظ بيانات الأدمن</button>
                </div>
                <div className="mt-4 border-t pt-3"><h4 className="font-black mb-2">كل التجار</h4>
                  <div className="max-w-sm mb-3"><WilayaSelect value={adminWilaya} onChange={setAdminWilaya} includeAll /></div>
                  <div className="flex gap-2 mb-3"><button onClick={()=>setAdminTraderFilter('all')} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${adminTraderFilter==='all'?'bg-[var(--navy)] text-white':'bg-white'}`}>الكل ({accounts.filter(a=>a.value.role==='trader').length})</button><button onClick={()=>setAdminTraderFilter('real')} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${adminTraderFilter==='real'?'bg-green-600 text-white':'bg-white'}`}>الحقيقيون ({accounts.filter(a=>a.value.role==='trader' && !isFakeTrader(a.value)).length})</button><button onClick={()=>setAdminTraderFilter('fake')} className={`px-3 py-1.5 rounded-full text-[12px] font-bold border ${adminTraderFilter==='fake'?'bg-red-600 text-white':'bg-white'}`}>الوهميون ({fakeCount})</button></div>
                  <div className="space-y-2">{adminTradersFiltered.map(t=><div key={t.id} className="flex flex-wrap items-center gap-2 justify-between bg-[var(--bg)] rounded-xl p-3"><div className="min-w-0 flex items-center gap-2"><div className="w-10 h-10 rounded-lg overflow-hidden bg-[var(--navy)] text-white flex items-center justify-center font-black shrink-0">{t.value.shopLogoUrl ? <LinkedImage src={t.value.shopLogoUrl} alt={t.value.shopName} className="w-full h-full object-cover"/> : <span>{t.value.shopName.slice(0,1)}</span>}</div><div className="min-w-0"><p className="font-bold text-sm flex flex-wrap gap-1 items-center">{t.value.shopName} — {t.value.name} {isFakeTrader(t.value) && <span className="text-[11px] font-bold bg-gray-200 px-2 py-0.5 rounded-full">تجريبي • isFake=true</span>} {!isFakeTrader(t.value) && <span className="text-[11px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">حقيقي</span>}</p><p className="text-[12px] text-[var(--text-soft)] font-semibold" dir="ltr">{t.value.phone} • {formatWilaya(t.value.wilaya)} • {t.value.approved?'معتمد':'بانتظار'}</p><SubscriptionBadge status={t.value.subscriptionStatus}/></div></div><div className="flex gap-1.5"><button onClick={()=>openEditAccount(t,true)} className="bg-[var(--orange)] text-white text-[12px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1"><Pencil className="w-3 h-3"/> تعديل</button><button onClick={()=>approveTrader(t.id,t.value)} className="bg-green-600 text-white text-[12px] font-bold px-3 py-1.5 rounded-lg">موافقة</button><button onClick={()=>deleteTrader(t.id)} className="bg-red-100 text-red-700 text-[12px] font-bold px-3 py-1.5 rounded-lg">حذف</button></div></div>)}{adminTradersFiltered.length===0 && <p className="text-sm font-semibold text-[var(--text-soft)]">ما كاين حتى تاجر في هذا الفلتر.</p>}</div></div>
                <div className="mt-4 border-t pt-3"><h4 className="font-black mb-2">كل المنتجات</h4><div className="space-y-2">{products.map(p=><div key={p.id} className="bg-[var(--bg)] rounded-xl p-3"><div className="flex flex-wrap justify-between gap-2"><div className="flex gap-2 items-start"><div className="w-14 h-14 rounded-lg overflow-hidden bg-white shrink-0"><LinkedImage src={p.value.imageUrl||''} alt={p.value.name} className="w-full h-full object-cover"/></div><div><p className="font-bold text-sm">{p.value.name}</p><p className="text-[12px] text-[var(--text-soft)] font-semibold">{p.value.shopName} • {fmt(p.value.price)} دج • {p.value.hidden?'مخفي':'ظاهر'}</p></div></div><div className="flex gap-1.5"><button onClick={()=>{setEditing(p); setEditName(p.value.name); setEditPrice(String(p.value.price)); setEditCat(p.value.category); setEditDesc(p.value.description); setEditImage(p.value.imageUrl||'');}} className="bg-white border text-[12px] font-bold px-3 py-1.5 rounded-lg">تعديل</button><button onClick={()=>toggleHide(p)} className="bg-white border text-[12px] font-bold px-3 py-1.5 rounded-lg">{p.value.hidden?'إظهار':'إخفاء'}</button><button onClick={()=>deleteProduct(p.id)} className="bg-red-100 text-red-700 text-[12px] font-bold px-3 py-1.5 rounded-lg">حذف</button></div></div>{editing?.id===p.id && <div className="grid gap-2 mt-2"><input value={editName} onChange={e=>setEditName(e.target.value)} className="border rounded-lg px-2 py-2 text-sm font-semibold bg-white"/><input value={editPrice} onChange={e=>setEditPrice(e.target.value)} type="number" className="border rounded-lg px-2 py-2 text-sm font-semibold bg-white"/><select value={editCat} onChange={e=>setEditCat(e.target.value)} className="border rounded-lg px-2 py-2 text-sm font-semibold bg-white">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select><label className="text-sm font-black">أو الصق رابط الصورة هنا</label><input value={editImage} onChange={e=>setEditImage(e.target.value)} placeholder="رابط صورة المنتج" dir="ltr" className="border rounded-lg px-2 py-2 text-sm font-semibold bg-white text-left"/><label className="block text-center bg-[var(--orange)] text-white font-black py-3 rounded-xl cursor-pointer">📷 اختر صورة من هاتفك / حاسوبك<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f){ setEditImage(URL.createObjectURL(f)); }}} /></label><div className="h-24 rounded-lg overflow-hidden bg-white border"><LinkedImage src={editImage} alt={editName||'معاينة المنتج'} className="w-full h-full object-cover"/></div><textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} className="border rounded-lg px-2 py-2 text-sm font-semibold bg-white"/><button onClick={saveEdit} className="bg-[var(--orange)] text-white font-bold py-2 rounded-lg text-sm">حفظ التعديل</button></div>}</div>)}</div></div>
                <div className="mt-4 border-t pt-3"><h4 className="font-black mb-2">طلبات السعر</h4>{requests.length===0?<p className="text-sm font-semibold text-[var(--text-soft)]">ما كاين حتى طلب بعد.</p>:<div className="space-y-2">{requests.map(r=><div key={r.id} className="bg-[var(--bg)] rounded-xl p-3 text-sm font-semibold"><p className="font-black">{r.value.productName}</p><p>الزبون: {r.value.customerName} • <span dir="ltr">{r.value.customerPhone}</span></p><p>التاجر: {r.value.shopName} • الكمية: {r.value.quantity} • {r.value.date}</p></div>)}</div>}</div>
                  </div>
                )}
              </div>
            ):(
              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 mt-3 text-[13px] font-semibold text-orange-900">🔐 منطقة الأدمن محمية. اضغط على «الإعدادات» فوق وادخل ببريد وكلمة مرور المالك.</div>
            )}
            <p className="text-center text-[12px] text-[var(--text-soft)] font-semibold mt-6">موادّي © 2026 — سوق وطني جزائري لمواد البناء • الإصدار 1.0</p>
          </section>
        )}

        {tab==='account' && (
          <section>
            {session ? (
              <div>
                <div className="bg-white rounded-[22px] border-2 border-[var(--orange)] p-5">
                  <div className="flex items-center justify-between gap-3 flex-wrap"><h2 className="text-[20px] font-black flex items-center gap-2"><Pencil className="w-5 h-5 text-[var(--orange)]"/> حسابي</h2><SubscriptionBadge status={session.value.subscriptionStatus}/></div>
                  <div className="flex items-center gap-3 mt-4">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--navy)] text-white flex items-center justify-center text-2xl font-black shrink-0">{session.value.role==='trader' && session.value.shopLogoUrl ? <LinkedImage src={session.value.shopLogoUrl} alt={session.value.shopName||session.value.name} className="w-full h-full object-cover"/> : <span>{(session.value.shopName||session.value.name).slice(0,1)}</span>}</div>
                    <div className="min-w-0 flex-1 text-sm font-bold leading-6"><p className="font-black text-[16px] truncate">{session.value.role==='trader'?session.value.shopName:session.value.name}</p><p className="text-[var(--text-soft)]">الاسم: {session.value.name}</p><p className="text-[var(--text-soft)]" dir="ltr">{session.value.phone}</p><p className="text-[var(--text-soft)]">{formatWilaya(session.value.wilaya)} • {session.value.role==='trader'?session.value.specialty:'زبون'}</p></div>
                  </div>
                  {session.value.role==='trader' && session.value.shopLogoUrl && <p className="text-[12px] font-bold text-[var(--text-soft)] mt-2">معاينة شعار المحل ظاهرة فوق. إذا غيّرت الشعار، سيتحدّث في بطاقة التاجر والمنتجات.</p>}
                  <button onClick={()=>openEditAccount(session,false)} className="w-full mt-4 bg-[var(--orange)] hover:bg-[#E86E00] text-white font-black py-3.5 rounded-xl text-[15px] flex items-center justify-center gap-2 transition"><Pencil className="w-5 h-5"/> {session.value.role==='trader'?'تعديل حسابي / تعديل معلومات المحل':'تعديل حسابي'}</button>
                  <p className="text-[12px] font-semibold text-[var(--text-soft)] mt-2 text-center">عدّل اسمك، هاتفك، ولايتك، ومعلومات محلك وشعاره من هنا.</p>
                </div>
                <div className="bg-[var(--navy)] text-white rounded-[22px] p-5 flex items-center gap-4 mt-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[var(--orange)] flex items-center justify-center text-2xl font-black shrink-0">{session.value.shopLogoUrl ? <LinkedImage src={session.value.shopLogoUrl} alt={session.value.shopName||session.value.name} className="w-full h-full object-cover"/> : <span>{session.value.name.slice(0,1)}</span>}</div>
                  <div className="min-w-0 flex-1"><h2 className="text-[20px] font-black truncate">{session.value.name}</h2><p className="text-white/75 text-[13px] font-semibold">{session.value.role==='trader'?'تاجر • '+session.value.shopName:'زبون'} • {formatWilaya(session.value.wilaya)}</p><p className="text-white/60 text-[12px] font-semibold" dir="ltr">{session.value.phone}</p></div>
                  <button onClick={()=>{setSession(null); setNotice('خرجت من حسابك.');}} className="bg-white/15 px-3 py-2 rounded-lg text-[12px] font-bold shrink-0">خروج</button>
                </div>
                {session.value.role==='trader' && (
                  <>
                  <div className="bg-white rounded-2xl border-2 border-[var(--orange)] p-4 mt-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap"><h3 className="font-black text-[16px] flex items-center gap-2"><CreditCard className="w-5 h-5 text-[var(--orange)]"/> اشتراك التاجر</h3><SubscriptionBadge status={session.value.subscriptionStatus}/></div>
                    <div className="grid grid-cols-2 gap-2 mt-3 text-center">
                      <div className="bg-[var(--bg)] rounded-xl p-3"><p className="text-[11px] font-bold text-[var(--text-soft)]">حالة الاشتراك</p><p className="font-black mt-1">{session.value.subscriptionStatus==='paid'?'مدفوع ✅':'مجاني'}</p></div>
                      <div className="bg-[var(--bg)] rounded-xl p-3"><p className="text-[11px] font-bold text-[var(--text-soft)]">ينتهي في</p><p className="font-black mt-1">{session.value.subscriptionStatus==='paid' && session.value.subscriptionExpiry ? session.value.subscriptionExpiry : '—'}</p></div>
                    </div>
                    {session.value.subscriptionStatus!=='paid' && <p className="text-[12px] font-semibold text-[var(--text-soft)] mt-2 leading-5">التجار المجانيون يقدروا يعرضوا منتجاتهم، بصح الاشتراك المدفوع يعطيك شارة «تاجر موثّق - مدفوع» وأولوية أكبر في الظهور.</p>}
                    <button onClick={()=>{setCheckoutStep('summary'); setCheckoutMsg(''); setCheckoutOpen(true);}} className="w-full mt-3 bg-[var(--orange)] text-white font-black py-3.5 rounded-xl text-[15px]">جدد اشتراكي - 2000 دج / شهر</button>
                    {checkoutMsg && <p className="text-[13px] font-bold text-green-700 bg-green-50 rounded-lg p-2 mt-2">{checkoutMsg}</p>}
                  </div>
                  <div className="bg-white rounded-2xl border border-[var(--line)] p-4 mt-4">
                    <h3 className="font-black text-[16px] flex items-center gap-2"><Plus className="w-5 h-5 text-[var(--orange)]"/> زيد منتج جديد</h3>
                    {!session.value.approved && <p className="text-[12px] font-bold text-amber-700 bg-amber-50 rounded-lg p-2 mt-2">حسابك بانتظار موافقة الأدمن، بصح تقدر تزيد منتجاتك من هنا.</p>}
                    <div className="grid gap-2 mt-3"><label className="text-sm font-black">ولاية المنتج — 58 ولاية</label><WilayaSelect value={pWilaya} onChange={setPWilaya} /><input value={pName} onChange={e=>setPName(e.target.value)} placeholder="اسم المنتج *" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white"/><div className="grid grid-cols-2 gap-2"><input value={pPrice} onChange={e=>setPPrice(e.target.value)} type="number" placeholder="السعر بالدج *" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white"/><select value={pCat} onChange={e=>setPCat(e.target.value)} className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div><label className="text-sm font-black">أو الصق رابط الصورة هنا</label><input value={pLink} onChange={e=>setPLink(e.target.value)} placeholder="رابط صورة المنتج" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white" dir="ltr"/><label className="block text-center bg-[var(--orange)] text-white font-black py-3 rounded-xl cursor-pointer">📷 اختر صورة من هاتفك / حاسوبك<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f){ setPLink(URL.createObjectURL(f)); }}} /></label>{pLink.trim() && <div className="h-36 rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--muted)]"><LinkedImage src={pLink} alt={pName||'معاينة المنتج'} className="w-full h-full object-cover"/></div>}<textarea value={pDesc} onChange={e=>setPDesc(e.target.value)} placeholder="وصف المنتج…" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white min-h-[70px]"/><button onClick={handleAddProduct} disabled={busy} className="bg-[var(--orange)] text-white font-black py-3 rounded-xl disabled:opacity-50">إضافة المنتج</button>{pMsg && <p className="text-[13px] font-bold text-green-700 bg-green-50 rounded-lg p-2">{pMsg}</p>}</div>
                    <div className="mt-4 border-t pt-3"><h4 className="font-black text-sm">منتجاتي ({myProducts.length})</h4><div className="space-y-2 mt-2">{myProducts.map(p=><div key={p.id} className="flex justify-between gap-2 items-center bg-[var(--bg)] rounded-xl p-3 text-sm font-bold"><span className="flex items-center gap-2 min-w-0"><span className="w-10 h-10 rounded-lg overflow-hidden bg-white shrink-0 block"><LinkedImage src={p.value.imageUrl||''} alt={p.value.name} className="w-full h-full object-cover"/></span><span className="truncate">{p.value.name}</span></span><span className="text-[var(--orange)] shrink-0">{fmt(p.value.price)} دج</span></div>)}{myProducts.length===0 && <p className="text-[13px] text-[var(--text-soft)] font-semibold">ما عندك حتى منتج بعد.</p>}</div></div>
                  </div>
                  </>
                )}
                {session.value.role==='customer' && <div className="bg-white rounded-2xl border border-[var(--line)] p-4 mt-4"><h3 className="font-black">طلباتي</h3><p className="text-sm font-semibold text-[var(--text-soft)] mt-1">طلبات السعر اللي بعثتها: {requests.filter(r=>r.value.customerPhone===session.value.phone).length}</p><div className="space-y-2 mt-2">{requests.filter(r=>r.value.customerPhone===session.value.phone).map(r=><div key={r.id} className="bg-[var(--bg)] rounded-xl p-3 text-sm font-semibold">{r.value.productName} — {r.value.shopName} • {r.value.date}</div>)}</div></div>}
              </div>
            ):(
              <div className="max-w-md mx-auto">
                <h2 className="text-[24px] font-black text-center text-[var(--navy)]">حسابي الشخصي</h2><p className="text-center text-[13px] font-semibold text-[var(--text-soft)] mt-1">ادخل باش تطلب الأسعار وتتابع طلباتك.</p>
                {accountView==='login' && <div className="bg-white rounded-[22px] border border-[var(--line)] p-5 mt-4"><label className="block text-sm font-black mb-1">رقم الهاتف</label><input value={loginPhone} onChange={e=>setLoginPhone(e.target.value)} placeholder="05 XX XX XX XX" dir="ltr" className="w-full border border-[var(--line)] rounded-xl px-3 py-3 text-sm font-bold bg-white mb-3 text-left"/><label className="block text-sm font-black mb-1">كلمة المرور</label><input value={loginPass} onChange={e=>setLoginPass(e.target.value)} type="password" placeholder="••••••••" className="w-full border border-[var(--line)] rounded-xl px-3 py-3 text-sm font-bold bg-white"/><button onClick={()=>setAccountView('reset')} className="text-[12px] font-bold text-[var(--orange)] mt-2">نسيت كلمة المرور؟</button>{loginMsg && <p className="text-[13px] font-bold text-red-600 bg-red-50 rounded-lg p-2 mt-2">{loginMsg}</p>}<button onClick={handleLogin} className="w-full btn-gold text-white font-black py-3.5 rounded-xl mt-4 text-[16px]">دخول حسابي</button><div className="text-center mt-4 text-sm font-bold">ما عندكش حساب؟ <button onClick={()=>setAccountView('create')} className="text-[var(--orange)] font-black">+ إنشاء حساب جديد</button></div><p className="text-center text-[11px] text-[var(--text-soft)] font-semibold mt-3">حساب تجريبي: سجّل حساب جديد، أو جرّب حساب تاجر من القائمة.</p></div>}
                {accountView==='create' && <div className="bg-white rounded-[22px] border border-[var(--line)] p-5 mt-4"><button onClick={()=>setAccountView('login')} className="text-[12px] font-bold text-[var(--text-soft)] flex items-center gap-1 mb-2"><ArrowLeft className="w-3.5 h-3.5"/> رجوع</button><h3 className="font-black text-[17px]">إنشاء حساب جديد</h3><div className="grid gap-2 mt-3"><input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="الاسم الكامل *" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white"/><input value={newPhone} onChange={e=>setNewPhone(e.target.value)} placeholder="رقم الهاتف *" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/><input value={newPass} onChange={e=>setNewPass(e.target.value)} type="password" placeholder="كلمة المرور *" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white"/><WilayaSelect value={newWilaya} onChange={setNewWilaya} /><div className="grid grid-cols-2 gap-2"><button onClick={()=>setNewRole('customer')} className={`py-2.5 rounded-xl font-black text-sm border ${newRole==='customer'?'bg-[var(--navy)] text-white':'bg-white'}`}>زبون</button><button onClick={()=>setNewRole('trader')} className={`py-2.5 rounded-xl font-black text-sm border ${newRole==='trader'?'bg-[var(--orange)] text-white':'bg-white'}`}>تاجر</button></div>{newRole==='trader' && <><input value={newShop} onChange={e=>setNewShop(e.target.value)} placeholder="اسم المتجر *" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white"/><select value={newSpec} onChange={e=>setNewSpec(e.target.value)} className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select><label className="text-sm font-black">أو الصق رابط الصورة هنا</label><input value={newLogo} onChange={e=>setNewLogo(e.target.value)} placeholder="رابط شعار المحل" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/><label className="block text-center bg-[var(--orange)] text-white font-black py-3 rounded-xl cursor-pointer">📷 اختر صورة من هاتفك / حاسوبك<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f){ setNewLogo(URL.createObjectURL(f)); }}} /></label><p className="text-[11px] font-semibold text-[var(--text-soft)]">إذا ما كاينش صورة، يبان شعار «Mawadi».</p>{newLogo.trim() && <div className="h-24 rounded-xl overflow-hidden border border-[var(--line)]"><LinkedImage src={newLogo} alt={newShop||'معاينة شعار المحل'} className="w-full h-full object-cover"/></div>}</>}<button onClick={handleCreateAccount} disabled={busy} className="bg-[var(--orange)] text-white font-black py-3 rounded-xl disabled:opacity-50">إنشاء حساب</button>{createMsg && <p className="text-[13px] font-bold text-green-700 bg-green-50 rounded-lg p-2">{createMsg}</p>}</div></div>}
                {accountView==='reset' && <div className="bg-white rounded-[22px] border border-[var(--line)] p-5 mt-4"><button onClick={()=>setAccountView('login')} className="text-[12px] font-bold text-[var(--text-soft)] flex items-center gap-1 mb-2"><ArrowLeft className="w-3.5 h-3.5"/> رجوع</button><h3 className="font-black text-[17px]">استرجاع كلمة المرور</h3>{resetStep===1 ? <div className="grid gap-2 mt-3"><input value={resetPhone} onChange={e=>setResetPhone(e.target.value)} placeholder="رقم الهاتف" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/><button onClick={handleResetSend} className="bg-[var(--navy)] text-white font-black py-3 rounded-xl">إرسال رمز التأكيد</button></div> : <div className="grid gap-2 mt-3"><p className="text-[13px] font-bold bg-orange-50 rounded-lg p-2">دخل الرمز اللي وصلك.</p><input value={resetCode} onChange={e=>setResetCode(e.target.value)} placeholder="رمز التأكيد — جرّب 1234" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white text-left"/><input value={resetNew} onChange={e=>setResetNew(e.target.value)} type="password" placeholder="كلمة مرور جديدة" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white"/><button onClick={handleResetConfirm} disabled={busy} className="bg-[var(--orange)] text-white font-black py-3 rounded-xl disabled:opacity-50">تأكيد وتغيير كلمة المرور</button></div>}{resetMsg && <p className="text-[13px] font-bold text-green-700 bg-green-50 rounded-lg p-2 mt-2">{resetMsg}</p>}</div>}
              </div>
            )}
          </section>
        )}
      </main>

      {editAccount && <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={()=>setEditAccount(null)}><div className="bg-white w-full max-w-md rounded-[22px] p-5 max-h-[92vh] overflow-y-auto" onClick={e=>e.stopPropagation()}><div className="flex justify-between items-start"><div><h3 className="font-black text-[18px] flex items-center gap-2"><Pencil className="w-5 h-5 text-[var(--orange)]"/> {editAccount.value.role==='trader'?'تعديل حساب التاجر':'تعديل حسابي'}</h3><p className="text-[13px] font-semibold text-[var(--text-soft)] mt-1">{editAccount.value.role==='trader'?'عدّل معلومات المحل — ستظهر فوراً في شاشة التجار والمنتجات.':'عدّل معلومات حسابك.'}</p></div><button onClick={()=>setEditAccount(null)} aria-label="إغلاق"><X className="w-5 h-5"/></button></div><div className="grid gap-2 mt-4"><label className="text-sm font-black">الاسم الكامل *</label><input value={editAccName} onChange={e=>setEditAccName(e.target.value)} placeholder="الاسم الكامل" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold"/>{editAccount.value.role==='trader' && <><label className="text-sm font-black">اسم المحل *</label><input value={editAccShop} onChange={e=>setEditAccShop(e.target.value)} placeholder="اسم المحل" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold"/></>}<label className="text-sm font-black">رقم الهاتف *</label><input value={editAccPhone} onChange={e=>setEditAccPhone(e.target.value)} placeholder="رقم الهاتف" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold text-left"/><p className="text-[11px] font-bold text-amber-700 bg-amber-50 rounded-lg p-2">⚠️ تنبيه: إذا غيّرت رقم الهاتف، ستدخل بالرقم الجديد في المرة القادمة.</p><label className="text-sm font-black">كلمة المرور</label><input value={editAccPass} onChange={e=>setEditAccPass(e.target.value)} type="password" placeholder="اتركها فارغة للاحتفاظ بكلمة المرور الحالية" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold"/><label className="text-sm font-black">الولاية — 58 ولاية</label><WilayaSelect value={editAccWilaya} onChange={setEditAccWilaya} />{editAccount.value.role==='trader' && <><label className="text-sm font-black">التخصص</label><select value={editAccSpec} onChange={e=>setEditAccSpec(e.target.value)} className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select><label className="text-sm font-black">أو الصق رابط الصورة هنا</label><input value={editAccLogo} onChange={e=>setEditAccLogo(e.target.value)} placeholder="رابط شعار المحل" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold text-left"/><label className="block text-center bg-[var(--orange)] text-white font-black py-3 rounded-xl cursor-pointer">📷 اختر صورة من هاتفك / حاسوبك<input type="file" accept="image/*" className="hidden" onChange={e=>{const f=e.target.files?.[0]; if(f){ setEditAccLogo(URL.createObjectURL(f)); }}} /></label><div className="h-24 rounded-xl overflow-hidden border border-[var(--line)] bg-[var(--muted)]"><LinkedImage src={editAccLogo} alt={editAccShop||'معاينة شعار المحل'} label={editAccShop} className="w-full h-full object-cover"/></div></>}{editAccAdmin && <><label className="text-sm font-black">الموافقة (للأدمن)</label><div className="flex gap-2"><button onClick={()=>setEditAccApproved(true)} className={`flex-1 py-2.5 rounded-xl font-black text-sm border ${editAccApproved?'bg-green-600 text-white':'bg-white'}`}>معتمد</button><button onClick={()=>setEditAccApproved(false)} className={`flex-1 py-2.5 rounded-xl font-black text-sm border ${!editAccApproved?'bg-amber-500 text-white':'bg-white'}`}>بانتظار الموافقة</button></div><label className="text-sm font-black">حالة الاشتراك (للأدمن)</label><select value={editAccSub} onChange={e=>setEditAccSub(e.target.value as 'free'|'paid')} className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold bg-white"><option value="free">اشتراك مجاني</option><option value="paid">مدفوع - تاجر موثّق</option></select></>}<div className="flex gap-2 mt-1"><button onClick={saveAccountEdit} disabled={editAccBusy} className="flex-1 bg-[var(--orange)] text-white font-black py-3 rounded-xl disabled:opacity-50">حفظ التعديلات</button><button onClick={()=>setEditAccount(null)} className="flex-1 bg-white border border-[var(--line)] font-black py-3 rounded-xl">إلغاء</button></div>{editAccMsg && <p className="text-[13px] font-bold text-red-600 bg-red-50 rounded-lg p-2">{editAccMsg}</p>}</div></div></div>}

      {requestFor && <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={()=>setRequestFor(null)}><div className="bg-white w-full max-w-md rounded-[22px] p-5" onClick={e=>e.stopPropagation()}><div className="flex justify-between items-start"><div><h3 className="font-black text-[18px]">اطلب السعر</h3><p className="text-[13px] font-semibold text-[var(--text-soft)] mt-1">{requestFor.value.name} • {requestFor.value.shopName}</p></div><button onClick={()=>setRequestFor(null)} aria-label="إغلاق"><X className="w-5 h-5"/></button></div><div className="grid gap-2 mt-4"><input value={reqName} onChange={e=>setReqName(e.target.value)} placeholder="اسمك *" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold"/><input value={reqPhone} onChange={e=>setReqPhone(e.target.value)} placeholder="رقم هاتفك *" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold text-left"/><label className="text-sm font-black">الكمية</label><input value={reqQty} onChange={e=>setReqQty(e.target.value)} placeholder="مثال: 100 كيس" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold"/><button onClick={handlePriceRequest} disabled={busy} className="bg-[var(--orange)] text-white font-black py-3 rounded-xl disabled:opacity-50">إرسال الطلب</button>{reqMsg && <p className="text-[13px] font-bold text-green-700 bg-green-50 rounded-lg p-2">{reqMsg}</p>}<p className="text-[11px] text-[var(--text-soft)] font-semibold text-center">رقمك يبان غير للأدمن والتاجر المعني، موش للزبائن الآخرين.</p></div></div></div>}

      {showAdminModal && <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={()=>setShowAdminModal(false)}><div className="bg-white w-full max-w-md rounded-[22px] p-5" onClick={e=>e.stopPropagation()}><div className="flex justify-between"><h3 className="font-black text-[18px] flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-[var(--orange)]"/> دخول الأدمن</h3><button onClick={()=>setShowAdminModal(false)} aria-label="إغلاق"><X className="w-5 h-5"/></button></div><p className="text-[13px] font-semibold text-[var(--text-soft)] mt-1">دخول المالك فقط، بالبريد وكلمة المرور.</p><div className="grid gap-2 mt-4"><input value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} placeholder="بريد الأدمن" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold text-left"/><input value={adminPass} onChange={e=>setAdminPass(e.target.value)} type="password" placeholder="كلمة المرور" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold"/><button onClick={handleAdminLogin} className="bg-[var(--navy)] text-white font-black py-3 rounded-xl">دخول لوحة الإدارة</button>{adminMsg && <p className="text-[13px] font-bold text-red-600 bg-red-50 rounded-lg p-2">{adminMsg}</p>}<div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[12px] font-bold text-amber-900">⚠️ بيانات تجريبية للعرض فقط — غيّرها بعد الدخول:<br/>البريد: admin@mawadi.dz<br/>كلمة المرور: admin123</div></div></div></div>}

      {checkoutOpen && session && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4" onClick={()=>setCheckoutOpen(false)}><div className="bg-white w-full max-w-md rounded-[22px] p-5 max-h-[92vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
          <div className="flex justify-between items-start"><div><h3 className="font-black text-[18px] flex items-center gap-2"><CreditCard className="w-5 h-5 text-[var(--orange)]"/> تجديد الاشتراك</h3><p className="text-[13px] font-semibold text-[var(--text-soft)] mt-1">الدفع بـ EDAHABIA و CIB عبر Chargily Pay V2</p></div><button onClick={()=>setCheckoutOpen(false)} aria-label="إغلاق"><X className="w-5 h-5"/></button></div>
          {checkoutStep==='summary' ? (
            <div className="grid gap-2 mt-4">
              <div className="bg-[var(--bg)] rounded-xl p-3 text-sm font-semibold"><p className="font-black">ملخص الطلب</p><p className="mt-1">Mawadi Trader Subscription - 1 Month</p><p className="text-[var(--text-soft)]">التاجر: {session.value.shopName} • {session.value.name}</p><div className="flex justify-between mt-2 pt-2 border-t border-dashed"><span>المبلغ</span><span className="font-black text-[var(--orange)]">2000 DZD</span></div><p className="text-[12px] text-[var(--text-soft)]">المدة: 30 يوم من تاريخ الدفع</p></div>
              <button onClick={()=>setCheckoutStep('checkout')} className="bg-[var(--orange)] text-white font-black py-3 rounded-xl">المتابعة للدفع</button>
              <p className="text-[11px] text-center font-semibold text-[var(--text-soft)]">نقبل EDAHABIA و CIB فقط عبر Chargily Pay V2</p>
            </div>
          ) : (
            <div className="grid gap-2 mt-4">
              <div className="bg-[var(--navy)] text-white rounded-xl p-3"><p className="font-black text-sm">نافذة دفع Chargily Pay V2 (عرض تجريبي)</p><p className="text-[12px] text-white/70 mt-1">في الإنتاج تفتح هنا صفحة الدفع الرسمية من رابط الـ Checkout الذي ينشئه السيرفر.</p></div>
              <p className="text-sm font-black">اختر البطاقة</p>
              <div className="grid grid-cols-2 gap-2"><button onClick={()=>setCardType('EDAHABIA')} className={`py-3 rounded-xl font-black border ${cardType==='EDAHABIA'?'bg-[var(--orange)] text-white':'bg-white'}`}>EDAHABIA</button><button onClick={()=>setCardType('CIB')} className={`py-3 rounded-xl font-black border ${cardType==='CIB'?'bg-[var(--navy)] text-white':'bg-white'}`}>CIB</button></div>
              <input value={cardName} onChange={e=>setCardName(e.target.value)} placeholder="اسم حامل البطاقة (تجريبي)" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold"/>
              <input value={cardNumber} onChange={e=>setCardNumber(e.target.value)} placeholder="رقم البطاقة (تجريبي)" dir="ltr" className="border border-[var(--line)] rounded-xl px-3 py-2.5 text-sm font-semibold text-left"/>
              <div className="flex gap-2"><button onClick={handlePaymentSuccess} disabled={busy} className="flex-1 bg-green-600 text-white font-black py-3 rounded-xl disabled:opacity-50">دفع ناجح (تجريبي)</button><button onClick={handlePaymentFail} className="flex-1 bg-white border border-red-200 text-red-700 font-black py-3 rounded-xl">فشل الدفع</button></div>
              {checkoutMsg && <p className="text-[13px] font-bold text-red-700 bg-red-50 rounded-lg p-2">{checkoutMsg}</p>}
              <button onClick={()=>setCheckoutStep('summary')} className="text-[12px] font-bold text-[var(--text-soft)]">رجوع لملخص الطلب</button>
            </div>
          )}
        </div></div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0F1B2D] border-t border-[#FFB347]/30" style={{paddingBottom:'env(safe-area-inset-bottom)'}}>
        <div className="max-w-6xl mx-auto flex px-2">
          <NavBtn id="products" icon={<Package className="w-5 h-5"/>} label="المنتجات"/>
          <NavBtn id="traders" icon={<Store className="w-5 h-5"/>} label="التجار"/>
          <NavBtn id="settings" icon={<SettingsIcon className="w-5 h-5"/>} label="الإعدادات"/>
          <NavBtn id="account" icon={<User className="w-5 h-5"/>} label="حسابي الشخصي"/>
        </div>
      </nav>
    </div>
  );
}
