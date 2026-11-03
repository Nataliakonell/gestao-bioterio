using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "bioterio");

            migrationBuilder.CreateTable(
                name: "Especies",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Especies", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Groups",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Groups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Localizacoes",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Localizacoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LocalOrigem",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocalOrigem", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Animals",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NumeroRegistro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NomePopular = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EspecieId = table.Column<int>(type: "int", nullable: false),
                    GrupoId = table.Column<int>(type: "int", nullable: false),
                    LocalizacaoId = table.Column<int>(type: "int", nullable: false),
                    Genero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FaseDeVida = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataDeEntrada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SituacaoAnimal = table.Column<int>(type: "int", nullable: false),
                    Municipio = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NumeroDoChipe = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MassaEntrada = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ComprimentoTotal = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ComprimentoCauda = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Sisfauna = table.Column<bool>(type: "bit", nullable: false),
                    TermoDeDoacao = table.Column<bool>(type: "bit", nullable: false),
                    SituacaoAtual = table.Column<int>(type: "int", nullable: false),
                    LocalOrigemId = table.Column<int>(type: "int", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TipoOperacao = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Animals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Animals_Especies_EspecieId",
                        column: x => x.EspecieId,
                        principalSchema: "bioterio",
                        principalTable: "Especies",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Animals_Groups_GrupoId",
                        column: x => x.GrupoId,
                        principalSchema: "bioterio",
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Animals_LocalOrigem_LocalOrigemId",
                        column: x => x.LocalOrigemId,
                        principalSchema: "bioterio",
                        principalTable: "LocalOrigem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Animals_Localizacoes_LocalizacaoId",
                        column: x => x.LocalizacaoId,
                        principalSchema: "bioterio",
                        principalTable: "Localizacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AnimaisLog",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    NumeroRegistro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    NomePopular = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    EspecieId = table.Column<int>(type: "int", nullable: false),
                    GrupoId = table.Column<int>(type: "int", nullable: false),
                    LocalizacaoId = table.Column<int>(type: "int", nullable: false),
                    Genero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FaseDeVida = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataDeEntrada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Municipio = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NumeroDoChipe = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MassaEntrada = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ComprimentoTotal = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ComprimentoCauda = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Sisfauna = table.Column<bool>(type: "bit", nullable: false),
                    TermoDeDoacao = table.Column<bool>(type: "bit", nullable: false),
                    Situacao = table.Column<int>(type: "int", nullable: false),
                    LocalOrigemId = table.Column<int>(type: "int", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TipoOperacao = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false, defaultValue: "CREATE")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnimaisLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnimaisLog_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AnimaisLog_LocalOrigem_LocalOrigemId",
                        column: x => x.LocalOrigemId,
                        principalSchema: "bioterio",
                        principalTable: "LocalOrigem",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnimaisLog_LocalOrigemId",
                schema: "bioterio",
                table: "AnimaisLog",
                column: "LocalOrigemId");

            migrationBuilder.CreateIndex(
                name: "IX_AnimalLog_AnimalId",
                schema: "bioterio",
                table: "AnimaisLog",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_AnimalLog_AnimalId_DataCriacao",
                schema: "bioterio",
                table: "AnimaisLog",
                columns: new[] { "AnimalId", "DataCriacao" });

            migrationBuilder.CreateIndex(
                name: "IX_Animal_NumeroDoChipe_Unique",
                schema: "bioterio",
                table: "Animals",
                column: "NumeroDoChipe",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Animal_NumeroRegistro_Unique",
                schema: "bioterio",
                table: "Animals",
                column: "NumeroRegistro",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Animals_EspecieId",
                schema: "bioterio",
                table: "Animals",
                column: "EspecieId");

            migrationBuilder.CreateIndex(
                name: "IX_Animals_GrupoId",
                schema: "bioterio",
                table: "Animals",
                column: "GrupoId");

            migrationBuilder.CreateIndex(
                name: "IX_Animals_LocalizacaoId",
                schema: "bioterio",
                table: "Animals",
                column: "LocalizacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Animals_LocalOrigemId",
                schema: "bioterio",
                table: "Animals",
                column: "LocalOrigemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnimaisLog",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Animals",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Especies",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Groups",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "LocalOrigem",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Localizacoes",
                schema: "bioterio");
        }
    }
}
