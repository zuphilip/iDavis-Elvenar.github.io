// Copyright 2021, iDavis, All rights reserved.

var selectedEvoStages = {
    "A_Evt_Evo_February_XXI_Everblossom_Sleigh" : 9,
    "A_Evt_Evo_Autumn_XIX_Bear_Brown" : 9,
    "A_Evt_Evo_Autumn_XIX_Bear_Ice" : 9,
    "A_Evt_Evo_Winter_XIX_Gingerbread_Mansion" : 9,
    "A_Evt_Evo_Summer_XIX_Stonehenge" : 9,
    "A_Evt_Evo_September_XX_Moon_Bear" : 9,
    "A_Evt_Evo_October_XX_Witches_Hut" : 9,
    "A_Evt_Evo_May_XX_May_Tree" : 9,
    "A_Evt_Evo_March_XXI_Ashen_Phoenix" : 9,
    "A_Evt_Evo_MM_XIX_WaterTower" : 9,
    "A_Evt_Evo_July_XX_Wise_Golem" : 9,
    "A_Evt_Evo_Easter_XX_Phoenix_Coldfire" : 9,
    "A_Evt_Evo_Easter_XIX_Phoenix_Yellow" : 9,
    "A_Evt_Evo_Easter_XIX_Phoenix_Red" : 9,
    "A_Evt_Evo_Easter_XIX_Phoenix_Blue" : 9,
    "A_Evt_Evo_December_XX_Watchful_Winter_Owl" : 9,
    "A_Evt_Evo_Car_XX_Burukbrak_Gaelagil" : 9,
    "A_Evt_Evo_Autumn_XIX_Bear_Panda" : 9,
    "A_Evt_Evo_May_XXI_Queen_Fairys_Retreat": 9,
    "A_Evt_Evo_July_XXI_Triumph_of_Tides": 9,
    "A_Evt_Evo_September_XXI_Red_Panda_Master": 9,
    "A_Evt_Evo_October_XXI_Witch_Summoning_Circle": 9,
    "A_Evt_Evo_December_XXI_Boblins_Express_Service": 9,
}

function setAndReload(id) {
    let select = document.getElementById(id.id);
    let stage = select.options[select.selectedIndex].value;
    selectedEvoStages[id.id.substring(12)] = parseInt(stage);
    readBuildingsJSON();
}


