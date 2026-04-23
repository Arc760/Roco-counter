let pressTimer = null;
let currentIndex = null;

let historyStack = [];

function getBasePath() {
  const hostname = window.location.hostname;

  if (hostname.includes("github.io")) {
    const pathParts = window.location.pathname.split("/");
    const repoName = pathParts[1];
    return "/" + repoName + "/";
  }

  return "./";
}
// 最简单最稳
const BASE = "./";

function imgPath(file) {
  return "/roco-counter/roco-image/" + file;
}
    
// 🔥 S1赛季异色精灵
// =====================
// 1. 数据（核心）
window.items = [
  { name: "柴渣虫", type: ["火系"], count: 0, img: "./roco-image/chai.png" },
  { name: "双灯鱼", type: ["水系"], count: 0, img: "./roco-image/fish.png" },
  { name: "月牙雪熊", type: ["冰系"], count: 0, img: "./roco-image/bear.png" },
  { name: "粉粉星", type: ["电系"], count: 0, img: "./roco-image/star.png" },
  { name: "空空颅", type: "幽系", count: 0, img: "./roco-image/skull.png" },
  { name: "嗜光嗡嗡", type: ["恶系"], count: 0, img: "./roco-image/mosquito.png" },
  { name: "贝瑟", type: ["机械系"], count: 0, img: "./roco-image/pot.png" },
  { name: "粉星仔", type: "幻系", count: 0, img: "./roco-image/zai.png" },
  { name: "格兰种子", type: "草系", count: 0, img: "./roco-image/seed.png" },
  { name: "奇丽草", type: "草系", count: 0, img: "./roco-image/grass.png" },
  { name: "治愈兔", type: ["火系"], count: 0, img: "./roco-image/rabbit.png" },
  { name: "呼呼猪", type: ["冰系"], count: 0, img: "./roco-image/pig.png" },
  { name: "大耳帽兜", type: ["冰系"], count: 0, img: "./roco-image/dou.png" },
  { name: "拉特", type: "电系", count: 0, img: "./roco-image/rai.png" },
  { name: "恶魔狼", type: "恶系", count: 0, img: "./roco-image/wolf.png" },
  { name: "机械方方", type: "机械系", count: 0, img: "./roco-image/cube.png" },
  { name: "绒绒", type: "绒绒", count: 0, img: "./roco-image/rong.png" },
  { name: "犀角鸟", type: "犀角鸟", count: 0, img: "./roco-image/mop.png" },
  { name: "火红尾", type: "火系", count: 0, img: "./roco-image/horse.png" },
  { name: "果冻", type: "水系", count: 0, img: "./roco-image/jelly.png" },
  { name: "星尘虫", type: "虫系", count: 0, img: "./roco-image/ladybug.png" },
  { name: "影狸", type: "幽系", count: 0, img: "./roco-image/fox.png" }
];

// =====================
// 2. 本地存储
function loadData() {
  const saved = localStorage.getItem("items");
  if (saved) {
    window.items = JSON.parse(saved);
  }
}

function saveData() {
  localStorage.setItem("items", JSON.stringify(window.items));
}

// =====================
// 3. 核心功能
window.addOne = (i) => {
  window.items[i].count++;
  saveData();
  render();
};

window.minusOne = (i) => {
  if (window.items[i].count > 0) window.items[i].count--;
  saveData();
  render();
};

// =====================
// 4. render（核心）
window.render = function () {
  const container = document.getElementById("container");
  if (!container) return;

  container.innerHTML = "";

  window.items.forEach((item, i) => {
    container.innerHTML += `
      <div class="item"
           onclick="addOne(${i})"
           oncontextmenu="event.preventDefault(); minusOne(${i})">

        <img src="${item.img}" 
             onerror="this.src='./roco-image/fallback.png'">

        <div>${item.name}</div>
        <div>数量: ${item.count}</div>
      </div>
    `;
  });

  updateStats();
};

// =====================
// 5. 统计
function updateStats() {
  let stats = {};

  window.items.forEach(item => {
    let types = Array.isArray(item.type) ? item.type : item.type.split(",");

    types.forEach(t => {
      t = t.trim();
      stats[t] = (stats[t] || 0) + item.count;
    });
  });

  const el = document.getElementById("stats");
  if (!el) return;

  el.innerHTML = Object.entries(stats)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" ");
}

