//==============================================================================
// LOCAL USER VARIABLES
//==============================================================================
// A flag to track whether the user is drawing or not
var isPenDown = false;
var isBarDown_array = new Array()
var isCornerDown_array = new Array()
 
// Line defaults
var defaultLineColor = "#000000";
var defaultLineThickness = 1;
var maxLineThickness = 30;
 
// Tracks the current location of the user's drawing pen
var localPen = {};
 
// The user's line styles
var localLineColor = defaultLineColor;
var localLineThickness = defaultLineThickness;
 
// A list of points in a path to send to other connected users
var bufferedPath = [];
// A timestamp indicating the last time a point was added to the bufferedPath
var lastBufferTime = new Date().getTime();
 
//==============================================================================
// DRAWING VARIABLES
//==============================================================================
// The HTML5 drawing canvas
// The drawing canvas's context, through which drawing commands are performed
var canvas_array
var context_array
// A hash of drawing commands executed by UnionDraw's rendering process
var DrawingCommands = {LINE_TO:       "lineTo",
                       MOVE_TO:       "moveTo",
                       SET_THICKNESS: "setThickness",
                       SET_COLOR:     "setColor"};
var bar_array
 
 var body;
 var numDeleted = 0;
//==============================================================================
// TOUCH-DEVICE VARIABLES
//==============================================================================
var hasTouch = false;

//==============================================================================
// INITIALIZATION
//==============================================================================
// Trigger init() when the document finishes loading
window.onload = init;
 
// Main initialization function
function init () {
  body = document.getElementById("body");
  var num = document.querySelectorAll(".doodle").length + numDeleted;
  //console.log("Test "+document.querySelectorAll(".doodle").length+" + "+numDeleted+" = "+num);
  var i;
  canvas_array = new Array()
  context_array = new Array()
  bar_array = new Array()
  for(i=0;i<num;i++){
  canvas_array.push(document.getElementById("canvas"+i));
  }
  for(i=0;i<num;i++){
  initCanvas("canvas"+i);
  }
  for(i=0;i<num;i++){
  initMovementBar('movement'+i);
  }
  registerInputListeners();
  var i;
  for (i = 0; i < canvas_array.length; i++){
    isBarDown_array[i] = false;
    isCornerDown_array[i] = false;
  }
  iPhoneToTop();
}
 
//set up movement bar
function initMovementBar(movementBarId){
    var idNum = parseInt(movementBarId.slice(8));
  if(document.getElementById("canvas"+idNum)==null){
    return;
    }
    bar_array[idNum] = document.getElementById(movementBarId);
    bar_array[idNum].onmousedown = barDown;
}

// Set up the drawing canvas
function initCanvas (canvasID) {
  if(document.getElementById(canvasID)==null){
  return;
  }
  console.log("initCanvas");
  // Retrieve canvas reference
  var idNum = parseInt(canvasID.slice(6));
       canvas_array[idNum] = document.getElementById(canvasID);
       // If IE8, do IE-specific canvas initialization (required by excanvas.js)
   if (typeof G_vmlCanvasManager != "undefined") {
      canvas_array[idNum] = G_vmlCanvasManager.initElement(canvas_array[idNum]);
   }
 
 
  // Size canvas
  if(canvas_array[idNum].width  == 0){
  console.log("id: "+idNum);
  canvas_array[idNum].width  = 600;
  canvas_array[idNum].height = 400;
  context_array.push(canvas_array[idNum].getContext('2d'));
  //context_array[idNum].lineCap = "round";
  }
  // Retrieve context reference, used to execute canvas drawing commands
 
  // Set control panel defaults
}
 
// Register callback functions to handle user input
function registerInputListeners () {
  var i;
  for (i = 0; i < canvas_array.length; i++){
    if(canvas_array[i]!=null){
      canvas_array[i].onmousedown = pointerDownListener;
  }
  }
  document.ontouchstart = touchDownListener;
  document.ontouchmove = touchMoveListener;
  document.ontouchend = touchUpListener;
  document.onmouseup = pointerUpListener;
  document.onmousemove = pointerMoveListener;
}

function saveCanvas (canvasID){
    var canvas = document.getElementById(canvasID);
    var img    = canvas.toDataURL("image/png");
    console.log(img);
    return img;
}

function loadImageToCanvas(canvasID,pngDataURL){
    var img = new Image
        , myCanvas = document.getElementById(canvasID)
        , ctx = myCanvas.getContext('2d')
    img.onload = function(){
        ctx.drawImage(img,0,0)
    }
    img.src = pngDataURL;
}
 
