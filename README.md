# 🧁 DESAFIO SENAI — DOCERIA GOURMET IANES

> **MVP (Produto Mínimo Viável)** de um sistema web simples, rápido e seguro para gerenciamento de estoque e controle automatizado de validade de doces, bolos e tortas.

---

## 🏫 Sobre o Projeto

Este projeto foi desenvolvido como parte do **Teste de Conhecimento** para o título de **Técnico de Desenvolvimento de Sistemas** no **SENAI**. 

### 📝 O Problema do Cliente
A **Doceria Gourmet IANES** expandiu suas operações e enfrenta dificuldades críticas para controlar a validade de suas produções usando cadernos manuais devido ao grande volume de vendas. Por comercializarem produtos altamente customizados (variados sabores de massas, recheios e coberturas) e com métricas de venda duplas (produtos por peso e produtos por porções/fatias), o cliente necessita de uma plataforma web capaz de monitorar o estoque em tempo real.

### 🎯 O Desafio (Escopo do MVP)
Desenvolver uma solução em um período sugerido de 4 horas que garanta que apenas usuários autenticados gerenciem o estoque de doces, emitindo alertas automáticos sobre proximidade de vencimento, controle de estoque baixo e permitindo o registro interno de quem realizou o descarte de produtos vencidos.

---

## 🛠️ Tecnologias e Stack Utilizada

Para cumprir os rígidos Requisitos Não-Funcionais (RNF) de desempenho e usabilidade, optou-se por uma arquitetura moderna e segregada:

### 🎨 Front-End (`/FRONT`)
* **React (Vite):** Framework rápido com renderização otimizada de componentes baseados em estado.
* **TypeScript:** Tipagem estrita de dados para mitigar erros em tempo de execução ao manipular categorias e lotes.
* **Tailwind CSS:** Estilização utilitária focada em design 100% responsivo para computadores e smartphones dentro da cozinha.
* **React Hook Form + Zod:** Validação robusta de esquemas em formulários, com coerção de dados para inputs numéricos.
* **TanStack Query (React Query) + Axios:** Gerenciamento de estado assíncrono com cache local e *polling* configurado para atualizações em tempo real.

### ⚙️ Back-End (`/BACK`)
* **Node.js:** Ambiente de execução JavaScript escalável do lado do servidor.
* **Express:** Framework minimalista para criação das APIs REST estruturadas.
* **JWT (JSON Web Tokens):** Autenticação segura via padrão `Bearer` para proteção das rotas privadas.
* **Bcrypt:** Criptografia e hashing de senhas antes de persistir dados no banco.

### 🗄️ Banco de Dados (`/BD`)
* **Banco Relacional SQL:** Modelagem lógica através de Diagrama de Entidade-Relacionamento (DER) que mapeia de forma íntegra o relacionamento entre Usuários, Categorias, Produtos e Movimentações de Lotes.

---

## 📐 Estrutura de Ramificações (Branches) do Git

O projeto adota o padrão de **Feature Branches** para garantir o isolamento do código e simular um ambiente profissional de engenharia de software:

* `main`: Linha do tempo principal estável. Contém apenas código testado e pronto para produção.
* `backend/desenvolvimento-api`: Construção do servidor, endpoints e segurança da API (`/BACK`).
* `frontend/desenvolvimento-telas`: Implementação da interface do usuário, modais e lógica de estado (`/FRONT`).

---

## 📋 Funcionalidades Cobertas (Requisitos)

### Requisitos Funcionais (RF) Mapeados
- **RF-001 ao RF-003 (Autenticação):** Sistema de login e cadastro com validações rígidas de senha (min. 8 dígitos, maiúscula, minúscula e número) e geração de token JWT.
- **RF-004 ao RF-006 (Catálogo):** CRUD completo de produtos (especificando recheio, cobertura e massa) e gerenciamento de categorias únicas.
- **RF-007 e RF-008 (Métricas de Lote):** Formulário dinâmico capaz de alternar entradas dependendo da métrica (Peso em Kg/g ou Porção em Unidades) com datas de fabricação e validade obrigatórias.
- **RF-009 (Dashboard):** Tela principal indexada por tipo e sabor exibindo o inventário em tempo real.
- **RF-012 (Status de Validade):** Mapeamento visual em três estados distintos:
  - 🟢 **No prazo:** Próprio para o consumo.
  - 🟡 **Alerta:** Próximo do vencimento (limite de dias configurável).
  - 🔴 **Vencido:** Alerta crítico em vermelho piscante demandando descarte.
- **RF-013 ao RF-015 (Notificações):** Polling contínuo de alta performance atuando no sino de notificações para alertar sobre validades críticas e estoques abaixo do limite mínimo configurado.

### Requisitos Não-Funcionais (RNF) Satisfeitos
- **RNF-001 (Segurança):** Senhas criptografadas no banco de dados.
- **RNF-002 (Autenticação):** Injeção do token no header das requisições via interceptor (`Authorization: Bearer <token>`) travando acessos não autorizados.
- **RNF-003 (Desempenho):** Polling do painel de notificações programado para bater no endpoint a cada 1.5 segundos, respeitando o teto de resposta menor que 2 segundos.
- **RNF-004 (Usabilidade):** Grid fluido construído sob a filosofia *Mobile-First*, permitindo a operação ágil do gerente Sidney pelo computador do caixa ou pelo celular na cozinha.

---

## 👥 Desenvolvedor e Stakeholders

* **Instituição:** SENAI (Serviço Nacional de Aprendizagem Industrial)
* **Curso:** Técnico de Desenvolvimento de Sistemas
* **Gerente de Projetos (Stakeholder):** Sidney
* **Desenvolvedor:** Sidney Campos Aragão
