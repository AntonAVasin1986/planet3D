
var planet = (function(){
    
    function planet(params){
        this.diameter = 1;
        this.distance = 3;
        this.textureId = 0;
        this.isGlowing = false;

        if (params) {
            this.diameter = params.diameter !== undefined ? params.diameter : this.diameter;
            this.distance = params.distance !== undefined ? params.distance : this.distance;
            this.textureId = params.textureId !== undefined ? params.textureId : this.textureId;
            this.isGlowing = params.isGlowing !== undefined ? params.isGlowing : this.isGlowing;
        }

        this.matrix = mat4.create();

        mat4.scale(this.matrix, this.matrix, [this.diameter, this.diameter, this.diameter]);

        if (this.distance !== 0)
            mat4.translate(this.matrix, this.matrix, [this.distance, 0, 0]);

        this.normalMatrix = mat3.create();
        mat3.fromMat4( this.normalMatrix, this.matrix );
        mat3.invert( this.normalMatrix, this.normalMatrix );
        mat3.transpose( this.normalMatrix,this.normalMatrix );
    }

    return planet;
})();

module.exports = planet;