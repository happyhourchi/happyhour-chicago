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

const NEIGHBORHOODS = ['All','Loop','River North','West Loop','Fulton Market','Gold Coast','Streeterville','Wicker Park','Logan Square','Lincoln Square','Ravenswood','Edgewater','Lincoln Park','Andersonville','Old Town','Lakeview','South Loop'];

const BADGES = [
  {id:'founding_member',icon:'⬛',name:'Founding Member',desc:'One of the first 25 members of Happy Hour Chicago',check:()=>false,special:true},
  {id:'first_checkin',icon:'🍺',name:'First Sip',desc:'First check-in',check:(ci)=>ci.length>=1},
  {id:'five_checkins',icon:'🏃',name:'Bar Hopper',desc:'5 different bars',check:(ci)=>[...new Set(ci.map(c=>c.restaurant_id))].length>=5},
  {id:'ten_checkins',icon:'🌟',name:'Regular',desc:'10 total check-ins',check:(ci)=>ci.length>=10},
  {id:'twenty_checkins',icon:'🔥',name:'Obsessed',desc:'20 total check-ins',check:(ci)=>ci.length>=20},
  {id:'first_review',icon:'✍️',name:'Critic',desc:'First review written',check:(ci,rv)=>rv>=1},
  {id:'five_reviews',icon:'📝',name:'Top Critic',desc:'5 reviews written',check:(ci,rv)=>rv>=5},
  {id:'three_hoods',icon:'🗺️',name:'Explorer',desc:'3 neighborhoods visited',check:(ci)=>[...new Set(ci.map(c=>c.neighborhood).filter(Boolean))].length>=3},
  {id:'five_hoods',icon:'🏙️',name:'City Slicker',desc:'5 neighborhoods visited',check:(ci)=>[...new Set(ci.map(c=>c.neighborhood).filter(Boolean))].length>=5},
  {id:'all_hoods',icon:'🦅',name:'Chicagoan',desc:'8 neighborhoods visited',check:(ci)=>[...new Set(ci.map(c=>c.neighborhood).filter(Boolean))].length>=8},
  {id:'rated_five',icon:'⭐',name:'Rater',desc:'Rated 5 restaurants',check:(ci,rv,rt)=>rt>=5},
  {id:'hundred_xp',icon:'💯',name:'Century Club',desc:'Earned 100 XP',check:(ci,rv,rt,xp)=>xp>=100},
  {id:'five_hundred_xp',icon:'👑',name:'VIP',desc:'Earned 500 XP',check:(ci,rv,rt,xp)=>xp>=500},
  {id:'weekend',icon:'🎉',name:'Weekend Warrior',desc:'Checked in on a weekend',check:(ci)=>ci.some(c=>{const d=new Date(c.checked_in_at).getDay();return d===0||d===6;})},
  {id:'loyal',icon:'❤️',name:'Loyal',desc:'Same bar 3 times',check:(ci)=>{const m={};ci.forEach(c=>{m[c.restaurant_id]=(m[c.restaurant_id]||0)+1;});return Object.values(m).some(v=>v>=3);}},
];

