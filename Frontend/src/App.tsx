import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './routes/MainLayout'
import VisaoGeral from './routes/Plantel/VisaoGeral'
import CadastroAnimal from './routes/Plantel/CadastroAnimal'
import LocaisOrigemList from './routes/Plantel/LocaisOrigem'
import EspeciesList from './routes/Plantel/especies'
import CadastroEspecie from './routes/Plantel/CadastroEspecie'
import FichaAnimal from './routes/ficha-animal/FichaAnimalVisaoGeral'
import VisaoGeralAlimentacao from './routes/Alimentacao/VisaoGeralAlimentacao'
import VisaoGeralRotinaAlimentar from './routes/Alimentacao/VisaoGeralRotinaAlimentar'
import RegistroAlimentacao from "./routes/Alimentacao/RegistroAlimentacao"
import AlimentacaoPorLote from "./routes/Alimentacao/AlimentacaoPorLote"
import CadastroBiometria from './routes/Biometria/CadastroBiometria'
import VisaoGeralBiometria from './routes/Biometria/VisaoGeralBiometria'
import VisaoGeralRotinaBiometrica from './routes/Biometria/VisaoGeralRotinaBiometrica'
import { Toaster } from 'sonner'
import ProtectedPage from './components/ProtectedPage/ProtectedPage'
import RequirePermission from './components/ProtectedPage/RequirePermission'
import AuthCallbackPage from './routes/Auth/AuthCallbackPage'
import RegistroRotina from './routes/Rotina/RegistroRotina'
import VisaoGeralRotina from './routes/Rotina/VisaoGeralRotina'
import VisaoGeralAtendimentosClinicos from './routes/Clinico/VisaoGeralAtendimentosClinicos'
import MapaExecucao from './routes/Medicacao/MapaExecucao'
import NovaPrescricao from './routes/Medicacao/NovaPrescricao'
import MedicacoesCadastradasList from './routes/Medicacao/MedicacoesCadastradas'
import ListaModelosDocumento from './routes/Admin/ModelosDocumento/ListaModelosDocumento'
import EdicaoModeloDocumento from './routes/Admin/ModelosDocumento/EdicaoModeloDocumento'
import VisaoGeralDesverminacao from './routes/Desverminacao/VisaoGeralDesverminacao'
import RegistrarDoseDesverminacao from './routes/Desverminacao/RegistrarDoseDesverminacao'
import VisaoGeralUsuarios from './routes/PerfisEUsuarios/Usuario/VisaoGeral'
import CadastroUsuario from './routes/PerfisEUsuarios/Usuario/CadastroUsuario'
import CadastroPerfil from './routes/PerfisEUsuarios/Perfil/CadastroPerfil'
import VisaoGeralPerfis from './routes/PerfisEUsuarios/Perfil/VisaoGeralPerfis'
import VisaoGeralFuncionalidades from './routes/PerfisEUsuarios/Funcionalidades/VisaoGeralFuncionalidades'
import RequireRole from './components/ProtectedPage/RequireRole'
import VisaoGeralInstalacoes from './routes/Instalacoes/VisaoGeralInstalacoes'
import Aparencia from './routes/Configuracoes/Aparencia'
import VisaoGeralEventos from './routes/Eventos/VisaoGeralEventos'
import VisaoGeralRelatorios from './routes/Relatorios/VisaoGeralRelatorios'

import { useTheme } from './contexts/ThemeContext'

