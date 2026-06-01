/******************************************************************************
 * Objetivo: Migration de Estoque — Triggers e Procedures para controle
 *           automático de validade, dashboard e movimentações de lotes
 *           da Doceria Gourmet IANES
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 *
 * Conteúdo:
 *  - Índices de performance em tb_lote e tb_movimentacao
 *  - trg_valida_status_lote_insert    → Define status na criação do lote
 *  - trg_valida_status_lote_update    → Recalcula status ao atualizar o lote
 *  - trg_impede_movimentacao_vencido  → Bloqueia entrada em lote vencido
 *  - trg_impede_saldo_negativo        → Bloqueia saída maior que o estoque
 *  - sp_atualizar_status_validade     → Recalcula status de TODOS os lotes
 *  - sp_dashboard_estoque             → Retorna visão consolidada do estoque
 *  - sp_alertas_estoque_baixo         → Retorna produtos abaixo do mínimo
 *  - sp_lotes_por_status              → Filtra lotes por status de validade
 ******************************************************************************/


-- ============================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================

CREATE INDEX idx_lote_produto        ON tb_lote (id_produto);
CREATE INDEX idx_lote_status         ON tb_lote (status_validade);
CREATE INDEX idx_lote_vencimento     ON tb_lote (data_vencimento);
CREATE INDEX idx_movimentacao_lote   ON tb_movimentacao (id_lote);
CREATE INDEX idx_movimentacao_usuario ON tb_movimentacao (id_usuario);
CREATE INDEX idx_movimentacao_data   ON tb_movimentacao (data_hora);


-- ============================================================
-- TRIGGER: Define status de validade ao INSERIR um lote
-- RF-012/3 — calcula automaticamente: No prazo / Alerta / Vencido
-- O prazo de alerta padrão é 3 dias — ajustável conforme RF-013/4
-- ============================================================

DROP TRIGGER IF EXISTS trg_valida_status_lote_insert;

DELIMITER $$

CREATE TRIGGER trg_valida_status_lote_insert
BEFORE INSERT ON tb_lote
FOR EACH ROW
BEGIN
    DECLARE v_dias_alerta INT DEFAULT 3;

    -- Busca o limite de alerta configurado no produto (RF-013/4)
    SELECT COALESCE(limite_minimo_alerta, 3) INTO v_dias_alerta
    FROM tb_produto
    WHERE id_produto = NEW.id_produto;

    IF NEW.data_vencimento < CURDATE() THEN
        SET NEW.status_validade = 'Vencido';

    ELSEIF NEW.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL v_dias_alerta DAY) THEN
        SET NEW.status_validade = 'Alerta';

    ELSE
        SET NEW.status_validade = 'No prazo';
    END IF;
END$$

DELIMITER ;


-- ============================================================
-- TRIGGER: Recalcula status de validade ao ATUALIZAR um lote
-- Cobre o caso de editar a data_vencimento manualmente
-- ============================================================

DROP TRIGGER IF EXISTS trg_valida_status_lote_update;

DELIMITER $$

CREATE TRIGGER trg_valida_status_lote_update
BEFORE UPDATE ON tb_lote
FOR EACH ROW
BEGIN
    DECLARE v_dias_alerta INT DEFAULT 3;

    SELECT COALESCE(limite_minimo_alerta, 3) INTO v_dias_alerta
    FROM tb_produto
    WHERE id_produto = NEW.id_produto;

    IF NEW.data_vencimento < CURDATE() THEN
        SET NEW.status_validade = 'Vencido';

    ELSEIF NEW.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL v_dias_alerta DAY) THEN
        SET NEW.status_validade = 'Alerta';

    ELSE
        SET NEW.status_validade = 'No prazo';
    END IF;
END$$

DELIMITER ;


-- ============================================================
-- TRIGGER: Bloqueia movimentação de ENTRADA em lote vencido
-- Não faz sentido repor estoque de produto vencido
-- ============================================================

DROP TRIGGER IF EXISTS trg_impede_movimentacao_vencido;

DELIMITER $$