function readBuildingsJSON() {
    prepSetAlertElements();

    create_exception("Loading...", 10000, 'primary');

    $.get('database/buildings.json')
        .done(data => {

            let eventSelect = document.getElementById('input_event');
            let filterEventData = eventSelect.options[eventSelect.selectedIndex].value;
            let productionSelect = document.getElementById('input_production');
            let filterProductionData = productionSelect.options[productionSelect.selectedIndex].value;
            let appearancesCheckbox = document.getElementById('includeAppearances');
            let includeAppearances = appearancesCheckbox.checked;
            let orderBySelect = document.getElementById('input_orderBy');
            let orderByOption = orderBySelect.options[orderBySelect.selectedIndex].value;
            let isTriggeredOrderBy = orderByOption !== 'all_';
            let chapterSelect = document.getElementById('input_chapter');
            let chapterOption = chapterSelect.options[chapterSelect.selectedIndex].value;
            let inputField = document.getElementById('input_search');
            let inputValue = inputField.value;

            clearColumnWithTables();

            let filteredData;

            if (inputValue.trim() === '') {
                if (location.href.split('#').length > 1 && location.href.split('#')[1] !== "") {
                    filteredData = searchForBuildingID(data, location.href.split('#')[1]);
                } else {
                    filteredData = filterData(data, filterEventData, filterProductionData, includeAppearances);
                }
            } else {
                filteredData = searchByInput(data, inputValue);
            }

            if (includeAppearances) {
                filteredData = sortByDay(filteredData, filterEventData);
            }

            if (orderByOption === 'all_') {
                chapterOption = 'all_';
                chapterSelect.value = 'all_';
            }

            if (isTriggeredOrderBy) {
                if (chapterOption === 'all_') {
                    let maxim = 0;
                    let chapterTemp = 0;
                    for(i = 0; i < chapterSelect.length; i++) {
                        chapterTemp = parseInt(chapterSelect.options[i].value);
                        if (chapterTemp > maxim) {
                            maxim = chapterTemp;
                        }
                    }
                    chapterSelect.value = maxim.toString();
                    chapterOption = maxim;

                }
                filteredData = sortBySelectedAttribute(filteredData, selectedEvoStages, chapterOption, orderByOption);
            }

            for (var i = 0; i < filteredData.length; i++) {
                let isEvo = false;
                let displayStage = 0;
                if (filteredData[i]['id'].toLowerCase().includes('_evo_')) {
                    isEvo = true;
                    displayStage = selectedEvoStages[filteredData[i]['id']];
                }
                var h5 = document.createElement('h5');
                h5.id = filteredData[i]['id'];
                h5.className = "card-title text-center text-title font-weight-bold";
                h5.style.textAlign = "left";
                h5.innerHTML = `${langBuildings(filteredData[i])}`;
                document.getElementById('column_with_tables').appendChild(h5);
                var div = document.createElement('div');
                div.id = filteredData[i]['id']+"_div";
                div.className = 'bbTable';
                div.style.marginBottom = "20px";
                var firstTable = document.createElement('table');
                firstTable.className = 'table-primary';
                firstTable.style.width = "100%";
                var t1body = document.createElement('tbody');
                var t1r = document.createElement('tr');
                var td11 = document.createElement('td');
                td11.style.width = "60%";
                td11.innerHTML = `<img src="${filteredData[i]['image']}">`;
                var td12 = document.createElement('td');
                td12.style.width = "40%";
                if (isEvo) {
                    let expiringDuration = `-`;
                    if (filteredData[i].hasOwnProperty("expiring")) {
                        expiringDuration = (filteredData[i]["expiring"]["duration"]/60/60).toString()+"h";
                    }
                    td12.innerHTML = `<b>${langUI("Building type:")}</b> ${buildingTypes[filteredData[i]['type']]}<br>
                                    <b>${langUI("Construction time:")}</b> ${filteredData[i]['construction_time']}s<br>
                                    <b>${langUI("Size:")}</b> ${filteredData[i]['width']}x${filteredData[i]['length']}<br>
                                    <b>${langUI("Set building:")}</b> -<br>
                                    <b>${langUI("Expiring:")}</b> ${expiringDuration}<br>
                                    <b>${langUI("Upgrade costs:")}</b> ${evoUpgradeCosts[filteredData[i]['id']]}<br>`;
                    if (feedingEffectsDescriptions.hasOwnProperty(filteredData[i]['id'])) {
                        td12.innerHTML += `<b>Feeding effect:</b> ${feedingEffectsDescriptions[filteredData[i]['id']]}<br>`;
                    }
                    td12.innerHTML += `<b>Stage:</b><br>`;
                    let tempArr = ["","","","","","","","","",""];
                    tempArr[selectedEvoStages[filteredData[i]['id']]] = "selected";
                    td12.innerHTML += `<select id="${"input_stage_"+filteredData[i]['id']}" class="custom-select" style="width: 70px; margin-bottom: 10px;" onchange="setAndReload(this)">
                            <option value="9" ${tempArr[9]}>10</option>
                            <option value="8" ${tempArr[8]}>9</option>
                            <option value="7" ${tempArr[7]}>8</option>
                            <option value="6" ${tempArr[6]}>7</option>
                            <option value="5" ${tempArr[5]}>6</option>
                            <option value="4" ${tempArr[4]}>5</option>
                            <option value="3" ${tempArr[3]}>4</option>
                            <option value="2" ${tempArr[2]}>3</option>
                            <option value="1" ${tempArr[1]}>2</option>
                            <option value="0" ${tempArr[0]}>1</option>
                        </select>`;
                } else {
                    let setDesc = "-";
                    if (filteredData[i].hasOwnProperty('setBuilding')) {
                        setDesc = setNames[filteredData[i]['setBuilding']['setID']];
                    }
                    let expiringDuration = `-`;
                    if (filteredData[i].hasOwnProperty("expiring")) {
                        expiringDuration = (filteredData[i]["expiring"]["duration"]/60/60).toString()+"h";
                    }
                    td12.innerHTML = `<b>${langUI("Building type:")}</b> ${buildingTypes[filteredData[i]['type']]}<br>
                                    <b>${langUI("Construction time:")}</b> ${filteredData[i]['construction_time']}s<br>
                                    <b>${langUI("Size:")}</b> ${filteredData[i]['width']}x${filteredData[i]['length']}<br>
                                    <b>${langUI("Set building:")}</b> ${setDesc}<br>
                                    <b>${langUI("Expiring:")}</b> ${expiringDuration}`;
                }
                t1r.appendChild(td11);
                t1r.appendChild(td12);
                let h5hashtag = document.createElement('h5');
                h5hashtag.id = "#"+filteredData[i]['id'];
                h5hashtag.style.textAlign = "left";
                h5hashtag.style.position = "absolute";
                h5hashtag.style.marginRight = "-55px";
                h5hashtag.style.marginTop = "-35px";
                h5hashtag.innerHTML = '<a class="text-link font-weight-bold" id="hash"><img src="images/general/share-symbol.png" class="pointer" title="Open in new tab and share" width="15px;"></a><br>';
                h5hashtag.addEventListener('click', function() {
                    openInNewTab(location.href.split(`#`)[0]+h5hashtag.id);
                });
                t1r.appendChild(h5hashtag);
                t1body.appendChild(t1r);
                firstTable.appendChild(t1body);
                div.appendChild(firstTable);

                var secondTable = document.createElement('table');
                secondTable.className = 'table-primary text-center';
                secondTable.style.width = "100%";
                var t2body = document.createElement('tbody');
                var tr21 = document.createElement('tr');
                for (var h = 0; h < numberOfChapters + 1; h++) {
                    var th = document.createElement('th');
                    if (h === 0) {
                        th.innerHTML = `${langUI("Chapter / Bonus")}`;
                    } else {
                        th.innerHTML = `<img src=${chapter_icons[h]}>`;
                    }
                    tr21.appendChild(th);
                }
                var setTable = document.createElement('table');
                setTable.className = 'table-primary text-center';
                setTable.style.width = "100%";
                var tSetBody = document.createElement('tbody');
                t2body.appendChild(tr21);
                if (!isEvo) {
                    for (var prod = 0; prod < filteredData[i]['all_productions'].length; prod++) {
                        var tr = document.createElement('tr');
                        for (var ch = 0; ch < numberOfChapters + 1; ch++) {
                            var td = document.createElement('td');
                            if (ch === 0) {
                                td.innerHTML = `${goods_icons[filteredData[i]['all_productions'][prod][0]]}`;
                                if (filteredData[i]['all_productions'])
                                if (filteredData[i]['all_productions'][prod][0] != 'providedCulture' &&
                                    filteredData[i]['all_productions'][prod][0] != 'provided_population') {
                                    //tymto for cyklom hladam ten chapter, v ktorom je ta produkcia, ktorej cas chcem zistit
                                    for (var chPom = 1; chPom < numberOfChapters + 1; chPom++) {
                                        if (filteredData[i]['chapters'][chPom].hasOwnProperty(filteredData[i]['all_productions'][prod][0])) {
                                            td.innerHTML += `${filteredData[i]['earlyPickupTime'] / 60 / 60}h / <b>${filteredData[i]['chapters'][chPom][filteredData[i]['all_productions'][prod][0]]['production_time'] / 60 / 60}h</b>`;
                                            break;
                                        }
                                    }
                                }
                            } else {
                                if (filteredData[i]['chapters'][ch].hasOwnProperty(filteredData[i]['all_productions'][prod][0])) {
                                    if (typeof filteredData[i]['chapters'][ch][filteredData[i]['all_productions'][prod][0]] === 'object') {
                                        td.innerHTML = `${filteredData[i]['chapters'][ch][filteredData[i]['all_productions'][prod][0]]['value']}`;
                                    } else {
                                        td.innerHTML = `${filteredData[i]['chapters'][ch][filteredData[i]['all_productions'][prod][0]]}`;
                                    }
                                } else {
                                    td.innerHTML = `-`;
                                }
                            }
                            tr.appendChild(td);
                        }
                        t2body.appendChild(tr);
                        if (isTriggeredOrderBy && orderByOption === filteredData[i]['all_productions'][prod][0]) {
                            var trPerSquare = document.createElement('tr');
                            for (var ch = 0; ch < numberOfChapters + 1; ch++) {
                                var tdPerSquare = document.createElement('td');
                                if (ch === 0) {
                                    if (prioritiesProduction.includes(filteredData[i]['all_productions'][prod][0].toLowerCase())) {
                                        tdPerSquare.innerHTML = `<h7>${goods_icons[filteredData[i]['all_productions'][prod][0]]} / per square per 1h</h7>`;
                                    } else {
                                        tdPerSquare.innerHTML = `<h7>${goods_icons[filteredData[i]['all_productions'][prod][0]]} / per square</h7>`;
                                    }
                                } else {
                                    if (filteredData[i]['chapters'][ch].hasOwnProperty(filteredData[i]['all_productions'][prod][0])) {
                                        if (filteredData[i]['chapters'][ch][filteredData[i]['all_productions'][prod][0]].hasOwnProperty('production_time')) {
                                            tdPerSquare.innerHTML = `<h7>${(filteredData[i]['chapters'][ch][filteredData[i]['all_productions'][prod][0]]['value'] / (filteredData[i]['length'] * filteredData[i]['width']) / (filteredData[i]['chapters'][ch][filteredData[i]['all_productions'][prod][0]]['production_time'] / 3600)).toFixed(1)}</h7>`;
                                        } else {
                                            tdPerSquare.innerHTML = `<h7>${(filteredData[i]['chapters'][ch][filteredData[i]['all_productions'][prod][0]]['value'] / (filteredData[i]['length'] * filteredData[i]['width'])).toFixed(1)}</h7>`;
                                        }
                                    } else {
                                        tdPerSquare.innerHTML = `-`;
                                    }
                                }
                                trPerSquare.appendChild(tdPerSquare);
                            }
                            t2body.appendChild(trPerSquare);
                        }
                        //PRIDAJ EXPIRING EFFECT CONFIG VALUES (AK EXISTUJE)
                        if (filteredData[i].hasOwnProperty("expiring") &&
                            Object.keys(filteredData[i]["expiring"]["values"]).length >= numberOfChapters) {
                            var trEffect = document.createElement('tr');
                            for (var ch = 0; ch < numberOfChapters + 1; ch++) {
                                var tdEffect = document.createElement('td');
                                if (ch === 0) {
                                    tdEffect.innerHTML = `${iconsImages[filteredData[i]["expiring"]["iconID"]]}`;
                                } else {
                                    if (filteredData[i]["expiring"].hasOwnProperty("format") &&
                                    filteredData[i]["expiring"]["format"].toLowerCase().includes("percentage")) {
                                        tdEffect.innerHTML = `+${filteredData[i]["expiring"]["values"][ch]*100}%`;
                                    } else {
                                        tdEffect.innerHTML = `${filteredData[i]["expiring"]["values"][ch]}`;
                                    }
                                }
                                trEffect.appendChild(tdEffect);
                            }
                            t2body.appendChild(trEffect);
                        }
                    }
                    secondTable.appendChild(t2body);
                    //SETOVE PARAMETRE:
                    if (filteredData[i].hasOwnProperty('setBuilding')) {

                        let bonuses = orderSetBuildingData(filteredData[i]);
                        //BONUSES: [[1.budova: [CH1: [prod, value]],[CH2: [prod, value]], ...],[2.budova: ]]
                        //BONUSES: zoznam pripojeni, kazdy ma num_of_ch zoznamov dvojic [prod value]

                        let prodChangeFlags = getProdChangeFlags(bonuses);

                        if (bonuses.length > 0) {
                            for (let setLine = -1; setLine < bonuses.length; setLine++) {
                                let trSet = document.createElement('tr');
                                let idxFlag = -1;
                                let chToPrint = 1;
                                if (setLine === -1) {
                                    while (chToPrint <= numberOfChapters) {
                                        let thSet = document.createElement('th');
                                        if (idxFlag === -1) {
                                            thSet.innerHTML = `${langUI("Chapter / Connection")}`;
                                            idxFlag++;
                                        } else {
                                            if (prodChangeFlags[idxFlag] !== chToPrint) {
                                                thSet.innerHTML = `<img src=${chapter_icons[chToPrint]}>`;
                                                chToPrint++;
                                            } else {
                                                thSet.innerHTML = `-`;
                                                idxFlag++;
                                            }
                                        }
                                        trSet.appendChild(thSet);
                                    }
                                } else {
                                    while (chToPrint <= numberOfChapters) {
                                        let tdSet = document.createElement('td');
                                        if (idxFlag === -1) {
                                            tdSet.innerHTML = `${setLine + 1}. ${langUI("building")}`;
                                            idxFlag++;
                                        } else {
                                            if (prodChangeFlags[idxFlag] !== chToPrint) {
                                                tdSet.innerHTML = `${bonuses[setLine][chToPrint - 1][1].toFixed(0)}`;
                                                chToPrint++;
                                            } else {
                                                tdSet.innerHTML = `${goods_icons[bonuses[setLine][chToPrint - 1][0]]}`;
                                                idxFlag++;
                                            }
                                        }
                                        trSet.appendChild(tdSet);
                                    }
                                }
                                tSetBody.appendChild(trSet);
                            }
                        }
                    }
                } else {
                    for (var prod = 0; prod < filteredData[i]['all_productions'].length; prod++) {
                        var tr = document.createElement('tr');
                        let existsInThisStage = false;
                        for (let chAttempt = 1; chAttempt < numberOfChapters+1; chAttempt++) {
                            if (filteredData[i]['chapters'][chAttempt][displayStage].hasOwnProperty(filteredData[i]['all_productions'][prod][0])) {
                                existsInThisStage = true;
                                break;
                            }
                        }
                        if (existsInThisStage) {
                            for (var ch = 0; ch < numberOfChapters + 1; ch++) {
                                var td = document.createElement('td');
                                if (ch === 0) {
                                    td.innerHTML = `${goods_icons[filteredData[i]['all_productions'][prod][0]]}`;
                                    if (filteredData[i]['all_productions'][prod].includes("switchable")) {
                                        td.innerHTML = td.innerHTML.substring(0,td.innerHTML.length-4);
                                        td.innerHTML += `<img src="images/general/circle_info.png" title="${langUI('This is a switchable production. Only one of the switchable productions can be running at the same time.')}"><br>`;
                                    }
                                    if (filteredData[i]['all_productions'][prod][0] != 'providedCulture' &&
                                        filteredData[i]['all_productions'][prod][0] != 'provided_population') {
                                        //tymto for cyklom hladam ten chapter, v ktorom je ta produkcia, ktorej cas chcem zistit
                                        for (var chPom = 1; chPom < numberOfChapters + 1; chPom++) {
                                            if (filteredData[i]['chapters'][chPom][displayStage].hasOwnProperty(filteredData[i]['all_productions'][prod][0])) {
                                                td.innerHTML += `${filteredData[i]['earlyPickupTime'] / 60 / 60}h / <b>${filteredData[i]['chapters'][chPom][displayStage][filteredData[i]['all_productions'][prod][0]]['production_time'] / 60 / 60}h</b>`;
                                                break;
                                            }
                                        }
                                    }
                                } else {
                                    if (filteredData[i]['chapters'][ch][displayStage].hasOwnProperty(filteredData[i]['all_productions'][prod][0])) {
                                        if (typeof filteredData[i]['chapters'][ch][displayStage][filteredData[i]['all_productions'][prod][0]] === 'object') {
                                            td.innerHTML = `${(filteredData[i]['chapters'][ch][displayStage][filteredData[i]['all_productions'][prod][0]]['value']).toFixed(0)}`;
                                        } else {
                                            td.innerHTML = `${(filteredData[i]['chapters'][ch][displayStage][filteredData[i]['all_productions'][prod][0]]).toFixed(0)}`;
                                        }
                                    } else {
                                        td.innerHTML = `-`;
                                    }
                                }
                                tr.appendChild(td);
                            }
                        }
                        t2body.appendChild(tr);
                        if (isTriggeredOrderBy && orderByOption === filteredData[i]['all_productions'][prod][0]) {
                            if (existsInThisStage) {
                                var trPerSquare = document.createElement('tr');
                                for (var ch = 0; ch < numberOfChapters + 1; ch++) {
                                    var tdPerSquare = document.createElement('td');
                                    if (ch === 0) {
                                        if (prioritiesProduction.includes(filteredData[i]['all_productions'][prod][0].toLowerCase())) {
                                            tdPerSquare.innerHTML = `<h7>${goods_icons[filteredData[i]['all_productions'][prod][0]]} / per square per 1h</h7>`;
                                        } else {
                                            tdPerSquare.innerHTML = `<h7>${goods_icons[filteredData[i]['all_productions'][prod][0]]} / per square</h7>`;
                                        }
                                    } else {
                                        if (filteredData[i]['chapters'][ch][displayStage].hasOwnProperty(filteredData[i]['all_productions'][prod][0])) {
                                            if (filteredData[i]['chapters'][ch][displayStage][filteredData[i]['all_productions'][prod][0]].hasOwnProperty('production_time')) {
                                                tdPerSquare.innerHTML = `<h7>${(filteredData[i]['chapters'][ch][displayStage][filteredData[i]['all_productions'][prod][0]]['value'] / (filteredData[i]['length'] * filteredData[i]['width']) / (filteredData[i]['chapters'][ch][displayStage][filteredData[i]['all_productions'][prod][0]]['production_time'] / 3600)).toFixed(1)}</h7>`;
                                            } else {
                                                tdPerSquare.innerHTML = `<h7>${(filteredData[i]['chapters'][ch][displayStage][filteredData[i]['all_productions'][prod][0]]['value'] / (filteredData[i]['length'] * filteredData[i]['width'])).toFixed(1)}</h7>`;
                                            }
                                        } else {
                                            tdPerSquare.innerHTML = `-`;
                                        }
                                    }
                                    trPerSquare.appendChild(tdPerSquare);
                                }
                            }
                            t2body.appendChild(trPerSquare);
                        }
                    }
                    secondTable.appendChild(t2body);
                }

                div.appendChild(secondTable);
                if (filteredData[i].hasOwnProperty('setBuilding')) {
                    setTable.appendChild(tSetBody);
                    div.appendChild(setTable);
                }
                //PET FEEDING EFFECT
                if (isEvo && filteredData[i].hasOwnProperty("feedingEffect")) {
                    var petJSON = filteredData[i]["feedingEffect"];
                    var petDiv = document.createElement('div');
                    petDiv.className = 'bbTable';
                    petDiv.style.marginTop = "20px";
                    var petCenter = document.createElement('center');
                    var petImg = document.createElement('img');
                    petImg.src = "images/general/feeding_icon.png";
                    petCenter.appendChild(petImg);
                    //petDiv.appendChild(petCenter);
                    var petUl = document.createElement('ul');
                    var petLi1 = document.createElement('li');
                    petLi1.innerHTML = `<b>Effect description: </b>${petJSON['description']}`;
                    petUl.appendChild(petLi1);
                    var petLi2 = document.createElement('li');
                    petLi2.innerHTML = `<b>Duration: </b>${petJSON['duration']/60/60}h`;
                    petUl.appendChild(petLi2);
                    if (petJSON.hasOwnProperty("source") && allowedFeedingMultiplicators.hasOwnProperty(petJSON['source'])) {
                        var petLi3 = document.createElement('li');
                        petLi3.innerHTML = `<b>Note: </b>The values are multiplied by ${allowedFeedingMultiplicators[petJSON['source']]}.`
                        petUl.appendChild(petLi3);
                    }
                    petDiv.appendChild(petUl);

                    var petTable = document.createElement('table');
                    petTable.className = 'table-primary text-center';
                    petTable.style.width = "100%";
                    var petBody = document.createElement('tbody');
                    var petTr1 = document.createElement('tr');
                    for (let stg = 0; stg <= 10; stg++) {
                        var petTh = document.createElement('th');
                        if (stg === 0) {
                            petTh.innerHTML = `${langUI("Stage / Feeding effect")}`;
                        } else {
                            petTh.innerHTML = `${stg}`;
                        }
                        petTr1.appendChild(petTh);
                    }
                    petBody.appendChild(petTr1);
                    var petTr2 = document.createElement('tr');
                    for (let stg = 0; stg <= 10; stg++) {
                        var petTd = document.createElement('td');
                        if (stg === 0) {
                            petTd.innerHTML = `${feedingEffectsDescriptions[filteredData[i]['id']]}`;
                        } else {
                            if (petJSON['format'].toLowerCase().includes("percentage")) {
                                petTd.innerHTML = `${(petJSON['valuesStages'][stg]*100).toFixed(1)}%`;
                            } else {
                                petTd.innerHTML = `${petJSON['valuesStages'][stg]}`;
                            }
                        }
                        petTr2.appendChild(petTd);
                    }
                    petBody.appendChild(petTr2);
                    petTable.appendChild(petBody);
                    petDiv.appendChild(petTable);
                    div.appendChild(petDiv);
                }
                document.getElementById('column_with_tables').appendChild(div);
            }
            create_exception("Buildings Generated!", 3, 'success');
            //create_exception("If the values are not displaying correctly, press CTRL+F5 to make full refresh of the website", 10, "warning");
        })
}

