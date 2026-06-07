/* ── State ───────────────────────────────────────────────────────────── */
var cuiConfig = null;
var cuiSelectedNotifStyle = 'none';
var cuiSelectedCardStyle  = 'classic';
var cuiAllItems    = [];
var cuiAllVehicles = [];
var _cuiConfirmCb  = null;

/* ── Drug keyword filter list ────────────────────────────────────────── */
var DRUG_KEYWORDS = [
    'crack','coke','cocaine','meth','heroin','weed','marijuana','cannabis',
    'molly','ecstasy','mdma','speed','amphetamine','lsd','acid','shroom',
    'mushroom','peyote','oxy','opium','xanax','fentanyl','ketamine','pcp',
    'hash','kush','ganja','dope','crank','crystal','ice','blow','snow',
    'powder','drug','narco','stash','trap','plug','pooch','pill','bud',
    'joint','blunt','sativa','indica','lean','codeine','morphine','perco',
    'mescaline','psilocybin','dimethyl','dmt','spice','synthetic','xtc',
    'smack','horse','tar','rock','base','freebase','crack','flakka'
];

/* ── NUI message listener ────────────────────────────────────────────── */
window.addEventListener('message', function (event) {
    var data = event.data;
    if (data.action === 'openConfigUI') {
        cuiConfig = JSON.parse(JSON.stringify(data.config));
        cuiOpen();
    } else if (data.action === 'closeConfigUI') {
        cuiHide();
    } else if (data.action === 'updateColor') {
        if (data.color && window.applyUIColor) window.applyUIColor(data.color);
    } else if (data.action === 'showCustomNotif') {
        showCustomNotif(data.message || '', data.notifType || 'success');
    }
});

/* ── Custom notification toast ───────────────────────────────────────── */
var _cnTimer     = null;
var _cnHideTimer = null;

function _cnCancelAll() {
    if (_cnTimer)     { clearTimeout(_cnTimer);     _cnTimer     = null; }
    if (_cnHideTimer) { clearTimeout(_cnHideTimer); _cnHideTimer = null; }
}

function showCustomNotif(msg, type) {
    var el   = document.getElementById('custom-notif');
    var icon = document.getElementById('custom-notif-icon');
    var txt  = document.getElementById('custom-notif-msg');
    if (!el) return;

    var iconClass = 'fa-solid ';
    icon.className = '';
    if (type === 'error') {
        iconClass += 'fa-circle-xmark';
        icon.className = 'cn-error';
    } else if (type === 'warning' || type === 'warn') {
        iconClass += 'fa-triangle-exclamation';
        icon.className = 'cn-warn';
    } else {
        iconClass += 'fa-circle-check';
    }
    icon.innerHTML = '<i class="' + iconClass + '"></i>';
    txt.textContent = msg;

    _cnCancelAll();
    el.style.display   = 'flex';
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = 'cnSlideIn 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards';

    _cnTimer = setTimeout(function () {
        _cnTimer = null;
        el.style.animation = 'cnSlideOut 0.3s ease-in forwards';
        _cnHideTimer = setTimeout(function () {
            _cnHideTimer = null;
            el.style.display   = 'none';
            el.style.animation = 'none';
        }, 400);
    }, 5000);
}

/* ── ESC key support ─────────────────────────────────────────────────── */
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        var dmDrop = document.getElementById('dm-id-drop');
        if (dmDrop && dmDrop.classList.contains('open'))   { closeItemDrop();     return; }
        var riDrop = document.getElementById('rm-item-drop');
        if (riDrop && riDrop.classList.contains('open'))   { closeRankItemDrop(); return; }
        var rvDrop = document.getElementById('rm-vehicle-drop');
        if (rvDrop && rvDrop.classList.contains('open'))   { closeVehicleDrop();  return; }
        var confirm = document.getElementById('cui-confirm-modal');
        if (confirm && confirm.classList.contains('open')) { cuiConfirmClose();   return; }
        var overlay = document.getElementById('config-ui-overlay');
        if (overlay && overlay.classList.contains('open')) closeCUI();
    }
});

/* Close dropdowns on outside click */
document.addEventListener('click', function (e) {
    if (!e.target.closest('#dm-id-combo'))     closeItemDrop();
    if (!e.target.closest('#rm-item-combo'))   closeRankItemDrop();
    if (!e.target.closest('#rm-vehicle-combo')) closeVehicleDrop();
});

/* ── Confirm Modal ───────────────────────────────────────────────────── */
function cuiConfirm(msg, okLabel, cb) {
    document.getElementById('cui-confirm-msg').textContent = msg;
    document.getElementById('cui-confirm-ok').textContent = okLabel || 'Confirm';
    _cuiConfirmCb = cb;
    document.getElementById('cui-confirm-modal').classList.add('open');
}
function cuiConfirmOk() {
    document.getElementById('cui-confirm-modal').classList.remove('open');
    if (_cuiConfirmCb) { _cuiConfirmCb(); _cuiConfirmCb = null; }
}
function cuiConfirmClose() {
    document.getElementById('cui-confirm-modal').classList.remove('open');
    _cuiConfirmCb = null;
}

