'use strict';

var is_food = {}
var food2alr = {}
var req2 = new XMLHttpRequest()

req2.open("get", "food.txt", true)
req2.send(null)
req2.onload = function(){
  var food = []
  var tmp2 = req2.responseText.split("\n")
  for(var i=0;i<tmp2.length;++i){
    food[i] = tmp2[i].split('\t');
    is_food[ food[i][2] ] = food[i][0]
    food2alr[ food[i][2] ] = food[i][3]
  }
}

function compareFunc(a, b) {
  return a - b;
}

function uniq(array) {
  return array.filter((elem, index, self) => self.indexOf(elem) === index);
}

function find_allergy(in_kakko){
  var word2 = ""
  var regexp1 = "を含む"
  var regexp2 = "由来"
  if(in_kakko.includes(regexp1)){
    word2 = in_kakko.replace(regexp1, "")
  }else if(in_kakko.includes(regexp2)){
    word2 = in_kakko.replace(regexp2, "")
  }
  return word2
}

function find_area(in_kakko){
  var word2 = ""
  var regexp1 = "製造"
  var regexp2 = "産"
  if(in_kakko.includes(regexp1)){
    word2 = in_kakko.replace(regexp1, "")
  }else if(in_kakko.includes(regexp2)){
    word2 = in_kakko.replace(regexp2, "")
  }
  return word2
}

function zen2han(str) {
    return str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

var req3 = new XMLHttpRequest()
var tmp3 = []
req3.open("get", "sp_mat", true)
req3.send(null)
req3.onload = function(){
  tmp3 = req3.responseText.split(/\r\n|\n/)
}

function clickBtn(){
  let str = zen2han(text1.value);
  str = str.replace('(', '（');
  str = str.replace(')', '）');
  str = str.replace('/', '／');
  let s = str.split('')
  let s1 = ""
  let word = ""
  let word2 = ""
  let k = 0
  let flag_skip = 0
  let flag_tenka = 0
  let lv = 0
  var ids = [];

  for(var i=0;i<s.length;i++){
    s1 = s[i]
    if(s1 == ']'){
      flag_skip = 0
      continue
    }
    if(flag_skip == 1){
      continue
    }
    if( s1 == '（'){
      if( lv > 0){
        word = word + s1
      }else{
        if( is_food[word] && word != "" ){
          ids.push( is_food[word] )
        }
        word = ""
      }
      lv = lv + 1
    }else if(s1 == '）'){
      word2 = find_allergy(word)
      if(word2 != ""){
        word = ""
      }
      word2 = find_area(word)
      if(word2 != ""){
        word = ""
      }
      lv = lv - 1
      if(lv == 0){
        if( is_food[word] && word != "" ){
          ids.push( is_food[word] )
        }
        k = k + 1
        word = ""
      }else{
        word = word + s1
      }
    }else if(s1 == '、'){
      if(word != ""){
        if(lv == 0){
          if( is_food[word] ){
            ids.push( is_food[word] )
          }
          k = k + 1
          word = ""
        }else if(lv > 0){
          word2 = find_allergy(word)
          if(word2 != ""){
            word = ""
          }
          word2 = find_area(word)
          if(word2 != ""){
            word = ""
          }
          if( is_food[word] ){
            ids.push( is_food[word] )
          }
          k = k + 1
          word = ""
        }
      }
    }else if(s1 == '／' && lv == 0 ){
      if( is_food[word] ){
        ids.push( is_food[word] )
      }
      k = k + 1
      flag_tenka = 1
      word = ""
    }else if(s1 == '[' && lv == 0){
      if( is_food[word] ){
        ids.push( is_food[word] )
      }
      k = k + 1
      word = ""
      flag_skip = 1
      flag_tenka = 0
    }else if(flag_skip == 0){
      word = word + s1
    }
  }
  if(word != ""){
    if( is_food[word] ){
      ids.push( is_food[word] )
    }
  }

  let tot = ids.length * (ids.length + 1) / 2
  var idrank = {}
  for (let i = 0; i < ids.length; i++) {
    let r = (ids.length - i) / tot
    if(idrank[ ids[i] ]){
      idrank[ ids[i] ] += r
    } else{
      idrank[ ids[i] ] = r
    }
  }
  //ids.sort(compareFunc);
  //ids = uniq(ids)

  // ### cosine similarity search ###
  var output = [];
  for(var i=0; i<100; i++) output.push(Array(3));
  let hit = -1
  let xx = 0
  
  for (let key in idrank) {
    xx += (idrank[key] ** 2)
  }

  let tableHTML = '<table border="1">'
  let id_sp_mat = []
  for(i=0; i<tmp3.length-1; ++i){
    id_sp_mat = tmp3[i].split('\t')
    let sp = id_sp_mat[1].split(' ')
    let xy = 0
    let yy = 0
    let cos = 0
    let y = []
    for(let j=0;j<sp.length;++j){
      y = sp[j].split(/:/)
      yy += (y[1] ** 2)
      if( idrank[ y[0] ]){
        xy += (idrank[ y[0] ] * y[1])
      }
    }
    if( xx * yy > 0){
      cos = xy / (Math.sqrt(xx) * Math.sqrt(yy))
    }
    if( cos >= 0.7 ){
      hit++
      output[hit][0] = id_sp_mat[3]
      output[hit][1] = id_sp_mat[2]
      output[hit][2] = Math.round(cos*100) / 100
    }
  }
  output.sort((a, b) => b[2] - a[2]);

  tableHTML += '<thead><tr><th>名称</th><th>原材料名</th><th>類似度</th></tr></thead><tbody>'
  for (let h = 0; h <= hit; h++) {
    tableHTML += '<tr><td>' + output[h][0] + '</td><td>' + output[h][1] + '</td><td>' + output[h][2] + '</td></tr>'
  }
  tableHTML += '</tbody></table>'
  document.getElementById('matrix-container').innerHTML = tableHTML;
}

let checkButton = document.getElementById('checkButton');
checkButton.addEventListener('click', clickBtn);
