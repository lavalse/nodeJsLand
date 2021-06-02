const http = require("http");
const fs = require("fs");
const template = require("art-template");

const wwwPath = "./www"
const port = 3000;
const ip = "127.0.0.1";

const timeConvert = (date) => {
  const Y = date.getFullYear() + '-';
  const M = (date.getMonth()+1 < 10 ? '0'+(date.getMonth()+1) : date.getMonth()+1) + '-';
  const D = date.getDate() + ' ';
  const h = date.getHours() + ':';
  const m = date.getMinutes() + ':';
  const s = date.getSeconds(); 
  return Y+M+D+h+m+s;
};

const sendResquence = (path,statusCode,response) =>{
  fs.readFile(path,(err,data)=>{
    if(err){
      response.statusCode=404;
      response.setHeader("Content-Type","text/html");
      response.end("Sorry, internal error");
    }else{
      response.statusCode=statusCode;
      response.setHeader("Content-Type","text/html");
      response.end(data);
    }
  })
}

const sendFolderTemple = (path,response) =>{
  fs.readdir(path,(err,files)=>{
    if(err){
      sendResquence(`views/404.html`,404,response);
    }else{

      const filesList = [];
      const object = {};
      object.url = path;
      object.isEmpty = false;
      object.list = filesList;

      if(files.length===0){
        object.isEmpty = true;

      }else if(files.length>0){
        
        files.forEach((e,i)=>{
          const status = fs.statSync(`${path}${e}`);
          filesList[i]={name:e};
          filesList[i].size = Math.ceil(parseInt(status.size)/1024);
          filesList[i].mtime = timeConvert(status.mtime);

          if(status.isDirectory()){
            filesList[i].isFolder = true;
            filesList[i].path = `${e}/`;
          }else{
            filesList[i].isFolder = false;
            filesList[i].path = `${e}`;
          }
        })
        object.list = filesList;
      };
      const html = template(__dirname+"/views/index.html", object);
      response.statusCode=200;
      response.setHeader("Content-Type","text/html");
      response.end(html);
    }
  })
};

const server = http.createServer((req,res)=>{
  const url = req.url;

  /**
   * index
   */
  if(url==="/"){
    sendFolderTemple(`${wwwPath}${url}`,res);
    return;
  }

  /**
   * Public source
   */
  if(url.indexOf("/public/")===0){
    fs.readFile(`.${url}`,(err,data)=>{
      if(err){
        sendResquence(`./views/404.html`,404,res);
      }else{
        res.end(data);
      }
    });
    return;
  }

  /**
   * Folder situation
   */
  if(url.endsWith("/")){
    sendFolderTemple(`${wwwPath}${url}`,res);
    return;
  }

  /**
   * File situation
   */
  // sendResquence(`${wwwPath}${url}`,200,res);
  fs.readFile(`${wwwPath}${url}`,(err,data)=>{
    if(err){
      sendResquence(`./views/404.html`,404,res);
    }else{
      res.end(data);
    }
  });
});

server.listen(process.env.PORT);
