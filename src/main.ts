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

const raw = String.raw`
Grammar {
  Program = "민트" "초코는" "너무" "맛있어" Start "민트" "초코는" "너무" "맛있어"

  Start = Stmt

  Stmt = Stmt Etc --g
    | Etc --h

  Etc = Bye | SaySum | SayAdd | Say

  Say = names ":" SayChild+ (PrintAscii | ByeChild | PrintNumber)*
  SayChild = Adj* (negnoun | posnoun)

  SayAdd = names ":" SayAddChild+ (PrintAscii | ByeChild | PrintNumber)*
  SayAddChild = Adj* (negnoun | posnoun) ("와" | "과") Adj* (negnoun | posnoun) Add Adj2

  SaySum = names ":" SaySumChild+ (PrintAscii | ByeChild | PrintNumber)*
  SaySumChild = Adj* (negnoun | posnoun) ("와" | "과") Adj* (negnoun | posnoun) Sum Adj2

  PrintAscii = "민초" "만세" "!"?

  PrintNumber = "민초" "내놔" "!"?

  Add = "의" "합" "만큼" -- add
    | josa ("합친" | "합한") "것" "만큼" -- josaadd

  Sum = "의" ("차" "만큼" | "차이" "만큼")

  Bye = names ":" ByeChild
  ByeChild = "민초" "최고" "!"?

  josa = ("을" | "를")

  Adj = ${[...data.adj, ...data.adjend].map(a => `"${a}"`).join(' | ')}
  Adj2 = ${[...data.negadj2, ...data.posadj2].map(a => `"${a}"`).join(' | ')}

  negnoun = ${data.negnoun.map(n => `"${n}"`).join(' | ')}

  names = "민트" | "초코"

  posnoun = ${data.posnoun.map(n => `"${n}"`).join(' | ')}

  han = ("가".."힣")+
}
`
console.log(raw);
const grammar = ohm.grammar(raw);

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
  SayChild(_e3, _e4){
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
  SayAddChild(_3, _4, _5, _6, _7, _8, _9){
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
  SaySumChild(_3, _4, _5, _6, _7, _8, _9){
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

  let res = "";
  let myturn = true;
  for(let char of text){
    const code = char.charCodeAt(0);
    const binary = code.toString(2);
    let count = 1;
    res += `${myturn?me:you}: 민초 최고!\n`;
    res += `${myturn?me:you}: `
    if(binary[binary.length-1]==="1") {
      res += `${data.posnoun[Math.floor(Math.random() * data.posnoun.length)]}\n`
    }
    for(let bin = binary.length-2; bin >= 0; bin--){
      if(binary[bin] === "1"){
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
        res += `${data.posnoun[Math.floor(Math.random() * data.posnoun.length)]}\n`
      }

      count *= 2;
      // console.log(count);
    }
    myturn = !myturn;
    res += "민초 만세!\n\n";
  }
  // console.log(res)
  result.value += res;
  result.value += "민트 초코는 너무 맛있어"
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
