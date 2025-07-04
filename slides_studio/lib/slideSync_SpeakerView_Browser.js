let slideState = '';

//Message from Reveal Slides iFrame API
window.addEventListener('message', async (event) => {
    console.log(event)
    let data = JSON.parse(event.data);

    //get notes when slides are ready
    if (data.namespace === 'reveal' && 
        ['ready'].includes(data.eventName)) {
            const currentSlide_iframe = document.getElementById("current-iframe");
            currentSlide_iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlideNotes'}), '*');
            currentSlide_iframe.contentWindow.postMessage(JSON.stringify({ method: 'removeKeyBinding', args: [83] }), '*');
        }
    
    //on reveal slide change or pause
    if (data.namespace === 'reveal' && 
        ['paused','resumed','fragmentshown','fragmenthidden','slidechanged'].includes(data.eventName)) {
            console.log("Slide Changed", event)
            
            //if event 'state' doesn't equal settings 'state'
            if(JSON.stringify(data.state) != slideState){
                slideState = JSON.stringify(data.state);
                data.state.indexf = data.state.indexf ? data.state.indexf : 0;
                //send slide change to OBS
                sendToOBS(data.state, "slide-changed");	
                
                //Get slide notes
                const currentSlide_iframe = document.getElementById("current-iframe");
                
                if('slidechanged' === data.eventName){
                currentSlide_iframe.contentWindow.postMessage(JSON.stringify({ method: 'getSlideNotes'}), '*');
                }
                //send slide state to upcoming iFrame
                const upcoming_iframe = document.getElementById("upcoming-iframe");
                upcoming_iframe.contentWindow.postMessage(JSON.stringify({ method: 'slide', args: [data.state.indexh, data.state.indexv, data.state.indexf] }), '*');
                upcoming_iframe.contentWindow.postMessage(JSON.stringify({ method: 'next'}), '*');
            }

        }

        //callback from get notes request
        if( data.namespace === 'reveal' && data.eventName === 'callback' && data.method === "getSlideNotes" ){
            //send slide notes to notes iFrame
            const notes_iframe = document.getElementById("notes-iframe");
            notes_iframe.contentWindow.postMessage(JSON.stringify({ namespace:"teleprompter", method: 'updateNotes', data: `${JSON.stringify(data.result)}` }), '*');
        }
        
        //on overview mode
        if (data.namespace === 'reveal' && 
            ['overviewhidden','overviewshown'].includes(data.eventName)) {
                
                //Send CustomEvent to OBS webSocket clients
                slideState = data.state;
                obs.call("BroadcastCustomEvent", {
                    eventData:{
                        eventName:"overview-toggled",
                        eventData: slideState,
                    }    
                });
            }            
        });
        
        //Custom Event message from OBS
        obs.on("CustomEvent", async function (event) {
            const currentSlide_iframe = document.getElementById("current-iframe");
            const upcoming_iframe = document.getElementById("upcoming-iframe");
            if(['overview-toggled','slide-changed'].includes(event.eventName)){
                if(event.eventData != slideState){
                    const data =JSON.parse(event.eventData)
                    data.indexf = data.indexf ? data.indexf : 0;
                    if(event.eventName === 'overview-toggled'){
                        currentSlide_iframe.contentWindow.postMessage( JSON.stringify({ method: 'toggleOverview', args: [ data.overview ] }), '*' );
                    }else{
                        currentSlide_iframe.contentWindow.postMessage(JSON.stringify({ method: 'slide', args: [data.indexh, data.indexv, data.indexf] }), '*');
                        // currentSlide_iframe.contentWindow.postMessage( JSON.stringify({ method: 'togglePause', args: [ data.paused ] }), '*' );
                        upcoming_iframe.contentWindow.postMessage(JSON.stringify({ method: 'slide', args: [data.indexh, data.indexv, data.indexf] }), '*');
                        upcoming_iframe.contentWindow.postMessage(JSON.stringify({ method: 'next'}), '*');
                    }
                }
            } 
});

function sendToOBS(msgParam, eventName) {
    //console.log("sending message:", JSON.stringify(msgParam));
    const webSocketMessage = JSON.stringify(msgParam);
    //send results to OBS Browser Source
    obs.call("CallVendorRequest", {
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