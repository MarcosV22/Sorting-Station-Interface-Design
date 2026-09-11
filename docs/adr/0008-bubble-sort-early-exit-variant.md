# ADR 0008: Variante Otimizada Bubble Sort Early Exit e Modo Desafio (P1.8)

- **Status:** Aceito
- **Data:** 2026-09-11
- **Autores:** Antigravity Agent & Equipe Sorting Station
- **Decisores:** Antigravity Agent & Usuário

---

## 1. Contexto e Declaração do Problema

O **Sorting Station** introduziu o Bubble Sort em seu modo canônico/didático (P0.2/P1.0), no qual a máquina de estados executa rigorosamente todas as $n(n-1)/2$ comparações formais entre pares adjacentes, independentemente do nível de pré-ordenação do vetor. Essa previsibilidade é essencial para a aprendizagem inicial da mecânica de varreduras repetidas.

No entanto, no estudo formal de algoritmos e complexidade computacional, o Bubble Sort clássico possui uma otimização consagrada: interromper a execução quando uma passada completa terminar sem que nenhuma troca tenha sido realizada ($\text{swapsInCurrentPass} = 0$). Isso permite reduzir a complexidade no melhor caso de $O(n^2)$ para $\Omega(n)$.

Fazia-se necessário introduzir esta variante no projeto sob requisitos estritos:
1. **Preservação Canônica:** O modo didático regular da campanha principal **não pode mudar** nem ser afetado por ramificações heurísticas.
2. **Motor Único:** Não duplicar a engine de ordenação; estender `BubbleSortState` e `executeBubbleSortStep` de forma limpa e tipada.
3. **Integridade do Histórico:** O array `history` deve registrar exclusivamente comparações reais executadas. O término precoce é metadado do estado final (`earlyExitTriggered`, `terminationPass`), não um passo fantasma.
4. **Isolamento de Persistência:** Não alterar o **Schema v2** nem injetar IDs artificiais (ex.: fases 101, 102). O desbloqueio deve ser puramente derivado da conclusão factual da campanha canônica existente.
5. **Rigor Pedagógico e de Pontuação:** A fórmula de pontuação de P1.7 não deve conceder pontos extras por comparações evitadas; o tempo continua factual e descritivo; e o pseudocódigo no replay deve sincronizar com a variante otimizada.

---

## 2. Decisão Arquitetural

### 2.1. Tipagem Explícita e Compatibilidade da Engine
Adicionou-se ao módulo de ordenação (`src/game/sorting/types.ts`):
```typescript
export type BubbleSortVariant = "CANONICAL" | "EARLY_EXIT";

export interface BubbleSortOptions {
  readonly variant?: BubbleSortVariant;
}
```
Campos integrados a `BubbleSortState`:
- `variant: BubbleSortVariant` (padrão `"CANONICAL"`);
- `earlyExitTriggered: boolean` (padrão `false`);
- `terminationPass?: number` (passada formal em que o término ocorreu).

A função `createBubbleSortState(values, options?)` mantém `"CANONICAL"` como padrão implícito retrocompatível.

### 2.2. Condição Formal de Interrupção Precoce
Na engine pura (`src/game/sorting/bubbleSortEngine.ts`), no encerramento de cada passada:
$$\text{isEndOfPass} \land \text{state.variant} = \text{"EARLY\_EXIT"} \land \text{swapsInCurrentPass} = 0$$
Quando satisfeita:
- `completed = true`;
- `status = "COMPLETED"`;
- `earlyExitTriggered = true`;
- `terminationPass = state.passIndex + 1`;
- `sortedBoundary = 0` (todos os elementos consolidados);
- Nenhuma passada subsequente é iniciada.
- Em modo `"CANONICAL"`, `earlyExitTriggered` permanece invariavelmente `false` e todas as $n(n-1)/2$ comparações ocorrem normalmente.

