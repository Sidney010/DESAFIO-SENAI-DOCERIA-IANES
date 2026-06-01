/******************************************************************************
 * Objetivo: Migration de Produto e Categoria — adiciona constraint UNIQUE
 *           na categoria, índices de performance e trigger de validação
 *           de estoque mínimo
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 ******************************************************************************/

-- ============================================================
-- AJUSTE tb_categoria
-- RF-006/2: nome da categoria deve ser único
-- ============================================================

ALTER TABLE tb_categoria
    ADD CONSTRAINT uq_categoria_nome UNIQUE (nome_categoria);


-- ============================================================
-- ÍNDICES DE PERFORMANCE em tb_produto
-- Buscas por nome, código e categoria são as mais frequentes
-- (RF-011/3 — Filtros e Buscas)
-- ============================================================

CREATE INDEX idx_produto_nome      ON tb_produto (nome_produto);
CREATE INDEX idx_produto_categoria ON tb_produto (id_categoria);
-- codigo_identificador já tem UNIQUE (que implica índice), não precisa duplicar


-- ============================================================
-- TRIGGER: Impede código_identificador duplicado em UPDATE
-- O UNIQUE já protege no INSERT — este cobre o UPDATE
-- ============================================================

DROP TRIGGER IF EXISTS trg_valida_codigo_produto_update;

DELIMITER $$

CREATE TRIGGER trg_valida_codigo_produto_update
BEFORE UPDATE ON tb_produto
FOR EACH ROW
BEGIN
    DECLARE v_count INT;

    IF NEW.codigo_identificador != OLD.codigo_identificador THEN
        SELECT COUNT(*) INTO v_count
        FROM tb_produto
        WHERE codigo_identificador = NEW.codigo_identificador
          AND id_produto != OLD.id_produto;

        IF v_count > 0 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Código identificador já está em uso por outro produto.';
        END IF;
    END IF;
END$$

DELIMITER ;


-- ============================================================
-- PROCEDURE: Busca produtos com filtros dinâmicos
-- Suporta filtro por nome, código e id_categoria
-- (RF-011/3 — Filtros e Buscas)
-- Uso: CALL sp_buscar_produtos('bolo', NULL, NULL);
-- ============================================================

DROP PROCEDURE IF EXISTS sp_buscar_produtos;

DELIMITER $$

CREATE PROCEDURE sp_buscar_produtos(
    IN p_nome       VARCHAR(150),
    IN p_codigo     INT,
    IN p_categoria  INT
)
BEGIN
    SELECT
        p.id_produto,
        p.nome_produto,
        p.codigo_identificador,
        p.sabor_massa,
        p.recheio,
        p.cobertura,
        p.detalhes,
        p.limite_minimo_alerta,
        c.id_categoria,
        c.nome_categoria
    FROM tb_produto p
    INNER JOIN tb_categoria c ON c.id_categoria = p.id_categoria
    WHERE
        (p_nome      IS NULL OR p.nome_produto          LIKE CONCAT('%', p_nome, '%'))
    AND (p_codigo    IS NULL OR p.codigo_identificador  = p_codigo)
    AND (p_categoria IS NULL OR p.id_categoria          = p_categoria)
    ORDER BY p.nome_produto ASC;
END$$

DELIMITER ;


-- ============================================================
-- PROCEDURE: Gera próximo código identificador disponível
-- Evita que o front precise consultar antes de cadastrar
-- Uso: CALL sp_proximo_codigo(@proximo);
--      SELECT @proximo;
-- ============================================================

DROP PROCEDURE IF EXISTS sp_proximo_codigo_produto;

DELIMITER $$

CREATE PROCEDURE sp_proximo_codigo_produto(
    OUT p_proximo INT
)
BEGIN
    SELECT COALESCE(MAX(codigo_identificador), 0) + 1
    INTO p_proximo
    FROM tb_produto;
END$$

DELIMITER ;