/* ── Open / Close ────────────────────────────────────────────────────── */
function cuiOpen() {
    if (cuiConfig.UIcolor && window.applyUIColor) window.applyUIColor(cuiConfig.UIcolor);
    populateDrugs();
    populateRanks();
    populatePeds();
    populateSettings();
    populateNotifications();
    document.getElementById('config-ui-overlay').classList.add('open');
    switchCUITab('drugs', document.querySelector('.cui-tab[data-tab="drugs"]'));
}

function cuiHide() {
    document.getElementById('config-ui-overlay').classList.remove('open');
}

function closeCUI() {
    cuiHide();
    fetch('https://flake_drugselling/closeConfigUI', { method: 'POST', body: JSON.stringify({}) });
}

/* ── Tab Switching ───────────────────────────────────────────────────── */
function switchCUITab(name, btn) {
    document.querySelectorAll('.cui-tab').forEach(function (b) { b.classList.remove('active'); });
    document.querySelectorAll('.cui-tab-pane').forEach(function (p) { p.classList.remove('active'); });
    if (btn) btn.classList.add('active');
    var pane = document.getElementById('pane-' + name);
    if (pane) pane.classList.add('active');
}

/* ── Toast Notifications ─────────────────────────────────────────────── */
function showToast(msg, isError) {
    var t = document.getElementById('cui-toast');
    t.textContent = msg;
    t.className = 'show' + (isError ? ' error' : '');
    clearTimeout(t._timer);
    t._timer = setTimeout(function () { t.className = ''; }, 2800);
}

/* ── NUI save helper ─────────────────────────────────────────────────── */
function nuiSave(section, data) {
    fetch('https://flake_drugselling/saveConfig', {
        method: 'POST',
        body: JSON.stringify({ section: section, data: data })
    });
    showToast('✓ ' + section + ' saved');
}

/* ══════════════════════════════════════════════════════════════════════
   DRUGS TAB
══════════════════════════════════════════════════════════════════════ */
function populateDrugs() {
    var tbody = document.getElementById('drugs-tbody');
    tbody.innerHTML = '';
    if (!cuiConfig.SellList) return;
    cuiConfig.SellList.forEach(function (d, i) {
        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td><code style="color:#aaa;font-size:12px">' + esc(d.id) + '</code></td>' +
            '<td>' + esc(d.label) + '</td>' +
            '<td>$' + d.priceMin + ' – $' + d.priceMax + '</td>' +
            '<td>' + d.qtyMin + ' – ' + d.qtyMax + '</td>' +
            '<td style="color:var(--ui-color-primary)">' + d.points + ' XP</td>' +
            '<td style="display:flex;gap:6px">' +
                '<button class="cui-btn-edit" onclick="openDrugModal(' + i + ')"><i class="fa-solid fa-pencil"></i> Edit</button>' +
                '<button class="cui-btn-danger" onclick="deleteDrug(' + i + ')"><i class="fa-solid fa-trash"></i></button>' +
            '</td>';
        tbody.appendChild(tr);
    });
}

function openDrugModal(idx) {
    var modal = document.getElementById('drug-modal');
    var isNew = (idx === null || idx === undefined);
    document.getElementById('drug-modal-title').textContent = isNew ? 'Add Drug' : 'Edit Drug';
    document.getElementById('drug-modal-editing-id').value = isNew ? '' : String(idx);

    var arrow = document.getElementById('dm-id-arrow');
    if (!isNew) {
        var d = cuiConfig.SellList[idx];
        document.getElementById('dm-id').value        = d.id;
        document.getElementById('dm-label').value     = d.label;
        document.getElementById('dm-price-min').value = d.priceMin;
        document.getElementById('dm-price-max').value = d.priceMax;
        document.getElementById('dm-qty-min').value   = d.qtyMin;
        document.getElementById('dm-qty-max').value   = d.qtyMax;
        document.getElementById('dm-points').value    = d.points;
        document.getElementById('dm-reject').value    = d.reject || 5;
        document.getElementById('dm-id').disabled     = true;
        if (arrow) arrow.style.display = 'none';
    } else {
        ['dm-id','dm-label','dm-price-min','dm-price-max','dm-qty-min','dm-qty-max','dm-points','dm-reject']
            .forEach(function (id) { document.getElementById(id).value = ''; });
        document.getElementById('dm-reject').value = 5;
        document.getElementById('dm-id').disabled = false;
        if (arrow) arrow.style.display = '';
        loadItemDrop();
    }
    modal.classList.add('open');
}

function closeDrugModal() {
    document.getElementById('drug-modal').classList.remove('open');
    closeItemDrop();
}

