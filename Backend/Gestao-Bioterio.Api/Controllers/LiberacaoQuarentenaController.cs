using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.CreateLiberacaoQuarentena;
using Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.DeleteLiberacaoQuarentena;
using Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.UpdateLiberacaoQuarentena;
using Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetAllLiberacoesQuarentena;
using Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetLiberacaoQuarentena;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class LiberacaoQuarentenaController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllLiberacoesQuarentena")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<LiberacaoQuarentenaListVm>>> GetAll([FromQuery] int? animalId = null)
        {
            var result = await mediator.Send(new GetAllLiberacoesQuarentenaQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetLiberacaoQuarentenaById")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<LiberacaoQuarentenaDetailVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetLiberacaoQuarentenaQuery { Id = id });
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpGet("animal/{animalId}", Name = "GetLiberacaoQuarentenaPorAnimal")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<LiberacaoQuarentenaDetailVm?>> GetByAnimalId(int animalId)
        {
            var result = await mediator.Send(new GetLiberacaoQuarentenaQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpPost(Name = "AddLiberacaoQuarentena")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateLiberacaoQuarentenaCommand command)
        {
            var result = await mediator.Send(command);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateLiberacaoQuarentena")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateLiberacaoQuarentenaCommand command)
        {
            var result = await mediator.Send(command);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id}", Name = "DeleteLiberacaoQuarentena")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeleteLiberacaoQuarentenaCommand { Id = id });
            return NoContent();
        }
    }
}
