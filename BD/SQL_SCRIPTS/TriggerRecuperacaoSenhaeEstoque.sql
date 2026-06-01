 /******************************************************************************
 * Objetivo: Triggers e Procedures de suporte ao sistema de estoque e
 *           recuperação de senha da Doceria Gourmet IANES
 * Data: 30/05/2026
 * Autor: Sidney Campos Aragão
 * Versão: 1.0
 *
 * Conteúdo:
 *  - trg_limpa_tokens_expirados       → Limpa tokens antigos antes de inserir
 *  - sp_gerar_codigo_recuperacao      → Gera código de 6 dígitos com TTL 15min
 *  - sp_validar_codigo_recuperacao    → Valida código e marca como usado
 *  - trg_atualiza_estoque_apos_movimentacao → Atualiza peso OU porção
 *                                             conforme tipo_medida do lote
 ******************************************************************************/
 

DROP TRIGGER IF EXISTS trg_limpa_tokens_expirados;
 
DELIMITER $$
 
CREATE TRIGGER trg_limpa_tokens_expirados
BEFORE INSERT ON tb_recuperacao_senha
FOR EACH ROW
BEGIN
    -- Remove todos os tokens antigos (expirados ou já usados) deste usuário
    DELETE FROM tb_recuperacao_senha
    WHERE id_usuario = NEW.id_usuario
      AND (expira_em < NOW() OR usado = TRUE);
END$$
 
DELIMITER ;
 
 
-- ============================================================
-- PROCEDURE: Gerar código de recuperação de senha
-- Uso: CALL sp_gerar_codigo_recuperacao(id_do_usuario, @codigo_gerado);
-- ============================================================
 
DROP PROCEDURE IF EXISTS sp_gerar_codigo_recuperacao;
 
DELIMITER $$
 
CREATE PROCEDURE sp_gerar_codigo_recuperacao(
    IN  p_id_usuario INT,
    OUT p_codigo     CHAR(6)
)
BEGIN
    -- Gera código numérico de 6 dígitos com zero-padding
    SET p_codigo = LPAD(FLOOR(RAND() * 1000000), 6, '0');
 
    INSERT INTO tb_recuperacao_senha (id_usuario, codigo, expira_em)
    VALUES (p_id_usuario, p_codigo, DATE_ADD(NOW(), INTERVAL 15 MINUTE));
END$$
 
DELIMITER ;
 
 
 
DROP PROCEDURE IF EXISTS sp_validar_codigo_recuperacao;
 
DELIMITER $$
 
CREATE PROCEDURE sp_validar_codigo_recuperacao(
    IN  p_id_usuario INT,
    IN  p_codigo     CHAR(6),
    OUT p_valido     TINYINT
)
BEGIN
    DECLARE v_count INT DEFAULT 0;
    DECLARE v_id    INT DEFAULT 0;
 
    SELECT COUNT(*), MAX(id_recuperacao)
    INTO v_count, v_id
    FROM tb_recuperacao_senha
    WHERE id_usuario = p_id_usuario
      AND codigo     = p_codigo
      AND expira_em  > NOW()
      AND usado      = FALSE;
 
    IF v_count > 0 THEN
        
        UPDATE tb_recuperacao_senha
        SET usado = TRUE
        WHERE id_recuperacao = v_id;
 
        SET p_valido = 1;
    ELSE
        SET p_valido = 0;
    END IF;
END$$
 
DELIMITER ;

DROP TRIGGER IF EXISTS trg_atualiza_estoque_apos_movimentacao;
 
DELIMITER $$
 
CREATE TRIGGER trg_atualiza_estoque_apos_movimentacao
AFTER INSERT ON tb_movimentacao
FOR EACH ROW
BEGIN
    DECLARE v_tipo_medida VARCHAR(50);
 
    -- Busca o tipo de medida do lote afetado para saber qual campo atualizar
    SELECT tipo_medida INTO v_tipo_medida
    FROM tb_lote
    WHERE id_lote = NEW.id_lote;
 
    IF NEW.tipo_movimentacao = 'Entrada' THEN
 
        -- Lote vendido por PESO: atualiza somente o campo de peso
        IF v_tipo_medida = 'peso' THEN
            UPDATE tb_lote
            SET quantidade_peso = COALESCE(quantidade_peso, 0) + NEW.quantidade
            WHERE id_lote = NEW.id_lote;
 
        -- Lote vendido por PORÇÃO: atualiza somente o campo de porções
        ELSEIF v_tipo_medida = 'porcao' THEN
            UPDATE tb_lote
            SET quantidade_porcoes = COALESCE(quantidade_porcoes, 0) + NEW.quantidade
            WHERE id_lote = NEW.id_lote;
        END IF;
 
    ELSEIF NEW.tipo_movimentacao = 'Saída' THEN
 
        IF v_tipo_medida = 'peso' THEN
            UPDATE tb_lote
            SET quantidade_peso = COALESCE(quantidade_peso, 0) - NEW.quantidade
            WHERE id_lote = NEW.id_lote;
 
        ELSEIF v_tipo_medida = 'porcao' THEN
            UPDATE tb_lote
            SET quantidade_porcoes = COALESCE(quantidade_porcoes, 0) - NEW.quantidade
            WHERE id_lote = NEW.id_lote;
        END IF;
 
    END IF;
END$$
 
DELIMITER ;
 