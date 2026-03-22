const dado = document.getElementById("dado");
var jogador = 1;

/* Alimentando as variáveis de pergunas */
let perguntas = [];
async function carregarPerguntas(){
    for(let i = 0; i<6; i++){
        let dificuldade1Response = await fetch(`/perguntas/dificuldade${i+1}.JSON`);
        let dificuldade = await dificuldade1Response.json();
        perguntas.push(dificuldade);
    }
}

const vidaInicial = 500;
let vidaDoMonstro = vidaInicial;
let pontosDosJogadores = [0,0,0];
let erros = 0;
let verificadorDePC = 1;
let rodadas = 0;

/* Carregando as perguntas */
document.addEventListener("DOMContentLoaded", async () => {
    await carregarPerguntas();
    carregarVida(vidaDoMonstro);
    for(let i=0; i<3; i++){
        pontuaJogador(0, i);
    }
});

dado.addEventListener("click", e => {
    var numero = Math.floor(Math.random()*6)+1;
    const valorDoDado = document.getElementById("valorDoDado");
    valorDoDado.textContent = numero;

    andarPeao(jogador, numero);
})

/* Carrega a vida do monstro */
function carregarVida(vidaDoMonstro){
    const vidaAtual = document.getElementById("vidaAtual");
    const h1 = document.createElement("h1");
    h1.textContent = vidaDoMonstro;
    h1.classList.add("vida-texto");
    vidaAtual.appendChild(h1);
    let vida = (vidaDoMonstro/vidaInicial) * 100;
    if(vida <= 0){
        resultado(1);
    }
    vidaAtual.style.width = vida + "%";
    casa1 = getComputedStyle(root).getPropertyValue("--casa1").trim();
    casa2 = getComputedStyle(root).getPropertyValue("--casa2").trim();
    casa3 = getComputedStyle(root).getPropertyValue("--casa3").trim();
    casa4 = getComputedStyle(root).getPropertyValue("--casa4").trim();
}

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
    rodadas++;
    if(rodadas >= 3){
        casaSuspresaSeisRetorno();
    }
}

function atualizaVez(jogador){
    const vezDoJogador = document.getElementById("vezImg");
    var jogadores = ["JA", "JB", "JC"];
    vezDoJogador.src = `images/${jogadores[jogador-1]}.png`;
}

function pergunta(novaCasa){
    const questionContainer = document.createElement("div");
    questionContainer.classList.add("question-container");

    const questionContent = document.createElement("div");
    const cor = getComputedStyle(novaCasa).backgroundColor;
    questionContent.style.backgroundColor = cor;
    questionContent.classList.add("question-content");

    questionContainer.appendChild(questionContent);

    switch(cor){
        case "rgb(0, 170, 255)": 
            criadorDePergunta(questionContainer, questionContent, 0, cor);
            break;
        case "rgb(0, 217, 255)":
            criadorDePergunta(questionContainer, questionContent, 1, cor);
            break;
        case "rgb(145, 255, 0)":
            criadorDePergunta(questionContainer, questionContent, 2, cor);
            break;
        case "rgb(145, 214, 0)":
            criadorDePergunta(questionContainer, questionContent, 3, cor);
            break;
        case "rgb(239, 118, 45)":
            criadorDePergunta(questionContainer, questionContent, 4, cor);
            break;
        case "rgb(239, 85, 45)":
            criadorDePergunta(questionContainer, questionContent, 5, cor);
            break;
        case "rgb(195, 0, 255)":
            casaSurpresa(questionContainer, questionContent, cor);
            break;
    }
}

