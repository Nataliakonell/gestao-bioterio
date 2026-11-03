using AutoMapper;
using Gestao_Bioterio.Application.Features.Alimentacoes.Command.CreateAlimentacao;
using Gestao_Bioterio.Application.Features.Alimentacoes.Command.UpdateAlimentacao;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAlimentacaoDetail;
using Gestao_Bioterio.Application.Features.Alimentacoes.Queries.GetAllAlimentacoes;
using Gestao_Bioterio.Application.Features.AltaAmbulatorial.Command.CreateAltaAmbulatorial;
using Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAltaAmbulatorial;
using Gestao_Bioterio.Application.Features.Anexos.Command.CreateAnexo;
using Gestao_Bioterio.Application.Features.Anexos.Command.UpdateAnexo;
using Gestao_Bioterio.Application.Features.Anexos.Queries.GetAllAnexos;
using Gestao_Bioterio.Application.Features.Anexos.Queries.GetAnexoDetail;
using Gestao_Bioterio.Application.Features.Animais.Command.CreateAnimal;
using Gestao_Bioterio.Application.Features.Animais.Queries.GetAllAnimals;
using Gestao_Bioterio.Application.Features.Animais.Queries.GetAnimalDetail;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.CreateBiometriaAnimais;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Command.UpdateBiometriaAnimal;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetAllBiometriaAnimal;
using Gestao_Bioterio.Application.Features.BiometriaAnimais.Queries.GetBiometriaAnimalDetail;
using Gestao_Bioterio.Application.Features.Consultas.Command.CreateConsulta;
using Gestao_Bioterio.Application.Features.Consultas.Command.UpdateConsulta;
using Gestao_Bioterio.Application.Features.Consultas.Queries.GetAllConsultas;
using Gestao_Bioterio.Application.Features.Consultas.Queries.GetConsultaDetail;
using Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Command.CreateDoseAplicacaoDesverminacao;
using Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Queries.GetAllDosesAplicacaoDesverminacao;
using Gestao_Bioterio.Application.Features.DosesAplicacaoDesverminacao.Queries.GetDoseAplicacaoDesverminacaoDetail;
using Gestao_Bioterio.Application.Features.Especies.Queries.GetEspecieDatail;
using Gestao_Bioterio.Application.Features.Evolucoes.Command.CreateEvolucao;
using Gestao_Bioterio.Application.Features.Evolucoes.Command.UpdateEvolucao;
using Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetAllEvolucoes;
using Gestao_Bioterio.Application.Features.Evolucoes.Queries.GetEvolucaoDetail;
using Gestao_Bioterio.Application.Features.Groups.Command.CreateGroup;
using Gestao_Bioterio.Application.Features.Groups.Queries.GetAllGroups;
using Gestao_Bioterio.Application.Features.Groups.Queries.GetGroupDetail;
using Gestao_Bioterio.Application.Features.InstalacoesBioterio.Command.CreateInstalacaoBioterio;
using Gestao_Bioterio.Application.Features.InstalacoesBioterio.Queries.GetAllInstalacaoBioterio;
using Gestao_Bioterio.Application.Features.InstalacoesBioterio.Queries.GetInstalacaoBioterioDetail;
using Gestao_Bioterio.Application.Features.Localizacoes.Command.CreateLocalizacao;
using Gestao_Bioterio.Application.Features.Medicacoes.Command.CreateMedicacao;
using Gestao_Bioterio.Application.Features.Medicacoes.Queries.GetAllMedicacoes;
using Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Command.CreateMedicacaoAdministrada;
using Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Queries.GetAllMedicacoesAdministradas;
using Gestao_Bioterio.Application.Features.MedicacoesAdministradas.Queries.GetMedicacaoAdministradaDetail;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Command.CreatePrescricaoMedicacao;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetAllPrescricoesMedicacao;
using Gestao_Bioterio.Application.Features.PrescricoesMedicacao.Queries.GetPrescricaoMedicacaoDetail;
using Gestao_Bioterio.Application.Features.Procedimentos.Command.CreateProcedimento;
using Gestao_Bioterio.Application.Features.Procedimentos.Command.UpdateProcedimento;
using Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetAllProcedimentos;
using Gestao_Bioterio.Application.Features.Procedimentos.Queries.GetProcedimentoDetail;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Command.CreateProtocoloDesverminacao;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetAllProtocolosDesverminacao;
using Gestao_Bioterio.Application.Features.ProtocolosDesverminacao.Queries.GetProtocoloDesverminacaoDetail;
using Gestao_Bioterio.Application.Features.Refeicoes.Command.CreateRefeicao;
using Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetAllRefeicao;
using Gestao_Bioterio.Application.Features.Refeicoes.Queries.GetRefeicaoDetail;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Command.CreateRotinaAnimal;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Command.UpdateRotinaAnimal;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetAllRotinasAnimais;
using Gestao_Bioterio.Application.Features.RotinasAnimais.Queries.GetRotinaAnimalDetail;
using Gestao_Bioterio.Application.Features.SolicitacoesExame.Command.CreateSolicitacaoExame;
using Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetAllSolicitacoesExame;
using Gestao_Bioterio.Application.Features.SolicitacoesExame.Queries.GetSolicitacaoExameDetail;
using Gestao_Bioterio.Application.Features.Species.Command.CreateSpecie;
using Gestao_Bioterio.Application.Features.Species.Command.UpdateSpecie;
using Gestao_Bioterio.Application.Features.Species.Queries.GetAllSpecies;
using Gestao_Bioterio.Application.Features.Usuarios.Command.CreateUsuario;
using Gestao_Bioterio.Domain.Entities;
using Gestao_Bioterio.Domain.Entities;

