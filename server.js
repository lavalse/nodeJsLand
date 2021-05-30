const http = require("http");
const fs = require("fs");
const template = require("art-template");

const wwwPath = "./www"
const port = 3000;
const ip = "127.0.0.1";

const server = http.createServer((req,res)=>{
  const url = req.url;
  const path = wwwPath + url;

  console.log(url)

  const timeConvert = (date) => {
    const Y = date.getFullYear() + '-';
    const M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
    const D = date.getDate() + ' ';
    const h = date.getHours() + ':';
    const m = date.getMinutes() + ':';
    const s = date.getSeconds(); 
    return Y+M+D+h+m+s;
  }

  fs.access(path,(err)=>{
    if(err){
      res.end("404-files not exited");
    }else{
      const stats = fs.statSync(path);

      /**
       * Directory situation
       */
      if(stats.isDirectory()){

        fs.readdir(wwwPath+url,(err,files)=>{
          const filesList=[];
          const indexObject={
            url:wwwPath+url,
            isEmpty:true,
            list:[]
          };

          if(err){
            console.log(err);
            return
          }

          if(files.length>0){
            indexObject.isEmpty=false;
            files.forEach((e,i)=>{
              const stats = fs.statSync(wwwPath+url+"/"+e);
  
              filesList[i] = {name:e};
              filesList[i].size = Math.ceil(parseInt(stats.size)/1024);
              filesList[i].mtime = timeConvert(stats.mtime);
              filesList[i].path = `http://${ip}:${port}${url}/${e}`;
              if(stats.isDirectory()){
                filesList[i].isFolder = true;
              }else{
                filesList[i].isFolder = false;
              };
            });
          }else(
            indexObject.isEmpty=true
          );

          indexObject.list = [...filesList];

          const html = template(__dirname+"/static/index.html",indexObject);
          res.statusCode=200;
          res.setHeader("Content-Type","text/html");
          res.end(html);
        })
      }
  
      /**
       * File situation
       */
      else if(stats.isFile()){
        fs.readFile(wwwPath+url,(err,data)=>{
          if(err){
            res.statusCode=500;
            res.setHeader("Content-Type","text/plain");
            res.end("Sorry, internal error");
          }else{
            res.end(data);
          }
        })
      }
    }
  })
});

server.listen(port,ip,()=>{
  console.log(`Server is running at http://${ip}:${port}`);
});
