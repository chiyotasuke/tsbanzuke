window.onload = async function () {
  var banzukeDate = "202503"; // 196909 until now for sekitori; from 198901 all lower division matchups are complete
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
  const rankDebutRikishi = [
  ];
  const divDebutRikishi = [
  ];
  var divRankQty = [];
  var matchInfo = [];
  var activeRikishiId = [];
  var intaiRikishi = [
  ];
  var kyujoRikishi = [
  ];
  var loading = document.createElement("div"),
    loadingPanel = document.createElement("span"),
    loadingText = document.createElement("span"),
    timeId = 0;
  var bashoSelect = document.getElementById("bashoSelect");
  
  loading.id = "loading";
  loading.style.display = "none";
  loadingText.innerText = "";
  loadingPanel.appendChild(loadingText);
  loading.appendChild(loadingPanel);
  document.body.appendChild(loading);
  for (var i = 1969; i <= parseInt(banzukeDate.slice(0, 4)); i++) {
    var group = document.createElement("optgroup");

    group.label = i.toString();
    for (var j = 1; j <= 12; j += 2) {
      if ((i == 1969 && j < 9) || (i == 2011 && j == 3) || (i == 2020 && j == 5)) continue;
      else if (i * 100 + j > parseInt(banzukeDate)) break;

      var option = document.createElement("option");

      option.value = (i * 100 + j).toString();
      option.innerText = i + ' ' + bashoName[(j + 100).toString().slice(-2)];
      group.prepend(option);
    }
    bashoSelect.prepend(group);
  }
  bashoSelect.selectedIndex = 0;
  if (localStorage.getItem("darkMode") == "true") {
    document.getElementById("darkModeToggle").checked = true;
    document.body.classList.add("dark");
  }
  createBanzuke();
  bashoSelect.addEventListener("change", async function () {
    var tableContainer = document.getElementById("banzukeContainer");
    var selectedRikishi = document.getElementById("selectedRikishiPanel");

    document.getElementById("matchesBox").classList.add("hidden");
    document.getElementById("matchesBox").close();
    selectedRikishi.classList.add("hidden");
    banzukeDate = bashoSelect.value;
    while (tableContainer.firstChild) {
      tableContainer.removeChild(tableContainer.lastChild);
    }
    createBanzuke();
  });
  document.getElementById("darkModeToggle").addEventListener("click", function () {
    if (this.checked) {
      document.body.classList.add("dark");
    }
    else {
      document.body.classList.remove("dark");
    }
    localStorage.setItem("darkMode", this.checked);
  });

  function createBanzuke() {
    var banzukeCount;

    if (parseInt(banzukeDate.slice(0, 4)) < 2000)
      banzukeCount = 2;
    else
      banzukeCount = 6;
    for (var i = 0; i < banzukeCount; i++) {
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
    //window.onresize = matchesBoxPosition;
    //$(".siteToggle").on("change", changeHref);
  }
  function loadingMessage(messageText, show) {
    var loadingPanel = document.getElementById("loading").children[0],
      loadingText = loadingPanel.children[0],
      loadingGif = document.createElement("img");

    loadingText.innerText = messageText;
    if (show) {
      loadingPanel.parentElement.style.display = "inline-grid";
      loadingGif.src = "shiko.gif";
      loadingPanel.appendChild(loadingGif);
      timeId = setTimeout(function () {
        var notice = document.createElement("a");

        notice.className = "notice";
        notice.innerText = "Click to close";
        notice.addEventListener("click", function () {
          loadingPanel.parentElement.style.display = "none";
          loadingPanel.children[1].remove();
        });
        loadingText.prepend(notice);
      }
      , 8000);
    }
    else {
      loadingPanel.parentElement.style.display = "none";
      loadingPanel.children[1].remove();
      clearTimeout(timeId);
    }
  }
  async function createMakuuchiBanzuke(callback) {
    loadingMessage("Creating the banzuke", true);

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
    var banzukeCount;

    if (parseInt(banzukeDate.slice(0, 4)) < 2000)
      banzukeCount = 2;
    else
      banzukeCount = 6;
    for (var j = 0; j < banzukeCount; j++) {
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
        }
        else createBlank();
        var rowRank = document.createElement("th"),
          rankNum = eastRank[1],
          divShort;

        divShort = rankAbbr[eastRank[0]];
        if (i > 8 && rikishi.east[i-1].rank.includes(rankNum))
          rowRank.innerText = "TD";
        else {
          rowRank.innerText = divShort;
          if (hierarchy[eastRank[0]] < 1 || hierarchy[eastRank[0]] == null)
            rowRank.innerText += rankNum;
        }
        //if (eastRank[2] == "TD")
        row.appendChild(rowRank);
        if (!jQuery.isEmptyObject(rikishi.west[i])) {
          createRikishi("W");
          activeRikishiId.push(rikishi.west[i].rikishiID);
        }
        else createBlank();
        document
          .getElementsByClassName("banzukeTable")
          [j].children[1].appendChild(row);

        function createRikishi(side) {
          var radioButton = document.createElement("input"),
            label = document.createElement("a"),
            cell = document.createElement("td"),
            container = document.createElement("div"),
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
          if (rikishiInfo == undefined) {
            rikishiInfo = {
              heya: "",
              shusshin: "",
              birthDate: "",
              debut: "",
              height: "",
              weight: "",
              sumodbId: "",
              nskId: ""
            }
          }
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
          profileLink.innerText =
            side == "E" ? rikishi.east[i].shikonaEn : rikishi.west[i].shikonaEn;
          profileLink.className = "proLink";
          profileLink.title = "Open rikishi profile page";
          profileLink.addEventListener("click", async function () {
            loadingMessage("", true);

            var fetchRikishi = await fetch(
              "https://www.sumo-api.com/api/rikishi/" + this.nextSibling.value,
            );
            var rInfo = await fetchRikishi.json();
            var profileUrl = $(".siteToggle")[0].checked ? 
              "https://sumodb.sumogames.de/Rikishi.aspx?r=" + rInfo.sumodbId : 
              "https://www.sumo.or.jp/EnSumoDataRikishi/profile/" + rInfo.nskId;

            loadingMessage("", false);
            if (profileUrl.endsWith("/0") || profileUrl.endsWith("=0")) {
              alert("No profile available. Try the other site.");
            }
            else
              window.open(profileUrl, "_blank").focus();
          });
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
          //cell.appendChild(label);
          container.className = "rCell";
          container.appendChild(profileLink);
          container.appendChild(radioButton);
          cell.appendChild(container);
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
    loadingMessage("", false);
  }
  function addStuff() {
    var cells = document.getElementsByName("rs");
    var divNum = { Ms: 2, Sd: 3, Jd: 4, Jk: 5 };
    var divNameShort = { 0: "M", 1: "J", 2: "Ms", 3: "Sd", 4: "Jd", 5: "Jk" };

    //changeHref();
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

      //for (var i = 0; i < allRadio.length; i++)
      //  allRadio[i].setAttribute("disabled", "true");
      document.getElementById("matchesBox").classList.add("hidden");
      document.getElementById("matchesBox").close();
      if (typeof prevClicked[0] != "undefined" && prevClicked[0] != null) {
        if (event.target != prevClicked[0].nextSibling)
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
      if (!event.target.previousSibling.classList.contains("selected")) {
        loadingMessage("", true);

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

        //if (banzukeDate != "202501") {
          var fetchInfo = await fetch(
            "https://www.sumo-api.com/api/rikishi/" +
              selectedRikishiId +
              "?intai=true",
          );
          var fetchInfo2;
          var heyaRikishi;

          selectedRikishiHeya = await fetchInfo.json();
          selectedRikishiHeya = selectedRikishiHeya.heya;
          fetchInfo2 = await fetch(
            "https://www.sumo-api.com/api/rikishis?heya=" +
              selectedRikishiHeya +
              "&intai=true",
          );
          heyaRikishi = await fetchInfo2.json();
          heyaRikishi = heyaRikishi.records;
          for (const r of heyaRikishi) {
            var rInput = document.querySelector(
              '[value="' + r.id + '"]',
            );

            if (rInput != null)
              rInput.parentNode.classList.add("sameHeya");
          }
        //}
        if (selectedRikishiPanel.classList.contains("hidden"))
          selectedRikishiPanel.classList.remove("hidden");
        selectedRikishiPanel.innerText =
          "Selected rikishi: " +
          event.target.id.slice(0, -1) +
          event.target.id.slice(-1).toLowerCase() +
          " " +
          event.target.previousSibling.innerText;
        records = matchesData.records;
        if (records == null) records = [];
        matchInfo = [];
        selectedRikishiHeya = event.target.dataset.inf;
        event.target.previousSibling.classList.add("selected");
        for (var i = 0; i < records.length; i++) {
          var aiteId;

          if (records[i].eastId == selectedRikishiId)
            aiteId = records[i].westId;
          else aiteId = records[i].eastId;
          if (
            activeRikishiId.includes(aiteId) &&
            records[i].bashoId < banzukeDate
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
        )) {
          if (button.dataset.inf != "" && !button.parentNode.classList.contains("sameHeya"))
            button.parentNode.classList.add("sameHeya");
        }
        for (var i = 0; i < matchInfo.length; i++) {
          var aiteButton = $('input[value="' + matchInfo[i].aite + '"]')[0];
          var record;
          var recordCell;
          var recordText = document.createElement("span");
          var wins, losses, fWins, fLosses;

          if (aiteButton == undefined) continue;
          if (aiteButton.id.slice(-1) == "E")
            recordCell = aiteButton.parentNode.parentNode.previousSibling;
          else recordCell = aiteButton.parentNode.parentNode.nextSibling;
          recordText.classList.add("h2h");
          record = matchInfo[i].win - matchInfo[i].fusenWin;
          record += "-" + (matchInfo[i].loss - matchInfo[i].fusenLoss);
          wins = matchInfo[i].win - matchInfo[i].fusenWin;
          losses = matchInfo[i].loss - matchInfo[i].fusenLoss;
          if (wins > 0 || losses > 0) {
            aiteButton.parentNode.classList.add("met");
            aiteButton.parentNode.style.background = generateColor(losses / (wins + losses), wins + losses);
          }
          if (matchInfo[i].fusenWin > 0 || matchInfo[i].fusenLoss > 0) {
            recordText.setAttribute("data-fusen", matchInfo[i].fusenWin + matchInfo[i].fusenLoss);
          }
          fWins = matchInfo[i].fusenWin;
          fLosses = matchInfo[i].fusenLoss;
          recordText.addEventListener("click", function (e) {
            var dialogBox = document.getElementById("matchesBox");
            var id,
              matches,
              table = document.createElement("table");
            var headerText = document.createElement("span");
            var selected = document.getElementsByClassName("selected")[0];
            var rikishi1LinkUrl;
            var rikishi1Id;
            var rikishi2LinkUrl;
            var rikishi2Id;
            var aiteCell;

            if (this.parentNode.nextSibling != null)
              aiteCell = this.parentNode.nextSibling;
            else
              aiteCell = this.parentNode.previousSibling;
            id = aiteCell.children[0].children[1].value;
            headerText.id = "h2hText";
            headerText.innerHTML += [selected.innerText, "<b>" + this.innerText + "</b>" , aiteCell.children[0].children[0].innerText].join(' ');
            if (this.hasAttribute("data-fusen")) {
              if (this.dataset.fusen > 1)
                headerText.innerHTML += '<span class="fusen"> (+' + this.dataset.fusen + " fusen matches)</span>";
              else
                headerText.innerHTML += '<span class="fusen"> (+' + this.dataset.fusen + " fusen match)</span>";
            }
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
              if (matches[j].day == 16)
                links[1].text = "Playoff";
              else
                links[1].text = "Day " + matches[j].day;
              links[1].url =
                "https://sumodb.sumogames.de/Results.aspx?b=" +
                matches[j].basho +
                "&d=" +
                matches[j].day;
              links[2].text = matches[j].rikishi.split(" ")[1];
              links[3].text = matches[j].aite.split(" ")[1];
              kimariteCell.innerText = matches[j].kimarite;
              for (var k = 0; k < 4; k++) {
                var cell = document.createElement("td"),
                  link;

                if (k < 2) {
                  link = document.createElement("a");
                  link.href = links[k].url;
                }
                else
                  link = document.createElement("span");
                link.innerText = links[k].text;
                if (k == 2) {
                  var rank = document.createElement("span");
                  var image = document.createElement("img");
                  var imgSrc;
                  var imgAlt;

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
                if (link.innerText == "Playoff")
                  cell.className = "playoff";
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
            if (dialogBox.open && !dialogBox.classList.contains("hidden")) {
              var matchesWidth = document.getElementById("matchesBox").offsetWidth;
              var matchesHeight = document.getElementById("matchesBox").offsetHeight;
              var banzukeWidth = document.getElementById("banzukeContainer").offsetWidth;

              if (this.parentNode.nextSibling != null) {
                if (e.clientX - this.offsetWidth < matchesWidth) 
                  $("#matchesBox").css("inset", "60% auto 0px 0px");
                else
                  $("#matchesBox").css("inset", e.clientY + "px auto auto " + (e.clientX - matchesWidth - this.offsetWidth) + "px");
              }
              else {
                if (e.clientX + this.offsetWidth + matchesWidth > window.innerWidth) 
                  $("#matchesBox").css("inset", "60% 0px 0px auto");
                else
                  $("#matchesBox").css("inset", e.clientY + "px auto auto " + (e.clientX + this.offsetWidth) + "px");
              }
              if (e.clientY + matchesHeight > window.innerHeight) {
                $("#matchesBox").css({
                  "top": "auto",
                  "bottom": "0",
                });
              }
            }
          });

          function generateColor(ratio, total) {
            var hue = ((1 - ratio) * 120).toString(10);
            var lightness = 25;
            var satur = 0.1;
            
            if (ratio > 0.5)
              lightness += (ratio - 0.5) ** 3 * 100;
            else
              lightness -= (0.5 - ratio) / 7 * 100;
            if (total >= 10)
              satur = 0.6;
            else
              satur += total / 20;
            
            return "hsla(" + hue + ",100%," + lightness + "%," + satur + ")";
          }
          recordText.innerText = record;
          if (aiteButton.id.slice(-1) == "E")
            recordCell.appendChild(recordText);
          else recordCell.prepend(recordText);
        }
        loadingMessage("", false);
      } else {
        event.target.previousSibling.classList.remove("selected");
        selectedRikishiPanel.classList.add("hidden");
        event.target.checked = false;
      }
      //for (var i = 0; i < allRadio.length; i++)
      //  allRadio[i].removeAttribute("disabled");
      //matchesBoxPosition();
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
