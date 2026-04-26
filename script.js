/***********************
 * 全局状态
***********************/
let items = [];
let mode = "normal";

let historyStack = [];
let pressTimer = null;
let lastStats = {};

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

  document.addEventListener("click", ()=>{
    mainMenu.style.display = "none";
    resetMenu.style.display = "none";
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
