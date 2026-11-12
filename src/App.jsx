import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Destino from "./pages/Destino";
import Detalhe from "./pages/Detalhe";
import Eventos from "./pages/Eventos";
import EventoDetalhe from "./pages/EventoDetalhe";
import Preservacao from "./pages/Preservacao";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import EsqueciSenha from "./pages/EsqueciSenha";
import RedefinirSenha from "./pages/RedefinirSenha";
import Roteiros from "./pages/Roteiros";
import RoteiroDetalhe from "./pages/RoteiroDetalhe";
import CriarRoteiro from "./pages/CriarRoteiro";
import Perfil from "./pages/Perfil";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
function App() {
  return <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/explore" component={Explore} />
            <Route path="/destino/:id" component={Destino} />
            <Route path="/detalhe/:tipo/:id" component={Detalhe} />
            <Route path="/eventos" component={Eventos} />
            <Route path="/eventos/:id" component={EventoDetalhe} />
            <Route path="/preservacao" component={Preservacao} />
            <Route path="/login" component={Login} />
            <Route path="/cadastro" component={Cadastro} />
            <Route path="/esqueci-senha" component={EsqueciSenha} />
            <Route path="/redefinir-senha" component={RedefinirSenha} />
            <Route path="/roteiros" component={Roteiros} />
            <Route path="/roteiros/novo" component={CriarRoteiro} />
            <Route path="/roteiros/:id/editar" component={CriarRoteiro} />
            <Route path="/roteiros/:id" component={RoteiroDetalhe} />
            <Route path="/perfil" component={Perfil} />
            <Route path="/admin" component={Admin} />
            <Route path="/404" component={NotFound} />
            <Route component={NotFound} />
          </Switch>
        </Layout>
      </AuthProvider>
    </ErrorBoundary>;
}
export {
  App as default
};