function confirmDrug() {
    var idxStr = document.getElementById('drug-modal-editing-id').value;
    var isNew  = (idxStr === '');
    var entry  = {
        id:       document.getElementById('dm-id').value.trim(),
        label:    document.getElementById('dm-label').value.trim(),
        priceMin: parseInt(document.getElementById('dm-price-min').value) || 0,
        priceMax: parseInt(document.getElementById('dm-price-max').value) || 0,
        qtyMin:   parseInt(document.getElementById('dm-qty-min').value)   || 1,
        qtyMax:   parseInt(document.getElementById('dm-qty-max').value)   || 1,
        points:   parseInt(document.getElementById('dm-points').value)    || 0,
        reject:   parseInt(document.getElementById('dm-reject').value)    || 5,
    };
    if (!entry.id) { showToast('Item name is required', true); return; }
    if (!entry.label) { showToast('Label is required', true); return; }

    if (isNew) {
        if (cuiConfig.SellList.some(function (d) { return d.id === entry.id; })) {
            showToast('Drug "' + entry.id + '" already exists', true); return;
        }
        cuiConfig.SellList.push(entry);
    } else {
        cuiConfig.SellList[parseInt(idxStr)] = entry;
    }
    closeDrugModal();
    populateDrugs();
    nuiSave('SellList', cuiConfig.SellList);
}

function deleteDrug(idx) {
    var label = cuiConfig.SellList[idx].label;
    cuiConfirm('Delete drug "' + label + '"? This cannot be undone.', 'Delete', function () {
        cuiConfig.SellList.splice(idx, 1);
        populateDrugs();
        nuiSave('SellList', cuiConfig.SellList);
    });
}

function saveDrugs() {
    nuiSave('SellList', cuiConfig.SellList);
}

/* ══════════════════════════════════════════════════════════════════════
   RANKS TAB
══════════════════════════════════════════════════════════════════════ */
function populateRanks() {
    var tbody = document.getElementById('ranks-tbody');
    tbody.innerHTML = '';
    if (!cuiConfig.Ranks) return;
    cuiConfig.Ranks.forEach(function (r, i) {
        var rewardHtml = '<span class="tag tag-none">—</span>';
        if (r.rewardType === 'car')  rewardHtml = '<span class="tag tag-car"><i class="fa-solid fa-car"></i> ' + esc(r.rewardVehicle || '') + '</span>';
        if (r.rewardType === 'item') rewardHtml = '<span class="tag tag-item"><i class="fa-solid fa-box"></i> ' + (r.rewardAmount || 1) + 'x ' + esc(r.rewardItem || '') + '</span>';

        var tr = document.createElement('tr');
        tr.innerHTML =
            '<td style="color:var(--ui-color-primary);font-weight:700">' + (i + 1) + '</td>' +
            '<td>' + esc(r.label) + '</td>' +
            '<td>' + Number(r.points).toLocaleString() + ' XP</td>' +
            '<td>' + r.percentmore + '%</td>' +
            '<td>' + rewardHtml + '</td>' +
            '<td>' + (r.rewardType === 'car' ? esc(r.rewardVehicle || '') : r.rewardType === 'item' ? esc(r.rewardItem || '') + ' ×' + (r.rewardAmount || 1) : '—') + '</td>' +
            '<td style="display:flex;gap:6px">' +
                '<button class="cui-btn-edit" onclick="openRankModal(' + i + ')"><i class="fa-solid fa-pencil"></i> Edit</button>' +
                '<button class="cui-btn-danger" onclick="deleteRank(' + i + ')"><i class="fa-solid fa-trash"></i></button>' +
            '</td>';
        tbody.appendChild(tr);
    });
}

function addRank() {
    var last = cuiConfig.Ranks[cuiConfig.Ranks.length - 1] || { points: 0, percentmore: 0 };
    cuiConfig.Ranks.push({
        label: 'New Rank',
        points: last.points + 10000,
        percentmore: last.percentmore + 1,
        rewardType: 'none',
        rewardVehicle: '',
        rewardItem: '',
        rewardAmount: 1,
    });
    populateRanks();
    openRankModal(cuiConfig.Ranks.length - 1);
}

function openRankModal(idx) {
    closeRankItemDrop();
    closeVehicleDrop();
    var r = cuiConfig.Ranks[idx];
    document.getElementById('rank-modal-title').textContent = 'Edit Rank #' + (idx + 1);
    document.getElementById('rank-modal-idx').value  = String(idx);
    document.getElementById('rm-label').value        = r.label;
    document.getElementById('rm-points').value       = r.points;
    document.getElementById('rm-bonus').value        = r.percentmore;
    document.getElementById('rm-reward-type').value  = r.rewardType || 'none';
    document.getElementById('rm-vehicle').value      = r.rewardVehicle || '';
    document.getElementById('rm-item').value         = r.rewardItem || '';
    document.getElementById('rm-amount').value       = r.rewardAmount || 1;
    toggleRewardFields();
    document.getElementById('rank-modal').classList.add('open');
}

function closeRankModal() {
    document.getElementById('rank-modal').classList.remove('open');
    closeRankItemDrop();
    closeVehicleDrop();
}

function toggleRewardFields() {
    var type = document.getElementById('rm-reward-type').value;
    document.getElementById('rm-car-fields').style.display  = (type === 'car')  ? '' : 'none';
    document.getElementById('rm-item-fields').style.display = (type === 'item') ? '' : 'none';
    closeRankItemDrop();
    closeVehicleDrop();
}

