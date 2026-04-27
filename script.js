/***********************
 * 全局状态
***********************/
let items = [];
let mode = "normal";

let historyStack = [];
let pressTimer = null;
let lastStats = {};

const ALL_TYPES = [
  "火系", "水系", "冰系", "电系",
  "草系", "恶系", "机械系", "幽系",
  "虫系", "幻系", "绒绒", "犀角鸟"
];

/***********************
 * 图片路径
***********************/
function imgPath(file){
  return "roco-image/" + file;
}

/***********************
 * 初始数据（完整保留你的）
***********************/
window.__INIT_ITEMS__ = [
  { name:"柴渣虫", type:["火系"], count:0, img:"chai.png" },
  { name:"双灯鱼", type:["水系"], count:0, img:"fish.png" },
  { name:"月牙雪熊", type:["冰系"], count:0, img:"bear.png" },
  { name:"粉粉星", type:["电系"], count:0, img:"star.png" },
  { name:"空空颅", type:"幽系", count:0, img:"skull.png" },
  { name:"嗜光嗡嗡", type:["恶系"], count:0, img:"mosquito.png" },
  { name:"贝瑟", type:["机械系"], count:0, img:"pot.png" },
  { name:"粉星仔", type:"幻系", count:0, img:"zai.png" },
  { name:"格兰种子", type:"草系", count:0, img:"seed.png" },
  { name:"奇丽草", type:"草系", count:0, img:"grass.png" },
  { name:"治愈兔", type:["火系"], count:0, img:"rabbit.png" },
  { name:"呼呼猪", type:["冰系"], count:0, img:"pig.png" },
  { name:"大耳帽兜", type:["冰系"], count:0, img:"dou.png" },
  { name:"拉特", type:"电系", count:0, img:"rai.png" },
  { name:"恶魔狼", type:"恶系", count:0, img:"wolf.png" },
  { name:"机械方方", type:"机械系", count:0, img:"cube.png" },
  { name:"绒绒", type:"绒绒", count:0, img:"rong.png" },
  { name:"犀角鸟", type:"犀角鸟", count:0, img:"mop.png" },
  { name:"火红尾", type:"火系", count:0, img:"horse.png" },
  { name:"果冻", type:"水系", count:0, img:"jelly.png" },
  { name:"星尘虫", type:"虫系", count:0, img:"ladybug.png" },
  { name:"影狸", type:"幽系", count:0, img:"fox.png" }
];

/***********************
 * 异色列表
***********************/
const shinyList = [
  "chai.png","fish.png","bear.png","star.png",
  "skull.png","mosquito.png","pot.png","zai.png",
  "seed.png","grass.png","rabbit.png","pig.png",
  "dou.png","rai.png","wolf.png","cube.png",
  "rong.png","mop.png","horse.png"
];

/***********************
 * 初始化
***********************/
window.addEventListener("DOMContentLoaded", init);

function init(){
  loadData();
  bindUI();
  render();
}

/***********************
 * 数据存储
***********************/
function loadData(){
  const saved = localStorage.getItem("items");
  items = saved ? JSON.parse(saved) : window.__INIT_ITEMS__;
}

function saveData(){
  localStorage.setItem("items", JSON.stringify(items));
}

/***********************
 * UI绑定
***********************/
function bindUI(){

  const menuBtn = document.querySelector(".menu-btn");
  const mainMenu = document.getElementById("mainMenu");
  const resetBtn = document.querySelector(".reset-btn");
  const resetMenu = document.getElementById("resetMenu");

  menuBtn.onclick = (e)=>{
    e.stopPropagation();
    mainMenu.style.display =
      mainMenu.style.display === "block" ? "none" : "block";
  };

  resetBtn.addEventListener("contextmenu", (e)=>{
    e.preventDefault();
    showResetMenu(e.pageX, e.pageY);
  });

  document.addEventListener("click", (e)=>{
  mainMenu.style.display = "none";

  const resetMenu = document.getElementById("resetMenu");
  if (resetMenu && !resetMenu.contains(e.target)) {
    resetMenu.style.display = "none";
  }
});
}

function showResetMenu(x, y) {

  const menu = document.getElementById("resetMenu");
  const typeList = document.getElementById("typeList");
  const nameList = document.getElementById("nameList");

  menu.style.display = "block";

  // ⭐居中显示（你现在要求）
  menu.style.left = "50%";
  menu.style.top = "50%";
  menu.style.transform = "translate(-50%, -50%)";

  typeList.innerHTML = "";
  nameList.innerHTML = "";

  // ======================
  // 统计属性
  // ======================
  let typeStats = {};

  items.forEach(item => {
    let types = Array.isArray(item.type) ? item.type : [item.type];

    types.forEach(t => {
      if (!typeStats[t]) typeStats[t] = 0;
      typeStats[t] += item.count;
    });
  });

  // ======================
  // 左边：属性（带数值）
  // ======================
  Object.keys(typeStats).forEach(type => {

    let div = document.createElement("div");
    div.className = "menu-item";

    div.innerText = `${type} (${typeStats[type]})`;

    div.onclick = (e) => {
      e.stopPropagation();

      saveHistory();

      items.forEach(item => {
        let types = Array.isArray(item.type) ? item.type : [item.type];
        if (types.includes(type)) {
          item.count = 0;
        }
      });

      saveData();
      render();
      menu.style.display = "none";
    };

    typeList.appendChild(div);
  });

  // ======================
  // 右边：宠物（带数值）
  // ======================
  items.forEach((item, i) => {

    let div = document.createElement("div");
    div.className = "menu-item";

    div.innerText = `${item.name} (${item.count})`;

    div.onclick = (e) => {
      e.stopPropagation();

      saveHistory();

      item.count = 0;

      saveData();
      render();
      menu.style.display = "none";
    };

    nameList.appendChild(div);
  });
}


