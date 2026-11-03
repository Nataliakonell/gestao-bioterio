using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixSolicitacaoExameColumns : Migration
    {
        /// <inheritdoc />
                protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH('bioterio.SolicitacoesExame', 'Status') IS NULL
                BEGIN
                    ALTER TABLE bioterio.SolicitacoesExame ADD Status nvarchar(20) NOT NULL DEFAULT 'Ativa';
                END

                IF COL_LENGTH('bioterio.SolicitacoesExame', 'DataSuspensao') IS NULL
                BEGIN
                    ALTER TABLE bioterio.SolicitacoesExame ADD DataSuspensao datetime2 NULL;
                END

                IF COL_LENGTH('bioterio.SolicitacoesExame', 'MotivoSuspensao') IS NULL
                BEGIN
                    ALTER TABLE bioterio.SolicitacoesExame ADD MotivoSuspensao nvarchar(1000) NULL;
                END
            ");
        }

        /// <inheritdoc />
                protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                IF COL_LENGTH('bioterio.SolicitacoesExame', 'Status') IS NOT NULL
                BEGIN
                    -- Try to drop constraint if it exists
                    DECLARE @ConstraintName nvarchar(200);
                    SELECT @ConstraintName = d.name
                    FROM sys.default_constraints d
                    INNER JOIN sys.columns c ON d.parent_object_id = c.object_id AND d.parent_column_id = c.column_id
                    INNER JOIN sys.objects t ON t.object_id = d.parent_object_id
                    INNER JOIN sys.schemas s ON s.schema_id = t.schema_id
                    WHERE t.name = 'SolicitacoesExame' AND s.name = 'bioterio' AND c.name = 'Status';
                    
                    IF @ConstraintName IS NOT NULL
                        EXEC('ALTER TABLE bioterio.SolicitacoesExame DROP CONSTRAINT ' + @ConstraintName);
                        
                    ALTER TABLE bioterio.SolicitacoesExame DROP COLUMN Status;
                END

                IF COL_LENGTH('bioterio.SolicitacoesExame', 'DataSuspensao') IS NOT NULL
                BEGIN
                    ALTER TABLE bioterio.SolicitacoesExame DROP COLUMN DataSuspensao;
                END

                IF COL_LENGTH('bioterio.SolicitacoesExame', 'MotivoSuspensao') IS NOT NULL
                BEGIN
                    ALTER TABLE bioterio.SolicitacoesExame DROP COLUMN MotivoSuspensao;
                END
            ");
        }
    }
}

