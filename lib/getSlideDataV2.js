//Slides object
let slidesArray = []
let slidesLoaded = false;
let tableLoaded = false;
//Message from Reveal Slides iFrame API
window.addEventListener('message', async (event) => {
    if(event.origin === "https://slides.com" && slidesLoaded == false){  
        let data = JSON.parse(event.data);
        console.log(data)
        
        //get Slides and Fragments
        if (data.namespace === 'reveal' && 
            ['ready'].includes(data.eventName)) {
                console.log("Slides ready and OBS Connected")
                slidesArray = [];
                iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlide', args: [0,0]}), 'https://slides.com');
                //iframe.contentWindow.postMessage(JSON.stringify({ method: 'isLastSlide'}), 'https://slides.com');
            }
            
            //callback from get slides request
        if( data.namespace === 'reveal' && data.eventName === 'callback' && data.method === "getSlide" && tableLoaded === false){
            console.log(event)
            //slides HTML is returned in string format
            const slide = data.result;
            //parser to convert String to HTML Element object  
            const parser = new DOMParser();

            const slideEl = parser.parseFromString(slide.originalSlideHTML,  "text/html")
            //Get slide id        
            const slideId = await getSlideDataAttributeValue(slideEl, 'data-id');
            
            const slideName = await getSlideDataAttributeValue(slideEl, 'data-slide-name');
            
            const slidePosition = await getSlideDataAttributeValue(slideEl, 'data-slide-position');
            
            const cameraPosition = await getSlideDataAttributeValue(slideEl, 'data-camera-position');
            
            const cameraFOV = await getSlideDataAttributeValue(slideEl, 'data-camera-fov');

            const isFragment = data.state.indexf !== undefined ? data.state.indexf : false;
            
            let state = `${data.state.indexh}, ${data.state.indexv}`;

            //get all the fragments
            if(isFragment === -1){
                const children = [];
                const fragments = slideEl.querySelectorAll(".fragment")
                console.log("fragment count", fragments.length)
                for(let f_index = 0; f_index < fragments.length; f_index++ ){
                    const fragment = fragments[f_index];
                    
                    const fragmentId = await getFragmentDataAttributeValue(fragment, 'data-fragment-index');
                    
                    const fragmentState = `${data.state.indexh}, ${data.state.indexv}, ${fragmentId}`;

                    const slideName = await getFragmentDataAttributeValue(fragment, 'data-fragment-name');
                    
                    const slidePosition = await getFragmentDataAttributeValue(fragment, 'data-fragment-position');
                    
                    const cameraPosition = await getFragmentDataAttributeValue(fragment, 'data-fragment-camera-position');
                    
                    const cameraFOV = await getFragmentDataAttributeValue(fragment, 'data-fragment-camera-fov');
                    
                    const fragmentDetails = {
                        slideId: `${fragmentId}`,
                        slideState: fragmentState,
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
                const slideDetails = {
                    slideId: slideId,
                    slideState: state,
                    slideName: slideName,
                    slidePosition: slidePosition,
                    cameraPosition: cameraPosition,
                    cameraFOV: cameraFOV,
                    _children: children
                }
                slidesArray.push(slideDetails)
            }
            
            if(isFragment === false){
                const slideDetails = {
                    slideId: slideId,
                    slideState: state,
                    slideName: slideName,
                    slidePosition: slidePosition,
                    cameraPosition: cameraPosition,
                    cameraFOV: cameraFOV,
                    // _children: children
                }
                slidesArray.push(slideDetails)
            }
            
        iframe.contentWindow.postMessage(JSON.stringify({ method: 'isLastSlide'}), 'https://slides.com');

        };

        if( data.namespace === 'reveal' && data.eventName === 'callback' && data.method === "isLastSlide" && tableLoaded == false){
            const isLastSlide = data.result;
            console.log(isLastSlide, tableLoaded, slidesLoaded)
            if(isLastSlide == true){
                tableLoaded = true;
                iframe.contentWindow.postMessage(JSON.stringify({ method: 'slide', args: [0,0]}), 'https://slides.com');
                //if slides and obs have loaded then show the tabulator button
                // if(obs.status === "connected"){
                    document.getElementById("slidesTable").hidden = false;
                    slidesLoaded = true;
                    //}
                }
             else{
                 //get next slide
                 console.log("get next slide")
                 iframe.contentWindow.postMessage(JSON.stringify({ method: 'next'}), 'https://slides.com');
                }  
            
        }

        if (data.namespace === 'reveal' && 
            ['fragmentshown','fragmenthidden','slidechanged'].includes(data.eventName)) {
            console.log("Slide Changed", data)
            
            slideState = data.state;
            slideState.indexf = data.state.indexf ?? '';
            console.log( slideState )

            //Get slides attributes
            iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlide', args: [ slideState.indexh, slideState.indexv ] }), '*');
        }
    }
})

async function getSlideDataAttributeValue(element, dataAttribute){
    //if querySelector is nullish, then set the value to an empty string
    const getEl = element.querySelector(`[${dataAttribute}]`) ?? "";
   
   return getEl ? getEl.getAttribute(dataAttribute): "";
}

async function getFragmentDataAttributeValue(element, dataAttribute){
   
   return element ? element.getAttribute(dataAttribute): "";
}

function getSlide(){
    console.log("calling get slide")
    iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlide'}), 'https://slides.com');
}