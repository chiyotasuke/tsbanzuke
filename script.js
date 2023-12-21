
window.onload = function () {
	const banzukeDate = "202311"; // 196909 until now for sekitori; from 198901 all lower division matchups are complete
	const bashoDate = new Date(parseInt(banzukeDate.slice(0, 4)), parseInt(banzukeDate.slice(4) - 1));
	const divisions = ["Makuuchi", "Juryo", "Makushita", "Sandanme", "Jonidan", "Jonokuchi"];
	const divAbbr = {"Makuuchi": 'M', "Juryo": 'J', "Makushita": "Ms", "Sandanme": "Sd", "Jonidan": "Jd", "Jonokuchi": "Jk", "Mae-zumo": "Mz"};
	const rankAbbr = {"Yokozuna": 'Y', "Ozeki": 'O', "Sekiwake": 'S', "Komusubi": 'K', "Maegashira": 'M', "Juryo": 'J', 
					  "Makushita": "Ms", "Sandanme": "Sd", "Jonidan": "Jd", "Jonokuchi": "Jk", "Mae-zumo": "Mz"}
	const bashoName = {"01": "Hatsu", "03": "Haru", "05": "Natsu", "07": "Nagoya", "09": "Aki", "11": "Kyushu"};
	var fetching = false;
	var divRankQty = [];
	var matchInfo = [];
	const divDebutRikishi = [
		"Tohakuryu",
		"Churanoumi",
		"Roga",
		"Kitanowaka",
		"Hitoshi",
		"Onokatsu",
		"Asashinjo",
		"Satorufuji",
		"Kenshin",
		"Gonoumi",
		"Haruyama",
		"Anosho",
		"Higonomaru",
		"Kitanosho",
		"Zuitenryu",
		"Kuwae",
		"Taniguchi",
		"Asasorai",
		"Fujiyuho",
		"Shiroma",
		"Itoga",
		"Togyokuko",
		"Aonishiki",
		"Yamada"
		];
	const rankDebutRikishi = [
		"Gonoyama",
		"Atamifuji",
		"Tohakuryu",
		"Churanoumi",
		"Roga",
		"Kitanowaka",
		"Shimazuumi",
		"Onosato",
		"Shishi",
		"Tokihayate",
		"Takahashi",
		"Tenshoho",
		"Hitoshi",
		"Yuma",
		"Takerufuji",
		"Oshoumi",
		"Kitadaichi",
		"Kototebakari",
		"Otsuji",
		"Kayo",
		"Asahakuryu",
		"Mudoho",
		"Onokatsu",
		"Daiseizan",
		"Hokutomaru",
		"Wakanosho",
		"Hanafusa",
		"Kotokenryu",
		"Tanji",
		"Wakaikari",
		"Kotakiyama",
		"Asashinjo",
		"Satorufuji",
		"Kenshin",
		"Gonoumi",
		"Haruyama",
		"Murayama",
		"Kotosato",
		"Kenyu",
		"Chiyoshishi",
		"Kobayashi",
		"Chiyoresshi",
		"Anosho",
		"Sekizuka",
		"Tatsuosho",
		"Higonomaru",
		"Suyama",
		"Chiyoyamato",
		"Kanazawa",
		"Agora",
		"Kitanosho",
		"Kassho",
		"Zuitenryu",
		"Kuwae",
		"Taniguchi",
		"Asasorai",
		"Ogitora",
		"Fujiyuho",
		"Minorufuji",
		"Daishimatsu",
		"Ryuji",
		"Fujiso",
		"Keiga",
		"Oatari",
		"Shiroma",
		"Tamatensho",
		"Tsukioka",
		"Shokeima",
		"Shimabukuro",
		"Najima",
		"Kotomunakata",
		"Daitengu",
		"Itoga",
		"Togyokuko",
		"Takatairiku",
		"Takeuchi",
		"Kotohanashiro",
		"Sachinoyama",
		"Katsunishiki",
		"Asasakurai",
		"Aonishiki",
		"Yamada"
		]

	for (var i = 0; i < 6; i++) {
		var banzukeTable = document.createElement("table"), 
			tableHeader = document.createElement("thead"), 
			tableBody = document.createElement("tbody"), 
			title = document.createElement("th");
		
		banzukeTable.className = "banzukeTable";
		banzukeTable.id = "banzuke" + divisions[i];
		title.colSpan = "5";
		title.innerText = divisions[i];
		tableHeader.appendChild(title);
		banzukeTable.appendChild(tableHeader);
		banzukeTable.appendChild(tableBody);
		document.getElementById("banzukeContainer").appendChild(banzukeTable);
	}
	createMakuuchiBanzuke(addClickFunction);

	document.getElementById("closeButton").addEventListener("click", function() {
		document.getElementById("matchesBox").classList.add("hidden");
		document.getElementById("matchesBox").close();
	});

	document.getElementsByTagName("h2")[0].innerText = bashoName[banzukeDate.slice(4)] + ' ' + banzukeDate.slice(0, 4);

	function addClickFunction() {
		var cells = document.getElementsByName("rs");
		var divNum = {"Ms": 2, "Sd": 3, "Jd": 4, "Jk": 5};
		var divNameShort = {'0': 'M', '1': 'J', '2': "Ms", '3': "Sd", '4': "Jd", '5': "Jk"};

		jQuery("input").click(showOpponents);
		async function showOpponents(event) {
			var allRadio = document.getElementsByName("rs");
			var prevClicked = document.querySelectorAll(".selected");
			
			for (var i = 0; i < allRadio.length; i++) {
				allRadio[i].setAttribute("disabled", "true");
			}
			var prevOpponents = document.querySelectorAll(".met");
			var nonOpponents = document.querySelectorAll(".notMet");
			var filledH2hCell = document.querySelectorAll(".filled");
			
			if (typeof(prevClicked[0]) != "undefined" && prevClicked[0] != null) {
				if (event.target != prevClicked[0].previousSibling) 
					prevClicked[0].classList.remove("selected");
				if (typeof(prevOpponents[0]) != "undefined" && prevOpponents[0] != null) {
					for (var j = 0; j < prevOpponents.length; j++) {
						prevOpponents[j].classList.remove("met");
						prevOpponents[j].removeAttribute("style");
					}
				}
				if (typeof(nonOpponents[0]) != "undefined" && nonOpponents[0] != null) {
					for (var j = 0; j < nonOpponents.length; j++) 
						nonOpponents[j].classList.remove("notMet");
				}
				if (typeof(filledH2hCell[0]) != "undefined" && filledH2hCell[0] != null) {
					for (var j = 0; j < filledH2hCell.length; j++) {
						filledH2hCell[j].classList.remove("filled");
						if (filledH2hCell[j].classList.contains("hasH2h")) 
							filledH2hCell[j].classList.remove("hasH2h");
						filledH2hCell[j].innerText = "";
					}
				}
			}
			if (!event.target.nextSibling.classList.contains("selected")) {
				var div;
				var banzukeTable = document.querySelectorAll(".banzukeTable");
				var aiteRadio = [];
				var requestBody = [];
				var rsArray = [];
				var thisIndex;
				var selectedRikishiId;
				var selectedH2h;
				var rikishiResponse = await fetch("https://www.sumo-api.com/api/rikishi/" + event.target.value + "?intai=true");
				var rikishiData = await rikishiResponse.json();
				
				matchInfo = [];
				selectedRikishiId = rikishiData.sumodbId;
				if (event.target.id.slice(-1) == 'E') 
					selectedH2h = event.target.parentNode.previousSibling;
				else 
					selectedH2h = event.target.parentNode.nextSibling;
				if (selectedH2h.innerHTML == "") {
					var sumoRefLink = document.createElement("a");

					sumoRefLink.id = "sumoRefLink";
					if (typeof(selectedRikishiId) == "undefined") 
						sumoRefLink.href = "https://sumodb.sumogames.de/Rikishi.aspx?shikona=" + event.target.nextSibling.innerText + "&intai=999999";
					else 
						sumoRefLink.href = "https://sumodb.sumogames.de/Rikishi.aspx?r=" + selectedRikishiId;
					sumoRefLink.target = "_blank";
					sumoRefLink.innerText = 'ⓘ';
					sumoRefLink.title = "Open rikishi information page";
					selectedH2h.appendChild(sumoRefLink);
					selectedH2h.classList.add("filled");
				}
				event.target.nextSibling.classList.add("selected");
				div = event.target.id.slice(0, 2);
				if (typeof(divNum[div]) == "undefined") {
					if (div.charAt(0) == 'J') 
						div = 1;
					else 
						div = 0;
				}
				else 
					div = divNum[div];
				var rikishiTable = banzukeTable[div],
					rankNum, 
					range = [0, 0], 
					rangeLength;

				if (div < 2) {
					rankNum = parseInt(event.target.id.slice(1).slice(0, -1));
					aiteRadio = $("#banzuke" + divisions[div]).find($("input"));
				}
				else {
					rankNum = parseInt(event.target.id.slice(2).slice(0, -1));
					range = [rankNum - 10, rankNum + 10];
					if (range[0] < 1) 
						range[0] = 1;
					if (range[1] > divRankQty[div]) 
						range[1] = divRankQty[div];
					rangeLength = range[1]-range[0];
					for (var i = range[0]; i <= range[1]; i++) {
						aiteRadio.push(document.querySelector('#' + divNameShort[div] + i + 'E'));
						if ($('#' + divNameShort[div] + i + 'W').length > 0) 
							aiteRadio.push(document.querySelector('#' + divNameShort[div] + i + 'W'));
					}
				}
				if (div > 0 && rankNum < 8) {
					range = [divRankQty[div-1] - Math.abs(rankNum - 7), divRankQty[div-1]];
					for (var i = range[0]; i <= range[1]; i++) {
						aiteRadio.push(document.querySelector('#' + divNameShort[(div-1)] + i + 'E'));
						if ($('#' + divNameShort[(div-1)] + i + 'W').length > 0) 
							aiteRadio.push(document.querySelector('#' + divNameShort[(div-1)] + i + 'W'));
					}
				}
				else if (div < 5 && rankNum > divRankQty[div] - 7) {
					range = [1, rankNum - divRankQty[div] + 7];
					for (var i = range[0]; i <= range[1]; i++) {
						aiteRadio.push(document.querySelector('#' + divNameShort[(div+1)] + i + 'E'));
						if ($('#' + divNameShort[(div+1)] + i + 'W').length > 0) 
							aiteRadio.push(document.querySelector('#' + divNameShort[(div+1)] + i + 'W'));
					}
				}
				for (var i = 0; i < aiteRadio.length; i++) {
					if (event.target.value != aiteRadio[i].value) {
						requestBody.push({ "ids": [parseInt(event.target.value), parseInt(aiteRadio[i].value)], 
										   "key": event.target.value + '-' + aiteRadio[i].value })
					}
				}
				var response = await fetch("https://www.sumo-api.com/api/rikishis/matches", {
					method: "POST",
					body: JSON.stringify(requestBody)
				});
				var matchup = await response.json();
				var keys = Object.keys(matchup);
				
				for (var i = 0; i < keys.length; i++) {
					var aiteId = keys[i].split('-')[1];
					var aiteButton = $('input[value="' + aiteId + '"]')[0];
					var record;
					var recordCell;
					var recordText = document.createElement("span");

					//console.log(aiteCell)
					if (aiteButton.id.slice(-1) == 'E') 
						recordCell = aiteButton.parentNode.previousSibling;
					else 
						recordCell = aiteButton.parentNode.nextSibling;
					if (matchup[keys[i]].matches != null) {
						var wins = 0, fusenWins = 0, losses = 0, fusenLosses = 0, playoffWin = 0, playoffLoss = 0;
						var match = matchup[keys[i]].matches;

						matchInfo.push({aite: aiteId, matches: []});
						for (var j = 0; j < match.length; j++) {
							var matchDate = new Date(parseInt(match[j].bashoId.slice(0, 4)), parseInt(match[j].bashoId.slice(4)) - 1);
							
							if (matchDate < bashoDate) {
								var rikishiWon = true, rikishiText = [], 
									east = match[j].eastRank.split(' '), west = match[j].westRank.split(' ');

								if (match[j].winnerId != event.target.value) 
									rikishiWon = false;
								if (match[j].division == "Mae-zumo") {
									east = "Mz " + match[j].eastShikona;
									west = "Mz " + match[j].westShikona;
								} else {
									east = rankAbbr[east[0]] + east[1] + (east[2] == undefined ? "TD" : east[2].charAt(0).toLowerCase()) + ' ' + match[j].eastShikona;
									west = rankAbbr[west[0]] + west[1] + (west[2] == undefined ? "TD" : west[2].charAt(0).toLowerCase()) + ' ' + match[j].westShikona;
								}
								if (event.target.value == match[j].eastId) 
									rikishiText = [east, west];
								else
									rikishiText = [west, east];
								matchInfo.at(-1).matches.push({
									basho: match[j].bashoId, 
									day: match[j].day, 
									division: divAbbr[match[j].division], 
									won: rikishiWon, 
									rikishi: rikishiText[0], 
									aite: rikishiText[1], 
									kimarite: match[j].kimarite
								});
								if (match[j].winnerId == parseInt(event.target.value)) {
									wins++;
									if (match[j].kimarite == "fusen") 
										fusenWins++;
									if (match[j].day > 15) 
										playoffWin++;
								}
								else {
									losses++;
									if (match[j].kimarite == "fusen") 
										fusenLosses++;
									if (match[j].day > 15) 
										playoffLoss++;
								}
							}
						}
						record = wins - playoffWin;
						if (fusenWins > 0) 
							record += "[-" + fusenWins + ']';
						if (playoffWin > 0) 
							record += "[+" + playoffWin + ']';
						record += '-' + (losses - playoffLoss);
						if (fusenLosses > 0) 
							record += "[-" + fusenLosses + ']';
						if (playoffLoss > 0) 
							record += "[+" + playoffLoss + ']';
						if (wins > 0 || losses > 0) {
							recordCell.classList.add("hasH2h");
							aiteButton.nextSibling.classList.add("met");
							aiteButton.nextSibling.style.background = generateColor(wins - fusenWins, losses - fusenLosses);
							recordText.addEventListener("click", function() {
								var dialogBox = document.getElementById("matchesBox");
								var id, matches, table = document.createElement("table");
								var headerText = document.createElement("span");
								var rikishi1Link = document.createElement("a");
								var rikishi2Link = document.createElement("a");
								var aiteCell;

								if (this.parentNode.nextSibling == null) {
									aiteCell = this.parentNode.previousSibling;
								}
								else {
									aiteCell = this.parentNode.nextSibling;
								}
								id = aiteCell.children[0].value;
								rikishi1Link.innerText = document.getElementsByClassName("selected")[0].innerText;
								rikishi1Link.href = document.getElementById("sumoRefLink").href;
								rikishi2Link.innerText = aiteCell.children[1].innerText;
								rikishi2Link.href = "https://sumodb.sumogames.de/Rikishi.aspx?shikona=" + 
													aiteCell.children[1].innerText + "&b=" + banzukeDate;
								rikishi1Link.target = "_blank";
								rikishi2Link.target = "_blank";
								headerText.id = "h2hText";
								headerText.appendChild(rikishi1Link);
								headerText.innerHTML += " vs. ";
								headerText.appendChild(rikishi2Link);
								headerText.innerHTML += ' ' + this.innerText;
								matches = matchInfo.find((obj) => obj.aite == id).matches;
								table.id = "matchesTable";
								table.appendChild(document.createElement("tbody"));
								for (var j = 0; j < matches.length; j++) {
									var row = document.createElement("tr");
									var links = [{}, {}, {}, {}];
									var shape = matches[j].kimarite == "fusen" ? " ◼": " ●";
									var kimariteCell = document.createElement("td");

									links[0].text = matches[j].basho.slice(0, 4) + '.' + matches[j].basho.slice(4);
									links[0].url = "https://sumodb.sumogames.de/Banzuke.aspx?b=" + matches[j].basho + '#' + matches[j].division;
									links[1].text = "Day " + matches[j].day;
									links[1].url = "https://sumodb.sumogames.de/Results.aspx?b=" + matches[j].basho + "&d=" + matches[j].day;
									links[2].text = matches[j].rikishi;
									links[2].url = "https://sumodb.sumogames.de/Rikishi.aspx?shikona=" + matches[j].rikishi.split(' ')[1] + "&b=" + matches[j].basho;
									links[3].text = matches[j].aite;
									links[3].url = "https://sumodb.sumogames.de/Rikishi.aspx?shikona=" + matches[j].aite.split(' ')[1] + "&b=" + matches[j].basho;
									kimariteCell.innerText = matches[j].kimarite;
									for (var k = 0; k < 4; k++) {
										var cell = document.createElement("td"), 
											link = document.createElement('a');

										link.innerText = links[k].text;
										link.href = links[k].url;
										link.target = "_blank";
										cell.appendChild(link);
										if (k == 2) {
											var hoshi = document.createElement("span");
											
											hoshi.innerText = shape;
											if (matches[j].won) 
												hoshi.className = "shiro";
											else 
												hoshi.className = "kuro";
											cell.appendChild(hoshi);
											cell.className = "rCell";
										}
										else if (k == 3) {
											var hoshi = document.createElement("span");
											
											hoshi.innerText = shape;
											if (!matches[j].won) 
												hoshi.className = "shiro";
											else 
												hoshi.className = "kuro";
											cell.appendChild(hoshi);
											cell.className = "rCell";
										}
										row.appendChild(cell);
									}
									row.appendChild(kimariteCell);
									table.children[0].prepend(row);
								}
								if (!dialogBox.open) {
									dialogBox.classList.remove("hidden");
									dialogBox.show();
								}
								if (dialogBox.children[1] != undefined) {
									dialogBox.children[1].children[0].remove();
									dialogBox.children[0].remove();
								}
								dialogBox.children[0].prepend(headerText);
								dialogBox.prepend(table);
							});
						}

						function generateColor(num1, num2) {
							var sum = num1 + num2;
							var ratio = Math.round(num1 / num2 * 10);
							var hue, lightness, finalColor;

							if (sum < 1) 
								finalColor = "#fff";
							else {
								if (num1 == num2) 
									finalColor = "#ececaa";
								else if (num1 < num2) {
									if (ratio <= 3) 
										finalColor = "#F7C4C4";
									else if (ratio >= 9) 
										finalColor = "#F3D1AF";
									else if (ratio == 8) 
										finalColor = "#F4CFB3";
									else if (ratio == 7) 
										finalColor = "#F4CDB6";
									else if (ratio == 6) 
										finalColor = "#F5CBBA";
									else if (ratio == 5) 
										finalColor = "#F6C8BD";
									else if (ratio == 4) 
										finalColor = "#F6C6C1";
									if (sum < 2) 
										finalColor = "#f5d0d0";
								}
								else {
									if (ratio <= 13) 
										finalColor = "#CBE693";
									else if (ratio >= 19) 
										finalColor = "#97EF97";
									else if (ratio == 18) 
										finalColor = "#A0EE96";
									else if (ratio == 17) 
										finalColor = "#A8EC96";
									else if (ratio == 16) 
										finalColor = "#B1EB95";
									else if (ratio == 15) 
										finalColor = "#BAE994";
									else if (ratio == 14) 
										finalColor = "#C2E894";
									if (sum < 2) 
										finalColor = "#a9f1a9";
								}
							}
							return finalColor;
						}
					}
					else {
						record = "0-0";
						//radioButton.nextSibling.classList.add("notMet");
					}
					recordText.innerText = record;
					recordCell.appendChild(recordText);
					recordCell.classList.add("filled");
				}
				console.log(matchInfo);
			}
			else 
				event.target.nextSibling.classList.remove("selected");
			for (var i = 0; i < allRadio.length; i++) {
				allRadio[i].removeAttribute("disabled");
			}
		}
	}
	async function createMakuuchiBanzuke(callback) {
		var hierarchy = {"Yokozuna": 4, "Ozeki": 3, "Sekiwake": 2, "Komusubi": 1, "Maegashira": 0};

		for (var j = 0; j < 6; j++) {
			var response = await fetch("https://www.sumo-api.com/api/basho/" + banzukeDate + "/banzuke/" + divisions[j]);
			var rikishi = await response.json();
		 	
 			divRankQty.push(rikishi.east[rikishi.east.length-1].rank.split(' ')[1]);
		 	for (var i = 0; i < rikishi.east.length; i++) {
		 		var eastRank = rikishi.east[i].rank.split(' ');
		 		var westRank;
		 		var row = document.createElement("tr");

		 		if (hierarchy[eastRank[0]] > 0) 
		 			row.classList.add("sanyakuRow");
		 		if (typeof(rikishi.west[i]) == "undefined") 
		 			rikishi.west.push({});
		 		else 
		 			westRank = rikishi.west[i].rank.split(' ');
		 		if (eastRank[0] != westRank[0]) {
			 		if (hierarchy[eastRank[0]] > hierarchy[westRank[0]]) {
			 			rikishi.west.splice(i, 0, {});
			 		}
			 		else {
			 			rikishi.east.splice(i, 0, {});
			 			eastRank[0] = westRank[0];
			 			eastRank[1] = westRank[1];
			 		}
		 		}
		 		if (eastRank[2].charAt(0) == 'T') 
		 			rikishi.west.splice(i, 0, {});
		 		if (!jQuery.isEmptyObject(rikishi.east[i])) 
		 			createRikishi('E');
		 		else 
		 			createBlank();
		 		var rowRank = document.createElement("th"), 
	 				rankNum = eastRank[1], 
	 				divShort;

	 			divShort = rankAbbr[eastRank[0]];
		 		rowRank.innerText = divShort;
	 			if (hierarchy[eastRank[0]] < 1 || hierarchy[eastRank[0]] == null) 
	 				rowRank.innerText += rankNum;
		 		row.appendChild(rowRank);
		 		if (!jQuery.isEmptyObject(rikishi.west[i])) 
		 			createRikishi('W')
		 		else 
		 			createBlank();
		 		document.getElementsByClassName("banzukeTable")[j].children[1].appendChild(row);
		 		
		 		function createRikishi(side) {
		 			var radioButton = document.createElement("input"), 
		 				label = document.createElement("label"), 
		 				cell = document.createElement("td"), 
		 				rankNum = eastRank[1];

		 			divShort = rankAbbr[eastRank[0]];
		 			radioButton.id = divShort + rankNum + side;
		 			radioButton.type = "radio";
		 			radioButton.name = "rs";
		 			radioButton.value = side == 'E' ? rikishi.east[i].rikishiID : rikishi.west[i].rikishiID;
		 			label.innerText = side == 'E' ? rikishi.east[i].shikonaEn : rikishi.west[i].shikonaEn;
		 			if (divDebutRikishi.includes(label.innerText)) 
		 				label.classList.add("divDeb");
		 			else if (rankDebutRikishi.includes(label.innerText)) {
		 				if (hierarchy[eastRank[0]] > 0) 
			 				label.classList.add("divDeb");
			 			//else
			 			//	label.classList.add("rankDeb");
		 			}
		 			label.setAttribute("for", divShort + rankNum + side);
		 			cell.appendChild(radioButton);
		 			cell.appendChild(label);
		 			if (side == 'E') {
		 				row.appendChild(document.createElement("td"));
				 		row.appendChild(cell);
		 			}
		 			else {
		 				row.appendChild(cell);
				 		row.appendChild(document.createElement("td"));
		 			}
		 		}
		 		function createBlank() {
		 			var blank = document.createElement("td");

		 			blank.colSpan = "2";
		 			row.appendChild(blank);
		 		}
		 	}
		}
	 	callback();
	}
}