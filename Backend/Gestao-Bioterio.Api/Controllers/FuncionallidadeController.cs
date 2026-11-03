using Gestao_Bioterio.Api.Filters;
using Gestao_Bioterio.Application.Features.Funcionalidade.Command.CreateFuncionalidade;
using Gestao_Bioterio.Application.Features.Funcionalidade.Command.DeleteFuncionalidade;
using Gestao_Bioterio.Application.Features.Funcionalidade.Command.UpdateFuncionalidade;
using Gestao_Bioterio.Application.Features.Funcionalidades.Queries.GetAllFuncionalidade;
using Gestao_Bioterio.Application.Features.Funcionalidades.Queries.GetFuncionalidadeDetail;
using Gestao_Bioterio.Domain.Entities;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Gestao_Bioterio.Api.Controllers

{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class FuncionalidadeController(IMediator mediator) : ControllerBase
    {
        [HttpGet(Name = "GetAllFuncionalidade")]
        [RequirePermission("Gerenciamento de perfis", NivelAcesso.Visualizar)]
        public async Task<ActionResult<List<FuncionalidadeListVm>>> GetAll()
        {
            var response = await mediator.Send(new GetAllFuncionalidadeQuery());
            return Ok(response);
        }

        [HttpGet("{id}", Name = "GetFuncionalidadeById")]
        [RequirePermission("Gerenciamento de perfis", NivelAcesso.Visualizar)]
        public async Task<ActionResult<FuncionalidadeDetailVm>> GetById(int id)
        {
            var response = await mediator.Send(new GetFuncionalidadeDetailQuery { Id = id });
            return Ok(response);
        }

        [HttpPost(Name = "AddFuncionalidade")]
        [RequirePermission("Funcionalidade", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Create([FromBody] CreateFuncionalidadeCommand cmd)
        {
            var response = await mediator.Send(cmd);
            return Ok(response);
        }

        [HttpPut(Name = "UpdateFuncionalidade")]
        [RequirePermission("Funcionalidade", NivelAcesso.Editar)]
        public async Task<ActionResult> Update([FromBody] UpdateFuncionalidadeCommand cmd)
        {
            var response = await mediator.Send(cmd);
            return Ok(response);
        }

        [AllowAnonymous]
        [HttpGet("dump", Name = "DumpFuncionalidades")]
        public async Task<ActionResult> Dump([FromServices] Gestao_Bioterio.Application.Contracts.Persistence.IFuncionalidadeRepository repo)
        {
            var funcs = await repo.ListAllAsync();
            return Ok(funcs.Select(f => f.Nome));
        }

        [HttpDelete("{id}", Name = "DeleteFuncionalidade")]
        [RequirePermission("Funcionalidade", NivelAcesso.Gerenciar)]
        public async Task<ActionResult> Delete(int id)
        {
            await mediator.Send(new DeleteFuncionalidadeCommand { Id = id });
            return NoContent();
        }
    }
}
