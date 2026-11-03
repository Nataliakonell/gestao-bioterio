using Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail;
using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.Alimentacoes.Command.CreateAlimentacao;
using Gestao_Bioterio.Application.Features.Alimentacoes.Command.DeleteAlimentacao;
using Gestao_Bioterio.Application.Features.Alimentacoes.Command.UpdateAlimentacao;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAlimentacaoDetail;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacao;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacoes;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AlimentacaoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public AlimentacaoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet(Name = "GetAllAlimentacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Alimentação", NivelAcesso.Visualizar)]
        public async Task<ActionResult<PaginatedAlimentacaoListVm>> GetAllAlimentacao(
            [FromQuery] int? animalId = null,
            [FromQuery] string? search = null,
            [FromQuery] int? especieId = null,
            [FromQuery] string? faseDeVida = null,
            [FromQuery] string? status = null,
            [FromQuery] DateTime? dataInicial = null,
            [FromQuery] DateTime? dataFinal = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var result = await _mediator.Send(new GetAllAlimentacaoQuery 
            { 
                AnimalId = animalId,
                SearchTerm = search,
                EspecieId = especieId,
                FaseDeVida = faseDeVida?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse).ToList(),
                Status = status?.Split(',', StringSplitOptions.RemoveEmptyEntries)
                    .Select(int.Parse).ToList(),
                DataInicial = dataInicial,
                DataFinal = dataFinal,
                Page = page,
                PageSize = pageSize
            });
            return Ok(result);
        }

        [HttpPost(Name = "AddAlimentacao")]
        [RequirePermission("Alimentação", NivelAcesso.Editar)]
        public async Task<ActionResult> Create([FromBody] CreateAlimentacaoCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpGet("{id}", Name = "GetAlimentacaoById")]
        [RequirePermission("Alimentação", NivelAcesso.Visualizar)]
        public async Task<ActionResult<GetAlimentacaoDetailVm>> GetAlimentacaoById(int id)
        {
            var getAlimentacaoDetailQuery = new GetAlimentacaoDetailQuery() { Id = id };
            return Ok(await _mediator.Send(getAlimentacaoDetailQuery));
        }

        [HttpPut(Name = "UpdateAlimentacao")]
        [RequirePermission("Alimentação", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateAlimentacaoCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteAlimentacao")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Alimentação", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var deleteAnimalCommand = new DeleteAlimentacaoCommand() { Id = id };
            await _mediator.Send(deleteAnimalCommand);
            return NoContent();
        }
    }
}

