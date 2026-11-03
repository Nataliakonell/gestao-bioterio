using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddRotinaAnimal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RotinasAnimais",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EspecieId = table.Column<int>(type: "int", nullable: false),
                    TipoRotina = table.Column<int>(type: "int", maxLength: 50, nullable: false),
                    FrequenciaFilhote = table.Column<int>(type: "int", nullable: true),
                    FrequenciaJovem = table.Column<int>(type: "int", nullable: true),
                    FrequenciaAdulto = table.Column<int>(type: "int", nullable: true),
                    ProtocoloDieta = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    StatusRotina = table.Column<int>(type: "int", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RotinasAnimais", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RotinasAnimais_Especies_EspecieId",
                        column: x => x.EspecieId,
                        principalSchema: "bioterio",
                        principalTable: "Especies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RotinasAnimaisLogs",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EspecieId = table.Column<int>(type: "int", nullable: false),
                    TipoRotina = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FrequenciaFilhote = table.Column<int>(type: "int", nullable: true),
                    FrequenciaJovem = table.Column<int>(type: "int", nullable: true),
                    FrequenciaAdulto = table.Column<int>(type: "int", nullable: true),
                    ProtocoloDieta = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    StatusRotina = table.Column<int>(type: "int", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TipoOperacao = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RotinasAnimaisLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RotinasAnimaisLogs_Especies_EspecieId",
                        column: x => x.EspecieId,
                        principalSchema: "bioterio",
                        principalTable: "Especies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RotinasAnimais_EspecieId",
                schema: "bioterio",
                table: "RotinasAnimais",
                column: "EspecieId");

            migrationBuilder.CreateIndex(
                name: "IX_RotinasAnimaisLogs_EspecieId",
                schema: "bioterio",
                table: "RotinasAnimaisLogs",
                column: "EspecieId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RotinasAnimais",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "RotinasAnimaisLogs",
                schema: "bioterio");
        }
    }
}
