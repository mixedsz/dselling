Config = {}

Config.Debug = false -- Enable debug commands (testcarlevelup, testitemlevelup, testrankup)

-- ── Framework ─────────────────────────────────────────────────────────
Config.ESXgetSharedObject  = 'es_extended'
Config.QBCoreGetCoreObject = 'qb-core'
Config.System              = 'textui'  -- 'textui' | 'ox_target' | 'qb-target'
Config.DealerRank          = 'traprank'
Config.NpcFightOnReject    = true
Config.QBoxVehicleFix      = false -- true only if you use QBox

-- ── Commands (not in UI) ──────────────────────────────────────────────
Config.Commands = {
    enable        = true,
    startcommands = { 'trap' },
    stopcommand   = 'stoptrap',
    leaderboard   = 'trapleaderboard'
}

-- ── Sales item (not in UI) ────────────────────────────────────────────
Config.SalesItem = {
    enable    = false,
    phoneitem = 'trapphone'
}

-- ── Currency (not in UI) ─────────────────────────────────────────────
Config.Account = {
    type    = 'account',
    payment = 'black_money'
}

-- ── Restricted zones (not in UI) ─────────────────────────────────────
Config.RestrictedZones = {
    enabled = false,
    zones   = {
        { name = 'Hospital', coords = vector3(297.1493, -582.6865, 43.1339), radius = 50.0 },
        { name = 'Davis',    coords = vector3(278.6338, -1949.548,  22.79),  radius = 60.0 },
    }
}

-- ── Discord leaderboard (not in UI) ──────────────────────────────────
Config.Discord = {
    botName        = 'Drug Leaderboard',
    botAvatar      = 'https://r2.fivemanage.com/iXlkbXHVCnElhfGg0KkbF/mercury_pfp.gif',
    updateInterval = 3600000,
    embedColor     = 1329051,
    title          = '🏆 Top 10 Drug Dealers',
    description    = 'Here are the top 10 players based on their drug selling experience!',
    thumbnail      = nil,
    footer         = 'Updated automatically Every Hour',
    footerIcon     = nil
}

-- ── Admin groups for /trapadmin ───────────────────────────────────────
Config.ConfigUIGroups = { 'owner', 'admin' }

-- ─────────────────────────────────────────────────────────────────────
-- Everything below is the DEFAULT fallback used only when no database
-- overrides exist yet. All of it is fully editable live via /trapadmin.
-- ─────────────────────────────────────────────────────────────────────

Config.UIcolor         = '#0ef7d0'
Config.CopRequired     = 0
Config.RejectionChance = 40
Config.SpawnWaypointMaxSnapOffLine = 25.0
Config.SpawnCloseMin   = 15.0
Config.SpawnCloseMax   = 25.0
Config.SpawnFarMin     = 35.0
Config.SpawnFarMax     = 55.0

Config.Movement    = { maxdistance = 100.0 }
Config.AutoSell    = { enabled = false, delay = 1500 }
Config.SkillCheck  = { enabled = false, chance = 25, difficulties = {'easy'}, keys = {'e','d'} }
Config.RobberyChance   = { base = 8, autoSellBonus = 20 }
Config.CustomerSnitch  = { enable = true, chances = 30 }
Config.BlacklistedJobs = { 'police', 'ambulance' }

-- ── Area Heat System ──────────────────────────────────────────
-- Each successful sale raises heat; high heat means more heat
-- means higher dispatch and rejection chances.
-- Heat cools down passively after cooldownDelay seconds.
Config.HeatSystem = {
    enabled         = true,
    increasePerSale = 20,    -- heat added per successful sale (0-100 scale)
    cooldownDelay   = 20,    -- seconds after last sale before cooling begins
    cooldownRate    = 3,     -- heat removed per second once cooling starts
    -- Extra dispatch chance added at each heat tier (1 = cold, 5 = inferno)
    dispatchBonus   = { 0, 10, 20, 35, 50 },
    -- Extra rejection chance added at each heat tier
    rejectBonus     = { 0, 5, 10, 15, 25 },
}

-- ── Drive-Through Sales ───────────────────────────────────────
-- When enabled, players can sell while seated in a vehicle.
-- The buyer NPC walks up to the driver-side window automatically.
Config.DriveThru = {
    enabled      = true,
    triggerDist  = 3.5,   -- metres between buyer and vehicle to trigger sale
    autoDelay    = 1500,  -- ms before auto-triggering (same feel as AutoSell)
}

-- ── Ped Behavior Profile ──────────────────────────────────────
-- Controls how buyer NPCs behave after a sale/rejection.
-- 'nervous'  – leaves quickly (3 s), spooked easily, lower robbery risk
-- 'casual'   – default balanced behavior (6 s despawn)
-- 'bold'     – lingers longer (10 s), hard to spook, higher robbery risk
Config.PedBehavior = 'casual'
Config.PedBehaviorProfiles = {
    nervous = { despawnTime = 3000,  spookMult = 1.5, robMult = 0.5 },
    casual  = { despawnTime = 6000,  spookMult = 1.0, robMult = 1.0 },
    bold    = { despawnTime = 10000, spookMult = 0.5, robMult = 2.0 },
}

Config.Leaderboard = {
    title       = 'TOP SERVER DEALERS',
    subtitle    = 'Top drug dealers ranking by total XP',
    headerImage = '',
    seasonText  = 'CURRENT SEASON: Summer 2026'
}

Config.LevelUpStyle = 'classic'
Config.RankupNotify = {
    style    = 'none',  -- set via /trapadmin: 'none'|'custom'|'esx'|'qb'|'ox_lib'
    messages = {
        rankup     = 'RANK UP! You are now a {label}',
        carReward  = 'You earned a new car: {reward}',
        itemReward = 'You earned: {amount}x {item}',
    }
}

