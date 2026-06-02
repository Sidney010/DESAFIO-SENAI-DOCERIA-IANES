CREATE DATABASE doceria_ianes;
USE doceria_ianes;

CREATE TABLE tb_categoria (
    id_categoria INT NOT NULL AUTO_INCREMENT,
    nome_categoria VARCHAR(100) NOT NULL,
    CONSTRAINT pk_categoria PRIMARY KEY (id_categoria)
);

CREATE TABLE tb_usuario (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nome VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, 
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario)
);

CREATE TABLE tb_produto (
    id_produto INT NOT NULL AUTO_INCREMENT,
    nome_produto VARCHAR(150) NOT NULL,
    codigo_identificador INT NOT NULL UNIQUE,
    sabor_massa VARCHAR(100) NULL,   
    recheio VARCHAR(100) NULL,
    cobertura VARCHAR(100) NULL,
    detalhes VARCHAR(255) NULL, 
    limite_minimo_alerta INT NOT NULL DEFAULT 0,
    id_categoria INT NOT NULL,
    CONSTRAINT pk_produto PRIMARY KEY (id_produto),
    CONSTRAINT fk_produto_categoria FOREIGN KEY (id_categoria) 
        REFERENCES tb_categoria (id_categoria)
);

CREATE TABLE tb_lote (
    id_lote INT NOT NULL AUTO_INCREMENT,
    data_fabricacao DATETIME NOT NULL,
    data_vencimento DATE NOT NULL,
    tipo_medida VARCHAR(50) NOT NULL,
    quantidade_peso FLOAT NULL,        
    quantidade_porcoes INT NULL,       
    status_validade ENUM('No prazo', 'Alerta', 'Vencido') NOT NULL DEFAULT 'No prazo',
    id_produto INT NOT NULL,
    CONSTRAINT pk_lote PRIMARY KEY (id_lote),
    -- Se o produto for deletado, os lotes somem em cascata (Otimizado)
    CONSTRAINT fk_lote_produto FOREIGN KEY (id_produto) 
        REFERENCES tb_produto (id_produto) ON DELETE CASCADE
);

CREATE TABLE tb_movimentacao (
    id_movimentacao INT NOT NULL AUTO_INCREMENT,
    tipo_movimentacao ENUM('Entrada', 'Saida') NOT NULL,
    motivo VARCHAR(100) NOT NULL, 
    quantidade FLOAT NOT NULL,    
    data_hora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_lote INT NOT NULL,
    id_usuario INT NOT NULL,
    CONSTRAINT pk_movimentacao PRIMARY KEY (id_movimentacao),
    -- Protege o histórico de movimentações caso o lote ou usuário suma por acidente
    CONSTRAINT fk_movimentacao_lote FOREIGN KEY (id_lote) 
        REFERENCES tb_lote (id_lote) ON DELETE RESTRICT,
    CONSTRAINT fk_movimentacao_usuario FOREIGN KEY (id_usuario) 
        REFERENCES tb_usuario (id_usuario) ON DELETE RESTRICT
);



CREATE TABLE IF NOT EXISTS tb_recuperacao_senha (
    id_recuperacao  INT          NOT NULL AUTO_INCREMENT,
    id_usuario      INT          NOT NULL,
    codigo          CHAR(6)      NOT NULL,
    expira_em       DATETIME     NOT NULL,
    usado           BOOLEAN      NOT NULL DEFAULT FALSE,
    CONSTRAINT pk_recuperacao PRIMARY KEY (id_recuperacao),
    CONSTRAINT fk_recuperacao_usuario FOREIGN KEY (id_usuario)
        REFERENCES tb_usuario (id_usuario) ON DELETE CASCADE
);

-- ─── 1. Corrigir estrutura antes de inserir ───────────────────────────────────

-- Padroniza tipo_medida
ALTER TABLE tb_lote 
  MODIFY tipo_medida ENUM('peso', 'porcao') NOT NULL;

-- Padroniza data_fabricacao para DATE
ALTER TABLE tb_lote 
  MODIFY data_fabricacao DATE NOT NULL;

-- Remove acento do ENUM de movimentacao
ALTER TABLE tb_movimentacao 
  MODIFY tipo_movimentacao ENUM('Entrada', 'Saida') NOT NULL;


-- ─── 2. Novos produtos usando categorias existentes ───────────────────────────
-- Categorias disponíveis:
-- id 2 → Bolos deliciosos
-- id 3 → Torta
-- id 4 → Sobremesas
-- id 5 → Doces Gourmet

INSERT INTO tb_produto
  (nome_produto, codigo_identificador, sabor_massa, recheio, cobertura, detalhes, limite_minimo_alerta, id_categoria)
