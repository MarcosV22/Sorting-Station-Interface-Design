# ADR 0002: Encerramento da Campanha Bubble Sort e Agregação de Resultados em Memória

- **Status:** Aceito
- **Data:** 2026-09-10
- **Autores:** Agente de Desenvolvimento e Arquitetura
- **Decisores:** Equipe Técnica e Pedagógica do Sorting Station

---

## 1. Contexto e Declaração do Problema

No encerramento da Fase 3 do protótipo, a aplicação executava em `src/App.tsx`:
```typescript
const next = Math.min(phase + 1, PHASES.length);
setPhase(next);
```
Quando o jogador completava a última fase (`phase === 3`), o valor de `next` resultava em `Math.min(4, 3) = 3`. Clicar em "PRÓXIMA FASE →" em `ResultScreen` reiniciava a própria Fase 3 em um loop infinito sem qualquer sensação de vitória, conclusão de treinamento ou recompensa pedagógica.

Adicionalmente, os resultados das fases anteriores eram descartados ao avançar de fase, impossibilitando qualquer visão agregada do desempenho do operador no protocolo.

---

## 2. Decisão Arquitetural

1. **Máquina de Telas Explícita em `App.tsx`:**
   Adicionou-se o estado `"campaign-complete"` ao tipo `Screen`:
   ```typescript
   type Screen = "home" | "tutorial" | "game" | "result" | "campaign-complete";
   ```
2. **Eliminação do Loop da Fase 3:**
   Em `handleNextPhase`:
   - Se `phase < PHASES.length`, incrementa `phase` e transita para `"game"`;
   - Se `phase >= PHASES.length`, transita diretamente para `"campaign-complete"`.
3. **Comportamento Semântico em `ResultScreen`:**
   Adicionou-se a prop `hasNextPhase: boolean` (derivada de `phase < PHASES.length`). Quando `false`, o botão exibe `"CONCLUIR PROTOCOLO →"`.
4. **Agregação em Memória de Métricas Factuais:**
   Criou-se a camada pura `src/game/campaign/campaignSummary.ts` com a interface `PhaseResult` e a função pura `calculateCampaignSummary`. Os resultados das fases são acumulados no estado `phaseResults` de `App.tsx`.
5. **Tela de Homologação `CampaignCompleteScreen`:**
   Criação de `src/screens/CampaignCompleteScreen.tsx` apresentando a conclusão do Protocolo Bubble com métricas globais factuais (Fases Concluídas, Comparações Totais, Trocas Totais), sem métricas pseudocientíficas ou notas fictícias.
6. **Ações de Reinício e Saída:**
   - `"VOLTAR AO INÍCIO"` limpa os resultados em memória, reseta para Fase 1 e retorna para `HomeScreen`;
   - `"REJOGAR PROTOCOLO"` limpa os resultados em memória, reseta para Fase 1 e inicia nova partida sem recarregar a página.

---

## 3. Alternativas Consideradas

- **Alternativa A: Salvar resultados em `localStorage`.**  
  *Por que foi descartada:* Viola o escopo de P0.8. A persistência local está planejada para P1.4 após a definição de contratos de versão e antes da telemetria de pesquisa.
- **Alternativa B: Utilizar biblioteca global de estado (Zustand / Redux).**  
  *Por que foi descartada:* Sobre-engenharia desnecessária. O fluxo da aplicação é estritamente linear e o estado de `App.tsx` atende com simplicidade, desempenho e isolamento.

---

## 4. Consequências e Trade-offs

### 4.1. Consequências Positivas (Ganhos)
- Eliminação total do loop infinito na conclusão da Fase 3;
- Fechamento narrativo coerente ("Treinamento do Protocolo Bubble Concluído");
- Métricas factuais consolidadas apresentadas ao aluno de forma transparente;
- Cobertura por testes unitários da lógica de agregação em `src/game/campaign/campaignSummary.test.ts`.

### 4.2. Consequências Negativas ou Custos (Trade-offs)
- Atualizar a página do navegador (F5) reseta os resultados acumulados da campanha até que a persistência em P1 seja implementada.

---

## 5. Status de Verificação

- `pnpm run test:run`: 34 testes unitários passando (100%);
- `pnpm exec tsc --noEmit`: 0 erros;
- `pnpm run build`: Compilação em 326ms gerando artefatos limpos em `dist/`.
