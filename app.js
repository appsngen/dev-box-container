(function () {
    'use strict';
    var fs = require('fs'), portscanner = require('portscanner');
    var localConfigPath = __dirname + '/config.json';
    var viewerConfigPath = __dirname + '/node_modules/appsngen-viewer/src/serverconfig.json';
    var devBoxWidgetsPath = __dirname + '/node_modules/appsngen-dev-box/widgetslist.json';
    var devboxConfigPath = __dirname  + '/node_modules/appsngen-dev-box/serverconfig.json',
        localConfig, viewerConfig, devboxConfig, devBoxWidgets;

    var readConfigs = function(){
        try{
            localConfig = JSON.parse(fs.readFileSync(localConfigPath));
            viewerConfig = JSON.parse(fs.readFileSync(viewerConfigPath));
            devboxConfig = JSON.parse(fs.readFileSync(devboxConfigPath));
            devBoxWidgets = JSON.parse(fs.readFileSync(devBoxWidgetsPath));
        }
        catch(ex){
            console.log('Unable parsed server config.');
            process.exit(1);
        }
    };

    var checkPorts = function(callback){
        portscanner.checkPortStatus(localConfig.devBoxPort, localConfig.devBoxHost, function(errorBox, statusBox) {
            portscanner.checkPortStatus(localConfig.viewerPort, localConfig.viewerHost, function(errorViewer, statusViewer) {
                callback(statusBox, statusViewer);
            });
        });
    };

    var applyConfig = function(){
        devboxConfig.viewerPort = localConfig.viewerPort;
        devboxConfig.viewerHost = localConfig.viewerHost;
        devboxConfig.devBoxPort = localConfig.devBoxPort;
        devboxConfig.devBoxHost = localConfig.devBoxHost;
        viewerConfig.user = localConfig.user;
        viewerConfig.viewerPort = localConfig.viewerPort;
        viewerConfig.viewerHost = localConfig.viewerHost;
        devBoxWidgets = localConfig.widgetsList;
    };

    var saveConfig = function(){
        fs.writeFileSync(viewerConfigPath, JSON.stringify(viewerConfig));
        fs.writeFileSync(devboxConfigPath, JSON.stringify(devboxConfig));
        fs.writeFileSync(devBoxWidgetsPath, JSON.stringify(devBoxWidgets));
    };

    readConfigs();
    
    checkPorts(function(statusBox, statusViewer){
        var exit = false;
        if(statusBox === "open" ){
            var message = 'Port: ' + localConfig.devBoxPort + ' in use.';
            console.log(message + ' Please set new port in config file.');
            exit = true;
        }
        if(statusViewer === "open" ){
            var message = 'Port: ' + localConfig.viewerPort + ' in use.';
            console.log(message + ' Please set new port in config file.');
            exit = true;
        }
        if(exit){
            process.exit(1);
        }
        applyConfig();
        saveConfig();
        require('./node_modules/appsngen-viewer/src/server');
        require('./node_modules/appsngen-dev-box/server');
    });
}());