Config.SellList = {
    ['crack1g']    = { label = 'Coke Pooch',   quantity = {min=1,max=5}, price = {min=790, max=960},  reject = 5, addpoints = 500 },
    ['meth_pooch'] = { label = 'Meth Pooch',   quantity = {min=1,max=5}, price = {min=740, max=860},  reject = 5, addpoints = 100 },
    ['sugarrush']  = { label = 'Sugar Rush',   quantity = {min=1,max=5}, price = {min=840, max=960},  reject = 5, addpoints = 100 },
    ['molly']      = { label = 'Molly',        quantity = {min=1,max=5}, price = {min=840, max=1060}, reject = 5, addpoints = 100 },
}

Config.PedList = {
    'g_m_importexport_01', 'g_m_y_ballaeast_01', 'g_m_y_ballaorig_01',
    'g_m_y_azteca_01',     'g_m_y_armgoon_02',   'g_m_y_famdnf_01',
    'g_m_y_famca_01',      'g_m_y_ballasout_01', 'g_m_y_mexgoon_02',
    'g_m_y_salvaboss_01',
}

Config.BonusAreas = {
    { coords = vector3(1375.609, -741.0916, 67.232), radius = 28.0, quantity = {min=4,max=6}, multiplier = {min=1.25,max=1.50} },
    { coords = vector3(278.6338, -1949.548,  22.79), radius = 48.0, quantity = {min=4,max=6}, multiplier = {min=1.25,max=1.50} },
}

Config.Ranks = {
    [1]  = { points = 1000,   percentmore = 0,  label = 'Corner Boy' },
    [2]  = { points = 2500,   percentmore = 2,  label = 'Street Peddler', rewards = { type='item', reward={'armour',     amount=1  } } },
    [3]  = { points = 5000,   percentmore = 3,  label = 'Nickel Bagger',  rewards = { type='item', reward={'lockpick',   amount=3  } } },
    [4]  = { points = 8000,   percentmore = 4,  label = 'Block Runner',   rewards = { type='item', reward={'phone',      amount=1  } } },
    [5]  = { points = 12000,  percentmore = 5,  label = 'Trapper',        rewards = { type='car',  reward='sultan'                  } },
    [6]  = { points = 17000,  percentmore = 6,  label = 'Hustler',        rewards = { type='item', reward={'armour',     amount=2  } } },
    [7]  = { points = 23000,  percentmore = 7,  label = 'Trap Star',      rewards = { type='item', reward={'weapon_bat', amount=1  } } },
    [8]  = { points = 30000,  percentmore = 8,  label = 'Plug',           rewards = { type='car',  reward='schafter2'               } },
    [9]  = { points = 38000,  percentmore = 9,  label = 'Slanger',        rewards = { type='item', reward={'lockpick',   amount=5  } } },
    [10] = { points = 47000,  percentmore = 10, label = 'Road Runner',    rewards = { type='item', reward={'armour',     amount=3  } } },
    [11] = { points = 57000,  percentmore = 11, label = 'D-Boy',          rewards = { type='car',  reward='baller'                  } },
    [12] = { points = 68000,  percentmore = 12, label = 'Flipper',        rewards = { type='item', reward={'armour',     amount=4  } } },
    [13] = { points = 80000,  percentmore = 13, label = 'Weight Mover',   rewards = { type='item', reward={'lockpick',   amount=8  } } },
    [14] = { points = 93000,  percentmore = 14, label = 'Block Boss',     rewards = { type='car',  reward='exemplar'                } },
    [15] = { points = 107000, percentmore = 15, label = 'Connect',        rewards = { type='item', reward={'armour',     amount=5  } } },
    [16] = { points = 122000, percentmore = 16, label = 'Middleman',      rewards = { type='car',  reward='elegy2'                  } },
    [17] = { points = 138000, percentmore = 17, label = 'Corner King',    rewards = { type='item', reward={'armour',     amount=6  } } },
    [18] = { points = 155000, percentmore = 18, label = 'Hood Legend',    rewards = { type='item', reward={'lockpick',   amount=10 } } },
    [19] = { points = 173000, percentmore = 19, label = 'Street General', rewards = { type='car',  reward='sultan2'                 } },
    [20] = { points = 192000, percentmore = 20, label = 'OG',             rewards = { type='item', reward={'armour',     amount=8  } } },
    [21] = { points = 215000, percentmore = 21, label = 'Underboss',      rewards = { type='car',  reward='zentorno'                } },
    [22] = { points = 240000, percentmore = 22, label = 'Street Czar',    rewards = { type='item', reward={'armour',     amount=10 } } },
    [23] = { points = 268000, percentmore = 23, label = 'Narco',          rewards = { type='item', reward={'lockpick',   amount=15 } } },
    [24] = { points = 298000, percentmore = 24, label = 'Cartel Boss',    rewards = { type='car',  reward='nero'                    } },
    [25] = { points = 330000, percentmore = 25, label = 'Trap God',       rewards = { type='item', reward={'armour',     amount=12 } } },
    [26] = { points = 375000, percentmore = 27, label = 'Kingpin',        rewards = { type='car',  reward='osiris'                  } },
    [27] = { points = 430000, percentmore = 30, label = 'Drug Lord',      rewards = { type='item', reward={'armour',     amount=15 } } },
    [28] = { points = 500000, percentmore = 35, label = 'El Jefe',        rewards = { type='car',  reward='tyrus'                   } },
}
