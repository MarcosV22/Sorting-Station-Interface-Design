# 12 — Pedagogia, Rastreabilidade Acadêmica e Rigor Científico

> **Documento canônico:** Mapeamento epistemológico entre mecânicas de jogo e conceitos de ciência da computação, fundamentação pedagógica e diretrizes para a elaboração de artigo acadêmico do **Sorting Station**.  
> **Status:** Ativo / Base de Verdade da Wiki  
> **Data:** 08/09/2026  
> **Dependências:** [`AGENTS.md`](../../AGENTS.md), [`CLAUDE.md`](../../CLAUDE.md), [`00-repository-inventory.md`](./00-repository-inventory.md), [`01-product-vision.md`](./01-product-vision.md), [`04-sorting-engine.md`](./04-sorting-engine.md), [`10-roadmap.md`](./10-roadmap.md).

---

## 1. Fundamentação Epistemológica e Níveis de Afirmação

Para garantir total conformidade com a ética em pesquisa acadêmica e a integridade de publicações científicas, este documento estabelece uma distinção metodológica estrita entre cinco categorias conceituais:

1. **Intenção Pedagógica:** O conceito computacional exato que a mecânica de jogo foi concebida para transmitir (o *objetivo de aprendizagem*).
2. **Implementação Observável:** O comportamento real e verificável presente no código-fonte atual do repositório ([`00-repository-inventory.md`](./00-repository-inventory.md)).
3. **Hipótese / Proposta:** A conjectura pedagógica teórica formulada pelos autores sobre os potenciais efeitos cognitivos da intervenção (ex.: redução da carga cognitiva, retenção de invariantes de laço).
4. **Avaliação Futura:** O protocolo experimental empírico que deverá ser desenhado e executado para testar as hipóteses científicas (ex.: testes pré e pós-intervenção com estudantes).
5. **Resultado Comprovado:** Conclusões sustentadas por dados quantitativos ou qualitativos reais. **Atualmente, o projeto possui ZERO resultados comprovados**, uma vez que nenhuma avaliação empírica foi coletada ou registrada no repositório.

---

## 2. Rastreabilidade entre Conceitos Computacionais e Mecânicas de Jogo

```mermaid
graph LR
    subgraph Teoria_Computacional ["Conceitos de Algoritmos"]
        C1["Comparação A[j] > A[j+1]"]
        C2["Permuta Física (Swap)"]
        C3["Invariante de Vizinhança"]
        C4["Passadas Sucessivas (Laço Externo)"]
        C5["Convergência e Posição Definitiva"]
        C6["Sintaxe Formal do Pseudocódigo"]
    end

    subgraph Mecanicas_Jogo ["Mecânicas do Sorting Station"]
        M1["Seleção de Duas Caixas Adjacentes"]
        M2["Animação Parabólica e Troca de Posição"]
        M3["Restrição Física: Caixas Contíguas na Esteira"]
        M4["Ciclos de Varredura da Esquerda para Direita"]
        M5["Badge 'OK' / Selo Definitivo 'LOCKED'"]
        M6["Painel de Pseudocódigo e Feedback Imediato"]
    end

    C1 <--> M1
    C2 <--> M2
    C3 <--> M3
    C4 <--> M4
    C5 <--> M5
    C6 <--> M6
```

---

### 2.1. Comparação de Elementos ($C(n)$)
- **Conceito Teórico:** A operação fundamental de tomada de decisão onde a ordem relativa entre dois valores $A[j]$ e $A[j+1]$ é avaliada. Determina a complexidade de tempo dos algoritmos de comparação ($\Omega(n \log n)$ no caso geral, $O(n^2)$ nos algoritmos elementares).
- **Intenção Pedagógica:** Fazer o aluno perceber que comparar elementos consome recursos computacionais finitos e que mesmo comparações que não resultam em troca possuem custo operacional.
- **Implementação Observável:** Em [`src/screens/GameScreen.tsx`](../../src/screens/GameScreen.tsx), toda seleção válida de um par vizinho incrementa o contador `comparisons`, exibido no [`StatsPanel`](../../src/components/StatsPanel.tsx).
- **Hipótese:** A visualização contínua do contador de comparações desmistifica a ilusão de que ordenar é apenas "arrastar para o lugar", evidenciando o esforço analítico da máquina.
- **Avaliação Futura:** Questionar os alunos após o jogo sobre qual operação é mais frequente no Bubble Sort (comparações vs. trocas).

---

