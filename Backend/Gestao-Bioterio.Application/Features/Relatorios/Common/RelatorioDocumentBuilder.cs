using ClosedXML.Excel;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Gestao_Bioterio.Application.Features.Relatorios.Common
{
    public static class RelatorioDocumentBuilder
    {
        static RelatorioDocumentBuilder()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public static byte[] GerarExcel(string tituloAba, List<string> colunas, List<List<string>> linhas)
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add(string.IsNullOrWhiteSpace(tituloAba) ? "Relatório" : tituloAba);

            for (int c = 0; c < colunas.Count; c++)
            {
                var cell = worksheet.Cell(1, c + 1);
                cell.Value = colunas[c];
                cell.Style.Font.Bold = true;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#1E3A8A"); 
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            }

            for (int r = 0; r < linhas.Count; r++)
            {
                var rowData = linhas[r];
                var rowNum = r + 2;
                for (int c = 0; c < colunas.Count; c++)
                {
                    var cell = worksheet.Cell(rowNum, c + 1);
                    var val = c < rowData.Count ? rowData[c] : string.Empty;
                    cell.Value = val ?? string.Empty;
                    if (r % 2 == 1)
                    {
                        cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#F8FAFC"); 
                    }
                }
            }

            worksheet.Columns().AdjustToContents();

            using var ms = new MemoryStream();
            workbook.SaveAs(ms);
            return ms.ToArray();
        }

        public static byte[] GerarPdf(string tituloRelatorio, List<string> colunas, List<List<string>> linhas, string? subtituloFiltros = null)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(20);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial"));

                    // Cabeçalho do PDF
                    page.Header().Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Column(titleCol =>
                            {
                                titleCol.Item().Text("SIGBio - Sistema Integrado de Gestão de Biotério").FontSize(14).Bold().FontColor("#1E3A8A");
                                titleCol.Item().Text(tituloRelatorio).FontSize(12).SemiBold().FontColor("#334155");
                                if (!string.IsNullOrWhiteSpace(subtituloFiltros))
                                {
                                    titleCol.Item().Text($"Filtros aplicados: {subtituloFiltros}").FontSize(8).Italic().FontColor("#64748B");
                                }
                            });
                            row.ConstantItem(150).AlignRight().Text($"Gerado em: {DateTime.Now:dd/MM/yyyy HH:mm}").FontSize(8).FontColor("#64748B");
                        });
                        col.Item().PaddingTop(6).LineHorizontal(1).LineColor("#CBD5E1");
                    });

                    // Conteúdo da Tabela
                    page.Content().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            for (int i = 0; i < colunas.Count; i++)
                            {
                                columns.RelativeColumn();
                            }
                        });

                        // Header da Tabela
                        table.Header(header =>
                        {
                            for (int i = 0; i < colunas.Count; i++)
                            {
                                header.Cell().Background("#1E3A8A").Padding(4).AlignCenter().AlignMiddle()
                                    .Text(colunas[i]).Bold().FontColor(Colors.White).FontSize(8);
                            }
                        });

                        // Linhas da Tabela
                        for (int r = 0; r < linhas.Count; r++)
                        {
                            var rowData = linhas[r];
                            var bg = r % 2 == 0 ? "#FFFFFF" : "#F8FAFC";

                            for (int c = 0; c < colunas.Count; c++)
                            {
                                var val = c < rowData.Count ? rowData[c] : string.Empty;
                                table.Cell().Background(bg).BorderBottom(0.5f).BorderColor("#E2E8F0").Padding(4).AlignMiddle()
                                    .Text(val ?? string.Empty).FontSize(7.5f).FontColor("#1E293B");
                            }
                        }
                    });

                    // Rodapé
                    page.Footer().Row(row =>
                    {
                        row.RelativeItem().Text($"Total de registros: {linhas.Count}").FontSize(8).FontColor("#64748B");
                        row.RelativeItem().AlignRight().Text(x =>
                        {
                            x.Span("Página ");
                            x.CurrentPageNumber();
                            x.Span(" de ");
                            x.TotalPages();
                        });
                    });
                });
            });

            using var ms = new MemoryStream();
            document.GeneratePdf(ms);
            return ms.ToArray();
        }

        public static ExportRelatorioFileDto CriarArquivoResponse(
            FormatoRelatorio formato, 
            string baseFileName, 
            string tituloRelatorio, 
            List<string> colunas, 
            List<List<string>> linhas,
            string? subtituloFiltros = null)
        {
            var timestamp = DateTime.Now.ToString("yyyyMMdd_HHmmss");

            if (formato == FormatoRelatorio.Excel)
            {
                var bytes = GerarExcel(tituloRelatorio, colunas, linhas);
                return new ExportRelatorioFileDto
                {
                    FileBytes = bytes,
                    ContentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    FileName = $"{baseFileName}_{timestamp}.xlsx"
                };
            }
            else
            {
                var bytes = GerarPdf(tituloRelatorio, colunas, linhas, subtituloFiltros);
                return new ExportRelatorioFileDto
                {
                    FileBytes = bytes,
                    ContentType = "application/pdf",
                    FileName = $"{baseFileName}_{timestamp}.pdf"
                };
            }
        }
    }
}
