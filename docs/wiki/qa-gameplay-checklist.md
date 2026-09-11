# Checklist Operacional de QA — Gameplay e Simulação Algorítmica

> **Documento operacional:** Roteiro prático para testes manuais e regressão funcional das mecânicas de gameplay do **Sorting Station**.  
> **Status:** Ativo / Ferramenta de Homologação  
> **Data:** 10/09/2026  
> **Dependências:** [`AGENTS.md`](../../AGENTS.md), [`03-frontend.md`](./03-frontend.md), [`04-sorting-engine.md`](./04-sorting-engine.md), [`08-testing-and-quality.md`](./08-testing-and-quality.md).

---

## 1. Como Usar Este Checklist

Este documento deve ser executado por desenvolvedores e agentes antes de aprovar alterações na interface (`GameScreen.tsx`), componentes visuais (`NumberedBox.tsx`, `InstructionPanel.tsx`) ou no fluxo de navegação (`App.tsx`).

Para rodar o ambiente de homologação:
```bash
pnpm run test:run      # Validação automática da engine
pnpm exec tsc --noEmit # Validação estática de tipos
pnpm run dev           # Servidor de desenvolvimento
```

---

## 2. Matriz de Verificação de Gameplay

### 2.1. Fluxo Completo de Telas (Navegação)
- [ ] **Home $\rightarrow$ Tutorial:** Clicar em "INICIAR TRIAGEM" ou "COMO JOGAR" abre `TutorialScreen`.
- [ ] **Tutorial $\rightarrow$ Game:** Clicar em "ENTENDI O PROTOCOLO" monta `GameScreen` na Fase 1.
- [ ] **Tutorial $\rightarrow$ Home:** Clicar em "← VOLTAR" retorna para `HomeScreen`.
- [ ] **Game $\rightarrow$ Result:** Ao ordenar o último par, a tela transita automaticamente para `ResultScreen` após feedback comemorativo (~1200ms).
- [ ] **Result $\rightarrow$ Próxima Fase (Fases 1 e 2):** Clicar em "PRÓXIMA FASE →" avança para a fase seguinte com novo vetor (`hasNextPhase === true`).
- [ ] **Result $\rightarrow$ Concluir Protocolo (Fase 3):** Na Fase 3, o botão exibe "CONCLUIR PROTOCOLO →" (`hasNextPhase === false`) e transita diretamente para `CampaignCompleteScreen` sem reiniciar a Fase 3.
- [ ] **Result $\rightarrow$ Repetir Fase:** Clicar em "↺ REPETIR FASE" remonta o jogo na mesma fase.

---

### 2.2. Mecânica de Decisão: TROCAR (SWAP)
- [ ] **SWAP Correto ($A[j] > A[j+1]$):**
  - [ ] Caixas sob escrutínio realizam animação física de permuta (esquerda vai para direita, direita vai para esquerda).
  - [ ] O contador de **Trocas** no HUD incrementa em $+1$.
  - [ ] O contador de **Comparações** no HUD incrementa em $+1$.
  - [ ] O painel de instruções exibe mensagem verde (`success`) justificando a troca.
  - [ ] A máquina avança para o próximo par ou para a próxima passada.

---

### 2.3. Mecânica de Decisão: MANTER (KEEP)
- [ ] **KEEP Correto ($A[j] \le A[j+1]$):**
  - [ ] Nenhuma animação de deslocamento ocorre nas caixas.
  - [ ] As posições dos números permanecem inalteradas.
  - [ ] O contador de **Comparações** no HUD incrementa em $+1$.
  - [ ] O contador de **Trocas** permanece inalterado.
  - [ ] O painel de instruções exibe mensagem informativa (`info`) confirmando a manutenção da ordem.
  - [ ] A máquina avança para o próximo par ou próxima passada.

---

### 2.4. Decisão Incorreta e Bloqueio Pedagógico
- [ ] **Tentativa Inválida (KEEP quando $A[j] > A[j+1]$ ou SWAP quando $A[j] \le A[j+1]$):**
  - [ ] A FSM **NÃO avança**: os ponteiros de passada e comparação permanecem congelados.
  - [ ] As caixas **NÃO sofrem permuta**.
  - [ ] O contador interno de `errors` na engine é incrementado.
  - [ ] O painel de instruções exibe mensagem de alerta vermelha (`error`), explicando a regra violada.
  - [ ] Os botões `TROCAR` e `MANTER` permanecem ativos aguardando a decisão correta.