function filterEvent(filterData, objectToPass) {
    if (filterData.includes('all')) {
        return true;
    }
    return objectToPass['id'].toLowerCase().includes(filterData.toLowerCase());
}

function filterProduction(filterData, objectToPass) {
    //console.log(filterData+" + "+objectToPass['name'])
    if (filterData.includes('all')) {
        return true;
    }
    let filterDataSplit = "";
    let logicalOperand = "";
    if (filterData.includes("&")) {
        filterDataSplit = filterData.split("&");
        logicalOperand = "&";
    } else {
        filterDataSplit = filterData.split("|");
        logicalOperand = "|";
    }
    if (filterDataSplit[0] === 'only') {
        var neededToPass = filterDataSplit.length-1;
        if (neededToPass != objectToPass['all_productions'].length) {
            return false;
        }
        for (var i = 1; i < filterDataSplit.length; i++) {
            for (var j = 0; j < objectToPass['all_productions'].length; j++) {
                if (filterDataSplit[i] === objectToPass['all_productions'][j][0]) {
                    neededToPass--;
                }
            }
        }
        return neededToPass === 0;
    } else {
        if (logicalOperand === "&") {
            var neededToPass = filterDataSplit.length;
            for (var i = 0; i < filterDataSplit.length; i++) {
                for (var j = 0; j < objectToPass['all_productions'].length; j++) {
                    if (filterDataSplit[i] === objectToPass['all_productions'][j][0]) {
                        neededToPass--;
                    }
                }
            }
            return neededToPass === 0;
        } else {
            let passed = 0;
            for (let i = 0; i < filterDataSplit.length; i++) {
                for (let j = 0; j < objectToPass['all_productions'].length; j++) {
                    if (filterDataSplit[i] === objectToPass['all_productions'][j][0]) {
                        passed++;
                    }
                }
            }
            return passed >= 1;
        }
    }
}

