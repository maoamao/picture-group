  var request = new XMLHttpRequest();
  request.open('GET','http://photo-sync.herokuapp.com/photos',true);
  request.send(null);
  request.onreadystatechange = function(){
    if(request.readyState==4&&request.status==200){
          var oPic=JSON.parse(request.responseText);
          group(oPic.photos);
    }
  }

  //把所有图片的时间转化为年月日保存
  function toTime(photos){
    var aTimes=[];
    var item={};
    for(var i=0;i<photos.length;i++){
      var date = new Date(photos[i].time);
      item.year=date.getFullYear();
      item.month=date.getMonth()+1;
      item.day=date.getDate();
      aTimes.push(JSON.stringify(item));
    }
    return aTimes;
  }

  //判断出同一天的图片
  function judgeEqual(aTimes,photos){
    var j=0;
    var result={};
    for(var i=0;i<aTimes.length;i++){
      if(aTimes[i]!=aTimes[i+1]){
          toGroup(j,i,aTimes,photos,result);
          j=i+1;
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
    for(var date in result){
        var p = document.createElement('p');
        p.innerHTML=date;
        virtualDom.appendChild(p);

        var oUl = document.createElement('ul');
        oUl.className='group';

        for(var i=0;i<result[date].length;i++){
          var oImg = document.createElement('img');
          oImg.src=result[date][i].imageURL;
          setSize(oImg,result,date,i);
          var oLi = document.createElement('li');
          oLi.appendChild(oImg);
          oUl.appendChild(oLi);
        }
        virtualDom.appendChild(oUl);
    }
    document.body.appendChild(virtualDom);
  }


  //设置图片的宽高
  function setSize(oImg,result,date,i){
    var width = result[date][i].width;
    var height = result[date][i].height;
    if(width>160 || height>160){
      var scale=parseFloat(width/height);
        if(width>160){
          oImg.style.height=160/scale+'px';
          oImg.style.width=160+'px';
        }else{
          oImg.style.width=160*scale+'px';
          oImg.style.height=160+'px';
        }
    }else{
          oImg.style.width=width;
          oImg.style.height=height;
    }
  }

  function group(photos){
    var aTimes = toTime(photos);
    var result=judgeEqual(aTimes,photos);
    show(result);
  }
