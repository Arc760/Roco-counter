let items = [];
let historyStack = [];
let resetBtn = null;
let undoBtn = null;

/* ===== 数据 ===== */
items = [
  { name: "柴渣虫", type: ["火系"], count: 0, img: "roco-image/chai.png" },
  { name: "双灯鱼", type: ["水系"], count: 0, img: "roco-image/fish.png" },
  { name: "月牙雪熊", type: ["冰系"], count: 0, img: "roco-image/bear.png" },
  { name: "粉粉星", type: ["电系"], count: 0, img: "roco-image/star.png" },

  { name: "空空颅", type: ["幽系"], count: 0, img: "roco-image/skull.png" },
  { name: "嗜光嗡嗡", type: ["恶系"], count: 0, img: "roco-image/mosquito.png" },
  { name: "贝瑟", type: ["机械系"], count: 0, img: "roco-image/pot.png" },
  { name: "粉星仔", type: ["幻系"], count: 0, img: "roco-image/zai.png" },

  { name: "格兰种子", type: ["草系"], count: 0, img: "roco-image/seed.png" },
  { name: "奇丽草", type: ["草系"], count: 0, img: "roco-image/grass.png" },
  { name: "治愈兔", type: ["火系"], count: 0, img: "roco-image/rabbit.png" },
  { name: "呼呼猪", type: ["冰系"], count: 0, img: "roco-image/pig.png" },

  { name: "大耳帽兜", type: ["冰系"], count: 0, img: "roco-image/dou.png" },
  { name: "拉特", type: ["电系"], count: 0, img: "roco-image/rai.png" },
  { name: "恶魔狼", type: ["恶系"], count: 0, img: "roco-image/wolf.png" },
  { name: "机械方方", type: ["机械系"], count: 0, img: "roco-image/cube.png" },

  { name: "绒绒", type: ["绒绒"], count: 0, img: "roco-image/rong.png" },
  { name: "犀角鸟", type: ["犀角鸟"], count: 0, img: "roco-image/mop.png" },
  { name: "火红尾", type: ["火系"], count: 0, img: "roco-image/horse.png" },

  { name: "果冻", type: ["水系"], count: 0, img: "roco-image/jelly.png" },
  { name: "星尘虫", type: ["虫系"], count: 0, img: "roco-image/ladybug.png" },
  { name: "影狸", type: ["幽系"], count: 0, img: "roco-image/fox.png" },

];

/* ===== 初始化 ===== */
window.addEventListener("DOMContentLoaded", () => {
  loadData();
  render();

  resetBtn = document.querySelector(".reset-btn");
  undoBtn = document.querySelector(".undo-btn");

  if (!resetBtn) {
    console.log("❌ reset-btn 没找到");
    return;
  }

  let startX = 0;
  let startY = 0;
  let moved = false;

  // ⭐ 关键：只用这一套手势
resetBtn.addEventListener("pointerdown", (e) => {
  e.preventDefault();   // ⭐ 阻止默认行为
  startX = e.clientX;
  startY = e.clientY;
});

resetBtn.addEventListener("pointerup", (e) => {
  const dx = e.clientX - startX;
  const dy = Math.abs(e.clientY - startY);

  console.log("dx:", dx, "dy:", dy); // ⭐调试用

  // 👉 右滑打开菜单
  if (dx > 25 && dx > dy) {
    e.preventDefault();
    e.stopPropagation();
    showResetMenu(e.pageX, e.pageY);
    return;
  }

  // 👉 点击才重置
  resetAll();
});

  undoBtn.addEventListener("click", undo);
});

/* ===== 菜单 ===== */
function showResetMenu(x, y) {
  const menu = document.getElementById("resetMenu");
  const typeBox = document.getElementById("typeList");
  const nameBox = document.getElementById("nameList");

  menu.style.display = "block";
  menu.style.left = x + "px";
  menu.style.top = y + "px";

  // ===== 属性 =====
  let typeMap = {};
  items.forEach(item => {
    (Array.isArray(item.type) ? item.type : [item.type]).forEach(t => {
      typeMap[t] = true;
    });
  });

  typeBox.innerHTML = "<b>属性</b>";
  Object.keys(typeMap).forEach(t => {
    let div = document.createElement("div");
    div.className = "menu-item";
    div.innerText = t;
    div.onclick = () => {
      resetByType(t);
      hideMenu();
    };
    typeBox.appendChild(div);
  });

  // ===== 宠物 =====
  nameBox.innerHTML = "<b>宠物</b>";
  items.forEach(item => {
    let div = document.createElement("div");
    div.className = "menu-item";
    div.innerText = item.name;
    div.onclick = () => {
      item.count = 0;
      save();
      render();
      hideMenu();
    };
    nameBox.appendChild(div);
  });
}