function confirmRank() {
    var idx  = parseInt(document.getElementById('rank-modal-idx').value);
    var type = document.getElementById('rm-reward-type').value;
    cuiConfig.Ranks[idx] = {
        label:         document.getElementById('rm-label').value.trim() || 'Unnamed',
        points:        parseInt(document.getElementById('rm-points').value) || 0,
        percentmore:   parseInt(document.getElementById('rm-bonus').value)  || 0,
        rewardType:    type,
        rewardVehicle: document.getElementById('rm-vehicle').value.trim(),
        rewardItem:    document.getElementById('rm-item').value.trim(),
        rewardAmount:  parseInt(document.getElementById('rm-amount').value) || 1,
    };
    closeRankModal();
    populateRanks();
    nuiSave('Ranks', cuiConfig.Ranks);
}

function deleteRank(idx) {
    if (cuiConfig.Ranks.length <= 1) { showToast('Must have at least 1 rank', true); return; }
    var label = cuiConfig.Ranks[idx].label;
    cuiConfirm('Delete rank #' + (idx + 1) + ' "' + label + '"? This cannot be undone.', 'Delete', function () {
        cuiConfig.Ranks.splice(idx, 1);
        populateRanks();
        nuiSave('Ranks', cuiConfig.Ranks);
    });
}

function saveRanks() {
    nuiSave('Ranks', cuiConfig.Ranks);
}

/* ══════════════════════════════════════════════════════════════════════
   PEDS TAB
══════════════════════════════════════════════════════════════════════ */
function populatePeds() {
    var grid = document.getElementById('peds-grid');
    grid.innerHTML = '';
    if (!cuiConfig.PedList) return;
    cuiConfig.PedList.forEach(function (ped, i) {
        var chip = document.createElement('div');
        chip.className = 'cui-ped-chip';
        chip.innerHTML = esc(ped) + '<button onclick="deletePed(' + i + ')" title="Remove">✕</button>';
        grid.appendChild(chip);
    });
}

function addPed() {
    var input = document.getElementById('new-ped-input');
    var val   = input.value.trim();
    if (!val) { showToast('Enter a ped model name', true); return; }
    if (cuiConfig.PedList.indexOf(val) !== -1) { showToast('Ped already in list', true); return; }
    cuiConfig.PedList.push(val);
    input.value = '';
    populatePeds();
    nuiSave('PedList', cuiConfig.PedList);
}

function deletePed(idx) {
    if (cuiConfig.PedList.length <= 1) { showToast('Must have at least 1 ped', true); return; }
    cuiConfig.PedList.splice(idx, 1);
    populatePeds();
    nuiSave('PedList', cuiConfig.PedList);
}

function savePeds() {
    nuiSave('PedList', cuiConfig.PedList);
}

/* ══════════════════════════════════════════════════════════════════════
   SETTINGS TAB
══════════════════════════════════════════════════════════════════════ */
function populateSettings() {
    if (!cuiConfig) return;
    setVal('s-uicolor',          cuiConfig.UIcolor || '#0ef7d0');
    setVal('s-coprequired',      cuiConfig.CopRequired || 0);
    setVal('s-rejection',        cuiConfig.RejectionChance || 40);
    setVal('s-maxdist',          (cuiConfig.Movement && cuiConfig.Movement.maxdistance) || 100);
    setVal('s-rob-base',         (cuiConfig.RobberyChance && cuiConfig.RobberyChance.base) || 8);
    setVal('s-rob-autosell',     (cuiConfig.RobberyChance && cuiConfig.RobberyChance.autoSellBonus) || 20);
    setCheck('s-autosell-enabled', cuiConfig.AutoSell && cuiConfig.AutoSell.enabled);
    setVal('s-autosell-delay',   (cuiConfig.AutoSell && cuiConfig.AutoSell.delay) || 1500);
    setCheck('s-skill-enabled',  cuiConfig.SkillCheck && cuiConfig.SkillCheck.enabled);
    setVal('s-skill-chance',     (cuiConfig.SkillCheck && cuiConfig.SkillCheck.chance) || 25);
    setVal('s-close-min',        cuiConfig.SpawnCloseMin || 15);
    setVal('s-close-max',        cuiConfig.SpawnCloseMax || 25);
    setVal('s-far-min',          cuiConfig.SpawnFarMin   || 35);
    setVal('s-far-max',          cuiConfig.SpawnFarMax   || 55);
    setVal('s-lb-title',         (cuiConfig.Leaderboard && cuiConfig.Leaderboard.title)      || '');
    setVal('s-lb-subtitle',      (cuiConfig.Leaderboard && cuiConfig.Leaderboard.subtitle)   || '');
    setVal('s-lb-season',        (cuiConfig.Leaderboard && cuiConfig.Leaderboard.seasonText) || '');
    setCheck('s-snitch-enabled', cuiConfig.CustomerSnitch && cuiConfig.CustomerSnitch.enable);
    setVal('s-snitch-chance',    (cuiConfig.CustomerSnitch && cuiConfig.CustomerSnitch.chances) || 30);
    renderBlacklistedJobs();
    renderBonusAreas();
}

