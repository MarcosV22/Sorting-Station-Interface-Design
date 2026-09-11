# ADR 0007: Pontuação do Protocolo e Tempo Descritivo de Operação (P1.7)

- **Status:** Aceito
- **Data:** 2026-09-11
- **Autores:** Antigravity Agent & Equipe Sorting Station
- **Decisores:** Antigravity Agent & Usuário

---

## 1. Contexto e Declaração do Problema

Até o marco P1.6, o **Sorting Station** registrava exclusivamente métricas factuais brutas da sessão (`comparisons`, `swaps`, `errors`, `hintsUsed`) e o registro booleano de conclusão de fases (`completed`, `completedAt`). Não existia uma síntese de conformidade da rodada para feedback imediato do operador, nem registro factual do tempo de operação da esteira.

Além disso, a formulação original do roadmap para P1.7 continha premissas algorítmicas obsoletas ao sugerir que o jogador deveria "minimizar comparações e trocas desnecessárias". O diagnóstico factual formal realizado em **P1.7-A** demonstrou que:
1. No Bubble Sort tradicional com FSM canônica, o número de comparações é um invariante matemático fixo ($n(n-1)/2 = 6, 10, 15$), absolutamente fora do controle do operador;
2. Trocas desnecessárias não são executadas pela esteira; quando o jogador tenta uma troca indevida, a FSM rejeita a transição, contabiliza um erro pedagógico (`errors++`) e mantém o vetor íntegro;
3. As únicas variáveis que dependem genuinamente do comportamento do operador durante a execução da fase são:
   - **`errors`**: Decisões incorretas de classificação (tentar trocar caixas já ordenadas ou manter caixas desordenadas);
   - **`hintsUsed`**: Solicitações explícitas de auxílio pedagógico (dicas);
   - **Tempo decorrido**: Duração factual da operação na esteira.

Fazia-se necessário definir:
1. Uma fórmula transparente, determinística e puramente lúdica de pontuação por fase;
2. Uma métrica factual de tempo decorrido que não penalizasse o usuário nem estimulasse pressa em detrimento do raciocínio analítico;
3. O enquadramento pedagógico correto para a busca de ajuda (dicas), evitando estigmatização da dúvida;
4. A evolução formal da camada de persistência para o **Schema v2** (`schemaVersion: 2`) com migração transparente retrocompatível dos saves de P1.6 e regras estritas de atualização de recordes.

---

## 2. Decisão Arquitetural

### 2.1. Fórmula Canônica da Pontuação do Protocolo
Cria-se o módulo funcional puro `src/game/session/protocolScore.ts`, completamente desacoplado de React e de efeitos colaterais.

A fórmula canônica implementada é:
$$\text{score} = \max(0, 100 - (\text{errors} \times 10) - (\text{hintsUsed} \times 5))$$

**Regras Fundamentais da Pontuação:**
- A pontuação varia de $0$ a $100$;
- Uma rodada perfeita ($0\text{ erros} + 0\text{ dicas}$) resulta em $100$ pontos;
- Cada decisão incorreta (`errors`) reduz $10$ pontos;
- Cada dica solicitada (`hintsUsed`) reduz $5$ pontos;
- Comparações (`comparisons`) têm peso $0$ na pontuação;
- Trocas (`swaps`) têm peso $0$ na pontuação;
- Tempo decorrido (`elapsedTimeMs`) tem peso $0$ na pontuação;
- Determinismo absoluto, sem variáveis ocultas e com corte defensivo em zero ($\text{clamp} \ge 0$).

### 2.2. Nomenclatura Obrigatória e Rigor Epistemológico
- **Nomenclatura Canônica na Interface:** `PONTUAÇÃO DO PROTOCOLO`.
- **Termos Proibidos:** Fica terminantemente vetado o uso de nomenclaturas que aleguem avaliar competência cognitiva ou aprendizado conceitual, tais como: *"Nota de Aprendizado"*, *"Domínio Algorítmico"*, *"Desempenho Cognitivo"*, *"Precisão do Protocolo"* ou *"Eficiência"*.
- **Postura Pedagógica:** A documentação e os comentários de código registram explicitamente que a pontuação é uma métrica lúdica de conformidade operacional da sessão imediata, e **NÃO** uma medida psicométrica ou pedagógica validada de aprendizagem.

### 2.3. Enquadramento Pedagógico da Busca de Ajuda (Help-Seeking)
A dedução de 5 pontos por dica não constitui punição, mas balanceamento lúdico da sessão. A interface comunica de forma neutra e respeitosa:
> *"Dicas auxiliam durante a operação e reduzem 5 pontos da pontuação da rodada."*