function App() {
  const { appearance } = useTheme()
  return (
    <>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={
          <ProtectedPage>
            <Routes>
              <Route path="/" element={<MainLayout />} />
              <Route path="/plantel/visao-geral" element={<VisaoGeral />} />
              <Route path="/plantel/cadastro/:id?" element={
                <RequirePermission funcionalidade="Animal" nivelMinimo="Editar">
                  <CadastroAnimal />
                </RequirePermission>
              } />
              <Route path="/plantel/animal/:id" element={<FichaAnimal />} />
              <Route path="/plantel/locais-origem" element={
                <RequirePermission funcionalidade="Locais de origem cadastrados" nivelMinimo="Visualizar">
                  <LocaisOrigemList />
                </RequirePermission>} />
              <Route path="/plantel/especies" element={
                <RequirePermission funcionalidade="Espécies cadastradas" nivelMinimo="Visualizar">
                  <EspeciesList />
                </RequirePermission>} />
              <Route path="/plantel/especies/cadastro" element={
                <RequirePermission funcionalidade="Espécies cadastradas" nivelMinimo="Gerenciar">
                  <CadastroEspecie />
                </RequirePermission>} />
              <Route path="/plantel/especies/:id" element={
                <RequirePermission funcionalidade="Espécies cadastradas" nivelMinimo="Editar">
                  <CadastroEspecie />
                </RequirePermission>} />
              <Route path="/alimentacao/" element={<VisaoGeralAlimentacao />} />
              <Route path="/alimentacao/lote" element={<AlimentacaoPorLote />} />
              <Route path="/alimentacao/rotina-alimentar" element={<VisaoGeralRotinaAlimentar />} />
              <Route path="/alimentacao/registrar-alimentacao/:id?" element={<RegistroAlimentacao />} />
              <Route path="/biometria/" element={<VisaoGeralBiometria />} />
              <Route path="/biometria/rotina-biometrica" element={<VisaoGeralRotinaBiometrica />} />
              <Route path="/biometria/cadastro/:id?" element={<CadastroBiometria />} />
              <Route path="/rotina/visao-geral" element={<VisaoGeralRotina />} />
              <Route path="/rotina/cadastro" element={<RegistroRotina />} />
              <Route path="/rotina/editar/:id" element={<RegistroRotina />} />
              <Route path="/clinico/atendimentos" element={<VisaoGeralAtendimentosClinicos />} />`n              <Route path="/clinico/mapa-execucao" element={<MapaExecucao />} />
              <Route path="/clinico/nova-prescricao" element={<NovaPrescricao />} />
              <Route
                path="/clinico/medicacoes"
                element={
                  <RequirePermission funcionalidade="Medicações cadastradas" nivelMinimo="Visualizar">
                    <MedicacoesCadastradasList />
                  </RequirePermission>
                } />
              <Route path="/admin/modelos" element={
                <RequirePermission funcionalidade="Modelo de documento" nivelMinimo="Visualizar">
                  <ListaModelosDocumento />
                </RequirePermission>} />
              <Route path="/admin/modelos/novo" element={
                <RequirePermission funcionalidade="Modelo de documento" nivelMinimo="Visualizar">
                  <EdicaoModeloDocumento />
                </RequirePermission>} />
              <Route path="/admin/modelos/:id" element={
                <RequirePermission funcionalidade="Modelo de documento" nivelMinimo="Visualizar">
                  <EdicaoModeloDocumento />
                </RequirePermission>} />
              <Route path="/instalacoes" element={<VisaoGeralInstalacoes />} />
              <Route path="/eventos" element={<VisaoGeralEventos />} />
              <Route path="/relatorios" element={<VisaoGeralRelatorios />} />

              <Route path="/configuracoes/aparencia" element={<Aparencia />} />
              <Route path="/desverminacao/visao-geral" element={<VisaoGeralDesverminacao />} />
              <Route path="/desverminacao/registrar-dose" element={<RegistrarDoseDesverminacao />} />
              <Route path="/desverminacao/editar/:id" element={
                <RequirePermission funcionalidade="Desverminação" nivelMinimo="Visualizar">
                  <RegistrarDoseDesverminacao />
                </RequirePermission>}
              />
              <Route path="/perfis-e-usuarios/perfil" element={
                <RequirePermission funcionalidade="Gerenciamento de perfis" nivelMinimo="Visualizar">
                  <VisaoGeralPerfis />
                </RequirePermission>
              } />
              <Route path="/perfis-e-usuarios/usuario" element={
                <RequirePermission funcionalidade="Usuários" nivelMinimo="Visualizar">
                  <VisaoGeralUsuarios />
                </RequirePermission>
              } />
              <Route path="/perfis-e-usuarios/usuario/novo" element={
                <RequirePermission funcionalidade="Usuários" nivelMinimo="Visualizar">
                  <CadastroUsuario />
                </RequirePermission>
              } />
              <Route path="/perfis-e-usuarios/usuario/:id" element={
                <RequirePermission funcionalidade="Usuários" nivelMinimo="Visualizar">
                  <CadastroUsuario />
                </RequirePermission>
              } />

              <Route path="/perfis-e-usuarios/perfil/novo" element={
                <RequirePermission funcionalidade="Gerenciamento de perfis" nivelMinimo="Visualizar">
                  <CadastroPerfil />
                </RequirePermission>
              } />
              <Route path="/perfis-e-usuarios/perfil/editar/:id" element={
                <RequirePermission funcionalidade="Gerenciamento de perfis" nivelMinimo="Visualizar">
                  <CadastroPerfil />
                </RequirePermission>
              } />
              <Route path="/perfis-e-usuarios/funcionalidades" element={
                <RequireRole role="gestao-bioterio-admin">
                  <VisaoGeralFuncionalidades />
                </RequireRole>
              } />
              <Route path="*" element={<Navigate replace to="/alimentacao" />} />
            </Routes>
          </ProtectedPage>
        } />
      </Routes>
      <Toaster theme={appearance.mode} position="top-right" duration={2000} toastOptions={{ className: 'font-light text-sm' }} />
    </>
  )
}
export default App
