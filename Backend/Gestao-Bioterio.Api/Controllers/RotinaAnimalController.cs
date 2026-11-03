using Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Command.CreateRotinaAnimal;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllAnimaisRotinaStatus;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllRotinasAnimais;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAnimalRotinaStatus;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Command.DeleteRotinaAnimal;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Command.UpdateRotinaAnimal;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetRotinaAnimalDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RotinaAnimalController : ControllerBase
    {
        private readonly IMediator _mediator;

        public RotinaAnimalController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet(Name = "GetAllRotinaAnimal")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Rotinas", NivelAcesso.Visualizar)]
        public async Task<ActionResult<PaginatedRotinaAnimalListVm>> GetAllRotinaAnimal(
            [FromQuery] int page = 1, 
            [FromQuery] int pageSize = 10, 
            [FromQuery] string? search = null,
            [FromQuery] int? especieId = null,
            [FromQuery] string? faseDeVida = null)
        {
            var query = new GetAllRotinasAnimaisQuery
            {
                Page = page,
                PageSize = pageSize,
                SearchTerm = search,
                EspecieId = especieId,
                FaseDeVidas = !string.IsNullOrEmpty(faseDeVida)
                    ? faseDeVida.Split(',').Select(int.Parse).ToList()
                    : null
            };
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        [HttpPost(Name = "AddRotinaAnimal")]
        [RequirePermission("Rotinas", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateRotinaAnimalCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpGet("{id}", Name = "GetRotinaAnimalById")]
        [RequirePermission("Rotinas", NivelAcesso.Visualizar)]

        public async Task<ActionResult<RotinaAnimalDetailVm>> GetRotinaAnimalById(int id)
        {
            var getRotinaAnimalDetailQuery = new GetRotinaAnimalDetailQuery() { Id = id };
            return Ok(await _mediator.Send(getRotinaAnimalDetailQuery));
        }

        [HttpPut(Name = "UpdateRotinaAnimal")]
        [RequirePermission("Rotinas", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateRotinaAnimalCommand command)
        {
            var response = await _mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteRotinaAnimal")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Rotinas", NivelAcesso.Editar)]
        public async Task<ActionResult> Delete(int id)
        {
            var deleteRotinaAnimalCommand = new DeleteRotinaAnimalCommand() { Id = id };
            await _mediator.Send(deleteRotinaAnimalCommand);
            return NoContent();
        }

        [HttpGet("animal/{animalId}/status", Name = "GetAnimalRotinaStatus")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Rotinas", NivelAcesso.Visualizar)]
        public async Task<ActionResult<AnimalRotinaStatusVm>> GetAnimalRotinaStatus(int animalId)
        {
            var query = new GetAnimalRotinaStatusQuery() { AnimalId = animalId };
            return Ok(await _mediator.Send(query));
        }

        [HttpGet("status/all", Name = "GetAllAnimaisRotinaStatus")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [RequirePermission("Rotinas", NivelAcesso.Visualizar)]
        public async Task<ActionResult<PaginatedAnimalRotinaStatusVm>> GetAllAnimaisRotinaStatus(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] int? especieId = null,
            [FromQuery] string? search = null,
            [FromQuery] string? faseDeVida = null,
            [FromQuery] string? statusBiometria = null,
            [FromQuery] DateTime? dataBiometriaInicial = null,
            [FromQuery] DateTime? dataBiometriaFinal = null,
            [FromQuery] string? statusAlimentacao = null,
            [FromQuery] DateTime? dataAlimentacaoInicial = null,
            [FromQuery] DateTime? dataAlimentacaoFinal = null)
        {
            var query = new GetAllAnimaisRotinaStatusQuery
            {
                Page = page,
                PageSize = pageSize,
                EspecieId = especieId,
                SituacaoAnimal = Situacao.Vivo,
                Search = search,
                FaseDeVida = !string.IsNullOrEmpty(faseDeVida) ? faseDeVida.Split(',').Select(int.Parse).ToList() : null,
                StatusBiometria = !string.IsNullOrEmpty(statusBiometria) ? statusBiometria.Split(',').Select(int.Parse).ToList() : null,
                DataBiometriaInicial = dataBiometriaInicial,
                DataBiometriaFinal = dataBiometriaFinal,
                StatusAlimentacao = !string.IsNullOrEmpty(statusAlimentacao) ? statusAlimentacao.Split(',').Select(int.Parse).ToList() : null,
                DataAlimentacaoInicial = dataAlimentacaoInicial,
                DataAlimentacaoFinal = dataAlimentacaoFinal
            };
            return Ok(await _mediator.Send(query));
        }
    }
}
