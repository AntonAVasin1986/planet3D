
var vertex = [];
var index = [];

// generate sphere
var divisions = 64;
var step = Math.PI/divisions;

for (var lat = 0; lat <= divisions; ++lat) {
    var theta = lat * step;
    var sinTheta = Math.sin(theta);
    var cosTheta = Math.cos(theta);

    for (var long = 0; long <= divisions; ++long) {
        var phi = long * 2 * step;
        var sinPhi = Math.sin(phi);
        var cosPhi = Math.cos(phi);

        var x = cosPhi * sinTheta;
        var y = sinPhi * sinTheta;
        var z = cosTheta;

        var u = long / divisions;
        var v = lat / divisions;

        // position
        vertex.push(x, y, z);
        // normal
        vertex.push(x, y, z);
        // texture
        vertex.push(u, v);

        // index
        if (lat < divisions && long < divisions) {
            var first = lat * (divisions + 1) + long;
            var second = first + divisions + 1;
            index.push(first);
            index.push(second);
            index.push(first + 1);
            index.push(second);
            index.push(second + 1);
            index.push(first + 1);
        }
    }
}



// sphere singleton object
var sphereGeometry = {
    getBufferData: function() {

        return {
            vertices: vertex, 
            indices : index
        };
    }
};

module.exports = sphereGeometry;