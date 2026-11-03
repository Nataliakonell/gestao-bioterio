using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class MigrateInstalacoesBioterioToLocalizacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- 1. Obter ou Criar a Raiz 'UCDB'
                DECLARE @UcdbId INT;
                SELECT TOP 1 @UcdbId = Id 
                FROM [bioterio].[Localizacao] 
                WHERE Nome = 'UCDB' OR Nome LIKE 'UCDB%';

                IF @UcdbId IS NULL
                BEGIN
                    INSERT INTO [bioterio].[Localizacao] 
                        ([Nome], [LocalizacaoPaiId], [Ambiente], [CaminhoIds], [CaminhoHierarquia], [RF], [DataCriacao])
                    VALUES 
                        ('UCDB', NULL, 'Interno', '/0', 'UCDB', 'SYSTEM_MIGRATION', GETDATE());
                    
                    SET @UcdbId = SCOPE_IDENTITY();
                    
                    UPDATE [bioterio].[Localizacao]
                    SET [CaminhoIds] = '/' + CAST(@UcdbId AS NVARCHAR(20))
                    WHERE Id = @UcdbId;
                END

                -- 2. Obter ou Criar o Pai Intermediário 'Biotério'
                DECLARE @BioterioId INT;
                SELECT TOP 1 @BioterioId = Id 
                FROM [bioterio].[Localizacao] 
                WHERE (Nome = 'Biotério' OR Nome = 'Bioterio' OR Nome = 'Setor de Bioterio')
                  AND (LocalizacaoPaiId = @UcdbId OR LocalizacaoPaiId IS NULL);

                IF @BioterioId IS NULL
                BEGIN
                    DECLARE @UcdbCaminhoIds NVARCHAR(1000);
                    DECLARE @UcdbHierarquia NVARCHAR(MAX);
                    
                    SELECT @UcdbCaminhoIds = CaminhoIds, @UcdbHierarquia = CaminhoHierarquia 
                    FROM [bioterio].[Localizacao] WHERE Id = @UcdbId;

                    INSERT INTO [bioterio].[Localizacao] 
                        ([Nome], [LocalizacaoPaiId], [Ambiente], [CaminhoIds], [CaminhoHierarquia], [RF], [DataCriacao])
                    VALUES 
                        ('Biotério', @UcdbId, 'Interno', ISNULL(@UcdbCaminhoIds, '/' + CAST(@UcdbId AS NVARCHAR(20))) + '/0', 
                         ISNULL(@UcdbHierarquia, 'UCDB') + ' -> Biotério', 'SYSTEM_MIGRATION', GETDATE());
                    
                    SET @BioterioId = SCOPE_IDENTITY();
                    
                    UPDATE [bioterio].[Localizacao]
                    SET [CaminhoIds] = ISNULL(@UcdbCaminhoIds, '/' + CAST(@UcdbId AS NVARCHAR(20))) + '/' + CAST(@BioterioId AS NVARCHAR(20))
                    WHERE Id = @BioterioId;
                END
                ELSE IF EXISTS (SELECT 1 FROM [bioterio].[Localizacao] WHERE Id = @BioterioId AND LocalizacaoPaiId IS NULL)
                BEGIN
                    -- Se existia solto, amarra na UCDB
                    UPDATE [bioterio].[Localizacao]
                    SET LocalizacaoPaiId = @UcdbId,
                        CaminhoHierarquia = 'UCDB -> ' + Nome,
                        CaminhoIds = '/' + CAST(@UcdbId AS NVARCHAR(20)) + '/' + CAST(@BioterioId AS NVARCHAR(20))
                    WHERE Id = @BioterioId;
                END

                -- Variáveis de apoio para os caminhos do Biotério
                DECLARE @BioterioCaminhoIds NVARCHAR(1000);
                DECLARE @BioterioHierarquia NVARCHAR(MAX);
                
                SELECT 
                    @BioterioCaminhoIds = ISNULL(CaminhoIds, '/' + CAST(@UcdbId AS NVARCHAR(20)) + '/' + CAST(@BioterioId AS NVARCHAR(20))),
                    @BioterioHierarquia = ISNULL(CaminhoHierarquia, 'UCDB -> Biotério')
                FROM [bioterio].[Localizacao] 
                WHERE Id = @BioterioId;

                -- 3. Migrar cada InstalacaoBioterio para Localizacao como filha de Biotério
                DECLARE @InstId INT;
                DECLARE @InstNome NVARCHAR(200);

                DECLARE curInst CURSOR LOCAL FAST_FORWARD FOR
                SELECT Id, Nome FROM [bioterio].[InstalacoesBioterio];

                OPEN curInst;
                FETCH NEXT FROM curInst INTO @InstId, @InstNome;

                WHILE @@FETCH_STATUS = 0
                BEGIN
                    DECLARE @NovaLocId INT = NULL;
                    
                    -- Verifica se já existe uma Localizacao com o mesmo nome sob o Biotério
                    SELECT TOP 1 @NovaLocId = Id 
                    FROM [bioterio].[Localizacao] 
                    WHERE Nome = @InstNome AND LocalizacaoPaiId = @BioterioId;

                    IF @NovaLocId IS NULL
                    BEGIN
                        INSERT INTO [bioterio].[Localizacao]
                            ([Nome], [LocalizacaoPaiId], [Ambiente], [CaminhoIds], [CaminhoHierarquia], [RF], [DataCriacao])
                        VALUES
                            (@InstNome, @BioterioId, 'Interno', @BioterioCaminhoIds + '/0', 
                             @BioterioHierarquia + ' -> ' + @InstNome, 'SYSTEM_MIGRATION', GETDATE());

                        SET @NovaLocId = SCOPE_IDENTITY();

                        UPDATE [bioterio].[Localizacao]
                        SET [CaminhoIds] = @BioterioCaminhoIds + '/' + CAST(@NovaLocId AS NVARCHAR(20))
                        WHERE Id = @NovaLocId;
                    END

                    -- 4. Vincular animais que estão nesta InstalacaoBioterio para a nova Localizacao
                    -- Inserir em AnimalLocalizacao se ainda não tiver
                    INSERT INTO [bioterio].[AnimalLocalizacao]
                        ([AnimalId], [LocalizacaoId], [RF], [DataCriacao], [DataAtualizacao], [TipoOperacao])
                    SELECT 
                        a.Id, 
                        @NovaLocId, 
                        'SYSTEM_MIGRATION', 
                        GETDATE(), 
                        GETDATE(), 
                        'Criacao'
                    FROM [bioterio].[Animals] a
                    LEFT JOIN [bioterio].[AnimalLocalizacao] al ON al.AnimalId = a.Id
                    WHERE a.InstalacaoBioterioId = @InstId
                      AND al.Id IS NULL;

                    -- Registrar em MovimentacaoAnimal o histórico inicial para os que foram migrados
                    INSERT INTO [bioterio].[MovimentacaoAnimal]
                        ([AnimalId], [LocalizacaoId], [TipoMovimentacao], [RF], [DataCriacao])
                    SELECT 
                        a.Id, 
                        @NovaLocId, 
                        1, -- Transferencia / Entrada
                        'SYSTEM_MIGRATION', 
                        GETDATE()
                    FROM [bioterio].[Animals] a
                    LEFT JOIN [bioterio].[MovimentacaoAnimal] ma ON ma.AnimalId = a.Id AND ma.LocalizacaoId = @NovaLocId
                    WHERE a.InstalacaoBioterioId = @InstId
                      AND ma.Id IS NULL;

                    FETCH NEXT FROM curInst INTO @InstId, @InstNome;
                END

                CLOSE curInst;
                DEALLOCATE curInst;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Em caso de rollback da migration, mantemos os registros para preservar a integridade dos dados
        }
    }
}
