const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHTML = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

// Função que gera o prompt de acordo com o jogo selecionado
    const gerarPromptPorJogo = (game, question) => {
    const dataAtual = new Date().toLocaleDateString()

    if (game === "valorant") {
        return `
        ## Especialidade
        Você é um treinador e estrategista especializado em Valorant.

        ## Tarefa
        Forneça dicas e estratégias práticas com base na pergunta do usuário. Isso pode incluir:
        - Estratégias de ataque ou defesa por mapa
        - Dicas de agentes específicos
        - Coordenação de equipe
        - Posições e movimentação
        - Uso inteligente de habilidades e economia

        ## Regras
        - A resposta deve ser direta e útil, sem introduções.
        - Não inclua informações sobre atualizações ou patches.
        - Não invente mecânicas ou funções que não existem.
        - Responda em português do Brasil, de forma clara.
        - Use markdown com tópicos.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não
        está relacionada ao jogo.'

        ## Exemplo de resposta
        **Dicas e Estratégias para jogar de Jett**

        ### Posicionamento
        Use a alta mobilidade da Jett para pegar ângulos agressivos e reposicionar-se rapidamente após atirar.

        ### Ultimate
        A ultimate é excelente para rounds eco. Busque picks individuais.

        ---
        Aqui está a pergunta do usuário: ${question}
    `
    } else if (game === "csgo") {
        return `
        ## Especialidade
        Você é um jogador experiente e treinador tático de CS:GO.

        ## Tarefa
        Responda com estratégias, dicas de jogabilidade e táticas para o jogo CS:GO.

        ## Regras
        - Não inclua introduções ou justificativas longas.
        - Responda em português do Brasil, de forma clara e concisa.
        - Use markdown com tópicos como Posicionamento, Economia, Utilitários.
        - Dê dicas práticas que funcionem em jogos competitivos ou casuais.
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar
        uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não
        está relacionada ao jogo.'

        ## Exemplo de resposta
        **Dicas para jogar de CT no mapa Mirage**

        ### Posicionamento
        Mantenha controle da caverna A com uma smoke inicial. Use ângulos cruzados com o jogador do jungle.

        ### Economia
        Se estiver com pouco dinheiro, compre pistola e colete leve e tente setups de stack.

        ---
        Aqui está a pergunta do usuário: ${question}
    `
    } else if(game === "lol") {
        // Prompt padrão (LoL ou outros MOBA)
        return `
        ## Especialidade
        Você é um especialista assistente de meta para o jogo ${game}

        ## Tarefa
        Você deve responder as perguntas do usuário com base no seu conhecimento
        do jogo, estratégias, build e dicas.

        ## Regras
        - Se você não sabe a resposta, responda com 'Não sei' e não tente inventar
        uma resposta.
        - Se a pergunta não está relacionada ao jogo, responda com 'Essa pergunta não
        está relacionada ao jogo.'
        - Use informações válidas até a data ${dataAtual}.
        - Faça pesquisas atualizadas sobre o patch atual, baseado na data atual, para
        dar uma resposta coerente.
        - Nunca responda itens, runas ou estratégias que você não tenha certeza de que existe no patch atual.

        ## Resposta
        - Economize na resposta, vá direto ao ponto, sem explicações introdutórias
        - Responda usando tópicos e subtópicos e com no máximo 500 caracteres.
        - Use markdown para organizar a resposta
        - Não precisa fazer nenhuma saudação ou despedida, apenas responda o que o
        usuário está querendo.
        - Forneça a resposta com as informações em português e baseadas no Brasil.

        ## Exemplo de resposta
        Pergunta do usuário: Melhor build para rengar jungle.
        Resposta: **Build mais atual (patch 14.13) para Rengar Jungle**

        ### Itens iniciais
        - **Poção de vida x1**
        - **Cria de Andabrisas**
        - **Sentinela Invisível**

        ### Botas
        - Botas Ionianas da Lucidez

        ### Runas
        ** Primária (Dominação):**
        - Eletrocutar
        - Impacto Repentino
        - Globos Oculares
        - Caça Incansável

        ** Secundária (Precisão):**
        - Triunfo
        - Golpe de Misericórdia

        **Shards:**
        - Velociade de ataque
        - Força adapdativa
        - Armadura

        ---
        Aqui está a pergunta do usuário: ${question}
    `
    }
}
const perguntarIA = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const pergunta = gerarPromptPorJogo(game, question)

    const contents = [{
        role : "user",
        parts: [{
            text: pergunta
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    //chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const enviarFormulario = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if(apiKey == '' || game == '' || question == "") {
        alert('Por favor, preencha todos os campos.')
        return
    }
    
    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        const text = await perguntarIA(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHTML(text)
        aiResponse.classList.remove('hidden')
    } catch(error) {
        console.log('Erro: ', error)
    } finally {
        askButton.disabled = false
        askButton.textContent = "Perguntar"
        askButton.classList.remove('loading')
    }
}
form.addEventListener('submit', enviarFormulario)
