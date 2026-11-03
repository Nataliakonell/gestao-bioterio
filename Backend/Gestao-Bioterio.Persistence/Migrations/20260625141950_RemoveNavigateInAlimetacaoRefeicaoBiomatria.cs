using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemoveNavigateInAlimetacaoRefeicaoBiomatria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alimentacoes_Animals_AnimalId",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.DropForeignKey(
                name: "FK_BiometriasAnimais_Animals_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais");

            migrationBuilder.DropIndex(
                name: "IX_BiometriasAnimais_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais");

            migrationBuilder.DropIndex(
                name: "IX_Alimentacoes_AnimalId",
                schema: "bioterio",
                table: "Alimentacoes");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_BiometriasAnimais_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Alimentacoes_AnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                column: "AnimalId");

            migrationBuilder.AddForeignKey(
                name: "FK_Alimentacoes_Animals_AnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                column: "AnimalId",
                principalSchema: "bioterio",
                principalTable: "Animals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BiometriasAnimais_Animals_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais",
                column: "AnimalId",
                principalSchema: "bioterio",
                principalTable: "Animals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
