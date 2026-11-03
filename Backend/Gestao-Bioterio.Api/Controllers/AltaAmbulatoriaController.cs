using Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.CreateAltaAmbulatorial;
using Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.UpdateAltaAmbulatorial;
using Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAltaAmbulatorial;
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
    public class AltaAmbulatoriaController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllAltasAmbulatoriais")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAllAltasAmbulatoriais.AltaAmbulatoriaListVm>>> GetAll([FromQuery] int? animalId = null)
        {
            var result = await mediator.Send(new Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAllAltasAmbulatoriais.GetAllAltasAmbulatoriaisQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpGet("{id:int}", Name = "GetAltaAmbulatoriaById")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<AltaAmbulatoriaDetailVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetAltaAmbulatoriaQuery { Id = id });
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpGet("animal/{animalId}", Name = "GetAltaAmbulatoriaPorAnimal")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<AltaAmbulatoriaDetailVm?>> GetByAnimalId(int animalId)
        {
            var result = await mediator.Send(new GetAltaAmbulatoriaQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpPost(Name = "AddAltaAmbulatoria")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateAltaAmbulatoriaCommand command)
        {
            var result = await mediator.Send(command);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateAltaAmbulatoria")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateAltaAmbulatoriaCommand command)
        {
            var result = await mediator.Send(command);
            if (!result.Success)
                return BadRequest(result);
            return Ok(result);
        }

        [HttpDelete("{id}", Name = "DeleteAltaAmbulatoria")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.DeleteAltaAmbulatorial.DeleteAltaAmbulatorialCommand { Id = id });
            return NoContent();
        }
    }
}
