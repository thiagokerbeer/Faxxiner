import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Layout } from "@/components/Layout";
import { RoleRoute } from "@/components/RoleRoute";
import { Home } from "@/pages/Home";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Profissionais } from "@/pages/Profissionais";
import { ProfissionalDetalhe } from "@/pages/ProfissionalDetalhe";
import { Agendamentos } from "@/pages/Agendamentos";
import { PerfilDiarista } from "@/pages/PerfilDiarista";
import { PainelRedirect } from "@/pages/painel/PainelRedirect";
import { ClientePainel } from "@/pages/painel/ClientePainel";
import { ProfissionalPainel } from "@/pages/painel/ProfissionalPainel";
import { AdminPainel } from "@/pages/painel/AdminPainel";
import { Privacy } from "@/pages/Privacy";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profissionais" element={<Profissionais />} />
            <Route path="profissionais/:id" element={<ProfissionalDetalhe />} />
            <Route path="entrar" element={<Login />} />
            <Route path="cadastro" element={<Register />} />
            <Route path="privacidade" element={<Privacy />} />
            <Route path="agendamentos" element={<Agendamentos />} />
            <Route path="perfil" element={<PerfilDiarista />} />
            <Route path="painel" element={<PainelRedirect />} />
            <Route
              path="painel/cliente"
              element={
                <RoleRoute allow={["CLIENT"]}>
                  <ClientePainel />
                </RoleRoute>
              }
            />
            <Route
              path="painel/profissional"
              element={
                <RoleRoute allow={["DIARISTA"]}>
                  <ProfissionalPainel />
                </RoleRoute>
              }
            />
            <Route
              path="painel/admin"
              element={
                <RoleRoute allow={["ADMIN"]}>
                  <AdminPainel />
                </RoleRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
