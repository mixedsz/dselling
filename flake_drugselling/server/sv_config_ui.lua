local overrides   = {}
local configReady = false
local pendingConfigRequests = {}

-- ── Format helpers ────────────────────────────────────────────────────

local function buildRanksFromUI(uiRanks)
    local ranks = {}
    for i, r in ipairs(uiRanks) do
        local entry = {
            points      = r.points,
            percentmore = r.percentmore,
            label       = r.label,
        }
        if r.rewardType and r.rewardType ~= 'none' then
            if r.rewardType == 'car' then
                entry.rewards = { type = 'car', reward = r.rewardVehicle or '' }
            elseif r.rewardType == 'item' then
                entry.rewards = { type = 'item', reward = { r.rewardItem or '', amount = r.rewardAmount or 1 } }
            end
        end
        ranks[i] = entry
    end
    return ranks
end

local function buildSellListFromUI(uiDrugs)
    local list = {}
    for _, d in ipairs(uiDrugs) do
        if d.id and d.id ~= '' then
            list[d.id] = {
                label     = d.label,
                quantity  = { min = d.qtyMin,   max = d.qtyMax   },
                price     = { min = d.priceMin, max = d.priceMax },
                reject    = d.reject or 5,
                addpoints = d.points,
            }
        end
    end
    return list
end

local function buildBonusAreasFromUI(uiAreas)
    local areas = {}
    for i, a in ipairs(uiAreas) do
        areas[i] = {
            coords     = vector3(a.x, a.y, a.z),
            radius     = a.radius,
            quantity   = { min = a.qtyMin,  max = a.qtyMax  },
            multiplier = { min = a.multMin, max = a.multMax },
        }
    end
    return areas
end

-- ── Apply overrides to Config table ──────────────────────────────────

local function applyOverrides()
    if overrides.SellList    then Config.SellList        = buildSellListFromUI(overrides.SellList)     end
    if overrides.Ranks       then Config.Ranks           = buildRanksFromUI(overrides.Ranks)            end
    if overrides.PedList     then Config.PedList         = overrides.PedList                            end
    if overrides.BonusAreas  then Config.BonusAreas      = buildBonusAreasFromUI(overrides.BonusAreas)  end
    if overrides.UIcolor     then Config.UIcolor         = overrides.UIcolor                            end
    if overrides.RobberyChance   then Config.RobberyChance   = overrides.RobberyChance                 end
    if overrides.AutoSell        then Config.AutoSell         = overrides.AutoSell                      end
    if overrides.SkillCheck      then Config.SkillCheck       = overrides.SkillCheck                    end
    if overrides.Movement        then Config.Movement         = overrides.Movement                      end
    if overrides.CopRequired     then Config.CopRequired      = overrides.CopRequired                   end
    if overrides.RejectionChance then Config.RejectionChance  = overrides.RejectionChance               end
    if overrides.SpawnDistances  then
        local d = overrides.SpawnDistances
        Config.SpawnCloseMin = d.closeMin
        Config.SpawnCloseMax = d.closeMax
        Config.SpawnFarMin   = d.farMin
        Config.SpawnFarMax   = d.farMax
    end
    if overrides.Leaderboard     then Config.Leaderboard     = overrides.Leaderboard     end
    if overrides.RankupNotify    then Config.RankupNotify    = overrides.RankupNotify    end
    if overrides.LevelUpStyle    then Config.LevelUpStyle    = overrides.LevelUpStyle    end
    if overrides.BlacklistedJobs then Config.BlacklistedJobs = overrides.BlacklistedJobs end
    if overrides.CustomerSnitch  then Config.CustomerSnitch  = overrides.CustomerSnitch  end
end

-- ── UI payload (JS config panel) ─────────────────────────────────────
-- Converts server Config.* to the flat format JavaScript expects.

local function sellListForUI()
    local drugs = {}
    for itemName, drug in pairs(Config.SellList) do
        drugs[#drugs + 1] = {
            id       = itemName,
            label    = drug.label,
            priceMin = drug.price.min,
            priceMax = drug.price.max,
            qtyMin   = drug.quantity.min,
            qtyMax   = drug.quantity.max,
            points   = drug.addpoints,
            reject   = drug.reject or 5,
        }
    end
    return drugs
