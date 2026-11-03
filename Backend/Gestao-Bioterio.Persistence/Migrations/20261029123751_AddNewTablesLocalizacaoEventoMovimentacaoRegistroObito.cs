using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddNewTablesLocalizacaoEventoMovimentacaoRegistroObito : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Localizacao",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    LocalizacaoPaiId = table.Column<int>(type: "int", nullable: true),
                    Ambiente = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CaminhoIds = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    CaminhoHierarquia = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Localizacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Localizacao_Localizacao_LocalizacaoPaiId",
                        column: x => x.LocalizacaoPaiId,
                        principalSchema: "bioterio",
                        principalTable: "Localizacao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RegistrosObito",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    DataObito = table.Column<DateTime>(type: "datetime2", nullable: false),
                    HouveNecropsia = table.Column<bool>(type: "bit", nullable: false),
                    Observacoes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RegistrosObito", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RegistrosObito_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AnimalLocalizacao",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    LocalizacaoId = table.Column<int>(type: "int", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TipoOperacao = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnimalLocalizacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnimalLocalizacao_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AnimalLocalizacao_Localizacao_LocalizacaoId",
                        column: x => x.LocalizacaoId,
                        principalSchema: "bioterio",
                        principalTable: "Localizacao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Evento",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TipoEvento = table.Column<int>(type: "int", nullable: false),
                    LocalizacaoId = table.Column<int>(type: "int", nullable: false),
                    DataHoraInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataHoraPrevisaoRetorno = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Responsavel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Evento_Localizacao_LocalizacaoId",
                        column: x => x.LocalizacaoId,
                        principalSchema: "bioterio",
                        principalTable: "Localizacao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MovimentacaoAnimal",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    LocalizacaoId = table.Column<int>(type: "int", nullable: false),
                    EventoId = table.Column<int>(type: "int", nullable: true),
                    TipoMovimentacao = table.Column<int>(type: "int", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MovimentacaoAnimal", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MovimentacaoAnimal_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MovimentacaoAnimal_Localizacao_LocalizacaoId",
                        column: x => x.LocalizacaoId,
                        principalSchema: "bioterio",
                        principalTable: "Localizacao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DocumentoEvento",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventoId = table.Column<int>(type: "int", nullable: false),
                    ModeloDocumentoId = table.Column<int>(type: "int", nullable: false),
                    ConteudoDadosJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DocumentoEvento", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DocumentoEvento_Evento_EventoId",
                        column: x => x.EventoId,
                        principalSchema: "bioterio",
                        principalTable: "Evento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DocumentoEvento_ModelosDocumento_ModeloDocumentoId",
                        column: x => x.ModeloDocumentoId,
                        principalSchema: "bioterio",
                        principalTable: "ModelosDocumento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EventosAnimais",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EventoId = table.Column<int>(type: "int", nullable: false),
                    AnimalId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventosAnimais", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EventosAnimais_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EventosAnimais_Evento_EventoId",
                        column: x => x.EventoId,
                        principalSchema: "bioterio",
                        principalTable: "Evento",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AnimalLocalizacao_AnimalId",
                schema: "bioterio",
                table: "AnimalLocalizacao",
                column: "AnimalId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AnimalLocalizacao_LocalizacaoId",
                schema: "bioterio",
                table: "AnimalLocalizacao",
                column: "LocalizacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoEvento_EventoId",
                schema: "bioterio",
                table: "DocumentoEvento",
                column: "EventoId");

            migrationBuilder.CreateIndex(
                name: "IX_DocumentoEvento_ModeloDocumentoId",
                schema: "bioterio",
                table: "DocumentoEvento",
                column: "ModeloDocumentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Evento_LocalizacaoId",
                schema: "bioterio",
                table: "Evento",
                column: "LocalizacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_EventosAnimais_AnimalId",
                schema: "bioterio",
                table: "EventosAnimais",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_EventosAnimais_EventoId_AnimalId",
                schema: "bioterio",
                table: "EventosAnimais",
                columns: new[] { "EventoId", "AnimalId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Localizacao_LocalizacaoPaiId",
                schema: "bioterio",
                table: "Localizacao",
                column: "LocalizacaoPaiId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacaoAnimal_AnimalId",
                schema: "bioterio",
                table: "MovimentacaoAnimal",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_MovimentacaoAnimal_LocalizacaoId",
                schema: "bioterio",
                table: "MovimentacaoAnimal",
                column: "LocalizacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_RegistrosObito_AnimalId",
                schema: "bioterio",
                table: "RegistrosObito",
                column: "AnimalId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AnimalLocalizacao",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "DocumentoEvento",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "EventosAnimais",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "MovimentacaoAnimal",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "RegistrosObito",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Evento",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Localizacao",
                schema: "bioterio");
        }
    }
}
