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
window.items = [
  { name: "柴渣虫",
   type: ["火系"],
   count: 0,
   img: imgPath("chai.png")},
  { name: "双灯鱼", 
  type: ["水系"],
  count: 0, 
  img: imgPath("fish.png")},
  { name: "月牙雪熊", 
  type: ["冰系"], 
  count: 0, 
  img: imgPath("bear.png")},
  { name: "粉粉星", 
  type: ["电系"], 
  count: 0, 
  img: imgPath("star.png")},
  { name: "空空颅", 
  type: "幽系", 
  count: 0, 
  img: imgPath("skull.png")},
  { name: "嗜光嗡嗡", 
  type: ["恶系"], 
  count: 0, 
  img: imgPath("mosquito.png")},
  { name: "贝瑟", 
  type: ["机械系"], 
  count: 0, 
  img: imgPath("pot.png")},
  { name: "粉星仔", 
  type: "幻系", 
  count: 0, 
  img: imgPath("zai.png")},
  { name: "格兰种子", 
  type: "草系", 
  count: 0, 
  img: imgPath("seed.png")},
  { name: "奇丽草", 
  type: "草系", 
  count: 0, 
  img: imgPath("grass.png")},
  { name: "治愈兔", 
  type: ["火系"], 
  count: 0, 
  img: imgPath("rabbit.png")},
  { name: "呼呼猪", 
  type: ["冰系"], 
  count: 0, 
  img: imgPath("pig.png")},
  { name: "大耳帽兜", 
  type: ["冰系"], 
  count: 0, 
  img: imgPath("dou.png")},
  { name: "拉特", 
  type: "电系", 
  count: 0, 
  img: imgPath("rai.png")},
  { name: "恶魔狼", 
  type: "恶系", 
  count: 0, 
  img: imgPath("wolf.png")},
  { name: "机械方方", 
  type: "机械系", 
  count: 0, 
  img: imgPath("cube.png")},
  { name: "绒绒", 
  type: "绒绒", 
  count: 0, 
  img: imgPath("rong.png")},
  { name: "犀角鸟", 
  type: "犀角鸟", 
  count: 0, 
  img: imgPath("mop.png")},
  { name: "火红尾", 
  type: "火系", 
  count: 0, 
  img: imgPath("horse.png")},
  { name: "果冻", 
  type: "水系", 
  count: 0, 
  img: imgPath("jelly.png")},
  { name: "星尘虫", 
  type: "虫系", 
  count: 0, 
  img: imgPath("ladybug.png")},
  { name: "影狸", 
  type: "幽系", 
  count: 0, 
  img: imgPath("fox.png")},
];

window.addEventListener("DOMContentLoaded", () => {
  loadData();
  render();
});

function loadData() {
  let saved = localStorage.getItem("items");

  if (saved) {
    let parsed = JSON.parse(saved);

    // ⭐ 防止数据结构坏掉
    if (Array.isArray(parsed)) {
      items = parsed;
    }
  }
}

function saveData() {
  localStorage.setItem("items", JSON.stringify(items));
}

window.addOne = function(i) {
  saveHistory(); //有撤回效果

  items[i].count++;
  saveData();
  render();
}

window.minusOne = function(i) {
  saveHistory(); //有撤回效果

  if (items[i].count > 0) {
    items[i].count--;
  }

  saveData();
  render();
}

function saveHistory() {
  historyStack.push(JSON.stringify(items));

  if (historyStack.length > 50) {
    historyStack.shift();
  }
}

window.handleMouseDown = function(i) {
  currentIndex = i;

  pressTimer = setTimeout(() => {
    showPopup(i);
  }, 600);
};

window.handleMouseUp = function() {
  clearTimeout(pressTimer);
};


function showPopup(i) {
  let num = prompt("输入数字（正数=加，负数=减）");

  if (num === null) return;

  num = parseInt(num);
  if (isNaN(num)) return;

  saveHistory();

  items[i].count += num;

  if (items[i].count < 0) items[i].count = 0;

  saveData();
  render();
}

function render() {
  const container = document.getElementById("container");
  if (!container) return;

  container.innerHTML = "";

  items.forEach((item, i) => {
    container.innerHTML += `
      <div class="item"
           onclick="addOne(${i})"
           oncontextmenu="event.preventDefault(); minusOne(${i})"
           onmousedown="handleMouseDown(${i})"
           onmouseup="handleMouseUp()"
           onmouseleave="handleMouseUp()">

        <img src="${item.img}"
             onerror="this.src='${BASE}roco-image/fallback.png'">

        <div>${item.name}</div>
        <div class="count">数量: ${item.count}</div>

      </div>
    `;
  });

  updateStats();
};

 //重置按钮
window.undo = function() {
  if (historyStack.length === 0) {
    alert("没有可撤回");
    return;
  }

  let lastState = historyStack.pop();
  items = JSON.parse(lastState);

  saveData();
  render();
};

//确认重置弹窗
window.resetAll = function() {
  saveHistory();

  if (confirm("确定重置所有数据吗？")) {
    items.forEach(i => i.count = 0);
    saveData();
    render();
  }
};

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

// 属性统计
function updateStats() {
  let stats = {};

  items.forEach(item => {

    let types = Array.isArray(item.type)
      ? item.type
      : item.type.split(",");

    types.forEach(t => {
      t = t.trim();

      if (!stats[t]) stats[t] = 0;
      stats[t] += item.count;
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