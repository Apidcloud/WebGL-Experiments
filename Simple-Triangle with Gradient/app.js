var vertexShaderText = 
[
	'precision mediump float;', // set float point precision to medium. Not as high quality but faster
	'attribute vec2 vertPosition;', // set entry attribute for position
	'attribute vec3 vertColor;', // set entry attribute for color
	'varying vec3 fragColor;', // create a varying to pass the data to the fragment shader
	'void main()',
	'{',
	'	fragColor = vertColor;', // set varying as the entry value of vertColor
					   // x and y, z and w
	'	gl_Position = vec4(vertPosition, 0.0, 1.0);', // webgl position is a vector 4, but we are only sending a vector 2.
	'}'
].join('\n');


var fragmentShaderText = 
[
	'precision mediump float;',
	'',
	'varying vec3 fragColor;', // receive the color from the vertex shader
	'void main()',
	'{',
		// set RGB coming from fragColor and alpha as 1.0
	'	gl_FragColor = vec4(fragColor, 1.0);',  // 1.0, 0.0, 0.0, 1.0);',  fragment color set to red color
	'}'
].join('\n');


var initializeDemo = function() {

	console.log("Demo working!");

	var canvas = document.getElementById('surface');
	var gl = canvas.getContext('webgl');

	if (!gl) {
		gl = canvas.getContext('experimental-webgl');
		console.log('WebGL not supported. Falling back to experimental-webgl');
	}

	if (!gl) {
		alert('WebGL not supported by this browser.');
	}

	// set the color to paint with
	gl.clearColor(0.7, 0.5, 0, 1.0);
	// clear the buffers with the color set before
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// create shaders variables
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	// loading shader text to the actual variables
	gl.shaderSource(vertexShader, vertexShaderText);
	gl.shaderSource(fragmentShader, fragmentShaderText);

	// compile vertex shader
	gl.compileShader(vertexShader);
	// make sure there arent any errors
	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error("ERROR compiling vertex shader", gl.getShaderInfoLog(vertexShader));
		return;
	}

	// compile fragment shader
	gl.compileShader(fragmentShader);
	// make sure there arent any errors
	if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error("ERROR compiling fragment shader", gl.getShaderInfoLog(fragmentShader));
		return;
	}

	// create program 
	var program = gl.createProgram();
	// attach shaders. There is no need to specify the type here (vertex or fragment) because we have created the shaders variables before with that information
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	// link program
	gl.linkProgram(program);
	// check for errors with linking
	if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error("ERROR linking program", gl.getProgramInfoLog(program));
		return;
	}

	// counter clock-wise triangle vertices, starting top
	var triangleVertices = [
		0.0, 0.5, 	1.0, 1.0, 0.0,
		-0.5, -0.5, 0.0, 1.0, 1.0,
		0.5, -0.5,  1.0, 0.0, 1.0
	];

	// buffer
	var triangleVertexBufferObj = gl.createBuffer();
	// set triangleVertexBufferObj as active buffer 
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObj);
	// pass data to active buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW); // need to convert to float32 because javascript uses 64 bit floats

	// retrieve shader attribute location
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	// retrieve shader attribute location
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

	// tell GPU how it should read the data from the array
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // number of elements per attribute. (x,y) in this case
		gl.FLOAT, // type of elements
		gl.FALSE, // normalized
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex (2 float values for xy and 3 more for color = 5)
		0 // offset from the beginning of a single vertex to this attribute
	);

	// tell GPU how it should read the data from the array
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // number of elements per attribute. (r,g, b) in this case
		gl.FLOAT, // type of elements
		gl.FALSE, // normalized
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex (2 float values for xy and 3 more for color = 5)
		2 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute (color starts at the 3th value, so the offset is 2)
	);

	// use the position attribute
	gl.enableVertexAttribArray(positionAttribLocation);
	// use the color attribute
	gl.enableVertexAttribArray(colorAttribLocation);


	// main render loop (or where commonly we would have a game loop... updateWorld and renderWorld)
	gl.useProgram(program);

	// draw the information in the buffer
	// what it should draw (i.e., using triangles, points, lines, triangleFans), how many vertices it should skip (in this case 0) and how many vertices to draw (3 since we only have 1 triangle)
	gl.drawArrays(gl.TRIANGLES, 0, 3); 
};