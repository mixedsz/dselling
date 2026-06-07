-- On resource start, explicitly request config from the server.
-- This guarantees settings apply even if the server's startup broadcast
-- fired before this client had its applyConfig handler registered.
CreateThread(function()
    Wait(1500)
    TriggerServerEvent('flake_drugselling:requestConfig')
end)

-- Receives the broadcast payload (UI flat-format) and rebuilds proper Lua tables
RegisterNetEvent('flake_drugselling:applyConfig', function(data)
    -- Ranks arrive in UI flat format; rebuild as cl_rank.lua expects
    if data.Ranks then
        local ranks = {}
        for i, r in ipairs(data.Ranks) do
            local entry = {
                points      = r.points,
                percentmore = r.percentmore,
                label       = r.label,
            }
            if r.rewardType and r.rewardType ~= 'none' then
                if r.rewardType == 'car' then
                    entry.rewards = { type = 'car', reward = r.rewardVehicle or '' }
                elseif r.rewardType == 'item' then
                    -- Rebuild mixed table so reward[1] works in cl_notifications
                    entry.rewards = { type = 'item', reward = { r.rewardItem or '', amount = r.rewardAmount or 1 } }
                end
            end
            ranks[i] = entry
        end
        Config.Ranks = ranks
    end

    if data.PedList         then Config.PedList         = data.PedList         end
    if data.SellList        then Config.SellList        = data.SellList        end
    if data.UIcolor         then Config.UIcolor         = data.UIcolor         end
    if data.RobberyChance   then Config.RobberyChance   = data.RobberyChance   end
    if data.AutoSell        then Config.AutoSell         = data.AutoSell        end
    if data.SkillCheck      then Config.SkillCheck       = data.SkillCheck      end
    if data.Movement        then Config.Movement         = data.Movement        end
    if data.CopRequired     then Config.CopRequired      = data.CopRequired     end
    if data.RejectionChance then Config.RejectionChance  = data.RejectionChance end
    if data.SpawnCloseMin   then Config.SpawnCloseMin    = data.SpawnCloseMin   end
    if data.SpawnCloseMax   then Config.SpawnCloseMax    = data.SpawnCloseMax   end
    if data.SpawnFarMin     then Config.SpawnFarMin      = data.SpawnFarMin     end
    if data.SpawnFarMax     then Config.SpawnFarMax      = data.SpawnFarMax     end
    if data.Leaderboard     then Config.Leaderboard      = data.Leaderboard     end
    if data.RankupNotify    then Config.RankupNotify     = data.RankupNotify    end
    if data.LevelUpStyle    then Config.LevelUpStyle     = data.LevelUpStyle    end
    if data.BlacklistedJobs then Config.BlacklistedJobs  = data.BlacklistedJobs end
    if data.CustomerSnitch  then Config.CustomerSnitch   = data.CustomerSnitch  end

    if data.LevelUpStyle then
        SendNUIMessage({ action = 'setNotifStyle', style = data.LevelUpStyle })
    end
    if data.UIcolor then
        SendNUIMessage({ action = 'updateColor', color = data.UIcolor })
    end
end)

RegisterCommand('trapadmin', function()
    lib.callback('flake_drugselling:getConfigForUI', false, function(cfg)
        if not cfg then
            Config.Notify('You do not have permission to access the config panel.', 'error')
            return
        end
        SetNuiFocus(true, true)
        SendNUIMessage({ action = 'openConfigUI', config = cfg })
    end)
end, false)

RegisterNUICallback('closeConfigUI', function(_, cb)
    SetNuiFocus(false, false)
    cb('ok')
end)

RegisterNUICallback('saveConfig', function(data, cb)
    TriggerServerEvent('flake_drugselling:saveConfig', data.section, data.data)
    cb('ok')
end)

RegisterNUICallback('getCurrentCoords', function(_, cb)
    local coords = GetEntityCoords(PlayerPedId())
    cb({ x = coords.x, y = coords.y, z = coords.z })
end)

RegisterNUICallback('getInventoryItems', function(_, cb)
    lib.callback('flake_drugselling:getInventoryItems', false, function(items)
        cb(items or {})
    end)
end)

RegisterNUICallback('getVehicles', function(_, cb)
    lib.callback('flake_drugselling:getVehicles', false, function(vehicles)
        cb(vehicles or {})
    end)
end)
