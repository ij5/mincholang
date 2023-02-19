import './style.css'
import ClipboardJS from 'clipboard';
import ohm from 'ohm-js';
import { hello } from './examples';
import data from './data.json';

const title = <HTMLHeadingElement>document.getElementById('title');
const code = <HTMLTextAreaElement>document.getElementById('code');
const result = <HTMLTextAreaElement>document.getElementById('result');
let compiler = true;

const compileButton = <HTMLButtonElement>document.getElementById('compile');

const grammar = ohm.grammar(String.raw`
Grammar {
  Program = "민트" "초코는" "너무" "맛있어" Start "민트" "초코는" "너무" "맛있어"

  Start = Stmt

  Stmt = Stmt Etc --g
    | Etc --h

  Etc = Bye | SaySum | SayAdd | Say

  Say = names ":" SayChild+ (PrintAscii | ByeChild | PrintNumber)*
  SayChild = "정말"? (Negadj | Posadj)* (negnoun | posnoun) ("이야" | "야" | "구나" | "이구나" | "같아" | "같구나")

  SayAdd = names ":" SayAddChild+ (PrintAscii | ByeChild | PrintNumber)*
  SayAddChild = "정말"? (Negadj | Posadj)* (negnoun | posnoun) ("와" | "과") (Negadj | Posadj)* (negnoun | posnoun) Add (Negadj2 | Posadj2)

  SaySum = names ":" SaySumChild+ (PrintAscii | ByeChild | PrintNumber)*
  SaySumChild = "정말"? (Negadj | Posadj)* (negnoun | posnoun) ("와" | "과") (Negadj | Posadj)* (negnoun | posnoun) Sum (Negadj2 | Posadj2)

  PrintAscii = "민트" "초코를" ("싫어해" | "증오해")

  PrintNumber = "민트" "초코를" ("사랑해" | "좋아해")

  Add = "의" "합" "만큼" -- add
    | josa ("합친" | "합한") "것" "만큼" -- josaadd

  Sum = "의" ("차" "만큼" | "차이" "만큼")

  Bye = names ":" ByeChild
  ByeChild = "민초" "최고" ("." | "!")

  josa = ("을" | "를")

  Negadj = Negadj_sub
    | "멍청하고" 
    | "멍청한"
    | "뚱뚱하고" 
    | "뚱뚱한"
    | "낡고" 
    | "낡은"
    | "못생겼고" 
    | "못생긴"

  Negadj_sub = "머저리" "같고"
    | "머저리" "같은"
    | "먼지" "투성이에"
    | "먼지" "투성이인"
    | "바보" "같고"
    | "바보" "같은"

  Negadj2 = "멍청하구나" | "멍청해"
    | "낡았구나" | "낡았어"
    | "못생겼구나" | "못생겼어"
    | Negadj2_sub

  Negadj2_sub = "겁이" "많아"
    | "겁이" "많구나"
    | "바보" "같구나"
    | "바보" "같아"
    | "머저리" "같구나"
    | "머저리" "같아"

  Posadj = "착하고" | "착한"
    | "아름답고" | "아름다운"
    | "잘생겼고" | "잘생긴"
    | "용감하고" | "용감한"
    | "멋지고" | "멋진"
    | "따뜻하고" | "따뜻한"
    | "사랑스럽고" | "사랑스러운"

  Posadj2 = "착하구나" | "착해"
    | "아름답구나" | "아름다워"
    | "잘생겼구나" | "잘생겼어"
    | "용감하구나" | "용감해"
    | "멋지구나" | "멋져"
    | "따뜻하구나" | "따뜻해"
    | "사랑스럽구나" | "사랑스러워"

  negnoun = "겁쟁이" | "돼지" | "거짓말쟁이" | "생쥐" | "물집"

  names = "민트" | "초코"

  posnoun = "영웅" | "천사" | "사과" | "희망" | "여름날" | "코" | "도둑놈"

  han = ("가".."힣")+
}
`);

let ctx = {
  you: 0,
  me: 0,
  yourname: '',
  myname: '',
  cur: '',
};

let variable:any = {};

const s = grammar.createSemantics();

