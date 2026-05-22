 const firebaseConfig = {
    apiKey: "AIzaSyC1W6mAxVfTZYk3P5R9E6Q-K7aLwydTyYU",
    authDomain: "textit-f2a37.firebaseapp.com",
    projectId: "textit-f2a37",
    storageBucket: "textit-f2a37.firebasestorage.app",
    messagingSenderId: "877853564047",
	databaseURL: "https://textit-f2a37-default-rtdb.asia-southeast1.firebasedatabase.app",
    appId: "1:877853564047:web:8d399ef6370d81ef7464fa",
    measurementId: "G-0JHKDB70YF"
  };

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
function getChatId(user1, user2){
  return [user1, user2].sort().join("_");
}
	$(document).ready(function() {
		
		
	let currentUser = "";
	let stream = null;
	let capturedImage = "";
	let savedNumber = localStorage.getItem("user");
	let savedPassword = "";
	let activeChat = "";


if(savedNumber){
  $(".main-screen").hide();
  $(".chat").show();
}

	setTimeout(function () {
	$(".cont2").addClass("show");
	}, 2500);
	

	/* ================= NAV ================= */
	$("#signupBtn").click(()=>{
	$(".cont2,.logo-box").hide();
	$("#signupPage,.display-logo").css("display","flex");
	});

	$("#loginBtn").click(()=>{
	$(".cont2,.logo-box").hide();
	$("#loginPage,.display-logo").css("display","flex");
	});

	/* ================= SIGNUP ================= */
$("#submitBtn").click(()=>{

  let num = $("#number").val().trim();
  let pass = $("#password").val().trim();
  let cpass = $("#confirm-password").val().trim();
let ans = $("#captchaInput").val().trim();

  if(!/^\d{10}$/.test(num)){
    alert("Enter valid number");
    return;
  }
  if(pass!=cpass){
	  alert("Password mismatch");
	  $("#confirm-password").val("");
  return;
  }

  if(pass.length < 6){
    alert("Password too short");
    return;
  }

  if(parseInt(ans) !== answer){
    alert("Wrong captcha");
	$("#captchaInput").val("");
	generateCaptcha();
    return;
  }

  db.ref("users/" + num).once("value", function(snapshot){

    if(snapshot.exists()){
      alert("User already exists");
	$("#number").val("");
	$("#password").val("");
	$("#confirm-password").val("");
	$("#captchaInput").val("");
 
      return;
    }

 
    db.ref("users/" + num).set({
      number: num,
      password: pass,
      createdAt: Date.now()
    });

    
	$("#number").val("");
	$("#password").val("");
	$("#confirm-password").val("");
	$("#captchaInput").val("");
	
$(".signupResult")
  .text("Signup successful")
  .fadeIn(100);

setTimeout(function(){
  $("#signupPage").fadeOut(300, function(){
    $("#loginPage").fadeIn(300);
  });
}, 800);

  });

});
	/* ================= LOGIN ================= */
	$("#validate").click(() => {

  let num = $("#contact").val().trim();
  let pass = $("#pass").val().trim();

  db.ref("users/" + num).once("value", function(snapshot){

    let user = snapshot.val();

    if(user && user.password === pass){

      savedNumber = num;
	  localStorage.setItem("user", savedNumber);
	  $("#contact").val("");
	  $("#pass").val("");
    $(".validmess")
  .text("Login successful")
  .fadeIn(300);

setTimeout(function(){
  $("#loginPage").fadeOut(300, function(){
    $("#addContact").css("display", "flex");
  });
}, 800);

    } else {
      alert("Invalid login");
	  $("#contact").val("");
	  $("#pass").val("");
    }

  });

});

	/* ================= CAPTCHA ================= */
	let answer;

	function generateCaptcha() {
	let a = Math.floor(Math.random()*10);
	let b = Math.floor(Math.random()*10);
	answer = a + b;
	$("#captchaQuestion").text(a + " + " + b);
	}
	generateCaptcha();

	/* ================= SEND ================= */
$("#send").click(function(){ 

  if(!currentUser){
    alert("Select a contact first");
    return;
  }

  let msg = $("#message").val();
   if(!msg.trim() && !capturedImage) return;

let chatId = getChatId(savedNumber, currentUser);
  if(msg.trim() !== ""){


let newMsgRef = db.ref("chats/" + chatId).push();

newMsgRef.set({
  sender: savedNumber,
  text: msg,
  type: "text",
  time: Date.now()
});
let name = $(".cbutton").filter(function(){
  return $(this).find("small").text() === currentUser;
}).find("span").text() || currentUser;

updateChatList(name, msg, currentUser);
  }

  if(capturedImage !== ""){

let newImgRef = db.ref("chats/" + chatId).push();

newImgRef.set({
  sender: savedNumber,
  image: capturedImage,
  type: "image",
  time: Date.now()
});

let name = $(".cbutton").filter(function(){
  return $(this).find("small").text() === currentUser;
}).find("span").text() || currentUser;

updateChatList(name, "📷 Photo", currentUser);

    capturedImage = "";
    $("#previewImg").hide();
  }
$("#message").val("");
scrollDown();   
});


function listenMessages(){
  if(!currentUser) return; 

  let chatId = getChatId(savedNumber, currentUser);

  db.ref("chats/" + chatId).off("child_added");

  db.ref("chats/" + chatId).on("child_added", function(snapshot){

    let msg = snapshot.val();
    let msgId = snapshot.key;

    let sender = msg.sender;

    //  ADD THIS BLOCK
    if(sender !== savedNumber){

      let name = $(".cbutton").filter(function(){
        return $(this).find("small").text() === sender;
      }).find("span").text() || sender;

      let lastMsg = msg.type === "text" ? msg.text : "📷 Photo";

      updateChatList(name, lastMsg, sender);
    }

    // ================= TEXT =================
    if(msg.type === "text"){

      let div = $("<div>")
        .addClass("msg")
        .addClass(msg.sender === savedNumber ? "sent" : "received")
        .text(msg.text)
        .attr("data-id", msgId);

      $("#chatBody").append(div);
    }

    // ================= IMAGE =================
    if(msg.type === "image"){

      let img = $("<img>")
        .attr("src", msg.image)
        .addClass("msg-img")
        .attr("data-id", msgId);

      img.click(function(){
        $("#fullImg").attr("src", msg.image);
        $("#imgPreview").css("display", "flex");
      });

      if(msg.sender === savedNumber){
        img.addClass("sent");
      } else {
        img.addClass("received");
      }

      $("#chatBody").append(img);
    }

    scrollDown();
  });
}
let pressTimer;

$(document).on("mousedown touchstart", ".msg, .msg-img", function(){

  let element = $(this);

  pressTimer = setTimeout(function(){

    let msgId = element.attr("data-id");
    let chatId = getChatId(savedNumber, currentUser);

    // check if message is yours
    let isMine = element.hasClass("sent");

    let choice;

    if(isMine){
      //  sender both options
      choice = prompt(
        "Type:\n1 → Delete for me\n2 → Delete for everyone"
      );
    } else {
      // receiver only delete for me
     let result= confirm("Delete");
	 if (result){
		 element.remove();
    }
	}

    //  Delete for me
    if(choice === "1"){
      element.remove();
    }

    //  Delete for everyone (only if sender)
    else if(choice === "2" && isMine){
      db.ref("chats/" + chatId + "/" + msgId).remove();
      element.remove();
    }

  }, 700);

});

$(document).on("mouseup mouseleave touchend", ".msg, .msg-img", function(){
  clearTimeout(pressTimer);
});	/* ================= CAMERA ================= */
	$("#openCamera").click(async function(){
	$("#cameraBox").css("display","flex");

	try{
	stream = await navigator.mediaDevices.getUserMedia({ video: true });
	$("#video")[0].srcObject = stream;
	}catch(err){
	alert("Camera not allowed");
	}
	});

	$("#capture").click(function(){

	let video = document.getElementById("video");

	let canvas = document.createElement("canvas");
	canvas.width = video.videoWidth;
	canvas.height = video.videoHeight;

	canvas.getContext("2d").drawImage(video, 0, 0);

	capturedImage = canvas.toDataURL("image/png");

	$("#previewImg").attr("src", capturedImage).show();

	$("#cameraBox").hide();

	if(stream){
	stream.getTracks().forEach(track => track.stop());
	}
	});

	/* CLOSE CAMERA */
	$("#closeCam").click(function(){
	$("#cameraBox").hide();
	if(stream){
	stream.getTracks().forEach(track => track.stop());
	}
	});

	/* ================= PREVIEW ================= */
	$("#previewImg").click(function(){
	$(this).hide();
	capturedImage = "";
	});

	$("#imgPreview").click(function(){
	$(this).hide();
	});

	/* ================= BACK ================= */
	$("#backBtn").click(function(){
	$(".box").hide();
	$(".chat,.new").show();
	});

$("#fileInput").change(function(e){

  let file = e.target.files[0];
  if(!file) return;

  let reader = new FileReader();

  reader.onload = function(event){
    capturedImage = event.target.result;

    $("#previewImg")
      .attr("src", capturedImage)
      .show();
  };

  reader.readAsDataURL(file);
   $(this).val("");
});
$("#photoInput").change(function(e){

  let file = e.target.files[0];
  if(!file) return;

  let reader = new FileReader();

  reader.onload = function(event){
    capturedImage = event.target.result;

    $("#previewImg")
      .attr("src", capturedImage)
      .show();
  };

  reader.readAsDataURL(file);
   $(this).val("");
});

	function updateChatList(name, message, number){

	let initial = name.charAt(0).toUpperCase();

let existing = $(".chat-item[data-number='"+number+"']");
	if(existing.length){
	existing.find(".lastMsg").text(message);
	} else {

	let item = `
	<div class="chat-item" 
     data-name="${name}" 
     data-number="${number}"   
     style="display:flex; align-items:center; gap:10px; padding:10px;">
	<div class="avatar" style="background:${getRandomColor()}">${initial}</div>

	<!-- Text container -->
	<div style="display:flex; flex-direction:column;">
	<span style="font-weight:600;font-family: 'Merriweather Sans', sans-serif;">${name}</span>
	<span class="lastMsg" style= color:#777;">${message}</span>
	</div>

	</div>
	`;

	$(".chat-list").prepend(item);
	}
	}


	$("#searchbar").on("keyup", function () {
	let value = $(this).val().toLowerCase();

	$(".chat-item").each(function () {
  $(this).toggle($(this).text().toLowerCase().includes(value));
});
	});

	/* ================= ADD CONTACT ================= */
	$(".add").click(()=>{

	let name = $(".name:visible").val();
	let number = $(".cnumber:visible").val();

	if(!name || !/^\d{10}$/.test(number)){
	alert("Enter valid details");
	return;
	}

	let initial = name.charAt(0).toUpperCase();

	/* ---------- CREATE ELEMENTS ---------- */
	let avatar = $("<div>")
	.addClass("avatar")
	.text(initial)
	.css("background", getRandomColor());
	let nameText = $("<span>").text(name);
let numberText = $("<small>").text(number).hide();

	/* ---------- DELETE BUTTONS ---------- */
	let delBtnList = $("<button>❌</button>").css({
	background:"none",
	border:"none",
	cursor:"pointer",
	marginLeft:"auto"
	});

	let delBtnContact = delBtnList.clone(); 

	/* ---------- LIST ITEM (tab4) ---------- */
	let li = $("<li></li>").css({
	display:"flex",
	alignItems:"center",
	gap:"10px"
	});

	li.append(avatar.clone())
	.append(nameText.clone())
	.append(delBtnList);

	$("#list").append(li);

	/* ---------- CONTACT CARD (tab6) ---------- */
	let contact = $("<div>")
  .addClass("cbutton")
  .append(avatar)
  .append(nameText)
  .append(numberText)   
  .append(delBtnContact);;

	$(".main").append(contact);

	/* ---------- DELETE LOGIC ---------- */
	function removeBoth(e){
	e.stopPropagation();

	li.remove();
	contact.remove();

$(".chat-item[data-number='"+number+"']").remove();

	}

	delBtnList.click(removeBoth);
	delBtnContact.click(removeBoth);

	/* ---------- CLEAR INPUT ---------- */
	$(".name,.cnumber").val("");
	});
	/* ================= OPEN CHAT ================= */
	$(document).on("click",".cbutton",function(e){

  if($(e.target).text() === "❌") return;

let number = $(this).find("small").text();
let name = $(this).find("span").text();
 let avatar = $(this).find(".avatar").text(); 
currentUser = number;  
activeChat = number;

$("#chatName").text(name);
  $("#chatAvatar").text(avatar);

  $(".tab6").hide();
  $(".box").css("display","flex");

  loadMessages();
  listenMessages();
});

$(document).on("click", ".chat-item", function(){

  let number = $(this).data("number"); 
  let name = $(this).data("name");

  currentUser = number;   
  activeChat = number;

  $("#chatName").text(name);
  $("#chatAvatar").text(name.charAt(0).toUpperCase());

  $(".chat").hide();
  $(".box").css("display","flex");

  loadMessages();
  listenMessages();
});
	/* ================= LOAD CHAT ================= */
	function loadMessages(){
  $("#chatBody").html("");
  setTimeout(scrollDown, 100);
}
	
	/* ================= SCROLL ================= */
	function scrollDown(){
	$("#chatBody").scrollTop($("#chatBody")[0].scrollHeight);
	}

	/* ================= FLOW ================= */
	$("#finish").click(function () {
	$(".main-screen").hide();
	$(".tab5").addClass("show");

	setTimeout(function () {
	$(".tab5").removeClass("show");

	setTimeout(function () {
	$(".chat").fadeIn(200);
	$("#profilePopup").fadeIn(400);
	}, 200); 
	}, 4000); 
	});
	$("#newchat").click(()=>{
	$(".chat,.new").hide();
	$(".tab6").show();
	});

	$("#addchat").click(()=>{
	$(".cont4").fadeIn(300);
	});


	$(".qr").on("mouseenter", function () {
  $("body").addClass("blur-bg");
});

$(".qr").on("mouseleave", function () {
  $("body").removeClass("blur-bg");
});

	$(document).on("mouseenter", ".profile, #chatAvatar", function(e){

	$("#pName").text("Name: " + (profileName || "Not set"));
	$("#pNumber").text("Mobile: " + (savedNumber || "Not set"));

	$("#profileHover")
	.css({
	top: e.pageY + 10,
	left: e.pageX - 120
	})
	.stop(true,true)
	.fadeIn(200);

	});

	$(document).on("mouseleave", ".profile, #chatAvatar", function(){
	$("#profileHover").stop(true,true).fadeOut(200);
	});

	/* Keep popup visible when hovering it */
	$(".profile, #chatAvatar, #profileHover").hover(
  function(){
    $("#profileHover").stop(true,true).show();
  },
  function(){
    setTimeout(function(){
      if(!$("#profileHover:hover").length){
        $("#profileHover").fadeOut(200);
      }
    }, 200);
  }
);
	function getRandomColor(){
	let colors = [
	"#f44336", "#e91e63", "#9c27b0", "#673ab7",
	"#3f51b5", "#2196f3", "#03a9f4", "#00bcd4",
	"#009688", "#4caf50", "#8bc34a", "#ffc107",
	"#ff9800", "#ff5722"
	];
	return colors[Math.floor(Math.random() * colors.length)];
	}
	});

	/* ================= GLOBAL ================= */
	function go(){
	$(".tab6").hide();
	$(".chat,.new").show();
	}
	let profileName = "";

	function saveProfile(){
	let name = $("#profileName").val();

	if(name){
	profileName = name;  
	$(".profile").text(name.charAt(0).toUpperCase());
	}

	$("#profilePopup").hide();
	}

	function skipProfile(){
	$("#profilePopup").hide();
	}

	function closepop(){
	$(".cont4").fadeOut(300);
	}

	function goBack(){
	$(".sign,.display-logo").hide();
	$(".cont2,.logo-box").show();
	}
function logout(){
  localStorage.removeItem("user");
  location.reload();
}
function showAllUsers(){
  db.ref("users").once("value", function(snapshot){

    let users = snapshot.val();

    console.log("All Users:", users);

    for(let key in users){
      console.log("Number:", users[key].number);
      console.log("Password:", users[key].password);
      console.log("------");
    }

  });
}