end

local function ranksForUI()
    local ranks = {}
    for i, rank in ipairs(Config.Ranks) do
        local r = {
            points        = rank.points,
            percentmore   = rank.percentmore,
            label         = rank.label,
            rewardType    = 'none',
            rewardVehicle = '',
            rewardItem    = '',
            rewardAmount  = 1,
        }
        if rank.rewards then
            r.rewardType = rank.rewards.type or 'none'
            if rank.rewards.type == 'car' then
                r.rewardVehicle = rank.rewards.reward or ''
            elseif rank.rewards.type == 'item' then
                local rwd = rank.rewards.reward
                r.rewardItem   = type(rwd) == 'table' and (rwd[1] or rwd.item or '') or ''
                r.rewardAmount = type(rwd) == 'table' and (rwd.amount or 1) or 1
            end
        end
        ranks[i] = r
    end
    return ranks
end

local function bonusAreasForUI()
    local areas = {}
    for i, area in ipairs(Config.BonusAreas) do
        local c = area.coords
        areas[i] = {
            x       = c.x,
            y       = c.y,
            z       = c.z,
            radius  = area.radius,
            qtyMin  = area.quantity.min,
            qtyMax  = area.quantity.max,
            multMin = area.multiplier.min,
            multMax = area.multiplier.max,
        }
    end
    return areas
end

-- Full payload for the JavaScript config panel
local function buildUIPayload()
    return {
        SellList        = sellListForUI(),
        Ranks           = ranksForUI(),
        PedList         = Config.PedList,
        BonusAreas      = bonusAreasForUI(),
        UIcolor         = Config.UIcolor,
        RobberyChance   = Config.RobberyChance,
        AutoSell        = Config.AutoSell,
        SkillCheck      = Config.SkillCheck,
        Movement        = Config.Movement,
        CopRequired     = Config.CopRequired,
        RejectionChance = Config.RejectionChance,
        SpawnCloseMin   = Config.SpawnCloseMin,
        SpawnCloseMax   = Config.SpawnCloseMax,
        SpawnFarMin     = Config.SpawnFarMin,
        SpawnFarMax     = Config.SpawnFarMax,
        Leaderboard     = Config.Leaderboard,
        RankupNotify    = Config.RankupNotify,
        LevelUpStyle    = Config.LevelUpStyle,
        BlacklistedJobs = Config.BlacklistedJobs or {},
        CustomerSnitch  = Config.CustomerSnitch  or { enable = false, chances = 30 },
    }
end

-- Payload for Lua game clients; clients rebuild proper Lua tables via applyConfig handler
local function buildClientPayload()
    return {
        Ranks           = ranksForUI(),
        PedList         = Config.PedList,
        SellList        = Config.SellList,
        UIcolor         = Config.UIcolor,
        RobberyChance   = Config.RobberyChance,
        AutoSell        = Config.AutoSell,
        SkillCheck      = Config.SkillCheck,
        Movement        = Config.Movement,
        CopRequired     = Config.CopRequired,
        RejectionChance = Config.RejectionChance,
        SpawnCloseMin   = Config.SpawnCloseMin,
        SpawnCloseMax   = Config.SpawnCloseMax,
        SpawnFarMin     = Config.SpawnFarMin,
        SpawnFarMax     = Config.SpawnFarMax,
        Leaderboard     = Config.Leaderboard,
        RankupNotify    = Config.RankupNotify,
        LevelUpStyle    = Config.LevelUpStyle,
        BlacklistedJobs = Config.BlacklistedJobs or {},
        CustomerSnitch  = Config.CustomerSnitch  or { enable = false, chances = 30 },
    }
end

-- ── Startup ───────────────────────────────────────────────────────────

