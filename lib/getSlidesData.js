//Slides object
let slidesArray = []
let slidesLoaded = false;
//Message from Reveal Slides iFrame API
window.addEventListener('message', async (event) => {
    if(event.origin === "https://slides.com"){  
        let data = JSON.parse(event.data);
        let rowID = 0;
        
        //get Slides and Fragments
        if (data.namespace === 'reveal' && 
            ['ready'].includes(data.eventName)) {
                console.log("Slides ready and OBS Connected")
                getSlides()
            }
            
        //callback from get slides request
        if( data.namespace === 'reveal' && data.eventName === 'callback' && data.method === "getSlides" ){
            //slides HTML is returned in string format
            const slides = data.result;
            //parser to convert String to HTML Element object  
            const parser = new DOMParser();
            for(let index = 0; index < slides.length; index++){
                // slides.forEach( async(slide, index) => {
                    const slideEl = parser.parseFromString(slides[index].originalSlideHTML, "text/html");
                    //Get slide id
                    
                    //if querySelector is nullish, then set the value to an empty string
                    const slideId = await getSlideDataAttributeValue(slideEl, 'data-id');
                    
                    const slideName = await getSlideDataAttributeValue(slideEl, 'data-slide-name');
                    
                    const slidePosition = await getSlideDataAttributeValue(slideEl, 'data-slide-position');
                    
                    const cameraPosition = await getSlideDataAttributeValue(slideEl, 'data-camera-position');
                    
                    const cameraFOV = await getSlideDataAttributeValue(slideEl, 'data-camera-fov');
                    
                    const fragments = slideEl.querySelectorAll(".fragment")
                    console.log("fragment count", fragments.length)
                    
                    const children = [];
                    if(fragments){
                        for(let f_index = 0; f_index < fragments.length; f_index++ ){
                            const fragment = fragments[f_index];
                            const fragmentId = await getFragmentDataAttributeValue(fragment, 'data-fragment-index');
                            
                            const slideName = await getFragmentDataAttributeValue(fragment, 'data-fragment-name');
                            
                            const slidePosition = await getFragmentDataAttributeValue(fragment, 'data-fragment-position');
                            
                            const cameraPosition = await getFragmentDataAttributeValue(fragment, 'data-fragment-camera-position');
                            
                            const cameraFOV = await getFragmentDataAttributeValue(fragment, 'data-fragment-camera-fov');
                            
                            const fragmentDetails = {
                                slideId: `${fragmentId}`,
                                slideName: slideName,
                                slidePosition: slidePosition,
                                cameraPosition: cameraPosition,
                                cameraFOV: cameraFOV
                            }
                            const result = children.find(({ slideId }) => slideId === `${fragmentId}`)
                            console.log(result)
                            if(typeof result != 'object'){
                                children.push(fragmentDetails);
                            }
                        }
                    }

                        const slideDetails = {
                            slideId: slideId,
                            slideName: slideName,
                            slidePosition: slidePosition,
                            cameraPosition: cameraPosition,
                            cameraFOV: cameraFOV,
                            _children: children
                        }
                        
                        slidesArray.push(slideDetails)
                        
                    };
                    //if slides and obs have loaded then show the tabulator button
                    if(obs.status === "connected"){
                        document.getElementById("slidesTable").hidden = false;
                        slidesLoaded = true;
                    }
                }
            }
            
        })

async function getSlideDataAttributeValue(element, dataAttribute){
    const getEl = element.querySelector(`[${dataAttribute}]`) ?? "";
   
   return getEl ? getEl.getAttribute(dataAttribute): "";
}

async function getFragmentDataAttributeValue(element, dataAttribute){
   
   return element ? element.getAttribute(dataAttribute): "";
}

function getSlides(){
    console.log("calling get slides")
    iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlides'}), 'https://slides.com');
}