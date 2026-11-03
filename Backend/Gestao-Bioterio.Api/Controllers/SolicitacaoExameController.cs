using Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.CreateSolicitacaoExame;
using Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.DeleteSolicitacaoExame;
using Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.SuspendSolicitacaoExame;
using Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.UpdateSolicitacaoExame;
using Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetAllSolicitacoesExame;
using Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetSolicitacaoExameDetail;
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
    public class SolicitacaoExameController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllSolicitacaoExame")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<SolicitacaoExameListVm>>> GetAll([FromQuery] int? animalId = null)
        {
            var result = await mediator.Send(new GetAllSolicitacoesExameQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetSolicitacaoExameById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]

        public async Task<ActionResult<SolicitacaoExameDetailVm>> GetById(int id)
        {
            var query = new GetSolicitacaoExameDetailQuery { Id = id };
            return Ok(await mediator.Send(query));
        }

        [HttpPost(Name = "AddSolicitacaoExame")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Editar)]
        public async Task<ActionResult> Create([FromBody] CreateSolicitacaoExameCommand command)
        {
            var response = await mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateSolicitacaoExame")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateSolicitacaoExameCommand command)
        {
            var response = await mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);
            return Ok(response);
        }

        [HttpPost("suspender", Name = "SuspenderSolicitacaoExame")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Suspender([FromBody] SuspendSolicitacaoExameCommand command)
        {
            var response = await mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteSolicitacaoExame")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]

        public async Task<ActionResult> Delete(int id)
        {
            var command = new DeleteSolicitacaoExameCommand { Id = id };
            await mediator.Send(command);
            return NoContent();
        }
    }
}