### 2.2. Ação de Troca / Permuta ($M(n)$)
- **Conceito Teórico:** A modificação do estado da memória transferindo o conteúdo de duas posições do vetor: `temp = A[j]; A[j] = A[j+1]; A[j+1] = temp`.
- **Intenção Pedagógica:** Materializar o custo físico de movimentação de dados em memória e diferenciar elementos na ordem correta daqueles fora de ordem.
- **Implementação Observável:** Em [`GameScreen.tsx`](../../src/screens/GameScreen.tsx), a troca só ocorre quando $A[\text{left}] > A[\text{right}]$, disparando animação de translação horizontal por $500\text{ms}$ e incrementando `swaps`.
- **Hipótese:** A necessidade de aguardar a troca visual e ver o contador de trocas avançar associa a permutação a uma operação custosa de escrita em memória.
- **Avaliação Futura:** Medir o entendimento do estudante sobre o melhor caso ($0$ trocas) versus pior caso ($\frac{n(n-1)}{2}$ trocas).

---

### 2.3. Vizinhança e Adjacência no Bubble Sort
- **Conceito Teórico:** O Bubble Sort restringe todas as suas comparações e permutas a **elementos contíguos** ($j$ e $j+1$). Ele não tem "visão global" do vetor.
- **Intenção Pedagógica:** Ensinar o conceito de algoritmo puramente local, onde a ordem global emerge unicamente de decisões tomadas em nível microscópico (vizinho imediato).
- **Implementação Observável:** Em [`GameScreen.tsx`](../../src/screens/GameScreen.tsx), a regra `Math.abs(selected - index) !== 1` bloqueia seleções não adjacentes.
- **Dívida Pedagógica Atual:** O protótipo atual permite escolher *qualquer* par vizinho em qualquer ordem, descaracterizando a varredura linear do algoritmo ([`04-sorting-engine.md`](./04-sorting-engine.md)).
- **Proposta P0:** A introdução da FSM travará o foco no par mandatória da passada, garantindo aderência rigorosa ao laço interno `for j = 0 to n - 2 - i`.

---

### 2.4. Passadas Sucessivas e o Laço Externo ($i$)
- **Conceito Teórico:** Uma única varredura pelo vetor não garante a ordenação completa; são necessárias até $n-1$ passadas para que todas as inversões sejam resolvidas.
- **Intenção Pedagógica:** Ilustrar a necessidade de laços aninhados (*nested loops*) e demonstrar por que o algoritmo possui complexidade quadrática no caso médio.
- **Implementação Observável:** Ausente no protótipo atual (não há controle explícito de passadas, apenas verificação global de `isSorted(boxes)`).
- **Proposta P0:** Implementar o indicador `PASSADA X DE Y` que avança formalmente ao término da varredura de cada lote.

---

### 2.5. Elemento Fixado ao Final da Passada (*Invariante de Laço*)
- **Conceito Teórico:** Ao final da passada $i$, o elemento que for o maior da sublista não ordenada atinge sua posição definitiva no índice $n - 1 - i$ e **nunca mais precisará ser comparado**.
- **Intenção Pedagógica:** Fixar cinestesicamente a invariante de laço do Bubble Sort: a partição $[n-1-i \dots n-1]$ está estritamente ordenada e contém os maiores elementos do vetor.
- **Implementação Observável:** Heurística falha baseada em sufixo em [`GameScreen.tsx`](../../src/screens/GameScreen.tsx).
- **Proposta P0:** O selamento formal com a etiqueta `LOCKED` no `sortedBoundary`, eliminando a caixa das futuras comparações da fase.

---

### 2.6. A Conexão Tríade: Ação $\rightarrow$ Visualização $\rightarrow$ Pseudocódigo
- **Conceito Teórico:** A dissociação entre o código formal e a visualização mental é um dos principais obstáculos cognitivos no aprendizado de algoritmos.
- **Intenção Pedagógica:** O estudante deve conectar simultaneamente a ação motora (clique), o efeito físico concreto (caixa deslizando na esteira) e a linha abstrata de código que comanda aquela operação.
- **Implementação Observável:** Parcial. A tela de resultado ([`src/screens/ResultScreen.tsx`](../../src/screens/ResultScreen.tsx)) exibe o pseudocódigo estático, mas ele não está sincronizado dinamicamente durante a execução do jogo.
- **Proposta P1:** Painel de pseudocódigo lateral em `GameScreen.tsx` que ilumina em tempo real a linha em execução conforme o par é testado.

---

