using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddPrescricaoSuspensao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "DataHoraSuspensao",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MotivoSuspensao",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "Ativa");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DataHoraSuspensao",
                schema: "bioterio",
                table: "PrescricoesMedicacao");

            migrationBuilder.DropColumn(
                name: "MotivoSuspensao",
                schema: "bioterio",
                table: "PrescricoesMedicacao");

            migrationBuilder.DropColumn(
                name: "Status",
                schema: "bioterio",
                table: "PrescricoesMedicacao");
        }
    }
}