function hideMenu() {
  const menu = document.getElementById("resetMenu");
  if (menu) menu.style.display = "none";
}

document.addEventListener("click", hideMenu);

/* ===== 功能 ===== */
function resetByType(type) {
  items.forEach(item => {
    let types = Array.isArray(item.type) ? item.type : [item.type];
    if (types.includes(type)) item.count = 0;
  });
  save();
  render();
}

function resetAll() {
  items.forEach(i => i.count = 0);
  save();
  render();
}

function undo() {
  if (!historyStack.length) return;
  items = JSON.parse(historyStack.pop());
  save();
  render();
}

/* ===== 存档 ===== */
function save() {
  localStorage.setItem("items", JSON.stringify(items));
}

function loadData() {
  let data = localStorage.getItem("items");
  if (data) items = JSON.parse(data);
}

/* ===== 渲染 ===== */
function render() {
  const container = document.getElementById("container");
  container.innerHTML = "";

  const COLS = 6;
  const ROWS = 4;

  // 1️⃣ 先生成24格布局（纯结构）
  let grid = Array(24).fill(null);

  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {

      const i = col * ROWS + row;

      const isEmpty =
        (col === 4 && row === 3) ||
        (col === 5 && row === 3); // ⭐只留2个空格

      grid[i] = isEmpty ? { empty: true } : null;
    }
  }

  // 2️⃣ 再顺序填 items（只填非空格）
  let itemIndex = 0;

  for (let i = 0; i < grid.length; i++) {
    if (grid[i] === null) {
      grid[i] = items[itemIndex++] || { empty: true };
    }
  }

  // 3️⃣ 渲染
  grid.forEach((item, i) => {
    container.appendChild(createItem(item, i));
  });

  console.log("items:", items.length);
  console.log("used:", itemIndex);
}

function createItem(item, index) {
  const div = document.createElement("div");

  if (item.empty) {
    div.className = "item empty";
    return div;
  }

  div.className = "item";

  div.innerHTML = `
    <img src="${item.img}">
    <div>${item.name}</div>
    <div class="count ${item.count > 0 ? "active" : ""}">
      ${item.count}
    </div>
  `;

  bindGesture(div, index);
  return div;
}

function getSlot(index) {
  const row = Math.floor(index / 6);
  const col = index % 6;

  return { row, col };
}

/* ===== 点击/滑动 ===== */
function bindGesture(el, index) {
  let startX = 0;
  let startY = 0;
  let timer = null;
  let isLong = false;

  const SWIPE = 40;

  el.addEventListener("pointerdown", (e) => {
    startX = e.clientX;
    startY = e.clientY;
    isLong = false;

    timer = setTimeout(() => {
      isLong = true;
      let v = prompt("输入数量");
      if (v !== null) {
        items[index].count = parseInt(v) || 0;
        save();
        render();
      }
    }, 600);
  });

  el.addEventListener("pointerup", (e) => {
    clearTimeout(timer);
    if (isLong) return;

    let dx = e.clientX - startX;
    let dy = e.clientY - startY;

    if (Math.abs(dx) > Math.abs(dy) && dx > SWIPE) {
      items[index].count--;
      save();
      render();
      return;
    }

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      items[index].count++;
      save();
      render();
    }
  });
}

/* ===== 统计 ===== */
function updateStats() {
  let stats = {};

  items.forEach(item => {
    (Array.isArray(item.type) ? item.type : [item.type]).forEach(t => {
      if (t === "虫系") return; // 排除虫系
      stats[t] = (stats[t] || 0) + item.count;
    });
  });

  const box = document.getElementById("stats");
  box.innerHTML = "";

  let hasData = false;

  Object.entries(stats).forEach(([type, value]) => {
    hasData = true;

    const div = document.createElement("div");
    div.className = "stat-item";

    // ⭐关键：有数值才变黑
    if (value > 0) {
      div.classList.add("active");
    }

    div.innerText = `${type}: ${value}`;

    box.appendChild(div);
  });

  if (!hasData) {
    box.innerHTML = `<div class="stat-item">暂无数据</div>`;
  }
}
