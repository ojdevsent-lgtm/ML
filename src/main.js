import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, doc, setDoc, query, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyDbV4R5qAD80pZ8KqTHIiHFkXwQsNwWGr0",authDomain:"mlgo-86f79.firebaseapp.com",projectId:"mlgo-86f79",storageBucket:"mlgo-86f79.firebasestorage.app",messagingSenderId:"166999251760",appId:"1:166999251760:web:63a3afbdfaf7d6b90346f5",measurementId:"G-JEC3PT5219"};
const db=getFirestore(initializeApp(firebaseConfig));

const questions=[
["Arrange 1/8, 1/7, 1/4, 11/56, 17/56 in ascending order.",["1/8, 1/7, 11/56, 1/4, 17/56","1/8, 1/7, 1/4, 11/56, 17/56","1/7, 1/8, 11/56, 1/4, 17/56","1/8, 11/56, 1/7, 1/4, 17/56"],"A"],
["Simplify (2 1/2 + 1/3 − 1 3/4) ÷ (1/2 + 1 1/3 − 1 1/4).",["3/4","5/6","7/8","13/12"],"D"],
["Simplify 11/8 × 11/7 − 6/5 ÷ 4/5.",["121/56 − 3/2","85/56","37/56","29/14"],"C"],
["Ade gets 3/5 of a total amount. Nelly gets 1/3 of the remainder and Austin gets the rest. If Austin exceeds Nelly by ₦3,000, how much does Austin receive?",["₦9,000","₦10,500","₦12,000","₦13,500"],"D"],
["A salary is spent as follows: 1/4 on rent, 2/5 on food and 1/6 on education. What fraction is left?",["11/60","13/60","1/5","7/30"],"A"],
["The number 192039 was corrected to 192000 by a student. Which of the following can be the correct approximation of figures taken?",["I and II only","II and III only","III and IV only","I, II, III and IV"],"D"],
["A change of ₦75 is given instead of ₦80. What is the percentage error?",["5.0%","6.0%","6.3%","7.0%"],"C"],
["A rectangular table measured 36 cm × 44 cm instead of the actual 37 cm × 41 cm. What is the percentage error in perimeter?",["1.3%","2.0%","2.3%","2.6%"],"D"],
["A measured distance of 3.62 km is 5% more than the actual distance. What is the actual distance?",["3.40 km","3.45 km","3.50 km","3.60 km"],"B"],
["Round 5.0962894 to 3 significant figures.",["5.09","5.10","5.096","5.00"],"B"]
];

const ATTEMPT_KEY="mathLeagueActiveAttempt";
const submittedKey=k=>"mathLeagueSubmitted:"+k;
const TIME_LIMIT=30*60;
const $=id=>document.getElementById(id), home=$("home"), quiz=$("quiz"), result=$("result"), login=$("adminLogin"), dash=$("dashboard");
const key=n=>n.replace(/\D/g,"");
function show(x){[home,quiz,result,login,dash].forEach(e=>e.classList.add("hidden"));x.classList.remove("hidden");window.scrollTo(0,0)}

questions.forEach((q,i)=>{
  const d=document.createElement("div");
  d.className="question";
  d.innerHTML="<h3>"+(i+1)+". "+q[0]+"</h3>"+q[1].map((o,j)=>'<label class="option"><input type="radio" name="q'+i+'" value="'+String.fromCharCode(65+j)+'"> <span>'+String.fromCharCode(65+j)+'. '+o+"</span></label>").join("");
  $("quizForm").appendChild(d);
});

let timerId=null;
let submitting=false;