function renderBonusAreas() {
    var list = document.getElementById('bonus-areas-list');
    list.innerHTML = '';
    if (!cuiConfig.BonusAreas) return;
    cuiConfig.BonusAreas.forEach(function (a, i) {
        var row = document.createElement('div');
        row.className = 'cui-bonus-row';
        row.innerHTML =
            '<div class="cui-bonus-row-header">' +
                '<span class="cui-bonus-num"><i class="fa-solid fa-location-dot"></i> Zone #' + (i + 1) + '</span>' +
                '<div style="display:flex;gap:6px;align-items:center">' +
                    '<button class="cui-btn-coords" onclick="useMyCoords(' + i + ')">' +
                        '<i class="fa-solid fa-location-crosshairs"></i> Use My Coords</button>' +
                    '<button class="cui-btn-danger" onclick="removeBonusArea(' + i + ')" style="padding:5px 10px">' +
                        '<i class="fa-solid fa-trash"></i></button>' +
                '</div>' +
            '</div>' +
            '<div class="cui-bonus-fields">' +
                field('X',        'ba-x-'   + i, a.x,       'number', '0.001') +
                field('Y',        'ba-y-'   + i, a.y,       'number', '0.001') +
                field('Z',        'ba-z-'   + i, a.z,       'number', '0.001') +
                field('Radius',   'ba-rad-' + i, a.radius,  'number', '0.5')   +
                field('Mult Min', 'ba-mn-'  + i, a.multMin, 'number', '0.05')  +
                field('Mult Max', 'ba-mx-'  + i, a.multMax, 'number', '0.05')  +
            '</div>';
        list.appendChild(row);
    });
}

function useMyCoords(idx) {
    fetch('https://flake_drugselling/getCurrentCoords', { method: 'POST', body: JSON.stringify({}) })
        .then(function (r) { return r.json(); })
        .then(function (coords) {
            if (!coords) return;
            var x = document.getElementById('ba-x-' + idx);
            var y = document.getElementById('ba-y-' + idx);
            var z = document.getElementById('ba-z-' + idx);
            if (x) x.value = parseFloat(coords.x).toFixed(3);
            if (y) y.value = parseFloat(coords.y).toFixed(3);
            if (z) z.value = parseFloat(coords.z).toFixed(3);
            showToast('Coords filled from your position');
        })
        .catch(function () { showToast('Could not get coords', true); });
}

function field(lbl, id, val, type, step) {
    return '<label class="cui-label">' + lbl +
        '<input type="' + type + '" id="' + id + '" class="cui-input" value="' + val + '"' +
        (step ? ' step="' + step + '"' : '') + '></label>';
}

function addBonusArea() {
    cuiConfig.BonusAreas = cuiConfig.BonusAreas || [];
    cuiConfig.BonusAreas.push({ x: 0, y: 0, z: 0, radius: 30, qtyMin: 4, qtyMax: 6, multMin: 1.25, multMax: 1.50 });
    renderBonusAreas();
}

function removeBonusArea(idx) {
    cuiConfig.BonusAreas.splice(idx, 1);
    renderBonusAreas();
}

function readBonusAreas() {
    var areas = [];
    if (!cuiConfig.BonusAreas) return areas;
    cuiConfig.BonusAreas.forEach(function (orig, i) {
        areas.push({
            x:       parseFloat(document.getElementById('ba-x-'   + i).value) || 0,
            y:       parseFloat(document.getElementById('ba-y-'   + i).value) || 0,
            z:       parseFloat(document.getElementById('ba-z-'   + i).value) || 0,
            radius:  parseFloat(document.getElementById('ba-rad-' + i).value) || 30,
            qtyMin:  orig.qtyMin  || 4,
            qtyMax:  orig.qtyMax  || 6,
            multMin: parseFloat(document.getElementById('ba-mn-'  + i).value) || 1,
            multMax: parseFloat(document.getElementById('ba-mx-'  + i).value) || 1,
        });
    });
    return areas;
}

