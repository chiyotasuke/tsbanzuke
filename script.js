window.onload = async function () {
  const banzukeDate = "202501"; // 196909 until now for sekitori; from 198901 all lower division matchups are complete
  const divisions = [
    "Makuuchi",
    "Juryo",
    "Makushita",
    "Sandanme",
    "Jonidan",
    "Jonokuchi",
  ];
  const divAbbr = {
    Makuuchi: "M",
    Juryo: "J",
    Makushita: "Ms",
    Sandanme: "Sd",
    Jonidan: "Jd",
    Jonokuchi: "Jk",
    "Mae-zumo": "Mz",
  };
  const rankAbbr = {
    Yokozuna: "Y",
    Ozeki: "O",
    Sekiwake: "S",
    Komusubi: "K",
    Maegashira: "M",
    Juryo: "J",
    Makushita: "Ms",
    Sandanme: "Sd",
    Jonidan: "Jd",
    Jonokuchi: "Jk",
    "Mae-zumo": "Mz",
  };
  const bashoName = {
    "01": "Hatsu",
    "03": "Haru",
    "05": "Natsu",
    "07": "Nagoya",
    "09": "Aki",
    11: "Kyushu",
  };
  var fetching = false;
  var divRankQty = [];
  var matchInfo = [];
  var activeRikishiId = [];
  const rankDebutRikishi = [
  ];
  const divDebutRikishi = [
  ];
  var intaiRikishi = [
    "Onosho",
    "Hayanami",
    "Kotoozutsu",
    "Chiyoresshi",
    "Daishosei",
    "Kotoryusei",
    "Daishiyama",
    "Kokiryu",
    "Nishikiori"
  ];
  var kyujoRikishi = [
  ];

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
  createMakuuchiBanzuke(addStuff);

  document.getElementById("closeButton").addEventListener("click", function () {
    document.getElementById("matchesBox").classList.add("hidden");
    document.getElementById("matchesBox").close();
  });
  document.getElementsByTagName("h2")[0].innerText =
    bashoName[banzukeDate.slice(4)] +
    " " +
    banzukeDate.slice(0, 4) +
    " Banzuke";
  window.onresize = matchesBoxPosition;
  $(".siteToggle").on("change", changeHref);

  function addStuff() {
    var cells = document.getElementsByName("rs");
    var divNum = { Ms: 2, Sd: 3, Jd: 4, Jk: 5 };
    var divNameShort = { 0: "M", 1: "J", 2: "Ms", 3: "Sd", 4: "Jd", 5: "Jk" };

    changeHref();
    $('input[name="rs"]').on("click", showOpponents);
    async function showOpponents(event) {
      var allRadio = document.getElementsByName("rs");
      var prevClicked = document.querySelectorAll(".selected");
      var h2hText = document.getElementsByClassName("h2h");
      var sameHeya = document.querySelectorAll(".sameHeya");
      var prevOpponents = document.querySelectorAll(".met");
      var selectedRikishiPanel = document.getElementById(
        "selectedRikishiPanel",
      );

      for (var i = 0; i < allRadio.length; i++)
        allRadio[i].setAttribute("disabled", "true");
      if (typeof prevClicked[0] != "undefined" && prevClicked[0] != null) {
        if (event.target != prevClicked[0].previousSibling)
          prevClicked[0].classList.remove("selected");
        if (
          typeof prevOpponents[0] != "undefined" &&
          prevOpponents[0] != null
        ) {
          for (var j = 0; j < prevOpponents.length; j++) {
            prevOpponents[j].classList.remove("met");
            prevOpponents[j].removeAttribute("style");
          }
        }
        if (typeof h2hText[0] != "undefined" && h2hText[0] != null) {
          while (h2hText.length) h2hText[0].remove();
        }
        if (typeof sameHeya[0] != "undefined" && sameHeya[0] != null) {
          for (var j = 0; j < sameHeya.length; j++)
            sameHeya[j].classList.remove("sameHeya");
        }
      }
      if (!event.target.nextSibling.classList.contains("selected")) {
        var div;
        var selectedRikishiHeya;
        var aiteRadio = [];
        var requestBody = [];
        var selectedRikishiId = event.target.value;
        var matchesResponse = await fetch(
          "https://www.sumo-api.com/api/rikishi/" +
            selectedRikishiId +
            "/matches",
        );
        var matchesData = await matchesResponse.json();
        var records;

        if (selectedRikishiPanel.classList.contains("hidden"))
          selectedRikishiPanel.classList.remove("hidden");
        selectedRikishiPanel.innerText =
          "Selected rikishi: " +
          event.target.id.slice(0, -1) +
          event.target.id.slice(-1).toLowerCase() +
          " " +
          event.target.nextSibling.innerText;
        records = matchesData.records;
        if (records == null) records = [];
        matchInfo = [];
        selectedRikishiHeya = event.target.dataset.inf;
        event.target.nextSibling.classList.add("selected");
        for (var i = 0; i < records.length; i++) {
          var aiteId;

          if (records[i].eastId == selectedRikishiId)
            aiteId = records[i].westId;
          else aiteId = records[i].eastId;
          if (
            activeRikishiId.includes(aiteId) &&
            records[i].bashoId != banzukeDate
          ) {
            var rikishiWon = true,
              rikishiText = [],
              east = records[i].eastRank.split(" "),
              west = records[i].westRank.split(" "),
              aiteRecord = matchInfo.find((m) => m.aite == aiteId);

            if (aiteRecord == undefined) {
              matchInfo.push({
                aite: aiteId,
                win: 0,
                loss: 0,
                fusenWin: 0,
                fusenLoss: 0,
                playoffWin: 0,
                playoffLoss: 0,
                matches: [],
              });
              aiteRecord = matchInfo.at(-1);
            }
            if (records[i].winnerId != selectedRikishiId) rikishiWon = false;
            if (records[i].division == "Mae-zumo") {
              east = "Mz " + records[i].eastShikona;
              west = "Mz " + records[i].westShikona;
            } else {
              if (records[i].eastRank == "")
                east = "--- " + records[i].eastShikona;
              else
                east =
                  rankAbbr[east[0]] +
                  east[1] +
                  (east[2] == undefined
                    ? "TD"
                    : east[2].charAt(0).toLowerCase()) +
                  " " +
                  records[i].eastShikona;
              if (records[i].westRank == "")
                west = "--- " + records[i].westShikona;
              else
                west =
                  rankAbbr[west[0]] +
                  west[1] +
                  (west[2] == undefined
                    ? "TD"
                    : west[2].charAt(0).toLowerCase()) +
                  " " +
                  records[i].westShikona;
            }
            if (records[i].eastId == selectedRikishiId)
              rikishiText = [east, west];
            else rikishiText = [west, east];
            aiteRecord.matches.push({
              basho: records[i].bashoId,
              day: records[i].day,
              division: divAbbr[records[i].division],
              won: rikishiWon,
              rikishi: rikishiText[0],
              aite: rikishiText[1],
              kimarite: records[i].kimarite,
            });
            if (records[i].winnerId == selectedRikishiId) {
              aiteRecord.win++;
              if (records[i].kimarite == "fusen") aiteRecord.fusenWin++;
              if (records[i].day > 15) aiteRecord.playoffWin++;
            } else {
              aiteRecord.loss++;
              if (records[i].kimarite == "fusen") aiteRecord.fusenLoss++;
              if (records[i].day > 15) aiteRecord.playoffLoss++;
            }
          }
        }
        for (const button of document.querySelectorAll(
          '[data-inf="' + event.target.dataset.inf + '"]',
        ))
          button.nextSibling.classList.add("sameHeya");
        for (var i = 0; i < matchInfo.length; i++) {
          var aiteButton = $('input[value="' + matchInfo[i].aite + '"]')[0];
          var record;
          var recordCell;
          var recordText = document.createElement("span");

          if (aiteButton.id.slice(-1) == "E")
            recordCell = aiteButton.parentNode.previousSibling;
          else recordCell = aiteButton.parentNode.nextSibling;
          recordText.classList.add("h2h");
          record = matchInfo[i].win - matchInfo[i].playoffWin;
          if (matchInfo[i].fusenWin > 0)
            record += "[-" + matchInfo[i].fusenWin + "]";
          if (matchInfo[i].playoffWin > 0)
            record += "[+" + matchInfo[i].playoffWin + "]";
          record += "-" + (matchInfo[i].loss - matchInfo[i].playoffLoss);
          if (matchInfo[i].fusenLoss > 0)
            record += "[-" + matchInfo[i].fusenLoss + "]";
          if (matchInfo[i].playoffLoss > 0)
            record += "[+" + matchInfo[i].playoffLoss + "]";
          aiteButton.nextSibling.classList.add("met");
          aiteButton.nextSibling.style.background = generateColor(
            matchInfo[i].win - matchInfo[i].fusenWin,
            matchInfo[i].loss - matchInfo[i].fusenLoss,
          );
          recordText.addEventListener("click", function () {
            var dialogBox = document.getElementById("matchesBox");
            var id,
              matches,
              table = document.createElement("table");
            var headerText = document.createElement("span");
            var rikishi1Link = document.createElement("a");
            var rikishi2Link = document.createElement("a");
            var selected = document.getElementsByClassName("selected")[0];
            var rikishi1LinkUrl;
            var rikishi1Title;
            var rikishi1Id;
            var rikishi2LinkUrl;
            var rikishi2Title;
            var rikishi2Id;
            var aiteCell;

            rikishi1Title = selected.title;
            rikishi1LinkUrl = selected.nextSibling.href;
            rikishi1Id = selected.nextSibling.dataset.ids;
            if (this.parentNode.nextSibling != null) {
              rikishi2Title = this.parentNode.nextSibling.children[1].title;
              rikishi2LinkUrl = this.parentNode.nextSibling.children[2].href;
              rikishi2Id = this.parentNode.nextSibling.children[2].dataset.ids;
              aiteCell = this.parentNode.nextSibling;
            } else {
              rikishi2Title = this.parentNode.previousSibling.children[1].title;
              rikishi2LinkUrl =
                this.parentNode.previousSibling.children[2].href;
              rikishi2Id =
                this.parentNode.previousSibling.children[2].dataset.ids;
              aiteCell = this.parentNode.previousSibling;
            }
            id = aiteCell.children[0].value;
            rikishi1Link.innerText = selected.innerText;
            rikishi1Link.title = rikishi1Title;
            rikishi1Link.href = rikishi1LinkUrl;
            rikishi1Link.target = "leTab";
            rikishi1Link.setAttribute("data-ids", rikishi1Id);
            rikishi1Link.className = "proLink";
            rikishi2Link.innerText = aiteCell.children[1].innerText;
            rikishi2Link.title = rikishi2Title;
            rikishi2Link.href = rikishi2LinkUrl;
            rikishi2Link.target = "leTab";
            rikishi2Link.setAttribute("data-ids", rikishi2Id);
            rikishi2Link.className = "proLink";
            headerText.id = "h2hText";
            headerText.appendChild(rikishi1Link);
            headerText.innerHTML += " vs. ";
            headerText.appendChild(rikishi2Link);
            headerText.innerHTML += " " + this.innerText;
            matches = matchInfo.find((obj) => obj.aite == id).matches;
            table.id = "matchesTable";
            table.appendChild(document.createElement("tbody"));
            for (var j = 0; j < matches.length; j++) {
              var row = document.createElement("tr");
              var links = [{}, {}, {}, {}];
              var kimariteCell = document.createElement("td");

              links[0].text =
                matches[j].basho.slice(0, 4) + "." + matches[j].basho.slice(4);
              links[0].url =
                "https://sumodb.sumogames.de/Banzuke.aspx?b=" +
                matches[j].basho +
                "#" +
                matches[j].division;
              links[1].text = "Day " + matches[j].day;
              links[1].url =
                "https://sumodb.sumogames.de/Results.aspx?b=" +
                matches[j].basho +
                "&d=" +
                matches[j].day;
              links[2].text = matches[j].rikishi.split(" ")[1];
              links[2].url = rikishi1LinkUrl;
              links[3].text = matches[j].aite.split(" ")[1];
              links[3].url = rikishi2LinkUrl;
              kimariteCell.innerText = matches[j].kimarite;
              for (var k = 0; k < 4; k++) {
                var cell = document.createElement("td"),
                  link = document.createElement("a");

                link.innerText = links[k].text;
                link.href = links[k].url;
                link.target = "leTab";
                if (k == 2) {
                  var rank = document.createElement("span");
                  var image = document.createElement("img");
                  var imgSrc;
                  var imgAlt;

                  link.setAttribute("data-ids", rikishi1Id);
                  link.className = "proLink";
                  if (matches[j].won) {
                    if (matches[j].kimarite == "fusen") {
                      imgSrc = "fusensho.png";
                      imgAlt = "fusen win";
                    } else {
                      imgSrc = "shiro.png";
                      imgAlt = "win";
                    }
                  } else {
                    if (matches[j].kimarite == "fusen") {
                      imgSrc = "fusenpai.png";
                      imgAlt = "fusen loss";
                    } else {
                      imgSrc = "kuro.png";
                      imgAlt = "loss";
                    }
                  }
                  image.src = imgSrc;
                  image.alt = imgAlt;
                  rank.innerText = matches[j].rikishi.split(" ")[0];
                  cell.className = "matchResult";
                  cell.append(rank);
                  cell.append("\u00A0");
                  cell.appendChild(link);
                  cell.append("\u00A0");
                  cell.appendChild(image);
                } else if (k == 3) {
                  var rank = document.createElement("span");
                  var image = document.createElement("img");
                  var imgSrc;
                  var imgAlt;

                  link.setAttribute("data-ids", rikishi2Id);
                  link.className = "proLink";
                  if (matches[j].won) {
                    if (matches[j].kimarite == "fusen") {
                      imgSrc = "fusenpai.png";
                      imgAlt = "fusen loss";
                    } else {
                      imgSrc = "kuro.png";
                      imgAlt = "loss";
                    }
                  } else {
                    if (matches[j].kimarite == "fusen") {
                      imgSrc = "fusensho.png";
                      imgAlt = "fusen win";
                    } else {
                      imgSrc = "shiro.png";
                      imgAlt = "win";
                    }
                  }
                  image.src = imgSrc;
                  image.alt = imgAlt;
                  rank.innerText = matches[j].aite.split(" ")[0];
                  cell.className = "matchResult";
                  cell.append(rank);
                  cell.append("\u00A0");
                  cell.appendChild(link);
                  cell.append("\u00A0");
                  cell.appendChild(image);
                } else cell.appendChild(link);
                row.appendChild(cell);
              }
              row.appendChild(kimariteCell);
              table.children[0].prepend(row);
            }
            if (!dialogBox.open) {
              dialogBox.classList.remove("hidden");
              dialogBox.show();
            }
            if (dialogBox.children[2] != undefined) {
              dialogBox.children[0].children[0].remove();
              dialogBox.children[1].remove();
            }
            dialogBox.children[0].prepend(headerText);
            dialogBox.insertBefore(table, dialogBox.children[1]);
            var loadedImgCount = 0;
            for (const image of $("img")) {
              image.onload = function () {
                loadedImgCount++;
                if (loadedImgCount == $("img").length) {
                  dialogBox.scrollTop = dialogBox.scrollHeight;
                  dialogBox.scrollLeft = 0;
                }
              };
            }
            matchesBoxPosition();
          });

          function generateColor(num1, num2) {
            var sum = num1 + num2;
            var ratio = Math.round((num1 / num2) * 10);
            var hue, lightness, finalColor;

            if (sum < 1) finalColor = "#fff";
            else {
              if (num1 == num2) finalColor = "#ececaa";
              else if (num1 < num2) {
                if (ratio <= 3) finalColor = "#F7C4C4";
                else if (ratio >= 9) finalColor = "#F3D1AF";
                else if (ratio == 8) finalColor = "#F4CFB3";
                else if (ratio == 7) finalColor = "#F4CDB6";
                else if (ratio == 6) finalColor = "#F5CBBA";
                else if (ratio == 5) finalColor = "#F6C8BD";
                else if (ratio == 4) finalColor = "#F6C6C1";
                if (sum < 2) finalColor = "#f5d0d0";
              } else {
                if (ratio <= 13) finalColor = "#CBE693";
                else if (ratio >= 19) finalColor = "#97EF97";
                else if (ratio == 18) finalColor = "#A0EE96";
                else if (ratio == 17) finalColor = "#A8EC96";
                else if (ratio == 16) finalColor = "#B1EB95";
                else if (ratio == 15) finalColor = "#BAE994";
                else if (ratio == 14) finalColor = "#C2E894";
                if (sum < 2) finalColor = "#a9f1a9";
              }
            }
            return finalColor;
          }
          recordText.innerText = record;
          if (aiteButton.id.slice(-1) == "E")
            recordCell.appendChild(recordText);
          else recordCell.prepend(recordText);
        }
      } else {
        event.target.nextSibling.classList.remove("selected");
        selectedRikishiPanel.classList.add("hidden");
      }
      for (var i = 0; i < allRadio.length; i++)
        allRadio[i].removeAttribute("disabled");
      matchesBoxPosition();
    }
  }
  async function createMakuuchiBanzuke(callback) {
    var hierarchy = {
      Yokozuna: 4,
      Ozeki: 3,
      Sekiwake: 2,
      Komusubi: 1,
      Maegashira: 0,
    };
    var resp = await fetch("https://www.sumo-api.com/api/rikishis");
    var respJson = await resp.json();
    var riki = respJson.records;

    for (var j = 0; j < 6; j++) {
      var response = await fetch(
        "https://www.sumo-api.com/api/basho/" +
          banzukeDate +
          "/banzuke/" +
          divisions[j],
      );
      var rikishi = await response.json();

      divRankQty.push(rikishi.east[rikishi.east.length - 1].rank.split(" ")[1]);
      for (var i = 0; i < rikishi.east.length; i++) {
        var eastRank = rikishi.east[i].rank.split(" ");
        var westRank;
        var row = document.createElement("tr");

        if (hierarchy[eastRank[0]] > 0) row.classList.add("sanyakuRow");
        if (typeof rikishi.west[i] == "undefined") rikishi.west.push({});
        else westRank = rikishi.west[i].rank.split(" ");
        if (eastRank[0] != westRank[0]) {
          if (hierarchy[eastRank[0]] > hierarchy[westRank[0]]) {
            rikishi.west.splice(i, 0, {});
          } else {
            rikishi.east.splice(i, 0, {});
            eastRank[0] = westRank[0];
            eastRank[1] = westRank[1];
          }
        }
        if (eastRank[2].charAt(0) == "T") rikishi.west.splice(i, 0, {});
        if (!jQuery.isEmptyObject(rikishi.east[i])) {
          createRikishi("E");
          activeRikishiId.push(rikishi.east[i].rikishiID);
        } else createBlank();
        var rowRank = document.createElement("th"),
          rankNum = eastRank[1],
          divShort;

        divShort = rankAbbr[eastRank[0]];
        rowRank.innerText = divShort;
        if (hierarchy[eastRank[0]] < 1 || hierarchy[eastRank[0]] == null)
          rowRank.innerText += rankNum;
        row.appendChild(rowRank);
        if (!jQuery.isEmptyObject(rikishi.west[i])) {
          createRikishi("W");
          activeRikishiId.push(rikishi.west[i].rikishiID);
        } else createBlank();
        document
          .getElementsByClassName("banzukeTable")
          [j].children[1].appendChild(row);

        function createRikishi(side) {
          var radioButton = document.createElement("input"),
            label = document.createElement("label"),
            cell = document.createElement("td"),
            profileLink = document.createElement("a"),
            rankNum = eastRank[1],
            h2hCell = document.createElement("td"),
            rikishiInfo,
            nskId,
            dbId,
            heya,
            shusshin,
            birthDate,
            hatsu,
            hw;

          divShort = rankAbbr[eastRank[0]];
          radioButton.id = divShort + rankNum + side;
          radioButton.type = "radio";
          radioButton.name = "rs";
          radioButton.value =
            side == "E" ? rikishi.east[i].rikishiID : rikishi.west[i].rikishiID;
          rikishiInfo = riki.find((r) => r.id == radioButton.value);
          heya = rikishiInfo.heya != undefined ? rikishiInfo.heya : "-";
          shusshin =
            rikishiInfo.shusshin != undefined
              ? rikishiInfo.shusshin.split(",")[0].split("-")[0]
              : "-";
          if (rikishiInfo.birthDate != undefined) {
            birthDate = new Date(Date.parse(rikishiInfo.birthDate));
            birthDate =
              birthDate.getFullYear() +
              "." +
              (birthDate.getMonth() + 1) +
              "." +
              birthDate.getDate();
            birthDate +=
              " (" +
              Math.abs(
                new Date(
                  Date.now() - Date.parse(rikishiInfo.birthDate),
                ).getUTCFullYear() - 1970,
              ) +
              " years)";
          } else birthDate = "-";
          hatsu =
            rikishiInfo.debut.slice(0, 4) + "." + rikishiInfo.debut.slice(4);
          hw =
            rikishiInfo.height != undefined
              ? rikishiInfo.height + " cm "
              : " - cm ";
          hw +=
            rikishiInfo.weight != undefined
              ? rikishiInfo.weight + " kg"
              : " - kg";
          label.title =
            "Heya: " +
            heya +
            "\nShusshin: " +
            shusshin +
            "\nBirth date: " +
            birthDate +
            "\nDebut: " +
            hatsu +
            "\nHW: " +
            hw;
          if (rikishiInfo.weight != undefined)
            radioButton.setAttribute("data-inf", rikishiInfo.heya);
          label.innerText =
            side == "E" ? rikishi.east[i].shikonaEn : rikishi.west[i].shikonaEn;
          nskId = rikishiInfo.nskId != undefined ? rikishiInfo.nskId : "0";
          dbId = rikishiInfo.sumodbId != undefined ? rikishiInfo.sumodbId : "0";
          profileLink.setAttribute("data-ids", nskId + "_" + dbId);
          profileLink.target = "leTab";
          profileLink.innerText = "ⓘ";
          profileLink.className = "proLink";
          profileLink.title = "Open rikishi profile page";
          if (rankDebutRikishi.includes(label.innerText)) 
            label.classList.add("rankDeb");
          if (divDebutRikishi.includes(label.innerText))
              label.classList.add("divDeb");
          if (intaiRikishi.includes(label.innerText)) {
            var intaiSign = document.createElement("span");

            intaiSign.setAttribute("class", "marking intai");
            intaiSign.innerText = "R";
            intaiSign.title = "Retired";
            h2hCell.appendChild(intaiSign);
          } else if (kyujoRikishi.includes(label.innerText)) {
            var kyujoSign = document.createElement("span");

            kyujoSign.setAttribute("class", "marking kyujo");
            kyujoSign.innerText = "A";
            kyujoSign.title = "Absent from Day 1";
            h2hCell.appendChild(kyujoSign);
          }
          label.setAttribute("for", divShort + rankNum + side);
          cell.appendChild(radioButton);
          cell.appendChild(label);
          cell.appendChild(profileLink);
          h2hCell.className = "sideCell";
          if (side == "E") {
            row.appendChild(h2hCell);
            row.appendChild(cell);
          } else {
            row.appendChild(cell);
            row.appendChild(h2hCell);
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
  function matchesBoxPosition() {
    var dialogBox = document.getElementById("matchesBox");

    if (dialogBox.open && !dialogBox.classList.contains("hidden")) {
      var matchesWidth = document.getElementById("matchesBox").offsetWidth;
      var tablesWidth = document.getElementById("banzukeContainer").offsetWidth;
      var windowWidth = window.innerWidth;

      if (matchesWidth + tablesWidth / 2 + 10 < windowWidth / 2)
        $("#matchesBox").css(
          "margin-left",
          windowWidth / 2 - matchesWidth - tablesWidth / 2 - 10 + "px",
        );
      else $("#matchesBox").css("margin-left", "0");
    }
  }
  function getHref(id) {
    var ids = id.split("_");
    var boxes = document.getElementsByName("site");
    var site = $(".siteToggle")[0].checked ? "sumodb" : "nsk";
    var href;

    if (site == "nsk" && ids[0] == "0")
      url = "https://sumodb.sumogames.de/Rikishi.aspx?r=" + ids[1];
    else if (site == "nsk" && ids[0] != "0")
      url = "https://www.sumo.or.jp/EnSumoDataRikishi/profile/" + ids[0];
    else if (ids[1] == "0")
      url =
        "https://sumodb.sumogames.de/Rikishi.aspx?shikona=" +
        $("a[data-ids|='" + id + "']")
          .prev()
          .text() +
        "&b=" +
        banzukeDate;
    else url = "https://sumodb.sumogames.de/Rikishi.aspx?r=" + ids[1];

    return url;
  }
  function changeHref() {
    var links = $(".proLink");

    for (const link of links) {
      link.href = getHref(link.dataset.ids);
    }
  }
};
