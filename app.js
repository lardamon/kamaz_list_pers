(async () => {
  const LS_KEY = "dnd5e.characters.v1";
  const MAX_CHARS = 30;


  // Spells DB
  let SPELLS_DB = [];
  let SPELLS_BY_ID = new Map();

  function applySpellsData(data) {
    const arr = Array.isArray(data?.spells) ? data.spells : [];
    SPELLS_DB = arr;
    SPELLS_BY_ID = new Map(arr.map((s) => [String(s._raw?._id || s.id || s.key || s.name), s]));
  }

  async function loadSpellsDB() {
    if (window.__SPELLS_JSON__ && Array.isArray(window.__SPELLS_JSON__.spells)) {
      applySpellsData(window.__SPELLS_JSON__);
      return;
    }

    try {
      const res = await fetch("./spells.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`spells.json HTTP ${res.status}`);
      const data = await res.json();
      applySpellsData(data);
      return;
    } catch (e) {
      console.warn("Failed to load spells.json", e);
    }

    SPELLS_DB = [];
    SPELLS_BY_ID = new Map();
  }

  await loadSpellsDB();


  // XP table (your values)
  const XP_TABLE = [
    { xp: 0, level: 1, pb: 2 },
    { xp: 300, level: 2, pb: 2 },
    { xp: 900, level: 3, pb: 2 },
    { xp: 2700, level: 4, pb: 2 },
    { xp: 6500, level: 5, pb: 3 },
    { xp: 14000, level: 6, pb: 3 },
    { xp: 23000, level: 7, pb: 3 },
    { xp: 34000, level: 8, pb: 3 },
    { xp: 48000, level: 9, pb: 4 },
    { xp: 64000, level: 10, pb: 4 },
    { xp: 85000, level: 11, pb: 4 },
    { xp: 100000, level: 12, pb: 4 },
    { xp: 120000, level: 13, pb: 5 },
    { xp: 140000, level: 14, pb: 5 },
    { xp: 165000, level: 15, pb: 5 },
    { xp: 195000, level: 16, pb: 5 },
    { xp: 225000, level: 17, pb: 6 },
    { xp: 265000, level: 18, pb: 6 },
    { xp: 305000, level: 19, pb: 6 },
    { xp: 355000, level: 20, pb: 6 },
  ];
  // ===== Conditions (иконки + подписи, описания заполнишь потом) =====
  const CONDITIONS = [
    { key: "unconscious", label: "Бессознательный", icon: "./assets/conditions/unconscious.svg", desc: `Находящееся без сознания существо недееспособно (не может совершать действия и реакции), не способно перемещаться и говорить, а также не осознаёт своё окружение.

Существо роняет всё, что держит, и падает ничком.

Существо автоматически проваливает спасброски Силы и Ловкости.

Броски атаки по существу совершаются с преимуществом.

Любая атака, попавшая по такому существу, считается критическим попаданием, если нападающий находится в пределах 5 футов от него.` },
    { key: "frightened", label: "Испуганный", icon: "./assets/conditions/frightened.svg", desc: `Испуганное существо совершает с помехой проверки характеристик и броски атаки, пока источник его страха находится в пределах его линии обзора.

Существо не способно добровольно приблизиться к источнику своего страха.` },
    { key: "invisible", label: "Невидимый", icon: "./assets/conditions/invisible.svg", desc: `Невидимое существо невозможно увидеть без помощи магии или особого чувства. С точки зрения скрытности существо считается сильно заслонённым. Местонахождение существа можно определить по шуму, который оно издаёт, или по оставленным им следам.

Броски атаки по невидимому существу совершаются с помехой, а его броски атаки — с преимуществом.` },
    { key: "incapacitated", label: "Недееспособный", icon: "./assets/conditions/incapacitated.svg", desc: `Недееспособное существо не может совершать действия и реакции.` },
    { key: "deafened", label: "Оглохший", icon: "./assets/conditions/deafened.svg", desc: `Оглохшее существо ничего не слышит и автоматически проваливает все проверки характеристик, связанные со слухом.` },
    { key: "petrified", label: "Окаменевший", icon: "./assets/conditions/petrified.svg", desc: `Окаменевшее существо, а также все немагические предметы, которые оно несёт или носит, превращаются в твёрдую неодушевлённую материю (обычно, камень). Его вес увеличивается в 10 раз, и оно перестаёт стареть.

Существо недееспособно (не может совершать действия и реакции), не способно двигаться и говорить, а также не осознаёт своё окружение.

Броски атаки по существу совершаются с преимуществом.

Существо автоматически проваливает спасброски Силы и Ловкости.

Существо получает сопротивление ко всем видам урона.

Существо получает иммунитет к ядам и болезням. Если яд или болезнь уже действовали на существо, их действие приостанавливается, но не исчезает.` },
    { key: "restrained", label: "Опутанный", icon: "./assets/conditions/restrained.svg", desc: `Скорость опутанного существа равна 0, и оно не получает выгоды ни от каких бонусов к скорости.

Броски атаки по такому существу совершаются с преимуществом, а его броски атаки — с помехой.

Существо совершает с помехой спасброски Ловкости.` },
    { key: "blinded", label: "Ослеплённый", icon: "./assets/conditions/blinded.svg", desc: `Ослеплённое существо ничего не видит и автоматически проваливает все проверки характеристик, связанные со зрением.

Броски атаки по такому существу совершаются с преимуществом, а его броски атаки совершаются с помехой.` },
    { key: "poisoned", label: "Отравленный", icon: "./assets/conditions/poisoned.svg", desc: `Отравленное существо совершает с помехой броски атаки и проверки характеристик.` },
    { key: "charmed", label: "Очарованный", icon: "./assets/conditions/charmed.svg", desc: `Очарованное существо не может атаковать того, кто его очаровал, а также сделать его целью умения или магического эффекта, причиняющего вред.

Очаровавшее существо совершает с преимуществом все проверки характеристик при социальном взаимодействии с очарованным существом.` },
    { key: "stunned", label: "Ошеломлённый", icon: "./assets/conditions/stunned.svg", desc: `Ошеломлённое существо недееспособно (не может совершать действия и реакции), не способно перемещаться и говорит запинаясь.

Существо автоматически проваливает спасброски Силы и Ловкости.

Броски атаки по существу совершаются с преимуществом.` },
    { key: "paralyzed", label: "Парализованный", icon: "./assets/conditions/paralyzed.svg", desc: `Парализованное существо недееспособно (не может совершать действия и реакции) и не способно перемещаться и говорить.

Существо автоматически проваливает спасброски Силы и Ловкости.

Броски атаки по парализованному существу совершаются с преимуществом.

Любая атака, попавшая по такому существу, считается критическим попаданием, если нападающий находится в пределах 5 футов от существа.` },
    { key: "prone", label: "Сбитый с ног", icon: "./assets/conditions/prone.svg", desc: `Сбитое с ног существо способно перемещаться только ползком, пока не встанет, прервав тем самым это состояние.

Существо совершает с помехой броски атаки.

Броски атаки по существу совершаются с преимуществом, если нападающий находится в пределах 5 футов от него. В противном случае броски атаки совершаются с помехой.` },
    { key: "grappled", label: "Схваченный", icon: "./assets/conditions/grappled.svg", desc: `Скорость схваченного существа равна 0, и оно не получает выгоды ни от каких бонусов к скорости.

Состояние оканчивается, если схвативший становится «недееспособным».

Это состояние также оканчивается, если какой-либо эффект выводит схваченное существо из зоны досягаемости того, кто его удерживает, или из зоны удерживающего эффекта. Например, когда существо отбрасывается заклинанием волна грома.` },
  ];
      
  function computeArmorClassParts(c, opts) {
    const useDex = opts && typeof opts.useDex === "boolean" ? opts.useDex : !!c.acUseDex;
    const extra = opts && Number.isFinite(Number(opts.extra)) ? safeInt(opts.extra, 0) : safeInt(c.acExtra, 0);

    const eq = c?.equipment || {};
    const lines = [];

    let armorSum = 0;

    // base 10
    lines.push({ label: "База", value: 10 });

    const keys = Object.keys(eq);
    for (const k of keys) {
      const wrap = eq[k];
      const item = wrap?.item;
      if (!item) continue;
      if (String(wrap?.fromCat) !== "armor") continue;

      const ac = safeInt(item.ac, 0);
      if (!ac) continue;

      armorSum += ac;
      const nm = String(item.name || "").trim() || "Без названия";
      lines.push({ label: nm, value: ac });
    }

    let dexVal = 0;
    if (useDex) {
      dexVal = abilityMod(getAbilityScore(c, "dex"));
      if (dexVal) lines.push({ label: "Ловкость", value: dexVal });
      else lines.push({ label: "Ловкость", value: 0 });
    }

    if (extra) lines.push({ label: "Доп.", value: extra });

    const total = clamp(10 + armorSum + (useDex ? dexVal : 0) + extra, 0, 99);

    return { total, lines, useDex, extra };
  }

function syncHeaderPart2(c) {
    if (!c) return;

    // AC (derived from equipment + settings)
    const acParts = computeArmorClassParts(c);
    c.armorClass = acParts.total;
    if (typeof acValue !== "undefined" && acValue) {
      acValue.textContent = String(acParts.total);
    }

    // Conditions icons on main button
    const condKeys = Array.isArray(c.conditions) ? c.conditions : [];
    const exh = clamp(safeInt(c.exhaustionLevel, 0), 0, 6);

    if (typeof conditionsBtn === "undefined" || !conditionsBtn) return;
    if (typeof conditionsIcons === "undefined" || !conditionsIcons) return;
    if (typeof conditionsText === "undefined" || !conditionsText) return;

    conditionsIcons.innerHTML = "";

    // selected condition icons
    for (const key of condKeys) {
      const row = CONDITIONS.find((x) => x.key === key);
      if (!row) continue;

      const img = document.createElement("img");
      img.className = "condMiniIcon";
      img.src = row.icon;
      img.alt = row.label;
      conditionsIcons.appendChild(img);
    }

    // exhaustion icon + badge
    if (exh > 0) {
      const wrap = document.createElement("div");
      wrap.className = "condMiniWrap";

      const img = document.createElement("img");
      img.className = "condMiniIcon";
      img.src = "./assets/icons/exhaustion.svg";
      img.alt = "Истощение";

      const badge = document.createElement("div");
      badge.className = "condBadge";
      badge.textContent = String(exh);

      wrap.appendChild(img);
      wrap.appendChild(badge);
      conditionsIcons.appendChild(wrap);
    }

    const hasAny = condKeys.length > 0 || exh > 0;
    conditionsBtn.classList.toggle("has-selection", hasAny);
    conditionsIcons.setAttribute("aria-hidden", String(!hasAny));
  }

  function syncHeaderPart3(c) {
    if (!c) return;

    // Speed (display only)
    if (speedValue) speedValue.textContent = String(clamp(safeInt(c.speed, 0), 0, 200));

    // Inspiration
    if (inspValue) inspValue.textContent = String(clamp(safeInt(c.inspiration, 0), 0, 99));

// Initiative = DEX check (same as DEX "ПРОВЕРКА")
    const init = abilityMod(getAbilityScore(c, "dex"));
    if (initValue) initValue.textContent = formatSigned(init);
    }
      const $ = (id) => document.getElementById(id);

  // ===== Custom select (for inventory editor): avoids native ugly dropdown =====
  function enhanceInvSelect(selectEl) {
    if (!selectEl || selectEl.dataset.csEnhanced === "1") return;
    selectEl.dataset.csEnhanced = "1";

    const wrap = document.createElement("div");
    wrap.className = "csWrap";

    // insert wrapper in place
    const parent = selectEl.parentElement;
    parent.insertBefore(wrap, selectEl);
    wrap.appendChild(selectEl);
    selectEl.classList.add("csSelect");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "csBtn";
    btn.innerHTML = `
      <span class="csBtn__label"></span>
      <img class="csBtn__chev" src="./assets/icons/chevron-down.svg" alt="" />
    `;
    wrap.appendChild(btn);

    const menu = document.createElement("div");
    menu.className = "csMenu";
    wrap.appendChild(menu);

    const labelEl = btn.querySelector(".csBtn__label");

    function syncLabel() {
      const opt = selectEl.options[selectEl.selectedIndex];
      labelEl.textContent = opt ? opt.textContent : "";
      wrap.dataset.value = String(selectEl.value || "");
    }

    function close() {
      wrap.classList.remove("is-open");
    }

    function open() {
      wrap.classList.add("is-open");
      const active = menu.querySelector(".csOpt.is-active");
      if (active) active.focus();
    }

    function rebuild() {
      menu.innerHTML = "";
      for (const opt of selectEl.options) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "csOpt";
        b.dataset.value = String(opt.value || "");
        b.textContent = opt.textContent;
        if (opt.value === selectEl.value) b.classList.add("is-active");
        b.addEventListener("click", () => {
          selectEl.value = opt.value;
          selectEl.dispatchEvent(new Event("change", { bubbles: true }));
          syncLabel();
          rebuild();
          close();
        });
        menu.appendChild(b);
      }
    }

    btn.addEventListener("click", () => {
      if (wrap.classList.contains("is-open")) close();
      else open();
    });

    // close on outside
    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) close();
    });

    // esc closes
    wrap.addEventListener("keydown", (e) => {
      if (e.key === "Escape") close();
    });

    selectEl.addEventListener("change", () => {
      syncLabel();
      rebuild();
    });

    syncLabel();
    rebuild();
  }

  // Screens
  const screenList = $("screenList");
  const screenChar = $("screenChar");

  // List UI
  const cardsBox = $("cards");
  const counterText = $("counterText");
  const addBtn = $("addBtn");

  // JSON popover
  const jsonBtn = $("jsonBtn");
  const jsonPopover = $("jsonPopover");
  const exportBtn = $("exportBtn");
  const importBtn = $("importBtn");
  const importFile = $("importFile");

  // Character UI
  const backToList = $("backToList");
  const charName = $("charName");
  const charRaceClass = $("charRaceClass");
  const charAvatarBtn = $("charAvatarBtn");
  const charAvatarImg = $("charAvatarImg");
  const avatarPopover = $("avatarPopover");

  // XP bar
  const xpBarBtn = $("xpBarBtn");
  const xpLevelLeft = $("xpLevelLeft");
  const xpLevelRight = $("xpLevelRight");
  const xpFill = $("xpFill");
  const xpText = $("xpText");

  // Collapse
  const collapseBtn = $("collapseBtn");
  const collapseText = $("collapseText");
  const collapseIcon = $("collapseIcon");
  let isCollapsed = false;

// Modals
  const xpModal = $("xpModal");
  const settingsModal = $("settingsModal");
  const spellModal = $("spellModal");
  const portraitModal = $("portraitModal");
  const hpModal = $("hpModal");
  const abilityEditModal = $("abilityEditModal");
  const skillEditModal = $("skillEditModal");

  // Abilities UI
  const abilitiesRoot = $("abilitiesRoot");

  // Ability modal fields
  const abilityEditTitle = $("abilityEditTitle");
  const abilityEditScore = $("abilityEditScore");
  const abilityEditSaveBonus = $("abilityEditSaveBonus");
  const abilityEditSaveBtn = $("abilityEditSaveBtn");

  // Skill modal fields
  const skillEditTitle = $("skillEditTitle");
  const skillEditBonus = $("skillEditBonus");
  const skillEditSaveBtn = $("skillEditSaveBtn");
    // Header part 2 (AC + Conditions + HP)
  const acBtn = $("acBtn");
  const acValue = $("acValue");
  const conditionsBtn = $("conditionsBtn");
  const conditionsText = $("conditionsText");
  const conditionsIcons = $("conditionsIcons");
  const hpBtn = $("hpBtn");
  const hpBtnNums = $("hpBtnNums");
  const hpBtnTemp = $("hpBtnTemp");
  const hpBtnFillTemp = $("hpBtnFillTemp");
  const hpBtnFillCur = $("hpBtnFillCur");

  // Header part 3 (Speed + Inspiration + Initiative)
  const speedValue = $("speedValue");
  const inspBtn = $("inspBtn");
  const inspValue = $("inspValue");
  const initValue = $("initValue");

  // Sections UI
  const sectionBarBtn = $("sectionBarBtn");
  const sectionBarIcon = $("sectionBarIcon");
  const sectionBarTitle = $("sectionBarTitle");
  const sectionsPager = $("sectionsPager");
  const sectionsTrack = $("sectionsTrack");
  const sectionsModal = $("sectionsModal");
  const sectionsListBox = $("sectionsList");

  // Personality UI
  const persTextModal = $("persTextModal");
  const persTextTitle = $("persTextTitle");
  const persTextInput = $("persTextInput");
  const persTextSaveBtn = $("persTextSaveBtn");
  const personalityLineInputs = Array.from(document.querySelectorAll("[data-pers-line]"));
  const personalityBlockBtns = Array.from(document.querySelectorAll("[data-pers-open]"));
  const personalityPreviewEls = Array.from(document.querySelectorAll("[data-pers-preview]"));

  // Attacks UI
  const atkWeaponsList = $("atkWeaponsList");
  const atkWeaponsEmpty = $("atkWeaponsEmpty");
  const atkTip = $("atkTip");
  const atkWeaponsToggle = $("atkWeaponsToggle");
  const atkWeaponsBody = $("atkWeaponsBody");
  const atkAbilitiesToggle = $("atkAbilitiesToggle");
  const atkAbilitiesBody = $("atkAbilitiesBody");
  const atkAbilitiesList = $("atkAbilitiesList");
  const atkAbilitiesEmpty = $("atkAbilitiesEmpty");
  const atkAbilitiesAddBtn = $("atkAbilitiesAddBtn");
  const atkAbilitiesSortBtn = $("atkAbilitiesSortBtn");

  // Senses UI
  const sensePassiveTip = $("sensePassiveTip");
  const sensePassiveBtns = Array.from(document.querySelectorAll(".sensePassiveBtn[data-passive-skill]"));
  const senseProfToggle = $("senseProfToggle");
  const senseProfBody = $("senseProfBody");
  const senseProfList = $("senseProfList");
  const senseProfEmpty = $("senseProfEmpty");
  const senseProfAddBtn = $("senseProfAddBtn");
  const senseProfSortBtn = $("senseProfSortBtn");

  // Inventory UI
  const invTabs = Array.from(document.querySelectorAll(".invTab"));
  const invPanels = Array.from(document.querySelectorAll(".invPanel"));
  const invGoldTotals = Array.from(document.querySelectorAll('[data-bind="goldTotal"]'));

  const invWeaponsList = $("invWeaponsList");
  const invWeaponsEmpty = $("invWeaponsEmpty");
  const invWeaponsAddBtn = $("invWeaponsAddBtn");
  const invWeaponsSortBtn = $("invWeaponsSortBtn");

  const invArmorList = $("invArmorList");
  const invArmorEmpty = $("invArmorEmpty");
  const invArmorSortBtn = $("invArmorSortBtn");
  const invArmorAddBtn = $("invArmorAddBtn");

  const invAccessoriesList = $("invAccessoriesList");
  const invAccessoriesEmpty = $("invAccessoriesEmpty");
  const invAccessoriesSortBtn = $("invAccessoriesSortBtn");
  const invAccessoriesAddBtn = $("invAccessoriesAddBtn");

  const invPotionsList = $("invPotionsList");
  const invPotionsEmpty = $("invPotionsEmpty");
  const invPotionsSortBtn = $("invPotionsSortBtn");
  const invPotionsAddBtn = $("invPotionsAddBtn");

  const invScrollsList = $("invScrollsList");
  const invScrollsEmpty = $("invScrollsEmpty");
  const invScrollsSortBtn = $("invScrollsSortBtn");
  const invScrollsAddBtn = $("invScrollsAddBtn");

  const invOtherList = $("invOtherList");
  const invOtherEmpty = $("invOtherEmpty");
  const invOtherSortBtn = $("invOtherSortBtn");
  const invOtherAddBtn = $("invOtherAddBtn");


  // New modals
  const acModal = $("acModal");
  const conditionsModal = $("conditionsModal");
  const inspModal = $("inspModal");

  // Inventory modals
const invItemModal = $("invItemModal");
const invNotesModal = $("invNotesModal");
const invCalcModal = $("invCalcModal");
const invCalcTitle = $("invCalcTitle");
const invCalcBody = $("invCalcBody");
const invSellModal = $("invSellModal");
const equipSlotModal = $("equipSlotModal");
const equipItemModal = $("equipItemModal");
const equipConfirmModal = $("equipConfirmModal");
const equipRaceModal = $("equipRaceModal");
const invSellItemName = $("invSellItemName");
const invSellDenomBtn = $("invSellDenomBtn");
const invSellDenomIcon = $("invSellDenomIcon");
const invSellDenomText = $("invSellDenomText");
const invSellDenomPopover = $("invSellDenomPopover");
const invSellAmount = $("invSellAmount");
const invSellCancel = $("invSellCancel");
const invSellOk = $("invSellOk");

