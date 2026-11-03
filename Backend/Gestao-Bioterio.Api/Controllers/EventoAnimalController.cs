using Gestao_Bioterio.Application.Features.EventosAnimais.Command.CreateEventoAnimal;
using Gestao_Bioterio.Application.Features.EventosAnimais.Command.DeleteEventoAnimal;
using Gestao_Bioterio.Application.Features.EventosAnimais.Command.UpdateEventoAnimal;
using Gestao_Bioterio.Application.Features.EventosAnimais.Queries.GetAllEventoAnimal;
using Gestao_Bioterio.Application.Features.EventosAnimais.Queries.GetEventoAnimalDetail;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EventoAnimalController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllEventoAnimal")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<EventoAnimalListVm>>> GetAll([FromQuery] int? eventoId = null)
        {
            var result = await mediator.Send(new GetAllEventoAnimalQuery { EventoId = eventoId });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetEventoAnimalById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EventoAnimalDetailVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetEventoAnimalDetailQuery { Id = id });
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost(Name = "AddEventoAnimal")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<CreateEventoAnimalResponse>> Create([FromBody] CreateEventoAnimalCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateEventoAnimal")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> Update([FromBody] UpdateEventoAnimalCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("{id}", Name = "DeleteEventoAnimal")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeleteEventoAnimalCommand { Id = id });
            return NoContent();
        }
    }
}
