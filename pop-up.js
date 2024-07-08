const setColour =()=>{
    const color = document.getElementById("color").value;
    console.log(color);
    chrome.runtime.sendMessage({action:"changeColour",color:color})
}

document.getElementById("button").addEventListener("click",setColour);