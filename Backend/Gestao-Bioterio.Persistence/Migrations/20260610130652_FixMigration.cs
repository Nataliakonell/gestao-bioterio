using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class FixMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "bioterio");

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
                name: "InstalacoesBioterio",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InstalacoesBioterio", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "LocalOrigens",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocalOrigens", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Especies",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    NomePopular = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    GrupoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Especies", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Especies_Groups_GrupoId",
                        column: x => x.GrupoId,
                        principalSchema: "bioterio",
                        principalTable: "Groups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
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
                    InstalacaoBioterioId = table.Column<int>(type: "int", nullable: false),
                    Genero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FaseDeVida = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataDeEntrada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SituacaoAnimal = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Municipio = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NumeroChip = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Peso = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ComprimentoTotal = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ComprimentoCauda = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Sisfauna = table.Column<bool>(type: "bit", nullable: false),
                    TermoDeDoacao = table.Column<bool>(type: "bit", nullable: false),
                    LocalOrigemId = table.Column<int>(type: "int", nullable: false),
                    NomeArquivoFoto = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
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
                        name: "FK_Animals_InstalacoesBioterio_InstalacaoBioterioId",
                        column: x => x.InstalacaoBioterioId,
                        principalSchema: "bioterio",
                        principalTable: "InstalacoesBioterio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Animals_LocalOrigens_LocalOrigemId",
                        column: x => x.LocalOrigemId,
                        principalSchema: "bioterio",
                        principalTable: "LocalOrigens",
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
                    InstalacaoBioterioId = table.Column<int>(type: "int", nullable: false),
                    Genero = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FaseDeVida = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataDeEntrada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Municipio = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NumeroChip = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Peso = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ComprimentoTotal = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    ComprimentoCauda = table.Column<decimal>(type: "decimal(10,2)", precision: 10, scale: 2, nullable: false),
                    Sisfauna = table.Column<bool>(type: "bit", nullable: false),
                    TermoDeDoacao = table.Column<bool>(type: "bit", nullable: false),
                    Situacao = table.Column<int>(type: "int", nullable: false),
                    LocalOrigemId = table.Column<int>(type: "int", nullable: false),
                    NomeArquivoFoto = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                        name: "FK_AnimaisLog_InstalacoesBioterio_InstalacaoBioterioId",
                        column: x => x.InstalacaoBioterioId,
                        principalSchema: "bioterio",
                        principalTable: "InstalacoesBioterio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AnimaisLog_LocalOrigens_LocalOrigemId",
                        column: x => x.LocalOrigemId,
                        principalSchema: "bioterio",
                        principalTable: "LocalOrigens",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex("IX_AnimaisLog_AnimalId", "AnimaisLog", "AnimalId", schema: "bioterio");
            migrationBuilder.CreateIndex("IX_AnimaisLog_AnimalId_DataCriacao", "AnimaisLog", new[] { "AnimalId", "DataCriacao" }, schema: "bioterio");
            migrationBuilder.CreateIndex("IX_AnimaisLog_InstalacaoBioterioId", "AnimaisLog", "InstalacaoBioterioId", schema: "bioterio");
            migrationBuilder.CreateIndex("IX_AnimaisLog_LocalOrigemId", "AnimaisLog", "LocalOrigemId", schema: "bioterio");
            migrationBuilder.CreateIndex("IX_Animal_NumeroChip", "Animals", "NumeroChip", schema: "bioterio", unique: true);
            migrationBuilder.CreateIndex("IX_Animal_NumeroRegistro", "Animals", "NumeroRegistro", schema: "bioterio", unique: true);
            migrationBuilder.CreateIndex("IX_Animals_EspecieId", "Animals", "EspecieId", schema: "bioterio");
            migrationBuilder.CreateIndex("IX_Animals_InstalacaoBioterioId", "Animals", "InstalacaoBioterioId", schema: "bioterio");
            migrationBuilder.CreateIndex("IX_Animals_LocalOrigemId", "Animals", "LocalOrigemId", schema: "bioterio");
            migrationBuilder.CreateIndex("IX_Especies_GrupoId", "Especies", "GrupoId", schema: "bioterio");
            migrationBuilder.CreateIndex("IX_LocalOrigens_Nome", "LocalOrigens", "Nome", schema: "bioterio", unique: true);
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
                name: "InstalacoesBioterio",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "LocalOrigens",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Groups",
                schema: "bioterio");
        }
    }
}
