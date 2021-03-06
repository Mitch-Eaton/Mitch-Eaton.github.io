//Mitch Eaton
//All code for the PointerLock is from the THREE.js examples
//some code may be superfluous as I had to adapt the code for my purpose
//Skull Model courtesy of https://clara.io/view/663f6caa-74f5-4c01-8a60-54b01c26b283
//Sphere and it's animation is my own.
//Collision with walls is my own.
//Orthographic view is buggy, I can't figure out how to keep the camera inside the room.


var camera, scene, renderer;
var geometry, material, mesh;
var controls;
var theta = 0;
var sphere;
var objects = [];
var blocker = document.getElementById( 'blocker' );
var instructions = document.getElementById( 'instructions' );

var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
if ( havePointerLock ) {
    var element = document.body;
    var pointerlockchange = function ( event ) {
        if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ) {
            controlsEnabled = true;
            controls.enabled = true;
            blocker.style.display = 'none';
        } else {
            controls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
        }
    };
    var pointerlockerror = function ( event ) {
        instructions.style.display = '';
    };
    // Hook pointer lock state change events
    document.addEventListener( 'pointerlockchange', pointerlockchange, false );
    document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );
    document.addEventListener( 'pointerlockerror', pointerlockerror, false );
    document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
    document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );
    instructions.addEventListener( 'click', function ( event ) {
        instructions.style.display = 'none';
        // Ask the browser to lock the pointer
        element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        if ( /Firefox/i.test( navigator.userAgent ) ) {
            var fullscreenchange = function ( event ) {
                if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
                    document.removeEventListener( 'fullscreenchange', fullscreenchange );
                    document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                    element.requestPointerLock();
                }
            };
            document.addEventListener( 'fullscreenchange', fullscreenchange, false );
            document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
            element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
            element.requestFullscreen();
        } else {
            element.requestPointerLock();
        }
    }, false );
} else {
    instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';
}
init();
animate();
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var canJump = false;
var prevTime = performance.now();
var velocity = new THREE.Vector3();
function init() {
    camera = new THREE.CombinedCamera(window.innerWidth, window.innerHeight, 70, 1, 1000, 0, 1000);
    scene = new THREE.Scene();
    controls = new THREE.PointerLockControls( camera );
    controls.getObject().position.z = 40;
    scene.add( controls.getObject() );
    var onKeyDown = function ( event ) {
        switch ( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;
            case 37: // left
            case 65: // a
                moveLeft = true; break;
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
        }
    };
    var onKeyUp = function ( event ) {
        switch( event.keyCode ) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
            case 32: // space
                if(camera.inPerspectiveMode){
                    camera.toOrthographic();
                    camera.setZoom(10);
                }
                else {
                    camera.toPerspective();
                    camera.setZoom(1);
                }
                break;
        }
    };
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );

    //sphere
    geometry = new THREE.SphereGeometry(5, 200, 200);
    material = new THREE.MeshPhongMaterial( { color: 0xdddddd, specular: 0x009900, shininess: 30, shading: THREE.FlatShading } ) ;
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);
    sphere.position.set(15*Math.sin(theta), 13 + Math.sin(7*theta), 15*Math.cos(theta));

    //skull
    var objectLoader = new THREE.ObjectLoader();
    objectLoader.load("skull.json", function (  skull ) {
        scene.add( skull );
        skull.position.x = 0;
        skull.position.y = 6;
        skull.position.z = 0;
        skull.rotateY(Math.PI);
    } );



    //floor
    geometry = new THREE.PlaneGeometry(100, 100, 5, 5);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(- Math.PI/2));
    material = new THREE.MeshPhongMaterial({color: 0x222222});
    /**material = new THREE.ShaderMaterial( {
        uniforms: {
            time: { // float initialized to 0
                type: "f",
                value: 0.0
            }
        },
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShaderNoise' ).textContent

    } );
     **/
    var floor = new THREE.Mesh(geometry, material);
    scene.add(floor);

    //ceiling
    geometry = new THREE.PlaneGeometry(100, 100, 5, 5);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX( Math.PI/2));
    material = new THREE.MeshPhongMaterial({color: 0x2222FF});
    var ceiling = new THREE.Mesh(geometry, material);
    scene.add(ceiling);
    ceiling.position.set(0,50,0);

    //walls
    geometry = new THREE.PlaneGeometry(100, 50, 5, 5);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationY(- Math.PI/2));
    material = new THREE.MeshPhongMaterial({color: 0xFF1111, shininess: 3});
    var wall1 = new THREE.Mesh(geometry, material);
    scene.add(wall1);
    wall1.position.set(50, 25, 0);

    geometry = new THREE.PlaneGeometry(100, 50, 5, 5);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationY( Math.PI/2));
    material = new THREE.MeshPhongMaterial({color: 0x33DDDD, shininess: 3});
    var wall2 = new THREE.Mesh(geometry, material);
    scene.add(wall2);
    wall2.position.set(-50, 25, 0);

    geometry = new THREE.PlaneGeometry(100, 50, 5, 5);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationY( Math.PI));
    material = new THREE.MeshPhongMaterial({color: 0x3322DD, shininess: 3});
    var wall3 = new THREE.Mesh(geometry, material);
    scene.add(wall3);
    wall3.position.set(0, 25, 50);

    geometry = new THREE.PlaneGeometry(100, 50, 5, 5);
    material = new THREE.MeshPhongMaterial({color: 0x33DD33, shininess: 3});
    var wall4 = new THREE.Mesh(geometry, material);
    scene.add(wall4);
    wall4.position.set(0, 25, -50);


    //colorful lights
    light = new THREE.PointLight(0xFFFF00);
    light.position.set(100, 100, 0);
    scene.add(light);

    light = new THREE.PointLight(0xFF00FF);
    light.position.set(100, -100, 0);
    scene.add(light);

    light = new THREE.PointLight(0x00FFFF);
    light.position.set(-100, 100, 0);
    scene.add(light);

    light = new THREE.PointLight(0xFF0088);
    light.position.set(-100, -100, 0);
    scene.add(light);

    light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );
    //
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor( 0xffffff );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );
    //
    window.addEventListener( 'resize', onWindowResize, false );
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}
function animate() {
    requestAnimationFrame( animate );
    if ( controlsEnabled ) {
        var time = performance.now();
        var delta = ( time - prevTime ) / 1000;
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass
        if ( moveForward ) velocity.z -= 400.0 * delta;
        if ( moveBackward ) velocity.z += 400.0 * delta;
        if ( moveLeft ) velocity.x -= 400.0 * delta;
        if ( moveRight ) velocity.x += 400.0 * delta;
        controls.getObject().translateX(velocity.x * delta);
        controls.getObject().translateY( velocity.y * delta );
        controls.getObject().translateZ( velocity.z * delta );
        if ( controls.getObject().position.y < 10 ) {
            velocity.y = 0;
            controls.getObject().position.y = 10;
        }
        if ( controls.getObject().position.x > 45 ) {
            velocity.x = 0;
            controls.getObject().position.x = 45;
        }
        if ( controls.getObject().position.x < -45 ) {
            velocity.x = 0;
            controls.getObject().position.x = -45;
        }
        if ( controls.getObject().position.z > 45 ) {
            velocity.z = 0;
            controls.getObject().position.z = 45;
        }
        if ( controls.getObject().position.z < -45 ) {
            velocity.z = 0;
            controls.getObject().position.z = -45;
        }

        prevTime = time;
    }
    theta += .02;
    sphere.position.set(15*Math.sin(theta), 13 + Math.sin(7*theta), 15*Math.cos(theta));
    renderer.render( scene, camera );
}

