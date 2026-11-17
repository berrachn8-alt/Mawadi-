import React, { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Store, User, Settings as SettingsIcon, Package, ShieldCheck, Plus, Eye, EyeOff, Phone, Lock, X, ChevronDown, Trash2, Edit3, Check, CreditCard, Building2, Paintbrush, Wrench, Zap, Droplets, Layers, Hammer, Shield, TreePine, PackageOpen, AlertTriangle, ArrowLeft, Loader2, Image as ImageIcon, Globe, Info, Mail, LogOut } from "lucide-react";

type Trader = { id:string; name:string; shopName:string; phone:string; wilaya:string; specialty:string; shopLogoUrl?:string; subscriptionStatus?:string; approved?:boolean; isFake?:boolean; createdAt?:string };
type Product = { id:string; name:string; price:number; category:string; imageUrl?:string; traderId?:string; shopName:string; wilaya:string; visible?:boolean; description?:string };
type PriceReq = { id:string; productName:string; customerPhone:string; traderName:string; date:string };
type Account = { id:string; name:string; phone:string; password:string; wilaya:string; specialty:string; shopLogoUrl?:string };

const CATEGORIES = ["إسمنت","حديد","ياجور","رمل وحصى","سباكة","كهرباء","دهان","نجارة وخشب","عزل","أدوات البناء"];
const WILAYAS = ["الجزائر","وهران","قسنطينة","عنابة","البليدة","سطيف","ورقلة","بسكرة","تلمسان","تيزي وزو","بجاية","مستغانم","الشلف","سيدي بلعباس","بومرداس","تيبازة","عين الدفلى","معسكر","الجلفة","سعيدة","سكيكدة","جيجل","ميلة","عين تموشنت","قالمة","سوق أهراس","تبسة","باتنة","خنشلة","أم البواقي","البيض","النعامة","تندوف","تمنراست","إيليزي","غرداية","الأغواط","المسيلة","البويرة","تيارت","تيسمسيلت","المدية","برج بوعريريج","الطارف","الوادي","أدرار","بشار","برج باجي مختار","بني عباس","عين صالح","عين قزام","تقرت","جانت","المغير","المنيعة","أولاد جلال","برج عمر إدريس","عين وسارة"];
const CAT_ICON: Record<string, React.ReactNode> = {
  "إسمنت": <Layers size={20}/>, "حديد": <Hammer size={20}/>, "ياجور": <Building2 size={20}/>, "رمل وحصى": <Droplets size={20}/>, "سباكة": <Droplets size={20}/>, "كهرباء": <Zap size={20}/>, "دهان": <Paintbrush size={20}/>, "نجارة وخشب": <TreePine size={20}/>, "عزل": <Shield size={20}/>, "أدوات البناء": <Wrench size={20}/>
};
const CAT_COLOR: Record<string,string> = {"إسمنت":"#FFF1E3","حديد":"#EAF0FF","ياجور":"#FFE9E9","رمل وحصى":"#FFF7D6","سباكة":"#E6F7FF","كهرباء":"#FFF3D6","دهان":"#F0E9FF","نجارة وخشب":"#E9F5E9","عزل":"#E8F7F0","أدوات البناء":"#F2F2F2"};

const DEMO_TRADERS: Trader[] = [
  {id:"demo-t1", name:"أحمد بن عمر", shopName:"متجر النور للبناء", phone:"0550 00 00 01", wilaya:"الوادي", specialty:"إسمنت و حديد", approved:true, isFake:false, subscriptionStatus:"نشط"},
  {id:"demo-t2", name:"يوسف مرابط", shopName:"سطيف للمواد", phone:"0550 00 00 02", wilaya:"سطيف", specialty:"ياجور و رمل وحصى", approved:true, isFake:false, subscriptionStatus:"نشط"},
  {id:"demo-t3", name:"كريم حداد", shopName:"البناء الذهبي", phone:"0550 00 00 03", wilaya:"الجزائر", specialty:"دهان و سباكة", approved:false, isFake:false, subscriptionStatus:"بانتظار"},
];
const DEMO_PRODUCTS: Product[] = [
  {id:"demo-p1", name:"إسمنت CPJ 45 — كيس 50 كغ", price:850, category:"إسمنت", shopName:"متجر النور للبناء", wilaya:"الوادي", visible:true, description:"إسمنت عالي الجودة للأشغال الكبرى والصغرى."},
  {id:"demo-p2", name:"حديد تسليح 12 مم — قضيب 12م", price:14500, category:"حديد", shopName:"متجر النور للبناء", wilaya:"الوادي", visible:true, description:"حديد مطابق للمعايير، توصيل داخل الولاية."},
  {id:"demo-p3", name:"ياجور أحمر مثقوب 12", price:45, category:"ياجور", shopName:"سطيف للمواد", wilaya:"سطيف", visible:true, description:"ياجور أحمر للبناء، متوفر بكميات كبيرة."},
  {id:"demo-p4", name:"رمل مغسول — شاحنة 10م³", price:2200, category:"رمل وحصى", shopName:"سطيف للمواد", wilaya:"سطيف", visible:true, description:"رمل نظيف للخرسانة واللياسة."},
  {id:"demo-p5", name:"دهان أبيض مطفي 15 لتر", price:6800, category:"دهان", shopName:"البناء الذهبي", wilaya:"الجزائر", visible:true, description:"دهان داخلي تغطية ممتازة."},
  {id:"demo-p6", name:"أنبوب PVC ضغط 6 بار", price:1200, category:"سباكة", shopName:"البناء الذهبي", wilaya:"الجزائر", visible:true, description:"أنبوب سباكة مقاوم للضغط."},
];
const DEMO_ACCOUNT: Account = {id:"demo-acc", name:"ضيف تجريبي", phone:"0550000000", password:"1234", wilaya:"الوادي", specialty:"زبون"};

async function api(action:string, args:any){
  const res = await fetch("actions", {method:"POST", headers:{"content-type":"application/json"}, body: JSON.stringify({action, args})});
  const json = await res.json().catch(()=>({}));
  if(!res.ok || json.error) throw new Error(json.error || `تعذر الاتصال (${res.status})`);
  return json.data;
}
function initials(s:string){ return s.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join(" ").slice(0,3); }
function fmt(n:number){ return new Intl.NumberFormat("ar-DZ").format(n) + " دج"; }
const wait = (ms:number)=> new Promise(r=>setTimeout(r, ms));
function isHttpUrl(v:string){ return /^https?:\/\/.+/i.test(v.trim()); }

// Photo areas use a text-only empty state. Image and file uploads are not supported yet.

