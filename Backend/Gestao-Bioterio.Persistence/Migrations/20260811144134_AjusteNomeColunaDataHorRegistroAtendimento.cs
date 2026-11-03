using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AjusteNomeColunaDataHorRegistroAtendimento : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DataHoraPrevista",
                schema: "bioterio",
                table: "Atendimentos",
                newName: "DataHoraRegistro");

            migrationBuilder.RenameIndex(
                name: "IX_Atendimentos_DataHoraPrevista",
                schema: "bioterio",
                table: "Atendimentos",
                newName: "IX_Atendimentos_DataHoraRegistro");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DataHoraRegistro",
                schema: "bioterio",
                table: "Atendimentos",
                newName: "DataHoraPrevista");

            migrationBuilder.RenameIndex(
                name: "IX_Atendimentos_DataHoraRegistro",
                schema: "bioterio",
                table: "Atendimentos",
                newName: "IX_Atendimentos_DataHoraPrevista");
        }
    }
}
