// Slideshow
const imagePath = "imagenes/";
const len = 71;
const images = Array.from({ length: len }, (_, i) => `imagen_${i + 1}.jpg`);

function getSeed() {
  const now = new Date();
  return now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
}

function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function getDailyDefaultSlideIndex() {
  const seed = getSeed();
  return Math.floor(seededRandom(seed) * len) + 1;
}

let slideIndex = localStorage.getItem("slideIndex");
const dailyDefaultSlideIndex = getDailyDefaultSlideIndex();

if (!slideIndex) {
  slideIndex = dailyDefaultSlideIndex;
  localStorage.setItem("slideIndex", slideIndex);
} else {
  slideIndex = parseInt(slideIndex, 10);
  const lastAccessedDate = localStorage.getItem("lastAccessedDate");
  const currentDate = new Date().toDateString();
  if (lastAccessedDate !== currentDate) {
    slideIndex = dailyDefaultSlideIndex;
    localStorage.setItem("slideIndex", slideIndex);
  }
}

localStorage.setItem("lastAccessedDate", new Date().toDateString());
const slideshow = document.getElementById("slideshow");
images.forEach((img, i) => {
  slideshow.innerHTML += `<div class="mySlides"><img src="${imagePath}${img}" style="cursor:pointer;" onclick="changeSlide(1)"></div>`;
});

function changeSlide(n) {
  setSlide(slideIndex + n);
}

function setSlide(n) {
  const slides = document.getElementsByClassName("mySlides");
  slideIndex = n > slides.length ? 1 : n < 1 ? slides.length : n;
  [...slides].forEach((s, i) => {
    s.style.opacity = i === slideIndex - 1 ? "1" : "0";
    s.style.transition = "opacity .7s";
  });
  localStorage.setItem("slideIndex", slideIndex);
}

setSlide(slideIndex);

// Clock
// Clock
function updateClock() {
  const now = new Date();

  // Día, mes, año
  const dayOfMonth = String(now.getDate()).padStart(2, "0");
  const months = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const month = months[now.getMonth()];
  const year = now.getFullYear();

  // Hora en formato 12h con am/pm
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12; // el "0" lo convierte en 12
  hours = String(hours).padStart(2, "0");

  const time = `${hours}:${minutes} ${ampm}`;

  // Texto final
  const dateString = `${dayOfMonth}/${month}/${year} - ${time}`;

  document.getElementById("codes").textContent = dateString;
  setTimeout(updateClock, 1000);
}

updateClock();

// Background Animation
const canvasBody = document.getElementById("canvas");
const drawArea = canvasBody.getContext("2d");
let w, h, particles;

const opts = {
  particleColor: "rgb(0, 255, 0)",
  lineColor: "rgb(51, 255, 51)",
  particleAmount: 50,
  defaultSpeed: 0.9,
  variantSpeed: 0.5,
  defaultRadius: 3,
  variantRadius: 8,
  linkRadius: 200,
};

function resizeReset() {
  w = canvasBody.width = window.innerWidth;
  h = canvasBody.height = window.innerHeight;
}

window.addEventListener("resize", () => {
  clearTimeout(window.resizeTimeout);
  window.resizeTimeout = setTimeout(resizeReset, 200);
});

function checkDistance(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

function linkPoints(point1, hubs) {
  const rgb = opts.lineColor.match(/\d+/g);
  for (let i = 0; i < hubs.length; i++) {
    const distance = checkDistance(point1.x, point1.y, hubs[i].x, hubs[i].y);
    const opacity = 1 - distance / opts.linkRadius;
    if (opacity > 0) {
      drawArea.lineWidth = 0.5;
      drawArea.strokeStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
      drawArea.beginPath();
      drawArea.moveTo(point1.x, point1.y);
      drawArea.lineTo(hubs[i].x, hubs[i].y);
      drawArea.stroke();
    }
  }
}

class Particle {
  constructor() {
    this.x = Math.random() * w;
    this.y = Math.random() * h;
    this.speed = opts.defaultSpeed + Math.random() * opts.variantSpeed;
    this.directionAngle = Math.random() * Math.PI * 2;
    this.color = opts.particleColor;
    this.radius = opts.defaultRadius + Math.random() * opts.variantRadius;
    this.vector = {
      x: Math.cos(this.directionAngle) * this.speed,
      y: Math.sin(this.directionAngle) * this.speed,
    };
  }

  update() {
    this.border();
    this.x += this.vector.x;
    this.y += this.vector.y;
  }

  border() {
    if (this.x >= w || this.x <= 0) this.vector.x *= -1;
    if (this.y >= h || this.y <= 0) this.vector.y *= -1;
    this.x = Math.max(0, Math.min(w, this.x));
    this.y = Math.max(0, Math.min(h, this.y));
  }

  draw() {
    drawArea.beginPath();
    drawArea.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    drawArea.fillStyle = this.color;
    drawArea.fill();
  }
}

function setup() {
  particles = [];
  resizeReset();
  for (let i = 0; i < opts.particleAmount; i++) {
    particles.push(new Particle());
  }
  loop();
}

function loop() {
  drawArea.clearRect(0, 0, w, h);
  for (const particle of particles) {
    particle.update();
    particle.draw();
  }
  for (const particle of particles) {
    linkPoints(particle, particles);
  }
  requestAnimationFrame(loop);
}
setup();
