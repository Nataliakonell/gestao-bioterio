using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AuditableInBiometriaAndAlimentacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataCriacao",
                schema: "bioterio",
                table: "BiometriasAnimais",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "RF",
                schema: "bioterio",
                table: "BiometriasAnimais",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DataCriacao",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "RF",
                schema: "bioterio",
                table: "Alimentacoes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataCriacao",
                schema: "bioterio",
                table: "BiometriasAnimais");

            migrationBuilder.DropColumn(
                name: "RF",
                schema: "bioterio",
                table: "BiometriasAnimais");

            migrationBuilder.DropColumn(
                name: "DataCriacao",
                schema: "bioterio",
                table: "Alimentacoes");

            migrationBuilder.DropColumn(
                name: "RF",
                schema: "bioterio",
                table: "Alimentacoes");
        }
    }
}
