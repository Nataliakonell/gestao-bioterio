using Gestao_Bioterio.Application.Features.Evolucoes.Command.CreateEvolucao;
using Gestao_Bioterio.Application.Features.Evolucoes.Command.DeleteEvolucao;
using Gestao_Bioterio.Application.Features.Evolucoes.Command.UpdateEvolucao;
using Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetAllEvolucoes;
using Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetEvolucaoDetail;
using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EvolucaoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllEvolucao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<EvolucaoListVm>>> GetAll([FromQuery] int? animalId = null)
        {
            var result = await mediator.Send(new GetAllEvolucoesQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetEvolucaoById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<EvolucaoDetailVm>> GetById(int id)
        {
            var query = new GetEvolucaoDetailQuery { Id = id };
            return Ok(await mediator.Send(query));
        }

        [HttpPost(Name = "AddEvolucao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateEvolucaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateEvolucao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Editar)]

        public async Task<ActionResult> Update([FromBody] UpdateEvolucaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteEvolucao")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var command = new DeleteEvolucaoCommand { Id = id };
            await mediator.Send(command);
            return NoContent();
        }
    }
}
