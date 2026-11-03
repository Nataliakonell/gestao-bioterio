using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class TestAnimalId1 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BiometriasAnimais_Animals_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais");

            migrationBuilder.AddForeignKey(
                name: "FK_BiometriasAnimais_Animals_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais",
                column: "AnimalId",
                principalSchema: "bioterio",
                principalTable: "Animals",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BiometriasAnimais_Animals_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais");

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
