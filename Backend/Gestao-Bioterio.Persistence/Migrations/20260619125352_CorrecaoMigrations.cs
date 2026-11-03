using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class CorrecaoMigrations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Comprimento",
                schema: "bioterio",
                table: "BiometriasAnimais",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)");

            migrationBuilder.AddColumn<int>(
                name: "BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Alimentacoes_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                column: "BiometriaAnimalId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Alimentacoes_BiometriasAnimais_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                column: "BiometriaAnimalId",
                principalSchema: "bioterio",
                principalTable: "BiometriasAnimais",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Alimentacoes_BiometriasAnimais_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.DropIndex(
                name: "IX_Alimentacoes_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.DropColumn(
                name: "BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.AlterColumn<decimal>(
                name: "Comprimento",
                schema: "bioterio",
                table: "BiometriasAnimais",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);
        }
    }
}