//==============================================================================
// TOUCH-INPUT EVENT LISTENERS
//==============================================================================
// On devices that support touch input, this function is triggered when the
// user touches the screen.
function touchDownListener (e) {
  // Note that this device supports touch so that we can prevent conflicts with
  // mouse input events.
  hasTouch = true;
  // Prevent the touch from scrolling the page, but allow interaction with the
  // control-panel menus. The "event.target.nodeName" variable provides the name
  // of the HTML element that was touched.
  if (event.target.nodeName != "SELECT") {
    e.preventDefault();
  }
  var canvas = event.target;
  // Determine where the user touched screen.
  var touchX = e.changedTouches[0].clientX - canvas.offsetLeft;
  var touchY = e.changedTouches[0].clientY - canvas.offsetTop;
  // A second "touch start" event may occur if the user touches the screen with
  // two fingers. Ignore the second event if the pen is already down.
  if (!isPenDown) {
    // Move the drawing pen to the position that was touched
    penDown(touchX, touchY);
  }
}
 
// On devices that support touch input, this function is triggered when the user
// drags a finger across the screen.
function touchMoveListener (e) {
  hasTouch = true;
  e.preventDefault();
  var canvas = e.target;
  var touchX = e.changedTouches[0].clientX - canvas.offsetLeft;
  var touchY = e.changedTouches[0].clientY - canvas.offsetTop;
  // Draw a line to the position being touched.
  penMove(touchX, touchY,canvas.getContext('2d'));
}
 
// On devices that support touch input, this function is triggered when the
// user stops touching the screen.
function touchUpListener () {
  // "Lift" the drawing pen, so lines are no longer drawn
  penUp();
}
 
//==============================================================================
// MOUSE-INPUT EVENT LISTENERS
//==============================================================================
function barDown(e){
    var idNum = parseInt(e.target.getAttribute('id').slice(8));
  //console.log("barDown target is:");
    //console.log(e.target);
    //console.log(idNum);
    if (isNaN(idNum) || document.getElementById("canvas"+idNum)==null){
    return;
  }
    var i;
    var bar;
    for (i = 0; i < bar_array.length; i++){
        if (i === idNum){
            bar = bar_array[i];
        }
    }
  //console.log("Bar:");
  //console.log(bar);
    var rect = bar.getBoundingClientRect();
    //console.log(rect.right+"-20<"+e.clientX);
  if(rect.right-30 < e.clientX){
      isCornerDown_array[idNum]=true;
    }
    isBarDown_array[idNum] = true;
    //console.log("Selected");
}
// Triggered when the mouse is pressed down
function pointerDownListener (e) {
  localLineColor = document.getElementById("colourPick").value;
  if(document.getElementById("eraser").checked){
	localLineColor = "#FFFFFF";
	localLineThickness = 40;
  }else{
    console.log("B");
	localLineThickness = 2;
  }
  if( localLineThickness<1){
	localLineThickness=1;
  }else if (localLineThickness>60){
	localLineThickness=60;
  }
  // If this is an iPhone, iPad, Android, or other touch-capable device, ignore
  // simulated mouse input.
  if (hasTouch) {
    return;
  }
 
  // Retrieve a reference to the Event object for this mousedown event.
  // Internet Explorer uses window.event; other browsers use the event parameter
  var event = e || window.event;
  // Determine where the user clicked the mouse.
  var canvas = event.target;
  //console.log(canvas);
  var mouseX = event.clientX - canvas.offsetLeft + body.scrollLeft;
  var mouseY = event.clientY - canvas.offsetTop + body.scrollTop;
 
  // Move the drawing pen to the position that was clicked
  penDown(mouseX, mouseY);
 
  // We want mouse input to be used for drawing only, so we need to stop the
  // browser from/ performing default mouse actions, such as text selection.
  // In Internet Explorer, we "prevent default actions" by returning false. In
  // other browsers, we invoke event.preventDefault().
  if (event.preventDefault) {
    if (event.target.nodeName != "SELECT") {
      event.preventDefault();
    }
  } else {
    return false;  // IE
  }
}
 
// Triggered when the mouse moves
function pointerMoveListener (e) {

  if (hasTouch) {
    return;
  }
  var event = e || window.event; // IE uses window.event, not e
  
  //console.log("e.clientX "+e.clientX+" e.clientY "+e.clientY);
  
  var isCornerDown;
  var i;
  var idNum=-1;
  for(i = 0;i<isBarDown_array.length;i++){
  if(isBarDown_array[i]){
    idNum = i;
  }
  }
  if(idNum==-1){
  for(i=0;i<canvas_array.length;i++){
    if(canvas_array[i]!=null){
    //console.log(i + event + canvas_array[i]);
    var mouseX2 = event.clientX - canvas_array[i].offsetLeft;
    var mouseY2 = event.clientY - canvas_array[i].offsetTop + body.scrollTop;
    if(mouseX2>0 && mouseX2<=canvas_array[i].width && mouseY2>0
    && mouseY2<canvas_array[i].height){
      penMove(mouseX2, mouseY2,canvas_array[i].getContext('2d'));
    }
    }
  }
    // Prevent default browser actions, such as text selection
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      return false;  // IE
    }
  return;
  }
  isCornerDown = isCornerDown_array[idNum];
  isBarDown = isBarDown_array[idNum];
  bar = bar_array[idNum];
  var canvas = canvas_array[idNum];
  
  var mouseX = event.clientX - canvas.offsetLeft + body.scrollLeft;
  var mouseY = event.clientY - canvas.offsetTop + body.scrollTop;
  //console.log(idNum+" "+isCornerDown+" "+isBarDown);
  if(isCornerDown){
  var save = saveCanvas(canvas.getAttribute('id'));
    rect = canvas.getBoundingClientRect();
  width = mouseX;
  canvas.width = width<100?100:width;
  bar.style.width = (width<100?100:width)+"px";
  height = mouseY;
  canvas.height = (height<50?50:height);
  bar.style.top = (rect.top+(height<50?50:height))+"px";
  loadImageToCanvas(canvas.getAttribute('id'),save);
  }else if(isBarDown){
    bar.style.top = (e.clientY + body.scrollTop)+"px";
    bar.style.left = (e.clientX - canvas.width/2)+"px";
  canvas.style.top = (e.clientY + body.scrollTop-canvas.height)+"px";
    canvas.style.left = (e.clientX - canvas.width/2)+"px";
    //bar.style.color = "blue";
  }
}
 
