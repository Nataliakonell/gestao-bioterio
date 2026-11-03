using FluentValidation;
using Microsoft.Extensions.DependencyInjection;

namespace Gestao_Bioterio.Application
{
    public static class ApplicationServiceRegistration
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            var assembly = typeof(ApplicationServiceRegistration).Assembly;

            services.AddAutoMapper(assembly);

            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

            services.AddValidatorsFromAssembly(assembly);

            return services;
        }
    }
}