function criadorDePergunta(questionContainer, questionContent, dificuldade, cor){
    let indice = Math.floor(Math.random() * perguntas[dificuldade].length);

    const especificar = document.createElement("h3");
    especificar.textContent = dificuldade+1;
    especificar.classList.add("dificuldade");
    especificar.style.borderColor = cor;
    questionContent.appendChild(especificar);

    const pergunta = document.createElement("h1");
    pergunta.textContent = perguntas[dificuldade][indice].pergunta;
    pergunta.classList.add("pergunta");
    questionContent.appendChild(pergunta);

    const pontuacao = document.createElement("h1");
    pontuacao.textContent = (dificuldade+1)*10;
    pontuacao.classList.add("pontuacao");
    pontuacao.style.borderColor = cor;
    questionContent.appendChild(pontuacao);

    const timer = document.createElement("h1");
    timer.classList.add("timer");
    timer.style.borderColor = cor;
    questionContent.appendChild(timer);
    timerFunction(timer, dificuldade, questionContainer);

    const peao = document.createElement("img");
    var jogadores = ["JA", "JB", "JC"];
    peao.src = `images/${jogadores[jogador-1]}.png`;
    peao.classList.add("jogador-atual");
    questionContent.appendChild(peao);

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
        h1.addEventListener("click", e => {
            respostaDaPergunta(e, questionContainer, (dificuldade+1)*10);
        })
        if(!alternativas[i].correta){
            h1.id = "incorreto";
        } else {
            h1.id = "correto";
        }
        questionContent.appendChild(h1);
    }

    document.body.appendChild(questionContainer);
}

function respostaDaPergunta(e, questionContainer, pontos){
    clearInterval(intervalo);
    if(e.target.id === "correto"){
        vidaDoMonstro -= pontos;
        carregarVida(vidaDoMonstro);
        questionContainer.remove();
        pontuaJogador(pontos, jogador-1);
    } else {
        const mensagem = document.createElement("h1");
        mensagem.classList.add("erro");
        document.body.appendChild(mensagem);
        mensagem.textContent = "Você errou, que pena!";
        perguntaErrada();
        setTimeout(() => {
            questionContainer.remove();
            mensagem.remove();
        }, 3000);
    }

    jogador++;
    if(jogador > 3){
        jogador = 1;
    }
    atualizaVez(jogador);
}

function pontuaJogador(pontos, jogador){
    let idJogador = ["PJA", "PJB", "PJC"];
    const jogadorAtual = document.getElementById(`${idJogador[jogador]}`);
    pontosDosJogadores[jogador] += pontos;
    // Controle para casa surpresa 2
    if(pontosDosJogadores[jogador] < 0){
        pontosDosJogadores[jogador] = 0;
    }
    jogadorAtual.style.width = (pontosDosJogadores[jogador]/vidaInicial)*100 + "%";
    jogadorAtual.innerHTML = "";

    const h1 = document.createElement("h1");
    h1.textContent = pontosDosJogadores[jogador];
    h1.classList.add("pontuacao-do-jogador");
    jogadorAtual.appendChild(h1);
}

function casaSurpresa(questionContainer, questionContent){
    let numero = Math.floor(Math.random()*5)+1;
    var mensagem = document.createElement("h1");
    mensagem.classList.add("surpresa");

    switch(numero){
        case 1:
            mensagem.textContent = "Um jogador aleatório ganha 20 pontos!";
            questionContent.appendChild(mensagem);
            casaSurpresaUm(questionContainer);
            break;
        case 2:
            mensagem.textContent = "Todos os jogadores perdem 20 pontos!";
            questionContent.appendChild(mensagem);
            casaSurpresaDois(questionContainer);
            break;
        case 3:
            mensagem.textContent = "O bug cresceu e ganhou 50 pontos!";
            questionContent.appendChild(mensagem);
            casaSurpresaTres(questionContainer);
            break;
        case 4:
            let devs = ["João Victor", "Ruan", "Formiga", "Rafael"];
            let devsPoints = [50, 20, 10, 30];
            var dev = Math.floor(Math.random()*4);

            mensagem.textContent = `${devs[dev]} corrigiu um pouco o bug, e ele perdeu ${devsPoints[dev]} pontos!`;
            questionContent.appendChild(mensagem);
            casaSurpresaQuatro(questionContainer, devsPoints[dev]);
            break;
        case 5:
            mensagem.textContent = "Formiga derrubou café em um computador, você perdeu um PC";
            questionContent.appendChild(mensagem);
            casaSurpresaCinco(questionContainer, 1);
            break;
        case 6:
            mensagem.textContent = "Rafael se estressou e deixou tudo mais difícil por 3 rodadas!";
            questionContent.appendChild(mensagem);
            casaSurpresaSeis(questionContainer);
            break;
    }

    jogador++;
    if(jogador > 3){
        jogador = 1;
    }
    atualizaVez(jogador);

    document.body.appendChild(questionContainer);
}

