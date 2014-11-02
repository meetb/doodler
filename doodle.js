//==============================================================================
// LOCAL USER VARIABLES
//==============================================================================
// A flag to track whether the user is drawing or not
var isPenDown = false;
var isBarDown = false;
 
// Line defaults
var defaultLineColor = "#AAAAAA";
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
var canvas;
// The drawing canvas's context, through which drawing commands are performed
var context;
// A hash of drawing commands executed by UnionDraw's rendering process
var DrawingCommands = {LINE_TO:       "lineTo",
                       MOVE_TO:       "moveTo",
                       SET_THICKNESS: "setThickness",
                       SET_COLOR:     "setColor"};
 
 var bar;
 
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
  initCanvas("canvas");
  initMovementBar();
  registerInputListeners();
  iPhoneToTop();
  console.log("Test");
}
 
//set up movement bar
function initMovementBar(){
    bar = document.getElementById("controls");
    bar.onmousedown = barDown;
}

// Set up the drawing canvas
function initCanvas (canvasID) {
  // Retrieve canvas reference
  canvas = document.getElementById(canvasID);
 
  // If IE8, do IE-specific canvas initialization (required by excanvas.js)
  if (typeof G_vmlCanvasManager != "undefined") {
    this.canvas = G_vmlCanvasManager.initElement(this.canvas);
  }
 
  // Size canvas
  canvas.width  = 600;
  canvas.height = 400;
 
  // Retrieve context reference, used to execute canvas drawing commands
  context = canvas.getContext('2d');
  context.lineCap = "round";
 
  // Set control panel defaults
  document.getElementById("thickness").selectedIndex = 0;
  document.getElementById("color").selectedIndex = 1;
}
 
// Register callback functions to handle user input
function registerInputListeners () {
  canvas.onmousedown = pointerDownListener;
  document.onmousemove = pointerMoveListener;
  document.onmouseup = pointerUpListener;
  document.ontouchstart = touchDownListener;
  document.ontouchmove = touchMoveListener;
  document.ontouchend = touchUpListener;
  document.getElementById("thickness").onchange = thicknessSelectListener;
  document.getElementById("color").onchange = colorSelectListener;
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
  var touchX = e.changedTouches[0].clientX - canvas.offsetLeft;
  var touchY = e.changedTouches[0].clientY - canvas.offsetTop;
  // Draw a line to the position being touched.
  penMove(touchX, touchY);
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
    isBarDown = true;
    //console.log("Selected");
}
// Triggered when the mouse is pressed down
function pointerDownListener (e) {
  // If this is an iPhone, iPad, Android, or other touch-capable device, ignore
  // simulated mouse input.
  if (hasTouch) {
    return;
  }
 
  // Retrieve a reference to the Event object for this mousedown event.
  // Internet Explorer uses window.event; other browsers use the event parameter
  var event = e || window.event;
  // Determine where the user clicked the mouse.
  var mouseX = event.clientX - canvas.offsetLeft;
  var mouseY = event.clientY - canvas.offsetTop;
 
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
  if(isBarDown){
    bar.style.top = e.clientY+"px";
    bar.style.left = (e.clientX - canvas.width/2)+"px";
	canvas.style.top = (e.clientY+30)+"px";
    canvas.style.left = (e.clientX - canvas.width/2)+"px";
    //bar.style.color = "blue";
    //console.log("Moved "+e.clientX+", "+e.clientY);
  }else{
    var event = e || window.event; // IE uses window.event, not e
    var mouseX = event.clientX - canvas.offsetLeft;
    var mouseY = event.clientY - canvas.offsetTop;
 
    // Draw a line if the pen is down
    penMove(mouseX, mouseY);
 
    // Prevent default browser actions, such as text selection
    if (event.preventDefault) {
      event.preventDefault();
    } else {
      return false;  // IE
    }
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
  // Share the selected thickness with other users by setting the client
  // attribute named "thickness". Attributes are automatically shared with other
  // clients in the room, triggering clientAttributeUpdateListener().
  // Arguments for SET_CLIENT_ATTR are:
  //   clientID
  //   userID (None in this case)
  //   attrName
  //   escapedAttrValue
  //   attrScope (The room)
  //   attrOptions (An integer whose bits specify options. "4" means
  //                the attribute should be shared).
  // msgManager.sendUPC(UPC.SET_CLIENT_ATTR,
  //                    orbiter.getClientID(),
  //                    "",
  //                    Attributes.THICKNESS,
  //                    newThickness,
  //                    roomID,
  //                    "4");
  // After the user selects a value in the drop-down menu, the iPhone
  // automatically scrolls the page, so scroll back to the top-left.
  iPhoneToTop();
}
 
// Triggered when an option in the "line color" menu is selected
function colorSelectListener (e) {
  // Determine which option was selected
  var newColor = this.options[this.selectedIndex].value;
  // Locally, set the line color to the selected value
  localLineColor = newColor;
  // Share selected color with other users
  // msgManager.sendUPC(UPC.SET_CLIENT_ATTR,
  //                    orbiter.getClientID(),
  //                    "",
  //                    Attributes.COLOR,
  //                    newColor,
  //                    roomID,
  //                    "4");
 
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
function penMove (x, y) {
  if (isPenDown) {
    // Buffer the new position for broadcast to other users. Buffer a maximum
    // of 100 points per second.
    if ((new Date().getTime() - lastBufferTime) > 10) {
      bufferedPath.push(x + "," + y);
      lastBufferTime = new Date().getTime();
    }
 
    // Draw the line locally.
    drawLine(localLineColor, localLineThickness, localPen.x, localPen.y, x, y);
 
    // Move the pen to the end of the line that was just drawn.
    localPen.x = x;
    localPen.y = y;
  }
}
 
// "Lifts" the drawing pen, so that lines are no longer draw when the mouse or
// touch-input device moves.
function penUp () {
  isPenDown = false;
  isBarDown = false;
}
 
//==============================================================================
// DRAWING
//==============================================================================
// Draws a line on the HTML5 canvas
function drawLine (color, thickness, x1, y1, x2, y2) {
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
