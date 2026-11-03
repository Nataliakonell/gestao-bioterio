using Gestao_Bioterio.Application.Features.Eventos.Command.CreateEvento;
using Gestao_Bioterio.Application.Features.Eventos.Command.DeleteEvento;
using Gestao_Bioterio.Application.Features.Eventos.Command.UpdateEvento;
using Gestao_Bioterio.Application.Features.Eventos.Queries.GetAllEvento;
using Gestao_Bioterio.Application.Features.Eventos.Queries.GetEventoDetail;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class EventoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllEvento")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<EventoListVm>>> GetAll()
        {
            var result = await mediator.Send(new GetAllEventoQuery());
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetEventoById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<EventoDetailVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetEventoDetailQuery { Id = id });
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost(Name = "AddEvento")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<CreateEventoResponse>> Create([FromBody] CreateEventoCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateEvento")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> Update([FromBody] UpdateEventoCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("{id}", Name = "DeleteEvento")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeleteEventoCommand { Id = id });
            return NoContent();
        }
    }
}
