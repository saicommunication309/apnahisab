import { useState, useEffect, useMemo } from "react";

// ====== LOGIN (સાદું લૉક) ======
// ધ્યાન: આ ફાઇલમાં લખેલો પાસવર્ડ કોડ જોનાર કોઈને પણ દેખાય.
// એટલે GitHub repository હંમેશા PRIVATE રાખો.
const ADMIN_ID = "Admin01";
const ADMIN_PASS = "30092026";

// બીજું લૉગિન: સાઇટ / કર્મચારી / હાજરી / ઉપાડ સિસ્ટમ
const NV_ID = "Nitesh";
const NV_PASS = "72warnafutlo";

const DATA_KEY = "hisab-data-v3";
const AUTH_KEY = "hisab-auth-v1";

const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");
const uid = () => Math.random().toString(36).slice(2, 9);
const total = (k) => k.entries.reduce((s, e) => s + Number(e.amount || 0), 0);

// ====== શરૂઆતનો ડેટા: હિસાબ 1-380 (નોટબુક ફોટા પરથી ટાઈપ કરેલ) ======
// [નામ, ગામ, [રકમો...], નોંધ] — તારીખ વંચાઈ નથી એટલે તારીખ ખાલી છે (પછી ભરી શકાય)
// "?" વાળા નામ/ગામ અનિશ્ચિત છે, નોટબુક સાથે ચકાસવા.
const mk = (naam, gaon, amts, note = "") => {
  const id = uid();
  return {
    id,
    naam,
    gaon,
    note,
    entries: amts.map((amount, i) => ({
      id: id + "-" + i,
      amount,
      date: "",
      kiraya: false,
      vigat: "",
    })),
  };
};

