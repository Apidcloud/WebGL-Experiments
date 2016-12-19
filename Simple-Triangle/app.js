var vertexShaderText = 
[
	'precision mediump float;', // set float point precision to medium. Not as high quality but faster
	'attribute vec2 vertPosition;', // set entry attribute
	'',
	'void main()',
	'{',				   // x and y, z and w
	'	gl_Position = vec4(vertPosition, 0.0, 1.0);', // webgl position is a vector 4, but we are only sending a vector 2.
	'}'
].join('\n');


var fragmentShaderText = 
[
	'precision mediump float;',
	'',
	'',
	'void main()',
	'{',
	'	gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);', // fragment color set to red color
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
		0.0, 0.5,
		-0.5, -0.5,
		0.5, -0.5
	];

	// buffer
	var triangleVertexBufferObj = gl.createBuffer();
	// set triangleVertexBufferObj as active buffer 
	gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObj);
	// pass data to active buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW); // need to convert to float32 because javascript uses 64 bit floats

	// retrieve shader attribute location
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');

	// tell GPU how it should read the data from the array
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		2, // number of elements per attribute. (x,y) in this case
		gl.FLOAT, // type of elements
		gl.FALSE, // normalized
		2 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex (2 float values in this case)
		0 // offset from the beginning of a single vertex to this attribute
	);

	// use the attribute
	gl.enableVertexAttribArray(positionAttribLocation);


	// main render loop (or where commonly we would have a game loop... updateWorld and renderWorld)
	gl.useProgram(program);

	// draw the information in the buffer
	// what it should draw (i.e., using triangles, points, lines, triangleFans), how many vertices it should skip (in this case 0) and how many vertices to draw (3 since we only have 1 triangle)
	gl.drawArrays(gl.TRIANGLES, 0, 3); 
};