s.addOperation('eval', {
  Program(_e1, _e2, _e3, _e4, e5, _e6, _e7, _e8, _e9){
    // console.log(e6.eval());
    e5.eval();
  },
  Start(e1){
    variable["민트"] = 0;
    variable["초코"] = 0;
    ctx.myname = "민트";
    ctx.yourname = "초코";
    // console.log(ctx);
    e1.eval();
  },
  Stmt(e){
    e.eval();
  },
  Stmt_h(e1){
    e1.eval();
  },
  Stmt_g(e1, _e2){
    e1.eval();
    _e2.eval();
  },
  Say(e1, _e2, e3, _e4){
    if(e1.sourceString === ctx.yourname){
      ctx.cur = ctx.myname;
      for(let value of e3.children) variable[ctx.myname] += value.eval();
    }else if(e1.sourceString === ctx.myname){
      ctx.cur = ctx.yourname;
      for(let value of e3.children) variable[ctx.yourname] += value.eval();
    }else{
      result.value = ("이름이 존재하지 않습니다.");
    }
    for(let value of _e4.children){
      if(value.ctorName === "ByeChild"){
        variable[ctx.cur] = 0;
      }else if(value.ctorName === "PrintAscii"){
        value.eval();
      }else if(value.ctorName === "PrintNumber"){
        value.eval();
      }
    }
    // console.log(variable);
  },
  SayChild(_e2, _e3, _e4, _e5){
    let n1 = 0;
    if(_e4.ctorName === "negnoun"){
      n1 -= 1;
      for(let _ of _e3.children) n1 *= 2;
    }else if(_e4.ctorName === "posnoun"){
      n1 += 1;
      for(let _ of _e3.children) n1 *= 2;
    }else{
      result.value = ("Unexpected noun name.");
    }
    return n1;
  },
  SayAdd(_e1, _e2, _e3, _e4){
    if(_e1.sourceString === ctx.yourname){
      ctx.cur = ctx.myname;
      for(let value of _e3.children) variable[ctx.myname] += value.eval();
    }else if(_e1.sourceString === ctx.myname){
      ctx.cur = ctx.yourname;
      for(let value of _e3.children) variable[ctx.yourname] += value.eval();
    }else{
      result.value = ("이름이 존재하지 않습니다.");
    }
    for(let value of _e4.children){
      if(value.ctorName === "ByeChild"){
        variable[ctx.cur] = 0;
      }else if(value.ctorName === "PrintAscii"){
        value.eval();
      }else if(value.ctorName === "PrintNumber"){
        value.eval();
      }
    }
    // console.log(variable);
  },
  SayAddChild(_2, _3, _4, _5, _6, _7, _8, _9){
    let n1 = 0;
    if(_4.ctorName === "negnoun"){
      n1 -= 1;
      for(let _ of _3.children) n1 *= 2;
    }else if(_4.ctorName === "posnoun"){
      n1 += 1;
      for(let _ of _3.children) n1 *= 2;
    }else{
      result.value = "Unexpected noun name.";
    }
    let n2 = 0;
    if(_7.ctorName === "negnoun"){
      n2 -= 1;
      for(let _ of _6.children) n2 *= 2;
    }else if(_7.ctorName === "posnoun"){
      n2 += 1;
      for(let _ of _6.children) n2 *= 2;
    }else{
      result.value = "Unexpected noun name.";
    }
    let n = 0;
    if(_9.ctorName === "Negadj2"){
      n = -(n1 + n2)
    }else if(_9.ctorName === "Posadj2"){
      n = (n1 + n2)
    }
    return n;
  },
  SaySum(_e1, _e2, _e3, _e4){
    if(_e1.sourceString === ctx.yourname){
      ctx.cur = ctx.myname;
      for(let value of _e3.children) variable[ctx.myname] += value.eval();
    }else if(_e1.sourceString === ctx.myname){
      ctx.cur = ctx.yourname;
      for(let value of _e3.children) variable[ctx.yourname] += value.eval();
    }else{
      result.value = ("이름이 존재하지 않습니다.");
    }
    for(let value of _e4.children){
      if(value.ctorName === "ByeChild"){
        variable[ctx.cur] = 0;
      }else if(value.ctorName === "PrintAscii"){
        value.eval();
      }else if(value.ctorName === "PrintNumber"){
        value.eval();
      }
    }
    // console.log(variable);
  },
  SaySumChild(_2, _3, _4, _5, _6, _7, _8, _9){
    let n1 = 0;
    if(_4.ctorName === "negnoun"){
      n1 -= 1;
      for(let _ of _3.children) n1 *= 2;
    }else if(_4.ctorName === "posnoun"){
      n1 += 1;
      for(let _ of  _3.children) n1 *= 2;
    }else{
      result.value = "Unexpected noun name.";
    }
    let n2 = 0;
    if(_7.ctorName === "negnoun"){
      n2 -= 1;
      for(let _ of  _6.children) n2 *= 2;
    }else if(_7.ctorName === "posnoun"){
      n2 += 1;
      for(let _ of _6.children) n2 *= 2;
    }else{
      result.value = "Unexpected noun name.";
    }
    let n = 0;
    if(_9.ctorName === "Negadj2"){
      n = -(n1 - n2)
    }else if(_9.ctorName === "Posadj2"){
      n = (n1 - n2);
    }
    return n;
  },
  PrintAscii(_1, _2, _3){
    result.value += String.fromCharCode(variable[ctx.cur]);
  },
  Bye(_1, _2, _3){
    if(_1.sourceString === ctx.yourname){
      variable[ctx.myname] = 0;
    }else if(_1.sourceString === ctx.myname){
      variable[ctx.yourname] = 0;
    }
  },
  Etc(_1){
    _1.eval();
  },
  PrintNumber(_1, _2, _3){
    result.value += variable[ctx.cur].toString();
  }
});

