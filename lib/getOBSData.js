const dropDownOptions = {
    scenes:[],
    cameraPosition:[],
    cameraFOV:[],
    slidePosition:[]
}

obs.on("Identified", async (data) => {
  
  //get Scene options
  const sceneList = await obs.call("GetSceneList");
  const excludeList = ['Set Camera','Slides', '----------SETTINGS----------', '----------SCENES----------', '----------SOURCES----------', '----------OPTIONS----------'];
  sceneList.scenes.forEach(async (scene, index) => {
      console.log("scene ", scene, !excludeList.includes(scene.sceneName));
      if(!excludeList.includes(scene.sceneName)){
          const sceneName = scene.sceneName;
          console.log(sceneName)
          dropDownOptions.scenes.push(sceneName);
        }
    });
    
    //get Camera Position tag options
    let cameraSources = await obs.call("GetSceneItemList", { sceneName: "Camera Position" });
    console.log(cameraSources)
    cameraSources.sceneItems.forEach(async(source, index) => {
        console.log(cameraSources)
        dropDownOptions.cameraPosition.push(source.sourceName)
    });
    
    cameraSources = await obs.call("GetSceneItemList", { sceneName: "Camera Overlay Position" });
    cameraSources.sceneItems.forEach(async(source, index) => {
        dropDownOptions.cameraPosition.push(source.sourceName)
    });
    
    //get Camera Field of View options
    
    //get Slide Position tag options
    dropDownOptions.slidePosition = ["over-the-shoulder","full-screen","side-by-side"]

    if(slidesArray.length > 0){
        document.getElementById("slidesTable").hidden = false;
    }
});