function hasAppearance(filterData, objectToPass) {
    return objectToPass['appearances'].hasOwnProperty(filterData);
}

function excludeAsDisabled(objectToPass) {
    var select = document.getElementById('input_event');
    for (var i = 0; i < select.length; i++) {
        var option = select.options[i];
        if (option.disabled && objectToPass['id'].toLowerCase().includes(option.value.toLowerCase())) {
            return true;
        }
    }
    return false;
}

function prepSetAlertElements() {
    html_alert = document.getElementById('alert');
    html_close = document.getElementById('close');
    html_text = document.getElementById('text');
}

function filterData(data, filterEventData, filterProductionData, includeAppearances) {
    let filteredData = [];
    for (let i = 0; i < data.length; i++) {
        if ((filterEvent(filterEventData, data[i]) && filterProduction(filterProductionData, data[i])) ||
            (includeAppearances && hasAppearance(filterEventData, data[i]))) {
            if (!excludeAsDisabled(data[i])) {
                filteredData.push(data[i]);
            }
        }
    }
    return filteredData;
}

function sortByDay(filteredData, filterEventData) {
    let res = filteredData;
    for (var j = 0; j < res.length; j++) {
        for (var k = 0; k < res.length-1; k++) {
            if (res[k]['appearances'][filterEventData] > res[k+1]['appearances'][filterEventData]) {
                let temp = res[k];
                res[k] = res[k+1];
                res[k+1] = temp;
            }
        }
    }
    return res;
}