// =====================
// 6. 初始化
loadData();
window.addEventListener("DOMContentLoaded", render);

function saveHistory() {
  historyStack.push(JSON.stringify(items));

  // ⭐必须在函数里面
  if (historyStack.length > 50) {
    historyStack.shift();
  }
}

window.handleMouseDown = function(i) {
  currentIndex = i;

  pressTimer = setTimeout(() => {
    showPopup(i);
  }, 600);
}

window.handleMouseUp = function() {
  clearTimeout(pressTimer);
}

function showPopup(i) {
  let num = prompt("输入数字（正数=加，负数=减）");

  if (num === null) return;

  num = parseInt(num);
  if (isNaN(num)) return;

  saveHistory(); // ⭐这里也要加

  items[i].count += num;

  if (items[i].count < 0) items[i].count = 0;

  saveData();
  render();
}

 //重置按钮
function undo() {
  if (historyStack.length === 0) {
    alert("没有可撤回的操作");
    return;
  }

  let lastState = historyStack.pop();

  items = JSON.parse(lastState);

  saveData();
  render();
}

//确认重置弹窗
function resetAll() {
  saveHistory();

  if (confirm("确定要重置所有数据吗？")) {
    items.forEach(item => item.count = 0);
    updateStats();
    render();
  }
}

  document.addEventListener("DOMContentLoaded", function () {

  let btn = document.querySelector(".reset-btn");

  if (!btn) {
    console.log("❌ reset-btn 没找到");
    return;
  }

  btn.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    showResetMenu(e.pageX, e.pageY);
  });

});

  let text = "<h3>统计</h3>";
  let hasData = false;

  for (let t in stats) {
    text += `${t}: ${stats[t]}   `;
    hasData = true;
  }

  if (!hasData) {
    text += "暂无数据";
  }

  document.getElementById("stats").innerHTML = text;
}

loadData();
render();

window.addEventListener("load", function () {

  const btn = document.querySelector(".reset-btn");

  console.log("reset-btn =", btn);

  if (!btn) return;

  btn.addEventListener("contextmenu", function (e) {
    e.preventDefault();
    console.log("右键触发成功");

    showTypeMenu(e.pageX, e.pageY);
  });

});

//重置菜单
function showTypeMenu(x, y) {
  let menu = document.getElementById("typeMenu");

  let typeMap = {};

  items.forEach(item => {
    let types = Array.isArray(item.type)
      ? item.type
      : item.type.split(",");

    types.forEach(t => {
      t = t.trim();
      if (!typeMap[t]) typeMap[t] = [];
      typeMap[t].push(item);
    });
  });

  let types = Object.keys(typeMap);

  menu.innerHTML = "";

  let container = document.createElement("div");
  container.className = "menu-grid";

  let left = document.createElement("div");
  left.className = "menu-left";

  let right = document.createElement("div");
  right.className = "menu-right";

  // 🟢 默认显示全部
  renderRightList(items, right);

  // 🟢 左侧 type
  types.forEach(t => {
    let div = document.createElement("div");
    div.className = "menu-item";
    div.innerText = t;

    div.onclick = function (e) {
      e.stopPropagation(); // ⭐防止触发关闭菜单

      resetByType(t);
      renderRightList(typeMap[t], right);
    };

    left.appendChild(div);
  });

  container.appendChild(left);
  container.appendChild(right);

  menu.appendChild(container);

  menu.style.left = x + "px";
  menu.style.top = y + "px";
  menu.style.display = "block";
}

function renderRightList(list, right) {
  right.innerHTML = "";

  list.forEach(item => {
    let div = document.createElement("div");
    div.className = "menu-item";

    div.innerText = `${item.name} (${item.count})`;

    div.onclick = function () {
      item.count = 0;
      saveData();
      render();
    };

    right.appendChild(div);
  });
}


function resetByType(type) {
  items.forEach(item => {

    let types = Array.isArray(item.type)
      ? item.type
      : item.type.split(",");

    types = types.map(t => t.trim());

    if (types.includes(type)) {
      item.count = 0;
    }
  });

  saveData();
  render();
}

document.addEventListener("click", function () {
  const menu = document.getElementById("typeMenu");
  if (menu) menu.style.display = "none";
});
