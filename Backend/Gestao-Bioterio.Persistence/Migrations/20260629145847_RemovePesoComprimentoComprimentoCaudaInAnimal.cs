using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RemovePesoComprimentoComprimentoCaudaInAnimal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ComprimentoCauda",
                schema: "bioterio",
                table: "Animals");

            migrationBuilder.DropColumn(
                name: "ComprimentoTotal",
                schema: "bioterio",
                table: "Animals");

            migrationBuilder.DropColumn(
                name: "Peso",
                schema: "bioterio",
                table: "Animals");

            migrationBuilder.DropColumn(
                name: "ComprimentoCauda",
                schema: "bioterio",
                table: "AnimaisLog");

            migrationBuilder.DropColumn(
                name: "ComprimentoTotal",
                schema: "bioterio",
                table: "AnimaisLog");

            migrationBuilder.DropColumn(
                name: "Peso",
                schema: "bioterio",
                table: "AnimaisLog");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "ComprimentoCauda",
                schema: "bioterio",
                table: "Animals",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ComprimentoTotal",
                schema: "bioterio",
                table: "Animals",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Peso",
                schema: "bioterio",
                table: "Animals",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ComprimentoCauda",
                schema: "bioterio",
                table: "AnimaisLog",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "ComprimentoTotal",
                schema: "bioterio",
                table: "AnimaisLog",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "Peso",
                schema: "bioterio",
                table: "AnimaisLog",
                type: "decimal(10,2)",
                precision: 10,
                scale: 2,
                nullable: false,
                defaultValue: 0m);
        }
    }
}
