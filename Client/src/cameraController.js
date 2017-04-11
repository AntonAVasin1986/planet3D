
var cameraController = (function(){
    var radian = Math.PI/180;
    function cameraController(camera, canvas) {

        this.camera = camera;
        var _this = this;
        canvas.addEventListener('mousemove', function(args) {
            
            if (args.buttons === 1) {

                var xAngle = 0;//args.movementY * radian;
                var zAngle = args.movementX * radian;

                _this.rotate(xAngle, zAngle);

                //args.cancelBubble = true;
                args.preventDefault();
            }
        }, false);

        canvas.addEventListener('mousewheel', function(args) {

            _this.zoom(args.wheelDelta * 0.01);

            args.preventDefault();
        }, false);
    }

    cameraController.prototype.rotate = function(xAngle, zAngle) {
        var v = vec3.create();
        vec3.subtract(v, this.camera.position, this.camera.lookAt);

        var q = quat.create();
        quat.rotateZ(q, q, -zAngle);
        vec3.transformQuat(v,v,q);

        q = quat.create();
        quat.rotateX(q, q, -xAngle);
        vec3.transformQuat(v,v,q);

        var newPos = vec3.create();
        vec3.add(newPos, this.camera.lookAt, v);
        //vec3.scaleAndAdd(newPos, this.camera.lookAt, v, l);
        this.camera.position = newPos;
    };

    cameraController.prototype.zoom = function(delta) {
        var v = vec3.create();
        vec3.subtract(v, this.camera.position, this.camera.lookAt);

        //vec3.scale(v, v, delta);
        vec3.scale(v, v, 1 + delta);

        var newPos = vec3.create();
        vec3.add(newPos, this.camera.lookAt, v);

        this.camera.position = newPos;
    };

    return cameraController;
})();

module.exports = cameraController;