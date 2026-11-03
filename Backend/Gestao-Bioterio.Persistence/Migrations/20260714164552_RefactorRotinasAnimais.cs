using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RefactorRotinasAnimais : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Alimentacoes_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.DropColumn(
                name: "StatusRotina",
                schema: "bioterio",
                table: "RotinasAnimaisLogs");

            migrationBuilder.DropColumn(
                name: "StatusRotina",
                schema: "bioterio",
                table: "RotinasAnimais");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataBiometria",
                schema: "bioterio",
                table: "BiometriasAnimais",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AlterColumn<int>(
                name: "BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_Alimentacoes_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                column: "BiometriaAnimalId",
                unique: true,
                filter: "[BiometriaAnimalId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Alimentacoes_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.DropColumn(
                name: "DataBiometria",
                schema: "bioterio",
                table: "BiometriasAnimais");

            migrationBuilder.AddColumn<int>(
                name: "StatusRotina",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StatusRotina",
                schema: "bioterio",
                table: "RotinasAnimais",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<int>(
                name: "BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Alimentacoes_BiometriaAnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                column: "BiometriaAnimalId",
                unique: true);
        }
    }
}