CREATE TRIGGER trg_impede_movimentacao_vencido
BEFORE INSERT ON tb_movimentacao
FOR EACH ROW
BEGIN
    DECLARE v_status VARCHAR(20);

    SELECT status_validade INTO v_status
    FROM tb_lote
    WHERE id_lote = NEW.id_lote;

    IF v_status = 'Vencido' AND NEW.tipo_movimentacao = 'Entrada' THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Não é permitido registrar entrada em lote vencido.';
    END IF;
END$$

DELIMITER ;


-- ============================================================
-- TRIGGER: Bloqueia saída maior que o estoque disponível
-- Evita saldo negativo silencioso no estoque
-- ============================================================

DROP TRIGGER IF EXISTS trg_impede_saldo_negativo;

DELIMITER $$

CREATE TRIGGER trg_impede_saldo_negativo
BEFORE INSERT ON tb_movimentacao
FOR EACH ROW
BEGIN
    DECLARE v_tipo_medida  VARCHAR(50);
    DECLARE v_saldo_atual  FLOAT DEFAULT 0;

    IF NEW.tipo_movimentacao = 'Saída' THEN

        SELECT tipo_medida,
               COALESCE(IF(tipo_medida = 'peso', quantidade_peso, quantidade_porcoes), 0)
        INTO v_tipo_medida, v_saldo_atual
        FROM tb_lote
        WHERE id_lote = NEW.id_lote;

        IF NEW.quantidade > v_saldo_atual THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Quantidade de saída maior que o estoque disponível no lote.';
        END IF;

    END IF;
END$$

DELIMITER ;


-- ============================================================
-- PROCEDURE: Recalcula o status de validade de TODOS os lotes
-- Deve ser chamada diariamente (via cron job ou agendador)
-- Uso: CALL sp_atualizar_status_validade();
-- ============================================================

DROP PROCEDURE IF EXISTS sp_atualizar_status_validade;

DELIMITER $$

CREATE PROCEDURE sp_atualizar_status_validade()
BEGIN
    -- Marca como Vencido
    UPDATE tb_lote l
    INNER JOIN tb_produto p ON p.id_produto = l.id_produto
    SET l.status_validade = 'Vencido'
    WHERE l.data_vencimento < CURDATE();

    -- Marca como Alerta (usando limite_minimo_alerta do produto como dias de alerta)
    UPDATE tb_lote l
    INNER JOIN tb_produto p ON p.id_produto = l.id_produto
    SET l.status_validade = 'Alerta'
    WHERE l.data_vencimento >= CURDATE()
      AND l.data_vencimento <= DATE_ADD(CURDATE(), INTERVAL COALESCE(p.limite_minimo_alerta, 3) DAY)
      AND l.status_validade != 'Vencido';

    -- Marca como No prazo
    UPDATE tb_lote l
    INNER JOIN tb_produto p ON p.id_produto = l.id_produto
    SET l.status_validade = 'No prazo'
    WHERE l.data_vencimento > DATE_ADD(CURDATE(), INTERVAL COALESCE(p.limite_minimo_alerta, 3) DAY);
END$$

DELIMITER ;


-- ============================================================
-- PROCEDURE: Dashboard consolidado do estoque (RF-009/3)
-- Retorna visão agrupada por produto com quantidade total,
-- status crítico e nome da categoria
-- Uso: CALL sp_dashboard_estoque();
-- ============================================================

DROP PROCEDURE IF EXISTS sp_dashboard_estoque;

DELIMITER $$

