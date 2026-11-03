using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Gestao_Bioterio.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class ChangeDiaSemanaProgramadoToString : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE [bioterio].[RotinasAnimais]
                SET DiaSemanaProgramado = 
                    REPLACE(
                        REPLACE(
                            REPLACE(
                                REPLACE(
                                    REPLACE(
                                        REPLACE(
                                            REPLACE(DiaSemanaProgramado,
                                                '0', '"Domingo"'),
                                            '1', '"Segunda"'),
                                        '2', '"Terça"'),
                                    '3', '"Quarta"'),
                                '4', '"Quinta"'),
                            '5', '"Sexta"'),
                        '6', '"Sábado"')
                WHERE DiaSemanaProgramado IS NOT NULL
            """);

            migrationBuilder.Sql("""
                UPDATE [bioterio].[RotinasAnimaisLogs]
                SET DiaSemanaProgramado = 
                    REPLACE(
                        REPLACE(
                            REPLACE(
                                REPLACE(
                                    REPLACE(
                                        REPLACE(
                                            REPLACE(DiaSemanaProgramado,
                                                '0', '"Domingo"'),
                                            '1', '"Segunda"'),
                                        '2', '"Terça"'),
                                    '3', '"Quarta"'),
                                '4', '"Quinta"'),
                            '5', '"Sexta"'),
                        '6', '"Sábado"')
                WHERE DiaSemanaProgramado IS NOT NULL
            """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                UPDATE [bioterio].[RotinasAnimais]
                SET DiaSemanaProgramado =
                    REPLACE(
                        REPLACE(
                            REPLACE(
                                REPLACE(
                                    REPLACE(
                                        REPLACE(
                                            REPLACE(DiaSemanaProgramado,
                                                '"Domingo"', '0'),
                                            '"Segunda"', '1'),
                                        '"Terça"', '2'),
                                    '"Quarta"', '3'),
                                '"Quinta"', '4'),
                            '"Sexta"', '5'),
                        '"Sábado"', '6')
                WHERE DiaSemanaProgramado IS NOT NULL
            """);

            migrationBuilder.Sql("""
                UPDATE [bioterio].[RotinasAnimaisLogs]
                SET DiaSemanaProgramado =
                    REPLACE(
                        REPLACE(
                            REPLACE(
                                REPLACE(
                                    REPLACE(
                                        REPLACE(
                                            REPLACE(DiaSemanaProgramado,
                                                '"Domingo"', '0'),
                                            '"Segunda"', '1'),
                                        '"Terça"', '2'),
                                    '"Quarta"', '3'),
                                '"Quinta"', '4'),
                            '"Sexta"', '5'),
                        '"Sábado"', '6')
                WHERE DiaSemanaProgramado IS NOT NULL
            """);
        }
    }
}
