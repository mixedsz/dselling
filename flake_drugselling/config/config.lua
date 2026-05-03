Config = {}

Config.ESXgetSharedObject = 'es_extended'
Config.QBCoreGetCoreObject = 'qb-core'
Config.NpcFightOnReject = true
Config.RejectionChance = 40
Config.System = 'textui'  -- 'textui' | 'ox_target' | 'qb-target'
Config.NpcFightOnReject = true
Config.QBoxVehicleFix = false -- true = to fix the giving vehicle issue with QBox ONLY. (leave it false if you don't use QBox)
Config.Debug = true -- Enable debug commands (testcarlevelup, testitemlevelup, testrankup)
Config.UIcolor = "#13479b"  -- Main UI color (hex format). Default: #10b981 (green). Examples: "#3b82f6" (blue), "#ef4444" (red), "#8b5cf6" (purple)
Config.CopRequired = 0
Config.SpawnCloseMin = 15.0   -- minimum distance for close-range attempt (would not bother editing)
Config.SpawnCloseMax = 25.0   -- maximum distance for close-range attempt (would not bother editing)
Config.SpawnFarMin   = 35.0   -- minimum distance for far-range fallback (would not bother editing)
Config.SpawnFarMax   = 55.0   -- maximum distance for far-range fallback (would not bother editing)
-- Max meters the road node can deviate from the ideal spawn point (avoids circling on MLO maps) 
Config.SpawnWaypointMaxSnapOffLine = 25.0 -- (would not bother editing)

--#Command
Config.Commands = {
    enable = true,
    startcommands = { 'drugsell' },
    stopcommand = "stopdrugsell",
    leaderboard = "trapleaderboard"  -- Command to open leaderboard
}


--#Leaderboard Settings
Config.Leaderboard = {
    title = "TOP HOODVILLE DEALERS",  -- Leaderboard title text
    subtitle = "Top drug dealers ranking by total XP",  -- Subtitle text
    headerImage = "",  -- URL or path to header image (leave empty for trophy emoji, or use: "https://i.imgur.com/yourimage.png")
    seasonText = "📅 CURRENT SEASON: Summer 2026"  -- Footer season text
}

--#Item
Config.SalesItem = {
    enable = false,
    phoneitem = 'trapphone' -- Item name for phone (opens menu to start/stop selling) -- U NEED TO ADD client = { export = 'flake_drugselling.usePhone'
}

--#Movement Settings
Config.Movement = {
    maxdistance = 100.0 -- Maximum distance player can move from start location (in meters). 100 = about 1 block
}


--#Currency
Config.Account = {
    type = 'account',        -- 'item' or 'account'
    payment = 'black_money'      -- { ESX - 'money' for cash / 'black_money' for Dirty Money  |  QBCore - 'cash' / 'bank' / 'markedbills' }
}

Config.SkillCheck = {
    enabled = false,      -- Toggle the skill check system on/off
    chance = 25,         -- % chance (0-100) that a skill check will be required for a sale
    difficulties = {'easy'},  -- EXAMPLE: {'easy', 'easy', { areaSize = 60, speedMultiplier = 2 }, 'hard'}
    keys = {'e', 'd'}
}

--#Auto Sell Settings
Config.AutoSell = {
    enabled = false,     -- If true, sales trigger automatically when the ped is in range (no target click needed)
                         -- Players still use /drugsell to start and /stopdrugsell to stop
    delay = 1500,        -- Milliseconds the ped must be in range before the sale auto-triggers (min recommended: 1000)
}


--#Blacklisted Jobs
Config.BlacklistedJobs = {
    'police',
    'ambulance',
    --add more jobs if you want
}

Config.RobberyChance = {
    base          = 8,   -- % chance an NPC will rob the player during a normal sale
    autoSellBonus = 20,  -- % chance when Config.AutoSell.enabled = true
                         -- (AutoSell is riskier – less attention paid, easier to get robbed)
}

Config.SellList = {

    ['crack1g'] = {
        label = 'Coke pooch',
        quantity = {min = 1, max = 5},
        price = {min = 790, max = 960},
        reject = 5,
        addpoints = 500,
    },
    ['meth_pooch'] = {
        label = 'meth pooch',
        quantity = {min = 1, max = 5},
        price = {min = 740, max = 860},
        reject = 5,
        addpoints = 100,
    },
    ['sugarrush'] = {
        label = 'Sugar Rush',
        quantity = {min = 1, max = 5},
        price = {min = 840, max = 960},
        reject = 5,
        addpoints = 100,
    },
    ['dolldust'] = {
        label = 'Doll Dust',
        quantity = {min = 1, max = 5},
        price = {min = 840, max = 1060},
        reject = 5,
        addpoints = 100,
    },
}

--#Restricted Selling Zones
Config.RestrictedZones = {
    enabled = false,  -- Set to true to ONLY allow selling in defined zones
    zones = {
        {
            name = "Grove Street",
            coords = vector3(1375.609, -741.0916, 67.232),
            radius = 50.0,
        },
        {
            name = "Davis",
            coords = vector3(278.6338, -1949.548, 22.79),
            radius = 60.0,
        },
        -- Add more restricted zones here
    }
}

-- # Bonus Areas - Optional zones that give better prices/quantities (works with or without restricted zones)
Config.BonusAreas = {
    {
        coords = vector3(1375.609, -741.0916, 67.232),
        radius = 28.0,
        quantity = {min = 4, max = 6},
        multiplier = {min = 1.25, max = 1.50},
    },
    {
        coords = vector3(278.6338, -1949.548, 22.79),
        radius = 48.0,
        quantity = {min = 4, max = 6},
        multiplier = {min = 1.25, max = 1.50},
    },
}


Config.DealerRank = 'traprank'
Config.Ranks = {
    [1] = { points = 1000,  percentmore = 0,  label = 'Corner Boy' },
    [2] = { points = 2000,  percentmore = 5,  label = 'Trapper', rewards = { type = 'car', reward = 'sultan' } },
    [3] = { points = 3000, percentmore = 10, label = 'Trap Star', rewards = { type = 'item', reward = { 'armour', amount = 1 } } },
    [4] = { points = 150000, percentmore = 10, label = 'OG', rewards = { type = 'car', reward = 'sultan2' } },
    [5] = { points = 200000, percentmore = 15, label = 'Kingpin', rewards = { type = 'car', reward = 'sultan2' } },
}
Config.Discord = {
    botName = 'Drug Leaderboard',
    botAvatar = 'https://r2.fivemanage.com/iXlkbXHVCnElhfGg0KkbF/mercury_pfp.gif', -- Bot avatar/profile picture
    updateInterval = 3600000, -- Update every hour (in milliseconds) - Set to 0 to disable auto-updates
    embedColor = 15158332, -- Red color for embed (decimal)
    title = '🏆 Top 10 Drug Dealers Leaderboard',
    description = 'Here are the top 10 players based on their drug selling experience!',
    thumbnail = nil, -- Optional: Set thumbnail URL
    footer = 'Updated automatically Every Hour',
    footerIcon = nil -- Optional: Set footer icon URL
}

Config.PedList = {
    [1] = 'g_m_importexport_01',
    [2] = 'g_m_y_ballaeast_01',
    [3] = 'g_m_y_ballaorig_01',
    [4] = 'g_m_y_azteca_01',
    [5] = 'g_m_y_armgoon_02',
    [6] = 'g_m_y_famdnf_01',
    [7] = 'g_m_y_famca_01',
    [8] = 'g_m_y_ballasout_01',
    [9] = 'g_m_y_mexgoon_02',
    [10] = 'g_m_y_salvaboss_01',
}
