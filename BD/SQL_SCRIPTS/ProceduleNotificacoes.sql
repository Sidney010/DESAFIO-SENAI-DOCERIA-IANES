/******************************************************************************
 * Objetivo: Migration de Notificações — Procedure que consolida todos os
 *           alertas ativos do sistema em uma única chamada
 *           da Doceria Gourmet IANES
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 *
 * Conteúdo:
 *  - sp_notificacoes_dashboard → Retorna alertas de validade e estoque baixo
 *                                consolidados e priorizados por criticidade
 ******************************************************************************/


-- ============================================================
-- PROCEDURE: Dashboard de notificações consolidado
-- Retorna em uma única chamada:
--   - Produtos vencidos          (prioridade ALTA   — RF-014/4)
--   - Produtos em alerta         (prioridade MEDIA  — RF-013/4)
--   - Estoque abaixo do mínimo   (prioridade BAIXA  — RF-015/4)
-- Uso: CALL sp_notificacoes_dashboard();
-- ============================================================

DROP PROCEDURE IF EXISTS sp_notificacoes_dashboard;

DELIMITER $$

CREATE PROCEDURE sp_notificacoes_dashboard()
BEGIN
    -- Atualiza os status antes de buscar as notificações
    -- Garante que os dados refletem o dia atual (RNF-003/3)
    CALL sp_atualizar_status_validade();

    -- Notificações de VALIDADE (Vencido e Alerta)
    SELECT
        'validade'                          AS tipo_notificacao,
        CASE
            WHEN l.status_validade = 'Vencido' THEN 'ALTA'
            ELSE 'MEDIA'
        END                                 AS prioridade,
        l.status_validade,
        p.id_produto,
        p.nome_produto,
        p.codigo_identificador,
        c.nome_categoria,
        l.id_lote,
        l.data_vencimento,
        DATEDIFF(l.data_vencimento, CURDATE()) AS dias_para_vencer,
        CASE
            WHEN l.tipo_medida = 'peso'   THEN l.quantidade_peso
            WHEN l.tipo_medida = 'porcao' THEN l.quantidade_porcoes
        END                                 AS quantidade_atual,
        l.tipo_medida,
        NULL                                AS limite_minimo_alerta

    FROM tb_lote l
    INNER JOIN tb_produto  p ON p.id_produto   = l.id_produto
    INNER JOIN tb_categoria c ON c.id_categoria = p.id_categoria
    WHERE l.status_validade IN ('Vencido', 'Alerta')

    UNION ALL

    -- Notificações de ESTOQUE BAIXO (RF-015/4)
    SELECT
        'estoque_baixo'                     AS tipo_notificacao,
        'BAIXA'                             AS prioridade,
        'Estoque Baixo'                     AS status_validade,
        p.id_produto,
        p.nome_produto,
        p.codigo_identificador,
        c.nome_categoria,
        NULL                                AS id_lote,
        NULL                                AS data_vencimento,
        NULL                                AS dias_para_vencer,
        COALESCE(SUM(
            CASE
                WHEN l.tipo_medida = 'peso'   THEN l.quantidade_peso
                WHEN l.tipo_medida = 'porcao' THEN l.quantidade_porcoes
                ELSE 0
            END
        ), 0)                               AS quantidade_atual,
        NULL                                AS tipo_medida,
        p.limite_minimo_alerta

    FROM tb_produto p
    INNER JOIN tb_categoria c ON c.id_categoria = p.id_categoria
    LEFT JOIN  tb_lote l      ON l.id_produto   = p.id_produto
    WHERE p.limite_minimo_alerta > 0
    GROUP BY
        p.id_produto,
        p.nome_produto,
        p.codigo_identificador,
        c.nome_categoria,
        p.limite_minimo_alerta
    HAVING quantidade_atual <= p.limite_minimo_alerta

    -- Ordena por criticidade: Vencido > Alerta > Estoque Baixo
    ORDER BY
        FIELD(prioridade, 'ALTA', 'MEDIA', 'BAIXA'),
        dias_para_vencer ASC;

END$$

DELIMITER ;