/***********************
 * 加减
***********************/
window.addOne = function(i){
  saveHistory();
  items[i].count++;
  saveData();
  render();
};

window.minusOne = function(i){
  saveHistory();
  if(items[i].count > 0) items[i].count--;
  saveData();
  render();
};

/***********************
 * 长按输入
***********************/
window.handleMouseDown = function(i){
  pressTimer = setTimeout(()=>{
    let num = parseInt(prompt("输入数字"));
    if(!isNaN(num)){
      saveHistory();
      items[i].count = Math.max(0, items[i].count + num);
      saveData();
      render();
    }
  }, 600);
};

window.handleMouseUp = function(){
  clearTimeout(pressTimer);
};

/***********************
 * render（核心修复）
***********************/
window.render = function () {

  const container = document.getElementById("container");
  container.innerHTML = "";

  items.forEach((item, i) => {

    const file = item.img.split("/").pop();
    const isShiny = shinyList.includes(file);

    // ⭐默认图片 = 原图（关键修复点）
    let imgSrc = "roco-image/" + file;

    let name = item.name;
    let countText = "数量: " + item.count;

    // ⭐异色模式
    if (mode === "shiny") {

      if (isShiny) {
        imgSrc = "roco-image/shiny/" + file;
      } else {
        imgSrc = ""; // 隐藏但不破坏结构
        name = "";
        countText = "";
      }
    }

    container.innerHTML += `
      <div class="item"
        onclick="addOne(${i})"
        oncontextmenu="event.preventDefault(); minusOne(${i})"
        onmousedown="handleMouseDown(${i})"
        onmouseup="handleMouseUp()">

        <img src="${imgSrc}"
          style="${imgSrc ? '' : 'visibility:hidden'}">

        <div>${name}</div>
        <div class="count">${countText}</div>

      </div>
    `;
  });

  updateStats();
};

/***********************
 * 统计（稳定版）
***********************/
function updateStats(){

  let stats = {};

  items.forEach(item=>{
    let types = Array.isArray(item.type) ? item.type : [item.type];

    types.forEach(t=>{
      stats[t] = (stats[t] || 0) + item.count;
    });
  });

  const box = document.getElementById("stats");

  let html = "";

  for(let t in stats){
    const changed = stats[t] !== lastStats[t];

    html += `
      <div style="color:${changed ? '#000' : '#aaa'}">
        ${t}: ${stats[t]}
      </div>
    `;
  }

  box.innerHTML = html;

  lastStats = {...stats};
}

/***********************
 * reset
***********************/
window.resetAll = function(){
  if(!confirm("确定重置吗？")) return;

  saveHistory();

  items.forEach(i=>i.count = 0);

  saveData();
  render();
};

/***********************
 * 模式切换
***********************/
window.switchMode = function(m){
  mode = m;
  render();
};

/***********************
 * undo
***********************/
window.undo = function(){
  if(historyStack.length === 0) return;

  items = JSON.parse(historyStack.pop());
  saveData();
  render();
};

function saveHistory(){
  historyStack.push(JSON.stringify(items));
  if(historyStack.length > 50) historyStack.shift();
}

let notes = JSON.parse(localStorage.getItem("notes") || "[]");

// 打开/关闭
window.toggleNote = function () {
  const box = document.getElementById("noteBox");

  if (!box) {
    console.error("noteBox没找到");
    return;
  }

  box.style.display = (box.style.display === "flex") ? "none" : "flex";

  renderNotes();
};

// 获取时间
function getTime() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") +
         ":" +
         String(d.getMinutes()).padStart(2, "0");
}

// 渲染
function renderNotes() {
  const list = document.getElementById("noteList");
  if (!list) return;

  list.innerHTML = "";

  notes.forEach(n => {
    const div = document.createElement("div");
    div.innerText = n;
    list.appendChild(div);
  });
}

// 输入记录（核心）
document.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("noteInput");

  if (!input) {
    console.error("noteInput没找到");
    return;
  }

  input.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

      const text = input.value.trim();
      if (!text) return;

      const time = new Date();
      const t = `${String(time.getHours()).padStart(2,"0")}:${String(time.getMinutes()).padStart(2,"0")}`;

      notes.push(`[${t}] ${text}`);

      localStorage.setItem("notes", JSON.stringify(notes));

      input.value = "";
      renderNotes();
    }
  });
});

// 清空
window.clearNotes = function () {
  if (!confirm("确定清空吗？")) return;

  notes = [];
  localStorage.setItem("notes", JSON.stringify(notes));
  renderNotes();
};
