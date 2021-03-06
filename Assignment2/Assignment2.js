"use strict";

var canvas;
var gl;

var NumVertices  = 36;

var points = [];
var colors = [];
var transforms = [];

var xAxisRotation = 0;
var yAxisRotation = 1;
var zAxisRotation = 2;
var xNegTranslate = 3;
var xPosTranslate = 4;

var axis = 0;
var theta = [ 0, 0, 0 ];

var thetaLoc;
var uMatrixLoc;
var modelMatrix;

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var mouseRotationMatrix = mat4();

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    colorCube();

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);



    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );


    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    uMatrixLoc = gl.getUniformLocation(program, "uMatrix");

    //Listeners for mouse dragging
    window.onmousedown = function(event){
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    };
    window.onmouseup = function(event){
        mouseDown = false;
    };
    window.onmousemove = function(event){
    if (!mouseDown) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    var deltaX = newX - lastMouseX;
    mouseRotationMatrix = mult(mouseRotationMatrix, rotate((-deltaX / 10), [0, 1, 0]));

    var deltaY = newY - lastMouseY;
    mouseRotationMatrix= mult(mouseRotationMatrix, rotate((-deltaY / 10), [1, 0, 0]));

    lastMouseX = newX;
    lastMouseY = newY;
    render();
};


    //Listeners for key presses
    window.onkeydown = function(event)
    {
        var caps = event.getModifierState("CapsLock");
        var shift = event.getModifierState("Shift");
        switch(event.keyCode)
        {
            case 37:
                transforms.push(translate(vec3(-0.1,0.0,0.0)));
                render();
                break;
            case 39:
                transforms.push(translate(vec3(0.1,0.0,0.0)));
                render();
                break;
            case 38:
                transforms.push(translate(vec3(0.0,0.1,0.0)));
                render();
                break;
            case 40:
                transforms.push(translate(vec3(0.0,-0.1,0.0)));
                render();
                break;
            case 33: //PageUp
                transforms.push(translate(vec3(0.0,0.0,0.1)));
                render();
                break;
            case 34: //PageDown
                transforms.push(translate(vec3(0.0,0.0,-0.1)));
                render();
                break;
            case 82: //R
                if(caps ? !shift : shift){ //hacked XOR
                    transforms.push(rotate(4,vec3(0,1,0)));
                }
                else{
                    transforms.push(rotate(-4,vec3(0,1,0)));
                }
                render();
                break;
            case 83: //s
                if(caps ? !shift : shift){ //hacked XOR
                    transforms.push(scalem(vec3(1.1,1.1,1.1)));
                }
                else{
                    transforms.push(scalem(vec3(0.9,0.9,0.9)));
                }
                render();
                break;
            case 66: //B
                transforms = [rotateX(4.0)];
                mouseRotationMatrix = mat4();
                render();
        }
    };
    transforms.push(rotateX(4.0));
    render();
}

function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d)
{
    var vertices = [
        vec4( -0.25, -0.25,  0.25, 1.0 ),
        vec4( -0.25,  0.25,  0.25, 1.0 ),
        vec4(  0.25,  0.25,  0.25, 1.0 ),
        vec4(  0.25, -0.25,  0.25, 1.0 ),
        vec4( -0.25, -0.25, -0.25, 1.0 ),
        vec4( -0.25,  0.25, -0.25, 1.0 ),
        vec4(  0.25,  0.25, -0.25, 1.0 ),
        vec4(  0.25, -0.25, -0.25, 1.0 )
    ];

    var vertexColors = [
        [ 0.0, 0.0, 0.0, 1.0 ],  // black
        [ 1.0, 0.0, 0.0, 1.0 ],  // red
        [ 1.0, 1.0, 0.0, 1.0 ],  // yellow
        [ 0.0, 1.0, 0.0, 1.0 ],  // green
        [ 0.0, 0.0, 1.0, 1.0 ],  // blue
        [ 1.0, 0.0, 1.0, 1.0 ],  // magenta
        [ 0.0, 1.0, 1.0, 1.0 ],  // cyan
        [ 1.0, 1.0, 1.0, 1.0 ]   // white
    ];

    // We need to parition the quad into two triangles in order for
    // WebGL to be able to render it.  In this case, we create two
    // triangles from the quad indices

    //vertex color assigned by the index of the vertex

    var indices = [ a, b, c, a, c, d ];

    for ( var i = 0; i < indices.length; ++i ) {
        points.push( vertices[indices[i]] );
        //colors.push( vertexColors[indices[i]] );

        // for solid colored faces use
        colors.push(vertexColors[a]);

    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Using the MV functions ... briefly described on Pg 194

    modelMatrix = mat4();

    for (var i = transforms.length -1;i >=0 ;i--)
    {
        modelMatrix = mult(modelMatrix, transforms[i]);
    }
    modelMatrix = mult(modelMatrix, mouseRotationMatrix);

    gl.uniformMatrix4fv( uMatrixLoc, false, flatten(modelMatrix) );

    gl.drawArrays( gl.TRIANGLES, 0, NumVertices );

//    requestAnimFrame( render );
}