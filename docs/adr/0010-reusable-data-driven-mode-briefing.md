# ADR 0010: Tela Intermediária de Briefing Orientada a Dados e Desacoplada

- **Status:** Aceito
- **Data:** 2026-09-11
- **Autores:** Marcos Mendes / Antigravity AI
- **Decisores:** Mantenedores do Sorting Station

---

## 1. Contexto e Declaração do Problema

Com a introdução do Modo Desafio (Variante Bubble Sort Early Exit - P1.8) e da geração procedural de vetores (P1.9), os botões da tela inicial (`HomeScreen`) iniciavam imediatamente a esteira de jogo. Essa transição abrupta gerava dois problemas críticos:
1. **Sobrecarga Cognitiva e Falta de Contexto Pedagógico:** O operador era colocado diretamente diante da esteira sem assimilar os objetivos do modo escolhido (Canônico vs Early Exit), as regras de interação ou as diferenças algorítmicas fundamentais.
2. **Consumo Precipitado de Geração Procedural:** Iniciar o gameplay imediatamente gerava sementes e vetores voláteis na memória de sessão mesmo se o jogador desejasse apenas explorar as opções e retornar.

Era imperativo introduzir uma tela intermediária de briefing que esclarecesse o modo, seus objetivos operacionais, as ações na esteira e as particularidades teóricas, além de postergar a geração da semente e do lote de cargas para o clique no CTA de início, mantendo uma arquitetura escalável e reutilizável para futuros algoritmos (Selection Sort, Insertion Sort, etc.).

---

## 2. Decisão Arquitetural

Decidiu-se:
1. **Criar a Infraestrutura Reutilizável de Briefing (`src/game/briefing/`):**
   - Definir o contrato formal de dados `ProtocolModeBriefing` contendo metadados, objetivo operacional, lista de instruções estruturadas em cartões, particularidades, destaques de telemetria e rótulo do CTA;
   - Catalogar os briefings canônico e de Early Exit de forma declarativa e pura, sem qualquer dependência ou acoplamento com a engine de ordenação (`BubbleSortEngine`);
   - Disponibilizar funções utilitárias puras de resolução (`getBriefingForMode` e `getBriefingForGameMode`).
2. **Implementar a Tela Genérica `ProtocolModeBriefingScreen` (`src/screens/ProtocolModeBriefingScreen.tsx`):**
   - Componente React 100% orientado a dados, que renderiza visualmente qualquer especificação compatível com o contrato `ProtocolModeBriefing`;
   - Sem lógica hardcoded de Bubble Sort, permitindo atendimento imediato a futuros protocolos (Selection, Insertion, Merge Sort);
   - Aderência aos tokens visuais sci-fi (Orbitron, Space Mono, Exo 2, brilhos ambientais e cartões com contraste).
3. **Fluxo de Navegação e Geração Tardia em `src/App.tsx`:**
   - Transição intermediária: `Home` / `CampaignComplete` $\rightarrow$ `ModeBriefingScreen` $\rightarrow$ `GameScreen`;
   - O botão `[ VOLTAR ]` no briefing retorna o operador para a tela de origem (`"home"` ou `"campaign-complete"`) sem gerar nenhum vetor, sem consumir sementes e sem alterar métricas salvas;
   - A invocação do gerador procedural (`generateBubblePhaseArray(1)`) só ocorre quando o operador clica explicitamente em `[ INICIAR TREINAMENTO ]`.

---

## 3. Alternativas Consideradas

- **Alternativa A: Telas hardcoded separadas para cada modo (`CanonicalBriefingScreen`, `ChallengeBriefingScreen`).**  
  *Por que foi descartada:* Geraria duplicação maciça de código visual, violaria o princípio DRY e exigiria criar novas telas para cada novo algoritmo inserido no projeto (Selection, Insertion, etc.).
- **Alternativa B: Modais sobrepostos na HomeScreen.**  
  *Por que foi descartada:* Limita o espaço visual em telas menores/mobile, fragmenta a máquina de estados baseada em `screen` e prejudica a imersão diegética na Central Logística.
- **Alternativa C: Gerar a seed procedural logo na seleção do modo na Home.**  
  *Por que foi descartada:* Consumiria recursos e descartaria sementes desnecessariamente caso o usuário clicasse em "VOLTAR", violando a integridade da rodada.

---

## 4. Consequências e Trade-offs

### 4.1. Consequências Positivas (Ganhos)
- **Preparação Cognitiva Adequada:** O estudante entende o que esperar de cada variante antes de interagir cinestesicamente com as cargas.
- **Economia e Precisão da Geração:** A semente e o vetor são instanciados exclusivamente quando a partida é efetivamente deflagrada.
- **Extensibilidade Multi-Protocolo:** Novos algoritmos necessitam apenas de uma entrada no catálogo `BRIEFING_CATALOG` para dispor de sua tela de apresentação.
- **Acessibilidade e Usabilidade:** Elementos semânticos reais, suporte responsivo completo e retorno seguro à origem.

### 4.2. Consequências Negativas ou Custos (Trade-offs)
- Adição de um passo intermediário (clique adicional) entre a seleção do modo e o início do gameplay, compensado pela clareza pedagógica obtida.

---

## 5. Riscos e Mitigações

| Risco Identificado | Severidade | Estratégia de Mitigação |
| :--- | :--- | :--- |
| Usuário clicar em Voltar e perder progresso | Baixa | A navegação de briefing opera sem efeitos colaterais e preserva o Schema v2 intacto. |
| Texto de briefing excessivamente longo (fadiga de leitura) | Média | Estruturação em 4 cartões concisos com ícones, limitando a leitura ao essencial operacional. |

---

## 6. Links e Referências

- **Código-fonte Afetado:**
  - [`src/game/briefing/types.ts`](../../src/game/briefing/types.ts)
  - [`src/game/briefing/briefingCatalog.ts`](../../src/game/briefing/briefingCatalog.ts)
  - [`src/screens/ProtocolModeBriefingScreen.tsx`](../../src/screens/ProtocolModeBriefingScreen.tsx)
  - [`src/App.tsx`](../../src/App.tsx)
- **Documentos da Wiki Relacionados:**
  - [`docs/wiki/03-frontend.md`](../wiki/03-frontend.md)
  - [`docs/wiki/05-ux-design-system.md`](../wiki/05-ux-design-system.md)
  - [`docs/wiki/10-roadmap.md`](../wiki/10-roadmap.md)
  - [`docs/wiki/12-pedagogy-and-academic-traceability.md`](../wiki/12-pedagogy-and-academic-traceability.md)
- **ADRs Anteriores:** [ADR 0008](./0008-bubble-sort-early-exit-variant.md), [ADR 0009](./0009-global-procedural-array-generation.md).