function getAttempt(){
  try{return JSON.parse(localStorage.getItem(ATTEMPT_KEY)||"null")}catch{return null}
}
function saveAttempt(attempt){
  localStorage.setItem(ATTEMPT_KEY,JSON.stringify(attempt));
}
function clearAttempt(){
  localStorage.removeItem(ATTEMPT_KEY);
}
function readAnswers(){
  return questions.map((_,i)=>document.querySelector('input[name="q'+i+'"]:checked')?.value||"");
}
function writeAnswers(answers=[]){
  questions.forEach((_,i)=>{
    const radio=document.querySelector('input[name="q'+i+'"][value="'+answers[i]+'"]');
    if(radio)radio.checked=true;
  });
}
function renderTimer(seconds){
  const s=Math.max(0,seconds);
  const m=String(Math.floor(s/60)).padStart(2,"0");
  const sec=String(s%60).padStart(2,"0");
  $("timer").textContent=m+":"+sec;
  $("timer").classList.toggle("urgent",s<=300);
}
function startTimer(){
  clearInterval(timerId);
  const attempt=getAttempt();
  if(!attempt)return;
  const tick=()=>{
    const remaining=TIME_LIMIT-Math.floor((Date.now()-attempt.startedAt)/1000);
    renderTimer(remaining);
    if(remaining<=0){
      clearInterval(timerId);
      submitCurrentAttempt(true);
    }
  };
  tick();
  timerId=setInterval(tick,1000);
}
function beginAttempt(name,whatsapp){
  const k=key(whatsapp);
  const attempt={name,whatsapp,studentKey:k,startedAt:Date.now(),answers:Array(questions.length).fill("")};
  saveAttempt(attempt);
  sessionStorage.setItem("studentName",name);
  sessionStorage.setItem("studentWhatsApp",whatsapp);
  $("studentDisplay").textContent=name;
  $("quizMsg").textContent="";
  writeAnswers(attempt.answers);
  show(quiz);
  startTimer();
}
function calculateScore(answers){
  return answers.reduce((s,a,i)=>s+(a===questions[i][2]?1:0),0);
}
async function submitAttempt(auto=false){
  if(submitting)return false;
  const attempt=getAttempt();
  if(!attempt)return false;
  submitting=true;
  clearInterval(timerId);
  const answers=attempt.answers||Array(questions.length).fill("");
  const score=calculateScore(answers);
  try{
    await setDoc(doc(db,"submissions",attempt.studentKey),{
      name:attempt.name,
      whatsapp:attempt.whatsapp,
      studentKey:attempt.studentKey,
      answers,
      score,
      percentage:score*10,
      submittedAt:serverTimestamp()
    });
    localStorage.setItem(submittedKey(attempt.studentKey),"1");
    clearAttempt();
    $("score").textContent=score+"/10";
    $("result").querySelector("p").textContent=auto
      ?"Your attempt was automatically submitted because the page was refreshed, you went back, or the 30-minute time limit ended."
      :"Your result has been recorded. This quiz can only be submitted once for this WhatsApp number.";
    show(result);
    return true;
  }catch(err){
    console.error(err);
    $("quizMsg").textContent=auto
      ?"Your previous attempt could not be submitted yet. Check your internet connection and try again."
      :"Submission failed. Please check your internet connection and try again.";
    submitting=false;
    return false;
  }
}
async function submitCurrentAttempt(auto=false){
  const attempt=getAttempt();
  if(!attempt)return;
  attempt.answers=readAnswers();
  saveAttempt(attempt);
  await submitAttempt(auto);
}

$("studentForm").addEventListener("submit",e=>{
  e.preventDefault();
  const n=$("name").value.trim(),w=$("whatsapp").value.trim(),k=key(w);
  if(!n){$("homeMsg").textContent="Enter your full name.";return}
  if(k.length<7){$("homeMsg").textContent="Enter a valid WhatsApp number.";return}
  if(localStorage.getItem(submittedKey(k))){
    $("homeMsg").textContent="This WhatsApp number has already submitted the quiz.";
    return;
  }
  const active=getAttempt();
  if(active){
    $("homeMsg").textContent="An earlier attempt is still active and will be submitted automatically. Please wait.";
    submitAttempt(true);
    return;
  }
  beginAttempt(n,w);
});

$("quizForm").addEventListener("change",()=>{
  const attempt=getAttempt();
  if(!attempt)return;
  attempt.answers=readAnswers();
  saveAttempt(attempt);
});
$("submitQuiz").addEventListener("click",async()=>{
  const answers=readAnswers();
  if(answers.some(x=>!x)){
    $("quizMsg").textContent="Answer all 10 questions before submitting.";
    return;
  }
  if(!confirm("Submit your quiz? You only have one attempt."))return;
  const attempt=getAttempt();
  if(!attempt)return;
  attempt.answers=answers;
  saveAttempt(attempt);
  $("submitQuiz").disabled=true;
  const ok=await submitAttempt(false);
  if(!ok)$("submitQuiz").disabled=false;
});

$("backHome").onclick=()=>{
  sessionStorage.clear();
  location.reload();
};

window.openAdmin=()=>show(login);
$("adminForm").addEventListener("submit",async e=>{
  e.preventDefault();
  if($("adminPassword").value!=="faithful"){$("adminMsg").textContent="Incorrect password.";return}
  $("adminMsg").textContent="Loading…";
  try{
    const snap=await getDocs(query(collection(db,"submissions"),orderBy("submittedAt","desc")));
    let total=0;
    $("rows").innerHTML="";
    snap.forEach(docSnap=>{
      const d=docSnap.data();
      total+=Number(d.score||0);
      const tr=document.createElement("tr");
      tr.innerHTML="<td>"+escapeHtml(d.name)+"</td><td>"+escapeHtml(d.whatsapp)+"</td><td>"+d.score+"/10</td><td>"+d.percentage+"%</td><td>"+(d.submittedAt?.toDate?.().toLocaleString()||"Pending")+"</td>";
      $("rows").appendChild(tr);
    });
    $("stats").textContent=snap.size+" submissions • Average: "+(snap.size?(total/snap.size).toFixed(2):"0")+"/10";
    show(dash);
  }catch(err){
    $("adminMsg").textContent="Dashboard could not load. Configure Firestore read access for the admin route.";
    console.error(err);
  }
});
$("logout").onclick=()=>show(login);

function escapeHtml(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

const admin=document.createElement("button");
admin.className="adminLink";
admin.textContent="Admin";
admin.onclick=window.openAdmin;
document.body.appendChild(admin);

async function recoverInterruptedAttempt(){
  const attempt=getAttempt();
  if(!attempt)return;
  $("homeMsg").textContent="Previous attempt detected. Submitting it automatically…";
  $("studentDisplay").textContent=attempt.name||"Student";
  writeAnswers(attempt.answers||[]);
  await submitAttempt(true);
}
window.addEventListener("pageshow",e=>{
  if(e.persisted)recoverInterruptedAttempt();
});
recoverInterruptedAttempt();
