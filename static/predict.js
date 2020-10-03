let model;
let modelLoaded = false;
let target_class;
let imageLoaded = false;

// Define empty array for output
let imgFiles = [];
let outputCSV = [];
let outputFileName = "output.csv";

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

//            header = ['filename'];
//            target_class.forEach(function(c){
//                header = header.concat(c);
//            });
            //header = header.concat(target_class);
//            outputCSV.push(header);
            //console.log(header);            
		});

    console.log( "Loading model..." );
	//model = await tf.loadGraphModel('model/model.json');
	//model = await tf.loadGraphModel('https://lonemen.blob.core.windows.net/tensorflow/model/model.json');
	model = await tf.loadGraphModel(url.value + 'model.json');

    console.log( "Model loaded." );
	$('.progress-bar').hide();
//	$('#predict-button').show();
    $('#files').show();
	modelLoaded = true;
	alert("The model is loaded successfully. You may now add image.");
});

$("#clear-button").click(async function () {
    // document.getElementById('list').innerHTML = '';
    document.getElementById("files").value = '';
    //$('#files').hide();
    $('#clear-button').hide();
    //$('#export-button').hide();    	
    $( ".thumb" ).remove();
    imgFiles = [];
    outputCSV = [];
});


$("#export-button").click(async function () {
    // Create header
    csv = 'filename';
    for (var i = 0; i < target_class.length; i++) {
        csv += ',';
        csv += target_class[i];
    };
    csv += '\n';
//    console.log(csv);

    // Create content
    for (var i = 0; i < outputCSV.length; i++) {
        csv += outputCSV[i];
        csv += '\n';
    };
    console.log(csv);
    var blob = new Blob([csv], {type: "text/plain;charset=utf-8"});
    saveAs(blob, outputFileName); 

    $('#export-button').hide();
    $('#clear-button').show();
});

$("#predict-button").click(async function () {
    let x = document.getElementById("previewImg").querySelectorAll(".thumb");
    //console.log(x);
    for (var i = 0; i < x.length; i++) {
        await predict(imgFiles[i], x[i])
    };

    alert("The prediction is completed. You may now export csv.");

    $('#predict-button').hide();
    $('#export-button').show();
});

function predict(fileName, image) {
    // Pre-process the image
    let tensor = tf.browser.fromPixels(image, 3)
        .resizeNearestNeighbor([224, 224]) // change the image size
        .expandDims()
        .toFloat()
        .reverse(-1); // RGB -> BGR

    let predictions = model.predict(tensor).data().then(function(results) {
        //console.log(results); // "Success"
        let top5 = Array.from(results)
        .map(function (p, i) { // this is Array.map
            return {
                probability: p,
                className: target_class[i] // we are selecting the value from the obj
            };
        });

        //$("#prediction-list").empty();
        probs = [fileName];
        top5.forEach(function (p) {
            //$("#prediction-list").append(`<li>${p.className}: ${p.probability.toFixed(6)}</li>`);
                //console.log (fileName, p.className, p.probability);
                //outputCSV.push(p.className, p.probability); 
                probs.push(p.probability);
        });    
        outputCSV.push(probs);
        //console.log(outputCSV); 

      }, function(results) {
        // not called, show errors
      });      

};

$("#files").change(async function (evt) {    
    imageLoaded = false;
    //var files = evt.target.files; // FileList object

    //Check File API support
    if (window.File && window.FileList && window.FileReader) {

        var files = evt.target.files; //FileList object
        var output = document.getElementById("previewImg");

        for (var i = 0; i < files.length; i++) {
            var file = files[i];
   
            imgFiles.push(file.name);
            //Only pics
            if (!file.type.match('image')) continue;

            var picReader = new FileReader();
            picReader.addEventListener("load", function (event) {
                var picFile = event.target;
                var div = document.createElement("div");
                div.innerHTML = "<img class='thumb' src='" + picFile.result + "'/>"; 
//                + "id='" + file.name + "'" + "title='" + file.name + "'/>";    
                output.insertBefore(div, null);
            });

            //Read the image
            picReader.readAsDataURL(file);
        } 
    } else {
        console.log("Your browser does not support File API");
    }

    $('#predict-button').show();

    imageLoaded = true;
});


function exportToCsv(filename, rows) {
    var processRow = function (row) {
        var finalVal = '';
        for (var j = 0; j < row.length; j++) {
            var innerValue = row[j] === null ? '' : row[j].toString();
            if (row[j] instanceof Date) {
                innerValue = row[j].toLocaleString();
            };
            var result = innerValue.replace(/"/g, '""');
            if (result.search(/("|,|\n)/g) >= 0)
                result = '"' + result + '"';
            if (j > 0)
                finalVal += ',';
            finalVal += result;
        }
        return finalVal + '\n';
    };

    var csvFile = '';
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
    if (navigator.msSaveBlob) { // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) { // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
};