A interface não exibe mensagens pejorativas ou que gerem aversão ao pedido de auxílio pedagógico.

### 2.4. Tempo Descritivo de Operação (`elapsedTimeMs`)
- Medição realizada por temporizador monotônico (`performance.now()`), garantindo precisão imune a ajustes de relógio do sistema operacional;
- Inicia no momento em que a tela da fase é carregada;
- Reinicia integralmente quando o operador clica em `↺ REINICIAR FASE`;
- Congela imediatamente no momento exato em que o último passo do algoritmo é concluído;
- Telas de transição (`ResultScreen`, `ReplayScreen` e `CampaignCompleteScreen`) não continuam a contagem;
- Formatador puro `formatElapsedTime(elapsedTimeMs)` converte valores legíveis:
  - $< 60\text{s}$: `42s`, `5s`;
  - $\ge 60\text{s}$: `01:18`, `02:05`, `10:00`.
- **Axioma Temporal:** O tempo é meramente descritivo. Não há temporizadores regressivos (*countdowns*), limites de tempo ou alertas em vermelho que induzam estresse cognitivo.

### 2.5. Evolução da Persistência para Schema v2 e Migração
Evolui-se o schema canônico local de `schemaVersion: 1` para `schemaVersion: 2`:

```typescript
export interface PhaseRecord {
  readonly completed: boolean;
  readonly completedAt: string;
  readonly bestScore?: number;
  readonly bestScoreErrors?: number;
  readonly bestScoreHintsUsed?: number;
  readonly bestScoreElapsedTimeMs?: number;
}
```

- **Retrocompatibilidade e Migração Explícita:**
  Saves gravados no formato v1 da P1.6 são lidos normalmente, preservando integralmente `unlockedPhases`, `highestPhaseReached`, `hasCompletedTutorial`, registros de conclusão (`completed`, `completedAt`) e `preferences`. O schema é promovido para `schemaVersion: 2` de forma transparente e gravado sem perda de dados.
- **Regra de Recorde da Fase:**
  Ao concluir uma fase, o recorde é atualizado se e somente se:
  1. $\text{newScore} > \text{bestScore}$; **OU**
  2. $\text{newScore} == \text{bestScore} \land \text{newErrors} < \text{bestScoreErrors}$.
- **Exclusão do Tempo no Desempate:**
  O tempo decorrido **NUNCA** é utilizado como critério de desempate. Se score e erros forem idênticos, o recorde pré-existente é preservado. Isso impede que o jogador sacrificie reflexão conceitual por velocidade.

### 2.6. Adaptação das Telas da Interface
- **`ResultScreen`:** Exibe em destaque a `PONTUAÇÃO DO PROTOCOLO` (`{score} / 100`), o subtítulo explicativo discreto (*"Erros: -10 | Dicas: -5 | Tempo não afeta a pontuação"*) e o card factual contendo Comparações, Trocas, Decisões Incorretas, Dicas Utilizadas e Tempo de Operação formatado.
- **`CampaignCompleteScreen`:** Apresenta no cartão de cada fase a pontuação obtida e o tempo de operação. Não são introduzidas médias globais, notas finais agregadas, estrelas ou rankings A/B/C.

---

## 3. Consequências

### Positivas:
- **Transparência Pedagógica Total:** O operador entende exatamente como sua pontuação foi calculada, sem fórmulas secretas ou penalidades arbitrárias;
- **Preservação do Foco Conceitual:** Ao dissociar o tempo da pontuação e do desempate, o jogo valoriza a precisão algorítmica e a compreensão lógica;
- **Migração Suave de Dados:** Usuários existentes mantêm seu histórico de progressão sem corrupção ou perda de estado;
- **Isolamento e Testabilidade:** Módulos de pontuação e formatação são 100% testados isoladamente e as regras de recorde possuem cobertura de testes exaustiva.

### Neutras / Compensações:
- O armazenamento local precisa gerenciar os campos adicionais de recordes em `PhaseRecord`, mas com sobrecarga desprezível (< 200 bytes adicionais por save).

---

## 4. Conformidade e Validação

- 106 testes automatizados executados e aprovados via Vitest (`test:run`);
- Verificação estrita de tipagem via TypeScript (`tsc --noEmit`) sem erros;
- Build de produção verificado com sucesso via Vite (`pnpm run build`);
- Preflight e Post-Task de documentação executados em estrita concordância com `AGENTS.md`.