### 2.3. Vetores e Cenários Canônicos do Modo Desafio
Criou-se a especificação imutável `src/game/sorting/challengeScenarios.ts`:
1. **Cenário 1 — Vetor Já Ordenado (`[12, 25, 47, 63, 88]`):**
   - Melhor caso formal ($\Omega(n)$).
   - Executa 4 comparações (vs 10 canônicas). Economia de 6 comparações (60%).
2. **Cenário 2 — Quase Ordenado (`[15, 8, 23, 42, 60]`):**
   - Estabilização precoce na passada 2.
   - Executa 7 comparações (vs 10 canônicas). Economia de 3 comparações (30%).
3. **Cenário 3 — Pior Caso para Otimização (`[30, 45, 60, 75, 10]`):**
   - Inversão crítica ("elemento tartaruga" na ponta direita).
   - Executa todas as 10 comparações canônicas sem acionar Early Exit. Demonstra pedagogicamente o limite da heurística.

### 2.4. Desbloqueio e Persistência Desacoplada (Schema v2 Intacto)
O Modo Desafio é disponibilizado exclusivamente após a conclusão da campanha principal do Bubble Sort.
- Função pura `isChallengeModeUnlocked(saveData, maxPhases)` em `persistenceService.ts`, avaliando `saveData.records[maxPhases]?.completed`.
- **Zero mutações no Schema v2:** Não são criadas chaves artificiais no storage. O resultado das fases do desafio opera puramente em memória de sessão durante o gameplay.

### 2.5. Replay e Sincronização com Pseudocódigo Otimizado
- `buildReplayFrames(initialValues, history, { variant, earlyExitTriggered })`: Deriva quadros a partir do histórico real sem passos fantasmas. No último frame sob early exit, consolida `sortedIndices = [0..n-1]` e anexa nota factual explicativa.
- `BUBBLE_SORT_EARLY_EXIT_PSEUDOCODE`: Especificação de 14 linhas em `replayPseudocode.ts` com as diretivas `trocou <- falso`, `trocou <- verdadeiro`, `se não trocou então` e `interromper`.
- `getPseudocodeHighlight`: Destaque contextual dinâmico com iluminação de `CHECK_EARLY_EXIT` e `BREAK_STATEMENT` quando o término antecipado é sinalizado no quadro.

### 2.6. Fórmulas de Pontuação e Métricas Factuais
- **Fórmula de Pontuação:** Intocada:
  $$\text{score} = \max(0, 100 - (\text{errors} \times 10) - (\text{hintsUsed} \times 5))$$
  Comparações evitadas têm peso 0 no score para não distorcer a equivalência comportamental pedagógica.
- **Métricas Apresentadas em Tela:**
  - Comparações executadas;
  - Comparações canônicas de referência;
  - Comparações evitadas pela otimização ($\max(0, \text{canônicas} - \text{executadas})$);
  - Status de Early Exit (Sim/Não) e passada de término.

---

## 3. Consequências e Benefícios

### Positivas:
1. **Contraste Didático:** O operador vivencia na prática a diferença tangível entre o algoritmo ingênuo e o algoritmo otimizado com flag de troca.
2. **Robustez Estrutural:** O código legado da campanha, os 106 testes existentes e o schema de persistência permaneceram 100% íntegros e funcionais.
3. **Auditoria no Replay:** O replay pedagógico expõe com clareza o momento exato em que a esteira detectou 0 trocas e ativou o `break`.

### Negativas / Restrições Assumidas:
1. O Modo Desafio não persiste recordes de pontuação entre recarregamentos de página (F5) no Schema v2, mantendo sua execução como atividade interativa complementar até que um futuro schema com suporte a variantes seja deliberado.

---

## 4. Conformidade e Validação

- 122 testes automatizados executados e aprovados via Vitest (`pnpm run test:run`).
- Verificação de tipos TypeScript aprovada sem emissões de erro (`pnpm exec tsc --noEmit`).
- Empacotamento de produção concluído com sucesso (`pnpm run build`).