const SEED = [
  {id:1,name:"The Gage",address:"24 S Michigan Ave",cuisine:"American",neighborhood:"Loop",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 draft beers","$7 cocktails","$6 wine","Half-off bar snacks"],menu:{drinks:["$5 Goose Island Draft","$5 Rotating Craft Draft","$6 House Wine","$7 Signature Cocktails","$4 Well Spirits"],food:["$5 Truffle Fries","$7 Deviled Eggs","$8 Charcuterie Board","$9 Slider Trio","$6 Soup of the Day"]},description:"Upscale gastropub across from Millennium Park with craft beers and seasonal American bites.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:2,name:"Cindy's Rooftop",address:"12 S Michigan Ave",cuisine:"American",neighborhood:"Loop",time:"5-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$10 cocktails","$8 wine","$6 draft beer","Millennium Park views"],menu:{drinks:["$10 Rooftop Mule","$10 Chicago Spritz","$8 House Wine","$6 Draft Beer","$12 Champagne"],food:["$10 Truffle Fries","$12 Flatbread","$14 Charcuterie","$8 Edamame","$10 Deviled Eggs"]},description:"Iconic rooftop bar atop the Chicago Athletic Association with jaw-dropping views of Millennium Park.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:3,name:"Beatrix Loop",address:"180 N Jefferson St",cuisine:"American",neighborhood:"Loop",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$6 local beers","$7 wines","$8 cocktails","Half-off bottles Mondays"],menu:{drinks:["$6 Local Draft Beer","$7 House Wine","$8 Handcrafted Cocktail","$8 Old Fashioned","$9 Seasonal Cocktail"],food:["$9 Avocado Toast","$9 Snack Plate","$8 Truffle Popcorn","$10 Turkey Meatballs","$12 Prime Burger"]},description:"Health-forward neighborhood restaurant with excellent cocktails and warm atmosphere.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:4,name:"Monk's Pub",address:"205 W Lake St",cuisine:"Bar & Grill",neighborhood:"Loop",time:"3-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$3 Old Style","$3 Miller Lite","$5 wells","Half-off appetizers"],menu:{drinks:["$3 Old Style","$3 Miller Lite","$3 PBR","$5 Well Spirits","$4 House Wine"],food:["$6 Basket of Wings","$5 Pickle Chips","$7 Nachos","$6 Pretzel","$8 Burger"]},description:"Classic Chicago dive bar in the heart of the Loop — cheap drinks, no frills, all fun.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:5,name:"ROOF on theWit",address:"201 N State St",cuisine:"American",neighborhood:"Loop",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$9 cocktails","$7 wine","$6 beer","27th floor skyline views"],menu:{drinks:["$9 Signature Craft Cocktails","$7 House Wine","$6 Draft Beer","$10 Champagne","$8 Sangria"],food:["$8 Flatbreads","$10 Sliders","$9 Cheese Plate","$8 Wings","$12 Calamari"]},description:"Rooftop bar on the 27th floor of theWit Hotel with panoramic Chicago skyline views.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:6,name:"Sushi-san",address:"63 W Grand Ave",cuisine:"Asian",neighborhood:"River North",time:"4-6 PM",days:["Mon","Tue","Wed","Thu"],deals:["$5 Asahi draft","$6 sake & wine","$10 cocktails","$6 snacks"],menu:{drinks:["$5 Asahi Cold Draft","$6 House Sake","$6 House Wine","$10 Signature Cocktails","$8 Japanese Whisky Highball"],food:["$6 Edamame","$6 Gyoza (4pc)","$8 Spicy Tuna Crispy Rice","$10 Rainbow Roll","$7 Miso Soup & Rice"]},description:"Hip sushi spot in River North with old-school hip-hop, fresh fish, and great happy hour deals.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:7,name:"Ema",address:"74 W Illinois St",cuisine:"Other",neighborhood:"River North",time:"4-6 PM",days:["Mon","Tue","Wed","Thu"],deals:["$7 mezze plates","$6 craft beer","$10 margaritas","$8 wine"],menu:{drinks:["$6 Craft Beer","$8 House Wine","$10 House Margarita","$10 Ema Negroni","$9 Spritzes"],food:["$7 Hummus & Pita","$7 Whipped Feta","$7 Fried Halloumi","$8 Lamb Meatballs","$9 Cauliflower Fritters"]},description:"Mediterranean restaurant with gorgeous ambiance, killer mezze, and one of River North's best happy hours.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:8,name:"Bar Goa",address:"46 W Division St",cuisine:"Other",neighborhood:"River North",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$10 cocktails","$6 bar bites","$8 wine","$6 beer"],menu:{drinks:["$10 Gimlet","$10 Daiquiri","$10 Whiskey Sour","$8 House Wine","$6 Draft Beer"],food:["$6 Butter Chicken Croquettes","$6 Tapioca Fritters","$6 Fried Coriander Wings","$8 Samosa Chaat","$7 Chili Cheese Naan"]},description:"Clubby Indian-Portuguese cocktail bar with inventive bites and a vibrant pre-night-out atmosphere.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:9,name:"Sunda",address:"110 W Illinois St",cuisine:"Asian",neighborhood:"River North",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$6 bar bites","$6 sushi handrolls","$8 wine","$10 cocktails"],menu:{drinks:["$10 Lychee Martini","$10 Thai Basil Smash","$8 House Wine","$8 Sake","$6 Asian Beer"],food:["$6 Edamame","$6 Spicy Tuna Handroll","$8 Shrimp Tempura","$9 Pork Dumplings","$10 Wagyu Sliders"]},description:"Iconic Asian fusion spot in River North with consistently excellent food and lively happy hour energy.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:10,name:"Tanta",address:"118 W Grand Ave",cuisine:"Other",neighborhood:"River North",time:"5-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$9 pisco sours","$8 cocktails","$7 wine","Peruvian snacks from $7"],menu:{drinks:["$9 Classic Pisco Sour","$9 Passion Fruit Pisco Sour","$8 Chicha Morada Cocktail","$7 House Wine","$6 Cerveza"],food:["$7 Empanadas (2pc)","$9 Ceviche Clasico","$8 Anticuchos","$7 Causa","$9 Lomo Saltado Bites"]},description:"Upscale Peruvian restaurant with clubby lighting, a pop playlist, and excellent pisco-based cocktails.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:11,name:"Trivoli Tavern",address:"114 N Green St",cuisine:"American",neighborhood:"West Loop",time:"4-5 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["Half-off oysters","$6 sliders","$10 espresso martinis","$6 crab rangoon","Cobblestone courtyard"],menu:{drinks:["$10 Espresso Martini","$10 Classic Cocktails","$8 House Wine","$6 Draft Beer","$10 Negroni"],food:["Half-off Oysters on Half Shell","$6 Meatball Sliders","$6 Crab Rangoon Dip","$8 Truffle Frites","$9 Lobster Mac & Cheese"]},description:"Hidden down a cobblestone courtyard in Fulton Market — only 1 hour of happy hour but worth every minute. Espresso martinis and oysters are must-orders.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:12,name:"Three Dots and a Dash",address:"435 N Clark St",cuisine:"Other",neighborhood:"River North",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 tiki cocktails","$5 beer","Half-off appetizers"],menu:{drinks:["$8 Three Dots Punch","$8 Mai Tai","$8 Zombie","$5 Craft Beer","$9 Shareable Bowl Cocktails"],food:["$8 Coconut Shrimp","$9 Pineapple Fried Rice","$7 Tiki Wings","$10 Crab Rangoon Dip","$8 Spam Musubi"]},description:"Award-winning underground tiki bar with exotic cocktails served in ceramic vessels and tikis.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:13,name:"GT Fish & Oyster",address:"531 N Wells St",cuisine:"Seafood",neighborhood:"River North",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$1.50 oysters","$7 wine","$8 cocktails","$6 beer"],menu:{drinks:["$8 Aperol Spritz","$8 Bloody Mary","$7 House Wine","$6 Draft Beer","$10 Champagne"],food:["$1.50 East Coast Oysters","$9 Shrimp Cocktail","$8 Lobster Sliders","$10 Clam Chowder","$9 Fish Tacos"]},description:"Chicago institution for seafood lovers with some of the city's best oyster deals during happy hour.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:14,name:"El Hefe",address:"15 W Illinois St",cuisine:"Mexican",neighborhood:"River North",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 tacos","$6 margaritas","$3 Tecate","Chips & guac $3"],menu:{drinks:["$6 House Margarita","$6 Paloma","$3 Tecate","$3 Modelo","$7 El Hefe Marg"],food:["$4 Street Tacos (each)","$3 Chips & Salsa","$5 Chips & Guac","$6 Queso","$8 Nachos"]},description:"Lively Mexican cantina with a rooftop patio, frozen margaritas, and cheap taco deals all happy hour.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:15,name:"Federales",address:"420 W Grand Ave",cuisine:"Mexican",neighborhood:"River North",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 margaritas","$4 tacos","$3 Tecate"],menu:{drinks:["$5 House Marg","$5 Frozen Marg","$3 Tecate","$3 Modelo","$7 Federales Special"],food:["$4 Street Tacos","$5 Chips & Guac","$6 Queso","$8 Nachos","$7 Elotes"]},description:"Lively River North cantina with a rooftop patio, frozen margaritas, and cheap taco deals.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:16,name:"Beatrix River North",address:"519 N Clark St",cuisine:"American",neighborhood:"River North",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$6 local beers","$7 wines","$8 cocktails","$9 snacks","$12 burgers"],menu:{drinks:["$6 Local Draft Beer","$7 House Wine","$8 Handcrafted Cocktail","$8 Old Fashioned","$9 Seasonal Cocktail"],food:["$9 Snack Plate","$8 Truffle Popcorn","$10 Turkey Meatballs","$12 Mushroom Quinoa Burger","$12 Prime Burger"]},description:"Neighborhood coffeehouse and restaurant with healthy-meets-delicious options and great cocktails.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:17,name:"Avec",address:"615 W Randolph St",cuisine:"Other",neighborhood:"West Loop",time:"3:30-5:30 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$7 wine","$8 cocktails","$10 chorizo dates","Half-off select apps"],menu:{drinks:["$7 House Wine","$8 Aperol Spritz","$8 Negroni","$9 Avec Cocktail","$6 Craft Beer"],food:["$10 Chorizo-Stuffed Dates","$9 Whipped Ricotta Toast","$8 Marinated Olives","$12 Flatbread","$11 Charcuterie"]},description:"James Beard Award-winning wine bar with a convivial communal dining room and outstanding small plates.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:18,name:"Girl & the Goat",address:"800 W Randolph St",cuisine:"American",neighborhood:"West Loop",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 cocktails","$6 wine","Half-off small plates"],menu:{drinks:["$8 Goat Negroni","$8 Seasonal Cocktail","$6 House Wine","$7 Craft Beer","$10 Champagne"],food:["Half-off Wood-Oven Pig Face","Half-off Sautéed Green Beans","Half-off Goat Liver Mousse","Half-off Duck Dumplings","Half-off Shishito Peppers"]},description:"Stephanie Izard's acclaimed Randolph Street flagship with bold flavors and a lively bar scene.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:19,name:"City Winery West Loop",address:"1200 W Randolph St",cuisine:"Other",neighborhood:"West Loop",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["Half-off flatbreads","Half-off wine pours","$8 beer"],menu:{drinks:["Half-off House Wine Pours","$8 Craft Beer","$10 Sangria","$9 Mulled Wine","Half-off Sparkling Wine"],food:["Half-off Margherita Flatbread","Half-off Prosciutto Flatbread","Half-off Cheese Plate","Half-off Charcuterie","$8 Olives & Almonds"]},description:"Urban winery with a full restaurant, live music venue, and excellent wine at half-price during happy hour.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:20,name:"Ramen-san West Loop",address:"1012 W Fulton Market",cuisine:"Asian",neighborhood:"Fulton Market",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 Asahi draft","$6 cold dry sake","$7 Penicillin #2","$4 fried chicken bun"],menu:{drinks:["$5 Asahi Cold Draft","$6 Cold Dry Sake","$7 Penicillin #2","$8 Japanese Highball","$6 Ramune Cocktail"],food:["$4 Fried Chicken Bun","$5 Roasted Shishitos","$6 Karaage Chicken Nuggets","$6 Chili Crunch Cucumber","$8 Gyoza"]},description:"Hip ramen shop with 90s hip-hop vibes, Tonkotsu ramen, and some of the city's best lucky hour deals.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:21,name:"Parlor Pizza West Loop",address:"108 N Green St",cuisine:"American",neighborhood:"West Loop",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["BOGO pizzas","$7 appetizers","$10 cocktails","$8 wines","$7 drafts"],menu:{drinks:["$7 Draft Beer","$8 House Wine","$10 Cocktails","$9 Aperol Spritz","$6 Shot"],food:["BOGO Any Pizza","$7 Hummus & Pita","$7 Hand Cut Frites","$7 Nacho Bites","$8 Meatballs"]},description:"High-energy wood-fired pizza bar with buy-one-get-one pizza deals that are impossible to beat.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:22,name:"Cabra",address:"167 N Green St",cuisine:"Other",neighborhood:"West Loop",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 pisco cocktails","$6 wine","Half-off ceviches","Rooftop views"],menu:{drinks:["$8 Classic Pisco Sour","$8 Passion Fruit Pisco","$6 House Wine","$7 Cerveza","$10 Chicha Morada"],food:["Half-off Ceviche Clasico","Half-off Leche de Tigre","$8 Empanadas","$9 Causa","Half-off Anticuchos"]},description:"Rooftop Peruvian restaurant atop the Hoxton Hotel with stunning West Loop views and pisco cocktails.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:23,name:"Aba Chicago",address:"302 N Green St",cuisine:"Other",neighborhood:"Fulton Market",time:"4-6 PM",days:["Sun","Mon","Tue","Wed","Thu"],deals:["$8 wine pours","$5 Hopewell Lager","$10 Classic Martini","$10 House Margarita","Happy hour mezze"],menu:{drinks:["$8 House Wine (Sommelier Selected)","$5 Hopewell Lil Buddy Lager","$10 Classic Martini","$10 House Margarita","$9 Aperol Spritz"],food:["Our Favorite Spreads w/ House Bread","Hot Honey Halloumi","Crispy Pork Belly Bites","$8 Marinated Olives","$10 Seasonal Mezze"]},description:"Mediterranean restaurant with stunning Fulton Market rooftop. Sun-Tue 4-6pm, Wed-Thu 3-6pm. Bar seating only.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:24,name:"Maple & Ash",address:"8 W Maple St",cuisine:"American",neighborhood:"Gold Coast",time:"5-6:30 PM",days:["Mon","Tue","Wed","Thu"],deals:["$10 cocktails","$2 oysters each","$8 wine"],menu:{drinks:["$10 Maple Old Fashioned","$10 Classic Negroni","$10 Paloma","$8 House Wine","$12 Champagne"],food:["$2 Each Fresh Oysters","$14 Wagyu Beef Sliders","$12 Tuna Tartare","$10 Truffle Chips","$16 Steak Bites"]},description:"One of Chicago's top steakhouses with a power-dining bar scene and a rare happy hour deal.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:25,name:"Le Colonial",address:"937 N Rush St",cuisine:"Other",neighborhood:"Gold Coast",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$9 cocktails","$8 wine","Half-off bar bites","Tropical 1920s Saigon ambiance"],menu:{drinks:["$9 Colonial Crush","$9 Vietnamese Coffee Cocktail","$8 House Wine","$7 Tiger Beer","$10 French 75"],food:["Half-off Spring Rolls","Half-off Banh Mi","Half-off Chả Giò","$8 Coconut Curry Dip","$9 Lemongrass Wings"]},description:"Seductive Vietnamese restaurant with 1920s Saigon décor, tropical plants, and an exceptional happy hour.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:26,name:"LUXBAR",address:"18 E Bellevue Pl",cuisine:"American",neighborhood:"Gold Coast",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$6 beer","$8 cocktails","$7 wine","$8 bar bites"],menu:{drinks:["$6 Draft Beer","$8 Classic Cocktails","$7 House Wine","$9 Champagne Cocktail","$6 Well Spirits"],food:["$8 LUX Sliders","$8 Truffle Fries","$9 Chicken Wings","$10 Shrimp Cocktail","$8 Cheese Plate"]},description:"Sophisticated Gold Coast neighborhood bar with consistently excellent food and a welcoming atmosphere.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:27,name:"Jake Melnick's Corner Tap",address:"41 E Superior St",cuisine:"Bar & Grill",neighborhood:"Gold Coast",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 drafts","$6 cocktails","$5 wine","Half-off famous wings"],menu:{drinks:["$4 Domestic Draft","$5 Craft Draft","$6 Cocktails","$5 House Wine","$5 Well Spirits"],food:["Half-off World-Famous Wings","$8 Nachos","$7 Mozzarella Sticks","$9 Loaded Fries","$10 BBQ Ribs Basket"]},description:"Gold Coast institution famous for chicken wings named Top Wings in the U.S. by the Today Show.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:28,name:"The Purple Pig",address:"500 N Michigan Ave",cuisine:"Other",neighborhood:"Streeterville",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$6 wine","$7 cocktails","Half-off charcuterie","$5 bar snacks"],menu:{drinks:["$6 House Wine","$7 Negroni","$7 Aperol Spritz","$5 Draft Beer","$8 Amaro Cocktail"],food:["Half-off Charcuterie Board","$8 Fried Pig Ear","$9 Meatball","$7 Marinated Olives","$10 Crispy Pig Tails"]},description:"Mediterranean small plates restaurant on the Mag Mile with an outstanding wine list and pig-themed menu.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:29,name:"Shaw's Crab House",address:"21 E Hubbard St",cuisine:"Seafood",neighborhood:"Streeterville",time:"3-5 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["Half-price oysters on the half shell","$10 Bloody Mary","$10 Mignonette Martini","$10 Hugo Spritz","Oyster Bar only"],menu:{drinks:["$10 Shaw's Bloody Mary","$10 Mignonette Martini (Ketel One)","$10 Hugo Spritz","$10 Hot Toddy","$8 House Wine"],food:["Half-price Oysters on Half Shell","Mini Lobster Rolls $15 (3pc)","Happy Hour Tower $57","$8 Clam Chowder","$12 Lobster Bisque"]},description:"Chicago seafood institution since 1984. Half-price oysters Mon-Fri 3-5pm in the Oyster Bar only. Live blues every Thursday 5-8pm.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:30,name:"Ramen-san Streeterville",address:"420 E Illinois St",cuisine:"Asian",neighborhood:"Streeterville",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 Asahi draft","$6 cold dry sake","$4 fried chicken bun","$5 roasted shishitos"],menu:{drinks:["$5 Asahi Cold Draft","$6 Cold Dry Sake","$7 Penicillin #2","$8 Japanese Highball","$6 Sake Bomb"],food:["$4 Fried Chicken Bun","$5 Roasted Shishitos","$6 Karaage Chicken Nuggets","$6 Chili Crunch Cucumber","$5 Gyoza"]},description:"Casual ramen shop near Navy Pier with Lucky Hour deals and upbeat 90s hip-hop energy.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:31,name:"Cite",address:"505 N Lake Shore Dr",cuisine:"American",neighborhood:"Streeterville",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 cocktails","$7 wine","$6 beer","Panoramic lake views"],menu:{drinks:["$8 Lake Shore Sunset","$8 Chicago Sour","$7 House Wine","$6 Draft Beer","$10 Sparkling"],food:["$10 Shrimp Cocktail","$9 Sliders","$8 Flatbread","$10 Cheese Plate","$9 Truffle Fries"]},description:"Lakeside restaurant with sweeping Lake Michigan views from the 70th floor of Lake Point Tower.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:32,name:"The Violet Hour",address:"1520 N Damen Ave",cuisine:"Bar & Grill",neighborhood:"Wicker Park",time:"5-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$8 cocktails","$5 beer","Half-off bar snacks","Legendary speakeasy"],menu:{drinks:["$8 Juliet & Romeo","$8 Bitter Giuseppe","$8 Seasonal Cocktail","$5 Craft Beer","$7 House Wine"],food:["$7 Cheese Plate","$8 Charcuterie","$6 Marinated Olives","$9 Crostini","$8 Pickled Vegetables"]},description:"Legendary speakeasy-style cocktail bar with plush seating, dim lighting, and world-class artisanal drinks.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:33,name:"Big Star",address:"1531 N Damen Ave",cuisine:"Mexican",neighborhood:"Wicker Park",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$3 tacos","$4 Lone Star","$6 margaritas","Honky-tonk patio"],menu:{drinks:["$6 House Margarita","$4 Lone Star Beer","$4 PBR","$7 Paloma","$8 Whiskey Drink"],food:["$3 Pork Carnitas Taco","$3 Chicken Taco","$3 Mushroom Taco","$5 Chips & Salsa","$7 Queso"]},description:"Paul Kahan's beloved honky-tonk taco bar with cheap tacos, cold beers, and a legendary patio.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:34,name:"Amaru",address:"1904 W North Ave",cuisine:"Other",neighborhood:"Wicker Park",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$10 cocktails","$8 wine","Small plates from $10"],menu:{drinks:["$10 Pisco Sour","$10 Spicy Marg","$10 Amaru Mule","$8 House Wine","$7 Cerveza"],food:["$10 Ceviche","$11 Piononos","$12 Chorizo Wrapped in Bacon","$10 Empanadas","$9 Plantain Chips & Guac"]},description:"Upbeat Latin American restaurant with excellent ceviche, bold cocktails, and happy hour energy.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:35,name:"Bangers & Lace",address:"1670 W Division St",cuisine:"Bar & Grill",neighborhood:"Wicker Park",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 craft drafts","$6 cocktails","$4 shots","30+ taps"],menu:{drinks:["$4 Rotating Craft Draft","$4 PBR","$6 Cocktails","$4 Well Shot","$7 Fancy Cocktail"],food:["$7 Sausage Board","$6 Pretzel","$8 Loaded Fries","$9 Chicken Sandwich","$7 Wings"]},description:"Craft beer and sausage paradise with 30+ taps and one of Wicker Park's best happy hour prices.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:36,name:"Spilt Milk",address:"2758 W Armitage Ave",cuisine:"Bar & Grill",neighborhood:"Logan Square",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],deals:["Half-off select drafts","Half-off wines","Daily 4-7pm every day"],menu:{drinks:["Half-off Rotating Craft Drafts","Half-off House Wine","$5 Well Spirits","$7 Cocktails","$4 PBR"],food:["$7 Bar Snacks","$8 Flatbread","$9 Wings","$7 Cheese Plate","$6 Pickled Veggie Plate"]},description:"Cozy Logan Square bar with a great back patio, half-off drafts and wines until 7pm every single day.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:37,name:"Longman & Eagle",address:"2657 N Kedzie Ave",cuisine:"American",neighborhood:"Logan Square",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 drafts","$5 whiskey","$6 cocktails","James Beard nominated"],menu:{drinks:["$4 Draft Beer","$5 Well Whiskey","$6 Craft Cocktails","$6 House Wine","$5 PBR & Shot"],food:["$8 Duck Egg Deviled Eggs","$9 Pork Belly Bites","$8 Charcuterie","$10 Burger","$7 Frites"]},description:"James Beard-nominated gastropub and inn with one of Chicago's most impressive whiskey collections.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:38,name:"Lost Lake",address:"3154 W Diversey Ave",cuisine:"Other",neighborhood:"Logan Square",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$7 tiki drinks","$4 beer","Half-off bar snacks","Award-winning tiki bar"],menu:{drinks:["$7 Mai Tai","$7 Painkiller","$7 Jungle Bird","$4 Canned Beer","$8 Rum Punch Bowl (for 2)"],food:["$7 Spam Musubi","$8 Lumpia","$9 Coconut Shrimp","$6 Pineapple Salsa & Chips","$8 Kalua Pork Sliders"]},description:"Award-winning tiki bar in Logan Square with affordable exotic cocktails in a cozy neighborhood setting.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:39,name:"Revolution Brewing Logan Square",address:"2323 N Milwaukee Ave",cuisine:"Bar & Grill",neighborhood:"Logan Square",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 Revolution drafts","$5 cocktails","Half-off bar snacks","Chicago's best brewery"],menu:{drinks:["$4 Anti-Hero IPA","$4 Revolution Rotating Draft","$5 Seasonal Cocktail","$5 House Wine","$4 PBR"],food:["Half-off Soft Pretzel","Half-off Deviled Eggs","Half-off Chicken Wings","$8 Nachos","$10 Smash Burger"]},description:"Chicago's most celebrated craft brewery with a massive brewpub and excellent happy hour deals on fresh beer.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:40,name:"The Whale Chicago",address:"2427 N Western Ave",cuisine:"Bar & Grill",neighborhood:"Logan Square",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],deals:["Daily drink specials","$6 craft cocktails","$4 beer","Every day 4-7pm"],menu:{drinks:["$6 Craft Cocktails","$4 Draft Beer","$5 House Wine","$6 Marg","$4 PBR"],food:["$7 Wings","$6 Pretzel","$8 Nachos","$9 Burger","$7 Grilled Cheese"]},description:"Logan Square's go-to daily happy hour spot with consistent deals every single day of the week.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:41,name:"Ampersand Wine Bar",address:"4845 N Western Ave",cuisine:"Other",neighborhood:"Lincoln Square",time:"4-6 PM",days:["Tue","Wed","Thu","Fri","Sat"],deals:["$6 wine","Half-off bottles Tuesday","$8 cheese & charcuterie","Natural wines"],menu:{drinks:["$6 House Wine","Half-off Bottles on Tuesday","$8 Natural Wine","$7 Sparkling Wine","$9 Biodynamic Selection"],food:["$8 Cheese Plate","$10 Charcuterie","$7 Olives & Almonds","$9 Smoked Fish Plate","$8 Pâté & Toast"]},description:"Cozy neighborhood wine bar celebrating natural and biodynamic wines with an excellent small plates menu.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:42,name:"Begyle Brewing",address:"1800 W Cuyler Ave",cuisine:"Bar & Grill",neighborhood:"Lincoln Square",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 Begyle drafts","$3 PBR","$6 cocktails","Dog-friendly patio"],menu:{drinks:["$4 Begyle Rotating Draft","$4 Flannel Mouth IPA","$3 PBR","$6 Cocktail","$5 Canned Beer"],food:["$7 Soft Pretzel","$8 Nachos","$7 Hot Dogs","$9 Smash Burger","$6 Frites"]},description:"Neighborhood craft brewery taproom with excellent beers, a dog-friendly patio, and cheap happy hour prices.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:43,name:"Rocking Horse",address:"1825 W Montrose Ave",cuisine:"American",neighborhood:"Ravenswood",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 drafts","$6 cocktails","$4 wine","Half-off bar snacks"],menu:{drinks:["$5 Rotating Draft","$5 Domestic","$6 House Cocktail","$4 House Wine","$4 Well Shot"],food:["Half-off Wings","$7 Fries","$8 Nachos","$6 Pretzel","$9 Burger"]},description:"Laid-back Ravenswood neighborhood bar with a great patio, daily specials, and a welcoming vibe.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:44,name:"Dorian's",address:"4647 N Clark St",cuisine:"Bar & Grill",neighborhood:"Ravenswood",time:"4-6 PM",days:["Tue","Wed","Thu","Fri"],deals:["$6 wine","$5 beer","$7 cocktails","Natural wine bar"],menu:{drinks:["$6 Natural Wine","$5 Draft Beer","$7 Classic Cocktail","$8 Seasonal Special","$5 Well Spirit"],food:["$8 Cheese Board","$9 Smoked Fish Dip","$7 Olives & Pickles","$10 Smash Burger","$8 Frites"]},description:"Intimate Ravenswood wine bar and neighborhood restaurant with natural wines and excellent bar bites.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:45,name:"Hopleaf Bar",address:"5148 N Clark St",cuisine:"Bar & Grill",neighborhood:"Edgewater",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 drafts","$2 off cocktails","$5 wine","Best Belgian beer in Chicago"],menu:{drinks:["$4 Rotating Craft Draft","$4 Belgian Beer","$2-off Any Cocktail","$5 House Wine","$5 House Spirit"],food:["$8 Belgian Mussels","$7 Frites","$9 Croque Monsieur","$8 Cheese Plate","$10 Charcuterie"]},description:"Chicago's finest Belgian beer bar with an exceptional rotating tap list and must-try mussels and frites.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:46,name:"Marty's Martini Bar",address:"1511 W Balmoral Ave",cuisine:"Bar & Grill",neighborhood:"Edgewater",time:"4-7 PM",days:["Mon","Tue","Wed","Thu","Fri","Sat"],deals:["$6 martinis","$5 wine","$4 beer","Classic Chicago martini bar"],menu:{drinks:["$6 Classic Martini","$6 Dirty Martini","$6 Espresso Martini","$5 House Wine","$4 Domestic Beer"],food:["$6 Cheese Plate","$7 Charcuterie","$5 Marinated Olives","$8 Shrimp Cocktail","$9 Smoked Salmon"]},description:"Classic Edgewater martini bar with a neighborhood feel, excellent cocktails, and daily happy hour specials.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:47,name:"Oyster Bah",address:"1962 N Halsted St",cuisine:"Seafood",neighborhood:"Lincoln Park",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$1 oysters","$6 wine","$7 cocktails"],menu:{drinks:["$7 Aperol Spritz","$7 Classic Martini","$6 House Wine","$6 Draft Beer","$8 Bloody Mary"],food:["$1 Each East/West Coast Oysters","$9 Shrimp Cocktail","$8 Crab Cake","$10 Lobster Roll Bites","$9 Fish Tacos"]},description:"Lincoln Park seafood spot with some of the city's best oyster deals in a fun neighborhood setting.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:48,name:"Cafe Ba-Ba-Reeba",address:"2024 N Halsted St",cuisine:"Other",neighborhood:"Lincoln Park",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri","Sat","Sun"],deals:["$1.50 pintxos","$3-5 tapas","$22 pitcher sangria","$4 beer","Daily happy hour"],menu:{drinks:["$4 Draft Beer","$22 Pitcher of Sangria","$8 House Wine","$9 Cava","$7 Spanish Cocktail"],food:["$1.50 Select Pintxos","$3 Patatas Bravas","$4 Bacon-Wrapped Dates","$5 Ham Croquettes","$5 Stuffed Mushrooms"]},description:"Lincoln Park tapas institution with outstanding pintxos, sangria pitchers, and a daily happy hour including weekends.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:49,name:"Hopleaf Andersonville",address:"5148 N Clark St",cuisine:"Bar & Grill",neighborhood:"Andersonville",time:"3-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$4 drafts","$2 off cocktails","$5 wine","Best Belgian beer selection"],menu:{drinks:["$4 Rotating Craft Draft","$4 Belgian Ales","$2-off Cocktails","$5 House Wine","$5 Well Spirit"],food:["$8 Moules Frites","$7 Frites","$9 Croque Monsieur","$8 Cheese Plate","$10 Charcuterie"]},description:"Beloved Andersonville Belgian beer bar with an exceptional tap list and cozy neighborhood atmosphere.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
  {id:50,name:"Bub City River North",address:"435 N Clark St",cuisine:"American",neighborhood:"River North",time:"4-6 PM",days:["Mon","Tue","Wed","Thu","Fri"],deals:["$5 High Noons & White Claws","$6 Easy Peasy Lemonade","$5 burgers & bites","$25 bucket deals"],menu:{drinks:["$5 High Noon","$5 White Claws","$5 Mamitas","$6 Easy Peasy Lemonade","$6 Back Porch Tea"],food:["$5 Single All-American Burger","$5 Single Cali Burger","$5 Pimento Grilled Cheese","$5 Chicken Tenders (2pc)","$5 Cheesy Waffle Fries"]},description:"Country-meets-cocktail bar in River North with Bub City's Famous $5 Happy Hour on drinks and bites Mon-Fri.",reviews:[],checkins:[],saved:false,isNew:false,addedDate:todayDate},
];