### 2.7. Feedback Imediato e Formativo
- **Conceito Teórico:** O feedback imediato reduz o acúmulo de equívocos mentais (*misconceptions*), permitindo que o aluno corrija o raciocínio no instante exato da falha.
- **Implementação Observável:** Em [`GameScreen.tsx`](../../src/screens/GameScreen.tsx) e [`L91`](../../src/screens/GameScreen.tsx), o painel [`InstructionPanel`](../../src/components/InstructionPanel.tsx) explica textualmente o motivo da rejeição ou aceitação da operação (ex.: `"As caixas precisam ser vizinhas"` ou `"X ≤ Y — já estão na ordem correta!"`).

---

### 2.8. Replay Retrospectivo e Linha do Tempo (Ideia Futura — P1)
- **Conceito Teórico:** A autorreflexão e a meta-cognição são fortalecidas quando o estudante pode rever retrospectivamente sua trajetória de decisões e erros.
- **Proposta P1:** Gravação do vetor imutável `history` permitindo ao aluno navegar em uma barra de tempo após o término da fase, assistindo novamente a como suas decisões estabilizaram o vetor.

---

### 2.9. Diferenças Pedagógicas Planejadas para Novos Algoritmos (P2)

Para garantir que o jogo não caia na armadilha de usar a mesma mecânica de permuta para algoritmos distintos:

| Algoritmo | Invariante Central a Ensinar | Mecânica Dedicada de Jogo | Diferencial Cognitivo para o Aluno |
| :--- | :--- | :--- | :--- |
| **Bubble Sort** | O maior elemento flutua a cada passada por comparações locais | Testar vizinhos contíguos na esteira | Compreender o custo cumulativo de permutas locais sucessivas |
| **Selection Sort** | O menor elemento da partição desordenada é localizado e posicionado | Scanner de busca do mínimo global e troca única de longa distância | Perceber a redução drástica de escritas ($M(n) \le n-1$), mantendo $O(n^2)$ comparações |
| **Insertion Sort** | Um elemento por vez é encaixado na posição correta da sublista ordenada | Elevação do pacote chave e deslocamento regressivo dos itens maiores | Compreender a construção incremental de listas ordenadas e o melhor caso linear $O(n)$ |

### 2.10. Mini-Treinamento Interativo do Protocolo Bubble (P1.1)
- **Mapeamento Epistemológico:**
  - **Comparação Guiada $\longleftrightarrow$ Comparação Adjacente ($A[j]$ vs $A[j+1]$):** O par mandatória da vez é destacado graficamente na esteira com o badge `PAR`, canalizando o foco atencional do operador sem desvios arbitrários.
  - **Ação `[⇄ TROCAR]` $\longleftrightarrow$ Operação Swap em Memória:** Exige a verificação da relação $A[j] > A[j+1]$. Ao confirmar a troca, a esteira executa uma animação simétrica de permuta física (500ms), materializando a mutação no estado do vetor.
  - **Ação `[= MANTER]` $\longleftrightarrow$ Reconhecimento da Invariante de Ordem Local:** Ensina que quando $A[j] \le A[j+1]$, o algoritmo não permuta posições, mas obrigatoriamente consome uma comparação formal para certificar a ordem relativa.
  - **Transição de Passada $\longleftrightarrow$ Iteração do Laço Externo ($i$):** Ao concluir uma varredura pelo trecho desordenado, a interface emite um callout pedagógico explicitando o conceito de "Passada" e consolidando formalmente a maior carga restante com o selo `OK`.
  - **Feedback Formativo após Decisão $\longleftrightarrow$ Reforço Formativo Imediato:** Se o operador escolher uma ação em desacordo com as regras do algoritmo, a FSM não avança, o vetor permanece intacto e o `InstructionPanel` exibe o motivo lógico da inconsistência, permitindo nova tentativa imediata.
- **Ressalva Epistemológica:** O mini-treinamento constitui uma estratégia didática de *scaffolding* interativo. Seus impactos cognitivos sobre retenção e velocidade de raciocínio são hipóteses teóricas a serem investigadas empiricamente em pesquisas acadêmicas controladas.

### 2.11. Telemetria Factual Descritiva vs. Avaliação Normativa Arbitrária (P1.2)
- **Princípio Epistemológico:** A telemetria local registrada durante a sessão de jogo é estritamente **descritiva**: visa responder com fidelidade *"O que ocorreu factualmente durante a sessão do operador?"* e **não** *"O quanto o aluno aprendeu?"*.
- **Veto a Fórmulas Arbitrárias de Eficiência:** Foi formalmente eliminada da aplicação qualquer fórmula heurística de pontuação (como a antiga fórmula `100 - swaps * 8` em `ResultScreen`), pois penalizar trocas que são decorrência matemática mandatória da permutação inicial do vetor é epistemologicamente incoerente e pedagogicamente punitivo.
- **Métricas Factuais Registradas:**
  1. *Comparações:* Custo analítico formal de pares inspecionados ($C(n)$);
  2. *Trocas:* Custo físico de movimentação de memória ($M(n)$);
  3. *Decisões Incorretas (`errors`):* Ações do operador (`SWAP`/`KEEP`) divergentes da invariante mandatória do micro-passo corrente, rastreadas canonicamente pela engine;
  4. *Dicas Utilizadas (`hintsUsed`):* Acionamentos intencionais do recurso de assistência pedagógica, rastreados de forma isolada pela camada de sessão (ADR 0003).
