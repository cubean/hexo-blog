var exec = require('child_process').exec;

// Hexo 3 用户复制这段
hexo.on('new', function(data){
    exec('open -a "/opt/MacDown.app" ' + data.path);
});
