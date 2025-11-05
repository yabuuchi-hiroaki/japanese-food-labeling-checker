'use strict';

var is_tenka = {}
var tenka2alr = {}
var req1 = new XMLHttpRequest(); 
req1.open("get", "tenka.txt", true); 
req1.send(null); 	
req1.onload = function(){
  var tenka = []; 
  var tmp1 = req1.responseText.split("\n");
  for(var i=0;i<tmp1.length;++i){
    tenka[i] = tmp1[i].split('\t');
    is_tenka[ tenka[i][2] ] = 1
    tenka2alr[ tenka[i][2] ] = tenka[i][3]
  }
}

var is_food = {}
var food2alr = {}
var req2 = new XMLHttpRequest(); 
req2.open("get", "food.txt", true);
req2.send(null); 	
req2.onload = function(){
  var food = []; 
  var tmp2 = req2.responseText.split("\n"); 
  for(var i=0;i<tmp2.length;++i){
    food[i] = tmp2[i].split('\t');
    is_food[ food[i][2] ] = 1
    food2alr[ food[i][2] ] = food[i][3]
  }
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

function clickBtn(){
  let str = text1.value;
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
  var output = [];
  for(var i=0; i<100; i++) output.push(Array(7));

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
        output[k][0] = word
        if( is_tenka[word] && word != "" ){
          output[k][1] = "〇"
          output[k][4] = tenka2alr[ word ]
        }else if( is_food[word] && word != "" ){
          output[k][1] = "〇"
          output[k][4] = food2alr[ word ]
        }else{
          output[k][1] = ""
        }
        word = ""
      }
      lv = lv + 1
    }else if(s1 == '）'){
      if( lv == 0 ){
        output[k][6] = "カッコ）が正しく閉じていません"
      }
      word2 = find_allergy(word)
      if(word2 != ""){
        output[k][4] = word2
        word = ""
      }
      word2 = find_area(word)
      if(word2 != ""){
        output[k][5] = word2
        word = ""
      }
      lv = lv - 1
      if(lv == 0){
        output[k][2] = word
        if( is_tenka[word] && word != "" ){
          output[k][3] = "〇"
          output[k][4] = tenka2alr[ word ]
        }else if( is_food[word] && word != "" ){
          output[k][3] = "〇"
          output[k][4] = food2alr[ word ]
        }else{
          output[k][3] = ""
        }
        k = k + 1
        word = ""
      }else{
        word = word + s1
      }
    }else if(s1 == '、'){
      if(word != ""){
        if(lv == 0){
          output[k][0] = word
          if( is_tenka[word] ){
            output[k][1] = "〇"
            output[k][4] = tenka2alr[ word ]
          }else if( is_food[word] ){
            output[k][1] = "〇"
            output[k][4] = food2alr[ word ]
          }else{
            output[k][1] = ""
          }
          if(word == "甘味料" || word == "着色料" || word == "保存料" || word == "増粘剤" || word == "安定剤" || word == "ゲル化剤" || word == "糊料" || word == "酸化防止剤" || word == "発色剤" || word == "漂白剤" || word == "防かび剤" || word == "防ばい剤"){
            output[k][6] = "注意：用途名併記が必要"
          }
          k = k + 1
          word = ""
        }else if(lv > 0){
          word2 = find_allergy(word)
          if(word2 != ""){
            output[k][4] = word2
            word = ""
          }
          word2 = find_area(word)
          if(word2 != ""){
            output[k][5] = word2
            word = ""
          }
          output[k][2] = word
          if( is_tenka[word] ){
            output[k][3] = "〇"
            output[k][4] = tenka2alr[ word ]
          }else if( is_food[word] ){
            output[k][3] = "〇"
            output[k][4] = food2alr[ word ]
          }else{
            output[k][3] = ""
          }
          k = k + 1
          word = ""
        }
      }
    }else if(s1 =='／' && lv == 0 ){
      output[k][0] = word
      if( is_tenka[word] ){
        output[k][1] = "〇"
        output[k][4] = tenka2alr[ word ]
      }else if( is_food[word] ){
        output[k][1] = "〇"
        output[k][4] = food2alr[ word ]
      }else{
        output[k][1] = ""
      }
      output[k+1][0] = "●食品添加物"
      k = k + 2
      flag_tenka = 1
      word = ""
    }else if(s1 == '[' && lv == 0){
      output[k][0] = word
      if( is_tenka[word] ){
        output[k][1] = "〇"
        output[k][4] = tenka2alr[ word ]
      }else if( is_food[word] ){
        output[k][1] = "〇"
        output[k][4] = food2alr[ word ]
      }else{
        output[k][1] = ""
      }
      k = k + 1
      word = ""
      //tenka = 0
      flag_skip = 1
      flag_tenka = 0
    }else if(flag_skip == 0){
      word = word + s1
    }
  }
  if(word != ""){
    output[k][0] = word
    if( is_tenka[word] ){
      output[k][1] = "〇"
      output[k][4] = tenka2alr[ word ]
    }else if( is_food[word] ){
      output[k][1] = "〇"
      output[k][4] = food2alr[ word ]
    }else{
      output[k][1] = ""
    }
    if(word == "甘味料" || word == "着色料" || word == "保存料" || word == "増粘剤" || word == "安定剤" || word == "ゲル化剤" || word == "糊料" || word == "酸化防止剤" || word == "発色剤" || word == "漂白剤" || word == "防かび剤" || word == "防ばい剤"){
      output[k][6] = "注意：用途名併記が必要"
    }
  }
  if(output[0][5] == undefined){
      output[0][6] = "原産地表示の確認"
  }
  if(! output[k-1][4].includes("一部に")){
      output[k][6] = "アレルギー表示の確認"
  }

  let tableHTML = '<table border="1">';
  tableHTML += '<tr><th>名称1</th><th>リスト1</th><th>名称2</th><th>リスト2</th><th>アレルギー物質</th><th>原産地</th><th>コメント</th></tr>';
  for (let i = 0; i <= k; i++) {
    tableHTML += '<tr>';
    if(output[i][0] == '●食品添加物'){
      tableHTML += '<td colspan="7">' + output[i][0] + '</td>';
      continue
    }
    for (let j = 0; j < output[i].length - 1; j++) {
      if(output[i][j] !="" && output[i][j] != undefined){
        tableHTML += '<td>' + output[i][j] + '</td>';
      }else{
        tableHTML += '<td></td>';
      }
    }
    let j = output[i].length - 1
    if(output[i][j] != "" && output[i][j] != undefined){
      tableHTML += '<td><font color="red">' + output[i][j] + '</font></td>';
    }else{
      tableHTML += '<td></td>';
    }
    tableHTML += '</tr>';
  }
  tableHTML += '</table>';
  document.getElementById('matrix-container').innerHTML = tableHTML;
}

let checkButton = document.getElementById('checkButton');
checkButton.addEventListener('click', clickBtn);
