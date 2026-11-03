using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPrincipioAtivoENomeComercialToMedicacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "NomeComercial",
                schema: "bioterio",
                table: "Medicacoes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PrincipioAtivo",
                schema: "bioterio",
                table: "Medicacoes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("UPDATE bioterio.Medicacoes SET PrincipioAtivo = Nome, NomeComercial = Nome;");

            migrationBuilder.DropIndex(
                name: "IX_Medicacoes_Nome",
                schema: "bioterio",
                table: "Medicacoes");

            migrationBuilder.DropColumn(
                name: "Nome",
                schema: "bioterio",
                table: "Medicacoes");

            migrationBuilder.CreateIndex(
                name: "IX_Medicacoes_PrincipioAtivo",
                schema: "bioterio",
                table: "Medicacoes",
                column: "PrincipioAtivo");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Medicacoes_PrincipioAtivo",
                schema: "bioterio",
                table: "Medicacoes");

            migrationBuilder.AddColumn<string>(
                name: "Nome",
                schema: "bioterio",
                table: "Medicacoes",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql("UPDATE bioterio.Medicacoes SET Nome = PrincipioAtivo;");

            migrationBuilder.DropColumn(
                name: "NomeComercial",
                schema: "bioterio",
                table: "Medicacoes");

            migrationBuilder.DropColumn(
                name: "PrincipioAtivo",
                schema: "bioterio",
                table: "Medicacoes");

            migrationBuilder.CreateIndex(
                name: "IX_Medicacoes_Nome",
                schema: "bioterio",
                table: "Medicacoes",
                column: "Nome");
        }
    }
}
