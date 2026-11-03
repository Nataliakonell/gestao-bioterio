using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddTablesProfileManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Funcionalidade",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Funcionalidade", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PerfilPermissaoLog",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PerfilId = table.Column<int>(type: "int", nullable: false),
                    FuncionalidadeId = table.Column<int>(type: "int", nullable: false),
                    NivelAcesso = table.Column<int>(type: "int", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TipoOperacao = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilPermissaoLog", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Perfis",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Perfis", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PerfilPermissao",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PerfilId = table.Column<int>(type: "int", nullable: false),
                    FuncionalidadeId = table.Column<int>(type: "int", nullable: false),
                    NivelAcesso = table.Column<int>(type: "int", nullable: false),
                    FuncionalidadeId1 = table.Column<int>(type: "int", nullable: true),
                    PerfilId1 = table.Column<int>(type: "int", nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PerfilPermissao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PerfilPermissao_Funcionalidade_FuncionalidadeId",
                        column: x => x.FuncionalidadeId,
                        principalSchema: "bioterio",
                        principalTable: "Funcionalidade",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PerfilPermissao_Funcionalidade_FuncionalidadeId1",
                        column: x => x.FuncionalidadeId1,
                        principalSchema: "bioterio",
                        principalTable: "Funcionalidade",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PerfilPermissao_Perfis_PerfilId",
                        column: x => x.PerfilId,
                        principalSchema: "bioterio",
                        principalTable: "Perfis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PerfilPermissao_Perfis_PerfilId1",
                        column: x => x.PerfilId1,
                        principalSchema: "bioterio",
                        principalTable: "Perfis",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Usuarios",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Status = table.Column<bool>(type: "bit", nullable: false, defaultValue: true),
                    PerfilId = table.Column<int>(type: "int", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Usuarios", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Usuarios_Perfis_PerfilId",
                        column: x => x.PerfilId,
                        principalSchema: "bioterio",
                        principalTable: "Perfis",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PerfilPermissao_FuncionalidadeId",
                schema: "bioterio",
                table: "PerfilPermissao",
                column: "FuncionalidadeId");

            migrationBuilder.CreateIndex(
                name: "IX_PerfilPermissao_FuncionalidadeId1",
                schema: "bioterio",
                table: "PerfilPermissao",
                column: "FuncionalidadeId1");

            migrationBuilder.CreateIndex(
                name: "IX_PerfilPermissao_PerfilId",
                schema: "bioterio",
                table: "PerfilPermissao",
                column: "PerfilId");

            migrationBuilder.CreateIndex(
                name: "IX_PerfilPermissao_PerfilId1",
                schema: "bioterio",
                table: "PerfilPermissao",
                column: "PerfilId1");

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_Email",
                schema: "bioterio",
                table: "Usuarios",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuario_RF",
                schema: "bioterio",
                table: "Usuarios",
                column: "RF",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Usuarios_PerfilId",
                schema: "bioterio",
                table: "Usuarios",
                column: "PerfilId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PerfilPermissao",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "PerfilPermissaoLog",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Usuarios",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Funcionalidade",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Perfis",
                schema: "bioterio");
        }
    }
}