function saveSettings() {
    cuiConfig.UIcolor         = getVal('s-uicolor');
    cuiConfig.CopRequired     = parseInt(getVal('s-coprequired'))  || 0;
    cuiConfig.RejectionChance = parseInt(getVal('s-rejection'))    || 40;
    cuiConfig.Movement        = { maxdistance: parseFloat(getVal('s-maxdist')) || 100 };
    cuiConfig.RobberyChance   = {
        base:          parseInt(getVal('s-rob-base'))     || 8,
        autoSellBonus: parseInt(getVal('s-rob-autosell')) || 20,
    };
    cuiConfig.AutoSell  = { enabled: getCheck('s-autosell-enabled'), delay: parseInt(getVal('s-autosell-delay')) || 1500 };
    cuiConfig.SkillCheck = { enabled: getCheck('s-skill-enabled'), chance: parseInt(getVal('s-skill-chance')) || 25,
        difficulties: ['easy'], keys: ['e', 'd'] };
    cuiConfig.SpawnCloseMin = parseFloat(getVal('s-close-min')) || 15;
    cuiConfig.SpawnCloseMax = parseFloat(getVal('s-close-max')) || 25;
    cuiConfig.SpawnFarMin   = parseFloat(getVal('s-far-min'))   || 35;
    cuiConfig.SpawnFarMax   = parseFloat(getVal('s-far-max'))   || 55;
    cuiConfig.Leaderboard   = {
        title:      getVal('s-lb-title'),
        subtitle:   getVal('s-lb-subtitle'),
        seasonText: getVal('s-lb-season'),
        headerImage: (cuiConfig.Leaderboard && cuiConfig.Leaderboard.headerImage) || '',
    };
    cuiConfig.BonusAreas      = readBonusAreas();
    cuiConfig.CustomerSnitch  = {
        enable:  getCheck('s-snitch-enabled'),
        chances: parseInt(getVal('s-snitch-chance')) || 30,
    };

    // Save each settings section separately so Lua can apply them independently
    if (window.applyUIColor) window.applyUIColor(cuiConfig.UIcolor);
    nuiSave('UIcolor',         cuiConfig.UIcolor);
    nuiSave('CopRequired',     cuiConfig.CopRequired);
    nuiSave('RejectionChance', cuiConfig.RejectionChance);
    nuiSave('Movement',        cuiConfig.Movement);
    nuiSave('RobberyChance',   cuiConfig.RobberyChance);
    nuiSave('AutoSell',        cuiConfig.AutoSell);
    nuiSave('SkillCheck',      cuiConfig.SkillCheck);
    nuiSave('SpawnDistances',  {
        closeMin: cuiConfig.SpawnCloseMin,
        closeMax: cuiConfig.SpawnCloseMax,
        farMin:   cuiConfig.SpawnFarMin,
        farMax:   cuiConfig.SpawnFarMax,
    });
    nuiSave('Leaderboard',     cuiConfig.Leaderboard);
    nuiSave('BonusAreas',      cuiConfig.BonusAreas);
    nuiSave('BlacklistedJobs', cuiConfig.BlacklistedJobs || []);
    nuiSave('CustomerSnitch',  cuiConfig.CustomerSnitch);

    showToast('✓ All settings saved');
}

/* ── Blacklisted Jobs ────────────────────────────────────────────────── */
function renderBlacklistedJobs() {
    var grid = document.getElementById('blacklisted-jobs-grid');
    if (!grid) return;
    grid.innerHTML = '';
    var jobs = cuiConfig.BlacklistedJobs || [];
    jobs.forEach(function (job, i) {
        var chip = document.createElement('div');
        chip.className = 'cui-ped-chip';
        chip.innerHTML = esc(job) + '<button onclick="deleteBlacklistedJob(' + i + ')" title="Remove">✕</button>';
        grid.appendChild(chip);
    });
}

function addBlacklistedJob() {
    var input = document.getElementById('new-job-input');
    var val = input.value.trim().toLowerCase();
    if (!val) { showToast('Enter a job name', true); return; }
    cuiConfig.BlacklistedJobs = cuiConfig.BlacklistedJobs || [];
    if (cuiConfig.BlacklistedJobs.indexOf(val) !== -1) { showToast('Job already in list', true); return; }
    cuiConfig.BlacklistedJobs.push(val);
    input.value = '';
    renderBlacklistedJobs();
}

function deleteBlacklistedJob(idx) {
    cuiConfig.BlacklistedJobs.splice(idx, 1);
    renderBlacklistedJobs();
}

/* ══════════════════════════════════════════════════════════════════════
   NOTIFICATIONS TAB
══════════════════════════════════════════════════════════════════════ */
function populateNotifications() {
    var n = cuiConfig.RankupNotify || {};
    cuiSelectedNotifStyle = n.style || 'none';
    cuiSelectedCardStyle  = (cuiConfig.LevelUpStyle) || 'classic';

    selectNotifStyle(cuiSelectedNotifStyle);
    selectCardStyle(cuiSelectedCardStyle);

    var msgs = n.messages || {};
    setVal('notif-rankup', msgs.rankup     || 'RANK UP! You are now a {label}');
    setVal('notif-car',    msgs.carReward  || 'New car: {reward}');
    setVal('notif-item',   msgs.itemReward || '{amount}x {item} earned');
}

function selectCardStyle(style) {
    cuiSelectedCardStyle = style;
    document.querySelectorAll('.cui-card-style').forEach(function (el) {
        el.classList.toggle('selected', el.getAttribute('data-style') === style);
    });
    // Live preview — apply style to body so the actual level-up card updates
    window.dispatchEvent(new MessageEvent('message', { data: { action: 'setNotifStyle', style: style } }));
}

function selectNotifStyle(style) {
    cuiSelectedNotifStyle = style;
    document.querySelectorAll('.cui-notif-option').forEach(function (el) {
        el.classList.toggle('selected', el.getAttribute('data-value') === style);
    });
}

