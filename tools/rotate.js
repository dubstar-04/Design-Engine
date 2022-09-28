export class Rotate { 
    constructor(){
    //Define Properties
    this.type = "Rotate";
    this.family = "Tools";
    this.movement = "Angular";
    this.minPoints = 3;
	this.selectionRequired = true;
    this.helper_geometry = true;
    this.showPreview = true;
}

static register() {
    var command = {command: "Rotate", shortcut: "RO"};
    return command
}

prompt(inputArray) {
    var num = inputArray.length;
    var expectedType = [];
    var reset = false;
    var action = false;
    var prompt = [];

    expectedType[0] = ["undefined"];
    prompt[0] = "Select Items To " + this.type;
 
    expectedType[1] = ["object"];   
    prompt[1] = scene.selectionSet.length + " Item(s) selected: Add more or press Enter to accept";
 
    expectedType[2] = ["boolean"];    
    prompt[2] = "Select Base Point:";
 
    expectedType[3] = ["object"];    
    prompt[3] = "Select Start Point or Enter Angle:";

    expectedType[4] = ["object"];   
    prompt[4] = "Select End Angle:";
 
    expectedType[5] = ["object"];   
    prompt[5] = "";
            
    var validInput = expectedType[num].includes(typeof inputArray[num-1])
            
    if(!validInput){
        scene.inputArray.pop()
    }
    if (scene.inputArray.length === 5){
        action = true;
        reset = true
    }
    
    return [prompt[scene.inputArray.length], reset, action, validInput]
}

preview = function(points, selectedItems, items){

    if (points.length > 2){

        var A = points[0].x - points[1].x;
        var O = points[0].y - points[1].y;

        var A1 = points[0].x - points[2].x;
        var O1 = points[0].y - points[2].y;

        var ang1 = Math.atan2(O,A);
        var ang2 = Math.atan2(O1,A1);

        var theta = ang2 - ang1;

        for (var i = 0; i < scene.selectionSet.length; i++){
            //console.log( "(preview) item: " + selectedItems[i].type + " Points length: " + selectedItems[i].points.length);
            for (var j = 0; j < selectedItems[i].points.length; j++){
               //console.log( "(preview) point: " + j + " length: " + selectedItems[i].points.length)
                var x = points[0].x + (items[scene.selectionSet[i]].points[j].x - points[0].x)*Math.cos(theta) - (items[scene.selectionSet[i]].points[j].y-points[0].y)*Math.sin(theta);
                var y = points[0].y + (items[scene.selectionSet[i]].points[j].x - points[0].x)*Math.sin(theta) + (items[scene.selectionSet[i]].points[j].y-points[0].y)*Math.cos(theta);

                selectedItems[i].points[j].x = x;
                selectedItems[i].points[j].y = y;
            }
        }
    }
}


action = function(points, items){

    console.log("Rotate Stuff")

    var A = points[0].x - points[1].x;
    var O = points[0].y - points[1].y;

    var A1 = points[0].x - points[2].x;
    var O1 = points[0].y - points[2].y;

    var ang1 = Math.atan2(O,A);
    var ang2 = Math.atan2(O1,A1);

    var theta = ang2 - ang1;

    //console.log("Theta: " + theta + " degrees: " + radians2degrees(theta));

    for (var i = 0; i < scene.selectionSet.length; i++){

        for (var j = 0; j < scene.selectedItems[i].points.length; j++){

            var x = points[0].x + (items[scene.selectionSet[i]].points[j].x - points[0].x)*Math.cos(theta) - (items[scene.selectionSet[i]].points[j].y-points[0].y)*Math.sin(theta);
            var y = points[0].y + (items[scene.selectionSet[i]].points[j].x - points[0].x)*Math.sin(theta) + (items[scene.selectionSet[i]].points[j].y-points[0].y)*Math.cos(theta);

            items[scene.selectionSet[i]].points[j].x = x;
            items[scene.selectionSet[i]].points[j].y = y;
        }
    }
  }
}
