angular.module("solarSystemApp").component("solarControl", {
    template: '<canvas class="solarCtrl">{{$ctrl.title}}</canvas>',
    controller: function solarController($scope, $element) {
        this.title = "sdsrwsd";

        var canvas = $element[0].getElementsByTagName('canvas')[0];
        var engine = new planet3DEngine(canvas);
        
    }
});