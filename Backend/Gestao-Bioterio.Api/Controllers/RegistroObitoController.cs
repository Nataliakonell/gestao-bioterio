using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.RegistrosObito.Command.CreateRegistroObito;
using Gestao_Bioterio.Application.Features.RegistrosObito.Command.DeleteRegistroObito;
using Gestao_Bioterio.Application.Features.RegistrosObito.Command.UpdateRegistroObito;
using Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetAllRegistrosObito;
using Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetRegistroObitoDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class RegistroObitoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllRegistrosObito")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<RegistroObitoListVm>>> GetAll([FromQuery] int? animalId = null)
        {
            var result = await mediator.Send(new GetAllRegistrosObitoQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpGet("{id:int}", Name = "GetRegistroObitoById")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<RegistroObitoDetailVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetRegistroObitoDetailQuery { Id = id });
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpGet("animal/{animalId:int}", Name = "GetRegistroObitoPorAnimal")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<RegistroObitoDetailVm?>> GetByAnimalId(int animalId)
        {
            var result = await mediator.Send(new GetRegistroObitoDetailQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpPost(Name = "AddRegistroObito")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateRegistroObitoCommand command)
        {
            var result = await mediator.Send(command);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateRegistroObito")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Update([FromBody] UpdateRegistroObitoCommand command)
        {
            var result = await mediator.Send(command);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id:int}", Name = "DeleteRegistroObito")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var result = await mediator.Send(new DeleteRegistroObitoCommand { Id = id });
            if (!result.Success)
                return NotFound(result);
            return NoContent();
        }
    }
}
