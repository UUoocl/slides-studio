function loadTable() {
            let table = new Tabulator("#slidesTable", {
                layout:"fitDataStretch",
                height: "900px",
                data: slidesArray,
                dataTree: true,
                dataTreeStartExpanded: true,
                columns: [
                    { title: "Id", field: "slideId", width: 200, responsive: 0 }, //never hide this column
                    { title: "Name", field: "slideName", width: 70, responsive: 2 }, //hide this column first
                    {title:"Slide Position", field:"slidePosition", editor:"list", editorParams:{
                        //Value Options (You should use ONE of these per editor)
                        values: dropDownOptions.slidePosition}},
                    {title:"camera Position", field:"cameraPosition", editor:"list", editorParams:{
                        //Value Options (You should use ONE of these per editor)
                        values: dropDownOptions.cameraPosition}},
                    {title:"Scenes", field:"scenes", editor:"list", editorParams:{
                        //Value Options (You should use ONE of these per editor)
                        values: dropDownOptions.scenes}}
                ],
            });
            
            // table.on("tableBuilt", function () {
            //     setCurrentScene("");
            // })

            // function setVisibility(e,cell){
            //     if(!debounce){
            //         debounce = true;
            //         const rowData = cell.getData();
            //         let cellVisibility = cell.getValue() == !true ? true : false;
            //         if(rowData.type === "Scene"){
            //             setCurrentScene(rowData.name);
            //         }
            //         cell.setValue(cellVisibility)
            //         rowData.visibility = cellVisibility
            //         table.deselectRow();
            //         table.selectRow(table.getRowFromPosition(cell.getRow().getPosition()));
            //         // postData({ 
            //         //     "type": rowData.type, 
            //         //     "visibility": `${cellVisibility}`,
            //         //     "name": rowData.name,
            //         //     "itemID": rowData.itemID})
            //         postData(rowData)
            //     }
            // }

            // function setCurrentScene(sceneName){
            //     let scenes = table.searchData("type", "=", "Scene");
            //     scenes.forEach( (scene) => {
            //         if(scene.name !== sceneName){
            //             scene.visibility = "";
            //         }
            //     })
            //     table.updateData(scenes)
            // }

            //Table row Clicked
            // table.on("rowClick", function (e, row) {
            //     console.log("e=index", row.getPosition())
            //     console.log("e", e)
            //     console.log("row", row)
            //     console.log("table", table)
            //     table.deselectRow();
            //     table.selectRow(table.getRowFromPosition(row.getPosition()));
            //     //rowChanged(row)
            // });
        }
        