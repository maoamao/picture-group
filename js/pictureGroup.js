  function startAjax(url){
    //创建一个XML对象
    var request;
    if(window.XMLHttpRequest){
        request = new XMLHttpRequest(); //IE7+,Firefox,Chrome,Opera,Safari
    }else{
        request = new ActiveXObject("Microsoft.XMLHTTP");
    }

    //发送请求
    request.open('GET',url,true);
    request.send(null);

    //获取数据
    request.onreadystatechange = function(){
      if(request.readyState == 4 && request.status == 200){
            var oPic = JSON.parse(request.responseText);
            group(oPic.photos);
            roll(oPic.nextURL);
      }
    }
  }

//第一次发起Ajax请求
  startAjax('http://photo-sync.herokuapp.com/photos');

  //把所有图片的时间转化为年月日保存
  function toTime(photos){
    var aTimes = [];
    var item = {};

    //把图片的数字时间转换为Date对象，然后获取年月日
    for(var i = 0;i<photos.length;i++){
      var date = new Date(photos[i].time);
      item.year = date.getFullYear();
      item.month = date.getMonth()+1;
      item.day = date.getDate();
      aTimes.push(JSON.stringify(item));
    }
    return aTimes;
  }

  //判断出同一天的图片
  function judgeEqual(aTimes,photos){

    //j为同一天的区间起点，i为区间结束
    var j = 0;
    var result = {};

    //寻找同一天的区间，并创建分组
    for(var i = 0;i<aTimes.length;i++){
      if(aTimes[i] != aTimes[i+1]){
          toGroup(j,i,aTimes,photos,result);
          j = i+1;
      }
    }
    return result;
  }

  //根据之前找出的同一天的区间进行分组
  function toGroup(i,j,aTimes,photos,result){
    var date = JSON.parse(aTimes[i]);
    var str = date.year+'-'+date.month+'-'+date.day;
    result[str] = photos.slice(i,j+1);
  }

  //将分组好的图片展示在页面上
  function show(result){

  //创建一个文档碎片节点
    var virtualDom = document.createDocumentFragment();

  //遍历对象中的每一天
    for(var date in result){
        var p = document.createElement('p');
        p.innerHTML = date;
        virtualDom.appendChild(p);

        var oUl = document.createElement('ul');
        oUl.className = 'group';

        //遍历每一天中的所有图片，创建容器将它们添加到页面中
        for(var i = 0;i<result[date].length;i++){
          var oImg = document.createElement('img');
          oImg.src = result[date][i].imageURL;

          //为当前图片设置合适的宽高
          setSize(oImg,result,date,i);

          var oLi = document.createElement('li');
          oLi.appendChild(oImg);
          oUl.appendChild(oLi);
        }
        //将每一天的图片添加进虚拟节点
        virtualDom.appendChild(oUl);
    }
    //最后将虚拟节点中所有的内容添加进body
    document.body.appendChild(virtualDom);
  }


  //设置图片的宽高
  function setSize(oImg,result,date,i){

    //获取图片本来的宽高
    var width = result[date][i].width;
    var height = result[date][i].height;

    //宽或高大于160的，按原比例缩小
    if(width>160 || height>160){

      //获取原来的宽高比
      var scale = parseFloat(width/height);

        if(width > 160){  //宽>160
          oImg.style.height = 160/scale+'px';
          oImg.style.width = 160+'px';
        }else{ //高>160
          oImg.style.width = 160*scale+'px';
          oImg.style.height = 160+'px';
        }
    }else{ //宽高都没超过界限时按原来的设置
          oImg.style.width = width;
          oImg.style.height = height;
    }
  }


  //分组主函数
  function group(photos){
    var aTimes = toTime(photos);
    var result = judgeEqual(aTimes,photos);
    show(result);
  }

//无限滚动加载
function roll(nexturl){
  var aUl=document.getElementsByTagName('ul');

  //监听滚动条的滚动
  window.onscroll=function(){
    var result=check(aUl);
    if(result){
      oPic=startAjax(nexturl);
    }
  };
}

//判断是否达到要求高度
function check(aUl){
  //获取滚动条的高度
  var scrollT=document.body.scrollTop||document.documentElement.scrollTop;
  var standard=scrollT+document.documentElement.clientHeight;
  
  //获取最后一行一半高度处距离文档顶部的距离并判断是否符合加载高度
  var lastUl=aUl[aUl.length-1].offsetTop+Math.floor(aUl[aUl.length-1].offsetHeight/2);
  return(lastUl<standard?true:false);
}
