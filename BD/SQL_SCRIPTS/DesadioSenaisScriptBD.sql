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
    tipo_movimentacao ENUM('Entrada', 'Saída') NOT NULL,
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

