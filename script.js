/* ====== Utilities ====== */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

const container = $("#flexContainer");
const cssPreview = $("#cssPreview");

const controls = {
  flexDirection: $("#flexDirection"),
  flexWrap: $("#flexWrap"),
  justifyContent: $("#justifyContent"),
  alignItems: $("#alignItems"),
  alignContent: $("#alignContent"),
  gap: $("#gap"),
  gapValue: $("#gapValue"),
  containerPadding: $("#containerPadding"),
  padValue: $("#padValue"),
  itemCount: $("#itemCount"),
  shuffle: $("#shuffle"),
  reset: $("#reset"),
};

const itemControls = {
  selectedItem: $("#selectedItem"),
  order: $("#order"),
  grow: $("#grow"),
  shrink: $("#shrink"),
  basis: $("#basis"),
  alignSelf: $("#alignSelf"),
  minWidth: $("#minWidth"),
  maxWidth: $("#maxWidth"),
};

const DEFAULTS = {
  container: {
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "flex-start",
    alignItems: "center",
    alignContent: "stretch",
    gap: 12,
    padding: 16,
    itemCount: 4,
  },
  item: {
    order: 0,
    grow: 0,
    shrink: 1,
    basis: "auto",
    alignSelf: "center",
    minWidth: 0,
    maxWidth: 0, // 0 = none
  },
};

/* ====== Demo Setup ====== */
const palette = [
  8, 24, 45, 160, 205, 260, 300, 345
];

function createItem(i){
  const el = document.createElement("div");
  el.className = "item";
  el.dataset.index = i;
  el.style.setProperty("--h", palette[i % palette.length]);
  el.textContent = `Item ${i + 1}`;
  // Store item styles in dataset for ease of sync
  setItemStyles(el, { ...DEFAULTS.item });
  return el;
}

function setItemStyles(el, { order, grow, shrink, basis, alignSelf, minWidth, maxWidth }){
  el.style.order = Number(order);
  el.style.flexGrow = Number(grow);
  el.style.flexShrink = Number(shrink);
  el.style.flexBasis = basis;
  el.style.alignSelf = alignSelf;
  el.style.minWidth = minWidth ? `${Number(minWidth)}px` : null;
  el.style.maxWidth = maxWidth ? `${Number(maxWidth)}px` : null;

  // Keep a tiny state on element for quick reads
  el.dataset.order = order;
  el.dataset.grow = grow;
  el.dataset.shrink = shrink;
  el.dataset.basis = basis;
  el.dataset.alignSelf = alignSelf;
  el.dataset.minWidth = minWidth;
  el.dataset.maxWidth = maxWidth;
}

function mountItems(n){
  container.innerHTML = "";
  for(let i=0;i<n;i++) container.appendChild(createItem(i));
  populateItemSelect();
  syncSelectedItemControls();
  updateCSSPreview();
}

function populateItemSelect(){
  const sel = itemControls.selectedItem;
  sel.innerHTML = "";
  $$(".item", container).forEach((el, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = `Item ${i+1}`;
    sel.appendChild(opt);
  });
}

function getSelectedItem(){
  const i = Number(itemControls.selectedItem.value || 0);
  return $$(".item", container)[i] || null;
}

/* ====== Container bindings ====== */
function applyContainerStyles(){
  container.style.flexDirection = controls.flexDirection.value;
  container.style.flexWrap = controls.flexWrap.value;
  container.style.justifyContent = controls.justifyContent.value;
  container.style.alignItems = controls.alignItems.value;
  container.style.alignContent = controls.alignContent.value;
  container.style.gap = `${controls.gap.value}px`;
  container.style.padding = `${controls.containerPadding.value}px`;

  controls.gapValue.textContent = controls.gap.value;
  controls.padValue.textContent = controls.containerPadding.value;

  updateCSSPreview();
}

function syncContainerControls(){
  controls.flexDirection.value = DEFAULTS.container.flexDirection;
  controls.flexWrap.value = DEFAULTS.container.flexWrap;
  controls.justifyContent.value = DEFAULTS.container.justifyContent;
  controls.alignItems.value = DEFAULTS.container.alignItems;
  controls.alignContent.value = DEFAULTS.container.alignContent;
  controls.gap.value = DEFAULTS.container.gap;
  controls.containerPadding.value = DEFAULTS.container.padding;
  controls.itemCount.value = DEFAULTS.container.itemCount;
  controls.gapValue.textContent = DEFAULTS.container.gap;
  controls.padValue.textContent = DEFAULTS.container.padding;
}

