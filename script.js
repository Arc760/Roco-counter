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
