using Gestao_Bioterio.Application.Features.Relatorios.Common;
using Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportAlimentarRelatorio;
using Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportClinicoRelatorio;
using Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportEventosRelatorio;
using Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportInstalacoesRelatorio;
using Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportMovimentacoesRelatorio;
using Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportPlantelRelatorio;
using Gestao_Bioterio.Application.Features.Relatorios.Queries.ExportSisfaunaRelatorio;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RelatoriosController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RelatoriosController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("plantel", Name = "ExportarRelatorioPlantel")]
        public async Task<IActionResult> ExportarPlantel(
            [FromQuery] FormatoRelatorio formato = FormatoRelatorio.Excel,
            [FromQuery] int? grupoId = null,
            [FromQuery] int? especieId = null,
            [FromQuery] int? situacao = null,
            [FromQuery] int? genero = null,
            [FromQuery] int? faseDeVida = null,
            [FromQuery] DateTime? dataEntradaInicio = null,
            [FromQuery] DateTime? dataEntradaFim = null)
        {
            var query = new ExportPlantelRelatorioQuery
            {
                Formato = formato,
                GrupoId = grupoId,
                EspecieId = especieId,
                Situacao = situacao,
                Genero = genero,
                FaseDeVida = faseDeVida,
                DataEntradaInicio = dataEntradaInicio,
                DataEntradaFim = dataEntradaFim
            };

            var fileDto = await _mediator.Send(query);
            return File(fileDto.FileBytes, fileDto.ContentType, fileDto.FileName);
        }

        [HttpGet("alimentacao", Name = "ExportarRelatorioAlimentacao")]
        public async Task<IActionResult> ExportarAlimentacao(
            [FromQuery] FormatoRelatorio formato = FormatoRelatorio.Excel,
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null,
            [FromQuery] int? especieId = null,
            [FromQuery] int? consumo = null,
            [FromQuery] string? responsavel = null)
        {
            var query = new ExportAlimentarRelatorioQuery
            {
                Formato = formato,
                DataInicio = dataInicio,
                DataFim = dataFim,
                EspecieId = especieId,
                Consumo = consumo,
                Responsavel = responsavel
            };

            var fileDto = await _mediator.Send(query);
            return File(fileDto.FileBytes, fileDto.ContentType, fileDto.FileName);
        }

        [HttpGet("clinico", Name = "ExportarRelatorioClinico")]
        public async Task<IActionResult> ExportarClinico(
            [FromQuery] FormatoRelatorio formato = FormatoRelatorio.Excel,
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null,
            [FromQuery] int? tipoClinico = null,
            [FromQuery] int? animalId = null,
            [FromQuery] string? veterinario = null)
        {
            var query = new ExportClinicoRelatorioQuery
            {
                Formato = formato,
                DataInicio = dataInicio,
                DataFim = dataFim,
                TipoClinico = tipoClinico,
                AnimalId = animalId,
                Veterinario = veterinario
            };

            var fileDto = await _mediator.Send(query);
            return File(fileDto.FileBytes, fileDto.ContentType, fileDto.FileName);
        }

        [HttpGet("instalacoes", Name = "ExportarRelatorioInstalacoes")]
        public async Task<IActionResult> ExportarInstalacoes(
            [FromQuery] int localizacaoId,
            [FromQuery] FormatoRelatorio formato = FormatoRelatorio.Excel,
            [FromQuery] bool incluirSublocais = true,
            [FromQuery] int? especieId = null)
        {
            if (localizacaoId <= 0)
            {
                return BadRequest("O parâmetro localizacaoId é obrigatório e deve ser maior que zero.");
            }

            var query = new ExportInstalacoesRelatorioQuery
            {
                Formato = formato,
                LocalizacaoId = localizacaoId,
                IncluirSublocais = incluirSublocais,
                EspecieId = especieId
            };

            var fileDto = await _mediator.Send(query);
            return File(fileDto.FileBytes, fileDto.ContentType, fileDto.FileName);
        }

        [HttpGet("eventos", Name = "ExportarRelatorioEventos")]
        public async Task<IActionResult> ExportarEventos(
            [FromQuery] FormatoRelatorio formato = FormatoRelatorio.Excel,
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null,
            [FromQuery] int? tipoEvento = null,
            [FromQuery] int? status = null)
        {
            var query = new ExportEventosRelatorioQuery
            {
                Formato = formato,
                DataInicio = dataInicio,
                DataFim = dataFim,
                TipoEvento = tipoEvento,
                Status = status
            };

            var fileDto = await _mediator.Send(query);
            return File(fileDto.FileBytes, fileDto.ContentType, fileDto.FileName);
        }

        [HttpGet("movimentacoes", Name = "ExportarRelatorioMovimentacoes")]
        public async Task<IActionResult> ExportarMovimentacoes(
            [FromQuery] FormatoRelatorio formato = FormatoRelatorio.Excel,
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null,
            [FromQuery] int? animalId = null,
            [FromQuery] int? tipoMovimentacao = null,
            [FromQuery] int? localizacaoId = null)
        {
            var query = new ExportMovimentacoesRelatorioQuery
            {
                Formato = formato,
                DataInicio = dataInicio,
                DataFim = dataFim,
                AnimalId = animalId,
                TipoMovimentacao = tipoMovimentacao,
                LocalizacaoId = localizacaoId
            };

            var fileDto = await _mediator.Send(query);
            return File(fileDto.FileBytes, fileDto.ContentType, fileDto.FileName);
        }

        [HttpGet("sisfauna", Name = "ExportarRelatorioSisfauna")]
        public async Task<IActionResult> ExportarSisfauna(
            [FromQuery] FormatoRelatorio formato = FormatoRelatorio.Excel,
            [FromQuery] int? anoReferencia = null,
            [FromQuery] DateTime? dataEntradaInicio = null,
            [FromQuery] DateTime? dataEntradaFim = null,
            [FromQuery] int? especieId = null,
            [FromQuery] bool somenteAtivos = false)
        {
            var query = new ExportSisfaunaRelatorioQuery
            {
                Formato = formato,
                AnoReferencia = anoReferencia,
                DataEntradaInicio = dataEntradaInicio,
                DataEntradaFim = dataEntradaFim,
                EspecieId = especieId,
                SomenteAtivos = somenteAtivos
            };

            var fileDto = await _mediator.Send(query);
            return File(fileDto.FileBytes, fileDto.ContentType, fileDto.FileName);
        }
    }
}
