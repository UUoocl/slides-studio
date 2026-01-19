const dropDownOptions = {
    scene:[],
    cameraPosition:[],
    cameraShape:[],
    slidePosition:[]
}
//when connect button is clicked, try to get layout options from OBS
    document
        .getElementById("WSconnectButton")
        .addEventListener("click",  async (data) => {
        //get Scene options
    if(document.getElementById("location").value.length > 0){       
        let sceneList = [];
        sceneList = await obsWss.call("GetSceneList");
        sceneList.scenes.forEach(async (scene, index) => {
            if(scene.sceneName.startsWith("Scene")){
                const sceneName = scene.sceneName;
                dropDownOptions.scene.push(sceneName);
            }
        });
        
        //get Camera Position tag options
        let cameraSources = [];
        try{
            cameraSources = await obsWss.call("GetSceneItemList", { sceneName: "Camera Position" });
            cameraSources.sceneItems.forEach(async(source, index) => {
                dropDownOptions.cameraPosition.push(source.sourceName)
            });
        }catch{}
                
        //get Slide Position tag options
        let slideSources = [];
        try{
            const settings = await obsWss.call("GetInputSettings", {
                inputName: 'slides',
            });

            // Regex to find the first comment's content
            const regex = /\/\*(.*?)\*\//s; // 's' flag for dotAll (matches newlines)

            const match = settings.inputSettings.css.match(regex);

            if (match && match[1]) {
                const commentContent = match[1].trim(); // .trim() to remove leading/trailing whitespace
                // console.log("First comment content:", commentContent); // Output: This is the first comment
                slideSources = JSON.parse(commentContent);
                slideSources.forEach(async(cssClass, index) => {
                    dropDownOptions.slidePosition.push(cssClass)
                });
            } else {
                console.warn("No comments found.");
            }
        }catch{}
        
        //get Camera Shape tag options
        let cameraShapes = [];
        try{
            const settings = await obsWss.call("GetInputSettings", {
                inputName: 'camera shapes',
            });

            // Regex to find the first comment's content
            const regex = /\/\*(.*?)\*\//s; // 's' flag for dotAll (matches newlines)

            const match = settings.inputSettings.css.match(regex);

            if (match && match[1]) {
                const commentContent = match[1].trim(); // .trim() to remove leading/trailing whitespace
                // console.log("First comment content:", commentContent); // Output: This is the first comment
                cameraShapes = JSON.parse(commentContent);
                cameraShapes.forEach(async(cssClass, index) => {
                    dropDownOptions.cameraShape.push(cssClass)
                });
            } else {
                console.warn("No comments found.");
            }
        }catch{}
        
        if(slidesArray.length > 0){
            // document.getElementById("slidesTable").hidden = false;
        }

        //send OBS data to tabulator iFrame.
        studioIframe.contentWindow.postMessage(JSON.stringify({ obsData: dropDownOptions, namespace: 'speakerview'}), window.location.origin);
        
        //listen for tabulator requests for OBS Data
        window.addEventListener('message', async (event) => {
            //console.debug(event)
            //console.debug(event.origin, window.location.origin)

            if(event.origin !== window.location.origin){  
                return
            }  

            let data = JSON.parse(event.data);
            
            //request from tabulator iframe for slide data
            if(data.namespace === "tabulator" && data.message === "obs-data"){
                studioIframe.contentWindow.postMessage(JSON.stringify({ message:'obs-data-response', obsData: dropDownOptions, namespace: 'speakerview'}), window.location.origin);
            }  
        });
    }
})

function sendToOBS(msgParam, eventName) {
    //console.debug("sending message:", JSON.stringify(msgParam));
    const webSocketMessage = JSON.stringify(msgParam);
    //send results to OBS Browser Source
    obsWss.call("CallVendorRequest", {
        vendorName: "obs-browser",
        requestType: "emit_event",
        requestData: {
            event_name: eventName,
            event_data: { 
                webSocketMessage 
            },
        },
    });
}