function sortBySelectedAttribute(filteredData, selectedEvoStages, chapterOption, orderByOption) {
    for (var j = 0; j < filteredData.length; j++) {
        for (var k = 0; k < filteredData.length-1; k++) {
            var swap = false;
            let displayStage1 = selectedEvoStages[filteredData[k]['id']];
            let displayStage2 = selectedEvoStages[filteredData[k+1]['id']];
            if (!filteredData[k]['id'].toLowerCase().includes('_evo_') && !filteredData[k+1]['id'].toLowerCase().includes('_evo_')) {
                if (filteredData[k]['chapters'][parseInt(chapterOption)].hasOwnProperty(orderByOption)) {
                    if (filteredData[k + 1]['chapters'][parseInt(chapterOption)].hasOwnProperty(orderByOption)) {
                        if (filteredData[k]['chapters'][parseInt(chapterOption)][orderByOption].hasOwnProperty('production_time')) {
                            //ak treba brat do uvahy aj cas
                            if (filteredData[k]['chapters'][parseInt(chapterOption)][orderByOption]['value'] / (filteredData[k]['width'] * filteredData[k]['length']) / (filteredData[k]['chapters'][parseInt(chapterOption)][orderByOption]['production_time'] / 3600) <
                                filteredData[k + 1]['chapters'][parseInt(chapterOption)][orderByOption]['value'] / (filteredData[k + 1]['width'] * filteredData[k + 1]['length']) / (filteredData[k + 1]['chapters'][parseInt(chapterOption)][orderByOption]['production_time'] / 3600)) {
                                swap = true;
                            }
                        } else if (filteredData[k]['chapters'][parseInt(chapterOption)][orderByOption]['value'] / (filteredData[k]['width'] * filteredData[k]['length']) <
                            filteredData[k + 1]['chapters'][parseInt(chapterOption)][orderByOption]['value'] / (filteredData[k + 1]['width'] * filteredData[k + 1]['length'])) {
                            //ak to nie je produkcia s casom
                            swap = true;
                        }
                    }
                } else {
                    swap = true;
                }
            } else {
                if (filteredData[k]['id'].toLowerCase().includes('_evo_') && !filteredData[k+1]['id'].toLowerCase().includes('_evo_')) {
                    if (filteredData[k]['chapters'][parseInt(chapterOption)][displayStage1].hasOwnProperty(orderByOption)) {
                        if (filteredData[k + 1]['chapters'][parseInt(chapterOption)].hasOwnProperty(orderByOption)) {
                            if (filteredData[k]['chapters'][parseInt(chapterOption)][displayStage1][orderByOption].hasOwnProperty('production_time')) {
                                if (filteredData[k]['chapters'][parseInt(chapterOption)][displayStage1][orderByOption]['value'] / (filteredData[k]['width'] * filteredData[k]['length']) / (filteredData[k]['chapters'][parseInt(chapterOption)][displayStage1][orderByOption]['production_time'] / 3600) <
                                    filteredData[k + 1]['chapters'][parseInt(chapterOption)][orderByOption]['value'] / (filteredData[k + 1]['width'] * filteredData[k + 1]['length']) / (filteredData[k + 1]['chapters'][parseInt(chapterOption)][orderByOption]['production_time'] / 3600)) {
                                    swap = true;
                                }
                            } else if (filteredData[k]['chapters'][parseInt(chapterOption)][displayStage1][orderByOption]['value'] / (filteredData[k]['width'] * filteredData[k]['length']) <
                                filteredData[k + 1]['chapters'][parseInt(chapterOption)][orderByOption]['value'] / (filteredData[k + 1]['width'] * filteredData[k + 1]['length'])) {
                                swap = true;
                            }
                        }
                    } else {
                        swap = true;
                    }
                } else {
                    if (!filteredData[k]['id'].toLowerCase().includes('_evo_') && filteredData[k+1]['id'].toLowerCase().includes('_evo_')) {
                        if (filteredData[k]['chapters'][parseInt(chapterOption)].hasOwnProperty(orderByOption)) {
                            if (filteredData[k + 1]['chapters'][parseInt(chapterOption)][displayStage2].hasOwnProperty(orderByOption)) {
                                if (filteredData[k]['chapters'][parseInt(chapterOption)][orderByOption].hasOwnProperty('production_time')) {
                                    if (filteredData[k]['chapters'][parseInt(chapterOption)][orderByOption]['value'] / (filteredData[k]['width'] * filteredData[k]['length']) / (filteredData[k]['chapters'][parseInt(chapterOption)][orderByOption]['production_time'] / 3600) <
                                        filteredData[k + 1]['chapters'][parseInt(chapterOption)][displayStage2][orderByOption]['value'] / (filteredData[k + 1]['width'] * filteredData[k + 1]['length']) / (filteredData[k + 1]['chapters'][parseInt(chapterOption)][displayStage2][orderByOption]['production_time'] / 3600)) {
                                        swap = true;
                                    }
                                } else if (filteredData[k]['chapters'][parseInt(chapterOption)][orderByOption]['value'] / (filteredData[k]['width'] * filteredData[k]['length']) <
                                    filteredData[k + 1]['chapters'][parseInt(chapterOption)][displayStage2][orderByOption]['value'] / (filteredData[k + 1]['width'] * filteredData[k + 1]['length'])) {
                                    swap = true;
                                }
                            }
                        } else {
                            swap = true;
                        }
                    } else {
                        if (filteredData[k]['chapters'][parseInt(chapterOption)].hasOwnProperty(orderByOption)) {
                            if (filteredData[k + 1]['chapters'][parseInt(chapterOption)][displayStage2].hasOwnProperty(orderByOption)) {
                                if (filteredData[k]['chapters'][parseInt(chapterOption)][displayStage1][orderByOption].hasOwnProperty('production_time')) {
                                    if (filteredData[k]['chapters'][parseInt(chapterOption)][displayStage1][orderByOption]['value'] / (filteredData[k]['width'] * filteredData[k]['length']) / (filteredData[k]['chapters'][parseInt(chapterOption)][displayStage1][orderByOption]['production_time'] / 3600) <
                                        filteredData[k + 1]['chapters'][parseInt(chapterOption)][displayStage2][orderByOption]['value'] / (filteredData[k + 1]['width'] * filteredData[k + 1]['length']) / (filteredData[k + 1]['chapters'][parseInt(chapterOption)][displayStage2][orderByOption]['production_time'] / 3600)) {
                                        swap = true;
                                    }
                                } else if (filteredData[k]['chapters'][parseInt(chapterOption)][displayStage1][orderByOption]['value'] / (filteredData[k]['width'] * filteredData[k]['length']) <
                                    filteredData[k + 1]['chapters'][parseInt(chapterOption)][displayStage2][orderByOption]['value'] / (filteredData[k + 1]['width'] * filteredData[k + 1]['length'])) {
                                    swap = true;
                                }
                            }
                        } else {
                            swap = true;
                        }
                    }
                }
            }
            if (swap) {
                let temp = filteredData[k];
                filteredData[k] = filteredData[k+1];
                filteredData[k+1] = temp;
            }
        }
    }
    return filteredData;
}

function searchByInput(data, inputValue) {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        if (langBuildings(data[i]).toLowerCase().includes(inputValue.toLowerCase())) {
            result.push(data[i]);
        }
    }
    return result;
}