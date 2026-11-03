using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.ModelosDocumento.Command.CreateModeloDocumento;
using Gestao_Bioterio.Application.Features.ModelosDocumento.Command.DeleteModeloDocumento;
using Gestao_Bioterio.Application.Features.ModelosDocumento.Command.UpdateModeloDocumento;
using Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetAllModelosDocumento;
using Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetModeloDocumentoById;
using Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetModeloDocumentoByType;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ModelosDocumentoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllModelosDocumento")]
        [RequirePermission("Modelo de documento", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<ModeloDocumentoVm>>> GetAll([FromQuery] TipoSecaoTemplate? tipoSecao)
        {
            var result = await mediator.Send(new GetAllModelosDocumentoQuery { TipoSecao = tipoSecao });
            return Ok(result);
        }

        [HttpGet("{id:int}", Name = "GetModeloDocumentoById")]
        [RequirePermission("Modelo de documento", NivelAcesso.Visualizar)]
        public async Task<ActionResult<ModeloDocumentoVm>> GetById(int id)
        {
            var result = await mediator.Send(new GetModeloDocumentoByIdQuery { Id = id });
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        [HttpGet("tipo/{tipoDocumento}", Name = "GetModeloDocumentoByType")]
        public async Task<ActionResult<ModeloDocumentoVm>> GetByType(TipoDocumento tipoDocumento)
        {
            var result = await mediator.Send(new GetModeloDocumentoByTypeQuery { TipoDocumento = tipoDocumento });
            return Ok(result);
        }

        [HttpPost(Name = "CreateModeloDocumento")]
        [RequirePermission("Modelo de documento", NivelAcesso.Gerenciar)]
        public async Task<ActionResult<CreateModeloDocumentoResponse>> Create([FromBody] CreateModeloDocumentoCommand command)
        {
            var response = await mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateModeloDocumento")]
        [RequirePermission("Modelo de documento", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateModeloDocumentoCommand command)
        {
            var response = await mediator.Send(command);
            if (!response.Success)
                return BadRequest(response);
            return Ok(response);
        }

        [HttpDelete("{id:int}", Name = "DeleteModeloDocumento")]
        [RequirePermission("Modelo de documento", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var response = await mediator.Send(new DeleteModeloDocumentoCommand { Id = id });
            if (!response.Success)
                return NotFound(response);
            return NoContent();
        }
    }
}
