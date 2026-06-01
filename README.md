# 🧁 DESAFIO SENAI — DOCERIA GOURMET IANES

> [cite_start]**MVP (Produto Mínimo Viável)** de um sistema web simples, rápido e seguro para gerenciamento de estoque e controle automatizado de validade de doces, bolos e tortas[cite: 86, 118].

---

## 🏫 Sobre o Projeto

[cite_start]Este projeto foi desenvolvido como parte do **Teste de Conhecimento** para o título de **Técnico de Desenvolvimento de Sistemas** no **SENAI**[cite: 112, 113]. 

### 📝 O Problema do Cliente
[cite_start]A **Doceria Gourmet IANES** expandiu suas operações e enfrenta dificuldades críticas para controlar a validade de suas produções usando cadernos manuais devido ao grande volume de vendas[cite: 84, 114]. [cite_start]Por comercializarem produtos altamente customizados (variados sabores de massas, recheios e coberturas) [cite: 85, 115] [cite_start]e com métricas de venda duplas (produtos por peso e produtos por porções/fatias) [cite: 86, 116][cite_start], o cliente necessita de uma plataforma web capaz de monitorar o estoque em tempo real[cite: 86, 117].

### 🎯 O Desafio (Escopo do MVP)
[cite_start]Desenvolver uma solução em um período sugerido de 4 horas [cite: 118] [cite_start]que garanta que apenas usuários autenticados gerenciem o estoque de doces [cite: 119][cite_start], emitindo alertas automáticos sobre proximidade de vencimento [cite: 119, 160][cite_start], controle de estoque baixo [cite: 110] [cite_start]e permitindo o registro interno de quem realizou o descarte de produtos vencidos[cite: 119].

---

## 🛠️ Tecnologias e Stack Utilizada

[cite_start]Para cumprir os rígidos Requisitos Não-Funcionais (RNF) de desempenho e usabilidade[cite: 87, 88], optou-se por uma arquitetura moderna e segregada:

### 🎨 Front-End (`/FRONT`)
* **React (Vite):** Framework rápido com renderização otimizada de componentes baseados em estado.
* **TypeScript:** Tipagem estrita de dados para mitigar erros em tempo de execução ao manipular categorias e lotes.
* [cite_start]**Tailwind CSS:** Estilização utilitária focada em design 100% responsivo para computadores e smartphones dentro da cozinha[cite: 88].
* **React Hook Form + Zod:** Validação robusta de esquemas em formulários, com coerção de dados para inputs numéricos.
* [cite_start]**TanStack Query (React Query) + Axios:** Gerenciamento de estado assíncrono com cache local e *polling* configurado para atualizações em tempo real[cite: 87].

### ⚙️ Back-End (`/BACK`)
* [cite_start]**Node.js:** Ambiente de execução JavaScript escalável do lado do servidor[cite: 134].
* **Express:** Framework minimalista para criação das APIs REST estruturadas.
* [cite_start]**JWT (JSON Web Tokens):** Autenticação segura via padrão `Bearer` para proteção das rotas privadas[cite: 87].
* [cite_start]**Bcrypt:** Criptografia e hashing de senhas antes de persistir dados no banco[cite: 86].

### 🗄️ Banco de Dados (`/BD`)
* [cite_start]**Banco Relacional SQL:** Modelagem lógica através de Diagrama de Entidade-Relacionamento (DER) [cite: 127] [cite_start]que mapeia de forma íntegra o relacionamento entre Usuários, Categorias, Produtos e Movimentações de Lotes[cite: 94, 96, 104].

---

## 📐 Estrutura de Ramificações (Branches) do Git

O projeto adota o padrão de **Feature Branches** para garantir o isolamento do código e simular um ambiente profissional de engenharia de software:

* `main`: Linha do tempo principal estável. Contém apenas código testado e pronto para produção.
* [cite_start]`backend/desenvolvimento-api`: Construção do servidor, endpoints e segurança da API (`/BACK`)[cite: 133].
* [cite_start]`frontend/desenvolvimento-`: Implementação da interface do usuário, modais e lógica de estado (`/FRONT`)[cite: 144].

---

## 📋 Funcionalidades Cobertas (Requisitos)

### Requisitos Funcionais (RF) Mapeados
- [cite_start]**RF-001 ao RF-003 (Autenticação):** Sistema de login e cadastro com validações rígidas de senha (min. 8 dígitos, maiúscula, minúscula e número) e geração de token JWT[cite: 92, 94].
- [cite_start]**RF-004 ao RF-006 (Catálogo):** CRUD completo de produtos (especificando recheio, cobertura e massa) e gerenciamento de categorias únicas[cite: 95, 97, 98].
- [cite_start]**RF-007 e RF-008 (Métricas de Lote):** Formulário dinâmico capaz de alternar entradas dependendo da métrica (Peso em Kg/g ou Porção em Unidades) com datas de fabricação e validade obrigatórias[cite: 98, 99, 101, 102].
- [cite_start]**RF-009 (Dashboard):** Tela principal indexada por tipo e sabor exibindo o inventário em tempo real[cite: 103].
- **RF-012 (Status de Validade):** Mapeamento visual em três estados distintos:
  - [cite_start]🟢 **No prazo:** Próprio para o consumo[cite: 107].
  - [cite_start]🟡 **Alerta:** Próximo do vencimento (limite de dias configurável)[cite: 108, 109].
  - [cite_start]🔴 **Vencido:** Alerta crítico em vermelho piscante demandando descarte[cite: 108, 109].
- [cite_start]**RF-013 ao RF-015 (Notificações):** Polling contínuo de alta performance atuando no sino de notificações para alertar sobre validades críticas e estoques abaixo do limite mínimo configurado[cite: 109, 110].

### Requisitos Não-Funcionais (RNF) Satisfeitos
- [cite_start]**RNF-001 (Segurança):** Senhas criptografadas no banco de dados[cite: 86].
- [cite_start]**RNF-002 (Autenticação):** Injeção do token no header das requisições via interceptor (`Authorization: Bearer <token>`) travando acessos não autorizados[cite: 87].
- [cite_start]**RNF-003 (Desempenho):** Polling do painel de notificações programado para bater no endpoint a cada 1.5 segundos, respeitando o teto de resposta menor que 2 segundos[cite: 87].
- [cite_start]**RNF-004 (Usabilidade):** Grid fluido construído sob a filosofia *Mobile-First*, permitindo a operação ágil do gerente Sidney pelo computador do caixa ou pelo celular na cozinha[cite: 88].

---

## 👥 Desenvolvedor e Stakeholders

* [cite_start]**Instituição:** SENAI (Serviço Nacional de Aprendizagem Industrial) 
* [cite_start]**Curso:** Técnico de Desenvolvimento de Sistemas [cite: 113]
* [cite_start]**Gerente de Projetos (Stakeholder):** Sidney 
* **Desenvolvedor:** [Seu Nome Aqui]