const RAW = [
  ["Mahesh", "Bhagapura?", [1000, 200, 200, 1500, 1500]],
  ["Soma", "Kadkadiya?", [2000, 1150, 1100, 100, 700, 1000], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Sohay?", "Devarda?", [1500, 2020, 1350, 200, 1000, 200, 2530, 1480, 1000], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Gahit?", "Ghodapat", [700, 1000, 1000, 1000]],
  ["Rahil?", "Morvadi", [1000, 1000, 1500, 850, 200, 1000, 900, 1500, 1350], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Soma", "Dhalakad?", [1350, 1000, 1300, 900, 1000], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Sanil?", "Kadkadiya", [1300, 100, 5050, 1200, 150, 1350, 200, 1200], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Akshay", "Kadkadiya", [100, 1900, 1000, 1000, 5000, 200, 1000, 1000], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Priya?", "Ghodapat", [1000, 1230]],
  ["Pankaj?", "Kadkadiya", [800, 100, 1350, 1000, 700, 2000, 1000], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Megh?", "Bhagapura?", [2000, 1000, 200, 1000, 600, 1000, 200]],
  ["Rahil?", "Dhalakad?", [700, 1000, 1000, 1000, 2020]],
  ["Kailash", "Ghodapat", [1000, 1600, 2020, 300, 1000], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Pavan", "Morvadi", [1000, 1000, 1500, 1000, 70, 1500, 1500]],
  ["Dilip?", "Ramajeda", [2000, 1000, 1000]],
  ["Shriram", "Morvadi", [1500, 1500, 500, 1000, 1500, 1500]],
  ["Kishna?", "Bhagapura?", [1500, 2000, 500]],
  ["Balkishan?", "Morvadi", [1000, 1000, 1500, 1300, 500]],
  ["Hariram", "Bhagapura?", [1000, 1500, 550, 800, 200]],
  ["Hari?", "Ghodapat", [1000, 800, 1020, 2000, 2000, 1000, 1300, 1500]],
  ["Rakesh?", "Dhalakad?", [1350, 1000, 1010, 1000, 1000]],
  ["Ritesh?", "Morvadi", [10000, 1000, 5000]],
  ["Gopal?", "Davarda?", [1500, 1000, 200, 1000, 200, 1000]],
  ["Dipak?", "Dhalakad?", [800, 1000, 600, 1000, 1000, 1000, 600, 1000, 800]],
  ["Amit?", "Tarvadi?", [500, 1350, 800, 1000, 1550, 1000, 4080, 500]],
  ["Nirmala?", "Morvadi", [3000, 1350, 1000, 1000, 700]],
  ["Tulsi?", "Dhalvara?", [1000, 1650, 1000, 1200, 1000, 5050, 1000]],
  ["Dipak?", "Kamlaya?", [1000, 1000, 1000, 1300, 1400, 1000]],
  ["Rakesh? - Shivprasad?", "Ghodapat", [2300, 1500, 5050, 950, 1500, 1010]],
  ["Rajkumar?", "Guruni?", [1200, 1200, 1200, 2000, 1700, 6000, 1200]],
  ["Akshay?", "Guruni?", [800, 350, 900, 800, 200, 900, 3000]],
  ["Kohi?", "Ramajeda?", [1200, 1500, 2200, 1550, 1550]],
  ["Rajesh?", "Bhagvanpura?", [1000, 1000, 1000, 1000]],
  ["Hoker?", "Kadkadiya", [10000, 150, 3000, 1500, 2015, 1000, 1000]],
  ["Ritesh", "Dhalakad?", [800, 500, 1000, 500, 1000, 800, 900, 900]],
  ["Hukumsingh?", "Guruni?", [1450, 1220, 500, 1000, 1000]],
  ["Sonaram?", "Guruni?", [800, 500, 1000, 1000, 500, 1000, 1000, 1000, 1000, 2000, 1440]],
  ["Sanil?", "Dhalakad?", [800, 1000, 600, 1000, 2020, 1000, 1000, 600, 1000]],
  ["Sonaram?", "Guruni?", [1000, 200, 1010, 1000, 500, 3030, 1500, 450, 1000, 1000, 2000, 300]],
  ["Dharmaraj?", "Morvadi", [1000, 1000, 600, 1400, 1200, 500]],
  ["Ram?", "Devarda?", [200, 3000, 500, 1000, 260, 200, 1200, 2000, 200, 1600]],
  ["Ramgopal", "Guruni?", [1000, 200, 1010, 1000, 1000, 1010, 1300, 300]],
  ["Akshay?", "Kamud?", [3000, 1000, 700, 1500, 200, 200, 1700, 1200]],
  ["Soma", "Dhalakad?", [1650, 1350, 1350, 100, 1000, 300, 1000]],
  ["Roshan?", "Hamirsana?", [1000, 600, 1000]],
  ["Shiv?", "Prasad?", [1000, 800, 1070, 1000, 1000, 1800, 1010, 1000]],
  ["Umesh?", "Hamirsana?", [3000, 1000, 1500, 500]],
  ["Mukesh", "Morvadi", [1500, 100, 1000, 1000, 1200]],
  ["Shyamsundar?", "Kalam?", []],
  ["Pankaj?", "Hamirpada?", [2000, 1350, 1000, 1000, 500]],
  ["Umesh?", "Morvadi", [1000, 1500, 3600, 1000, 100, 1100]],
  ["Akshay", "Morvadi", [500, 500, 350, 10]],
  ["Sonu", "Guruni?", [900, 500, 1000, 1000, 900, 1200, 3030]],
  ["Nay?", "Morvadi", [500, 500, 2000, 900, 1000]],
  ["Mehul?", "Morvadi", [1000, 1000, 5000, 1650, 3000, 350, 1650, 1000, 2000, 7000, 800]],
  ["Hirsha?", "Dhari?", [1000, 1350, 350, 5050, 1000, 1000]],
  ["Mohanlal? (Bhagapura?) / Akshay (Kadiya?)", "", [500, 150, 100, 1000, 1000]],
  ["Dinesh?", "Karni?", [1000, 700, 1500, 700, 1000]],
  ["Sarvind?", "Karni?", [1000, 350, 1200, 400, 1000, 5050, 1200, 650]],
  ["Rajan?", "Dhalakad?", [1000, 1000, 1350, 300, 1000]],
  ["Hariram?", "Bhagapura?", [500, 1000, 200, 1300, 1000, 1500]],
  ["Bhairu?", "Hamirsana?", [200, 500, 200]],
  ["Amuk?", "Dhalva?", [1500, 1300, 550, 1500, 1500, 1100, 1000]],
  ["Sunil?", "Dhalva?", [1500, 1500, 1500, 1000, 370, 900]],
  ["Ramdas?", "Kharpa?", [1000, 1000, 1000, 1000]],
  ["Ramratan", "Bhagapura?", [2000, 1000, 1000, 500]],
  ["Gopiyal?", "Bhagapura?", [700, 800, 300, 700]],
  ["Raju?", "Bhagapura?", [1300, 3000, 1000, 1100, 1100]],
  ["Sumit? / Mangal? (Morvadi)", "", [1000, 1000, 1000, 800, 300, 700]],
  ["Rohit?", "Jalyakhan?", [1000]],
  ["Dinesh?", "Ghodapat", [1000, 300, 3030, 1000, 1000, 600, 1500]],
  ["Rohit?", "Ghodapat", [600, 700, 650]],
  ["Mukesh", "Kadkadiya", [1000, 1500, 1000]],
  ["Nilesh?", "Kadki?", [700, 70, 1150, 1000, 1150, 70, 3030, 1000]],
  ["Akshay", "Khoval?", [1300, 1100, 1150, 1000, 2000, 1500, 1550, 1000, 5100, 500]],
  ["Premlal?", "Bhagapura?", [1200, 2500, 1000, 1200, 350, 350, 1300, 4000]],
  ["Shiva", "Guruni?", [1000, 1000, 350, 1570, 2020, 1100, 2040, 1100, 1300]],
  ["Muna?", "Guruni?", [1000, 1000, 300, 1000, 1000, 3030, 1300, 1000, 500, 500]],
  ["Prakash", "Guruni?", [1000, 1000, 350, 100, 1000, 200, 1000, 2040, 550, 300, 1300, 1500]],
  ["Gopalal?", "Morvadi", [1500, 1200, 2000, 1000, 5050]],
  ["Harisingh?", "Guruni?", [100, 1000, 200, 1000, 2410, 1000, 1200]],
  ["Radheshyam?", "Kamla?", [1900, 900, 1000, 1100, 2020, 1200, 1500, 1000, 1400]],
  ["Radheshyam", "Ghodapat", [1000, 800, 1070, 2000, 1000, 1000, 3060, 1800, 500, 1000]],
  ["Mukesh?", "Salam?", [500]],
  ["Manish?", "Kamlaya", [1200, 1000, 3030, 1500, 500, 1000, 350, 6060, 1000]],
  ["Surendra?", "Morvadi", [1500, 1000, 500, 1000]],
  ["Ramkaran", "Guruni?", [700, 1000, 250, 1220, 3030, 1670, 510, 1010, 1200, 2020, 1000]],
  ["Jaysingh?", "Hamirpada?", [1000, 1000, 1000, 1000]],
  ["Mukesh? - Dinesh?", "Kadkadiya", [1500, 1000, 1000, 1550, 1000, 1000]],
  ["Kumar?", "Aani?", [600, 1000, 800, 1000]],
  ["Pratapsingh?", "Karni?", [1000, 1000, 1000, 1000]],
  ["Shankar", "Aani?", [500, 1000, 800, 1500]],
  ["Gulab?", "Ghodapat", [800, 1100, 2530, 1350, 1000, 500, 1200, 1550]],
  ["Akshay", "Karni?", [500, 100, 1000, 1500, 1500, 1000, 1000, 500]],
  ["Kailash?", "Ghodapat", [700, 100, 1200, 1350, 100, 1200, 500, 2020, 1000, 500, 300]],
  ["Shital?", "Bhagapura?", [800, 2000, 1000, 900, 800, 2500, 2300, 300, 500, 1000]],
  ["Punaram?", "Guruni?", [1000, 1000, 350, 750, 1600, 1000, 3030, 500, 100], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Akshay", "Salam?", [2360, 2360, 500, 1000]],
  ["Dipak", "Bhagapura?", [5000, 2000, 2000, 2500, 1200]],
  ["Vishal? (Kadki?) / Ramdayal? (Morvadi)", "", [750, 1200, 1000]],
  ["Vijay? (Kadki?) / Rakesh? (Morvadi)", "", [750, 1200, 1000]],
  ["Dharmesh?", "Hamirpada?", [500, 2500, 3000, 3300], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Vikas", "Kadki?", [550, 700, 1300, 70, 2020, 1000, 2530, 1350, 1150, 1000, 1550, 1500]],
  ["Hitesh", "Goradaval?", [500, 1000, 500, 200, 350, 1040]],
  ["Sulabh?", "Kujeda?", [900, 1000, 2300, 2000, 1800, 300, 550, 2020, 1000]],
  ["Shankar?", "Hamirpada?", [1000, 400, 700, 1000, 1000, 1000, 200, 1350, 1000], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Rahul", "Morvadi", [2000, 1000, 1000]],
  ["Deep", "Kujeda", [900, 1000, 1000, 1300, 300, 450, 2020, 1000]],
  ["Hitesh / Mitesh? (Goradaval?)", "", [500, 500, 500, 600]],
  ["Gulab?", "Hamirpada?", [850, 2500, 1000, 500, 600, 500]],
  ["Jalamsingh?", "Ghodapat", [200, 500, 1100, 2020, 1200, 500]],
  ["Ravi", "Kamalpura?", [200, 2000, 300, 500]],
  ["Pratapsingh?", "Hamirpada?", [1000, 6000]],
  ["Rajaram?", "Kadkadiya", [850, 1000, 1100, 1000, 1000, 1000]],
  ["Maniram", "Kamla?", [700, 1000, 1000, 1000, 1200, 300]],
  ["Surendra?", "Guruni?", [1000, 1000, 1200]],
  ["Sahebmal?", "Hamirpada?", [850, 1000, 500, 1000, 1200]],
  ["Laxman?", "Dev?", [900, 1000, 1100, 1000, 600, 250, 1000]],
  ["Mahendra?", "Morvadi", [500, 700, 1100, 1350, 600, 1200]],
  ["Ramkishan?", "Balkheda?", [2000, 850, 1000, 500, 400, 600, 500, 1000, 1000]],
  ["Shivsingh?", "Morvadi", [1000, 1000, 1000, 300, 1100, 1000, 400, 1000, 1500]],
  ["Rahul?", "Moti?", [500, 1000, 1000, 1700, 1000]],
  ["Radhe?", "Bhagapura?", [1500, 1500, 550, 1000, 1000, 500]],
  ["Kishna?", "Bhagapura?", [1000, 1350, 1500, 500, 1100, 1500, 1000, 1000, 1200]],
  ["Sanil?", "Karni?", [900, 1000, 1100, 1500, 2000, 1000, 250, 1000, 1540, 1200, 1000]],
  ["Akash", "Goradaval?", [500, 500, 500]],
  ["Girilal?", "Morvadi", [3000, 1550, 1850, 510]],
  ["Kishor", "Nayapura?", [850, 1000, 2700, 2000, 1000]],
  ["Kuldeep?", "Morvadi", [6000, 1500, 1000, 1000, 5000, 1000, 1000]],
  ["Dinesh?", "Aani?", [1000, 1600, 1000, 1000]],
  ["Pavankumar?", "Khovi?", [1000, 700, 1000, 1000, 1000]],
  ["Sushil", "Khovi?", [1000, 500, 350, 1000, 1550]],
  ["Shyamsundar?", "Khoval?", [1200, 2000, 1000, 1100]],
  ["Jaypal?", "Ghodapat", [750, 5000, 1000, 500, 500, 5050, 950]],
  ["Mukesh Patil", "Ghodapat", [750, 5000, 1000, 700, 1000, 1000, 1000]],
  ["Dinesh? (Karni?) / Sunil (Mor?)", "", [750, 1200, 1000, 1800]],
  ["Kishna? - Sidhdhu?", "Ramajeda", [500, 1500, 5050, 1000, 200, 1000, 500, 200, 500]],
  ["Hariram", "Bhagvanpura?", [1500, 1700, 1700, 1500]],
  ["Rakesh?", "Kamni?", [1000, 350, 700, 1100, 1300, 6060]],
  ["Rakesh?", "Kadkadiya", [800, 100, 2300, 5000, 1000, 1000]],
  ["Ramesh?", "Khovi?", [1200, 1000, 1000, 6060, 1550]],
  ["Shakaram?", "Kamni?", [1000, 600, 1200, 1000, 500, 1700, 1200, 1000]],
  ["Punya?", "Ghodapat", [500, 1000, 500, 500, 500, 800]],
  ["Shivprasad", "Matan?", [1000, 2000, 2000, 2000, 350, 1000, 1000]],
  ["Umesh", "Khoval?", [1200, 500, 2000, 3030, 1000, 1100]],
  ["Ramkishan?", "Khovi?", [2000, 1000, 1350, 1000, 1000]],
  ["Balaram?", "Bhagapura?", [2000, 2000, 900, 2500, 500], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Rima?", "Bhagapura?", [1000, 1400, 1400]],
  ["Suresh?", "Ramajeda", [650, 1500, 1850, 1000, 600, 1000, 200]],
  ["Ramsingh?", "Hamirpada?", [850]],
  ["Bharat", "Dhorvariya?", [1200, 800, 1500, 1100]],
  ["Patiram?", "Dhorvariya?", [1000, 1000, 1000, 300, 1000, 500, 1000, 1100]],
  ["Santosh?", "Bhagvanpura?", [1000, 70, 1000, 2020, 1000, 1000]],
  ["Vinod", "Salam?", []],
  ["Ramdas?", "Bhagapura?", [1000]],
  ["Tulsiram", "Bhagapura?", [1500, 500]],
  ["Rima?", "Bhagapura?", []],
  ["Vijay", "Kadkhedi?", [700, 1500, 1800, 600, 1500, 500, 1300]],
  ["Pankaj?", "Matan?", [1500, 1000, 1000, 1000]],
  ["Dinesh", "Kadkhedi?", [1500, 1000, 350, 1150, 1850, 1000]],
  ["Rahul?", "Dhalakad?", [750, 1200, 1000]],
  ["Sarif?", "Charkheda?", [1000, 3500, 1000, 4000, 1000, 350]],
  ["Sumita?", "Morvadi", [2500, 250, 1500, 2000]],
  ["Kuldeep?", "Kadkadiya", [200, 1500, 300, 700, 2500, 1000, 1000, 2860]],
  ["Vikram Singh?", "Hamirsana?", [1050, 1000, 600, 1500]],
  ["Ram?", "Hamirsana", [1100, 1000, 700, 2500, 1000, 1000, 2140]],
  ["Mohan?", "Kadkadiya", [1000, 500, 2000, 1000, 1900, 1000, 200, 1000, 1150, 1500]],
  ["Ramchandra", "Guruni?", [3000, 500, 2000, 2000, 2000, 6400]],
  ["Sonaram?", "Devarda?", [200, 2000, 1000, 1000, 1000, 550, 5050]],
  ["Rajkriyapal?", "Ghodapat", [1000, 1500, 2000, 1150, 300, 1500]],
  ["Mitesh-1", "Kujal?", [500, 3000, 1300, 2000, 1010, 2000, 3800, 700, 4000, 4800]],
  ["Rajkumar", "Morvadi", [1000, 1000, 1000, 850, 2000, 2000, 550, 1500, 300, 500, 1000]],
  ["Maniram", "Khoval?", [1000, 1300, 2020, 1000, 1000, 1000, 2530]],
  ["Avinash?", "Morvadi", [1500, 1000, 1500, 1000, 700]],
  ["Umeshkumar? - Karni?", "Morvadi", [1200, 1100, 1350, 1200, 1200]],
  ["Dipak", "Ramajeda?", [500, 1000, 1000, 1510, 1000, 1600, 1500, 1000, 1000, 350, 2100]],
  ["Suresh", "Morvadi", [1500, 1000, 1000, 1000]],
  ["Akshay", "Charva?", [1500, 1000, 1500, 1000]],
  ["Amit Kishan?", "Ghodapat", [1200, 1500, 800, 1220, 1000, 1000, 1300], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Vijay", "Bhagvanpura?", [1000, 1500, 600]],
  ["Sohanlal?", "Gulab?", []],
  ["Kailash?", "Sundarpura?", [1100, 1500, 2040]],
  ["Mohit?", "Karni?", [1000, 100, 1100, 800, 1600, 1000, 1000, 2000]],
  ["Ramak?", "Ghodapat", [1000, 500, 1010, 1000, 200, 1300, 2000, 1450, 1010]],
  ["Rambhaju?", "Gulab?", [2000, 500, 2000, 2000, 2000, 2000, 900, 1010]],
  ["Upsingh?", "Morvadi", [1000, 1000, 1200, 1300]],
  ["Mujalti?", "Gulab?", []],
  ["", "", []],
  ["Sohansingh?", "Bhagapura?", [1200, 1700, 1000, 1000, 1000, 1000]],
  ["Sumit?", "Hamirpada?", [1500, 1000, 1150, 1000]],
  ["Surajram", "Dhalakad?", [1000, 1150, 700, 700, 1400, 1000]],
  ["Rajkumar", "Salam?", []],
  ["Sandeep?", "Hamirpada?", [300, 1400, 1000, 1000, 1000, 100, 1000]],
  ["Ravindra?", "Hamirpada?", [1300, 1000, 100, 1300, 1000, 1000, 1850, 450, 500]],
  ["Umesh", "Kujasana?", [750, 1000, 1000, 1500]],
  ["Yogesh?", "Kadkadiya", [650, 1000, 1350, 1850, 3030]],
  ["Sumit?", "Dhalakad?", [2000, 1000, 3060, 1000, 225, 1000]],
  ["Hotelal?", "Salam?", [500, 300, 2500, 100]],
  ["Rajkishor?", "Morvadi", [650, 1000, 1000, 1000, 1000]],
  ["Ashish?", "Ghodapat", [1000, 500, 1000, 200, 2700, 1000]],
  ["Ramsingh", "Salam", [1150, 500, 5000, 1000, 100, 5050, 500]],
  ["Ramkishanlal?", "Guruni?", [1000, 1000, 225, 1000]],
  ["Shriram", "Ghodapat", [1000, 1000, 1000, 1150, 1010, 1000, 1500]],
  ["Sunita?", "Guruni?", [1000, 1000, 1000, 1000]],
  ["Dharmesh?", "Ghodapat", [600, 1000, 500, 1500, 900]],
  ["Suresh?", "Ghodapat", [1000, 350, 700, 150, 700, 1000]],
  ["Mahesh?", "Ghodapat", [1000, 500, 600, 100, 1000, 1700]],
  ["Rakesh?", "Ghodapat", [1000, 1040, 700, 70, 1000, 1000, 1000]],
  ["Rakesh - Aduna?", "Ghodapat", [1000, 1000, 1000, 1150, 1000, 1500]],
  ["Jitendra?", "Hamirsana?", [1000, 1000]],
  ["Virendra?", "Ghodapat", [1300, 1200, 700, 5050, 1650, 5000]],
  ["Mansingh?", "Hamirpada?", [1000, 600, 100, 250, 500]],
  ["Rohit?", "Bhagapura?", [1500, 500, 500, 2000]],
  ["Sukhdev?", "Hamirpada?", [750, 1200, 1000]],
  ["Dalu?", "Samudana?", [1000, 1000]],
  ["Sunita?", "Bhagapura?", [2000, 1100, 600, 800, 2000, 1000]],
  ["Kamla", "Matan?", [1000, 350]],
  ["Anil", "Bhamaniya", [1000, 1000]],
  ["Jyoti?", "Dhalakad?", [2500, 350, 1050, 2000]],
  ["Alibhai?", "Sundarpara?", [350, 600, 420, 1000, 1000]],
  ["Nilesh?", "Ghodapat", [1000, 500, 1040, 1000, 1000, 1200, 1020, 1450]],
  ["Sonu?", "?", [800, 2000, 450, 1500]],
  ["Ashasaram?", "Salam?", [900]],
  ["Ghanshyam", "Devarda?", [200, 1500, 1000, 200, 1000, 200, 350, 1000, 200]],
  ["Akshay", "Salam?", []],
  ["Mahesh?", "Kurda?", [1350, 1150, 5550, 1000, 1000]],
  ["Shiva", "Kamni", [1000, 3000, 1100, 1000, 800, 500, 1000, 1400]],
  ["Shiv Patel", "Morvadi", [500, 500, 1500, 500, 2000]],
  ["Pavankumar", "Amdar?", [1500, 250, 1300, 1100, 1000, 1500]],
  ["Vishal Purushottam?", "Morvadi", [500, 500, 1000]],
  ["Akhilketan?", "Morvadi", [500, 500, 1000]],
  ["Radheshyam", "Hamirpada?", [1350, 1400, 1000, 350, 250, 2020, 1000, 200, 1000]],
  ["Rakesh?", "Hamirpada?", [1200, 1400, 700, 1000, 1000, 200, 1000, 1000, 70, 300]],
  ["Bhandaram?", "Bhagapura?", [1000, 1000, 1100, 2200, 1150, 3030, 2850, 1000, 550, 500]],
  ["Dipak", "Bhagapura?", [500, 2000, 1500, 1100, 1200]],
  ["Rakesh?", "Bhagapura?", []],
  ["Ramvilas", "Morvadi", [500, 500]],
  ["Rajkumar", "Ghodapat", [700, 1000, 1000, 1000]],
  ["Yogsingh?", "Ghodapat", [600, 700, 1200, 1000]],
  ["Rakesh?", "Ghodapat", [1000, 1000, 1500, 1000, 1150, 1000, 3030, 700]],
  ["Akash", "Ghodapat", [1000, 1000, 1000, 1150, 1100, 1000]],
  ["Ramkaransh?", "Ghodapat", [1000, 1800, 1000, 1000, 1000, 1000]],
  ["Satish", "Ghodapat", [2000, 1000, 700, 1800, 5050, 1200]],
  ["Mukesh", "Bhagapura?", [1300, 4000]],
  ["Manish", "Karali?", []],
  ["Ram", "Salam?", []],
  ["Mithu?", "Ghodapat", [700, 1000, 1550, 700]],
  ["Bhagwandas", "Shirni?", [1000, 100, 200, 1000, 1000, 1000]],
  ["Amardas?", "Guruni?", [1000, 1200, 1100, 3030, 1200, 1200]],
  ["Rakesh?", "Devarda?", [200, 1350, 1150, 1000, 500, 1000, 50]],
  ["Sumit", "Kamalpura?", [1150, 1300, 2000, 1000, 200, 1050, 200, 1000, 300]],
  ["Pavan?", "Ghodapat", [1000, 1000, 1010, 1000, 200, 200, 1800, 1000]],
  ["Bhagwandas", "Ghodapat", [1000, 300, 1000, 1010, 1000, 200, 1000, 1500]],
  ["Makhan", "Dhalakad?", [2000, 2020, 1200, 1500, 2000]],
  ["Kalu?", "Bhagapura?", [1000, 1850, 1110, 800, 500, 1100, 500, 100, 1000, 2250, 500, 2500]],
  ["Sonia?", "Bhagapura?", [1000, 1000, 500, 500, 500]],
  ["Amita", "Mahudiya?", [1000, 500, 1000, 1000]],
  ["Shivak?", "Charkheda", [2000, 300, 1685, 2000, 1000, 900, 2000, 2000, 5050]],
  ["Shivlal", "Ramajeda", [500, 1000, 1000, 1680, 1000, 1500]],
  ["Sumita?", "Ramajeda", [700, 1000, 1000, 1000, 1500]],
  ["Jakti?", "Bhagapura?", []],
  ["Mohan", "Bhagapura?", [1000, 2300, 2350, 200, 2000]],
  ["Ram", "Karni?", [500, 1000, 1520, 2000, 2000, 5050, 2000, 2000]],
  ["Ramsingh", "Bhagapura?", [2000, 2000, 3540, 2000, 1550, 2000, 2000, 2000, 1000]],
  ["Sarvansingh?", "Mahudiya?", [2000, 2000, 1250, 2000, 900, 1000]],
  ["Sakshm?", "Mahudiya?", [2000, 2000, 1000, 2300, 2000]],
  ["Nita?", "Charkhas?", [500, 1000, 1000]],
  ["Radha?", "Charkhas?", [500, 1000, 1000], "નોંધ: 17000 જમા?"],
  ["Manohar Singh?", "Bhagapura?", [2000, 300, 2000, 2000]],
  ["Mohit?", "Charkhas?", [500, 500, 1300, 1010]],
  ["Manohar - Bhagapura?", "Kisar?", [1000, 7000, 300, 1550]],
  ["Kastur?", "Chari?", [1700, 1000, 850, 1000, 1080, 800], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Vimal", "Kadkadiya", [1000, 875, 850, 1000, 1080, 800], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Sivdarshan?", "Kadkadiya", [800, 1000, 300, 1000, 1000, 1500, 1100, 100], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Savitrisingh?", "Mahudiya?", [1000, 500, 1500]],
  ["Mamta", "Rasoli?", [3500]],
  ["Amit", "Mahudiya", [1000, 2000, 2000, 2000, 2000]],
  ["Ramesh Mava?", "-", [1000, 1000]],
  ["Rakesh", "Mahudiya", [500, 1000, 5000, 1000, 2370, 1000, 1000, 2500]],
  ["Akash?", "Manpura?", [1100, 875, 1000, 1500, 225, 200, 1100]],
  ["Tejsingh?", "Mahudiya", [1000, 350, 2100, 1000, 1500, 1000, 100]],
  ["Mira", "Ghodapat", [1000, 1000, 1000, 500, 500]],
  ["Kujlal?", "Mave?", []],
  ["Prakash", "Sundarpara?", [350, 1000, 1000, 1000, 500]],
  ["Rachita?", "Charkhas?", [500, 1000, 1000, 1000, 1000]],
  ["Sabita?", "Charkhas?", [500, 1000, 1000, 1000, 300]],
  ["Santosh", "Bhagapura?", [2000, 300, 1800, 1000, 3200, 1300, 2000, 3100, 3000]],
  ["Ridhi?", "Bhagapura?", [500]],
  ["Dipak", "Kushimal?", [1000, 950]],
  ["Kripati?", "Bhagapura?", []],
  ["Akash?", "Karnaliya?", [1000, 1500, 500, 1000, 1500, 800, 1500]],
  ["Rakesh?", "Dasvalal?", [500, 1000]],
  ["Kalita?", "Dasvalal?", [2000]],
  ["Akshay", "Bhagapura?", [500, 800]],
  ["Pravin", "Kadkadiya", []],
  ["Hari?", "Mahudiya", [1000, 1000, 1000, 1000]],
  ["Mithun?", "B.P.C", [1150, 875, 1000, 1000, 225, 1000]],
  ["Gulabram?", "Hirapal?", [1500, 1000, 1000, 1000, 500]],
  ["Mamta?", "Turiya?", [1000, 2000, 1000, 1500]],
  ["Ashika?", "Bhagapura?", [1000, 1000, 1000, 500, 1000, 500, 500]],
  ["Manish", "Turiya?", [2000, 4000, 4000, 50000, 4000]],
  ["Kamla", "Turiya?", []],
  ["Umesh", "Bhagapura?", [1000, 1000]],
  ["Santan?", "Turiya?", [2000, 350]],
  ["Kalu?", "Turiya?", []],
  ["Hitesingh?", "Kamaniya?", [2000, 1000, 350]],
  ["Mamta", "Kamaniya?", [1000, 350]],
  ["Ramvati?", "Bhagapura?", [1000, 1000, 1000, 350]],
  ["Nandkishor", "B.P.C", [300, 1000, 1000, 1850, 1500, 500, 1000, 100, 1200, 350, 450], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Dashrath?", "Kushimal?", [1350]],
  ["Guddi?", "Turiya", [1000, 1000, 1000, 1000]],
  ["Dalchand?", "Turiya", [1000, 1000, 1000, 1350, 1000]],
  ["Shriram", "Kadkadiya", [300, 1000, 2000, 1500, 5350, 1000, 1200, 450]],
  ["Mukesh", "Dabhara?", [1000, 2000, 1000, 1000]],
  ["Mohit?", "Dabhara?", [1000, 1000, 1000, 3200]],
  ["Surendra", "Karnaliya?", [1000, 1500, 1500, 1500, 2000, 500]],
  ["Saraswati?", "Karnaliya?", []],
  ["Pravin", "H.D.C", [1000, 500, 200]],
  ["Revaram", "Ghodapat", [500, 2350, 2000, 2000, 5000, 1500]],
  ["Rekha", "Ghodapat", []],
  ["Dalchand?", "Bhagapura?", [1000, 1000, 1000, 500, 1000, 500, 500]],
  ["Ravindra?", "Bhagapura", [1000, 1850, 500, 500, 500, 1000]],
  ["Mahesh", "Bhagapura", [1000, 1000, 500, 500, 500]],
  ["Ramkaran", "Bhagapura", [2000, 3000, 1500, 2000, 900, 2000, 1000, 2000, 1000, 200, 1000, 2000]],
  ["Suresh?", "Bhagapura", [800, 1000, 300, 500, 1000]],
  ["Rakesh?", "Bhagapura", [800, 500, 500, 2000]],
  ["Kishor?", "Bhagapura", [800, 1000]],
  ["Shivkaran", "Bhagapura", [2000, 3200, 1000, 1950]],
  ["Sevanti?", "Bhagapura", [1000, 1000, 1000, 1500, 2000, 8150, 6000]],
  ["Shivkumar", "Dhudkal?", [700, 1000, 1000, 1000, 1700]],
  ["Vijay Narayan?", "Lakhanda?", [1000, 1000, 1000, 1850, 10000, 350, 5050], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Ritesh", "Lakhanda Khana?", [1000, 1100, 1000, 2040, 1000, 300]],
  ["Maniram", "Sundarpati?", [800, 1000, 1000, 2040, 180, 1000]],
  ["Sanjay", "Sundarpati?", [800, 1000, 1350, 180, 1350]],
  ["Sanjay Mardi?", "Sundarpati?", [800, 1000, 1000, 3060, 500, 180, 1000]],
  ["Krishna", "Sundarpati?", [800, 1000, 1000, 180, 1000, 450, 1500], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Shivlal", "Sundarpati?", [800, 1000, 500, 1300, 5100, 180, 200], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Bhanga?", "Bhagvanpura", [700, 1000, 1000, 1300, 3030]],
  ["Lalsingh", "Bhagvanpura", [700, 1000, 1000, 1000]],
  ["Ramdas", "Bhagvanpura", [700, 1000, 1250, 3030, 2000, 500], "કુલ ≥ (લીટી કપાયેલી, વધુ હોઈ શકે)"],
  ["Aatarsingh?", "Bhagvanpura", [700, 1000, 750, 1450, 5050]],
  ["Kalu", "Bhagvanpura", [700, 1000, 750, 1000, 1040]],
  ["Kushu?", "Bhagvanpura", [700, 1000, 750, 1000, 1000]],
  ["Bhim", "Dhalakad?", [700, 1000, 1000, 400, 1000]],
  ["Ramkaran", "Dhalakad?", [700, 1000, 1000, 300, 1000]],
  ["Gulab", "Bhomvadi? Jamdad", [800, 1300, 300, 700]],
  ["Balu", "Bagda?", [3000, 3000, 2000]],
  ["Mangla", "Bagda?", [1000]],
  ["Rajkumar", "Kumbhariya Kheda?", [1350]],
  ["Mansingh", "Kumbhariya Kheda?", [1000, 5050, 1200]],
  ["Shantilal?", "Khemaniya?", [200, 1500]],
  ["Kamlesh?", "Ghodapat?", [800]],
  ["Maniram", "Ramajeda?", [2000, 300, 100, 1500, 700, 1200, 1400, 1000]],
  ["Kamlakar?", "Ramajeda", [1500]],
  ["Kamlesh?", "Kharsi?", [1000]],
  ["Narayan?", "Kadkad?", [300, 5050]],
  ["Vishal", "Ramajeda", [500, 2530]],
  ["Vijay", "Charkheda?", [700, 1000, 1100]],
  ["Ranjit", "Khemariya?", [1000]],
  ["Bharat", "H.D.C", [7000, 7000, 1000]],
  ["Ravi", "H.D.C", [650, 7000, 400, 1500]],
  ["Naresh", "H.D.C", [1500, 3500, 2225, 2000, 700, 200, 200, 1000, 200, 5500, 700]],
  ["Dipak", "H.D.C", [20000]],
  ["Mahesh", "B.D.C", [500, 1500]],
  ["Bharat", "H.D.C", [10000]],
  ["Bharat", "H.D.C", [12000]],
  ["Vimlesh", "H.D.C", [1000]],
  ["Lakhmana?", "B.D.C", [2000]],
  ["Bharat", "S.P", []],
  ["Samrath?", "H.D.C", [3000]],
  ["Shivraj?", "H.D.C", [2000]],
  ["Kuldeep?", "Sandhutiya?", [1000, 2000, 2000, 1000]],
  ["Ajit?", "Sundrapur?", [5000, 1000]],
  ["Revaram", "Vikrampur", [800, 500, 150, 1000]],
  ["Aasha?", "Vikrampur", [800, 500, 150, 1000]],
  ["Vinod", "Vikrampur", [800, 1000, 150, 1000]],
  ["Vijay", "Vikrampur", [800, 500, 150, 1000]],
  ["Dayashankar?", "Vikrampur", [800, 500, 150, 1000]],
  ["Shivlal", "Vikrampur", [800, 2500, 350, 150, 1000]],
  ["Ram", "Karniya?", [5000]],
];

const SEED = {
  month: "સપ્ટેમ્બર 2026",
  khatas: RAW.map(([n, g, a, note]) => mk(n, g, a, note)),
};

function load() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return SEED;
}

export default function App() {
  const [role, setRole] = useState(() => {
    const v = localStorage.getItem(AUTH_KEY);
    return v === "1" || v === "admin" ? "admin" : v === "nitesh" ? "nitesh" : null;
  });
  const authed = !!role;
  const [data, setData] = useState(load);
  const [openId, setOpenId] = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  const grand = useMemo(() => data.khatas.reduce((s, k) => s + total(k), 0), [data]);

  const updateKhata = (id, patch) =>
    setData((d) => ({ ...d, khatas: d.khatas.map((k) => (k.id === id ? { ...k, ...patch } : k)) }));

  const logout = () => {
    localStorage.removeItem(AUTH_KEY);
    setRole(null);
    setOpenId(null);
  };

  if (!authed)
    return (
      <Shell>
        <Login
          onOk={(r) => {
            localStorage.setItem(AUTH_KEY, r);
            setRole(r);
          }}
        />
      </Shell>
    );

  if (role === "nitesh") return <SiteApp onLogout={logout} />;

  const open = data.khatas.find((k) => k.id === openId);

  if (open)
    return (
      <Shell>
        <Detail
          k={open}
          onBack={() => setOpenId(null)}
          onChange={(patch) => updateKhata(open.id, patch)}
          onDelete={() => {
            if (window.confirm("આ ખાતું કાયમ માટે કાઢી નાખવું?")) {
              setData((d) => ({ ...d, khatas: d.khatas.filter((k) => k.id !== open.id) }));
              setOpenId(null);
            }
          }}
        />
      </Shell>
    );

  const list = data.khatas
    .map((k, i) => ({ k, no: i + 1 }))
    .filter(({ no }) => !q.trim() || no === Number(q.trim())); // ફક્ત કાર્ડ નંબરથી શોધ

  const addKhata = (naam, gaon) =>
    setData((d) => ({ ...d, khatas: [...d.khatas, { id: uid(), naam, gaon, note: "", entries: [] }] }));

  const backup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "hisab-backup.json";
    a.click();
  };

  return (
    <Shell>
      <div className="top">
        <h2 className="title">📒</h2>
        <input
          className="month"
          value={data.month}
          onChange={(e) => setData({ ...data, month: e.target.value })}
        />
        <button className="ghost noprint" onClick={logout}>બહાર નીકળો</button>
      </div>

      <div className="grand">
        <div>કુલ સરવાળો</div>
        <b>{inr(grand)}</b>
        <small>{data.khatas.length} ખાતા</small>
      </div>

      <input
        className="noprint search"
        inputMode="numeric" placeholder="🔍 કાર્ડ નંબર લખો"
        value={q}
        onChange={(e) => setQ(e.target.value.replace(/\D/g, ""))}
      />

      <div className="ruled">
        {list.map(({ k, no }) => (
          <div key={k.id} className="line" onClick={() => setOpenId(k.id)}>
            <div>
              <div className="nm">{no}. {k.naam || "(નામ નથી)"}</div>
              <small>{k.gaon || "ગામ નથી"} · {k.entries.length} એન્ટ્રી</small>
              {k.note && <div className="warn">⚠ {k.note}</div>}
            </div>
            <b className="amt">{inr(total(k))}</b>
          </div>
        ))}
        {list.length === 0 && <p className="mut">કંઈ મળ્યું નથી.</p>}
      </div>

      <NewKhata onAdd={addKhata} />

      <div className="row noprint">
        <button className="ghost" onClick={() => window.print()}>🖨 PDF / પ્રિન્ટ</button>
        <button className="ghost" onClick={backup}>💾 બેકઅપ</button>
      </div>
    </Shell>
  );
}

function Login({ onOk }) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const go = () => {
    const i = id.trim();
    if (i === ADMIN_ID && pw === ADMIN_PASS) onOk("admin");
    else if (i === NV_ID && pw === NV_PASS) onOk("nitesh");
    else setErr("યુઝર આઈડી અથવા પાસવર્ડ ખોટો છે");
  };
  return (
    <div className="login">
      <h1>📒 હિસાબ</h1>
      <div className="box">
        <input placeholder="યુઝર આઈડી" value={id} onChange={(e) => setId(e.target.value)} />
        <input
          placeholder="પાસવર્ડ"
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && go()}
        />
        {err && <div className="err">{err}</div>}
        <button onClick={go}>લૉગિન</button>
      </div>
    </div>
  );
}

function NewKhata({ onAdd }) {
  const [naam, setNaam] = useState("");
  const [gaon, setGaon] = useState("");
  return (
    <div className="box noprint">
      <b>+ નવું ખાતું</b>
      <div className="row">
        <input placeholder="નામ" value={naam} onChange={(e) => setNaam(e.target.value)} />
        <input placeholder="ગામ" value={gaon} onChange={(e) => setGaon(e.target.value)} />
      </div>
      <button
        onClick={() => {
          if (!naam.trim()) return;
          onAdd(naam.trim(), gaon.trim());
          setNaam("");
          setGaon("");
        }}
      >
        ઉમેરો
      </button>
    </div>
  );
}

const MONTHS = ["જાન્યુઆરી","ફેબ્રુઆરી","માર્ચ","એપ્રિલ","મે","જૂન","જુલાઈ","ઓગસ્ટ","સપ્ટેમ્બર","ઓક્ટોબર","નવેમ્બર","ડિસેમ્બર"];
const DAYS = ["રવિ","સોમ","મંગળ","બુધ","ગુરુ","શુક્ર","શનિ"];
const pad = (n) => String(n).padStart(2, "0");
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const fmtDate = (d) => (d ? d.split("-").reverse().join("/") : "—");

function Detail({ k, onBack, onChange, onDelete }) {
  const now = new Date();
  // કેલેન્ડર છેલ્લી એન્ટ્રીવાળા મહિનામાં ખૂલે; એન્ટ્રી ન હોય તો આજના મહિનામાં
  const latest = k.entries.map((e) => e.date).filter(Boolean).sort().pop();
  const start = latest ? new Date(latest + "T00:00:00") : now;
  const [ym, setYm] = useState({ y: start.getFullYear(), m: start.getMonth() });
  const [sel, setSel] = useState(iso(start.getFullYear(), start.getMonth(), start.getDate()));
  const [amt, setAmt] = useState("");
  const [vigat, setVigat] = useState("");
  const [kiraya, setKiraya] = useState(false);
  const [edit, setEdit] = useState(false);

  const byDate = useMemo(() => {
    const o = {};
    k.entries.forEach((e) => {
      if (e.date) o[e.date] = (o[e.date] || 0) + Number(e.amount || 0);
    });
    return o;
  }, [k.entries]);

  const first = new Date(ym.y, ym.m, 1).getDay();
  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const prefix = `${ym.y}-${pad(ym.m + 1)}`;
  const monthTotal = k.entries.filter((e) => (e.date || "").startsWith(prefix)).reduce((s, e) => s + Number(e.amount || 0), 0);
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());

  const go = (delta) => {
    const d = new Date(ym.y, ym.m + delta, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
  };
  const add = () => {
    const a = Number(amt);
    if (!a) return;
    onChange({ entries: [...k.entries, { id: uid(), amount: a, date: sel, kiraya, vigat: vigat.trim() }] });
    setAmt("");
    setVigat("");
    setKiraya(false);
  };
  const del = (id) => onChange({ entries: k.entries.filter((e) => e.id !== id) });
  const setDate = (id, date) => onChange({ entries: k.entries.map((e) => (e.id === id ? { ...e, date } : e)) });

  const dayList = k.entries.filter((e) => e.date === sel);
  const undated = k.entries.filter((e) => !e.date);

  const Row = ({ e, undatedRow }) => (
    <div className="line slim">
      <div>
        <b className="amt">{inr(e.amount)}</b> {e.kiraya && <span className="tag">ભાડું</span>}
        {e.vigat && <div><small>{e.vigat}</small></div>}
      </div>
      <div className="row" style={{ width: "auto" }}>
        {undatedRow && (
          <button className="ghost noprint" style={{ margin: 0, padding: "5px 8px", fontSize: 12 }} onClick={() => setDate(e.id, sel)}>
            {fmtDate(sel)} મૂકો
          </button>
        )}
        <button className="x noprint" onClick={() => del(e.id)}>✕</button>
      </div>
    </div>
  );

  return (
    <>
      <div className="row noprint" style={{ justifyContent: "space-between" }}>
        <button className="ghost" onClick={onBack}>← પાછા</button>
        <button className="ghost" onClick={() => setEdit(!edit)}>✎ નામ સુધારો</button>
      </div>

      <div className="khname">
        <h2>{k.naam || "(નામ નથી)"}</h2>
        <small>{k.gaon || "ગામ નથી"}</small>
        {k.note && <div className="warn">⚠ {k.note}</div>}
      </div>

      {edit && (
        <div className="box noprint">
          <div className="row">
            <input placeholder="નામ" value={k.naam} onChange={(e) => onChange({ naam: e.target.value })} />
            <input placeholder="ગામ" value={k.gaon} onChange={(e) => onChange({ gaon: e.target.value })} />
          </div>
          <input placeholder="નોંધ" value={k.note} onChange={(e) => onChange({ note: e.target.value })} />
          <button className="danger" onClick={onDelete}>આ ખાતું કાઢી નાખો</button>
        </div>
      )}

      <div className="grand">
        <div>આ ખાતાનો કુલ સરવાળો</div>
        <b>{inr(total(k))}</b>
        <small>{MONTHS[ym.m]}: {inr(monthTotal)}</small>
      </div>

      <div className="cal">
        <div className="calhd">
          <button className="ghost noprint" onClick={() => go(-1)}>‹</button>
          <b>{MONTHS[ym.m]} {ym.y}</b>
          <button className="ghost noprint" onClick={() => go(1)}>›</button>
        </div>
        <div className="grid">
          {DAYS.map((d) => <div key={d} className="dn">{d}</div>)}
          {cells.map((d, i) => {
            if (!d) return <div key={"e" + i} />;
            const key = iso(ym.y, ym.m, d);
            return (
              <div key={key} className={"day" + (key === sel ? " sel" : "") + (key === todayIso ? " today" : "") + (byDate[key] ? " has" : "")} onClick={() => setSel(key)}>
                <span>{d}</span>
                {byDate[key] && <em>{Number(byDate[key]).toLocaleString("en-IN")}</em>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="box">
        <b>📅 {fmtDate(sel)}</b>
        {dayList.length === 0 && <div className="mut" style={{ margin: "6px 0" }}>આ તારીખે કોઈ એન્ટ્રી નથી.</div>}
        {dayList.map((e) => <Row key={e.id} e={e} />)}
        <div className="noprint">
          <div className="row">
            <input type="number" inputMode="numeric" placeholder="રકમ" value={amt} onChange={(e) => setAmt(e.target.value)} />
            <input placeholder="વિગત (વૈકલ્પિક)" value={vigat} onChange={(e) => setVigat(e.target.value)} />
          </div>
          <label className="chk">
            <input type="checkbox" checked={kiraya} onChange={(e) => setKiraya(e.target.checked)} /> ભાડું
          </label>
          <button onClick={add}>{fmtDate(sel)} ની એન્ટ્રી ઉમેરો</button>
        </div>
      </div>

      {undated.length > 0 && (
        <div className="box">
          <b>તારીખ વગરની એન્ટ્રી ({undated.length})</b>
          <div className="mut" style={{ fontSize: 13 }}>ઉપર તારીખ પસંદ કરી "મૂકો" દબાવો</div>
          {undated.map((e) => <Row key={e.id} e={e} undatedRow />)}
        </div>
      )}
    </>
  );
}

function Shell({ children }) {
  return (
    <div className="wrap">
      <style>{css}</style>
      {children}
    </div>
  );
}

// ====== નોટબુક ડિઝાઇન ======
const css = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Gujarati:wght@400;600;700&display=swap');
*{box-sizing:border-box}
body{margin:0;background:#e9e1c8;font-family:"Noto Serif Gujarati",Georgia,serif;color:#2b2a26}
.wrap{max-width:520px;margin:0 auto;min-height:100vh;padding:14px 14px 40px;background:#fbf6e9;border-left:3px double #d9a79c;box-shadow:0 0 18px #0002}
h1{text-align:center;color:#7a2e1d;margin:0 0 14px}
input{width:100%;padding:11px;border:1px dashed #b9ac82;border-radius:6px;font-size:16px;margin:4px 0;background:#fffdf5;color:#2b2a26;font-family:inherit}
input:focus{outline:2px solid #7a2e1d55;border-style:solid}
button{padding:11px 14px;border:0;border-radius:6px;background:#7a2e1d;color:#fff;font-size:15px;width:100%;margin-top:6px;font-family:inherit}
button.ghost{background:transparent;color:#7a2e1d;border:1px solid #7a2e1d;width:auto}
button.danger{background:#a3261b;margin-top:16px}
button.x{width:auto;background:transparent;color:#a3261b;border:1px solid #dcb1ab;padding:5px 10px;margin:0}
.top{display:flex;gap:8px;align-items:center}
.title{margin:0;font-size:24px}
.month{font-size:21px;font-weight:700;border:0;background:transparent;color:#7a2e1d;margin:0}
.grand{border:2px solid #7a2e1d;border-radius:6px;background:#fff8e1;color:#7a2e1d;padding:12px;margin:12px 0;text-align:center}
.grand b{display:block;font-size:32px}
.grand small{color:#7b7562}
.search{background:#fffdf5}
.ruled{margin:6px 0 10px;border-top:2px solid #7a2e1d}
.line{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:12px 4px;border-bottom:1px solid #d9cfae;cursor:pointer}
.line:active{background:#f3ead0}
.line.slim{padding:8px 4px;cursor:default}
.nm{font-weight:700}
.amt{color:#7a2e1d;font-size:17px}
small,.mut{color:#7b7562}
.warn{font-size:12px;color:#8a5a00;margin-top:3px}
.box{background:#fff8e1;border:1px solid #d9cfae;border-radius:6px;padding:12px;margin:12px 0}
.row{display:flex;gap:8px}
.chk{display:flex;align-items:center;gap:8px;margin:4px 0}
.chk input{width:auto}
.tag{background:#f6dfae;color:#7a4a00;border-radius:4px;padding:1px 7px;font-size:12px}
.err{color:#a3261b;margin:4px 0}
.login{margin-top:16vh}
.khname{text-align:center;margin:10px 0 0}
.khname h2{margin:0;font-size:26px;color:#7a2e1d}
.cal{background:#fffdf5;border:1px solid #d9cfae;border-radius:6px;padding:10px;margin:12px 0}
.calhd{display:flex;justify-content:space-between;align-items:center;color:#7a2e1d;margin-bottom:6px}
.calhd button{margin:0;padding:4px 14px;font-size:20px}
.grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}
.dn{text-align:center;font-size:12px;color:#7b7562;padding:2px 0}
.day{min-height:46px;border:1px solid #e6dcbb;border-radius:5px;padding:3px;display:flex;flex-direction:column;align-items:center;cursor:pointer;background:#fff}
.day span{font-size:14px}
.day em{font-style:normal;font-size:9.5px;color:#7a2e1d;font-weight:700;margin-top:auto}
.day.has{background:#c8ebc9;border-color:#2e8b3d}
.day.today{border-color:#7a2e1d}
.day.has em{color:#14532d}
.day.sel{outline:3px solid #7a2e1d;outline-offset:1px}
@media print{body{background:#fff}.wrap{box-shadow:none;border:0}.noprint{display:none!important}}
`;

// ======================================================================
// નિતેશ સિસ્ટમ: સાઇટ → કર્મચારી (પહેલો હંમેશા Supervisor) → હાજરી કેલેન્ડર + ઉપાડ
// ======================================================================
const SITE_KEY = "site-data-v1";
const newEmp = (name, role = "emp") => ({ id: uid(), name, role, att: {}, upad: [] });
const num = (n) => Number(n || 0).toLocaleString("en-IN");
const upadSum = (arr, pre = "") =>
  arr.filter((u) => (u.date || "").startsWith(pre)).reduce((s, u) => s + Number(u.amount || 0), 0);

function loadSites() {
  try {
    const raw = localStorage.getItem(SITE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { sites: [] };
}

function SiteApp({ onLogout }) {
  const [data, setData] = useState(loadSites);
  const [sid, setSid] = useState(null);
  const [eid, setEid] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(SITE_KEY, JSON.stringify(data));
    } catch (e) {}
  }, [data]);

  const upSite = (id, fn) =>
    setData((d) => ({ ...d, sites: d.sites.map((s) => (s.id === id ? fn(s) : s)) }));
  const upEmp = (siteId, empId, fn) =>
    upSite(siteId, (s) => ({ ...s, emps: s.emps.map((e) => (e.id === empId ? fn(e) : e)) }));

  const site = data.sites.find((s) => s.id === sid);
  const emp = site && site.emps.find((e) => e.id === eid);

  const addSite = (name, location) =>
    setData((d) => ({
      ...d,
      sites: [...d.sites, { id: uid(), name, location, emps: [newEmp("Supervisor", "sup")] }],
    }));

  const backup = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "site-backup.json";
    a.click();
  };

  let body;
  if (site && emp)
    body = (
      <EmpPage
        site={site}
        emp={emp}
        onBack={() => setEid(null)}
        onChange={(fn) => upEmp(site.id, emp.id, fn)}
        onDelete={() => {
          if (window.confirm("આ કર્મચારીને કાઢી નાખવો?")) {
            upSite(site.id, (s) => ({ ...s, emps: s.emps.filter((e) => e.id !== emp.id) }));
            setEid(null);
          }
        }}
      />
    );
  else if (site)
    body = (
      <SitePage
        site={site}
        onBack={() => setSid(null)}
        onOpen={setEid}
        onChange={(fn) => upSite(site.id, fn)}
        onDelete={() => {
          if (window.confirm("આ સાઇટ અને તેના બધા કર્મચારી કાયમ માટે કાઢી નાખવા?")) {
            setData((d) => ({ ...d, sites: d.sites.filter((s) => s.id !== site.id) }));
            setSid(null);
          }
        }}
      />
    );
  else
    body = <SitesPage data={data} onOpen={setSid} onAdd={addSite} onLogout={onLogout} onBackup={backup} />;

  return (
    <div className="nv">
      <style>{nvCss}</style>
      {body}
    </div>
  );
}

function SitesPage({ data, onOpen, onAdd, onLogout, onBackup }) {
  const [name, setName] = useState("");
  const [loc, setLoc] = useState("");
  const totalMp = data.sites.reduce((s, x) => s + x.emps.length, 0);
  return (
    <>
      <div className="hd">
        <div className="hdrow">
          <div>
            <div className="sub">ડેશબોર્ડ</div>
            <div className="h1">Site Overview</div>
          </div>
          <button className="line-btn noprint" onClick={onLogout}>લૉગ આઉટ</button>
        </div>
      </div>

      <div className="cards">
        <div className="card"><small>કુલ સાઇટ</small><b>{data.sites.length}</b></div>
        <div className="card"><small>કુલ MP</small><b>{totalMp}</b></div>
      </div>

      <div className="sec">Site List</div>
      <div className="tbl">
        <div className="tr th"><span>Site Name</span><span>Location</span><span className="r">MP</span></div>
        {data.sites.map((s, i) => (
          <div key={s.id} className={"tr " + (i % 2 ? "odd" : "even") + " click"} onClick={() => onOpen(s.id)}>
            <b>{s.name}</b>
            <span className="loc">{s.location || "—"}</span>
            <span className="r"><span className="mp">{s.emps.length}</span></span>
          </div>
        ))}
        {data.sites.length > 0 && (
          <div className="tr th tot"><span>કુલ</span><span></span><span className="r">{totalMp}</span></div>
        )}
      </div>
      {data.sites.length === 0 && <p className="mut pad">હજી કોઈ સાઇટ નથી. નીચેથી પહેલી સાઇટ ઉમેરો.</p>}
      <p className="mut pad">MP = કર્મચારીઓની સંખ્યા (Manpower). સાઇટ પર ટેપ કરો તો કર્મચારી ખુલશે.</p>

      <div className="form">
        <b>+ નવી સાઇટ</b>
        <input placeholder="Site Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input placeholder="Location" value={loc} onChange={(e) => setLoc(e.target.value)} />
        <button
          onClick={() => {
            if (!name.trim()) return;
            onAdd(name.trim(), loc.trim());
            setName("");
            setLoc("");
          }}
        >
          ઉમેરો
        </button>
      </div>

      <div className="rowb noprint">
        <button className="line-btn dark" onClick={() => window.print()}>🖨 PDF / પ્રિન્ટ</button>
        <button className="line-btn dark" onClick={onBackup}>💾 બેકઅપ</button>
      </div>
    </>
  );
}

function SitePage({ site, onBack, onOpen, onChange, onDelete }) {
  const [edit, setEdit] = useState(false);
  const [name, setName] = useState("");
  const today = iso(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
  const presentToday = site.emps.filter((e) => e.att[today] === "P").length;

  const addEmp = () => {
    if (!name.trim()) return;
    onChange((s) => ({ ...s, emps: [...s.emps, newEmp(name.trim())] }));
    setName("");
  };
  const removeEmp = (e) => {
    if (e.role === "sup") return;
    if (window.confirm(e.name + " ને કાઢી નાખવો?"))
      onChange((s) => ({ ...s, emps: s.emps.filter((x) => x.id !== e.id) }));
  };

  return (
    <>
      <div className="hd">
        <div className="hdrow">
          <button className="back" onClick={onBack}>← Site List</button>
          <button className="line-btn noprint" onClick={() => setEdit(!edit)}>✎ સુધારો</button>
        </div>
        <div className="h1">{site.name}</div>
        <div className="sub">{site.location || "Location નથી"}</div>
      </div>

      {edit && (
        <div className="form">
          <input placeholder="Site Name" value={site.name} onChange={(e) => onChange((s) => ({ ...s, name: e.target.value }))} />
          <input placeholder="Location" value={site.location} onChange={(e) => onChange((s) => ({ ...s, location: e.target.value }))} />
          <button className="danger" onClick={onDelete}>આ સાઇટ કાઢી નાખો</button>
        </div>
      )}

      <div className="cards">
        <div className="card"><small>કુલ MP</small><b>{site.emps.length}</b></div>
        <div className="card"><small>આજે હાજર</small><b className="g">{presentToday}</b></div>
      </div>

      <div className="sec">Employees</div>
      <div className="pad">
        {site.emps.map((e, i) => {
          const st = e.att[today];
          return (
            <div key={e.id} className={"emp " + (e.role === "sup" ? "sup" : i % 2 ? "odd" : "even")}>
              <div className="empmain" onClick={() => onOpen(e.id)}>
                <span className="no">{i + 1}</span>
                <b>{e.name || "(નામ નથી)"}</b>
                {e.role === "sup" && <span className="badge">Supervisor</span>}
                <span className={"st " + (st || "n")}>{st === "P" ? "હાજર" : st === "A" ? "ગેરહાજર" : "—"}</span>
              </div>
              {e.role !== "sup" && (
                <button className="x noprint" aria-label="કાઢી નાખો" onClick={() => removeEmp(e)}>✕</button>
              )}
            </div>
          );
        })}
      </div>

      <div className="form noprint">
        <b>+ નવો કર્મચારી</b>
        <div className="rowb">
          <input placeholder="કર્મચારીનું નામ" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addEmp()} />
          <button style={{ width: "auto" }} onClick={addEmp}>ઉમેરો</button>
        </div>
      </div>
      <p className="mut pad">Supervisor હંમેશા પહેલો રહેશે અને કાઢી શકાશે નહીં. કર્મચારી પર ટેપ કરો તો હાજરી કેલેન્ડર ખુલશે.</p>
    </>
  );
}

function EmpPage({ site, emp, onBack, onChange, onDelete }) {
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [sel, setSel] = useState(iso(now.getFullYear(), now.getMonth(), now.getDate()));
  const [amt, setAmt] = useState("");
  const [note, setNote] = useState("");
  const [edit, setEdit] = useState(false);

  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const prefix = `${ym.y}-${pad(ym.m + 1)}`;
  const first = new Date(ym.y, ym.m, 1).getDay();
  const days = new Date(ym.y, ym.m + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];

  const upByDate = useMemo(() => {
    const o = {};
    emp.upad.forEach((u) => {
      if (u.date) o[u.date] = (o[u.date] || 0) + Number(u.amount || 0);
    });
    return o;
  }, [emp.upad]);

  const monthKeys = Object.keys(emp.att).filter((k) => k.startsWith(prefix));
  const present = monthKeys.filter((k) => emp.att[k] === "P").length;
  const absent = monthKeys.filter((k) => emp.att[k] === "A").length;
  const monthUpad = upadSum(emp.upad, prefix);
  const monthList = emp.upad.filter((u) => (u.date || "").startsWith(prefix)).sort((a, b) => (a.date < b.date ? -1 : 1));
  const dayUpad = emp.upad.filter((u) => u.date === sel);
  const status = emp.att[sel];

  const go = (delta) => {
    const d = new Date(ym.y, ym.m + delta, 1);
    setYm({ y: d.getFullYear(), m: d.getMonth() });
    setSel(iso(d.getFullYear(), d.getMonth(), 1));
  };
  const setAtt = (val) =>
    onChange((e) => {
      const att = { ...e.att };
      if (val) att[sel] = val;
      else delete att[sel];
      return { ...e, att };
    });
  const addUpad = () => {
    const a = Number(amt);
    if (!a) return;
    onChange((e) => ({ ...e, upad: [...e.upad, { id: uid(), date: sel, amount: a, note: note.trim() }] }));
    setAmt("");
    setNote("");
  };
  const editUpad = (id, patch) =>
    onChange((e) => ({ ...e, upad: e.upad.map((u) => (u.id === id ? { ...u, ...patch } : u)) }));
  const delUpad = (id) => onChange((e) => ({ ...e, upad: e.upad.filter((u) => u.id !== id) }));

  return (
    <>
      <div className="hd">
        <div className="hdrow">
          <button className="back" onClick={onBack}>← {site.name}</button>
          <button className="line-btn noprint" onClick={() => setEdit(!edit)}>✎ સુધારો</button>
        </div>
        <div className="h1">{emp.name || "(નામ નથી)"}</div>
        <div className="sub">{site.name}{site.location ? " · " + site.location : ""}{emp.role === "sup" ? " · Supervisor" : ""}</div>
      </div>

      {edit && (
        <div className="form">
          <input placeholder="નામ" value={emp.name} onChange={(e) => onChange((x) => ({ ...x, name: e.target.value }))} />
          {emp.role !== "sup" && <button className="danger" onClick={onDelete}>આ કર્મચારી કાઢી નાખો</button>}
        </div>
      )}

      <div className="cards three">
        <div className="card"><small>હાજર</small><b className="g">{present}</b></div>
        <div className="card"><small>ગેરહાજર</small><b className="rd">{absent}</b></div>
        <div className="card"><small>આ મહિનાનો ઉપાડ</small><b>{num(monthUpad)}</b></div>
      </div>

      <div className="calnav">
        <button className="sq" aria-label="પાછલો મહિનો" onClick={() => go(-1)}>‹</button>
        <b>{MONTHS[ym.m]} {ym.y}</b>
        <button className="sq" aria-label="આવતો મહિનો" onClick={() => go(1)}>›</button>
      </div>

      <div className="calgrid">
        {DAYS.map((d) => <div key={d} className="dn">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={"e" + i} />;
          const key = iso(ym.y, ym.m, d);
          const st = emp.att[key];
          return (
            <div
              key={key}
              className={"cd " + (st === "P" ? "p" : st === "A" ? "a" : "n") + (key === sel ? " sel" : "") + (key === todayIso ? " today" : "")}
              onClick={() => setSel(key)}
            >
              <b>{d}</b>
              {upByDate[key] ? <em>{num(upByDate[key])}</em> : null}
              {st && <i>{st}</i>}
            </div>
          );
        })}
      </div>
      <div className="legend pad">
        <span><b className="g">■</b> P = હાજર</span>
        <span><b className="rd">■</b> A = ગેરહાજર</span>
        <span><b className="y">પીળી રકમ</b> = ઉપાડ</span>
      </div>

      <div className="form">
        <b>📅 {fmtDate(sel)}</b>
        <div className="rowb noprint">
          <button className={"pa p" + (status === "P" ? " on" : "")} onClick={() => setAtt("P")}>હાજર</button>
          <button className={"pa a" + (status === "A" ? " on" : "")} onClick={() => setAtt("A")}>ગેરહાજર</button>
          <button className="pa c" onClick={() => setAtt(null)}>ભૂંસો</button>
        </div>
        <div className="sub2">આ તારીખનો ઉપાડ: {num(upadSum(dayUpad))}</div>
        {dayUpad.map((u) => (
          <div key={u.id} className="rowb up">
            <input type="number" inputMode="numeric" value={u.amount} onChange={(e) => editUpad(u.id, { amount: e.target.value })} style={{ flex: 1 }} />
            <input placeholder="વિગત" value={u.note || ""} onChange={(e) => editUpad(u.id, { note: e.target.value })} style={{ flex: 1.4 }} />
            <button className="x noprint" aria-label="કાઢી નાખો" onClick={() => delUpad(u.id)}>✕</button>
          </div>
        ))}
        <div className="rowb noprint">
          <input type="number" inputMode="numeric" placeholder="ઉપાડ રકમ" value={amt} onChange={(e) => setAmt(e.target.value)} style={{ flex: 1 }} />
          <input placeholder="વિગત (વૈકલ્પિક)" value={note} onChange={(e) => setNote(e.target.value)} style={{ flex: 1.4 }} />
        </div>
        <button className="noprint" onClick={addUpad}>{fmtDate(sel)} નો ઉપાડ ઉમેરો</button>
      </div>

      <div className="sec">ઉપાડ (Upad) — {MONTHS[ym.m]}</div>
      <div className="pad">
        {monthList.length === 0 && <p className="mut">આ મહિનામાં કોઈ ઉપાડ નથી.</p>}
        {monthList.map((u) => (
          <div key={u.id} className="uprow" onClick={() => setSel(u.date)}>
            <div><b>{fmtDate(u.date)}</b>{u.note && <small> · {u.note}</small>}</div>
            <b>{num(u.amount)}</b>
          </div>
        ))}
        <div className="uprow tot"><b>કુલ (આ મહિનો)</b><b>{num(monthUpad)}</b></div>
        <div className="uprow tot"><b>કુલ ઉપાડ (બધા મહિના)</b><b>{num(upadSum(emp.upad))}</b></div>
      </div>
    </>
  );
}

const nvCss = `
@import url('https://fonts.googleapis.com/css2?family=Hind+Vadodara:wght@400;500;600;700&display=swap');
*{box-sizing:border-box}
body{margin:0;background:#E4EAF4;font-family:"Hind Vadodara",sans-serif;color:#0B2545}
.nv{max-width:520px;margin:0 auto;min-height:100vh;background:#F3F6FB;padding-bottom:40px;box-shadow:0 0 18px #0002}
.nv .hd{background:#0B2545;color:#fff;padding:20px 16px 16px}
.nv .hdrow{display:flex;justify-content:space-between;align-items:center;gap:8px}
.nv .h1{font-size:26px;font-weight:700;color:#fff;margin-top:4px}
.nv .sub{font-size:14px;color:#9DB8E6}
.nv .sub2{font-size:14px;color:#5A6B86;margin:10px 0 4px}
.nv .back{width:auto;background:transparent;color:#9DB8E6;padding:6px 0;margin:0;font-size:15px;font-weight:600}
.nv button{padding:11px 14px;border:0;border-radius:10px;background:#0B2545;color:#fff;font-size:16px;font-weight:600;width:100%;margin-top:8px;font-family:inherit;min-height:44px}
.nv button.line-btn{width:auto;margin:0;background:transparent;color:#fff;border:1px solid #5B7DB8;font-size:14px;padding:8px 14px;min-height:40px}
.nv button.line-btn.dark{color:#0B2545;border-color:#0B2545}
.nv button.danger{background:#B3261E}
.nv button.x{width:44px;margin:0;background:transparent;color:#FF9C94;font-size:22px;padding:0}
.nv .form button.x{color:#B3261E}
.nv button.sq{width:44px;margin:0;background:#fff;color:#0B2545;border:1px solid #BCC9DE;font-size:22px;padding:0}
.nv input{width:100%;height:46px;border:1px solid #BCC9DE;border-radius:10px;padding:0 12px;font-size:16px;margin:4px 0;background:#fff;color:#0B2545;font-family:inherit}
.nv input:focus{outline:2px solid #5B8DEF;border-color:#5B8DEF}
.nv .cards{display:flex;gap:10px;padding:16px 16px 4px}
.nv .card{flex:1;background:#fff;border:1px solid #D5DEEC;border-radius:14px;padding:10px 14px}
.nv .card small{display:block;font-size:12px;color:#5A6B86}
.nv .card b{font-size:28px;color:#0B2545}
.nv .cards.three .card{padding:8px 10px}
.nv .cards.three .card b{font-size:24px}
.nv .g{color:#1E7A45}.nv .rd{color:#B3261E}.nv .y{color:#B48A00}
.nv .sec{font-size:18px;font-weight:700;padding:14px 16px 8px}
.nv .pad{padding:0 16px}
.nv .mut{color:#5A6B86;font-size:13px}
.nv small{color:#5A6B86}
.nv .tbl{margin:0 16px;border-radius:14px;overflow:hidden;border:1px solid #0B2545}
.nv .tr{display:grid;grid-template-columns:1.1fr 1.3fr 60px;align-items:center;gap:8px;padding:13px 16px;color:#fff;font-size:16px}
.nv .tr.th{background:#06172E;font-size:14px;font-weight:700;color:#9DB8E6;letter-spacing:.5px}
.nv .tr.tot{border-top:2px solid #5B8DEF;color:#fff;font-size:17px}
.nv .tr.even{background:#0F2F5C}.nv .tr.odd{background:#143A70}
.nv .tr.click{cursor:pointer}.nv .tr.click:active{background:#1B4F9C}
.nv .loc{color:#C9D8F2}
.nv .r{justify-self:end;text-align:right}
.nv .mp{display:inline-block;min-width:44px;text-align:center;border-radius:20px;padding:2px 10px;font-weight:700;background:#DCE8FF;color:#0B2545}
.nv .form{margin:14px 16px;background:#fff;border:1px solid #D5DEEC;border-radius:14px;padding:12px}
.nv .rowb{display:flex;gap:8px;align-items:center}
.nv .rowb button{margin-top:4px}
.nv .rowb.noprint:last-child{margin:0 16px}
.nv .emp{display:flex;align-items:center;border-radius:12px;color:#fff;margin-bottom:8px}
.nv .emp.even{background:#0F2F5C}.nv .emp.odd{background:#143A70}.nv .emp.sup{background:#1B4F9C}
.nv .empmain{flex:1;display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;min-height:48px;min-width:0}
.nv .empmain b{font-size:17px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.nv .no{width:30px;height:30px;flex:none;border-radius:50%;background:#DCE8FF;color:#0B2545;font-weight:700;display:flex;align-items:center;justify-content:center}
.nv .badge{background:#F2C14E;color:#3A2C06;font-size:12px;font-weight:700;border-radius:10px;padding:2px 10px;flex:none}
.nv .st{margin-left:auto;font-size:12px;font-weight:700;border-radius:10px;padding:2px 8px;flex:none}
.nv .st.P{background:#1E7A45;color:#fff}.nv .st.A{background:#B3261E;color:#fff}.nv .st.n{color:#9DB8E6}
.nv .calnav{display:flex;justify-content:space-between;align-items:center;padding:14px 16px 8px;font-size:20px}
.nv .calgrid{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;padding:0 14px}
.nv .dn{text-align:center;font-size:12px;color:#5A6B86;font-weight:600}
.nv .cd{min-height:54px;border-radius:8px;border:1px solid #D5DEEC;background:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15;cursor:pointer;color:#0B2545;padding:2px}
.nv .cd b{font-size:16px}
.nv .cd em{font-style:normal;font-size:10px;font-weight:700;color:#8A5A00}
.nv .cd i{font-style:normal;font-size:9px;opacity:.9}
.nv .cd.p{background:#1E7A45;border-color:#1E7A45;color:#fff}
.nv .cd.a{background:#B3261E;border-color:#B3261E;color:#fff}
.nv .cd.p em,.nv .cd.a em{color:#FFE08A}
.nv .cd.today{box-shadow:inset 0 0 0 2px #F2C14E}
.nv .cd.sel{outline:3px solid #0B2545;outline-offset:2px}
.nv .legend{display:flex;gap:14px;flex-wrap:wrap;margin-top:10px;font-size:13px;color:#2B3A55}
.nv .pa{margin-top:10px!important}
.nv .pa.p{background:#DCEFE4;color:#1E7A45;border:2px solid #1E7A45}.nv .pa.p.on{background:#1E7A45;color:#fff}
.nv .pa.a{background:#F8DEDC;color:#B3261E;border:2px solid #B3261E}.nv .pa.a.on{background:#B3261E;color:#fff}
.nv .pa.c{background:#DCE8FF;color:#0B2545}
.nv .up input{margin:4px 0}
.nv .uprow{display:flex;justify-content:space-between;align-items:center;background:#fff;border:1px solid #D5DEEC;border-radius:12px;padding:10px 14px;margin-bottom:8px;cursor:pointer}
.nv .uprow.tot{background:#0B2545;color:#fff;cursor:default}
@media print{body{background:#fff}.nv{box-shadow:none}.noprint{display:none!important}}
`;