CreateThread(function()
    MySQL.query.await([[
        CREATE TABLE IF NOT EXISTS `flake_drugselling_config` (
            `id` INT AUTO_INCREMENT PRIMARY KEY,
            `config_key` VARCHAR(255) UNIQUE NOT NULL,
            `config_value` LONGTEXT NOT NULL,
            `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ]])

    local rows = MySQL.query.await('SELECT config_key, config_value FROM flake_drugselling_config')
    if rows then
        for _, row in ipairs(rows) do
            overrides[row.config_key] = json.decode(row.config_value)
        end
    end

    applyOverrides()
    print('^2[Drug Selling]^7 Config UI overrides loaded.')

    -- Mark config as ready and serve any clients that requested before DB finished
    configReady = true
    for _, src in ipairs(pendingConfigRequests) do
        TriggerClientEvent('flake_drugselling:applyConfig', src, buildClientPayload())
    end
    pendingConfigRequests = {}

    -- Push saved config to any players already online (handles resource restarts)
    TriggerClientEvent('flake_drugselling:applyConfig', -1, buildClientPayload())
end)

-- ── Admin group check ────────────────────────────────────────────────
-- Supports ESX groups, QBCore permissions, and vanilla ace groups.

local function hasConfigAccess(src)
    if ESX then
        local xPlayer = ESX.GetPlayerFromId(src)
        if xPlayer then
            for _, group in ipairs(Config.ConfigUIGroups) do
                if xPlayer.getGroup() == group then return true end
            end
        end
        return false
    elseif QBCore then
        for _, group in ipairs(Config.ConfigUIGroups) do
            if QBCore.Functions.HasPermission(src, group) then return true end
        end
        return false
    end
    -- Fallback: vanilla FiveM ace groups (add_principal identifier.xxx group.admin)
    for _, group in ipairs(Config.ConfigUIGroups) do
        if IsPlayerAceAllowed(src, 'group.' .. group) then return true end
    end
    return false
end

-- ── Callbacks & events ────────────────────────────────────────────────

lib.callback.register('flake_drugselling:getConfigForUI', function(src)
    if not hasConfigAccess(src) then return nil end
    return buildUIPayload()
end)

lib.callback.register('flake_drugselling:getInventoryItems', function(src)
    if not hasConfigAccess(src) then return {} end
    local ok, items = pcall(function() return exports.ox_inventory:Items() end)
    if not ok or not items then return {} end
    local result = {}
    for name, item in pairs(items) do
        result[#result + 1] = { name = name, label = item.label or name }
    end
    table.sort(result, function(a, b) return a.name < b.name end)
    return result
end)

lib.callback.register('flake_drugselling:getVehicles', function(src)
    if not hasConfigAccess(src) then return {} end
    local ok, rows = pcall(function()
        return MySQL.query.await('SELECT DISTINCT model FROM vehicles ORDER BY model ASC')
    end)
    if not ok or not rows then return {} end
    local result = {}
    for _, row in ipairs(rows) do
        if row.model and row.model ~= '' then
            result[#result + 1] = row.model
        end
    end
    return result
end)

RegisterNetEvent('flake_drugselling:saveConfig', function(section, data)
    local src = source
    if not hasConfigAccess(src) then return end

    overrides[section] = data

    MySQL.insert([[
        INSERT INTO flake_drugselling_config (config_key, config_value)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE config_value = VALUES(config_value)
    ]], { section, json.encode(data) })

    applyOverrides()
    TriggerClientEvent('flake_drugselling:applyConfig', -1, buildClientPayload())
    print('^2[Drug Selling]^7 Config "' .. tostring(section) .. '" updated by #' .. tostring(src))
end)

-- Push live config to players on join so they get any active overrides
AddEventHandler('esx:playerLoaded', function(playerId)
    SetTimeout(4000, function()
        TriggerClientEvent('flake_drugselling:applyConfig', playerId, buildClientPayload())
    end)
end)

AddEventHandler('QBCore:Server:PlayerLoaded', function(Player)
    local pid = Player.PlayerData.source
    SetTimeout(4000, function()
        TriggerClientEvent('flake_drugselling:applyConfig', pid, buildClientPayload())
    end)
end)

-- ── Client config request (on resource restart the client asks the server
--    for config rather than relying solely on the server broadcast) ────────
RegisterNetEvent('flake_drugselling:requestConfig', function()
    local src = source
    if configReady then
        TriggerClientEvent('flake_drugselling:applyConfig', src, buildClientPayload())
    else
        -- DB still loading — queue and serve once ready
        table.insert(pendingConfigRequests, src)
    end
end)
