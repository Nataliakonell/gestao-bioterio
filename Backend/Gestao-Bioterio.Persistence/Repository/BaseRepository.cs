using Gestao_Bioterio.Application.Contracts.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Gestao_Bioterio.Persistence.Repository
{
    public class BaseRepository<T> : IAsyncRepository<T> where T : class
    {
        protected readonly BioterioDbContext _context;
        protected readonly DbSet<T> _dbSet;

        public BaseRepository(BioterioDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public  async Task<T> GetByIdAsync(int id)
        {
            return await _dbSet.FindAsync(id);
        }

        public  async Task<IReadOnlyList<T>> ListAllAsync()
        {
            return await _dbSet.ToListAsync();
        }

        public  async Task<T> AddAsync(T entity)
        {
            _dbSet.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public  async Task<T> UpdateAsync(T entity)
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public  async Task<T> DeleteAsync(T entity)
        {
            _context.Entry(entity).State = EntityState.Deleted;
            await _context.SaveChangesAsync();
            return entity;
        }
    }
}