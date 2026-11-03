using Gestao_Bioterio.Application.Features.Procedimentos.Command.CreateProcedimento;
using Gestao_Bioterio.Application.Features.Procedimentos.Command.DeleteProcedimento;
using Gestao_Bioterio.Application.Features.Procedimentos.Command.UpdateProcedimento;
using Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetAllProcedimentos;
using Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetProcedimentoDetail;
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
    public class ProcedimentoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllProcedimento")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<ProcedimentoListVm>>> GetAll([FromQuery] int? animalId = null)
        {
            var result = await mediator.Send(new GetAllProcedimentosQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetProcedimentoById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<ProcedimentoDetailVm>> GetById(int id)
        {
            var query = new GetProcedimentoDetailQuery { Id = id };
            return Ok(await mediator.Send(query));
        }

        [HttpPost(Name = "AddProcedimento")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateProcedimentoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateProcedimento")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateProcedimentoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteProcedimento")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var command = new DeleteProcedimentoCommand { Id = id };
            await mediator.Send(command);
            return NoContent();
        }
    }
}
