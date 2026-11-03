using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.CreatePrescricaoMedicacao;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.DeletePrescricaoMedicacao;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.SuspendPrescricaoMedicacao;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.UpdatePrescricaoMedicacao;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetAllPrescricoesMedicacao;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetPrescricaoMedicacaoDetail;
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
    public class PrescricaoMedicacaoController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllPrescricaoMedicacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<PrescricaoMedicacaoListVm>>> GetAll([FromQuery] int? animalId)
        {
            var result = await mediator.Send(new GetAllPrescricoesMedicacaoQuery { AnimalId = animalId });
            return Ok(result);
        }

        [HttpGet("{id}", Name = "GetPrescricaoMedicacaoById")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<PrescricaoMedicacaoDetailVm>> GetById(int id)
        {
            var query = new GetPrescricaoMedicacaoDetailQuery { Id = id };
            return Ok(await mediator.Send(query));
        }

        [HttpPost(Name = "AddPrescricaoMedicacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreatePrescricaoMedicacaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpPut(Name = "UpdatePrescricaoMedicacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdatePrescricaoMedicacaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpPost("suspend", Name = "SuspendPrescricaoMedicacao")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Suspend([FromBody] SuspendPrescricaoMedicacaoCommand command)
        {
            var response = await mediator.Send(command);
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeletePrescricaoMedicacao")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesDefaultResponseType]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            var command = new DeletePrescricaoMedicacaoCommand { Id = id };
            await mediator.Send(command);
            return NoContent();
        }
    }
}
