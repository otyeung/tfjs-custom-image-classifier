let imageLoaded = false;
$("#image-selector").change(function () {
	imageLoaded = false;
	let reader = new FileReader();
	reader.onload = function () {	
		let dataURL = reader.result;
		$("#selected-image").attr("src", dataURL);
		$("#prediction-list").empty();
		imageLoaded = true;

	}
	
	let file = $("#image-selector").prop('files')[0];
	//console.log($("#image-selector").prop('files'));
	reader.readAsDataURL(file);
	$('#prediction').hide();
});

let model;
let modelLoaded = false;
let target_class;

let right = 0.0;
let wrong = 0.0;
let total = 0.0;
let accuracy = 0.0;

$( document ).ready(async function () {
/* 	modelLoaded = false;
	$('.progress-bar').show();
    console.log( "Loading model..." );
    model = await tf.loadGraphModel('model/model.json');
    console.log( "Model loaded." );
	$('.progress-bar').hide();
	modelLoaded = true; */
});

$("#load-model-button").click(async function () {
	modelLoaded = false;
	$('.progress-bar').show();

	var url = document.getElementById('model-url');
	console.log(url.value + 'model.json'); 
	console.log(url.value + 'labels.json');

	fetch(url.value + 'labels.txt')
		.then(response => response.text())
		.then(data => {
			target_class = data.split('\n');
			console.log(target_class);
		});

    console.log( "Loading model..." );
	//model = await tf.loadGraphModel('model/model.json');
	//model = await tf.loadGraphModel('https://lonemen.blob.core.windows.net/tensorflow/model/model.json');
	model = await tf.loadGraphModel(url.value + 'model.json');

    console.log( "Model loaded." );
	$('.progress-bar').hide();
	$('#predict-button').show();
	modelLoaded = true;
	alert("The model is loaded successfully. You may now add image.");
});

$("#predict-button").click(async function () {
	if (!modelLoaded) { alert("The model must be loaded first"); return; }
	if (!imageLoaded) { alert("Please select an image first"); return; }
	
	let image = $('#selected-image').get(0);
	
	// Pre-process the image
	console.log( "Loading image..." );
	let tensor = tf.browser.fromPixels(image, 3)
		.resizeNearestNeighbor([224, 224]) // change the image size
		.expandDims()
		.toFloat()
		.reverse(-1); // RGB -> BGR
	let predictions = await model.predict(tensor).data();
	$('#prediction').show();
	console.log(predictions);
	let top5 = Array.from(predictions)
		.map(function (p, i) { // this is Array.map
			return {
				probability: p,
				className: target_class[i] // we are selecting the value from the obj
			};
		}).sort(function (a, b) {
			return b.probability - a.probability;
		}).slice(0, 2);

	$("#prediction-list").empty();
	top5.forEach(function (p) {
		$("#prediction-list").append(`<li>${p.className}: ${p.probability.toFixed(6)}</li>`);
		});
	$('#image').show();
	$('#prediction').show();	
	$('#metrics').show();
});

$("#right-button").click(async function () {
	right = right + 1;
	total = total + 1;
	accuracy = right / total * 100;
	$("#right").html(`<p>Right : ${right}</p>`);
	$("#total").html(`<p>Total : ${total}</p>`);
	$("#accuracy").html(`<p>Accuracy : ${accuracy.toFixed(2)}%</p>`);
});

$("#wrong-button").click(async function () {
	wrong = wrong + 1;
	total = total + 1;
	accuracy = right / total * 100;
	$("#wrong").html(`<p>Wrong : ${wrong}</p>`);
	$("#total").html(`<p>Total : ${total}</p>`);
	$("#accuracy").html(`<p>Accuracy : ${accuracy.toFixed(2)}%</p>`);
});

$("#reset-button").click(async function () {
	right = 0;
	wrong = 0;
	total = 0;
	accuracy = 0;
	$("#right").html(`<p>Right : ${right}</p>`);
	$("#wrong").html(`<p>Wrong : ${wrong}</p>`);
	$("#total").html(`<p>Total : ${total}</p>`);
	$("#accuracy").html(`<p>Accuracy : ${accuracy.toFixed(2)}%</p>`);
});