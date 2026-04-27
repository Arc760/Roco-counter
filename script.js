/***********************
 * 全局状态
***********************/
let items = [];
let mode = "normal";

let historyStack = [];
let pressTimer = null;
let lastStats = {};

let autoLogs = [];  // 系统日志

let noteMode = "player"; // player / system

let isLongPress = false;

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
  bindNoteInput();
  render();
  renderNotes();
}

function bindNoteInput(){

  const input = document.getElementById("noteInput");

  if (!input) {
    console.error("❌ noteInput 没找到");
    return;
  }

  input.onkeydown = function(e){

    if (e.key === "Enter") {

      e.preventDefault(); // ⭐防止换行问题

      const text = input.value.trim();
      if (!text) return;

      const now = new Date();

      const t = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

      playerNotes.push({
        date: now.toLocaleDateString(),
        time: t,
        text: text
      });

      localStorage.setItem("playerNotes", JSON.stringify(playerNotes));

      input.value = "";
      renderNotes();
    }
  };
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

  const noteBox = document.getElementById("noteBox");
  const toggle = document.getElementById("noteToggle");

  if (
    noteBox &&
    !noteBox.contains(e.target) &&
    !toggle.contains(e.target)
  ) {
    noteBox.style.display = "none";
  }

});
}

function showResetMenu(x, y) {

  const menu = document.getElementById("resetMenu");
  const typeList = document.getElementById("typeList");
  const nameList = document.getElementById("nameList");

  menu.style.display = "block";

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

  if(isLongPress) {
    isLongPress = false;
    return; // ⭐长按结束，不执行点击
  }

  saveHistory(`撤回 ${items[i].name} +1`);

  items[i].count++;

  addLog(`获得 ${items[i].name} +1`);
  showToast(`✅ 获得 ${items[i].name} +1`, "good");

  saveData();
  render();
};

window.minusOne = function(i){
  if(isLongPress) {
    isLongPress = false;
    return; // ⭐长按结束，不执行点击
  }

  saveHistory(`撤回 ${items[i].name} -1`);

  items[i].count--;

  addLog(`减少 ${items[i].name} -1`);
  showToast(`⛔ 减少 ${items[i].name} -1`, "bad");

  saveData();
  render();
};

/***********************
 * 长按输入
***********************/
window.handleMouseDown = function(i){
  pressTimer = setTimeout(()=>{

    let num = parseInt(prompt("输入数字"));
    if(isNaN(num)) return;

    saveHistory(`撤回 ${items[i].name} ${num > 0 ? "+" : ""}${num}`);

    items[i].count = Math.max(0, items[i].count + num);

    // ⭐弹窗提示统一风格
    if(num > 0){
      showToast(`✅ ${items[i].name} +${num}`, "good");
      addLog(`获得 ${items[i].name} +${num}`);
    } else {
      showToast(`⛔ ${items[i].name} ${num}`, "bad");
      addLog(`减少 ${items[i].name} ${num}`);
    }

    saveData();
    render();

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

  saveHistory("撤回全部重置");

  items.forEach(i=>i.count = 0);

  addLog("全部重置完成");
  showToast("🔄 已全部重置", "warn");

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

  const last = historyStack.pop();

  items = JSON.parse(last.data);

  saveData();
  render();

  // ⭐显示撤回提示
  if (last.action) {
    showToast(`↩ ${last.action}`, "warn");
  }
};

function saveHistory(actionText = "") {
  historyStack.push({
    data: JSON.stringify(items),
    action: actionText
  });

  if (historyStack.length > 50) historyStack.shift();
}

let notes = JSON.parse(localStorage.getItem("notes") || "[]");

// 打开/关闭
window.toggleNote = function () {
  const box = document.getElementById("noteBox");
  if (!box) return;

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

notes = notes.map(n => {
  if (typeof n === "string") {
    return {
      date: new Date().toLocaleDateString(),
      text: n,
      type: "log-normal"
    };
  }
  return n;
});

// 渲染记事本
function renderNotes() {

  const list = document.getElementById("noteList");
  if (!list) return;

  list.innerHTML = "";

  let data = noteMode === "player" ? playerNotes : systemLogs;

  let lastDate = "";

  data.forEach(n => {

    // ⭐ 日期分组
    if (n.date !== lastDate) {
      const dateDiv = document.createElement("div");
      dateDiv.innerText = "📅 " + n.date;
      dateDiv.style.color = "#aaa";
      dateDiv.style.fontSize = "12px";
      dateDiv.style.marginTop = "6px";
      list.appendChild(dateDiv);

      lastDate = n.date;
    }

    const div = document.createElement("div");

    div.innerText = `[${n.time}] ${n.text}`;

    div.style.color = noteMode === "player" ? "#333" : "#888";

    list.appendChild(div);
  });

  list.scrollTop = list.scrollHeight;
}

let playerNotes = JSON.parse(localStorage.getItem("playerNotes") || "[]");
let systemLogs = JSON.parse(localStorage.getItem("systemLogs") || "[]");

  localStorage.setItem("systemLogs", JSON.stringify(systemLogs));
// 输入记录（核心）
document.addEventListener("DOMContentLoaded", () => {

  const input = document.getElementById("noteInput");

  if (!input) {
    console.error("❌ noteInput 没找到");
    return;
  }

  input.addEventListener("keydown", (e) => {

    if (e.key === "Enter") {

      const text = input.value.trim();
      if (!text) return;

      const now = new Date();

      const t = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

      // ⭐ 存玩家记录
      playerNotes.push({
        date: now.toLocaleDateString(),
        time: t,
        text: text
      });

      localStorage.setItem("playerNotes", JSON.stringify(playerNotes));

      input.value = "";
      renderNotes();
    }
  });

});

// 清空
window.clearNotes = function () {
  if (!confirm("确定清空当前记录吗？")) return;

  if (noteMode === "player") {
    playerNotes = [];
    localStorage.setItem("playerNotes", JSON.stringify(playerNotes));
  } else {
    systemLogs = [];
    localStorage.setItem("systemLogs", JSON.stringify(systemLogs));
  }

  renderNotes();
};
function showToast(text, type = "good") {

  const container = document.getElementById("toastContainer");
  if (!container) return;

  const div = document.createElement("div");

  div.className = `toast toast-${type}`;
  div.innerText = text;

  container.appendChild(div);

  setTimeout(() => {
    div.remove();
  }, 3000);
}

function addLog(text) {

  const now = new Date();

  const t = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  systemLogs.push({
    date: now.toLocaleDateString(),
    time: t,
    text: text
  });

  if (systemLogs.length > 100) systemLogs.shift();

  localStorage.setItem("systemLogs", JSON.stringify(systemLogs));

  renderNotes();
}

window.switchNoteMode = function(mode){
  noteMode = mode;

  document.querySelectorAll(".note-header button")
    .forEach(btn => btn.classList.remove("active"));

  if(mode === "player"){
    document.querySelectorAll(".note-header button")[0].classList.add("active");
  } else {
    document.querySelectorAll(".note-header button")[1].classList.add("active");
  }

  renderNotes();
};
