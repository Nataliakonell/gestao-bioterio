using Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.CreateMedicacaoAdministrada;
using Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.DeleteMedicacaoAdministrada;
using Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.UpdateMedicacaoAdministrada;
using Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Queries.GetAllMedicacoesAdministradas;
using Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Queries.GetMedicacaoAdministradaDetail;
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
    public class MedicacaoAdministradaController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllMedicacaoAdministrada")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Registrar dose de medicação", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<MedicacaoAdministradaListVm>>> GetAll(
            [FromQuery] int? animalId = null,
            [FromQuery] int? prescricaoMedicacaoId = null,
            [FromQuery] DateTime? data = null)
        {
            var result = await mediator.Send(new GetAllMedicacoesAdministradasQuery 
            { 
                AnimalId = animalId,
                PrescricaoMedicacaoId = prescricaoMedicacaoId,
                Data = data
            });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetMedicacaoAdministradaById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Registrar dose de medicação", NivelAcesso.Visualizar)]

        public async Task<ActionResult<MedicacaoAdministradaDetailVm>> GetById(int id)
        {
            var query = new GetMedicacaoAdministradaDetailQuery { Id = id };
            return Ok(await mediator.Send(query));
        }

        [HttpPost(Name = "AddMedicacaoAdministrada")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Registrar dose de medicação", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateMedicacaoAdministradaCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateMedicacaoAdministrada")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Registrar dose de medicação", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateMedicacaoAdministradaCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteMedicacaoAdministrada")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Registrar dose de medicação", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var command = new DeleteMedicacaoAdministradaCommand { Id = id };
            await mediator.Send(command);
            return NoContent();
        }
    }
}
