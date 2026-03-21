const dado = document.getElementById("dado");
var jogador = 1;

/* Alimentando as variáveis de pergunas */
let perguntas = [];
async function carregarPerguntas(){
    for(let i = 0; i<6; i++){
        let dificuldade1Response = await fetch(`../perguntas/dificuldade${i+1}.json`);
        let dificuldade = await dificuldade1Response.json();
        perguntas.push(dificuldade);
    }
}

/* Carregando as perguntas */
document.addEventListener("DOMContentLoaded", () => {
    carregarPerguntas();
});

dado.addEventListener("click", e => {
    var numero = Math.floor(Math.random()*6)+1;
    const valorDoDado = document.getElementById("valorDoDado");
    valorDoDado.textContent = numero;

    andarPeao(jogador, numero);

    jogador++;
    if(jogador > 3){
        jogador = 1;
    }

    atualizaVez(jogador);
})

/* Lógica do jogo */
function andarPeao(jogador, valorDoDado){
    var jogadorAtual = document.querySelector(`.peao[data-jogador="${jogador}"]`);

    var valorCasaAtual = Number(jogadorAtual.dataset.casaAtual);
    valorCasaAtual += valorDoDado;

    if(valorCasaAtual > 64){
        valorCasaAtual = (valorCasaAtual-64);
    }

    var novaCasa = document.querySelector(`.casa[data-valor-da-casa="${valorCasaAtual}"]`);
    jogadorAtual.dataset.casaAtual = valorCasaAtual;
    novaCasa.appendChild(jogadorAtual);
    pergunta(novaCasa);
}

function atualizaVez(jogador){
    const vezDoJogador = document.getElementById("vezImg");
    var jogadores = ["JA", "JB", "JC"];
    vezDoJogador.src = `../images/${jogadores[jogador-1]}.png`;
}

function pergunta(novaCasa){
    const questionContainer = document.createElement("div");
    questionContainer.classList.add("question-container");

    const questionContent = document.createElement("div");
    questionContent.classList.add("question-content");

    const cor = getComputedStyle(novaCasa).backgroundColor;
    questionContent.style.backgroundColor = cor;
    questionContainer.appendChild(questionContent);

    switch(cor){
        case "rgb(0, 170, 255)": 
            criadorDePergunta(questionContainer, questionContent, 0);
            break;
        case "rgb(0, 217, 255)":
            criadorDePergunta(questionContainer, questionContent, 1);
            break;
    }
}

function criadorDePergunta(questionContainer, questionContent, dificuldade){
    let indice = Math.floor(Math.random() * perguntas[dificuldade].length);

    const especificar = document.createElement("h3");
    especificar.textContent = `Dificuldade ${dificuldade + 1}`;
    questionContent.appendChild(especificar);

    const pergunta = document.createElement("h1");
    pergunta.textContent = perguntas[dificuldade][indice].pergunta;
    pergunta.classList.add("pergunta");
    questionContent.appendChild(pergunta);

    let alternativas = perguntas[dificuldade][indice].alternativas;
    alternativas[1].correta = true;

    for (let i = 0; i<4; i++) {
        const j = Math.floor(Math.random() * 4);
        [alternativas[i], alternativas[j]] = [alternativas[j], alternativas[i]];
    }

    for(let i = 0; i<4; i++){
        let h1 = document.createElement("h1");
        h1.textContent = alternativas[i].texto;
        h1.classList.add("alternativa");
        if(!alternativas[i].correta){
            h1.id = "incorreto";
        } else {
            h1.id = "correto";
        }
        questionContent.appendChild(h1);
    }

    document.body.appendChild(questionContainer);
}