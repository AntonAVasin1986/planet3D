
var camera = (function(){
    function camera(position, lookAt, upVector, aspectRatio, near, far){
        var l = lookAt;
        var pos = position;
        var ar = aspectRatio;
        
        var matrix = mat4.create();
        var normalMatrix = mat3.create();
        var updateMatrix = function() {
            mat4.lookAt(matrix, pos, l, upVector);
            
            mat3.fromMat4( normalMatrix, matrix );
            mat3.invert( normalMatrix, normalMatrix );
            mat3.transpose( normalMatrix, normalMatrix);
        };
        updateMatrix();

        var projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, 45 * Math.PI / 180, ar, near, far);

        Object.defineProperties(this, {
            lookAt: {
                get: function() {
                    return l;
                },
                set: function(value) {
                    l = value;
                    updateMatrix();

                    if (this.onViewMatrixChanged) {
                        this.onViewMatrixChanged();
                    }
                }
            },
            position: {
                get: function() {
                    return pos;
                },
                set: function(value) {
                    pos = value;
                    updateMatrix();

                    if (this.onViewMatrixChanged) {
                        this.onViewMatrixChanged();
                    }
                }
            },
            aspectRatio: {
                get: function(){
                    return ar;
                },
                set: function(value){
                    ar = value;
                    mat4.perspective(projectionMatrix, 45 * Math.PI / 180, ar, near, far);

                    if (this.onProjectionMatrixChanged) {
                        this.onProjectionMatrixChanged();
                    }
                }
            }
        });

        this.getViewMatrix = function() {
            return matrix;
        };

        this.getProjectionMatrix = function() {
            return projectionMatrix;
        };

        this.getNormalMatrix = function() {
            return normalMatrix;
        };
    }

    return camera;
})();

module.exports = camera;