---

### 2.5. Troca Física Animada e Bloqueio de Ações
- [ ] **Simetria:** Caixa da esquerda desloca-se para a direita (`animate-swap-right`) e caixa da direita desloca-se para a esquerda (`animate-swap-left`).
- [ ] **Bloqueio Concorrente:** Durante os 500ms de animação, todos os botões (`TROCAR`, `MANTER`, `DICA`, `REINICIAR`) e caixas ficam desabilitados (`isAnimating === true`).
- [ ] **Imunidade a Cliques Múltiplos:** Clicar freneticamente nos botões durante a animação não provoca avanço duplo nem dessincronização da FSM.

---

### 2.6. Sistema de Dica Pedagógica
- [ ] Clicar em "? DICA" exibe mensagem em amarelo/laranja (`warning`) no `InstructionPanel`.
- [ ] A dica analisa estritamente o par mandatório da vez ($[j, j+1]$), orientando a ação correta sem alterar o vetor nem os ponteiros.
- [ ] Cada clique intencional válido em DICA incrementa `hintsUsed` em exatamente $+1$ via `sessionMetrics`.
- [ ] Cliques enquanto a dica já está visível (`showHint`), durante animações de troca (`isAnimating`), ou após a conclusão da fase (`gameState.completed`) são bloqueados e **não** incrementam o contador.
- [ ] O botão DICA desativa temporariamente para evitar spam e retorna ao estado normal após o tempo limite (~4s).

---

### 2.7. Reinício de Fase (REINICIAR)
- [ ] Clicar em "↺ REINICIAR" restaura o vetor inicial da fase.
- [ ] Contadores de comparações, trocas, erros e dicas retornam a zero.
- [ ] Limite de fixação (`sortedBoundary`) é resetado (nenhum badge `OK`).
- [ ] Barra de progresso retorna a 0%.
- [ ] Todos os temporizadores pendentes são cancelados com segurança.

---

### 2.8. Barra de Progresso Real
- [ ] Inicia em 0% na primeira comparação da primeira passada.
- [ ] Incrementa após **cada** comparação válida (seja `SWAP` ou `KEEP`), seguindo $\frac{\text{passos}}{\text{total teórico}} \times 100\%$.
- [ ] Atinge exatamente 100% no término da última comparação da última passada.

---

### 2.9. Fixação Determinística de Elementos (`sortedBoundary`)
- [ ] Nenhuma caixa recebe `OK` no meio de uma passada.
- [ ] Ao término da passada $i$, **apenas** a caixa no índice $n - 1 - i$ é fixada em verde com badge `OK`.
- [ ] Ao término da última passada, todas as caixas restantes recebem `OK`.
- [ ] Clicar em uma caixa com badge `OK` emite aviso de que o elemento já está consolidado.

---

### 2.10. Conclusão da Fase e Transição
- [ ] Ao concluir o último passo, o cabeçalho exibe `CONCLUÍDO`.
- [ ] Os botões de decisão são substituídos pela mensagem de turno finalizado.
- [ ] `onComplete` é acionado exatamente **uma única vez** (protegido por `completedCalledRef`).
- [ ] A tela `ResultScreen` recebe e exibe os 4 valores factuais: Comparações, Trocas, Decisões Incorretas (`errors`) e Dicas Utilizadas (`hintsUsed`).
- [ ] A tela `ResultScreen` **NÃO exibe nenhuma barra ou fórmula de 'Eficiência %'**, mantendo telemetria puramente descritiva (ADR 0003).

---

### 2.11. Matriz de Fases da Campanha
| Fase | Vetor Inicial | Comparações Teóricas | Trocas Teóricas | Passadas ($n-1$) | Tamanho das Caixas |
| :---: | :---: | :---: | :---: | :---: | :---: |
| **1** | `[5, 2, 4, 1]` | 6 | 5 | 3 | `lg` ($112\times 112\text{px}$) |
| **2** | `[6, 3, 8, 2, 5]` | 10 | 6 | 4 | `lg` ($112\times 112\text{px}$) |
| **3** | `[9, 1, 7, 4, 3, 6]` | 15 | 9 | 5 | `md` ($80\times 80\text{px}$) |

---