function saveNotifications() {
    cuiConfig.LevelUpStyle = cuiSelectedCardStyle;
    cuiConfig.RankupNotify = {
        style: cuiSelectedNotifStyle,
        messages: {
            rankup:     getVal('notif-rankup') || 'RANK UP! You are now a {label}',
            carReward:  getVal('notif-car')    || 'New car: {reward}',
            itemReward: getVal('notif-item')   || '{amount}x {item} earned',
        }
    };
    nuiSave('LevelUpStyle', cuiConfig.LevelUpStyle);
    nuiSave('RankupNotify', cuiConfig.RankupNotify);
    showToast('Notifications saved');
}

/* ══════════════════════════════════════════════════════════════════════
   RANK ITEM DROPDOWN (no drug filtering — all items alphabetically)
══════════════════════════════════════════════════════════════════════ */
function buildRankItemDrop(filter) {
    var drop = document.getElementById('rm-item-drop');
    if (!drop) return;
    filter = (filter || '').toLowerCase().trim();
    var items = [];
    cuiAllItems.forEach(function (item) {
        if (filter) {
            var hay = item.name.toLowerCase() + ' ' + (item.label || '').toLowerCase();
            if (hay.indexOf(filter) === -1) return;
        }
        items.push(item);
    });
    var html = '';
    if (items.length) {
        items.forEach(function (item) {
            html += '<div class="cui-item-drop-item" onclick="selectRankItem(\'' +
                esc(item.name) + '\')">' +
                '<span class="item-label">' + esc(item.label || item.name) + '</span>' +
                '<span class="item-name">' + esc(item.name) + '</span></div>';
        });
    } else {
        html = '<div class="cui-item-drop-section" style="color:#555;padding:10px 12px">No items found</div>';
    }
    drop.innerHTML = html;
}

function loadRankItemDrop() {
    if (cuiAllItems.length > 0) { buildRankItemDrop(document.getElementById('rm-item').value); return; }
    fetch('https://flake_drugselling/getInventoryItems', { method: 'POST', body: JSON.stringify({}) })
        .then(function (r) { return r.json(); })
        .then(function (items) { cuiAllItems = items || []; buildRankItemDrop(document.getElementById('rm-item').value); })
        .catch(function () { buildRankItemDrop(''); });
}
function filterRankItemDrop(val) {
    buildRankItemDrop(val);
    var drop = document.getElementById('rm-item-drop');
    if (drop && cuiAllItems.length > 0) drop.classList.add('open');
}
function openRankItemDrop() {
    var drop = document.getElementById('rm-item-drop');
    if (drop) { drop.classList.add('open'); loadRankItemDrop(); }
}
function toggleRankItemDrop() {
    var drop = document.getElementById('rm-item-drop');
    if (!drop) return;
    if (drop.classList.contains('open')) drop.classList.remove('open');
    else openRankItemDrop();
}
function closeRankItemDrop() {
    var drop = document.getElementById('rm-item-drop');
    if (drop) drop.classList.remove('open');
}
function selectRankItem(name) {
    var el = document.getElementById('rm-item');
    if (el) el.value = name;
    closeRankItemDrop();
}

/* ══════════════════════════════════════════════════════════════════════
   VEHICLE DROPDOWN (from SQL vehicles table)
══════════════════════════════════════════════════════════════════════ */
function buildVehicleDrop(filter) {
    var drop = document.getElementById('rm-vehicle-drop');
    if (!drop) return;
    filter = (filter || '').toLowerCase().trim();
    var vehicles = [];
    cuiAllVehicles.forEach(function (model) {
        if (!filter || model.toLowerCase().indexOf(filter) !== -1) vehicles.push(model);
    });
    var html = '';
    if (vehicles.length) {
        vehicles.forEach(function (model) {
            html += '<div class="cui-item-drop-item" onclick="selectVehicle(\'' + esc(model) + '\')">' +
                '<span class="item-label"><i class="fa-solid fa-car" style="margin-right:6px;opacity:.5;font-size:11px"></i>' + esc(model) + '</span></div>';
        });
    } else if (cuiAllVehicles.length === 0) {
        html = '<div class="cui-item-drop-section" style="color:#555;padding:10px 12px">No vehicles table found — type model name manually</div>';
    } else {
        html = '<div class="cui-item-drop-section" style="color:#555;padding:10px 12px">No vehicles found</div>';
    }
    drop.innerHTML = html;
}