function isActive(r){
  if(!r.days||!r.days.includes(today))return false;
  const s=r.time.toLowerCase().replace(/\s/g,'');
  const m=s.match(/(\d+)(?::(\d+))?(am|pm)?[-](\d+)(?::(\d+))?(am|pm)?/);
  if(!m)return false;
  let sh=+m[1],sm=m[2]?+m[2]:0,sp=m[3],eh=+m[4],em=m[5]?+m[5]:0,ep=m[6];
  if(!sp&&sh<7)sp='pm';
  if(sp==='pm'&&sh!==12)sh+=12;
  if(ep==='pm'&&eh!==12)eh+=12;
  const now=new Date();
  return(now.getHours()*60+now.getMinutes())>=(sh*60+sm)&&(now.getHours()*60+now.getMinutes())<(eh*60+em);
}

function timeUntilClose(r){
  const s=r.time.toLowerCase().replace(/\s/g,'');
  const m=s.match(/(\d+)(?::(\d+))?(am|pm)?[-](\d+)(?::(\d+))?(am|pm)?/);
  if(!m)return null;
  let eh=+m[4],em=m[5]?+m[5]:0,ep=m[6];
  if(ep==='pm'&&eh!==12)eh+=12;
  const now=new Date();
  const nowMins=now.getHours()*60+now.getMinutes();
  const closeMins=eh*60+em;
  const diff=closeMins-nowMins;
  if(diff<=0||diff>180)return null;
  if(diff<=60)return`Ends in ${diff}min`;
  return`Ends in ${Math.floor(diff/60)}h ${diff%60}min`;
}

function avgRating(reviews){
  if(!reviews||!reviews.length)return 0;
  return reviews.reduce((a,b)=>a+(b.stars||0),0)/reviews.length;
}

function initials(name){return(name||'G').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();}
const COLORS=['#185FA5','#0F6E56','#993C1D','#534AB7','#3B6D11','#854F0B'];
function avatarColor(name){return COLORS[(name||'A').charCodeAt(0)%COLORS.length];}

function getEarnedBadges(ci,rv,rt,xp,profileBadges){
  return BADGES.filter(b=>{
    if(b.id==='founding_member')return(profileBadges||[]).includes('founding_member');
    return b.check(ci,rv,rt,xp);
  });
}
function getNextBadge(ci,rv,rt,xp,profileBadges){
  return BADGES.find(b=>{
    if(b.id==='founding_member')return false;
    return!b.check(ci,rv,rt,xp);
  });
}

// BLACK CARD COMPONENT
function BlackCard({username,memberNumber}){
  return(
    <div style={{background:'linear-gradient(135deg,#0a0a0a 0%,#1a1a1a 40%,#0d0d0d 100%)',borderRadius:20,padding:'28px 28px 24px',marginBottom:16,position:'relative',overflow:'hidden',boxShadow:'0 20px 60px rgba(0,0,0,0.5),0 0 0 1px rgba(212,175,55,0.3)',border:'1px solid rgba(212,175,55,0.2)'}}>
      {/* GOLD SHIMMER */}
      <div style={{position:'absolute',top:0,left:'-100%',width:'50%',height:'100%',background:'linear-gradient(90deg,transparent,rgba(212,175,55,0.08),transparent)',animation:'shimmer 3s infinite'}}/>

      {/* CHIP */}
      <div style={{position:'absolute',top:28,right:28,width:44,height:32,borderRadius:6,background:'linear-gradient(135deg,#d4af37,#f5d770,#d4af37)',boxShadow:'inset 0 1px 2px rgba(255,255,255,0.3)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{width:28,height:20,borderRadius:3,border:'1px solid rgba(0,0,0,0.3)',display:'grid',gridTemplateColumns:'1fr 1fr',gap:1,padding:2}}>
          {[0,1,2,3].map(i=><div key={i} style={{background:'rgba(0,0,0,0.15)',borderRadius:1}}/>)}
        </div>
      </div>

      {/* TOP ROW */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,color:'rgba(212,175,55,0.7)',fontWeight:700,letterSpacing:3,textTransform:'uppercase',marginBottom:6}}>Happy Hour Chicago</div>
        <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',letterSpacing:2,textTransform:'uppercase'}}>Centurion Member</div>
      </div>

      {/* MEMBER NUMBER */}
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:'monospace',fontSize:18,color:'rgba(212,175,55,0.9)',letterSpacing:4,fontWeight:600}}>
          HHC •••• •••• {String(memberNumber||1).padStart(4,'0')}
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end'}}>
        <div>
          <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',letterSpacing:2,textTransform:'uppercase',marginBottom:3}}>Member Name</div>
          <div style={{fontSize:14,color:'#fff',fontWeight:700,letterSpacing:1,textTransform:'uppercase'}}>{username||'CHICAGO MEMBER'}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',letterSpacing:2,textTransform:'uppercase',marginBottom:3}}>Member Since</div>
          <div style={{fontSize:12,color:'rgba(212,175,55,0.8)',fontWeight:600}}>2025</div>
        </div>
      </div>

      {/* GOLD LINE */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,height:3,background:'linear-gradient(90deg,transparent,#d4af37,rgba(212,175,55,0.5),#d4af37,transparent)'}}/>

      {/* WATERMARK */}
      <div style={{position:'absolute',bottom:16,right:16,fontSize:32,opacity:0.04,fontWeight:900,color:'#d4af37',letterSpacing:-2}}>HHC</div>

      <style>{`@keyframes shimmer{0%{left:-100%}100%{left:200%}}`}</style>
    </div>
  );
}

