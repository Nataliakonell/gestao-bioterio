using Gestao_Bioterio.Application.Features.DocumentosEventos.Command.CreateDocumentoEvento;
using Gestao_Bioterio.Application.Features.DocumentosEventos.Command.DeleteDocumentoEvento;
using Gestao_Bioterio.Application.Features.DocumentosEventos.Command.UpdateDocumentoEvento;
using Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetAllDocumentoEvento;
using Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetDocumentoEventoDetail;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DocumentoEventoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllDocumentoEvento")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<DocumentoEventoListVm>>> GetAll([FromQuery] int? eventoId = null)
        {
            var result = await mediator.Send(new GetAllDocumentoEventoQuery { EventoId = eventoId });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetDocumentoEventoById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<DocumentoEventoDetailVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetDocumentoEventoDetailQuery { Id = id });
            if (result == null)
                return NotFound();

            return Ok(result);
        }

        [HttpPost(Name = "AddDocumentoEvento")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<CreateDocumentoEventoResponse>> Create([FromBody] CreateDocumentoEventoCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpPut(Name = "UpdateDocumentoEvento")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> Update([FromBody] UpdateDocumentoEventoCommand command)
        {
            var result = await mediator.Send(command);
            return Ok(result);
        }

        [HttpDelete("{id}", Name = "DeleteDocumentoEvento")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeleteDocumentoEventoCommand { Id = id });
            return NoContent();
        }
    }
}