CREATE PROCEDURE sp_dashboard_estoque()
BEGIN
    SELECT
        p.id_produto,
        p.nome_produto,
        p.codigo_identificador,
        c.nome_categoria,
        p.limite_minimo_alerta,

        -- Quantidade total em estoque (soma todos os lotes ativos do produto)
        COALESCE(SUM(
            CASE
                WHEN l.tipo_medida = 'peso'   THEN l.quantidade_peso
                WHEN l.tipo_medida = 'porcao' THEN l.quantidade_porcoes
                ELSE 0
            END
        ), 0) AS quantidade_total,

        -- Retorna o status mais crítico entre todos os lotes do produto
        -- Prioridade: Vencido > Alerta > No prazo
        CASE
            WHEN SUM(CASE WHEN l.status_validade = 'Vencido' THEN 1 ELSE 0 END) > 0 THEN 'Vencido'
            WHEN SUM(CASE WHEN l.status_validade = 'Alerta'  THEN 1 ELSE 0 END) > 0 THEN 'Alerta'
            ELSE 'No prazo'
        END AS status_critico,

        -- Flag de alerta de estoque baixo (RF-015/4)
        CASE
            WHEN COALESCE(SUM(
                CASE
                    WHEN l.tipo_medida = 'peso'   THEN l.quantidade_peso
                    WHEN l.tipo_medida = 'porcao' THEN l.quantidade_porcoes
                    ELSE 0
                END
            ), 0) <= p.limite_minimo_alerta THEN TRUE
            ELSE FALSE
        END AS estoque_baixo,

        COUNT(l.id_lote) AS total_lotes

    FROM tb_produto p
    INNER JOIN tb_categoria c ON c.id_categoria = p.id_categoria
    LEFT JOIN  tb_lote l      ON l.id_produto   = p.id_produto
    GROUP BY
        p.id_produto,
        p.nome_produto,
        p.codigo_identificador,
        c.nome_categoria,
        p.limite_minimo_alerta
    ORDER BY
        status_critico ASC,   -- Vencido aparece primeiro
        estoque_baixo  DESC,  -- Estoque baixo em seguida
        p.nome_produto ASC;
END$$

DELIMITER ;


-- ============================================================
-- PROCEDURE: Retorna produtos com estoque abaixo do mínimo
-- (RF-015/4 — Alerta de Estoque Baixo)
-- Uso: CALL sp_alertas_estoque_baixo();
-- ============================================================

DROP PROCEDURE IF EXISTS sp_alertas_estoque_baixo;

DELIMITER $$

CREATE PROCEDURE sp_alertas_estoque_baixo()
BEGIN
    SELECT
        p.id_produto,
        p.nome_produto,
        p.codigo_identificador,
        c.nome_categoria,
        p.limite_minimo_alerta,
        COALESCE(SUM(
            CASE
                WHEN l.tipo_medida = 'peso'   THEN l.quantidade_peso
                WHEN l.tipo_medida = 'porcao' THEN l.quantidade_porcoes
                ELSE 0
            END
        ), 0) AS quantidade_atual
    FROM tb_produto p
    INNER JOIN tb_categoria c ON c.id_categoria = p.id_categoria
    LEFT JOIN  tb_lote l      ON l.id_produto   = p.id_produto
    GROUP BY
        p.id_produto,
        p.nome_produto,
        p.codigo_identificador,
        c.nome_categoria,
        p.limite_minimo_alerta
    HAVING quantidade_atual <= p.limite_minimo_alerta
       AND p.limite_minimo_alerta > 0
    ORDER BY quantidade_atual ASC;
END$$

DELIMITER ;


-- ============================================================
-- PROCEDURE: Filtra lotes por status de validade (RF-011/3)
-- Uso: CALL sp_lotes_por_status('Vencido');
--      CALL sp_lotes_por_status(NULL); -- retorna todos
-- ============================================================

DROP PROCEDURE IF EXISTS sp_lotes_por_status;

DELIMITER $$

CREATE PROCEDURE sp_lotes_por_status(
    IN p_status VARCHAR(20)
)
BEGIN
    SELECT
        l.id_lote,
        l.data_fabricacao,
        l.data_vencimento,
        l.tipo_medida,
        l.quantidade_peso,
        l.quantidade_porcoes,
        l.status_validade,
        p.id_produto,
        p.nome_produto,
        p.codigo_identificador,
        c.nome_categoria
    FROM tb_lote l
    INNER JOIN tb_produto  p ON p.id_produto  = l.id_produto
    INNER JOIN tb_categoria c ON c.id_categoria = p.id_categoria
    WHERE (p_status IS NULL OR l.status_validade = p_status)
    ORDER BY l.data_vencimento ASC;
END$$

DELIMITER ;