using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddBiometriaToAnimal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "BiometriaAnimalId",
                schema: "bioterio",
                table: "Animals",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "BiometriaAnimalId",
                schema: "bioterio",
                table: "AnimaisLog",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Animals_BiometriaAnimalId",
                schema: "bioterio",
                table: "Animals",
                column: "BiometriaAnimalId",
                unique: true,
                filter: "[BiometriaAnimalId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AnimaisLog_BiometriaAnimalId",
                schema: "bioterio",
                table: "AnimaisLog",
                column: "BiometriaAnimalId");

            migrationBuilder.AddForeignKey(
                name: "FK_AnimaisLog_BiometriasAnimais_BiometriaAnimalId",
                schema: "bioterio",
                table: "AnimaisLog",
                column: "BiometriaAnimalId",
                principalSchema: "bioterio",
                principalTable: "BiometriasAnimais",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Animals_BiometriasAnimais_BiometriaAnimalId",
                schema: "bioterio",
                table: "Animals",
                column: "BiometriaAnimalId",
                principalSchema: "bioterio",
                principalTable: "BiometriasAnimais",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AnimaisLog_BiometriasAnimais_BiometriaAnimalId",
                schema: "bioterio",
                table: "AnimaisLog");

            migrationBuilder.DropForeignKey(
                name: "FK_Animals_BiometriasAnimais_BiometriaAnimalId",
                schema: "bioterio",
                table: "Animals");

            migrationBuilder.DropIndex(
                name: "IX_Animals_BiometriaAnimalId",
                schema: "bioterio",
                table: "Animals");

            migrationBuilder.DropIndex(
                name: "IX_AnimaisLog_BiometriaAnimalId",
                schema: "bioterio",
                table: "AnimaisLog");

            migrationBuilder.DropColumn(
                name: "BiometriaAnimalId",
                schema: "bioterio",
                table: "Animals");

            migrationBuilder.DropColumn(
                name: "BiometriaAnimalId",
                schema: "bioterio",
                table: "AnimaisLog");
        }
    }
}
