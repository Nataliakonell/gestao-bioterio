using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixBiometriaRelationshipWithMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Alimentacoes_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.AlterColumn<decimal>(
                name: "PorcentagemPesoRecomendado",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "decimal(5,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Alimentacoes_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                column: "BiometriaAnimalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Alimentacoes_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.AlterColumn<decimal>(
                name: "PorcentagemPesoRecomendado",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(5,2)",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Alimentacoes_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                column: "BiometriaAnimalId",
                unique: true,
                filter: "[BiometriaAnimalId] IS NOT NULL");
        }
    }
}
