

var canvas = document.getElementById("canvas");
var h1 = document.getElementById("header");
var h3 = document.getElementById("output");
var rect = canvas.getBoundingClientRect();
var ctx = canvas.getContext("2d");
var imageData;
var prediction = [];

var word = "apple";

canvas.width = 1000
canvas.height = 550

ctx.fillStyle="white";
ctx.fillRect(0,0,canvas.width, canvas.height);

ctx.color="black";
ctx.lineWidth=18;
ctx.lineJoin = ctx.lineCap = 'round';


var mouse = {x:0, y:0};
var prevMouse = {x:0, y:0};
var Xcoordinates = [];
var Ycoordinates = [];
var strokes = [];
var strokeXcoordinates = [];
var strokeYcoordinates = [];


var words = JSON.parse(document.getElementById("header").dataset.class_names);
var word;
var guessingQueue = [];
var guessedWords = [];
newWord();



var intervalId = window.setInterval(function(){
	guess();
  }, 1000);



canvas.addEventListener( "mousemove", function(e)
	{


		prevMouse.x = mouse.x;
		prevMouse.y = mouse.y;

		mouse.x = getXY(canvas, e).x;
		mouse.y = getXY(canvas, e).y;

	}, false );

canvas.addEventListener("mousedown", function()
	{
		canvas.addEventListener("mousemove", paint, false);

	}, false );

canvas.addEventListener("mouseup", function()
	{
		strokes.push([Xcoordinates, Ycoordinates]);
		strokeXcoordinates = [];
		strokeYcoordinates = [];
		canvas.removeEventListener( "mousemove", paint, false );
		guessingQueue = [];
		sendData();
		

	}, false );

function getXY(canvas, event) {
		  // absolute position of canvas
		return {
			x: event.clientX - rect.left,
			y: event.clientY - rect.top
		}
}


var paint = function(){
    ctx.lineWidth = ctx.lineWidth;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = ctx.color;

    ctx.beginPath();
    ctx.moveTo(prevMouse.x, prevMouse.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.closePath();
	Xcoordinates.push(mouse.x);
	Ycoordinates.push(mouse.y);
	strokeXcoordinates.push(mouse.x);
	strokeYcoordinates.push(mouse.y)
    ctx.stroke();

}

function sendData(){
	
	dataWindow = getBoundingBox();
	const height = dataWindow.y.max - dataWindow.y.min;
	const width = dataWindow.x.max -dataWindow.x.min;
	//dimension = Math.max(height, width);
	imageData=ctx.getImageData(dataWindow.x.min, dataWindow.y.min,
		width, height);

	 formattedImageData = [];
	 for (i = 0; i < imageData.data.length; i=i+4) {
		formattedImageData.push(imageData.data[i]);
	  }


	
	var data = [formattedImageData, dataWindow];
	//dataWindow = getBoundingBox();
	//data = [strokes, dataWindow];
	
	const jsonImageData = JSON.stringify(data);
	const URL = '/predict'
	let request_options = {
		method:"POST",
		headers:{
			'content-type':'application/json'
		},
		body:jsonImageData
	}


	
	const getData = async () => {
		let data2;
		await fetch(URL, request_options)
		.then(result => result.json())
		.then(data => {
			data2 = data;
			

			for (i=0; i<data2.length; i=i+1){
				if(guessedWords.indexOf(data2[i]) < 0){
					guessingQueue.push(data2[i]);
					guessedWords.push(data2[i]);
				}

			}

			

		});
		

		
		
	};
	
	getData();




	/* fetch(URL, request_options)
	.then(response=>response.json())
	.then((data)=>{console.log(data)
		prediction=data})
	.catch((err) =>{console.log(err)})

	console.log(prediction); */

	/* $.ajax({
		url:"/predict",
		type:"POST",
		contentType: "application/json",
		data: jsonImageData}); */
	
		
	

}



function getBoundingBox(){
	
	

   
   
   var x_coords = {
    min : Math.round(Math.min.apply(null, Xcoordinates)),
    max : Math.round(Math.max.apply(null, Xcoordinates))
   }
   
   var y_coords = {
    min : Math.round(Math.min.apply(null, Ycoordinates)),
    max : Math.round(Math.max.apply(null, Ycoordinates))
   }
   return {
    x : x_coords,
    y : y_coords
   }


}

function clearCanvas(){
	
	ctx.fillStyle="white";
ctx.fillRect(0,0,canvas.width,canvas.height);

guessingQueue = [];
guessedWords = [];
	
	
	
	Xcoordinates = [];
	Ycoordinates = [];


}

var guessed = false;

function guess(){

	if (guessingQueue.length > 0 && guessed == false){
		var msg = new SpeechSynthesisUtterance();
		theGuess = guessingQueue.shift();

		if(theGuess == word){

			msg.text = "It's " + theGuess;
		
			window.speechSynthesis.speak(msg);
			h3.innerHTML = msg.text + " !";
			guessed = true

		} else {

			msg.text = theGuess;
		
			window.speechSynthesis.speak(msg);
			h3.innerHTML = msg.text + " ?";
			
		}

		

	}
	

	

}

function newWord(){

	clearCanvas();

	guessed = false;

	

	h3.innerHTML = "";

	word = words[Math.floor(Math.random()*words.length)];

	const vowels = "aeiou"
	if (vowels.indexOf(word[0]) > -1){
		h1.innerHTML = "Draw an " + word;

	} else {
		h1.innerHTML = "Draw a " + word;
	}

	



}