namespace Gestao_Bioterio.Application.Profiles
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<Animal, CreateAnimalDto>().ReverseMap();
            CreateMap<Animal, Animal>().ReverseMap();
            CreateMap<CreateAnimalCommand, Animal>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Especie, opt => opt.Ignore())
                .ForMember(dest => dest.InstalacaoBioterio, opt => opt.Ignore())
                .ForMember(dest => dest.LocalOrigem, opt => opt.Ignore());

            CreateMap<Animal, AnimalListVm>()
                .ForMember(dest => dest.EspecieNome, opt => opt.MapFrom(src => src.Especie != null ? src.Especie.Nome : string.Empty))
                .ForMember(dest => dest.Grupo, opt => opt.MapFrom(src => src.Especie != null && src.Especie.Grupo != null ? src.Especie.Grupo.Nome : string.Empty))
                .ForMember(dest => dest.InstalacaoBioterioNome, opt => opt.MapFrom(src => src.AnimalLocalizacao != null && src.AnimalLocalizacao.Localizacao != null ? src.AnimalLocalizacao.Localizacao.Nome : (src.InstalacaoBioterio != null ? src.InstalacaoBioterio.Nome : string.Empty)))
                .ForMember(dest => dest.LocalizacaoId, opt => opt.MapFrom(src => src.AnimalLocalizacao != null ? (int?)src.AnimalLocalizacao.LocalizacaoId : null))
                .ForMember(dest => dest.LocalizacaoNome, opt => opt.MapFrom(src => src.AnimalLocalizacao != null && src.AnimalLocalizacao.Localizacao != null ? src.AnimalLocalizacao.Localizacao.Nome : null))
                .ForMember(dest => dest.LocalOrigemNome, opt => opt.MapFrom(src => src.LocalOrigem != null ? src.LocalOrigem.Nome : string.Empty))
                .ForMember(dest => dest.Situacao, opt => opt.MapFrom(src => src.SituacaoAnimal))
                .ForMember(dest => dest.BiometriaAnimal, opt => opt.MapFrom(src => 
                    src.BiometriaAnimais.Any() ? new BiometriaAnimal 
                    {
                        Id = src.BiometriaAnimais.OrderByDescending(b => b.Id).Select(b => b.Id).FirstOrDefault(),
                        AnimalId = src.Id,
                        Peso = src.BiometriaAnimais.OrderByDescending(b => b.Id).Select(b => b.Peso).FirstOrDefault(),
                        Comprimento = src.BiometriaAnimais.OrderByDescending(b => b.Id).Where(b => b.Comprimento != null).Select(b => b.Comprimento).FirstOrDefault(),
                        ComprimentoCauda = src.BiometriaAnimais.OrderByDescending(b => b.Id).Where(b => b.ComprimentoCauda != null).Select(b => b.ComprimentoCauda).FirstOrDefault(),
                        DataCriacao = src.BiometriaAnimais.OrderByDescending(b => b.Id).Select(b => b.DataCriacao).FirstOrDefault()
                    } : null))
                .ForMember(dest => dest.BiometriaAnimalId, opt => opt.MapFrom(src => src.BiometriaAnimais.OrderByDescending(b => b.Id).Select(b => b.Id).FirstOrDefault()));

            CreateMap<Animal, RotinaAnimalDetailVm>()
                .ForMember(dest => dest.EspecieNome, opt => opt.MapFrom(src => src.Especie != null ? src.Especie.Nome : string.Empty))
                .ForMember(dest => dest.Grupo, opt => opt.MapFrom(src => src.Especie != null && src.Especie.Grupo != null ? src.Especie.Grupo.Nome : string.Empty))
                .ForMember(dest => dest.InstalacaoBioterioNome, opt => opt.MapFrom(src => src.AnimalLocalizacao != null && src.AnimalLocalizacao.Localizacao != null ? src.AnimalLocalizacao.Localizacao.Nome : (src.InstalacaoBioterio != null ? src.InstalacaoBioterio.Nome : string.Empty)))
                .ForMember(dest => dest.LocalizacaoId, opt => opt.MapFrom(src => src.AnimalLocalizacao != null ? (int?)src.AnimalLocalizacao.LocalizacaoId : null))
                .ForMember(dest => dest.LocalizacaoNome, opt => opt.MapFrom(src => src.AnimalLocalizacao != null && src.AnimalLocalizacao.Localizacao != null ? src.AnimalLocalizacao.Localizacao.Nome : null))
                .ForMember(dest => dest.LocalizacaoHierarquia, opt => opt.MapFrom(src => src.AnimalLocalizacao != null && src.AnimalLocalizacao.Localizacao != null ? src.AnimalLocalizacao.Localizacao.CaminhoHierarquia : null))
                .ForMember(dest => dest.LocalOrigem, opt => opt.MapFrom(src => src.LocalOrigem != null ? src.LocalOrigem.Nome : string.Empty))
                .ForMember(dest => dest.BiometriaAnimal, opt => opt.MapFrom(src => 
                    src.BiometriaAnimais.Any() ? new BiometriaAnimal 
                    {
                        Id = src.BiometriaAnimais.OrderByDescending(b => b.Id).Select(b => b.Id).FirstOrDefault(),
                        AnimalId = src.Id,
                        Peso = src.BiometriaAnimais.OrderByDescending(b => b.Id).Select(b => b.Peso).FirstOrDefault(),
                        Comprimento = src.BiometriaAnimais.OrderByDescending(b => b.Id).Where(b => b.Comprimento != null).Select(b => b.Comprimento).FirstOrDefault(),
                        ComprimentoCauda = src.BiometriaAnimais.OrderByDescending(b => b.Id).Where(b => b.ComprimentoCauda != null).Select(b => b.ComprimentoCauda).FirstOrDefault(),
                        DataCriacao = src.BiometriaAnimais.OrderByDescending(b => b.Id).Select(b => b.DataCriacao).FirstOrDefault()
                    } : null))
                .ForMember(dest => dest.BiometriaAnimalId, opt => opt.MapFrom(src => src.BiometriaAnimais.OrderByDescending(b => b.Id).Select(b => (int?)b.Id).FirstOrDefault()));

            // Especie 
            CreateMap<Especie, EspecieListVm>()
                .ForMember(dest => dest.GrupoNome, opt => opt.MapFrom(src => src.Grupo != null ? src.Grupo.Nome : string.Empty));
            CreateMap<Especie, SpecieDetailVm>();
            CreateMap<CreateEspecieCommand, Especie>();
            CreateMap<UpdateEspecieCommand, Especie>();
            CreateMap<Especie, CreateEspecieDto>();
            CreateMap<Especie, Especie>().ReverseMap();

            // Localizacao 
            CreateMap<InstalacaoBioterio, InstalacaoBioterioListVm>();
            CreateMap<InstalacaoBioterio, GetInstalacaoBioterioDetailVm>();
            CreateMap<InstalacaoBioterio, CreateInstalacaoBioterioDto>();
            CreateMap<CreateInstalacaoBioterioCommand, InstalacaoBioterio>();
            CreateMap<InstalacaoBioterio, InstalacaoBioterio>().ReverseMap();

            // Grupo 
            CreateMap<Grupo, GruposListVm>();
            CreateMap<Grupo, GroupDetailVm>();
            CreateMap<Grupo, CreateGrupoDto>();
            CreateMap<CreateGrupoCommand, Grupo>();
            CreateMap<Grupo, Grupo>().ReverseMap();

            // LocalOrigem
            CreateMap<LocalOrigem, Features.LocaisOrigem.Queries.GetAllLocalOrigem.LocalOrigemListVm>().ReverseMap();
            CreateMap<LocalOrigem, Features.LocaisOrigem.Queries.GetLocalOrigemDetail.LocalOrigemDetailVm>().ReverseMap();
            CreateMap<Features.LocaisOrigem.Command.CreateLocalOrigem.CreateLocalOrigemCommand, LocalOrigem>();
            CreateMap<Features.LocaisOrigem.Command.CreateLocalOrigem.CreateLocalOrigemDto, LocalOrigem>().ReverseMap();
            CreateMap<Features.LocaisOrigem.Command.UpdateLocalOrigem.UpdateLocalOrigemCommand, LocalOrigem>();

            // TipoProcedimento
            CreateMap<Gestao_Bioterio.Domain.Entities.TipoProcedimento, Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetAllTiposProcedimento.TipoProcedimentoListVm>();
            CreateMap<Gestao_Bioterio.Domain.Entities.TipoProcedimento, Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetTipoProcedimentoLookup.TipoProcedimentoLookupVm>();
            CreateMap<Gestao_Bioterio.Domain.Entities.TipoProcedimento, Gestao_Bioterio.Application.Features.TiposProcedimento.Queries.GetTipoProcedimentoDetail.TipoProcedimentoDetailVm>();
            CreateMap<Gestao_Bioterio.Application.Features.TiposProcedimento.Command.CreateTipoProcedimento.CreateTipoProcedimentoCommand, Gestao_Bioterio.Domain.Entities.TipoProcedimento>();
            CreateMap<Gestao_Bioterio.Domain.Entities.TipoProcedimento, Gestao_Bioterio.Application.Features.TiposProcedimento.Command.CreateTipoProcedimento.CreateTipoProcedimentoDto>();
            CreateMap<Gestao_Bioterio.Application.Features.TiposProcedimento.Command.UpdateTipoProcedimento.UpdateTipoProcedimentoCommand, Gestao_Bioterio.Domain.Entities.TipoProcedimento>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            // Refeicao
            CreateMap<Refeicao, RefeicaoListVm>().ReverseMap();
            CreateMap<Refeicao, GetRefeicaoDetailVm>().ReverseMap();
            CreateMap<CreateRefeicaoCommand, Refeicao>();
            CreateMap<CreateRefeicaoCommandDto, Refeicao>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.AlimentacaoId, opt => opt.Ignore())
                .ForMember(dest => dest.RF, opt => opt.Ignore())
                .ForMember(dest => dest.DataCriacao, opt => opt.Ignore());
            CreateMap<Refeicao, CreateRefeicaoDto>()
                .ForMember(dest => dest.SituacaoRefeicao, opt => opt.MapFrom(src => src.SituacaoRefeicao.ToString()));

            //Alimentacao
            CreateMap<Alimentacao, AlimentacaoListVm>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()))
                .ForMember(dest => dest.NumeroRegistro, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NumeroRegistro : string.Empty))
                .ForMember(dest => dest.EspecieNome, opt => opt.MapFrom(src => src.Animal != null && src.Animal.Especie != null ? src.Animal.Especie.Nome : string.Empty))
                .ForMember(dest => dest.FaseDeVida, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.FaseDeVida.ToString() : string.Empty));

            CreateMap<Alimentacao, GetAlimentacaoDetailVm>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            CreateMap<CreateAlimentacaoCommand, Alimentacao>()
                .ForMember(dest => dest.Refeicoes, opt => opt.MapFrom(src => src.Refeicoes));
            CreateMap<UpdateAlimentacaoCommand, Alimentacao>();

            // BiometriaAnimal
            CreateMap<BiometriaAnimal, BiometriaAnimalListVm>()
                .ForMember(dest => dest.NumeroRegistro, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NumeroRegistro : string.Empty))
                .ForMember(dest => dest.EspecieNome, opt => opt.MapFrom(src => src.Animal != null && src.Animal.Especie != null ? src.Animal.Especie.Nome : string.Empty))
                .ForMember(dest => dest.FaseDeVida, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.FaseDeVida.ToString() : string.Empty));
            CreateMap<CreateBiometriaAnimalCommand, BiometriaAnimal>();
            CreateMap<BiometriaAnimal, CreateBiometriaAnimalDto>();
            CreateMap<UpdateBiometriaAnimalCommand, BiometriaAnimal>();
            CreateMap<BiometriaAnimal, GetBiometriaAnimalDetailVm>();

            // RotinaAnimal
            CreateMap<RotinaAnimal, RotinaAnimalListVm>()
                .ForMember(dest => dest.EspecieNome,
                    opt => opt.MapFrom(src => src.Especie != null ? src.Especie.Nome : string.Empty))
                .ForMember(dest => dest.TipoRotina,
                    opt => opt.MapFrom(src => src.TipoRotina.ToString()))
                .ForMember(dest => dest.FaseDeVida,
                    opt => opt.MapFrom(src => src.FaseDeVida.ToString()))
                .ForMember(dest => dest.TipoFrequencia,
                    opt => opt.MapFrom(src => src.TipoFrequencia.ToString()));
            CreateMap<RotinaAnimal, CreateRotinaAnimalDto>()
                .ForMember(dest => dest.FaseDeVida,
                    opt => opt.MapFrom(src => src.FaseDeVida.ToString()))
                .ForMember(dest => dest.TipoFrequencia,
                    opt => opt.MapFrom(src => src.TipoFrequencia.ToString()));
            CreateMap<RotinaAnimal, UpdateRotinaAnimalDto>()
                .ForMember(dest => dest.FaseDeVida, opt => opt.MapFrom(src => src.FaseDeVida.ToString()))
                .ForMember(dest => dest.TipoFrequencia, opt => opt.MapFrom(src => src.TipoFrequencia.ToString()));
            CreateMap<RotinaAnimal, GetRotinaAnimalDetailVm>()
                .ForMember(
                    dest => dest.EspecieNome,
                    opt => opt.MapFrom(src => src.Especie != null ? src.Especie.Nome : string.Empty))
                .ForMember(dest => dest.FaseDeVida,
                    opt => opt.MapFrom(src => src.FaseDeVida.ToString()))
                .ForMember(dest => dest.TipoFrequencia,
                    opt => opt.MapFrom(src => src.TipoFrequencia.ToString()));

            // Consulta
            CreateMap<Consulta, ConsultaListVm>()
                .ForMember(dest => dest.NumeroRegistro, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NumeroRegistro : string.Empty))
                .ForMember(dest => dest.EspecieNome, opt => opt.MapFrom(src => src.Animal != null && src.Animal.Especie != null ? src.Animal.Especie.Nome : string.Empty))
                .ForMember(dest => dest.InstalacaoBioterioNome, opt => opt.MapFrom(src => src.InstalacaoBioterio != null ? src.InstalacaoBioterio.Nome : string.Empty));
            CreateMap<Consulta, ConsultaDetailVm>()
                .ForMember(dest => dest.NumeroRegistro, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NumeroRegistro : string.Empty))
                .ForMember(dest => dest.EspecieNome, opt => opt.MapFrom(src => src.Animal != null && src.Animal.Especie != null ? src.Animal.Especie.Nome : string.Empty))
                .ForMember(dest => dest.InstalacaoBioterioNome, opt => opt.MapFrom(src => src.InstalacaoBioterio != null ? src.InstalacaoBioterio.Nome : string.Empty));
            CreateMap<Consulta, CreateConsultaDto>();
            CreateMap<CreateConsultaCommand, Consulta>();
            CreateMap<UpdateConsultaCommand, Consulta>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
            CreateMap<Consulta, Consulta>().ReverseMap();

            // Evolucao
            CreateMap<Evolucao, EvolucaoListVm>();
            CreateMap<Evolucao, EvolucaoDetailVm>();
            CreateMap<Evolucao, CreateEvolucaoDto>();
            CreateMap<UpdateEvolucaoCommand, Evolucao>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
            CreateMap<Evolucao, Evolucao>().ReverseMap();

            // Procedimento
            CreateMap<Procedimento, ProcedimentoListVm>()
                .ForMember(dest => dest.TipoProcedimentoNome, opt => opt.MapFrom(src => src.TipoProcedimento != null ? src.TipoProcedimento.Nome : string.Empty));
            CreateMap<Procedimento, ProcedimentoDetailVm>()
                .ForMember(dest => dest.TipoProcedimentoNome, opt => opt.MapFrom(src => src.TipoProcedimento != null ? src.TipoProcedimento.Nome : string.Empty));
            CreateMap<Procedimento, CreateProcedimentoDto>();
            CreateMap<UpdateProcedimentoCommand, Procedimento>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
            CreateMap<Procedimento, Procedimento>().ReverseMap();

            // Anexo
            CreateMap<Anexo, AnexoListVm>();
            CreateMap<Anexo, AnexoDetailVm>();
            CreateMap<Anexo, CreateAnexoDto>();
            CreateMap<UpdateAnexoCommand, Anexo>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
            CreateMap<Anexo, Anexo>().ReverseMap();

            // Medicacao
            CreateMap<Medicacao, MedicacaoListVm>();
            CreateMap<Medicacao, CreateMedicacaoDto>();
            CreateMap<Medicacao, Medicacao>().ReverseMap();

            // PrescricaoMedicacao
            CreateMap<PrescricaoMedicacao, PrescricaoMedicacaoListVm>()
                .ForMember(dest => dest.MedicacaoNome, opt => opt.MapFrom(src => src.Medicacao != null ? $"{src.Medicacao.PrincipioAtivo} - {src.Medicacao.NomeComercial}" : string.Empty))
                .ForMember(dest => dest.ViaAdministracao, opt => opt.MapFrom(src => src.ViaAdministracao.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.StatusPrescricao.ToString()))
                .ForMember(dest => dest.TotalAdministracoes, opt => opt.MapFrom(src => src.Administracoes.Count))
                .ForMember(dest => dest.AdministracoesConcluidas, opt => opt.MapFrom(src => src.Administracoes.Count(a => a.StatusDose == StatusDose.Concluido)));
            CreateMap<PrescricaoMedicacao, PrescricaoMedicacaoDetailVm>()
                .ForMember(dest => dest.MedicacaoNome, opt => opt.MapFrom(src => src.Medicacao != null ? $"{src.Medicacao.PrincipioAtivo} - {src.Medicacao.NomeComercial}" : string.Empty))
                .ForMember(dest => dest.ViaAdministracao, opt => opt.MapFrom(src => src.ViaAdministracao.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.StatusPrescricao.ToString()));
            CreateMap<PrescricaoMedicacao, CreatePrescricaoMedicacaoDto>()
                .ForMember(dest => dest.MedicacaoNome, opt => opt.MapFrom(src => src.Medicacao != null ? $"{src.Medicacao.PrincipioAtivo} - {src.Medicacao.NomeComercial}" : string.Empty))
                .ForMember(dest => dest.ViaAdministracao, opt => opt.MapFrom(src => src.ViaAdministracao.ToString()));
            CreateMap<PrescricaoMedicacao, PrescricaoMedicacao>().ReverseMap();
            CreateMap<MedicacaoAdministrada, AdministracaoVm>()
                .ForMember(dest => dest.StatusDose, opt => opt.MapFrom(src => src.StatusDose.ToString()));

            // MedicacaoAdministrada
            CreateMap<MedicacaoAdministrada, MedicacaoAdministradaListVm>()
                .ForMember(dest => dest.AnimalId, opt => opt.MapFrom(src => src.PrescricaoMedicacao != null ? src.PrescricaoMedicacao.AnimalId : 0))
                .ForMember(dest => dest.MedicacaoNome, opt => opt.MapFrom(src => src.PrescricaoMedicacao != null && src.PrescricaoMedicacao.Medicacao != null ? $"{src.PrescricaoMedicacao.Medicacao.PrincipioAtivo} - {src.PrescricaoMedicacao.Medicacao.NomeComercial}" : string.Empty))
                .ForMember(dest => dest.StatusDose, opt => opt.MapFrom(src => src.StatusDose.ToString()));
            CreateMap<MedicacaoAdministrada, MedicacaoAdministradaDetailVm>()
                .ForMember(dest => dest.StatusDose, opt => opt.MapFrom(src => src.StatusDose.ToString()));
            CreateMap<MedicacaoAdministrada, CreateMedicacaoAdministradaDto>()
                .ForMember(dest => dest.StatusDose, opt => opt.MapFrom(src => src.StatusDose.ToString()));
            CreateMap<MedicacaoAdministrada, MedicacaoAdministrada>().ReverseMap();

            // SolicitacaoExame
            CreateMap<SolicitacaoExame, SolicitacaoExameListVm>()
                .ForMember(dest => dest.TipoExame, opt => opt.MapFrom(src => src.TipoExame.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
            CreateMap<SolicitacaoExame, SolicitacaoExameDetailVm>()
                .ForMember(dest => dest.TipoExame, opt => opt.MapFrom(src => src.TipoExame.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
            CreateMap<SolicitacaoExame, CreateSolicitacaoExameDto>()
                .ForMember(dest => dest.TipoExame, opt => opt.MapFrom(src => src.TipoExame.ToString()))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));
            CreateMap<SolicitacaoExame, SolicitacaoExame>().ReverseMap();

            // ProtocoloDesverminacao
            CreateMap<ProtocoloDesverminacao, ProtocoloDesverminacaoListVm>()
                .ForMember(dest => dest.NumeroRegistro, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NumeroRegistro : string.Empty))
                .ForMember(dest => dest.EspecieNome, opt => opt.MapFrom(src => src.Animal != null && src.Animal.Especie != null ? src.Animal.Especie.Nome : string.Empty))
                .ForMember(dest => dest.StatusProtocolo, opt => opt.MapFrom(src => src.StatusProtocolo.ToString()));
            CreateMap<ProtocoloDesverminacao, ProtocoloDesverminacaoDetailVm>()
                .ForMember(dest => dest.NumeroRegistro, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NumeroRegistro : string.Empty))
                .ForMember(dest => dest.EspecieNome, opt => opt.MapFrom(src => src.Animal != null && src.Animal.Especie != null ? src.Animal.Especie.Nome : string.Empty))
                .ForMember(dest => dest.StatusProtocolo, opt => opt.MapFrom(src => src.StatusProtocolo.ToString()));
            CreateMap<ProtocoloDesverminacao, CreateProtocoloDesverminacaoDto>()
                .ForMember(dest => dest.StatusProtocolo, opt => opt.MapFrom(src => src.StatusProtocolo.ToString()));
            CreateMap<ProtocoloDesverminacao, ProtocoloDesverminacao>().ReverseMap();
            CreateMap<DoseAplicacaoDesverminacao, DoseDesverminacaoVm>()
                .ForMember(dest => dest.TipoDose, opt => opt.MapFrom(src => src.TipoDose.ToString()))
                .ForMember(dest => dest.StatusDoseDesverminacao, opt => opt.MapFrom(src => src.StatusDoseDesverminacao.ToString()));

            // DoseAplicacaoDesverminacao
            CreateMap<DoseAplicacaoDesverminacao, DoseAplicacaoDesverminacaoListVm>()
                .ForMember(dest => dest.AnimalId, opt => opt.MapFrom(src => src.ProtocoloDesverminacao != null ? (int?)src.ProtocoloDesverminacao.AnimalId : null))
                .ForMember(dest => dest.TipoDose, opt => opt.MapFrom(src => src.TipoDose.ToString()))
                .ForMember(dest => dest.StatusDoseDesverminacao, opt => opt.MapFrom(src => src.StatusDoseDesverminacao.ToString()));
            CreateMap<DoseAplicacaoDesverminacao, DoseAplicacaoDesverminacaoDetailVm>()
                .ForMember(dest => dest.AnimalId, opt => opt.MapFrom(src => src.ProtocoloDesverminacao != null ? (int?)src.ProtocoloDesverminacao.AnimalId : null))
                .ForMember(dest => dest.TipoDose, opt => opt.MapFrom(src => src.TipoDose.ToString()))
                .ForMember(dest => dest.StatusDoseDesverminacao, opt => opt.MapFrom(src => src.StatusDoseDesverminacao.ToString()));
            CreateMap<DoseAplicacaoDesverminacao, CreateDoseAplicacaoDesverminacaoDto>()
                .ForMember(dest => dest.TipoDose, opt => opt.MapFrom(src => src.TipoDose.ToString()))
                .ForMember(dest => dest.StatusDoseDesverminacao, opt => opt.MapFrom(src => src.StatusDoseDesverminacao.ToString()));
            CreateMap<DoseAplicacaoDesverminacao, DoseAplicacaoDesverminacao>().ReverseMap();

            // AltaAmbulatorial
            CreateMap<AltaAmbulatorial, Gestao_Bioterio.Application.Features.AltaAmbulatorial.Queries.GetAllAltasAmbulatoriais.AltaAmbulatoriaListVm>()
                .ForMember(dest => dest.NumeroRegistro, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NumeroRegistro : null))
                .ForMember(dest => dest.InstalacaoBioterioRetornoNome, opt => opt.MapFrom(src => src.InstalacaoBioterioRetorno != null ? src.InstalacaoBioterioRetorno.Nome : null));
            CreateMap<AltaAmbulatorial, AltaAmbulatoriaDetailVm>();
            CreateMap<AltaAmbulatorial, CreateAltaAmbulatoriaDto>();
            CreateMap<CreateAltaAmbulatoriaCommand, AltaAmbulatorial>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Animal, opt => opt.Ignore())
                .ForMember(dest => dest.InstalacaoBioterioRetorno, opt => opt.Ignore());

            // ModeloDocumento
            CreateMap<Gestao_Bioterio.Domain.Entities.ModeloDocumento, Gestao_Bioterio.Application.Features.ModelosDocumento.Queries.GetModeloDocumentoByType.ModeloDocumentoVm>()
                .MaxDepth(3)
                .ReverseMap();
            CreateMap<Gestao_Bioterio.Application.Features.ModelosDocumento.Command.CreateModeloDocumento.CreateModeloDocumentoCommand, Gestao_Bioterio.Domain.Entities.ModeloDocumento>();
            CreateMap<Gestao_Bioterio.Domain.Entities.ModeloDocumento, Gestao_Bioterio.Application.Features.ModelosDocumento.Command.CreateModeloDocumento.CreateModeloDocumentoDto>();
            CreateMap<Gestao_Bioterio.Application.Features.ModelosDocumento.Command.UpdateModeloDocumento.UpdateModeloDocumentoCommand, Gestao_Bioterio.Domain.Entities.ModeloDocumento>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            // LiberacaoQuarentena
            CreateMap<LiberacaoQuarentena, Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetAllLiberacoesQuarentena.LiberacaoQuarentenaListVm>()
                .ForMember(dest => dest.NumeroRegistro, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NumeroRegistro : null))
                .ForMember(dest => dest.InstalacaoBioterioNome, opt => opt.MapFrom(src => src.InstalacaoBioterio != null ? src.InstalacaoBioterio.Nome : null));
            CreateMap<LiberacaoQuarentena, Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Queries.GetLiberacaoQuarentena.LiberacaoQuarentenaDetailVm>();
            CreateMap<LiberacaoQuarentena, Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.CreateLiberacaoQuarentena.CreateLiberacaoQuarentenaDto>();
            CreateMap<Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.CreateLiberacaoQuarentena.CreateLiberacaoQuarentenaCommand, LiberacaoQuarentena>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Animal, opt => opt.Ignore())
                .ForMember(dest => dest.InstalacaoBioterio, opt => opt.Ignore());
            CreateMap<Gestao_Bioterio.Application.Features.LiberacoesQuarentena.Command.UpdateLiberacaoQuarentena.UpdateLiberacaoQuarentenaCommand, LiberacaoQuarentena>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Animal, opt => opt.Ignore())
                .ForMember(dest => dest.InstalacaoBioterio, opt => opt.Ignore());

            // Usuario
            CreateMap<Usuario, Gestao_Bioterio.Application.Features.Usuarios.Queries.GetAllUsuarios.UsuarioListVm>();
            CreateMap<Usuario, Gestao_Bioterio.Application.Features.Usuarios.Queries.GetUsuariosDetail.UsuarioDetailVm>();
            CreateMap<Usuario, CreateUsuarioDto>();
            CreateMap<CreateUsuarioCommand, Usuario>();
            CreateMap<Gestao_Bioterio.Application.Features.Usuarios.Command.UpdateUsuario.UpdateUsuarioCommand, Usuario>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
            CreateMap<Usuario, Usuario>().ReverseMap();

            // Perfil
            CreateMap<Perfil, Gestao_Bioterio.Application.Features.Perfis.Queries.GetAllPerfil.PerfilListVm>();
            CreateMap<Perfil, Gestao_Bioterio.Application.Features.Perfis.Queries.GetPerfilDetail.PerfilDetailVm>();
            CreateMap<Perfil, Gestao_Bioterio.Application.Features.Perfis.Command.CreatePerfil.CreatePerfilDto>();
            CreateMap<Gestao_Bioterio.Application.Features.Perfis.Command.CreatePerfil.CreatePerfilCommand, Perfil>();
            CreateMap<Gestao_Bioterio.Application.Features.Perfis.Command.UpdatePerfil.UpdatePerfilCommand, Perfil>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
            CreateMap<Perfil, Perfil>().ReverseMap();

            // Funcionalidade
            CreateMap<Funcionalidade, Gestao_Bioterio.Application.Features.Funcionalidades.Queries.GetAllFuncionalidade.FuncionalidadeListVm>();
            CreateMap<Funcionalidade, Gestao_Bioterio.Application.Features.Funcionalidades.Queries.GetFuncionalidadeDetail.FuncionalidadeDetailVm>();
            CreateMap<Gestao_Bioterio.Application.Features.Funcionalidade.Command.CreateFuncionalidade.CreateFuncionalidadeCommand, Funcionalidade>();
            CreateMap<Funcionalidade, Gestao_Bioterio.Application.Features.Funcionalidade.Command.CreateFuncionalidade.CreateFuncionalidadeDto>();
            CreateMap<Gestao_Bioterio.Application.Features.Funcionalidade.Command.UpdateFuncionalidade.UpdateFuncionalidadeCommand, Funcionalidade>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
            CreateMap<Funcionalidade, Funcionalidade>().ReverseMap();

            // Localizacao
            CreateMap<CreateLocalizacaoCommand, Localizacao>();
            CreateMap<Localizacao, Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetAllLocalizacao.LocalizacaoListVm>()
                .ForMember(dest => dest.LocalizacaoPaiNome, opt => opt.MapFrom(src => src.LocalizacaoPai != null ? src.LocalizacaoPai.Nome : null))
                .ForMember(dest => dest.QuantidadeAnimais, opt => opt.MapFrom(src => src.AnimaisLocalizados != null ? src.AnimaisLocalizados.Count : 0));
            CreateMap<Localizacao, Gestao_Bioterio.Application.Features.Localizacoes.Queries.GetLocalizacaoDetail.LocalizacaoDetailVm>()
                .ForMember(dest => dest.LocalizacaoPaiNome, opt => opt.MapFrom(src => src.LocalizacaoPai != null ? src.LocalizacaoPai.Nome : null))
                .ForMember(dest => dest.QuantidadeAnimais, opt => opt.MapFrom(src => src.AnimaisLocalizados != null ? src.AnimaisLocalizados.Count : 0));
            CreateMap<Localizacao, CreateLocalizacaoDto>();
            CreateMap<Localizacao, Localizacao>().ReverseMap();

            // AnimalLocalizacao
            CreateMap<Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.CreateAnimalLocalizacao.CreateAnimalLocalizacaoCommand, AnimalLocalizacao>();
            CreateMap<AnimalLocalizacao, Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.CreateAnimalLocalizacao.CreateAnimalLocalizacaoDto>();
            CreateMap<AnimalLocalizacao, Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAllAnimalLocalizacao.AnimalLocalizacaoListVm>();
            CreateMap<AnimalLocalizacao, Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Queries.GetAnimalLocalizacaoDetail.AnimalLocalizacaoDetailVm>();
            CreateMap<AnimalLocalizacao, AnimalLocalizacao>().ReverseMap();
            CreateMap<Gestao_Bioterio.Application.Features.AnimalLocalizacoes.Command.UpdateAnimalLocalizacao.UpdateAnimalLocalizacaoCommand, AnimalLocalizacao>();

            // MovimentacoesAnimais
            CreateMap<Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.CreateMovimentacaoAnimal.CreateMovimentacaoAnimalCommand, MovimentacaoAnimal>();
            CreateMap<MovimentacaoAnimal, Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.CreateMovimentacaoAnimal.CreateMovimentacaoAnimalDto>();
            CreateMap<MovimentacaoAnimal, MovimentacaoAnimal>().ReverseMap();
            CreateMap<Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Command.UpdateMovimentacaoAnimal.UpdateMovimentacaoAnimalCommand, MovimentacaoAnimal>();
            CreateMap<MovimentacaoAnimal, Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetAllMovimentacaoAnimal.MovimentacaoAnimalListVm>();
            CreateMap<MovimentacaoAnimal, Gestao_Bioterio.Application.Features.MovimentacoesAnimais.Queries.GetMovimentacaoAnimalDetail.MovimentacaoAnimalDetailVm>();

            // Eventos
            CreateMap<Gestao_Bioterio.Application.Features.Eventos.Command.CreateEvento.CreateEventoCommand, Evento>();
            CreateMap<Evento, Gestao_Bioterio.Application.Features.Eventos.Command.CreateEvento.CreateEventoDto>();
            CreateMap<Evento, Evento>().ReverseMap();
            CreateMap<Gestao_Bioterio.Application.Features.Eventos.Command.UpdateEvento.UpdateEventoCommand, Evento>();
            CreateMap<Evento, Gestao_Bioterio.Application.Features.Eventos.Queries.GetAllEvento.EventoListVm>();
            CreateMap<Evento, Gestao_Bioterio.Application.Features.Eventos.Queries.GetEventoDetail.EventoDetailVm>();

            // EventosAnimais
            CreateMap<Gestao_Bioterio.Application.Features.EventosAnimais.Command.CreateEventoAnimal.CreateEventoAnimalCommand, EventoAnimal>();
            CreateMap<EventoAnimal, Gestao_Bioterio.Application.Features.EventosAnimais.Command.CreateEventoAnimal.CreateEventoAnimalDto>();
            CreateMap<EventoAnimal, EventoAnimal>().ReverseMap();
            CreateMap<Gestao_Bioterio.Application.Features.EventosAnimais.Command.UpdateEventoAnimal.UpdateEventoAnimalCommand, EventoAnimal>();
            CreateMap<EventoAnimal, Gestao_Bioterio.Application.Features.EventosAnimais.Queries.GetAllEventoAnimal.EventoAnimalListVm>();
            CreateMap<EventoAnimal, Gestao_Bioterio.Application.Features.EventosAnimais.Queries.GetEventoAnimalDetail.EventoAnimalDetailVm>();

            // DocumentosEventos
            CreateMap<Gestao_Bioterio.Application.Features.DocumentosEventos.Command.CreateDocumentoEvento.CreateDocumentoEventoCommand, DocumentoEvento>();
            CreateMap<DocumentoEvento, Gestao_Bioterio.Application.Features.DocumentosEventos.Command.CreateDocumentoEvento.CreateDocumentoEventoDto>();
            CreateMap<DocumentoEvento, DocumentoEvento>().ReverseMap();
            CreateMap<Gestao_Bioterio.Application.Features.DocumentosEventos.Command.UpdateDocumentoEvento.UpdateDocumentoEventoCommand, DocumentoEvento>();
            CreateMap<DocumentoEvento, Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetAllDocumentoEvento.DocumentoEventoListVm>();
            CreateMap<DocumentoEvento, Gestao_Bioterio.Application.Features.DocumentosEventos.Queries.GetDocumentoEventoDetail.DocumentoEventoDetailVm>();

            // RegistrosObito
            CreateMap<Gestao_Bioterio.Domain.Entities.RegistroObito, Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetAllRegistrosObito.RegistroObitoListVm>()
                .ForMember(dest => dest.NumeroRegistroAnimal, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NumeroRegistro : string.Empty))
                .ForMember(dest => dest.NomePopularAnimal, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NomePopular : string.Empty));
            CreateMap<Gestao_Bioterio.Domain.Entities.RegistroObito, Gestao_Bioterio.Application.Features.RegistrosObito.Queries.GetRegistroObitoDetail.RegistroObitoDetailVm>()
                .ForMember(dest => dest.NumeroRegistroAnimal, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NumeroRegistro : string.Empty))
                .ForMember(dest => dest.NomePopularAnimal, opt => opt.MapFrom(src => src.Animal != null ? src.Animal.NomePopular : string.Empty));
            CreateMap<Gestao_Bioterio.Domain.Entities.RegistroObito, Gestao_Bioterio.Application.Features.RegistrosObito.Command.CreateRegistroObito.CreateRegistroObitoDto>();
            CreateMap<Gestao_Bioterio.Application.Features.RegistrosObito.Command.CreateRegistroObito.CreateRegistroObitoCommand, Gestao_Bioterio.Domain.Entities.RegistroObito>();
            CreateMap<Gestao_Bioterio.Application.Features.RegistrosObito.Command.UpdateRegistroObito.UpdateRegistroObitoCommand, Gestao_Bioterio.Domain.Entities.RegistroObito>()
                .ForMember(dest => dest.Id, opt => opt.Ignore());
            CreateMap<Gestao_Bioterio.Domain.Entities.RegistroObito, Gestao_Bioterio.Domain.Entities.RegistroObito>().ReverseMap();
        }
    }
}
