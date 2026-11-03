using Gestao_Bioterio.Application.Features.Anexos.Command.CreateAnexo;
using Gestao_Bioterio.Application.Features.Anexos.Command.DeleteAnexo;
using Gestao_Bioterio.Application.Features.Anexos.Command.UpdateAnexo;
using Gestao_Bioterio.Application.Features.Anexos.Queries.GetAllAnexos;
using Gestao_Bioterio.Application.Features.Anexos.Queries.GetAnexoDetail;
using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnexoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllAnexo")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<AnexoListVm>>> GetAll([FromQuery] int? animalId = null)
        {
            var result = await mediator.Send(new GetAllAnexosQuery
            {
                AnimalId = animalId
            });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetAnexoById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<AnexoDetailVm>> GetById(int id)
        {
            var query = new GetAnexoDetailQuery { Id = id };
            return Ok(await mediator.Send(query));
        }

        [HttpPost(Name = "AddAnexo")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromForm] CreateAnexoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateAnexo")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateAnexoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteAnexo")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var command = new DeleteAnexoCommand { Id = id };
            await mediator.Send(command);
            return NoContent();
        }
    }
}
