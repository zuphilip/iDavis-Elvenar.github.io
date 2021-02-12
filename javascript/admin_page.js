var prioritiesNonProduction = ["providedCulture", "provided_population"];
var prioritiesProduction = ["money", "supplies", "marble", "steel", "planks", "crystal", "scrolls", "silk", "elixir", "magic_dust", "gems",
    "boosted_plus_0_quality_1", "boosted_plus_0_quality_2", "boosted_plus_0_quality_3", "boosted_plus_1_quality_1", "boosted_plus_2_quality_1", "boosted_plus_1_quality_2", "boosted_plus_2_quality_2", "boosted_plus_1_quality_3", "boosted_plus_2_quality_3", "orcs",
    "mana", "seeds", "sentientmarble", "sentientsteel", "sentientplanks", "sentientcrystal", "sentientscrolls", "sentientsilk", "sentientelixir", "sentientmagic_dust", "sentientgems", "boosted_sentient_plus_0_quality_1", "boosted_sentient_plus_1_quality_1", "boosted_sentient_plus_2_quality_1",
    "boosted_sentient_plus_0_quality_2", "boosted_sentient_plus_1_quality_2", "boosted_sentient_plus_2_quality_2",
    "boosted_sentient_plus_0_quality_3", "boosted_sentient_plus_1_quality_3", "boosted_sentient_plus_2_quality_3",
    "unurium", "knowledge_points", "broken_shards", "ins_rf_cn_5", "ins_rf_cn_10", "ins_rf_cn_15", "ins_rf_cn_20",
    "ins_rf_cn_25", "ins_rf_cn_33", "ins_rf_cn_50", "ins_rf_cn_100", "ins_rf_spl_5", "ins_rf_spl_10", "ins_rf_spl_15",
    "ins_rf_spl_20", "ins_rf_spl_25", "ins_rf_spl_33", "ins_rf_spl_50", "ins_rf_spl_100", "ins_rf_grr_5",
    "ins_rf_grr_10", "ins_rf_grr_15", "ins_rf_grr_20", "ins_rf_grr_25", "ins_rf_grr_33", "ins_rf_grr_50", "ins_rf_grr_100",
    "ins_kp_aw_1", "ins_kp_aw_3", "ins_kp_aw_5", "ins_kp_aw_7", "ins_kp_aw_10", "ins_kp_aw_15", "ins_kp_aw_20",
    "ins_kp_aw_30", "ins_rs_1", "", "", "",
    "", "", "", "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "", "", "", "",
    "", "", "", "", "", "", "", "", "", "", "" ];

function handleBuildingsJSON() {
    create_exception("Generating...",10000,'primary')
    let file = document.getElementById('myFile').files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    var numberOfChapters = parseInt(document.getElementById('numOfChapters').textContent);
    var allBuildings = [];
    var result = [];
    reader.onload = function() {
        let data = JSON.parse(reader.result);
        for (let i = 0; i < data.length; i++) {
            if (data[i]['id'].includes('A_Evt')) {
                console.log('buildingCount');
                allBuildings.push(data[i]);
            }
        }

        for (let i = 0; i < allBuildings.length; i++) {
            if (allBuildings[i]['level'] === 1) {
                var b = {
                    "id": allBuildings[i]['id'].substring(0, allBuildings[i]['id'].lastIndexOf('_')),
                    "name": allBuildings[i]['name'],
                    "type": allBuildings[i]['type'],
                    "width": allBuildings[i]['width'],
                    "length": allBuildings[i]['length'],
                    "construction_time": allBuildings[i]['construction_time'],
                    "chapters": {},
                    "appearances": {}
                };
                if (images_buildings.hasOwnProperty(b['id'])) {
                    if (images_buildings[b['id']] != "") {
                        b['image'] = images_buildings[b['id']];
                    } else {
                        b['image'] = "https://i.ibb.co/j3JHrXg/placeholder.jpg";
                    }
                } else {
                    b['image'] = "https://i.ibb.co/j3JHrXg/placeholder.jpg";
                }
                if (allBuildings[i].hasOwnProperty('production')) {
                    b['earlyPickupTime'] = allBuildings[i]['production']['earlyPickupTime'];
                }
                for (var key in eventAppearances) {
                    if (eventAppearances[key].includes(b['id'])) {
                        var appearance = {};
                        appearance[key] = eventAppearances[key].indexOf(b['id']);
                        b['appearances'] = appearance;
                    }
                }
                var setOfAllProductions = new Set();
                var levelsFound = 0;
                for (var l = i; l < allBuildings.length; l++) {
                    if (allBuildings[l]['id'].includes(b['id'])) {
                        for (var p1 = 0; p1 < prioritiesNonProduction.length; p1++) {
                            if (allBuildings[l].hasOwnProperty(prioritiesNonProduction[p1])) {
                                setOfAllProductions.add(prioritiesNonProduction[p1]);
                            }
                        }
                        if (allBuildings[l].hasOwnProperty('production')) {
                            for (var p2 = 0; p2 < prioritiesProduction.length; p2++) {
                                for (var product = 0; product < allBuildings[l]['production']['products'].length; product++) {
                                    if (allBuildings[l]['production']['products'][product]['revenue']['resources'].hasOwnProperty(prioritiesProduction[p2])) {
                                        setOfAllProductions.add(prioritiesProduction[p2]);
                                    }
                                }
                            }
                        }
                        levelsFound++;
                        if (levelsFound === numberOfChapters) {
                            break;
                        }
                    }
                }
                //console.log(setOfAllProductions);
                var arrayOfProductions = Array.from(setOfAllProductions);
                var allDifferentProductions = orderByPriorities(arrayOfProductions);
                b['all_productions'] = allDifferentProductions;
                levelsFound = 0;
                for (var k = i; k < allBuildings.length; k++) {
                    if (allBuildings[k]['id'].includes(b['id'])) {
                        var currentLevel = parseInt(allBuildings[k]['level']);
                        var currentLevelString = currentLevel.toString();
                        b['chapters'][currentLevelString] = {};
                        for (var prod = 0; prod < allDifferentProductions.length; prod++) {
                            if (prioritiesNonProduction.includes(allDifferentProductions[prod])) {
                                b['chapters'][currentLevelString][allDifferentProductions[prod]] = allBuildings[k][allDifferentProductions[prod]];
                            } else if (prioritiesProduction.includes(allDifferentProductions[prod])) {
                                for (var o = 0; o < allBuildings[k]['production']['products'].length; o++) {
                                    if (allBuildings[k]['production']['products'][o]['revenue']['resources'].hasOwnProperty(allDifferentProductions[prod])) {
                                        var c = {};
                                        c['value'] = allBuildings[k]['production']['products'][o]['revenue']['resources'][allDifferentProductions[prod]];
                                        c['production_time'] = allBuildings[k]['production']['products'][o]['production_time'];
                                        b['chapters'][currentLevelString][allDifferentProductions[prod]] = c;
                                        break;
                                    }
                                }
                            }
                        }

                        levelsFound++;
                        if (levelsFound === numberOfChapters) {
                            break;
                        }
                    }
                }
                result.push(b);
            }
        }
        console.log(result);
        saveJSON( JSON.stringify(result), "buildings.json" );
        create_exception("Data Generated!",10,'success');
    };

    //FILTER
    if (document.getElementById('filter').textContent != '') {
        //TO DO
    }

}