function casaSurpresaUm(questionContainer){
    let numero = Math.floor(Math.random()*3);
    pontuaJogador(20, numero);

    setTimeout(() => {
        questionContainer.remove();
    }, 3000);
};

function casaSurpresaDois(questionContainer){
    for(let i=0; i<3; i++){
        pontuaJogador(-20, i);
    }

    setTimeout(() => {
        questionContainer.remove();
    }, 3000);
}

function casaSurpresaTres(questionContainer){
    vidaDoMonstro += 50;
    if(vidaDoMonstro > 300){
        vidaDoMonstro = 300;
    }
    carregarVida(vidaDoMonstro);

    setTimeout(() => {
        questionContainer.remove();
    }, 3000);
}

function casaSurpresaQuatro(questionContainer, pontos){
    vidaDoMonstro -= pontos;
    if(vidaDoMonstro > vidaInicial){
        vidaDoMonstro = vidaInicial;
    }
    carregarVida(vidaDoMonstro);

    setTimeout(() => {
        questionContainer.remove();
    }, 3000);
}

function casaSurpresaCinco(questionContainer, problema){
    perguntaErrada(1);
    setTimeout(() => {
        questionContainer.remove();
    }, 3000); 
}

/* Definição das casas */
const root = document.documentElement;

let casa1;
let casa2;
let casa3;
let casa4;

function casaSurpresaSeis(questionContainer){
    rodadas = 0;
    document.documentElement.style.setProperty("--casa1", "rgb(239, 118, 45)");
    document.documentElement.style.setProperty("--casa2", "rgb(239, 85, 45)");
    document.documentElement.style.setProperty("--casa3", "rgb(239, 118, 45)");
    document.documentElement.style.setProperty("--casa4", "rgb(239, 85, 45)");

    setTimeout(() => {
        questionContainer.remove();
    }, 3000); 
}

function casaSuspresaSeisRetorno(){
    document.documentElement.style.setProperty("--casa1", casa1);
    document.documentElement.style.setProperty("--casa2", casa2);
    document.documentElement.style.setProperty("--casa3", casa3);
    document.documentElement.style.setProperty("--casa4", casa4);
}

function perguntaErrada(problema){
    erros++;
    const bug = document.getElementById("bug");
    if(erros == 2 || problema == 1){
        erros = 0;

        const bug = document.getElementById("bug");
        setTimeout(() => {
            let posicaoAtual = parseInt(getComputedStyle(bug).left) || 0;
            bug.style.left = (posicaoAtual + 65) + "px";
        }, 3000);
        
        const pc = document.getElementById(`pc${verificadorDePC}`);
        if(pc){
            pc.remove();
            verificadorDePC++;
        }else{
            resultado(0);
        }
    }
}

// Timer
let intervalo;
function timerFunction(timer, dificuldade, questionContainer){
    tempo = 15*(dificuldade+1);
    verificador = 0;
    timer.textContent = tempo;
    intervalo = setInterval(() => {
        tempo = tempo-1;
        timer.textContent = tempo;
        if(tempo < 10 && verificador == 0){
            timer.classList.add("urgente");
            verificador = 1;
        }
        if(tempo == 0){
            clearInterval(intervalo);
            jogador++;
            if(jogador > 3){
                jogador = 1;
            }
            atualizaVez(jogador);
            questionContainer.remove();
        }
    }, 1000);
}

// Resultado do jogo
function resultado(resultado){
    if(resultado == 0){
        const h1 = document.createElement("h1");
        h1.textContent = "Você perdeu, que pena!";
        h1.classList.add("resultado");
        document.body.appendChild(h1);
    }else{
        const h1 = document.createElement("h1");
        h1.textContent = "Você venceu, parabéns!";
        h1.classList.add("resultado");
        document.body.appendChild(h1);
    }
}
