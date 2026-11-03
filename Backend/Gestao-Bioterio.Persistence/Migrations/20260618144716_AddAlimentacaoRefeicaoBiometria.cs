using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAlimentacaoRefeicaoBiometria : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Alimentacoes",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    DataAlimentacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PesoRecomendado = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalOfertado = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TotalConsumido = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Saldo = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ResultadoAlimentacao = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alimentacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Alimentacoes_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "BiometriasAnimais",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    Peso = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Comprimento = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BiometriasAnimais", x => x.Id);
                    table.ForeignKey(
                        name: "FK_BiometriasAnimais_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Refeicoes",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AlimentacaoId = table.Column<int>(type: "int", nullable: false),
                    TipoRefeicao = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PesoRefeicao = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    SituacaoRefeicao = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Refeicoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Refeicoes_Alimentacoes_AlimentacaoId",
                        column: x => x.AlimentacaoId,
                        principalSchema: "bioterio",
                        principalTable: "Alimentacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alimentacoes_AnimalId",
                schema: "bioterio",
                table: "Alimentacoes",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_BiometriasAnimais_AnimalId",
                schema: "bioterio",
                table: "BiometriasAnimais",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Refeicoes_AlimentacaoId",
                schema: "bioterio",
                table: "Refeicoes",
                column: "AlimentacaoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BiometriasAnimais",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Refeicoes",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Alimentacoes",
                schema: "bioterio");
        }
    }
}