function saveJSON(text, filename){
    var a = document.createElement('a');
    a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click()
}

function getByKey(object, key, default_value) {
    var result = object[key];
    return (typeof result !== "undefined") ? result : default_value;
}

function orderByPriorities(productions) {
    var result = new Array();
    for (var i = 0; i < prioritiesNonProduction.length; i++) {
        for (var j = 0; j < productions.length; j++) {
            if (prioritiesNonProduction[i] === productions[j]) {
                result.push(productions[j]);
            }
        }
    }
    for (var i = 0; i < prioritiesProduction.length; i++) {
        for (var j = 0; j < productions.length; j++) {
            if (prioritiesProduction[i] === productions[j]) {
                result.push(productions[j]);
            }
        }
    }
    return result;
}

function generateJSONBuildingsIDs() {
    create_exception("Generating...",10000,'primary')
    let file = document.getElementById('buildings_file').files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    var numberOfChapters = parseInt(document.getElementById('numOfChapters').textContent);
    var allBuildings = [];
    var result = [];
    reader.onload = function() {
        let data = JSON.parse(reader.result);
        for (let i = 0; i < data.length; i++) {
            if (data[i]['id'].includes('A_Evt')) {
                console.log('buildingCount');
                allBuildings.push(data[i]);
            }
        }
        var result = {};
        for (var i = 0; i < allBuildings.length; i++) {
            var id = allBuildings[i]['id'].substring(0, allBuildings[i]['id'].lastIndexOf('_'));
            result[id] = "";
        }
        saveJSON( JSON.stringify(result), "images_buildings.json" );
        create_exception("Data Generated!",10,'success');
    };
}

var eventAppearances = {
    "february_xxi_": [
        "A_Evt_February_XXI_Elder_Snowman",
        "A_Evt_February_XXI_Yeti_Hot_Spring",
        "",
        "A_Evt_Car_XIX_Elven_Wagon",
        "A_Evt_Car_XX_Deers_Golems",
        "A_Evt_Val_Balcony",
        "A_Evt_Car_XX_Halfling_Wagon",
        "A_Evt_February_XXI_Aureate_Willow",
        "A_Evt_Car_XIX_Dancing_People",
        "A_Evt_February_XXI_Dawn_Of_Spring_Shrine",
        "A_Evt_Car_XIX_Beauty_Puppet",
        "A_Evt_Car_XX_Dragon_Puppet",
        "",
        "A_Evt_Car_XIX_Orc_Wagon",
        "A_Evt_February_XXI_Sun_Loop",
        "",
        "A_Evt_February_XXI_Elder_Snowman",
        "A_Evt_Car_XX_Bubble_Mask",
        "A_Evt_Car_XX_Constructs_Wagon",
        "",
        "A_Evt_Car_XX_Dwarven_Wagon",
        "A_Evt_February_XXI_Lifeblood_Cone"
    ]
}

