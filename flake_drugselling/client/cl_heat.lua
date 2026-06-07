-- ============================================================
-- AREA HEAT SYSTEM
-- Tracks how "hot" the current selling area is.
-- High heat = higher dispatch chance, higher rejection chance.
-- Heat builds with each sale and cools passively over time.
-- ============================================================

local heatLevel    = 0
local lastSaleTime = 0

local heatLabels = { 'COLD', 'WARM', 'HOT', 'SCORCHING', 'INFERNO' }

function GetHeatLevel()
    return heatLevel
end

function GetHeatTier()
    if     heatLevel < 20 then return 1
    elseif heatLevel < 40 then return 2
    elseif heatLevel < 60 then return 3
    elseif heatLevel < 80 then return 4
    else                        return 5
    end
end

function GetHeatLabel()
    return heatLabels[GetHeatTier()] or 'COLD'
end

function AddHeat()
    if not Config.HeatSystem or not Config.HeatSystem.enabled then return end
    lastSaleTime = GetGameTimer()
    heatLevel    = math.min(100, heatLevel + (Config.HeatSystem.increasePerSale or 20))
    UpdateHeatUI()
end

function GetHeatDispatchBonus()
    if not Config.HeatSystem or not Config.HeatSystem.enabled then return 0 end
    local bonuses = Config.HeatSystem.dispatchBonus or { 0, 10, 20, 35, 50 }
    return bonuses[GetHeatTier()] or 0
end

function GetHeatRejectBonus()
    if not Config.HeatSystem or not Config.HeatSystem.enabled then return 0 end
    local bonuses = Config.HeatSystem.rejectBonus or { 0, 5, 10, 15, 25 }
    return bonuses[GetHeatTier()] or 0
end

function ShowHeatIndicator()
    if not Config.HeatSystem or not Config.HeatSystem.enabled then return end
    if heatLevel > 0 then UpdateHeatUI() end
end

function HideHeatIndicator()
    SendNUIMessage({ action = 'hideHeatIndicator' })
end

function UpdateHeatUI()
    SendNUIMessage({
        action = 'updateHeat',
        heat   = heatLevel,
        tier   = GetHeatTier(),
        label  = GetHeatLabel(),
    })
end

-- Passive cooldown: starts after Config.HeatSystem.cooldownDelay seconds of no sales
Citizen.CreateThread(function()
    while true do
        Wait(1000)
        if heatLevel > 0 and lastSaleTime > 0 then
            local elapsed = (GetGameTimer() - lastSaleTime) / 1000
            local delay   = Config.HeatSystem and Config.HeatSystem.cooldownDelay or 20
            if elapsed > delay then
                local rate = Config.HeatSystem and Config.HeatSystem.cooldownRate or 3
                heatLevel  = math.max(0, heatLevel - rate)
                UpdateHeatUI()
                if heatLevel == 0 then
                    HideHeatIndicator()
                end
            end
        end
    end
end)
