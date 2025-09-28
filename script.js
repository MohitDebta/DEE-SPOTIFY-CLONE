let currentsong = new Audio();
let currentsongindex = 0;
let songs = [];
let currentAlbum = null;
let currentTrack = null;

let isShuffle = false;
let repeatMode = 0; // 0=off,1=repeat all,2=repeat one

// Album Data (original filenames with spaces/special chars)
let albums = [
  { name: "P-POP CULTURE", cover: "card1.jpeg", desc: "Trendy P-POP vibes.", songs: ["I Really Do....mp3","For A Reason.mp3","You're U Tho.mp3","HIM..mp3","MF Gabhru!.mp3","P-POP CULTURE.mp3"] },
  { name: "HEARTIES", cover: "card2.webp", desc: "Romantic tracks.", songs: ["Tum Se Hi.mp3","Kabhi Kabhi Aditi.mp3","Kyon.mp3"] },
  { name: "OLDEES", cover: "card3.webp", desc: "Golden classics.", songs: ["Woh Shaam Kuchh Ajeeb Thi.mp3","O Mere Dil Ke Chain.mp3","Pukarta Chala Hoon Main.mp3"] }
];

// Render album cards
let cardContainer = document.querySelector(".card-container");
albums.forEach(album => {
  let card = document.createElement("div");
  card.classList.add("card");
  card.innerHTML = `
    <img src="${album.cover}" alt="${album.name}">
    <h3>${album.name}</h3>
    <p class="desc">${album.desc}</p>
    <p>${album.songs.length} songs</p>
    <svg class="play" viewBox="0 0 100 100" height="50" width="50">
      <circle cx="50" cy="50" r="48" fill="green" />
      <path d="M42 35 Q42 33 44 34 L66 48 Q68 50 66 52 L44 66 Q42 67 42 65 Z" fill="#000000" />
    </svg>
  `;
  ["img","h3",".desc"].forEach(sel=>{
    card.querySelector(sel).addEventListener("click", ()=>loadAlbum(album,true));
  });
  card.querySelector(".play").addEventListener("click", e=>{
    e.stopPropagation();
    if(currentAlbum===album && !currentsong.paused){ currentsong.pause(); updatePlayIcon(false);}
    else { loadAlbum(album,true);}
  });
  cardContainer.appendChild(card);
});

// Load album songs
function loadAlbum(album, autoplay=false){
  songs = album.songs;
  currentsongindex = 0;
  currentAlbum = album;
  let songul = document.querySelector(".song-list ul");
  songul.innerHTML = "";
  songs.forEach(song=>{
    let li = document.createElement("li");
    li.dataset.track = song;
    li.innerHTML = `<div class="info"><div>${song.replace(".mp3","")}</div><div>${album.name}</div></div>`;
    li.addEventListener("click", ()=>{ playmusic(song); currentsong.play(); updatePlayIcon(true); });
    songul.appendChild(li);
  });
  if(autoplay){ playmusic(songs[0]); currentsong.play(); updatePlayIcon(true); }
}

// Play music
function playmusic(track){
  currentsongindex = songs.indexOf(track);
  // Encode filename for GitHub Pages
  currentsong.src = "songs/" + encodeURIComponent(track);
  currentsong.onerror = ()=>console.error("Audio failed to load:", currentsong.src);
  currentTrack = track;
  document.querySelector(".song-info").innerText = track.replace(".mp3","");

  currentsong.ontimeupdate = ()=>{
    if(!isNaN(currentsong.duration)){
      document.querySelector(".song-time").innerText=`${formatTime(currentsong.currentTime)} / ${formatTime(currentsong.duration)}`;
      document.querySelector(".seekbar").max = currentsong.duration;
      document.querySelector(".seekbar").value = currentsong.currentTime;
    }
  };

  currentsong.onended = ()=>{
    if(repeatMode===2){ playmusic(songs[currentsongindex]); currentsong.play();}
    else if(isShuffle){
      let nextIndex; do{ nextIndex=Math.floor(Math.random()*songs.length); } while(nextIndex===currentsongindex && songs.length>1);
      currentsongindex = nextIndex; playmusic(songs[currentsongindex]); currentsong.play();
    } else if(repeatMode===1){
      currentsongindex = (currentsongindex+1)%songs.length; playmusic(songs[currentsongindex]); currentsong.play();
    } else {
      if(currentsongindex<songs.length-1){ currentsongindex++; playmusic(songs[currentsongindex]); currentsong.play();}
      else updatePlayIcon(false);
    }
    updatePlayIcon(true);
  };
  highlightCurrentSong();
}