### 2.12. Não-Regressão e Responsividade
- [ ] `pnpm run test:run` passa com 100% de aprovação (**63 testes unitários** em 6 arquivos de teste).
- [ ] `pnpm exec tsc --noEmit` executa com zero erros.
- [ ] `pnpm run build` compila sem alertas de bundling.
- [ ] Em resolução $1024\times 768$ ou superior, não há sobreposição de componentes ou cortes nas caixas.
- [ ] Em caso de altura reduzida de tela, a rolagem vertical (`overflow-y-auto`) permite acesso a todos os controles e à barra de progresso.

---

### 2.13. Conclusão da Campanha (`CampaignCompleteScreen`)
- [ ] **Acesso:** Acessível exclusivamente após concluir a Fase 3 e clicar em "CONCLUIR PROTOCOLO →".
- [ ] **Narrativa Coerente:** Exibe título "TREINAMENTO CONCLUÍDO!" e texto comunicando a homologação do Protocolo Bubble sem afirmações de aprendizado absoluto.
- [ ] **Métricas Factuais Globais (5 cartões):**
  - [ ] Fases Concluídas: exibe `3 / 3`;
  - [ ] Comparações Totais: exibe a soma exata das três fases ($6 + 10 + 15 = 31$ em execução ideal);
  - [ ] Trocas Totais: exibe a soma exata das três fases ($5 + 6 + 9 = 20$ em execução ideal);
  - [ ] Decisões Incorretas: exibe a soma das tentativas inválidas cometidas ao longo das 3 fases;
  - [ ] Dicas Utilizadas: exibe o total de dicas solicitadas ao longo das 3 fases.
- [ ] **Relatório por Etapa:**
  - [ ] 3 cards individuais exibindo status "✓ CONCLUÍDA";
  - [ ] Exibe os 4 contadores de cada fase individual: Comparações, Trocas, Decisões Incorretas e Dicas Utilizadas;
  - [ ] Exibe miniaturas dos vetores finais ordenados.
- [ ] **Ação Principal ("⌂ VOLTAR AO INÍCIO"):**
  - [ ] Limpa todos os resultados em memória (`phaseResults = []`);
  - [ ] Reseta o ponteiro de fase para a Fase 1 (`phase = 1`);
  - [ ] Limpa o resultado ativo (`result = null`);
  - [ ] Retorna à tela inicial (`HomeScreen`).
- [ ] **Ação Secundária ("↺ REJOGAR PROTOCOLO"):**
  - [ ] Limpa os resultados acumulados;
  - [ ] Inicia imediatamente uma nova sessão na Fase 1 (`GameScreen`) sem recarregar a página do navegador.

---

### 2.14. Mini-Treinamento Interativo (`TutorialScreen`)
- [ ] **Acesso:** Entrar no jogo pela `HomeScreen` via "INICIAR TURNO" ou "COMO JOGAR".
- [ ] **Vetor Inicial:** Começa determinísticamente em `[3, 1, 2]`.
- [ ] **Etapa 1 (Par 3 e 1):**
  - [ ] Clicar em "MANTER" é rejeitado com aviso formativo de que $3 > 1$;
  - [ ] Clicar em "TROCAR" é aceito, executa animação simétrica de troca e atualiza para `[1, 3, 2]`.
- [ ] **Etapa 2 (Par 3 e 2):**
  - [ ] Par ativo passa a ser o índice 1 (3) e índice 2 (2);
  - [ ] Clicar em "MANTER" é rejeitado com aviso formativo de que $3 > 2$;
  - [ ] Clicar em "TROCAR" é aceito, executa animação de troca e atualiza para `[1, 2, 3]`;
  - [ ] Exibe callout didático "PASSADA 1 CONCLUÍDA" explicando o conceito de varredura;
  - [ ] Elemento 3 é fixado como consolidado em verde com badge `OK`.
- [ ] **Etapa 3 (Par 1 e 2):**
  - [ ] Par ativo passa a ser o índice 0 (1) e índice 1 (2);
  - [ ] Clicar em "TROCAR" é rejeitado com aviso formativo de que $1 \le 2$;
  - [ ] Clicar em "MANTER" é aceito;
  - [ ] Transita para o painel de "TREINAMENTO BÁSICO CONCLUÍDO".