export default function Home(){
  const [restaurants,setRestaurants]=useState([]);
  const [feed,setFeed]=useState([]);
  const [tab,setTab]=useState('list');
  const [search,setSearch]=useState('');
  const [cuisineF,setCuisineF]=useState('');
  const [dayF,setDayF]=useState('');
  const [neighborhoodF,setNeighborhoodF]=useState('All');
  const [openNowF,setOpenNowF]=useState(false);
  const [authUser,setAuthUser]=useState(null);
  const [profile,setProfile]=useState(null);
  const [showAuth,setShowAuth]=useState(false);
  const [authMode,setAuthMode]=useState('login');
  const [authEmail,setAuthEmail]=useState('');
  const [authPassword,setAuthPassword]=useState('');
  const [authUsername,setAuthUsername]=useState('');
  const [authLoading,setAuthLoading]=useState(false);
  const [authError,setAuthError]=useState('');
  const [showAdd,setShowAdd]=useState(false);
  const [showReview,setShowReview]=useState(false);
  const [reviewTarget,setReviewTarget]=useState(null);
  const [detailTarget,setDetailTarget]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [aiResults,setAiResults]=useState([]);
  const [showAI,setShowAI]=useState(false);
  const [aiQuery,setAiQuery]=useState('happy hour deals Chicago');
  const [addForm,setAddForm]=useState({name:'',address:'',cuisine:'American',neighborhood:'River North',time:'',days:'Mon-Fri',deals:''});
  const [reviewForm,setReviewForm]=useState({stars:5,text:''});
  const [toast,setToast]=useState('');
  const [newBadge,setNewBadge]=useState(null);
  const [mounted,setMounted]=useState(false);
  const [dbCheckins,setDbCheckins]=useState([]);
  const [dbRatings,setDbRatings]=useState({});
  const [dbSaved,setDbSaved]=useState([]);
  const [reviewCount,setReviewCount]=useState(0);
  const [detailTab,setDetailTab]=useState('deals');

  useEffect(()=>{
    setMounted(true);
    try{
      const r=localStorage.getItem('hh_restaurants_v5');
      setRestaurants(r?JSON.parse(r):SEED);
      const f=localStorage.getItem('hh_feed');
      if(f)setFeed(JSON.parse(f));
    }catch(e){setRestaurants(SEED);}
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user){setAuthUser(session.user);loadProfile(session.user.id);loadUserData(session.user.id);}
    });
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>{
      if(session?.user){setAuthUser(session.user);loadProfile(session.user.id);loadUserData(session.user.id);}
      else{setAuthUser(null);setProfile(null);setDbCheckins([]);setDbRatings({});setDbSaved([]);setReviewCount(0);}
    });
    return()=>subscription.unsubscribe();
  },[]);

  async function loadProfile(userId){
    const{data}=await supabase.from('profiles').select('*').eq('id',userId).single();
    if(data)setProfile(data);
    else{const{data:np}=await supabase.from('profiles').insert({id:userId,username:'Happy Hour Fan',xp:0,level:1,badges:[]}).select().single();if(np)setProfile(np);}
  }

  async function loadUserData(userId){
    const[{data:ci},{data:rt},{data:sv},{data:rv}]=await Promise.all([
      supabase.from('checkins').select('*').eq('user_id',userId),
      supabase.from('ratings').select('*').eq('user_id',userId),
      supabase.from('saved').select('*').eq('user_id',userId),
      supabase.from('reviews').select('id').eq('user_id',userId),
    ]);
    if(ci)setDbCheckins(ci);
    if(rt){const m={};rt.forEach(r=>m[r.restaurant_id]=r.stars);setDbRatings(m);}
    if(sv)setDbSaved(sv.map(s=>s.restaurant_id));
    if(rv)setReviewCount(rv.length);
  }

  async function addXP(amount,newCi,newRv,newRt){
    if(!authUser||!profile)return;
    const newXp=(profile.xp||0)+amount;
    const newLevel=Math.floor(newXp/200)+1;
    await supabase.from('profiles').update({xp:newXp,level:newLevel}).eq('id',authUser.id);
    const up={...profile,xp:newXp,level:newLevel};
    setProfile(up);
    const ci=newCi||dbCheckins;
    const rv=newRv!==undefined?newRv:reviewCount;
    const rt=newRt!==undefined?newRt:Object.keys(dbRatings).length;
    const prev=getEarnedBadges(dbCheckins,reviewCount,Object.keys(dbRatings).length,profile.xp||0,profile.badges||[]);
    const next=getEarnedBadges(ci,rv,rt,newXp,profile.badges||[]);
    const just=next.filter(b=>!prev.find(p=>p.id===b.id));
    if(just.length>0){setNewBadge(just[0]);setTimeout(()=>setNewBadge(null),4000);}
  }

  async function signInWithGoogle(){
    setAuthLoading(true);
    await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin}});
    setAuthLoading(false);
  }

  async function signInWithEmail(){
    setAuthLoading(true);setAuthError('');
    const{error}=await supabase.auth.signInWithPassword({email:authEmail,password:authPassword});
    if(error)setAuthError(error.message);
    else{setShowAuth(false);toast2('Welcome back! 🍺');}
    setAuthLoading(false);
  }

  async function signUpWithEmail(){
    setAuthLoading(true);setAuthError('');
    const{data,error}=await supabase.auth.signUp({email:authEmail,password:authPassword});
    if(error){setAuthError(error.message);setAuthLoading(false);return;}
    if(data.user){
      await supabase.from('profiles').insert({id:data.user.id,username:authUsername||'Happy Hour Fan',xp:0,level:1,badges:[]});
      toast2('Account created! Check email to verify.');
      setShowAuth(false);
    }
    setAuthLoading(false);
  }

  async function signOut(){await supabase.auth.signOut();toast2('Signed out!');}

  function saveR(rs){setRestaurants(rs);try{localStorage.setItem('hh_restaurants_v5',JSON.stringify(rs));}catch(e){}}
  function saveF(f){setFeed(f);try{localStorage.setItem('hh_feed',JSON.stringify(f));}catch(e){}}
  function toast2(msg){setToast(msg);setTimeout(()=>setToast(''),3000);}
  function pushFeed(type,rname,text){saveF([{type,rname,text,author:profile?.username||authUser?.email||'Guest',date:'Just now',id:Date.now()},...feed].slice(0,30));}

  async function doCheckin(rid){
    if(!authUser){setShowAuth(true);return;}
    const r=restaurants.find(x=>x.id===rid);if(!r)return;
    const already=dbCheckins.some(c=>c.restaurant_id===String(rid)&&new Date(c.checked_in_at).toDateString()===todayDate);
    if(already){toast2('Already checked in today!');return;}
    const newCiItem={restaurant_id:String(rid),checked_in_at:new Date().toISOString(),neighborhood:r.neighborhood};
    await supabase.from('checkins').insert({user_id:authUser.id,restaurant_id:String(rid),restaurant_name:r.name,neighborhood:r.neighborhood});
    const updatedCi=[...dbCheckins,newCiItem];
    setDbCheckins(updatedCi);
    await addXP(50,updatedCi);
    pushFeed('ci',r.name,'checked in at '+r.name);
    toast2('+50 XP! Checked in at '+r.name);
  }

  async function doRate(rid,stars){
    if(!authUser){setShowAuth(true);return;}
    const existing=dbRatings[String(rid)];
    if(existing){await supabase.from('ratings').update({stars}).eq('user_id',authUser.id).eq('restaurant_id',String(rid));}
    else{await supabase.from('ratings').insert({user_id:authUser.id,restaurant_id:String(rid),stars});await addXP(10,undefined,undefined,Object.keys(dbRatings).length+1);}
    setDbRatings(prev=>({...prev,[String(rid)]:stars}));
    toast2('+10 XP! Rated '+stars+' stars');
  }

  async function doSaveR(rid){
    if(!authUser){setShowAuth(true);return;}
    const isSaved=dbSaved.includes(String(rid));
    if(isSaved){await supabase.from('saved').delete().eq('user_id',authUser.id).eq('restaurant_id',String(rid));setDbSaved(prev=>prev.filter(x=>x!==String(rid)));}
    else{await supabase.from('saved').insert({user_id:authUser.id,restaurant_id:String(rid)});setDbSaved(prev=>[...prev,String(rid)]);}
  }

  async function submitReview(){
    if(!authUser){setShowAuth(true);return;}
    if(!reviewForm.text.trim()){toast2('Please write something');return;}
    await supabase.from('reviews').insert({user_id:authUser.id,restaurant_id:String(reviewTarget.id),restaurant_name:reviewTarget.name,body:reviewForm.text,stars:reviewForm.stars});
    const rv={id:Date.now(),author:profile?.username||authUser.email,text:reviewForm.text,stars:reviewForm.stars,likes:[],date:'Just now'};
    saveR(restaurants.map(r=>r.id===reviewTarget.id?{...r,reviews:[rv,...(r.reviews||[])]}:r));
    const newRv=reviewCount+1;setReviewCount(newRv);
    await addXP(20,undefined,newRv);
    pushFeed('rv',reviewTarget.name,reviewForm.text);
    setShowReview(false);setReviewForm({stars:5,text:''});
    toast2('+20 XP! Review posted');
  }

  function submitAdd(){
    if(!addForm.name.trim()){toast2('Please enter a name');return;}
    const dn=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    let days=[];
    if(addForm.days.includes('-')){const pts=addForm.days.split('-').map(s=>s.trim());const si=dn.indexOf(pts[0]),ei=dn.indexOf(pts[1]);if(si>=0&&ei>=si)days=dn.slice(si,ei+1);}
    else{days=addForm.days.split(/[,\s]+/).map(s=>s.trim()).filter(d=>dn.includes(d));}
    if(!days.length)days=['Mon','Tue','Wed','Thu','Fri'];
    const newR={id:Date.now(),name:addForm.name,address:addForm.address||'Chicago, IL',cuisine:addForm.cuisine,neighborhood:addForm.neighborhood||'River North',time:addForm.time||'5-7 PM',days,deals:addForm.deals.split('\n').map(s=>s.trim()).filter(Boolean),menu:{drinks:[],food:[]},description:'',reviews:[],checkins:[],saved:false,isNew:true,addedDate:todayDate};
    saveR([...restaurants,newR]);
    if(authUser)addXP(25);
    pushFeed('add',newR.name,'added '+newR.name);
    setShowAdd(false);setAddForm({name:'',address:'',cuisine:'American',neighborhood:'River North',time:'',days:'Mon-Fri',deals:''});
    toast2('+25 XP! Restaurant added');
  }

  async function runAISearch(){
    setAiLoading(true);setAiResults([]);
    try{
      const res=await fetch('/api/search',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:aiQuery})});
      const data=JSON.parse(await res.text());
      setAiResults(Array.isArray(data.results)?data.results:[]);
      if(!data.results?.length)toast2('No results found. Try a different search.');
    }catch(e){toast2('Search failed');}
    setAiLoading(false);
  }

  function addFromAI(r){
    const newR={...r,id:Date.now(),reviews:[],checkins:[],saved:false,isNew:true,addedDate:todayDate,neighborhood:r.neighborhood||'River North',menu:{drinks:[],food:[]},description:''};
    saveR([...restaurants,newR]);
    setAiResults(prev=>prev.filter(x=>x.name!==r.name));
    if(authUser)addXP(25);
    toast2('+25 XP! Added '+r.name);
  }

  function shareRestaurant(r){
    const text=`${r.name} happy hour in ${r.neighborhood}! ${r.time} — ${(r.deals||[]).slice(0,2).join(', ')} 🍺 happyhourchi.org`;
    if(navigator.share){navigator.share({title:'Happy Hour Chicago',text,url:'https://happyhourchi.org'});}
    else{navigator.clipboard.writeText(text).catch(()=>{});toast2('Copied!');}
  }

  const level=Math.floor((profile?.xp||0)/200)+1;
  const prog=(profile?.xp||0)%200;
  const displayName=profile?.username||authUser?.email?.split('@')[0]||'Guest';
  const isFounder=(profile?.badges||[]).includes('founding_member');
  const earnedBadges=authUser?getEarnedBadges(dbCheckins,reviewCount,Object.keys(dbRatings).length,profile?.xp||0,profile?.badges||[]):[];
  const nextBadge=authUser?getNextBadge(dbCheckins,reviewCount,Object.keys(dbRatings).length,profile?.xp||0,profile?.badges||[]):null;
  const openNowList=restaurants.filter(r=>isActive(r)).sort((a,b)=>avgRating(b.reviews)-avgRating(a.reviews));

  const filtered=restaurants.filter(r=>{
    if(search&&!r.name.toLowerCase().includes(search.toLowerCase())&&!r.neighborhood?.toLowerCase().includes(search.toLowerCase()))return false;
    if(cuisineF&&r.cuisine!==cuisineF)return false;
    if(dayF&&!r.days.includes(dayF))return false;
    if(neighborhoodF&&neighborhoodF!=='All'&&r.neighborhood!==neighborhoodF)return false;
    if(openNowF&&!isActive(r))return false;
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

  if(!mounted)return null;
  const G='#22c55e';
  const GOLD='#d4af37';

  return(
    <main style={{maxWidth:980,margin:'0 auto',padding:'0 16px 80px',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',background:'#f7f7f8',minHeight:'100vh'}}>

      {toast&&<div style={{position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',background:'#1a1a1a',color:'#fff',padding:'11px 22px',borderRadius:24,fontSize:13,fontWeight:500,zIndex:9999,whiteSpace:'nowrap',boxShadow:'0 4px 24px rgba(0,0,0,0.25)'}}>{toast}</div>}

      {newBadge&&(
        <div style={{position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',background:newBadge.special?'#0a0a0a':'#fff',border:`2px solid ${newBadge.special?GOLD:G}`,padding:'16px 24px',borderRadius:20,zIndex:9999,textAlign:'center',boxShadow:newBadge.special?`0 8px 40px rgba(212,175,55,0.4)`:`0 8px 40px rgba(34,197,94,0.25)`,minWidth:240}}>
          {newBadge.special&&<div style={{fontSize:10,color:GOLD,fontWeight:700,letterSpacing:3,textTransform:'uppercase',marginBottom:4}}>Invitation Only</div>}
          <div style={{fontSize:40,marginBottom:6}}>{newBadge.special?'🖤':newBadge.icon}</div>
          <div style={{fontSize:10,color:newBadge.special?GOLD:G,fontWeight:700,textTransform:'uppercase',letterSpacing:1,marginBottom:2}}>Badge Unlocked!</div>
          <div style={{fontWeight:800,fontSize:18,color:newBadge.special?'#fff':'#1a1a1a'}}>{newBadge.name}</div>
          <div style={{fontSize:12,color:newBadge.special?'rgba(212,175,55,0.7)':'#888',marginTop:2}}>{newBadge.desc}</div>
        </div>
      )}

      {/* HEADER */}
      <div style={{display:'flex',alignItems:'center',gap:10,padding:'20px 0 16px',flexWrap:'wrap'}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:40,height:40,borderRadius:12,background:isFounder?'linear-gradient(135deg,#1a1a1a,#2a2a2a)':G,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,boxShadow:isFounder?`0 4px 12px rgba(212,175,55,0.3)`:`0 4px 12px rgba(34,197,94,0.3)`,border:isFounder?`1px solid rgba(212,175,55,0.3)`:'none'}}>🍺</div>
            <div>
              <div style={{fontSize:20,fontWeight:800,color:'#1a1a1a',letterSpacing:-0.5}}>Happy Hour Chicago</div>
              <div style={{fontSize:11,color:isFounder?GOLD:'#aaa',marginTop:1,fontWeight:isFounder?600:400}}>
                {authUser?(isFounder?`⬛ Centurion · Level ${level} · ${profile?.xp||0} XP`:`Level ${level} · ${profile?.xp||0} XP · ${displayName}`):"Chicago's #1 happy hour finder"}
              </div>
            </div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <button onClick={()=>setShowAI(true)} style={{padding:'8px 14px',fontSize:12,borderRadius:20,border:'1px solid #e5e5e5',background:'#fff',cursor:'pointer',fontWeight:500,color:'#555'}}>🤖 AI</button>
          <button onClick={()=>setShowAdd(true)} style={{padding:'8px 14px',fontSize:12,borderRadius:20,border:'1px solid #e5e5e5',background:'#fff',cursor:'pointer',fontWeight:500,color:'#555'}}>+ Add</button>
          {authUser
            ?<button onClick={signOut} style={{padding:'8px 14px',fontSize:12,borderRadius:20,border:'1px solid #e5e5e5',background:'none',cursor:'pointer',color:'#ccc'}}>Sign out</button>
            :<button onClick={()=>setShowAuth(true)} style={{padding:'8px 18px',fontSize:13,borderRadius:20,border:'none',background:G,color:'#fff',cursor:'pointer',fontWeight:700,boxShadow:`0 4px 12px rgba(34,197,94,0.3)`}}>Sign in</button>
          }
        </div>
      </div>

      {/* STATS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:14}}>
        {[
          {n:restaurants.length,l:'Spots',icon:'🏪'},
          {n:openNowList.length,l:'Open now',icon:'🟢'},
          {n:dbCheckins.length,l:'My check-ins',icon:'📍'},
          {n:level,l:'My level',icon:'⚡'},
        ].map(stat=>(
          <div key={stat.l} style={{background:'#fff',borderRadius:16,padding:'12px 8px',textAlign:'center',border:'1px solid #eee',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
            <div style={{fontSize:16,marginBottom:3}}>{stat.icon}</div>
            <div style={{fontSize:22,fontWeight:800,color:'#1a1a1a',lineHeight:1}}>{stat.n}</div>
            <div style={{fontSize:10,color:'#bbb',marginTop:3,fontWeight:500}}>{stat.l}</div>
          </div>
        ))}
      </div>

      {authUser&&(
        <div style={{marginBottom:14}}>
          <div style={{background:'#eee',borderRadius:99,height:4}}>
            <div style={{background:isFounder?`linear-gradient(90deg,${GOLD},#f5d770)`:G,borderRadius:99,height:4,width:Math.round(prog/200*100)+'%',transition:'width 0.6s ease'}}/>
          </div>
          <div style={{fontSize:10,color:'#ccc',marginTop:3,textAlign:'right'}}>{prog}/200 XP to Level {level+1}</div>
        </div>
      )}

      {/* TABS */}
      <div style={{display:'flex',background:'#fff',borderRadius:16,padding:4,gap:2,marginBottom:16,border:'1px solid #eee',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
        {[['list','Browse'],['feed','Activity'],['leaderboard','Top'],['saved','Saved'],['profile','Profile']].map(([t,label])=>(
          <button key={t} onClick={()=>setTab(t)} style={{flex:1,padding:'9px 4px',fontSize:12,border:'none',borderRadius:12,background:tab===t?(isFounder?'#1a1a1a':G):'none',cursor:'pointer',color:tab===t?'#fff':'#999',fontWeight:tab===t?700:400,transition:'all 0.2s',whiteSpace:'nowrap'}}>{label}</button>
        ))}
      </div>

      {(tab==='list'||tab==='saved')&&(
        <>
          {tab==='list'&&(
            <div style={{marginBottom:20}}>
              {openNowList.length>0?(
                <>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
                    <div>
                      <div style={{fontSize:17,fontWeight:800,color:'#1a1a1a',letterSpacing:-0.3}}>🟢 Open right now</div>
                      <div style={{fontSize:11,color:'#aaa'}}>{openNowList.length} happy hour{openNowList.length!==1?'s':''} happening in Chicago</div>
                    </div>
                    <button onClick={()=>setOpenNowF(true)} style={{fontSize:11,padding:'5px 12px',borderRadius:99,border:`1px solid ${G}`,background:'#f0fdf4',cursor:'pointer',color:G,fontWeight:600}}>See all</button>
                  </div>
                  <div style={{display:'flex',gap:10,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
                    {openNowList.slice(0,8).map(r=>{
                      const closing=timeUntilClose(r);
                      const checked=dbCheckins.some(c=>c.restaurant_id===String(r.id)&&new Date(c.checked_in_at).toDateString()===todayDate);
                      const isSaved=dbSaved.includes(String(r.id));
                      return(
                        <div key={r.id} onClick={()=>{setDetailTarget(r);setDetailTab('deals');}} style={{minWidth:200,background:'linear-gradient(145deg,#f0fdf4,#dcfce7)',borderRadius:20,padding:'16px 14px',cursor:'pointer',border:'1px solid #bbf7d0',flexShrink:0,position:'relative',overflow:'hidden',boxShadow:'0 2px 12px rgba(34,197,94,0.12)'}}>
                          <div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${G},#86efac)`}}/>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                            <span style={{fontSize:9,padding:'3px 8px',borderRadius:99,background:G,color:'#fff',fontWeight:800,letterSpacing:0.5}}>OPEN NOW</span>
                            <button onClick={e=>{e.stopPropagation();doSaveR(r.id);}} style={{background:'none',border:'none',cursor:'pointer',fontSize:14,color:isSaved?'#f59e0b':'rgba(0,0,0,0.2)',padding:0,lineHeight:1}}>{isSaved?'★':'☆'}</button>
                          </div>
                          <div style={{fontWeight:800,fontSize:14,color:'#1a1a1a',marginBottom:2,lineHeight:1.2}}>{r.name}</div>
                          <div style={{fontSize:10,color:'#15803d',marginBottom:8,fontWeight:600}}>{r.neighborhood}</div>
                          {(r.deals||[]).slice(0,2).map((d,i)=>(
                            <div key={i} style={{fontSize:10,color:'#166534',marginBottom:2,display:'flex',alignItems:'center',gap:3}}>
                              <span>🍺</span><span style={{fontWeight:500,lineHeight:1.3}}>{d}</span>
                            </div>
                          ))}
                          <div style={{marginTop:10,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                            {closing?<span style={{fontSize:9,padding:'2px 6px',borderRadius:99,background:'#fef3c7',color:'#92400e',fontWeight:700}}>⏰ {closing}</span>:<span style={{fontSize:9,color:'#15803d',fontWeight:600}}>Until {r.time.split('-')[1]?.trim()}</span>}
                            {checked?<span style={{fontSize:9,color:G,fontWeight:800}}>✓ In</span>:<button onClick={e=>{e.stopPropagation();doCheckin(r.id);}} style={{fontSize:9,padding:'4px 8px',borderRadius:99,background:G,color:'#fff',border:'none',cursor:'pointer',fontWeight:800}}>Check in</button>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ):(
                <div style={{background:'linear-gradient(135deg,#1a1a1a,#2a2a2a)',borderRadius:20,padding:'20px',marginBottom:4,display:'flex',alignItems:'center',gap:14}}>
                  <div style={{fontSize:32}}>🌙</div>
                  <div>
                    <div style={{fontSize:15,fontWeight:700,color:'#fff',marginBottom:3}}>No happy hours right now</div>
                    <div style={{fontSize:12,color:'#888',lineHeight:1.4}}>Most run Mon–Fri 3–7pm. Come back then!</div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{display:'flex',gap:8,marginBottom:12,flexWrap:'wrap'}}>
            <div style={{flex:1,minWidth:160,position:'relative'}}>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bars, neighborhoods..." style={{width:'100%',padding:'10px 12px 10px 36px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:13,background:'#fff',color:'#1a1a1a'}}/>
              <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontSize:14,color:'#ccc'}}>🔍</span>
            </div>
            <button onClick={()=>setOpenNowF(!openNowF)} style={{padding:'10px 14px',fontSize:12,borderRadius:12,border:`2px solid ${openNowF?G:'#e5e5e5'}`,background:openNowF?G:'#fff',color:openNowF?'#fff':'#666',cursor:'pointer',fontWeight:600,transition:'all 0.2s',whiteSpace:'nowrap'}}>🟢 Open now</button>
            <select value={cuisineF} onChange={e=>setCuisineF(e.target.value)} style={{padding:'10px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:12,background:'#fff',color:'#555'}}>
              <option value="">All cuisines</option>
              {['American','Mexican','Italian','Asian','Bar & Grill','Seafood','Other'].map(c=><option key={c}>{c}</option>)}
            </select>
            <select value={dayF} onChange={e=>setDayF(e.target.value)} style={{padding:'10px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:12,background:'#fff',color:'#555'}}>
              <option value="">Any day</option>
              {DAYS.map(d=><option key={d}>{d}</option>)}
            </select>
          </div>

          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
            {NEIGHBORHOODS.map(n=>{
              const count=n==='All'?restaurants.length:(neighborhoodCounts[n]||0);
              const active=neighborhoodF===n;
              if(n!=='All'&&count===0)return null;
              return(
                <button key={n} onClick={()=>setNeighborhoodF(n)} style={{padding:'6px 12px',fontSize:11,borderRadius:20,border:`1px solid ${active?G:'#e5e5e5'}`,background:active?G:'#fff',color:active?'#fff':'#666',cursor:'pointer',fontWeight:active?600:400,transition:'all 0.15s',display:'flex',alignItems:'center',gap:4}}>
                  {n}<span style={{fontSize:10,background:active?'rgba(255,255,255,0.3)':'#f0f0f0',color:active?'#fff':'#aaa',borderRadius:99,padding:'1px 5px'}}>{count}</span>
                </button>
              );
            })}
          </div>

          {(neighborhoodF!=='All'||openNowF||search)&&(
            <div style={{marginBottom:12,fontSize:12,color:'#888',display:'flex',alignItems:'center',gap:8}}>
              <span>{filtered.length} spot{filtered.length!==1?'s':''} found</span>
              <button onClick={()=>{setNeighborhoodF('All');setOpenNowF(false);setSearch('');}} style={{fontSize:11,color:G,background:'none',border:'none',cursor:'pointer',fontWeight:700}}>Clear</button>
            </div>
          )}

          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:12}}>
            {filtered.map(r=>{
              const active=isActive(r);
              const closing=active?timeUntilClose(r):null;
              const a=avgRating(r.reviews);
              const checked=dbCheckins.some(c=>c.restaurant_id===String(r.id)&&new Date(c.checked_in_at).toDateString()===todayDate);
              const ur=dbRatings[String(r.id)]||0;
              const isSaved=dbSaved.includes(String(r.id));
              return(
                <div key={r.id} onClick={()=>{setDetailTarget(r);setDetailTab('deals');}} style={{background:'#fff',borderRadius:18,padding:'16px',border:'1px solid #eee',cursor:'pointer',position:'relative',overflow:'hidden',boxShadow:'0 1px 4px rgba(0,0,0,0.04)'}}>
                  {active&&<div style={{position:'absolute',top:0,left:0,right:0,height:3,background:`linear-gradient(90deg,${G},#86efac)`}}/>}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
                    <div style={{flex:1,paddingRight:8}}>
                      <div style={{fontWeight:700,fontSize:14,color:'#1a1a1a',lineHeight:1.2}}>{r.name}{r.isNew&&<span style={{marginLeft:6,fontSize:9,background:'#fef9c3',color:'#92400e',padding:'2px 6px',borderRadius:99,fontWeight:700}}>NEW</span>}</div>
                      <div style={{fontSize:11,color:'#bbb',marginTop:2}}>{r.cuisine} · {r.neighborhood}</div>
                    </div>
                    <button onClick={e=>{e.stopPropagation();doSaveR(r.id);}} style={{background:'none',border:'none',cursor:'pointer',fontSize:16,color:isSaved?'#f59e0b':'#e8e8e8',padding:0,flexShrink:0,lineHeight:1}}>{isSaved?'★':'☆'}</button>
                  </div>
                  <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:10}}>
                    {active?<span style={{fontSize:10,padding:'3px 8px',borderRadius:99,background:'#dcfce7',color:'#15803d',fontWeight:700}}>🟢 Open</span>:<span style={{fontSize:10,padding:'3px 8px',borderRadius:99,background:'#f5f5f5',color:'#aaa'}}>⏰ {r.time}</span>}
                    {closing&&<span style={{fontSize:10,padding:'3px 8px',borderRadius:99,background:'#fef3c7',color:'#92400e',fontWeight:600}}>{closing}</span>}
                    {(r.deals||[]).slice(0,1).map((d,i)=><span key={i} style={{fontSize:10,padding:'3px 8px',borderRadius:99,background:'#f0fdf4',color:'#15803d',fontWeight:500}}>{d}</span>)}
                  </div>
                  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                    <div style={{display:'flex',alignItems:'center',gap:2}}>
                      {[1,2,3,4,5].map(star=><span key={star} onClick={e=>{e.stopPropagation();doRate(r.id,star);}} style={{cursor:'pointer',fontSize:13,color:ur>=star?'#f59e0b':'#e8e8e8',lineHeight:1}}>★</span>)}
                      {a>0&&<span style={{fontSize:10,color:'#bbb',marginLeft:2}}>{a.toFixed(1)}</span>}
                    </div>
                    <div style={{display:'flex',gap:5}}>
                      {checked?<span style={{fontSize:10,color:G,fontWeight:700}}>✓ In</span>:<button onClick={e=>{e.stopPropagation();doCheckin(r.id);}} style={{fontSize:10,padding:'4px 10px',borderRadius:99,background:'#dcfce7',color:'#15803d',border:'none',cursor:'pointer',fontWeight:700}}>Check in</button>}
                      <button onClick={e=>{e.stopPropagation();shareRestaurant(r);}} style={{fontSize:10,padding:'4px 8px',borderRadius:99,background:'#f0f4ff',color:'#4f46e5',border:'none',cursor:'pointer'}}>Share</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length===0&&(
              <div style={{textAlign:'center',padding:'4rem 2rem',color:'#aaa',gridColumn:'1/-1'}}>
                <div style={{fontSize:40,marginBottom:12}}>🍺</div>
                <div style={{fontSize:16,fontWeight:700,color:'#555',marginBottom:6}}>No spots found</div>
                <button onClick={()=>{setNeighborhoodF('All');setOpenNowF(false);setSearch('');setCuisineF('');setDayF('');}} style={{fontSize:13,padding:'10px 20px',borderRadius:99,background:'#1a1a1a',color:'#fff',border:'none',cursor:'pointer',fontWeight:700}}>Clear all filters</button>
              </div>
            )}
          </div>
        </>
      )}

      {tab==='feed'&&(
        <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #eee'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid #f5f5f5',fontSize:14,fontWeight:800,color:'#1a1a1a'}}>Activity Feed</div>
          {feed.length===0&&<div style={{padding:'4rem',textAlign:'center',color:'#aaa'}}><div style={{fontSize:36,marginBottom:8}}>📣</div>No activity yet. Check in somewhere!</div>}
          {feed.map((f,i)=>{
            const color=avatarColor(f.author||'A');
            return(
              <div key={i} style={{display:'flex',gap:12,padding:'12px 16px',borderBottom:'1px solid #f9f9f9'}}>
                <div style={{width:38,height:38,borderRadius:'50%',background:color+'22',color,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:800,flexShrink:0}}>{initials(f.author||'G')}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:3,flexWrap:'wrap'}}>
                    <span style={{fontSize:10,padding:'2px 8px',borderRadius:99,background:f.type==='ci'?'#dcfce7':f.type==='rv'?'#eff6ff':'#f5f5f5',color:f.type==='ci'?'#15803d':f.type==='rv'?'#1d4ed8':'#888',fontWeight:700}}>{f.type==='ci'?'Check-in':f.type==='rv'?'Review':'New spot'}</span>
                    <span style={{fontSize:13,fontWeight:700,color:'#1a1a1a'}}>{f.author}</span>
                    <span style={{fontSize:12,color:'#888'}}>@ {f.rname}</span>
                  </div>
                  {f.type==='rv'&&<div style={{fontSize:12,color:'#666',fontStyle:'italic'}}>"{(f.text||'').slice(0,100)}"</div>}
                  <div style={{fontSize:10,color:'#ccc',marginTop:3}}>{f.date}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab==='leaderboard'&&(
        <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #eee'}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid #f5f5f5',fontSize:14,fontWeight:800,color:'#1a1a1a'}}>🏆 Top Restaurants</div>
          <div style={{display:'grid',gridTemplateColumns:'44px 1fr 52px 60px 56px',padding:'8px 16px',borderBottom:'1px solid #f5f5f5',fontSize:10,color:'#ccc',fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>
            <span>#</span><span>Restaurant</span><span style={{textAlign:'center'}}>⭐</span><span style={{textAlign:'center'}}>Check-ins</span><span style={{textAlign:'center'}}>Score</span>
          </div>
          {ranked.slice(0,15).map((r,i)=>{
            const a=avgRating(r.reviews);
            const ci=(r.checkins||[]).length;
            const score=Math.round(a*60+ci*40+(r.reviews||[]).length*20);
            const medal=i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1);
            return(
              <div key={r.id} onClick={()=>{setDetailTarget(r);setDetailTab('deals');}} style={{display:'grid',gridTemplateColumns:'44px 1fr 52px 60px 56px',padding:'10px 16px',borderBottom:'1px solid #f9f9f9',cursor:'pointer',alignItems:'center'}}>
                <span style={{fontSize:i<3?18:11,textAlign:'center',color:'#ccc',fontWeight:700}}>{medal}</span>
                <div><div style={{fontSize:13,fontWeight:700,color:'#1a1a1a'}}>{r.name}</div><div style={{fontSize:10,color:'#bbb'}}>{r.neighborhood}</div></div>
                <span style={{textAlign:'center',fontSize:12,color:'#f59e0b',fontWeight:700}}>{a?a.toFixed(1):'-'}</span>
                <span style={{textAlign:'center',fontSize:12,color:'#666'}}>{ci}</span>
                <span style={{textAlign:'center',fontSize:13,fontWeight:800,color:G}}>{score||'-'}</span>
              </div>
            );
          })}
        </div>
      )}

      {tab==='profile'&&(
        <div>
          {!authUser?(
            <div style={{background:'#fff',borderRadius:24,padding:36,textAlign:'center',border:'1px solid #eee'}}>
              <div style={{width:80,height:80,borderRadius:'50%',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:36,margin:'0 auto 16px'}}>🍺</div>
              <div style={{fontWeight:800,fontSize:24,marginBottom:8,color:'#1a1a1a'}}>Join the community</div>
              <div style={{fontSize:14,color:'#888',marginBottom:24,lineHeight:1.6,maxWidth:280,margin:'0 auto 24px'}}>Track every happy hour, earn badges, and save your favorite spots — free forever.</div>
              <button onClick={()=>setShowAuth(true)} style={{padding:'14px 36px',fontSize:15,borderRadius:99,border:'none',background:G,color:'#fff',cursor:'pointer',fontWeight:800}}>Create free account</button>
            </div>
          ):(
            <div>
              {/* BLACK CARD FOR FOUNDERS */}
              {isFounder&&<BlackCard username={displayName.toUpperCase()} memberNumber={profile?.member_number||1}/>}

              {/* FOUNDER PERKS */}
              {isFounder&&(
                <div style={{background:'linear-gradient(135deg,#0a0a0a,#1a1a1a)',borderRadius:20,padding:20,marginBottom:12,border:`1px solid rgba(212,175,55,0.25)`}}>
                  <div style={{fontSize:10,color:GOLD,fontWeight:700,letterSpacing:3,textTransform:'uppercase',marginBottom:12}}>Centurion Member Perks</div>
                  {[
                    {icon:'🎉',title:'Exclusive Events',desc:'Personal invitations to private happy hour events with Ryan'},
                    {icon:'⭐',title:'Early Access',desc:'First to see new restaurants and features before anyone else'},
                    {icon:'🏆',title:'Lifetime Premium',desc:'Free premium membership forever when paid features launch'},
                    {icon:'💬',title:'Founding Member Group',desc:'Private community with direct access to the founder'},
                    {icon:'🎯',title:'Shape the App',desc:'Your feedback directly influences what gets built next'},
                  ].map((perk,i)=>(
                    <div key={i} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:i<4?`1px solid rgba(212,175,55,0.1)`:'none'}}>
                      <span style={{fontSize:20,flexShrink:0}}>{perk.icon}</span>
                      <div>
                        <div style={{fontSize:13,fontWeight:700,color:'#fff',marginBottom:2}}>{perk.title}</div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{perk.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{background:'#fff',borderRadius:20,padding:20,marginBottom:12,border:'1px solid #eee'}}>
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:16}}>
                  <div style={{width:64,height:64,borderRadius:'50%',background:isFounder?'linear-gradient(135deg,#1a1a1a,#2a2a2a)':'#dcfce7',color:isFounder?GOLD:'#15803d',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,fontWeight:800,flexShrink:0,border:isFounder?`2px solid rgba(212,175,55,0.4)`:'none',boxShadow:isFounder?`0 4px 16px rgba(212,175,55,0.2)`:''}}>{initials(displayName)}</div>
                  <div style={{flex:1}}>
                    <div style={{display:'flex',alignItems:'center',gap:8}}>
                      <div style={{fontWeight:800,fontSize:20,color:'#1a1a1a'}}>{displayName}</div>
                      {isFounder&&<span style={{fontSize:9,padding:'2px 8px',borderRadius:99,background:'#1a1a1a',color:GOLD,fontWeight:700,letterSpacing:1}}>CENTURION</span>}
                    </div>
                    <div style={{fontSize:11,color:'#bbb',marginTop:2}}>{authUser.email}</div>
                    <div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>
                      <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:isFounder?'#1a1a1a':'#dcfce7',color:isFounder?GOLD:'#15803d',fontWeight:700,border:isFounder?`1px solid rgba(212,175,55,0.3)`:'none'}}>Level {level}</span>
                      <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:'#eff6ff',color:'#1d4ed8',fontWeight:500}}>{profile?.xp||0} XP</span>
                      <span style={{fontSize:11,padding:'3px 10px',borderRadius:99,background:'#fef9c3',color:'#92400e',fontWeight:500}}>{earnedBadges.length}/{BADGES.length} badges</span>
                    </div>
                  </div>
                </div>
                <div style={{background:'#f0f0f0',borderRadius:99,height:6,marginBottom:4}}>
                  <div style={{background:isFounder?`linear-gradient(90deg,${GOLD},#f5d770)`:G,borderRadius:99,height:6,width:Math.round(prog/200*100)+'%',transition:'width 0.6s'}}/>
                </div>
                <div style={{fontSize:10,color:'#ccc',textAlign:'right',marginBottom:16}}>{prog}/200 XP to Level {level+1}</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {[{n:dbCheckins.length,l:'Check-ins',icon:'📍'},{n:reviewCount,l:'Reviews',icon:'✍️'},{n:Object.keys(dbRatings).length,l:'Rated',icon:'⭐'}].map(stat=>(
                    <div key={stat.l} style={{background:'#f8f8f8',borderRadius:14,padding:'12px 8px',textAlign:'center'}}>
                      <div style={{fontSize:18,marginBottom:3}}>{stat.icon}</div>
                      <div style={{fontSize:22,fontWeight:800,color:'#1a1a1a'}}>{stat.n}</div>
                      <div style={{fontSize:10,color:'#bbb',fontWeight:500}}>{stat.l}</div>
                    </div>
                  ))}
                </div>
              </div>

              {nextBadge&&!isFounder&&(
                <div style={{background:'#fff',borderRadius:16,padding:'14px 16px',marginBottom:12,border:'1px solid #eee',display:'flex',alignItems:'center',gap:12}}>
                  <span style={{fontSize:32,filter:'grayscale(1)',opacity:0.25}}>{nextBadge.icon}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:10,color:'#bbb',fontWeight:700,textTransform:'uppercase',letterSpacing:0.5,marginBottom:2}}>Next badge</div>
                    <div style={{fontSize:15,fontWeight:700,color:'#555'}}>{nextBadge.name}</div>
                    <div style={{fontSize:12,color:'#bbb'}}>{nextBadge.desc}</div>
                  </div>
                </div>
              )}

              <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:12,border:'1px solid #eee'}}>
                <div style={{fontSize:14,fontWeight:800,color:'#1a1a1a',marginBottom:12}}>Badges ({earnedBadges.length}/{BADGES.length})</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(88px,1fr))',gap:8}}>
                  {BADGES.map(b=>{
                    const earned=earnedBadges.find(e=>e.id===b.id);
                    const isBlackCard=b.id==='founding_member';
                    return(
                      <div key={b.id} style={{background:earned?(isBlackCard?'linear-gradient(135deg,#0a0a0a,#1a1a1a)':'#f0fdf4'):'#fafafa',border:`1px solid ${earned?(isBlackCard?'rgba(212,175,55,0.4)':'#86efac'):'#f0f0f0'}`,borderRadius:14,padding:'10px 6px',textAlign:'center',opacity:earned?1:0.3,boxShadow:earned&&isBlackCard?`0 4px 16px rgba(212,175,55,0.2)`:'',position:'relative',overflow:'hidden'}}>
                        {earned&&isBlackCard&&<div style={{position:'absolute',bottom:0,left:0,right:0,height:2,background:`linear-gradient(90deg,transparent,${GOLD},transparent)`}}/>}
                        <div style={{fontSize:22,marginBottom:3}}>{isBlackCard?'🖤':b.icon}</div>
                        <div style={{fontSize:9,fontWeight:700,color:earned?(isBlackCard?GOLD:'#15803d'):'#aaa',textTransform:'uppercase',letterSpacing:0.3,lineHeight:1.2}}>{b.name}</div>
                        {earned&&isBlackCard&&<div style={{fontSize:8,color:'rgba(212,175,55,0.6)',marginTop:2,fontWeight:600,letterSpacing:0.5}}>CENTURION</div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #eee',marginBottom:12}}>
                <div style={{padding:'12px 16px',borderBottom:'1px solid #f5f5f5',fontSize:13,fontWeight:800,color:'#1a1a1a'}}>📍 Recent check-ins</div>
                {dbCheckins.length===0&&<div style={{padding:'20px',fontSize:13,color:'#bbb',textAlign:'center'}}>No check-ins yet!</div>}
                {dbCheckins.slice(-5).reverse().map((c,i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 16px',borderBottom:'1px solid #f9f9f9'}}>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:'#1a1a1a'}}>{c.restaurant_name}</div>
                      <div style={{fontSize:10,color:'#bbb'}}>{c.neighborhood}</div>
                    </div>
                    <span style={{color:'#ccc',fontSize:11}}>{new Date(c.checked_in_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>

              <div style={{background:'#fff',borderRadius:16,overflow:'hidden',border:'1px solid #eee'}}>
                <div style={{padding:'12px 16px',borderBottom:'1px solid #f5f5f5',fontSize:13,fontWeight:800,color:'#1a1a1a'}}>⚡ XP Guide</div>
                {[['📍 Check in at a bar','50 XP'],['✍️ Write a review','20 XP'],['➕ Add a restaurant','25 XP'],['⭐ Rate a bar','10 XP']].map(([a,x])=>(
                  <div key={a} style={{display:'flex',justifyContent:'space-between',padding:'10px 16px',borderBottom:'1px solid #f9f9f9',fontSize:13}}>
                    <span style={{color:'#555'}}>{a}</span>
                    <span style={{fontWeight:800,color:isFounder?GOLD:G}}>{x}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* DETAIL MODAL */}
      {detailTarget&&(()=>{
        const r=restaurants.find(x=>x.id===detailTarget.id)||detailTarget;
        const active=isActive(r);
        const closing=active?timeUntilClose(r):null;
        const a=avgRating(r.reviews||[]);
        const checked=dbCheckins.some(c=>c.restaurant_id===String(r.id)&&new Date(c.checked_in_at).toDateString()===todayDate);
        const ur=dbRatings[String(r.id)]||0;
        const isSaved=dbSaved.includes(String(r.id));
        const mapsUrl=`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.name+' '+r.address+' Chicago IL')}`;
        return(
          <div onClick={e=>{if(e.target===e.currentTarget)setDetailTarget(null);}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'flex-end',justifyContent:'center',zIndex:1000}}>
            <div style={{background:'#f7f7f8',borderRadius:'24px 24px 0 0',width:'min(640px,100%)',maxHeight:'93vh',overflowY:'auto',paddingBottom:40}}>
              <div style={{width:40,height:4,background:'#ddd',borderRadius:2,margin:'12px auto 0'}}/>
              <div style={{background:active?'linear-gradient(145deg,#f0fdf4,#dcfce7)':'#fff',margin:'12px 16px 0',borderRadius:20,padding:'20px',border:`1px solid ${active?'#bbf7d0':'#eee'}`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                  <div style={{flex:1,paddingRight:12}}>
                    <div style={{fontSize:24,fontWeight:900,color:'#1a1a1a',lineHeight:1.1,letterSpacing:-0.5}}>{r.name}</div>
                    <div style={{fontSize:12,color:'#888',marginTop:4}}>{r.cuisine} · {r.neighborhood} · {r.address}</div>
                    {r.description&&<div style={{fontSize:12,color:'#666',marginTop:8,lineHeight:1.6,padding:'8px 12px',background:'rgba(0,0,0,0.04)',borderRadius:8}}>{r.description}</div>}
                  </div>
                  <button onClick={()=>setDetailTarget(null)} style={{background:'rgba(0,0,0,0.08)',border:'none',borderRadius:'50%',width:34,height:34,cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>✕</button>
                </div>
                <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
                  <span style={{fontSize:11,padding:'4px 10px',borderRadius:99,background:active?G:'#e5e5e5',color:active?'#fff':'#888',fontWeight:700}}>{active?'🟢 Open now':'⚫ Closed'}</span>
                  {closing&&<span style={{fontSize:11,padding:'4px 10px',borderRadius:99,background:'#fef3c7',color:'#92400e',fontWeight:700}}>⏰ {closing}</span>}
                  <span style={{fontSize:11,padding:'4px 10px',borderRadius:99,background:'rgba(0,0,0,0.06)',color:'#666'}}>⏰ {r.time}</span>
                  {a>0&&<span style={{fontSize:11,padding:'4px 10px',borderRadius:99,background:'#fff7ed',color:'#c2410c',border:'1px solid #fed7aa',fontWeight:600}}>★ {a.toFixed(1)} ({r.reviews?.length})</span>}
                </div>
                <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                  {checked?<div style={{fontSize:12,padding:'9px 16px',borderRadius:99,background:'#dcfce7',color:'#15803d',fontWeight:700,display:'flex',alignItems:'center',gap:4}}>✓ Checked in today</div>:<button onClick={()=>doCheckin(r.id)} style={{fontSize:13,padding:'9px 16px',borderRadius:99,background:G,color:'#fff',border:'none',cursor:'pointer',fontWeight:800}}>📍 Check in +50xp</button>}
                  <button onClick={()=>doSaveR(r.id)} style={{fontSize:12,padding:'9px 14px',borderRadius:99,background:isSaved?'#fef9c3':'#f5f5f5',color:isSaved?'#92400e':'#555',border:'none',cursor:'pointer',fontWeight:600}}>{isSaved?'★ Saved':'☆ Save'}</button>
                  <button onClick={()=>shareRestaurant(r)} style={{fontSize:12,padding:'9px 14px',borderRadius:99,background:'#eff6ff',color:'#4f46e5',border:'none',cursor:'pointer',fontWeight:600}}>↗ Share</button>
                  <button onClick={()=>{if(!authUser){setShowAuth(true);return;}setReviewTarget(r);setShowReview(true);setDetailTarget(null);}} style={{fontSize:12,padding:'9px 14px',borderRadius:99,background:'#f5f5f5',color:'#555',border:'none',cursor:'pointer',fontWeight:600}}>✍️ Review</button>
                </div>
              </div>

              <div style={{display:'flex',gap:6,padding:'12px 16px 0',overflowX:'auto',scrollbarWidth:'none'}}>
                {[['deals','🍺 Deals'],['menu','🍽️ Menu'],['hours','📅 Hours'],['location','📍 Location'],['reviews','⭐ Reviews']].map(([t,label])=>(
                  <button key={t} onClick={()=>setDetailTab(t)} style={{padding:'7px 14px',fontSize:12,borderRadius:99,border:`1px solid ${detailTab===t?'#1a1a1a':'#e5e5e5'}`,background:detailTab===t?'#1a1a1a':'#fff',color:detailTab===t?'#fff':'#666',cursor:'pointer',fontWeight:detailTab===t?700:400,whiteSpace:'nowrap',transition:'all 0.15s'}}>{label}</button>
                ))}
              </div>

              <div style={{padding:'12px 16px 0'}}>
                {detailTab==='deals'&&(
                  <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #eee'}}>
                    <div style={{fontSize:14,fontWeight:800,color:'#1a1a1a',marginBottom:12}}>Happy Hour Specials</div>
                    <div style={{display:'grid',gap:8}}>
                      {(r.deals||[]).map((d,i)=>(
                        <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'12px 14px',background:'linear-gradient(135deg,#f0fdf4,#dcfce7)',borderRadius:14,border:'1px solid #bbf7d0'}}>
                          <span style={{fontSize:22,flexShrink:0}}>🍺</span>
                          <span style={{fontSize:14,color:'#15803d',fontWeight:700}}>{d}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:12,padding:'10px 14px',background:'#f8f8f8',borderRadius:10,fontSize:12,color:'#888'}}>
                      ⏰ <strong style={{color:'#555'}}>{r.time}</strong> · {(r.days||[]).join(', ')}
                    </div>
                  </div>
                )}
                {detailTab==='menu'&&(
                  <div>
                    {r.menu?.drinks?.length>0&&(
                      <div style={{background:'#fff',borderRadius:16,padding:16,marginBottom:10,border:'1px solid #eee'}}>
                        <div style={{fontSize:14,fontWeight:800,color:'#1a1a1a',marginBottom:12}}>🍹 Drinks</div>
                        {r.menu.drinks.map((item,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:i<r.menu.drinks.length-1?'1px solid #f5f5f5':'none'}}>
                            <span style={{fontSize:16,flexShrink:0}}>🍹</span>
                            <span style={{fontSize:13,color:'#333',fontWeight:500}}>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {r.menu?.food?.length>0&&(
                      <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #eee'}}>
                        <div style={{fontSize:14,fontWeight:800,color:'#1a1a1a',marginBottom:12}}>🍽️ Food</div>
                        {r.menu.food.map((item,i)=>(
                          <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'9px 0',borderBottom:i<r.menu.food.length-1?'1px solid #f5f5f5':'none'}}>
                            <span style={{fontSize:16,flexShrink:0}}>🍽️</span>
                            <span style={{fontSize:13,color:'#333',fontWeight:500}}>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(!r.menu?.drinks?.length&&!r.menu?.food?.length)&&(
                      <div style={{background:'#fff',borderRadius:16,padding:32,textAlign:'center',color:'#aaa',border:'1px solid #eee'}}>
                        <div style={{fontSize:28,marginBottom:8}}>🍽️</div>
                        <div style={{fontSize:13}}>Full menu not yet available</div>
                      </div>
                    )}
                  </div>
                )}
                {detailTab==='hours'&&(
                  <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #eee'}}>
                    <div style={{fontSize:14,fontWeight:800,color:'#1a1a1a',marginBottom:12}}>Schedule</div>
                    <div style={{display:'flex',gap:5,marginBottom:14}}>
                      {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d=>{
                        const on=(r.days||[]).includes(d);const isToday=d===today;
                        return(<div key={d} style={{flex:1,height:42,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,background:on?(isToday?G:'#f0fdf4'):'#f5f5f5',color:on?(isToday?'#fff':'#15803d'):'#ccc',border:`1px solid ${on?(isToday?G:'#dcfce7'):'#eee'}`,textTransform:'uppercase',letterSpacing:0.3}}>{d.slice(0,2)}</div>);
                      })}
                    </div>
                    <div style={{padding:'12px 14px',background:'#f0fdf4',borderRadius:12,fontSize:14,color:'#15803d',fontWeight:700,display:'flex',alignItems:'center',gap:8,marginBottom:10}}>⏰ {r.time}</div>
                    <div style={{padding:'10px 14px',background:'#f8f8f8',borderRadius:10,fontSize:12,color:'#888'}}>Today is <strong style={{color:'#555'}}>{today}</strong> — {active?<span style={{color:G,fontWeight:700}}>happy hour is happening now! 🎉</span>:<span>not currently active.</span>}</div>
                    <div style={{marginTop:14}}>
                      <div style={{fontSize:12,color:'#bbb',marginBottom:8,fontWeight:600}}>Rate this place</div>
                      <div style={{display:'flex',gap:6}}>{[1,2,3,4,5].map(star=>(<span key={star} onClick={()=>doRate(r.id,star)} style={{cursor:'pointer',fontSize:30,color:ur>=star?'#f59e0b':'#e8e8e8',lineHeight:1}}>★</span>))}{ur>0&&<span style={{fontSize:12,color:'#aaa',alignSelf:'center',marginLeft:4}}>You rated {ur}★</span>}</div>
                    </div>
                  </div>
                )}
                {detailTab==='location'&&(
                  <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #eee'}}>
                    <div style={{fontSize:14,fontWeight:800,color:'#1a1a1a',marginBottom:12}}>Location</div>
                    <div style={{fontSize:15,color:'#1a1a1a',marginBottom:4,fontWeight:700}}>{r.name}</div>
                    <div style={{fontSize:13,color:'#888',marginBottom:16}}>{r.address}, Chicago, IL</div>
                    <div style={{fontSize:12,color:'#aaa',marginBottom:14,padding:'10px 12px',background:'#f8f8f8',borderRadius:10,display:'flex',alignItems:'center',gap:6}}><span>📍</span><span>{r.neighborhood} neighborhood</span></div>
                    <a href={mapsUrl} target="_blank" rel="noreferrer" onClick={e=>e.stopPropagation()} style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,fontSize:14,padding:'14px',borderRadius:14,background:'#1d4ed8',color:'#fff',textDecoration:'none',fontWeight:700}}>🗺️ Open in Google Maps</a>
                  </div>
                )}
                {detailTab==='reviews'&&(
                  <div style={{background:'#fff',borderRadius:16,padding:16,border:'1px solid #eee'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
                      <div style={{fontSize:14,fontWeight:800,color:'#1a1a1a'}}>Reviews ({(r.reviews||[]).length})</div>
                      <button onClick={()=>{if(!authUser){setShowAuth(true);return;}setReviewTarget(r);setShowReview(true);setDetailTarget(null);}} style={{fontSize:12,padding:'8px 14px',borderRadius:99,background:G,color:'#fff',border:'none',cursor:'pointer',fontWeight:700}}>Write +20xp</button>
                    </div>
                    {(r.reviews||[]).length===0&&<div style={{textAlign:'center',padding:'24px 0',color:'#aaa'}}><div style={{fontSize:28,marginBottom:6}}>✍️</div><div style={{fontSize:13}}>No reviews yet — be the first!</div></div>}
                    {(r.reviews||[]).map(rv=>(
                      <div key={rv.id} style={{background:'#f9f9f9',borderRadius:14,padding:'12px',marginBottom:8}}>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                          <div style={{width:32,height:32,borderRadius:'50%',background:avatarColor(rv.author)+'22',color:avatarColor(rv.author),display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:800}}>{initials(rv.author)}</div>
                          <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700,color:'#1a1a1a'}}>{rv.author}</div>{rv.stars&&<div style={{color:'#f59e0b',fontSize:11}}>{'★'.repeat(rv.stars)}{'☆'.repeat(5-rv.stars)}</div>}</div>
                          <span style={{fontSize:10,color:'#ccc'}}>{rv.date}</span>
                        </div>
                        <div style={{fontSize:13,color:'#444',lineHeight:1.6}}>{rv.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {showReview&&reviewTarget&&(
        <div onClick={e=>{if(e.target===e.currentTarget){setShowReview(false);setReviewForm({stars:5,text:''});}}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1001,padding:16}}>
          <div style={{background:'#fff',borderRadius:24,padding:28,width:'min(460px,100%)'}}>
            <h2 style={{fontSize:20,fontWeight:900,marginBottom:4,color:'#1a1a1a'}}>Write a review</h2>
            <p style={{fontSize:13,color:'#aaa',marginBottom:20}}>{reviewTarget.name}</p>
            <div style={{display:'flex',gap:8,marginBottom:20,justifyContent:'center'}}>{[1,2,3,4,5].map(star=><span key={star} onClick={()=>setReviewForm(f=>({...f,stars:star}))} style={{fontSize:44,cursor:'pointer',color:reviewForm.stars>=star?'#f59e0b':'#e8e8e8',lineHeight:1}}>★</span>)}</div>
            <textarea value={reviewForm.text} onChange={e=>setReviewForm(f=>({...f,text:e.target.value}))} placeholder="How were the deals? Atmosphere? Worth going back?" style={{width:'100%',padding:'12px',borderRadius:14,border:'1px solid #e5e5e5',fontSize:13,height:110,resize:'vertical',marginBottom:20,lineHeight:1.6,color:'#1a1a1a'}}/>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>{setShowReview(false);setReviewForm({stars:5,text:''});}} style={{padding:'11px 20px',fontSize:13,borderRadius:99,border:'1px solid #e5e5e5',background:'none',cursor:'pointer',color:'#888'}}>Cancel</button>
              <button onClick={submitReview} style={{padding:'11px 22px',fontSize:13,borderRadius:99,border:'none',background:G,color:'#fff',cursor:'pointer',fontWeight:800}}>Post +20xp</button>
            </div>
          </div>
        </div>
      )}

      {showAdd&&(
        <div onClick={e=>{if(e.target===e.currentTarget)setShowAdd(false);}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1001,padding:16}}>
          <div style={{background:'#fff',borderRadius:24,padding:24,width:'min(460px,100%)',maxHeight:'90vh',overflowY:'auto'}}>
            <h2 style={{fontSize:20,fontWeight:900,marginBottom:4,color:'#1a1a1a'}}>Add a happy hour spot</h2>
            <p style={{fontSize:13,color:'#aaa',marginBottom:20}}>Know a great deal? Add it!</p>
            {[{label:'Restaurant name',key:'name',ph:'e.g. The Violet Hour'},{label:'Address',key:'address',ph:'1520 N Damen Ave'},{label:'Happy hour time',key:'time',ph:'4-7 PM'},{label:'Days open',key:'days',ph:'Mon-Fri'}].map(f=>(
              <div key={f.key} style={{marginBottom:12}}>
                <label style={{fontSize:11,color:'#aaa',display:'block',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>{f.label}</label>
                <input value={addForm[f.key]} onChange={e=>setAddForm(x=>({...x,[f.key]:e.target.value}))} placeholder={f.ph} style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:13,color:'#1a1a1a'}}/>
              </div>
            ))}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,color:'#aaa',display:'block',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Neighborhood</label>
              <select value={addForm.neighborhood} onChange={e=>setAddForm(x=>({...x,neighborhood:e.target.value}))} style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:13,background:'#fff',color:'#1a1a1a'}}>
                {NEIGHBORHOODS.filter(n=>n!=='All').map(n=><option key={n}>{n}</option>)}
              </select>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,color:'#aaa',display:'block',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Cuisine type</label>
              <select value={addForm.cuisine} onChange={e=>setAddForm(x=>({...x,cuisine:e.target.value}))} style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:13,background:'#fff',color:'#1a1a1a'}}>
                {['American','Mexican','Italian','Asian','Bar & Grill','Seafood','Other'].map(c=><option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:11,color:'#aaa',display:'block',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Deals (one per line)</label>
              <textarea value={addForm.deals} onChange={e=>setAddForm(x=>({...x,deals:e.target.value}))} placeholder={"$4 drafts\n$6 cocktails\nHalf-off apps"} style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:13,height:90,resize:'vertical',color:'#1a1a1a'}}/>
            </div>
            <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
              <button onClick={()=>setShowAdd(false)} style={{padding:'11px 20px',fontSize:13,borderRadius:99,border:'1px solid #e5e5e5',background:'none',cursor:'pointer',color:'#888'}}>Cancel</button>
              <button onClick={submitAdd} style={{padding:'11px 22px',fontSize:13,borderRadius:99,border:'none',background:G,color:'#fff',cursor:'pointer',fontWeight:800}}>Add +25xp</button>
            </div>
          </div>
        </div>
      )}

      {showAI&&(
        <div onClick={e=>{if(e.target===e.currentTarget){setShowAI(false);setAiResults([]);}}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1001,padding:16}}>
          <div style={{background:'#fff',borderRadius:24,padding:24,width:'min(480px,100%)',maxHeight:'85vh',overflowY:'auto'}}>
            <h2 style={{fontSize:20,fontWeight:900,marginBottom:4,color:'#1a1a1a'}}>🤖 AI Search</h2>
            <p style={{fontSize:13,color:'#aaa',marginBottom:14}}>Find real Chicago happy hour deals</p>
            <input value={aiQuery} onChange={e=>setAiQuery(e.target.value)} onKeyDown={e=>e.key==='Enter'&&runAISearch()} placeholder="e.g. oyster happy hour River North" style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:13,marginBottom:10,color:'#1a1a1a'}}/>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:14}}>
              {['River North','West Loop','Wicker Park','Logan Square','Gold Coast','Edgewater'].map(n=>(
                <button key={n} onClick={()=>setAiQuery('happy hour deals '+n+' Chicago 2026')} style={{fontSize:11,padding:'5px 11px',borderRadius:99,border:'1px solid #e5e5e5',background:'#f8f8f8',cursor:'pointer',color:'#666',fontWeight:500}}>{n}</button>
              ))}
            </div>
            {aiLoading&&<div style={{padding:14,background:'#f5f5f5',borderRadius:12,fontSize:13,color:'#888',marginBottom:12,textAlign:'center'}}>🤖 Searching Chicago...</div>}
            {aiResults.length>0&&<div style={{fontSize:12,color:G,fontWeight:700,marginBottom:8}}>Found {aiResults.length} — tap to add!</div>}
            {aiResults.map((r,i)=>(
              <div key={i} onClick={()=>addFromAI(r)} style={{background:'#f9f9f9',borderRadius:14,padding:'14px',marginBottom:8,cursor:'pointer',border:'1px solid #eee'}}>
                <div style={{fontWeight:700,fontSize:14,color:'#1a1a1a',marginBottom:2}}>{r.name}</div>
                <div style={{fontSize:11,color:'#aaa',marginBottom:6}}>{r.address} · {r.time}</div>
                <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>{(r.deals||[]).slice(0,3).map((d,i)=><span key={i} style={{fontSize:10,padding:'2px 8px',borderRadius:99,background:'#f0fdf4',color:'#15803d',fontWeight:600}}>{d}</span>)}</div>
                <div style={{fontSize:10,color:G,marginTop:6,fontWeight:700}}>+ Tap to add</div>
              </div>
            ))}
            <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:14}}>
              <button onClick={()=>{setShowAI(false);setAiResults([]);}} style={{padding:'11px 20px',fontSize:13,borderRadius:99,border:'1px solid #e5e5e5',background:'none',cursor:'pointer',color:'#888'}}>Close</button>
              <button onClick={runAISearch} disabled={aiLoading} style={{padding:'11px 22px',fontSize:13,borderRadius:99,border:'none',background:G,color:'#fff',cursor:'pointer',fontWeight:800}}>{aiLoading?'Searching...':'Search'}</button>
            </div>
          </div>
        </div>
      )}

      {showAuth&&(
        <div onClick={e=>{if(e.target===e.currentTarget){setShowAuth(false);setAuthError('');}}} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1001,padding:16}}>
          <div style={{background:'#fff',borderRadius:24,padding:28,width:'min(400px,100%)'}}>
            <div style={{textAlign:'center',marginBottom:24}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'#dcfce7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:30,margin:'0 auto 14px'}}>🍺</div>
              <h2 style={{fontSize:22,fontWeight:900,marginBottom:4,color:'#1a1a1a'}}>{authMode==='login'?'Welcome back!':'Join Happy Hour Chicago'}</h2>
              <p style={{fontSize:13,color:'#aaa'}}>{authMode==='login'?'Sign in to track your visits':'Free forever. Earn XP and badges.'}</p>
            </div>
            <button onClick={signInWithGoogle} disabled={authLoading} style={{width:'100%',padding:'13px',fontSize:14,borderRadius:14,border:'1px solid #e5e5e5',background:'#fff',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:18,fontWeight:700,color:'#1a1a1a'}}>
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
              Continue with Google
            </button>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:18}}>
              <div style={{flex:1,height:1,background:'#f0f0f0'}}/><span style={{fontSize:11,color:'#ccc',fontWeight:600}}>OR</span><div style={{flex:1,height:1,background:'#f0f0f0'}}/>
            </div>
            {authMode==='signup'&&(
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:'#aaa',display:'block',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Username</label>
                <input value={authUsername} onChange={e=>setAuthUsername(e.target.value)} placeholder="ChicagoBarHopper" style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:13,color:'#1a1a1a'}}/>
              </div>
            )}
            <div style={{marginBottom:12}}>
              <label style={{fontSize:11,color:'#aaa',display:'block',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Email</label>
              <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="your@email.com" style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:13,color:'#1a1a1a'}}/>
            </div>
            <div style={{marginBottom:18}}>
              <label style={{fontSize:11,color:'#aaa',display:'block',marginBottom:4,fontWeight:700,textTransform:'uppercase',letterSpacing:0.5}}>Password</label>
              <input type="password" value={authPassword} onChange={e=>setAuthPassword(e.target.value)} placeholder="••••••••" style={{width:'100%',padding:'11px 14px',borderRadius:12,border:'1px solid #e5e5e5',fontSize:13}}/>
            </div>
            {authError&&<div style={{fontSize:12,color:'#dc2626',marginBottom:14,padding:'10px 14px',background:'#fef2f2',borderRadius:12}}>{authError}</div>}
            <button onClick={authMode==='login'?signInWithEmail:signUpWithEmail} disabled={authLoading} style={{width:'100%',padding:'13px',fontSize:14,borderRadius:14,border:'none',background:G,color:'#fff',cursor:'pointer',fontWeight:800,marginBottom:14}}>
              {authLoading?'Loading...':(authMode==='login'?'Sign in':'Create free account')}
            </button>
            <div style={{textAlign:'center',fontSize:13,color:'#aaa'}}>
              {authMode==='login'?'No account? ':'Already have one? '}
              <button onClick={()=>{setAuthMode(authMode==='login'?'signup':'login');setAuthError('');}} style={{color:G,fontWeight:800,background:'none',border:'none',cursor:'pointer',fontSize:13}}>
                {authMode==='login'?'Sign up free →':'Sign in →'}
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
