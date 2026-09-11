# ADR 0012: Camada Pedagógica, Constraints Procedurais, Briefing e Tutorial Interativo do Selection Sort

- **Status:** Aceito
- **Data:** 2026-09-11
- **Autores:** Marcos Mendes / Antigravity AI
- **Decisores:** Mantenedores do Sorting Station

---

## 1. Contexto e Declaração do Problema

Com a conclusão da `SelectionSortEngine` pura em P2.1-B (ADR 0011), o domínio do Selection Sort ("Scanner de Carga Mínima") foi estabelecido formalmente. Entretanto, antes de lançar a campanha completa de 3 fases (P2.1-D), o projeto exigia a preparação da **camada pedagógica do protocolo** (P2.1-C), contemplando:

1. **Constraints procedurais específicas** para geração de vetores de Selection Sort (fases com comprimentos 4, 5 e 6, sem duplicados, não ordenados, não invertidos, garantindo momentos de decisão pedagógica rica como `KEEP_MIN` e múltiplas atualizações de mínimo);
2. **Briefing oficial orientado a dados**, integrado ao catálogo global sem duplicação de JSX de tela;
3. **Tutorial interativo de introdução**, utilizando a `SelectionSortEngine` real como única fonte de verdade sobre o vetor fixo `[4, 1, 3]`, reforçando visualmente os papéis semânticos (`ALVO`, `MÍN`, `SCAN`, `OK`) e demonstrando na prática que transferências físicas só ocorrem **depois** da varredura completa da partição.

---

## 2. Decisão Arquitetural

Decidiu-se:

### 2.1. Desacoplamento da Geração Procedural (`selectionConstraints.ts`)
- A infraestrutura global `src/game/generation/` permaneceu agnóstica e universal, sem importar nenhuma engine algorítmica específica;
- As restrições pedagógicas de Selection Sort foram implementadas em `src/game/sorting/selection/selectionConstraints.ts` através de predicados matemáticos puros:
  - `isGlobalMinNotInFirstPosition`: assegura que o mínimo global do lote não se encontra inicialmente no índice 0, garantindo necessidade de varredura com transferência real na primeira passada;
  - `hasAtLeastOneKeepMin`: simulação matemática pura comprovando a existência de ao menos uma inspeção onde a carga inspecionada é maior ou igual ao candidato corrente ($A[j] \ge A[minIndex]$);
  - `hasMultipleMinUpdatesInAtLeastOnePass`: nas fases maiores (5 e 6 caixas), favorece vetores que provoquem mais de uma atualização do ponteiro de mínimo em uma mesma varredura;
- Função de conveniência `generateSelectionPhaseArray(phase, seed)` gerando lotes determinísticos para fases 1 (tamanho 4), 2 (tamanho 5) e 3 (tamanho 6) no intervalo 1..99 sem repetições.

### 2.2. Briefing Orientado a Dados (`SELECTION_CANONICAL_BRIEFING`)
- Adicionada a entrada `"selection-canonical"` ao enum `BriefingModeId` e ao catálogo global `BRIEFING_CATALOG` em `src/game/briefing/`;
- Reutilização integral do componente `ProtocolModeBriefingScreen` sem duplicação de layouts JSX;
- Descrição clara da mecânica: posição alvo aguarda menor carga, scanner percorre partição não ordenada sem movimentar caixas, botões `NOVO MÍNIMO` vs `MANTER CANDIDATO`, término da varredura com no máximo uma transferência e consolidação com selo `OK`;
- CTA explícito: `"INICIAR SELECTION SORT"`.

### 2.3. Extensão Semântica do Componente `NumberedBox`
- Adicionado suporte a papéis semânticos via prop `role?: BoxRole` (`"target"`, `"min"`, `"target-min"`, `"scan"`, `"scan-min"`, `"sorted"`, `"pair"`, `"default"`);
- Múltiplos canais de identificação (badges textuais explícitos `ALVO`, `MÍN`, `SCAN`, `OK`, além de bordas coloridas e sombras semânticas), eliminando dependência exclusiva de cor;
- Compatibilidade reversa de 100% preservada para Bubble Sort (`selected` mapeia para role `"pair"`, `sorted` para role `"sorted"`).

### 2.4. Tutorial Interativo com Engine Real (`SelectionTutorialScreen.tsx`)
- Vetor canônico fixo: `[4, 1, 3]`;
- Fluxo de execução conduzido 100% pelo estado da `SelectionSortEngine`:
  - **Passada 1 ($i=0$):** $minIndex=0$ (4); $j=1$ (1) $\rightarrow$ `NOVO MÍNIMO` ($minIndex=1$); $j=2$ (3) $\rightarrow$ `MANTER CANDIDATO` ($minIndex=1$); fim da varredura $\rightarrow$ `TRANSFERIR MENOR CARGA` $\rightarrow$ vetor vira `[1, 4, 3]`, índice 0 consolidado (`OK`);
  - **Passada 2 ($i=1$):** $minIndex=1$ (4); $j=2$ (3) $\rightarrow$ `NOVO MÍNIMO` ($minIndex=2$); fim da varredura $\rightarrow$ `TRANSFERIR MENOR CARGA` $\rightarrow$ vetor vira `[1, 3, 4]`, tutorial concluído;
- Botões contextuais estritamente derivados da FSM:
  - Fase `INSPECT`: `[ ✦ NOVO MÍNIMO ]` e `[ = MANTER CANDIDATO ]`;
  - Fase `COMMIT`: `[ ⇄ TRANSFERIR MENOR CARGA ]` (quando $minIndex \neq i$) ou `[ ✓ CONSOLIDAR POSIÇÃO ]` (quando $minIndex = i$);
- Feedback formativo não punitivo: decisões incorretas não avançam a engine, mantêm a posição do scanner e do candidato, e explicam a relação de magnitude factual ($A[j] < A[minIndex]$);
- Animação de swap isolada para o momento do commit, tornando nítido ao estudante que no Selection Sort nenhuma carga se desloca fisicamente durante o escaneamento;
- Dicas contextuais com explicação do predicado condicional sem entregar apenas a resposta direta;
- Pontuação desacoplada: o tutorial não grava pontuação nem altera as fórmulas de score do protocolo.

### 2.5. Integração de Navegação Sem Fluxos Quebrados
- Inclusão do ponto de entrada do Selection Sort na tela inicial (`HomeScreen`), mantendo destaque do novo protocolo;
- Rota segura: `HomeScreen` $\rightarrow$ Briefing do Selection Sort $\rightarrow$ `SelectionTutorialScreen` $\rightarrow$ Retorno à `HomeScreen`;
- Nenhuma chamada para telas inexistentes (a futura campanha de 3 fases será conectada no marco P2.1-D).

---

## 3. Consequências

### Positivas
- **Isolamento de Domínio Mantido:** A geração universal (`generation/`) continua pura e desacoplada das engines;
- **Clareza Didática:** A separação física entre a varredura e a transferência única fica visualmente evidente no tutorial;
- **Acessibilidade Aumentada:** O uso de badges textuais (`ALVO`, `MÍN`, `SCAN`, `OK`) atende a diretrizes de design inclusivo (não dependência de cor);
- **Segurança de Navegação:** Fluxo fechado e sem rotas mortas;
- **Cobertura Completa de Testes:** 210 testes passando (100% de sucesso nas suítes de constraints, briefings e tutorial).

### Considerações Futuras
- O marco subsequente (P2.1-D) conectará a campanha completa de 3 fases do Selection Sort (`SelectionGameScreen`), o schema v3 de persistência e a gravação de métricas/replays.