- [ ] **Painel de Conclusão:**
  - [ ] Exibe resumo formativo das competências praticadas;
  - [ ] Botão "INICIAR FASE 1 →" avança diretamente para a Fase 1 (`GameScreen`);
  - [ ] Botão "↺ REPETIR TREINAMENTO" reinicia o tutorial com `[3, 1, 2]`;
  - [ ] Botão "← VOLTAR AO INÍCIO" retorna à `HomeScreen`.
- [ ] **Isolamento de Estado:** Nenhuma ação no tutorial incrementa ou contamina as métricas de campanha de `App.tsx`.
 
---
 
### 2.15. Modo Replay da Execução (`ReplayScreen`) (P1.3, ADR 0004)
- [ ] **Acesso:** Acessível a partir de `ResultScreen` via botão `[ ▶ VER EXECUÇÃO ]`.
- [ ] **Quadro 0 (Estado Inicial):**
  - [ ] Exibe `PASSO 0 / N`;
  - [ ] Exibe badge "ESTADO INICIAL";
  - [ ] Exibe a disposição original do vetor (`initialArray`) sem par selecionado;
  - [ ] Nenhuma caixa exibe badge `OK` (exceto vetores de tamanho $\le 1$).
- [ ] **Navegação Manual:**
  - [ ] Clicar em "PRÓXIMO →" avança para o passo subsequente (desabilitado no último passo);
  - [ ] Clicar em "← ANTERIOR" recua para o passo antecedente (desabilitado no passo 0);
  - [ ] Clicar em "↺ REINICIAR" retorna imediatamente para o Passo 0.
- [ ] **Apresentação de Cada Passo (Quadros 1 a N):**
  - [ ] Exibe `PASSO X / Y`;
  - [ ] Exibe badge de ação: `⇄ TROCA REALIZADA (SWAP)` ou `= ORDEM MANTIDA (KEEP)`;
  - [ ] Exibe passada (`Passada i/total`) e comparação (`Comparação j/total`);
  - [ ] Exibe valores comparados ($A[j] > A[j+1]$ ou $A[j] \le A[j+1]$);
  - [ ] Destaca o par sob escrutínio via `NumberedBox` com borda ativa ciano (`selected={true}`);
  - [ ] Exibe elementos já consolidados com borda verde e selo `OK` (`sorted={true}`);
  - [ ] Exibe explicação factual concisa do passo no callout central.
- [ ] **Reprodução Automática (Autoplay):**
  - [ ] Clicar em "▶ REPRODUZIR" inicia avanço automático a cada 1200ms e muda botão para "⏸ PAUSAR";
  - [ ] Clicar em "⏸ PAUSAR" interrompe o avanço automático;
  - [ ] Se o autoplay atingir o último passo, interrompe-se automaticamente e reabilita o botão "▶ REPRODUZIR";
  - [ ] Clicar em "ANTERIOR", "PRÓXIMO" ou "REINICIAR" durante a reprodução pausa o autoplay.
- [ ] **Retorno e Preservação de Estado:**
  - [ ] Clicar em "← VOLTAR AO RESULTADO" retorna diretamente para `ResultScreen`;
  - [ ] Todas as métricas da fase (`comparisons`, `swaps`, `errors`, `hintsUsed`) permanecem estritamente intactas;
  - [ ] Os botões "↺ REPETIR FASE" e "PRÓXIMA FASE →" continuam plenamente funcionais.
- [ ] **Genérico por Fase:** Testado e aprovado nas Fases 1, 2 e 3.

---

### 2.16. Pseudocódigo Sincronizado no Replay (`BubbleSortPseudocodePanel`) (P1.4, ADR 0005)
- [ ] **Visibilidade e Layout:** O painel de pseudocódigo é renderizado na `ReplayScreen` logo abaixo da esteira, com tipografia monospace sci-fi legível.
- [ ] **Quadro 0 (Estado Inicial):**
  - [ ] Linha 1 (`procedimento bubbleSort(A)`) destacada com contorno neutro;
  - [ ] Nenhuma condição avaliada;
  - [ ] Painel contextual indica estado inicial e carga na esteira antes da primeira iteração.
- [ ] **Quadros de KEEP (Ordem Mantida):**
  - [ ] Linha 4 (`se A[j] > A[j + 1] então`) destacada com badge `[FALSO]`;
  - [ ] Linha 5 (`trocar A[j] e A[j + 1]`) não é acionada;
  - [ ] Painel de valores concretos exibe $A[j]$ e $A[j+1]$, explicitando a condição falsa ($A[j] \le A[j+1]$).
