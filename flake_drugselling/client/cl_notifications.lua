local _origNotify = Config.Notify  -- ox_lib from edits.lua

local function sendCustomNotif(message, notifType)
    SendNUIMessage({ action = 'showCustomNotif', message = tostring(message), notifType = notifType or 'success' })
end

-- Replace Config.Notify globally so every call in the script (cl_sales, etc.) uses the right style
local function applyNotifStyle(style)
    if style == 'custom' then
        Config.Notify = function(msg, t)
            sendCustomNotif(msg, t)
        end
    elseif style == 'esx' then
        Config.Notify = function(msg, t)
            if ESX then ESX.ShowNotification(tostring(msg)) else _origNotify(msg, t) end
        end
    elseif style == 'qb' then
        Config.Notify = function(msg, t)
            if QBCore then QBCore.Functions.Notify(tostring(msg), t, 5000) else _origNotify(msg, t) end
        end
    elseif style == 'ox_lib' then
        Config.Notify = function(msg, t)
            lib.notify({ title = 'Drug Selling', description = tostring(msg), type = t or 'success', duration = 5000 })
        end
    else
        Config.Notify = _origNotify
    end
end

-- Re-apply whenever the server broadcasts a config update
RegisterNetEvent('flake_drugselling:applyConfig', function(data)
    if data and data.RankupNotify then
        applyNotifStyle(data.RankupNotify.style or 'none')
    end
end)

-- Apply on startup (config.lua default is 'none', DB override arrives via applyConfig shortly after)
Citizen.CreateThread(function()
    applyNotifStyle(Config.RankupNotify and Config.RankupNotify.style or 'none')
end)

-- General net event — just call Config.Notify which is already overridden above
RegisterNetEvent('flake_drugsellingCL:notify', function(message, notifType)
    Config.Notify(message, notifType)
end)

-- Rank-up notification
AddEventHandler('flake_drugselling:rankupNotify', function(rank, label, rewardType, rewards)
    local style = Config.RankupNotify and Config.RankupNotify.style or 'none'
    if style == 'none' then return end

    local msgs = (Config.RankupNotify and Config.RankupNotify.messages) or {}

    local function fmt(template, vars)
        local s = template
        for k, v in pairs(vars) do s = s:gsub('{' .. k .. '}', tostring(v)) end
        return s
    end

    Config.Notify(fmt(msgs.rankup or 'RANK UP! You are now a {label}', { rank = rank, label = label }), 'success')

    if rewardType and rewards then
        Citizen.Wait(1500)
        if rewardType == 'car' then
            local carName = type(rewards.reward) == 'string' and rewards.reward or ''
            Config.Notify(fmt(msgs.carReward or 'You earned a new car: {reward}', { reward = carName }), 'inform')
        elseif rewardType == 'item' then
            local reward   = rewards.reward
            local itemName = type(reward) == 'table' and (reward[1] or reward.item or '') or ''
            local amount   = type(reward) == 'table' and (reward.amount or 1) or 1
            Config.Notify(fmt(msgs.itemReward or 'You earned: {amount}x {item}', { item = itemName, amount = amount }), 'inform')
        end
    end
end)