export default function App(){
  const [tab, setTab] = useState<"products"|"traders"|"settings"|"account">("products");
  const [category, setCategory] = useState<string>("الكل");
  const [search, setSearch] = useState("");
  const [wilayaFilter, setWilayaFilter] = useState("كل الولايات");
  const [traderSearch, setTraderSearch] = useState("");
  const [traderWilaya, setTraderWilaya] = useState("كل الولايات");
  const [visibleCount, setVisibleCount] = useState(10);
  const [traders, setTraders] = useState<Trader[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [requests, setRequests] = useState<PriceReq[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState("");
  const [selectedTrader, setSelectedTrader] = useState<string|null>(null);
  const [detail, setDetail] = useState<Product|null>(null);
  const [toast, setToast] = useState("");
  const [deletingId, setDeletingId] = useState<string|null>(null);
  const [deletingFake, setDeletingFake] = useState(false);
  const [togglingId, setTogglingId] = useState<string|null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [savingTraderEdit, setSavingTraderEdit] = useState(false);
  const [approvingId, setApprovingId] = useState<string|null>(null);
  const [demoDeleted, setDemoDeleted] = useState<string[]>([]);
  const [demoHidden, setDemoHidden] = useState<string[]>([]);
  const [demoEdits, setDemoEdits] = useState<Record<string, Product>>({});
  const [demoTraderEdits, setDemoTraderEdits] = useState<Record<string, Trader>>({});

  const [phone, setPhone] = useState(""); const [password, setPassword] = useState(""); const [showPass, setShowPass] = useState(false);
  const [logged, setLogged] = useState<Account|null>(null);
  const [mode, setMode] = useState<"login"|"forgot"|"create">("login");
  const [forgotPhone, setForgotPhone] = useState(""); const [newPass, setNewPass] = useState("");
  const [reg, setReg] = useState({name:"", phone:"", password:"", wilaya:"الوادي", specialty:"زبون", shopLogoUrl:""});
  const [busy, setBusy] = useState(false); const [formMsg, setFormMsg] = useState("");
  const [authAction, setAuthAction] = useState<"login"|"create"|"reset"|null>(null);
  const [newProd, setNewProd] = useState({name:"", price:"", category:"إسمنت", imageUrl:"", description:"", wilaya:"الوادي"});
  const [showAdd, setShowAdd] = useState(false);
  const [showPay, setShowPay] = useState(false); const [pubKey, setPubKey] = useState("");
  const [fb, setFb] = useState({apiKey:"", authDomain:"", projectId:"mawadi-4b1e1", storageBucket:"", messagingSenderId:"", appId:""});
  const [fbSaved, setFbSaved] = useState(false); const [fbId, setFbId] = useState<string|null>(null);
  const [adminOpen, setAdminOpen] = useState(false); const [adminEmail, setAdminEmail] = useState(""); const [adminPass, setAdminPass] = useState(""); const [admin, setAdmin] = useState(false); const [adminMsg, setAdminMsg] = useState("");
  const [editing, setEditing] = useState<Product|null>(null);
  const [editingTrader, setEditingTrader] = useState<Trader|null>(null);
  const [confirmDeleteFake, setConfirmDeleteFake] = useState(false);
  // Settings for normal users — no technical info here
  const [language, setLanguage] = useState("العربية");
  const [showAbout, setShowAbout] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showTech, setShowTech] = useState(false);

  async function reloadRecords(){
    const [t,p,r,a,s] = await Promise.all([
      api("records.list",{collection:"mawadi_traders"}),
      api("records.list",{collection:"mawadi_products"}),
      api("records.list",{collection:"mawadi_requests"}),
      api("records.list",{collection:"mawadi_accounts"}),
      api("records.list",{collection:"mawadi_settings"}).catch(()=>({records:[]})),
    ]);
    const tList = (t.records||[]).map((x:any)=>({id:x.id,...x.value}));
    const pList = (p.records||[]).map((x:any)=>({id:x.id,...x.value}));
    setTraders(tList);
    setProducts(pList);
    setRequests((r.records||[]).map((x:any)=>({id:x.id,...x.value})));
    setAccounts((a.records||[]).map((x:any)=>({id:x.id,...x.value})));
    const sett = (s.records||[]).find((x:any)=>x.value?.kind==="firebase");
    if(sett){ setFb(sett.value.config); setFbId(sett.id); setFbSaved(!!sett.value.config?.apiKey); }
    const pay = (s.records||[]).find((x:any)=>x.value?.kind==="chargily");
    if(pay) setPubKey(pay.value.publishableKey||"");
    return {traders:tList, products:pList, accounts:(a.records||[]).map((x:any)=>({id:x.id,...x.value}))};
  }

  async function seedDemoIfEmpty(current:{traders:any[],products:any[],accounts:any[]}){
    if(current.traders.length>0 || current.products.length>0) return;
    try{
      for(const t of DEMO_TRADERS){
        const {id,...rest} = t;
        await api("records.create",{collection:"mawadi_traders", value:rest, idempotency_key:`seed-trader-${t.id}`});
      }
      for(const p of DEMO_PRODUCTS){
        const {id,...rest} = p;
        await api("records.create",{collection:"mawadi_products", value:rest, idempotency_key:`seed-product-${p.id}`});
      }
      await api("records.create",{collection:"mawadi_accounts", value:{name:DEMO_ACCOUNT.name, phone:DEMO_ACCOUNT.phone, password:DEMO_ACCOUNT.password, wilaya:DEMO_ACCOUNT.wilaya, specialty:DEMO_ACCOUNT.specialty}, idempotency_key:`seed-account-demo`});
      await reloadRecords();
    }catch(e){ /* keep demo fallback visible */ }
  }

  useEffect(()=>{ (async()=>{ try{ const cur = await reloadRecords(); await seedDemoIfEmpty(cur); }catch(e){ setBackendError("التخزين الدائم غير متوفر الآن — نعرض بيانات تجريبية. حاول لاحقًا."); } finally{ setLoading(false); } })(); },[]);

  const usingDemo = products.length===0 && traders.length===0;
  const demoTradersView = useMemo(()=> DEMO_TRADERS.filter(t=>!demoDeleted.includes(t.id)).map(t=> demoTraderEdits[t.id] || t), [demoDeleted, demoTraderEdits]);
  const demoProductsView = useMemo(()=> DEMO_PRODUCTS.filter(p=>!demoDeleted.includes(p.id) && !demoHidden.includes(p.id)).map(p=> demoEdits[p.id] || p), [demoDeleted, demoHidden, demoEdits]);
  const effectiveTraders = traders.length? traders : demoTradersView;
  const effectiveProducts = products.length? products : demoProductsView;
  const adminProductsView = useMemo(()=>{
    if(products.length) return products;
    return DEMO_PRODUCTS.filter(p=>!demoDeleted.includes(p.id)).map(p=> demoHidden.includes(p.id) ? {...(demoEdits[p.id]||p), visible:false} : (demoEdits[p.id]||p));
  },[products, demoDeleted, demoHidden, demoEdits]);

  const filtered = useMemo(()=>{
    let list = effectiveProducts.filter(p=>p.visible!==false);
    if(category!=="الكل") list=list.filter(p=>p.category===category);
    if(wilayaFilter!=="كل الولايات") list=list.filter(p=>p.wilaya===wilayaFilter);
    if(selectedTrader) list=list.filter(p=>p.shopName===selectedTrader);
    if(search.trim()) list=list.filter(p=>(p.name+p.shopName+p.wilaya).includes(search.trim()));
    return list;
  },[effectiveProducts,category,selectedTrader,search,wilayaFilter]);

  const filteredTraders = useMemo(()=>{
    let list = [...effectiveTraders];
    if(traderWilaya!=="كل الولايات") list=list.filter(t=>t.wilaya===traderWilaya);
    if(traderSearch.trim()) list=list.filter(t=>(t.shopName+t.name+t.wilaya+t.specialty).includes(traderSearch.trim()));
    return list;
  },[effectiveTraders,traderWilaya,traderSearch]);

  function showToast(m:string){ setToast(m); setTimeout(()=>setToast(""),3500); }

  async function requestPrice(p:Product){
    if(!logged){ setTab("account"); showToast("سجّل دخولك أولًا لطلب السعر."); return; }
    if(usingDemo){ setFormMsg(""); showToast("تم تسجيل طلبك — سيتواصل معك التاجر قريبًا."); return; }
    setBusy(true);
    try{
      await api("records.create",{collection:"mawadi_requests", value:{productName:p.name, customerPhone:logged.phone, traderName:p.shopName, date:new Date().toLocaleDateString("ar-DZ")}, idempotency_key:`req-${p.id}-${logged.phone}-${Date.now()}`});
      await reloadRecords(); showToast("تم إرسال طلب السعر إلى التاجر بنجاح.");
    }catch(e:any){ showToast("تعذر حفظ طلب السعر: "+e.message); }
    setBusy(false);
  }

  async function doLogin(){
    setFormMsg(""); setAuthAction("login"); setBusy(true);
    try{
      await wait(800);
      if(!phone.trim()||!password){ setFormMsg("أدخل رقم الهاتف وكلمة المرور."); return; }
      const allAccounts = accounts.length? accounts : [DEMO_ACCOUNT];
      const found = allAccounts.find(a=>a.phone===phone.trim() && a.password===password);
      if(found){ setLogged(found); setFormMsg(""); showToast(`مرحبًا ${found.name} — تم الدخول.`); return; }
      if(phone.trim()==="0550000000" && password==="1234"){ setLogged(DEMO_ACCOUNT); showToast("دخول تجريبي ناجح."); return; }
      setFormMsg("رقم الهاتف أو كلمة المرور غير صحيحة.");
    } finally { setBusy(false); setAuthAction(null); }
  }
  async function doCreateAccount(){
    setFormMsg(""); setAuthAction("create"); setBusy(true);
    try{
      await wait(800);
      if(!reg.name.trim()||!reg.phone.trim()||!reg.password){ setFormMsg("أكمل الاسم ورقم الهاتف وكلمة المرور."); return; }
      if(reg.shopLogoUrl.trim() && !isHttpUrl(reg.shopLogoUrl)){ setFormMsg("رابط شعار المتجر يجب أن يبدأ بـ https://"); return; }
      if(accounts.some(a=>a.phone===reg.phone.trim())){ setFormMsg("هذا الرقم مسجّل من قبل — سجّل دخولك."); return; }
      const regValue = {name:reg.name, phone:reg.phone, password:reg.password, wilaya:reg.wilaya, specialty:reg.specialty, shopLogoUrl:reg.shopLogoUrl.trim()};
      const newAcc: Account = {id:`local-${Date.now()}`, ...regValue};
      try{
        const created = await api("records.create",{collection:"mawadi_accounts", value:regValue, idempotency_key:`acc-${reg.phone}-${Date.now()}`});
        await reloadRecords(); setLogged({id:created.id,...regValue});
        if(reg.specialty!=="زبون"){
          try{ await api("records.create",{collection:"mawadi_traders", value:{name:reg.name, shopName:`متجر ${reg.name}`, phone:reg.phone, wilaya:reg.wilaya, specialty:reg.specialty, shopLogoUrl:reg.shopLogoUrl.trim(), approved:false, isFake:false, subscriptionStatus:"بانتظار"}, idempotency_key:`tr-${reg.phone}-${Date.now()}`}); await reloadRecords(); }catch{}
        }
      }catch(e:any){
        setAccounts(prev=>[...prev, newAcc]); setLogged(newAcc);
        showToast("تم إنشاء حسابك بنجاح.");
        setMode("login"); return;
      }
      setMode("login"); showToast("تم إنشاء حسابك بنجاح.");
    } finally { setBusy(false); setAuthAction(null); }
  }
  async function doReset(){
    setFormMsg(""); setAuthAction("reset"); setBusy(true);
    try{
      await wait(800);
      const allAccounts = accounts.length? accounts : [DEMO_ACCOUNT];
      const found = allAccounts.find(a=>a.phone===forgotPhone.trim());
      if(!found){ setFormMsg("هذا الرقم غير مسجّل."); return; }
      if(!newPass){ setFormMsg("أدخل كلمة مرور جديدة."); return; }
      try{ await api("records.replace",{collection:"mawadi_accounts", id:found.id, value:{...found, password:newPass}}); await reloadRecords(); }
      catch(e:any){ setAccounts(prev=>prev.map(a=>a.id===found.id? {...a, password:newPass}:a)); }
      setMode("login"); showToast("تم تغيير كلمة المرور — سجّل دخولك الآن.");
    } finally { setBusy(false); setAuthAction(null); }
  }

  async function deleteTrader(t:Trader){
    setDeletingId(t.id);
    await wait(1000);
    try{
      if(t.id.startsWith("demo-") || usingDemo){
        try{ await api("records.delete",{collection:"mawadi_traders", id:t.id}); }catch{}
        setDemoDeleted(prev=>[...prev, t.id]);
        setTraders(prev=>prev.filter(x=>x.id!==t.id));
        showToast("تم حذف التاجر بنجاح.");
      } else {
        await api("records.delete",{collection:"mawadi_traders", id:t.id});
        setTraders(prev=>prev.filter(x=>x.id!==t.id));
        showToast("تم حذف التاجر بنجاح.");
      }
      await reloadRecords().catch(()=>{});
    }catch(e:any){ showToast("تعذر حذف التاجر: "+e.message); }
    finally{ setDeletingId(null); }
  }

  async function deleteProduct(p:Product){
    setDeletingId(p.id);
    await wait(1000);
    try{
      if(p.id.startsWith("demo-") || usingDemo){
        try{ await api("records.delete",{collection:"mawadi_products", id:p.id}); }catch{}
        setDemoDeleted(prev=>[...prev, p.id]);
        setProducts(prev=>prev.filter(x=>x.id!==p.id));
        showToast("تم حذف المنتج بنجاح.");
      } else {
        await api("records.delete",{collection:"mawadi_products", id:p.id});
        setProducts(prev=>prev.filter(x=>x.id!==p.id));
        showToast("تم حذف المنتج بنجاح.");
      }
      await reloadRecords().catch(()=>{});
    }catch(e:any){ showToast("تعذر حذف المنتج: "+e.message); }
    finally{ setDeletingId(null); }
  }

  async function toggleProductVisible(p:Product){
    setTogglingId(p.id);
    await wait(700);
    const nextVisible = p.visible===false;
    try{
      if(p.id.startsWith("demo-") || usingDemo){
        if(nextVisible) setDemoHidden(prev=>prev.filter(id=>id!==p.id));
        else setDemoHidden(prev=>[...prev, p.id]);
        try{ await api("records.replace",{collection:"mawadi_products", id:p.id, value:{...p, visible:nextVisible}}); }catch{}
        showToast(nextVisible?"تم إظهار المنتج.":"تم إخفاء المنتج.");
      } else {
        await api("records.replace",{collection:"mawadi_products", id:p.id, value:{...p, visible:nextVisible}});
        setProducts(prev=>prev.map(x=>x.id===p.id? {...x, visible:nextVisible}:x));
        showToast(nextVisible?"تم إظهار المنتج.":"تم إخفاء المنتج.");
      }
      await reloadRecords().catch(()=>{});
    }catch(e:any){ showToast("تعذر التحديث: "+e.message); }
    finally{ setTogglingId(null); }
  }

  async function approveTrader(t:Trader){
    setApprovingId(t.id);
    await wait(700);
    try{
      if(t.id.startsWith("demo-") || usingDemo){
        setDemoTraderEdits(prev=>({...prev, [t.id]: {...t, approved:true}}));
        try{ await api("records.replace",{collection:"mawadi_traders", id:t.id, value:{...t, approved:true}}); }catch{}
      } else {
        await api("records.replace",{collection:"mawadi_traders", id:t.id, value:{...t, approved:true}});
        setTraders(prev=>prev.map(x=>x.id===t.id? {...x, approved:true}:x));
      }
      await reloadRecords().catch(()=>{});
      showToast("تم اعتماد التاجر.");
    }catch(e:any){ showToast(e.message); }
    finally{ setApprovingId(null); }
  }

  async function deleteAllFake(){
    setDeletingFake(true);
    await wait(1000);
    const fakes = effectiveTraders.filter(t=>t.isFake);
    try{
      if(fakes.length===0){ showToast("لا يوجد تجار وهميون للحذف."); }
      else{
        for(const t of fakes){
          if(t.id.startsWith("demo-") || usingDemo){ setDemoDeleted(prev=>[...prev, t.id]); try{ await api("records.delete",{collection:"mawadi_traders", id:t.id}); }catch{} }
          else { try{ await api("records.delete",{collection:"mawadi_traders", id:t.id}); }catch(e:any){ throw e; } }
        }
        setTraders(prev=>prev.filter(x=>!x.isFake));
        showToast(`تم حذف ${fakes.length} تاجر وهمي.`);
      }
      await reloadRecords().catch(()=>{});
    }catch(e:any){ showToast("تعذر حذف التجار الوهميين: "+e.message); }
    finally{ setDeletingFake(false); setConfirmDeleteFake(false); }
  }

  async function saveEditProduct(){
    if(!editing) return;
    if(editing.imageUrl?.trim() && !isHttpUrl(editing.imageUrl)){ showToast("رابط صورة المنتج يجب أن يبدأ بـ https://"); return; }
    setSavingEdit(true);
    await wait(700);
    try{
      if(editing.id.startsWith("demo-") || usingDemo){
        setDemoEdits(prev=>({...prev, [editing.id]: editing}));
        try{ await api("records.replace",{collection:"mawadi_products", id:editing.id, value:{...editing}}); }catch{}
      } else {
        await api("records.replace",{collection:"mawadi_products", id:editing.id, value:{...editing}});
        setProducts(prev=>prev.map(x=>x.id===editing.id? editing : x));
      }
      await reloadRecords().catch(()=>{});
      setEditing(null); showToast("تم حفظ التعديل.");
    }catch(e:any){ showToast(e.message); }
    finally{ setSavingEdit(false); }
  }

  async function saveEditTrader(){
    if(!editingTrader) return;
    if(editingTrader.shopLogoUrl?.trim() && !isHttpUrl(editingTrader.shopLogoUrl)){ showToast("رابط شعار المتجر يجب أن يبدأ بـ https://"); return; }
    setSavingTraderEdit(true);
    await wait(700);
    try{
      const {id, ...value} = editingTrader;
      if(editingTrader.id.startsWith("demo-") || usingDemo){
        setDemoTraderEdits(prev=>({...prev, [editingTrader.id]: editingTrader}));
        try{ await api("records.replace",{collection:"mawadi_traders", id:editingTrader.id, value}); }catch{}
      } else {
        await api("records.replace",{collection:"mawadi_traders", id:editingTrader.id, value});
        setTraders(prev=>prev.map(x=>x.id===editingTrader.id? editingTrader : x));
      }
      await reloadRecords().catch(()=>{});
      setEditingTrader(null); showToast("تم حفظ بيانات المتجر.");
    }catch(e:any){ showToast(e.message); }
    finally{ setSavingTraderEdit(false); }
  }

  function openMyTraderProfile(){
    if(!logged) return;
    const found = effectiveTraders.find(t=>t.phone===logged.phone);
    if(found){ setEditingTrader(found); return; }
    setEditingTrader({id:`local-${Date.now()}`, name:logged.name, shopName:`متجر ${logged.name}`, phone:logged.phone, wilaya:logged.wilaya, specialty:logged.specialty, shopLogoUrl:logged.shopLogoUrl||"", approved:false, isFake:false, subscriptionStatus:"بانتظار"});
  }

  async function addProduct(){
    if(!newProd.name.trim()||!newProd.price){ setFormMsg("أدخل اسم المنتج والسعر."); return; }
    if(newProd.imageUrl.trim() && !isHttpUrl(newProd.imageUrl)){ setFormMsg("رابط صورة المنتج يجب أن يبدأ بـ https://"); return; }
    setBusy(true); setFormMsg("");
    try{
      await wait(600);
      const value = {name:newProd.name, price:Number(newProd.price), category:newProd.category, imageUrl:newProd.imageUrl.trim(), shopName: logged?.specialty!=="زبون" ? `متجر ${logged?.name}` : "متجر جديد", wilaya:newProd.wilaya||logged?.wilaya||"الوادي", visible:true, description:newProd.description, traderId:logged?.id};
      try{
        await api("records.create",{collection:"mawadi_products", value, idempotency_key:`prod-${Date.now()}-${logged?.phone}`});
        await reloadRecords();
      }catch(e:any){ throw e; }
      setShowAdd(false); setNewProd({name:"",price:"",category:"إسمنت",imageUrl:"",description:"",wilaya:"الوادي"}); showToast("تمت إضافة منتجك بنجاح.");
    }catch(e:any){ setFormMsg("تعذر حفظ المنتج: "+e.message); }
    setBusy(false);
  }
  async function saveFirebase(){
    setBusy(true);
    try{
      if(fbId) await api("records.replace",{collection:"mawadi_settings", id:fbId, value:{kind:"firebase", config:fb}});
      else { const c=await api("records.create",{collection:"mawadi_settings", value:{kind:"firebase", config:fb}, idempotency_key:`fb-${Date.now()}`}); setFbId(c.id); }
      setFbSaved(!!fb.apiKey); showToast("تم حفظ الإعدادات التقنية.");
    }catch(e:any){ showToast("تعذر الحفظ: "+e.message); }
    setBusy(false);
  }
  async function saveChargily(){
    try{ await api("records.create",{collection:"mawadi_settings", value:{kind:"chargily", publishableKey:pubKey}, idempotency_key:`ch-${Date.now()}`}); showToast("تم حفظ مفتاح Chargily القابل للنشر."); setShowPay(false); }catch(e:any){ showToast("تعذر الحفظ: "+e.message); }
  }
  async function adminLogin(){
    setAdminMsg("");
    if(!adminEmail.includes("@")||!adminPass){ setAdminMsg("أدخل بريدًا وكلمة مرور صالحين."); return; }
    setBusy(true);
    try{
      await wait(700);
      const s = await api("records.list",{collection:"mawadi_settings"});
      const rec = (s.records||[]).find((x:any)=>x.value?.kind==="admin");
      if(!rec){
        await api("records.create",{collection:"mawadi_settings", value:{kind:"admin", email:adminEmail, password:adminPass}, idempotency_key:`admin-${adminEmail}`});
        setAdmin(true); setAdminMsg("تم إنشاء حساب المدير الأول — تم الدخول."); showToast("مرحبًا أيها المدير.");
      } else if(rec.value.email===adminEmail && rec.value.password===adminPass){ setAdmin(true); showToast("تم الدخول إلى لوحة الإدارة."); }
      else setAdminMsg("بيانات المدير غير صحيحة.");
    }catch(e:any){ setAdminMsg("تعذر التحقق: "+e.message); }
    setBusy(false);
  }

  const totalReq = requests.length;
  const myTrader = logged ? effectiveTraders.find(t=>t.phone===logged.phone) : undefined;

  return (
    <div data-safe-area-inset-root dir="rtl" style={{boxSizing:"border-box", paddingTop:"var(--safe-area-inset-top)", minHeight:"100vh", background:"var(--bg)", paddingBottom:86}}>
      <header data-safe-area-sticky-top className="sticky z-30 bg-white/95 backdrop-blur border-b border-[var(--line)]" style={{top:"var(--safe-area-inset-top)"}}>
        <div className="max-w-[980px] mx-auto px-4 pt-3 pb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-[var(--orange)] text-white grid place-items-center font-black text-xl shadow-sm">م</div>
            <div className="min-w-0">
              <h1 className="text-[20px] leading-6 font-black text-[var(--navy)]">موادّي <span className="text-[var(--orange)] text-[13px] font-bold">Mawadi</span></h1>
              <p className="text-[12px] text-[var(--muted)] leading-4 truncate">أول سوق وطني لمواد البناء في الجزائر</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-[var(--soft)] text-[#8A4A00] px-2.5 py-1.5 rounded-full"><span className="w-2 h-2 rounded-full bg-green-500"/> {effectiveProducts.length} منتج</span>
            <button onClick={()=>setTab("account")} className="w-10 h-10 rounded-full bg-[var(--navy)] text-white grid place-items-center" aria-label="حسابي"><User size={18}/></button>
          </div>
        </div>
        {usingDemo && admin && (
          <div className="max-w-[980px] mx-auto px-4 pb-2"><div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-900 text-[12px] font-bold px-3 py-2 rounded-xl"><AlertTriangle size={15} className="shrink-0"/> وضع تجريبي للمدير فقط — البيانات المعروضة تجريبية.</div></div>
        )}
      </header>

      <main className="max-w-[980px] mx-auto px-4 pt-4">
        {toast && <div className="mb-3 bg-[var(--navy)] text-white text-[13px] font-bold px-4 py-3 rounded-2xl card-shadow">{toast}</div>}
        {loading && <p className="text-center text-[13px] text-[var(--muted)] py-8">جارٍ تحميل السوق…</p>}

        {tab==="products" && (
          <section>
            <div className="bg-[var(--navy)] rounded-[22px] p-5 text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="inline-block bg-[var(--orange)] text-[11px] font-black px-3 py-1 rounded-full">سوق وطني • 58 ولاية</span>
                <h2 className="text-[26px] leading-8 font-black mt-3">ابنِ بثقة،<br/>من أقرب تاجر إليك.</h2>
                <p className="text-white/80 text-[13px] mt-2 max-w-[420px]">قارن الأسعار بين التجار المعتمدين، واطلب السعر مباشرة بدون وسيط.</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={()=>setTab("traders")} className="bg-white/15 px-4 py-2.5 rounded-xl text-[13px] font-bold">كل التجار</button>
                </div>
              </div>
              <div className="absolute -left-6 -bottom-10 opacity-20"><Building2 size={150}/></div>
            </div>

            <div className="mt-4 flex gap-2">
              <div className="flex-1 relative"><Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث: إسمنت، حديد، دهان…" className="w-full bg-white border border-[var(--line)] rounded-2xl pr-10 pl-3 py-3 text-[13px]"/></div>
              <select value={category} onChange={e=>{setCategory(e.target.value); setVisibleCount(10)}} className="bg-white border border-[var(--line)] rounded-2xl px-3 py-3 text-[13px] font-bold"><option value="الكل">كل الأصناف</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
            </div>
            <div className="mt-2 flex gap-2 items-center">
              <label className="flex items-center gap-1 text-[12px] font-bold text-[var(--muted)] shrink-0"><MapPin size={14}/> فلترة حسب الولاية:</label>
              <select value={wilayaFilter} onChange={e=>{setWilayaFilter(e.target.value); setVisibleCount(10)}} className="flex-1 bg-white border border-[var(--line)] rounded-2xl px-3 py-3 text-[13px] font-bold"><option value="كل الولايات">كل الولايات (58)</option>{WILAYAS.map((w,i)=><option key={w} value={w}>{String(i+1).padStart(2,"0")} — {w}</option>)}</select>
              {wilayaFilter!=="كل الولايات" && <button onClick={()=>setWilayaFilter("كل الولايات")} className="shrink-0 text-[12px] font-black text-[var(--orange)]">إلغاء ✕</button>}
            </div>

            {selectedTrader && <div className="mt-3 flex items-center justify-between bg-[var(--soft)] px-3 py-2 rounded-xl text-[12px] font-bold"><span>منتجات: {selectedTrader}</span><button onClick={()=>setSelectedTrader(null)} className="text-[var(--orange)]">إلغاء الفلتر ✕</button></div>}

            <div id="cats" className="mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4">
              <button onClick={()=>{setCategory("الكل"); setVisibleCount(10)}} className={`shrink-0 px-4 py-2.5 rounded-full text-[12px] font-black border ${category==="الكل"?"bg-[var(--navy)] text-white border-[var(--navy)]":"bg-white border-[var(--line)]"}`}>الكل</button>
              {CATEGORIES.map(c=>(
                <button key={c} onClick={()=>{setCategory(c); setVisibleCount(10)}} className={`shrink-0 flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-[12px] font-black border ${category===c?"bg-[var(--orange)] text-white border-[var(--orange)]":"bg-white border-[var(--line)]"}`}><span style={{color:category===c?"white":"#FF7A00"}}>{CAT_ICON[c]}</span>{c}</button>
              ))}
            </div>

            <div className="flex items-end justify-between mt-4 mb-3"><h3 className="text-[17px] font-black text-[var(--navy)]">{category==="الكل"?"كل المنتجات":category} <span className="text-[12px] text-[var(--muted)] font-bold">({filtered.length})</span></h3><span className="text-[11px] text-[var(--muted)]">عرض {Math.min(visibleCount, filtered.length)} من {filtered.length}</span></div>

            {filtered.length===0 ? <div className="bg-white rounded-3xl p-8 text-center border border-dashed"><PackageOpen className="mx-auto text-gray-300" size={44}/><p className="font-black mt-3">لا توجد منتجات في هذا الصنف بعد</p><p className="text-[12px] text-[var(--muted)] mt-1">جرّب صنفًا آخر أو ابحث باسم مختلف.</p></div> : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filtered.slice(0,visibleCount).map(p=>(
                  <article key={p.id} className="bg-white rounded-[20px] overflow-hidden border border-[var(--line)] card-shadow flex flex-col">
                    <button onClick={()=>setDetail(p)} className="relative h-[128px] sm:h-[150px] grid place-items-center text-left w-full" style={{background:CAT_COLOR[p.category]||"#FFF1E3"}} aria-label={p.name}>
                      <span className="text-[42px] text-[var(--navy)]/20">{CAT_ICON[p.category]}</span>
                      <span className="absolute top-2 right-2 bg-white/95 text-[10px] font-black px-2 py-1 rounded-full">{p.category}</span>
                      <span className="absolute bottom-2 left-2 bg-[var(--navy)] text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><MapPin size={10}/>{p.wilaya}</span>
                    </button>
                    <div className="p-3 flex flex-col flex-1">
                      <h4 className="font-black text-[13px] leading-5 line-clamp-2 min-h-[40px]">{p.name}</h4>
                      <p className="text-[11px] text-[var(--muted)] mt-1 truncate">🏪 {p.shopName}</p>

                      <div className="mt-2 flex items-center justify-between"><span className="text-[15px] font-black text-[var(--orange)]">{fmt(p.price)}</span><span className="text-[10px] bg-gray-100 px-2 py-1 rounded-full font-bold">متوفر</span></div>
                      <button disabled={busy} onClick={()=>requestPrice(p)} className="mt-3 w-full bg-[var(--navy)] text-white py-2.5 rounded-xl text-[12px] font-black hover:bg-[#24395f] active:scale-[.98]">اطلب السعر / اتصل بالتاجر</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {visibleCount < filtered.length && <button onClick={()=>setVisibleCount(c=>c+10)} className="w-full mt-5 bg-white border border-[var(--line)] py-3.5 rounded-2xl font-black text-[13px]">تحميل المزيد ↓</button>}
            <p className="text-center text-[11px] text-[var(--muted)] mt-3">رفع الصور غير متاح بعد.</p>
          </section>
        )}

        {tab==="traders" && (
          <section>
            <h2 className="text-[20px] font-black text-[var(--navy)]">التجار المعتمدون</h2>
            <p className="text-[13px] text-[var(--muted)] mt-1">تاجر موثوق في كل ولاية — اختر تاجرًا لعرض منتجاته. ({filteredTraders.length} تاجر)</p>
            <div className="mt-4 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative"><Search size={17} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"/><input value={traderSearch} onChange={e=>setTraderSearch(e.target.value)} placeholder="ابحث عن تاجر أو متجر…" className="w-full bg-white border border-[var(--line)] rounded-2xl pr-10 pl-3 py-3 text-[13px]"/></div>
              <select value={traderWilaya} onChange={e=>setTraderWilaya(e.target.value)} className="bg-white border border-[var(--line)] rounded-2xl px-3 py-3 text-[13px] font-bold"><option value="كل الولايات">كل الولايات (58)</option>{WILAYAS.map((w,i)=><option key={w} value={w}>{String(i+1).padStart(2,"0")} — {w}</option>)}</select>
            </div>
            {filteredTraders.length===0 && <div className="bg-white rounded-3xl p-8 text-center border border-dashed mt-4"><p className="font-black">لا يوجد تاجر في هذه الولاية بعد</p><p className="text-[12px] text-[var(--muted)] mt-1">جرّب ولاية أخرى أو امسح البحث.</p><button onClick={()=>{setTraderWilaya("كل الولايات"); setTraderSearch("")}} className="mt-3 bg-[var(--navy)] text-white px-4 py-2.5 rounded-xl text-[12px] font-black">عرض كل الولايات</button></div>}
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {filteredTraders.map(t=>(
                <article key={t.id} className="bg-white rounded-[20px] border border-[var(--line)] p-4 flex gap-3 card-shadow">
                  <div className="w-[58px] h-[58px] shrink-0 rounded-2xl bg-[var(--navy)] text-white grid place-items-center font-black text-[14px]">{initials(t.shopName)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2"><h3 className="font-black text-[14px] leading-5">{t.shopName}</h3>{t.approved ? <span className="shrink-0 text-[10px] bg-green-100 text-green-700 font-black px-2 py-1 rounded-full flex items-center gap-1"><Check size={11}/> معتمد</span> : <span className="shrink-0 text-[10px] bg-amber-100 text-amber-800 font-black px-2 py-1 rounded-full">بانتظار الاعتماد</span>}</div>
                    <p className="text-[12px] text-[var(--muted)] mt-1 flex items-center gap-1"><MapPin size={12}/> {t.wilaya} • {t.specialty}</p>

                    {admin && <p className="text-[12px] font-bold mt-1" dir="ltr" style={{textAlign:"right"}}>📞 {t.phone}</p>}
                    <div className="flex flex-wrap gap-2 mt-3">
                      <button onClick={()=>{setSelectedTrader(t.shopName); setWilayaFilter("كل الولايات"); setTab("products"); window.scrollTo({top:0,behavior:"smooth"})}} className="bg-[var(--orange)] text-white px-4 py-2 rounded-xl text-[12px] font-black">عرض منتجاته ←</button>
                      {admin && <button onClick={()=>setEditingTrader(t)} className="bg-gray-100 px-3 py-2 rounded-xl text-[12px] font-black flex items-center gap-1"><Edit3 size={13}/> تعديل</button>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab==="settings" && (
          <section className="space-y-4">
            <h2 className="text-[20px] font-black text-[var(--navy)]">الإعدادات</h2>

            <div className="bg-white rounded-[22px] border border-[var(--line)] p-5">
              <h3 className="font-black flex items-center gap-2"><Globe size={18} className="text-[var(--orange)]"/> اللغة</h3>
              <p className="text-[12px] text-[var(--muted)] mt-1">اللغة الحالية: <b className="text-[var(--ink)]">{language}</b></p>
              <select value={language} onChange={e=>{setLanguage(e.target.value); showToast(`تم اختيار اللغة: ${e.target.value}`)}} className="mt-3 w-full border border-[var(--line)] rounded-xl px-3 py-3 text-[13px] font-bold"><option>العربية</option><option>Français</option><option>English</option></select>
            </div>

            <div className="bg-white rounded-[22px] border border-[var(--line)] p-5">
              <button onClick={()=>setShowAbout(!showAbout)} className="w-full flex items-center justify-between"><span className="font-black flex items-center gap-2"><Info size={18} className="text-[var(--orange)]"/> حول موادّي</span><ChevronDown size={18} className={`transition ${showAbout?"rotate-180":""}`}/></button>
              {showAbout && <p className="text-[13px] leading-6 text-[var(--muted)] mt-3">موادّي سوق وطني لمواد البناء في الجزائر. قارن الأسعار بين التجار المعتمدين في ولايتك، واطلب السعر مباشرة بدون وسيط. للتجار: أنشئ حساب تاجر، أضف منتجاتك، وتابع طلبات السعر من زبائنك.</p>}
            </div>

            <div className="bg-white rounded-[22px] border border-[var(--line)] p-5">
              <button onClick={()=>setShowContact(!showContact)} className="w-full flex items-center justify-between"><span className="font-black flex items-center gap-2"><Mail size={18} className="text-[var(--orange)]"/> تواصل معنا</span><ChevronDown size={18} className={`transition ${showContact?"rotate-180":""}`}/></button>
              {showContact && <div className="mt-3 text-[13px] leading-6 text-[var(--muted)]"><p>فريق موادّي في خدمتك لأسئلتك حول الحساب، المتجر، والمنتجات.</p><p className="mt-2 font-bold text-[var(--ink)]">صفحة الإعدادات — قسم التواصل داخل التطبيق</p><p>اكتب لنا من خلال حسابك، وسنرد عليك في أقرب وقت.</p></div>}
            </div>

            <div className="bg-white rounded-[22px] border border-[var(--line)] p-5">
              <h3 className="font-black flex items-center gap-2"><ShieldCheck size={18} className="text-[var(--orange)]"/> إدارة</h3>
              <p className="text-[12px] text-[var(--muted)] mt-1">دخول المدير بالبريد وكلمة المرور. لا يوجد رمز مشترك داخل التطبيق.</p>
              {!admin ? <button onClick={()=>setAdminOpen(true)} className="mt-4 bg-[var(--orange)] text-white px-5 py-3 rounded-xl text-[13px] font-black">دخول الإدارة</button> : <span className="inline-block mt-4 bg-green-100 text-green-800 px-3 py-2 rounded-xl text-[12px] font-black">أنت داخل لوحة الإدارة</span>}
            </div>

            <div className="bg-white rounded-[22px] border border-[var(--line)] p-5">
              <h3 className="font-black flex items-center gap-2"><LogOut size={18} className="text-[var(--orange)]"/> الحساب</h3>
              {logged ? <><p className="text-[12px] text-[var(--muted)] mt-1">مسجّل دخول باسم: <b className="text-[var(--ink)]">{logged.name}</b></p><button onClick={()=>{setLogged(null); showToast("تم تسجيل الخروج.");}} className="mt-3 w-full bg-white border border-[var(--line)] py-3 rounded-xl font-black text-[13px]">تسجيل الخروج</button></> : <><p className="text-[12px] text-[var(--muted)] mt-1">لست مسجّل دخول بعد.</p><button onClick={()=>setTab("account")} className="mt-3 w-full bg-[var(--navy)] text-white py-3 rounded-xl font-black text-[13px]">الذهاب إلى حسابي</button></>}
            </div>

            {admin && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-2xl border p-4 text-center"><p className="text-[22px] font-black text-[var(--navy)]">{effectiveTraders.length}</p><p className="text-[11px] text-[var(--muted)] font-bold">إجمالي التجار</p></div>
                  <div className="bg-white rounded-2xl border p-4 text-center"><p className="text-[22px] font-black text-[var(--orange)]">{adminProductsView.length}</p><p className="text-[11px] text-[var(--muted)] font-bold">إجمالي المنتجات</p></div>
                  <div className="bg-white rounded-2xl border p-4 text-center"><p className="text-[22px] font-black text-[var(--navy)]">{totalReq}</p><p className="text-[11px] text-[var(--muted)] font-bold">طلبات السعر</p></div>
                </div>

                <div className="bg-white rounded-[22px] border border-[var(--line)] overflow-hidden">
                  <button onClick={()=>setShowTech(!showTech)} className="w-full p-5 flex items-center justify-between text-right"><span><span className="font-black flex items-center gap-2"><SettingsIcon size={18} className="text-[var(--orange)]"/> إعدادات تقنية - للأدمن فقط</span><span className="block text-[12px] text-[var(--muted)] mt-1">معلومات تقنية لا تظهر للتجار أو الزبائن.</span></span><ChevronDown size={18} className={`shrink-0 transition ${showTech?"rotate-180":""}`}/></button>
                  {showTech && (
                    <div className="px-5 pb-5 border-t border-[var(--line)] pt-4">
                      <h4 className="font-black text-[14px]">إعدادات Firebase</h4>
                      <p className="text-[12px] text-[var(--muted)] mt-1 leading-5">أدخل بيانات مشروعك. لا نضع أي مفتاح سري في التطبيق.</p>
                      <div className="grid sm:grid-cols-2 gap-3 mt-4">
                        <label className="block"><span className="text-[12px] font-bold">Project ID</span><input value={fb.projectId} onChange={e=>setFb({...fb,projectId:e.target.value})} className="mt-1 w-full border border-[var(--line)] rounded-xl px-3 py-2.5 text-[13px]"/></label>
                        <label className="block"><span className="text-[12px] font-bold">API Key</span><input value={fb.apiKey} onChange={e=>setFb({...fb,apiKey:e.target.value})} placeholder="AIza…" className="mt-1 w-full border border-[var(--line)] rounded-xl px-3 py-2.5 text-[13px]"/></label>
                        <label className="block"><span className="text-[12px] font-bold">Auth Domain</span><input value={fb.authDomain} onChange={e=>setFb({...fb,authDomain:e.target.value})} placeholder="mawadi-4b1e1.firebaseapp.com" className="mt-1 w-full border border-[var(--line)] rounded-xl px-3 py-2.5 text-[13px]"/></label>
                        <label className="block"><span className="text-[12px] font-bold">Storage Bucket</span><input value={fb.storageBucket} onChange={e=>setFb({...fb,storageBucket:e.target.value})} className="mt-1 w-full border border-[var(--line)] rounded-xl px-3 py-2.5 text-[13px]"/></label>
                        <label className="block"><span className="text-[12px] font-bold">Messaging Sender ID</span><input value={fb.messagingSenderId} onChange={e=>setFb({...fb,messagingSenderId:e.target.value})} className="mt-1 w-full border border-[var(--line)] rounded-xl px-3 py-2.5 text-[13px]"/></label>
                        <label className="block"><span className="text-[12px] font-bold">App ID</span><input value={fb.appId} onChange={e=>setFb({...fb,appId:e.target.value})} className="mt-1 w-full border border-[var(--line)] rounded-xl px-3 py-2.5 text-[13px]"/></label>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4"><button disabled={busy} onClick={saveFirebase} className="bg-[var(--navy)] text-white px-5 py-3 rounded-xl text-[13px] font-black">حفظ الإعدادات التقنية</button>{fbSaved && <span className="self-center text-[12px] font-bold text-green-700">✓ تم حفظ الإعدادات</span>}</div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-[22px] border p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-black">التجار</h3><button disabled={deletingFake} onClick={()=>setConfirmDeleteFake(true)} className="bg-red-50 text-red-600 px-3 py-2 rounded-xl text-[12px] font-black flex items-center gap-1">{deletingFake && <Loader2 size={14} className="animate-spin"/>} {deletingFake?"جاري الحذف...":"حذف كل التجار الوهميين"}</button></div>
                  <div className="mt-3 space-y-2">{effectiveTraders.map(t=>(
                    <div key={t.id} className="flex items-center justify-between gap-2 border rounded-2xl px-3 py-2.5"><div className="min-w-0"><p className="font-bold text-[13px] truncate">{t.shopName} — {t.wilaya}</p><p className="text-[11px] text-[var(--muted)]">📞 {t.phone} • {t.approved?"معتمد":"بانتظار"}{t.isFake?" • وهمي":""}</p></div><div className="flex gap-1 shrink-0"><button onClick={()=>setEditingTrader(t)} className="bg-gray-100 px-3 py-2 rounded-lg text-[11px] font-black">تعديل</button><button disabled={approvingId===t.id} onClick={()=>approveTrader(t)} className="bg-green-100 text-green-700 px-3 py-2 rounded-lg text-[11px] font-black flex items-center gap-1">{approvingId===t.id && <Loader2 size={12} className="animate-spin"/>} اعتماد</button><button disabled={deletingId===t.id} onClick={()=>deleteTrader(t)} className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-[11px] font-black flex items-center gap-1">{deletingId===t.id ? <><Loader2 size={12} className="animate-spin"/> جاري الحذف...</> : "حذف"}</button></div></div>
                  ))}</div>
                </div>
                <div className="bg-white rounded-[22px] border p-5"><h3 className="font-black">المنتجات</h3><div className="mt-3 space-y-2">{adminProductsView.map(p=>(
                  <div key={p.id} className="flex items-center justify-between gap-2 border rounded-2xl px-3 py-2.5"><div className="min-w-0"><p className="font-bold text-[13px] truncate">{p.name}</p><p className="text-[11px] text-[var(--muted)]">{fmt(p.price)} • {p.shopName} • {p.visible===false?"مخفي":"ظاهر"}</p></div><div className="flex gap-1 shrink-0"><button onClick={()=>setEditing(p)} className="bg-gray-100 px-3 py-2 rounded-lg text-[11px] font-black">تعديل</button><button disabled={togglingId===p.id} onClick={()=>toggleProductVisible(p)} className="bg-amber-100 text-amber-800 px-3 py-2 rounded-lg text-[11px] font-black flex items-center gap-1">{togglingId===p.id && <Loader2 size={12} className="animate-spin"/>}{p.visible===false?"إظهار":"إخفاء"}</button><button disabled={deletingId===p.id} onClick={()=>deleteProduct(p)} className="bg-red-100 text-red-600 px-3 py-2 rounded-lg text-[11px] font-black flex items-center gap-1">{deletingId===p.id ? <><Loader2 size={12} className="animate-spin"/> جاري الحذف...</> : "حذف"}</button></div></div>
                ))}</div></div>
                <div className="bg-white rounded-[22px] border p-5"><h3 className="font-black">طلبات السعر</h3>{requests.length===0?<p className="text-[12px] text-[var(--muted)] mt-2">لا توجد طلبات محفوظة بعد.</p>:<div className="mt-3 space-y-2">{requests.map(r=><div key={r.id} className="border rounded-2xl px-3 py-2.5 text-[12px]"><p className="font-bold">{r.productName}</p><p className="text-[var(--muted)]">زبون: {r.customerPhone} • تاجر: {r.traderName} • {r.date}</p></div>)}</div>}</div>
                <button onClick={()=>{setAdmin(false); setAdminOpen(false); showToast("تم الخروج من الإدارة.");}} className="w-full bg-white border py-3 rounded-2xl font-black text-[13px]">خروج من الإدارة</button>
              </div>
            )}
            <p className="text-[11px] text-[var(--muted)] leading-5">ملاحظة الخصوصية: أرقام هواتف التجار تظهر للمدير فقط في لوحة الإدارة.</p>
          </section>
        )}

        {tab==="account" && (
          <section>
            <h2 className="text-[20px] font-black text-[var(--navy)]">حسابي الشخصي</h2>
            {logged ? (
              <div className="mt-4 space-y-4">
                <div className="bg-[var(--navy)] text-white rounded-[22px] p-5 flex items-center gap-4"><div className="w-14 h-14 rounded-full bg-[var(--orange)] grid place-items-center font-black text-xl">{initials(logged.name)}</div><div><p className="font-black text-[16px]">{logged.name}</p><p className="text-white/80 text-[12px]">{logged.phone} • {logged.wilaya} • {logged.specialty}</p></div></div>
                <button onClick={()=>setShowPay(true)} className="w-full bg-[var(--orange)] text-white py-4 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2"><CreditCard size={18}/> جدد اشتراكي — 2000 دج / شهر</button>
                {logged.specialty!=="زبون" && <button onClick={openMyTraderProfile} className="w-full bg-white border border-[var(--line)] py-3.5 rounded-2xl font-black text-[13px] flex items-center justify-center gap-2"><Edit3 size={16}/> تعديل بيانات متجري وشعاره</button>}
                {logged.specialty!=="زبون" && <button onClick={()=>setShowAdd(!showAdd)} className="w-full bg-white border border-[var(--line)] py-3.5 rounded-2xl font-black text-[13px] flex items-center justify-center gap-2"><Plus size={17}/> {showAdd?"إغلاق نموذج الإضافة":"أضف منتجًا جديدًا"}</button>}
                {showAdd && logged.specialty!=="زبون" && (
                  <div className="bg-white rounded-[22px] border p-5 space-y-3">
                    <h3 className="font-black">إضافة منتج</h3>
                    <div>
                      <p className="font-black text-[14px]">صورة المنتج</p>
                      <div className="mt-2 border-2 border-dashed border-[var(--line)] rounded-2xl bg-[var(--bg)] px-3 py-6 text-center flex flex-col items-center justify-center gap-2" style={{minHeight:150}}>
                        <span className="w-12 h-12 rounded-full bg-white border grid place-items-center text-[var(--orange)]"><ImageIcon size={24}/></span>
                        <p className="font-black text-[13px]">صورة المنتج</p>
                        <p className="text-[12px] text-[var(--muted)] leading-5">رفع الصور غير متاح بعد.</p>
                      </div>
                    </div>
                    <input value={newProd.name} onChange={e=>setNewProd({...newProd,name:e.target.value})} placeholder="اسم المنتج" className="w-full border rounded-xl px-3 py-3 text-[13px]"/>
                    <label className="block"><span className="text-[12px] font-bold flex items-center gap-1"><MapPin size={13}/> ولاية المنتج</span><select value={newProd.wilaya} onChange={e=>setNewProd({...newProd,wilaya:e.target.value})} className="mt-1 w-full border rounded-xl px-3 py-3 text-[13px]">{WILAYAS.map((w,i)=><option key={w} value={w}>{String(i+1).padStart(2,"0")} — {w}</option>)}</select></label>
                    <div className="grid grid-cols-2 gap-3"><input type="number" value={newProd.price} onChange={e=>setNewProd({...newProd,price:e.target.value})} placeholder="السعر بالدج" className="border rounded-xl px-3 py-3 text-[13px]"/><select value={newProd.category} onChange={e=>setNewProd({...newProd,category:e.target.value})} className="border rounded-xl px-3 py-3 text-[13px]">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                    <textarea value={newProd.description} onChange={e=>setNewProd({...newProd,description:e.target.value})} placeholder="وصف المنتج" rows={3} className="w-full border rounded-xl px-3 py-3 text-[13px]"/>
                    {formMsg && <p className="text-[12px] font-bold text-red-600">{formMsg}</p>}
                    <button disabled={busy} onClick={addProduct} className="w-full bg-[var(--navy)] text-white py-3.5 rounded-xl font-black text-[13px]">نشر المنتج</button>
                    <p className="text-[11px] text-[var(--muted)]">رفع الصور غير متاح بعد.</p>
                  </div>
                )}
                <button onClick={()=>{setLogged(null); showToast("تم تسجيل الخروج.");}} className="w-full bg-white border py-3 rounded-2xl font-black text-[13px]">تسجيل الخروج</button>
              </div>
            ) : mode==="login" ? (
              <div className="mt-4 bg-white rounded-[22px] border p-5">
                <label className="block"><span className="text-[12px] font-bold flex items-center gap-1"><Phone size={13}/> رقم الهاتف</span><input value={phone} onChange={e=>setPhone(e.target.value)} inputMode="tel" placeholder="0550 00 00 00" className="mt-1.5 w-full border rounded-xl px-3 py-3.5 text-[14px]"/></label>
                <label className="block mt-4"><span className="text-[12px] font-bold flex items-center gap-1"><Lock size={13}/> كلمة المرور</span><div className="relative mt-1.5"><input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" className="w-full border rounded-xl px-3 py-3.5 text-[14px] pl-11"/><button onClick={()=>setShowPass(!showPass)} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" aria-label="إظهار كلمة المرور">{showPass?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
                <button onClick={()=>{setFormMsg(""); setMode("forgot")}} className="mt-2 text-[12px] font-bold text-[var(--orange)]">نسيت كلمة المرور؟</button>
                {formMsg && <p className="mt-3 text-[12px] font-bold text-red-600">{formMsg}</p>}
                <button onClick={doLogin} disabled={busy && authAction==="login"} className="w-full mt-4 bg-[var(--orange)] text-white py-4 rounded-2xl font-black text-[15px] flex items-center justify-center gap-2">{busy && authAction==="login" && <Loader2 size={18} className="animate-spin"/>} {busy && authAction==="login" ? "جاري الدخول..." : "دخول حسابي"}</button>
                <p className="text-center text-[12px] text-[var(--muted)] mt-3">للتجربة في الوضع التجريبي: 0550000000 / 1234</p>
                <div className="mt-4 pt-4 border-t text-center text-[13px]">ما عندكش حساب؟ <button onClick={()=>setMode("create")} className="font-black text-[var(--navy)] underline">إنشاء حساب جديد</button></div>
              </div>
            ) : mode==="forgot" ? (
              <div className="mt-4 bg-white rounded-[22px] border p-5">
                <button onClick={()=>setMode("login")} className="flex items-center gap-1 text-[12px] font-bold text-[var(--muted)]"><ArrowLeft size={14}/> رجوع</button>
                <h3 className="font-black mt-3">استرجاع كلمة المرور</h3>
                <label className="block mt-4"><span className="text-[12px] font-bold">رقم الهاتف</span><input value={forgotPhone} onChange={e=>setForgotPhone(e.target.value)} placeholder="0550 00 00 00" className="mt-1.5 w-full border rounded-xl px-3 py-3 text-[13px]"/></label>
                <label className="block mt-3"><span className="text-[12px] font-bold">كلمة مرور جديدة</span><input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="كلمة مرور جديدة" className="mt-1.5 w-full border rounded-xl px-3 py-3 text-[13px]"/></label>
                {formMsg && <p className="mt-3 text-[12px] font-bold text-red-600">{formMsg}</p>}
                <button onClick={doReset} disabled={busy && authAction==="reset"} className="w-full mt-4 bg-[var(--navy)] text-white py-3.5 rounded-xl font-black text-[13px] flex items-center justify-center gap-2">{busy && authAction==="reset" && <Loader2 size={16} className="animate-spin"/>} {busy && authAction==="reset" ? "جارٍ الحفظ..." : "تأكيد التغيير"}</button>
              </div>
            ) : (
              <div className="mt-4 bg-white rounded-[22px] border p-5">
                <button onClick={()=>setMode("login")} className="flex items-center gap-1 text-[12px] font-bold text-[var(--muted)]"><ArrowLeft size={14}/> رجوع للدخول</button>
                <h3 className="font-black mt-3">إنشاء حساب جديد</h3>
                <div className="mt-4">
                  <p className="font-black text-[14px]">صورة المحل / لوغو المحل</p>
                  <div className="mt-2 border-2 border-dashed border-[var(--line)] rounded-2xl bg-[var(--bg)] px-3 py-6 text-center flex flex-col items-center justify-center gap-2" style={{minHeight:150}}>
                    <span className="w-12 h-12 rounded-full bg-white border grid place-items-center text-[var(--orange)]"><ImageIcon size={24}/></span>
                    <p className="font-black text-[13px]">صورة المحل</p>
                    <p className="text-[12px] text-[var(--muted)] leading-5">رفع الصور غير متاح بعد.</p>
                  </div>
                </div>
                <div className="grid gap-3 mt-4">
                  <input value={reg.name} onChange={e=>setReg({...reg,name:e.target.value})} placeholder="الاسم الكامل" className="border rounded-xl px-3 py-3 text-[13px]"/>
                  <input value={reg.phone} onChange={e=>setReg({...reg,phone:e.target.value})} placeholder="رقم الهاتف" className="border rounded-xl px-3 py-3 text-[13px]"/>
                  <input type="password" value={reg.password} onChange={e=>setReg({...reg,password:e.target.value})} placeholder="كلمة المرور" className="border rounded-xl px-3 py-3 text-[13px]"/>
                  <select value={reg.wilaya} onChange={e=>setReg({...reg,wilaya:e.target.value})} className="border rounded-xl px-3 py-3 text-[13px]">{WILAYAS.map(w=><option key={w}>{w}</option>)}</select>
                  <select value={reg.specialty} onChange={e=>setReg({...reg,specialty:e.target.value})} className="border rounded-xl px-3 py-3 text-[13px]"><option>زبون</option>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select>
                  {reg.specialty!=="زبون" && (
                    <p className="text-[12px] text-[var(--muted)]">رفع الصور غير متاح بعد.</p>
                  )}
                </div>
                {formMsg && <p className="mt-3 text-[12px] font-bold text-red-600">{formMsg}</p>}
                <button onClick={doCreateAccount} disabled={busy && authAction==="create"} className="w-full mt-4 bg-[var(--orange)] text-white py-4 rounded-2xl font-black text-[14px] flex items-center justify-center gap-2">{busy && authAction==="create" && <Loader2 size={18} className="animate-spin"/>} {busy && authAction==="create" ? "جارٍ إنشاء الحساب..." : "إنشاء حساب"}</button>
              </div>
            )}
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 right-0 left-0 z-40 bg-white border-t border-[var(--line)]" style={{paddingBottom:"env(safe-area-inset-bottom)"}}>
        <div className="max-w-[980px] mx-auto grid grid-cols-4 px-2">
          {([{k:"products",label:"المنتجات",icon:<Package size={20}/>},{k:"traders",label:"التجار",icon:<Store size={20}/>},{k:"settings",label:"الإعدادات",icon:<SettingsIcon size={20}/>},{k:"account",label:"حسابي الشخصي",icon:<User size={20}/>}] as const).map(item=>(
            <button key={item.k} onClick={()=>setTab(item.k)} className={`py-2.5 flex flex-col items-center gap-1 text-[11px] font-black ${tab===item.k?"text-[var(--orange)]":"text-gray-500"}`}><span className={`p-1.5 rounded-full ${tab===item.k?"bg-[var(--soft)]":""}`}>{item.icon}</span>{item.label}</button>
          ))}
        </div>
      </nav>

      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-end sm:place-items-center p-0 sm:p-4" onClick={()=>setDetail(null)}>
          <div className="bg-white w-full sm:max-w-[520px] rounded-t-[26px] sm:rounded-[26px] p-5 max-h-[88vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between items-start"><h3 className="font-black text-[17px] leading-6">{detail.name}</h3><button onClick={()=>setDetail(null)} className="w-9 h-9 rounded-full bg-gray-100 grid place-items-center shrink-0"><X size={18}/></button></div>
            <div className="h-[150px] rounded-2xl mt-4 grid place-items-center" style={{background:CAT_COLOR[detail.category]}}><span className="text-[var(--navy)]/25">{CAT_ICON[detail.category]}</span></div>
            <p className="text-[13px] text-[var(--muted)] leading-6 mt-4">{detail.description||"منتج متوفر لدى التاجر — اطلب السعر للحصول على التفاصيل والتوصيل."}</p>

            <div className="flex justify-between mt-4"><span className="font-black text-[20px] text-[var(--orange)]">{fmt(detail.price)}</span><span className="text-[12px] font-bold">{detail.shopName} • {detail.wilaya}</span></div>
            <button disabled={busy} onClick={()=>{requestPrice(detail); setDetail(null)}} className="w-full mt-4 bg-[var(--navy)] text-white py-4 rounded-2xl font-black">اطلب السعر / اتصل بالتاجر</button>
          </div>
        </div>
      )}

      {adminOpen && !admin && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={()=>setAdminOpen(false)}>
          <div className="bg-white w-full max-w-[420px] rounded-[24px] p-5" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between"><h3 className="font-black text-[17px]">دخول الإدارة</h3><button onClick={()=>setAdminOpen(false)}><X size={18}/></button></div>
            <p className="text-[12px] text-[var(--muted)] mt-1">أدخل بريد المدير وكلمة المرور. أول دخول ينشئ حساب المدير.</p>
            <input value={adminEmail} onChange={e=>setAdminEmail(e.target.value)} placeholder="بريد المدير" className="mt-4 w-full border rounded-xl px-3 py-3 text-[13px]"/>
            <input type="password" value={adminPass} onChange={e=>setAdminPass(e.target.value)} placeholder="كلمة مرور المدير" className="mt-3 w-full border rounded-xl px-3 py-3 text-[13px]"/>
            {adminMsg && <p className="mt-3 text-[12px] font-bold text-red-600">{adminMsg}</p>}
            <button disabled={busy} onClick={adminLogin} className="w-full mt-4 bg-[var(--orange)] text-white py-3.5 rounded-xl font-black flex items-center justify-center gap-2">{busy && <Loader2 size={16} className="animate-spin"/>} {busy ? "جارٍ الدخول..." : "دخول"}</button>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={()=>setEditing(null)}>
          <div className="bg-white w-full max-w-[460px] rounded-[24px] p-5 max-h-[88vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="font-black">تعديل المنتج</h3>
            <div className="mt-4">
              <p className="font-black text-[14px]">صورة المنتج</p>
              <div className="mt-2 border-2 border-dashed border-[var(--line)] rounded-2xl bg-[var(--bg)] px-3 py-6 text-center flex flex-col items-center justify-center gap-2" style={{minHeight:150}}>
                <span className="w-12 h-12 rounded-full bg-white border grid place-items-center text-[var(--orange)]"><ImageIcon size={24}/></span>
                <p className="font-black text-[13px]">صورة المنتج</p>
                <p className="text-[12px] text-[var(--muted)] leading-5">رفع الصور غير متاح بعد.</p>
              </div>
            </div>
            <input value={editing.name} onChange={e=>setEditing({...editing,name:e.target.value})} className="mt-4 w-full border rounded-xl px-3 py-3 text-[13px]"/>
            <input type="number" value={editing.price} onChange={e=>setEditing({...editing,price:Number(e.target.value)})} className="mt-3 w-full border rounded-xl px-3 py-3 text-[13px]"/>

            <div className="flex gap-2 mt-4"><button disabled={savingEdit} onClick={saveEditProduct} className="flex-1 bg-[var(--navy)] text-white py-3 rounded-xl font-black flex items-center justify-center gap-2">{savingEdit && <Loader2 size={16} className="animate-spin"/>} {savingEdit ? "جارٍ الحفظ..." : "حفظ"}</button><button onClick={()=>setEditing(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-black">إلغاء</button></div>
          </div>
        </div>
      )}

      {editingTrader && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={()=>setEditingTrader(null)}>
          <div className="bg-white w-full max-w-[460px] rounded-[24px] p-5 max-h-[88vh] overflow-y-auto" onClick={e=>e.stopPropagation()}>
            <h3 className="font-black">تعديل بيانات المتجر</h3>
            <div className="mt-4">
              <p className="font-black text-[14px]">صورة المحل / لوغو المحل</p>
              <div className="mt-2 border-2 border-dashed border-[var(--line)] rounded-2xl bg-[var(--bg)] px-3 py-6 text-center flex flex-col items-center justify-center gap-2" style={{minHeight:150}}>
                <span className="w-12 h-12 rounded-full bg-white border grid place-items-center text-[var(--orange)]"><ImageIcon size={24}/></span>
                <p className="font-black text-[13px]">صورة المحل / لوغو المحل</p>
                <p className="text-[12px] text-[var(--muted)] leading-5">رفع الصور غير متاح بعد.</p>
              </div>
            </div>
            <input value={editingTrader.shopName} onChange={e=>setEditingTrader({...editingTrader,shopName:e.target.value})} placeholder="اسم المتجر" className="mt-4 w-full border rounded-xl px-3 py-3 text-[13px]"/>
            <input value={editingTrader.name} onChange={e=>setEditingTrader({...editingTrader,name:e.target.value})} placeholder="اسم التاجر" className="mt-3 w-full border rounded-xl px-3 py-3 text-[13px]"/>
            <select value={editingTrader.wilaya} onChange={e=>setEditingTrader({...editingTrader,wilaya:e.target.value})} className="mt-3 w-full border rounded-xl px-3 py-3 text-[13px]">{WILAYAS.map(w=><option key={w}>{w}</option>)}</select>
            <input value={editingTrader.specialty} onChange={e=>setEditingTrader({...editingTrader,specialty:e.target.value})} placeholder="التخصص" className="mt-3 w-full border rounded-xl px-3 py-3 text-[13px]"/>

            <div className="flex gap-2 mt-4"><button disabled={savingTraderEdit} onClick={saveEditTrader} className="flex-1 bg-[var(--navy)] text-white py-3 rounded-xl font-black flex items-center justify-center gap-2">{savingTraderEdit && <Loader2 size={16} className="animate-spin"/>} {savingTraderEdit ? "جارٍ الحفظ..." : "حفظ"}</button><button onClick={()=>setEditingTrader(null)} className="flex-1 bg-gray-100 py-3 rounded-xl font-black">إلغاء</button></div>
          </div>
        </div>
      )}

      {showPay && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={()=>setShowPay(false)}>
          <div className="bg-white w-full max-w-[460px] rounded-[24px] p-5" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between"><h3 className="font-black">تجديد الاشتراك — 2000 دج / شهر</h3><button onClick={()=>setShowPay(false)}><X size={18}/></button></div>
            <p className="text-[13px] leading-6 text-[var(--muted)] mt-3">ادفع بأمان عبر <b className="text-[var(--ink)]">Chargily Pay V2</b> باستخدام بطاقتك <b>EDAHABIA</b> أو <b>CIB</b>. سيتم تحويلك إلى صفحة دفع آمنة لإتمام العملية.</p>
            <label className="block mt-4"><span className="text-[12px] font-bold">Chargily Publishable Key (المفتاح القابل للنشر فقط)</span><input value={pubKey} onChange={e=>setPubKey(e.target.value)} placeholder="test_pk_… أو live_pk_…" className="mt-1.5 w-full border rounded-xl px-3 py-3 text-[13px]"/></label>
            <p className="text-[11px] text-red-600 font-bold mt-2">لا تُدخل المفتاح السري (Secret Key) أبدًا داخل التطبيق.</p>
            <button onClick={saveChargily} className="w-full mt-4 bg-[var(--orange)] text-white py-3.5 rounded-xl font-black">حفظ المفتاح والمتابعة للدفع</button>
          </div>
        </div>
      )}

      {confirmDeleteFake && (
        <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4">
          <div className="bg-white w-full max-w-[400px] rounded-[24px] p-5 text-center">
            <h3 className="font-black">حذف كل التجار الوهميين؟</h3><p className="text-[12px] text-[var(--muted)] mt-2">سيتم حذف التجار المحفوظين بعلامة “وهمي” فقط. لا يمكن التراجع.</p>
            <div className="flex gap-2 mt-4"><button disabled={deletingFake} onClick={deleteAllFake} className="flex-1 bg-red-600 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2">{deletingFake && <Loader2 size={16} className="animate-spin"/>} {deletingFake ? "جاري الحذف..." : "تأكيد الحذف"}</button><button onClick={()=>setConfirmDeleteFake(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-black">إلغاء</button></div>
          </div>
        </div>
      )}
      {backendError && <p className="sr-only">{backendError}</p>}
    </div>
  );
}