- [ ] **Quadros de SWAP (Troca Realizada):**
  - [ ] Linha 4 exibe badge `[VERDADEIRO]`;
  - [ ] Linha 5 (`trocar A[j] e A[j + 1]`) recebe destaque primário roxo/ciano com badge `[⇄ EXECUTADO]`;
  - [ ] Painel de valores concretos exibe $A[j]$ e $A[j+1]$, explicitando a condição verdadeira ($A[j] > A[j+1]$) e a ação de permuta.
- [ ] **Sincronia com Todos os Modos de Navegação:**
  - [ ] Avançar via "PRÓXIMO" atualiza a linha destacada instantaneamente;
  - [ ] Recuar via "ANTERIOR" atualiza a linha destacada instantaneamente;
  - [ ] Autoplay avança o destaque a cada 1200ms em perfeita sincronia com as caixas;
  - [ ] Clicar em "REINICIAR" retorna imediatamente para o estado neutro de Passo 0.
- [ ] **Responsividade:** Em telas de menor resolução ou altura, o contêiner com rolagem suave (`overflow-y-auto`) permite visualizar a esteira, o pseudocódigo e os controles sem sobreposição.

---

### 2.17. Homologação e UX Polish do Módulo Bubble Sort (P1.5)
- [ ] **Consistência Terminológica Rigorosa:**
  - [ ] Termos diegéticos e algorítmicos alinhados: *Protocolo Bubble*, *Passada*, *Comparação*, *Trocar*, *Manter*, *Decisões Incorretas*, *Dicas Utilizadas*, *Replay*, *Cargas*, *Operador*, *Estação de Triagem*;
  - [ ] Título de métricas em `ResultScreen` padronizado como "MÉTRICAS DA FASE" (veto a "Relatório de Desempenho" ou fórmulas arbitrárias).
- [ ] **Esteira Linear Contínua em Telas Estreitas (Mobile / Viewports < 600px):**
  - [ ] As 4 caixas da Fase 1 permanecem centralizadas e contínuas;
  - [ ] As 5 caixas da Fase 2 permanecem centralizadas e contínuas;
  - [ ] As 6 caixas da Fase 3 **não sofrem quebra de linha** (`flex-wrap`), mantendo alinhamento contínuo sobre a esteira;
  - [ ] Rolagem horizontal fluida (`overflow-x-auto min-w-max`) sem corte nas caixas das extremidades;
  - [ ] Animações simétricas de troca (`animate-swap-left` / `animate-swap-right`) mantêm coerência física sem desalinhamento vertical.
- [ ] **Acessibilidade e Navegação por Teclado:**
  - [ ] Navegação via `Tab` alcança todas as caixas numeradas e botões de ação;
  - [ ] Anéis de foco nítidos de alto contraste (`focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2`);
  - [ ] Atributos `aria-label` descritivos em `NumberedBox` explicitam índice, valor, foco e consolidação;
  - [ ] Componente `InstructionPanel` possui `role="status"` e `aria-live="polite"`;
  - [ ] Informações críticas não dependem exclusivamente de cor: uso concomitante de badges (`PAR`, `OK`, `PKG`), ícones (`◈`, `⚠`, `✓`, `✕`, `⇄`, `=`) e textos.
- [ ] **Otimização da Carga Cognitiva:**
  - [ ] Caixas no `ReplayScreen` eliminam rótulos `#` inferiores duplicados (mantendo apenas o `#` superior nativo de `NumberedBox`);
  - [ ] Hierarquia visual no `GameScreen` privilegia: `Ação Atual` $\rightarrow$ `Consequência Imediata` $\rightarrow$ `Contexto Algorítmico`;
  - [ ] Painel de pseudocódigo sincronizado mantido exclusivamente em `ReplayScreen`, prevenindo divisão de atenção (*split-attention effect*) durante o gameplay ativo na esteira.
- [ ] **Unificação do Pseudocódigo Canônico:**
  - [ ] `ResultScreen` migrado para `BUBBLE_SORT_PSEUDOCODE` canônico em português, substituindo trecho legado em inglês.
- [ ] **Compatibilidade da Camada Narrativa:**
  - [ ] Terminologia validada como 100% aderente à futura introdução de personagens e diálogos da estação.