/* ====== Item bindings ====== */
function syncSelectedItemControls(){
  const el = getSelectedItem();
  if(!el) return;

  itemControls.order.value = Number(el.dataset.order ?? DEFAULTS.item.order);
  itemControls.grow.value = Number(el.dataset.grow ?? DEFAULTS.item.grow);
  itemControls.shrink.value = Number(el.dataset.shrink ?? DEFAULTS.item.shrink);
  itemControls.basis.value = el.dataset.basis ?? DEFAULTS.item.basis;
  itemControls.alignSelf.value = el.dataset.alignSelf ?? DEFAULTS.item.alignSelf;
  itemControls.minWidth.value = Number(el.dataset.minWidth ?? DEFAULTS.item.minWidth);
  itemControls.maxWidth.value = Number(el.dataset.maxWidth ?? DEFAULTS.item.maxWidth);
}

function applySelectedItemStyles(){
  const el = getSelectedItem();
  if(!el) return;

  setItemStyles(el, {
    order: Number(itemControls.order.value),
    grow: Number(itemControls.grow.value),
    shrink: Number(itemControls.shrink.value),
    basis: itemControls.basis.value.trim() || "auto",
    alignSelf: itemControls.alignSelf.value,
    minWidth: Number(itemControls.minWidth.value || 0),
    maxWidth: Number(itemControls.maxWidth.value || 0),
  });

  updateCSSPreview();
}

/* ====== UI Events ====== */
["change","input"].forEach(evt => {
  ["flexDirection","flexWrap","justifyContent","alignItems","alignContent","gap","containerPadding"]
    .forEach(key => controls[key].addEventListener(evt, applyContainerStyles));

  ["order","grow","shrink","basis","alignSelf","minWidth","maxWidth"]
    .forEach(key => itemControls[key].addEventListener(evt, applySelectedItemStyles));
});

itemControls.selectedItem.addEventListener("change", syncSelectedItemControls);

controls.itemCount.addEventListener("input", (e) => {
  mountItems(Number(e.target.value));
  applyContainerStyles();
});

controls.shuffle.addEventListener("click", () => {
  // Shuffle colors and text labels
  const items = $$(".item", container);
  const numbers = items.map((_, i) => i+1).sort(() => Math.random() - 0.5);
  items.forEach((el, i) => {
    const hue = palette[Math.floor(Math.random()*palette.length)];
    el.style.setProperty("--h", hue);
    el.textContent = `Item ${numbers[i]}`;
  });
});

controls.reset.addEventListener("click", () => {
  syncContainerControls();
  mountItems(DEFAULTS.container.itemCount);
  applyContainerStyles();
});

/* ====== Code preview ====== */
function updateCSSPreview(){
  const s = getComputedStyle(container);
  const rules = [
    ["display", "flex"],
    ["flex-direction", s.flexDirection],
    ["flex-wrap", s.flexWrap],
    ["justify-content", s.justifyContent],
    ["align-items", s.alignItems],
    ["align-content", s.alignContent],
    ["gap", s.gap],
    ["padding", s.padding],
  ];

  const lines = [
`/* Current container CSS */`,
`.flex-container {`,
...rules.map(([k,v]) => `  ${k}: ${v};`),
`}`
  ];

  // If a specific item deviates from defaults, show its CSS too
  const el = getSelectedItem();
  if(el){
    const itemRules = [];
    if(Number(el.style.order || 0) !== DEFAULTS.item.order) itemRules.push(["order", el.style.order]);
    if(Number(el.style.flexGrow || 0) !== DEFAULTS.item.grow) itemRules.push(["flex-grow", el.style.flexGrow]);
    if(Number(el.style.flexShrink || 1) !== DEFAULTS.item.shrink) itemRules.push(["flex-shrink", el.style.flexShrink]);
    if((el.style.flexBasis || "auto") !== DEFAULTS.item.basis) itemRules.push(["flex-basis", el.style.flexBasis || "auto"]);
    if((el.style.alignSelf || "auto") !== "auto") itemRules.push(["align-self", el.style.alignSelf]);
    if(el.style.minWidth) itemRules.push(["min-width", el.style.minWidth]);
    if(el.style.maxWidth) itemRules.push(["max-width", el.style.maxWidth]);

    if(itemRules.length){
      lines.push("", `/* Selected item (${Number(itemControls.selectedItem.value)+1}) overrides */`, `.item:nth-child(${Number(itemControls.selectedItem.value)+1}) {`);
      lines.push(...itemRules.map(([k,v]) => `  ${k}: ${v};`));
      lines.push(`}`);
    }
  }

  cssPreview.textContent = lines.join("\n");
}

/* ====== Init ====== */
(function init(){
  syncContainerControls();
  mountItems(DEFAULTS.container.itemCount);
  applyContainerStyles();
})();