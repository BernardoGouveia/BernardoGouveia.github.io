const passa = document.querySelector("#passa");

function mouseHover() {
   passa.textContent = "1.Obrigado por passares!!!";
}

function mouseOut() {
   passa.textContent = "1.Passa por aqui!!!";
}

passa.onmouseover = () => mouseHover();

passa.onmouseout = () => mouseOut();


const pinta = document.querySelector("#pinta-p");

document.querySelectorAll("button.color").forEach((e) => {
   e.onclick = () => {
      pinta.style.color = e.dataset.color;
   };
})


const inputColorir = document.querySelector("#colorir");
const cores = ["red", "blue", "green"];
let interador = 0;

colorir = function () {
   inputColorir.style.backgroundColor = cores[interador];
   interador = (interador + 1) % cores.length;
}

inputColorir.onkeyup = colorir;


document.querySelector('select').onchange = function () {
   document.querySelector('body').style.backgroundColor = this.value;
}


const botao = document.querySelector("#contar");

const contagem = document.querySelector("#contagem");

if (!localStorage.getItem('counter')) {
   localStorage.setItem('counter', 0);
}

botao.onclick = function () {
   let counter = localStorage.getItem('counter');
   counter++;
   contagem.textContent = counter;
   localStorage.setItem('counter', counter);
}

contagem.textContent = localStorage.getItem('counter');

const inputNome = document.querySelector("#nome");
const inputIdade = document.querySelector("#idade");
const botaoBio = document.querySelector("#submeterBio");
const textBio = document.querySelector("#textBio");

document.querySelector('form').onsubmit = (e) => {

   e.preventDefault(); // para não recarregar a página
   textBio.textContent = "Olá, o " + inputNome.value + " tem " + inputIdade.value + "!";
};


const contagemReal = document.querySelector("#counterReal");
let counterReal = 0;

function counterFunctionReal() {
   counterReal++;
   contagemReal.textContent = counterReal;
}

setInterval(counterFunctionReal, 1000);