using Gestao_Bioterio.Application.Features.Consultas.Command.CreateConsulta;
using Gestao_Bioterio.Application.Features.Consultas.Command.DeleteConsulta;
using Gestao_Bioterio.Application.Features.Consultas.Command.UpdateConsulta;
using Gestao_Bioterio.Application.Features.Consultas.Queries.GetAllConsultas;
using Gestao_Bioterio.Application.Features.Consultas.Queries.GetConsultaDetail;
using Gestao_Bioterio.Application.Features.Consultas.Queries.GetVisaoGeralClinica;
using Gestao_Bioterio.Application.Responses;
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
    public class ConsultaController(IMediator mediator) : ControllerBase
    {
        [HttpGet("visao-geral", Name = "GetVisaoGeralClinica")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<VisaoGeralClinicaResponse>> GetVisaoGeral([FromQuery] GetVisaoGeralClinicaQuery query)
        {
            var response = await mediator.Send(query);
            return Ok(response);
        }

        [HttpGet(Name = "GetAllConsulta")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<ConsultaListVm>>> GetAll([FromQuery] int? animalId)
        {
            var dtos = await mediator.Send(new GetAllConsultasQuery { AnimalId = animalId });
            return Ok(dtos);
        }

        [HttpGet("{id}", Name = "GetConsultaById")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Visualizar)]
        public async Task<ActionResult<ConsultaDetailVm>> GetById(int id)
        {
            var dto = await mediator.Send(new GetConsultaDetailQuery { Id = id });
            if (dto == null) return NotFound();
            return Ok(dto);
        }

        [HttpPost(Name = "AddConsulta")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult<CreateConsultaResponse>> Create([FromBody] CreateConsultaCommand command)
        {
            var response = await mediator.Send(command);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpPut(Name = "UpdateConsulta")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Editar)]
        public async Task<ActionResult<BaseResponse>> Update([FromBody] UpdateConsultaCommand command)
        {
            var response = await mediator.Send(command);
            if (!response.Success)
            {
                return BadRequest(response);
            }
            return Ok(response);
        }

        [HttpDelete("{id}", Name = "DeleteConsulta")]
        [RequirePermission("Atendimento veterinário", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeleteConsultaCommand { Id = id });
            return NoContent();
        }
    }
}