var images_buildings = {
    "A_Evt_December_XX_GoblinSleigh":"https://i.ibb.co/z5P2ktw/goblinsleigh.png",
    "A_Evt_December_XX_FrozenOwlCave":"https://i.ibb.co/0nTs8S1/frozenowlcave.png",
    "A_Evt_December_XX_GoblinGiftShop":"https://i.ibb.co/v4P7XRY/goblingiftshop.png",
    "A_Evt_December_XX_IceCreamConeFram":"https://i.ibb.co/HYQ2CRj/icecreamconefram.png",
    "A_Evt_Evo_December_XX_Watchful_Winter_Owl":"https://i.ibb.co/zPHYfj1/evo-december-xx.png",
    "A_Evt_BlackFriday_XX_Gift_Unicorn":"https://i.ibb.co/68PB14V/black-Friday-xx.png",
    "A_Evt_December_XX_Seeker_Of_Knowledge":"https://i.ibb.co/FBtH8qd/seeker-of-knowledge.png",
    "A_Evt_February_XXI_Yeti_Hot_Spring":"https://i.ibb.co/3zX5VtJ/yeti-hot-spring.png",
    "A_Evt_February_XXI_Aureate_Willow":"https://i.ibb.co/9s1C3Ln/aureate-willow.png",
    "A_Evt_February_XXI_Elder_Snowman":"https://i.ibb.co/8NtBhDq/elder-snowman.png",
    "A_Evt_February_XXI_Lifeblood_Cone":"https://i.ibb.co/MMjJcy8/lifeblood-cone.png",
    "A_Evt_February_XXI_Sun_Loop":"https://i.ibb.co/vvTKHVd/sun-loop.png",
    "A_Evt_February_XXI_Dawn_Of_Spring_Shrine":"https://i.ibb.co/YN9rmpv/dawn-of-spring-shrine.png",
    "A_Evt_Evo_February_XXI_Everblossom_Sleigh":"https://i.ibb.co/QpRXzy3/evo-everblossom-sleigh.png",
    "A_Evt_March_XXI_Phoenix_Chick":"https://i.ibb.co/RBj20QM/phoenix-chick.png",
    "A_Evt_March_XXI_Eggshell_Shrine":"https://i.ibb.co/8gCpkWR/eggshell-shrine.png",
    "A_Evt_March_XXI_Temple_of_Embers":"https://i.ibb.co/fQ7Rwmt/temple-of-embers.png",
    "A_Evt_March_XXI_Eggshell_Pavillon":"https://i.ibb.co/hHQ0mVV/eggshell-pavilon.png",
    "A_Evt_March_XXI_Phoenix_Water_Mill":"https://i.ibb.co/JmBphzj/phoenix-water-mill.png",
    "A_Evt_March_XXI_Phoenix_Rider":"https://i.ibb.co/JrZm2B6/phoenix-rider.png",
    "A_Evt_Evo_March_XXI_Ashen_Phoenix":"https://i.ibb.co/4tF9PqC/evo-ashen-phoenix.png",
    "A_Evt_HolyCodexGreen":"",
    "A_Evt_HolyCodexYellow":"",
    "A_Evt_HolyCodexRed":"",
    "A_Evt_UnicornCrystal":"https://i.ibb.co/0mRTMvs/crystal.png",
    "A_Evt_UnicornSilver":"https://i.ibb.co/DMCFsWQ/silver.png",
    "A_Evt_UnicornRainbow":"https://i.ibb.co/bWKPGSn/rainbow.png",
    "A_Evt_FlowerCageBlue":"",
    "A_Evt_FlowerCageSpring":"",
    "A_Evt_FlowerCageRainbow":"https://i.ibb.co/BjXbQFn/rainbow-flower-cage.png",
    "A_Evt_StatueWarriorsBronze":"https://i.ibb.co/HHFMLnF/bronze-guards.png",
    "A_Evt_StatueWarriorsSilver":"https://i.ibb.co/xfVJwbd/silver-guards.png",
    "A_Evt_GloriousStatueBannerBig":"",
    "A_Evt_GloriousStatueBannerSmall":"",
    "A_Evt_SignPostDark":"",
    "A_Evt_GorgeousGarden":"https://i.ibb.co/kK9fbFj/glossy-garden.png",
    "A_Evt_BlueTree":"https://i.ibb.co/HqDKPnv/father-tree.png",
    "A_Evt_MagicDome":"https://i.ibb.co/QFLpNDm/observatory.png",
    "A_Evt_StoneHengeSmall":"https://i.ibb.co/YWb3P63/venar-rocks-I.png",
    "A_Evt_StoneHengeMedium":"https://i.ibb.co/ySGDxjh/venar-rocks-ii.png",
    "A_Evt_StoneHengeBig":"https://i.ibb.co/18zzG8F/venar-rocks-iii.png",
    "A_Evt_WonkyWalters":"",
    "A_Evt_ScreamOfHalloween":"https://i.ibb.co/D8zr1T7/scream-of-halloween.png",
    "A_Evt_DauntingPumpkins":"https://i.ibb.co/RNkhFjJ/daunting-pumpkins.png",
    "A_Evt_Winter_1GrandPrize":"",
    "A_Evt_Winter_2GrandPrize":"",
    "A_Evt_Winter_3GrandPrize":"",
    "A_Evt_Winter_1DailyReward":"https://i.ibb.co/Y8R00ht/winter-star.png",
    "A_Evt_Winter_2DailyReward":"https://i.ibb.co/5XZMXY4/frozen-lake.png",
    "A_Evt_Winter_3DailyReward":"https://i.ibb.co/R76tpqF/snowball-fight.png",
    "A_Evt_Winter_4DailyReward":"https://i.ibb.co/DCmxGg4/lazy-snowman.png",
    "A_Evt_Winter_5DailyReward":"https://i.ibb.co/hRZKfCr/igloo-festival.png",
    "A_Evt_Winter_Garden":"",
    "A_Evt_Winter_1Pond":"https://i.ibb.co/gWs494Z/lampion-winter-pond.png",
    "A_Evt_Winter_2Pond":"https://i.ibb.co/Bc0wQwm/winter-pond-habitat.png",
    "A_Evt_Winter_1Temple":"",
    "A_Evt_Winter_2Temple":"https://i.ibb.co/vjNmCXm/temple-of-the-frozen-flame.png",
    "A_Evt_Winter_1Tree":"https://i.ibb.co/VB7sqNg/father-glitter-tree.png",
    "A_Evt_Winter_2Tree":"https://i.ibb.co/McSfk60/father-tree-of-candy-canes.png",
    "A_Evt_Winter_3Tree":"https://i.ibb.co/thVD7yM/father-frozen-tree.png",
    "A_Evt_Winter_1Unicorn":"https://i.ibb.co/g7jNVr8/frozen-unicorn.png",
    "A_Evt_Winter_2Unicorn":"https://i.ibb.co/hZyKQ60/candy-cane-unicorn.png",
    "A_Evt_Winter_3Unicorn":"https://i.ibb.co/92Y6jVX/winter-deer.png",
    "A_Evt_Winter_Charming":"https://i.ibb.co/FW3rMph/snowy-charming-tree-large.png",
    "A_Evt_Winter_1Crystal":"",
    "A_Evt_Winter_2Crystal":"",
    "A_Evt_Winter_3Crystal":"",
    "A_Evt_Winter_4Crystal":"",
    "A_Evt_Winter_Cocoon":"https://i.ibb.co/TqtPZHB/winter-lampions.png",
    "A_Evt_Winter_1Shrine":"",
    "A_Evt_Winter_2Shrine":"",
    "A_Evt_Winter_1Grave":"",
    "A_Evt_Winter_2Grave":"",
    "A_Evt_Val_Balcony":"https://i.ibb.co/K2wm33p/gaelagils-balcony.png",
    "A_Evt_Val_Bridge":"https://i.ibb.co/ZmmP2dQ/valentine-bridge.png",
    "A_Evt_Easter_Vii_1GrandPrize":"https://i.ibb.co/1bnRy0n/prev-grandprize-1.png",
    "A_Evt_Easter_Vii_2GrandPrize":"https://i.ibb.co/rx1YKYf/prev-grandprize-2.png",
    "A_Evt_Easter_Vii_3GrandPrize":"https://i.ibb.co/JnjXPQ5/prev-grandprize-3.png",
    "A_Evt_Easter_Vii_BurningEgg":"https://i.ibb.co/SKRM681/zhave-vejce.png",
    "A_Evt_Easter_Vii_FireTower":"https://i.ibb.co/tCp7GcC/fire-tower.png",
    "A_Evt_Easter_Vii_TentBig":"https://i.ibb.co/2qg19Ry/kult-fenixe.png",
    "A_Evt_Easter_Vii_TentSmall":"https://i.ibb.co/KKyKZdM/phoenix-excursion.png",
    "A_Evt_Temp_Q1Goods":"",
    "A_Evt_Temp_Q2Goods":"",
    "A_Evt_Temp_Q3Goods":"",
    "A_Evt_Auto_GoodOrcs":"",
    "A_Evt_Auto_OrcStrategist":"https://i.ibb.co/xq3Tk4T/orcstrategist.png",
    "A_Evt_Easter_Vii_PhoenixFire":"https://i.ibb.co/58CC9x2/sculpture-phoenix.png",
    "A_Evt_Menhiroks_Barrow":"",
    "A_Evt_Sheep_Field":"https://i.ibb.co/R4Qqf2S/fruitful-fields.png",
    "A_Evt_Rocky_Close":"https://i.ibb.co/tsKVcJ0/rocky-enclosure.png",
    "A_Evt_Chicken_Glade":"https://i.ibb.co/P4wKHZc/chicken-glade.png",
    "A_Evt_Dragon_Wagons":"https://i.ibb.co/wcy7883/mother-dragon.png",
    "A_Evt_Goat_Rocks":"https://i.ibb.co/98LjFyN/goat-rocks.png",
    "A_Evt_Summer_XVII_1Grandprize":"https://i.ibb.co/6wPBhBk/the-herds-gathering.png",
    "A_Evt_Summer_XVII_2Grandprize":"https://i.ibb.co/pntBRH1/great-auction.png",
    "A_Evt_Summer_XVII_3Grandprize":"https://i.ibb.co/fYv6s0Y/the-cozy-farm.png",
    "A_Evt_Auto_Lizard":"https://i.ibb.co/zfHPPtb/valorian-valor.png",
    "A_Evt_Tree_Enclosure":"https://i.ibb.co/FgsffKg/tree-enclosure.png",
    "A_Evt_Tree_Enclosure_Blue":"https://i.ibb.co/1KtbQh7/blue-tree-enclosure.png",
    "A_Evt_Tree_Enclosure_Green":"https://i.ibb.co/bFwCjZK/tree-enclosure-sparkling.png",
    "A_Evt_Expiring_Mage_Boost":"",
    "A_Evt_Expiring_UnitHealth_Boost":"",
    "A_Evt_Expiring_DwarvenArmorer":"https://i.ibb.co/2PXwbSk/dwarven-armorer.png",
    "A_Evt_Expiring_LightRanged_Boost":"",
    "A_Evt_Prod_Nutcracker":"https://i.ibb.co/jD1R92m/magical-nutcracker.png",
    "A_Evt_Prod_NutStub":"https://i.ibb.co/gWBXkty/hazelnut-stubs.png",
    "A_Evt_Prod_NutMill":"https://i.ibb.co/8793Pmt/eldrasil-sawmill.png",
    "A_Evt_Magic_Stub":"",
    "A_Evt_Nut_Village":"",
    "A_Evt_Prod_NutBowl":"https://i.ibb.co/19sKn5K/bowl-of-nuts.png",
    "A_Evt_Shellhalls":"",
    "A_Evt_Hazeltown":"https://i.ibb.co/xgFJ7vv/hazeltown-large.png",
    "A_Evt_Winter_Xvii_3GrandPrize":"",
    "A_Evt_SleightForest":"https://i.ibb.co/4SjCJbf/sleighful-of-ice-cubes-large.png",
    "A_Evt_SnowHand":"",
    "A_Evt_Snow_Village":"",
    "A_Evt_Tundra_Forest":"https://i.ibb.co/6tZ4s0v/fishing-spot.png",
    "A_Evt_Winter_Xvii_2GrandPrize":"",
    "A_Evt_Frozen_Shipwreck":"https://i.ibb.co/54Yh19c/frozen-shipwreck.png",
    "A_Evt_Winter_Xvii_1GrandPrize":"",
    "A_Evt_1August_Xvii":"",
    "A_Evt_2August_Xvii":"",
    "A_Evt_1Halloween_Xvii":"https://i.ibb.co/Q9t3LJf/haunted-graveyard.png",
    "A_Evt_2Halloween_Xvii":"https://i.ibb.co/c2jfy22/windmill-of-evil.png",
    "A_Evt_ManaMill":"https://i.ibb.co/hKQ5TcG/mana-mill.png",
    "A_Evt_SquirrelTown":"https://i.ibb.co/wdxrb0Y/squirrel-square.png",
    "A_Evt_Expiring_AWAssistance":"",
    "A_Evt_Expiring_RefundTech":"https://i.ibb.co/9HYLV46/carting-library.png",
    "A_Evt_Expiring_AutoMana":"https://i.ibb.co/Q84SNB9/Mana-Hut.png",
    "A_Evt_Expiring_PortalBoost":"https://i.ibb.co/RNdDTtT/trading-outpost.png",
    "A_Evt_Expiring_TradingStation":"https://i.ibb.co/xDsjLCG/trading-station.png",
    "A_Evt_Expiring_OrcBuff":"",
    "A_Evt_Expiring_NegotiationDebuff":"",
    "A_Evt_NutCave":"https://i.ibb.co/JtYVkSS/flourishing-nut-cave.png",
    "A_Evt_NutMonument":"https://i.ibb.co/S0QnVYY/branchwood-of-nuts.png",
    "A_Evt_IceVillage":"https://i.ibb.co/6PBYdWC/ice-village.png",
    "A_Evt_WinterWell":"",
    "A_Evt_ManaIcicle":"https://i.ibb.co/sQzqFFM/ice-temple.png",
    "A_Evt_FrozenOrcPortal":"",
    "A_Evt_Redbeard_Throne":"",
    "A_Evt_Redbeard_Kitchen":"",
    "A_Evt_Valentines_Wedding":"",
    "A_Evt_Easter_Lighthouse":"",
    "A_Evt_Easter_Pavillion":"",
    "A_Evt_Easter_Pond":"",
    "A_Evt_Phoenix_Gong":"",
    "A_Evt_Phoenix_Temple":"",
    "A_Evt_Phoenix_Lake":"https://i.ibb.co/m5VWcTt/zhave-jezirko.png",
    "A_Evt_Green_Phoenix":"https://i.ibb.co/KNLSYZw/fenixovo-hnizdo.png",
    "A_Evt_Blue_Egg":"https://i.ibb.co/4pR7QCk/galakticke-vajce.png",
    "A_Evt_Fake_House":"https://i.ibb.co/3Yn9FsD/nenapadny-dum.png",
    "A_Evt_Fake_Egg":"https://i.ibb.co/PcNh3Fg/napadne-vejce-fenixe.png",
    "A_Evt_Egg_Pavillions":"https://i.ibb.co/k5tmk4H/jarni-pavilony.png",
    "A_Evt_Easter_Flower_Cage":"https://i.ibb.co/T2f5Zhz/jarni-kvetinova-klec.png",
    "A_Evt_Alien_Egg":"https://i.ibb.co/k6SjZdh/zahadne-vejce.png",
    "A_Evt_Golden_Palace":"https://i.ibb.co/KGZkM8H/golden-palace.png",
    "A_Evt_Gong_Rock":"https://i.ibb.co/w4dn1wb/horsky-chram-jara.png",
    "A_Evt_Passageway":"https://i.ibb.co/KF03DHq/pruchod-ucedniku.png",
    "A_Evt_Wishing_Well":"https://i.ibb.co/f0HLdsB/a-evt-wishing-well1-1.png",
    "A_Evt_Djinn":"https://i.ibb.co/XjFdQYx/djinn.png",
    "A_Evt_Venars_Rock":"",
    "A_Evt_June_XVIII_Pre_Festival":"",
    "A_Evt_Summer_XVIII_Grand_Prize_I":"",
    "A_Evt_Summer_XVIII_Grand_Prize_II":"",
    "A_Evt_Summer_XVIII_Mosh_Pit":"",
    "A_Evt_Summer_XVIII_Grand_Prize_III":"",
    "A_Evt_Summer_XVIII_Bathroom":"",
    "A_Evt_Summer_XVIII_Crowd_Ground":"",
    "A_Evt_Summer_XVIII_Techno_Tent":"",
    "A_Evt_Summer_XVIII_Playground":"",
    "A_Evt_Summer_XVIII_Solo_Stage":"",
    "A_Evt_Summer_XVIII_Merchant":"",
    "A_Evt_Summer_XVIII_Elvees_Stage":"",
    "A_Evt_Summer_XVIII_Stretch_Limo":"",
    "A_Evt_Summer_XVIII_Poos_Place":"",
    "A_Evt_Summer_XVIII_Entrance":"",
    "A_Evt_Summer_XVIII_Ferris_Wheel":"",
    "A_Evt_Summer_XVIII_Woodelvenstock":"",
    "A_Evt_Summer_XVIII_Monopteros":"",
    "A_Evt_Summer_XVIII_Mystical_Lace":"https://i.ibb.co/J3f0kpc/mystical-lake.png",
    "A_Evt_Summer_XVIII_Camping_Ground":"",
    "A_Evt_MPE_Trophy_One":"https://i.ibb.co/WyVGxHQ/dobrodruzstva-1.png",
    "A_Evt_MPE_Trophy_Two":"https://i.ibb.co/4fL7fMj/dobrodruzstva-2.png",
    "A_Evt_MPE_Trophy_Three":"https://i.ibb.co/2qknN9g/dobrodruzstva-3.png",
    "A_Evt_MPE_Trophy_Four":"https://i.ibb.co/7GRpJY8/dobrodruzstva-4.png",
    "A_Evt_Astronomi_XVIII_DruidFairyCircle":"",
    "A_Evt_Astronomi_XVIII_StoneOfTheStars":"",
    "A_Evt_Autumn_XVIII_Green_Pond":"https://i.ibb.co/syFN6Ly/pond-of-autumn.png",
    "A_Evt_Autumn_XVIII_Burning_Man":"https://i.ibb.co/9cDBkPn/burning-man.png",
    "A_Evt_Autumn_XVIII_Corn_Fields":"https://i.ibb.co/z2mjB7Q/fields-of-gold.png",
    "A_Evt_Autumn_XVIII_Grand_Prize_II":"",
    "A_Evt_Autumn_XVIII_Feasting_Crowd":"https://i.ibb.co/QpZwQv6/feasting-circle.png",
    "A_Evt_Autumn_XVIII_Grand_Prize_III":"",
    "A_Evt_Autumn_XVIII_Tomato_Jury":"https://i.ibb.co/6DkLtNq/tomato-contest.png",
    "A_Evt_Autumn_XVIII_Sun_Bird_Temple":"",
    "A_Evt_Autumn_XVIII_Moon_Weasel_Temple":"",
    "A_Evt_Autumn_XVIII_Archway_Temple":"",
    "A_Evt_Autumn_XVIII_Grand_Prize_I":"",
    "A_Evt_Autumn_XVIII_Storage_Temple":"",
    "A_Evt_Autumn_XVIII_Black_Lotus":"https://i.ibb.co/s2w5ttW/black-lotus.png",
    "A_Evt_Autumn_XVIII_Harvest_Cart":"https://i.ibb.co/GC3C7jQ/harvest-travelers.png",
    "A_Evt_Autumn_XVIII_Moon_Shrine":"",
    "A_Evt_Autumn_XVIII_Sun_Shrine":"",
    "A_Evt_Autumn_XVIII_Golden_Ball":"https://i.ibb.co/6bZSk9q/monument-of-ancient-knowledge-large.png",
    "A_Evt_Autumn_XVIII_Moon_Mirror":"",
    "A_Evt_Autumn_XVIII_Mushrooms":"https://i.ibb.co/NNkBsjV/mushroom-forest.png",
    "A_Evt_Community_GravityInn":"https://i.ibb.co/wS63XXF/evt-community-gravityinn.png",
    "A_Evt_Halloween_Xviii":"https://i.ibb.co/mNsSKXz/headless-halloween.png",
    "A_Evt_Winter_Xviii_Bird_Statue":"https://image.ibb.co/b1DSAA/bird-statue.png",
    "A_Evt_Winter_Xviii_Christmas_Yeti":"https://image.ibb.co/n302cq/christmas-yeti.png",
    "A_Evt_Winter_Xviii_Iceskaters":"https://image.ibb.co/i3VhAA/iceskaters.png",
    "A_Evt_Winter_Xviii_Gingerbreadman":"https://image.ibb.co/jZk570/gingerbreadman.png",
    "A_Evt_Winter_Xviii_Set_A_Market_Stalls":"https://image.ibb.co/fzRL70/marketstalls.png",
    "A_Evt_Winter_Xviii_Set_A_Stalls_Backside":"https://image.ibb.co/cCshLL/backstalls.png",
    "A_Evt_Winter_Xviii_Set_A_Elvenade":"https://image.ibb.co/d6YE0L/elvenade.png",
    "A_Evt_Winter_Xviii_Set_A_Christmas_Fan":"https://image.ibb.co/hYd3uf/christmas-fan.png",
    "A_Evt_Winter_Xviii_Set_A_Ice_Tree":"https://i.ibb.co/XyJZ7yw/frost-carved-christmas-tree.png",
    "A_Evt_Winter_Xviii_Set_B_Goblin_Factory":"https://image.ibb.co/guff70/goblin-factory.png",
    "A_Evt_Winter_Xviii_Set_B_Owls":"https://image.ibb.co/d5igfL/owls.png",
    "A_Evt_Winter_Xviii_Set_B_Ice_Ship":"https://image.ibb.co/icGv70/ice-ship.png",
    "A_Evt_Winter_Xviii_Yeti_Castle":"https://image.ibb.co/drRRfL/yetti-castle.png",
    "A_Evt_Winter_Xviii_Ferris_Wheel":"https://image.ibb.co/mJip0L/ferris-wheel.png",
    "A_Evt_Winter_Xviii_Advent_Candle":"https://image.ibb.co/ihKnLL/advent-candle.png",
    "A_Evt_Winter_Xviii_Candy_Hut":"https://image.ibb.co/nebZ0L/candy-hut.png",
    "A_Evt_Winter_Xviii_Elvenate_Carriage":"https://i.ibb.co/gVch0TY/elvenate-carriage.png",
    "A_Evt_Winter_Xviii_Snow_Pharaoh":"https://image.ibb.co/mvO6fL/snow-pharaoh.png",
    "A_Evt_Winter_Xviii_Ice_Worm":"https://image.ibb.co/hCGbfL/ice-worm.png",
    "A_Evt_UnicornGoth":"https://i.ibb.co/Z1Qf32y/goth.png",
    "A_Evt_UnicornBlack":"https://i.ibb.co/cx3HXyg/black.png",
    "A_Evt_Valentines_Xix_Babies":"https://i.ibb.co/VNVGzDg/valentines-xix.png",
    "A_Evt_Car_XIX_Dancing_People":"https://i.ibb.co/YNzTwkT/carnival-choreography.png",
    "A_Evt_Car_XIX_Ugly_Puppet":"https://i.ibb.co/JFmqkcV/car-xix-ugly-puppet.png",
    "A_Evt_Car_XIX_Flower_Balloon":"https://i.ibb.co/VmRCLBX/flower.png",
    "A_Evt_Car_XIX_Dragon_Balloon":"https://i.ibb.co/3NgLy54/dragon-float.png",
    "A_Evt_Car_XIX_Beauty_Puppet":"https://i.ibb.co/jT4TJy6/car-xix-beauty-puppet.png",
    "A_Evt_Car_XIX_Orc_Wagon":"https://i.ibb.co/W5bpMJh/car-xix-orc-wagon.png",
    "A_Evt_Car_XIX_Elven_Wagon":"https://i.ibb.co/ZBQLS7j/car-xix-elven-wagon.png",
    "A_Evt_Car_XIX_Set_A_Tavern":"https://i.ibb.co/nPbLpx1/car-xix-set-a-tavern.png",
    "A_Evt_Car_XIX_Set_A_Tent":"https://i.ibb.co/Mp8tgWs/car-xix-set-a-tent.png",
    "A_Evt_Car_XIX_Set_A_Fountain":"https://i.ibb.co/NyJ1tny/car-xix-set-a-fountain.png",
    "A_Evt_Car_XIX_Set_A_Fireworks":"https://i.ibb.co/5TN2bWG/car-xix-set-a-fireworks.png",
    "A_Evt_Car_XIX_Set_A_Candies":"https://i.ibb.co/vqbMgkV/candies.png",
    "A_Evt_Set_A_ChessA":"https://i.ibb.co/NtHhfZC/golden-king.png",
    "A_Evt_Set_A_ChessB":"https://i.ibb.co/9VnFjPZ/solar-rook.png",
    "A_Evt_Set_A_ChessC":"https://i.ibb.co/7jPfPw9/flame-knight.png",
    "A_Evt_Set_A_ChessD":"https://i.ibb.co/Cw0WdJp/tome-bishop.png",
    "A_Evt_EC_Plus_One":"https://i.ibb.co/bdHQf1F/evt-plus-1.png",
    "A_Evt_Generic_Ferris_Wheel":"https://i.ibb.co/VpD8CvF/generic-ferris-wheel.png",
    "A_Evt_Evo_Easter_XIX_Phoenix_Red":"https://i.ibb.co/0shv7GR/EL-sneak-peek-8-3-2019-2.png",
    "A_Evt_Evo_Easter_XIX_Phoenix_Blue":"https://i.ibb.co/NT8ZG4Q/EL-sneak-peek-8-3-2019-1.png",
    "A_Evt_Evo_Easter_XIX_Phoenix_Yellow":"https://i.ibb.co/fvzTGGw/EL-sneak-peek-8-3-2019-3.png",
    "A_Evt_Generic_EC_Plus_One":"",
    "A_Evt_Evo_Summer_XIX_Stonehenge":"https://i.ibb.co/9sx2qZH/stonehenge.png",
    "A_Evt_Bday_2019_Unicorn":"",
    "A_Evt_Spire_Set_A_Mana_Plant":"https://i.ibb.co/HTWjFvW/mana-plant.png",
    "A_Evt_Spire_Set_A_Gum_Tree":"https://i.ibb.co/qgXD5Lv/gum-tree.png",
    "A_Evt_Spire_Set_A_Endless_Scroll":"https://i.ibb.co/6sqs7Fw/endless-scroll.png",
    "A_Evt_Spire_Set_A_Moonstone_Gate":"https://i.ibb.co/tPTFP5w/moonstone-gate.png",
    "A_Evt_Spire_Set_A_Moonstone_Library":"https://i.ibb.co/t477vFw/moonstone-library.png",
    "A_Evt_MM_XIX_Seahorse":"https://i.ibb.co/KmBfRzZ/seahorse.png",
    "A_Evt_MM_XIX_Corals":"https://i.ibb.co/4ThhCCJ/corals.png",
    "A_Evt_MM_XIX_ShellSinger":"https://i.ibb.co/bFjvJmt/shellsinger.png",
    "A_Evt_MM_XIX_MantaRay":"https://i.ibb.co/6DC29vb/mantaray.png",
    "A_Evt_MM_XIX_WaterBubble":"https://i.ibb.co/hCcf8W4/waterbubble.png",
    "A_Evt_MM_XIX_Baywatch":"https://i.ibb.co/GnTFtVz/baywatch.png",
    "A_Evt_MM_XIX_Lagoon":"https://i.ibb.co/NN4NfjR/lagoon.png",
    "A_Evt_MM_XIX_BeachBar":"https://i.ibb.co/Njpg4qw/beachbar.png",
    "A_Evt_MM_XIX_SharkTower":"https://i.ibb.co/wp45m5c/sharktower.png",
    "A_Evt_MM_XIX_CrabHotel":"https://i.ibb.co/3M18hMS/crabhotel.png",
    "A_Evt_Evo_MM_XIX_WaterTower":"https://i.ibb.co/NTGHTb3/mermaidparadise-full.png",
    "A_Evt_QueenOfFish":"https://i.ibb.co/SrJz1c3/mauriel.png",
    "A_Evt_FriendshipDay":"https://i.ibb.co/5WwdFLf/friendshipday-small.png",
    "A_Evt_Evo_Autumn_XIX_Bear_Brown":"https://i.ibb.co/0rK4ptR/bear-brown.png",
    "A_Evt_Evo_Autumn_XIX_Bear_Ice":"https://i.ibb.co/t4Qj2rM/bear-ice.png",
    "A_Evt_Evo_Autumn_XIX_Bear_Panda":"https://i.ibb.co/P4LGLVV/bear-panda.png",
    "A_Evt_Halloween_XIX":"https://i.ibb.co/kqFp3qX/halloween-xix-small.png",
    "A_Evt_Winter_XIX_Yeti_Conjurer":"https://i.ibb.co/X5q2MMN/yeti-conjurer.png",
    "A_Evt_Winter_XIX_Ice_Track":"https://i.ibb.co/KjX1RGJ/ice-track.png",
    "A_Evt_Winter_XIX_Candy_Cane_Factory":"https://i.ibb.co/ThQQ8vc/candy-cane-factory.png",
    "A_Evt_Winter_XIX_Elvenade_Distributor":"https://i.ibb.co/5v3BNhd/elvenade-distributor.png",
    "A_Evt_Winter_XIX_Chained_House":"https://i.ibb.co/HBLk4Tw/chained-house.png",
    "A_Evt_Winter_XIX_Crane":"https://i.ibb.co/fHwxnN5/barrel-craine.png",
    "A_Evt_Winter_XIX_Lemonade_Brewery":"https://i.ibb.co/VmwVJDh/limonade-brewery.png",
    "A_Evt_Winter_XIX_Three_Ghosts":"https://i.ibb.co/x55VWGv/three-ghosts.png",
    "A_Evt_BlackFriday_XIX_Gift_Unicorn":"",
    "A_Evt_Evo_Winter_XIX_Gingerbread_Mansion":"https://i.ibb.co/x1LdSZV/gingerbread-mansion.png",
    "A_Evt_Car_XX_Dragon_Puppet":"https://i.ibb.co/9qsZdMG/dragon-puppet.png",
    "A_Evt_Car_XX_Bubble_Mask":"https://i.ibb.co/Xpb69ST/bubble-mask.png",
    "A_Evt_Car_XX_Constructs_Wagon":"https://i.ibb.co/w4Mr1px/constructs-wagon.png",
    "A_Evt_Car_XX_Deers_Golems":"https://i.ibb.co/5YtzFGM/deers-golems.png",
    "A_Evt_Car_XX_Dwarven_Wagon":"https://i.ibb.co/YBxpHHm/dwarven-wagon.png",
    "A_Evt_Car_XX_Halfling_Wagon":"https://i.ibb.co/kmh9NFR/halfling-wagon.png",
    "A_Evt_Evo_Car_XX_Burukbrak_Gaelagil":"https://i.ibb.co/pdLn8dP/evo-burukbrak-gaelagil.png",
    "A_Evt_Easter_XX_Phoenix_Anatomy":"https://i.ibb.co/P1FMxCL/phoenix-anatomy.png",
    "A_Evt_Easter_XX_Phoenix_Painting":"https://i.ibb.co/Hqf6R0T/phoenix-painting.png",
    "A_Evt_Easter_XX_Phoenix_Lava":"https://i.ibb.co/tL0Hkf4/phoenix-lava.png",
    "A_Evt_Easter_XX_Phoenix_Sculptor":"https://i.ibb.co/WGbrVtM/phoenix-sculptor.png",
    "A_Evt_Evo_Easter_XX_Phoenix_Coldfire":"https://i.ibb.co/DK73kqb/evo-coldfire-phoenix.png",
    "A_Evt_Godess_Of_Wishes":"https://i.ibb.co/G9cJ0wF/goddess-of-wishes.png",
    "A_Evt_May_XX_Elegant_Carriage":"https://i.ibb.co/JnrCm6j/elegant-carriage.png",
    "A_Evt_May_XX_Merry_Go_Round":"https://i.ibb.co/TWf2Trn/marry-go-round.png",
    "A_Evt_May_XX_Cotton_Candy_Magic":"https://i.ibb.co/cg42Rz0/cotton-candy-magic.png",
    "A_Evt_May_XX_Halfling_Stage":"https://i.ibb.co/DbYPJ12/halfling-stage.png",
    "A_Evt_May_XX_Public_Stage":"https://i.ibb.co/DKSHQCF/public-stage.png",
    "A_Evt_May_XX_Sheep_Shenanigans":"https://i.ibb.co/42pk5d1/sheep-shenanigans.png",
    "A_Evt_May_XX_Cake_Counter":"https://i.ibb.co/stKZrXm/cake-counter.png",
    "A_Evt_May_XX_Food_Market":"https://i.ibb.co/X8XM25x/food-market.png",
    "A_Evt_Evo_May_XX_May_Tree":"https://i.ibb.co/cy7w1t7/may-tree.png",
    "A_Evt_June_XX_Sorcerer_Ship":"https://i.ibb.co/34Rtb8B/sorcerer-ship.png",
    "A_Evt_June_XX_Fairy_Ship":"https://i.ibb.co/PTc1vvz/fairy-ship.png",
    "A_Evt_June_XX_Wood_Elf_Ship":"https://i.ibb.co/QQCXKyG/wood-elf-ship.png",
    "A_Evt_June_XX_Dwarf_Ship":"https://i.ibb.co/yhD5qLN/dwarf-ship.png",
    "A_Evt_June_XX_Orc_Ship":"https://i.ibb.co/XY64W96/orc-ship.png",
    "A_Evt_June_XX_Amuni_Ship":"https://i.ibb.co/bKJd51m/amuni-ship.png",
    "A_Evt_June_XX_Human_Ship":"https://i.ibb.co/m5gpR25/human-ship.png",
    "A_Evt_June_XX_Elven_Ship":"https://i.ibb.co/7K0vm9k/elven-ship.png",
    "A_Evt_June_XX_Set_Trading_Dock":"https://i.ibb.co/nfnzXnm/set-trading-dock.png",
    "A_Evt_June_XX_Set_Repair_Dock":"https://i.ibb.co/6g8JWLp/set-repair-dock.png",
    "A_Evt_June_XX_Set_Bar":"https://i.ibb.co/rQKNMYW/set-bar.png",
    "A_Evt_June_XX_Set_Food_Stand":"https://i.ibb.co/tY687zY/set-food-stand.png",
    "A_Evt_June_XX_Set_Main_Dock":"https://i.ibb.co/5kL4LjK/set-main-dock.png",
    "A_Evt_Bday_2020_Unicorn_Glade":"https://i.ibb.co/jz3BLgP/bday-2020-unicorn.png",
    "A_Evt_July_XX_Golem_Cave":"https://i.ibb.co/TW4KvGp/golem-cave.png",
    "A_Evt_July_XX_Hedge_Beard_Treant":"https://i.ibb.co/WpJhQ23/hedge-beard-treant.png",
    "A_Evt_July_XX_Astral_Crevice":"https://i.ibb.co/5T2MM8k/astral-crevice.png",
    "A_Evt_July_XX_Arcane_Trinket_Shop":"https://i.ibb.co/BZh2DbG/arcane-trinket-shop.png",
    "A_Evt_July_XX_Wizard_Spell_Shop":"https://i.ibb.co/ChSXyR6/wizard-spell-shop.png",
    "A_Evt_July_XX_Mana_Crystal_Merchant":"https://i.ibb.co/yf5CXbb/mana-crystal-merchant.png",
    "A_Evt_July_XX_Copper_Dragon":"https://i.ibb.co/PTLhhtg/copper-dragon.png",
    "A_Evt_July_XX_Sorcerers_Gathering":"https://i.ibb.co/6gF6RRK/sorcerers-gathering.png",
    "A_Evt_Evo_July_XX_Wise_Golem":"https://i.ibb.co/SVkfqSj/evo-wise-golem.png",
    "A_Evt_September_XX_Pond_Pillar":"https://i.ibb.co/ZYZbYFd/pond-pillar.png",
    "A_Evt_September_XX_Prayer_Wheels":"https://i.ibb.co/bghQc60/prayer-wheels.png",
    "A_Evt_September_XX_Bell_Fountain":"https://i.ibb.co/qnv4j0r/bell-fountain.png",
    "A_Evt_September_XX_Firefly_Lookout":"https://i.ibb.co/khz9QvQ/firefly-lookout.png",
    "A_Evt_September_XX_Ancient_Pond_Statue":"https://i.ibb.co/v3BNMP3/ancient-pond-statue.png",
    "A_Evt_September_XX_Kite_Outpost":"https://i.ibb.co/VqqVvzw/kite-outpost.png",
    "A_Evt_Evo_September_XX_Moon_Bear":"https://i.ibb.co/RpGwjdJ/evo-moon-bear.png",
    "A_Evt_October_XX_Scarecrow":"https://i.ibb.co/4T0y4F8/scarecrow.png",
    "A_Evt_October_XX_Gargoyle_Fountain":"https://i.ibb.co/LdPfD6x/gargoyle-fountain.png",
    "A_Evt_October_XX_Disturbed_Coffins":"https://i.ibb.co/WzH0kdG/disturbed-coffins.png",
    "A_Evt_October_XX_Smiling_Pumpkins":"https://i.ibb.co/yfsB8pS/smiling-pumpkins.png",
    "A_Evt_October_XX_Scarriage":"https://i.ibb.co/Wg40g9B/scarriage.png",
    "A_Evt_October_XX_Mausoleum_Wedding":"https://i.ibb.co/L1nS3qX/mausoleum-wedding.png",
    "A_Evt_Evo_October_XX_Witches_Hut":"https://i.ibb.co/k3CWXN3/evo-witches-hut.png"
}