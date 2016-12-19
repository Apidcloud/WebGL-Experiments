var vertexShaderText = 
[
	'precision mediump float;', // set float point precision to medium. Not as high quality but faster
	'attribute vec3 vertPosition;', // set entry attribute for position
	'attribute vec3 vertColor;', // set entry attribute for color
	'uniform mat4 mWorld;', // uniforms are still attributes, but do not change per vertex
	'uniform mat4 mView;',
	'uniform mat4 mProj;',
	'varying vec3 fragColor;', // create a varying to pass the data to the fragment shader
	'void main()',
	'{',
	'	fragColor = vertColor;', // set varying as the entry value of vertColor
					   // x and y, z and w
					  // in opengl, multiplication is done in reverse order. vec4 is multiplicated by mWorld, then by mView and finally by mProj
	'	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);', // webgl position is a vector 4, but we are only sending a vector 3.
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

	// telling the rasterizer to care about the depth (needed for 3D only?); still bad because every pixel is processed, so we also add CULL_FACE.
	gl.enable(gl.DEPTH_TEST);
	gl.enable(gl.CULL_FACE);
	gl.frontFace(gl.CCW); // counter clock-wise
	gl.cullFace(gl.BACK); // get rid of the back polygon. FRONT_AND_BACK would make the entire polygon disappear. 

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

	var boxVertices = 
	[ // X, Y, Z           R, G, B
		// Top
		-1.0, 1.0, -1.0,   0.5, 0.5, 0.5,
		-1.0, 1.0, 1.0,    0.5, 0.5, 0.5,
		1.0, 1.0, 1.0,     0.5, 0.5, 0.5,
		1.0, 1.0, -1.0,    0.5, 0.5, 0.5,

		// Left
		-1.0, 1.0, 1.0,    0.75, 0.25, 0.5,
		-1.0, -1.0, 1.0,   0.75, 0.25, 0.5,
		-1.0, -1.0, -1.0,  0.75, 0.25, 0.5,
		-1.0, 1.0, -1.0,   0.75, 0.25, 0.5,

		// Right
		1.0, 1.0, 1.0,    0.25, 0.25, 0.75,
		1.0, -1.0, 1.0,   0.25, 0.25, 0.75,
		1.0, -1.0, -1.0,  0.25, 0.25, 0.75,
		1.0, 1.0, -1.0,   0.25, 0.25, 0.75,

		// Front
		1.0, 1.0, 1.0,    1.0, 0.0, 0.15,
		1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, -1.0, 1.0,    1.0, 0.0, 0.15,
		-1.0, 1.0, 1.0,    1.0, 0.0, 0.15,

		// Back
		1.0, 1.0, -1.0,    0.0, 1.0, 0.15,
		1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, -1.0, -1.0,    0.0, 1.0, 0.15,
		-1.0, 1.0, -1.0,    0.0, 1.0, 0.15,

		// Bottom
		-1.0, -1.0, -1.0,   0.5, 0.5, 1.0,
		-1.0, -1.0, 1.0,    0.5, 0.5, 1.0,
		1.0, -1.0, 1.0,     0.5, 0.5, 1.0,
		1.0, -1.0, -1.0,    0.5, 0.5, 1.0,
	];

	// which indices (from the vertices list) form a triangle
	var boxIndices =
	[
		// Top
		0, 1, 2, // 1st triangle
		0, 2, 3, // 2nd triangle

		// Left
		5, 4, 6,
		6, 4, 7,

		// Right
		8, 9, 10,
		8, 10, 11,

		// Front
		13, 12, 14,
		15, 14, 12,

		// Back
		16, 17, 18,
		16, 18, 19,

		// Bottom
		21, 20, 22,
		22, 20, 23
	];

	// buffer
	var boxVertexBufferObj = gl.createBuffer();
	// set boxVertexBufferObj as active buffer 
	gl.bindBuffer(gl.ARRAY_BUFFER, boxVertexBufferObj);
	// pass data to active buffer
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW); // need to convert to float32 because javascript uses 64 bit floats

	// buffer for indices
	var boxIndexBufferObj = gl.createBuffer();
	// set boxIndexBufferObj as active buffer (element array buffer because it's an index array)
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, boxIndexBufferObj);
	// pass data to active buffer
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW); // need to convert to float32 because javascript uses 64 bit floats


	// retrieve shader attribute location
	var positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
	// retrieve shader attribute location
	var colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

	// tell GPU how it should read the data from the array
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // number of elements per attribute. (x,y,z) in this case
		gl.FLOAT, // type of elements
		gl.FALSE, // normalized
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex (2 float values for xy and 3 more for color = 5)
		0 // offset from the beginning of a single vertex to this attribute
	);

	// tell GPU how it should read the data from the array
	gl.vertexAttribPointer(
		colorAttribLocation, // Attribute location
		3, // number of elements per attribute. (r,g, b) in this case
		gl.FLOAT, // type of elements
		gl.FALSE, // normalized
		6 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex (2 float values for xy and 3 more for color = 5)
		3 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute (color starts at the 3th value, so the offset is 2)
	);

	// use the position attribute
	gl.enableVertexAttribArray(positionAttribLocation);
	// use the color attribute
	gl.enableVertexAttribArray(colorAttribLocation);


	// tell opengl state machine which program should be active (!important to be before the matrices)
	gl.useProgram(program);

	// get uniforms location
	var matWorldUniformLocation = gl.getUniformLocation(program, 'mWorld');
	var matViewdUniformLocation = gl.getUniformLocation(program, 'mView');
	var matProjdUniformLocation = gl.getUniformLocation(program, 'mProj');

	// create matrices (4x4) with 0s
	var worldMatrix = new Float32Array(16);
	var viewMatrix = new Float32Array(16);
	var projMatrix = new Float32Array(16);

	// get matrix identity
	mat4.identity(worldMatrix);
	// mat4.lookAt(out, Position of the viewer, Point the viewer is looking at, up axis)
	mat4.lookAt(viewMatrix, [0, 0, -5], [0, 0, 0], [0, 1, 0]);
	// out	mat4	mat4 frustum matrix will be written into
	// fovy	number	Vertical field of view in radians
	// aspect	number	Aspect ratio. typically viewport width/height
	// near	number	Near bound of the frustum
	// far	number	Far bound of the frustum
	mat4.perspective(projMatrix, glMatrix.toRadian(45), canvas.width/canvas.height, 0.1, 1000.0);

	// gl.uniformMatrix4fv(uniform location, should transpose?, float32array)
	gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);
	gl.uniformMatrix4fv(matViewdUniformLocation, gl.FALSE, viewMatrix);
	gl.uniformMatrix4fv(matProjdUniformLocation, gl.FALSE, projMatrix);


	var identityMatrix = new Float32Array(16);
	mat4.identity(identityMatrix);
	var angle = 0;
	// main render loop
	var loop = function() {

		// complete a rotation every 6 seconds
		angle = performance.now() / 1000 / 6 * 2 * Math.PI; 
		// rotate over Y axis
		mat4.rotate(worldMatrix, identityMatrix, angle, [0, 1, 0]); 
		// update matrix value
		gl.uniformMatrix4fv(matWorldUniformLocation, gl.FALSE, worldMatrix);

		// set the color to paint with
		gl.clearColor(0.7, 0.5, 0, 1.0);
		// clear the buffers with the color set before
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// draw triangles using the indices (of shorts); and we are not skipping any, thus the 0
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);

	
};