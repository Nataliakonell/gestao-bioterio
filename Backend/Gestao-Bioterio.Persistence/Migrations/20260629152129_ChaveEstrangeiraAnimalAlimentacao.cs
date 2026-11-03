using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ChaveEstrangeiraAnimalAlimentacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alimentacoes_Animals_AnimalId",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.DropIndex(
                name: "IX_Alimentacoes_AnimalId",
                schema: "bioterio",
                table: "Alimentacoes");
        }
    }
}