const invLogModal = $("invLogModal");
const invLogBody = $("invLogBody");
const invLogEmpty = $("invLogEmpty");
const atkAbilityModal = $("atkAbilityModal");
const atkAbilityName = $("atkAbilityName");
const atkAbilityQty = $("atkAbilityQty");
const atkAbilityMax = $("atkAbilityMax");
const atkAbilityNotes = $("atkAbilityNotes");
const atkAbilityShowNotes = $("atkAbilityShowNotes");
const atkAbilityRestoreBtn = $("atkAbilityRestoreBtn");
const atkAbilityDeleteBtn = $("atkAbilityDeleteBtn");
const atkAbilitySaveBtn = $("atkAbilitySaveBtn");
const senseProfModal = $("senseProfModal");
const senseProfName = $("senseProfName");
const senseProfQty = $("senseProfQty");
const senseProfMax = $("senseProfMax");
const senseProfNotes = $("senseProfNotes");
const senseProfUseCharges = $("senseProfUseCharges");
const senseProfShowNotes = $("senseProfShowNotes");
const senseProfRestoreBtn = $("senseProfRestoreBtn");
const senseProfDeleteBtn = $("senseProfDeleteBtn");
const senseProfSaveBtn = $("senseProfSaveBtn");

  // Inventory editor fields
  const invEditTitle = $("invEditTitle");
  const invEditSub = $("invEditSub");
  const invEditName = $("invEditName");
  const invEditRarity = $("invEditRarity");
  if (invEditRarity) invEditRarity.addEventListener("change", () => { invEditRarity.dataset.rarity = String(invEditRarity.value || "common"); });
  if (invEditRarity) enhanceInvSelect(invEditRarity);
  const invEditNotes = $("invEditNotes");

  const invEditWeaponFields = $("invEditWeaponFields");
  const invEditWeaponAbility = $("invEditWeaponAbility");
  if (invEditWeaponAbility) enhanceInvSelect(invEditWeaponAbility);
  const invEditWeaponExtra = $("invEditWeaponExtra");
  const invEditWeaponProf = $("invEditWeaponProf");
  const invEditWeaponDamage = $("invEditWeaponDamage");

  const invEditArmorFields = $("invEditArmorFields");
  const invEditArmorAc = $("invEditArmorAc");
  const invEditArmorQty = $("invEditArmorQty");

  const invEditQtyFields = $("invEditQtyFields");
  const invEditQty = $("invEditQty");

  const invEditShowNotes = $("invEditShowNotes");
  const invEditEquipBtn = $("invEditEquipBtn");
  const invEditSellBtn = $("invEditSellBtn");
  const invEditDropBtn = $("invEditDropBtn");
  const invEditSaveBtn = $("invEditSaveBtn");

  const equipRaceBtn = $("equipRaceBtn");
  const equipRaceLabel = $("equipRaceLabel");
  const equipSil = $("equipSil");
  const equipTip = $("equipTip");
  const equipSlotBtns = Array.from(document.querySelectorAll(".equipSlot[data-slot]"));

  const equipSlotBody = $("equipSlotBody");
  const equipItemTitle = $("equipItemTitle");
  const equipItemList = $("equipItemList");

  const equipConfirmText = $("equipConfirmText");
  const equipConfirmCancel = $("equipConfirmCancel");
  const equipConfirmOk = $("equipConfirmOk");

  const equipRaceList = $("equipRaceList");


  // Notes modal fields
  const invNotesTitle = $("invNotesTitle");
  const invNotesBody = $("invNotesBody");


  // AC modal UI
  const acInput = $("acInput");
  const acSources = $("acSources");
  const acUseDex = $("acUseDex");
  const acExtraInput = $("acExtraInput");
  const acCancel = $("acCancel");
  const acOk = $("acOk");

  // Inspiration modal UI
  const inspInput = $("inspInput");
  const inspCancel = $("inspCancel");
  const inspOk = $("inspOk");

  // Conditions modal UI
  const conditionsList = $("conditionsList");
  const exhRow = $("exhRow");
  const exhToggle = $("exhToggle");
  const exhLevelValue = $("exhLevelValue");
  const exhDesc = $("exhDesc");
  // XP calc UI
  const xpMiniLeft = $("xpMiniLeft");
  const xpMiniRight = $("xpMiniRight");
  const xpMiniFill = $("xpMiniFill");
  const xpMiniText = $("xpMiniText");
    const xpInput = $("xpInput");
  const xpBackspace = $("xpBackspace");
  const xpLevelUp = $("xpLevelUp");
  const xpAdd = $("xpAdd");
  const xpSub = $("xpSub");

  // COINS calc UI
  const coinsModal = $("coinsModal");
  const coinsTotalGold = $("coinsTotalGold");
  const coinsGp = $("coinsGp");
  const coinsSp = $("coinsSp");
  const coinsCp = $("coinsCp");
  const coinsPp = $("coinsPp");
  const coinsEp = $("coinsEp");

  const coinDenomBtn = $("coinDenomBtn");
  const coinDenomIcon = $("coinDenomIcon");
  const coinDenomPopover = $("coinDenomPopover");
  const coinInput = $("coinInput");
  const coinBackspace = $("coinBackspace");

  const coinConvCp = $("coinConvCp");
  const coinConvSp = $("coinConvSp");
  const coinConvEp = $("coinConvEp");
  const coinConvGp = $("coinConvGp");
  const coinConvPp = $("coinConvPp");

  const coinGive = $("coinGive");
  const coinTake = $("coinTake");

  // HP calc UI
  const hpTopCenter = document.querySelector(".hpTop__center");
  const hpTopText = $("hpTopText");
  const hpTopTemp = $("hpTopTemp");
    const hpInput = $("hpInput");
  const hpBackspace = $("hpBackspace");
  const hpTemp = $("hpTemp");
  const hpHeal = $("hpHeal");
  const hpDmg = $("hpDmg");

  // Settings UI
  //   const openSettings = $("openSettings");
  const openPortrait = $("openPortrait");
  const setName = $("setName");
  const setRace = $("setRace");
  const setClass = $("setClass");
  const setSubclass = $("setSubclass");
  const setSpeed = $("setSpeed");
  const setHpMax = $("setHpMax");
  const themeMoltenBtn = $("themeMoltenBtn");
  const themeArcaneBtn = $("themeArcaneBtn");
  const themeLegionBtn = $("themeLegionBtn");
  const openSpellSettings = $("openSpellSettings");
  // Spell UI
  const spellBack = $("spellBack");
  const spellAbilityBtn = $("spellAbilityBtn");
  const spellAbilityText = $("spellAbilityText");
  const abilityPopover = $("abilityPopover");
  const spellSaveDc = $("spellSaveDc");
  const spellAtkBonus = $("spellAtkBonus");
  const slotsGrid = $("slotsGrid");

  // Spells screen UI
  const spellsSaveTop = $("spellsSaveTop");
  const spellsAtkTop = $("spellsAtkTop");
  const spellsSettingsBtn = $("spellsSettingsBtn");
  const spellsPrepareBtn = $("spellsPrepareBtn");
  const spellsCreateBtn = $("spellsCreateBtn");
  const spellsFilters = $("spellsFilters");
  const spellsList = $("spellsList");

  // Spell classes in settings
  const spellClassesBtn = $("spellClassesBtn");
  const spellClassesChips = $("spellClassesChips");
  const classesPopover = $("classesPopover");

  // Spell view modal
  const spellViewModal = $("spellViewModal");
  const spellViewTitle = $("spellViewTitle");
  const spellViewSub = $("spellViewSub");
  const spellViewCast = $("spellViewCast");
  const spellViewRange = $("spellViewRange");
  const spellViewDuration = $("spellViewDuration");
  const spellViewComponents = $("spellViewComponents");
  const spellViewDamage = $("spellViewDamage");
  const spellViewSlotRow = $("spellViewSlotRow");
  const spellViewSlots = $("spellViewSlots");
  const spellViewDesc = $("spellViewDesc");
  const spellViewClasses = $("spellViewClasses");

  // Prepare spells modal
  const spellPrepModal = $("spellPrepModal");
  const spellPrepTabKnown = $("spellPrepTabKnown");
  const spellPrepTabAll = $("spellPrepTabAll");
  const spellPrepTabCreated = $("spellPrepTabCreated");
  const spellPrepKnownCount = $("spellPrepKnownCount");
  const spellPrepAllCount = $("spellPrepAllCount");
  const spellPrepCreatedCount = $("spellPrepCreatedCount");
  const spellPrepKnownPane = $("spellPrepKnownPane");
  const spellPrepAllPane = $("spellPrepAllPane");
  const spellPrepCreatedPane = $("spellPrepCreatedPane");

  // Create custom spell modal
  const spellCreateModal = $("spellCreateModal");
  const scName = $("scName");
  const scLevel = $("scLevel");
  const scSchool = $("scSchool");
  const scCompChips = $("scCompChips");
  const scMaterialText = $("scMaterialText");
  const scCastCount = $("scCastCount");
  const scCastType = $("scCastType");
  const scCastCondition = $("scCastCondition");
  const scTargetType = $("scTargetType");
  const scTargetSize = $("scTargetSize");
  const scTargetUnit = $("scTargetUnit");
  const scRangeType = $("scRangeType");
  const scRangeAmount = $("scRangeAmount");
  const scDurationType = $("scDurationType");
  const scDurationAmount = $("scDurationAmount");
  const scFlagsChips = $("scFlagsChips");
  const scActionType = $("scActionType");
  const scSaveReq = $("scSaveReq");
  const scSaveAbility = $("scSaveAbility");
  const scDamageDice = $("scDamageDice");
  const scDamageType = $("scDamageType");
  const scScalingType = $("scScalingType");
  const scScalingDice = $("scScalingDice");
  const scDescription = $("scDescription");
  const scClassesBtn = $("scClassesBtn");
  const scClassesChips = $("scClassesChips");
  const scClassesPlaceholder = $("scClassesPlaceholder");
  const scClassesPopover = $("scClassesPopover");
  const scDeleteBtn = $("scDeleteBtn");
  const scSaveBtn = $("scSaveBtn");


  // Portrait UI
  const portraitUploadBtn = $("portraitUploadBtn");
  const portraitFile = $("portraitFile");

  // Cover UI
  const coverBg = $("coverBg");
  const coverUploadBtn = $("coverUploadBtn");
  const coverFile = $("coverFile");
  // Toast
  const toast = $("toast");
  let toastTimer = null;

  // State
  let characters = loadCharacters();
  let activeId = null;
  // ===== Theme =====
  const THEME_KEY = "dnd5e.theme.v1";

  function applyTheme(theme) {
    const allowed = new Set(["molten", "arcane", "legion"]);
    const t = allowed.has(theme) ? theme : "molten";

    document.documentElement.setAttribute("data-theme", t);
    localStorage.setItem(THEME_KEY, t);

    if (themeMoltenBtn) themeMoltenBtn.classList.toggle("is-active", t === "molten");
    if (themeArcaneBtn) themeArcaneBtn.classList.toggle("is-active", t === "arcane");
    if (themeLegionBtn) themeLegionBtn.classList.toggle("is-active", t === "legion");
  }
  // apply saved theme (default molten)
  applyTheme(localStorage.getItem(THEME_KEY) || "molten");

  // ===== Cover =====
  function setCover(url) {
    if (!coverBg) return;
    const u = (url || "").trim();
    if (!u) {
      coverBg.style.backgroundImage = "";
      coverBg.classList.remove("is-on");
      return;
    }
    coverBg.style.backgroundImage = `url("${u}")`;
    coverBg.classList.add("is-on");
  }

  function applyCover(c) {
    setCover(c && c.coverDataUrl ? c.coverDataUrl : "");
  }

  // ===== Utilities =====

  function showToast(text) {
    clearTimeout(toastTimer);
    toast.textContent = text;
    toast.classList.remove("toast--hidden");
    toastTimer = setTimeout(() => toast.classList.add("toast--hidden"), 1400);
  }

  function clamp(n, a, b) {
    return Math.max(a, Math.min(b, n));
  }

  function safeInt(v, fallback = 0) {
    const n = Number(String(v).replace(/[^\d-]/g, ""));
    return Number.isFinite(n) ? n : fallback;
  }

  function nowId() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function loadCharacters() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return [];
      return arr;
    } catch {
      return [];
    }
  }

  function saveCharacters() {
    localStorage.setItem(LS_KEY, JSON.stringify(characters));
  }

  function getCharacterById(id) {
    return characters.find((c) => c.id === id) || null;
  }

  function abilityMod(score) {
    const s = Number(score);
    if (!Number.isFinite(s)) return 0;
    return Math.floor((s - 10) / 2);
  }

  function getXpMinForLevel(level) {
    const row = XP_TABLE.find((r) => r.level === level);
    return row ? row.xp : 0;
  }

  function getXpForNextLevel(level) {
    const next = XP_TABLE.find((r) => r.level === level + 1);
    return next ? next.xp : null;
  }

  function getProfBonus(level) {
    const row = XP_TABLE.find((r) => r.level === level);
    return row ? row.pb : 2;
  }

  function formatRaceClass(c) {
    const r = (c.race || "").trim() || "—";
    const cl = (c.className || "").trim() || "—";
    return `${r} — ${cl}`;
  }


  function normEquipWrap(v, fromCat) {
    if (!v) return null;
    if (v && typeof v === "object" && v.item && typeof v.fromCat === "string") {
      return { item: v.item, fromCat: v.fromCat };
    }
    return { item: v, fromCat: String(fromCat || "other") };
  }

  function ensureDefaults(c) {
    const rawConds = Array.isArray(c.conditions) ? c.conditions : [];
    const validKeys = new Set(CONDITIONS.map((x) => x.key));
    const conds = rawConds.map(String).filter((k) => validKeys.has(k));

    return {
      id: c.id ?? nowId(),
      name: c.name ?? "Безымянный персонаж",
      race: c.race ?? "",
      className: c.className ?? "",
      subclass: c.subclass ?? "",
      speed: Number.isFinite(c.speed) ? c.speed : 0,

      level: Number.isFinite(c.level) ? c.level : 1,
      xpCurrent: Number.isFinite(c.xpCurrent) ? c.xpCurrent : 0,

      hpCurrent: Number.isFinite(c.hpCurrent) ? c.hpCurrent : 0,
      hpMax: Number.isFinite(c.hpMax) ? c.hpMax : 0,
      hpTemp: Number.isFinite(c.hpTemp) ? c.hpTemp : 0,
      // Header stats
      armorClass: Number.isFinite(c.armorClass) ? c.armorClass : 10,
      acUseDex: !!c.acUseDex,
      acExtra: safeInt(c.acExtra, 0),
      conditions: conds,
      exhaustionLevel: Number.isFinite(c.exhaustionLevel) ? clamp(safeInt(c.exhaustionLevel, 0), 0, 6) : 0,
      inspiration: Number.isFinite(c.inspiration) ? clamp(safeInt(c.inspiration, 0), 0, 99) : 0,

      activeSectionKey: typeof c.activeSectionKey === "string" ? c.activeSectionKey : "abilities",

      // Inventory / wallet / equipment / history
      invTabKey: typeof c.invTabKey === "string" ? c.invTabKey : "weapons",
      invSortWeapons: !!c.invSortWeapons,
      invSortArmor: !!c.invSortArmor,
      invSortAccessories: !!c.invSortAccessories,
      invSortPotions: !!c.invSortPotions,
      invSortScrolls: !!c.invSortScrolls,
      invSortOther: !!c.invSortOther,
      atkWeaponsCollapsed: !!c.atkWeaponsCollapsed,
      atkAbilitiesCollapsed: !!c.atkAbilitiesCollapsed,
      atkSortAbilities: !!c.atkSortAbilities,
      attackAbilities: Array.isArray(c.attackAbilities) ? c.attackAbilities : [],
      senseProfCollapsed: !!c.senseProfCollapsed,
      senseSortProf: !!c.senseSortProf,
      senseProficiencies: Array.isArray(c.senseProficiencies) ? c.senseProficiencies : [],

      wallet: {
        gp: safeInt(c.wallet?.gp, 0),
        sp: safeInt(c.wallet?.sp, 0),
        cp: safeInt(c.wallet?.cp, 0),
        ep: safeInt(c.wallet?.ep, 0),
        pp: safeInt(c.wallet?.pp, 0),
      },

      inventory: {
        weapons: Array.isArray(c.inventory?.weapons) ? c.inventory.weapons : [],
        armor: Array.isArray(c.inventory?.armor) ? c.inventory.armor : [],
        accessories: Array.isArray(c.inventory?.accessories) ? c.inventory.accessories : [],
        potions: Array.isArray(c.inventory?.potions) ? c.inventory.potions : [],
        scrolls: Array.isArray(c.inventory?.scrolls) ? c.inventory.scrolls : [],
        other: Array.isArray(c.inventory?.other) ? c.inventory.other : [],
      },

      equipment: {
        weaponRight: normEquipWrap(c.equipment?.weaponRight ?? null, "weapons"),
        weaponLeft: normEquipWrap(c.equipment?.weaponLeft ?? null, "weapons"),
        weaponTwoHand: normEquipWrap(c.equipment?.weaponTwoHand ?? null, "weapons"),

        head: normEquipWrap(c.equipment?.head ?? null, "armor"),
        amulet: normEquipWrap(c.equipment?.amulet ?? null, "accessories"),
        shoulders: normEquipWrap(c.equipment?.shoulders ?? null, "armor"),
        chest: normEquipWrap(c.equipment?.chest ?? null, "armor"),
        cloak: normEquipWrap(c.equipment?.cloak ?? null, "armor"),

        hands: normEquipWrap(c.equipment?.hands ?? null, "armor"),
        belt: normEquipWrap(c.equipment?.belt ?? null, "armor"),
        feet: normEquipWrap(c.equipment?.feet ?? null, "armor"),
        ring1: normEquipWrap(c.equipment?.ring1 ?? null, "accessories"),
        ring2: normEquipWrap(c.equipment?.ring2 ?? null, "accessories"),

        shield: normEquipWrap(c.equipment?.shield ?? null, "armor"),

      },

      history: Array.isArray(c.history) ? c.history : [],

avatarDataUrl: c.avatarDataUrl ?? "",
      coverDataUrl: c.coverDataUrl ?? "",
      silhouetteKey: typeof c.silhouetteKey === "string" ? c.silhouetteKey : "human",
      abilityScores: {
        str: Number.isFinite(Number(c.abilityScores?.str)) ? Number(c.abilityScores.str) : 10,
        dex: Number.isFinite(Number(c.abilityScores?.dex)) ? Number(c.abilityScores.dex) : 10,
        con: Number.isFinite(Number(c.abilityScores?.con)) ? Number(c.abilityScores.con) : 10,
        int: Number.isFinite(Number(c.abilityScores?.int)) ? Number(c.abilityScores.int) : 10,
        wis: Number.isFinite(Number(c.abilityScores?.wis)) ? Number(c.abilityScores.wis) : 10,
        cha: Number.isFinite(Number(c.abilityScores?.cha)) ? Number(c.abilityScores.cha) : 10,
      },

      abilitySaves: {
        str: { prof: !!c.abilitySaves?.str?.prof, bonus: safeInt(c.abilitySaves?.str?.bonus, 0) },
        dex: { prof: !!c.abilitySaves?.dex?.prof, bonus: safeInt(c.abilitySaves?.dex?.bonus, 0) },
        con: { prof: !!c.abilitySaves?.con?.prof, bonus: safeInt(c.abilitySaves?.con?.bonus, 0) },
        int: { prof: !!c.abilitySaves?.int?.prof, bonus: safeInt(c.abilitySaves?.int?.bonus, 0) },
        wis: { prof: !!c.abilitySaves?.wis?.prof, bonus: safeInt(c.abilitySaves?.wis?.bonus, 0) },
        cha: { prof: !!c.abilitySaves?.cha?.prof, bonus: safeInt(c.abilitySaves?.cha?.bonus, 0) },
      },

      skillStates: {
        athletics: { prof: !!c.skillStates?.athletics?.prof, bonus: safeInt(c.skillStates?.athletics?.bonus, 0) },
        acrobatics: { prof: !!c.skillStates?.acrobatics?.prof, bonus: safeInt(c.skillStates?.acrobatics?.bonus, 0) },
        sleightOfHand: { prof: !!c.skillStates?.sleightOfHand?.prof, bonus: safeInt(c.skillStates?.sleightOfHand?.bonus, 0) },
        stealth: { prof: !!c.skillStates?.stealth?.prof, bonus: safeInt(c.skillStates?.stealth?.bonus, 0) },

        arcana: { prof: !!c.skillStates?.arcana?.prof, bonus: safeInt(c.skillStates?.arcana?.bonus, 0) },
        history: { prof: !!c.skillStates?.history?.prof, bonus: safeInt(c.skillStates?.history?.bonus, 0) },
        investigation: { prof: !!c.skillStates?.investigation?.prof, bonus: safeInt(c.skillStates?.investigation?.bonus, 0) },
        nature: { prof: !!c.skillStates?.nature?.prof, bonus: safeInt(c.skillStates?.nature?.bonus, 0) },
        religion: { prof: !!c.skillStates?.religion?.prof, bonus: safeInt(c.skillStates?.religion?.bonus, 0) },

        animalHandling: { prof: !!c.skillStates?.animalHandling?.prof, bonus: safeInt(c.skillStates?.animalHandling?.bonus, 0) },
        insight: { prof: !!c.skillStates?.insight?.prof, bonus: safeInt(c.skillStates?.insight?.bonus, 0) },
        medicine: { prof: !!c.skillStates?.medicine?.prof, bonus: safeInt(c.skillStates?.medicine?.bonus, 0) },
        perception: { prof: !!c.skillStates?.perception?.prof, bonus: safeInt(c.skillStates?.perception?.bonus, 0) },
        survival: { prof: !!c.skillStates?.survival?.prof, bonus: safeInt(c.skillStates?.survival?.bonus, 0) },

        deception: { prof: !!c.skillStates?.deception?.prof, bonus: safeInt(c.skillStates?.deception?.bonus, 0) },
        intimidation: { prof: !!c.skillStates?.intimidation?.prof, bonus: safeInt(c.skillStates?.intimidation?.bonus, 0) },
        performance: { prof: !!c.skillStates?.performance?.prof, bonus: safeInt(c.skillStates?.performance?.bonus, 0) },
        persuasion: { prof: !!c.skillStates?.persuasion?.prof, bonus: safeInt(c.skillStates?.persuasion?.bonus, 0) },
      },

      personality: {
        background: String(c.personality?.background ?? ""),
        alignment: String(c.personality?.alignment ?? ""),
        appearance: String(c.personality?.appearance ?? ""),
        height: String(c.personality?.height ?? ""),
        weight: String(c.personality?.weight ?? ""),
        age: String(c.personality?.age ?? ""),
        eyes: String(c.personality?.eyes ?? ""),
        skin: String(c.personality?.skin ?? ""),
        hair: String(c.personality?.hair ?? ""),
        characterBackstory: String(c.personality?.characterBackstory ?? ""),
        allies: String(c.personality?.allies ?? ""),
        traits: String(c.personality?.traits ?? ""),
        ideals: String(c.personality?.ideals ?? ""),
        bonds: String(c.personality?.bonds ?? ""),
        flaws: String(c.personality?.flaws ?? ""),
        goalsMain: String(c.personality?.goalsMain ?? ""),
        note1: String(c.personality?.note1 ?? ""),
        note2: String(c.personality?.note2 ?? ""),
        note3: String(c.personality?.note3 ?? ""),
        note4: String(c.personality?.note4 ?? ""),
        note5: String(c.personality?.note5 ?? ""),
        note6: String(c.personality?.note6 ?? ""),
        note7: String(c.personality?.note7 ?? ""),
      },

      spellcasting: c.spellcasting ?? {
        ability: "",
        slots: { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0, "6": 0, "7": 0, "8": 0, "9": 0 },
      },

      spellbook: c.spellbook ?? {
        classes: [],
        known: [],
        custom: [],
      },
    };  }
  function normalizeAll() {
    characters = characters.map(ensureDefaults);
    saveCharacters();
  }

  normalizeAll();
  renderList();

  // ===== Screen navigation =====

  function openList() {
    screenChar.classList.remove("screen--active");
    screenList.classList.add("screen--active");
    closeAllPopovers();
    closeAllModals();
    activeId = null;
  }

  function openCharacter(id) {
    const c = getCharacterById(id);
    if (!c) return;
    activeId = id;

    screenList.classList.remove("screen--active");
    screenChar.classList.add("screen--active");

    closeAllPopovers();
    closeAllModals();
    syncCharacterUI();
  }

  // ===== List rendering =====

  function renderList() {
    counterText.textContent = `${characters.length}/${MAX_CHARS}`;
    cardsBox.innerHTML = "";

    for (const c0 of characters) {
      const c = ensureDefaults(c0);

      const card = document.createElement("div");
      card.className = "card";
      card.setAttribute("role", "button");
      card.tabIndex = 0;

      card.addEventListener("click", (e) => {
        const t = e.target;
        if (t && (t.closest(".card__menuBtn") || t.closest(".popover"))) return;
        openCharacter(c.id);
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") openCharacter(c.id);
      });

      const avatarSrc = c.avatarDataUrl ? c.avatarDataUrl : "./assets/icons/hero.svg";
      const raceClass = formatRaceClass(c);
      const lvl = c.level || 1;

      card.innerHTML = `
        <div class="card__row">
          <div class="card__avatarWrap">
            <img class="card__avatar" src="${avatarSrc}" alt="" />
          </div>

          <div>
            <div class="card__name">${escapeHtml(c.name || "Безымянный персонаж")}</div>
            <div class="card__meta">${escapeHtml(raceClass)} · ${lvl} ур.</div>

            <div class="card__hp">
              <img class="card__hpIcon" src="./assets/icons/hp.svg" alt="" />
              <span class="card__hpText">${safeInt(c.hpCurrent, 0)}/${safeInt(c.hpMax, 0)}</span>
            </div>
          </div>
        </div>

        <button class="card__menuBtn" type="button" aria-label="Меню">
          <img class="card__menuIcon" src="./assets/icons/dots.svg" alt="" />
        </button>
      `;

      const menuBtn = card.querySelector(".card__menuBtn");
      const pop = document.createElement("div");
      pop.className = "popover popover--hidden popover--right";
      pop.setAttribute("role", "dialog");
      pop.setAttribute("aria-label", "Действия");

      pop.innerHTML = `
        <button class="popItem" type="button" data-act="download">
          <img class="popItem__icon" src="./assets/icons/download.svg" alt="" />
          <span class="popItem__text">Скачать json</span>
        </button>
        <button class="popItem" type="button" data-act="delete">
          <img class="popItem__icon" src="./assets/icons/trash.svg" alt="" />
          <span class="popItem__text">Удалить</span>
        </button>
      `;

      card.appendChild(pop);

      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        closeAllPopovers();
        pop.classList.toggle("popover--hidden");
      });

      pop.addEventListener("click", (e) => {
        e.stopPropagation();
        const btn = e.target.closest("button[data-act]");
        if (!btn) return;
        const act = btn.getAttribute("data-act");

        if (act === "download") {
          downloadCharacterJson(c);
          pop.classList.add("popover--hidden");
        }

        if (act === "delete") {
          const ok = confirm(`Удалить персонажа "${c.name || "Безымянный персонаж"}"?`);
          if (ok) {
            characters = characters.filter((x) => x.id !== c.id);
            saveCharacters();
            renderList();
            showToast("Удалено");
          }
          pop.classList.add("popover--hidden");
        }
      });

      cardsBox.appendChild(card);
    }
  }

  // ===== JSON import/export =====

  function downloadCharacterJson(c0) {
    const c = ensureDefaults(c0);
    const data = { version: 1, character: c };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `character_${c.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function importCharacterJsonFile(file) {
    const text = await file.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      showToast("Не удалось прочитать JSON");
      return;
    }

    const incoming = parsed?.character ?? parsed;
    if (!incoming || typeof incoming !== "object") {
      showToast("Неверный формат JSON");
      return;
    }

    const c = ensureDefaults(incoming);

    const existingIdx = characters.findIndex((x) => x.id === c.id);
    if (existingIdx >= 0) {
      characters[existingIdx] = c;
      saveCharacters();
      renderList();
      showToast("Импорт: заменено");
      return;
    }

    if (characters.length >= MAX_CHARS) {
      showToast("Лимит 30 персонажей");
      return;
    }

    characters.push(c);
    saveCharacters();
    renderList();
    showToast("Импорт: добавлено");
  }

  // ===== Character screen sync =====
  // ===== Abilities & skills (section) =====

  const ABILITY_NAMES = {
    str: "Сила",
    dex: "Ловкость",
    con: "Телосложение",
    int: "Интеллект",
    wis: "Мудрость",
    cha: "Харизма",
  };

  const SKILL_META = {
    athletics: { label: "Атлетика", abil: "str" },
    acrobatics: { label: "Акробатика", abil: "dex" },
    sleightOfHand: { label: "Ловкость рук", abil: "dex" },
    stealth: { label: "Скрытность", abil: "dex" },

    arcana: { label: "Магия", abil: "int" },
    history: { label: "История", abil: "int" },
    investigation: { label: "Анализ", abil: "int" },
    nature: { label: "Природа", abil: "int" },
    religion: { label: "Религия", abil: "int" },

    animalHandling: { label: "Уход за животными", abil: "wis" },
    insight: { label: "Проницательность", abil: "wis" },
    medicine: { label: "Медицина", abil: "wis" },
    perception: { label: "Восприятие", abil: "wis" },
    survival: { label: "Выживание", abil: "wis" },

    deception: { label: "Обман", abil: "cha" },
    intimidation: { label: "Запугивание", abil: "cha" },
    performance: { label: "Выступление", abil: "cha" },
    persuasion: { label: "Убеждение", abil: "cha" },
  };

  function formatSigned(n) {
    const x = Number(n);
    if (!Number.isFinite(x) || x === 0) return "0";
    return x > 0 ? `+${x}` : String(x);
  }

  function getAbilityScore(c, abilKey) {
    const v = c?.abilityScores?.[abilKey];
    return Number.isFinite(Number(v)) ? Number(v) : 10;
  }

  function getSaveBonus(c, abilKey) {
    const v = c?.abilitySaves?.[abilKey]?.bonus;
    return safeInt(v, 0);
  }

  function hasSaveProf(c, abilKey) {
    return !!c?.abilitySaves?.[abilKey]?.prof;
  }

  function getSkillBonus(c, skillKey) {
    const v = c?.skillStates?.[skillKey]?.bonus;
    return safeInt(v, 0);
  }

  function getSkillTotal(c, skillKey) {
    const meta = SKILL_META[skillKey];
    if (!meta) return 0;
    const baseMod = abilityMod(getAbilityScore(c, meta.abil));
    const pb = getProfBonus(clamp(safeInt(c?.level, 1), 1, 20));
    const extra = getSkillBonus(c, skillKey);
    return baseMod + extra + (hasSkillProf(c, skillKey) ? pb : 0);
  }

  function hasSkillProf(c, skillKey) {
    return !!c?.skillStates?.[skillKey]?.prof;
  }

  // ===== Inventory / Wallet =====
  function walletTotalGold(c) {
    const w = c?.wallet || {};
    const gp = safeInt(w.gp, 0);
    const sp = safeInt(w.sp, 0);
    const cp = safeInt(w.cp, 0);
    const ep = safeInt(w.ep, 0);
    const pp = safeInt(w.pp, 0);

    // 1 pp = 10 gp, 1 ep = 0.5 gp, 1 sp = 0.1 gp, 1 cp = 0.01 gp
    const total = pp * 10 + gp + ep * 0.5 + sp * 0.1 + cp * 0.01;
    // keep up to 2 decimals (to avoid ugly floats)
    return Math.round(total * 100) / 100;
  }

  function formatGoldNumber(n) {
    const x = Number(n);
    if (!Number.isFinite(x)) return "0";
    const isInt = Math.abs(x - Math.round(x)) < 1e-9;
    return isInt ? String(Math.round(x)) : String(x.toFixed(2)).replace(/\.00$/, "");
  }

  function syncInventoryUI(c) {
    if (!c) return;

    // ---- ensure storage shape (backward compatibility) ----
    c.inventory = c.inventory || { weapons: [], armor: [], accessories: [], potions: [], scrolls: [], other: [] };
    c.inventory.weapons = Array.isArray(c.inventory.weapons) ? c.inventory.weapons : [];
    c.inventory.armor = Array.isArray(c.inventory.armor) ? c.inventory.armor : [];
    c.inventory.accessories = Array.isArray(c.inventory.accessories) ? c.inventory.accessories : [];
    c.inventory.potions = Array.isArray(c.inventory.potions) ? c.inventory.potions : [];
    c.inventory.scrolls = Array.isArray(c.inventory.scrolls) ? c.inventory.scrolls : [];
    c.inventory.other = Array.isArray(c.inventory.other) ? c.inventory.other : [];

    const key = String(c.invTabKey || "weapons");

    // tabs
    invTabs.forEach((b) => {
      const k = b.getAttribute("data-invtab");
      const on = k === key;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-selected", String(on));
    });

    // panels
    invPanels.forEach((p) => {
      const k = p.getAttribute("data-invpanel");
      p.classList.toggle("is-active", k === key);
    });

    // gold total
    const total = formatGoldNumber(walletTotalGold(c));
    invGoldTotals.forEach((el) => (el.textContent = total));

    // content
    if (key === "weapons") renderInvWeapons(c);
    if (key === "armor") renderInvSimple(c, "armor", invArmorList, invArmorEmpty);
    if (key === "accessories") renderInvSimple(c, "accessories", invAccessoriesList, invAccessoriesEmpty);
    if (key === "potions") renderInvSimple(c, "potions", invPotionsList, invPotionsEmpty);
    if (key === "scrolls") renderInvSimple(c, "scrolls", invScrollsList, invScrollsEmpty);
    if (key === "other") renderInvSimple(c, "other", invOtherList, invOtherEmpty);
  }

function invEnsureRarity(v) {
    const s = String(v || "common");
    const allowed = new Set(["common","uncommon","rare","very_rare","legendary","artifact"]);
    return allowed.has(s) ? s : "common";
  }

  function invRarityLabel(k) {
    const key = invEnsureRarity(k);
    if (key === "uncommon") return "Необычный";
    if (key === "rare") return "Редкий";
    if (key === "very_rare") return "Очень редкий";
    if (key === "legendary") return "Легендарный";
    if (key === "artifact") return "Артефакт";
    return "Обычный";
  }

  // Алиас для совместимости (в некоторых местах используется normalizeRarity)
  function normalizeRarity(v) {
    return invEnsureRarity(v);
  }
    function invEnsureItemBase(x) {
    const it = (x && typeof x === "object") ? x : {};
    return {
      id: typeof it.id === "string" ? it.id : nowId(),
      name: typeof it.name === "string" ? it.name : "",
      rarity: invEnsureRarity(it.rarity),
      notes: typeof it.notes === "string" ? it.notes : "",
      showNotes: !!it.showNotes,
      equippedIn: (typeof it.equippedIn === "string" && it.equippedIn) ? it.equippedIn : null,
      sortIndex: Number.isFinite(Number(it.sortIndex)) ? Number(it.sortIndex) : 0,
    };
  }

  function invEnsureWeapon(x) {
    const b = invEnsureItemBase(x);
    const it = (x && typeof x === "object") ? x : {};
    return {
      ...b,
      abilityKey: ["str","dex","con","int","wis","cha"].includes(String(it.abilityKey)) ? String(it.abilityKey) : "str",
      proficient: !!it.proficient,
      extraMod: safeInt(it.extraMod, 0),
      baseDamageText: typeof it.baseDamageText === "string" ? it.baseDamageText : "",
    };
  }

  function invEnsureArmor(x) {
    const b = invEnsureItemBase(x);
    const it = (x && typeof x === "object") ? x : {};
    return {
      ...b,
      ac: clamp(safeInt(it.ac, 10), 0, 99),
      qty: clamp(safeInt(it.qty, 1), 1, 999),
    };
  }

  function invEnsureQtyItem(x) {
    const b = invEnsureItemBase(x);
    const it = (x && typeof x === "object") ? x : {};
    return {
      ...b,
      qty: clamp(safeInt(it.qty, 1), 1, 999),
    };
  }

  function invGetList(c, catKey) {
    const inv = c.inventory || {};
    const k = String(catKey || "other");
    if (k === "weapons") return inv.weapons;
    if (k === "armor") return inv.armor;
    if (k === "accessories") return inv.accessories;
    if (k === "potions") return inv.potions;
    if (k === "scrolls") return inv.scrolls;
    return inv.other;
  }

  function invNextSortIndex(list) {
    const arr = Array.isArray(list) ? list : [];
    let max = -1;
    for (const x of arr) {
      const v = Number(x?.sortIndex);
      if (Number.isFinite(v)) max = Math.max(max, v);
    }
    return max + 1;
  }

  function invCreateNewItem(c, catKey) {
    const base = {
      id: nowId(),
      name: "",
      rarity: "common",
      notes: "",
      showNotes: false,
      equippedIn: null,
      sortIndex: invNextSortIndex(invGetList(c, catKey)),
    };

    if (catKey === "weapons") {
      return {
        ...base,
        abilityKey: "str",
        proficient: false,
        extraMod: 0,
        baseDamageText: "",
      };
    }

    if (catKey === "armor") {
      return { ...base, ac: 10, qty: 1 };
    }

    return { ...base, qty: 1 };
  }

  function invWeaponAttackBonus(c, w) {
    const abil = String(w.abilityKey || "str");
    const mod = abilityMod(getAbilityScore(c, abil));
    const pb = getProfBonus(clamp(c.level, 1, 20));
    const prof = w.proficient ? pb : 0;
    const extra = safeInt(w.extraMod, 0);
    return mod + prof + extra;
  }

  function invWeaponDamageText(c, w) {
    const base = String(w.baseDamageText || "").trim();
    const abil = String(w.abilityKey || "str");
const mod = abilityMod(getAbilityScore(c, abil));
const add = mod;

    if (!base) {
      // if damage not set, still show modifier only when non-zero
      return add ? formatSigned(add) : "—";
    }

    if (!add) return base;

    // avoid "++" / "+-"
    const sign = add > 0 ? ` +${add}` : ` ${add}`;
    return base + sign;
  }
function invOpenBreakdown(c, itemId, kind) {
  const w = (c.inventory?.weapons || []).find((x) => String(x.id) === String(itemId));
  if (!w || !invCalcTitle || !invCalcBody) return;

  const abil = String(w.abilityKey || "str");
  const abilName = ABILITY_NAMES[abil] || abil;
  const mod = abilityMod(getAbilityScore(c, abil));
  const pb = getProfBonus(clamp(c.level, 1, 20));
  const extra = safeInt(w.extraMod, 0);
  const prof = !!w.proficient;

  if (kind === "attack") {
    const total = mod + (prof ? pb : 0) + extra;
    const lines = [];
    lines.push(`<div class="invCalcTotal">Всего: <b>${formatSigned(total)}</b></div>`);
    lines.push(`<div class="invCalcSub">Источники:</div>`);
    lines.push(`<div class="invCalcLine">Модификатор ${escapeHtml(abilName)} <span>${formatSigned(mod)}</span></div>`);
    if (prof) lines.push(`<div class="invCalcLine">Бонус мастерства <span>${formatSigned(pb)}</span></div>`);
    if (extra) lines.push(`<div class="invCalcLine">Доп. модификатор <span>${formatSigned(extra)}</span></div>`);

    invCalcTitle.textContent = "Бонус атаки";
    invCalcBody.innerHTML = lines.join("");
    openModal("invCalc");
    return;
  }

  if (kind === "damage") {
    const base = String(w.baseDamageText || "").trim() || "—";
    const totalText = invWeaponDamageText(c, w);
    const lines = [];
    lines.push(`<div class="invCalcTotal">Всего: <b>${escapeHtml(totalText)}</b></div>`);
    lines.push(`<div class="invCalcSub">Источники:</div>`);
    lines.push(`<div class="invCalcLine">Урон оружия <span>${escapeHtml(base)}</span></div>`);
    if (mod) lines.push(`<div class="invCalcLine">Модификатор ${escapeHtml(abilName)} <span>${formatSigned(mod)}</span></div>`);

    invCalcTitle.textContent = "Урон / Вид";
    invCalcBody.innerHTML = lines.join("");
    openModal("invCalc");
    return;
  }
}
  function invSortedByIndex(list) {
    return [...list].sort((a, b) => {
      const ai = Number(a?.sortIndex);
      const bi = Number(b?.sortIndex);
      if (Number.isFinite(ai) && Number.isFinite(bi) && ai !== bi) return ai - bi;
      return String(a?.id || "").localeCompare(String(b?.id || ""));
    });
  }

  function renderInvWeapons(c) {
    if (!invWeaponsList || !invWeaponsEmpty) return;

    // normalize
    c.inventory.weapons = c.inventory.weapons.map(invEnsureWeapon);

    const list = invSortedByIndex(c.inventory.weapons);
    invWeaponsList.innerHTML = "";

    invWeaponsEmpty.style.display = list.length ? "none" : "";

    for (const w of list) {
      const row = document.createElement("div");
      row.className = "invWRow";
      row.classList.toggle("is-sort", !!c.invSortWeapons);

      const rarityClass = `rarity--${invEnsureRarity(w.rarity)}`;

      const name = (w.name || "").trim();
      const nameText = name ? escapeHtml(name) : "настроить";

      const equipDot = w.equippedIn ? `<span class="invEquipDot" aria-hidden="true"></span>` : "";

      const infoBtn = w.showNotes
        ? `<button class="invInfoBtn" type="button" data-action="inv-notes" data-cat="weapons" data-id="${escapeHtml(w.id)}" aria-label="Заметки">
            <img class="invInfoBtn__icon" src="./assets/icons/Info.svg" alt="" />
          </button>`
        : "";

      const nameHtml = `
        <button class="invWNameBtn ${rarityClass}" type="button" data-action="inv-edit" data-cat="weapons" data-id="${escapeHtml(w.id)}">
          ${equipDot}
          <span class="invWNameBtn__text">${nameText}</span>
        </button>
      `;

      const bonus = formatSigned(invWeaponAttackBonus(c, w));
      const dmg = escapeHtml(invWeaponDamageText(c, w));

      let sortHtml = "";
      if (c.invSortWeapons) {
        sortHtml = `
          <div class="invSortArrows" aria-label="Сортировка">
            <button class="invArrowBtn invArrowBtn--up" type="button" data-action="inv-move" data-dir="-1" data-id="${escapeHtml(w.id)}" aria-label="Вверх">
              <img class="invArrowBtn__icon" src="./assets/icons/chevron-down.svg" alt="" />
            </button>
            <button class="invArrowBtn" type="button" data-action="inv-move" data-dir="1" data-id="${escapeHtml(w.id)}" aria-label="Вниз">
              <img class="invArrowBtn__icon" src="./assets/icons/chevron-down.svg" alt="" />
            </button>
          </div>
        `;
      }

      row.classList.toggle("has-info", !!w.showNotes);

      row.innerHTML = `
        ${sortHtml}
        <div class="invWName">${nameHtml}</div>
        <button class="invWBonus" type="button" data-action="inv-breakdown" data-kind="attack" data-id="${escapeHtml(w.id)}" aria-label="Бонус">${bonus}</button>
        <button class="invWDmg" type="button" data-action="inv-breakdown" data-kind="damage" data-id="${escapeHtml(w.id)}" aria-label="Урон/Вид">${dmg}</button>
        ${w.showNotes ? `<div class="invWInfo">${infoBtn}</div>` : `<div class="invWInfo" aria-hidden="true"></div>`}
      `;

      invWeaponsList.appendChild(row);
    }
  }

    function renderInvSimple(c, catKey, listEl, emptyEl) {
  if (!listEl || !emptyEl) return;

  const listRaw = invGetList(c, catKey);

  const ensured =
    catKey === "armor" ? listRaw.map(invEnsureArmor) :
    listRaw.map(invEnsureQtyItem);

  // write back normalized
  if (catKey === "armor") c.inventory.armor = ensured;
  if (catKey === "accessories") c.inventory.accessories = ensured;
  if (catKey === "potions") c.inventory.potions = ensured;
  if (catKey === "scrolls") c.inventory.scrolls = ensured;
  if (catKey === "other") c.inventory.other = ensured;

  const sortOn =
    (catKey === "armor" && !!c.invSortArmor) ||
    (catKey === "accessories" && !!c.invSortAccessories) ||
    (catKey === "potions" && !!c.invSortPotions) ||
    (catKey === "scrolls" && !!c.invSortScrolls) ||
    (catKey === "other" && !!c.invSortOther);

  listEl.innerHTML = "";
  emptyEl.style.display = ensured.length ? "none" : "";

  for (const it of invSortedByIndex(ensured)) {
    const row = document.createElement("div");
    row.className = "invSRow";
    row.classList.toggle("invSRow--armor", catKey === "armor");
    row.classList.toggle("invSRow--qty", catKey !== "armor");
    row.classList.toggle("is-sort", sortOn);

    const rarityClass = `rarity--${invEnsureRarity(it.rarity)}`;
    const name = (it.name || "").trim();
    const nameText = name ? escapeHtml(name) : "настроить";

    let sortHtml = "";
    if (sortOn) {
      sortHtml = `
        <div class="invSortArrows" aria-label="Сортировка">
          <button class="invArrowBtn invArrowBtn--up" type="button" data-action="inv-move" data-cat="${escapeHtml(catKey)}" data-dir="-1" data-id="${escapeHtml(it.id)}" aria-label="Вверх">
            <img class="invArrowBtn__icon" src="./assets/icons/chevron-down.svg" alt="" />
          </button>
          <button class="invArrowBtn" type="button" data-action="inv-move" data-cat="${escapeHtml(catKey)}" data-dir="1" data-id="${escapeHtml(it.id)}" aria-label="Вниз">
            <img class="invArrowBtn__icon" src="./assets/icons/chevron-down.svg" alt="" />
          </button>
        </div>
      `;
    }

    const infoBtn = it.showNotes
      ? `<button class="invInfoBtn" type="button" data-action="inv-notes" data-cat="${escapeHtml(catKey)}" data-id="${escapeHtml(it.id)}" aria-label="Заметки">
          <img class="invInfoBtn__icon" src="./assets/icons/Info.svg" alt="" />
        </button>`
      : "";

    row.classList.toggle("has-info", !!it.showNotes);

    const nameHtml = `
      <button class="invWNameBtn ${rarityClass}" type="button" data-action="inv-edit" data-cat="${escapeHtml(catKey)}" data-id="${escapeHtml(it.id)}">
        <span class="invWNameBtn__text">${nameText}</span>
      </button>
    `;

    let midHtml = "";
    if (catKey === "armor") {
      const ac = safeInt(it.ac, 10);
      const qty = safeInt(it.qty, 1);
      midHtml = `
        <div class="invSNum invSNum--ac" aria-label="Класс доспеха">${ac}</div>
        <div class="invSNum invSNum--qty" aria-label="Количество">${qty}</div>
      `;
    } else {
      const qty = safeInt(it.qty, 1);
      midHtml = `
        <div class="invSNum invSNum--qty" aria-label="Количество">${qty}</div>
      `;
    }

    row.innerHTML = `
      ${sortHtml}
      <div class="invSName">${nameHtml}</div>
      ${midHtml}
      <div class="invSInfo">${infoBtn || ""}</div>
    `;

    listEl.appendChild(row);
  }
}


  // ===== Inventory editor state =====
  let invEditCat = null;
  let invEditId = null;
  let invDropConfirm = false;

  function invOpenEditor(c, catKey, itemId) {
    if (!c) return;
    invEditCat = String(catKey || "");
    invEditId = String(itemId || "");
    invDropConfirm = false;
    if (invEditDropBtn) invEditDropBtn.textContent = "Выбросить";

    const list = invGetList(c, invEditCat);
    let item = list.find((x) => String(x?.id) === invEditId) || null;

    if (!item) {
      // safety: if missing, create and open it
      const created = invCreateNewItem(c, invEditCat);
      list.push(created);
      item = created;
      invEditId = created.id;
      persistActive();
    }

    // normalize per type
    if (invEditCat === "weapons") item = invEnsureWeapon(item);
    else if (invEditCat === "armor") item = invEnsureArmor(item);
    else item = invEnsureQtyItem(item);

    if (invEditTitle) invEditTitle.textContent = (item.name || "").trim() ? item.name : "Предмет";
    if (invEditSub) invEditSub.textContent = invEditCat === "weapons" ? "Оружие" :
      invEditCat === "armor" ? "Броня" :
      invEditCat === "accessories" ? "Аксессуары" :
      invEditCat === "potions" ? "Зелья" :
      invEditCat === "scrolls" ? "Свитки" : "Прочее";

    if (invEditName) invEditName.value = item.name || "";
    if (invEditRarity) invEditRarity.value = invEnsureRarity(item.rarity);
    if (invEditRarity) invEditRarity.dataset.rarity = String(invEditRarity.value || "common");
    if (invEditNotes) invEditNotes.value = item.notes || "";

    if (invEditShowNotes) invEditShowNotes.setAttribute("aria-pressed", String(!!item.showNotes));

    // category blocks
    if (invEditWeaponFields) invEditWeaponFields.classList.toggle("invEdit__block--hidden", invEditCat !== "weapons");
    if (invEditArmorFields) invEditArmorFields.classList.toggle("invEdit__block--hidden", invEditCat !== "armor");
    if (invEditQtyFields) invEditQtyFields.classList.toggle("invEdit__block--hidden", (invEditCat === "weapons" || invEditCat === "armor"));

    if (invEditCat === "weapons") {
      if (invEditWeaponAbility) invEditWeaponAbility.value = item.abilityKey || "str";
      if (invEditWeaponExtra) invEditWeaponExtra.value = String(safeInt(item.extraMod, 0));
      if (invEditWeaponDamage) invEditWeaponDamage.value = item.baseDamageText || "";
      if (invEditWeaponProf) invEditWeaponProf.setAttribute("aria-pressed", String(!!item.proficient));
    }

    if (invEditCat === "armor") {
      if (invEditArmorAc) invEditArmorAc.value = String(safeInt(item.ac, 10));
      if (invEditArmorQty) invEditArmorQty.value = String(safeInt(item.qty, 1));
    }

    if (invEditCat !== "weapons" && invEditCat !== "armor") {
      if (invEditQty) invEditQty.value = String(safeInt(item.qty, 1));
    }

    // equip/sell placeholders for now
    if (invEditEquipBtn) invEditEquipBtn.disabled = false;
    if (invEditSellBtn) invEditSellBtn.disabled = false;

    openModal("invItem");
  }

  function invSaveEditor(c) {
    if (!c || !invEditCat || !invEditId) return;

    const catKey = String(invEditCat);
    const list = invGetList(c, catKey);
    let idx = list.findIndex((x) => String(x?.id) === invEditId);

    // If the item is currently equipped, it might not be in inventory list.
    // In that case, try to locate it inside equipment by id.
    let equipSlotKey = null;
    let equipWrap = null;

    if (idx < 0) {
      const eq = c?.equipment || {};
      for (const k of Object.keys(eq)) {
        const w = eq[k];
        if (!w?.item) continue;
        if (String(w.item.id) === String(invEditId)) {
          equipSlotKey = k;
          equipWrap = w;
          break;
        }
      }
      if (!equipWrap) return;
    }

    const srcItem = idx >= 0 ? list[idx] : equipWrap.item;

    const common = invEnsureItemBase(srcItem);
    common.name = String(invEditName?.value || "").trim();
    common.rarity = invEnsureRarity(invEditRarity?.value);
    common.notes = String(invEditNotes?.value || "");
    common.showNotes = (invEditShowNotes?.getAttribute("aria-pressed") === "true");

    let nextItem = null;

    if (catKey === "weapons") {
      const next = invEnsureWeapon({ ...srcItem, ...common });
      next.abilityKey = String(invEditWeaponAbility?.value || "str");
      next.extraMod = safeInt(invEditWeaponExtra?.value, 0);
      next.proficient = (invEditWeaponProf?.getAttribute("aria-pressed") === "true");
      next.baseDamageText = String(invEditWeaponDamage?.value || "");
      nextItem = next;
    } else if (catKey === "armor") {
      const next = invEnsureArmor({ ...srcItem, ...common });
      next.ac = clamp(safeInt(invEditArmorAc?.value, 10), 0, 99);
      next.qty = clamp(safeInt(invEditArmorQty?.value, 1), 1, 999);
      nextItem = next;
    } else {
      const next = invEnsureQtyItem({ ...srcItem, ...common });
      next.qty = clamp(safeInt(invEditQty?.value, 1), 1, 999);
      nextItem = next;
    }

    if (idx >= 0) {
      list[idx] = nextItem;
    } else if (equipSlotKey && equipWrap) {
      equipWrap.item = nextItem;
      c.equipment[equipSlotKey] = equipWrap;
    }

    persistActive();
    syncInventoryUI(c);
    syncEquipmentUI(c);
    syncHeaderPart2(c);
    closeModal("invItem");
  }

  function invOpenNotes(c, catKey, itemId) {
    if (!c) return;
    const list = invGetList(c, catKey);
    const item = list.find((x) => String(x?.id) === String(itemId)) || null;
    if (!item) return;

    const name = (item.name || "").trim() || "Заметки";
    if (invNotesTitle) invNotesTitle.textContent = name;
    if (invNotesBody) invNotesBody.textContent = String(item.notes || "");
    openModal("invNotes");
  }

  function invDeleteItem(c) {
    if (!c || !invEditCat || !invEditId) return;
    const list = invGetList(c, invEditCat);
    const idx = list.findIndex((x) => String(x?.id) === invEditId);
    if (idx < 0) return;

    const item = list[idx] || null;
    const name = (item?.name || "").trim() || "Без названия";
    const rarity = invEnsureRarity(item?.rarity);

    list.splice(idx, 1);

    invLogAdd(c, {
      kind: "inv",
      action: "drop",
      name,
      rarity,
      ts: Date.now(),
    });

    persistActive();
    syncInventoryUI(c);
    closeModal("invItem");
  }

  function invMoveItem(c, catKey, id, dir) {
    if (!c) return;
    const cat = String(catKey || "");
    const list0 = invGetList(c, cat);

    const ensureFn =
      cat === "weapons" ? invEnsureWeapon :
      cat === "armor" ? invEnsureArmor :
      invEnsureQtyItem;

    const list = list0.map(ensureFn);
    const sorted = invSortedByIndex(list);
    const fromIdx = sorted.findIndex((x) => String(x?.id) === String(id));
    if (fromIdx < 0) return;

    const toIdx = clamp(fromIdx + dir, 0, sorted.length - 1);
    if (toIdx === fromIdx) return;

    const a = sorted[fromIdx];
    const b = sorted[toIdx];
    const t = a.sortIndex;
    a.sortIndex = b.sortIndex;
    b.sortIndex = t;

    const byId = new Map(sorted.map((x) => [String(x.id), x]));

    if (cat === "weapons") {
      c.inventory.weapons = c.inventory.weapons.map((x) => {
        const id0 = String(x?.id || "");
        return byId.has(id0) ? byId.get(id0) : x;
      });
      persistActive();
      renderInvWeapons(c);
      return;
    }

    const writeBack = (arr) => arr.map((x) => {
      const id0 = String(x?.id || "");
      return byId.has(id0) ? byId.get(id0) : x;
    });

    if (cat === "armor") c.inventory.armor = writeBack(c.inventory.armor);
    if (cat === "accessories") c.inventory.accessories = writeBack(c.inventory.accessories);
    if (cat === "potions") c.inventory.potions = writeBack(c.inventory.potions);
    if (cat === "scrolls") c.inventory.scrolls = writeBack(c.inventory.scrolls);
    if (cat === "other") c.inventory.other = writeBack(c.inventory.other);

    persistActive();
    // re-render current tab only
    syncInventoryUI(c);
  }

  function invMoveWeapon(c, id, dir) {
    if (!c) return;
    const list = c.inventory.weapons.map(invEnsureWeapon);
    const sorted = invSortedByIndex(list);
    const fromIdx = sorted.findIndex((x) => x.id === id);
    if (fromIdx < 0) return;

    const toIdx = clamp(fromIdx + dir, 0, sorted.length - 1);
    if (toIdx === fromIdx) return;

    // swap sortIndex with neighbor
    const a = sorted[fromIdx];
    const b = sorted[toIdx];
    const t = a.sortIndex;
    a.sortIndex = b.sortIndex;
    b.sortIndex = t;

    // write back to original list by id
    const byId = new Map(sorted.map((x) => [x.id, x]));
    c.inventory.weapons = c.inventory.weapons.map((x) => {
      const id0 = String(x?.id || "");
      return byId.has(id0) ? byId.get(id0) : x;
    });

    persistActive();
    renderInvWeapons(c);
  }

  // ===== Coins calc engine =====
  const COIN = {
    cp: { label: "Медь", icon: "./assets/icons/inventory/coins/med.svg", toCp: 1 },
    sp: { label: "Серебро", icon: "./assets/icons/inventory/coins/serebro.svg", toCp: 10 },
    ep: { label: "Электрум", icon: "./assets/icons/inventory/coins/electrum.svg", toCp: 50 },
    gp: { label: "Золото", icon: "./assets/icons/inventory/coins/zoloto.svg", toCp: 100 },
    pp: { label: "Платина", icon: "./assets/icons/inventory/coins/platina.svg", toCp: 1000 },
  };

  let coinsDenom = "gp";
  let coinsExpr = "0";

  function coinsEnsureDenom(d) {
    coinsDenom = COIN[d] ? d : "gp";
    // update denom icon
    const meta = COIN[coinsDenom];
    coinDenomIcon.src = meta.icon;

    // set coinDenomIcon color-class by meaning (keep your CSS coinIcon--*)
    coinDenomIcon.classList.remove("coinIcon--gold","coinIcon--silver","coinIcon--copper","coinIcon--platinum","coinIcon--electrum");
    if (coinsDenom === "gp") coinDenomIcon.classList.add("coinIcon--gold");
    if (coinsDenom === "sp") coinDenomIcon.classList.add("coinIcon--silver");
    if (coinsDenom === "cp") coinDenomIcon.classList.add("coinIcon--copper");
    if (coinsDenom === "pp") coinDenomIcon.classList.add("coinIcon--platinum");
    if (coinsDenom === "ep") coinDenomIcon.classList.add("coinIcon--electrum");
  }

  function coinsSetExpr(s) {
    const t = String(s ?? "").replace(/[^\d]/g, "");
    coinsExpr = t ? t.replace(/^0+(?=\d)/, "") : "0";
    coinInput.textContent = coinsExpr;
  }

  function coinsAppendDigit(d) {
    const digit = String(d);
    if (!/^\d$/.test(digit)) return;
    if (coinsExpr === "0") coinsExpr = digit;
    else coinsExpr += digit;
    coinInput.textContent = coinsExpr;
  }

  function coinsBackspaceOnce() {
    if (!coinsExpr || coinsExpr === "0") {
      coinsSetExpr("0");
      return;
    }
    coinsExpr = coinsExpr.slice(0, -1);
    if (!coinsExpr) coinsExpr = "0";
    coinInput.textContent = coinsExpr;
  }

  function coinsFormatK(n) {
    const x = Math.abs(Number(n));
    if (!Number.isFinite(x)) return "0";
    if (x < 1000) return String(Math.round(x));
    const v = x / 1000;
    const s = (Math.round(v * 10) / 10).toFixed(1).replace(/\.0$/, "");
    return s + "k";
  }

  function walletToCp(c) {
    const w = c?.wallet || {};
    const cp = safeInt(w.cp, 0);
    const sp = safeInt(w.sp, 0);
    const ep = safeInt(w.ep, 0);
    const gp = safeInt(w.gp, 0);
    const pp = safeInt(w.pp, 0);
    return cp * 1 + sp * 10 + ep * 50 + gp * 100 + pp * 1000;
  }

  function cpToWallet(cpTotal) {
    let rest = Math.max(0, Math.floor(cpTotal));

    const pp = Math.floor(rest / 1000); rest -= pp * 1000;
    const gp = Math.floor(rest / 100);  rest -= gp * 100;
    const ep = Math.floor(rest / 50);   rest -= ep * 50;
    const sp = Math.floor(rest / 10);   rest -= sp * 10;
    const cp = rest;

    return { pp, gp, ep, sp, cp };
  }

  function coinsInputToCp() {
    const amt = Math.max(0, safeInt(coinsExpr, 0));
    return amt * COIN[coinsDenom].toCp;
  }

  function coinsSyncUI(c) {
    if (!c) return;

    // top totals
    coinsTotalGold.textContent = formatGoldNumber(walletTotalGold(c));

    // wallet row
    const w = c.wallet || {};
    coinsGp.textContent = String(safeInt(w.gp, 0));
    coinsSp.textContent = String(safeInt(w.sp, 0));
    coinsCp.textContent = String(safeInt(w.cp, 0));
    coinsPp.textContent = String(safeInt(w.pp, 0));
    coinsEp.textContent = String(safeInt(w.ep, 0));

    // conversions (show 4 lines: all denoms except selected)
    const inputCp = coinsInputToCp();

    const toCp = (den) => COIN[den].toCp;
    const conv = (den) => Math.floor(inputCp / toCp(den));

    // show =X with k-abbrev
    coinConvCp.textContent = "=" + coinsFormatK(conv("cp"));
    coinConvSp.textContent = "=" + coinsFormatK(conv("sp"));
    coinConvEp.textContent = "=" + coinsFormatK(conv("ep"));
    coinConvGp.textContent = "=" + coinsFormatK(conv("gp"));
    coinConvPp.textContent = "=" + coinsFormatK(conv("pp"));

    // hide selected denom on the right
    coinsModal.querySelectorAll(".coinConv[data-conv]").forEach((b) => {
      b.style.display = (b.getAttribute("data-conv") === coinsDenom) ? "none" : "";
    });
  }

  // denom popover
  coinDenomBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = coinDenomPopover.classList.contains("popover--hidden");
    closeAllPopovers();
    coinDenomPopover.classList.toggle("popover--hidden", !isHidden);
    coinDenomBtn.setAttribute("aria-expanded", String(isHidden));
  });

  coinDenomPopover.querySelectorAll(".coinDenomPick").forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation();
      const den = b.getAttribute("data-denom");
      coinsEnsureDenom(den);
      coinDenomPopover.classList.add("popover--hidden");
      coinDenomBtn.setAttribute("aria-expanded", "false");
      const c = getCharacterById(activeId);
      if (c) coinsSyncUI(c);
    });
  });

  // keypad digits
  coinsModal.querySelectorAll(".coinsKeypad .key").forEach((k) => {
    k.addEventListener("click", () => {
      const digit = k.getAttribute("data-key");
      if (!digit) return;
      coinsAppendDigit(digit);
      const c = getCharacterById(activeId);
      if (c) coinsSyncUI(c);
    });
  });

  coinBackspace.addEventListener("click", () => {
    coinsBackspaceOnce();
    const c = getCharacterById(activeId);
    if (c) coinsSyncUI(c);
  });

  // take / give (NO auto-conversion of wallet)
  coinTake.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;

    const amt = Math.max(0, safeInt(coinsExpr, 0));
    if (amt <= 0) return;

    if (!c.wallet) c.wallet = { gp: 0, sp: 0, cp: 0, ep: 0, pp: 0 };
    c.wallet[coinsDenom] = safeInt(c.wallet[coinsDenom], 0) + amt;

    persistActive();
    syncInventoryUI(c);
    coinsSyncUI(c);
  });

  coinGive.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;

    const amt = Math.max(0, safeInt(coinsExpr, 0));
    if (amt <= 0) return;

    if (!c.wallet) c.wallet = { gp: 0, sp: 0, cp: 0, ep: 0, pp: 0 };
    const have = safeInt(c.wallet[coinsDenom], 0);

    // IMPORTANT: spend only from selected denom (no exchange)
    if (amt > have) {
      showToast("Недостаточно монет");
      return;
    }

    c.wallet[coinsDenom] = have - amt;

    persistActive();
    syncInventoryUI(c);
    coinsSyncUI(c);
  });
  
  function syncAbilitiesUI(c) {
       if (!abilitiesRoot || !c) return;

    const pb = getProfBonus(clamp(safeInt(c.level, 1), 1, 20));

    // Ability blocks
    const blocks = abilitiesRoot.querySelectorAll(".abilityBlock");
    blocks.forEach((b) => {
      const abil = b.getAttribute("data-abil");
      if (!abil) return;

      const score = getAbilityScore(c, abil);
      const mod = abilityMod(score);

      const scoreEl = b.querySelector('.abilityScoreVal[data-bind="score"]');
      if (scoreEl) scoreEl.textContent = String(score);

      const checkEl = b.querySelector('.miniValue[data-bind="check"]');
      if (checkEl) checkEl.textContent = formatSigned(mod);

      const saveVal = mod + getSaveBonus(c, abil) + (hasSaveProf(c, abil) ? pb : 0);
      const saveEl = b.querySelector('.miniValue[data-bind="save"]');
      if (saveEl) saveEl.textContent = formatSigned(saveVal);

      const saveToggle = b.querySelector('.miniToggle[data-action="toggle-save-prof"]');
      if (saveToggle) saveToggle.setAttribute("aria-pressed", String(hasSaveProf(c, abil)));

      // Skills inside block
      const skillRows = b.querySelectorAll(".skillRow");
      skillRows.forEach((row) => {
        const sk = row.getAttribute("data-skill");
        if (!sk) return;
        const meta = SKILL_META[sk];
        if (!meta) return;

        const baseMod = abilityMod(getAbilityScore(c, meta.abil));
        const extra = getSkillBonus(c, sk);
        const total = baseMod + extra + (hasSkillProf(c, sk) ? pb : 0);

        const valEl = row.querySelector('.skillVal[data-bind="value"]');
        if (valEl) valEl.textContent = formatSigned(total);

        const extraEl = row.querySelector('.skillExtra[data-bind="extra"]');
        if (extraEl) extraEl.textContent = extra === 0 ? "" : formatSigned(extra);

        const valBtn = row.querySelector('.skillValBtn[data-action="edit-skill"]');
        if (valBtn) valBtn.classList.toggle("is-bonus", extra !== 0);

        const tgl = row.querySelector('.skillToggle[data-action="toggle-skill-prof"]');
        if (tgl) tgl.setAttribute("aria-pressed", String(hasSkillProf(c, sk)));
      });
    });
  }

  let abilityEditKey = null;
  let skillEditKey = null;

  function openAbilityEdit(c, abilKey) {
    if (!c || !abilKey) return;
    abilityEditKey = abilKey;

    const score = getAbilityScore(c, abilKey);
    const mod = abilityMod(score);
    const title = `${ABILITY_NAMES[abilKey] || "Характеристика"} ${formatSigned(mod)}`;

    if (abilityEditTitle) abilityEditTitle.textContent = title;
    if (abilityEditScore) abilityEditScore.value = String(score);
    if (abilityEditSaveBonus) abilityEditSaveBonus.value = String(getSaveBonus(c, abilKey));

    openModal("abilityEdit");
    setTimeout(() => abilityEditScore?.focus(), 0);
  }

  function openSkillEdit(c, skillKey) {
    if (!c || !skillKey) return;
    skillEditKey = skillKey;

    const meta = SKILL_META[skillKey];
    const score = meta ? getAbilityScore(c, meta.abil) : 10;
    const mod = abilityMod(score);
    const pb = getProfBonus(clamp(safeInt(c.level, 1), 1, 20));
    const extra = getSkillBonus(c, skillKey);
    const total = getSkillTotal(c, skillKey);

    const title = `${meta?.label || "Навык"} ${formatSigned(total)}`;
    if (skillEditTitle) skillEditTitle.textContent = title;
    if (skillEditBonus) skillEditBonus.value = String(extra);

    openModal("skillEdit");
    setTimeout(() => skillEditBonus?.focus(), 0);
  }

  // Delegated clicks inside abilities section
  abilitiesRoot?.addEventListener("click", (e) => {
    const c = getCharacterById(activeId);
    if (!c) return;

    const el = e.target?.closest?.("[data-action]");
    if (!el) return;

    const action = el.getAttribute("data-action");
    if (action === "edit-ability") {
      const abil = el.getAttribute("data-abil");
      openAbilityEdit(c, abil);
      return;
    }

    if (action === "toggle-save-prof") {
      const abil = el.getAttribute("data-abil");
      if (!abil) return;

      c.abilitySaves = c.abilitySaves || {};
      c.abilitySaves[abil] = c.abilitySaves[abil] || { prof: false, bonus: 0 };
      c.abilitySaves[abil].prof = !c.abilitySaves[abil].prof;

      persistActive();
      syncAbilitiesUI(c);
      return;
    }

    if (action === "toggle-skill-prof") {
      const sk = el.getAttribute("data-skill");
      if (!sk) return;

      c.skillStates = c.skillStates || {};
      c.skillStates[sk] = c.skillStates[sk] || { prof: false, bonus: 0 };
      c.skillStates[sk].prof = !c.skillStates[sk].prof;

      persistActive();
      syncAbilitiesUI(c);
      return;
    }

    if (action === "edit-skill") {
      const sk = el.getAttribute("data-skill");
      openSkillEdit(c, sk);
      return;
    }
  });

  // Save in ability modal
  abilityEditSaveBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c || !abilityEditKey) return;

    const score = Number(abilityEditScore?.value ?? "");
    const saveBonus = Number(abilityEditSaveBonus?.value ?? "");

    c.abilityScores = c.abilityScores || {};
    c.abilityScores[abilityEditKey] = Number.isFinite(score) ? score : 10;

    c.abilitySaves = c.abilitySaves || {};
    c.abilitySaves[abilityEditKey] = c.abilitySaves[abilityEditKey] || { prof: false, bonus: 0 };
    c.abilitySaves[abilityEditKey].bonus = Number.isFinite(saveBonus) ? Math.trunc(saveBonus) : 0;

    persistActive();
    syncAbilitiesUI(c);
    syncHeaderPart3(c);
    syncSpellDerivedUI(c);
    closeModal("abilityEdit");
  });
  // Save in skill modal
  skillEditSaveBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c || !skillEditKey) return;

    const bonus = Number(skillEditBonus?.value ?? "");

    c.skillStates = c.skillStates || {};
    c.skillStates[skillEditKey] = c.skillStates[skillEditKey] || { prof: false, bonus: 0 };
    c.skillStates[skillEditKey].bonus = Number.isFinite(bonus) ? Math.trunc(bonus) : 0;

    persistActive();
    syncAbilitiesUI(c);
    closeModal("skillEdit");
  });
  
  function syncCharacterUI() {
    const c = getCharacterById(activeId);
    if (!c) return;

    charName.textContent = c.name || "Безымянный персонаж";
    charRaceClass.textContent = formatRaceClass(c);

    charAvatarImg.src = c.avatarDataUrl ? c.avatarDataUrl : "./assets/icons/hero.svg";
    applyCover(c);

    c.level = clamp(safeInt(c.level, 1), 1, 20);
    c.xpCurrent = Math.max(0, safeInt(c.xpCurrent, 0));

    c.hpMax = clamp(safeInt(c.hpMax, 0), 0, 9999);
    c.hpCurrent = clamp(safeInt(c.hpCurrent, 0), -c.hpMax, c.hpMax);
    c.hpTemp = Math.max(0, safeInt(c.hpTemp, 0));

    updateXpBar(c);
    updateHpUI(c);
    syncSettingsFields(c);
    syncSpellUI(c);
    renderSpellClassesUI(c);
    syncSpellsScreenUI(c);
    syncHeaderPart2(c);
    syncHeaderPart3(c);
    syncAbilitiesUI(c);
    syncInventoryUI(c);
    syncEquipmentUI(c);
    syncAttacksUI(c);
    syncSensesUI(c);
    syncPersonalityUI(c);
    syncSectionsUI(c);
  }
  
  const PERSONALITY_TEXT_META = {
    appearance: "ВНЕШНОСТЬ",
    characterBackstory: "ПРЕДЫСТОРИЯ ПЕРСОНАЖА",
    allies: "СОЮЗНИКИ И ОРГАНИЗАЦИИ",
    traits: "ЧЕРТЫ ХАРАКТЕРА",
    ideals: "ИДЕАЛЫ",
    bonds: "ПРИВЯЗАННОСТИ",
    flaws: "СЛАБОСТИ",
    goalsMain: "ЦЕЛИ И ЗАДАЧИ",
    note1: "ЗАМЕТКА 1",
    note2: "ЗАМЕТКА 2",
    note3: "ЗАМЕТКА 3",
    note4: "ЗАМЕТКА 4",
    note5: "ЗАМЕТКА 5",
    note6: "ЗАМЕТКА 6",
    note7: "ЗАМЕТКА 7",
  };
  let persEditingKey = "";

  function syncPersonalityUI(c) {
    if (!c) return;
    c.personality = c.personality || {};

    personalityLineInputs.forEach((input) => {
      const key = String(input.getAttribute("data-pers-line") || "");
      input.value = String(c.personality?.[key] ?? "");
    });

    personalityPreviewEls.forEach((el) => {
      const key = String(el.getAttribute("data-pers-preview") || "");
      el.textContent = String(c.personality?.[key] ?? "");
    });
  }

  function openPersonalityTextEditor(key) {
    const c = getCharacterById(activeId);
    if (!c || !PERSONALITY_TEXT_META[key] || !persTextModal || !persTextInput) return;
    c.personality = c.personality || {};
    persEditingKey = key;
    if (persTextTitle) persTextTitle.textContent = PERSONALITY_TEXT_META[key];
    persTextInput.value = String(c.personality[key] ?? "");
    openModal("persText");
    requestAnimationFrame(() => {
      persTextInput.focus();
      const len = persTextInput.value.length;
      persTextInput.setSelectionRange(len, len);
    });
  }

  function savePersonalityTextEditor() {
    const c = getCharacterById(activeId);
    if (!c || !persEditingKey || !persTextInput) return;
    c.personality = c.personality || {};
    c.personality[persEditingKey] = String(persTextInput.value || "").trim();
    persistActive();
    syncPersonalityUI(c);
    closeModal("persText");
  }

  // ===== Sections pager =====
  const SECTIONS = [
    { key: "abilities", label: "Характеристики и навыки", icon: "./assets/icons/sections/abilities-skills.svg" },
    { key: "attacks", label: "Атаки и умения", icon: "./assets/icons/sections/attacks-abilities.svg" },
    { key: "equipment", label: "Снаряжение", icon: "./assets/icons/sections/equipment.svg" },
    { key: "inventory", label: "Инвентарь и сокровища", icon: "./assets/icons/sections/inventory-treasure.svg" },
    { key: "senses", label: "Пассивные чувства и владения", icon: "./assets/icons/sections/senses-proficiencies.svg" },
    { key: "personality", label: "Личность и внешность", icon: "./assets/icons/sections/personality-appearance.svg" },
    { key: "goals", label: "Цели и задачи", icon: "./assets/icons/sections/goals.svg" },
    { key: "notes", label: "Заметки", icon: "./assets/icons/sections/notes.svg" },
    { key: "spells", label: "Заклинания", icon: "./assets/icons/sections/spells.svg" },
  ];

  function getSectionIndexByKey(key) {
    const k = String(key || "");
    const idx = SECTIONS.findIndex((s) => s.key === k);
    return idx >= 0 ? idx : 0;
  }

  function renderSectionsList(activeKey) {
    if (!sectionsListBox) return;
    sectionsListBox.innerHTML = "";

    for (const s of SECTIONS) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "sectionPick";
      btn.setAttribute("role", "listitem");
      btn.setAttribute("data-key", s.key);
      btn.classList.toggle("is-active", s.key === activeKey);

      btn.innerHTML = `
        <img class="sectionPick__icon" src="${s.icon}" alt="" />
        <span class="sectionPick__text">${escapeHtml(s.label)}</span>
      `;

      btn.addEventListener("click", () => {
        const c = getCharacterById(activeId);
        if (!c) return;
        setActiveSection(c, s.key, { animate: true, persist: true });
        closeModal("sections");
        sectionBarBtn?.setAttribute("aria-expanded", "false");
      });

      sectionsListBox.appendChild(btn);
    }
  }

  function setActiveSection(c, key, opts = { animate: true, persist: true }) {
    if (!c) return;
    const idx = getSectionIndexByKey(key);
    const s = SECTIONS[idx];

    c.activeSectionKey = s.key;
    if (opts.persist) persistActive();

    if (sectionBarTitle) sectionBarTitle.textContent = s.label;
    if (sectionBarIcon) sectionBarIcon.src = s.icon;

    if (sectionsTrack && sectionsPager) {
      const w = (sectionsPager?.clientWidth || sectionsTrack.clientWidth || 0);
       if (opts.animate) sectionsTrack.style.transition = "transform 220ms ease";
      else sectionsTrack.style.transition = "none";
      sectionsTrack.style.transform = `translate3d(${-idx * w}px, 0, 0)`;
    }

    renderSectionsList(s.key);
  }

  function syncSectionsUI(c) {
    if (!c) return;
    const idx = getSectionIndexByKey(c.activeSectionKey);
    const s = SECTIONS[idx];

    if (sectionBarTitle) sectionBarTitle.textContent = s.label;
    if (sectionBarIcon) sectionBarIcon.src = s.icon;

    renderSectionsList(s.key);
    setActiveSection(c, s.key, { animate: false, persist: false });
  }

  // Open modal from strip
  sectionBarBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    renderSectionsList(c.activeSectionKey);
    openModal("sections");
    sectionBarBtn.setAttribute("aria-expanded", "true");
  });

  // Inventory tabs
  invTabs.forEach((btn) => {
    btn.addEventListener("click", () => {
      const c = getCharacterById(activeId);
      if (!c) return;
      const key = btn.getAttribute("data-invtab");
      if (!key) return;
      c.invTabKey = key;
      persistActive();
      syncInventoryUI(c);
    });
  });

  // Inventory actions
  invWeaponsAddBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    const it = invCreateNewItem(c, "weapons");
    c.inventory.weapons.push(it);
    persistActive();
    syncInventoryUI(c);
    invOpenEditor(c, "weapons", it.id);
  });

  invWeaponsSortBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.invSortWeapons = !c.invSortWeapons;
    persistActive();
    syncInventoryUI(c);
  });

  invArmorSortBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.invSortArmor = !c.invSortArmor;
    persistActive();
    syncInventoryUI(c);
  });

  invAccessoriesSortBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.invSortAccessories = !c.invSortAccessories;
    persistActive();
    syncInventoryUI(c);
  });

  invPotionsSortBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.invSortPotions = !c.invSortPotions;
    persistActive();
    syncInventoryUI(c);
  });

  invScrollsSortBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.invSortScrolls = !c.invSortScrolls;
    persistActive();
    syncInventoryUI(c);
  });

  invOtherSortBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.invSortOther = !c.invSortOther;
    persistActive();
    syncInventoryUI(c);
  });

  invArmorAddBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    const it = invCreateNewItem(c, "armor");
    c.inventory.armor.push(it);
    persistActive();
    syncInventoryUI(c);
    invOpenEditor(c, "armor", it.id);
  });

  invAccessoriesAddBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    const it = invCreateNewItem(c, "accessories");
    c.inventory.accessories.push(it);
    persistActive();
    syncInventoryUI(c);
    invOpenEditor(c, "accessories", it.id);
  });

  invPotionsAddBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    const it = invCreateNewItem(c, "potions");
    c.inventory.potions.push(it);
    persistActive();
    syncInventoryUI(c);
    invOpenEditor(c, "potions", it.id);
  });

  invScrollsAddBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    const it = invCreateNewItem(c, "scrolls");
    c.inventory.scrolls.push(it);
    persistActive();
    syncInventoryUI(c);
    invOpenEditor(c, "scrolls", it.id);
  });

  invOtherAddBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    const it = invCreateNewItem(c, "other");
    c.inventory.other.push(it);
    persistActive();
    syncInventoryUI(c);
    invOpenEditor(c, "other", it.id);
  });

  atkWeaponsToggle?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.atkWeaponsCollapsed = !c.atkWeaponsCollapsed;
    persistActive();
    syncAttacksUI(c);
  });

  atkAbilitiesToggle?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.atkAbilitiesCollapsed = !c.atkAbilitiesCollapsed;
    persistActive();
    syncAttacksUI(c);
  });

  atkAbilitiesAddBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    const list = atkGetAbilities(c);
    const item = atkEnsureAbility({ id: nowId(), name: "", qty: 1, max: 1, notes: "", showNotes: false, sortIndex: invNextSortIndex(list) });
    list.push(item);
    persistActive();
    syncAttacksUI(c);
    atkOpenAbilityEditor(c, item.id);
  });

  atkAbilitiesSortBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.atkSortAbilities = !c.atkSortAbilities;
    persistActive();
    syncAttacksUI(c);
  });

  senseProfToggle?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.senseProfCollapsed = !c.senseProfCollapsed;
    hideSensePassiveTip();
    persistActive();
    syncSensesUI(c);
  });

  senseProfAddBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    const list = senseGetProficiencies(c);
    const item = senseEnsureProf({ id: nowId(), name: "", qty: 1, max: 1, notes: "", showNotes: false, useCharges: false, sortIndex: invNextSortIndex(list) });
    list.push(item);
    persistActive();
    syncSensesUI(c);
    senseOpenProfEditor(c, item.id);
  });

  senseProfSortBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    c.senseSortProf = !c.senseSortProf;
    persistActive();
    syncSensesUI(c);
  });

  // Delegated clicks (edit / notes / move)
  document.addEventListener("click", (e) => {
    const edit = e.target.closest('[data-action="inv-edit"]');
    if (edit) {
      const c = getCharacterById(activeId);
      if (!c) return;
      const cat = edit.getAttribute("data-cat");
      const id = edit.getAttribute("data-id");
      if (!cat || !id) return;
      invOpenEditor(c, cat, id);
      return;
    }

    const notes = e.target.closest('[data-action="inv-notes"]');
    if (notes) {
      const c = getCharacterById(activeId);
      if (!c) return;
      const cat = notes.getAttribute("data-cat");
      const id = notes.getAttribute("data-id");
      if (!cat || !id) return;
      invOpenNotes(c, cat, id);
      return;
    }
const br = e.target.closest('[data-action="inv-breakdown"]');
if (br) {
  const c = getCharacterById(activeId);
  if (!c) return;
  const id = br.getAttribute("data-id");
  const kind = br.getAttribute("data-kind");
  if (!id || !kind) return;
  invOpenBreakdown(c, id, kind);
  return;
}
    const move = e.target.closest('[data-action="inv-move"]');
    if (move) {
      const c = getCharacterById(activeId);
      if (!c) return;
      const id = move.getAttribute("data-id");
      const dir = safeInt(move.getAttribute("data-dir"), 0);
      const cat = move.getAttribute("data-cat"); // optional; weapons legacy arrows omit it
      if (!id || !dir) return;
      if (cat) invMoveItem(c, cat, id, dir);
      else invMoveWeapon(c, id, dir);
      return;
    }
  });

  // Editor toggles
  const toggleBtn = (btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      const on = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!on));
    });
  };
  toggleBtn(invEditWeaponProf);
  toggleBtn(invEditShowNotes);

  invEditSaveBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    invSaveEditor(c);
  });

  atkAbilitySaveBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    atkSaveAbilityEditor(c);
  });

  atkAbilityRestoreBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c || !atkAbilityEditId) return;
    const item = atkGetAbilities(c).find((x) => String(x.id) === String(atkAbilityEditId));
    if (!item) return;
    item.qty = safeInt(item.max, 0);
    if (atkAbilityQty) atkAbilityQty.value = String(item.qty);
    persistActive();
    syncAttacksUI(c);
  });

  atkAbilityDeleteBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    if (!atkAbilityDeleteConfirm) {
      atkAbilityDeleteConfirm = true;
      atkAbilityDeleteBtn.textContent = "Точно?";
      return;
    }
    atkDeleteAbility(c);
  });

  senseProfSaveBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    senseSaveProfEditor(c);
  });

  senseProfRestoreBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c || !senseProfEditId) return;
    const item = senseGetProficiencies(c).find((x) => String(x.id) === String(senseProfEditId));
    if (!item) return;
    item.qty = safeInt(item.max, 0);
    if (senseProfQty) senseProfQty.value = String(item.qty);
    persistActive();
    syncSensesUI(c);
  });

  senseProfDeleteBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    if (!senseProfDeleteConfirm) {
      senseProfDeleteConfirm = true;
      senseProfDeleteBtn.textContent = "Точно?";
      return;
    }
    senseDeleteProf(c);
  });

  invEditDropBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    if (!invDropConfirm) {
      invDropConfirm = true;
      invEditDropBtn.textContent = "Точно?";
      return;
    }
    invDeleteItem(c);
  });

  invEditEquipBtn?.addEventListener("click", () => equipOpenSlotPickFromInvEditor());


  // ===== Equipment =====
  const EQUIP_SLOT_META = {
    head: { label: "Голова", group: "armor" },
    amulet: { label: "Амулет", group: "accessories" },
    shoulders: { label: "Плечи", group: "armor" },
    chest: { label: "Грудь", group: "armor" },
    cloak: { label: "Плащ", group: "armor" },

    hands: { label: "Перчатки", group: "armor" },
    belt: { label: "Пояс", group: "armor" },
    feet: { label: "Ступни", group: "armor" },
    ring1: { label: "Кольцо 1", group: "accessories" },
    ring2: { label: "Кольцо 2", group: "accessories" },

    weaponLeft: { label: "Левая рука", group: "weapons" },
    weaponRight: { label: "Правая рука", group: "weapons" },
    weaponTwoHand: { label: "Двуручное", group: "weapons" },
    shield: { label: "Щит", group: "armor" },
  };

  const EQUIP_RACES = [
    { key: "human", label: "Человек", file: "human.svg" },
    { key: "elf", label: "Эльф", file: "elf.svg" },
    { key: "dwarf", label: "Дворф", file: "dwarf.svg" },
    { key: "dragonborn", label: "Драконорождённый", file: "dragonborn.svg" },
    { key: "half-elf", label: "Полуэльф", file: "half-elf.svg" },
    { key: "gnome", label: "Гном", file: "gnome.svg" },
    { key: "half-orc", label: "Полуорк", file: "half-orc.svg" },
    { key: "halfling", label: "Полурослик", file: "halfling.svg" },
    { key: "tiefling", label: "Тифлинг", file: "tiefling.svg" },
  ];
  let equipPending = null; // { mode:"fromInv"|"fromSlot", catKey, itemId, slotKey }
  let equipConfirmJob = null;

  function equipSlotGroupToCat(group) {
    if (group === "weapons") return "weapons";
    if (group === "armor") return "armor";
    if (group === "accessories") return "accessories";
    return "other";
  }

  function equipCloseTip() {
    if (!equipTip) return;
    equipTip.classList.add("equipTip--hidden");
    equipTip.innerHTML = "";
  }

  // close tooltip when clicking inside it (anywhere)
  equipTip?.addEventListener("click", () => {
    equipCloseTip();
  });

  function equipPositionTipNear(btn) {
    if (!equipTip || !btn) return;
    const stage = btn.closest(".equip__stage");
    if (!stage) return;

    const stageRect = stage.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    const pad = 10;

    // default: to the right
    let left = (r.right - stageRect.left) + pad;
    let top = (r.top - stageRect.top) - 6;

    // clamp inside stage
    const maxLeft = stageRect.width - equipTip.offsetWidth - pad;
    const maxTop = stageRect.height - equipTip.offsetHeight - pad;

    if (left > maxLeft) left = (r.left - stageRect.left) - equipTip.offsetWidth - pad;
    if (left < pad) left = pad;

    if (top > maxTop) top = maxTop;
    if (top < pad) top = pad;

    equipTip.style.left = `${left}px`;
    equipTip.style.top = `${top}px`;
  }

  // ===== Attacks tooltip (reuse Equipment-style tooltip, but inside Attacks section) =====
  function atkCloseTip() {
    if (!atkTip) return;
    atkTip.classList.add("equipTip--hidden");
    atkTip.innerHTML = "";
  }

  function atkPositionTipNear(btn) {
    if (!atkTip || !btn) return;
    const box = btn.closest(".atkWeapons") || btn.closest('.secPanel[data-key="attacks"]') || document.body;
    const boxRect = box === document.body ? { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight } : box.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    const pad = 10;

    // default: to the right
    let left = (r.right - boxRect.left) + pad;
    let top = (r.top - boxRect.top);

    // measure
    atkTip.style.left = "0px";
    atkTip.style.top = "0px";
    atkTip.classList.remove("equipTip--hidden");
    const tipRect = atkTip.getBoundingClientRect();

    const maxLeft = (boxRect.right - boxRect.left) - tipRect.width - pad;
    const maxTop = (boxRect.bottom - boxRect.top) - tipRect.height - pad;

    // flip to left if overflow
    if (left > maxLeft) {
      left = (r.left - boxRect.left) - tipRect.width - pad;
    }

    // clamp
    left = Math.max(pad, Math.min(left, maxLeft));
    top = Math.max(pad, Math.min(top, maxTop));

    atkTip.style.left = left + "px";
    atkTip.style.top = top + "px";
  }

function atkRenderTip(c, slotKey, btn) {
    if (!atkTip || !c) return;
    const wrap = c.equipment?.[slotKey] || null;
    if (!wrap || !wrap.item) return;

    const item = wrap.item;
    const rarityKey = String(item.rarity || "common");
    const rarityClass = `rarity--${rarityKey}`;
    const rarityLabel = invRarityLabel(rarityKey);

    let topRowLeft = "";
    let topRowRight = "";

    if (slotKey === "weaponTwoHand") topRowLeft = "Двуручное";
    else if (slotKey === "weaponLeft" || slotKey === "weaponRight") topRowLeft = "Одноручное";
    else topRowLeft = EQUIP_SLOT_META?.[slotKey]?.label || "";

    const isWeapon = (wrap.fromCat === "weapons");
    if (isWeapon) topRowRight = item.baseDamageText ? String(item.baseDamageText) : "—";

    const attackBonus = isWeapon ? equipWeaponAttackBonus(c, item) : null;

    const desc = (typeof item.notes === "string" ? item.notes : "").trim();

    atkTip.innerHTML = `
      <div class="equipTip__name ${rarityClass}">${escapeHtml(item.name || "Без названия")}</div>
      <div class="equipTip__rarity ${rarityClass}">${escapeHtml(rarityLabel)}</div>

      <div class="equipTip__row">
        <span>${escapeHtml(topRowLeft)}</span>
        <span>${isWeapon ? escapeHtml(topRowRight) : ""}</span>
      </div>

      ${isWeapon ? `<div class="equipTip__meta">Бонус броска: <b>${escapeHtml(formatSigned(attackBonus))}</b></div>` : ""}

      ${desc ? `<div class="equipTip__desc">${escapeHtml(desc)}</div>` : ""}

      <div class="equipTip__actions">
        <button class="invAct invAct--ghost" type="button" data-atk-unequip="1">Снять в инвентарь</button>
      </div>
    `;

    const unequipBtn = atkTip.querySelector('[data-atk-unequip="1"]');
    if (unequipBtn) {
      unequipBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        equipUnequipSlot(c, slotKey);
        atkCloseTip();
      });
    }

    atkTip.classList.remove("equipTip--hidden");
    atkPositionTipNear(btn);

    // close on outside click
    setTimeout(() => {
      const handler = (e) => {
        if (!atkTip || atkTip.classList.contains("equipTip--hidden")) {
          document.removeEventListener("click", handler, true);
          return;
        }
        if (atkTip.contains(e.target) || btn.contains(e.target)) return;
        atkCloseTip();
        document.removeEventListener("click", handler, true);
      };
      document.addEventListener("click", handler, true);
    }, 0);
  }

  function equipWeaponAttackBonus(c, w) {
    const abil = String(w?.abilityKey || "str");
    const mod = abilityMod(getAbilityScore(c, abil));
    const pb = getProfBonus(clamp(c.level, 1, 20));
    const extra = safeInt(w?.extraMod, 0);
    const prof = !!w?.proficient;
    return mod + (prof ? pb : 0) + extra;
  }

  function equipRenderTip(c, slotKey, btn) {
    if (!equipTip || !c) return;
    const wrap = c.equipment?.[slotKey] || null;
    if (!wrap || !wrap.item) return;

    const item = wrap.item;
    const rarityKey = String(item.rarity || "common");
    const rarityClass = `rarity--${rarityKey}`;
    const rarityLabel = invRarityLabel(rarityKey);

    let topRowLeft = "";
    let topRowRight = "";

    if (slotKey === "weaponTwoHand") topRowLeft = "Двуручное";
    else if (slotKey === "weaponLeft" || slotKey === "weaponRight") topRowLeft = "Одноручное";
    else if (slotKey === "shield") topRowLeft = "Щит";
    else topRowLeft = EQUIP_SLOT_META[slotKey]?.label || "";

    // Weapon data
    const isWeapon = (wrap.fromCat === "weapons");
    if (isWeapon) topRowRight = item.baseDamageText ? String(item.baseDamageText) : "—";

    const attackBonus = isWeapon ? equipWeaponAttackBonus(c, item) : null;

    const desc = (typeof item.notes === "string" ? item.notes : "").trim();

    equipTip.innerHTML = `
      <div class="equipTip__name ${rarityClass}">${escapeHtml(item.name || "Без названия")}</div>
      <div class="equipTip__rarity ${rarityClass}">${escapeHtml(rarityLabel)}</div>

      <div class="equipTip__row">
        <span>${escapeHtml(topRowLeft)}</span>
        <span>${isWeapon ? escapeHtml(topRowRight) : ""}</span>
      </div>

      ${isWeapon ? `<div class="equipTip__meta">Бонус броска: <b>${escapeHtml(formatSigned(attackBonus))}</b></div>` : ""}

      ${desc ? `<div class="equipTip__desc">${escapeHtml(desc)}</div>` : ""}

      <div class="equipTip__actions">
        <button class="invAct invAct--ghost" type="button" data-equip-action="unequip" data-slot="${escapeHtml(slotKey)}">Снять в инвентарь</button>
      </div>
    `;

    equipTip.classList.remove("equipTip--hidden");
    equipPositionTipNear(btn);
  }

  function equipUnequipSlot(c, slotKey) {
    if (!c) return;
    const wrap = c.equipment?.[slotKey] || null;
    if (!wrap || !wrap.item) return;

    const fromCat = String(wrap.fromCat || "other");
    const invList = invGetList(c, fromCat);
    invList.push(wrap.item);

    c.equipment[slotKey] = null;

    persistActive();
    syncInventoryUI(c);
    syncEquipmentUI(c);
    syncHeaderPart2(c);
  }

  function equipOpenConfirm(text, onOk) {
    if (!equipConfirmText || !equipConfirmOk || !equipConfirmCancel) return;
    equipConfirmJob = typeof onOk === "function" ? onOk : null;
    equipConfirmText.textContent = String(text || "");
    openModal("equipConfirm");

    equipConfirmCancel.onclick = () => {
      equipConfirmJob = null;
      closeModal("equipConfirm");
    };
    equipConfirmOk.onclick = () => {
      const fn = equipConfirmJob;
      equipConfirmJob = null;
      closeModal("equipConfirm");
      if (fn) fn();
    };
  }

  function equipApplyEquip(c, slotKey, newWrap) {
    if (!c) return;

    // two-hand conflicts
    const needRemove = [];
    if (slotKey === "weaponTwoHand") {
      if (c.equipment.weaponRight) needRemove.push("weaponRight");
      if (c.equipment.weaponLeft) needRemove.push("weaponLeft");
      if (c.equipment.shield) needRemove.push("shield");
    } else if (slotKey === "weaponLeft" || slotKey === "weaponRight" || slotKey === "shield") {
      if (c.equipment.weaponTwoHand) needRemove.push("weaponTwoHand");
    }

    const willReplace = !!c.equipment[slotKey];

    const names = [];
    for (const k of needRemove) {
      const w = c.equipment[k];
      if (w?.item?.name) names.push(w.item.name);
    }
    if (willReplace && c.equipment[slotKey]?.item?.name) names.push(c.equipment[slotKey].item.name);

    if (needRemove.length || willReplace) {
      const verb = "Заменить";
      const parts = [];
      if (needRemove.length) parts.push("Придётся снять: " + names.filter(Boolean).join(", "));
      if (willReplace) parts.push("Слот занят. Заменить предмет?");
      const text = parts.join("\n");
      equipOpenConfirm(text || "Заменить предмет?", () => {
        // remove blockers first
        needRemove.forEach((k) => equipUnequipSlot(c, k));
        // if after that slot still occupied (replace)
        if (c.equipment[slotKey]) equipUnequipSlot(c, slotKey);
        c.equipment[slotKey] = newWrap;

        persistActive();
        syncInventoryUI(c);
        syncEquipmentUI(c);
        syncHeaderPart2(c);
      });
      return;
    }

    c.equipment[slotKey] = newWrap;
    persistActive();
    syncInventoryUI(c);
    syncEquipmentUI(c);
    syncHeaderPart2(c);
  }

  function equipTryEquipFromInventory(c, catKey, itemId, slotKey) {
    if (!c) return;
    const list = invGetList(c, catKey);
    const idx = list.findIndex((x) => String(x?.id) === String(itemId));
    if (idx < 0) return;

    let item = list[idx];
    if (catKey === "weapons") item = invEnsureWeapon(item);
    else if (catKey === "armor") item = invEnsureArmor(item);
    else item = invEnsureQtyItem(item);

    // remove from inventory
    list.splice(idx, 1);

    const newWrap = { item, fromCat: catKey };
    equipApplyEquip(c, slotKey, newWrap);
  }

  function equipOpenSlotPickFromInvEditor() {
    const c = getCharacterById(activeId);
    if (!c || !invEditCat || !invEditId) return;

    const catKey = String(invEditCat);
    if (catKey !== "weapons" && catKey !== "armor" && catKey !== "accessories") return;

    equipPending = { mode: "fromInv", catKey, itemId: String(invEditId), slotKey: null };

    equipBuildSlotPick(catKey);
    openModal("equipSlot");
  }

  function equipBuildSlotPick(catKey) {
    if (!equipSlotBody) return;
    equipSlotBody.innerHTML = "";

    const slots =
      catKey === "weapons"
        ? ["weaponLeft", "weaponRight", "weaponTwoHand"]
        : catKey === "armor"
          ? ["head", "shoulders", "chest", "cloak", "hands", "belt", "feet", "shield"]
          : ["ring1", "ring2", "amulet"];

    for (const k of slots) {
      const meta = EQUIP_SLOT_META[k];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "equipPickBtn";
      btn.innerHTML = `<span>${escapeHtml(meta?.label || k)}</span>`;
      btn.addEventListener("click", () => {
        const c = getCharacterById(activeId);
        if (!c || !equipPending) return;
        closeModal("equipSlot");
        // from inventory editor: equip pending item to chosen slot
        equipTryEquipFromInventory(c, equipPending.catKey, equipPending.itemId, k);
        // close item editor modal to reduce clutter
        closeModal("invItem");
        equipPending = null;
      });
      equipSlotBody.appendChild(btn);
    }
  }

  function equipOpenItemPickForSlot(slotKey) {
    const c = getCharacterById(activeId);
    if (!c) return;

    const meta = EQUIP_SLOT_META[slotKey];
    const catKey = equipSlotGroupToCat(meta?.group);

    equipPending = { mode: "fromSlot", slotKey, catKey, itemId: null };

    if (equipItemTitle) equipItemTitle.textContent = `Выберите предмет: ${meta?.label || ""}`;
    equipRenderItemList(c, catKey, slotKey);

    openModal("equipItem");
  }

  function equipRenderItemList(c, catKey, slotKey) {
    if (!equipItemList) return;
    equipItemList.innerHTML = "";

    const list = invGetList(c, catKey);
    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "invEmpty";
      empty.textContent = "Нет подходящих предметов в инвентаре";
      equipItemList.appendChild(empty);
      return;
    }

    for (const it of list) {
      const item = invEnsureItemBase(it);
      const rarityKey = String(item.rarity || "common");
      const rarityClass = `rarity--${rarityKey}`;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "equipItemBtn";
      btn.innerHTML = `
        <span class="equipItemBtn__name ${rarityClass}">${escapeHtml(item.name || "Без названия")}</span>
        <span class="equipItemBtn__meta">${escapeHtml(invRarityLabel(rarityKey))}</span>
      `;
      btn.addEventListener("click", () => {
        const c2 = getCharacterById(activeId);
        if (!c2) return;
        closeModal("equipItem");
        equipTryEquipFromInventory(c2, catKey, item.id, slotKey);
        equipPending = null;
      });
      equipItemList.appendChild(btn);
    }
  }


  function atkEnsureAbility(x) {
    const it = (x && typeof x === "object") ? x : {};
    return {
      id: typeof it.id === "string" ? it.id : nowId(),
      name: typeof it.name === "string" ? it.name : "",
      qty: clamp(safeInt(it.qty, 1), 0, 999),
      max: clamp(safeInt(it.max, 1), 0, 999),
      notes: typeof it.notes === "string" ? it.notes : "",
      showNotes: !!it.showNotes,
      sortIndex: Number.isFinite(Number(it.sortIndex)) ? Number(it.sortIndex) : 0,
    };
  }

  function atkGetAbilities(c) {
    c.attackAbilities = Array.isArray(c.attackAbilities) ? c.attackAbilities.map(atkEnsureAbility) : [];
    return c.attackAbilities;
  }

  function syncAtkSectionState(c) {
    if (!c) return;
    const weaponsOpen = !c.atkWeaponsCollapsed;
    const abilitiesOpen = !c.atkAbilitiesCollapsed;
    atkWeaponsToggle?.setAttribute("aria-expanded", String(weaponsOpen));
    atkAbilitiesToggle?.setAttribute("aria-expanded", String(abilitiesOpen));
    atkWeaponsBody?.classList.toggle("is-collapsed", !weaponsOpen);
    atkAbilitiesBody?.classList.toggle("is-collapsed", !abilitiesOpen);
  }

  let atkAbilityEditId = null;
  let atkAbilityDeleteConfirm = false;

  function atkOpenAbilityEditor(c, id) {
    if (!c) return;
    const list = atkGetAbilities(c);
    let item = list.find((x) => String(x.id) === String(id)) || null;
    if (!item) {
      item = { id: nowId(), name: "", qty: 1, max: 1, notes: "", showNotes: false, sortIndex: invNextSortIndex(list) };
      list.push(item);
      persistActive();
    }
    atkAbilityEditId = item.id;
    atkAbilityDeleteConfirm = false;
    if (atkAbilityDeleteBtn) atkAbilityDeleteBtn.textContent = "Удалить";
    if (atkAbilityName) atkAbilityName.value = item.name || "";
    if (atkAbilityQty) atkAbilityQty.value = String(safeInt(item.qty, 1));
    if (atkAbilityMax) atkAbilityMax.value = String(safeInt(item.max, 1));
    if (atkAbilityNotes) atkAbilityNotes.value = item.notes || "";
    if (atkAbilityShowNotes) atkAbilityShowNotes.checked = !!item.showNotes;
    openModal("atkAbility");
  }

  function atkSaveAbilityEditor(c) {
    if (!c || !atkAbilityEditId) return;
    const list = atkGetAbilities(c);
    const idx = list.findIndex((x) => String(x.id) === String(atkAbilityEditId));
    if (idx < 0) return;
    const prev = atkEnsureAbility(list[idx]);
    const max = clamp(safeInt(atkAbilityMax?.value, prev.max), 0, 999);
    const qtyRaw = clamp(safeInt(atkAbilityQty?.value, prev.qty), 0, 999);
    list[idx] = atkEnsureAbility({
      ...prev,
      name: String(atkAbilityName?.value || "").trim(),
      qty: Math.min(qtyRaw, max),
      max,
      notes: String(atkAbilityNotes?.value || ""),
      showNotes: !!atkAbilityShowNotes?.checked,
    });
    persistActive();
    syncAttacksUI(c);
    closeModal("atkAbility");
  }

  function atkDeleteAbility(c) {
    if (!c || !atkAbilityEditId) return;
    const list = atkGetAbilities(c);
    const idx = list.findIndex((x) => String(x.id) === String(atkAbilityEditId));
    if (idx < 0) return;
    list.splice(idx, 1);
    persistActive();
    syncAttacksUI(c);
    closeModal("atkAbility");
  }

  function atkOpenNotes(c, id) {
    if (!c) return;
    const item = atkGetAbilities(c).find((x) => String(x.id) === String(id));
    if (!item) return;
    if (invNotesTitle) invNotesTitle.textContent = (item.name || "").trim() || "Заметки";
    if (invNotesBody) invNotesBody.textContent = String(item.notes || "");
    openModal("invNotes");
  }

  function atkMoveAbility(c, id, dir) {
    if (!c) return;
    const list = invSortedByIndex(atkGetAbilities(c));
    const idx = list.findIndex((x) => String(x.id) === String(id));
    if (idx < 0) return;
    const nextIdx = idx + (Number(dir) < 0 ? -1 : 1);
    if (nextIdx < 0 || nextIdx >= list.length) return;
    const a = list[idx].sortIndex;
    list[idx].sortIndex = list[nextIdx].sortIndex;
    list[nextIdx].sortIndex = a;
    c.attackAbilities = list;
    persistActive();
    syncAttacksUI(c);
  }

  function atkChangeQty(c, id, delta) {
    if (!c) return;
    const list = atkGetAbilities(c);
    const item = list.find((x) => String(x.id) === String(id));
    if (!item) return;
    item.qty = clamp(safeInt(item.qty, 0) + (Number(delta) || 0), 0, safeInt(item.max, 0));
    persistActive();
    syncAttacksUI(c);
  }

  function renderAtkAbilities(c) {
    if (!atkAbilitiesList || !atkAbilitiesEmpty || !c) return;
    const list = invSortedByIndex(atkGetAbilities(c));
    atkAbilitiesList.innerHTML = "";
    atkAbilitiesEmpty.style.display = list.length ? "none" : "";

    for (const it of list) {
      const row = document.createElement("div");
      row.className = "atkAbilityRow" + (c.atkSortAbilities ? " is-sort" : "") + (it.showNotes ? " has-info" : " no-info");
      const nameText = (it.name || "").trim() ? escapeHtml(it.name) : "настроить";
      const infoHtml = it.showNotes ? `
        <button class="invInfoBtn atkAbilityInfoBtn" type="button" data-action="atk-ability-notes" data-id="${escapeHtml(it.id)}" aria-label="Заметки">
          <img class="invInfoBtn__icon" src="./assets/icons/Info.svg" alt="" />
        </button>` : '';
      const sortHtml = c.atkSortAbilities ? `
        <div class="invSortArrows" aria-label="Сортировка">
          <button class="invArrowBtn invArrowBtn--up" type="button" data-action="atk-ability-move" data-dir="-1" data-id="${escapeHtml(it.id)}" aria-label="Вверх">
            <img class="invArrowBtn__icon" src="./assets/icons/chevron-down.svg" alt="" />
          </button>
          <button class="invArrowBtn" type="button" data-action="atk-ability-move" data-dir="1" data-id="${escapeHtml(it.id)}" aria-label="Вниз">
            <img class="invArrowBtn__icon" src="./assets/icons/chevron-down.svg" alt="" />
          </button>
        </div>` : '';
      row.innerHTML = `
        ${sortHtml}
        <button class="atkAbilityNameBtn ${(it.name || '').trim() ? 'is-filled' : ''}" type="button" data-action="atk-ability-edit" data-id="${escapeHtml(it.id)}"><span>${nameText}</span></button>
        ${infoHtml || ''}
        <div class="atkAbilityCell atkAbilityCell--max">${safeInt(it.max, 1)}</div>
        <div class="atkAbilityCounter">
          <button class="atkAbilityStepBtn" type="button" data-action="atk-ability-step" data-delta="-1" data-id="${escapeHtml(it.id)}" aria-label="Уменьшить">
            <span class="atkAbilityStepBtn__text">−</span>
          </button>
          <div class="atkAbilityCounter__value">${safeInt(it.qty, 1)}</div>
          <button class="atkAbilityStepBtn" type="button" data-action="atk-ability-step" data-delta="1" data-id="${escapeHtml(it.id)}" aria-label="Увеличить">
            <img class="atkAbilityStepBtn__icon" src="./assets/icons/plus.svg" alt="" />
          </button>
        </div>
      `;
      atkAbilitiesList.appendChild(row);
    }
  }

  function syncAttacksUI(c) {
    if (!c) return;
    syncAtkSectionState(c);
    renderAtkWeapons(c);
    renderAtkAbilities(c);
  }

  const ATK_WEAPON_SLOTS = [
    { key: "weaponLeft", icon: "./assets/icons/equipment/weapon-left.svg", label: "Левая рука" },
    { key: "weaponRight", icon: "./assets/icons/equipment/weapon-right.svg", label: "Правая рука" },
    { key: "weaponTwoHand", icon: "./assets/icons/equipment/weapon-2h.svg", label: "Двуручное" },
  ];

  function renderAtkWeapons(c) {
    if (!atkWeaponsList || !atkWeaponsEmpty || !c) return;

    const rows = [];
    for (const s of ATK_WEAPON_SLOTS) {
      const wrap = c.equipment?.[s.key];
      if (!wrap || wrap.fromCat !== "weapons" || !wrap.item) continue;

      const w = invEnsureWeapon(wrap.item);
      const rarityKey = invEnsureRarity(w.rarity);
      const name = (w.name || "").trim();
      const nameText = name ? escapeHtml(name) : "—";

      const bonus = formatSigned(invWeaponAttackBonus(c, w));
      const dmg = escapeHtml(invWeaponDamageText(c, w));

      rows.push({ slotKey: s.key, slotIcon: s.icon, slotLabel: s.label, rarityKey, nameText, bonus, dmg });
    }

    atkWeaponsList.innerHTML = "";
    atkWeaponsEmpty.style.display = rows.length ? "none" : "";

    for (const r of rows) {
      const row = document.createElement("div");
      row.className = "atkWRow";

      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = `equipSlot atkEquipSlot is-filled rarity-${r.rarityKey}`;
      slot.setAttribute("data-slot", r.slotKey);
      slot.setAttribute("aria-label", r.slotLabel);

      const img = document.createElement("img");
      img.className = "equipSlot__icon";
      img.alt = "";
      img.src = r.slotIcon;
      slot.appendChild(img);

      slot.addEventListener("click", () => {
        atkRenderTip(c, r.slotKey, slot);
      });

      const name = document.createElement("div");
      name.className = `atkName rarity--${r.rarityKey}`;
      name.innerHTML = r.nameText;

      const bonus = document.createElement("div");
      bonus.className = "atkBonus invWBonus";
      bonus.textContent = r.bonus;

      const dmg = document.createElement("div");
      dmg.className = "atkDmg invWDmg";
      dmg.innerHTML = r.dmg;

      row.appendChild(slot);
      row.appendChild(name);
      row.appendChild(bonus);
      row.appendChild(dmg);

      atkWeaponsList.appendChild(row);
    }
  }

  const SENSE_PASSIVE_META = {
    perception: {
      label: "Пассивное восприятие",
      abilityLabel: "мудрости",
      description: "Замечает скрытые угрозы, шорохи, ловушки и другие детали без активного поиска.",
    },
    insight: {
      label: "Пассивная проницательность",
      abilityLabel: "мудрости",
      description: "Помогает без проверки уловить ложь, нервозность, скрытые мотивы и намерения собеседника.",
    },
    investigation: {
      label: "Пассивный анализ",
      abilityLabel: "интеллекта",
      description: "Позволяет автоматически замечать логические связи, улики, тайные механизмы и закономерности.",
    },
  };

  function senseEnsureProf(x) {
    const it = (x && typeof x === "object") ? x : {};
    return {
      id: typeof it.id === "string" ? it.id : nowId(),
      name: typeof it.name === "string" ? it.name : "",
      qty: clamp(safeInt(it.qty, 1), 0, 999),
      max: clamp(safeInt(it.max, 1), 0, 999),
      notes: typeof it.notes === "string" ? it.notes : "",
      showNotes: !!it.showNotes,
      useCharges: !!it.useCharges,
      sortIndex: Number.isFinite(Number(it.sortIndex)) ? Number(it.sortIndex) : 0,
    };
  }

  function senseGetProficiencies(c) {
    c.senseProficiencies = Array.isArray(c.senseProficiencies) ? c.senseProficiencies.map(senseEnsureProf) : [];
    return c.senseProficiencies;
  }

  function getPassiveSkillValue(c, skillKey) {
    return 10 + getSkillTotal(c, skillKey);
  }

  function hideSensePassiveTip() {
    sensePassiveTip?.classList.add("senseTip--hidden");
    if (sensePassiveTip) sensePassiveTip.innerHTML = "";
    sensePassiveBtns.forEach((btn) => btn.classList.remove("is-open"));
  }

  function showSensePassiveTip(c, skillKey, anchor) {
    if (!c || !anchor || !sensePassiveTip) return;
    const meta = SENSE_PASSIVE_META[skillKey];
    const skillMeta = SKILL_META[skillKey];
    if (!meta || !skillMeta) return;
    const mod = abilityMod(c?.abilityScores?.[skillMeta.abil] ?? 10);
    const pb = getProfBonus(clamp(safeInt(c?.level, 1), 1, 20));
    const hasProf = hasSkillProf(c, skillKey);
    const extra = getSkillBonus(c, skillKey);
    const total = getPassiveSkillValue(c, skillKey);
    const parts = [`10`, `мод. ${meta.abilityLabel} (${formatSigned(mod)})`];
    if (hasProf) parts.push(`мастерство (${formatSigned(pb)})`);
    if (extra) parts.push(`бонус навыка (${formatSigned(extra)})`);
    sensePassiveTip.innerHTML = `
      <div class="senseTip__title">${escapeHtml(meta.label)}</div>
      <div class="senseTip__formula">${escapeHtml(parts.join(' + '))} = <b>${escapeHtml(String(total))}</b></div>
      <div class="senseTip__desc">${escapeHtml(meta.description)}</div>
    `;
    sensePassiveTip.classList.remove("senseTip--hidden");
    sensePassiveBtns.forEach((btn) => btn.classList.toggle("is-open", btn === anchor));

    const wrap = anchor.closest('.sensesBlock') || anchor.parentElement;
    if (!wrap) return;
    const wrapRect = wrap.getBoundingClientRect();
    const btnRect = anchor.getBoundingClientRect();
    const tipRect = sensePassiveTip.getBoundingClientRect();
    const top = (btnRect.bottom - wrapRect.top) + 8;
    const maxLeft = Math.max(0, wrapRect.width - tipRect.width);
    const left = Math.min(Math.max(0, btnRect.left - wrapRect.left), maxLeft);
    sensePassiveTip.style.top = `${Math.round(top)}px`;
    sensePassiveTip.style.left = `${Math.round(left)}px`;
  }

  function syncSenseSectionState(c) {
    if (!c) return;
    const profOpen = !c.senseProfCollapsed;
    senseProfToggle?.setAttribute("aria-expanded", String(profOpen));
    senseProfBody?.classList.toggle("is-collapsed", !profOpen);
  }

  let senseProfEditId = null;
  let senseProfDeleteConfirm = false;

  function senseOpenProfEditor(c, id) {
    if (!c) return;
    const list = senseGetProficiencies(c);
    let item = list.find((x) => String(x.id) === String(id)) || null;
    if (!item) {
      item = senseEnsureProf({ id: nowId(), name: "", qty: 1, max: 1, notes: "", showNotes: false, useCharges: false, sortIndex: invNextSortIndex(list) });
      list.push(item);
      persistActive();
    }
    senseProfEditId = item.id;
    senseProfDeleteConfirm = false;
    if (senseProfDeleteBtn) senseProfDeleteBtn.textContent = "Удалить";
    if (senseProfName) senseProfName.value = item.name || "";
    if (senseProfQty) senseProfQty.value = String(safeInt(item.qty, 1));
    if (senseProfMax) senseProfMax.value = String(safeInt(item.max, 1));
    if (senseProfNotes) senseProfNotes.value = item.notes || "";
    if (senseProfUseCharges) senseProfUseCharges.checked = !!item.useCharges;
    if (senseProfShowNotes) senseProfShowNotes.checked = !!item.showNotes;
    openModal("senseProf");
  }

  function senseSaveProfEditor(c) {
    if (!c || !senseProfEditId) return;
    const list = senseGetProficiencies(c);
    const idx = list.findIndex((x) => String(x.id) === String(senseProfEditId));
    if (idx < 0) return;
    const prev = senseEnsureProf(list[idx]);
    const max = clamp(safeInt(senseProfMax?.value, prev.max), 0, 999);
    const qtyRaw = clamp(safeInt(senseProfQty?.value, prev.qty), 0, 999);
    list[idx] = senseEnsureProf({
      ...prev,
      name: String(senseProfName?.value || "").trim(),
      qty: Math.min(qtyRaw, max),
      max,
      notes: String(senseProfNotes?.value || ""),
      showNotes: !!senseProfShowNotes?.checked,
      useCharges: !!senseProfUseCharges?.checked,
    });
    persistActive();
    syncSensesUI(c);
    closeModal("senseProf");
  }

  function senseDeleteProf(c) {
    if (!c || !senseProfEditId) return;
    const list = senseGetProficiencies(c);
    const idx = list.findIndex((x) => String(x.id) === String(senseProfEditId));
    if (idx < 0) return;
    list.splice(idx, 1);
    persistActive();
    syncSensesUI(c);
    closeModal("senseProf");
  }

  function senseOpenNotes(c, id) {
    if (!c) return;
    const item = senseGetProficiencies(c).find((x) => String(x.id) === String(id));
    if (!item) return;
    if (invNotesTitle) invNotesTitle.textContent = (item.name || "").trim() || "Заметки";
    if (invNotesBody) invNotesBody.textContent = String(item.notes || "");
    openModal("invNotes");
  }

  function senseMoveProf(c, id, dir) {
    if (!c) return;
    const list = invSortedByIndex(senseGetProficiencies(c));
    const idx = list.findIndex((x) => String(x.id) === String(id));
    if (idx < 0) return;
    const nextIdx = idx + (Number(dir) < 0 ? -1 : 1);
    if (nextIdx < 0 || nextIdx >= list.length) return;
    const a = list[idx].sortIndex;
    list[idx].sortIndex = list[nextIdx].sortIndex;
    list[nextIdx].sortIndex = a;
    c.senseProficiencies = list;
    persistActive();
    syncSensesUI(c);
  }

  function senseChangeQty(c, id, delta) {
    if (!c) return;
    const item = senseGetProficiencies(c).find((x) => String(x.id) === String(id));
    if (!item || !item.useCharges) return;
    item.qty = clamp(safeInt(item.qty, 0) + (Number(delta) || 0), 0, safeInt(item.max, 0));
    persistActive();
    syncSensesUI(c);
  }

  function renderSenseProficiencies(c) {
    if (!senseProfList || !senseProfEmpty || !c) return;
    const list = invSortedByIndex(senseGetProficiencies(c));
    senseProfList.innerHTML = "";
    senseProfEmpty.style.display = list.length ? "none" : "";

    for (const it of list) {
      const row = document.createElement("div");
      row.className = "senseProfRow" + (c.senseSortProf ? " is-sort" : "") + (it.showNotes ? " has-info" : " no-info") + (it.useCharges ? " has-charges" : " no-charges");
      const nameText = (it.name || "").trim() ? escapeHtml(it.name) : "настроить";
      const infoHtml = it.showNotes ? `
        <button class="invInfoBtn atkAbilityInfoBtn" type="button" data-action="sense-prof-notes" data-id="${escapeHtml(it.id)}" aria-label="Заметки">
          <img class="invInfoBtn__icon" src="./assets/icons/Info.svg" alt="" />
        </button>` : "";
      const sortHtml = c.senseSortProf ? `
        <div class="invSortArrows" aria-label="Сортировка">
          <button class="invArrowBtn invArrowBtn--up" type="button" data-action="sense-prof-move" data-dir="-1" data-id="${escapeHtml(it.id)}" aria-label="Вверх">
            <img class="invArrowBtn__icon" src="./assets/icons/chevron-down.svg" alt="" />
          </button>
          <button class="invArrowBtn" type="button" data-action="sense-prof-move" data-dir="1" data-id="${escapeHtml(it.id)}" aria-label="Вниз">
            <img class="invArrowBtn__icon" src="./assets/icons/chevron-down.svg" alt="" />
          </button>
        </div>` : "";
      const chargesHtml = it.useCharges ? `
        <div class="atkAbilityCell atkAbilityCell--max">${safeInt(it.max, 1)}</div>
        <div class="atkAbilityCounter">
          <button class="atkAbilityStepBtn" type="button" data-action="sense-prof-step" data-delta="-1" data-id="${escapeHtml(it.id)}" aria-label="Уменьшить">
            <span class="atkAbilityStepBtn__text">−</span>
          </button>
          <div class="atkAbilityCounter__value">${safeInt(it.qty, 1)}</div>
          <button class="atkAbilityStepBtn" type="button" data-action="sense-prof-step" data-delta="1" data-id="${escapeHtml(it.id)}" aria-label="Увеличить">
            <img class="atkAbilityStepBtn__icon" src="./assets/icons/plus.svg" alt="" />
          </button>
        </div>` : "";
      row.innerHTML = `
        ${sortHtml}
        <button class="atkAbilityNameBtn ${(it.name || '').trim() ? 'is-filled' : ''}" type="button" data-action="sense-prof-edit" data-id="${escapeHtml(it.id)}"><span>${nameText}</span></button>
        ${infoHtml}
        ${chargesHtml}
      `;
      senseProfList.appendChild(row);
    }
  }

  function renderPassiveSenses(c) {
    if (!c) return;
    for (const btn of sensePassiveBtns) {
      const skillKey = btn.getAttribute('data-passive-skill');
      if (!skillKey) continue;
      const valueEl = btn.querySelector('.sensePassiveBtn__value');
      const value = getPassiveSkillValue(c, skillKey);
      if (valueEl) valueEl.textContent = String(value);
    }
  }

  function syncSensesUI(c) {
    if (!c) return;
    syncSenseSectionState(c);
    renderPassiveSenses(c);
    renderSenseProficiencies(c);
  }

function syncEquipmentUI(c) {
    if (!c) return;

    // silhouette
    const key = String(c.silhouetteKey || "human");
    const r = EQUIP_RACES.find((x) => x.key === key) || EQUIP_RACES[0];
    if (equipSil) {
      equipSil.classList.remove("is-missing");
      equipSil.onerror = () => {
        equipSil.classList.add("is-missing");
        equipSil.removeAttribute("src");
      };
      equipSil.src = `./assets/silhouettes/${r.file}`;
    }
    if (equipRaceLabel) equipRaceLabel.textContent = r.label;

    // slots state
    equipSlotBtns.forEach((btn) => {
      const k = btn.getAttribute("data-slot");
      const filled = !!(k && c.equipment && c.equipment[k]);
      btn.classList.toggle("is-filled", filled);
      // rarity border class
      btn.classList.remove("rarity-common","rarity-uncommon","rarity-rare","rarity-very_rare","rarity-legendary","rarity-artifact");
      if (filled) {
        const rr = normalizeRarity(c.equipment[k]?.item?.rarity);
        btn.classList.add(`rarity-${rr}`);
      }
      const name = filled ? (c.equipment[k]?.item?.name || "") : "";
      if (name) btn.title = name;
      else btn.removeAttribute("title");
    });

    // Attacks section
    syncAttacksUI(c);

  }

  // Slot click behavior + tooltip
  equipSlotBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const c = getCharacterById(activeId);
      if (!c) return;
      const slotKey = btn.getAttribute("data-slot");
      if (!slotKey) return;

      const filled = !!c.equipment?.[slotKey];
      if (!filled) {
        equipCloseTip();
        equipOpenItemPickForSlot(slotKey);
        return;
      }

      // toggle tip
      if (equipTip && !equipTip.classList.contains("equipTip--hidden") && equipTip.getAttribute("data-open-slot") === slotKey) {
        equipCloseTip();
        equipTip.removeAttribute("data-open-slot");
        return;
      }

      equipCloseTip();
      if (equipTip) equipTip.setAttribute("data-open-slot", slotKey);
      equipRenderTip(c, slotKey, btn);
      equipArmTipAutoClose();
        });
  });

  // tip actions
  equipTip?.addEventListener("click", (e) => {
    const t = e.target;
    if (!(t instanceof HTMLElement)) return;
    const act = t.getAttribute("data-equip-action");
    if (act !== "unequip") return;
    const slotKey = t.getAttribute("data-slot");
    const c = getCharacterById(activeId);
    if (!c || !slotKey) return;
    equipCloseTip();
    equipUnequipSlot(c, slotKey);
  });

// close tip on any next click (even inside), and swallow that click
  let equipTipCloseArmed = false;

  function equipArmTipAutoClose() {
    if (equipTipCloseArmed) return;
    equipTipCloseArmed = true;

    setTimeout(() => {
      const handler = (e) => {
        if (!equipTip) {
          equipTipCloseArmed = false;
          document.removeEventListener("click", handler, true);
          return;
        }

        if (equipTip.classList.contains("equipTip--hidden")) {
          equipTipCloseArmed = false;
          document.removeEventListener("click", handler, true);
          return;
        }

        const clickedInsideTip = equipTip.contains(e.target);
        const actionableInsideTip = clickedInsideTip && !!e.target.closest(
          'button, a, [role="button"], input, select, textarea, label'
        );

        // 1) Если клик по кнопке/интерактиву внутри tooltip — НЕ закрываем и НЕ глушим
        if (actionableInsideTip) {
          return;
        }

        // 2) В остальных случаях закрываем tooltip
        equipCloseTip();
        equipTip.removeAttribute("data-open-slot");

        // 3) Если клик был внутри tooltip по “пустому месту” — глушим, чтобы не срабатывали другие клики
        if (clickedInsideTip) {
          e.preventDefault();
          e.stopPropagation();
        }

        equipTipCloseArmed = false;
        document.removeEventListener("click", handler, true);
      };
      document.addEventListener("click", handler, true);
    }, 0);
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") equipCloseTip();
  });

  // race picker
  equipRaceBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c || !equipRaceList) return;

    equipRaceList.innerHTML = "";
    const sel = String(c.silhouetteKey || "human");
    for (const r of EQUIP_RACES) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "equipPickBtn";
      const isSel = sel === String(r.key);
      if (isSel) b.classList.add("is-selected");
      b.setAttribute("aria-pressed", String(isSel));

const iconSrc = `./assets/icons/races/${encodeURIComponent(String(r.key))}.svg`;
      b.innerHTML = `
        <span class="equipPickBtn__left">
          <span class="equipPickBtn__label">${escapeHtml(r.label)}</span>
        </span>
        <span class="equipPickBtn__raceIcon" aria-hidden="true" style="--raceIcon:url('${iconSrc}')"></span>
      `;

      b.addEventListener("click", () => {
        const c2 = getCharacterById(activeId);
        if (!c2) return;
        c2.silhouetteKey = r.key;
        persistActive();
        syncEquipmentUI(c2);
        closeModal("equipRace");
        equipRaceBtn.setAttribute("aria-expanded", "false");
      });
      equipRaceList.appendChild(b);
    }

    openModal("equipRace");
    equipRaceBtn.setAttribute("aria-expanded", "true");
  });


  // ===== Sell flow =====
  let invSellDenom = "gp";
  function coinMeaningClass(denom) {
    if (denom === "gp") return "coinIcon--gold";
    if (denom === "sp") return "coinIcon--silver";
    if (denom === "cp") return "coinIcon--copper";
    if (denom === "pp") return "coinIcon--platinum";
    if (denom === "ep") return "coinIcon--electrum";
    return "coinIcon--gold";
  }
  function invSellSyncDenom() {
    invSellDenom = COIN[invSellDenom] ? invSellDenom : "gp";
    const meta = COIN[invSellDenom] || COIN.gp;

    if (invSellDenomIcon) {
      invSellDenomIcon.src = meta.icon;
      invSellDenomIcon.classList.add("coinIcon");
      invSellDenomIcon.classList.remove("coinIcon--gold","coinIcon--silver","coinIcon--copper","coinIcon--platinum","coinIcon--electrum");
      invSellDenomIcon.classList.add(coinMeaningClass(invSellDenom));
    }
    if (invSellDenomText) invSellDenomText.textContent = meta.label;
  }
  function invSellBuildDenoms() {
    if (!invSellDenomPopover) return;
    invSellDenomPopover.innerHTML = "";
    for (const key of ["gp", "pp", "sp", "cp", "ep"]) {
      const meta = COIN[key];
      const b = document.createElement("button");
      b.type = "button";
      b.className = "invSellOpt" + (key === invSellDenom ? " is-active" : "");
      b.dataset.value = key;
      b.innerHTML = `<img class="invSellOpt__icon coinIcon ${coinMeaningClass(key)}" src="${meta.icon}" alt="" /><span>${escapeHtml(meta.label)}</span>`;
      b.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        invSellDenom = key;
        invSellSyncDenom();
        invSellBuildDenoms();
        invSellDenomPopover.classList.add("invSellPopover--hidden");
        invSellDenomBtn?.setAttribute("aria-expanded", "false");
      });
      invSellDenomPopover.appendChild(b);
    }
  }
  function invOpenSell(c) {
    if (!c || !invEditCat || !invEditId) return;
    const list = invGetList(c, invEditCat);
    const item = list.find((x) => String(x?.id) === String(invEditId)) || null;
    if (!item) return;

    if (invSellItemName) invSellItemName.textContent = (item.name || "").trim() || "Без названия";
    invSellDenom = "gp";
    invSellSyncDenom();
    invSellBuildDenoms();
    if (invSellAmount) invSellAmount.value = "";
    openModal("invSell");
    setTimeout(() => invSellAmount?.focus(), 0);
  }

  invEditSellBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    invOpenSell(c);
  });

  invSellDenomBtn?.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!invSellDenomPopover) return;
    const isHidden = invSellDenomPopover.classList.contains("invSellPopover--hidden");
    if (isHidden) {
      invSellDenomPopover.classList.remove("invSellPopover--hidden");
      invSellDenomBtn.setAttribute("aria-expanded", "true");
    } else {
      invSellDenomPopover.classList.add("invSellPopover--hidden");
      invSellDenomBtn.setAttribute("aria-expanded", "false");
    }
  });
  invSellDenomBtn?.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); });

  document.addEventListener("pointerdown", (e) => {
    if (!invSellDenomPopover || invSellDenomPopover.classList.contains("invSellPopover--hidden")) return;
    const t = e.target;
    if (t && (t.closest("#invSellDenomPopover") || t.closest("#invSellDenomBtn"))) return;
    invSellDenomPopover.classList.add("invSellPopover--hidden");
    invSellDenomBtn?.setAttribute("aria-expanded", "false");
  });

  invSellCancel?.addEventListener("click", () => closeModal("invSell"));

  // ===== Inventory log (sold/dropped) =====
  function invEnsureLog(c) {
    if (!c.history || !Array.isArray(c.history)) c.history = [];
  }

  function invLogAdd(c, entry) {
    invEnsureLog(c);
    c.history.unshift(entry);
    // keep reasonable size
    if (c.history.length > 200) c.history.length = 200;
  }

  function invFmtDT(ts) {
    const d = new Date(ts);
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function invRenderLog(c) {
    if (!invLogBody) return;
    invEnsureLog(c);
    const items = c.history.filter((x) => x && x.kind === "inv");
    invLogBody.innerHTML = "";
    for (const x of items) {
      const row = document.createElement("div");
      row.className = "invLogRow";
      const act = x.action === "sell" ? "Продать" : "Выбросить";
      const rarityClass = `rarity--${invEnsureRarity(x.rarity)}`;
      const sumHtml =
        x.action === "sell"
          ? `<span>${escapeHtml(String(x.amount))}</span><img class="invLogSum__icon coinIcon ${coinMeaningClass(x.denom)}" src="${COIN[x.denom]?.icon || COIN.gp.icon}" alt="" />`
                    : `<span>—</span>`;
      row.innerHTML = `
<div class="invLogAct invLogAct--${x.action}">${act}</div>
        <div class="invLogItem ${rarityClass}">${escapeHtml(x.name || "")}</div>
        <div class="invLogSum">${sumHtml}</div>
        <div class="invLogMeta">${escapeHtml(invFmtDT(x.ts || Date.now()))}</div>
      `;
      invLogBody.appendChild(row);
    }
    // empty handled by CSS (:empty + .invLogEmpty)
  }

  invSellOk?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c || !invEditCat || !invEditId) return;

    const amt = Math.max(0, safeInt(invSellAmount?.value || "0", 0));
    if (amt <= 0) {
      showToast("Укажи сумму");
      return;
    }

    if (!c.wallet) c.wallet = { gp: 0, sp: 0, cp: 0, ep: 0, pp: 0 };
    c.wallet[invSellDenom] = safeInt(c.wallet[invSellDenom], 0) + amt;

    const list = invGetList(c, invEditCat);
    const idx = list.findIndex((x) => String(x?.id) === String(invEditId));
    const item = idx >= 0 ? list[idx] : null;

    const name = (item?.name || "").trim() || "Без названия";
    const rarity = invEnsureRarity(item?.rarity);

    invLogAdd(c, {
      kind: "inv",
      action: "sell",
      name,
      rarity,
      amount: amt,
      denom: invSellDenom,
      ts: Date.now(),
    });

    // удалить проданный предмет из инвентаря
    if (idx >= 0) list.splice(idx, 1);

    persistActive();
    syncInventoryUI(c);
    coinsSyncUI(c);

    closeModal("invSell");
    closeModal("invItem");
    showToast("Продано");
  });
  // Open inventory log from any tab header
  document.addEventListener("click", (e) => {
    const t = e.target.closest('[data-action="open-invlog"]');
    if (!t) return;
    const c = getCharacterById(activeId);
    if (!c) return;
    invRenderLog(c);
    openModal("invLog");
  });


  // Coins calc open
  document.addEventListener("click", (e) => {
    const t = e.target.closest('[data-action="open-coins"]');
    if (!t) return;
    const c = getCharacterById(activeId);
    if (!c) return;
    coinsSetExpr("0");
    coinsEnsureDenom("gp");
    coinsSyncUI(c);
    openModal("coins");
  });

  document.addEventListener("click", (e) => {
    const passiveBtn = e.target.closest('.sensePassiveBtn[data-passive-skill]');
    if (passiveBtn) {
      e.stopPropagation();
      const c = getCharacterById(activeId);
      if (!c) return;
      const skillKey = passiveBtn.getAttribute('data-passive-skill');
      const isSameOpen = passiveBtn.classList.contains('is-open') && sensePassiveTip && !sensePassiveTip.classList.contains('senseTip--hidden');
      if (isSameOpen) hideSensePassiveTip();
      else showSensePassiveTip(c, skillKey, passiveBtn);
      return;
    }

    if (sensePassiveTip && !e.target.closest('#sensePassiveTip')) hideSensePassiveTip();

    const editBtn = e.target.closest('[data-action="atk-ability-edit"]');
    if (editBtn) {
      const c = getCharacterById(activeId);
      if (!c) return;
      atkOpenAbilityEditor(c, editBtn.getAttribute('data-id'));
      return;
    }

    const notesBtn = e.target.closest('[data-action="atk-ability-notes"]');
    if (notesBtn) {
      const c = getCharacterById(activeId);
      if (!c) return;
      atkOpenNotes(c, notesBtn.getAttribute('data-id'));
      return;
    }

    const stepBtn = e.target.closest('[data-action="atk-ability-step"]');
    if (stepBtn) {
      const c = getCharacterById(activeId);
      if (!c) return;
      atkChangeQty(c, stepBtn.getAttribute('data-id'), safeInt(stepBtn.getAttribute('data-delta'), 0));
      return;
    }

    const moveBtn = e.target.closest('[data-action="atk-ability-move"]');
    if (moveBtn) {
      const c = getCharacterById(activeId);
      if (!c) return;
      atkMoveAbility(c, moveBtn.getAttribute('data-id'), safeInt(moveBtn.getAttribute('data-dir'), 0));
      return;
    }

    const senseEditBtn = e.target.closest('[data-action="sense-prof-edit"]');
    if (senseEditBtn) {
      const c = getCharacterById(activeId);
      if (!c) return;
      senseOpenProfEditor(c, senseEditBtn.getAttribute('data-id'));
      return;
    }

    const senseNotesBtn = e.target.closest('[data-action="sense-prof-notes"]');
    if (senseNotesBtn) {
      const c = getCharacterById(activeId);
      if (!c) return;
      senseOpenNotes(c, senseNotesBtn.getAttribute('data-id'));
      return;
    }

    const senseStepBtn = e.target.closest('[data-action="sense-prof-step"]');
    if (senseStepBtn) {
      const c = getCharacterById(activeId);
      if (!c) return;
      senseChangeQty(c, senseStepBtn.getAttribute('data-id'), safeInt(senseStepBtn.getAttribute('data-delta'), 0));
      return;
    }

    const senseMoveBtn = e.target.closest('[data-action="sense-prof-move"]');
    if (senseMoveBtn) {
      const c = getCharacterById(activeId);
      if (!c) return;
      senseMoveProf(c, senseMoveBtn.getAttribute('data-id'), safeInt(senseMoveBtn.getAttribute('data-dir'), 0));
    }
  });

  window.addEventListener('resize', hideSensePassiveTip);
  window.addEventListener('scroll', hideSensePassiveTip, true);

  // Swipe logic (pointer-based)
(function initSectionsSwipe() {
    if (!sectionsTrack) return;
    let isDown = false;
    let startX = 0;
    let startY = 0;
    let baseX = 0;
    let moved = false;

    const getBaseByActive = () => {
      const c = getCharacterById(activeId);
      const idx = c ? getSectionIndexByKey(c.activeSectionKey) : 0;
      const w = (sectionsPager?.clientWidth || sectionsTrack.clientWidth || 0);
      return -idx * w;
    };

    const snapToActive = (animate) => {
      const c = getCharacterById(activeId);
      if (!c) return;
      setActiveSection(c, c.activeSectionKey, { animate: !!animate, persist: false });
    };

    const onResize = () => snapToActive(false);
    window.addEventListener("resize", onResize);

    const moveTrack = (dx, dy) => {
      const w = (sectionsPager?.clientWidth || sectionsTrack.clientWidth || 0);
      const c = getCharacterById(activeId);
      const idx = c ? getSectionIndexByKey(c.activeSectionKey) : 0;

      // soft resistance at edges
      let nextX = baseX + dx;
      if (idx === 0 && dx > 0) nextX = baseX + dx * 0.35;
      if (idx === SECTIONS.length - 1 && dx < 0) nextX = baseX + dx * 0.35;

      sectionsTrack.style.transform = `translate3d(${nextX}px, 0, 0)`;
    };

    const commit = (dx) => {
      const c = getCharacterById(activeId);
      if (!c) return;

      const w = (sectionsPager?.clientWidth || sectionsTrack.clientWidth || 0);
      const curIdx = getSectionIndexByKey(c.activeSectionKey);
      let nextIdx = curIdx;

      if (Math.abs(dx) > Math.max(26, w * 0.18)) {
        if (dx < 0) {
          nextIdx = (curIdx === SECTIONS.length - 1) ? 0 : curIdx + 1;
        } else {
          nextIdx = (curIdx === 0) ? SECTIONS.length - 1 : curIdx - 1;
        }
      }

      setActiveSection(c, SECTIONS[nextIdx].key, { animate: true, persist: true });
      sectionsTrack.style.transition = "transform 220ms ease";
    };
    // ---- Pointer (works on many Android/desktop) ----
    sectionsTrack.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      isDown = true;
      moved = false;

      startX = e.clientX;
      startY = e.clientY;
      baseX = getBaseByActive();

      sectionsTrack.style.transition = "none";
      try { sectionsTrack.setPointerCapture(e.pointerId); } catch {}
    });

    sectionsTrack.addEventListener("pointermove", (e) => {
      if (!isDown) return;

      const dx = e.clientX - startX;
      const dy = e.clientY - startY;

      // if user is scrolling vertically, don't hijack
      if (!moved) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
          isDown = false;
          sectionsTrack.style.transition = "transform 220ms ease";
          snapToActive(true);
          return;
        }
      }

      if (Math.abs(dx) > 2) moved = true;

      // prevent browser gesture when clearly horizontal
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 4) e.preventDefault();

      moveTrack(dx, dy);
    });

    const pointerEnd = (e) => {
      if (!isDown) return;
      isDown = false;

      const dx = e.clientX - startX;
      commit(dx);

      try { sectionsTrack.releasePointerCapture(e.pointerId); } catch {}
    };

    sectionsTrack.addEventListener("pointerup", pointerEnd);
    sectionsTrack.addEventListener("pointercancel", pointerEnd);

    // ---- Touch fallback (важно для iOS/части WebView) ----
    sectionsTrack.addEventListener("touchstart", (e) => {
      if (!e.touches || e.touches.length !== 1) return;

      isDown = true;
      moved = false;

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      baseX = getBaseByActive();

      sectionsTrack.style.transition = "none";
    }, { passive: true });

    sectionsTrack.addEventListener("touchmove", (e) => {
      if (!isDown || !e.touches || e.touches.length !== 1) return;

      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;

      // if user is scrolling vertically, don't hijack
      if (!moved) {
        if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 6) {
          isDown = false;
          sectionsTrack.style.transition = "transform 220ms ease";
          snapToActive(true);
          return;
        }
      }

      if (Math.abs(dx) > 2) moved = true;

      // if clearly horizontal -> prevent page gesture/scroll
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 4) {
        e.preventDefault();
      }

      moveTrack(dx, dy);
    }, { passive: false });

    sectionsTrack.addEventListener("touchend", (e) => {
      if (!isDown) return;
      isDown = false;

      // touchend doesn't keep the last touch, so compute via changedTouches
      const t = (e.changedTouches && e.changedTouches[0]) ? e.changedTouches[0] : null;
      const endX = t ? t.clientX : startX;
      const dx = endX - startX;

      commit(dx);
    }, { passive: true });

    sectionsTrack.addEventListener("touchcancel", () => {
      if (!isDown) return;
      isDown = false;
      sectionsTrack.style.transition = "transform 220ms ease";
      snapToActive(true);
    }, { passive: true });
  })();

    function updateXpBar(c) {
              const level = clamp(c.level, 1, 20);
    const curXp = Math.max(0, c.xpCurrent);

    const minXp = getXpMinForLevel(level);
    const nextXp = getXpForNextLevel(level);
    const nextLevel = level < 20 ? level + 1 : 20;

    xpLevelLeft.textContent = String(level);
    xpLevelRight.textContent = String(nextLevel);

    if (nextXp == null) {
      xpText.textContent = `${curXp}/${minXp}`;
      xpFill.style.width = "100%";
      xpLevelUp.disabled = true;
      xpLevelUp.classList.remove("is-ready");
      return;
    }

    const denom = Math.max(1, nextXp - minXp);
    const pct = clamp(((curXp - minXp) / denom) * 100, 0, 100);
    xpFill.style.width = `${pct}%`;

    xpText.textContent = `${curXp}/${nextXp}`;

    xpMiniLeft.textContent = String(level);
    xpMiniRight.textContent = String(nextLevel);
    xpMiniFill.style.width = `${pct}%`;
    if (xpMiniText) xpMiniText.textContent = `${curXp}/${nextXp}`;

    const canUp = level < 20 && curXp >= nextXp;
    xpLevelUp.disabled = !canUp;
    xpLevelUp.classList.toggle("is-ready", canUp);
  }

  function syncSettingsFields(c) {
    setName.value = c.name || "";
    setRace.value = c.race || "";
    setClass.value = c.className || "";
    setSubclass.value = c.subclass || "";
    setSpeed.value = String(safeInt(c.speed, 0));
    setHpMax.value = String(safeInt(c.hpMax, 0));
  }

  function syncSpellUI(c) {
    const map = {
      str: "Сила",
      dex: "Ловкость",
      con: "Телосложение",
      int: "Интеллект",
      wis: "Мудрость",
      cha: "Харизма",
    };
    const level = clamp(c.level, 1, 20);
    const pb = getProfBonus(level);

    const abilityKey = c.spellcasting?.ability || "";
    spellAbilityText.textContent = abilityKey ? (map[abilityKey] || "—") : "—";

    const scores = c.abilityScores || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    const mod = abilityKey ? abilityMod(scores[abilityKey] ?? 10) : 0;

    const dc = 8 + pb + mod;
    const atk = pb + mod;

    spellSaveDc.textContent = String(dc);
    spellAtkBonus.textContent = `${atk >= 0 ? "+" : ""}${atk}`;

    slotsGrid.innerHTML = "";
    const slots = c.spellcasting?.slots || {};
    for (let lvl = 1; lvl <= 9; lvl++) {
      const box = document.createElement("div");
      box.className = "slotBox";
      box.innerHTML = `
        <div class="slotBox__lvl">${lvl}-Й УРОВЕНЬ</div>
        <input class="slotBox__in" inputmode="numeric" type="text" value="${safeInt(slots[String(lvl)] ?? 0, 0)}" data-slot="${lvl}" />
      `;
      slotsGrid.appendChild(box);
    }
  }


  // ===== Spells: data mapping =====

  const SPELL_ALLOWED_CLASSES = ["artificer","bard","cleric","druid","paladin","ranger","sorcerer","warlock","wizard"];
  const SPELL_CLASS_LABELS = {
    artificer: "Изобретатель",
    bard: "Бард",
    barbarian: "Варвар",
    cleric: "Жрец",
    druid: "Друид",
    fighter: "Воин",
    monk: "Монах",
    paladin: "Паладин",
    ranger: "Следопыт",
    rogue: "Плут",
    sorcerer: "Чародей",
    warlock: "Колдун",
    wizard: "Волшебник",
  };
  const SPELL_ALL_CLASSES = Object.keys(SPELL_CLASS_LABELS);

  const SPELL_SAVE_LABELS = { str: "Сил", dex: "Лов", con: "Тел", int: "Инт", wis: "Мдр", cha: "Хар" };
  const SPELL_SCHOOL_LABELS = {
    abj: "Ограждение",
    con: "Вызов",
    div: "Прорицание",
    enc: "Очарование",
    evo: "Воплощение",
    ill: "Иллюзия",
    nec: "Некромантия",
    trs: "Преобразование",
  };

  function getSpellId(spell) {
    return String(spell?._raw?._id || spell?.id || spell?.key || spell?.name || "");
  }

  function normalizeCustomSpell(raw) {
    const src = raw || {};
    const sys = src?._raw?.system || {};
    const rawClasses = Array.isArray(src.classes) && src.classes.length ? src.classes : src?._raw?.classes;
    const classes = Array.isArray(rawClasses) ? rawClasses.map(String).filter((k) => SPELL_ALL_CLASSES.includes(k)) : [];

    const id = String(src.id || src?._raw?._id || `custom:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`);
    const name = String(src.name || src?._raw?.name || "").trim();
    const level = clamp(safeInt(src.level ?? sys.level ?? 0, 0), 0, 9);
    const school = String(src.school || sys.school || "evo");

    const activation = sys.activation || {};
    const target = sys.target || {};
    const range = sys.range || {};
    const duration = sys.duration || {};
    const components = sys.components || {};
    const materialsValue = String(src.materialText ?? src?.materials?.value ?? sys.materials?.value ?? "").trim();

    const rangeType = String(src.rangeType || range.units || "sight");
    const rangeVal = src.rangeAmount !== undefined
      ? (src.rangeAmount === "" || src.rangeAmount == null ? null : safeInt(src.rangeAmount, 0))
      : (range.value == null || range.value === "" ? null : safeInt(range.value, 0));

    const durationType = String(src.durationType || duration.units || "");
    const durationVal = src.durationAmount !== undefined
      ? (src.durationAmount === "" || src.durationAmount == null ? null : safeInt(src.durationAmount, 0))
      : (duration.value == null || duration.value === "" ? null : safeInt(duration.value, 0));

    const targetType = String(src.targetType || target.type || "none");
    const targetSize = src.targetSize !== undefined
      ? (src.targetSize === "" || src.targetSize == null ? null : safeInt(src.targetSize, 0))
      : (target.value == null || target.value === "" ? null : safeInt(target.value, 0));
    const targetUnit = String(src.targetUnit || target.units || "ft");

    const rawDamageParts = Array.isArray(sys.damage?.parts) ? sys.damage.parts : [];
    const firstDamage = rawDamageParts[0] || [];
    const damageDice = String(src.damageDice || (Array.isArray(firstDamage) ? firstDamage[0] : "") || "").trim();
    const damageType = String(src.damageType || (Array.isArray(firstDamage) ? firstDamage[1] : "") || "");
    const parts = [];
    if (damageDice) parts.push([damageDice, damageType]);

    const scalingSrc = src.scaling || sys.scaling || {};
    const scalingType = String(src.scalingType || scalingSrc.type || "");
    const scalingFormula = String(src.scalingDice || scalingSrc.formula || "").trim();

    const descriptionHtml = String(
      src?.description?.html || src?.description?.value || sys?.description?.value || src.description || ""
    ).trim();
    const descriptionText = String(
      src?.description?.text || descriptionHtml
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/(p|div|li|h\d)>/gi, "\n")
        .replace(/<(p|div|ul|ol|li|h\d)[^>]*>/gi, "")
        .replace(/<[^>]*>/g, "")
        .replace(/\u00a0/g, " ")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );

    const castCount = safeInt(src.castCount ?? activation.cost ?? 1, 1);
    const castType = String(src.castType || activation.type || "action");
    const castCondition = String(src.castCondition || activation.condition || "").trim();
    const actionType = String(src.actionType || sys.actionType || "");
    const saveAbility = String(src.saveAbility || sys.save?.ability || "");
    const compV = !!(src.compV ?? components.vocal);
    const compS = !!(src.compS ?? components.somatic);
    const compM = !!(src.compM ?? components.material);
    const concentration = !!(src.concentration ?? components.concentration);
    const ritual = !!(src.ritual ?? components.ritual);

    const normalized = {
      id,
      name,
      level,
      school,
      custom: true,
      components: {
        v: compV,
        s: compS,
        m: compM,
        materials: {
          value: materialsValue,
          consumed: false,
          cost: 0,
          supply: 0,
        },
      },
      casting: {
        time: {
          value: castCount,
          unit: castType,
        },
        condition: castCondition || null,
      },
      range: {
        value: rangeVal,
        long: null,
        unit: rangeType,
      },
      target: {
        type: targetType,
        value: targetSize,
        width: null,
        unit: targetUnit,
      },
      duration: {
        value: durationVal,
        unit: durationType,
      },
      tags: {
        concentration,
        ritual,
      },
      mechanics: {
        actionType,
        saveAbility,
        damageParts: parts,
        formula: null,
      },
      scaling: scalingType ? { type: scalingType, formula: scalingFormula } : null,
      description: {
        html: descriptionHtml,
        text: descriptionText,
      },
      classes,
      source: {
        book: "Custom",
        revision: 1,
        rules: "2014",
      },
      meta: {
        rules: "2014",
        book: "Custom",
        revision: 1,
        hash: String(src?.meta?.hash || id),
        type: "spell",
      },
      _raw: {
        _id: id,
        name,
        type: "spell",
        classes,
        system: {
          level,
          school,
          activation: {
            cost: castCount,
            type: castType,
            condition: castCondition,
          },
          target: { type: targetType, value: targetSize, units: targetUnit },
          range: { units: rangeType, value: rangeVal },
          duration: { units: durationType, value: durationVal },
          components: {
            vocal: compV,
            somatic: compS,
            material: compM,
            concentration,
            ritual,
          },
          materials: { value: materialsValue },
          actionType,
          save: { ability: saveAbility },
          damage: { parts },
          scaling: scalingType ? { type: scalingType, formula: scalingFormula, mode: scalingType } : undefined,
          description: { value: descriptionHtml },
          source: { book: "Custom", revision: 1, rules: "2014" },
        },
      },
    };

    return normalized;
  }

  function getCharacterCustomSpells(c) {
    const arr = Array.isArray(c?.spellbook?.custom) ? c.spellbook.custom : [];
    return arr.map(normalizeCustomSpell);
  }

  function getSpellByIdForCharacter(c, id) {
    const sid = String(id || "");
    for (const s of getCharacterCustomSpells(c)) if (getSpellId(s) === sid) return s;
    return SPELLS_BY_ID.get(sid) || null;
  }

  function getMergedSpellsForCharacter(c) {
    return SPELLS_DB.concat(getCharacterCustomSpells(c));
  }

  function cleanSpellName(name) {
    const s = String(name || "").trim();
    return s.replace(/\s*\[[^\]]*\]\s*$/, "").trim();
  }

  function spellLevelTitle(level) {
    if (level === 0) return "Заговоры";
    if (level === 1) return "1-й уровень";
    return `${level}-й уровень`;
  }

  function spellLevelSub(level) {
    if (level === 0) return "Заговор";
    return `${level}-й уровень`;
  }

  function computeSpellNumbers(c) {
    const level = clamp(c.level, 1, 20);
    const pb = getProfBonus(level);

    const abilityKey = c.spellcasting?.ability || "";
    const scores = c.abilityScores || { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 };
    const mod = abilityKey ? abilityMod(scores[abilityKey] ?? 10) : 0;

    const dc = 8 + pb + mod;
    const atk = pb + mod;
    return { dc, atk, pb, mod, abilityKey };
  }

  function getSpellClasses(spell) {
    const cls = Array.isArray(spell?._raw?.classes) ? spell._raw.classes : [];
    return cls.filter((k) => SPELL_ALL_CLASSES.includes(k));
  }

  function hasConcentration(spell) {
    return !!spell?._raw?.system?.components?.concentration;
  }

  function hasRitual(spell) {
    return !!spell?._raw?.system?.components?.ritual;
  }

  function spellCastShort(spell) {
    const act = spell?._raw?.system?.activation || {};
    const type = String(act.type || "");
    const cost = safeInt(act.cost ?? 1, 1);
    if (type === "action") return "Д";
    if (type === "bonus") return "Б";
    if (type === "reaction") return "Р";
    if (type === "minute") return `${cost} мин`;
    if (type === "hour") return `${cost} ч`;
    if (type === "special") return "Особ.";
    return "—";
  }

  function spellCastText(spell) {
    const act = spell?._raw?.system?.activation || {};
    const type = String(act.type || "");
    const cost = safeInt(act.cost ?? 1, 1);
    const map = {
      action: "действие",
      bonus: "бонусное действие",
      reaction: "реакция",
      minute: "минута",
      hour: "час",
      special: "особое",
    };
    if (!type) return "—";
    if (type === "minute" || type === "hour") {
      const unit = map[type] || type;
      return `${cost} ${unit}${cost === 1 ? "" : "а"}`;
    }
    return map[type] || type;
  }

  function spellRangeShort(spell) {
    const r = spell?._raw?.system?.range || {};
    const units = String(r.units || "");
    const val = r.value;
    if (units === "self") return "На себя";
    if (units === "touch") return "Касание";
    if (units === "sight") return "Видимость";
    if (units === "any") return "Любая";
    if (units === "ft") return `${safeInt(val ?? 0, 0)} футов`;
    if (units === "mile") return `${safeInt(val ?? 0, 0)} миль`;
    if (units === "spec") return "Особ.";
    if (Number.isFinite(val) && units) return `${val} ${units}`;
    return "—";
  }

  function spellRangeText(spell) {
    return spellRangeShort(spell);
  }

  function spellDurationText(spell) {
    const d = spell?._raw?.system?.duration || {};
    const units = String(d.units || "");
    const val = d.value;
    const conc = hasConcentration(spell);

    let main = "—";
    if (units === "inst") main = "мгновенная";
    else if (units === "round") main = `${safeInt(val ?? 0, 0)} раунд(ов)`;
    else if (units === "minute") main = `${safeInt(val ?? 0, 0)} мин`;
    else if (units === "hour") main = `${safeInt(val ?? 0, 0)} ч`;
    else if (units === "day") main = `${safeInt(val ?? 0, 0)} дн`;
    else if (units === "perm") main = "пока не рассеется";
    else if (units === "permUntil") main = "пока не рассеется или не будет";
    else if (units === "special") main = "особая";
    else if (units === "spec") main = "особая";
    else if (Number.isFinite(val) && units) main = `${val} ${units}`;

    return conc ? `Концентрация, до ${main}` : main;
  }

  function spellComponentsText(spell) {
    const comp = spell?._raw?.system?.components || {};
    const mats = spell?._raw?.system?.materials?.value || spell?.components?.materials?.value || "";
    const parts = [];
    if (comp.vocal) parts.push("вербальный");
    if (comp.somatic) parts.push("соматический");
    if (comp.material) {
      if (mats) parts.push(`материальный (${String(mats).trim()})`);
      else parts.push("материальный");
    }
    return parts.length ? parts.join(", ") : "—";
  }

  function getBaseDamageParts(spell) {
    const parts = spell?._raw?.system?.damage?.parts;
    if (!Array.isArray(parts) || !parts.length) return [];
    return parts.map((p) => String(Array.isArray(p) ? p[0] : "")).filter(Boolean);
  }

  function parseDice(dice) {
    const m = String(dice || "").trim().match(/^(\d+)d(\d+)$/i);
    if (!m) return null;
    return { n: safeInt(m[1], 0), d: safeInt(m[2], 0) };
  }

  function formatDice(n, d) {
    if (!n || !d) return "";
    return `${n}d${d}`;
  }

  function cantripMultiplier(charLevel) {
    if (charLevel >= 17) return 4;
    if (charLevel >= 11) return 3;
    if (charLevel >= 5) return 2;
    return 1;
  }

  function applyCantripScaling(diceStr, charLevel) {
    const p = parseDice(diceStr);
    if (!p) return diceStr;
    const mult = cantripMultiplier(charLevel);
    return formatDice(p.n * mult, p.d);
  }

  function resolveSpellFormulaTokens(formula, c) {
    const raw = String(formula || "").trim();
    if (!raw) return "";
    const { mod, pb, atk, dc } = computeSpellNumbers(c);
    return raw
      .replace(/@mod\b/gi, String(mod))
      .replace(/@prof\b/gi, String(pb))
      .replace(/@atk\b/gi, String(atk))
      .replace(/@dc\b/gi, String(dc))
      .replace(/\+\s*-\s*(\d+)/g, "- $1")
      .replace(/-\s*-\s*(\d+)/g, "+ $1")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  function splitLeadingDiceFormula(formula) {
    const s = String(formula || "").trim();
    const m = s.match(/^(\d+d\d+)(.*)$/i);
    if (!m) return null;
    return { dice: m[1], tail: m[2] || "" };
  }

  function applyCantripScalingToFormula(formula, c, charLevel) {
    const parts = splitLeadingDiceFormula(formula);
    if (!parts) return resolveSpellFormulaTokens(formula, c);
    const scaledDice = applyCantripScaling(parts.dice, charLevel);
    const tail = resolveSpellFormulaTokens(parts.tail, c);
    return `${scaledDice}${tail}`.trim();
  }

  function applySlotScaling(baseDiceStr, scalingFormula, slotDelta) {
    const base = parseDice(baseDiceStr);
    const inc = parseDice(scalingFormula);
    if (!base || !inc || slotDelta <= 0) return baseDiceStr;
    // Add dice counts (common SRD behavior)
    const newN = base.n + inc.n * slotDelta;
    return formatDice(newN, base.d);
  }

  function applySlotScalingToFormula(baseFormula, scalingFormula, slotDelta, c) {
    const base = splitLeadingDiceFormula(baseFormula);
    const inc = splitLeadingDiceFormula(scalingFormula);
    if (!base || !inc || slotDelta <= 0) return resolveSpellFormulaTokens(baseFormula, c);
    const scaledDice = applySlotScaling(base.dice, inc.dice, slotDelta);
    const tail = resolveSpellFormulaTokens(base.tail, c);
    return `${scaledDice}${tail}`.trim();
  }

  function getSpellDamageDice(spell, c, slotLevel = null) {
    const charLevel = clamp(c.level, 1, 20);
    const baseParts = getBaseDamageParts(spell);
    if (!baseParts.length) return "—";

    const scaling = spell?.scaling || spell?._raw?.system?.scaling || null;
    const type = String(scaling?.type || "");
    const formula = String(scaling?.formula || "");

    const baseSpellLevel = safeInt(spell.level ?? spell?._raw?.system?.level ?? 0, 0);

    // Cantrip scaling (by character level)
    if (baseSpellLevel === 0 || type === "cantrip") {
      const mult = cantripMultiplier(charLevel);
      return baseParts.map((d) => {
        if (formula) {
          const base = splitLeadingDiceFormula(d);
          const inc = splitLeadingDiceFormula(formula);
          if (base && inc) {
            const scaledDice = formatDice(parseDice(base.dice).n + parseDice(inc.dice).n * Math.max(0, mult - 1), parseDice(base.dice).d);
            const tail = resolveSpellFormulaTokens(base.tail, c);
            return `${scaledDice}${tail}`.trim();
          }
        }
        return applyCantripScalingToFormula(d, c, charLevel);
      }).join(" + ");
    }

    // Slot scaling (by chosen slot level)
    if (type === "slot" && slotLevel != null) {
      const chosen = safeInt(slotLevel, baseSpellLevel);
      const delta = Math.max(0, chosen - baseSpellLevel);
      if (delta > 0 && formula) {
        const scaledFirst = applySlotScalingToFormula(baseParts[0], formula, delta, c);
        const rest = baseParts.slice(1).map((part) => resolveSpellFormulaTokens(part, c));
        return [scaledFirst].concat(rest).join(" + ");
      }
    }

    // Default: base dice/formula
    return baseParts.map((part) => resolveSpellFormulaTokens(part, c)).join(" + ");
  }

  function getSpellSaveOrAttackText(spell, c) {
    const sys = spell?._raw?.system || {};
    const actionType = String(sys.actionType || "");
    const { dc, atk } = computeSpellNumbers(c);

    if (actionType === "save") {
      const abil = String(sys.save?.ability || "");
      const lab = SPELL_SAVE_LABELS[abil] || "—";
      return `${lab} ${dc}`;
    }

    // Spell attacks: ranged/melee spell attack (rsak/msak)
    if (actionType === "rsak" || actionType === "msak" || actionType === "rpak" || actionType === "mpak") {
      return `${atk >= 0 ? "+" : ""}${atk}`;
    }

    return "—";
  }

  function getSpellSchoolText(spell) {
    const code = String(spell?._raw?.system?.school || "");
    return SPELL_SCHOOL_LABELS[code] || code || "—";
  }

  function sortSpellsAlphaRu(a, b) {
    const an = cleanSpellName(a?.name);
    const bn = cleanSpellName(b?.name);
    return an.localeCompare(bn, "ru");
  }

  // ===== Spells: state & rendering =====

  let spellsFilterState = { level: "all", k: false, r: false };
  const spentSlots = {}; // session-only: { "1": Set(idx), ... }

  function getKnownSpellIds(c) {
    const arr = Array.isArray(c?.spellbook?.known) ? c.spellbook.known : [];
    return arr.map(String).filter(Boolean);
  }

  function getKnownSpells(c) {
    const ids = new Set(getKnownSpellIds(c));
    const out = [];
    for (const id of ids) {
      const s = getSpellByIdForCharacter(c, id);
      if (s) out.push(s);
    }
    return out;
  }

  function ensureSpentSet(level) {
    const key = String(level);
    if (!spentSlots[key]) spentSlots[key] = new Set();
    return spentSlots[key];
  }

  function renderSpellsFilters(c) {
    if (!spellsFilters) return;

    const known = getKnownSpells(c);
    const levelSet = new Set();
    for (const s of known) {
      const lvl = safeInt(s.level ?? s?._raw?.system?.level ?? 0, 0);
      levelSet.add(lvl);
    }

    const levels = Array.from(levelSet).filter((n) => n >= 0 && n <= 9).sort((a, b) => a - b);

    // "Все" + только уровни, которые реально есть в известных + К/Р
    const items = [{ key: "all", label: "Все" }]
      .concat(levels.map((n) => ({ key: String(n), label: String(n) })))
      .concat([{ key: "k", label: "К" }, { key: "r", label: "Р" }]);

    // если выбранный уровень исчез — откатываемся на "Все"
    if (spellsFilterState.level !== "all" && /^\d+$/.test(spellsFilterState.level)) {
      const cur = safeInt(spellsFilterState.level, 0);
      if (!levelSet.has(cur)) spellsFilterState.level = "all";
    }

    spellsFilters.innerHTML = "";
    for (const it of items) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "spellFilterBtn";
      btn.setAttribute("data-filter", it.key);
      btn.textContent = it.label;

      const isActive =
        (it.key === "all" && spellsFilterState.level === "all") ||
        (/^\d+$/.test(it.key) && spellsFilterState.level === it.key) ||
        (it.key === "k" && spellsFilterState.k) ||
        (it.key === "r" && spellsFilterState.r);

      btn.classList.toggle("is-active", isActive);
      spellsFilters.appendChild(btn);
    }
  }

  function renderSpellsList(c) {
    if (!spellsList) return;

    const known = getKnownSpells(c).sort(sortSpellsAlphaRu);

    let filtered = known.slice();

    if (spellsFilterState.level !== "all") {
      const lvl = safeInt(spellsFilterState.level, 0);
      filtered = filtered.filter((s) => safeInt(s.level ?? s?._raw?.system?.level ?? 0, 0) === lvl);
    }
    if (spellsFilterState.k) filtered = filtered.filter((s) => hasConcentration(s));
    if (spellsFilterState.r) filtered = filtered.filter((s) => hasRitual(s));

    const groups = new Map(); // lvl -> spells
    for (const s of filtered) {
      const lvl = safeInt(s.level ?? s?._raw?.system?.level ?? 0, 0);
      if (!groups.has(lvl)) groups.set(lvl, []);
      groups.get(lvl).push(s);
    }
    // levels to render (always 0-9, or a single chosen level)
    const lvlsToRender =
      spellsFilterState.level === "all"
        ? Array.from({ length: 10 }, (_, i) => i)
        : [/^\d+$/.test(spellsFilterState.level) ? safeInt(spellsFilterState.level, 0) : 0];

    spellsList.innerHTML = "";

    for (const lvl of lvlsToRender) {
      const wrap = document.createElement("div");
            wrap.className = "spellLevel";

      const head = document.createElement("div");
      head.className = "spellLevel__head";
      head.innerHTML = `
        <div class="spellLevel__title">${spellLevelTitle(lvl)}</div>
        <div class="spellSlots" data-slotlvl="${lvl}"></div>
      `;
      wrap.appendChild(head);

      const line = document.createElement("div");
      line.className = "spellLevel__line";
      wrap.appendChild(line);

      const cols = document.createElement("div");
      cols.className = "spellCols";
      cols.setAttribute("aria-hidden", "true");
      cols.innerHTML = `
        <div class="spellCols__spacer"></div>
        <span class="sIcon sIcon--time"></span>
        <span class="sIcon sIcon--range"></span>
        <span class="sIcon sIcon--check"></span>
        <span class="sIcon sIcon--dice"></span>
      `;
      wrap.appendChild(cols);

      // slot dots (only for levels 1-9)
      const slotsBox = head.querySelector(".spellSlots");
      slotsBox.innerHTML = "";
      if (lvl >= 1 && lvl <= 9) {
        const max = safeInt(c.spellcasting?.slots?.[String(lvl)] ?? 0, 0);
        const used = ensureSpentSet(lvl);
        for (let i = 0; i < max; i++) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "slotDot";
          b.setAttribute("data-slotdot", String(i));
          b.setAttribute("data-slotlvl", String(lvl));
          b.classList.toggle("is-used", used.has(i));
          slotsBox.appendChild(b);
        }
      }

      const list = document.createElement("div");
      list.className = "spellCards";

      for (const s of (groups.get(lvl) || []).sort(sortSpellsAlphaRu)) {
        const id = getSpellId(s);
        const name = cleanSpellName(s.name);
        const tagK = hasConcentration(s) ? `<span class="spellTag" aria-label="Концентрация">К</span>` : "";
        const tagR = hasRitual(s) ? `<span class="spellTag" aria-label="Ритуал">Р</span>` : "";

        const sub = spellLevelSub(lvl);
        const t = spellCastShort(s);
        const r = spellRangeShort(s);
        const check = getSpellSaveOrAttackText(s, c);
        const dmg = getSpellDamageDice(s, c);

        const card = document.createElement("button");
        card.type = "button";
        card.className = "spellCard";
        card.setAttribute("data-spell", id);
        card.innerHTML = `
          <div class="spellCard__nameRow">
            <div class="spellCard__name">${escapeHtml(name)}</div>
            ${tagK}${tagR}
          </div>

          <div class="spellCard__row">
            <div class="spellCard__lvl">${escapeHtml(sub)}</div>
            <div class="spellCell spellCell--t">${escapeHtml(t)}</div>
            <div class="spellCell spellCell--r">${escapeHtml(r)}</div>
            <div class="spellCell spellCell--c ${check === "—" ? "is-dash" : ""}">${escapeHtml(check)}</div>
            <div class="spellCell spellCell--d ${dmg === "—" ? "is-dash" : ""}">${escapeHtml(dmg)}</div>
          </div>
        `;
        list.appendChild(card);
      }

      wrap.appendChild(list);
      spellsList.appendChild(wrap);
    }
  }

  function syncSpellsScreenUI(c) {
    if (!spellsSaveTop || !spellsAtkTop) return;
    const { dc, atk } = computeSpellNumbers(c);
    spellsSaveTop.textContent = String(dc);
    spellsAtkTop.textContent = `${atk >= 0 ? "+" : ""}${atk}`;

    renderSpellsFilters(c);
    renderSpellsList(c);
  }

  function syncSpellDerivedUI(c) {
    if (!c) return;
    syncSpellUI(c);
    syncSpellsScreenUI(c);

    if (spellViewModal && !spellViewModal.classList.contains("modal--hidden") && spellViewState.id) {
      const prevSlot = spellViewState.slot;
      openSpellView(c, spellViewState.id);
      spellViewState.slot = prevSlot;
      const spell = getSpellByIdForCharacter(c, String(spellViewState.id));
      if (spell) {
        const dmg = getSpellDamageDice(spell, c, spellViewState.slot);
        spellViewDamage.textContent = dmg === "—" ? "Урон: —" : `Урон: ${dmg}`;
        spellViewSlots.querySelectorAll("[data-slotpick]").forEach((b) => {
          b.classList.toggle("is-active", safeInt(b.getAttribute("data-slotpick"), 0) === safeInt(spellViewState.slot, 0));
        });
      }
    }
  }

  // ===== Spells: settings classes =====

  function renderSpellClassesUI(c) {
    if (!spellClassesChips || !classesPopover) return;

    const selected = new Set((Array.isArray(c?.spellbook?.classes) ? c.spellbook.classes : []).filter((k) => SPELL_ALLOWED_CLASSES.includes(k)));

    if (spellClassesBtn) spellClassesBtn.classList.toggle("has-chips", selected.size > 0);

    // chips
    spellClassesChips.innerHTML = "";
    for (const k of SPELL_ALLOWED_CLASSES) {
      if (!selected.has(k)) continue;
      const chip = document.createElement("div");
      chip.className = "spellChip";
      chip.setAttribute("data-class", k);
      chip.innerHTML = `
        <span>${escapeHtml(SPELL_CLASS_LABELS[k] || k)}</span>
        <button class="spellChip__x" type="button" aria-label="Удалить" data-classx="${k}">×</button>
      `;
      spellClassesChips.appendChild(chip);
    }

    // popover
    classesPopover.innerHTML = "";
    for (const k of SPELL_ALLOWED_CLASSES) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "popItem";
      btn.setAttribute("data-classkey", k);
      btn.innerHTML = `<span class="popItem__check" aria-hidden="true"></span><span class="popItem__text">${escapeHtml(SPELL_CLASS_LABELS[k] || k)}</span>`;
      btn.classList.toggle("is-active", selected.has(k));
      classesPopover.appendChild(btn);
    }
  }

  function toggleClassesPopover() {
    if (!classesPopover || !spellClassesBtn) return;
    const isHidden = classesPopover.classList.contains("popover--hidden");
    closeAllPopovers();
    if (isHidden) {
      classesPopover.classList.remove("popover--hidden");
      spellClassesBtn.setAttribute("aria-expanded", "true");
    } else {
      classesPopover.classList.add("popover--hidden");
      spellClassesBtn.setAttribute("aria-expanded", "false");
    }
  }

  // ===== Spells: view modal =====

  let spellViewState = { id: null, slot: null };

  function openSpellView(c, spellId) {
    const spell = getSpellByIdForCharacter(c, String(spellId));
    if (!spell) return;

    const name = cleanSpellName(spell.name);
    const lvl = safeInt(spell.level ?? spell?._raw?.system?.level ?? 0, 0);
    const school = getSpellSchoolText(spell);

    spellViewState.id = String(spellId);
    spellViewState.slot = lvl;

    spellViewTitle.textContent = name;
    spellViewSub.textContent = lvl === 0 ? `Заговор, ${school}` : `${lvl}-й уровень, ${school}`;

    spellViewCast.textContent = `Время сотворения: ${spellCastText(spell)}`;
    spellViewRange.textContent = `Дистанция: ${spellRangeText(spell)}`;
    spellViewDuration.textContent = `Длительность: ${spellDurationText(spell)}`;
    spellViewComponents.textContent = `Компоненты: ${spellComponentsText(spell)}`;

    // damage line (computed)
    const dmg = getSpellDamageDice(spell, c, spellViewState.slot);
    spellViewDamage.textContent = dmg === "—" ? "Урон: —" : `Урон: ${dmg}`;

    // slot selector (only if upcast scaling exists and character has higher slots)
    const scaling = spell?.scaling || spell?._raw?.system?.scaling || null;
    const type = String(scaling?.type || "");
    spellViewSlots.innerHTML = "";
    if (spellViewSlotRow) spellViewSlotRow.style.display = "none";

    if (lvl >= 1) {
      const maxSlot = Math.max(
        lvl,
        ...Array.from({ length: 9 }, (_, i) => i + 1).filter((L) => safeInt(c.spellcasting?.slots?.[String(L)] ?? 0, 0) > 0)
      );

      if (type === "slot" && maxSlot > lvl) {
        if (spellViewSlotRow) spellViewSlotRow.style.display = "flex";
        for (let sLvl = lvl; sLvl <= maxSlot; sLvl++) {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "spellSlotChip";
          b.setAttribute("data-slotpick", String(sLvl));
          b.textContent = String(sLvl);
          b.classList.toggle("is-active", sLvl === spellViewState.slot);
          spellViewSlots.appendChild(b);
        }
      }
    }

    const desc = String(spell?._raw?.system?.description?.value || "");

    // Convert common Foundry/HTML markup to plain text, preserving spacing/paragraphs.
    const plain = desc
      // line/paragraph breaks
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h\d)>/gi, "\n")
      .replace(/<(p|div|ul|ol|li|h\d)[^>]*>/gi, "")
      // inline rolls like [[/r 2d6]] or [[2d6]] -> 2d6
      .replace(/\[\[\s*\/r\s*([^\]]+?)\s*\]\]/gi, "$1")
      .replace(/\[\[\s*([^\]]+?)\s*\]\]/g, "$1")
      // strip remaining tags
      .replace(/<[^>]*>/g, "")
      // normalize spacing
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s{2,}/g, " ")
      .trim();

    spellViewDesc.textContent = plain;

    // class badges (colored)
    spellViewClasses.innerHTML = "";
    for (const ck of getSpellClasses(spell)) {
      const b = document.createElement("div");
      b.className = `spellClassBadge spellClassBadge--${ck}`;
      b.textContent = (SPELL_CLASS_LABELS[ck] || ck).toUpperCase();
      spellViewClasses.appendChild(b);
    }

    openModal("spellView");
  }

  // ===== Spells: prepare modal =====

  let spellPrepActiveTab = "known";

  function setSpellPrepTab(tab) {
    spellPrepActiveTab = tab;
    spellPrepTabKnown.classList.toggle("is-active", tab === "known");
    spellPrepTabAll.classList.toggle("is-active", tab === "all");
    spellPrepTabCreated?.classList.toggle("is-active", tab === "created");
    spellPrepTabKnown.setAttribute("aria-selected", tab === "known" ? "true" : "false");
    spellPrepTabAll.setAttribute("aria-selected", tab === "all" ? "true" : "false");
    spellPrepTabCreated?.setAttribute("aria-selected", tab === "created" ? "true" : "false");
    spellPrepKnownPane.classList.toggle("is-active", tab === "known");
    spellPrepAllPane.classList.toggle("is-active", tab === "all");
    spellPrepCreatedPane?.classList.toggle("is-active", tab === "created");
  }

  function getAvailableSpellsByClasses(c) {
    const selected = new Set((Array.isArray(c?.spellbook?.classes) ? c.spellbook.classes : []).filter((k) => SPELL_ALLOWED_CLASSES.includes(k)));

    if (spellClassesBtn) spellClassesBtn.classList.toggle("has-chips", selected.size > 0);
    if (!selected.size) return [];
    return getMergedSpellsForCharacter(c)
      .filter((s) => getSpellClasses(s).some((k) => selected.has(k)))
      .sort(sortSpellsAlphaRu);
  }

  function renderPrepPane(c) {
    if (!spellPrepKnownPane || !spellPrepAllPane || !spellPrepCreatedPane) return;

    const knownIds = new Set(getKnownSpellIds(c));
    const knownSpells = getKnownSpells(c).sort(sortSpellsAlphaRu);
    const allAvail = getAvailableSpellsByClasses(c);
    const createdSpells = getCharacterCustomSpells(c).filter((s) => !knownIds.has(getSpellId(s))).sort(sortSpellsAlphaRu);

    spellPrepKnownCount.textContent = String(knownSpells.length);
    spellPrepAllCount.textContent = String(allAvail.length);
    spellPrepCreatedCount.textContent = String(createdSpells.length);

    function buildPane(target, spellsArr, mode) {
      target.innerHTML = "";
      if (!spellsArr.length) {
        const empty = document.createElement("div");
        empty.className = "emptyText";
        empty.textContent = mode === "known" ? "Нет известных заклинаний" : mode === "created" ? "Нет созданных заклинаний" : "Выберите классы в настройках";
        target.appendChild(empty);
        return;
      }

      const groups = new Map();
      for (const s of spellsArr) {
        const lvl = safeInt(s.level ?? s?._raw?.system?.level ?? 0, 0);
        if (!groups.has(lvl)) groups.set(lvl, []);
        groups.get(lvl).push(s);
      }
      const lvls = Array.from(groups.keys()).sort((a,b)=>a-b);
      for (const lvl of lvls) {
        const sec = document.createElement("div");
        sec.className = "spellPrepLevel";
        sec.innerHTML = `<div class="spellPrepLevel__title">${spellLevelTitle(lvl)}</div>`;
        for (const s of (groups.get(lvl) || []).sort(sortSpellsAlphaRu)) {
          const id = getSpellId(s);
          const name = cleanSpellName(s.name);
          const sub = spellLevelSub(lvl);
          const row = document.createElement("div");
          row.className = "spellPrepRow";
          row.setAttribute("data-spellview", id);
          const isKnown = knownIds.has(id);
          const primaryText = mode === "known" ? "Удалить" : "Изучить";
          row.innerHTML = `
            <div class="spellPrepRow__left" data-spellview="${id}">
              <div class="spellPrepRow__name">${escapeHtml(name)}${hasRitual(s) ? ` <span class="spellTag">Р</span>` : ""}${hasConcentration(s) ? ` <span class="spellTag">К</span>` : ""}</div>
              <div class="spellPrepRow__sub">${escapeHtml(sub)}</div>
            </div>
            <div class="spellPrepRow__actions">
              <button class="spellPrepRow__btn ${(isKnown && mode === "all") ? "is-on" : ""}" type="button" data-prep="${mode}" data-spell="${id}">
                ${primaryText}
              </button>
            </div>
          `;
          sec.appendChild(row);
        }
        target.appendChild(sec);
      }
    }

    buildPane(spellPrepKnownPane, knownSpells, "known");
    buildPane(spellPrepAllPane, allAvail, "all");
    buildPane(spellPrepCreatedPane, createdSpells, "created");
  }

  function openSpellPrep(c) {
    setSpellPrepTab("known");
    renderPrepPane(c);
    openModal("spellPrep");
  }


  // ===== Create custom spell =====

  const CUSTOM_SPELL_CLASS_KEYS = ["bard","barbarian","fighter","wizard","druid","cleric","artificer","warlock","monk","paladin","rogue","ranger","sorcerer"];
  let spellCreateState = { compV: false, compS: false, compM: false, concentration: false, ritual: false, classes: [] };

  function renderSpellCreateClassField() {
    if (!scClassesPopover || !scClassesChips || !scClassesBtn) return;
    const selected = new Set(spellCreateState.classes || []);
    scClassesBtn.classList.toggle("has-chips", selected.size > 0);
    scClassesChips.innerHTML = "";
    for (const key of selected) {
      const chip = document.createElement("div");
      chip.className = `spellChip spellChip--createClass spellChip--createClass-${key}`;
      chip.innerHTML = `<span>${escapeHtml((SPELL_CLASS_LABELS[key] || key).toUpperCase())}</span><button type="button" class="spellChip__x" data-scx="${key}" aria-label="Удалить">×</button>`;
      scClassesChips.appendChild(chip);
    }
    scClassesPopover.innerHTML = "";
    for (const key of CUSTOM_SPELL_CLASS_KEYS) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "popItem popItem--check";
      row.setAttribute("data-scclass", key);
      row.classList.toggle("is-active", selected.has(key));
      row.innerHTML = `<span class="popItem__mark">✓</span><span class="popItem__text">${escapeHtml(SPELL_CLASS_LABELS[key] || key)}</span>`;
      scClassesPopover.appendChild(row);
    }
  }

  function syncSpellCreateStates() {
    if (scMaterialText) scMaterialText.disabled = !spellCreateState.compM;
    if (scMaterialText && !spellCreateState.compM) scMaterialText.value = "";
    const areaOn = scTargetType && !["none", "self", "object"].includes(scTargetType.value);
    if (scTargetSize) scTargetSize.disabled = !areaOn;
    if (scTargetUnit) scTargetUnit.disabled = !areaOn;
    if (!areaOn) { if (scTargetSize) scTargetSize.value = ""; if (scTargetUnit) scTargetUnit.value = "ft"; }
    const rangeOn = scRangeType && ["ft", "mile"].includes(scRangeType.value);
    if (scRangeAmount) scRangeAmount.disabled = !rangeOn;
    if (!rangeOn && scRangeAmount) scRangeAmount.value = "";
    const durOn = scDurationType && ["day", "minute"].includes(scDurationType.value);
    if (scDurationAmount) scDurationAmount.disabled = !durOn;
    if (!durOn && scDurationAmount) scDurationAmount.value = "";
    const saveOn = scActionType && scActionType.value === "save";
    if (scSaveAbility) scSaveAbility.disabled = !saveOn;
    if (scSaveReq) scSaveReq.classList.toggle("req--hidden", !saveOn);
    if (!saveOn && scSaveAbility) scSaveAbility.value = "";
  }

  function resetSpellCreateForm() {
    spellCreateState = { compV: false, compS: false, compM: false, concentration: false, ritual: false, classes: [] };
    if (scName) scName.value = "";
    if (scLevel) scLevel.value = "0";
    if (scSchool) scSchool.value = "evo";
    if (scCastCount) scCastCount.value = "1";
    if (scCastType) scCastType.value = "bonus";
    if (scCastCondition) scCastCondition.value = "";
    if (scTargetType) scTargetType.value = "none";
    if (scTargetSize) scTargetSize.value = "";
    if (scTargetUnit) scTargetUnit.value = "ft";
    if (scRangeType) scRangeType.value = "sight";
    if (scRangeAmount) scRangeAmount.value = "";
    if (scDurationType) scDurationType.value = "";
    if (scDurationAmount) scDurationAmount.value = "";
    if (scActionType) scActionType.value = "";
    if (scSaveAbility) scSaveAbility.value = "";
    if (scDamageDice) scDamageDice.value = "";
    if (scDamageType) scDamageType.value = "";
    if (scScalingType) scScalingType.value = "";
    if (scScalingDice) scScalingDice.value = "";
    if (scDescription) scDescription.value = "";
    if (scMaterialText) scMaterialText.value = "";
    document.querySelectorAll('#scCompChips [data-chip], #scFlagsChips [data-flag]').forEach((b)=>b.classList.remove('is-active'));
    renderSpellCreateClassField();
    syncSpellCreateStates();
  }

  function toggleSpellCreateClassesPopover() {
    if (!scClassesPopover || !scClassesBtn) return;
    const hidden = scClassesPopover.classList.contains('popover--hidden');
    closeAllPopovers();
    if (hidden) {
      scClassesPopover.classList.remove('popover--hidden');
      scClassesBtn.setAttribute('aria-expanded', 'true');
    } else {
      scClassesPopover.classList.add('popover--hidden');
      scClassesBtn.setAttribute('aria-expanded', 'false');
    }
  }

  function collectCustomSpellForm() {
    return {
      name: String(scName?.value || '').trim(),
      level: safeInt(scLevel?.value, 0),
      school: String(scSchool?.value || 'evo'),
      compV: !!spellCreateState.compV,
      compS: !!spellCreateState.compS,
      compM: !!spellCreateState.compM,
      materialText: String(scMaterialText?.value || '').trim(),
      castCount: safeInt(scCastCount?.value, 1),
      castType: String(scCastType?.value || 'action'),
      castCondition: String(scCastCondition?.value || '').trim(),
      targetType: String(scTargetType?.value || 'none'),
      targetSize: scTargetSize?.value || '',
      targetUnit: String(scTargetUnit?.value || 'ft'),
      rangeType: String(scRangeType?.value || 'sight'),
      rangeAmount: scRangeAmount?.value || '',
      durationType: String(scDurationType?.value || ''),
      durationAmount: scDurationAmount?.value || '',
      concentration: !!spellCreateState.concentration,
      ritual: !!spellCreateState.ritual,
      actionType: String(scActionType?.value || ''),
      saveAbility: String(scSaveAbility?.value || ''),
      damageDice: String(scDamageDice?.value || '').trim(),
      damageType: String(scDamageType?.value || ''),
      scalingType: String(scScalingType?.value || ''),
      scalingDice: String(scScalingDice?.value || '').trim(),
      description: String(scDescription?.value || '').trim(),
      classes: Array.from(new Set((spellCreateState.classes || []).filter((k) => CUSTOM_SPELL_CLASS_KEYS.includes(k)))),
    };
  }

  function validateCustomSpellForm(data) {
    if (!data.name) return 'Заполни название';
    if (!data.castCount) return 'Заполни время сотворения';
    if (!data.rangeType) return 'Заполни дистанцию';
    if (!data.durationType) return 'Заполни длительность';
    if (!data.actionType) return 'Заполни тип действия';
    if (data.actionType === 'save' && !data.saveAbility) return 'Выбери характеристику';
    if (!data.description) return 'Заполни описание';
    if (data.compM && !data.materialText) return 'Заполни материальный компонент';
    return '';
  }

  resetSpellCreateForm();
  renderSpellCreateClassField();

function persistActive() {
  const idx = characters.findIndex((x) => x.id === activeId);
  if (idx < 0) return;
  characters[idx] = ensureDefaults(characters[idx]);
  saveCharacters();

  // keep derived values in sync with stats
  const c = characters[idx];
  syncInventoryUI(c);
  syncAttacksUI(c);
  syncSensesUI(c);
}
  // ===== Popovers/Modals helpers =====

function closeAllPopovers() {
    if (typeof jsonPopover !== "undefined" && jsonPopover) {
      jsonPopover.classList.add("popover--hidden");
    }
    if (typeof jsonBtn !== "undefined" && jsonBtn) {
      jsonBtn.setAttribute("aria-expanded", "false");
    }

    if (typeof coinDenomPopover !== "undefined" && coinDenomPopover) {
      coinDenomPopover.classList.add("popover--hidden");
    }
    if (typeof coinDenomBtn !== "undefined" && coinDenomBtn) {
      coinDenomBtn.setAttribute("aria-expanded", "false");
    }

    if (typeof abilityPopover !== "undefined" && abilityPopover) {
      abilityPopover.classList.add("popover--hidden");
    }
    if (typeof spellAbilityBtn !== "undefined" && spellAbilityBtn) {
      spellAbilityBtn.setAttribute("aria-expanded", "false");
    }

    if (typeof classesPopover !== "undefined" && classesPopover) {
      classesPopover.classList.add("popover--hidden");
    }
    if (typeof spellClassesBtn !== "undefined" && spellClassesBtn) {
      spellClassesBtn.setAttribute("aria-expanded", "false");
    }
    if (typeof scClassesPopover !== "undefined" && scClassesPopover) {
      scClassesPopover.classList.add("popover--hidden");
    }
    if (typeof scClassesBtn !== "undefined" && scClassesBtn) {
      scClassesBtn.setAttribute("aria-expanded", "false");
    }

    // ⬇️ ВСЁ что у тебя было ниже (закрытие других поповеров) — вставь сюда 1в1 как было
}
function openModal(which) {
    if (which === "xp") xpModal.classList.remove("modal--hidden");
    if (which === "hp") hpModal.classList.remove("modal--hidden");
    if (which === "coins") coinsModal.classList.remove("modal--hidden");
    if (which === "settings") settingsModal.classList.remove("modal--hidden");
    if (which === "spell") spellModal.classList.remove("modal--hidden");
    if (which === "spellView") spellViewModal.classList.remove("modal--hidden");
    if (which === "spellPrep") spellPrepModal.classList.remove("modal--hidden");
    if (which === "spellCreate") spellCreateModal?.classList.remove("modal--hidden");
    if (which === "portrait") portraitModal.classList.remove("modal--hidden");
    if (which === "ac") acModal.classList.remove("modal--hidden");
    if (which === "conditions") conditionsModal.classList.remove("modal--hidden");
    if (which === "insp") inspModal.classList.remove("modal--hidden");
    if (which === "sections") sectionsModal.classList.remove("modal--hidden");
    if (which === "abilityEdit") abilityEditModal.classList.remove("modal--hidden");
    if (which === "skillEdit") skillEditModal.classList.remove("modal--hidden");
    if (which === "invItem") invItemModal?.classList.remove("modal--hidden");
    if (which === "atkAbility") atkAbilityModal?.classList.remove("modal--hidden");
    if (which === "senseProf") senseProfModal?.classList.remove("modal--hidden");
    if (which === "invNotes") invNotesModal?.classList.remove("modal--hidden");
if (which === "invCalc") invCalcModal?.classList.remove("modal--hidden");
    if (which === "invSell") invSellModal?.classList.remove("modal--hidden");
    if (which === "invLog") invLogModal?.classList.remove("modal--hidden");
    if (which === "persText") persTextModal?.classList.remove("modal--hidden");
    // visuals for header chevron
    if (which === "conditions") {
      conditionsBtn?.classList.add("is-open");
      conditionsBtn?.setAttribute("aria-expanded", "true");
    }
    if (which === "equipSlot") equipSlotModal?.classList.remove("modal--hidden");
    if (which === "equipItem") equipItemModal?.classList.remove("modal--hidden");
    if (which === "equipConfirm") equipConfirmModal?.classList.remove("modal--hidden");
    if (which === "equipRace") equipRaceModal?.classList.remove("modal--hidden");

  }
function closeModal(which) {
    if (which === "xp") xpModal.classList.add("modal--hidden");
    if (which === "hp") hpModal.classList.add("modal--hidden");
    if (which === "coins") coinsModal.classList.add("modal--hidden");
    if (which === "settings") settingsModal.classList.add("modal--hidden");
    if (which === "spell") spellModal.classList.add("modal--hidden");
    if (which === "spellView") spellViewModal.classList.add("modal--hidden");
    if (which === "spellPrep") spellPrepModal.classList.add("modal--hidden");
    if (which === "spellCreate") spellCreateModal?.classList.add("modal--hidden");
    if (which === "portrait") portraitModal.classList.add("modal--hidden");
    if (which === "ac") acModal.classList.add("modal--hidden");
    if (which === "conditions") conditionsModal.classList.add("modal--hidden");
    if (which === "insp") inspModal.classList.add("modal--hidden");
    if (which === "sections") sectionsModal.classList.add("modal--hidden");
    if (which === "abilityEdit") abilityEditModal.classList.add("modal--hidden");
    if (which === "skillEdit") skillEditModal.classList.add("modal--hidden");
    if (which === "invItem") invItemModal?.classList.add("modal--hidden");
    if (which === "atkAbility") atkAbilityModal?.classList.add("modal--hidden");
    if (which === "senseProf") senseProfModal?.classList.add("modal--hidden");
    if (which === "invNotes") invNotesModal?.classList.add("modal--hidden");
if (which === "invCalc") invCalcModal?.classList.add("modal--hidden");
    if (which === "invSell") invSellModal?.classList.add("modal--hidden");
    if (which === "invLog") invLogModal?.classList.add("modal--hidden");
    if (which === "persText") {
      persTextModal?.classList.add("modal--hidden");
      persEditingKey = "";
    }
    if (which === "conditions") {
      conditionsBtn?.classList.remove("is-open");
      conditionsBtn?.setAttribute("aria-expanded", "false");
    }

    if (which === "sections") {
      sectionBarBtn?.setAttribute("aria-expanded", "false");
    }
    if (which === "equipSlot") equipSlotModal?.classList.add("modal--hidden");
    if (which === "equipItem") equipItemModal?.classList.add("modal--hidden");
    if (which === "equipConfirm") equipConfirmModal?.classList.add("modal--hidden");
    if (which === "equipRace") equipRaceModal?.classList.add("modal--hidden");

  }
    function closeAllModals() {
    xpModal.classList.add("modal--hidden");
    hpModal.classList.add("modal--hidden");
    settingsModal.classList.add("modal--hidden");
    spellModal.classList.add("modal--hidden");
    spellViewModal.classList.add("modal--hidden");
    spellPrepModal.classList.add("modal--hidden");
    spellCreateModal?.classList.add("modal--hidden");
    portraitModal.classList.add("modal--hidden");
    acModal.classList.add("modal--hidden");
    conditionsModal.classList.add("modal--hidden");
    inspModal.classList.add("modal--hidden");
    sectionsModal.classList.add("modal--hidden");
    abilityEditModal.classList.add("modal--hidden");
    skillEditModal.classList.add("modal--hidden");
    invItemModal?.classList.add("modal--hidden");
    atkAbilityModal?.classList.add("modal--hidden");
    senseProfModal?.classList.add("modal--hidden");
    invNotesModal?.classList.add("modal--hidden");
invCalcModal?.classList.add("modal--hidden");
    persTextModal?.classList.add("modal--hidden");

    conditionsBtn?.classList.remove("is-open");
    conditionsBtn?.setAttribute("aria-expanded", "false");
    sectionBarBtn?.setAttribute("aria-expanded", "false");
    hideSensePassiveTip();
  }  
  
  // ===== Events =====
  
  document.addEventListener("click", () => closeAllPopovers());

  personalityLineInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const c = getCharacterById(activeId);
      if (!c) return;
      c.personality = c.personality || {};
      const key = String(input.getAttribute("data-pers-line") || "");
      c.personality[key] = String(input.value || "");
      persistActive();
    });
  });

  personalityBlockBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = String(btn.getAttribute("data-pers-open") || "");
      openPersonalityTextEditor(key);
    });
  });

  persTextSaveBtn?.addEventListener("click", savePersonalityTextEditor);

  jsonBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = jsonPopover.classList.contains("popover--hidden");
    closeAllPopovers();
    jsonPopover.classList.toggle("popover--hidden", !isHidden);
    jsonBtn.setAttribute("aria-expanded", String(isHidden));
  });

  exportBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (characters.length === 0) {
      showToast("Нет персонажей");
      return;
    }
    const activeCharacter = getCharacterById(activeId) || characters[0];
    downloadCharacterJson(activeCharacter);
    closeAllPopovers();
  });

  importBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    importFile.click();
  });

  importFile.addEventListener("change", async () => {
    const file = importFile.files && importFile.files[0];
    importFile.value = "";
    if (!file) return;
    await importCharacterJsonFile(file);
    closeAllPopovers();
  });

  addBtn.addEventListener("click", () => {
    if (characters.length >= MAX_CHARS) {
      showToast("Лимит 30 персонажей");
      return;
    }
    const c = ensureDefaults({ id: nowId() });
    characters.push(c);
    saveCharacters();
    renderList();
    showToast("Создан персонаж");
  });

  backToList.addEventListener("click", () => {
    openList();
    renderList();
  });

  charAvatarBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = avatarPopover.classList.contains("popover--hidden");
    closeAllPopovers();
    avatarPopover.classList.toggle("popover--hidden", !isHidden);
    charAvatarBtn.setAttribute("aria-expanded", String(isHidden));
  });

  openSettings.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    syncSettingsFields(c);

    // refresh active theme button
    applyTheme(localStorage.getItem(THEME_KEY) || document.documentElement.getAttribute("data-theme") || "molten");

    openModal("settings");
  });
  openPortrait.addEventListener("click", () => openModal("portrait"));
  // ===== CONDITIONS =====
  conditionsBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;

    renderConditionsModal(c);
    openModal("conditions");
  });

  function renderConditionsModal(c) {
    if (!conditionsList) return;

    const selected = new Set(Array.isArray(c.conditions) ? c.conditions : []);
    conditionsList.innerHTML = "";

    for (const row of CONDITIONS) {
      const item = document.createElement("div");
      item.className = "condItem" + (selected.has(row.key) ? " is-on" : "");
      item.setAttribute("data-key", row.key);
      item.setAttribute("data-open", "false");

      item.innerHTML = `
        <div class="condItem__top">
          <div class="condCheck" aria-hidden="true"></div>
          <img class="condIcon" src="${row.icon}" alt="" />
          <div class="condName">${escapeHtml(row.label)}</div>
          <img class="condChev" src="./assets/icons/chevron-down.svg" alt="" />
        </div>
        <div class="condDesc" aria-hidden="true" style="display:none;">${formatCondDesc(row.desc || "")}</div>
      `;
      conditionsList.appendChild(item);
    }

    // exhaustion
    const exh = clamp(safeInt(c.exhaustionLevel, 0), 0, 6);
    if (exhLevelValue) exhLevelValue.textContent = exh === 0 ? "--" : String(exh);

    document.querySelectorAll(".exhPill").forEach((b) => {
      const v = clamp(safeInt(b.getAttribute("data-exh"), 0), 0, 6);
      b.classList.toggle("is-active", v === exh);
    });

    // keep exhaustion row open state as-is (do not reset)
  }

  // click on condition rows
  conditionsList?.addEventListener("click", (e) => {
    const item = e.target.closest(".condItem");
    if (!item) return;

    const key = item.getAttribute("data-key");
    if (!key) return;

    const c = getCharacterById(activeId);
    if (!c) return;

    const clickedCheck = e.target.closest(".condCheck");
    const clickedTop = e.target.closest(".condItem__top");

    // 1) click on check circle => toggle condition ON/OFF
    if (clickedCheck) {
      const cur = new Set(Array.isArray(c.conditions) ? c.conditions : []);
      if (cur.has(key)) cur.delete(key);
      else cur.add(key);

      c.conditions = Array.from(cur);
      persistActive();

      item.classList.toggle("is-on", cur.has(key));
      syncHeaderPart2(c);
      return;
    }

    // 2) click on the top row (including chevron) => toggle description
    if (clickedTop) {
      const desc = item.querySelector(".condDesc");
      const isOpen = !item.classList.contains("is-open");

      item.classList.toggle("is-open", isOpen);
      item.setAttribute("data-open", String(isOpen));

      if (desc) {
        desc.style.display = isOpen ? "grid" : "none";
        desc.setAttribute("aria-hidden", String(!isOpen));
      }
    }
  });
  // exhaustion open/close
  exhToggle?.addEventListener("click", () => {
    const isOpen = exhRow.classList.toggle("is-open");
    exhToggle.setAttribute("aria-expanded", String(isOpen));
    const body = exhRow.querySelector(".exhRow__body");
    if (body) body.setAttribute("aria-hidden", String(!isOpen));
  });

  // exhaustion pick level
  document.querySelectorAll(".exhPill").forEach((b) => {
    b.addEventListener("click", () => {
      const c = getCharacterById(activeId);
      if (!c) return;

      const v = clamp(safeInt(b.getAttribute("data-exh"), 0), 0, 6);
      c.exhaustionLevel = v;
      persistActive();

      if (exhLevelValue) exhLevelValue.textContent = v === 0 ? "--" : String(v);

      document.querySelectorAll(".exhPill").forEach((x) => {
        const xv = clamp(safeInt(x.getAttribute("data-exh"), 0), 0, 6);
        x.classList.toggle("is-active", xv === v);
      });

      syncHeaderPart2(c);
    });
  });
xpBarBtn.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    xpInput.textContent = "0";
    updateXpBar(c);
    openModal("xp");
  });

  hpBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    hpInput.textContent = "0";
    updateHpUI(c);
    openModal("hp");
  });
    // ===== AC =====
  acBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;

    const useDex0 = !!c.acUseDex;
    const extra0 = safeInt(c.acExtra, 0);

    if (acUseDex) acUseDex.checked = useDex0;
    if (acExtraInput) acExtraInput.value = String(extra0);

    const render = () => {
      const useDex = acUseDex ? !!acUseDex.checked : useDex0;
      const extra = safeInt(acExtraInput ? acExtraInput.value : extra0, extra0);

      const parts = computeArmorClassParts(c, { useDex, extra });
      if (acInput) acInput.value = String(parts.total);

      if (acSources) {
        const rows = [];
        for (const ln of parts.lines) {
          const isBase = ln.label === "База";
          const val = isBase ? String(ln.value) : formatSigned(ln.value);
          rows.push(`<div class="invCalcLine">${escapeHtml(ln.label)} <span>${escapeHtml(val)}</span></div>`);
        }
        acSources.innerHTML = rows.join("");
      }
    };

    // store renderer on modal for reuse
    if (acModal) acModal._render = render;

    // bind live preview
    acUseDex?.addEventListener("change", render, { once: true });
    if (acUseDex) {
      acUseDex.onchange = render;
    }
    if (acExtraInput) {
      acExtraInput.oninput = render;
    }

    render();
    openModal("ac");
  });

  acOk?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;

    const useDex = acUseDex ? !!acUseDex.checked : !!c.acUseDex;
    const extra = safeInt(acExtraInput ? acExtraInput.value : c.acExtra, safeInt(c.acExtra, 0));

    c.acUseDex = useDex;
    c.acExtra = extra;

    const parts = computeArmorClassParts(c);
    c.armorClass = parts.total;

    persistActive();
    syncHeaderPart2(c);
    closeModal("ac");
  });

  acCancel?.addEventListener("click", () => closeModal("ac"));
  // ===== Inspiration =====
  inspBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;

    const v = clamp(safeInt(c.inspiration, 0), 0, 99);
    inspInput.value = String(v);
    openModal("insp");
    setTimeout(() => inspInput.focus(), 0);
  });

  inspOk?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;

    const v = clamp(safeInt(inspInput.value, 0), 0, 99);
    c.inspiration = v;
    persistActive();
    syncHeaderPart3(c);
    closeModal("insp");
  });

  inspCancel?.addEventListener("click", () => closeModal("insp"));

  inspInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") inspOk.click();
  });

  // collapse: text only on expanded ("СВЕРНУТЬ"), collapsed = no text, only arrow + split lines
  collapseBtn.addEventListener("click", () => {
        isCollapsed = !isCollapsed;

    const headerEl = document.querySelector(".charHeader");
    if (headerEl) headerEl.classList.toggle("is-collapsed", isCollapsed);

    collapseText.textContent = isCollapsed ? "" : "СВЕРНУТЬ";
    collapseIcon.style.transform = isCollapsed ? "rotate(180deg)" : "rotate(0deg)";
    collapseBtn.classList.toggle("is-collapsed", isCollapsed);
  });
  document.querySelectorAll(".modal__scrim").forEach((s) => {
    s.addEventListener("click", (e) => {
      const which = e.currentTarget.getAttribute("data-close");
      if (which) closeModal(which);
    });
  });

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-close]");
    if (!btn) return;
    const which = btn.getAttribute("data-close");
    if (which) closeModal(which);
  });
  // ===== XP Calc logic =====

  function normalizeExprText(t) {
    const s = String(t || "").trim();
    return s.length ? s : "0";
  }

  function exprEndsWithOp(t) {
    return /\s[+\-]$/.test(String(t || "").trim());
  }

  function appendDigitToExpr(digit) {
    let t = normalizeExprText(xpInput.textContent);

    // если "0" и нет операторов — заменяем на цифру
    if (t === "0") {
      xpInput.textContent = digit;
      return;
    }

    // если последний токен — оператор, начинаем новое число
    if (exprEndsWithOp(t)) {
      xpInput.textContent = t + " " + digit;
      return;
    }

    // иначе дописываем цифру в текущее число
    xpInput.textContent = t + digit;
  }

  function appendOpToExpr(op) {
    let t = normalizeExprText(xpInput.textContent);

    // если сейчас "0" — не даём ставить оператор
    if (t === "0") return;

    // если оператор уже в конце — заменяем его
    if (exprEndsWithOp(t)) {
      xpInput.textContent = t.slice(0, -1) + op;
      return;
    }

    xpInput.textContent = t + " " + op;
  }

  xpModal.querySelectorAll(".keypad .key").forEach((k) => {
        k.addEventListener("click", () => {
      const digit = k.getAttribute("data-key");
      const sign = k.getAttribute("data-sign");

      if (sign === "+" || sign === "-") {
        appendOpToExpr(sign);
        return;
      }

      if (digit) {
        appendDigitToExpr(digit);
      }
    });
  });
  xpBackspace.addEventListener("click", () => {
    let t = String(xpInput.textContent || "").trim();
    if (!t || t === "0") {
      xpInput.textContent = "0";
      return;
    }

    // если заканчивается на " +"/" -" — удаляем оператор целиком
    if (exprEndsWithOp(t)) {
      xpInput.textContent = t.slice(0, -2).trim() || "0";
      return;
    }

    // иначе удаляем 1 символ
    t = t.slice(0, -1).trim();
    xpInput.textContent = t.length ? t : "0";
  });
  function readXpDelta() {
    const t = String(xpInput.textContent || "").trim();
    if (!t || t === "0") return 0;

    const tokens = t.split(/\s+/).filter(Boolean);

    // выражение должно начинаться с числа
    let total = safeInt(tokens[0], 0);
    let i = 1;

    while (i < tokens.length) {
      const op = tokens[i];
      const val = safeInt(tokens[i + 1], 0);

      if (op === "+") total += val;
      else if (op === "-") total -= val;

      i += 2;
    }

    return Math.max(0, total);
  }
  xpAdd.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;

    const d = readXpDelta();
    c.xpCurrent = Math.max(0, safeInt(c.xpCurrent, 0) + d);

    persistActive();
    updateXpBar(c);
    showToast("Опыт добавлен");
  });

  xpSub.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;

    const d = readXpDelta();
    c.xpCurrent = Math.max(0, safeInt(c.xpCurrent, 0) - d);

    persistActive();
    updateXpBar(c);
    showToast("Опыт отнят");
  });
    xpLevelUp.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;

    const level = clamp(safeInt(c.level, 1), 1, 20);
    const nextXp = getXpForNextLevel(level);
    if (nextXp == null) return;

    if (c.xpCurrent >= nextXp && level < 20) {
      c.level = level + 1;
      persistActive();
      updateXpBar(c);
      syncSpellUI(c);
      showToast(`Уровень ${c.level}`);
    }
  });
  // ===== HP Calc logic =====

  function normalizeHpExprText(t) {
    const s = String(t || "").trim();
    return s.length ? s : "0";
  }

  function hpExprEndsWithOp(t) {
    return /\s[+\-]$/.test(String(t || "").trim());
  }

  function appendDigitToHpExpr(digit) {
    let t = normalizeHpExprText(hpInput.textContent);

    // если "0" и нет операторов — заменяем на цифру
    if (t === "0") {
      hpInput.textContent = digit;
      return;
    }

    // если последний токен — оператор, начинаем новое число
    if (hpExprEndsWithOp(t)) {
      hpInput.textContent = t + " " + digit;
      return;
    }

    // иначе дописываем цифру в текущее число
    hpInput.textContent = t + digit;
  }

  function appendOpToHpExpr(op) {
    let t = normalizeHpExprText(hpInput.textContent);

    // если сейчас "0" — не даём ставить оператор
    if (t === "0") return;

    // если оператор уже в конце — заменяем его
    if (hpExprEndsWithOp(t)) {
      hpInput.textContent = t.slice(0, -1) + op;
      return;
    }

    hpInput.textContent = t + " " + op;
  }

  function evalSimpleExpr(text) {
    // поддерживаем "12", "12 + 3 - 2"
    const t = String(text || "").trim();
    if (!t) return 0;

    const parts = t.split(/\s+/).filter(Boolean);
    let acc = 0;
    let op = "+";

    for (const p of parts) {
      if (p === "+" || p === "-") {
        op = p;
        continue;
      }
      const n = safeInt(p, 0);
      acc = op === "-" ? acc - n : acc + n;
    }
    return acc;
  }

  function readHpDelta() {
    const t = normalizeHpExprText(hpInput.textContent);
    return Math.max(0, evalSimpleExpr(t));
  }

  hpModal.querySelectorAll(".keypad .key").forEach((k) => {
    k.addEventListener("click", () => {
      const digit = k.getAttribute("data-key");
      const sign = k.getAttribute("data-sign");

      if (sign === "+" || sign === "-") {
        appendOpToHpExpr(sign);
        return;
      }

      if (digit) appendDigitToHpExpr(digit);
    });
  });

  hpBackspace.addEventListener("click", () => {
    let t = String(hpInput.textContent || "").trim();
    if (!t || t === "0") return;

    // удаляем последний символ, но аккуратно с " + " / " - "
    if (/\s[+\-]$/.test(t)) {
      t = t.slice(0, -2).trimEnd();
    } else {
      t = t.slice(0, -1);
    }

    t = t.trim();
    hpInput.textContent = t.length ? t : "0";
  });

  function updateHpUI(c) {
    const maxHp = Math.max(0, safeInt(c.hpMax, 0));
    const curRaw = safeInt(c.hpCurrent, 0);
    const curClamp = clamp(curRaw, -maxHp, maxHp);
    const temp = Math.max(0, safeInt(c.hpTemp, 0));

    const isNeg = curClamp < 0;

    if (hpBtnNums) hpBtnNums.textContent = `${curClamp}/${maxHp}`;
    if (hpBtnTemp) hpBtnTemp.textContent = `(${temp})`;

    if (hpBtn) hpBtn.classList.toggle("is-negative", isNeg);
    if (hpTopCenter) hpTopCenter.classList.toggle("is-negative", isNeg);

    const curPos = Math.max(0, curClamp);
    const curPct = maxHp > 0 ? clamp((curPos / maxHp) * 100, 0, 100) : 0;

    // TEMP как ХВОСТ поверх MAX: отдельная ширина (temp), но начинается от cur визуально за счёт слоёв
    const tempOnlyPos = clamp(temp, 0, maxHp);
    const tempOnlyPct = maxHp > 0 ? clamp((tempOnlyPos / maxHp) * 100, 0, 100) : 0;

    // TEMP слой делаем шириной (cur+temp), но при этом он полупрозрачный и по тону мягкий (см. CSS),
    // чтобы хвост был виден именно после CURRENT.
    const totalPos = clamp(curPos + temp, 0, maxHp);
    const totalPct = maxHp > 0 ? clamp((totalPos / maxHp) * 100, 0, 100) : 0;

    if (hpBtnFillTemp) hpBtnFillTemp.style.width = `${totalPct}%`;
    if (hpBtnFillCur) hpBtnFillCur.style.width = `${curPct}%`;
    if (hpTopText) hpTopText.textContent = `${curClamp}/${maxHp}`;
    if (hpTopTemp) hpTopTemp.textContent = `(${temp})`;
    }

  function applyTempHp(delta) {
    const c = getCharacterById(activeId);
    if (!c) return;

    c.hpTemp = Math.max(0, safeInt(c.hpTemp, 0) + delta);
    persistActive();
    updateHpUI(c);
  }

  function applyHeal(delta) {
    const c = getCharacterById(activeId);
    if (!c) return;

    const maxHp = Math.max(0, safeInt(c.hpMax, 0));
    const cur = clamp(safeInt(c.hpCurrent, 0), -maxHp, maxHp);

    c.hpCurrent = clamp(cur + delta, -maxHp, maxHp);
    c.hpCurrent = Math.min(c.hpCurrent, maxHp);

    persistActive();
    updateHpUI(c);
  }

  function applyDamage(delta) {
    const c = getCharacterById(activeId);
    if (!c) return;

    let temp = Math.max(0, safeInt(c.hpTemp, 0));
    let cur = safeInt(c.hpCurrent, 0);
    const maxHp = Math.max(0, safeInt(c.hpMax, 0));

    const useTemp = Math.min(temp, delta);
    temp -= useTemp;
    delta -= useTemp;

    cur = clamp(cur - delta, -maxHp, maxHp);

    c.hpTemp = temp;
    c.hpCurrent = cur;

    persistActive();
    updateHpUI(c);
  }

  hpTemp.addEventListener("click", () => {
    const d = readHpDelta();
    if (!d) return;
    applyTempHp(d);
    hpInput.textContent = "0";
    showToast("Временные хиты");
  });

  hpHeal.addEventListener("click", () => {
    const d = readHpDelta();
    if (!d) return;
    applyHeal(d);
    hpInput.textContent = "0";
    showToast("Лечение");
  });

  hpDmg.addEventListener("click", () => {
    const d = readHpDelta();
    if (!d) return;
    applyDamage(d);
    hpInput.textContent = "0";
    showToast("Урон");
  });
  // ===== Settings form =====

  function applySettingsFromFields() {
    const c = getCharacterById(activeId);
    if (!c) return;

    c.name = (setName.value || "").trim() || "Безымянный персонаж";
    c.race = (setRace.value || "").trim();
    c.className = (setClass.value || "").trim();
    c.subclass = (setSubclass.value || "").trim();

    c.speed = clamp(safeInt(setSpeed.value, 0), 0, 200);
    c.hpMax = clamp(safeInt(setHpMax.value, 0), 0, 9999);

    c.hpCurrent = clamp(safeInt(c.hpCurrent, 0), -c.hpMax, c.hpMax);
    c.hpTemp = Math.max(0, safeInt(c.hpTemp, 0));
    
    persistActive();
    syncCharacterUI();
  }

  ["input", "change"].forEach((evt) => {
    setName.addEventListener(evt, applySettingsFromFields);
    setRace.addEventListener(evt, applySettingsFromFields);
    setClass.addEventListener(evt, applySettingsFromFields);
    setSubclass.addEventListener(evt, applySettingsFromFields);
    setSpeed.addEventListener(evt, applySettingsFromFields);
    setHpMax.addEventListener(evt, applySettingsFromFields);
  });

  openSpellSettings.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    syncSpellUI(c);
    closeModal("settings");
    openModal("spell");
  });

  // ===== Spells screen logic =====
  spellsSettingsBtn.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    syncSpellUI(c);
    renderSpellClassesUI(c);
    openModal("spell");
  });

  spellsPrepareBtn.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    openSpellPrep(c);
  });

  spellsCreateBtn.addEventListener("click", () => {
    resetSpellCreateForm();
    renderSpellCreateClassField();
    openModal("spellCreate");
  });

  spellsFilters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    const key = btn.getAttribute("data-filter");
    if (!key) return;

    if (key === "k") spellsFilterState.k = !spellsFilterState.k;
    else if (key === "r") spellsFilterState.r = !spellsFilterState.r;
    else spellsFilterState.level = key;

    const c = getCharacterById(activeId);
    if (!c) return;
    syncSpellsScreenUI(c);
  });

  spellsList.addEventListener("click", (e) => {
    const card = e.target.closest("[data-spell]");
    if (!card) return;
    const id = card.getAttribute("data-spell");
    const c = getCharacterById(activeId);
    if (!c) return;
    openSpellView(c, id);
  });

  spellsList.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-slotdot]");
    if (!dot) return;
    const lvl = safeInt(dot.getAttribute("data-slotlvl"), 0);
    const idx = safeInt(dot.getAttribute("data-slotdot"), 0);
    if (!lvl) return;

    const used = ensureSpentSet(lvl);
    if (used.has(idx)) used.delete(idx);
    else used.add(idx);

    dot.classList.toggle("is-used", used.has(idx));
  });

  
  // Spell view: slot picker
  spellViewModal.addEventListener("click", (e) => {
    const pick = e.target.closest("[data-slotpick]");
    if (!pick) return;
    const sLvl = safeInt(pick.getAttribute("data-slotpick"), 0);
    if (!sLvl) return;
    const c = getCharacterById(activeId);
    if (!c) return;
    const spell = getSpellByIdForCharacter(c, String(spellViewState.id));
    if (!spell) return;

    spellViewState.slot = sLvl;

    spellViewSlots.querySelectorAll("[data-slotpick]").forEach((b) => {
      b.classList.toggle("is-active", safeInt(b.getAttribute("data-slotpick"), 0) === sLvl);
    });

    const dmg = getSpellDamageDice(spell, c, spellViewState.slot);
    spellViewDamage.textContent = dmg === "—" ? "Урон: —" : `Урон: ${dmg}`;
  });

// Spell settings: classes selector
  spellClassesBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleClassesPopover();
  });

  classesPopover.addEventListener("click", (e) => {
    e.stopPropagation();
    const it = e.target.closest("[data-classkey]");
    if (!it) return;
    const k = it.getAttribute("data-classkey");
    const c = getCharacterById(activeId);
    if (!c) return;
    if (!SPELL_ALLOWED_CLASSES.includes(k)) return;

    const arr = Array.isArray(c.spellbook?.classes) ? c.spellbook.classes : [];
    const set = new Set(arr.filter((x) => SPELL_ALLOWED_CLASSES.includes(x)));
    if (set.has(k)) set.delete(k);
    else set.add(k);

    c.spellbook.classes = Array.from(set);
    saveCharacters();
    renderSpellClassesUI(c);
    syncSpellsScreenUI(c);
    renderPrepPane(c);
  });

  spellClassesChips.addEventListener("click", (e) => {
    const x = e.target.closest("[data-classx]");
    if (!x) return;
    const k = x.getAttribute("data-classx");
    const c = getCharacterById(activeId);
    if (!c) return;
    const arr = Array.isArray(c.spellbook?.classes) ? c.spellbook.classes : [];
    c.spellbook.classes = arr.filter((v) => v !== k);
    saveCharacters();
    renderSpellClassesUI(c);
    syncSpellsScreenUI(c);
    renderPrepPane(c);
  });

  // Prepare modal tabs
  spellPrepTabKnown.addEventListener("click", () => {
    setSpellPrepTab("known");
  });
  spellPrepTabAll.addEventListener("click", () => {
    setSpellPrepTab("all");
  });
  spellPrepTabCreated?.addEventListener("click", () => {
    setSpellPrepTab("created");
  });

  // Prepare modal actions (learn/remove/view)
  spellPrepModal.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-prep]");
    const c = getCharacterById(activeId);
    if (!c) return;

    if (btn) {
      const mode = btn.getAttribute("data-prep");
      const id = btn.getAttribute("data-spell");
      if (!id) return;

      c.spellbook = c.spellbook || { classes: [], known: [], custom: [] };
      const list = Array.isArray(c.spellbook?.known) ? c.spellbook.known.map(String) : [];
      const set = new Set(list);

      if (mode === "all" || mode === "created") {
        if (set.has(id)) return;
        set.add(id);
        c.spellbook.known = Array.from(set);
      } else if (mode === "known") {
        if (!set.has(id)) return;
        set.delete(id);
        c.spellbook.known = Array.from(set);
      } else if (mode === "created-delete") {
        const custom = Array.isArray(c.spellbook?.custom) ? c.spellbook.custom : [];
        c.spellbook.custom = custom.filter((s) => getSpellId(s) !== id);
        if (set.has(id)) {
          set.delete(id);
          c.spellbook.known = Array.from(set);
        }
      }

      saveCharacters();
      renderPrepPane(c);
      syncSpellsScreenUI(c);
      return;
    }

    const row = e.target.closest("[data-spellview]");
    if (!row) return;
    const id = row.getAttribute("data-spellview");
    if (!id) return;
    openSpellView(c, id);
  });

  if (scCompChips) {
    scCompChips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-chip]");
      if (!btn) return;
      const key = btn.getAttribute("data-chip");
      if (key === "v") spellCreateState.compV = !spellCreateState.compV;
      if (key === "s") spellCreateState.compS = !spellCreateState.compS;
      if (key === "m") spellCreateState.compM = !spellCreateState.compM;
      btn.classList.toggle("is-active", !!spellCreateState[`comp${key.toUpperCase()}`]);
      syncSpellCreateStates();
    });
  }

  if (scFlagsChips) {
    scFlagsChips.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-flag]");
      if (!btn) return;
      const key = btn.getAttribute("data-flag");
      spellCreateState[key] = !spellCreateState[key];
      btn.classList.toggle("is-active", !!spellCreateState[key]);
    });
  }

  [scTargetType, scRangeType, scDurationType, scActionType].forEach((el) => {
    el?.addEventListener("change", syncSpellCreateStates);
  });

  scClassesBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleSpellCreateClassesPopover();
  });

  scClassesPopover?.addEventListener("click", (e) => {
    e.stopPropagation();
    const row = e.target.closest("[data-scclass]");
    if (!row) return;
    const key = row.getAttribute("data-scclass");
    const set = new Set(spellCreateState.classes || []);
    if (set.has(key)) set.delete(key); else set.add(key);
    spellCreateState.classes = Array.from(set);
    renderSpellCreateClassField();
    scClassesPopover.classList.remove("popover--hidden");
    scClassesBtn?.setAttribute("aria-expanded", "true");
  });

  scClassesChips?.addEventListener("click", (e) => {
    const x = e.target.closest("[data-scx]");
    if (!x) return;
    const key = x.getAttribute("data-scx");
    spellCreateState.classes = (spellCreateState.classes || []).filter((k) => k !== key);
    renderSpellCreateClassField();
  });

  scDeleteBtn?.addEventListener("click", () => {
    resetSpellCreateForm();
  });

  scSaveBtn?.addEventListener("click", () => {
    const c = getCharacterById(activeId);
    if (!c) return;
    const data = collectCustomSpellForm();
    const err = validateCustomSpellForm(data);
    if (err) {
      showToast(err);
      return;
    }
    const spell = normalizeCustomSpell(data);
    c.spellbook = c.spellbook || { classes: [], known: [], custom: [] };
    c.spellbook.custom = Array.isArray(c.spellbook.custom) ? c.spellbook.custom : [];
    c.spellbook.custom.push(spell);
    persistActive();
    syncSpellsScreenUI(c);
    renderPrepPane(c);
    closeModal("spellCreate");
    openSpellPrep(c);
    setSpellPrepTab("created");
    showToast("Заклинание создано");
  });

  // Theme toggle in settings
  themeMoltenBtn.addEventListener("click", () => applyTheme("molten"));
  themeArcaneBtn.addEventListener("click", () => applyTheme("arcane"));
  themeLegionBtn.addEventListener("click", () => applyTheme("legion"));
  spellBack.addEventListener("click", () => {
    closeModal("spell");
    openModal("settings");
  });

  spellAbilityBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = abilityPopover.classList.contains("popover--hidden");
    closeAllPopovers();
    abilityPopover.classList.toggle("popover--hidden", !isHidden);
    spellAbilityBtn.setAttribute("aria-expanded", String(isHidden));
  });

  abilityPopover.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-ability]");
    if (!btn) return;
    const key = btn.getAttribute("data-ability");

    const c = getCharacterById(activeId);
    if (!c) return;
    c.spellcasting = c.spellcasting || { ability: "", slots: {} };
    c.spellcasting.ability = key;
    persistActive();
    syncSpellDerivedUI(c);
    closeAllPopovers();
  });

  slotsGrid.addEventListener("input", (e) => {
    const inp = e.target.closest("input[data-slot]");
    if (!inp) return;
    const lvl = inp.getAttribute("data-slot");
    const c = getCharacterById(activeId);
    if (!c) return;
    c.spellcasting = c.spellcasting || { ability: "", slots: {} };
    c.spellcasting.slots = c.spellcasting.slots || {};
    c.spellcasting.slots[String(lvl)] = clamp(safeInt(inp.value, 0), 0, 99);
    persistActive();
    // Keep spells screen in sync (slot dots per level depend on slots count)
    syncSpellsScreenUI(c);
  });

  portraitUploadBtn.addEventListener("click", () => portraitFile.click());

  portraitFile.addEventListener("change", async () => {
    const file = portraitFile.files && portraitFile.files[0];
    portraitFile.value = "";
    if (!file) return;

    const okTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!okTypes.includes(file.type)) {
      showToast("Неверный формат");
      return;
    }

    const dataUrl = await compressImageToDataURL(file, {
      maxSide: 640,
      quality: 0.86,
    });

    const c = getCharacterById(activeId);
    if (!c) return;
    c.avatarDataUrl = dataUrl;
    persistActive();
    syncCharacterUI();
    renderList();
    showToast("Портрет обновлён");
    closeModal("portrait");
  });
  // ===== Cover upload =====
  coverUploadBtn.addEventListener("click", () => coverFile.click());

  coverFile.addEventListener("change", async () => {
    const file = coverFile.files && coverFile.files[0];
    coverFile.value = "";
    if (!file) return;

    const okTypes = ["image/png", "image/jpeg", "image/webp"];
    if (!okTypes.includes(file.type)) {
      showToast("Неверный формат");
      return;
    }

    const dataUrl = await compressImageToDataURL(file, {
      maxSide: 1920,
      quality: 0.82,
    });

    const c = getCharacterById(activeId);
    if (!c) return;

    c.coverDataUrl = dataUrl;
    persistActive();
    syncCharacterUI();
    showToast("Обложка обновлена");
  });
  // ===== Misc =====
  function escapeHtml(s) {
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatCondDesc(desc) {
    const raw = String(desc || "").replaceAll("\r\n", "\n").trim();
    if (!raw) return "";

    // абзацы = разделены пустой строкой
    const parts = raw.split(/\n\s*\n+/g).map((p) => p.trim()).filter(Boolean);

    // внутри абзаца одиночные переносы = <br>, чтобы можно было красиво писать списки строками
    const blocks = parts.map((p) => {
      const safe = escapeHtml(p).replaceAll("\n", "<br>");
      return `<div class="condP">${safe}</div>`;
    });

    // тонкая полоска между абзацами
    return blocks.join(`<div class="condSep" aria-hidden="true"></div>`);
  }
  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = reject;
      r.readAsDataURL(file);
    });
  }

  async function compressImageToDataURL(file, opts) {
    const maxSide = Number(opts?.maxSide || 1920);
    const quality = Number(opts?.quality ?? 0.82);

    const srcUrl = URL.createObjectURL(file);

    try {
      const img = await new Promise((resolve, reject) => {
        const im = new Image();
        im.onload = () => resolve(im);
        im.onerror = reject;
        im.src = srcUrl;
      });

      const sw = img.naturalWidth || img.width || 1;
      const sh = img.naturalHeight || img.height || 1;

      const scale = Math.min(1, maxSide / Math.max(sw, sh));
      const tw = Math.max(1, Math.round(sw * scale));
      const th = Math.max(1, Math.round(sh * scale));

      const canvas = document.createElement("canvas");
      canvas.width = tw;
      canvas.height = th;

      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) throw new Error("no_canvas_ctx");

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, tw, th);

      const toBlob = (type, q) =>
        new Promise((resolve) => {
          canvas.toBlob((b) => resolve(b), type, q);
        });

      // prefer WebP, fallback PNG (safe for alpha + universal)
      let blob = await toBlob("image/webp", quality);
      if (!blob) blob = await toBlob("image/png", 1);

      return await new Promise((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result));
        r.onerror = reject;
        r.readAsDataURL(blob);
      });
    } finally {
      URL.revokeObjectURL(srcUrl);
    }

  }

  // global click closes popovers
  //   document.addEventListener("click", () => closeAllPopovers());

  // json popover actions
  exportBtn.addEventListener("click", (e) => e.stopPropagation());
  importBtn.addEventListener("click", (e) => e.stopPropagation());

  // import file
  importFile.addEventListener("click", (e) => e.stopPropagation());

  // expose theme switch for console (чтобы ты мог быстро смотреть)
  window.__DND_THEME__ = {
    molten() { document.documentElement.setAttribute("data-theme", "molten"); },
    arcane() { document.documentElement.setAttribute("data-theme", "arcane"); },
    legion() { document.documentElement.setAttribute("data-theme", "legion"); }
  };
})();