// Triggered when the mouse button is released
function pointerUpListener (e) {
  if (hasTouch) {
    return;
  }
  // "Lift" the drawing pen
  penUp();
}
 
//==============================================================================
// CONTROL PANEL MENU-INPUT EVENT LISTENERS
//==============================================================================
// Triggered when an option in the "line thickness" menu is selected
function thicknessSelectListener (e) {
  // Determine which option was selected
  var newThickness = this.options[this.selectedIndex].value;
  // Locally, set the line thickness to the selected value
  localLineThickness = getValidThickness(newThickness);

  iPhoneToTop();
}
 
// Triggered when an option in the "line color" menu is selected
function colorSelectListener (e) {
  // Determine which option was selected
  var newColor = this.options[this.selectedIndex].value;
  // Locally, set the line color to the selected value
  localLineColor = newColor;
  // Scroll the iPhone back to the top-left.
  iPhoneToTop();
}
 
//==============================================================================
// PEN
//==============================================================================
// Places the pen in the specified location without drawing a line. If the pen
// subsequently moves, a line will be drawn.
function penDown (x, y) {
  isPenDown = true;
  localPen.x = x;
  localPen.y = y;
}
 
// Draws a line if the pen is down.
function penMove (x, y, context) {
  if (isPenDown) {
    // Buffer the new position for broadcast to other users. Buffer a maximum
    // of 100 points per second.
    if ((new Date().getTime() - lastBufferTime) > 10) {
      bufferedPath.push(x + "," + y);
      lastBufferTime = new Date().getTime();
    }
 
    // Draw the line locally.
  //console.log("x "+localPen.x+", y "+localPen.y);
    drawLine(localLineColor, localLineThickness, localPen.x, localPen.y, x, y,context);
 
    // Move the pen to the end of the line that was just drawn.
    localPen.x = x;
    localPen.y = y;
  }
}
 
// "Lifts" the drawing pen, so that lines are no longer draw when the mouse or
// touch-input device moves.
function penUp () {
  isPenDown = false;
  var i;
  for (i = 0; i < isCornerDown_array.length; i++){
    isBarDown_array[i] = false;
    isCornerDown_array[i] = false;
  }
}
 
//==============================================================================
// DRAWING
//==============================================================================
// Draws a line on the HTML5 canvas
function drawLine (color, thickness, x1, y1, x2, y2,context) {
  context.strokeStyle = color;
  context.lineWidth   = thickness;
 
  context.beginPath();
  context.moveTo(x1, y1)
  context.lineTo(x2, y2);
  context.stroke();
}
 
//==============================================================================
// STATUS
//==============================================================================
// Updates the text of the on-screen HTML "status" div tag
function setStatus (message) {
  document.getElementById("status").innerHTML = message;
}
 
//==============================================================================
// IPHONE UTILS
//==============================================================================
// Hides the iPhone address bar by scrolling it out of view
function iPhoneToTop () {
  if (navigator.userAgent.indexOf("iPhone") != -1) {
    setTimeout (function () {
      window.scroll(0, 0);
    }, 100);
  }
}
 
//==============================================================================
// DATA VALIDATION
//==============================================================================
function getValidThickness (value) {
  value = parseInt(value);
  var thickness = isNaN(value) ? defaultLineThickness : value;
  return Math.max(1, Math.min(thickness, maxLineThickness));
}

function deleter(){
  numDeleted++;
  var n = parseInt(document.activeElement.getAttribute('id').slice(3));
  if(isNaN(n)){
    return;
  }
  console.log("deleted "+n)
  var can = document.getElementById("canvas"+n);
  can.onmousedown = void1;
  can.parentNode.removeChild(can);
  document.getElementById("movement"+n).parentNode.removeChild(document.getElementById("movement"+n));
  
  
}
function void1(){}