VALUES
  ('Bolo de Morango',               1004, 'Baunilha',   'Morango',       'Chantilly',          'Decorado com morangos',   5,  2),
  ('Cupcake Red Velvet',            1009, 'Red Velvet',  'Cream Cheese',  'Cream Cheese',       'Cupcake especial',        10, 2),
  ('Bolo de Cenoura',               1011, 'Cenoura',     'Chocolate',     'Chocolate',          'Cobertura cremosa',       5,  2),
  ('Torta Holandesa',               1005, NULL,          'Creme Holandes','Chocolate',          'Torta especial',          3,  3),
  ('Cheesecake de Frutas Vermelhas',1010, NULL,          'Cream Cheese',  'Frutas Vermelhas',   'Cheesecake artesanal',    4,  4),
  ('Pudim Tradicional',             1006, NULL,          NULL,            'Calda de Caramelo',  'Receita caseira',         5,  4),
  ('Brigadeiro Gourmet',            1007, NULL,          NULL,            'Granulado Belga',    'Unidade gourmet',         20, 5),
  ('Beijinho Gourmet',              1008, NULL,          NULL,            'Coco Ralado',        'Unidade gourmet',         20, 5),
  ('Brownie Tradicional',           1012, 'Chocolate',   NULL,            NULL,                 'Brownie artesanal',       10, 5);


-- ─── 3. Lotes para todos os produtos ─────────────────────────────────────────
-- Produtos existentes: id 1 e 2
-- Produtos recém inseridos: ids 3 a 11 (verifique com SELECT * FROM tb_produto)

INSERT INTO tb_lote
  (data_fabricacao, data_vencimento, tipo_medida, quantidade_peso, quantidade_porcoes, status_validade, id_produto)
VALUES
  ('2026-06-01', '2026-06-10', 'peso',   5.0,  NULL, 'No prazo', 1),
  ('2026-06-01', '2026-06-08', 'porcao', NULL,  30,  'No prazo', 2),
  ('2026-06-01', '2026-06-09', 'porcao', NULL,  20,  'No prazo', 33),
  ('2026-06-01', '2026-06-15', 'porcao', NULL,  24,  'No prazo', 34),
  ('2026-06-01', '2026-06-12', 'peso',   2.5,  NULL, 'No prazo', 35),
  ('2026-06-01', '2026-06-11', 'peso',   4.5,  NULL, 'No prazo', 36),
  ('2026-06-01', '2026-06-14', 'porcao', NULL,  10,  'No prazo', 37),
  ('2026-06-01', '2026-06-09', 'peso',   3.0,  NULL, 'No prazo', 38),
  ('2026-06-01', '2026-06-20', 'porcao', NULL, 100,  'No prazo', 39),
  ('2026-06-01', '2026-06-20', 'porcao', NULL, 100,  'No prazo', 40),
  ('2026-06-01', '2026-06-18', 'porcao', NULL,  40,  'No prazo', 41);

-- ─── 4. Movimentações usando usuários existentes ──────────────────────────────
-- id_usuario 1 = Sidney, id_usuario 2 = Usuário teste

INSERT INTO tb_movimentacao
  (tipo_movimentacao, motivo, quantidade, data_hora, id_lote, id_usuario)
VALUES
  ('Entrada', 'Producao diaria',  20,  '2026-06-01 10:00:00', 33, 1),
  ('Saida',   'Venda balcao',      4,  '2026-06-01 11:00:00', 33, 2),

  ('Entrada', 'Producao diaria',  24,  '2026-06-01 11:00:00', 34, 1),
  ('Saida',   'Pedido cliente',    6,  '2026-06-01 12:00:00', 34, 2),

  ('Entrada', 'Producao diaria',  2.5, '2026-06-01 12:00:00', 35, 1),
  ('Saida',   'Venda balcao',     0.5, '2026-06-01 13:00:00', 35, 2),

  ('Entrada', 'Producao diaria',  4.5, '2026-06-01 13:00:00', 36, 1),
  ('Saida',   'Venda balcao',     1.5, '2026-06-01 14:00:00', 36, 2),

  ('Entrada', 'Producao diaria',  10,  '2026-06-01 14:00:00', 37, 1),
  ('Saida',   'Pedido festa',      2,  '2026-06-01 15:00:00', 37, 2),

  ('Entrada', 'Producao diaria',  3.0, '2026-06-01 15:00:00', 38, 1),
  ('Saida',   'Venda balcao',     1.0, '2026-06-01 16:00:00', 38, 2),

  ('Entrada', 'Producao diaria', 100,  '2026-06-01 16:00:00', 39,  1),
  ('Saida',   'Venda balcao',     10,  '2026-06-01 17:00:00', 39,  2),

  ('Entrada', 'Producao diaria', 100,  '2026-06-01 17:00:00', 40, 1),
  ('Saida',   'Venda balcao',     15,  '2026-06-01 18:00:00', 40, 2),

  ('Entrada', 'Producao diaria',  40,  '2026-06-01 18:00:00', 41, 1),
  ('Saida',   'Venda balcao',      8,  '2026-06-01 19:00:00', 41, 2);


-- ─── 5. Verificação final ─────────────────────────────────────────────────────
SELECT * FROM tb_categoria;
SELECT * FROM tb_produto;
SELECT * FROM tb_lote;
SELECT * FROM tb_movimentacao;
SELECT id_produto, nome_produto FROM tb_produto ORDER BY id_produto;