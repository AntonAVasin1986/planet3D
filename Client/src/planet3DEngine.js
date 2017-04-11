planet = require('./planet');
sphereGeometry = require('./sphereGeometry');
camera = require('./camera');
cameraController = require('./cameraController');

planet_vertex_shader = require('../../glsl-loader!./shaders/planet-vertex.glsl');
planet_fragment_shader = require('../../glsl-loader!./shaders/planet-fragment.glsl');

(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

planet3DEngine = (function(){
    
    function planet3DEngine(canvas){
        this.gl = canvas.getContext('webgl') || canvas.getContext('experimantal-webgl');
        if (!this.gl) {
            console.error("WebGL context is not supported");
        }
        this.gl.enable(this.gl.DEPTH_TEST);

        this.planets = []; 
        

        this.gl.clearColor(0.0,0.0,0.0,1.0);
        this.createShaders();

        var geometryData = sphereGeometry.getBufferData();
        this.planetGeometry = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.planetGeometry);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(geometryData.vertices), this.gl.STATIC_DRAW);
        this.planetGeometry.length = geometryData.indices.length;

        this.planetGeometryIndices = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.planetGeometryIndices);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(geometryData.indices), this.gl.STATIC_DRAW);   

        this.createScene();
        this.prepare();
        this.render();
    }

    planet3DEngine.prototype.createShaders = function() {
        this.planetProgram = this.gl.createProgram();

        var planetVertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        this.gl.shaderSource(planetVertexShader, planet_vertex_shader);
        this.gl.compileShader(planetVertexShader);
        if (!this.gl.getShaderParameter(planetVertexShader, this.gl.COMPILE_STATUS)){
            console.error(this.gl.getShaderInfoLog(planetVertexShader));
        }

        var planetFragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
        this.gl.shaderSource(planetFragmentShader, planet_fragment_shader);
        this.gl.compileShader(planetFragmentShader);
        if (!this.gl.getShaderParameter(planetFragmentShader, this.gl.COMPILE_STATUS)){
            console.error(this.gl.getShaderInfoLog(planetFragmentShader));
        }

        this.gl.attachShader(this.planetProgram, planetVertexShader);
        this.gl.attachShader(this.planetProgram, planetFragmentShader);

        this.gl.linkProgram(this.planetProgram);
        if (!this.gl.getProgramParameter(this.planetProgram, this.gl.LINK_STATUS)) {
            console.error("Can't link program");
        }

        this.gl.useProgram(this.planetProgram);

        this.planetProgram.aPosition = this.gl.getAttribLocation(this.planetProgram, 'aPosition');
        this.gl.enableVertexAttribArray( this.planetProgram.aPosition );
        this.planetProgram.aNormal = this.gl.getAttribLocation(this.planetProgram, 'aNormal');
        this.gl.enableVertexAttribArray( this.planetProgram.aNormal );

        this.planetProgram.aTexture = this.gl.getAttribLocation(this.planetProgram, 'aTexture');
        this.gl.enableVertexAttribArray( this.planetProgram.aTexture );

        this.planetProgram.uViewMatrix = this.gl.getUniformLocation(this.planetProgram, 'uViewMatrix');
        this.planetProgram.uProjectionMatrix = this.gl.getUniformLocation(this.planetProgram, 'uProjectionMatrix');
        this.planetProgram.uObjectMatrix = this.gl.getUniformLocation(this.planetProgram, 'uObjectMatrix');
        this.planetProgram.uNormalMatrix = this.gl.getUniformLocation(this.planetProgram, 'uNormalMatrix');
        this.planetProgram.uObjectNormalMatrix = this.gl.getUniformLocation(this.planetProgram, 'uObjectNormalMatrix');
        this.planetProgram.uTexture = this.gl.getUniformLocation(this.planetProgram, 'uTexture');

        this.planetProgram.uColor = this.gl.getUniformLocation(this.planetProgram, 'uColor');
    }

    planet3DEngine.prototype.createScene = function() {
        // create the camera
        var ar = this.gl.canvas.clientWidth / this.gl.canvas.clientHeight;

        this.camera = new camera(
            [0,-3,0],
            [0,0,0],
            [0,0,1],
            ar,
            0.001,
            10000
        );

        var _this = this;
        this.camera.onViewMatrixChanged = function() {
            _this.gl.uniformMatrix4fv(_this.planetProgram.uViewMatrix, false, _this.camera.getViewMatrix());
            _this.gl.uniformMatrix3fv(_this.planetProgram.uNormalMatrix, false, _this.camera.getNormalMatrix());
        }

        this.camera.onProjectionMatrixChanged = function() {
            _this.gl.uniformMatrix4fv(_this.planetProgram.uProjectionMatrix, false, _this.camera.getProjectionMatrix());
        }

        this.cameraController = new cameraController(this.camera, this.gl.canvas);

        this.planets.push(
            new planet({
                diameter : 1,
                distance : 0
            })
        );

        this.environmentSphere = new planet({
            diameter : 5000,
            distance : 0
        });

        mat3.scale(this.environmentSphere.normalMatrix, this.environmentSphere.normalMatrix, [-1,-1]);

    };

    planet3DEngine.prototype.prepare = function() {
        this.gl.uniformMatrix4fv(this.planetProgram.uViewMatrix, false, this.camera.getViewMatrix());
        this.gl.uniformMatrix4fv(this.planetProgram.uProjectionMatrix, false, this.camera.getProjectionMatrix());
        this.gl.uniformMatrix3fv(this.planetProgram.uNormalMatrix, false, this.camera.getNormalMatrix());

        this.gl.vertexAttribPointer(this.planetProgram.aPosition, 3, this.gl.FLOAT, true, 32, 0);
        this.gl.vertexAttribPointer(this.planetProgram.aNormal, 3, this.gl.FLOAT, true, 32, 12);
        this.gl.vertexAttribPointer(this.planetProgram.aTexture, 2, this.gl.FLOAT, true, 32, 24);

        var _this = this;
        var initTexture = function(slotNumber, imagePath) {
            
            var image = new Image();
            image.onload = function() {
                _this.gl.activeTexture( _this.gl.TEXTURE0 + slotNumber );
                var texture = _this.gl.createTexture();
                _this.gl.bindTexture(_this.gl.TEXTURE_2D, texture);
                _this.gl.texImage2D(_this.gl.TEXTURE_2D, 0, _this.gl.RGBA, _this.gl.RGBA, _this.gl.UNSIGNED_BYTE, this);
                _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_MAG_FILTER, _this.gl.NEAREST);
                _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_MIN_FILTER, _this.gl.NEAREST);
                _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_WRAP_S, _this.gl.CLAMP_TO_EDGE);
                _this.gl.texParameteri(_this.gl.TEXTURE_2D, _this.gl.TEXTURE_WRAP_T, _this.gl.CLAMP_TO_EDGE);
            };

            image.src = imagePath;
        };

        initTexture(0, '../textures/env.jpg');
        initTexture(1, '../textures/earth.jpg');

        //this.gl.uniform1i( this.planetProgram.uTexture, 0 );
    };


    planet3DEngine.prototype.createTexture = function(size, slot) {
		var gl = this.gl;

		var texture = gl.createTexture();
		//set the texture to the third slot
        gl.activeTexture( gl.TEXTURE0 + 3 );
        gl.bindTexture( gl.TEXTURE_2D, texture );

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, size.offsetWidth, size.offsetHeight, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
		
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		return texture;
	};

	planet3DEngine.prototype.createFramebuffer = function(size, useAlpha) {
		var _this = this,
			gl = _this.gl,
			webGL = _this.webGL;
		var buffer = gl.createFramebuffer();
		var texture = _this.createTexture(size, useAlpha);
		var depthBuffer = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // Bind the object to target
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size.offsetWidth, size.offsetHeight);
		gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
		var e = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (gl.FRAMEBUFFER_COMPLETE !== e) {
			console.log('Frame buffer object is incomplete: ' + e.toString());
		}
		// Unbind the buffer object
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		webGL.bindTextureToActiveSlot( null );
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		return {
			texture: texture,
			buffer: buffer,
			renderBuffer: depthBuffer,
			size: size
		};
	};

    planet3DEngine.prototype.render = function() {

        //this.gl.viewport(0,0,this.gl.canvas.clientWidth * window.devicePixelRatio, this.gl.canvas.clientHeight * window.devicePixelRatio);
        
        if (this.gl.canvas.width !== this.gl.canvas.clientWidth || this.gl.canvas.height !== this.gl.canvas.clientHeight){
            this.gl.canvas.width = this.gl.canvas.clientWidth;
            this.gl.canvas.height = this.gl.canvas.clientHeight;
            this.gl.viewport(0,0,this.gl.canvas.width, this.gl.canvas.height);
        }

        var ar = this.gl.canvas.width / this.gl.canvas.height;
        if (this.camera.aspectRatio !== ar)
            this.camera.aspectRatio = ar;

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        // environment
        this.gl.uniformMatrix4fv(this.planetProgram.uObjectMatrix, false, this.environmentSphere.matrix);
        this.gl.uniformMatrix3fv(this.planetProgram.uObjectNormalMatrix, false, this.environmentSphere.normalMatrix);

        this.gl.uniform3fv(this.planetProgram.uColor, vec3.fromValues(1,0,0));
        this.gl.uniform1i( this.planetProgram.uTexture, 0 );

        this.gl.drawElements( this.gl.TRIANGLES, this.planetGeometry.length, this.gl.UNSIGNED_SHORT, 0);

        for (var i=0; i < this.planets.length; ++i) {
            var planet = this.planets[i];
            this.gl.uniformMatrix4fv(this.planetProgram.uObjectMatrix, false, planet.matrix);
            this.gl.uniformMatrix3fv(this.planetProgram.uObjectNormalMatrix, false, planet.normalMatrix);
            this.gl.uniform1i( this.planetProgram.uTexture, i+1 );
            //this.gl.uniform3fv(this.planetProgram.uColor, planet.material.color);

            this.gl.drawElements( this.gl.TRIANGLES, this.planetGeometry.length, this.gl.UNSIGNED_SHORT, 0);
        }
        

        var _this = this;
        requestAnimationFrame(function() {
            _this.render();
        });
    };

    return planet3DEngine;
})();