- **Rastreabilidade para Pesquisa Científica:** As quatro variáveis factuais constituem dados brutos sem vieses de fórmulas arbitrárias, prontos para análises de regressão, tempo de reação e curvas de persistência em futuras coletas de dados experimentais controladas.

### 2.12. Retrospecção Reflexiva Passo a Passo via Replay da Execução (P1.3)
- **Princípio Epistemológico da Metacognição:** A literatura em Ciência da Computação Educacional (Computing Education Research — CER) aponta que a aprendizagem efetiva de algoritmos requer não apenas a ação direta, mas momentos de reflexão retrospectiva (*post-mortem analysis*). Ao término de uma fase, o estudante tem a oportunidade de revisar passo a passo o processo que ordenou o vetor.
- **Isolamento de Pressão Operacional:** No modo Replay, o estudante não é avaliado nem pressionado por novas decisões. Ele pode retroceder (`ANTERIOR`), avançar (`PRÓXIMO`) ou assistir à reprodução contínua (`REPRODUZIR` com autoplay auto-stop no último passo).
- **Inspeção do Estado Inicial (Quadro 0):** O replay viabiliza o contraste imediato entre a desordem inicial e a ordenação progressiva resultante de cada passada.
- **Rigor Factual da Explicação:** Cada passo traz a fundamentação matemática explícita ($A[j] > A[j+1]$ ou $A[j] \le A[j+1]$), reforçando a invariante do laço interno do Bubble Sort.
- **Ressalva Acadêmica:** A efetividade do replay na redução de erros em fases subsequentes constitui hipótese de pesquisa empírica a ser validada em protocolos de teste pré/pós-intervenção.

### 2.13. Conexão Visual-Textual via Pseudocódigo Sincronizado no Replay (P1.4)
- **Fundamento Teórico da Dupla Codificação:** O alinhamento concorrente entre a representação visual-analógica (caixas inspecionadas e permutadas na esteira) e a representação formal-proposicional (instruções em pseudocódigo estruturado) visa explicitar a correspondência entre a ação cinestésica observada e a sintaxe algorítmica.
- **Preservação da Abstração Algorítmica:** O pseudocódigo canônico exibido é estritamente genérico (`se A[j] > A[j + 1] então`, `trocar A[j] e A[j + 1]`), evitando a substituição do texto do algoritmo por expressões literais (`if 5 > 4`). Os valores concretos observados no frame corrente ($A[j] = 5, A[j+1] = 2 \rightarrow 5 > 2$) são apresentados em um painel contextual separado, garantindo clareza sem distorcer o modelo computacional formal.
- **Correspondência Semântica Estrita dos Quadros:**
  - `Quadro INITIAL`: Destaque neutro no cabeçalho do algoritmo (`procedimento bubbleSort(A)`), sem avaliação de condição ou execução de operações;
  - `Quadro KEEP`: Destaque na linha condicional (`IF_CONDITION`) com indicação de resultado `FALSO`, demonstrando a supressão da instrução de permuta e a preservação das posições relativas;
  - `Quadro SWAP`: Destaque na linha condicional com resultado `VERDADEIRO` e foco primário na instrução de troca (`SWAP_STATEMENT`), evidenciando a correlação de causa e efeito da permuta física na esteira.
### 2.14. Distribuição da Carga Cognitiva e Decisão Pedagógica sobre Pseudocódigo no Gameplay (P1.5)
- **Fundamento na Teoria da Carga Cognitiva (Sweller et al.):** A memória de trabalho humana possui capacidade restrita de processamento simultâneo de novas informações. No aprendizado de algoritmos, deve-se minimizar a carga cognitiva extrínseca (ruído visual, divisão de atenção e redundância) para maximizar a capacidade disponível para o esquema conceitual intrínseco (a lógica de ordenação).
- **Tríade de Prioridade Visual no `GameScreen`:** Durante a fase ativa na esteira, a interface organiza o foco perceptivo-motor do operador em três níveis hierárquicos estritos:
  1. *Ação Atual:* O par sob foco (`selected={true}`) e os botões de decisão imediata `[⇄ TROCAR]` e `[= MANTER]`;
  2. *Consequência Imediata:* O deslocamento físico das caixas na animação simétrica (500ms) e o feedback formativo conciso via `InstructionPanel`;
  3. *Contexto Algorítmico:* Indicador de progresso analítico real, contadores factuais e status da passada.
