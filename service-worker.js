// Ensure the database is available

async function getTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action == "changeColour") {
    const tab = await getTab();
    console.log(tab);
    const color = message.color;
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (color) => {
        console.log("changing colour");
        document.body.style.backgroundColor = color;
      },
      args: [color],
    });
  }
});
let lastUrl = "";

let db;

const request = indexedDB.open("myDatabase", 1);

request.onerror = function (event) {
  console.error("Database error: " + event.target.errorCode);
};

request.onsuccess = function (event) {
  db = event.target.result;
  console.log("Database opened successfully");
  resetCountToZero();
};
function resetCountToZero() {
  const transaction = db.transaction(["counters"], "readwrite");
  const objectStore = transaction.objectStore("counters");

  const request = objectStore.get("shortsCount");

  request.onsuccess = function (event) {
    if (event.target.result === undefined) {
      objectStore.add({ name: "shortsCount", value: 0 });
      console.log("Initial count set to 0");
    } else {
      objectStore.put({ name: "shortsCount", value: 0 });
      console.log("Count reset to 0");
    }
  };

  request.onerror = function (event) {
    console.error("Unable to retrieve data from database!", event);
  };
}

chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
  if (details.url.includes("https://www.youtube.com/shorts/")) {
    if (lastUrl !== details.url) {
      lastUrl = details.url;
      incrementShortsCount(details.tabId);
    }
  }
});
function incrementShortsCount(tabId) {
  // Ensure the database is available

  const transaction = db.transaction(["counters"], "readwrite");
  const objectStore = transaction.objectStore("counters");

  const request = objectStore.get("shortsCount");

  request.onsuccess = function (event) {
    let cnt = event.target.result.value;
    console.log("cnt=" + cnt);
    cnt++;
    if (cnt >= 10) {
      chrome.tabs.update({ url: "https://www.google.com/" })
    }
    objectStore.put({ name: "shortsCount", value: cnt });
  };

  request.onerror = function (event) {
    console.error("Unable to retrieve data from database!", event);
  };
}