compileButton?.addEventListener('click', ()=>{
  if(compiler){
    const m = grammar.match(code.value);
    if(m.succeeded()){
      result.value = "";
      const adapter = s(m);
      adapter.eval();
    }else{
      result.value = m.message!;
    }
  }else{
    translate(code.value);
  }
});


function translate(text: string){
  result.value = "";
  result.value += "민트 초코는 너무 맛있어\n\n";
  let me = "민트";
  let you = "초코";
  text = text.replace(/\[[가-힣]+\]/g, "").replace(/\n\n/g, "");

  result.value += me + ".\n그녀의 이름은 " + you + ".\n\n";

  let res = "";
  let myturn = true;
  for(let char of text){
    const code = char.charCodeAt(0);
    const binary = code.toString(2);
    let count = 1;
    res += `${myturn?me:you}: 우리 헤어지자.\n`;
    res += `${myturn?me:you}: `
    if(binary[binary.length-1]==="1") {
      res += `너는${Math.floor(Math.random() * 2)===1?" 정말":""} `;
      res += `${data.posnoun[Math.floor(Math.random() * data.posnoun.length)]}. \n`
    }
    for(let bin = binary.length-2; bin >= 0; bin--){
      if(binary[bin] === "1"){
        res += `너는${Math.floor(Math.random() * 2)===1?" 정말":""} `
        for(let _i = 1; _i<=count; _i*=2){
          // console.log("i", _i)
          let item;
          if(_i===count){
            item = data.adjend[Math.floor(Math.random() * data.adjend.length)];
          }else{
            item = data.adj[Math.floor(Math.random() * data.adj.length)];
          }
          res += `${item} `;
        }
        res += `${data.posnoun[Math.floor(Math.random() * data.posnoun.length)]}. \n`
      }

      count *= 2;
      // console.log(count);
    }
    myturn = !myturn;
    res += "대답을 해봐.\n\n";
  }
  // console.log(res)
  result.value += res;
  result.value += "\a민트 초코는 너무 맛있어"
}

new ClipboardJS('#copy');

const select = <HTMLSelectElement>document.getElementById('select');
select?.addEventListener('change', (e)=>{
  let selected: string = (e.target as any)?.value;
  if(selected === "") code.value = "";
  if(selected === "hello") code.value = hello;
});

const translateButton = <HTMLButtonElement>document.getElementById('translate');

translateButton?.addEventListener('click', ()=>{
  if(compiler){
    compiler = !compiler;
    title.textContent = "Sumlang Translator";
    code.placeholder = "코드로 변환할 텍스트를 입력하세요.";
    code.value = "";
    result.value = "이곳에 번역된 코드가 나타납니다.";
    compileButton.textContent = "번역 ->";
  }else{
    compiler = !compiler;
    title.textContent = "Sumlang Compiler";
    code.placeholder = "컴파일할 코드를 입력하세요.";
    code.value = "";
    result.value = "이곳에 실행 결과가 나타납니다.";
    compileButton.textContent = "컴파일 ->";
  }
});
