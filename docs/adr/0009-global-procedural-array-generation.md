# ADR 0009: Infraestrutura Global de Geração Procedural de Vetores (P1.9)

- **Status:** Aceito
- **Data:** 2026-09-11
- **Autores:** Antigravity Agent & Equipe Sorting Station
- **Decisores:** Antigravity Agent & Usuário

---

## 1. Contexto e Declaração do Problema

Nas fases iniciais do **Sorting Station**, a campanha de Bubble Sort utilizava vetores numéricos fixos hardcoded (`[5, 2, 4, 1]`, `[6, 3, 8, 2, 5]` e `[9, 1, 7, 4, 3, 6]`). Embora úteis para prototipação pedagógica rápida, vetores fixos acarretavam severas limitações:
1. **Rejogabilidade Reduzida:** O jogador ou aluno enfrentava exatamente as mesmas caixas a cada execução, favorecendo a memorização mecânica em detrimento do raciocínio analítico sobre as regras do protocolo.
2. **Falta de Padronização para Futuros Algoritmos:** O roadmap do Sorting Station prevê múltiplos módulos algorítmicos (Selection Sort, Insertion Sort, Merge Sort, Quick Sort). Sem uma camada procedural compartilhada, cada novo algoritmo correria o risco de reinventar ou acoplar sua própria forma de geração de vetores.
3. **Necessidade de Comparabilidade Didática:** No ensino de estruturas de dados e algoritmos, um experimento fundamental consiste em submeter **exatamente o mesmo vetor inicial** (mesma semente) a diferentes algoritmos de ordenação para comparar passos, trocas e estabilidade.

Fazia-se necessária uma infraestrutura **global, determinística, pura e reutilizável**, introduzida durante o ciclo do Bubble Sort, mas **rigorosamente agnóstica** em relação a qualquer engine ou interface de usuário.

---

## 2. Decisão Arquitetural

### 2.1. Isolamento em Módulo Compartilhado (`src/game/generation/`)
A infraestrutura foi concebida sob o princípio da separação estrita de responsabilidades:
```
src/game/generation/
├── types.ts              # Contratos canônicos, configurações e classe ArrayGenerationError
├── prng.ts               # PRNG Mulberry32 de 32 bits e hash FNV-1a para sementes
├── constraints.ts        # Predicados matemáticos agnósticos e preset BUBBLE_CAMPAIGN_CONSTRAINTS
├── arrayGenerator.ts     # Algoritmo de amostragem, checagem, fallback e helper de fase
├── index.ts              # Ponto de entrada barrel export
└── arrayGenerator.test.ts # Testes unitários de determinismo, constraints e robustez
```
**Regra Inegociável:** Nenhum arquivo de `src/game/generation/` importa `bubbleSortEngine` ou qualquer engine de ordenação.

### 2.2. PRNG Determinístico Mulberry32 e Normalização de Seeds
- Adotou-se o algoritmo **Mulberry32**, gerando números pseudoaleatórios no intervalo $[0, 1)$ a partir de um estado unsigned de 32 bits.
- Implementou-se `hashSeed(seed: SeedInput)`: inteiros não-negativos de 32 bits são preservados; strings ou números fora do intervalo são convertidos deterministicamente via dispersão **FNV-1a 32-bit**.
- Sementes dinâmicas são criadas unicamente na inicialização da rodada através de entropia do ambiente (`sort-<timestamp>-<rand>`), garantindo que, uma vez gerada a semente, todo o processo subsequente seja 100% determinístico e reproduzível.

### 2.3. Amostragem sem Rejeição Randomizada e Imutabilidade
- Para `allowDuplicates: false` em ranges $\le 1000$ (como o padrão $1..99$), o gerador executa um embaralhamento parcial **Fisher-Yates** sobre um pool pré-alocado. Isso garante complexidade temporal estrita $O(\text{range} + \text{length})$, eliminando loops de rejeição estatística.
- O vetor resultante retornado em `GeneratedArrayResult.values` é explicitamente congelado via `Object.freeze`, impedindo mutações acidentais por parte das telas ou das engines de ordenação.

### 2.4. Constraints Agnósticas e Presets Desacoplados
O gerador base universal aceita uma lista de `constraints` configuráveis:
- A regra `notAlreadySorted` **não** é embutida no núcleo universal (o gerador pode produzir vetores previamente ordenados caso requisitado, como no modo Early Exit).
- Para a campanha normal do Bubble Sort, definiu-se externamente o preset imutável `BUBBLE_CAMPAIGN_CONSTRAINTS`:
  1. `not-sorted`: ao menos uma inversão adjacente;
  2. `not-reverse-sorted`: ao menos um par adjacente em ordem;
  3. `has-swap`: ao menos um par que gere a ação pedagógica TROCAR;
  4. `has-keep`: ao menos um par que gere a ação pedagógica MANTER.

### 2.5. Estratégia de Fallback Estruturado e Ausência de Loops Infinitos
- O fallback universal **não recorre a vetores históricos legados** (`[5,2,4,1]`, etc.).
- Caso `maxAttempts` (default 50) seja atingido, sintetiza padrões estruturais determinísticos derivados dos limites `[minValue, maxValue]` (padrões zig-zag alternados, rotações circulares e inversões parciais) e testa-os contra as constraints.
- Caso as constraints sejam matematicamente contraditórias ou impossíveis (ex.: exigir simultaneamente `isAlreadySorted` e `isNotSorted`), o gerador **falha de maneira explícita, previsível e testável** lançando `ArrayGenerationError`, nunca entrando em loop infinito e nunca retornando silenciosamente um vetor inválido.

### 2.6. Ciclo de Vida da Sessão e Preservação de Vetores
1. **Nova Fase 1 / Iniciar Turno / Rejogar Campanha:** Gera nova semente e novo vetor procedural de tamanho 4.
2. **Avanço de Fase (`handleNextPhase`):** Gera nova semente e novo vetor para Fase 2 (tamanho 5) e Fase 3 (tamanho 6).
3. **Reinício de Fase (`handleRepeat` e Reset em Jogo):** Mantém rigorosamente o **MESMO vetor** e a **MESMA semente**, permitindo que o aluno tente novamente com os mesmos dados.
4. **Tutorial e Modo Desafio:** Mantêm seus vetores curados fixos (`[3, 1, 2]` no tutorial e cenários específicos no Early Exit).
5. **Replay de Execução:** Consome unicamente `initialArray` e `history` gerados durante a rodada real; **nunca regenera o vetor via semente**.
6. **Persistência Schema v2:** Sementes e vetores correntes são voláteis em memória de sessão e não alteram o Schema v2 do `localStorage`.

---

## 3. Consequências e Validação

- **Compatibilidade:** O contrato de `GameScreen`, `ResultScreen`, `ReplayScreen` e `BubbleSortState` foi tipado com `readonly number[]`, garantindo integração segura com vetores congelados.
- **Suíte de Testes:** Adicionados testes unitários cobrindo determinismo, dispersão de seeds, integridade de tamanho/intervalo, constraints, fallback, imutabilidade e ausência de loops infinitos. Total de 157 testes automatizados aprovados no Vitest.
- **Prontidão Multi-Algoritmo:** A função `generateSortingArray` está apta a fornecer vetores comparáveis para qualquer algoritmo que venha a ser implementado no Sorting Station.
