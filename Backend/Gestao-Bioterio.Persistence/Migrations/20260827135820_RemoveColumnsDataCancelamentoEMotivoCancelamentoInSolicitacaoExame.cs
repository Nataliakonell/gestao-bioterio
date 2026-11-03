using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveColumnsDataCancelamentoEMotivoCancelamentoInSolicitacaoExame : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // The columns might have been dropped manually or never created. 
            // Commenting out to avoid SqlException: 'ALTER TABLE DROP COLUMN failed because column does not exist'.
            // migrationBuilder.DropColumn(
            //     name: "DataCancelamento",
            //     schema: "bioterio",
            //     table: "SolicitacoesExame");

            // migrationBuilder.DropColumn(
            //     name: "MotivoCancelamento",
            //     schema: "bioterio",
            //     table: "SolicitacoesExame");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataCancelamento",
                schema: "bioterio",
                table: "SolicitacoesExame",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoCancelamento",
                schema: "bioterio",
                table: "SolicitacoesExame",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);
        }
    }
}
