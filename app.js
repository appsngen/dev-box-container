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
        }
        catch(ex){
            console.log('Unable to parse local config.', ex);
            process.exit(1);
        }

        try{
            viewerConfig = JSON.parse(fs.readFileSync(viewerConfigPath));
        }
        catch(ex){
            console.log('Unable to parse viewer config.', ex);
            process.exit(1);
        }

        try{
            devboxConfig = JSON.parse(fs.readFileSync(devboxConfigPath));
        }
        catch(ex){
            console.log('Unable to parse dev box config.', ex);
            process.exit(1);
        }

        try{
            devBoxWidgets = JSON.parse(fs.readFileSync(devBoxWidgetsPath));
        }
        catch(ex) {
            console.log('Unable to parse dev box widget list config.', ex);
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
        devboxConfig.user = localConfig.user;
        viewerConfig.viewerInstanceConfiguration.portHttp = localConfig.viewerPort;
        viewerConfig.viewerInstanceConfiguration.host = localConfig.viewerHost;
        viewerConfig.viewerInstanceConfiguration.baseUrl = 'http://' + localConfig.viewerHost + ':' + localConfig.viewerPort;
        viewerConfig.user = localConfig.user;
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
            console.log(message + ' Please set another port in config file.');
            exit = true;
        }

        if(statusViewer === "open" ){
            var message = 'Port: ' + localConfig.viewerPort + ' in use.';
            console.log(message + ' Please set another port in config file.');
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