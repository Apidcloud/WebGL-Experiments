var vertexShaderText = 
[
	'precision mediump float;', // set float point precision to medium. Not as high quality but faster
	'attribute vec3 vertPosition;', // set entry attribute for position
	'attribute vec2 vertTexCoordinate;', // set entry attribute for texture coordinates
	'uniform mat4 mWorld;', // uniforms are still attributes, but do not change per vertex
	'uniform mat4 mView;',
	'uniform mat4 mProj;',
	'varying vec2 fragTexCoordinate;', // create a varying to pass the data to the fragment shader
	'void main()',
	'{',
	'	fragTexCoordinate = vertTexCoordinate;', // set varying as the entry value of vertColor
					   // x and y, z and w
					  // in opengl, multiplication is done in reverse order. vec4 is multiplicated by mWorld, then by mView and finally by mProj
	'	gl_Position = mProj * mView * mWorld * vec4(vertPosition, 1.0);', // webgl position is a vector 4, but we are only sending a vector 3.
	'}'
].join('\n');


var fragmentShaderText = 
[
	'precision mediump float;',
	'',
	'varying vec2 fragTexCoordinate;', // receive the texture coordinate from the vertex shader
	'uniform sampler2D sampler;', // sampler . refered to as TEXTURE0
	'void main()',
	'{',
		// we are setting the color as a texture2D(which texture are we using and its coordinate)
	'	gl_FragColor = texture2D(sampler, fragTexCoordinate);',
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
	[ // X, Y, Z           U, V
		// Top
		-1.0, 1.0, -1.0,   0, 0,
		-1.0, 1.0, 1.0,    0, 1,
		1.0, 1.0, 1.0,     1, 1,
		1.0, 1.0, -1.0,    1, 0,

		// Left
		-1.0, 1.0, 1.0,    0, 0,
		-1.0, -1.0, 1.0,   1, 0,
		-1.0, -1.0, -1.0,  1, 1,
		-1.0, 1.0, -1.0,   0, 1,

		// Right
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,   0, 1,
		1.0, -1.0, -1.0,  0, 0,
		1.0, 1.0, -1.0,   1, 0,

		// Front
		1.0, 1.0, 1.0,    1, 1,
		1.0, -1.0, 1.0,    1, 0,
		-1.0, -1.0, 1.0,    0, 0,
		-1.0, 1.0, 1.0,    0, 1,

		// Back
		1.0, 1.0, -1.0,    0, 0,
		1.0, -1.0, -1.0,    0, 1,
		-1.0, -1.0, -1.0,    1, 1,
		-1.0, 1.0, -1.0,    1, 0,

		// Bottom
		-1.0, -1.0, -1.0,   1, 1,
		-1.0, -1.0, 1.0,    1, 0,
		1.0, -1.0, 1.0,     0, 0,
		1.0, -1.0, -1.0,    0, 1,
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
	var texCoordAttribLocation = gl.getAttribLocation(program, 'vertTexCoordinate');

	// tell GPU how it should read the data from the array
	gl.vertexAttribPointer(
		positionAttribLocation, // Attribute location
		3, // number of elements per attribute. (x,y,z) in this case
		gl.FLOAT, // type of elements
		gl.FALSE, // normalized
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex (2 float values for xy and 3 more for color = 5)
		0 // offset from the beginning of a single vertex to this attribute
	);

	// tell GPU how it should read the data from the array
	gl.vertexAttribPointer(
		texCoordAttribLocation, // Attribute location
		2, // number of elements per attribute. (r,g, b) in this case
		gl.FLOAT, // type of elements
		gl.FALSE, // normalized
		5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex (2 float values for xy and 3 more for color = 5)
		3 * Float32Array.BYTES_PER_ELEMENT // offset from the beginning of a single vertex to this attribute (color starts at the 3th value, so the offset is 2)
	);

	// use the position attribute
	gl.enableVertexAttribArray(positionAttribLocation);
	// use the texture coordinate attribute
	gl.enableVertexAttribArray(texCoordAttribLocation);

	// create texture
	var boxTexture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, boxTexture);
	// set texture parameters
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	// set image to texture 
	gl.texImage2D(
		gl.TEXTURE_2D, // target
		0, // level of detail
		gl.RGBA, // color components in the texture
		gl.RGBA, // format of texel data (same as the previous in WebGL 1)
		gl.UNSIGNED_BYTE, // data type of the texel data; in this case, 8 bits per color channel
		document.getElementById('crate-image') // image
	);
	// unbind
	gl.bindTexture(gl.TEXTURE_2D, null);

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

		// bind texture
		gl.bindTexture(gl.TEXTURE_2D, boxTexture);
		gl.activeTexture(gl.TEXTURE0); // first texture from the fragment shader (sampler). If we had another sampler, it would be named TEXTURE1

		// draw triangles using the indices (of shorts); and we are not skipping any, thus the 0
		gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);

		requestAnimationFrame(loop);
	};
	requestAnimationFrame(loop);

	
};