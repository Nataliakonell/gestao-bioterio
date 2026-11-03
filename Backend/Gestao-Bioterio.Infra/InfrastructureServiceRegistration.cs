using Gestao_Bioterio.Application.Contracts.Infrastructure;
using Gestao_Bioterio.Infra.Blob;
using Gestao_Bioterio.Infra.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Gestao_Bioterio.Infra
{
    public static class InfrastructureServiceRegistration
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddHttpContextAccessor();
            services.AddScoped<ICurrentUserService, CurrentUserService>();

            var blobConfiguration = new BlobConfiguration();
            configuration.GetSection("BlobStorage").Bind(blobConfiguration);
            services.AddSingleton(blobConfiguration);
            services.AddTransient<IBlobStorageService, BlobStorageService>();

            services.Configure<Gestao_Bioterio.Application.Models.PortalExternalApiInformation>(
                configuration.GetSection("PortalExternalApi"));
            services.Configure<Gestao_Bioterio.Application.Models.LoginTokenInformation>(
                configuration.GetSection("LoginTokenConfiguration"));

            services.AddHttpClient<Gestao_Bioterio.Application.Contracts.Infrastructure.IPortalExternalApiRepository, Gestao_Bioterio.Infra.ExternalApi.PortalExternalApiRepository>();

            return services;
        }
    }
}
