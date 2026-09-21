import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, getDocs, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig={apiKey:"AIzaSyDUMMY_REPLACE_WITH_YOUR_EXISTING_KEY",authDomain:"mlgo-86f79.firebaseapp.com",projectId:"mlgo-86f79",storageBucket:"mlgo-86f79.firebasestorage.app",messagingSenderId:"166999251760",appId:"1:166999251760:web:63a3afbdfaf7d6b90346f5",measurementId:"G-JEC3PT5219"};
const db=getFirestore(initializeApp(firebaseConfig));

const questions=[
["Arrange 1/8, 1/7, 1/4, 11/56, 17/56 in ascending order.",["1/8, 1/7, 11/56, 1/4, 17/56","1/8, 1/7, 1/4, 11/56, 17/56","1/7, 1/8, 11/56, 1/4, 17/56","1/8, 11/56, 1/7, 1/4, 17/56"],"A"],
["Simplify (2 1/2 + 1/3 − 1 3/4) ÷ (1/2 + 1 1/3 − 1 1/4).",["3/4","5/6","7/8","13/12"],"D"],
["Simplify 11/8 × 11/7 − 6/5 ÷ 4/5.",["121/56 − 3/4","85/56","247/140","29/14"],"C"],
["Ade gets 3/5 of a total amount. Nelly gets 1/3 of the remainder and Austin gets the rest. If Austin exceeds Nelly by ₦3,000, how much does Austin receive?",["₦9,000","₦10,500","₦12,000","₦13,500"],"D"],
["A salary is spent as follows: 1/4 on rent, 2/5 on food and 1/6 on education. What fraction is left?",["11/60","13/60","1/5","7/30"],"A"],
["192039 is corrected to 192000. Which is a possible approximation figure?",["192","1.92 × 10⁴","1.920 × 10⁶","1.92 × 10⁵"],"D"],
["A change of ₦75 is given instead of ₦80. What is the percentage error?",["5.0%","6.0%","6.3%","7.0%"],"C"],
["A rectangular table measured 36 cm × 44 cm instead of the actual 37 cm × 41 cm. What is the percentage error in perimeter?",["1.3%","2.0%","2.3%","2.6%"],"D"],
["A measured distance of 3.62 km is 5% more than the actual distance. What is the actual distance?",["3.40 km","3.45 km","3.50 km","3.60 km"],"B"],
["Round 5.0962894 to 3 significant figures.",["5.09","5.10","5.096","5.00"],"B"]
];

const $=id=>document.getElementById(id), home=$("home"), quiz=$("quiz"), result=$("result"), login=$("adminLogin"), dash=$("dashboard");
const key=n=>n.replace(/\D/g,"");
function show(x){[home,quiz,result,login,dash].forEach(e=>e.classList.add("hidden"));x.classList.remove("hidden");window.scrollTo(0,0)}
questions.forEach((q,i)=>{const d=document.createElement("div");d.className="question";d.innerHTML="<h3>"+(i+1)+". "+q[0]+"</h3>"+q[1].map((o,j)=>'<label class="option"><input type="radio" name="q'+i+'" value="'+String.fromCharCode(65+j)+'"> <span>'+String.fromCharCode(65+j)+'. '+o+"</span></label>").join("");$("quizForm").appendChild(d)});
$("studentForm").addEventListener("submit",e=>{e.preventDefault();const n=$("name").value.trim(),w=$("whatsapp").value.trim(),k=key(w);if(k.length<7){$("homeMsg").textContent="Enter a valid WhatsApp number.";return}if(localStorage.getItem("mathLeagueSubmitted:"+k)){ $("homeMsg").textContent="This WhatsApp number has already submitted the quiz.";return}sessionStorage.setItem("studentName",n);sessionStorage.setItem("studentWhatsApp",w);$("studentDisplay").textContent=n;show(quiz)});
$("submitQuiz").addEventListener("click",async()=>{const answers=questions.map((_,i)=>document.querySelector('input[name="q'+i+'"]:checked')?.value);if(answers.some(x=>!x)){$("quizMsg").textContent="Answer all 10 questions before submitting.";return}if(!confirm("Submit your quiz? You only have one attempt."))return;const score=answers.reduce((s,a,i)=>s+(a===questions[i][2]?1:0),0),n=sessionStorage.getItem("studentName"),w=sessionStorage.getItem("studentWhatsApp"),k=key(w);$("submitQuiz").disabled=true;try{await addDoc(collection(db,"submissions"),{name:n,whatsapp:w,studentKey:k,answers,score,percentage:score*10,submittedAt:serverTimestamp()});localStorage.setItem("mathLeagueSubmitted:"+k,"1");$("score").textContent=score+"/10";show(result)}catch(err){$("quizMsg").textContent="Submission failed. Please try again.";console.error(err);$("submitQuiz").disabled=false}});
$("backHome").onclick=()=>{sessionStorage.clear();location.reload()};
window.openAdmin=()=>show(login);
$("adminForm").addEventListener("submit",async e=>{e.preventDefault();if($("adminPassword").value!=="faithful"){$("adminMsg").textContent="Incorrect password.";return}$("adminMsg").textContent="Loading…";try{const snap=await getDocs(query(collection(db,"submissions"),orderBy("submittedAt","desc")));let total=0; $("rows").innerHTML="";snap.forEach(doc=>{const d=doc.data();total+=Number(d.score||0);const tr=document.createElement("tr");tr.innerHTML="<td>"+escapeHtml(d.name)+"</td><td>"+escapeHtml(d.whatsapp)+"</td><td>"+d.score+"/10</td><td>"+d.percentage+"%</td><td>"+(d.submittedAt?.toDate?.().toLocaleString()||"Pending")+"</td>";$("rows").appendChild(tr)});$("stats").textContent=snap.size+" submissions • Average: "+(snap.size?(total/snap.size).toFixed(2):"0")+"/10";show(dash)}catch(err){$("adminMsg").textContent="Dashboard could not load. Configure Firestore read access for the admin route.";console.error(err)}});
$("logout").onclick=()=>show(login);
function escapeHtml(s=""){return s.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
const admin=document.createElement("button");admin.className="adminLink";admin.textContent="Admin";admin.onclick=window.openAdmin;document.body.appendChild(admin);