// Highlight current song in sidebar
function highlightCurrentSong(){
  document.querySelectorAll(".song-list li").forEach(li=>{
    li.classList.remove("active");
    if(li.dataset.track===currentTrack) li.classList.add("active");
  });
}

function formatTime(sec){
  let m=Math.floor(sec/60), s=Math.floor(sec%60);
  return `${m}:${s.toString().padStart(2,"0")}`;
}

// Play/Pause
const playbutton = document.querySelector(".play-song");
const playShape = document.querySelector(".play-shape");
const pauseShape = document.querySelector(".pause-shape");

function updatePlayIcon(isPlaying){
  if(isPlaying){ playShape.style.display="none"; pauseShape.style.display="block"; }
  else{ playShape.style.display="block"; pauseShape.style.display="none"; }

  document.querySelectorAll(".card .play path").forEach(p=>{
    if(currentAlbum && p.closest(".card").querySelector("h3").innerText===currentAlbum.name){
      p.setAttribute("d", isPlaying ? "M38 35 H45 V65 H38 Z M55 35 H62 V65 H55 Z" : "M42 35 Q42 33 44 34 L66 48 Q68 50 66 52 L44 66 Q42 67 42 65 Z");
    } else p.setAttribute("d","M42 35 Q42 33 44 34 L66 48 Q68 50 66 52 L44 66 Q42 67 42 65 Z");
  });
}

playbutton.addEventListener("click", ()=>{
  if(!currentsong.src) return;
  if(currentsong.paused){ currentsong.play(); updatePlayIcon(true);}
  else{ currentsong.pause(); updatePlayIcon(false);}
});

// Seekbar
document.querySelector(".seekbar").addEventListener("input", e=>{
  currentsong.currentTime = e.target.value;
});

// Prev/Next
document.querySelector(".prev-song").addEventListener("click", ()=>{
  if(!songs.length) return;
  currentsongindex = currentsongindex>0 ? currentsongindex-1 : songs.length-1;
  playmusic(songs[currentsongindex]); currentsong.play(); updatePlayIcon(true);
});
document.querySelector(".next-song").addEventListener("click", ()=>{
  if(!songs.length) return;
  currentsongindex = (currentsongindex+1)%songs.length; playmusic(songs[currentsongindex]); currentsong.play(); updatePlayIcon(true);
});

// Shuffle
const shuffleBtn = document.querySelector(".shuffle-icon");
shuffleBtn.addEventListener("click", ()=>{
  isShuffle = !isShuffle;
  shuffleBtn.querySelector("circle").setAttribute("fill", isShuffle?"#FFD700":"green");
});

// Repeat
const repeatBtn = document.querySelector(".repeat-song");
repeatBtn.addEventListener("click", ()=>{
  repeatMode = (repeatMode+1)%3;
  let circle = repeatBtn.querySelector("circle");
  if(repeatMode===0) circle.setAttribute("fill","green");
  else if(repeatMode===1) circle.setAttribute("fill","#1DB954");
  else circle.setAttribute("fill","#FFD700");
});

// Sidebar
const hamburger = document.querySelector(".hamburger");
const leftSidebar = document.querySelector(".left");
const overlay = document.querySelector(".overlay");

hamburger.addEventListener("click", ()=>{
  leftSidebar.classList.toggle("show");
  overlay.classList.toggle("show");
});

overlay.addEventListener("click", ()=>{
  leftSidebar.classList.remove("show");
  overlay.classList.remove("show");
});
