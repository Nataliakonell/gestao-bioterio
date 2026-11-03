using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddModuloClinico : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Atendimentos",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    InstalacaoBioterioId = table.Column<int>(type: "int", nullable: false),
                    BiometriaAnimalId = table.Column<int>(type: "int", nullable: true),
                    TipoAtendimento = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    DataHoraPrevista = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Anamnese = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Diagnostico = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ExameFisico = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Tratamento = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Responsavel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Atendimentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Atendimentos_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Atendimentos_BiometriasAnimais_BiometriaAnimalId",
                        column: x => x.BiometriaAnimalId,
                        principalSchema: "bioterio",
                        principalTable: "BiometriasAnimais",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Atendimentos_InstalacoesBioterio_InstalacaoBioterioId",
                        column: x => x.InstalacaoBioterioId,
                        principalSchema: "bioterio",
                        principalTable: "InstalacoesBioterio",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Medicacoes",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Ativo = table.Column<bool>(type: "bit", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Medicacoes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProtocolosDesverminacao",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    DataEntrada = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StatusProtocolo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CicloInicialConcluido = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    DataConclusaoCicloInicial = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataProximaDose = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProtocolosDesverminacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProtocolosDesverminacao_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Anexos",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AtendimentoId = table.Column<int>(type: "int", nullable: true),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    NomeArquivoAnexo = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Descricao = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Anexos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Anexos_Atendimentos_AtendimentoId",
                        column: x => x.AtendimentoId,
                        principalSchema: "bioterio",
                        principalTable: "Atendimentos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Evolucoes",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AtendimentoId = table.Column<int>(type: "int", nullable: true),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    DataHoraRegistro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Responsavel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evolucoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Evolucoes_Atendimentos_AtendimentoId",
                        column: x => x.AtendimentoId,
                        principalSchema: "bioterio",
                        principalTable: "Atendimentos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "Procedimentos",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    AtendimentoId = table.Column<int>(type: "int", nullable: true),
                    TipoProcedimento = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Detalhamento = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Procedimentos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Procedimentos_Atendimentos_AtendimentoId",
                        column: x => x.AtendimentoId,
                        principalSchema: "bioterio",
                        principalTable: "Atendimentos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "SolicitacoesExame",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AtendimentoId = table.Column<int>(type: "int", nullable: true),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    TipoExame = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SinaisClinicos = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    SuspeitaClinica = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    RegiaoAnatomica = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SolicitacoesExame", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SolicitacoesExame_Atendimentos_AtendimentoId",
                        column: x => x.AtendimentoId,
                        principalSchema: "bioterio",
                        principalTable: "Atendimentos",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "PrescricoesMedicacao",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnimalId = table.Column<int>(type: "int", nullable: false),
                    AtendimentoId = table.Column<int>(type: "int", nullable: true),
                    MedicacaoId = table.Column<int>(type: "int", nullable: false),
                    VolumeDose = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ViaAdministracao = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    QuantidadeDoses = table.Column<int>(type: "int", nullable: false),
                    IntervaloEntreDosesHoras = table.Column<int>(type: "int", nullable: false),
                    DataHoraInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrescricoesMedicacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrescricoesMedicacao_Animals_AnimalId",
                        column: x => x.AnimalId,
                        principalSchema: "bioterio",
                        principalTable: "Animals",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PrescricoesMedicacao_Atendimentos_AtendimentoId",
                        column: x => x.AtendimentoId,
                        principalSchema: "bioterio",
                        principalTable: "Atendimentos",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_PrescricoesMedicacao_Medicacoes_MedicacaoId",
                        column: x => x.MedicacaoId,
                        principalSchema: "bioterio",
                        principalTable: "Medicacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "DosesAplicacaoDesverminacao",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProtocoloDesverminacaoId = table.Column<int>(type: "int", nullable: false),
                    TipoDose = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DataPrevista = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataAplicacao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    StatusDoseDesverminacao = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DosesAplicacaoDesverminacao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DosesAplicacaoDesverminacao_ProtocolosDesverminacao_ProtocoloDesverminacaoId",
                        column: x => x.ProtocoloDesverminacaoId,
                        principalSchema: "bioterio",
                        principalTable: "ProtocolosDesverminacao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MedicacoesAdministradas",
                schema: "bioterio",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PrescricaoMedicacaoId = table.Column<int>(type: "int", nullable: false),
                    PrescricaoMedicacaoId1 = table.Column<int>(type: "int", nullable: true),
                    DataHoraAdministracao = table.Column<DateTime>(type: "datetime2", nullable: true),
                    DataHoraPrevista = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Observacao = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    Responsavel = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    StatusDose = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RF = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DataCriacao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MedicacoesAdministradas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MedicacoesAdministradas_PrescricoesMedicacao_PrescricaoMedicacaoId",
                        column: x => x.PrescricaoMedicacaoId,
                        principalSchema: "bioterio",
                        principalTable: "PrescricoesMedicacao",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_MedicacoesAdministradas_PrescricoesMedicacao_PrescricaoMedicacaoId1",
                        column: x => x.PrescricaoMedicacaoId1,
                        principalSchema: "bioterio",
                        principalTable: "PrescricoesMedicacao",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Anexos_AnimalId",
                schema: "bioterio",
                table: "Anexos",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Anexos_AtendimentoId",
                schema: "bioterio",
                table: "Anexos",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Atendimentos_AnimalId",
                schema: "bioterio",
                table: "Atendimentos",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Atendimentos_BiometriaAnimalId",
                schema: "bioterio",
                table: "Atendimentos",
                column: "BiometriaAnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Atendimentos_DataHoraPrevista",
                schema: "bioterio",
                table: "Atendimentos",
                column: "DataHoraPrevista");

            migrationBuilder.CreateIndex(
                name: "IX_Atendimentos_InstalacaoBioterioId",
                schema: "bioterio",
                table: "Atendimentos",
                column: "InstalacaoBioterioId");

            migrationBuilder.CreateIndex(
                name: "IX_Atendimentos_TipoAtendimento",
                schema: "bioterio",
                table: "Atendimentos",
                column: "TipoAtendimento");

            migrationBuilder.CreateIndex(
                name: "IX_DosesAplicacaoDesverminacao_ProtocoloDesverminacaoId",
                schema: "bioterio",
                table: "DosesAplicacaoDesverminacao",
                column: "ProtocoloDesverminacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Evolucoes_AnimalId",
                schema: "bioterio",
                table: "Evolucoes",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Evolucoes_AtendimentoId",
                schema: "bioterio",
                table: "Evolucoes",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Evolucoes_DataHoraRegistro",
                schema: "bioterio",
                table: "Evolucoes",
                column: "DataHoraRegistro");

            migrationBuilder.CreateIndex(
                name: "IX_Evolucoes_Responsavel",
                schema: "bioterio",
                table: "Evolucoes",
                column: "Responsavel");

            migrationBuilder.CreateIndex(
                name: "IX_Medicacoes_Nome",
                schema: "bioterio",
                table: "Medicacoes",
                column: "Nome");

            migrationBuilder.CreateIndex(
                name: "IX_MedicacoesAdministradas_DataHoraPrevista",
                schema: "bioterio",
                table: "MedicacoesAdministradas",
                column: "DataHoraPrevista");

            migrationBuilder.CreateIndex(
                name: "IX_MedicacoesAdministradas_PrescricaoMedicacaoId",
                schema: "bioterio",
                table: "MedicacoesAdministradas",
                column: "PrescricaoMedicacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_MedicacoesAdministradas_PrescricaoMedicacaoId1",
                schema: "bioterio",
                table: "MedicacoesAdministradas",
                column: "PrescricaoMedicacaoId1");

            migrationBuilder.CreateIndex(
                name: "IX_MedicacoesAdministradas_StatusDose",
                schema: "bioterio",
                table: "MedicacoesAdministradas",
                column: "StatusDose");

            migrationBuilder.CreateIndex(
                name: "IX_PrescricoesMedicacao_AnimalId",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescricoesMedicacao_AtendimentoId",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_PrescricoesMedicacao_DataHoraInicio",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                column: "DataHoraInicio");

            migrationBuilder.CreateIndex(
                name: "IX_PrescricoesMedicacao_MedicacaoId",
                schema: "bioterio",
                table: "PrescricoesMedicacao",
                column: "MedicacaoId");

            migrationBuilder.CreateIndex(
                name: "IX_Procedimentos_AnimalId",
                schema: "bioterio",
                table: "Procedimentos",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_Procedimentos_AtendimentoId",
                schema: "bioterio",
                table: "Procedimentos",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Procedimentos_TipoProcedimento",
                schema: "bioterio",
                table: "Procedimentos",
                column: "TipoProcedimento");

            migrationBuilder.CreateIndex(
                name: "IX_ProtocolosDesverminacao_AnimalId",
                schema: "bioterio",
                table: "ProtocolosDesverminacao",
                column: "AnimalId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesExame_AtendimentoId",
                schema: "bioterio",
                table: "SolicitacoesExame",
                column: "AtendimentoId");

            migrationBuilder.CreateIndex(
                name: "IX_SolicitacoesExame_TipoExame",
                schema: "bioterio",
                table: "SolicitacoesExame",
                column: "TipoExame");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Anexos",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "DosesAplicacaoDesverminacao",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Evolucoes",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "MedicacoesAdministradas",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Procedimentos",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "SolicitacoesExame",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "ProtocolosDesverminacao",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "PrescricoesMedicacao",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Atendimentos",
                schema: "bioterio");

            migrationBuilder.DropTable(
                name: "Medicacoes",
                schema: "bioterio");
        }
    }
}
