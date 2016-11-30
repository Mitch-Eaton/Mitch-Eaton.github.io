"use strict";

var gl;
var points;
var program;

window.onload = function init(){
    var canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" );
    }
    // Four Vertices

    //  Configure WebGL

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 0.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    program.vertexPositionAttribute = gl.getAttribLocation(program, "vPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.vertexColorAttribute = gl.getAttribLocation(program, "aVertexColor");
    gl.enableVertexAttribArray(program.vertexColorAttribute);

    thetaLoc = gl.getUniformLocation(program, "theta");

    // Load the data into the GPU.

    render();
};

var triangleVertexPositionBuffer;
var squareVertexPositionBuffer;
var circleVertexPositionBuffer;
var triangleVertexColorBuffer;
var squareVertexColorBuffer;
var circleVertexColorBuffer;
var vertices;
var colors;
var theta = 0.0;
var thetaLoc;
var speed = 100;

function drawTriangle() {


    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);

    vertices = [
        -0.7 + .1* Math.cos(theta), -0.5 + .1* Math.sin(theta),  0.0,
        -0.9 + .1* Math.cos(theta), -0.9 + .1* Math.sin(theta),  0.0,
        -0.5 + .1* Math.cos(theta), -0.9 + .1* Math.sin(theta),  0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 3;

    triangleVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    colors = [
        1.0, 0.0, 0.0, 1.0,
        0.0, 1.0, 0.0, 1.0,
        0.0, 0.0, 1.0, 1.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    triangleVertexColorBuffer.itemSize = 4;
    triangleVertexColorBuffer.numItems = 3;

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    gl.vertexAttribPointer(program.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);


}

function drawSquares(size, center) {
    for(var i = size; i>=1; i--){
        var j = .35*i/size;
        squareVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        var squareTheta = theta *.4;
        vertices = [
            center[0] +j * Math.cos(squareTheta), center[1] +j * Math.cos(squareTheta), 0.0,
            center[0] -j * Math.cos(squareTheta), center[1] +j * Math.cos(squareTheta), 0.0,
            center[0] +j * Math.cos(squareTheta), center[1] -j * Math.cos(squareTheta), 0.0,
            center[0] -j * Math.cos(squareTheta), center[1] -j * Math.cos(squareTheta), 0.0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        squareVertexPositionBuffer.itemSize = 3;
        squareVertexPositionBuffer.numItems = 4;

        squareVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        colors = [];
        if(i%2===1) {
            for (var k = 0; k < 4; k++) {
                colors = colors.concat([0, 0, 0, 1.0]);
            }
        }
            else{
            for (var k = 0; k < 4; k++) {
                colors = colors.concat([0, 2*j+.3, 0, 1]);
            }

        }
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        squareVertexColorBuffer.itemSize = 4;
        squareVertexColorBuffer.numItems = 4;
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
        gl.vertexAttribPointer(program.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
        gl.vertexAttribPointer(program.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);
    }
}

function drawCircle(center){
        circleVertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);

    vertices = [
        center[0], center[1], 0.0,
        center[0], center[1] +.3, 0.0,
    ];
    var twoPi = 2*3.14159265358979;
    for(var i = twoPi/4; i <= 1.25*twoPi ; i+=twoPi/120){
        vertices.push(center[0] + .3*Math.cos(i), center[1] + .3*Math.sin(i),0);
    }

        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        circleVertexPositionBuffer.itemSize = 3;
        circleVertexPositionBuffer.numItems = (122 + 15*theta)%122;

        circleVertexColorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexColorBuffer);
        colors = [];
            for (var k = 0; k < 122; k++) {
                var l = (k + 122*(.5*theta))%122;
                if(l<=61)colors = colors.concat([l/61, 0, 0, 1.0]);
                else colors = colors.concat([(2-(l/61)), 0, 0, 1.0]);
            }

        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        circleVertexColorBuffer.itemSize = 4;
        circleVertexColorBuffer.numItems = 4;
        gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
        gl.vertexAttribPointer(program.vertexPositionAttribute, circleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexColorBuffer);
        gl.vertexAttribPointer(program.vertexColorAttribute, circleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, circleVertexPositionBuffer.numItems);

}

function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );

    drawTriangle();
    drawSquares(20,vec2(-0.1,-0.1));
    drawCircle(vec2(0.6,0.6));
    theta += 0.1;
    //gl.uniform1f(thetaLoc, theta);
    setTimeout(
        function () {requestAnimFrame( render );},
        speed
    );
}