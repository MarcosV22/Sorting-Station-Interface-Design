# 01 — Visão de Produto e Escopo

> **Documento canônico:** Visão de produto, proposta pedagógica, princípios de design e delimitação de escopo do **Sorting Station**.  
> **Status:** Ativo / Base de Verdade da Wiki  
> **Data:** 08/09/2026  
> **Dependências:** [`AGENTS.md`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/AGENTS.md), [`CLAUDE.md`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/CLAUDE.md), [`docs/wiki/00-repository-inventory.md`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/docs/wiki/00-repository-inventory.md).

---

## 1. Visão Geral do Produto

O **Sorting Station** é um jogo educacional *point-and-click* para navegadores web concebido para transformar o ensino e a aprendizagem de algoritmos de ordenação em uma experiência ativa, interativa e visualmente intuitiva. 

Ambientado em uma central logística futurista de alta tecnologia ([`src/screens/HomeScreen.tsx:L70-L88`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/HomeScreen.tsx#L70-L88)), o jogo coloca o estudante no papel de um operador de triagem de cargas. O desafio proposto não é apenas "colocar números em ordem", mas sim **executar passo a passo o comportamento rigoroso do algoritmo ensinado**, integrando em tempo real:

$$\text{Ação do Jogador} \longrightarrow \text{Representação Visual} \longrightarrow \text{Execução do Algoritmo} \longrightarrow \text{Pseudocódigo Formal} \longrightarrow \text{Feedback Explicativo}$$

---

## 2. O Problema Educacional

O aprendizado de algoritmos fundamentais de ordenação (como Bubble Sort, Selection Sort e Insertion Sort) em cursos de Computação e Engenharia frequentemente enfrenta barreiras didáticas conhecidas:

1. **Abstração Excessiva e Desconexão Prática:** Estudantes novatos frequentemente têm dificuldade em traduzir laços aninhados (`for/while`), índices de ponteiros (`i`, `j`, `j+1`) e operações de permuta (*swap*) em transformações espaciais concretas sobre os dados.
2. **Passividade dos Visualizadores Tradicionais:** Ferramentas clássicas de visualização de algoritmos costumam ser puramente demonstrativas: o aluno pressiona um botão de "Play" e assiste a barras coloridas se movendo automaticamente. Isso gera uma **ilusão de competência** (*illusion of explanatory depth*), onde o aluno acredita compreender o algoritmo enquanto o assiste passivamente, mas fracassa ao ter que reproduzir ou rastrear seus passos manualmente.
3. **Desconexão com a Sintaxe Formal:** Muitas abordagens isolam a teoria (análise assintótica e pseudocódigo em slides) da prática (depuração em código real), deixando uma lacuna conceitual sobre o papel de cada linha do algoritmo durante a execução.
4. **Ansiedade e Frustração com Sintaxe de Programação:** Alunos em estágios iniciais muitas vezes gastam mais energia lutando contra erros de sintaxe de compiladores do que compreendendo a lógica conceitual dos passos do algoritmo.

---

## 3. Proposta de Valor e Modelo Pedagógico

A proposta central do **Sorting Station** é a **aprendizagem ativa por manipulação direta**:

- **Agência com Andaime Pedagógico (*Scaffolding*):** Em vez de apenas assistir à ordenação, o aluno toma as decisões operacionais (qual par comparar, se deve ou não trocar, qual elemento selecionar). O sistema valida a decisão conforme o protocolo do algoritmo em estudo.
- **Rastreamento Cognitivo em Múltiplas Camadas:** A interface conecta simultaneamente o objeto manipulado (caixa numerada na esteira), a métrica operacional (número de comparações e trocas), a instrução formal (linha correspondente no pseudocódigo) e a justificativa lógica (ex.: *"5 > 2 — troca necessária"*).
- **Sem Atrito de Sintaxe:** O formato *point-and-click* elimina barreiras de digitação, permitindo foco cognitivo 100% voltado à lógica do algoritmo e à sua invariante de laço.

> [!NOTE]
> **Ressalva Metodológica Obrigatória:** O impacto educacional do jogo é tratado aqui como **objetivo pedagógico e proposta de design**. O repositório não registra resultados de validação empírica ou testes de eficácia com turmas de alunos, os quais constituem planos futuros de pesquisa acadêmica.

---

## 4. Público-Alvo Inicial

O produto é projetado prioritariamente para:

1. **Estudantes de Cursos de Graduação:** Alunos de Ciência da Computação, Engenharia de Software, Sistemas de Informação e áreas afins, matriculados em disciplinas introdutórias como Algoritmos, Estruturas de Dados e Introdução à Programação.
2. **Estudantes de Cursos Técnicos e Tecnológicos:** Alunos de cursos técnicos de desenvolvimento de sistemas e programação web.
3. **Autodidatas e Entusiastas:** Desenvolvedores em transição de carreira ou estudantes independentes que buscam reforçar a base conceitual de ciência da computação.
4. **Professores e Educadores:** Docentes que buscam uma ferramenta web leve, gratuita e interativa para ilustrar aulas práticas e atividades guiadas de laboratório sem necessidade de instalação de ambientes complexos.

---

## 5. Fantasia e Narrativa: A Central Logística Futurista

Para afastar a experiência da aridez de exercícios em folha de papel ou de dashboards corporativos despersonalizados, o jogo constrói uma narrativa temática coerente:

- **O Cenário ("Central Logística v2.0"):** Uma estação espacial/industrial automatizada de roteamento de pacotes energéticos (`HomeScreen.tsx:L70-L73`).
- **Os Dados (Cargas / Pacotes):** Vetores de números inteiros são representados como caixas tecnológicas de transporte com identificadores e chaves de prioridade (`NumberedBox.tsx`).
- **O Meio de Transporte (Esteira Transportadora):** O vetor é disposto sobre uma esteira com trilhos energizados (`.conveyor-track` em `src/index.css:L114-L124` e `src/screens/GameScreen.tsx:L181`), reforçando a ideia de fluxo, adjacência espacial e fronteira de ordenação.
- **Os Algoritmos como "Protocolos de Operação":** Cada algoritmo de ordenação é apresentado como um protocolo operacional homologado da central:
  - *Protocolo Bubble* (Bubble Sort) — Foco em varredura adjacente e flutuação.
  - *Protocolo Selection* (Selection Sort) — Foco em escaneamento da carga mínima.
  - *Protocolo Insertion* (Insertion Sort) — Foco em encaixe posicional em lote já ordenado.
- **Identidade Audiovisual:** Paleta escura com brilhos neon em ciano (`#00f5ff`) e roxo (`#8b5cf6`), efeito de linhas de varredura CRT (`.scanlines`), malha de fundo (`.bg-grid`) e tipografia temática dividida entre exibição industrial (*Orbitron*) e terminal de telemetria (*Space Mono*).

---

## 6. A Natureza *Point-and-Click*

O produto adota intencionalmente a mecânica *point-and-click* pelas seguintes razões fundamentais:

- **Baixa Carga Cognitiva Estranha:** Não há comandos de terminal, editores de texto ou linguagens de programação envolvidos. O estudante interage diretamente com o mouse ou toque sobre os elementos visuais.
- **Transparência de Ação:** O clique em uma caixa representa a intenção imediata de foco; o clique na segunda caixa indica a intenção de comparação; botões de confirmação acionam decisões inequívocas.
- **Acessibilidade Universal via Navegador:** Uma Single Page Application leve em React/Vite pode ser executada instantaneamente em qualquer navegador moderno, inclusive em computadores modestos de laboratórios escolares, sem necessidade de login prévio ou instalação de dependências.

---

## 7. Diferenciação Fundamental: "Ordenar Números" vs. "Executar um Algoritmo"

Esta é a distinção conceitual mais crítica de todo o projeto **Sorting Station**:

| Critério | "Ordenar Números" (Quebra-Cabeça Comum) | "Executar um Algoritmo de Ordenação" (Sorting Station) |
| :--- | :--- | :--- |
| **Objetivo do Jogador** | Fazer o vetor ficar crescente a qualquer custo. | Compreender e reproduzir o procedimento formal e sistemático daquele algoritmo. |
| **Ordem de Ações** | Livre, caótica ou baseada em intuição visual arbitrária (trocar qualquer par desordenado que chamar a atenção). | Determinística e estruturada (respeita a passada atual, o ponteiro de comparação e a invariante de laço). |
| **Consciência das Passadas** | O jogador não sabe em qual passada está nem quando um elemento atingiu sua posição definitiva. | O sistema evidencia o início e fim de cada passada (`PASSADA X/Y`) e fixa visualmente elementos definitivamente posicionados. |
| **Custo Operacional** | Comparações e trocas supérfluas não importam desde que o resultado final esteja certo. | O jogador compreende que comparações desnecessárias ou fora de ordem violam a complexidade teórica do algoritmo. |
| **Valor Pedagógico** | Baixo (apenas exercita reconhecimento de ordem numérica). | Alto (ensina pensamento algorítmico, invariantes e análise de fluxo de controle). |

> [!IMPORTANT]
> **Dívida Técnica do Protótipo Atual vs. Direção Futura:**  
> Como registrado no inventário técnico ([`docs/wiki/00-repository-inventory.md`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/docs/wiki/00-repository-inventory.md#L182-L188)), o protótipo atual de [`src/screens/GameScreen.tsx`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L44-L97) ainda permite clicar em **qualquer par adjacente em qualquer ordem**.  
> A prioridade máxima planejada (**P0**) do projeto é substituir essa liberdade irrestrita por uma **máquina de estados pedagógica** que force o fluxo formal do Bubble Sort (passo a passo da esquerda para a direita).

---

## 8. Princípios de Gameplay

1. **Agência com Guia Rigoroso:** O jogador toma a decisão operacional, mas a máquina do jogo assegura que a decisão seja avaliada contra as regras estritas do algoritmo em foco.
2. **Causa e Efeito Imediatos:** Toda ação do jogador produz feedback textual e visual instantâneo (inferior a 500ms), explicitando a relação de ordem (`>` ou `≤`) e o impacto sobre o vetor.
3. **Ritmo Controlado pelo Estudante:** No aprendizado inicial, não deve haver cronômetros agressivos ou contagens regressivas que induzam ao pânico. O foco é a precisão do raciocínio e a compreensão dos passos.
4. **Erro como Oportunidade Diagnóstica:** Errar uma decisão de troca não deve punir o estudante com "Game Over" ou perda de progresso catastrófica. O jogo deve pausar, explicar o motivo pedagógico do erro e permitir a retificação imediata.
5. **Transparência de Estado e Limites:** A esteira deve evidenciar claramente:
   - Qual par está atualmente sob escrutínio;
   - Quais elementos já estão definitivamente ordenados (fronteira de ordenação);
   - Quais elementos ainda pertencem à sublista não ordenada.

---

## 9. Objetivo Pedagógico do MVP (Bubble Sort)

O MVP foca especificamente no **Bubble Sort** com os seguintes objetivos de aprendizagem:

1. **Compreender a Comparação Adjacente Local:** Entender que o algoritmo opera exclusivamente sobre pares vizinhos imediatos ($A[j]$ e $A[j+1]$), sem visão holística global do vetor.
2. **Visualizar a "Flutuação" dos Maiores Elementos:** Observar empiricamente como, a cada passada completa de comparações, o maior elemento remanescente do subvetor é empurrado de forma determinística para o final da esteira.
3. **Sentir o Custo das Comparações:** Perceber que o algoritmo realiza comparações mesmo quando os elementos já estão na ordem correta ($A[j] \le A[j+1]$), consolidando a intuição sobre o número quadrático ($O(n^2)$) de verificações no pior e caso médio.

---

## 10. Escopo do MVP (Estado Implementado Atual)

Em conformidade com a base factual verificada em [`docs/wiki/00-repository-inventory.md`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/docs/wiki/00-repository-inventory.md):

- **Telas:** Fluxo linear funcional `HomeScreen` → `TutorialScreen` → `GameScreen` → `ResultScreen` ([`src/App.tsx:L47-L77`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/App.tsx#L47-L77)).
- **Algoritmo:** Exclusivamente Bubble Sort ("Protocolo Bubble").
- **Fases:** Três fases com configurações fixas de vetor:
  - Fase 1: `[5, 2, 4, 1]` (4 elementos)
  - Fase 2: `[6, 3, 8, 2, 5]` (5 elementos)
  - Fase 3: `[9, 1, 7, 4, 3, 6]` (6 elementos)
- **Interação:** Seleção de caixas vizinhas por clique, com contagem em tempo real de comparações e trocas ([`src/screens/GameScreen.tsx:L44-L97`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L44-L97)).
- **Feedback:** Painel contextual com 4 tipologias visuais de instrução (`InstructionPanel.tsx`).
- **Recursos de Apoio:** Sistema de dica local (`findNextSwap`) e reinício de fase ([`src/screens/GameScreen.tsx:L99-L128`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/GameScreen.tsx#L99-L128)).
- **Encerramento:** Relatório de desempenho de fase com contadores, barra de eficiência e pseudocódigo com linha em destaque ([`src/screens/ResultScreen.tsx`](file:///C:/Users/marcos.mendes/Downloads/Sorting%20Station%20Interface%20Design/src/screens/ResultScreen.tsx)).

---

## 11. Não-Objetivos do MVP

Para proteger o foco do projeto e evitar escopo inflado sem fundamentação, os seguintes itens são explicitamente **não-objetivos** do MVP:

- ❌ **Sem Backend ou Banco de Dados:** Não há armazenamento em nuvem, contas de usuário ou autenticação.
- ❌ **Sem Competição por Tempo / Speedrun:** O MVP não inclui cronômetros de pressão ou rankings de velocidade.
- ❌ **Sem Editor de Código Embutido:** O jogador não digita código fonte em JavaScript, Python ou C.
- ❌ **Sem Múltiplos Algoritmos no MVP:** Selection Sort e Insertion Sort são direções futuras planejadas, não partes do escopo inicial.
- ❌ **Sem Gerador Aleatório Ilimitado de Fases:** O MVP utiliza vetores didáticos controlados para garantir reproducibilidade e valor demonstrativo.
- ❌ **Sem Alegações de Eficácia Estatística:** O MVP não reivindica comprovação empírica de melhora pedagógica até a realização de estudos acadêmicos estruturados.

---

## 12. Critérios de Sucesso

### Critérios Técnicos
- **Integridade de Build:** Compilação limpa via Vite 8 sem erros de bundle ou avisos de tipagem TypeScript em modo estrito (`strict: true`).
- **Desempenho de Renderização:** Taxa de quadros estável (60 FPS) nas animações CSS de troca e esteira, sem vazamentos de memória em `setInterval` ou `setTimeout`.
- **Zero Dependência Externa de Backend:** Aplicação 100% funcional offline ou servida como SPA estática.

### Critérios de Experiência e Usabilidade
- **Compreensão Imediata:** Um estudante deve entender a regra de comparação adjacente em menos de 1 minuto após navegar pelo tutorial.
- **Feedback Sem Ambiguidade:** Toda ação (troca necessária, nenhuma troca necessária, seleção inválida) deve ser comunicada por texto claro e cor inequívoca em menos de 300ms.
- **Sensação de Conquista:** A transição para a tela de resultado deve validar a conclusão da ordenação de forma satisfatória e relacionar claramente a pontuação com as ações realizadas.

---

## 13. Relação com a Pesquisa Acadêmica Futura

O desenvolvimento do **Sorting Station** está diretamente associado à elaboração de um **artigo científico sobre métodos ativos no ensino de computação**:

- **Alimentação da Metodologia:** As decisões de design da interface, o desdobramento diegético da central logística e a arquitetura da máquina de estados servirão de base para a seção de desenvolvimento e metodologia do artigo.
- **Protocolo de Avaliação Futura (Planejado):** Pretende-se estruturar um estudo empírico com estudantes de graduação, combinando:
  - Pré-teste e pós-teste conceituais sobre rastreamento de Bubble Sort;
  - Questionário de avaliação de usabilidade baseado na escala SUS (*System Usability Scale*);
  - Instrumento de avaliação de percepção de engajamento e clareza conceitual em escala Likert.
- **Compromisso de Rastreabilidade:** Nenhuma hipótese será apresentada no artigo ou na Wiki como fato consumado sem a devida coleta e análise estatística prévia dos dados dos participantes.

---

## 14. Princípios de Produto (Diretrizes Inegociáveis de Design)

Qualquer futura funcionalidade, tela, componente ou algoritmo adicionado ao **Sorting Station** deve obrigatoriamente respeitar os **8 Princípios de Produto** abaixo:

1. **Ação Precede a Abstração:**  
   O jogador deve interagir com os elementos e vivenciar a mecânica física antes de ser confrontado com a notação matemática formal ou o pseudocódigo estrito.

2. **O Algoritmo Governa o Jogo, Não a Intuição Arbitrária:**  
   A mecânica de jogo deve espelhar com fidelidade matemática as invariantes de laço e as regras formais do algoritmo em estudo. O jogo não deve permitir atalhos que descaracterizem o algoritmo apenas para "facilitar" o puzzle.

3. **O Erro é Diagnóstico e Pedagógico, Nunca Punitivo:**  
   Erros de ordenação devem interromper o fluxo para fornecer esclarecimento conceitual sobre *por que* aquela ação contraria o protocolo, sem humilhar ou penalizar o aluno com telas punitivas de derrota.

4. **Feedback Explicativo em Vez de Validação Binária:**  
   O sistema nunca deve limitar-se a dizer "Certo" ou "Errado". Ele deve sempre expor o fundamento lógico subjacente (ex.: *"Elemento 8 > 3: na passada do Bubble Sort, o maior deve avançar para a direita"*).

5. **O Jogo Deve Parecer um Jogo, Não um Dashboard Corporativo:**  
   A narrativa da central logística, o feedback audiovisual sci-fi, as animações de esteira e a paleta neon devem ser preservados para garantir engajamento lúdico e imersão emocional.

6. **Foco Cognitivo na Lógica, Eliminando Atrito de Interface:**  
   Toda a interação fundamental deve ocorrer via *point-and-click* imediato. Decisões de design não devem exigir que o aluno decore atalhos complexos ou enfrente atritos ergonômicos para expressar sua intenção lógica.

7. **Cada Algoritmo Possui Mecânica Própria (Proibição de *Skins* Genéricas):**  
   Quando Selection Sort e Insertion Sort forem implementados, eles não devem ser meras cópias da esteira do Bubble Sort com nomes trocados. Cada algoritmo deve ter mecânicas de interação que materializem sua lógica singular (busca do menor na partição não ordenada; inserção posicional na partição ordenada).

8. **Honestidade Acadêmica e Rigor Metodológico:**  
   Não prometer milagres pedagógicos nem divulgar métricas de aprendizagem sem avaliação científica documentada e revisada por pares. O código e a Wiki devem sempre refletir a realidade mensurável do projeto.
