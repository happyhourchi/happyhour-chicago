'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const today = DAYS[new Date().getDay()];
const todayDate = new Date().toDateString();

const NEIGHBORHOODS = ['All','Loop','River North','West Loop','Fulton Market','River West','Lincoln Park','Wicker Park','Logan Square','Gold Coast','Andersonville','Streeterville','Avondale','Lincoln Square','Old Town','Lakeview','South Loop','Hyde Park','Pilsen','Bucktown'];

const SEED = [
  {id:1,name:"Monk's Pub",address:"205 W Lake St, Loop",cuisine:"Bar & Grill",neighborhood:"Loop",time:"3-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$3 Old Style","$5 wells","Half-off apps"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:2,name:"Aba",address:"302 N Green St, Fulton Market",cuisine:"Other",neighborhood:"Fulton Market",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 cocktails","$6 wines","Half-off mezze"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:3,name:"Federales",address:"420 W Grand Ave, River West",cuisine:"Mexican",neighborhood:"River West",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 margaritas","$4 tacos","$3 Tecate"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:4,name:"RPM Steak",address:"66 W Kinzie St, River North",cuisine:"American",neighborhood:"River North",time:"5-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$9 cocktails","$7 wines","$14 wagyu sliders"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:5,name:"Sushi San",address:"63 W Grand Ave, River North",cuisine:"Asian",neighborhood:"River North",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 sake","$6 Sapporo","Half-off rolls"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:6,name:"Oyster Bah",address:"1962 N Halsted St, Lincoln Park",cuisine:"Seafood",neighborhood:"Lincoln Park",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$1 oysters","$6 wine","$7 cocktails"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:7,name:"The Dawson",address:"730 W Grand Ave, River West",cuisine:"American",neighborhood:"River West",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 drafts","$6 cocktails","$4 wine"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:8,name:"Maple & Ash",address:"8 W Maple St, Gold Coast",cuisine:"American",neighborhood:"Gold Coast",time:"5-6:30 PM",days:["Mon","Tue","Wed","Thu"],deals:["$10 cocktails","Oysters $2 each","$8 wine"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:9,name:"Broken English Taco Pub",address:"1750 W Division St, Wicker Park",cuisine:"Mexican",neighborhood:"Wicker Park",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$3 tacos","$5 margaritas","$3 Modelo"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:10,name:"El Hefe",address:"15 W Illinois St, River North",cuisine:"Mexican",neighborhood:"River North",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 tacos","$6 margs","Chips & guac $3"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:11,name:"Siena Tavern",address:"51 W Kinzie St, River North",cuisine:"Italian",neighborhood:"River North",time:"5-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$7 wine","$8 cocktails","Half-off small plates"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:12,name:"Bangers & Lace",address:"1670 W Division St, Wicker Park",cuisine:"Bar & Grill",neighborhood:"Wicker Park",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 craft drafts","$6 cocktails","$4 shots"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:13,name:"Hopleaf Bar",address:"5148 N Clark St, Andersonville",cuisine:"Bar & Grill",neighborhood:"Andersonville",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 drafts","$2 off cocktails","$5 wine"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:14,name:"Cindy's Rooftop",address:"12 S Michigan Ave, Loop",cuisine:"American",neighborhood:"Loop",time:"5-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$10 cocktails","$8 wine","Rooftop views"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:15,name:"Kuma's Corner",address:"2900 W Belmont Ave, Avondale",cuisine:"American",neighborhood:"Avondale",time:"11AM-5 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$3 PBR","$5 wells","Half-off burgers"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:16,name:"The Purple Pig",address:"500 N Michigan Ave, Streeterville",cuisine:"Other",neighborhood:"Streeterville",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$6 wine","$7 cocktails","Half-off charcuterie"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:17,name:"Parlor Pizza Bar",address:"108 N State St, Loop",cuisine:"American",neighborhood:"Loop",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 drafts","$6 wine","$7 cocktails"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:18,name:"Forno Rosso",address:"1048 W Randolph St, West Loop",cuisine:"Italian",neighborhood:"West Loop",time:"5-6:30 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$6 wine","$7 Negroni","Half-off pizzette"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:19,name:"Three Dots and a Dash",address:"435 N Clark St, River North",cuisine:"Other",neighborhood:"River North",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 tiki cocktails","$5 beer","Half-off appetizers"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:20,name:"Avec",address:"615 W Randolph St, West Loop",cuisine:"Other",neighborhood:"West Loop",time:"3:30-5:30 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$7 wine","$8 cocktails","$10 chorizo dates"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:21,name:"The Gage",address:"24 S Michigan Ave, Loop",cuisine:"American",neighborhood:"Loop",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 drafts","$7 cocktails","Half-off bar snacks"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:22,name:"GT Fish & Oyster",address:"531 N Wells St, River North",cuisine:"Seafood",neighborhood:"River North",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$1.50 oysters","$7 wine","$8 cocktails"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:23,name:"Cite",address:"505 N Lake Shore Dr, Streeterville",cuisine:"American",neighborhood:"Streeterville",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 cocktails","$7 wine","Lake views"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:24,name:"Longman & Eagle",address:"2657 N Kedzie Ave, Logan Square",cuisine:"American",neighborhood:"Logan Square",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 drafts","$5 whiskey","$6 cocktails"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:25,name:"Lost Lake",address:"3154 W Diversey Ave, Logan Square",cuisine:"Other",neighborhood:"Logan Square",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$7 tiki drinks","$4 beer","Half-off snacks"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:26,name:"Beatrix",address:"519 N Clark St, River North",cuisine:"American",neighborhood:"River North",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$6 wine","$8 cocktails","Half-off small plates"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:27,name:"Boka",address:"1729 N Halsted St, Lincoln Park",cuisine:"American",neighborhood:"Lincoln Park",time:"5-6:30 PM",days:["Mon","Tue","Wed","Thu"],deals:["$9 cocktails","$7 wine","Chef snacks $5"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:28,name:"Cabra",address:"167 N Green St, West Loop",cuisine:"Other",neighborhood:"West Loop",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 pisco cocktails","$6 wine","Half-off ceviches"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:29,name:"Harriet's Rooftop",address:"167 N Green St, West Loop",cuisine:"American",neighborhood:"West Loop",time:"5-7 PM",days:["Mon","Tue","Wed","Thu","Fri","Sat"],deals:["$9 cocktails","$7 wine","Rooftop vibes"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:30,name:"Avli Taverna",address:"566 Chestnut St, River North",cuisine:"Other",neighborhood:"River North",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$7 Greek wine","$8 cocktails","Half-off mezze"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:31,name:"Girl & the Goat",address:"800 W Randolph St, West Loop",cuisine:"American",neighborhood:"West Loop",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 cocktails","$6 wine","Half-off small plates"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:32,name:"Big Star",address:"1531 N Damen Ave, Wicker Park",cuisine:"Mexican",neighborhood:"Wicker Park",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$3 tacos","$4 Lone Star","$6 margaritas"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:33,name:"The Violet Hour",address:"1520 N Damen Ave, Wicker Park",cuisine:"Bar & Grill",neighborhood:"Wicker Park",time:"5-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 cocktails","$5 beer","Half-off bar snacks"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:34,name:"Pequod's Pizza",address:"2207 N Clybourn Ave, Lincoln Park",cuisine:"American",neighborhood:"Lincoln Park",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$3 drafts","$5 wells","Half-off appetizers"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:35,name:"Au Cheval",address:"800 W Randolph St, West Loop",cuisine:"American",neighborhood:"West Loop",time:"3-5 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 drafts","$7 cocktails","$4 PBR"],reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
];

function isActive(r) {
  if (!r.days || !r.days.includes(today)) return false;
  const s = r.time.toLowerCase().replace(/\s/g,'');
  const m = s.match(/(\d+)(?::(\d+))?(am|pm)?[-](\d+)(?::(\d+))?(am|pm)?/);
  if (!m) return false;
  let sh=+m[1],sm=m[2]?+m[2]:0,sp=m[3],eh=+m[4],em=m[5]?+m[5]:0,ep=m[6];
  if(!sp&&sh<7)sp='pm';
  if(sp==='pm'&&sh!==12)sh+=12;
  if(ep==='pm'&&eh!==12)eh+=12;
  const now=new Date();
  return(now.getHours()*60+now.getMinutes())>=(sh*60+sm)&&(now.getHours()*60+now.getMinutes())<(eh*60+em);
}

function avgRating(reviews) {
  if (!reviews || !reviews.length) return 0;
  return reviews.reduce((a,b)=>a+(b.stars||0),0)/reviews.length;
}

function initials(name) {
  return (name||'G').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
}

const COLORS = ['#185FA5','#0F6E56','#993C1D','#534AB7','#3B6D11','#854F0B'];
function avatarColor(name) { return COLORS[(name||'A').charCodeAt(0)%COLORS.length]; }

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [feed, setFeed] = useState([]);
  const [tab, setTab] = useState('list');
  const [search, setSearch] = useState('');
  const [cuisineF, setCuisineF] = useState('');
  const [dayF, setDayF] = useState('');
  const [neighborhoodF, setNeighborhoodF] = useState('All');
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState([]);
  const [showAI, setShowAI] = useState(false);
  const [aiQuery, setAiQuery] = useState('happy hour deals Chicago today');
  const [addForm, setAddForm] = useState({name:'',address:'',cuisine:'American',neighborhood:'River North',time:'',days:'Mon-Fri',deals:''});
  const [reviewForm, setReviewForm] = useState({stars:5,text:''});
  const [toast, setToast] = useState('');
  const [mounted, setMounted] = useState(false);
  const [dbCheckins, setDbCheckins] = useState([]);
  const [dbRatings, setDbRatings] = useState({});
  const [dbSaved, setDbSaved] = useState([]);

  useEffect(() => {
    setMounted(true);
    try {
      const r = localStorage.getItem('hh_restaurants');
      setRestaurants(r ? JSON.parse(r) : SEED);
      const f = localStorage.getItem('hh_feed');
      if (f) setFeed(JSON.parse(f));
    } catch(e) { setRestaurants(SEED); }

    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user) {
        setAuthUser(session.user);
        loadProfile(session.user.id);
        loadUserData(session.user.id);
      }
    });

    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){
        setAuthUser(session.user);
        loadProfile(session.user.id);
        loadUserData(session.user.id);
      } else {
        setAuthUser(null);
        setProfile(null);
        setDbCheckins([]);
        setDbRatings({});
        setDbSaved([]);
      }
    });
    return ()=>subscription.unsubscribe();
  }, []);

  async function loadProfile(userId) {
    const {data} = await supabase.from('profiles').select('*').eq('id',userId).single();
    if(data) setProfile(data);
    else {
      const {data:newProfile} = await supabase.from('profiles').insert({id:userId,username:'Happy Hour Fan',xp:0,level:1}).select().single();
      if(newProfile) setProfile(newProfile);
    }
  }

  async function loadUserData(userId) {
    const [{data:ci},{data:rt},{data:sv}] = await Promise.all([
      supabase.from('checkins').select('*').eq('user_id',userId),
      supabase.from('ratings').select('*').eq('user_id',userId),
      supabase.from('saved').select('*').eq('user_id',userId),
    ]);
    if(ci) setDbCheckins(ci);
    if(rt) {
      const ratingsMap = {};
      rt.forEach(r=>ratingsMap[r.restaurant_id]=r.stars);
      setDbRatings(ratingsMap);
    }
    if(sv) setDbSaved(sv.map(s=>s.restaurant_id));
  }

  async function addXP(amount) {
    if(!authUser||!profile) return;
    const newXp = (profile.xp||0)+amount;
    const newLevel = Math.floor(newXp/200)+1;
    await supabase.from('profiles').update({xp:newXp,level:newLevel}).eq('id',authUser.id);
    setProfile(p=>({...p,xp:newXp,level:newLevel}));
  }

  async function signInWithGoogle() {
    setAuthLoading(true);
    const {error} = await supabase.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:window.location.origin}
    });
    if(error) setAuthError(error.message);
    setAuthLoading(false);
  }

  async function signInWithEmail() {
    setAuthLoading(true);
    setAuthError('');
    const {error} = await supabase.auth.signInWithPassword({email:authEmail,password:authPassword});
    if(error) setAuthError(error.message);
    else { setShowAuth(false); toast2('Welcome back!'); }
    setAuthLoading(false);
  }

  async function signUpWithEmail() {
    setAuthLoading(true);
    setAuthError('');
    const {data,error} = await supabase.auth.signUp({email:authEmail,password:authPassword});
    if(error) { setAuthError(error.message); setAuthLoading(false); return; }
    if(data.user) {
      await supabase.from('profiles').insert({id:data.user.id,username:authUsername||'Happy Hour Fan',xp:0,level:1});
      toast2('Account created! Check your email to verify.');
      setShowAuth(false);
    }
    setAuthLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    toast2('Signed out!');
  }

  function saveR(rs) { setRestaurants(rs); try{localStorage.setItem('hh_restaurants',JSON.stringify(rs));}catch(e){} }
  function saveF(f) { setFeed(f); try{localStorage.setItem('hh_feed',JSON.stringify(f));}catch(e){} }
  function toast2(msg) { setToast(msg); setTimeout(()=>setToast(''),3000); }

  function pushFeed(type,rname,text,stars) {
    saveF([{type,rname,text,stars,author:profile?.username||authUser?.email||'Guest',date:'Just now',id:Date.now()},...feed].slice(0,30));
  }

  async function doCheckin(rid) {
    const r = restaurants.find(x=>x.id===rid);
    if(!r) return;
    const alreadyCheckedIn = dbCheckins.some(c=>c.restaurant_id===String(rid)&&new Date(c.checked_in_at).toDateString()===todayDate);
    if(alreadyCheckedIn){toast2('Already checked in today!');return;}
    if(authUser){
      await supabase.from('checkins').insert({user_id:authUser.id,restaurant_id:String(rid),restaurant_name:r.name,neighborhood:r.neighborhood});
      setDbCheckins(prev=>[...prev,{restaurant_id:String(rid),checked_in_at:new Date().toISOString()}]);
      await addXP(50);
    }
    pushFeed('ci',r.name,'checked in at '+r.name);
    toast2('+50 XP! Checked in at '+r.name);
  }

  async function doRate(rid,stars) {
    if(!authUser){setShowAuth(true);toast2('Sign in to rate!');return;}
    const existing = dbRatings[String(rid)];
    if(existing){
      await supabase.from('ratings').update({stars}).eq('user_id',authUser.id).eq('restaurant_id',String(rid));
    } else {
      await supabase.from('ratings').insert({user_id:authUser.id,restaurant_id:String(rid),stars});
      await addXP(10);
    }
    setDbRatings(prev=>({...prev,[String(rid)]:stars}));
    toast2('+10 XP! Rated '+stars+' stars');
  }

  async function doSaveR(rid) {
    if(!authUser){setShowAuth(true);toast2('Sign in to save!');return;}
    const isSaved = dbSaved.includes(String(rid));
    if(isSaved){
      await supabase.from('saved').delete().eq('user_id',authUser.id).eq('restaurant_id',String(rid));
      setDbSaved(prev=>prev.filter(x=>x!==String(rid)));
    } else {
      await supabase.from('saved').insert({user_id:authUser.id,restaurant_id:String(rid)});
      setDbSaved(prev=>[...prev,String(rid)]);
    }
  }

  async function submitReview() {
    if(!authUser){setShowAuth(true);return;}
    if(!reviewForm.text.trim()){toast2('Please write something');return;}
    await supabase.from('reviews').insert({user_id:authUser.id,restaurant_id:String(reviewTarget.id),restaurant_name:reviewTarget.name,body:reviewForm.text,stars:reviewForm.stars});
    const rv={id:Date.now(),author:profile?.username||authUser.email,text:reviewForm.text,stars:reviewForm.stars,likes:[],date:'Just now'};
    saveR(restaurants.map(r=>r.id===reviewTarget.id?{...r,reviews:[rv,...(r.reviews||[])]}:r));
    await addXP(20);
    pushFeed('rv',reviewTarget.name,reviewForm.text,reviewForm.stars);
    setShowReview(false);
    setReviewForm({stars:5,text:''});
    toast2('+20 XP! Review posted');
  }

  function submitAdd() {
    const dn=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    let days=[];
    if(!addForm.name.trim()){toast2('Please enter a name');return;}
    if(addForm.days.includes('-')){
      const pts=addForm.days.split('-').map(s=>s.trim());
      const si=dn.indexOf(pts[0]),ei=dn.indexOf(pts[1]);
      if(si>=0&&ei>=si)days=dn.slice(si,ei+1);
    }else{
      days=addForm.days.split(/[,\s]+/).map(s=>s.trim()).filter(d=>dn.includes(d));
    }
    if(!days.length)days=['Mon','Tue','Wed','Thu','Fri'];
    const newR={id:Date.now(),name:addForm.name,address:addForm.address||'Chicago, IL',cuisine:addForm.cuisine,neighborhood:addForm.neighborhood||'River North',time:addForm.time||'5-7 PM',days,deals:addForm.deals.split('\n').map(s=>s.trim()).filter(Boolean),reviews:[],checkins:[],saved:false,isNew:true,addedDate:todayDate};
    saveR([...restaurants,newR]);
    if(authUser) addXP(25);
    pushFeed('add',newR.name,'added '+newR.name);
    setShowAdd(false);
    setAddForm({name:'',address:'',cuisine:'American',neighborhood:'River North',time:'',days:'Mon-Fri',deals:''});
    toast2('+25 XP! Restaurant added');
  }

  async function runAISearch() {
    setAiLoading(true);setAiResults([]);
    try{
      const res=await fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:aiQuery})});
      const data=JSON.parse(await res.text());
      setAiResults(Array.isArray(data.results)?data.results:[]);
      if(!data.results?.length) toast2('No results found. Try a different search.');
    }catch(e){toast2('Search failed');}
    setAiLoading(false);
  }

  function addFromAI(r) {
    const newR={...r,id:Date.now(),reviews:[],checkins:[],saved:false,isNew:true,addedDate:todayDate,neighborhood:r.neighborhood||'River North'};
    saveR([...restaurants,newR]);
    setAiResults(prev=>prev.filter(x=>x.name!==r.name));
    if(authUser) addXP(25);
    toast2('+25 XP! Added '+r.name);
  }

  const level = Math.floor((profile?.xp||0)/200)+1;
  const prog = (profile?.xp||0)%200;
  const displayName = profile?.username||authUser?.email?.split('@')[0]||'Guest';

  const filtered=restaurants.filter(r=>{
    if(search&&!r.name.toLowerCase().includes(search.toLowerCase()))return false;
    if(cuisineF&&r.cuisine!==cuisineF)return false;
    if(dayF&&!r.days.includes(dayF))return false;
    if(neighborhoodF&&neighborhoodF!=='All'&&r.neighborhood!==neighborhoodF)return false;
    if(tab==='saved'&&!dbSaved.includes(String(r.id)))return false;
    return true;
  }).sort((a,b)=>(isActive(b)?1:0)-(isActive(a)?1:0));

  const ranked=[...restaurants].sort((a,b)=>{
    const as=avgRating(a.reviews)*60+(a.checkins||[]).length*40+(a.reviews||[]).length*20;
    const bs=avgRating(b.reviews)*60+(b.checkins||[]).length*40+(b.reviews||[]).length*20;
    return bs-as;
  });

  const neighborhoodCounts={};
  restaurants.forEach(r=>{if(r.neighborhood)neighborhoodCounts[r.neighborhood]=(neighborhoodCounts[r.neighborhood]||0)+1;});

  if(!mounted) return null;

  return (
    <main style={{maxWidth:960,margin:'0 auto',padding:'0 16px 60px',fontFamily:'system-ui,sans-serif',background:'#fafafa',minHeight:'100vh'}}>
      {toast&&<div style={{position:'fixed',bottom:24,right:24,background:'#1a1a1a',color:'#fff',padding:'10px 18px',borderRadius:10,fontSize:13,zIndex:9999}}>{toast}</div>}

      <div style={{display:'flex',alignItems:'center',gap:10,padding:'20px 0 12px',flexWrap:'wrap'}}>
        <div style={{flex:1}}>
          <h1 style={{fontSize:24,fontWeight:700,color:'#1a1a1a',margin:0}}>Happy Hour Chicago</h1>
          <div style={{fontSize:12,color:'#888',marginTop:2}}>
            {authUser ? `Level ${level} · ${profile?.xp||0} XP · ${displayName}` : 'Browse Chicago happy hours'}
          </div>
        </div>
        <button onClick={()=>setShowAI(true)} style={{padding:'8px 14px',fontSize:13,borderRadius:8,border:'1px solid #ddd',background:'none',cursor:'pointer'}}>AI Search</button>
        <button onClick={()=>setShowAdd(true)} style={{padding:'8px 14px',fontSize:13,borderRadius:8,border:'1px solid #ddd',background:'none',cursor:'pointer'}}>+ Add</button>
        {authUser
          ? <button onClick={signOut} style={{padding:'8px 14px',fontSize:13,borderRadius:8,border:'1px solid #ddd',background:'none',cursor:'pointer',color:'#888'}}>Sign out</button>
          : <button onClick={()=>setShowAuth(true)} style={{padding:'8px 14px',fontSize:13,borderRadius:8,border:'none',background:'#1a1a1a',color:'#fff',cursor:'pointer'}}>Sign in</button>
        }
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:16}}>
        {[{n:restaurants.length,l:'Restaurants'},{n:restaurants.filter(r=>isActive(r)).length,l:'Open now'},{n:dbCheckins.length,l:'Your check-ins'},{n:level,l:'Your level'}].map(stat=>(
          <div key={stat.l} style={{background:'#fff',border:'1px solid #eee',borderRadius:10,padding:'10px 12px',textAlign:'center'}}>
            <div style={{fontSize:22,fontWeight:700}}>{stat.n}</div>
            <div style={{fontSize:11,color:'#888'}}>{stat.l}</div>
          </div>
        ))}
      </div>

      {authUser&&(
        <div style={{background:'#eee',borderRadius:4,height:6,marginBottom:16}}>
          <div style={{background:'#22c55e',borderRadius:4,height:6,width:Math.round(prog/200*100)+'%'}}/>
        </div>
      )}

      <div style={{display:'flex',borderBottom:'1px solid #eee',marginBottom:16,overflowX:'auto'}}>
        {[['list','Browse'],['feed','Activity'],['leaderboard','Rankings'],['saved','Saved'],['profile','Profile']].map(([t,label])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:'8px 14px',fontSize:13,border:'none',background:'none',cursor:'pointer',borderBottom:tab===t?'2px solid #1a1a1a':'2px solid transparent',color:tab===t?'#1a1a1a':'#888',fontWeight:tab===t?500:400,whiteSpace:'nowrap'}}>
            {label}
          </button>
        ))}
      </div>

      {(tab==='list'||tab==='saved')&&(
        <>
          <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." style={{flex:1,minWidth:140,padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13}}/>
            <select value={cuisineF} onChange={e=>setCuisineF(e.target.value)} style={{padding:'8px 10px',borderRadius:8,border:'1px solid #ddd',fontSize:13}}>
              <option value="">All cuisines</option>
              {['American','Mexican','Italian','Asian','Bar & Grill','Seafood','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={dayF} onChange={e=>setDayF(e.target.value)} style={{padding:'8px 10px',borderRadius:8,border:'1px solid #ddd',fontSize:13}}>
              <option value="">Any day</option>
              {DAYS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
            {NEIGHBORHOODS.map(n=>{
              const count=n==='All'?restaurants.length:(neighborhoodCounts[n]||0);
              const active=neighborhoodF===n;
              return(
                <button key={n} onClick={()=>setNeighborhoodF(n)} style={{padding:'5px 12px',fontSize:12,borderRadius:20,border:'1px solid '+(active?'#1a1a1a':'#ddd'),background:active?'#1a1a1a':'#fff',color:active?'#fff':'#555',cursor:'pointer',whiteSpace:'nowrap',display:'flex',alignItems:'center',gap:4}}>
                  {n}{count>0&&<span style={{fontSize:10,background:active?'rgba(255,255,255,0.25)':'#f0f0f0',color:active?'#fff':'#888',borderRadius:10,padding:'1px 5px'}}>{count}</span>}
                </button>
              );
            })}
          </div>
          {neighborhoodF!=='All'&&(
            <div style={{marginBottom:12,fontSize:13,color:'#888'}}>
              Showing {filtered.length} spot{filtered.length!==1?'s':''} in <strong style={{color:'#1a1a1a'}}>{neighborhoodF}</strong>
              <button onClick={()=>setNeighborhoodF('All')} style={{marginLeft:8,fontSize:12,color:'#3b82f6',background:'none',border:'none',cursor:'pointer',padding:0}}>Clear</button>
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:12}}>
            {filtered.map(r=>{
              const active=isActive(r);
              const a=avgRating(r.reviews);
              const checked=dbCheckins.some(c=>c.restaurant_id===String(r.id)&&new Date(c.checked_in_at).toDateString()===todayDate);
              const ur=dbRatings[String(r.id)]||0;
              const isSaved=dbSaved.includes(String(r.id));
              return(
                <div key={r.id} style={{background:'#fff',border:'1px solid #eee',borderRadius:12,padding:'14px 16px',borderTop:active?'3px solid #22c55e':'3px solid #eee'}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6}}>
                    <div>
                      <div style={{fontWeight:600,fontSize:14}}>{r.name}{r.isNew&&<span style={{marginLeft:6,fontSize:10,background:'#fef9c3',color:'#92400e',padding:'2px 6px',borderRadius:20}}>New</span>}</div>
                      <div style={{fontSize:12,color:'#888'}}>{r.cuisine} · {r.neighborhood}</div>
                    </div>
                    <button onClick={()=>doSaveR(r.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:isSaved?'#f59e0b':'#ddd',padding:0}}>★</button>
                  </div>
                  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:8}}>
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:active?'#dcfce7':'#f5f5f5',color:active?'#166534':'#888'}}>{active?'Open now':r.time}</span>
                    {r.neighborhood&&<span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'#f0f4ff',color:'#3b4cbd',cursor:'pointer'}} onClick={()=>setNeighborhoodF(r.neighborhood)}>{r.neighborhood}</span>}
                    {(r.deals||[]).slice(0,2).map((d,i)=><span key={i} style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'#f0fdf4',color:'#166534'}}>{d}</span>)}
                  </div>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8}}>
                    <div style={{display:'flex',gap:2}}>
                      {[1,2,3,4,5].map(star=><span key={star} onClick={()=>doRate(r.id,star)} style={{cursor:'pointer',fontSize:16,color:ur>=star?'#f59e0b':'#ddd'}}>★</span>)}
                    </div>
                    <span style={{fontSize:12,color:'#888'}}>{a?a.toFixed(1)+' ('+r.reviews.length+')':'Rate it'}</span>
                  </div>
                  {(r.reviews||[]).length>0&&<div onClick={()=>setDetailTarget(r)} style={{fontSize:12,color:'#3b82f6',cursor:'pointer',marginBottom:8}}>{r.reviews.length} review{r.reviews.length>1?'s':''} - tap to read</div>}
                  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                    {checked
                      ?<span style={{fontSize:12,padding:'5px 10px',borderRadius:8,background:'#f5f5f5',color:'#888'}}>Checked in today</span>
                      :<button onClick={()=>authUser?doCheckin(r.id):(setShowAuth(true))} style={{fontSize:12,padding:'5px 10px',borderRadius:8,background:'#dcfce7',color:'#166534',border:'1px solid #86efac',cursor:'pointer'}}>Check in +50xp</button>
                    }
                    <button onClick={()=>authUser?setReviewTarget(r)&&setShowReview(true):(setShowAuth(true))} style={{fontSize:12,padding:'5px 10px',borderRadius:8,background:'#eff6ff',color:'#1d4ed8',border:'1px solid #bfdbfe',cursor:'pointer'}} onClick={()=>{if(!authUser){setShowAuth(true);return;}setReviewTarget(r);setShowReview(true);}}>Review +20xp</button>
                    <span style={{fontSize:12,color:'#888'}}>{(r.checkins||[]).length} check-ins</span>
                  </div>
                </div>
              );
            })}
            {filtered.length===0&&<div style={{textAlign:'center',padding:'2rem',color:'#888',gridColumn:'1/-1'}}>No restaurants found. <button onClick={()=>setNeighborhoodF('All')} style={{color:'#3b82f6',background:'none',border:'none',cursor:'pointer',fontSize:13}}>Show all</button></div>}
          </div>
        </>
      )}

      {tab==='feed'&&(
        <div style={{background:'#fff',border:'1px solid #eee',borderRadius:12,overflow:'hidden'}}>
          {feed.length===0&&<div style={{padding:'2rem',textAlign:'center',color:'#888'}}>No activity yet. Check in or review a restaurant!</div>}
          {feed.map((f,i)=>{
            const color=avatarColor(f.author||'A');
            return(
              <div key={i} style={{display:'flex',gap:12,padding:'12px 16px',borderBottom:'1px solid #f5f5f5'}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:color+'22',color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:600,flexShrink:0}}>{initials(f.author||'G')}</div>
                <div>
                  <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap',marginBottom:2}}>
                    <span style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:f.type==='ci'?'#dcfce7':f.type==='rv'?'#eff6ff':'#f5f5f5',color:f.type==='ci'?'#166534':f.type==='rv'?'#1d4ed8':'#888'}}>{f.type==='ci'?'Check-in':f.type==='rv'?'Review':'New spot'}</span>
                    <span style={{fontSize:13,fontWeight:500}}>{f.author}</span>
                  </div>
                  <div style={{fontSize:13,color:'#555'}}>{f.type==='rv'?'"'+(f.text||'').slice(0,80)+'"':f.text}</div>
                  <div style={{fontSize:11,color:'#aaa',marginTop:3}}>{f.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==='leaderboard'&&(
        <div style={{background:'#fff',border:'1px solid #eee',borderRadius:12,overflow:'hidden'}}>
          <div style={{display:'grid',gridTemplateColumns:'36px 1fr 60px 70px 60px',padding:'10px 16px',borderBottom:'1px solid #eee',fontSize:11,color:'#aaa'}}>
            <span>#</span><span>Restaurant</span><span style={{textAlign:'center'}}>Rating</span><span style={{textAlign:'center'}}>Check-ins</span><span style={{textAlign:'center'}}>Score</span>
          </div>
          {ranked.slice(0,10).map((r,i)=>{
            const a=avgRating(r.reviews);
            const ci=(r.checkins||[]).length;
            const score=Math.round(a*60+ci*40+(r.reviews||[]).length*20);
            return(
              <div key={r.id} onClick={()=>setDetailTarget(r)} style={{display:'grid',gridTemplateColumns:'36px 1fr 60px 70px 60px',padding:'10px 16px',borderBottom:'1px solid #f5f5f5',cursor:'pointer',alignItems:'center'}}>
                <span style={{fontSize:16,textAlign:'center'}}>{i===0?'1':i===1?'2':i===2?'3':i+1}</span>
                <div><div style={{fontSize:13,fontWeight:500}}>{r.name}</div><div style={{fontSize:11,color:'#888'}}>{r.neighborhood||r.cuisine}</div></div>
                <span style={{textAlign:'center',fontSize:13}}>{a?a.toFixed(1):'-'}</span>
                <span style={{textAlign:'center',fontSize:13}}>{ci}</span>
                <span style={{textAlign:'center',fontSize:13,fontWeight:600}}>{score}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab==='profile'&&(
        <div>
          {!authUser?(
            <div style={{background:'#fff',border:'1px solid #eee',borderRadius:12,padding:24,textAlign:'center'}}>
              <div style={{fontSize:40,marginBottom:12}}>🍺</div>
              <div style={{fontWeight:600,fontSize:18,marginBottom:8}}>Create an account</div>
              <div style={{fontSize:14,color:'#888',marginBottom:20}}>Sign in to track your check-ins, earn XP, and save your favorite spots across all your devices.</div>
              <button onClick={()=>setShowAuth(true)} style={{padding:'12px 28px',fontSize:14,borderRadius:8,border:'none',background:'#1a1a1a',color:'#fff',cursor:'pointer'}}>Sign in or create account</button>
            </div>
          ):(
            <div>
              <div style={{background:'#fff',border:'1px solid #eee',borderRadius:12,padding:16,marginBottom:12}}>
                <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
                  <div style={{width:52,height:52,borderRadius:'50%',background:'#dbeafe',color:'#1d4ed8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:700}}>{initials(displayName)}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:16}}>{displayName}</div>
                    <div style={{fontSize:12,color:'#888'}}>{authUser.email}</div>
                    <div style={{fontSize:12,color:'#888'}}>Level {level} · {profile?.xp||0} XP</div>
                  </div>
                </div>
                <div style={{background:'#eee',borderRadius:4,height:6,marginBottom:6}}>
                  <div style={{background:'#22c55e',borderRadius:4,height:6,width:Math.round(prog/200*100)+'%'}}/>
                </div>
                <div style={{fontSize:11,color:'#888',marginBottom:12}}>{prog}/200 XP to Level {level+1}</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {[{n:dbCheckins.length,l:'Check-ins'},{n:Object.keys(dbRatings).length,l:'Rated'},{n:profile?.xp||0,l:'Total XP'}].map(stat=>(
                    <div key={stat.l} style={{background:'#f5f5f5',borderRadius:8,padding:10,textAlign:'center'}}>
                      <div style={{fontSize:20,fontWeight:700}}>{stat.n}</div>
                      <div style={{fontSize:11,color:'#888'}}>{stat.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{background:'#fff',border:'1px solid #eee',borderRadius:12,overflow:'hidden',marginBottom:12}}>
                <div style={{padding:'10px 16px',borderBottom:'1px solid #eee',fontSize:13,fontWeight:500}}>Recent check-ins</div>
                {dbCheckins.length===0&&<div style={{padding:'12px 16px',fontSize:13,color:'#aaa'}}>No check-ins yet. Visit a bar!</div>}
                {dbCheckins.slice(0,5).map((c,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid #f5f5f5',fontSize:13}}>
                    <span>{c.restaurant_name}</span>
                    <span style={{color:'#888',fontSize:12}}>{new Date(c.checked_in_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
              <div style={{background:'#fff',border:'1px solid #eee',borderRadius:12,overflow:'hidden'}}>
                <div style={{padding:'10px 16px',borderBottom:'1px solid #eee',fontSize:13,fontWeight:500}}>XP Guide</div>
                {[['Check in','50 XP'],['Write a review','20 XP'],['Add a restaurant','25 XP'],['Rate','10 XP']].map(([a,x])=>(
                  <div key={a} style={{display:'flex',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid #f5f5f5',fontSize:13}}>
                    <span style={{color:'#555'}}>{a}</span><span style={{fontWeight:600}}>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {detailTarget&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setDetailTarget(null);}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
          <div style={{background:'#fff',borderRadius:16,padding:20,width:'min(500px,100%)',maxHeight:'80vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
              <div>
                <div style={{fontSize:18,fontWeight:700}}>{detailTarget.name}</div>
                <div style={{fontSize:13,color:'#888'}}>{detailTarget.neighborhood} · {detailTarget.address}</div>
              </div>
              <button onClick={()=>setDetailTarget(null)} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#888'}}>x</button>
            </div>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:12}}>
              {(detailTarget.deals||[]).map((d,i)=><span key={i} style={{fontSize:12,padding:'3px 10px',borderRadius:20,background:'#f0fdf4',color:'#166534'}}>{d}</span>)}
            </div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
              <div style={{fontSize:14,fontWeight:500}}>Reviews ({(detailTarget.reviews||[]).length})</div>
              <button onClick={()=>{if(!authUser){setShowAuth(true);return;}setReviewTarget(detailTarget);setShowReview(true);setDetailTarget(null);}} style={{fontSize:12,padding:'5px 10px',borderRadius:8,background:'#eff6ff',color:'#1d4ed8',border:'1px solid #bfdbfe',cursor:'pointer'}}>Write review</button>
            </div>
            {(restaurants.find(r=>r.id===detailTarget.id)?.reviews||[]).length===0&&<div style={{fontSize:13,color:'#888'}}>No reviews yet. Be the first!</div>}
            {(restaurants.find(r=>r.id===detailTarget.id)?.reviews||[]).map(rv=>(
              <div key={rv.id} style={{background:'#f9f9f9',borderRadius:10,padding:'10px 12px',marginBottom:8}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:4}}>
                  <div style={{width:28,height:28,borderRadius:'50%',background:avatarColor(rv.author)+'22',color:avatarColor(rv.author),display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:600}}>{initials(rv.author)}</div>
                  <span style={{fontSize:13,fontWeight:500}}>{rv.author}</span>
                  {rv.stars&&<span style={{color:'#f59e0b',fontSize:12}}>{'★'.repeat(rv.stars)}</span>}
                </div>
                <div style={{fontSize:13,color:'#555',lineHeight:1.5}}>{rv.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showReview&&reviewTarget&&(
        <div onClick={e=>{if(e.target===e.currentTarget){setShowReview(false);setReviewForm({stars:5,text:''});}}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
          <div style={{background:'#fff',borderRadius:16,padding:20,width:'min(460px,100%)'}}>
            <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Review: {reviewTarget.name}</h2>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:13,color:'#888',display:'block',marginBottom:4}}>Rating</label>
              <div style={{display:'flex',gap:4}}>
                {[1,2,3,4,5].map(star=><span key={star} onClick={()=>setReviewForm(f=>({...f,stars:star}))} style={{fontSize:28,cursor:'pointer',color:reviewForm.stars>=star?'#f59e0b':'#ddd'}}>★</span>)}
              </div>
            </div>
            <textarea value={reviewForm.text} onChange={e=>setReviewForm(f=>({...f,text:e.target.value}))} placeholder="How were the deals? Worth going?" style={{width:'100%',padding:'10px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13,height:80,resize:'vertical',marginBottom:16}}/>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>{setShowReview(false);setReviewForm({stars:5,text:''});}} style={{padding:'8px 16px',fontSize:13,borderRadius:8,border:'1px solid #ddd',background:'none',cursor:'pointer'}}>Cancel</button>
              <button onClick={submitReview} style={{padding:'8px 16px',fontSize:13,borderRadius:8,border:'none',background:'#1a1a1a',color:'#fff',cursor:'pointer'}}>Post +20xp</button>
            </div>
          </div>
        </div>
      )}

      {showAdd&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false);}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
          <div style={{background:'#fff',borderRadius:16,padding:20,width:'min(460px,100%)',maxHeight:'90vh',overflowY:'auto'}}>
            <h2 style={{fontSize:18,fontWeight:700,marginBottom:16}}>Add restaurant</h2>
            {[{label:'Name',key:'name',ph:'e.g. The Gage'},{label:'Address',key:'address',ph:'24 S Michigan Ave'},{label:'Time',key:'time',ph:'3-6 PM'},{label:'Days',key:'days',ph:'Mon-Fri'}].map(f=>(
              <div key={f.key} style={{marginBottom:10}}>
                <label style={{fontSize:13,color:'#888',display:'block',marginBottom:3}}>{f.label}</label>
                <input value={addForm[f.key]} onChange={e=>setAddForm(x=>({...x,[f.key]:e.target.value}))} placeholder={f.ph} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13}}/>
              </div>
            ))}
            <div style={{marginBottom:10}}>
              <label style={{fontSize:13,color:'#888',display:'block',marginBottom:3}}>Neighborhood</label>
              <select value={addForm.neighborhood} onChange={e=>setAddForm(x=>({...x,neighborhood:e.target.value}))} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13}}>
                {NEIGHBORHOODS.filter(n=>n!=='All').map(n=><option key={n}>{n}</option>)}
              </select>
            </div>
            <div style={{marginBottom:10}}>
              <label style={{fontSize:13,color:'#888',display:'block',marginBottom:3}}>Cuisine</label>
              <select value={addForm.cuisine} onChange={e=>setAddForm(x=>({...x,cuisine:e.target.value}))} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13}}>
                {['American','Mexican','Italian','Asian','Bar & Grill','Seafood','Other'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,color:'#888',display:'block',marginBottom:3}}>Deals (one per line)</label>
              <textarea value={addForm.deals} onChange={e=>setAddForm(x=>({...x,deals:e.target.value}))} placeholder={"$4 drafts\nHalf-off apps"} style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13,height:80,resize:'vertical'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>setShowAdd(false)} style={{padding:'8px 16px',fontSize:13,borderRadius:8,border:'1px solid #ddd',background:'none',cursor:'pointer'}}>Cancel</button>
              <button onClick={submitAdd} style={{padding:'8px 16px',fontSize:13,borderRadius:8,border:'none',background:'#1a1a1a',color:'#fff',cursor:'pointer'}}>Save +25xp</button>
            </div>
          </div>
        </div>
      )}

      {showAI&&(
        <div onClick={e=>{if(e.target===e.currentTarget){setShowAI(false);setAiResults([]);} }} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
          <div style={{background:'#fff',borderRadius:16,padding:20,width:'min(460px,100%)',maxHeight:'85vh',overflowY:'auto'}}>
            <h2 style={{fontSize:18,fontWeight:700,marginBottom:12}}>AI Search</h2>
            <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)} placeholder="e.g. rooftop bars River North" style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13,marginBottom:10}}/>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>
              {['River North','West Loop','Wicker Park','Lincoln Park','Logan Square'].map(n=>(
                <button key={n} onClick={()=>setAiQuery('happy hour deals '+n+' Chicago')} style={{fontSize:11,padding:'3px 10px',borderRadius:20,border:'1px solid #ddd',background:'#f9f9f9',cursor:'pointer',color:'#555'}}>{n}</button>
              ))}
            </div>
            {aiLoading&&<div style={{padding:10,background:'#f5f5f5',borderRadius:8,fontSize:13,color:'#888',marginBottom:10}}>Searching for deals...</div>}
            {aiResults.length>0&&<div style={{fontSize:12,color:'#888',marginBottom:8}}>Found {aiResults.length} — tap to add:</div>}
            {aiResults.map((r,i)=>(
              <div key={i} onClick={()=>addFromAI(r)} style={{background:'#f9f9f9',borderRadius:10,padding:'10px 12px',marginBottom:8,cursor:'pointer',border:'1px solid #eee'}}>
                <div style={{fontWeight:500,fontSize:14}}>{r.name}</div>
                <div style={{fontSize:12,color:'#888'}}>{r.address} · {r.time}</div>
                {(r.deals||[]).slice(0,2).map((d,i)=><span key={i} style={{fontSize:11,padding:'2px 8px',borderRadius:20,background:'#f0fdf4',color:'#166534',marginRight:4,marginTop:4,display:'inline-block'}}>{d}</span>)}
                <div style={{fontSize:11,color:'#3b82f6',marginTop:6}}>Tap to add +25xp</div>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
              <button onClick={()=>{setShowAI(false);setAiResults([]);}} style={{padding:'8px 16px',fontSize:13,borderRadius:8,border:'1px solid #ddd',background:'none',cursor:'pointer'}}>Close</button>
              <button onClick={runAISearch} style={{padding:'8px 16px',fontSize:13,borderRadius:8,border:'none',background:'#1a1a1a',color:'#fff',cursor:'pointer'}}>Search</button>
            </div>
          </div>
        </div>
      )}

      {showAuth&&(
        <div onClick={e=>{if(e.target===e.currentTarget){setShowAuth(false);setAuthError('');} }} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:16}}>
          <div style={{background:'#fff',borderRadius:16,padding:24,width:'min(400px,100%)'}}>
            <h2 style={{fontSize:20,fontWeight:700,marginBottom:4}}>{authMode==='login'?'Welcome back':'Create account'}</h2>
            <p style={{fontSize:13,color:'#888',marginBottom:20}}>{authMode==='login'?'Sign in to track your happy hours':'Join to earn XP and track your visits'}</p>

            <button onClick={signInWithGoogle} disabled={authLoading} style={{width:'100%',padding:'10px',fontSize:14,borderRadius:8,border:'1px solid #ddd',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:16}}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>

            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
              <div style={{flex:1,height:1,background:'#eee'}}/>
              <span style={{fontSize:12,color:'#aaa'}}>or</span>
              <div style={{flex:1,height:1,background:'#eee'}}/>
            </div>

            {authMode==='signup'&&(
              <div style={{marginBottom:10}}>
                <label style={{fontSize:13,color:'#888',display:'block',marginBottom:3}}>Username</label>
                <input value={authUsername} onChange={e=>setAuthUsername(e.target.value)} placeholder="e.g. ChicagoBarHopper" style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13}}/>
              </div>
            )}
            <div style={{marginBottom:10}}>
              <label style={{fontSize:13,color:'#888',display:'block',marginBottom:3}}>Email</label>
              <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="your@email.com" style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13}}/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:13,color:'#888',display:'block',marginBottom:3}}>Password</label>
              <input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="••••••••" style={{width:'100%',padding:'8px 12px',borderRadius:8,border:'1px solid #ddd',fontSize:13}}/>
            </div>

            {authError&&<div style={{fontSize:13,color:'#dc2626',marginBottom:12,padding:'8px 12px',background:'#fef2f2',borderRadius:8}}>{authError}</div>}

            <button onClick={authMode==='login'?signInWithEmail:signUpWithEmail} disabled={authLoading} style={{width:'100%',padding:'10px',fontSize:14,borderRadius:8,border:'none',background:'#1a1a1a',color:'#fff',cursor:'pointer',marginBottom:12}}>
              {authLoading?'Loading...':(authMode==='login'?'Sign in':'Create account')}
            </button>

            <div style={{textAlign:'center',fontSize:13,color:'#888'}}>
              {authMode==='login'?'No account? ':'Already have one? '}
              <button onClick={()=>{setAuthMode(authMode==='login'?'signup':'login');setAuthError('');}} style={{color:'#1a1a1a',fontWeight:500,background:'none',border:'none',cursor:'pointer',fontSize:13}}>
                {authMode==='login'?'Sign up':'Sign in'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