- **Avaliação Formal da Exclusão de Pseudocódigo do `GameScreen`:** Inserir o painel de 9 linhas de pseudocódigo no `GameScreen` durante o gameplay geraria o *efeito de atenção dividida* (*split-attention effect*), compelindo o aluno a alternar continuamente o olhar entre caixas animadas, botões de ação e linhas de código, além de forçar rolagem vertical excessiva em telas menores. A homologação do P1.5 estabelece que a formalização sintática via pseudocódigo sincronizado deve permanecer situada no `ReplayScreen`, onde a análise retrospectiva ocorre de forma reflexiva, pausada e sem competição sensorial com a esteira ativa.
- **Compatibilidade com a Futura Narrative Layer:** A homologação do vocabulário técnico na esteira (`estação`, `operador`, `cargas`, `protocolo`, `treinamento`, `turno`) consolida uma base diegética sólida para a introdução futura de personagens e lore sem distorcer o rigor conceitual da ciência da computação.

---

## 3. O que Podemos Afirmar no Artigo Acadêmico Hoje

Com base exclusivamente nos fatos implementados e no código auditado do repositório, o artigo científico pode atestar legitimamente os seguintes pontos em suas seções de **Introdução, Arquitetura e Desenvolvimento**:

1. **Design e Arquitetura do Software:**  
   O Sorting Station foi concebido e implementado como uma aplicação Single Page Application (SPA) responsiva em React 19, TypeScript estrito, Tailwind CSS v4 e Vite, operando 100% no cliente sem dependência de infraestrutura de servidor.
2. **Proposta de Valor e Modelo de Gamificação:**  
   O jogo adota uma metáfora diegética sci-fi industrial de centro de triagem logística para converter a execução abstrata de algoritmos em manipulação cinestésica direta sobre esteiras rolantes.
3. **Mapeamento Conceitual de Domínio:**  
   As decisões de design estabelecem correspondência formal entre variáveis matemáticas de complexidade ($C(n)$ e $M(n)$) e interações do usuário (seleção de caixas e animações de permuta física).
4. **Governança e Rastreabilidade Documental:**  
   O repositório possui uma base de verdade canônica estruturada na Wiki e registros de decisão arquitetural (ADRs) que detalham o diagnóstico de limitações e a evolução técnica planejada.
5. **Diferenciação Crítica de Mecânicas:**  
   O projeto estabelece formalmente o princípio de que novos algoritmos de ordenação exigem mecânicas interativas exclusivas baseadas em suas respectivas invariantes de laço.

---

## 4. O que Só Poderemos Afirmar Após Avaliação Empírica

> [!CAUTION]
> **Veto a Alegações Científicas não Comprovadas:**  
> As afirmações listadas abaixo dependem estritamente da realização de um **estudo experimental controlado** com estudantes reais, com aprovação prévia em comitê de ética em pesquisa e metodologia estatística formal. **Nenhuma delas pode ser afirmada como fato no estado atual do projeto**:

1. **Ganho de Aprendizagem e Desempenho Acadêmico:**  
   *Não podemos afirmar* que estudantes que jogaram o Sorting Station obtiveram notas superiores ou demonstraram maior domínio de algoritmos do que aqueles que assistiram aulas tradicionais ou usaram pseudocódigo puro.
2. **Superioridade em Relação a Visualizadores Passivos:**  
   *Não podemos afirmar* que a manipulação ativa por clique resulta em menor taxa de esquecimento do que visualizadores algorítmicos convencionais (como VisuAlgo ou animações em vídeo).
3. **Redução de Carga Cognitiva:**  
   *Não podemos afirmar* que a metáfora sci-fi reduziu a carga cognitiva intrínseca ou germane dos alunos sem medição psicométrica validada (ex.: escala NASA-TLX ou questionários padronizados).
4. **Satisfação e Engajamento dos Estudantes:**  
   *Não podemos afirmar* que os usuários acharam a interface intuitiva, envolvente ou motivadora sem dados de escalas de usabilidade (como SUS — *System Usability Scale*) e entrevistas qualitativas.
5. **Qualquer Conclusão Estatística ou P-Valor:**  
   É terminantemente vedado apresentar médias, desvios-padrão, testes t de Student ou valores de significância estatística ($p < 0.05$) antes da coleta empírica real de dados com turmas experimentais e grupos de controle.