function loadVehicleDrop() {
    if (cuiAllVehicles.length > 0) { buildVehicleDrop(document.getElementById('rm-vehicle').value); return; }
    fetch('https://flake_drugselling/getVehicles', { method: 'POST', body: JSON.stringify({}) })
        .then(function (r) { return r.json(); })
        .then(function (v) { cuiAllVehicles = v || []; buildVehicleDrop(document.getElementById('rm-vehicle').value); })
        .catch(function () { buildVehicleDrop(''); });
}
function filterVehicleDrop(val) {
    buildVehicleDrop(val);
    var drop = document.getElementById('rm-vehicle-drop');
    if (drop) drop.classList.add('open');
}
function openVehicleDrop() {
    var drop = document.getElementById('rm-vehicle-drop');
    if (drop) { drop.classList.add('open'); loadVehicleDrop(); }
}
function toggleVehicleDrop() {
    var drop = document.getElementById('rm-vehicle-drop');
    if (!drop) return;
    if (drop.classList.contains('open')) drop.classList.remove('open');
    else openVehicleDrop();
}
function closeVehicleDrop() {
    var drop = document.getElementById('rm-vehicle-drop');
    if (drop) drop.classList.remove('open');
}
function selectVehicle(model) {
    var el = document.getElementById('rm-vehicle');
    if (el) el.value = model;
    closeVehicleDrop();
}

/* ══════════════════════════════════════════════════════════════════════
   ITEM DROPDOWN
══════════════════════════════════════════════════════════════════════ */
function isDrugItem(name, label) {
    var s = (name + ' ' + (label || '')).toLowerCase();
    return DRUG_KEYWORDS.some(function (kw) { return s.indexOf(kw) !== -1; });
}

function loadItemDrop() {
    if (cuiAllItems.length > 0) { buildItemDrop(document.getElementById('dm-id').value); return; }
    fetch('https://flake_drugselling/getInventoryItems', { method: 'POST', body: JSON.stringify({}) })
        .then(function (r) { return r.json(); })
        .then(function (items) {
            cuiAllItems = items || [];
            buildItemDrop(document.getElementById('dm-id').value);
        })
        .catch(function () { buildItemDrop(''); });
}

function buildItemDrop(filter) {
    var drop = document.getElementById('dm-id-drop');
    if (!drop) return;
    filter = (filter || '').toLowerCase().trim();
    var drugs = [], others = [];
    cuiAllItems.forEach(function (item) {
        if (filter) {
            var hay = item.name.toLowerCase() + ' ' + (item.label || '').toLowerCase();
            if (hay.indexOf(filter) === -1) return;
        }
        if (isDrugItem(item.name, item.label)) drugs.push(item);
        else others.push(item);
    });

    var html = '';
    if (drugs.length) {
        html += '<div class="cui-item-drop-section"><i class="fa-solid fa-pills"></i> Drug Items</div>';
        drugs.forEach(function (item) {
            html += '<div class="cui-item-drop-item cui-item-drop-drug" onclick="selectDrugItem(\'' +
                esc(item.name) + '\',\'' + esc(item.label || item.name) + '\')">' +
                '<span class="item-label">' + esc(item.label || item.name) + '</span>' +
                '<span class="item-name">' + esc(item.name) + '</span></div>';
        });
    }
    if (others.length) {
        if (drugs.length) html += '<div class="cui-item-drop-section">All Other Items</div>';
        else if (!filter) html += '<div class="cui-item-drop-section">All Items</div>';
        others.forEach(function (item) {
            html += '<div class="cui-item-drop-item" onclick="selectDrugItem(\'' +
                esc(item.name) + '\',\'' + esc(item.label || item.name) + '\')">' +
                '<span class="item-label">' + esc(item.label || item.name) + '</span>' +
                '<span class="item-name">' + esc(item.name) + '</span></div>';
        });
    }
    if (!html) html = '<div class="cui-item-drop-section" style="color:#555;padding:10px 12px">No items found</div>';
    drop.innerHTML = html;
}

function filterItemDrop(val) {
    buildItemDrop(val);
    var drop = document.getElementById('dm-id-drop');
    if (drop && cuiAllItems.length > 0) drop.classList.add('open');
}

function openItemDrop() {
    var drop = document.getElementById('dm-id-drop');
    if (!drop) return;
    drop.classList.add('open');
    loadItemDrop();
}

function toggleItemDrop() {
    var drop = document.getElementById('dm-id-drop');
    if (!drop) return;
    if (drop.classList.contains('open')) {
        drop.classList.remove('open');
    } else {
        openItemDrop();
    }
}

function closeItemDrop() {
    var drop = document.getElementById('dm-id-drop');
    if (drop) drop.classList.remove('open');
}

function selectDrugItem(name, label) {
    var idEl  = document.getElementById('dm-id');
    var lblEl = document.getElementById('dm-label');
    if (idEl)  idEl.value  = name;
    if (lblEl && !lblEl.value) lblEl.value = label;
    closeItemDrop();
}

/* ── Helpers ─────────────────────────────────────────────────────────── */
function setVal(id, val) {
    var el = document.getElementById(id);
    if (el) el.value = val != null ? val : '';
}
function getVal(id) {
    var el = document.getElementById(id);
    return el ? el.value : '';
}
function setCheck(id, val) {
    var el = document.getElementById(id);
    if (el) el.checked = !!val;
}
function getCheck(id) {
    var el = document.getElementById(id);
    return el ? el.checked : false;
}
function esc(str) {
    return String(str)
        .replace(/&/g,'&amp;')
        .replace(/</g,'&lt;')
        .replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;');
}
